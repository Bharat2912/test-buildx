import request from 'supertest';
import {Application} from 'express';
import {createTestServer} from '../utils/init';
import {
  createTableDynamoDB,
  loadMockSeedData,
  signToken,
  testCasesClosingTasks,
} from '../utils/utils';
import {mockgetAdminDetails} from '../utils/mock_services';
import {pp_restaurant_id} from '../petpooja/common';

jest.mock('axios');

let server: Application;
let vendor_token: string;
let admin_token: string;

beforeAll(async () => {
  server = await createTestServer();
  vendor_token = signToken({
    id: '33c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
    data: {
      type: 'restaurant',
      outlet_id: pp_restaurant_id,
      force_reset_password: false,
    },
    user_type: 'vendor',
  });
  admin_token = signToken({
    id: '64bfafb6-c273-4b64-a0fc-ca981f5819eb',
    user_type: 'admin',
  });
  await createTableDynamoDB('user');
  await loadMockSeedData('restaurant');
  await loadMockSeedData('subscription');
  await loadMockSeedData('coupon');
});

afterAll(async () => {
  await testCasesClosingTasks();
});

describe('Coupon', () => {
  const valid_start_time = new Date();
  valid_start_time.setDate(new Date().getDate() + 5);
  const startDate = Math.floor(valid_start_time.getTime() / 1000);

  const valid_end_time = new Date();
  valid_end_time.setDate(new Date().getDate() + 8);
  const endDate = Math.floor(valid_end_time.getTime() / 1000);
  test('Vendor Creating Coupon | need to throw error', async () => {
    const response = await request(server)
      .post('/food/vendor/coupon')
      .set('Authorization', `Bearer ${vendor_token}`)
      .send({
        code: 'Test-Coupon',
        header: 'Test-Coupon-Petpooja',
        description: 'Test-Coupon-For-Petpooja',
        terms_and_conditions: 'Test-Coupon-For-Petpooja',
        type: 'upto',
        discount_percentage: 100,
        start_time: startDate,
        end_time: endDate,
        max_use_count: 1,
        min_order_value_rupees: 100,
        max_discount_rupees: 20,
      });
    expect(response.body.status).toBe(false);
    expect(response.statusCode).toBe(400);
    expect(response.body.errors).toStrictEqual([
      {
        message:
          'restaurants registered with petpooja system can not take this action from speedyy apps',
        code: 2017,
      },
    ]);
  });
  test('Vendor Optin For Coupon | need to throw error', async () => {
    const coupon_optin_response = await request(server)
      .post('/food/vendor/coupon/restaurant/optin')
      .set('Authorization', `Bearer ${vendor_token}`)
      .send({
        coupon_id: 9000,
        mapping_duration: {
          start_time: startDate,
          end_time: endDate,
        },
      });
    expect(coupon_optin_response.body.status).toBe(false);
    expect(coupon_optin_response.statusCode).toBe(400);
    expect(coupon_optin_response.body.errors).toStrictEqual([
      {
        message:
          'restaurants registered with petpooja system can not take this action from speedyy apps',
        code: 2017,
      },
    ]);
  });
  test('Admin Optin Restaurant | need to throw error', async () => {
    mockgetAdminDetails();
    const optin_response = await request(server)
      .post('/food/admin/coupon/restaurant/optin')
      .set('Authorization', `Bearer ${admin_token}`)
      .send({
        restaurant_ids: [pp_restaurant_id],
        coupon_id: 3000,
      });
    expect(optin_response.statusCode).toBe(400);
    expect(optin_response.body.status).toBe(false);
    expect(optin_response.body.errors).toStrictEqual([
      {
        message:
          'restaurants registered with petpooja system can not take this action from speedyy apps',
        code: 2017,
      },
    ]);
  });
});
