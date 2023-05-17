import {getTransaction} from '../../../../data/knex';
import {ISubscriptionAndSubscriptionPayment} from '../../../../utilities/sqs_manager';
import {
  SubscriptionAuthStatus,
  SubscriptionPaymentStatus,
  SubscriptionStatus,
} from '../enum';
import {
  insertSubscriptionPayment,
  readPlan,
  readSubscriptionForUpdate,
  readSubscriptionPaymentByCycleNoForUpdate,
  updateSubscription,
  updateSubscriptionPayment,
} from '../model';
import {
  ISubscription,
  ISubscriptionAuthorizationDetails,
  ISubscriptionPayment,
} from '../types';
import {sendEmail} from '../../../../utilities/utilFuncs';
import logger from '../../../../utilities/logger/winston_logger';
import {
  readRestaurantBasicByIdForUpdate,
  updateRestaurantBasic,
} from '../../restaurant/models';
import moment from 'moment';
import {Service} from '../../../../enum';
import Globals from '../../../../utilities/global_var/globals';

export async function processSubscriptionNewPayment(
  data: ISubscriptionAndSubscriptionPayment
) {
  const trx = await getTransaction();
  try {
    const internal_subscription = await readSubscriptionForUpdate(
      trx,
      data.subscription.id
    );
    if (!internal_subscription) {
      throw 'subscription not found in internal database';
    }
    logger.debug('internal subscription', internal_subscription);
    const plan = await readPlan(internal_subscription.plan_id!);
    if (!plan) {
      throw 'plan not found while processing subscription payment';
    }
    logger.debug('plan', plan);
    //* If we have received authorization payment details then
    //* save them in subscription table
    if (
      data.subscription_payment.status === SubscriptionPaymentStatus.SUCCESS &&
      data.subscription_payment.amount ===
        internal_subscription.authorization_amount
    ) {
      logger.debug('processing authorization payment details');
      const authorization_details_clone: ISubscriptionAuthorizationDetails =
        JSON.parse(JSON.stringify(internal_subscription.authorization_details));

      authorization_details_clone.authorization_payment_details = {
        external_payment_id: data.subscription_payment.external_payment_id,
        external_payment_order_id:
          data.subscription_payment.external_payment_order_id!,
        authorized_at: data.subscription_payment.transaction_time + '',
      };

      const updated_internal_subscription = await updateSubscription(
        trx,
        internal_subscription.id!,
        {
          authorization_status: SubscriptionAuthStatus.AUTHORIZED,
          authorization_details: authorization_details_clone,
        }
      );
      logger.debug(
        'updated internal subscription',
        updated_internal_subscription
      );
      await trx.commit();
      await sendEmail(
        'SubscriptionAuthorizationCompleted',
        internal_subscription.customer_email!,
        {
          subject: 'Subscription Authorized',
          subscription_id: internal_subscription.id,
          external_payment_id: data.subscription_payment.external_payment_id,
          external_payment_order_id:
            data.subscription_payment.external_payment_order_id,
          authorized_at: data.subscription_payment.transaction_time,
        }
      );
      return;
    } else if (
      data.subscription_payment.status === SubscriptionPaymentStatus.SUCCESS &&
      data.subscription_payment.amount === plan.amount
    ) {
      const last_cycle = internal_subscription.current_cycle!;
      const next_cycle = data.subscription_payment.cycle;

      logger.debug('subscription last cycle', last_cycle);
      logger.debug('subscription next cycle', next_cycle);

      let last_interval_subscription_payment;
      if (next_cycle > last_cycle) {
        last_interval_subscription_payment =
          await readSubscriptionPaymentByCycleNoForUpdate(
            trx,
            internal_subscription.id!,
            last_cycle
          );
      }
      logger.debug(
        'last interval subscription payment',
        last_interval_subscription_payment
      );

      const next_interval_subscription_payment =
        await readSubscriptionPaymentByCycleNoForUpdate(
          trx,
          internal_subscription.id!,
          next_cycle
        );
      logger.debug(
        'next interval subscription payment',
        next_interval_subscription_payment
      );

      const restaurant = await readRestaurantBasicByIdForUpdate(
        trx,
        internal_subscription.restaurant_id!
      );
      if (!restaurant) {
        throw 'restaurant not found while processing subscription payment';
      }
      logger.debug('restaurant', restaurant);

      const next_subscription_payment_on = moment(
        data.subscription.next_payment_on
      ).toDate();
      logger.debug(
        'next subscription payment on',
        next_subscription_payment_on
      );

      const restaurant_subscription_end_time = moment(
        data.subscription_payment.transaction_time
      )
        .add(1, plan.interval_type)
        .toDate();
      logger.debug(
        'restaurant subscription end time',
        restaurant_subscription_end_time
      );
      const email_template_data: {
        subscription_id: string;
        subscription_payment_id?: number;
        subscription_remaining_orders?: number;
        next_payment_on?: Date;
      } = {
        subscription_id: internal_subscription.id!,
      };
      if (
        next_interval_subscription_payment &&
        next_interval_subscription_payment.status !==
          SubscriptionPaymentStatus.SUCCESS
      ) {
        logger.debug('next interval subscription payment exists');
        const next_subscription_payment_updates: ISubscriptionPayment = {
          status: SubscriptionPaymentStatus.SUCCESS,
          currency: data.subscription_payment.currency,
          amount: data.subscription_payment.amount,
          retry_attempts: data.subscription_payment.retry_attempts,
          additional_details: {
            remarks: data.subscription_payment.remarks,
          },
        };
        if (data.subscription_payment.scheduled_on) {
          next_subscription_payment_updates.scheduled_on = moment(
            data.subscription_payment.scheduled_on
          ).toDate();
        }
        if (data.subscription_payment.transaction_time) {
          next_subscription_payment_updates.transaction_time = moment(
            data.subscription_payment.transaction_time
          ).toDate();
        }
        const updated_next_subscription_payment =
          await updateSubscriptionPayment(
            trx,
            next_interval_subscription_payment.id!,
            next_subscription_payment_updates
          );
        email_template_data.subscription_payment_id =
          updated_next_subscription_payment.id;
        logger.debug('updated subscription payment to success');
      } else {
        logger.debug('next interval subscription payment does not exists');
        const insert_next_subscription_payment: ISubscriptionPayment = {
          subscription_id: internal_subscription.id,
          external_payment_id: data.subscription_payment.external_payment_id,
          status: SubscriptionPaymentStatus.SUCCESS,
          no_of_grace_period_orders_allotted: plan.no_of_grace_period_orders,
          no_of_orders_bought: plan.no_of_orders,
          cycle: data.subscription_payment.cycle,
          currency: data.subscription_payment.currency,
          amount: data.subscription_payment.amount,
          retry_attempts: data.subscription_payment.retry_attempts,
          additional_details: {
            remarks: data.subscription_payment.remarks,
          },
        };
        if (data.subscription_payment.scheduled_on) {
          insert_next_subscription_payment.scheduled_on = moment(
            data.subscription_payment.scheduled_on
          ).toDate();
        }
        if (data.subscription_payment.transaction_time) {
          insert_next_subscription_payment.transaction_time = moment(
            data.subscription_payment.transaction_time
          ).toDate();
        }
        const next_subscription_payment = await insertSubscriptionPayment(
          trx,
          insert_next_subscription_payment
        );
        email_template_data.subscription_payment_id =
          next_subscription_payment.id;
        logger.debug('created new subscription payment record');
      }

      const subscription_updates: ISubscription = {};
      subscription_updates.next_payment_on = next_subscription_payment_on;
      subscription_updates.current_cycle = next_cycle;
      if (internal_subscription.status !== SubscriptionStatus.ACTIVE) {
        subscription_updates.status = SubscriptionStatus.ACTIVE;
      }

      //* If last subscription payment record exists then update order consumtion
      //* limit in previous payment record
      //* and then update the restaurant table with new order limit
      //* or else just simply update the restaurant table with new order limit

      if (last_interval_subscription_payment) {
        logger.debug(
          'last subscription payment record exists therefore updating consumption limit'
        );

        //* last subscription payment updates start
        const no_of_orders_consumed_in_last_subscription_interval =
          last_interval_subscription_payment.no_of_orders_bought! -
          restaurant.subscription_remaining_orders!;
        logger.debug(
          'no of orders consumed in last subscription interval',
          no_of_orders_consumed_in_last_subscription_interval
        );
        const updated_last_interval_subscription_payment =
          updateSubscriptionPayment(
            trx,
            last_interval_subscription_payment.id!,
            {
              no_of_orders_consumed:
                no_of_orders_consumed_in_last_subscription_interval,
            }
          );
        logger.debug(
          'updated last interval subscription payment',
          updated_last_interval_subscription_payment
        );
        //* last subscription payment updates end

        //* next subscription payment updates start
        const no_of_grace_period_orders_consumed_in_last_subscription_interval =
          last_interval_subscription_payment.no_of_grace_period_orders_allotted! -
          restaurant.subscription_grace_period_remaining_orders!;
        logger.debug(
          'no of grace period orders consumed in last subscription interval',
          no_of_grace_period_orders_consumed_in_last_subscription_interval
        );
        //* next subscription payment updates end

        //* restaurant updates start
        let restaurant_subscription_remaining_orders = plan.no_of_orders;
        restaurant_subscription_remaining_orders -=
          no_of_grace_period_orders_consumed_in_last_subscription_interval;
        if (restaurant_subscription_remaining_orders < 0) {
          restaurant_subscription_remaining_orders = 0;
        }
        logger.debug(
          'restaurant subscription remaining orders',
          restaurant_subscription_remaining_orders
        );
        const updated_restaurant = await updateRestaurantBasic(trx, {
          id: restaurant.id,
          subscription_id: internal_subscription.id,
          subscription_end_time: restaurant_subscription_end_time,
          subscription_remaining_orders:
            restaurant_subscription_remaining_orders,
          subscription_grace_period_remaining_orders:
            plan.no_of_grace_period_orders,
        });
        logger.debug('updated restaurant', updated_restaurant);
        //* restaurant updates end

        //*email updates start
        email_template_data.subscription_remaining_orders =
          updated_restaurant.subscription_remaining_orders;
        email_template_data.next_payment_on = next_subscription_payment_on;
        //*email updates end
      } else {
        logger.debug('last subscription payment record does not exists');

        let restaurant_subscription_remaining_orders;
        let restaurant_subscription_grace_period_remaining_orders;
        if (
          next_interval_subscription_payment &&
          // if payment status is pending then this cycle is in initial grace period
          next_interval_subscription_payment.status ===
            SubscriptionPaymentStatus.PENDING
        ) {
          //calculate orders consumed in pending payment state

          const subscription_grace_period_orders_consumed_in_pending_payment =
            next_interval_subscription_payment.no_of_grace_period_orders_allotted! -
            restaurant.subscription_grace_period_remaining_orders!;

          logger.debug(
            'subscription grace period orders consumed in pending payment',
            subscription_grace_period_orders_consumed_in_pending_payment
          );

          restaurant_subscription_grace_period_remaining_orders =
            next_interval_subscription_payment.no_of_grace_period_orders_allotted!;
          restaurant_subscription_remaining_orders =
            next_interval_subscription_payment.no_of_orders_bought! -
            subscription_grace_period_orders_consumed_in_pending_payment;
        } else {
          restaurant_subscription_remaining_orders = plan.no_of_orders;
          restaurant_subscription_grace_period_remaining_orders =
            plan.no_of_grace_period_orders;
        }

        //* restaurant updates start
        const updated_restaurant = await updateRestaurantBasic(trx, {
          id: restaurant.id,
          subscription_id: internal_subscription.id,
          subscription_end_time: restaurant_subscription_end_time,
          subscription_remaining_orders:
            restaurant_subscription_remaining_orders,
          subscription_grace_period_remaining_orders:
            restaurant_subscription_grace_period_remaining_orders,
        });
        logger.debug('updated restaurant', updated_restaurant);
        //* restaurant updates end

        //*email updates start
        email_template_data.subscription_remaining_orders =
          updated_restaurant.subscription_remaining_orders;
        email_template_data.next_payment_on = next_subscription_payment_on;
        //*email updates end
      }
      logger.debug('updating subscription table');
      const updated_internal_subscription = await updateSubscription(
        trx,
        internal_subscription.id!,
        subscription_updates
      );
      logger.debug(
        'updated internal subscription',
        updated_internal_subscription
      );

      await trx.commit(); //* update all tables
      logger.debug('all tables updated successfully');
      //* Inform subscription customer
      if (internal_subscription.status === SubscriptionStatus.ON_HOLD) {
        await sendEmail(
          'SubscriptionReactivated',
          internal_subscription.customer_email!,
          {
            subject: 'Congratuations your subscription has been reactivated!',
            subscription_id: internal_subscription.id,
            next_payment_on: next_subscription_payment_on.toDateString(),
          }
        );
      }
      await sendEmail(
        'SubscriptionNewPayment',
        internal_subscription.customer_email!,
        {
          subject: 'Subscription New Payment Received',
          ...email_template_data,
        }
      );
    } else {
      //send email to admin about invalid amount
      await trx.commit();
      await sendEmail(
        'AdminAlertEmailTemplate',
        await Globals.BACKEND_TEAM_EMAIL.get(),
        {
          subject: 'Invalid subscription new payment',
          application_name: Service.FOOD_API,
          error_details: 'Subscription new payment is invalid',
          priority: 'high',
          time: new Date().toDateString(),
          meta_details: data,
        }
      );
      logger.error('Invalid subscription new payment');
      return;
    }
  } catch (error) {
    await trx.rollback();
    throw error;
  }
}
