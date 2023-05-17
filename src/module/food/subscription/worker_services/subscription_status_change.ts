import {getTransaction} from '../../../../data/knex';
import {ISubscriptionStatus} from '../../../../utilities/sqs_manager';
import {
  SubscriptionAuthStatus,
  SubscriptionCancelledBy,
  SubscriptionPaymentStatus,
  SubscriptionStatus,
} from '../enum';
import {
  insertSubscriptionPayment,
  readPlan,
  readSubscriptionForUpdate,
  readSubscriptionPaymentByCycleNo,
  updateSubscription,
} from '../model';
import {ISubscription} from '../types';
import {sendEmail} from '../../../../utilities/utilFuncs';
import logger from '../../../../utilities/logger/winston_logger';
import {
  readRestaurantBasicByIdForUpdate,
  updateRestaurantBasic,
} from '../../restaurant/models';
import moment from 'moment';
import {Service} from '../../../../enum';
import {updateOldSubscriptionStats} from '../service';

/**
INITIALIZED:	The subscription has just been created and is ready to be authorized by the customer.
BANK_APPROVAL_PENDING :E-Mandate has been authorised and registration is pending at the Bank.  This status is specific for e-mandates.
ACTIVE:	The customer has authorized the subscription and will be debited accordingly.
ON_HOLD:	The subscription failed due to insufficient funds, expiration of payment method, and so on.
CANCELLED:	The subscription was cancelled by the merchant and can no longer be activated.
COMPLETED:	The subscription has completed its total active period.
*/
export async function processSubscriptionStatusChange(
  data: ISubscriptionStatus
) {
  if (data.subscription.status === SubscriptionStatus.INITIALIZED) {
    await changeSubscriptionStatusToInitialized(data.subscription);
  } else if (
    data.subscription.status === SubscriptionStatus.BANK_APPROVAL_PENDING
  ) {
    await changeSubscriptionStatusToBankApprovalPending(data.subscription);
  } else if (data.subscription.status === SubscriptionStatus.ACTIVE) {
    await changeSubscriptionStatusToActive(data.subscription);
  } else if (data.subscription.status === SubscriptionStatus.ON_HOLD) {
    await changeSubscriptionStatusToOnHold(data.subscription);
  } else if (data.subscription.status === SubscriptionStatus.CANCELLED) {
    await changeSubscriptionStatusToCancelled(data.subscription);
  } else if (data.subscription.status === SubscriptionStatus.COMPLETED) {
    await changeSubscriptionStatusToCompleted(data.subscription);
  } else {
    throw 'Invalid external subscription status';
  }
}

async function changeSubscriptionStatusToInitialized(
  external_subscription: ISubscriptionStatus['subscription']
) {
  const trx = await getTransaction();
  try {
    const internal_subscription = await readSubscriptionForUpdate(
      trx,
      external_subscription.id
    );
    if (!internal_subscription) {
      if (process.env.NODE_ENV === 'PROD') {
        throw 'subscription not found in internal database';
      }
      logger.error('subscription not found in internal database');
      await trx.rollback();
      return;
    }
    logger.debug('internal subscription details', internal_subscription);
    if (internal_subscription.status === external_subscription.status) {
      await trx.rollback();
      logger.debug('new subscription status is already updated in database');
      return;
    }

    if (internal_subscription.status === SubscriptionStatus.PENDING) {
      const updated_internal_subscription = await updateSubscription(
        trx,
        external_subscription.id,
        {
          status: SubscriptionStatus.INITIALIZED,
          external_subscription_id:
            external_subscription.external_subscription_id,
          authorization_details: {
            authorization_link: external_subscription.authorization_link,
          },
        }
      );
      logger.debug(
        'updated internal subscription',
        updated_internal_subscription
      );
      const email_template_data = {
        subscription_id: external_subscription.id,
        authorization_link: external_subscription.authorization_link,
      };
      await sendEmail(
        'AdminAlertEmailTemplate',
        internal_subscription.customer_email!,
        {
          subject: 'Subscription Authorization Pending',
          application_name: Service.FOOD_API,
          error_details: 'please use the below link to authorize',
          priority: 'high',
          time: new Date().toDateString(),
          meta_details: email_template_data,
        }
      );
    }
    await trx.commit();
  } catch (error) {
    logger.error('Error in processing subscription status change', error);
    await trx.rollback();
    throw error;
  }
}

async function changeSubscriptionStatusToBankApprovalPending(
  external_subscription: ISubscriptionStatus['subscription']
) {
  const trx = await getTransaction();
  try {
    const internal_subscription = await readSubscriptionForUpdate(
      trx,
      external_subscription.id
    );
    if (!internal_subscription) {
      if (process.env.NODE_ENV === 'PROD') {
        throw 'subscription not found in internal database';
      }
      logger.error('subscription not found in internal database');
      await trx.rollback();
      return;
    }
    logger.debug('internal subscription details', internal_subscription);
    if (internal_subscription.status === external_subscription.status) {
      await trx.rollback();
      logger.debug('new subscription status is already updated in database');
      return;
    }
    if (internal_subscription.status !== SubscriptionStatus.INITIALIZED) {
      throw 'Invalid state transition, received subscription status: bank_approval_pending for a subscription which is not in initialized state';
    }
    const updated_internal_subscription = await updateSubscription(
      trx,
      external_subscription.id,
      {
        status: SubscriptionStatus.BANK_APPROVAL_PENDING,
      }
    );
    logger.debug(
      'updated internal subscription',
      updated_internal_subscription
    );
    await sendEmail(
      'AdminAlertEmailTemplate',
      internal_subscription.customer_email!,
      {
        subject: 'Subscription Waiting for bank approval',
        subscription_id: external_subscription.id,
      }
    );
    await trx.commit();
  } catch (error) {
    logger.error('Error in processing subscription status change', error);
    await trx.rollback();
    throw error;
  }
}

async function changeSubscriptionStatusToCancelled(
  external_subscription: ISubscriptionStatus['subscription']
) {
  const trx = await getTransaction();
  try {
    const internal_subscription = await readSubscriptionForUpdate(
      trx,
      external_subscription.id
    );
    if (!internal_subscription) {
      if (process.env.NODE_ENV === 'PROD') {
        throw 'subscription not found in internal database';
      }
      logger.error('subscription not found in internal database');
      await trx.rollback();
      return;
    }
    logger.debug('internal subscription details', internal_subscription);
    if (internal_subscription.status === external_subscription.status) {
      await trx.rollback();
      logger.debug('new subscription status is already updated in database');
      return;
    }
    logger.debug('subscription has not been cancelled by customer');
    const subscription_updates: ISubscription = {
      status: SubscriptionStatus.CANCELLED,
      cancelled_by: SubscriptionCancelledBy.PARTNER,
      end_time: new Date(),
    };
    const email_template_data = {
      subscription_id: external_subscription.id,
      remaining_days: 0,
    };
    if (internal_subscription.status === SubscriptionStatus.ACTIVE) {
      logger.debug('cancelling an active subscription');
      const plan = await readPlan(internal_subscription.plan_id!);
      logger.debug('plan', plan);
      const current_cycle_subscription_payment_details =
        await readSubscriptionPaymentByCycleNo(
          internal_subscription.id!,
          internal_subscription.current_cycle!
        );
      logger.debug('current cycle subscription payment details');
      if (
        current_cycle_subscription_payment_details &&
        current_cycle_subscription_payment_details.status ===
          SubscriptionPaymentStatus.SUCCESS
      ) {
        const current_cycle_subscription_end_time = moment(
          current_cycle_subscription_payment_details.transaction_time
        ).add(1, plan.interval_type);
        logger.debug(
          'current cycle subscription end time',
          current_cycle_subscription_end_time.toDate()
        );
        subscription_updates.end_time =
          current_cycle_subscription_end_time.toDate();
        email_template_data.remaining_days = moment().diff(
          current_cycle_subscription_end_time,
          'days'
        );
        logger.debug(
          'subscription remaining days',
          email_template_data.remaining_days
        );
      }
    }
    const updated_internal_subscription = await updateSubscription(
      trx,
      external_subscription.id,
      subscription_updates
    );
    logger.debug(
      'updated internal subscription',
      updated_internal_subscription
    );

    await sendEmail(
      'AdminAlertEmailTemplate',
      internal_subscription.customer_email!,
      {
        subject: 'Your subscription has been cancelled',
        application_name: Service.FOOD_API,
        error_details: '',
        priority: 'high',
        time: new Date().toDateString(),
        meta_details: email_template_data,
      }
    );
    await trx.commit();
  } catch (error) {
    logger.error('Error in processing subscription status change', error);
    await trx.rollback();
    throw error;
  }
}

async function changeSubscriptionStatusToOnHold(
  external_subscription: ISubscriptionStatus['subscription']
) {
  const trx = await getTransaction();
  try {
    const internal_subscription = await readSubscriptionForUpdate(
      trx,
      external_subscription.id
    );
    if (!internal_subscription) {
      if (process.env.NODE_ENV === 'PROD') {
        throw 'subscription not found in internal database';
      }
      logger.error('subscription not found in internal database');
      await trx.rollback();
      return;
    }
    logger.debug('internal subscription details', internal_subscription);
    if (internal_subscription.status === external_subscription.status) {
      await trx.rollback();
      logger.debug('new subscription status is already updated in database');
      return;
    }
    if (internal_subscription.status !== SubscriptionStatus.ACTIVE) {
      throw 'Invalid state transition, received subscription status: on_hold for a subscription which is not in active state';
    }
    const updated_internal_subscription = await updateSubscription(
      trx,
      external_subscription.id,
      {
        status: SubscriptionStatus.ON_HOLD,
      }
    );
    logger.debug(
      'updated internal subscription',
      updated_internal_subscription
    );

    await sendEmail(
      'SubscriptionOnHold',
      internal_subscription.customer_email!,
      {
        subject: 'Your subscription has been put on hold',
        subscription_id: external_subscription.id,
        reason:
          'The subscription on hold due to insufficient funds or expiration of payment method',
      }
    );
    await trx.commit();
  } catch (error) {
    logger.error('Error in processing subscription status change', error);
    await trx.rollback();
    throw error;
  }
}

async function changeSubscriptionStatusToCompleted(
  external_subscription: ISubscriptionStatus['subscription']
) {
  const trx = await getTransaction();
  try {
    const internal_subscription = await readSubscriptionForUpdate(
      trx,
      external_subscription.id
    );
    if (!internal_subscription) {
      if (process.env.NODE_ENV === 'PROD') {
        throw 'subscription not found in internal database';
      }
      logger.error('subscription not found in internal database');
      await trx.rollback();
      return;
    }
    logger.debug('internal subscription details', internal_subscription);
    if (internal_subscription.status === external_subscription.status) {
      await trx.rollback();
      logger.debug('new subscription status is already updated in database');
      return;
    }
    const updated_internal_subscription = await updateSubscription(
      trx,
      external_subscription.id,
      {
        status: SubscriptionStatus.COMPLETED,
        end_time: new Date(),
      }
    );
    logger.debug(
      'updated internal subscription',
      updated_internal_subscription
    );

    await trx.commit();
    await sendEmail(
      'SubscriptionCompleted',
      internal_subscription.customer_email!,
      {
        subject: 'Your Subscription has been completed',
        subscription_id: external_subscription.id,
      }
    );
    await trx.commit();
  } catch (error) {
    logger.error('Error in processing subscription status change', error);
    await trx.rollback();
    throw error;
  }
}

async function changeSubscriptionStatusToActive(
  external_subscription: ISubscriptionStatus['subscription']
) {
  const trx = await getTransaction();
  try {
    const internal_subscription = await readSubscriptionForUpdate(
      trx,
      external_subscription.id
    );
    if (!internal_subscription) {
      if (process.env.NODE_ENV === 'PROD') {
        throw 'subscription not found in internal database';
      }
      logger.error('subscription not found in internal database');
      await trx.rollback();
      return;
    }
    logger.debug('internal subscription details', internal_subscription);
    if (internal_subscription.status === external_subscription.status) {
      await trx.rollback();
      logger.debug('new subscription status is already updated in database');
      return;
    }
    /**
     * For subscriptions through eMandates (bank accounts), it takes 1 to 2 working days to activate the subscription.
     * For subscriptions through cards, it is activated instantly.
     */
    if (
      internal_subscription.status === SubscriptionStatus.PENDING ||
      internal_subscription.status === SubscriptionStatus.CANCELLED ||
      internal_subscription.status === SubscriptionStatus.COMPLETED ||
      internal_subscription.status === SubscriptionStatus.FAILED_TO_CANCEL
    ) {
      throw 'Invalid state transition, received subscription status: active for a subscription which is not in on_hold/bank_approval_pending/initialized state';
    }
    const subscription_updates: ISubscription = {
      status: SubscriptionStatus.ACTIVE,
    };
    if (
      moment(external_subscription.next_payment_on).toDate() !==
      moment(internal_subscription.next_payment_on).toDate()
    ) {
      subscription_updates.next_payment_on = moment(
        external_subscription.next_payment_on
      ).toDate();
    }
    //If subscription is created for the first time then create a pending payment record
    //and activate restaurant listing with end date set to next payment date
    if (
      internal_subscription.status === SubscriptionStatus.INITIALIZED ||
      internal_subscription.status === SubscriptionStatus.BANK_APPROVAL_PENDING
    ) {
      subscription_updates.start_time = new Date();
      subscription_updates.authorization_status =
        SubscriptionAuthStatus.AUTHORIZED;
      subscription_updates.mode = external_subscription.mode;

      const restaurant = await readRestaurantBasicByIdForUpdate(
        trx,
        internal_subscription.restaurant_id!
      );
      if (
        restaurant.subscription_id &&
        restaurant.subscription_id !== internal_subscription.id
      ) {
        await updateOldSubscriptionStats(
          restaurant.subscription_id,
          restaurant.subscription_remaining_orders!
        );
      }

      const plan = await readPlan(internal_subscription.plan_id!);

      const pending_subscription_payment = await insertSubscriptionPayment(
        trx,
        {
          subscription_id: internal_subscription.id,
          status: SubscriptionPaymentStatus.PENDING,
          no_of_grace_period_orders_allotted: plan.no_of_grace_period_orders,
          no_of_orders_bought: plan.no_of_orders,
          cycle: 0,
          scheduled_on: moment(external_subscription.next_payment_on).toDate(),
        }
      );
      logger.debug(
        'pending subscription payment',
        pending_subscription_payment
      );

      const updated_restaurant = await updateRestaurantBasic(trx, {
        id: internal_subscription.restaurant_id!,
        subscription_id: internal_subscription.id,
        subscription_remaining_orders: plan.no_of_orders,
        subscription_grace_period_remaining_orders:
          plan.no_of_grace_period_orders,
        subscription_end_time: new Date(), //restaurant subscription will by default go into grace period
      });
      logger.debug(
        'updated restaurant with subscription benifits',
        updated_restaurant
      );
    }
    const updated_internal_subscription = await updateSubscription(
      trx,
      external_subscription.id,
      subscription_updates
    );
    logger.debug(
      'updated internal subscription',
      updated_internal_subscription
    );
    await sendEmail(
      'SubscriptionActivated',
      internal_subscription.customer_email!,
      {
        subject: 'Congratulations Your Subscription has been Activated!',
        subscription_id: external_subscription.id,
        next_payment_on: external_subscription.next_payment_on,
      }
    );
    await trx.commit();
  } catch (error) {
    logger.error('Error in processing subscription status change', error);
    await trx.rollback();
    throw error;
  }
}
