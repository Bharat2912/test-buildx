import moment from 'moment';
import {DB} from '../../data/knex';
import {IRestaurant_Basic} from '../../module/food/restaurant/models';
import {
  PlanTable,
  SubscriptionPaymentTable,
  SubscriptionTable,
} from '../../module/food/subscription/constants';
import {
  PlanCategory,
  PlanIntervalType,
  PlanType,
  SubscriptionAuthStatus,
  SubscriptionPartner,
  SubscriptionPaymentStatus,
  SubscriptionStatus,
} from '../../module/food/subscription/enum';
import {
  IPlan,
  ISubscription,
  ISubscriptionPayment,
} from '../../module/food/subscription/types';
import {v4 as uuidv4} from 'uuid';
import {ServiceTag} from '../../enum';
export async function createTestPlan(params: IPlan): Promise<IPlan> {
  const result = await DB.write(PlanTable.TableName)
    .insert(params)
    .returning('*');
  return result[0];
}

export async function createTestSubscription(
  params: ISubscription
): Promise<ISubscription> {
  const result = await DB.write(SubscriptionTable.TableName)
    .insert(params)
    .returning('*');
  return result[0];
}

export async function createTestSubscriptionPayment(
  params: ISubscriptionPayment
): Promise<ISubscriptionPayment> {
  const result = await DB.write(SubscriptionPaymentTable.TableName)
    .insert(params)
    .returning('*');
  return result[0];
}

export async function updateTestRestaurant(
  params: IRestaurant_Basic
): Promise<IRestaurant_Basic> {
  const result = await DB.write('restaurant')
    .update(params)
    .returning('*')
    .where({id: params.id});
  return result[0];
}

export async function createRestaurantTestSubscription(restaurant_id: string) {
  const plan = await createTestPlan({
    id: ServiceTag.FOOD_SERVICE_TAG + '_' + uuidv4(),
    name: 'Paid Plan',
    type: PlanType.PERIODIC,
    category: PlanCategory.BASIC,
    no_of_orders: 200,
    no_of_grace_period_orders: 5,
    amount: 100,
    interval_type: PlanIntervalType.DAY,
    intervals: 1,
    max_cycles: 100,
    description: 'description',
    active: true,
    terms_and_conditions: 'terms_and_conditions',
    image: {},
    created_at: new Date(),
    updated_at: new Date(),
  });

  const subscription = await createTestSubscription({
    id: ServiceTag.FOOD_SERVICE_TAG + '_' + uuidv4(),
    external_subscription_id: '99602',
    restaurant_id: restaurant_id,
    plan_id: plan.id,
    status: SubscriptionStatus.INITIALIZED,
    mode: 'NPC',
    authorization_status: SubscriptionAuthStatus.PENDING,
    authorization_amount: 10,
    authorization_details: {
      authorization_link: 'https://cfre.in/mi3uhev',
    },
    partner: SubscriptionPartner.CASHFREE,
    description: 'subscription description',
    customer_name: 'Amogh Chavan',
    customer_email: 'amogh.c@speedyy.com',
    customer_phone: '9819997648',
    start_time: moment().toDate(),
    end_time: moment().add(1, 'year').toDate(),
    current_cycle: 0,
    next_payment_on: moment().add(1, 'minute').toDate(),
    additional_details: {
      return_url: 'https://vendor.dev.speedyy.com/login',
    },
    created_at: new Date(),
    updated_at: new Date(),
  });

  await createTestSubscriptionPayment({
    subscription_id: subscription.id,
    external_payment_id: '213133',
    status: SubscriptionPaymentStatus.SUCCESS,
    no_of_grace_period_orders_allotted: 50,
    no_of_orders_bought: 200,
    cycle: 0,
    currency: 'INR',
    amount: plan.amount,
    scheduled_on: new Date(),
    transaction_time: new Date(),
  });

  await updateTestRestaurant({
    id: restaurant_id,
    subscription_id: subscription.id,
    subscription_remaining_orders: 200,
    subscription_grace_period_remaining_orders: 50,
    subscription_end_time: moment().add(1, plan.interval_type).toDate(),
  });
}
