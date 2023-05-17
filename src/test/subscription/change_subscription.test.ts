import request from 'supertest';
import {createTestServer} from '../utils/init';
import {Application} from 'express';
import {
  signToken,
  loadMockSeedData,
  testCasesClosingTasks,
} from '../utils/utils';
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
import {processSubscriptionStatusChange} from '../../module/food/subscription/worker_services/subscription_status_change';
import {
  createTestPlan,
  createTestSubscription,
  createTestSubscriptionPayment,
  updateTestRestaurant,
} from './utlis';
import moment from 'moment';
import {SubscriptionPaymentTable} from '../../module/food/subscription/constants';
import {
  mockCancelSubscriptionAtExternalService,
  mockCreateSubscriptionAtExternalService,
} from './mocks';

let server: Application;
let vendor_token: string;
const restaurant_id = 'b0909e52-a731-4665-a791-ee6479008805';

beforeAll(async () => {
  server = await createTestServer();

  await loadMockSeedData('restaurant');
  vendor_token = signToken({
    id: '33c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
    data: {
      type: 'restaurant',
      outlet_id: restaurant_id,
      force_reset_password: false,
    },
    user_type: 'vendor',
  });
});

afterAll(async () => {
  await testCasesClosingTasks();
});

test('CHANGE SUBSCRIPTION TEST', async () => {
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

  const old_subscription = await createTestSubscription({
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

  await createTestSubscriptionPayment({
    subscription_id: old_subscription.id,
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

  await updateTestRestaurant({
    id: restaurant_id,
    subscription_id: old_subscription.id,
    subscription_remaining_orders: 0, // 20 - 20 = 0
    subscription_grace_period_remaining_orders: 3, // 6 - 3 = 3
    subscription_end_time: new Date(),
  });

  //*MOCKS
  const mock_send_email = mockSendEmail();
  const mock_cancel_external_subscription =
    mockCancelSubscriptionAtExternalService(plan.id);

  const cancel_subscription_response = await request(server)
    .post(`/food/vendor/subscription/${old_subscription.id}/cancel`)
    .set('Authorization', `Bearer ${vendor_token}`)
    .send({
      cancellation_reason: 'i want to change my bank account',
    });
  expect(cancel_subscription_response.body.statusCode).toBe(200);
  expect(cancel_subscription_response.body.status).toBe(true);
  expect(cancel_subscription_response.body.result).toHaveProperty(
    'subscription'
  );
  expect(cancel_subscription_response.body.result.subscription.status).toBe(
    SubscriptionStatus.CANCELLED
  );
  expect(mock_cancel_external_subscription).toBeCalledTimes(1);
  expect(mock_send_email).toBeCalledTimes(1);

  //*MOCKS
  const mock_create_external_subscription =
    mockCreateSubscriptionAtExternalService(plan.id);

  const create_subscription_response = await request(server)
    .post('/food/vendor/subscription')
    .set('Authorization', `Bearer ${vendor_token}`)
    .send({
      plan_id: plan.id,
      customer_name: 'Jhon stevens',
      customer_email: 'jhon.s@speedyy.com',
      customer_phone: '1234567890',
    });

  expect(create_subscription_response.body.statusCode).toBe(200);
  expect(create_subscription_response.body.status).toBe(true);
  expect(create_subscription_response.body.result).toHaveProperty(
    'subscription'
  );
  expect(mock_create_external_subscription).toBeCalledTimes(1);
  expect(mock_send_email).toBeCalledTimes(2);
  const new_subscription =
    create_subscription_response.body.result.subscription;

  await processSubscriptionStatusChange({
    subscription: {
      id: new_subscription.id!,
      external_subscription_id: new_subscription.external_subscription_id!,
      plan_id: plan.id,
      customer_name: new_subscription.customer_name!,
      customer_email: new_subscription.customer_email!,
      customer_phone: new_subscription.customer_phone!,
      mode: new_subscription.mode!,
      authorization_link: 'https://cfre.in/mi3uhev',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      status: 'active' as any,
      first_charge_date: moment().add(2, 'days').toDate(),
      current_cycle: 0,
      next_payment_on: moment().add(2, 'days').toDate(),
      bank_account_number: 'bank_account_number',
      bank_account_holder: 'bank_account_holder',
      umrn: 'umrn',
      created_at: new Date(),
    },
  });
  expect(mock_send_email).toBeCalledTimes(3);

  const old_subscription_payment_details = (
    await DB.read.select('*').from(SubscriptionPaymentTable.TableName).where({
      subscription_id: old_subscription.id,
      status: SubscriptionPaymentStatus.SUCCESS,
      cycle: 0,
    })
  )[0];
  expect(old_subscription_payment_details.no_of_orders_consumed).toBe(20);

  //check if restaurant benefits are updated or not
  const new_benifits_restaurant: IRestaurant_Basic = (
    await DB.read.from('restaurant').where({id: restaurant_id})
  )[0];
  expect(
    moment(new_benifits_restaurant.subscription_end_time).unix()
  ).not.toBeGreaterThan(moment().add(3, 'days').unix());
  expect(new_benifits_restaurant.subscription_remaining_orders).toBe(20);
  expect(
    new_benifits_restaurant.subscription_grace_period_remaining_orders
  ).toBe(6);
  expect(new_benifits_restaurant.subscription_id).toBe(new_subscription.id);
});
