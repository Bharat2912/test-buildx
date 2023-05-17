import {
  PlanIntervalType,
  SubscriptionAuthStatus,
  SubscriptionPaymentStatus,
  SubscriptionStatus,
} from './enums';

/**
 * intervals
 *
 * Number of intervals of intervalType between every subscription payment.
 * For example, to charge a customer bi-weekly use intervalType as “week” and intervals as 2.
 * Required for PERIODIC plan. Default value is 1.
 *
 * max_cycles
 * Maximum number of debits set for the plan.
 * The subscription will automatically change to COMPLETED status once this limit is reached.
 */

export interface ICreatePlan {
  id: string;
  name: string;
  type: string;
  max_cycles?: number;
  amount: number;
  interval_type: PlanIntervalType;
  intervals?: number;
  description?: string;
}

// export interface ICreatePlanResponse {
//   message: string;
// }

export interface ICreateSubscription {
  id: string;
  plan_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  first_charge_date: Date;
  authorization_amount: number;
  expires_on: Date;
  return_url?: string;
  description?: string;
}

//Unique Mandate Reference Number allocated to each new mandate created in NACH Debit
export interface ISubscription {
  id: string;
  external_subscription_id: string;
  plan_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  mode: string;
  authorization_link: string;
  status: SubscriptionStatus;
  first_charge_date: Date;
  current_cycle: number;
  next_payment_on: Date;
  bank_account_number: string;
  bank_account_holder: string;
  umrn: string;
  created_at: Date;
}

export interface ISubscriptionPayment {
  external_payment_id: string;
  external_subscription_id: string;
  external_payment_order_id?: string;
  reference_id?: number;
  currency: string;
  amount: number;
  cycle: number;
  status: SubscriptionPaymentStatus;
  remarks: string;
  scheduled_on?: Date;
  transaction_time?: Date;
  retry_attempts: number;
  failure_reason: string;
}

export interface IGetSubscriptionSinglePayment {
  external_payment_id: string;
  external_subscription_id: string;
}

export interface IGetSubscriptionPayments {
  external_subscription_id: string;
  last_external_payment_id?: string;
  count?: number;
}

export interface IRetrySubscriptionPayment {
  external_subscription_id: string;
  next_payment_on?: Date;
}

export interface IActivateSubscription {
  external_subscription_id: string;
  next_payment_on?: Date;
}

export type ICreatePlanResponse =
  | {
      created: true;
    }
  | {
      created: false;
      reason: string;
    };

export interface ISubscriptionAuthorization {
  authorization_status: SubscriptionAuthStatus;
  checkout_initiated_time: Date;
  authorization_failure_reason: string;
}
