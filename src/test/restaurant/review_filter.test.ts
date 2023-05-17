import request from 'supertest';
import {Application} from 'express';
import {createTestServer} from '../utils/init';
import {
  loadMockSeedData,
  signToken,
  testCasesClosingTasks,
} from '../utils/utils';
import {mockgetAdminDetails} from '../utils/mock_services';
jest.mock('axios');

let server: Application;
let admin_token: string;
let vendor_token: string;

beforeAll(async () => {
  server = await createTestServer();
  await loadMockSeedData('cuisine');
  await loadMockSeedData('language');
  await loadMockSeedData('city');
  await loadMockSeedData('polygon');
  await loadMockSeedData('restaurant');
  await loadMockSeedData('time_slot');
  await loadMockSeedData('subscription');
  await loadMockSeedData('coupon');
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
describe('POST /food/restaurant/review/filter', () => {
  test('As Admin', async () => {
    const mock_get_admin = mockgetAdminDetails();
    const response = await request(server)
      .post('/food/admin/restaurant/review/filter')
      .set('Authorization', `Bearer ${admin_token}`)
      .send({
        restaurant_ids: [
          '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
          'b0909e52-a731-4665-a791-ee6479008805',
        ],
        filter: {
          vote_type: -1,
        },
        pagination: {
          page_index: 0,
          page_size: 10,
        },
        sort: [
          {
            column: 'created_at',
            order: 'asc',
          },
        ],
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe(true);
    expect(response.body.result).toStrictEqual({
      records: [],
      total_pages: 0,
      total_records: 0,
    });
    expect(mock_get_admin).toHaveBeenCalled();
  });
  test('As Vendor', async () => {
    const response = await request(server)
      .post('/food/vendor/restaurant/review/filter')
      .set('Authorization', `Bearer ${vendor_token}`)
      .send({
        filter: {
          rating_gt: 4,
          rating_lt: 1,
        },
        pagination: {
          page_index: 0,
          page_size: 10,
        },
        sort: [
          {
            column: 'created_at',
            order: 'asc',
          },
        ],
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe(true);
    expect(response.body.result).toStrictEqual({
      like_count: 100000,
      like_count_label: '100.0K',
      dislike_count: 0,
      dislike_count_label: '0',
      restaurant_rating: 0, //! BACKWARD_COMPATIBLE
      records: [],
      total_pages: 0,
      total_records: 0,
    });
  });
});
