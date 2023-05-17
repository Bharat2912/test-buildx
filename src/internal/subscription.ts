import axios from 'axios';
import logger from '../utilities/logger/winston_logger';
import {
  PlanIntervalType,
  SubscriptionAuthStatus,
  SubscriptionPaymentStatus,
  SubscriptionStatus,
} from '../module/food/subscription/enum';

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
export interface ISubscriptionAuthorization {
  authorization_status: SubscriptionAuthStatus;
  checkout_initiated_time: Date;
  authorization_failure_reason: string;
}

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
  external_payment_order_id: string;
  reference_id: number;
  currency: string;
  amount: number;
  cycle: number;
  status: SubscriptionPaymentStatus;
  remarks: string;
  scheduled_on: Date;
  transaction_time: Date;
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

export type ICreatePlanResponse =
  | {
      created: true;
    }
  | {
      created: false;
      reason: string;
    };

export interface IRetrySubscriptionPayment {
  external_subscription_id: string;
  next_payment_on?: Date;
}

export interface IActivateSubscription {
  external_subscription_id: string;
  next_payment_on?: Date;
}

export async function createPlan(
  data: ICreatePlan
): Promise<ICreatePlanResponse> {
  logger.debug('request received for internal create plan', data);
  return await axios
    .post<{result: ICreatePlanResponse}>(
      (process.env.CORE_API_URL || '') + '/internal/subscription/create_plan',
      data,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    .then(response => {
      logger.debug(
        'subscription plan successfully created at core service',
        response.data.result
      );
      return response.data.result;
    })
    .catch(error => {
      if (error.response) {
        logger.error(
          'failed to create plan at core service',
          error.response.data
        );
      } else {
        logger.error('failed to create plan at core service', error);
      }
      throw error;
    });
}

export async function createSubscription(
  data: ICreateSubscription
): Promise<{subscription: ISubscription}> {
  logger.debug('request received for internal create subscription', data);
  return await axios
    .post<{result: {subscription: ISubscription}}>(
      (process.env.CORE_API_URL || '') +
        '/internal/subscription/create_subscription',
      data,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    .then(response => {
      logger.debug(
        'subscription successfully created at core service',
        response.data.result
      );
      return response.data.result;
    })
    .catch(error => {
      if (error.response) {
        logger.error(
          'failed to create subscription at core service',
          error.response.data
        );
      } else {
        logger.error('failed to create subscription at core service', error);
      }
      throw error;
    });
}

export async function cancelSubscription(
  external_subscription_id: string
): Promise<{subscription: ISubscription}> {
  logger.debug(
    'request received for internal cancel subscription',
    external_subscription_id
  );
  return await axios
    .post<{result: {subscription: ISubscription}}>(
      (process.env.CORE_API_URL || '') +
        `/internal/subscription/cancel_subscription/${external_subscription_id}`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    .then(response => {
      logger.debug(
        'subscription successfully cancelled at core service',
        response.data.result
      );
      return response.data.result;
    })
    .catch(error => {
      if (error.response) {
        logger.error(
          'failed to cancel subscription at core service',
          error.response.data
        );
      } else {
        logger.error('failed to cancel subscription at core service', error);
      }
      throw error;
    });
}

export async function getSubscription(
  external_subscription_id: string
): Promise<{subscription: ISubscription}> {
  logger.debug(
    'request received for internal get subscription',
    external_subscription_id
  );
  return await axios
    .get<{result: {subscription: ISubscription}}>(
      (process.env.CORE_API_URL || '') +
        `/internal/subscription/${external_subscription_id}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    .then(response => {
      logger.debug(
        'subscription details successfully fetched from core service',
        response.data.result
      );
      return response.data.result;
    })
    .catch(error => {
      if (error.response) {
        logger.error(
          'failed to fetch subscription details from core service',
          error.response.data
        );
      } else {
        logger.error(
          'failed to fetch subscription details from core service',
          error
        );
      }
      throw error;
    });
}

export async function getSubscriptionSinglePayment(
  data: IGetSubscriptionSinglePayment
): Promise<{payments: ISubscriptionPayment[]}> {
  logger.debug(
    'request received for internal get subscription singlepayment',
    data
  );
  return await axios
    .get<{result: {payments: ISubscriptionPayment[]}}>(
      (process.env.CORE_API_URL || '') +
        `/internal/subscription/${data.external_subscription_id}/payment/${data.external_payment_id}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    .then(response => {
      logger.debug(
        'subscription payment details successfully fetched from core service',
        response.data.result
      );
      return response.data.result;
    })
    .catch(error => {
      if (error.response) {
        logger.error(
          'failed to fetch subscription payment details from core service',
          error.response.data
        );
      } else {
        logger.error(
          'failed to fetch subscription payment details from core service',
          error
        );
      }
      throw error;
    });
}

export async function getSubscriptionPayments(
  data: IGetSubscriptionPayments
): Promise<{payments: ISubscriptionPayment[]}> {
  logger.debug('request received for internal get subscription payments', data);
  return await axios
    .get<{result: {payments: ISubscriptionPayment[]}}>(
      (process.env.CORE_API_URL || '') +
        `/internal/subscription/${data.external_subscription_id}/payments`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        params: {
          last_external_payment_id: data.last_external_payment_id,
          count: data.count,
        },
      }
    )
    .then(response => {
      logger.debug(
        'subscription payment details successfully fetched from core service',
        response.data.result
      );
      return response.data.result;
    })
    .catch(error => {
      if (error.response) {
        logger.error(
          'failed to fetch subscription payments details from core service',
          error.response.data
        );
      } else {
        logger.error(
          'failed to fetch subscription payments details from core service',
          error
        );
      }
      throw error;
    });
}

export async function manualSubscriptionActivation(
  data: IActivateSubscription
): Promise<{subscription: ISubscription}> {
  logger.debug(
    'request received for internal manual subscription activation',
    data
  );
  return await axios
    .post<{result: {subscription: ISubscription}}>(
      (process.env.CORE_API_URL || '') +
        `/internal/subscription/${data.external_subscription_id}/activate`,
      {
        next_payment_on: data.next_payment_on,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    .then(response => {
      logger.debug(
        'subscription manually activated successfully and fetched from core service',
        response.data.result
      );
      return response.data.result;
    })
    .catch(error => {
      if (error.response) {
        logger.error(
          'failed to activate subscription at core service',
          error.response.data
        );
      } else {
        logger.error('failed to activate subscription at core service', error);
      }
      throw error;
    });
}

export async function retrySubscriptionPayment(
  data: IRetrySubscriptionPayment
): Promise<{
  subscription: ISubscription;
  subscription_payment: ISubscriptionPayment;
}> {
  logger.debug(
    'request received for internal retry subscription payment',
    data
  );
  return await axios
    .post<{
      result: {
        subscription: ISubscription;
        subscription_payment: ISubscriptionPayment;
      };
    }>(
      (process.env.CORE_API_URL || '') +
        `/internal/subscription/${data.external_subscription_id}/retry_payment`,
      {
        next_payment_on: data.next_payment_on,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    .then(response => {
      logger.debug(
        'subscription payment retry successfully and fetched from core service',
        response.data.result
      );
      return response.data.result;
    })
    .catch(error => {
      if (error.response) {
        logger.error(
          'failed to retry subscription payment at core service',
          error.response.data
        );
      } else {
        logger.error(
          'failed to retry subscription payment at core service',
          error
        );
      }
      throw error;
    });
}
