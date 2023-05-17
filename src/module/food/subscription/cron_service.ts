import moment from 'moment';
import {getTransaction} from '../../../data/knex';
import {
  getSubscription,
  getSubscriptionPayments,
} from '../../../internal/subscription';
import logger from '../../../utilities/logger/winston_logger';
import {isEmpty, sendEmail} from '../../../utilities/utilFuncs';
import {PlanType, SubscriptionPaymentStatus, SubscriptionStatus} from './enum';
import {
  readStaleSubscriptionsForUpdate,
  readSubscriptionsInDuration,
  readPaidSubscriptionsToPutOnHoldForUpdate,
  updateSubscriptionPayment,
  updateSubscription,
  readPlan,
  getNumberOfRestaurantSubscriptionsCreatedUnderParticularPlan,
  readRestaurantsEligibleForAutoSubscribe,
} from './model';
import {ISubscriptionPayment} from './types';
import {processSubscriptionNewPayment} from '../subscription/worker_services/subscription_new_payment';
import {ISubscriptionAndSubscriptionPayment} from '../../../utilities/sqs_manager';
import {Service} from '../../../enum';
import Globals from '../../../utilities/global_var/globals';
import {createFreeSubscription} from './service';

export async function notifySubscribersAboutSubscriptionEndDate() {
  const current_time = moment();
  const start_time = current_time.unix();
  const end_time = moment()
    .add(await Globals.NOTIFY_SUBSCRIBERS_BEFORE_DAYS.get(), 'days')
    .unix();

  const {count, subscriptions} = await readSubscriptionsInDuration(
    start_time,
    end_time
  );
  logger.debug(
    `sending subscription notification email to ${count} subscribers`
  );

  for (let i = 0; i < subscriptions.length; i++) {
    let remaining_subscription_days = moment(subscriptions[i].end_time).diff(
      current_time,
      'days'
    );
    if (remaining_subscription_days < 0) {
      remaining_subscription_days = 0;
    }
    await sendEmail(
      'SubscriptionRemindEndDate',
      subscriptions[i].customer_email!,
      {
        subject: 'Your Subscription is going to end soon',
        remaining_subscription_days,
        remaining_subscription_orders:
          subscriptions[i].subscription_remaining_orders,
      }
    );
  }
}

export async function updateStaleRestaurantSubscription() {
  const trx = await getTransaction();
  const updated_subscription_id: string[] = [];
  const updated_subscription_payment_id: number[] = [];
  try {
    const stale_subscriptions = await readStaleSubscriptionsForUpdate(trx);
    for (let i = 0; i < stale_subscriptions.length; i++) {
      if (isEmpty(stale_subscriptions[i].no_of_orders_consumed)) {
        const no_of_orders_consumed =
          stale_subscriptions[i].no_of_orders_bought! -
          stale_subscriptions[i].subscription_remaining_orders!;

        await updateSubscriptionPayment(
          trx,
          stale_subscriptions[i].subscription_payment_id!,
          {
            no_of_orders_consumed: no_of_orders_consumed,
          }
        );

        updated_subscription_payment_id.push(
          stale_subscriptions[i].subscription_payment_id!
        );
      }

      if (
        stale_subscriptions[i].plan_type === PlanType.FREE &&
        stale_subscriptions[i].status !== SubscriptionStatus.CANCELLED &&
        stale_subscriptions[i].status !== SubscriptionStatus.COMPLETED
      ) {
        if (stale_subscriptions[i].status === SubscriptionStatus.ACTIVE) {
          await updateSubscription(trx, stale_subscriptions[i].id!, {
            status: SubscriptionStatus.COMPLETED,
          });
        } else {
          await updateSubscription(trx, stale_subscriptions[i].id!, {
            status: SubscriptionStatus.CANCELLED,
          });
        }

        updated_subscription_id.push(stale_subscriptions[i].id!);
      }
    }
    await trx.commit();

    await sendEmail(
      'AdminAlertEmailTemplate',
      await Globals.BACKEND_TEAM_EMAIL.get(),
      {
        subject: `Stale Subscription Update Report ${moment().format(
          'dddd, MMMM Do YYYY, h:mm:ss a'
        )}`,
        application_name: Service.FOOD_CRON,
        error_details: {},
        priority: 'high',
        time: new Date().toDateString(),
        meta_details: {
          updated_subscription_id,
          updated_subscription_payment_id,
        },
      }
    );
  } catch (error) {
    await trx.rollback();
    throw error;
  }

  await autoSubscribeRestaurantsEligibleForFreePlan();
}

/**
 *
 * Get external subscription details,current payment,next payment details
 *
 * check if our system has been has missed the update and process it as
 * subscription new payment
 * if external and internal data is same then put subscription on hold
 * and send email to customer
 */
export async function verifySubscriptionNextPayment() {
  const trx = await getTransaction();
  const subscriptions_for_new_payment_processing: ISubscriptionAndSubscriptionPayment[] =
    [];
  let subscribers_put_on_hold = 0;
  try {
    const subscriptions = await readPaidSubscriptionsToPutOnHoldForUpdate(trx);

    for (let i = 0; i < subscriptions.length; i++) {
      logger.debug(
        'checking subscription for on hold criteria',
        subscriptions[i]
      );
      let external_subscription_new_payment: ISubscriptionPayment | undefined;
      const subscription = subscriptions[i];

      if (
        subscription.current_cycle_payment.status !==
        SubscriptionPaymentStatus.SUCCESS
      ) {
        const external = await getSubscriptionPayments({
          external_subscription_id: subscription.external_subscription_id!,
        });

        external_subscription_new_payment = external.payments.find(
          payment =>
            payment.status === SubscriptionPaymentStatus.SUCCESS &&
            payment.cycle === subscription.current_cycle &&
            payment.amount === subscription.plan_amount
        );

        logger.debug(
          'external subscription new payment',
          external_subscription_new_payment
        );
      } else {
        const external = await getSubscriptionPayments({
          external_subscription_id: subscription.external_subscription_id!,
          last_external_payment_id:
            subscription.current_cycle_payment.external_payment_id,
        });

        external_subscription_new_payment = external.payments.find(
          payment =>
            payment.status === SubscriptionPaymentStatus.SUCCESS &&
            payment.cycle === subscription.current_cycle! + 1 &&
            payment.amount === subscription.plan_amount
        );
        logger.debug(
          'external subscription new payment',
          external_subscription_new_payment
        );
      }

      if (!external_subscription_new_payment) {
        const updated_subscription = await updateSubscription(
          trx,
          subscription.id!,
          {
            status: SubscriptionStatus.ON_HOLD,
          }
        );

        logger.debug('subscription put on hold', updated_subscription);
        subscribers_put_on_hold += 1;
        await sendEmail('SubscriptionOnHold', subscription.customer_email!, {
          subject: 'Your subscription has been put on hold',
          subscription_id: subscription.id,
          reason:
            'The subscription on hold due to insufficient funds or expiration of payment method',
        });
      } else {
        logger.debug(
          'subscription new payment received from external service',
          external_subscription_new_payment
        );
        const external_subscription = await getSubscription(
          subscription.external_subscription_id!
        );
        logger.debug('external subscription', external_subscription);
        subscriptions_for_new_payment_processing.push({
          subscription: external_subscription.subscription,
          subscription_payment: external_subscription_new_payment,
        } as ISubscriptionAndSubscriptionPayment);
      }
    }
    await trx.commit();
  } catch (error) {
    await trx.rollback();
    throw error;
  }

  for (let i = 0; i < subscriptions_for_new_payment_processing.length; i++) {
    await processSubscriptionNewPayment({
      subscription: subscriptions_for_new_payment_processing[i].subscription,
      subscription_payment:
        subscriptions_for_new_payment_processing[i].subscription_payment,
    });
  }

  await sendEmail(
    'AdminAlertEmailTemplate',
    await Globals.BACKEND_TEAM_EMAIL.get(),
    {
      subject: `Subscription Report ${moment().format(
        'dddd, MMMM Do YYYY, h:mm:ss a'
      )}`,
      application_name: Service.FOOD_CRON,
      error_details: {},
      priority: 'high',
      time: new Date().toDateString(),
      meta_details: {
        subscribers_put_on_hold,
        subscription_payments_processed:
          subscriptions_for_new_payment_processing.length,
      },
    }
  );
}

export async function autoSubscribeRestaurantsEligibleForFreePlan() {
  const trx = await getTransaction();
  const new_subscriptions: {restaurant_id: string; subscription_id: string}[] =
    [];
  try {
    const auto_subscription_max_limit = process.env.AUTO_SUBSCRIPTION_MAX_LIMIT
      ? +process.env.AUTO_SUBSCRIPTION_MAX_LIMIT
      : 3;
    const auto_subscription_plan_id = process.env.AUTO_SUBSCRIPTION_PLAN_ID;
    if (!auto_subscription_max_limit || !auto_subscription_plan_id) {
      logger.debug('auto resubscription plan envs not configured');
      await trx.rollback();
      return;
    }
    const plan = await readPlan(auto_subscription_plan_id);
    if (!plan) {
      logger.debug(
        'auto resubscription plan does not exist, can not auto subscribe'
      );
      await trx.rollback();
      return;
    }
    if (!plan.active) {
      logger.debug(
        'auto resubscription plan is not active, can not auto subscribe'
      );
      await trx.rollback();
      return;
    }
    const subscriptions = await readRestaurantsEligibleForAutoSubscribe(
      plan.id
    );
    for (let i = 0; i < subscriptions.length; i++) {
      const number_of_subscriptions =
        await getNumberOfRestaurantSubscriptionsCreatedUnderParticularPlan(
          subscriptions[i].restaurant_id!,
          plan.id
        );

      if (number_of_subscriptions < auto_subscription_max_limit) {
        if (
          subscriptions[i].status === SubscriptionStatus.ACTIVE ||
          subscriptions[i].status ===
            SubscriptionStatus.BANK_APPROVAL_PENDING ||
          subscriptions[i].status === SubscriptionStatus.FAILED_TO_CANCEL ||
          subscriptions[i].status === SubscriptionStatus.INITIALIZED ||
          subscriptions[i].status === SubscriptionStatus.ON_HOLD ||
          subscriptions[i].status === SubscriptionStatus.PENDING
        ) {
          logger.debug(
            'restaurant eligible for auto subscribe already has a ongoing subscription',
            subscriptions[i]
          );
          continue;
        } else {
          const subscription = await createFreeSubscription(
            trx,
            plan,
            {
              restaurant_id: subscriptions[i].restaurant_id,
              plan_id: subscriptions[i].plan_id,
              customer_name: subscriptions[i].customer_name,
              customer_email: subscriptions[i].customer_email,
              customer_phone: subscriptions[i].customer_phone,
            },
            false
          );
          new_subscriptions.push({
            restaurant_id: subscription.restaurant_id!,
            subscription_id: subscription.id!,
          });
        }
      } else {
        logger.debug(
          'restaurant max auto subscribe limit reached',
          subscriptions[i].restaurant_id
        );
        continue;
      }
    }
    await trx.commit();

    await sendEmail(
      'AdminAlertEmailTemplate',
      await Globals.BACKEND_TEAM_EMAIL.get(),
      {
        subject: `Resubscribed restaurants ${moment().format(
          'dddd, MMMM Do YYYY, h:mm:ss a'
        )}`,
        application_name: Service.FOOD_CRON,
        error_details: {},
        priority: 'high',
        time: new Date().toDateString(),
        meta_details: {
          new_subscriptions,
        },
      }
    );
  } catch (error) {
    await trx.rollback();
    throw error;
  }
}
