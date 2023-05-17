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
  SubscriptionPaymentStatus,
} from '../../module/food/subscription/enum';
import {mockgetAdminDetails, mockSendEmail} from '../utils/mock_services';
import {IRestaurant_Basic} from '../../module/food/restaurant/models';
import {ISubscriptionPayment} from '../../module/food/subscription/types';
jest.mock('axios');
let server: Application;
let admin_token: string;
let vendor_token: string;
const restaurant_id = 'b0909e52-a731-4665-a791-ee6479008805';

beforeAll(async () => {
  server = await createTestServer();

  await loadMockSeedData('restaurant');

  admin_token = signToken({
    id: '64bfafb6-c273-4b64-a0fc-ca981f5819eb',
    user_type: 'admin',
  });
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

test('CREATE FREE SUBSCRIPTION AS ADMIN', async () => {
  //mocks
  const mock_get_admin_details = mockgetAdminDetails();
  const mock_send_email = mockSendEmail();

  //create new plan with post api
  const create_plan_response = await request(server)
    .post('/food/admin/subscription/plan')
    .set('Authorization', `Bearer ${admin_token}`)
    .send({
      name: 'Free Plan',
      type: PlanType.FREE,
      category: PlanCategory.BASIC,
      interval_type: PlanIntervalType.DAY,
      description: 'description of plan',
      no_of_orders: 5,
      no_of_grace_period_orders: 2,
      terms_and_conditions: 'terms_and_conditions',
    });
  expect(create_plan_response.body.statusCode).toBe(200);
  expect(create_plan_response.body.status).toBe(true);
  expect(create_plan_response.body.result).toHaveProperty('plan_id');
  expect(mock_get_admin_details).toHaveBeenCalledTimes(1);

  //create subscription
  const create_subscription_response = await request(server)
    .post('/food/admin/subscription')
    .set('Authorization', `Bearer ${admin_token}`)
    .send({
      restaurant_id: restaurant_id,
      plan_id: create_plan_response.body.result.plan_id,
      customer_name: 'Jhon stevens',
      customer_email: 'jhon.s@speedyy.com',
      customer_phone: '1234567890',
    });

  expect(create_subscription_response.body.statusCode).toBe(200);
  expect(create_subscription_response.body.status).toBe(true);
  expect(create_subscription_response.body.result).toHaveProperty(
    'subscription'
  );
  expect(mock_get_admin_details).toHaveBeenCalledTimes(2);
  expect(mock_send_email).toHaveBeenCalledTimes(1);

  /*==== INVALID PLAN NAME AS search_text ====*/
  const filter_plan_fail_response = await request(server)
    .post('/food/admin/subscription/filter')
    .set('Authorization', `Bearer ${admin_token}`)
    .send({
      search_text: "Speedyy's plan",
      filter: {},
    });
  expect(filter_plan_fail_response.body.statusCode).toBe(200);
  expect(filter_plan_fail_response.body.status).toBe(true);
  expect(filter_plan_fail_response.body.result.total_records).toEqual(0);
  expect(mock_get_admin_details).toHaveBeenCalledTimes(3);

  /*=== VALID PLAN NAME AS search_text ====*/
  const filter_plan_success_response = await request(server)
    .post('/food/admin/subscription/filter')
    .set('Authorization', `Bearer ${admin_token}`)
    .send({
      search_text: 'Free',
      filter: {},
    });
  expect(filter_plan_success_response.body.statusCode).toBe(200);
  expect(filter_plan_success_response.body.status).toBe(true);
  expect(filter_plan_success_response.body.result.total_records).toEqual(1);
  expect(mock_get_admin_details).toHaveBeenCalledTimes(4);

  const get_subscription_response = await request(server)
    .get('/food/vendor/subscription')
    .set('Authorization', `Bearer ${vendor_token}`);
  expect(get_subscription_response.body.statusCode).toBe(200);
  expect(get_subscription_response.body.status).toBe(true);
  expect(get_subscription_response.body.result).toHaveProperty('subscription');

  //check if restaurant benefits are updated or not
  const restaurant: IRestaurant_Basic = (
    await DB.read.from('restaurant').where({id: restaurant_id})
  )[0];
  expect(restaurant.subscription_end_time).not.toBeNull();
  expect(restaurant.subscription_remaining_orders).toBe(5);
  expect(restaurant.subscription_grace_period_remaining_orders).toBe(2);
  expect(restaurant.subscription_id).toBe(
    create_subscription_response.body.result.subscription.id
  );

  //check if subscription payment record is created or not
  const subscription_payment: ISubscriptionPayment = (
    await DB.read.from('subscription_payment').where({
      subscription_id: create_subscription_response.body.result.subscription.id,
    })
  )[0];
  expect(subscription_payment.status).toBe(SubscriptionPaymentStatus.SUCCESS);
  expect(subscription_payment.no_of_orders_bought).toBe(5);
  expect(subscription_payment.no_of_grace_period_orders_allotted).toBe(2);
});
