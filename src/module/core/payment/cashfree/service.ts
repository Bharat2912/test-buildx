import {RefundStatus} from '../enum';
import {PaymentStatusResponse} from '../types';
import {CashFreeOrderStatus, CashfreeRefundStatus} from './enum';
import {getCashfreeOrder, getCashfreePayment} from './payment';

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
    const external_payment_id = cf_payment_details.cf_payment_id;
    const payment_id = cf_payment_details.order_id!;
    delete cf_payment_details.cf_payment_id;
    delete cf_payment_details.order_id;
    return {
      status: 'success',
      transaction_amount: cf_order_details.order_amount,
      transaction_id: payment_id + '',
      transaction_time: cf_payment_details.payment_completion_time,
      payment_currency: cf_order_details.order_currency,
      external_payment_id: external_payment_id + '',
      payment_message: cf_payment_details.payment_message,
      payment_method: cf_payment_details.payment_method + '',
      transaction_details: {
        external_payment_id,
        transaction_id: payment_id,
        ...cf_payment_details,
      },
    };
  } else {
    throw 'invalid cashfree order status';
  }
}

export function getFormattedRefundStatus(
  cashfree_refund_status: CashfreeRefundStatus
): RefundStatus {
  let refund_status;
  switch (cashfree_refund_status) {
    case CashfreeRefundStatus.SUCCESS:
      refund_status = RefundStatus.SUCCESS;
      break;
    case CashfreeRefundStatus.CANCELLED:
      refund_status = RefundStatus.CANCELLED;
      break;
    case CashfreeRefundStatus.PENDING:
      refund_status = RefundStatus.PENDING;
      break;
    case CashfreeRefundStatus.ONHOLD:
      refund_status = RefundStatus.ONHOLD;
      break;
    default:
      throw 'invalid cashfree status';
  }
  return refund_status;
}
