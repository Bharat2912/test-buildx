import {Knex} from 'knex';
import {v4 as uuidv4} from 'uuid';
import {getTransaction} from '../../../data/knex';
import {Service} from '../../../enum';
import Globals from '../../../utilities/global_var/globals';
import logger from '../../../utilities/logger/winston_logger';
import {
  sendSQSMessage,
  SQSIncommingMessageRefund,
} from '../../../utilities/sqs_manager';
import {
  getSQSFromServiceName,
  roundUp,
  sendEmail,
} from '../../../utilities/utilFuncs';
import {CashFreeOrderStatus, CashfreeRefundStatus} from './cashfree/enum';
import {getCashfreeOrder, getCashfreePayment} from './cashfree/payment';
import {initiateCashfreeRefund} from './cashfree/refund';
import {getFormattedRefundStatus} from './cashfree/service';
import {
  ICashFreeCreateRefundFailedResponse,
  ICashFreeCreateRefundResponse,
  ICashFreeRefundDetails,
} from './cashfree/types';
import {RefundGateway, RefundStatus} from './enum';
import {
  bulkInsertRefundMaster,
  readRefundMasterForUpdate,
  readRefundMasterWithFilter,
  updateRefundMaster,
} from './models';
import {IRefundMaster, PaymentStatusResponse} from './types';

export async function confirmPaymentAtCashfree(
  order_payment_id: string
): Promise<PaymentStatusResponse> {
  const cf_order_details = await getCashfreeOrder(order_payment_id);
  if (cf_order_details.order_status === CashFreeOrderStatus.ACTIVE) {
    return {
      status: 'pending',
      transaction_id: cf_order_details.cf_order_id + '',
      payment_currency: cf_order_details.order_currency,
      transaction_details: cf_order_details,
    };
  } else if (cf_order_details.order_status === CashFreeOrderStatus.EXPIRED) {
    return {
      status: 'failed',
      transaction_id: cf_order_details.cf_order_id + '',
      payment_currency: cf_order_details.order_currency,
      transaction_details: cf_order_details,
    };
  } else if (cf_order_details.order_status === CashFreeOrderStatus.PAID) {
    const cf_payment_details = await getCashfreePayment(order_payment_id);
    return {
      status: 'success',
      transaction_amount: cf_order_details.order_amount,
      transaction_id: cf_order_details.cf_order_id + '',
      transaction_time: cf_payment_details.payment_completion_time,
      payment_currency: cf_order_details.order_currency,
      external_payment_id: cf_payment_details.cf_payment_id + '',
      payment_message: cf_payment_details.payment_message,
      payment_method: cf_payment_details.payment_method + '',
      transaction_details: cf_payment_details,
    };
  } else {
    throw 'invalid cashfree order status';
  }
}

/**
 * It takes a message from the SQS queue, and if the action is CREATE, it creates a new refund in the
 * database, and if the refund gateway is Cashfree, it also initiates a refund with Cashfree
 * @param {SQSIncommingMessageRefund} msg - SQSIncommingMessageRefund
 */
export async function processInitiateRefund(msg: SQSIncommingMessageRefund) {
  logger.debug('incoming refund sqs message', msg);
  try {
    if (msg.action === 'CREATE') {
      //If we receive dublicate refund message then log it and dont process it
      const existing_order_refund = await readRefundMasterWithFilter({
        order_id: [msg.data.order_id],
        service_name: [msg.data.service],
      });
      if (existing_order_refund.records[0]) {
        logger.error('DUBLICATE REFUND REQUEST RECEIVED', msg);
        return;
      }

      const new_refund = (
        await bulkInsertRefundMaster([
          {
            id: uuidv4(),
            service: msg.data.service,
            payment_id: msg.data.payment_id,
            order_id: msg.data.order_id,
            customer_id: msg.data.customer_id,
            refund_status: RefundStatus.PENDING,
            refund_gateway: msg.data.refund_gateway,
            refund_charges: msg.data.refund_charges,
            refund_amount: roundUp(msg.data.refund_amount, 2),
            refund_currency: msg.data.refund_currency,
            refund_note: msg.data.refund_note,
            is_pod: msg.data.is_pod,
            created_at: new Date(),
            updated_at: new Date(),
          },
        ])
      )[0];
      logger.debug('refund master updated with new refund', {
        id: new_refund.id,
      });
      if (!msg.data.is_pod) {
        const trx = await getTransaction();
        try {
          const refund_master_details = await readRefundMasterForUpdate(
            trx,
            new_refund.id!
          );
          logger.debug('refund master details', refund_master_details);
          if (msg.data.refund_gateway === RefundGateway.CASHFREE) {
            const cashfree_initiate_refund_details:
              | ICashFreeCreateRefundResponse
              | ICashFreeCreateRefundFailedResponse = await initiateCashfreeRefund(
              {
                payment_id: refund_master_details.payment_id!,
                refund_amount: refund_master_details.refund_amount!,
                refund_id: refund_master_details.id!,
                refund_note: refund_master_details.refund_note,
              }
            );

            if (!cashfree_initiate_refund_details.status) {
              const updated_refund_details = await updateRefundMaster(
                trx,
                refund_master_details.id!,
                {
                  refund_status: RefundStatus.FAILED,
                  additional_details: cashfree_initiate_refund_details,
                }
              );
              logger.error('CASHFREE REFUND FAILED', {
                cashfree_refund_details: cashfree_initiate_refund_details,
                refund_master_details: updated_refund_details,
              });

              await sendEmail(
                'AdminAlertEmailTemplate',
                await Globals.BACKEND_TEAM_EMAIL.get(),
                {
                  subject: 'Initiate Refund Failed at CashFree',
                  application_name: 'core-worker',
                  error_details: {
                    cashfree_refund_details: cashfree_initiate_refund_details,
                    refund_master_details: updated_refund_details,
                  },
                  priority: 'high',
                  time: new Date().toDateString(),
                  meta_details: msg,
                }
              );
            } else {
              logger.debug(
                'cashfree initiate refund details',
                cashfree_initiate_refund_details
              );
              const updated_refund_details =
                await updateCashFreeDetailsInRefundMaster(
                  trx,
                  cashfree_initiate_refund_details as ICashFreeCreateRefundResponse,
                  refund_master_details
                );

              const send_sqs_message_response = await sendSQSMessage(
                getSQSFromServiceName(refund_master_details.service as Service),
                {
                  event: 'ORDER',
                  action: 'UPDATE_REFUND_DETAILS',
                  data: {
                    refund_id: refund_master_details.id!,
                    order_id: refund_master_details.order_id!,
                    payment_id: refund_master_details.payment_id!,
                    customer_id: refund_master_details.customer_id!,
                    is_pod: refund_master_details.is_pod,
                    refund_gateway: refund_master_details.refund_gateway!,
                    refund_amount: refund_master_details.refund_amount!,
                    refund_charges: refund_master_details.refund_charges!,
                    created_at: refund_master_details.created_at!,
                    refund_status: updated_refund_details.refund_status!,
                    status_description:
                      updated_refund_details.status_description!,
                  },
                }
              );
              logger.debug(
                'send_sqs_message_response',
                send_sqs_message_response
              );
            }
          }
          await trx.commit();
        } catch (error) {
          await trx.rollback();
          throw error;
        }
      }
    } else {
      throw `invalid action ${msg.action} for refund service`;
    }
  } catch (error) {
    logger.error('error in refund sqs', error);
    throw error;
  }
}

export async function updateCashFreeDetailsInRefundMaster(
  trx: Knex.Transaction,
  cashfree_refund_details: ICashFreeRefundDetails,
  refund_details: IRefundMaster
) {
  const refund_status = getFormattedRefundStatus(
    cashfree_refund_details.refund_status as CashfreeRefundStatus
  );
  const update_rows: IRefundMaster = {
    refund_status: refund_status,
    status_description: cashfree_refund_details.status_description,
    additional_details: cashfree_refund_details,
  };
  if (cashfree_refund_details.processed_at) {
    update_rows.processed_at = new Date(cashfree_refund_details.processed_at);
  }
  const updated_refund_details = await updateRefundMaster(
    trx,
    refund_details.id!,
    update_rows
  );
  if (refund_status === RefundStatus.ONHOLD) {
    await sendEmail(
      'AdminAlertEmailTemplate',
      await Globals.BACKEND_TEAM_EMAIL.get(),
      {
        subject: 'Cashfree Refund account insufficient balance',
        application_name: Service.CORE_API,
        error_details: 'could not process refund',
        priority: 'high',
        time: new Date().toDateString(),
        meta_details: cashfree_refund_details,
      }
    );
  }
  logger.debug('updated refund details', updated_refund_details);
  return updated_refund_details;
}
