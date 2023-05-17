//cashfree response to generalized response formating functions will come here

import moment from 'moment';
import {
  IActivateSubscription,
  ICreatePlan,
  ICreatePlanResponse,
  ICreateSubscription,
  IGetSubscriptionPayments,
  IGetSubscriptionSinglePayment,
  IRetrySubscriptionPayment,
  ISubscription,
  ISubscriptionPayment,
} from '../types';
import {CashFreePlanType} from './enums';
import {
  activateCashFreeSubscription,
  cancelCashFreeSubscription,
  createCashFreePlan,
  createCashFreeSubscription,
  getCashFreeSingleSubscriptionPayment,
  getCashFreeSubscription,
  getCashFreeSubscriptionPayments,
  retryPaymentCashFreeSubscription,
} from './subscription';
import {
  formatCashFreeSubscription,
  formatCashFreeSubscriptionPayments,
} from './utils';

export async function createSubscriptionAtCashFree(
  subscription_details: ICreateSubscription
): Promise<ISubscription> {
  const create_cashfree_subscription = await createCashFreeSubscription({
    subscriptionId: subscription_details.id,
    planId: subscription_details.plan_id,
    customerName: subscription_details.customer_name,
    customerEmail: subscription_details.customer_email,
    customerPhone: subscription_details.customer_phone,
    //first payment at cashfree side can only take place after two days of subscription creation
    firstChargeDate: moment(subscription_details.first_charge_date).format(
      'YYYY-MM-DD'
    ),
    authAmount: subscription_details.authorization_amount,
    expiresOn: moment(subscription_details.expires_on).format(
      'YYYY-MM-DD HH:mm:ss'
    ),
    returnUrl: subscription_details.return_url,
    subscriptionNote: subscription_details.description,
    // notificationChannels?: CashFreeNotificationChannels[];
  });

  const subscription = await getSubscriptionDetailsFromCashFree(
    create_cashfree_subscription.subReferenceId.toString()
  );

  return subscription;
}

export async function createPlanAtCashFree(
  plan_details: ICreatePlan
): Promise<ICreatePlanResponse> {
  await createCashFreePlan({
    planId: plan_details.id,
    planName: plan_details.name,
    type: CashFreePlanType.PERIODIC,
    maxCycles: plan_details.max_cycles,
    amount: plan_details.amount,
    // maxAmount?: number;
    intervalType: plan_details.interval_type,
    intervals: plan_details.intervals,
    description: plan_details.description,
  });

  return {
    created: true,
  };
}

export async function getSubscriptionDetailsFromCashFree(
  external_subscription_id: string
): Promise<ISubscription> {
  const cashfree_subscription = await getCashFreeSubscription(
    +external_subscription_id
  );

  const formatted_subscription = formatCashFreeSubscription(
    cashfree_subscription
  );
  return formatted_subscription;
}

export async function getSubscriptionSinglePaymentFromCashFree(
  data: IGetSubscriptionSinglePayment
): Promise<ISubscriptionPayment[]> {
  const cashfree_subscription_payments =
    await getCashFreeSingleSubscriptionPayment(
      +data.external_subscription_id,
      +data.external_payment_id
    );

  const payments = formatCashFreeSubscriptionPayments([
    cashfree_subscription_payments.payment,
  ]);
  return payments;
}
export async function getSubscriptionPaymentsFromCashFree(
  data: IGetSubscriptionPayments
): Promise<ISubscriptionPayment[]> {
  const cashfree_subscription_payments = await getCashFreeSubscriptionPayments(
    +data.external_subscription_id,
    data.last_external_payment_id ? +data.last_external_payment_id : undefined,
    data.count
  );

  const payments = formatCashFreeSubscriptionPayments(
    cashfree_subscription_payments.payments
  );
  return payments;
}

export async function cancelSubscriptionAtCashFree(
  external_subscription_id: string
): Promise<ISubscription> {
  await cancelCashFreeSubscription(+external_subscription_id);
  const cashfree_subscription = await getSubscriptionDetailsFromCashFree(
    external_subscription_id
  );
  return cashfree_subscription;
}

export async function retrySubscriptionPaymentAtCashFree(
  data: IRetrySubscriptionPayment
) {
  let next_payment_on;
  if (data.next_payment_on) {
    next_payment_on = moment(data.next_payment_on).format('YYYY-MM-DD');
  }
  const retry_payment = await retryPaymentCashFreeSubscription(
    +data.external_subscription_id,
    {nextScheduledOn: next_payment_on}
  );

  const subscription = await getSubscriptionDetailsFromCashFree(
    data.external_subscription_id
  );
  const subscription_payment = await getSubscriptionSinglePaymentFromCashFree({
    external_payment_id: retry_payment.payment.toString(),
    external_subscription_id: data.external_subscription_id,
  });
  return {
    subscription,
    subscription_payment,
  };
}

export async function activateSubscriptionAtCashFree(
  data: IActivateSubscription
): Promise<ISubscription> {
  let next_payment_on;
  if (data.next_payment_on) {
    next_payment_on = moment(data.next_payment_on).format('YYYY-MM-DD');
  }

  await activateCashFreeSubscription(+data.external_subscription_id, {
    nextScheduledOn: next_payment_on,
  });

  const subscription = await getSubscriptionDetailsFromCashFree(
    data.external_subscription_id
  );

  return subscription;
}
