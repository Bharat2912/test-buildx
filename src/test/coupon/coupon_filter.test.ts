import request from 'supertest';
import {createTestServer} from '../utils/init';
import {Application} from 'express';
import {
  signToken,
  loadMockSeedData,
  loadMockSeedDataFromPath,
  testCasesClosingTasks,
} from '../utils/utils';
import {
  mockgetAdminDetails,
  mockgetAdminDetailsByIds,
  mockgetVendorDetailsByIds,
} from '../utils/mock_services';

jest.mock('axios');
let server: Application;
let admin_token: string;
let customer_token: string;

const coupon_request_body = {
  code: '',
  header: ' ',
  description: ' ',
  terms_and_conditions: ' ',
  type: ' ',
  discount_percentage: 100,
  start_time: 1656054691,
  end_time: 1656400291,
  level: ' ',
  max_use_count: 1,
  min_order_value_rupees: 100,
  max_discount_rupees: 20,
  discount_share_percent: 0,
};

beforeAll(async () => {
  server = await createTestServer();

  await loadMockSeedData('restaurant');
  await loadMockSeedDataFromPath('src/test/coupon/vendor_coupon.sql');

  customer_token = signToken({
    id: '0df0572f-84fa-4068-8a82-10f41c9dd39a',
    user_type: 'customer',
  });
  admin_token = signToken({
    id: '64bfafb6-c273-4b64-a0fc-ca981f5819eb',
    user_type: 'admin',
  });
});

afterAll(async () => {
  await testCasesClosingTasks();
});

describe('AS ADMIN', () => {
  describe('FILTER', () => {
    test('Invalid Token Applied', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .post('/food/admin/coupon/filter')
        .set('Authorization', `Bearer ${customer_token}`)
        .send(coupon_request_body);
      expect(response.statusCode).toBe(403);
    });
    test('Invalid Serch Text', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .post('/food/admin/coupon/filter')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          search_text: '5',
        });
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
    });
    test('valid Coupon Id As Serch Text', async () => {
      mockgetAdminDetails();
      mockgetAdminDetailsByIds();
      mockgetVendorDetailsByIds();
      const response = await request(server)
        .post('/food/admin/coupon/filter')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          search_text: '2',
        });

      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.result.records[0].id).toBe(2);
    });
    test('valid Coupon Code As Serch Text', async () => {
      mockgetAdminDetails();
      mockgetAdminDetailsByIds();
      mockgetVendorDetailsByIds();
      const response = await request(server)
        .post('/food/admin/coupon/filter')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          search_text: 'SPEEDYYWELCOME',
        });
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.result.records[0].code).toBe(
        'SPEEDYYWELCOME_ACTIVE'
      );
    });
    test('Invalid restaurant ID', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .post('/food/admin/coupon/filter')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          filter: {
            restaurant_id: 'cc37e5e6-0a0e-4e73-848c-aeed4ad2a695',
          },
        });
      expect(response.body.status).toBe(false);
      expect(response.body.statusCode).toBe(400);
      expect(response.body.errors).toStrictEqual([
        {
          message: 'Invalid restaurant Id',
          code: 2009,
        },
      ]);
    });
  });
  describe('Restaurant Coupon Filter', () => {
    test('filter active and upcomming coupon of restaurant | total_records : 2', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .post('/food/admin/coupon/restaurant/filter')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          filter: {
            restaurant_id: 'b0909e52-a731-4665-a791-ee6479008805',
            timeline: ['active', 'upcoming'],
          },
          pagination: {
            page_index: 1,
            page_size: 5,
          },
        });
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.result.total_records).toEqual(2);
    });
    test('Invalid search_text | total_records : 0', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .post('/food/admin/coupon/restaurant/filter')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          search_text: 'SPEEDYY',
          filter: {
            timeline: ['active', 'upcoming'],
          },
          pagination: {
            page_index: 1,
            page_size: 5,
          },
        });
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.result.total_records).toEqual(0);
    });
    test('Invalid restaurant_id | total_records : 0', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .post('/food/admin/coupon/restaurant/filter')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          filter: {
            restaurant_id: 'cc37e5e6-0a0e-4e73-848c-aeed4ad2a695',
            timeline: ['active', 'expired', 'upcoming'],
          },
          pagination: {
            page_index: 1,
            page_size: 5,
          },
        });
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.result.total_records).toEqual(0);
    });
    test('Valid restaurant_id |  All coupons | total_records : 3', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .post('/food/admin/coupon/restaurant/filter')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          filter: {
            restaurant_id: 'b0909e52-a731-4665-a791-ee6479008805',
            timeline: ['active', 'upcoming', 'expired'],
          },
          pagination: {
            page_index: 1,
            page_size: 5,
          },
        });
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.result.total_records).toEqual(3);
    });
    test('All coupons | total_records : 4', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .post('/food/admin/coupon/restaurant/filter')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          filter: {
            timeline: ['active', 'upcoming', 'expired'],
          },
          pagination: {
            page_index: 1,
            page_size: 5,
          },
        });
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.result.total_records).toEqual(4);
    });
    test('Active coupons | total_records : 1', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .post('/food/admin/coupon/restaurant/filter')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          filter: {
            restaurant_id: 'b0909e52-a731-4665-a791-ee6479008805',
            timeline: ['active'],
          },
          pagination: {
            page_index: 1,
            page_size: 5,
          },
        });
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.result.total_records).toEqual(1);
    });
  });
});
