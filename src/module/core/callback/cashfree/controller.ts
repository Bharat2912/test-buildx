import {Request, Response} from 'express';
import logger from '../../../../utilities/logger/winston_logger';
import {
  subscriptionAuthStatus,
  subscriptionNewPayment,
  subscriptionPaymentDeclined,
  subscriptionStatusChange,
} from '../../subscription/cashfree/callback_services';
import {
  payment_status_details,
  refund_status_details,
} from '../../payment/cashfree/validations';
import {
  cf_event,
  cf_subReferenceId,
  subscription_auth_status_details,
  subscription_new_payment_details,
  subscription_payment_declined_details,
  subscription_status_change_details,
} from '../../subscription/cashfree/validations';
import {
  getSQSFromServiceName,
  sendEmail,
} from '../../../../utilities/utilFuncs';
import {getTransaction} from '../../../../data/knex';
import {
  ISQSPayout,
  sendSQSMessage,
  SQS_URL,
} from '../../../../utilities/sqs_manager';
import {
  ICashFreeRefundDetails,
  IFormattedPaymentCallbackResponse,
  IPaymentCallbackResponse,
  IRefundStatusDetails,
} from '../../payment/cashfree/types';
import {ICfCbPo_Request, ICfCbPo_TRANSFER} from '../../payout/cashfree/types';
import {
  formatPayoutStatus,
  getCashfreePayout,
} from '../../payout/cashfree/models';
import {PayoutStatus} from '../../payout/enum';
import {CashFreePayoutStatus} from '../../payout/cashfree/enum';
import {Service, ServiceTag} from '../../../../enum';
import {readRefundMasterForUpdate} from '../../payment/models';
import {getCashfreeRefund} from '../../payment/cashfree/refund';
import {updateCashFreeDetailsInRefundMaster} from '../../payment/service';
import {CashFreeSubscriptionEvents} from '../../subscription/cashfree/enums';
import {getSubscriptionDetailsFromCashFree} from '../../subscription/cashfree/services';
import Globals from '../../../../utilities/global_var/globals';

export async function processSubscriptionEvents(req: Request, res: Response) {
  try {
    logger.debug(
      'REQUEST BODY RECIVED FROM CASHFREE FOR SUBSCRIPTION EVENT: ',
      req.body
    );
    logger.debug(
      'REQUEST HEADERS RECIVED FROM CASHFREE FOR SUBSCRIPTION EVENT: ',
      req.headers
    );

    const external_subscription_id_validation = cf_subReferenceId.validate(
      req.body.cf_subReferenceId
    );
    if (external_subscription_id_validation.error) {
      throw external_subscription_id_validation.error.details[0].message;
    }
    const external_subscription_event_validation = cf_event.validate(
      req.body.cf_event
    );
    if (external_subscription_event_validation.error) {
      throw external_subscription_event_validation.error.details[0].message;
    }

    const subscription = await getSubscriptionDetailsFromCashFree(
      req.body.cf_subReferenceId.toString()
    );
    if (!subscription) {
      logger.error('could not find subscription at cashfree');
      throw 'could not find subscription at cashfree';
    }

    if (
      req.body.cf_event ===
      CashFreeSubscriptionEvents.SUBSCRIPTION_STATUS_CHANGE
    ) {
      const validation = subscription_status_change_details.validate(req.body);
      if (validation.error) {
        throw validation.error.details[0].message;
      }
      await subscriptionStatusChange(validation.value, subscription);
    } else if (
      req.body.cf_event === CashFreeSubscriptionEvents.SUBSCRIPTION_NEW_PAYMENT
    ) {
      const validation = subscription_new_payment_details.validate(req.body);
      if (validation.error) {
        throw validation.error.details[0].message;
      }
      await subscriptionNewPayment(validation.value, subscription);
    } else if (
      req.body.cf_event ===
      CashFreeSubscriptionEvents.SUBSCRIPTION_PAYMENT_DECLINED
    ) {
      const validation = subscription_payment_declined_details.validate(
        req.body
      );
      if (validation.error) {
        throw validation.error.details[0].message;
      }
      await subscriptionPaymentDeclined(validation.value, subscription);
    } else if (
      req.body.cf_event === CashFreeSubscriptionEvents.SUBSCRIPTION_AUTH_STATUS
    ) {
      const validation = subscription_auth_status_details.validate(req.body);
      if (validation.error) {
        throw validation.error.details[0].message;
      }
      await subscriptionAuthStatus(validation.value, subscription);
    }
    return res.sendStatus(200);
  } catch (error) {
    await sendEmail(
      'AdminAlertEmailTemplate',
      await Globals.BACKEND_TEAM_EMAIL.get(),
      {
        subject: 'Alert Error in cashFree subscrption callback',
        application_name: 'core-api',
        error_details: error,
        priority: 'high',
        time: new Date().toDateString(),
        meta_details: req.body,
      }
    );
    logger.error(
      'FAILED WHILE PROCESSING CASHFREE SUBSCRIPTION CALLBACK EVENTS',
      error
    );
    return res.sendStatus(200);
  }
}

export async function processPayoutEvents(req: Request, res: Response) {
  logger.debug(
    'REQUEST BODY RECIVED FROM CASHFREE FOR PAYOUT EVENT: ',
    req.body
  );
  try {
    const request = req.body as ICfCbPo_Request;
    if (request.event === 'LOW_BALANCE_ALERT') {
      // const data = request as ICashfreePayoutCBRequest_LOW_BALANCE_ALERT;
    } else if (request.event === 'CREDIT_CONFIRMATION') {
      // const data = request as ICashfreePayoutCBRequest_CREDIT_CONFIRMATION;
    } else if (request.event === 'BENEFICIARY_INCIDENT') {
      // const data = request as ICashfreePayoutCBRequest_BENEFICIARY_INCIDENT;
    } else {
      const data = request as ICfCbPo_TRANSFER;
      const service_prefix_and_transfer_id = data.transferId.split('_');
      const service_prefix = service_prefix_and_transfer_id[0];
      service_prefix_and_transfer_id.shift();
      const transfer_id = service_prefix_and_transfer_id.join('_');
      const cashfree_payout_details = await getCashfreePayout(
        service_prefix + '_' + transfer_id
      );
      let payout_status: PayoutStatus;
      if (cashfree_payout_details.status === CashFreePayoutStatus.SUCCESS) {
        payout_status = formatPayoutStatus(
          cashfree_payout_details.data.transfer.status
        );
      } else {
        payout_status = PayoutStatus.FAILED;
      }

      const sqs_msg_data: ISQSPayout['data'] = {
        transfer_id: transfer_id,
        payout_status: payout_status,
        additional_details: cashfree_payout_details,
      };
      if (payout_status === PayoutStatus.COMPLETE) {
        sqs_msg_data.payout_completed_time = new Date();
      }
      if (service_prefix === ServiceTag.FOOD_SERVICE_TAG) {
        await sendSQSMessage(SQS_URL.CORE_WORKER, {
          event: 'PAYOUT',
          action: 'UPDATE',
          data: sqs_msg_data,
        });
      } else if (service_prefix === ServiceTag.GROCERY_SERVICE_TAG) {
        await sendSQSMessage(SQS_URL.GROCERY_WORKER, {
          event: 'PAYOUT',
          action: 'UPDATE',
          data: sqs_msg_data,
        });
      } else if (service_prefix === ServiceTag.PHARMACY_SERVICE_TAG) {
        await sendSQSMessage(SQS_URL.PHARMACY_WORKER, {
          event: 'PAYOUT',
          action: 'UPDATE',
          data: sqs_msg_data,
        });
      } else if (service_prefix === ServiceTag.RIDER_SERVICE_TAG) {
        await sendSQSMessage(SQS_URL.RIDER_WORKER, {
          event: 'PAYOUT',
          action: 'UPDATE',
          data: sqs_msg_data,
        });
      }
    }
  } catch (error) {
    logger.error('Payout Callback FATAL error', error);
    await sendEmail(
      'AdminAlertEmailTemplate',
      await Globals.BACKEND_TEAM_EMAIL.get(),
      {
        subject: 'Alert Error in cashFree payout callback',
        application_name: 'core-api',
        error_details: error,
        priority: 'high',
        time: new Date().toDateString(),
        meta_details: req.body,
      }
    );
  }
  return res.sendStatus(200);
}

export async function processRefundEvents(req: Request, res: Response) {
  logger.debug(
    'REQUEST HEADERS RECEIVED FROM CASHFREE FOR REFUND EVENT: ',
    req.headers
  );
  logger.debug(
    'REQUEST BODY RECEIVED FROM CASHFREE FOR REFUND EVENT: ',
    req.body
  );
  try {
    const validation = refund_status_details.validate(req.body);
    if (validation.error) {
      throw validation.error.details[0].message;
    }
    const validated_req = validation.value as IRefundStatusDetails;

    const trx = await getTransaction();
    try {
      const refund_master_details = await readRefundMasterForUpdate(
        trx,
        validated_req.data.refund.refund_id
      );

      if (!refund_master_details) {
        if (process.env.NODE_ENV === 'PROD') {
          throw 'can not find refund details in refund master table from details received in callback';
        }
        logger.error(
          'can not find refund details in refund master table from details received in callback'
        );
        trx.rollback();
        return;
      }

      const cashfree_refund_details: ICashFreeRefundDetails =
        await getCashfreeRefund(
          refund_master_details.payment_id!,
          refund_master_details.id!
        );

      if (!cashfree_refund_details) {
        throw 'can not find refund details at cashfree side from details received in callback';
      }

      const updated_refund_details = await updateCashFreeDetailsInRefundMaster(
        trx,
        cashfree_refund_details,
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
            created_at: refund_master_details.created_at!,
            processed_at: updated_refund_details.processed_at!,
            refund_status: updated_refund_details.refund_status!,
            is_pod: updated_refund_details.is_pod,
            status_description: updated_refund_details.status_description!,
            refund_gateway: refund_master_details.refund_gateway!,
            refund_charges: refund_master_details.refund_charges!,
            refund_amount: refund_master_details.refund_amount!,
          },
        }
      );
      logger.debug('send_sqs_message_response', send_sqs_message_response);
      trx.commit();
    } catch (error) {
      trx.rollback();
      throw error;
    }
    return res.sendStatus(200);
  } catch (error) {
    logger.error('refund callback fatal error', error);
    await sendEmail(
      'AdminAlertEmailTemplate',
      await Globals.BACKEND_TEAM_EMAIL.get(),
      {
        subject: 'Alert Error in cashfree refund callback',
        application_name: 'core-api',
        error_details: error,
        priority: 'high',
        time: new Date().toDateString(),
        meta_details: req.body,
      }
    );
    return res.sendStatus(200);
  }
}

export async function processPaymentEvents(req: Request, res: Response) {
  logger.debug(
    'request headers received from cashfree for payment event',
    req.headers
  );
  logger.debug(
    'request body received from cashfree for payment event',
    req.body
  );
  try {
    const validation = payment_status_details.validate(req.body);
    if (validation.error) {
      throw validation.error.details[0].message;
    }
    const validated_req = validation.value as IPaymentCallbackResponse;

    let sqs_url = '';
    if (
      validated_req.data.order.order_id.startsWith(
        ServiceTag.FOOD_SERVICE_TAG + '_'
      )
    ) {
      sqs_url = SQS_URL.CORE_WORKER;
    } else if (
      validated_req.data.order.order_id.startsWith(
        ServiceTag.GROCERY_SERVICE_TAG + '_'
      )
    ) {
      sqs_url = SQS_URL.GROCERY_WORKER;
    } else if (
      validated_req.data.order.order_id.startsWith(
        ServiceTag.PHARMACY_SERVICE_TAG + '_'
      )
    ) {
      sqs_url = SQS_URL.PHARMACY_WORKER;
    } else if (
      validated_req.data.order.order_id.startsWith(
        ServiceTag.RIDER_SERVICE_TAG + '_'
      )
    ) {
      sqs_url = SQS_URL.RIDER_WORKER;
    } else if (
      validated_req.data.order.order_id.startsWith(
        ServiceTag.PICKUP_DROP_SERVICE_TAG + '_'
      )
    ) {
      sqs_url = SQS_URL.PICKUP_DROP_WORKER;
    } else {
      logger.error(
        'can not determine service sqs endpoint from cashfree payment order id',
        validated_req
      );
    }

    let payment_method = '';
    if (validated_req.data.payment.payment_method) {
      payment_method = Object.keys(
        validated_req.data.payment.payment_method
      )[0];
    }

    const formatted_data: IFormattedPaymentCallbackResponse = {
      data: {
        payment_details: {
          transaction_id: validated_req.data.order.order_id,
          transaction_amount: validated_req.data.payment.payment_amount,
          transaction_time: new Date(validated_req.data.payment.payment_time),
          payment_currency: validated_req.data.payment.payment_currency,
          external_payment_id: validated_req.data.payment.cf_payment_id + '',
          payment_status: validated_req.data.payment.payment_status,
          payment_message: validated_req.data.payment.payment_message,
          bank_reference: validated_req.data.payment.bank_reference,
          auth_id: validated_req.data.payment.auth_id,
          payment_method_details: validated_req.data.payment.payment_method,
          payment_method: payment_method,
          payment_group: validated_req.data.payment.payment_group,
        },
        customer_details: validated_req.data.customer_details,
        error_details: validated_req.data.error_details,
        payment_gateway_details: validated_req.data.payment_gateway_details,
      },
      event_time: validated_req.event_time,
      type: validated_req.type,
    };
    const send_sqs_message_response = await sendSQSMessage(sqs_url, {
      event: 'ORDER',
      action: 'UPDATE_PAYMENT_DETAILS',
      data: formatted_data,
    });
    logger.debug('send_sqs_message_response', send_sqs_message_response);
    return res.sendStatus(200);
  } catch (error) {
    logger.error('payment callback fatal error', error);
    await sendEmail(
      'AdminAlertEmailTemplate',
      await Globals.BACKEND_TEAM_EMAIL.get(),
      {
        subject: 'Alert Error in cashFree payment callback',
        application_name: 'core-api',
        error_details: error,
        priority: 'high',
        time: new Date().toDateString(),
        meta_details: req.body,
      }
    );
    return res.sendStatus(200);
  }
}
