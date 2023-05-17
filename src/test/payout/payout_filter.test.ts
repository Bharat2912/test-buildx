import request from 'supertest';
import {createTestServer} from '../utils/init';
import {Application} from 'express';
import {signToken, testCasesClosingTasks} from '../utils/utils';
import {mockgetAdminDetails} from '../utils/mock_services';
jest.mock('axios');

let server: Application;
let admin_token: string;
let vendor_token: string;

beforeAll(async () => {
  server = await createTestServer();
  admin_token = signToken({
    id: '64bfafb6-c273-4b64-a0fc-ca981f5819eb',
    user_type: 'admin',
  });
  vendor_token = signToken({
    id: '33c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
    data: {
      type: 'restaurant',
      outlet_id: 'b0909e52-a731-4665-a791-ee6479008805',
      force_reset_password: false,
    },
    user_type: 'vendor',
  });
});

afterAll(async () => {
  await testCasesClosingTasks();
});

describe('Payout Filter As Admin Testing', () => {
  const mock_get_admin = mockgetAdminDetails();
  test('amount_gt > amount_lt | Need To Throw Error', async () => {
    const response = await request(server)
      .post('/food/admin/payout/filter')
      .set('Authorization', `Bearer ${admin_token}`)
      .send({
        restaurant_ids: ['b0909e52-a731-4665-a791-ee6479008805'],
        filter: {
          amount_gt: 5000,
          amount_lt: 100,
        },
        sort_by: {
          column: 'created_at',
          direction: 'asc',
        },
        pagination: {
          page_index: 0,
          page_size: 10,
        },
      });
    expect(response.body.status).toBe(false);
    expect(response.statusCode).toBe(400);
    expect(response.body.errors).toStrictEqual([
      {
        message: 'minimum amount can not be greater than maximum amount',
        code: 0,
      },
    ]);
    expect(mock_get_admin).toHaveBeenCalledTimes(1);
  });
  test('start_date > end_date | Need To Throw Error', async () => {
    const response = await request(server)
      .post('/food/admin/payout/filter')
      .set('Authorization', `Bearer ${admin_token}`)
      .send({
        restaurant_ids: ['b0909e52-a731-4665-a791-ee6479008805'],
        filter: {
          start_date: '2022-08-30T05:54:40.687Z',
          end_date: '2022-08-01T05:54:40.687Z',
        },
        sort_by: {
          column: 'created_at',
          direction: 'asc',
        },
        pagination: {
          page_index: 0,
          page_size: 10,
        },
      });
    expect(response.body.status).toBe(false);
    expect(response.statusCode).toBe(400);
    expect(response.body.errors).toStrictEqual([
      {
        message: 'start date can not be greater than end date',
        code: 0,
      },
    ]);
    expect(mock_get_admin).toHaveBeenCalledTimes(1);
  });
});

describe('Payout Filter As Vendor Testing', () => {
  test('amount_gt > amount_lt | Need To Throw Error', async () => {
    const response = await request(server)
      .post('/food/vendor/payout/filter')
      .set('Authorization', `Bearer ${vendor_token}`)
      .send({
        filter: {
          amount_gt: 5000,
          amount_lt: 100,
        },
        sort_by: {
          column: 'created_at',
          direction: 'asc',
        },
        pagination: {
          page_index: 0,
          page_size: 10,
        },
      });
    expect(response.body.status).toBe(false);
    expect(response.statusCode).toBe(400);
    expect(response.body.errors).toStrictEqual([
      {
        message: 'minimum amount can not be greater than maximum amount',
        code: 0,
      },
    ]);
  });
  test('start_date > end_date | Need To Throw Error', async () => {
    const response = await request(server)
      .post('/food/vendor/payout/filter')
      .set('Authorization', `Bearer ${vendor_token}`)
      .send({
        filter: {
          start_date: '2022-08-30T05:54:40.687Z',
          end_date: '2022-08-01T05:54:40.687Z',
        },
        sort_by: {
          column: 'created_at',
          direction: 'asc',
        },
        pagination: {
          page_index: 0,
          page_size: 10,
        },
      });
    expect(response.body.status).toBe(false);
    expect(response.statusCode).toBe(400);
    expect(response.body.errors).toStrictEqual([
      {
        message: 'start date can not be greater than end date',
        code: 0,
      },
    ]);
  });
});
