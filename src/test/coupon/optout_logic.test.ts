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
let admin_token: string;
let vendor_token: string;

beforeAll(async () => {
  server = await createTestServer();

  await loadMockSeedData('restaurant');
  await loadMockSeedData('coupon');

  admin_token = signToken({
    id: '64bfafb6-c273-4b64-a0fc-ca981f5819eb',
    user_type: 'admin',
  });
  vendor_token = signToken({
    id: '33c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
    data: {
      type: 'restaurant',
      outlet_id: '77e53c1f-6e9e-4724-9ba7-92edc69cff6b',
      force_reset_password: false,
    },
    user_type: 'vendor',
  });
});

afterAll(async () => {
  await testCasesClosingTasks();
});

describe('Testing coupon optout logic', () => {
  //! opting out from active coupon
  //! now coupon should be available on avilable_for_optin_coupon
  //! once optin and time optin.start_time < current time then
  //! coupon should be in upcoming coupon.
  describe('Check for admin and vendor', () => {
    let coupon_mapping_id: number;
    test(`admin optout from active coupon.
          now coupon should be avilable_for_optin.
          once optin for furture time coupon should be visible in upcoming_coupon`, async () => {
      mockgetAdminDetails();
      const optin_response = await request(server)
        .post('/food/admin/coupon/restaurant/optin')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          restaurant_ids: ['77e53c1f-6e9e-4724-9ba7-92edc69cff6b'],
          coupon_id: 3000,
        });
      expect(optin_response.statusCode).toBe(200);
      expect(optin_response.body.status).toBe(true);
      expect(optin_response.body.result.records[0].coupon_id).toBe(3000);
      coupon_mapping_id = optin_response.body.result.records[0].id;

      //! Admin optout from active coupon
      mockgetAdminDetails();
      const response = await request(server)
        .post('/food/admin/coupon/restaurant/optout')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          coupon_mapping_ids: [coupon_mapping_id],
        });
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Successful Response');
      expect(response.body.result.records[0].coupon_id).toBe(3000);
      //! coupon should be avilabe for optin
      mockGetRestaurantVendors();
      const reading_avilable_for_optin_coupon = await request(server)
        .get('/food/vendor/coupon/all')
        .set('Authorization', `Bearer ${vendor_token}`);
      expect(reading_avilable_for_optin_coupon.body.status).toBe(true);
      expect(reading_avilable_for_optin_coupon.statusCode).toBe(200);
      expect(
        reading_avilable_for_optin_coupon.body.result
          .avilable_for_optin_coupon[0].id
      ).toBe(3000);
      //! now optin for future time.
      const coupon_start_time = moment().add(1, 'hours').unix();
      const coupon_end_time = moment().add(4, 'hours').unix();
      mockgetAdminDetails();
      const optin_response_1 = await request(server)
        .post('/food/vendor/coupon/restaurant/optin')
        .set('Authorization', `Bearer ${vendor_token}`)
        .send({
          coupon_id: 3000,
          restaurant_ids: ['77e53c1f-6e9e-4724-9ba7-92edc69cff6b'],
          mapping_duration: {
            start_time: coupon_start_time,
            end_time: coupon_end_time,
          },
        });
      expect(optin_response_1.statusCode).toBe(200);
      expect(optin_response_1.body.status).toBe(true);
      //! Coupon should be in upcoming coupon
      const reading_upcmoing_coupon = await request(server)
        .get('/food/vendor/coupon/all')
        .set('Authorization', `Bearer ${vendor_token}`);
      expect(reading_upcmoing_coupon.body.status).toBe(true);
      expect(reading_upcmoing_coupon.statusCode).toBe(200);
      expect(reading_upcmoing_coupon.body.result.upcoming_coupon[0].id).toBe(
        3000
      );
    });
    test(`vendor optout from upcoming coupon.
          now coupon should be avilable_for_optin.
          once optin for furture time coupon should be visible in upcoming_coupon`, async () => {
      //! vendor optout from active coupon
      mockGetRestaurantVendors();
      const response = await request(server)
        .post('/food/vendor/coupon/restaurant/optout')
        .set('Authorization', `Bearer ${vendor_token}`)
        .send({
          coupon_mapping_ids: [2],
        });
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Successful Response');
      expect(response.body.result.records[0].coupon_id).toBe(3000);
      //! coupon should be avilabel for optin
      const reading_avilable_for_optin_coupon = await request(server)
        .get('/food/vendor/coupon/all')
        .set('Authorization', `Bearer ${vendor_token}`);
      expect(reading_avilable_for_optin_coupon.body.status).toBe(true);
      expect(reading_avilable_for_optin_coupon.statusCode).toBe(200);
      expect(
        reading_avilable_for_optin_coupon.body.result
          .avilable_for_optin_coupon[0].id
      ).toBe(3000);
      //! now optin for future time.
      const coupon_start_time = moment().add(1, 'hours').unix();
      const coupon_end_time = moment().add(4, 'hours').unix();
      mockgetAdminDetails();
      const optin_response_1 = await request(server)
        .post('/food/vendor/coupon/restaurant/optin')
        .set('Authorization', `Bearer ${vendor_token}`)
        .send({
          coupon_id: 3000,
          mapping_duration: {
            start_time: coupon_start_time,
            end_time: coupon_end_time,
          },
        });
      expect(optin_response_1.statusCode).toBe(200);
      expect(optin_response_1.body.status).toBe(true);
      //! coupon should be in upcoming coupon.
      const reading_upcmoing_coupon = await request(server)
        .get('/food/vendor/coupon/all')
        .set('Authorization', `Bearer ${vendor_token}`);
      expect(reading_upcmoing_coupon.body.status).toBe(true);
      expect(reading_upcmoing_coupon.statusCode).toBe(200);
      expect(reading_upcmoing_coupon.body.result.upcoming_coupon[0].id).toBe(
        3000
      );
    });
  });
  describe('Vendor Not Allow To Opt Out From Mapping Done By Admin', () => {
    test('Venor Try To opt out from coupon mapping done by admin | Need to throw error', async () => {
      /* ADMIN OPT IN VENDOR */
      const create_mapping_by_admin = await request(server)
        .post('/food/admin/coupon/restaurant/optin')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          coupon_id: 5000,
          restaurant_ids: ['77e53c1f-6e9e-4724-9ba7-92edc69cff6b'],
        });
      expect(create_mapping_by_admin.body.status).toBe(true);
      expect(create_mapping_by_admin.statusCode).toBe(200);
      const mapping_id: number =
        create_mapping_by_admin.body.result.records[0].id;
      /* VENDOR TRY TO OPT OUT*/
      const vendor_opt_out = await request(server)
        .post('/food/vendor/coupon/restaurant/optout')
        .set('Authorization', `Bearer ${vendor_token}`)
        .send({
          coupon_mapping_ids: [mapping_id],
        });
      expect(vendor_opt_out.body.status).toBe(false);
      expect(vendor_opt_out.body.statusCode).toBe(400);
      expect(vendor_opt_out.body.errors).toStrictEqual([
        {
          message:
            'Restaurant cannot opt out from coupon mapping done by admin',
          code: 2026,
        },
      ]);
    });
  });
});
