import request from 'supertest';
import {createTestServer} from '../utils/init';
import {Application} from 'express';
import {
  signToken,
  loadMockSeedData,
  testCasesClosingTasks,
} from '../utils/utils';
import {
  mockgetAdminDetails,
  mockGetRestaurantVendors,
} from '../utils/mock_services';
import moment from 'moment';

jest.mock('axios');

let server: Application;
let vendor_token: string;
let mapping_id: number;
beforeAll(async () => {
  server = await createTestServer();

  await loadMockSeedData('restaurant');
  await loadMockSeedData('coupon');
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

describe('ALL', () => {
  describe('Already Have Upcoming Coupon With Upcoming Mapping ', () => {
    test('Check if Coupon is In Upcoming coupon | Also In available for opt in because Whole coupon is not opt in', async () => {
      const avilable_for_optin_coupons = [];
      const upcoming_coupons = [];

      mockGetRestaurantVendors();
      const response = await request(server)
        .get('/food/vendor/coupon/all')
        .set('Authorization', `Bearer ${vendor_token}`);

      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Successful Response');
      for (
        let index = 0;
        index < response.body.result.avilable_for_optin_coupon.length;
        index++
      ) {
        avilable_for_optin_coupons.push(
          response.body.result.avilable_for_optin_coupon[index].id
        );
      }
      expect(avilable_for_optin_coupons).toEqual(
        expect.arrayContaining([4000])
      );
      for (
        let index = 0;
        index < response.body.result.upcoming_coupon.length;
        index++
      ) {
        upcoming_coupons.push(response.body.result.upcoming_coupon[index].id);
      }
      expect(upcoming_coupons).toEqual(expect.arrayContaining([4000]));
    });
    test('Opting Out from Upcoming Coupon', async () => {
      mockGetRestaurantVendors();
      const response = await request(server)
        .post('/food/vendor/coupon/restaurant/optout')
        .set('Authorization', `Bearer ${vendor_token}`)
        .send({
          coupon_mapping_ids: [300],
        });
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Successful Response');
      expect(response.body.result.records[0].coupon_id).toBe(4000);
    });
    test('Vendor Optin for same coupon from avilable_for_optin_coupon', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .post('/food/vendor/coupon/restaurant/optin')
        .set('Authorization', `Bearer ${vendor_token}`)
        .send({
          coupon_id: 4000,
        });
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Successful Response');
      expect(response.body.result.records[0].coupon_id).toBe(4000);
    });
    test('Check if Coupon not for available for opt In beacause Whole coupon is optin | In Upcoming coupon', async () => {
      const avilable_for_optin_coupons = [];
      const upcoming_coupons = [];

      mockGetRestaurantVendors();
      const response = await request(server)
        .get('/food/vendor/coupon/all')
        .set('Authorization', `Bearer ${vendor_token}`);
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Successful Response');
      for (
        let index = 0;
        index < response.body.result.avilable_for_optin_coupon.length;
        index++
      ) {
        avilable_for_optin_coupons.push(
          response.body.result.avilable_for_optin_coupon[index].id
        );
      }
      expect(avilable_for_optin_coupons).not.toEqual(
        expect.arrayContaining([4000])
      );
      for (
        let index = 0;
        index < response.body.result.upcoming_coupon.length;
        index++
      ) {
        upcoming_coupons.push(response.body.result.upcoming_coupon[index].id);
      }
      expect(upcoming_coupons).toEqual(expect.arrayContaining([4000]));
    });
  });
  describe('Already Have ActiveCoupon With Active Mapping', () => {
    test('Check if Coupon is In Active coupon | Also In available for opt in because Whole coupon is not opt in', async () => {
      const avilable_for_optin_coupons = [];
      const active_coupons = [];

      mockGetRestaurantVendors();
      const response = await request(server)
        .get('/food/vendor/coupon/all')
        .set('Authorization', `Bearer ${vendor_token}`);

      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Successful Response');
      for (
        let index = 0;
        index < response.body.result.avilable_for_optin_coupon.length;
        index++
      ) {
        avilable_for_optin_coupons.push(
          response.body.result.avilable_for_optin_coupon[index].id
        );
      }
      expect(avilable_for_optin_coupons).toEqual(
        expect.arrayContaining([3000])
      );
      for (
        let index = 0;
        index < response.body.result.active_coupon.length;
        index++
      ) {
        active_coupons.push(response.body.result.active_coupon[index].id);
      }
      expect(active_coupons).toEqual(expect.arrayContaining([3000]));
    });
    test('Opting Out Coupon from ActiveCoupon', async () => {
      mockGetRestaurantVendors();
      const response = await request(server)
        .post('/food/vendor/coupon/restaurant/optout')
        .set('Authorization', `Bearer ${vendor_token}`)
        .send({
          coupon_mapping_ids: [200],
        });
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Successful Response');
      expect(response.body.result.records[0].coupon_id).toBe(3000);
    });
    test('Vendor Optin for same coupon from avilable_for_optin_coupon', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .post('/food/vendor/coupon/restaurant/optin')
        .set('Authorization', `Bearer ${vendor_token}`)
        .send({
          coupon_id: 3000,
        });
      mapping_id = response.body.result.records[0].id;
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Successful Response');
      expect(response.body.result.records[0].coupon_id).toBe(3000);
    });
    test('Check if Coupon not for available for opt In beacause Whole coupon is optin | In active coupon', async () => {
      const avilable_for_optin_coupons = [];
      const active_coupons = [];

      mockGetRestaurantVendors();
      const response = await request(server)
        .get('/food/vendor/coupon/all')
        .set('Authorization', `Bearer ${vendor_token}`);
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Successful Response');
      for (
        let index = 0;
        index < response.body.result.avilable_for_optin_coupon.length;
        index++
      ) {
        avilable_for_optin_coupons.push(
          response.body.result.avilable_for_optin_coupon[index].id
        );
      }
      expect(avilable_for_optin_coupons).not.toEqual(
        expect.arrayContaining([3000])
      );
      for (
        let index = 0;
        index < response.body.result.active_coupon.length;
        index++
      ) {
        active_coupons.push(response.body.result.active_coupon[index].id);
      }
      expect(active_coupons).toEqual(expect.arrayContaining([3000]));
    });
    test('Opting Out Coupon from ActiveCoupon', async () => {
      mockGetRestaurantVendors();
      const response = await request(server)
        .post('/food/vendor/coupon/restaurant/optout')
        .set('Authorization', `Bearer ${vendor_token}`)
        .send({
          coupon_mapping_ids: [mapping_id],
        });
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Successful Response');
      expect(response.body.result.records[0].coupon_id).toBe(3000);
    });
    test('Vendor Optin whole coupon | one active mapping | one upcomming', async () => {
      mockgetAdminDetails();
      const active_mapping = await request(server)
        .post('/food/vendor/coupon/restaurant/optin')
        .set('Authorization', `Bearer ${vendor_token}`)
        .send({
          coupon_id: 3000,
          mapping_duration: {
            start_time: moment().unix(),
            end_time: moment().add(2, 'days').unix(),
          },
        });
      expect(active_mapping.body.status).toBe(true);
      expect(active_mapping.statusCode).toBe(200);
      expect(active_mapping.body.message).toBe('Successful Response');
      expect(active_mapping.body.result.records[0].coupon_id).toBe(3000);
      const upcoming_mapping = await request(server)
        .post('/food/vendor/coupon/restaurant/optin')
        .set('Authorization', `Bearer ${vendor_token}`)
        .send({
          coupon_id: 3000,
          mapping_duration: {
            start_time: moment().add(2, 'days').add(1, 'minute').unix(),
            end_time: moment().add(5, 'days').unix(),
          },
        });
      expect(upcoming_mapping.body.status).toBe(true);
      expect(upcoming_mapping.statusCode).toBe(200);
      expect(upcoming_mapping.body.message).toBe('Successful Response');
      expect(upcoming_mapping.body.result.records[0].coupon_id).toBe(3000);
    });
    test('Check if Coupon not for available for opt In beacause Whole coupon is optin | In active coupon', async () => {
      const avilable_for_optin_coupons = [];
      const active_coupons = [];

      mockGetRestaurantVendors();
      const response = await request(server)
        .get('/food/vendor/coupon/all')
        .set('Authorization', `Bearer ${vendor_token}`);
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Successful Response');
      for (
        let index = 0;
        index < response.body.result.avilable_for_optin_coupon.length;
        index++
      ) {
        avilable_for_optin_coupons.push(
          response.body.result.avilable_for_optin_coupon[index].id
        );
      }
      expect(avilable_for_optin_coupons).not.toEqual(
        expect.arrayContaining([3000])
      );
      for (
        let index = 0;
        index < response.body.result.active_coupon.length;
        index++
      ) {
        active_coupons.push(response.body.result.active_coupon[index].id);
      }
      expect(active_coupons).toEqual(expect.arrayContaining([3000]));
    });
  });
  describe(`Checking Coupon validation.
            1. expired_coupon should have all expired mappings
            2. active_coupon should have all active mappings.
            3. upcoming_coupon should have all upcoming mappings.
            4. avilable_for_optin_coupon should have time period left for optin`, () => {
    test('Checking expired mapping details', async () => {
      const current_time = moment().unix();
      mockGetRestaurantVendors();
      const response = await request(server)
        .get('/food/vendor/coupon/all')
        .set('Authorization', `Bearer ${vendor_token}`);
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Successful Response');
      /// ! check for expired coupon
      for (let i = 0; i < response.body.result.expired_coupon.length; i++) {
        const expired_coupon = response.body.result.expired_coupon[i];
        if (Array.isArray(expired_coupon.mapping_details)) {
          for (let j = 0; j < expired_coupon.mapping_details.length; j++) {
            if (
              moment(expired_coupon.mapping_details[j].start_time).unix() <
                current_time &&
              moment(expired_coupon.mapping_details[j].end_time).unix() <
                current_time
            ) {
              expect(current_time).toBeGreaterThan(
                moment(expired_coupon.mapping_details[j].start_time).unix()
              );
              expect(current_time).toBeGreaterThan(
                moment(expired_coupon.mapping_details[j].end_time).unix()
              );
            } else {
              expect(expired_coupon.mapping_details[j].is_deleted).toBe(true);
            }
          }
        }
      }
      /// ! check for upcoming coupon
      for (let i = 0; i < response.body.result.upcoming_coupon.length; i++) {
        const upcoming_coupon = response.body.result.upcoming_coupon[i];
        for (let j = 0; j < upcoming_coupon.mapping_details.length; j++) {
          expect(
            moment(upcoming_coupon.mapping_details[j].start_time).unix()
          ).toBeGreaterThan(current_time);
          expect(
            moment(upcoming_coupon.mapping_details[j].end_time).unix()
          ).toBeGreaterThan(current_time);
        }
      }
      /// ! check for active coupon
      for (let i = 0; i < response.body.result.active_coupon.length; i++) {
        const active_coupon = response.body.result.active_coupon[i];
        expect(current_time).toBeGreaterThan(
          moment(active_coupon.start_time).unix()
        );
        expect(moment(active_coupon.end_time).unix()).toBeGreaterThan(
          current_time
        );
        for (let j = 0; j < active_coupon.mapping_details.length; j++) {
          expect(current_time).toBeGreaterThanOrEqual(
            moment(active_coupon.mapping_details[j].start_time).unix()
          );
          expect(
            moment(active_coupon.mapping_details[j].end_time).unix()
          ).toBeGreaterThan(current_time);
        }
      }
      /// ! check for avilable for optin
    });
  });
});
