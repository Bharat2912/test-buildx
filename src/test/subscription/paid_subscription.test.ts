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
} from '../../module/food/subscription/enum';
import {mockgetAdminDetails, mockSendEmail} from '../utils/mock_services';
import {IRestaurant_Basic} from '../../module/food/restaurant/models';
import {ISubscriptionPayment} from '../../module/food/subscription/types';
import {mockCreateSubscriptionAtExternalService} from './mocks';
import {createTestPlan} from './utlis';
jest.mock('axios');
let server: Application;
let admin_token: string;
const restaurant_id = 'b0909e52-a731-4665-a791-ee6479008805';

beforeAll(async () => {
  server = await createTestServer();

  await loadMockSeedData('restaurant');
  admin_token = signToken({
    id: '64bfafb6-c273-4b64-a0fc-ca981f5819eb',
    user_type: 'admin',
  });
});

afterAll(async () => {
  await testCasesClosingTasks();
});

test('CREATE PAID SUBSCRIPTION AS ADMIN', async () => {
  const plan = await createTestPlan({
    id: 'RES_e6372ad4-0a69-4dc1-a936-26393cd4b100',
    name: 'Paid Plan',
    type: PlanType.PERIODIC,
    category: PlanCategory.BASIC,
    no_of_orders: 100,
    no_of_grace_period_orders: 10,
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

  //mocks
  const mock_get_admin_details = mockgetAdminDetails();
  const mock_send_email = mockSendEmail();
  const mock_create_external_subscription =
    mockCreateSubscriptionAtExternalService(plan.id);

  //create subscription
  const create_subscription_response = await request(server)
    .post('/food/admin/subscription')
    .set('Authorization', `Bearer ${admin_token}`)
    .send({
      restaurant_id: restaurant_id,
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
  expect(mock_get_admin_details).toHaveBeenCalledTimes(1);
  expect(mock_create_external_subscription).toBeCalledTimes(1);
  expect(mock_send_email).toBeCalledTimes(1);

  //check if restaurant benefits are updated or not
  const restaurant: IRestaurant_Basic = (
    await DB.read.from('restaurant').where({id: restaurant_id})
  )[0];
  expect(restaurant.subscription_end_time).toBeNull();
  expect(restaurant.subscription_remaining_orders).toBeNull();
  expect(restaurant.subscription_grace_period_remaining_orders).toBeNull();
  expect(restaurant.subscription_id).toBeNull();

  //check if subscription payment record is created or not
  const subscription_payment: ISubscriptionPayment = (
    await DB.read.from('subscription_payment').where({
      subscription_id: create_subscription_response.body.result.subscription.id,
    })
  )[0];
  expect(subscription_payment).toBeUndefined();
});
