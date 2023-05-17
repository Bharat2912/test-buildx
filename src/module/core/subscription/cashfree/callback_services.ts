import moment from 'moment';
import Globals from '../../../../utilities/global_var/globals';
import logger from '../../../../utilities/logger/winston_logger';
import {sendSQSMessage, SQS_URL} from '../../../../utilities/sqs_manager';
import {
  getSQSFromAppendingServiceTagInIndentifier,
  sendEmail,
} from '../../../../utilities/utilFuncs';
import {
  ICashFreeSubscriptionAuthStatusDetails,
  ICashFreeSubscriptionNewPaymentDetails,
  ICashFreeSubscriptionPaymentDeclinedDetails,
  ICashFreeSubscriptionStatusChangeDetails,
} from '../../subscription/cashfree/callback_types';
import {SubscriptionAuthStatus, SubscriptionPaymentStatus} from '../enums';
import {ISubscription, ISubscriptionAuthorization} from '../types';
import {CashFreeSubscriptionAuthStatus} from './enums';
import {getSubscriptionSinglePaymentFromCashFree} from './services';
import {formatCashFreeSubscriptionStatus} from './utils';

export async function subscriptionStatusChange(
  data: ICashFreeSubscriptionStatusChangeDetails,
  subscription: ISubscription
) {
  const callback_subscription_status = formatCashFreeSubscriptionStatus(
    data.cf_status
  );

  if (subscription.status !== callback_subscription_status) {
    logger.error(
      'callback subscription status does not match with cashfree subscription details',
      {
        subscription,
      }
    );
    throw 'callback subscription status does not match with cashfree subscription details';
  }
  const send_sqs_message_response = await sendSQSMessage(
    getSQSFromAppendingServiceTagInIndentifier(subscription.id),
    {
      event: 'SUBSCRIPTION',
      action: 'SUBSCRIPTION_STATUS_CHANGE',
      data: {subscription},
    }
  );
  logger.debug('send_sqs_message_response', send_sqs_message_response);
}

/**
 * This event is triggered when the checkout fails. The customer can do multiple checkouts
 * through the same subscription, and you will be notified of every checkout failure.
 * This event will not be triggered for an active, or bank approval pending subscription.
 * This is just for eMandate authorisation, not applicable for other payment modes
 */
export async function subscriptionAuthStatus(
  data: ICashFreeSubscriptionAuthStatusDetails,
  subscription: ISubscription
) {
  const callback_subscription_status = formatCashFreeSubscriptionStatus(
    data.cf_subscriptionStatus
  );

  if (subscription.status !== callback_subscription_status) {
    logger.error(
      'callback subscription status does not match with cashfree subscription details',
      {
        subscription,
      }
    );
    throw 'callback subscription status does not match with cashfree subscription details';
  }
  if (data.cf_authStatus !== CashFreeSubscriptionAuthStatus.FAILED) {
    logger.error('callback subscription auth status is invalid', {
      subscription,
    });
    throw 'callback subscription auth status is invalid';
  }

  const subscription_authorization_details: ISubscriptionAuthorization = {
    authorization_status: SubscriptionAuthStatus.FAILED,
    authorization_failure_reason: data.cf_authFailureReason,
    checkout_initiated_time: moment(data.cf_authTimestamp).toDate(),
  };

  const send_sqs_message_response = await sendSQSMessage(
    getSQSFromAppendingServiceTagInIndentifier(subscription.id),
    {
      event: 'SUBSCRIPTION',
      action: 'SUBSCRIPTION_AUTH_STATUS',
      data: {subscription, subscription_authorization_details},
    }
  );
  logger.debug('send_sqs_message_response', send_sqs_message_response);
}

/**
 * subscriptionNewPayment service creates a new invoice record about new payment for subscription
 * It updates subscription status to active
 * It sets to next payment date from payment confirmation date i.e now to future date depending on plan_interval
 */
export async function subscriptionNewPayment(
  callback_data: ICashFreeSubscriptionNewPaymentDetails,
  subscription: ISubscription,
  verify_attempt?: number
) {
  const max_verify_attempts =
    await Globals.SUBSCRIPTION_VERFIY_NEW_PAYMENT_MAX_ATTEMPTS.get();
  if (verify_attempt && verify_attempt >= max_verify_attempts) {
    logger.error('Max attempts reached to verify subscription payment', {
      callback_data,
      subscription,
      verify_attempt,
    });
    await sendEmail(
      'AdminAlertEmailTemplate',
      await Globals.BACKEND_TEAM_EMAIL.get(),
      {
        subject: 'Could not successfully verify subscription payment',
        application_name: 'core-worker',
        error_details: 'Reached maxed verification attempts',
        priority: 'high',
        time: new Date().toDateString(),
        meta_details: {
          callback_data,
          subscription,
          verify_attempt,
        },
      }
    );
    return;
  }

  const subscription_payment = (
    await getSubscriptionSinglePaymentFromCashFree({
      external_payment_id: callback_data.cf_paymentId.toString(),
      external_subscription_id: callback_data.cf_subReferenceId.toString(),
    })
  )[0];
  if (!subscription_payment) {
    logger.error(
      'callback subscription new payment record not found at cashfree subscription payments'
    );
    throw 'callback subscription new payment record not found at cashfree subscription payments';
  }
  if (subscription_payment.status === SubscriptionPaymentStatus.PENDING) {
    const current_attempt = verify_attempt ? verify_attempt + 1 : 1;

    logger.debug('Subscription new payment will be reverifyed', {
      callback_data,
      subscription,
      attempt: current_attempt,
    });
    await sendSQSMessage(
      SQS_URL.CORE_WORKER,
      {
        event: 'SUBSCRIPTION',
        action: 'VERIFY_SUBSCRIPTION_NEW_PAYMENT',
        data: {
          callback_data,
          subscription,
          attempt: current_attempt,
        },
      },
      await Globals.SUBSCRIPTION_VERFIY_NEW_PAYMENT_AFTER_SECONDS.get()
    );
  } else {
    const send_sqs_message_response = await sendSQSMessage(
      getSQSFromAppendingServiceTagInIndentifier(subscription.id),
      {
        event: 'SUBSCRIPTION',
        action: 'SUBSCRIPTION_NEW_PAYMENT',
        data: {subscription, subscription_payment},
      }
    );
    logger.debug('send_sqs_message_response', send_sqs_message_response);
  }
}

/**
 * If a subscription payment is failed then we will recive callback from cashfree about failed payment
 * user has 3 retry total attempts
 * user will have only one retry attempt per day
 * once a payment is failed subscription will go in ON HOLD state
 * user will use retry payment api to schedule a retry attempt.
 * subscriptionPaymentDeclined service wont schedule a retry
 */
export async function subscriptionPaymentDeclined(
  data: ICashFreeSubscriptionPaymentDeclinedDetails,
  subscription: ISubscription
) {
  const subscription_payment = (
    await getSubscriptionSinglePaymentFromCashFree({
      external_payment_id: data.cf_paymentId.toString(),
      external_subscription_id: data.cf_subReferenceId.toString(),
    })
  )[0];
  if (!subscription_payment) {
    logger.error(
      'callback subscription declined payment record not found at cashfree subscription payments'
    );
    throw 'callback subscription declined payment record not found at cashfree subscription payments';
  }
  logger.debug('external subscription payment', subscription_payment);
  const send_sqs_message_response = await sendSQSMessage(
    getSQSFromAppendingServiceTagInIndentifier(subscription.id),
    {
      event: 'SUBSCRIPTION',
      action: 'SUBSCRIPTION_PAYMENT_DECLINED',
      data: {subscription, subscription_payment},
    }
  );
  logger.debug('send_sqs_message_response', send_sqs_message_response);
}
