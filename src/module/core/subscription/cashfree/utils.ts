import moment from 'moment';
import logger from '../../../../utilities/logger/winston_logger';
import {isEmpty} from '../../../../utilities/utilFuncs';
import {SubscriptionPaymentStatus, SubscriptionStatus} from '../enums';
import {ISubscription, ISubscriptionPayment} from '../types';
import {
  CashFreeSubscriptionPaymentStatus,
  CashFreeSubscriptionStatus,
} from './enums';
import {ICashFreeSubscription, ICashFreeSubscriptionPayment} from './types';
export function formatCashFreeSubscriptionStatus(
  status: CashFreeSubscriptionStatus
) {
  if (status === CashFreeSubscriptionStatus.ACTIVE) {
    return SubscriptionStatus.ACTIVE;
  } else if (status === CashFreeSubscriptionStatus.BANK_APPROVAL_PENDING) {
    return SubscriptionStatus.BANK_APPROVAL_PENDING;
  } else if (status === CashFreeSubscriptionStatus.CANCELLED) {
    return SubscriptionStatus.CANCELLED;
  } else if (status === CashFreeSubscriptionStatus.COMPLETED) {
    return SubscriptionStatus.COMPLETED;
  } else if (status === CashFreeSubscriptionStatus.INITIALIZED) {
    return SubscriptionStatus.INITIALIZED;
  } else if (status === CashFreeSubscriptionStatus.ON_HOLD) {
    return SubscriptionStatus.ON_HOLD;
  } else {
    throw 'invalid cashfree subscription status';
  }
}

export function formatCashFreeSubscriptionPaymentStatus(
  status: CashFreeSubscriptionPaymentStatus
) {
  if (status === CashFreeSubscriptionPaymentStatus.SUCCESS) {
    return SubscriptionPaymentStatus.SUCCESS;
  } else if (status === CashFreeSubscriptionPaymentStatus.FAILED) {
    return SubscriptionPaymentStatus.FAILED;
  } else if (status === CashFreeSubscriptionPaymentStatus.PENDING) {
    return SubscriptionPaymentStatus.PENDING;
  } else if (status === CashFreeSubscriptionPaymentStatus.INITIALIZED) {
    return SubscriptionPaymentStatus.PENDING;
  } else {
    logger.error('invalid cashfree subscription payment status', status);
    throw 'invalid cashfree subscription payment status';
  }
}

export function formatCashFreeSubscription(
  cashfree_subscription: ICashFreeSubscription
): ISubscription {
  return {
    id: cashfree_subscription.subscription.subscriptionId,
    external_subscription_id:
      cashfree_subscription.subscription.subReferenceId.toString(),
    plan_id: cashfree_subscription.subscription.planId,
    customer_name: cashfree_subscription.subscription.customerName,
    customer_email: cashfree_subscription.subscription.customerEmail,
    customer_phone: cashfree_subscription.subscription.customerPhone,
    mode: cashfree_subscription.subscription.mode,
    authorization_link: cashfree_subscription.subscription.authLink,
    status: formatCashFreeSubscriptionStatus(
      cashfree_subscription.subscription.status
    ),
    first_charge_date: moment(
      cashfree_subscription.subscription.firstChargeDate
      // 'DD-MM-YYYY hh:mm:ss'
    ).toDate(),
    current_cycle: cashfree_subscription.subscription.currentCycle,
    next_payment_on: moment(
      cashfree_subscription.subscription.scheduledOn
      // 'DD-MM-YYYY hh:mm:ss'
    ).toDate(),
    bank_account_number: cashfree_subscription.subscription.bankAccountNumber,
    bank_account_holder: cashfree_subscription.subscription.bankAccountHolder,
    umrn: cashfree_subscription.subscription.umrn,
    created_at: moment(
      cashfree_subscription.subscription.addedOn
      // 'DD-MM-YYYY hh:mm:ss'
    ).toDate(),
  };
}

export function formatCashFreeSubscriptionPayments(
  payments: ICashFreeSubscriptionPayment[]
): ISubscriptionPayment[] {
  const formatted_payments: ISubscriptionPayment[] = [];
  for (let p = 0; p < payments.length; p++) {
    const formatted_payment: ISubscriptionPayment = {
      external_payment_id: payments[p].paymentId.toString(),
      external_subscription_id: payments[p].subReferenceId.toString(),
      currency: payments[p].currency,
      amount: payments[p].amount,
      cycle: payments[p].cycle,
      status: formatCashFreeSubscriptionPaymentStatus(payments[p].status),
      remarks: payments[p].remarks,
      retry_attempts: payments[p].retryAttempts,
      failure_reason: payments[p].failureReason,
    };
    //optional fields
    if (!isEmpty(payments[p].cfOrderId)) {
      formatted_payment.external_payment_order_id =
        payments[p].cfOrderId!.toString();
    }
    if (!isEmpty(payments[p].referenceId)) {
      formatted_payment.reference_id = payments[p].referenceId;
    }
    if (!isEmpty(payments[p].scheduledOn)) {
      formatted_payment.scheduled_on = moment(payments[p].scheduledOn).toDate(); // 'DD-MM-YYYY hh:mm:ss'
    }
    if (!isEmpty(payments[p].addedOn)) {
      formatted_payment.transaction_time = moment(payments[p].addedOn).toDate(); // 'DD-MM-YYYY hh:mm:ss'
    }
    formatted_payments.push(formatted_payment);
  }
  return formatted_payments;
}
