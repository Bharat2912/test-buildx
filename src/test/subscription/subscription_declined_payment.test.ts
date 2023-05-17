import {initGlobalServices} from '../utils/init';
import {loadMockSeedData, testCasesClosingTasks} from '../utils/utils';
import {DB} from '../../data/knex';
import {
  PlanCategory,
  PlanIntervalType,
  PlanType,
  SubscriptionAuthStatus,
  SubscriptionPartner,
  SubscriptionPaymentStatus,
  SubscriptionStatus,
} from '../../module/food/subscription/enum';
import {mockSendEmail} from '../utils/mock_services';
import {IRestaurant_Basic} from '../../module/food/restaurant/models';
import {
  ISubscription,
  ISubscriptionPayment,
} from '../../module/food/subscription/types';
import {
  createTestPlan,
  createTestSubscription,
  createTestSubscriptionPayment,
  updateTestRestaurant,
} from './utlis';
import moment from 'moment';
import {SubscriptionTable} from '../../module/food/subscription/constants';
import {processSubscriptionPaymentDeclined} from '../../module/food/subscription/worker_services/subscription_payment_declined';

const restaurant_id = 'b0909e52-a731-4665-a791-ee6479008805';

beforeAll(async () => {
  await initGlobalServices();

  await loadMockSeedData('restaurant');
});

afterAll(async () => {
  await testCasesClosingTasks();
});

test('SUBSCRIPTION PAYMENT DECLINED', async () => {
  const plan = await createTestPlan({
    id: 'RES_e6372ad4-0a69-4dc1-a936-26393cd4b100',
    name: 'Paid Plan',
    type: PlanType.PERIODIC,
    category: PlanCategory.BASIC,
    no_of_orders: 20,
    no_of_grace_period_orders: 6,
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
    id: 'RES_5959e9f7-565d-475a-822b-80a8fd4f0c3a',
    external_subscription_id: '99602',
    restaurant_id: restaurant_id,
    plan_id: plan.id,
    status: SubscriptionStatus.ACTIVE,
    mode: 'NPC',
    authorization_status: SubscriptionAuthStatus.AUTHORIZED,
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

  // const old_subscription_payment =
  await createTestSubscriptionPayment({
    subscription_id: subscription.id,
    external_payment_id: '213133',
    status: SubscriptionPaymentStatus.SUCCESS,
    no_of_grace_period_orders_allotted: 6,
    no_of_orders_bought: 20,
    cycle: 0,
    currency: 'INR',
    amount: plan.amount,
    scheduled_on: new Date(),
    transaction_time: new Date(),
  });

  // const updated_restaurant =
  await updateTestRestaurant({
    id: restaurant_id,
    subscription_id: subscription.id,
    subscription_remaining_orders: 0, // 20 - 20 = 0
    subscription_grace_period_remaining_orders: 3, // 6 - 3 = 3
    subscription_end_time: new Date(),
  });

  //seed data loaded for test case
  //call worker

  const mock_send_email = mockSendEmail();

  await processSubscriptionPaymentDeclined({
    subscription: {
      id: subscription.id!,
      external_subscription_id: subscription.external_subscription_id!,
      plan_id: plan.id,
      customer_name: subscription.customer_name!,
      customer_email: subscription.customer_email!,
      customer_phone: subscription.customer_phone!,
      mode: subscription.mode!,
      authorization_link: 'https://cfre.in/mi3uhev',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      status: 'onhold' as any,
      first_charge_date: moment().add(2, 'days').toDate(),
      current_cycle: 1,
      next_payment_on: moment().add(2, 'days').toDate(),
      bank_account_number: 'bank_account_number',
      bank_account_holder: 'bank_account_holder',
      umrn: 'umrn',
      created_at: new Date(),
    },
    subscription_payment: {
      external_payment_id: '1233234',
      external_subscription_id: subscription.external_subscription_id!,
      external_payment_order_id: '123_ORDER',
      reference_id: 12313,
      currency: 'INR',
      amount: plan.amount,
      cycle: 1,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      status: SubscriptionPaymentStatus.FAILED as any,
      remarks: 'payment failed',
      scheduled_on: new Date(),
      transaction_time: new Date(),
      retry_attempts: 0,
      failure_reason: 'low bank account balance',
    },
  });
  expect(mock_send_email).toBeCalledTimes(1);

  //check if subscription payment record is created or not
  const subscription_old_payment: ISubscriptionPayment = (
    await DB.read.from('subscription_payment').where({
      subscription_id: subscription.id,
      id: 1,
    })
  )[0];
  expect(subscription_old_payment.status).toBe(
    SubscriptionPaymentStatus.SUCCESS
  );
  expect(subscription_old_payment.no_of_orders_bought).toBe(20);
  expect(subscription_old_payment.no_of_grace_period_orders_allotted).toBe(6);
  expect(subscription_old_payment.no_of_orders_consumed).toBeNull();

  const subscription_new_failed_payment: ISubscriptionPayment = (
    await DB.read.from('subscription_payment').where({
      subscription_id: subscription.id,
      id: 2,
    })
  )[0];
  expect(subscription_new_failed_payment.status).toBe(
    SubscriptionPaymentStatus.FAILED
  );
  expect(subscription_new_failed_payment.no_of_orders_bought).toBe(20);
  expect(
    subscription_new_failed_payment.no_of_grace_period_orders_allotted
  ).toBe(6);
  expect(subscription_new_failed_payment.no_of_orders_consumed).toBeNull();

  const updated_restaurant_with_failed_benifits: IRestaurant_Basic = (
    await DB.read.from('restaurant').where({id: restaurant_id})
  )[0];
  expect(
    updated_restaurant_with_failed_benifits.subscription_end_time
  ).not.toBeNull();
  expect(
    updated_restaurant_with_failed_benifits.subscription_remaining_orders
  ).toBe(0);
  expect(
    updated_restaurant_with_failed_benifits.subscription_grace_period_remaining_orders
  ).toBe(3);
  expect(updated_restaurant_with_failed_benifits.subscription_id).toBe(
    subscription.id
  );

  const updated_subsription: ISubscription = (
    await DB.read.from(SubscriptionTable.TableName).where({id: subscription.id})
  )[0];
  expect(updated_subsription.current_cycle).toBe(subscription.current_cycle!);

  const subscription_payments: ISubscriptionPayment[] = await DB.read
    .from('subscription_payment')
    .where({
      subscription_id: subscription.id,
    });
  expect(subscription_payments).not.toBeNull();
  expect(subscription_payments.length).toBe(2);
});
