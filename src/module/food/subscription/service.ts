import {Service, ServiceTag} from '../../../enum';
import {
  PlanType,
  SubscriptionAuthStatus,
  SubscriptionPartner,
  SubscriptionPaymentStatus,
  SubscriptionStatus,
} from './enum';
import {
  filterSubscription,
  insertSubscription,
  insertSubscriptionPayment,
  readActivePlan,
  readPlan,
  readRestaurantActiveSubscription,
  readSubscription,
  readSubscriptionForUpdate,
  readSubscriptionPaymentByCycleNo,
  readSubscriptionPaymentByCycleNoForUpdate,
  readSubscriptionPaymentByStatus,
  updateSubscription,
  updateSubscriptionPayment,
} from './model';
import {
  ICancelSubscription,
  ICreateSubscription,
  IPlan,
  ISubscription,
} from './types';
import {v4 as uuidv4} from 'uuid';
import {
  cancelSubscription,
  createSubscription,
  manualSubscriptionActivation,
  retrySubscriptionPayment,
} from '../../../internal/subscription';
import {Knex} from 'knex';
import moment from 'moment';
import logger from '../../../utilities/logger/winston_logger';
import ResponseError from '../../../utilities/response_error';
import {isEmpty, sendEmail} from '../../../utilities/utilFuncs';
import {
  IRestaurant_Basic,
  readRestaurantBasicByIdForUpdate,
  updateRestaurantBasic,
} from '../restaurant/models';
import {getTransaction} from '../../../data/knex';
import Globals from '../../../utilities/global_var/globals';

export async function createNewSubscription(
  trx: Knex.Transaction,
  data: ICreateSubscription
): Promise<ISubscription> {
  const plan = await readActivePlan(data.plan_id!);
  if (!plan) {
    throw new ResponseError(400, [
      {
        message: 'Invalid plan id',
        code: 2002,
      },
    ]);
  }

  const existing_initiated_subscriptions = await filterSubscription({
    filter: {
      restaurant_id: data.restaurant_id,
      status: [
        SubscriptionStatus.ACTIVE,
        SubscriptionStatus.BANK_APPROVAL_PENDING,
        SubscriptionStatus.FAILED_TO_CANCEL,
        SubscriptionStatus.INITIALIZED,
        SubscriptionStatus.ON_HOLD,
        SubscriptionStatus.PENDING,
      ],
    },
  });
  if (existing_initiated_subscriptions.records.length > 0) {
    throw new ResponseError(400, [
      {
        message: 'Restaurant needs to cancel initiated subscriptions',
        code: 2006,
      },
    ]);
  }

  if (plan.type !== PlanType.FREE) {
    return await createPaidSubscription(trx, data);
  } else {
    return await createFreeSubscription(trx, plan, data);
  }
}

export async function createFreeSubscription(
  trx: Knex.Transaction,
  plan: IPlan,
  data: ICreateSubscription,
  send_email = true
): Promise<ISubscription> {
  const subscription_id = ServiceTag.FOOD_SERVICE_TAG + '_' + uuidv4();
  const expires_on = moment().add(1, plan.interval_type).toDate();
  logger.debug('expires on', expires_on);

  const subscription = await insertSubscription(
    {
      id: subscription_id,
      restaurant_id: data.restaurant_id,
      plan_id: data.plan_id,
      status: SubscriptionStatus.ACTIVE,
      description: 'subscription description',
      customer_name: data.customer_name,
      customer_email: data.customer_email,
      customer_phone: data.customer_phone,
      start_time: new Date(),
      end_time: expires_on,
    },
    trx
  );
  logger.debug('subscription created at food service', subscription);
  const restaurant = await readRestaurantBasicByIdForUpdate(
    trx,
    subscription.restaurant_id!
  );
  if (!restaurant) {
    throw 'restaurant not found while creating new free subscription';
  }
  logger.debug('restaurant', restaurant);
  if (
    restaurant.subscription_id &&
    restaurant.subscription_id !== subscription.id
  ) {
    await updateOldSubscriptionStats(
      restaurant.subscription_id,
      restaurant.subscription_remaining_orders!
    );
  }
  const free_subscription_payment = await insertSubscriptionPayment(trx, {
    subscription_id: subscription.id,
    status: SubscriptionPaymentStatus.SUCCESS,
    no_of_grace_period_orders_allotted: plan.no_of_grace_period_orders,
    no_of_orders_bought: plan.no_of_orders,
  });
  logger.debug('free subscription payment', free_subscription_payment);
  const updated_restaurant = await updateRestaurantBasic(trx, {
    id: restaurant.id,
    subscription_id: subscription.id,
    subscription_end_time: subscription.end_time,
    subscription_remaining_orders: plan.no_of_orders,
    subscription_grace_period_remaining_orders: plan.no_of_grace_period_orders,
  });
  logger.debug('updated restaurant', updated_restaurant);

  if (send_email) {
    await sendEmail('FreeSubscriptionCreated', subscription.customer_email!, {
      subject: 'Congratulations Your Free Subscription has been Activated!',
      subscription_id,
      subscription_remaining_orders:
        updated_restaurant.subscription_remaining_orders,
    });
  }
  return subscription;
}
async function createPaidSubscription(
  trx: Knex.Transaction,
  data: ICreateSubscription
) {
  const subscription_id = ServiceTag.FOOD_SERVICE_TAG + '_' + uuidv4();
  const first_charge_date = moment()
    .add(
      await Globals.SUBSCRIPTION_FIRST_PAYMENT_DATE_INTERVAL_IN_DAYS.get(),
      'days'
    )
    .toDate();
  const expires_on = moment()
    .add(await Globals.SUBSCRIPTION_EXPIRY_INTERVAL_IN_MONTHS.get(), 'months')
    .toDate();
  logger.debug('first charge date', first_charge_date);
  logger.debug('expires on', expires_on);

  /**
   * first_charge_date:
   *    first_charge_date will be current date + 2 days.
   *    It takes atleast 2 days for subscription to be authorized
   *
   *
   * end_time:
   *    end_time will be set with subscription expiry time
   *    end_time will be only updated if subscription is cancelled by user
   */
  const internal_system_subscription: ISubscription = {
    id: subscription_id,
    restaurant_id: data.restaurant_id,
    plan_id: data.plan_id,
    status: SubscriptionStatus.PENDING,
    partner: SubscriptionPartner.CASHFREE,
    description: 'subscription description',
    customer_name: data.customer_name,
    customer_email: data.customer_email,
    customer_phone: data.customer_phone,
    // start_time: will be set when subscription has been authorized
    end_time: expires_on,
    current_cycle: 0,
    next_payment_on: first_charge_date,
    authorization_status: SubscriptionAuthStatus.PENDING,
    authorization_amount:
      await Globals.SUBSCRIPTION_AUTHORIZATION_AMOUNT_IN_RUPEES.get(),
    additional_details: {
      return_url: await Globals.SUBSCRIPTION_RETURN_URL.get(),
    },
  };

  const subscription = await insertSubscription(internal_system_subscription);
  logger.debug('subscription created at food service', subscription);

  const external_system_subscription = await createSubscription({
    id: subscription_id,
    plan_id: data.plan_id!,
    customer_name: data.customer_name!,
    customer_email: data.customer_email!,
    customer_phone: data.customer_phone!,
    first_charge_date,
    authorization_amount:
      await Globals.SUBSCRIPTION_AUTHORIZATION_AMOUNT_IN_RUPEES.get(),
    expires_on,
    return_url: await Globals.SUBSCRIPTION_RETURN_URL.get(),
    description: 'subscription description',
  });
  logger.debug(
    'subscription created at external service',
    external_system_subscription
  );

  const update_internal_subscription = {
    status: SubscriptionStatus.INITIALIZED,
    external_subscription_id:
      external_system_subscription.subscription.external_subscription_id,
    authorization_details: {
      authorization_link:
        external_system_subscription.subscription.authorization_link,
    },
  };

  const updated_subscription = await updateSubscription(
    trx,
    subscription_id,
    update_internal_subscription
  );
  logger.debug('updated subscription', updated_subscription);

  await sendEmail(
    'SubscriptionAuthorizationPending',
    subscription.customer_email!,
    {
      subject: 'Complete subscription authorization',
      subscription_id,
      authorization_link:
        external_system_subscription.subscription.authorization_link,
    }
  );
  return updated_subscription;
}

export async function cancelRestaurantSubscription(data: ICancelSubscription) {
  const trx = await getTransaction();
  try {
    const subscription = await readSubscriptionForUpdate(
      trx,
      data.subscription_id
    );
    if (!subscription) {
      throw new ResponseError(400, [
        {
          message: 'Invalid subscription Id',
          code: 2003,
        },
      ]);
    }
    if (
      subscription.status === SubscriptionStatus.CANCELLED ||
      subscription.status === SubscriptionStatus.COMPLETED
    ) {
      throw new ResponseError(400, [
        {
          message: 'Subscription is already in a final state',
          code: 2004,
        },
      ]);
    }
    logger.debug('internal subscription', subscription);
    const plan = await readPlan(subscription.plan_id!);
    if (!plan) {
      throw new ResponseError(400, [
        {
          message: 'Invalid plan id',
          code: 2002,
        },
      ]);
    }
    if (plan.type !== PlanType.FREE) {
      return await cancelPaidSubscription(trx, subscription, data);
    } else {
      return await cancelFreeSubscription(trx, subscription, data);
    }
  } catch (error) {
    await trx.rollback();
    throw error;
  }
}

async function cancelPaidSubscription(
  trx: Knex.Transaction,
  subscription: ISubscription,
  data: ICancelSubscription
) {
  const external_subscription = await cancelSubscription(
    subscription.external_subscription_id!
  );
  logger.debug('external subscription details', external_subscription);
  if (
    external_subscription.subscription.status !== SubscriptionStatus.CANCELLED
  ) {
    const update_internal_subscription = await updateSubscription(
      trx,
      subscription.id!,
      {
        status: SubscriptionStatus.FAILED_TO_CANCEL,
        cancellation_details: {
          failed_to_cancel_reason: 'failed to cancel',
        },
      }
    );
    logger.debug('update internal subscription', update_internal_subscription);
    throw new ResponseError(400, [
      {
        message: 'Failed to cancel subscription, Please try again later',
        code: 2005,
      },
    ]);
  }
  const subscription_updates: ISubscription = {
    status: SubscriptionStatus.CANCELLED,
    end_time: new Date(),
    cancelled_by: data.cancelled_by,
    cancellation_user_id: data.cancellation_user_id,
    cancellation_details: {
      cancellation_reason: data.cancellation_reason,
    },
  };

  const email_template_data = {
    subscription_id: subscription.id,
    remaining_days: 0,
  };
  if (subscription.status === SubscriptionStatus.ACTIVE) {
    const plan = await readPlan(subscription.plan_id!);
    const subscription_payment_details = await readSubscriptionPaymentByCycleNo(
      subscription.id!,
      subscription.current_cycle!
    );
    logger.debug('subscription payment details', subscription_payment_details);
    if (
      subscription_payment_details &&
      subscription_payment_details.status === SubscriptionPaymentStatus.SUCCESS
    ) {
      const current_cycle_subscription_end_time = moment(
        subscription_payment_details.transaction_time
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
    }
  }
  const updated_subscription = await updateSubscription(
    trx,
    subscription.id!,
    subscription_updates
  );
  logger.debug('updated internal subscription', updated_subscription);

  await trx.commit();
  await sendEmail('SubscriptionCancelled', subscription.customer_email!, {
    subject: 'Your subscription has been cancelled',
    ...email_template_data,
  });
  return updated_subscription;
}
async function cancelFreeSubscription(
  trx: Knex.Transaction,
  subscription: ISubscription,
  data: ICancelSubscription
) {
  const restaurant = await readRestaurantBasicByIdForUpdate(
    trx,
    subscription.restaurant_id!
  );
  const subscription_last_payment =
    await readSubscriptionPaymentByCycleNoForUpdate(
      trx,
      subscription.id!,
      null
    );
  if (isEmpty(subscription_last_payment.no_of_orders_consumed)) {
    const no_of_orders_consumed_in_last_old_subscription_interval =
      subscription_last_payment.no_of_orders_bought! -
      restaurant.subscription_remaining_orders!;
    const updated_subscription_payment = await updateSubscriptionPayment(
      trx,
      subscription_last_payment.id!,
      {
        no_of_orders_consumed:
          no_of_orders_consumed_in_last_old_subscription_interval,
      }
    );
    logger.debug('updated subscription payment', updated_subscription_payment);
  }
  const updated_subscription = await updateSubscription(trx, subscription.id!, {
    status: SubscriptionStatus.CANCELLED,
    end_time: new Date(),
    cancelled_by: data.cancelled_by,
    cancellation_user_id: data.cancellation_user_id,
    cancellation_details: {
      cancellation_reason: data.cancellation_reason,
    },
  });
  logger.debug('updated internal subscription', updated_subscription);

  const updated_restaurant = await updateRestaurantBasic(trx, {
    id: subscription.restaurant_id!,
    subscription_end_time: new Date(),
  });
  logger.debug('updated restaurant subscription', updated_restaurant);

  await trx.commit();
  await sendEmail('SubscriptionCancelled', subscription.customer_email!, {
    subject: 'Your subscription has been cancelled',
    subscription_id: subscription.id,
    remaining_days: 0,
  });
  return updated_subscription;
}

export async function updateSubscriptionStatsInRestaurantBasic(
  order_id: number,
  restaurant_id: string
) {
  logger.debug('updating restaurant subscription stats in restaurant basic', {
    order_id,
    restaurant_id,
  });
  const trx = await getTransaction();
  try {
    const restaurant = await readRestaurantBasicByIdForUpdate(
      trx,
      restaurant_id
    );

    logger.debug('restaurant', restaurant);
    if (
      isEmpty(restaurant.subscription_end_time) ||
      isEmpty(restaurant.subscription_remaining_orders) ||
      isEmpty(restaurant.subscription_grace_period_remaining_orders) ||
      isEmpty(restaurant.subscription_id)
    ) {
      logger.debug('restaurant subscription details not available');
      await trx.commit();
      await sendEmail(
        'AdminAlertEmailTemplate',
        await Globals.BACKEND_TEAM_EMAIL.get(),
        {
          subject:
            'Suspicious activity while updating subscription stats for restaurant',
          application_name: Service.FOOD_API,
          error_details: 'Restaurant subscription details are not available',
          priority: 'high',
          time: new Date().toDateString(),
          meta_details: {
            order_id: order_id,
            restaurant_id: restaurant.id,
            subscription_id: restaurant.subscription_id,
          },
        }
      );
      return;
    }
    const current_time = new Date();
    const restaurant_subscription_grace_period_end_time = moment(
      restaurant.subscription_end_time
    )
      .add(
        await Globals.SUBSCRIPTION_END_TIME_GRACE_PERIOD_IN_DAYS.get(),
        'days'
      )
      .toDate();
    logger.debug(
      'restaurant subscription grace period end time',
      restaurant_subscription_grace_period_end_time
    );

    if (restaurant.subscription_end_time! > current_time) {
      logger.debug('restaurant is in active subscription payment end time');
      if (restaurant.subscription_remaining_orders! > 0) {
        const restaurant_updates: IRestaurant_Basic = {id: restaurant_id};
        const updated_subscription_remaining_orders =
          restaurant.subscription_remaining_orders! - 1;

        restaurant_updates.subscription_remaining_orders =
          updated_subscription_remaining_orders;

        const updated_restaurant = await updateRestaurantBasic(
          trx,
          restaurant_updates
        );
        logger.info(
          'restaurant subscription stats updated',
          updated_restaurant
        );

        if (updated_subscription_remaining_orders === 0) {
          const subscription = await readRestaurantActiveSubscription(
            restaurant_id
          );
          await sendEmail(
            'OutOfSubscriptionOrderLimit',
            subscription.customer_email!,
            {
              subject: 'Out of subscription order limit. Please topup',
              subscription_id: restaurant.subscription_id,
            }
          );
        }
      } else {
        //* we will also reduce grace period order limit by 1 .
        //* because current order can not be reduced by subscription_remaining_orders

        if (restaurant.subscription_grace_period_remaining_orders) {
          logger.debug(
            'restaurant subscription is active but order limit is zero, reducing grace limit for this order'
          );
          const restaurant_updates: IRestaurant_Basic = {id: restaurant_id};
          const updated_subscription_grace_period_remaining_orders =
            restaurant.subscription_grace_period_remaining_orders! - 1;

          restaurant_updates.subscription_grace_period_remaining_orders =
            updated_subscription_grace_period_remaining_orders;

          const updated_restaurant = await updateRestaurantBasic(
            trx,
            restaurant_updates
          );
          logger.info(
            'restaurant subscription stats updated',
            updated_restaurant
          );
        } else {
          logger.error(
            'restaurant is out of order limit and grace limit in active subscription still receiving orders'
          );
          await sendEmail(
            'AdminAlertEmailTemplate',
            await Globals.BACKEND_TEAM_EMAIL.get(),
            {
              subject:
                'Suspicious activity while updating subscription stats for restaurant',
              application_name: 'food-api',
              error_details:
                'restaurant is out of order limit and grace limit in active subscription still receiving orders',
              priority: 'high',
              time: new Date().toDateString(),
              meta_details: {
                order_id: order_id,
                restaurant_id: restaurant.id,
              },
            }
          );
        }
        //send email to vendor saying top up needed
        const subscription = await readRestaurantActiveSubscription(
          restaurant_id
        );
        await sendEmail(
          'OutOfSubscriptionOrderLimit',
          subscription.customer_email!,
          {
            subject: 'Out of subscription order limit. Please topup',
            subscription_id: restaurant.subscription_id,
          }
        );
      }
    } else if (
      restaurant.subscription_end_time! < current_time && //! restaurant is in grace period
      restaurant_subscription_grace_period_end_time > current_time
    ) {
      //if restaurant is in grace period then deduct orders from grace order limit only.
      logger.debug('restaurant is in grace period');
      if (restaurant.subscription_grace_period_remaining_orders! > 0) {
        const restaurant_updates: IRestaurant_Basic = {id: restaurant_id};
        const updated_subscription_grace_period_remaining_orders =
          restaurant.subscription_grace_period_remaining_orders! - 1;

        restaurant_updates.subscription_grace_period_remaining_orders =
          updated_subscription_grace_period_remaining_orders;

        const updated_restaurant = await updateRestaurantBasic(
          trx,
          restaurant_updates
        );
        logger.info(
          'restaurant subscription stats updated',
          updated_restaurant
        );
      } else {
        //send email to vendor saying out of grace period orders

        const subscription = await readRestaurantActiveSubscription(
          restaurant_id
        );
        await sendEmail(
          'AdminAlertEmailTemplate',
          subscription.customer_email!,
          {
            subject: 'Out of grace period orders in current subscription',
            application_name: 'food-api',
            error_details: 'please check your subscription payment',
            priority: 'high',
            time: new Date().toDateString(),
            meta_details: {
              order_id: order_id,
              restaurant_id: restaurant.id,
            },
          }
        );
      }
    } else {
      //send email to admin
      await sendEmail(
        'AdminAlertEmailTemplate',
        await Globals.BACKEND_TEAM_EMAIL.get(),
        {
          subject:
            'Suspicious activity while updating subscription stats for restaurant',
          application_name: 'food-api',
          error_details:
            'restaurant grace period has been ended still receiving orders from that restaurant',
          priority: 'high',
          time: new Date().toDateString(),
          meta_details: {
            order_id: order_id,
            restaurant_id: restaurant.id,
          },
        }
      );
    }

    await trx.commit();
  } catch (error) {
    await trx.rollback();
    throw error;
  }
}

export async function retryLastFailedSubscriptionPayment(
  subscription_id: string,
  next_payment_on?: Date
): Promise<ISubscription> {
  const trx = await getTransaction();
  try {
    //if subscription last payment was failed then subscription status will go in onhold state
    const subscription = await readSubscriptionForUpdate(trx, subscription_id);
    if (!subscription) {
      throw new ResponseError(400, [
        {
          message: 'Invalid Subscription Id',
          code: 2003,
        },
      ]);
    }
    if (subscription.status !== SubscriptionStatus.ON_HOLD) {
      throw new ResponseError(400, [
        {
          message: 'Subscription is not on hold',
          code: 2010,
        },
      ]);
    }
    logger.debug('subscription details', subscription);
    const plan = await readPlan(subscription.plan_id!);
    if (!plan) {
      throw new ResponseError(400, [
        {
          message: 'Invalid plan id',
          code: 2002,
        },
      ]);
    }
    logger.debug('plan details', plan);
    if (plan.type === PlanType.FREE) {
      throw new ResponseError(400, [
        {
          message:
            'Retry payment feature is not applicable for free plan subscriptions',
          code: 2007,
        },
      ]);
    }

    //current cycle only gets updated when we get a successful payment
    const last_failed_subscription_payment =
      await readSubscriptionPaymentByStatus(trx, subscription.id!, [
        SubscriptionPaymentStatus.FAILED,
        SubscriptionPaymentStatus.PENDING,
      ]);

    if (!last_failed_subscription_payment) {
      throw new ResponseError(400, [
        {message: 'Can not find last failed subscription payment', code: 2014},
      ]);
    }

    if (last_failed_subscription_payment.retry_attempts === 3) {
      throw new ResponseError(400, [
        {
          message:
            'Subscription has reached maximum retry limit, Please contact admin',
          code: 2008,
        },
      ]);
    }

    //put retry payment request to external service
    const external_service_retry_payment_response =
      await retrySubscriptionPayment({
        external_subscription_id: subscription.external_subscription_id!,
        next_payment_on: next_payment_on,
      });
    logger.debug(
      'external service retry payment response',
      external_service_retry_payment_response
    );
    const updated_subscription_payment = await updateSubscriptionPayment(
      trx,
      last_failed_subscription_payment.id!,
      {
        retry_attempts:
          external_service_retry_payment_response.subscription_payment
            .retry_attempts,
      }
    );

    const updated_subscription = await updateSubscription(
      trx,
      subscription.id!,
      {
        next_payment_on:
          external_service_retry_payment_response.subscription.next_payment_on,
      }
    );

    logger.debug('updated subscription payment', updated_subscription_payment);
    await trx.commit();
    return updated_subscription;
  } catch (error) {
    await trx.rollback();
    throw error;
  }
}

export async function manuallyActivateSubscription(
  subscription_id: string,
  next_payment_on?: Date
): Promise<ISubscription> {
  const trx = await getTransaction();
  try {
    //if subscription last payment was failed then subscription status will go in onhold state
    const subscription = await readSubscriptionForUpdate(trx, subscription_id);
    if (!subscription) {
      throw new ResponseError(400, [
        {
          message: 'Invalid Subscription Id',
          code: 2003,
        },
      ]);
    }
    if (subscription.status !== SubscriptionStatus.ON_HOLD) {
      throw new ResponseError(400, [
        {
          message: 'Subscription is not on hold',
          code: 2010,
        },
      ]);
    }

    const plan = await readActivePlan(subscription.plan_id!);
    if (!plan) {
      throw new ResponseError(400, [
        {
          message: 'Invalid plan id',
          code: 2002,
        },
      ]);
    }
    if (plan.type === PlanType.FREE) {
      throw new ResponseError(400, [
        {
          message:
            'Manual subscription activation feature is not applicable for free plan subscriptions',
          code: 2007,
        },
      ]);
    }

    const external_subscription_activation_response =
      await manualSubscriptionActivation({
        external_subscription_id: subscription.external_subscription_id!,
        next_payment_on: next_payment_on,
      });
    logger.debug(
      'external subscription activation response',
      external_subscription_activation_response
    );

    const updated_subscription = await updateSubscription(
      trx,
      subscription.id!,
      {
        status: SubscriptionStatus.ACTIVE,
        next_payment_on:
          external_subscription_activation_response.subscription
            .next_payment_on,
      }
    );

    logger.debug('updated subscription', updated_subscription);
    await trx.commit();
    await sendEmail('SubscriptionReactivated', subscription.customer_email!, {
      subject: 'Your subscription has been reactivated by speedyy',
      subscription_id: subscription.id,
      next_payment_on: updated_subscription.next_payment_on,
    });
    return updated_subscription;
  } catch (error) {
    await trx.rollback();
    throw error;
  }
}

export async function updateOldSubscriptionStats(
  subscription_id: string,
  subscription_remaining_orders: number
) {
  const trx = await getTransaction();
  try {
    const old_subscription = await readSubscription(subscription_id);
    const old_subscription_last_payment =
      await readSubscriptionPaymentByCycleNoForUpdate(
        trx,
        subscription_id,
        isEmpty(old_subscription.current_cycle)
          ? null
          : old_subscription.current_cycle!
      );
    if (isEmpty(old_subscription_last_payment.no_of_orders_consumed)) {
      const no_of_orders_consumed_in_last_old_subscription_interval =
        old_subscription_last_payment.no_of_orders_bought! -
        subscription_remaining_orders;

      const updated_old_subscription_payment = await updateSubscriptionPayment(
        trx,
        old_subscription_last_payment.id!,
        {
          no_of_orders_consumed:
            no_of_orders_consumed_in_last_old_subscription_interval,
        }
      );
      logger.debug(
        'updated old subscription payment',
        updated_old_subscription_payment
      );
      await trx.commit();
    } else {
      await trx.rollback();
    }
  } catch (error) {
    await trx.rollback();
    throw error;
  }
}
