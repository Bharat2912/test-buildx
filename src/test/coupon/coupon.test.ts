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
import {bulkInsertCoupon} from '../../module/food/coupons/models';
import {DB, getTransaction} from '../../data/knex';
import {
  CouponCreatedBy,
  CouponLevel,
  CouponType,
} from '../../module/food/coupons/enum';
import logger from '../../utilities/logger/winston_logger';

jest.mock('axios');
let server: Application;
let admin_token: string;
let customer_token: string;
let vendor_token: string;
let vendor_two_token: string;

const start_time = new Date();
start_time.setDate(new Date().getDate() - 1);
//const start_Date = Math.floor(start_time.getTime() / 1000);

const end_time = new Date();
end_time.setDate(new Date().getDate() + 8);
//const end_Date = Math.floor(end_time.getTime() / 1000);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const existing_coupon: any = {
  code: '40%OFF',
  header: 'Get 40 % OFF',
  description: 'All new user can get 40% off on thier first order',
  terms_and_conditions:
    'Terms & Conditions Apply 1. Applicable only for order above 100rs',
  type: CouponType.UPTO,
  discount_percentage: 40.0,
  start_time: start_time,
  end_time: end_time,
  level: CouponLevel.GLOBAL,
  max_use_count: 2,
  min_order_value_rupees: 200,
  max_discount_rupees: 50,
  discount_share_percent: 0.0,
  created_by: CouponCreatedBy.ADMIN,
  created_by_user_id: '64bfafb6-c273-4b64-a0fc-ca981f5819eb',
};

beforeAll(async () => {
  server = await createTestServer();

  await loadMockSeedData('restaurant');
  await loadMockSeedData('coupon');
  const trx = await getTransaction();
  const active_coupon = await bulkInsertCoupon(trx, [existing_coupon]);
  logger.debug('active_Coupon_Created :- ', active_coupon);
  await trx.commit();
  customer_token = signToken({
    id: '0df0572f-84fa-4068-8a82-10f41c9dd39a',
    user_type: 'customer',
  });
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
  vendor_two_token = signToken({
    id: '11111111-8df6-4541-9d3f-f9e5ba4c0242',
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

const restaurant_id = 'b0909e52-a731-4665-a791-ee6479008805';
// const restaurant_2_id = '5e0dfbae-f540-49dc-9e32-37077796aaac';
const invalid_restaurnat_id = 'aed62a02-15f7-408f-953d-fbd6db0dbf57';

//const now = moment().format('DD/MM/YYYY HH:mm:ss A');
//const valid_start_time = new Date('August 20, 2022 10:30:00');

const valid_start_time = new Date();
valid_start_time.setDate(new Date().getDate() + 5);
const startDate = Math.floor(valid_start_time.getTime() / 1000);

const valid_end_time = new Date();
valid_end_time.setDate(new Date().getDate() + 8);
const endDate = Math.floor(valid_end_time.getTime() / 1000);

const vendor_valid_start_time = new Date();
vendor_valid_start_time.setDate(new Date().getDate() + 10);
const vendor_startDate = vendor_valid_start_time.getTime() / 1000.0;

const vendor_valid_end_time = new Date();
vendor_valid_end_time.setDate(new Date().getDate() + 15);
const vendor_endDate = Math.floor(vendor_valid_end_time.getTime() / 1000);

const Invalid_start_time = new Date();
Invalid_start_time.setDate(new Date().getDate() - 5);
const Previous_Day_epoch_start = Math.floor(
  Invalid_start_time.getTime() / 1000
);

const Invalid_end_time = new Date();
Invalid_end_time.setDate(new Date().getDate() - 2);
const Previous_Day_epoch_end = Math.floor(Invalid_end_time.getTime() / 1000);

const coupon_name = (Math.random() + 1).toString(36).substring(2, 7);

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

const vendor_coupon_request_body = {
  code: '',
  header: '',
  description: '',
  terms_and_conditions: '',
  type: '',
  discount_percentage: 100,
  start_time: 1656054691,
  end_time: 1656400291,
  max_use_count: 1,
  min_order_value_rupees: 100,
  max_discount_rupees: 20,
};

let opt_in_id: string;
let coupon_2_id: string;
let coupon_3_id: string;
let coupon_3_mapping_id: string;
//let coupon_4_id: string;

describe('Test Case for Coupons API :- ', () => {
  describe('ADMIN', () => {
    describe('CREATE', () => {
      test('Invalid Token Applied', async () => {
        mockgetAdminDetails();
        const response = await request(server)
          .post('/food/admin/coupon')
          .set('Authorization', `Bearer ${customer_token}`)
          .send(coupon_request_body);
        expect(response.statusCode).toBe(403);
      });
      test('Empty code', async () => {
        mockgetAdminDetails();
        coupon_request_body.code = '';
        const response = await request(server)
          .post('/food/admin/coupon')
          .set('Authorization', `Bearer ${admin_token}`)
          .send(coupon_request_body);
        expect(response.body.status).toBe(false);
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toStrictEqual([
          {message: 'Please add Coupon code', code: 1000},
        ]);
        coupon_request_body.code = 'SPEEDYYTEST-COUPON';
      });
      test('Added Coupon code | Empty Header', async () => {
        mockgetAdminDetails();
        const response = await request(server)
          .post('/food/admin/coupon')
          .set('Authorization', `Bearer ${admin_token}`)
          .send(coupon_request_body);
        expect(response.body.status).toBe(false);
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toStrictEqual([
          {message: 'Header cannot be Empty', code: 1000},
        ]);
      });
      test('Added Header | Empty Description', async () => {
        mockgetAdminDetails();
        coupon_request_body.header = 'Get 20% Cashback';
        const response = await request(server)
          .post('/food/admin/coupon')
          .set('Authorization', `Bearer ${admin_token}`)
          .send(coupon_request_body);
        expect(response.body.status).toBe(false);
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toStrictEqual([
          {message: 'Description cannot be Empty', code: 1000},
        ]);
      });
      test('Added Description | Empty Terms & conditions', async () => {
        mockgetAdminDetails();
        coupon_request_body.description =
          'All new user can get 20% cashback on thier first order';
        const response = await request(server)
          .post('/food/admin/coupon')
          .set('Authorization', `Bearer ${admin_token}`)
          .send(coupon_request_body);
        expect(response.body.status).toBe(false);
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toStrictEqual([
          {message: 'Terms and Conditions cannot be empty', code: 1000},
        ]);
      });
      test('Added Terms & conditions | Empty Type', async () => {
        mockgetAdminDetails();
        coupon_request_body.terms_and_conditions =
          'Terms & Conditions Apply 1. Applicable only for order above 100rs';
        const response = await request(server)
          .post('/food/admin/coupon')
          .set('Authorization', `Bearer ${admin_token}`)
          .send(coupon_request_body);
        expect(response.body.status).toBe(false);
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toStrictEqual([
          {message: '"type" must be one of [upto, flat]', code: 1000},
        ]);
      });
      test('Added Type | Other that upto, flat| Empty Level', async () => {
        mockgetAdminDetails();
        coupon_request_body.type = 'discount';
        const response = await request(server)
          .post('/food/admin/coupon')
          .set('Authorization', `Bearer ${admin_token}`)
          .send(coupon_request_body);
        expect(response.body.status).toBe(false);
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toStrictEqual([
          {message: '"type" must be one of [upto, flat]', code: 1000},
        ]);
      });
      test('Added Type | Empty Level', async () => {
        mockgetAdminDetails();
        coupon_request_body.type = 'upto';
        const response = await request(server)
          .post('/food/admin/coupon')
          .set('Authorization', `Bearer ${admin_token}`)
          .send(coupon_request_body);
        expect(response.body.status).toBe(false);
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toStrictEqual([
          {message: '"level" must be one of [global, restaurant]', code: 1000},
        ]);
      });
      test('Added level | Other than global, restaurant', async () => {
        mockgetAdminDetails();
        coupon_request_body.level = 'discount';
        const response = await request(server)
          .post('/food/admin/coupon')
          .set('Authorization', `Bearer ${admin_token}`)
          .send(coupon_request_body);
        expect(response.body.status).toBe(false);
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toStrictEqual([
          {message: '"level" must be one of [global, restaurant]', code: 1000},
        ]);
      });
      test('Added level | Other than global, restaurant', async () => {
        mockgetAdminDetails();
        coupon_request_body.level = 'global';
        const response = await request(server)
          .post('/food/admin/coupon')
          .set('Authorization', `Bearer ${admin_token}`)
          .send(coupon_request_body);
        expect(response.body.status).toBe(false);
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toStrictEqual([
          {
            message: 'coupon start time should be greater than current time',
            code: 1066,
          },
        ]);
      });
      test('Adding discount_percentage to Be Negative value | Invalid epoch', async () => {
        mockgetAdminDetails();
        coupon_request_body.discount_percentage = -100;
        const response = await request(server)
          .post('/food/admin/coupon')
          .set('Authorization', `Bearer ${admin_token}`)
          .send(coupon_request_body);
        expect(response.body.status).toBe(false);
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toStrictEqual([
          {
            message: '"discount_percentage" must be greater than or equal to 1',
            code: 1000,
          },
        ]);
        coupon_request_body.discount_percentage = 20;
      });
      test('Adding Previous Day epoch time | It should Throw error.', async () => {
        mockgetAdminDetails();
        coupon_request_body.start_time = Previous_Day_epoch_start;
        coupon_request_body.end_time = Previous_Day_epoch_end;
        const response = await request(server)
          .post('/food/admin/coupon')
          .set('Authorization', `Bearer ${admin_token}`)
          .send(coupon_request_body);
        expect(response.body.status).toBe(false);
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toStrictEqual([
          {
            message: 'coupon start time should be greater than current time',
            code: 1066,
          },
        ]);
      });
      test('Adding New epoch time', async () => {
        mockgetAdminDetails();
        coupon_request_body.code = coupon_name;
        coupon_request_body.start_time = startDate;
        coupon_request_body.end_time = endDate;
        const response = await request(server)
          .post('/food/admin/coupon')
          .set('Authorization', `Bearer ${admin_token}`)
          .send(coupon_request_body);
        expect(response.body.status).toBe(true);
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Successful Response');
      });
      test('Creating Coupon on Restaurnat Level', async () => {
        mockgetAdminDetails();
        coupon_request_body.code = 'Restaurant_Coupon';
        coupon_request_body.start_time = startDate;
        coupon_request_body.end_time = endDate;
        coupon_request_body.level = 'restaurant';
        const response = await request(server)
          .post('/food/admin/coupon')
          .set('Authorization', `Bearer ${admin_token}`)
          .send(coupon_request_body);
        expect(response.body.status).toBe(true);
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Successful Response');
        expect(response.body.result.coupon_details.code).toBe(
          'Restaurant_Coupon'
        );
        opt_in_id = response.body.result.coupon_details.id;
      });
      test('Creating Coupon-2 on Restaurnat Level', async () => {
        mockgetAdminDetails();
        coupon_request_body.code = 'Coupon-2';
        coupon_request_body.start_time = startDate;
        coupon_request_body.end_time = endDate;
        coupon_request_body.level = 'restaurant';
        const response = await request(server)
          .post('/food/admin/coupon')
          .set('Authorization', `Bearer ${admin_token}`)
          .send(coupon_request_body);
        expect(response.body.status).toBe(true);
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Successful Response');
        expect(response.body.result.coupon_details.code).toBe('Coupon-2');
        coupon_2_id = response.body.result.coupon_details.id;
      });
      test('Creating Coupon-3 on Restaurnat Level for Opt-Out', async () => {
        const start_time = new Date();
        start_time.setDate(new Date().getDate() + 4);
        const start = start_time.getTime() / 1000.0;

        const end_time = new Date();
        end_time.setDate(new Date().getDate() + 8);
        const end = end_time.getTime() / 1000.0;

        mockgetAdminDetails();
        coupon_request_body.code = 'Coupon-3';
        coupon_request_body.start_time = start;
        coupon_request_body.end_time = end;
        coupon_request_body.level = 'restaurant';
        const response = await request(server)
          .post('/food/admin/coupon')
          .set('Authorization', `Bearer ${admin_token}`)
          .send(coupon_request_body);
        expect(response.body.status).toBe(true);
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Successful Response');
        expect(response.body.result.coupon_details.code).toBe('Coupon-3');
        coupon_3_id = response.body.result.coupon_details.id;
      });
      // test('Creating Coupon-4 on Restaurnat Level for Customer | 3-Sec delay', async () => {
      //   const start_time = new Date();
      //   start_time.getSeconds() + 15;
      //   //start_time.setDate(start_time.getSeconds() + 1);
      //   const start = Math.floor(start_time.getTime() / 1000);

      //   const end_time = new Date();
      //   end_time.setDate(new Date().getDate() + 8);
      //   const end = Math.floor(end_time.getTime() / 1000);

      //   mockgetAdminDetails();
      //   coupon_request_body.code = 'Coupon-4';
      //   coupon_request_body.start_time = start;
      //   coupon_request_body.end_time = end;
      //   coupon_request_body.level = 'restaurant';
      //   const response = await request(server)
      //     .post('/food/admin/coupon')
      //     .set('Authorization', `Bearer ${admin_token}`)
      //     .send(coupon_request_body);
      //   expect(response.body.status).toBe(true);
      //   expect(response.statusCode).toBe(200);
      //   expect(response.body.message).toBe('Successful Response');
      //   expect(response.body.result.coupon_details.code).toBe('Coupon-3');
      //   coupon_4_id = response.body.result.coupon_details.id;
      // });
    });
    describe('OPTIN', () => {
      test('Invalid Token Applied', async () => {
        mockgetAdminDetails();
        const response = await request(server)
          .post('/food/admin/coupon/restaurant/optin')
          .set('Authorization', `Bearer ${customer_token}`)
          .send({
            coupon_id: 2,
            restaurant_ids: ['aed62a02-15f7-408f-953d-fbd6db0dbf57'],
            mapping_duration: {
              start_time: 1656328066,
              end_time: 1656331666,
            },
          });
        expect(response.statusCode).toBe(403);
      });
      test('Applying Invalid Coupon ID ', async () => {
        mockgetAdminDetails();
        const response = await request(server)
          .post('/food/admin/coupon/restaurant/optin')
          .set('Authorization', `Bearer ${admin_token}`)
          .send({
            coupon_id: 60,
            restaurant_ids: ['aed62a02-15f7-408f-953d-fbd6db0dbf57'],
            mapping_duration: {
              start_time: startDate,
              end_time: endDate,
            },
          });
        expect(response.body.status).toBe(false);
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toStrictEqual([
          {message: 'Invalid coupon Id', code: 1052},
        ]);
      });
      test('Applying Invalid Restaurant ID ', async () => {
        mockgetAdminDetails();
        const response = await request(server)
          .post('/food/admin/coupon/restaurant/optin')
          .set('Authorization', `Bearer ${admin_token}`)
          .send({
            coupon_id: 1,
            restaurant_ids: ['aed62a02-15f7-408f-953d-fbd6db0dbf57'],
            mapping_duration: {
              start_time: 1656328066,
              end_time: 1656331666,
            },
          });
        expect(response.body.status).toBe(false);
        expect(response.statusCode).toBe(400);
      });
      test('Applying Invalid  start_time & end time', async () => {
        const Invalid_start_time = new Date();
        Invalid_start_time.setDate(new Date().getDate() + 1);
        const invalid_epoch_start = Math.floor(
          Invalid_start_time.getTime() / 1000
        );

        const Invalid_end_time = new Date();
        Invalid_end_time.setDate(new Date().getDate() + 2);
        const invalid_epoch_end = Math.floor(Invalid_end_time.getTime() / 1000);

        mockgetAdminDetails();
        const response = await request(server)
          .post('/food/admin/coupon/restaurant/optin')
          .set('Authorization', `Bearer ${admin_token}`)
          .send({
            coupon_id: coupon_2_id,
            restaurant_ids: ['b0909e52-a731-4665-a791-ee6479008805'],
            mapping_duration: {
              start_time: invalid_epoch_start,
              end_time: invalid_epoch_end,
            },
          });
        expect(response.body.status).toBe(false);
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toStrictEqual([
          {
            message: 'mapping duration must exists between coupon duration',
            code: 1071,
          },
        ]);
      });
      //! This test case is commented because optin for taking place two times for same coupon and same duration
      // test('Applying valid start_time & end time', async () => {
      //   mockgetAdminDetails();
      //   const response = await request(server)
      //     .post('/food/admin/coupon/restaurant/optin')
      //     .set('Authorization', `Bearer ${admin_token}`)
      //     .send({
      //       coupon_id: coupon_2_id,
      //       restaurant_ids: ['b0909e52-a731-4665-a791-ee6479008805'],
      //       mapping_duration: {
      //         start_time: startDate,
      //         end_time: endDate,
      //       },
      //     });
      //   expect(response.body.status).toBe(true);
      //   expect(response.statusCode).toBe(200);
      //   expect(response.body.message).toBe('Successful Response');
      // });
      test('Applying valid start_time & end time And Opt-In for Coupon-2', async () => {
        mockgetAdminDetails();
        const response = await request(server)
          .post('/food/admin/coupon/restaurant/optin')
          .set('Authorization', `Bearer ${admin_token}`)
          .send({
            coupon_id: coupon_2_id,
            restaurant_ids: [restaurant_id],
            mapping_duration: {
              start_time: startDate,
              end_time: endDate,
            },
          });
        expect(response.body.status).toBe(true);
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Successful Response');
      });
      test('Opt-In for Coupon-3', async () => {
        // const start_time = new Date();
        // start_time.setDate(new Date().getDate() + 4);
        // const start = start_time.getTime() / 1000.0;

        // const end_time = new Date();
        // end_time.setDate(new Date().getDate() + 8);
        // const end = end_time.getTime() / 1000.0;

        mockgetAdminDetails();

        const response = await request(server)
          .post('/food/admin/coupon/restaurant/optin')
          .set('Authorization', `Bearer ${admin_token}`)
          .send({
            coupon_id: coupon_3_id,
            restaurant_ids: ['b0909e52-a731-4665-a791-ee6479008805'],
            // mapping_duration: {
            //   start_time: start,
            //   end_time: end,
            // },
          });
        expect(response.body.status).toBe(true);
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Successful Response');
        coupon_3_mapping_id = response.body.result.records[0].id;
      });
      // test('Opt-In for Coupon-4', async () => {
      //   const start_time = new Date();
      //   start_time.setDate(new Date().getSeconds() + 3);
      //   const start = start_time.getTime() / 1000.0;

      //   const end_time = new Date();
      //   end_time.setDate(new Date().getDate() + 8);
      //   const end = end_time.getTime() / 1000.0;

      //   mockgetAdminDetails();

      //   const response = await request(server)
      //     .post('/food/admin/coupon/restaurant/optin')
      //     .set('Authorization', `Bearer ${admin_token}`)
      //     .send({
      //       coupon_id: coupon_4_id,
      //       restaurant_ids: ['b0909e52-a731-4665-a791-ee6479008805'],
      //       mapping_duration: {
      //         start_time: start,
      //         end_time: end,
      //       },
      //     });
      //   expect(response.body.status).toBe(true);
      //   expect(response.statusCode).toBe(200);
      //   expect(response.body.message).toBe('Successful Response');
      // });
    });
    describe('OPTOUT', () => {
      test('Check for Invalid Token', async () => {
        mockgetAdminDetails();
        const response = await request(server)
          .post('/food/admin/coupon/restaurant/optout')
          .set('Authorization', `Bearer ${customer_token}`)
          .send({
            coupon_mapping_ids: [0],
            restaurant_ids: [restaurant_id],
          });
        expect(response.statusCode).toBe(403);
      });
      test('When Admin try to Opt-Out Restaurant from coupon which was not Opt-In By Restaurant', async () => {
        mockgetAdminDetails();
        const response = await request(server)
          .post('/food/admin/coupon/restaurant/optout')
          .set('Authorization', `Bearer ${admin_token}`)
          .send({
            coupon_mapping_ids: [1000],
          });
        expect(response.body.status).toBe(true);
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Successful Response');
        expect(response.body.result.total_records_affected).toBe(0);
      });
      test('When Admin Apply Valid Coupon Id with Invalid Restaurant-Id', async () => {
        mockgetAdminDetails();
        const response = await request(server)
          .post('/food/admin/coupon/restaurant/optout')
          .set('Authorization', `Bearer ${admin_token}`)
          .send({
            coupon_mapping_ids: [coupon_3_id],
          });
        expect(response.body.status).toBe(true);
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Successful Response');
        expect(response.body.result.total_records_affected).toBe(0);
      });
      test('When Admin Apply In-Valid Coupon Id with Valid Restaurant-Id', async () => {
        mockgetAdminDetails();
        const response = await request(server)
          .post('/food/admin/coupon/restaurant/optout')
          .set('Authorization', `Bearer ${admin_token}`)
          .send({
            coupon_mapping_ids: [0],
          });
        expect(response.body.status).toBe(true);
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Successful Response');
        expect(response.body.result.total_records_affected).toBe(0);
      });
      test('When Admin Apply Valid Coupon Id with Valid Restaurant-Id', async () => {
        mockgetAdminDetails();
        const response = await request(server)
          .post('/food/admin/coupon/restaurant/optout')
          .set('Authorization', `Bearer ${admin_token}`)
          .send({
            coupon_mapping_ids: [coupon_3_mapping_id],
          });
        expect(response.body.status).toBe(true);
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Successful Response');
        expect(response.body.result.total_records_affected).toBe(1);
        expect(response.body.result.records[0].is_deleted).toBe(true);
      });
    });
    describe('RESTAURANT | FILTER', () => {
      test('Invalid Token Applied', async () => {
        mockgetAdminDetails();
        const response = await request(server)
          .get(`/food/admin/coupon/restaurant/${13456879}`)
          .set('Authorization', `Bearer ${customer_token}`);
        expect(response.statusCode).toBe(403);
      });
      // test('Valid Token Applied | Invalid Restaurant ID', async () => {
      //   mockgetAdminDetails();
      //   const response = await request(server)
      //     .get(`/food/admin/coupon/restaurant/${13456879}`)
      //     .set('Authorization', `Bearer ${admin_token}`);
      //   expect(response.statusCode).toBe(400);
      //   expect(response.body.errors).toStrictEqual([
      //     {message: '"value" must be a valid GUID', code: 1000},
      //   ]);
      // });
      test('Valid Token Applied | Valid Restaurant ID', async () => {
        mockgetAdminDetails();
        const response = await request(server)
          .get(`/food/admin/coupon/restaurant/${restaurant_id}`)
          .set('Authorization', `Bearer ${admin_token}`);
        expect(response.body.status).toBe(true);
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Successful Response');
      });
    });
    describe('GET COUPON BY ID', () => {
      test('InValid Token', async () => {
        mockGetRestaurantVendors();
        const response = await request(server)
          .get(`/food/admin/coupon/${1}`)
          .set('Authorization', `Bearer ${customer_token}`);
        expect(response.statusCode).toBe(403);
        expect(response.body.status).toBe(false);
      });
      test('Valid Token | Invalid Coupon ID', async () => {
        mockGetRestaurantVendors();
        const response = await request(server)
          .get(`/food/admin/coupon/${200}`)
          .set('Authorization', `Bearer ${admin_token}`);
        expect(response.statusCode).toBe(400);
        expect(response.body.status).toBe(false);
        expect(response.body.errors).toStrictEqual([
          {
            message: 'Invalid coupon id',
            code: 1052,
          },
        ]);
      });
      test('Valid Token | Valid Coupon ID ', async () => {
        mockGetRestaurantVendors();
        const response = await request(server)
          .get(`/food/admin/coupon/${2}`)
          .set('Authorization', `Bearer ${admin_token}`);
        expect(response.body.status).toBe(true);
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Successful Response');
        expect(response.body.result.coupon_details.id).toBe(2);
      });
      test('Get Coupon 1', async () => {
        mockgetAdminDetails();
        mockGetRestaurantVendors();
        const response = await request(server)
          .get(`/food/admin/coupon/${1}`)
          .set('Authorization', `Bearer ${admin_token}`);
        expect(response.body.status).toBe(true);
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Successful Response');
        expect(response.body.result.coupon_details.id).toBe(1);
        expect(response.body.result.coupon_details.code).toBe('40%OFF');
      });
    });
    describe('GET COUPON BY RESTAURANT ID', () => {
      test('Check for Invalid Token', async () => {
        mockgetAdminDetails();
        const response = await request(server)
          .get(`/food/admin/coupon/restaurant/${restaurant_id}`)
          .set('Authorization', `Bearer ${customer_token}`);
        expect(response.statusCode).toBe(403);
      });
      test('Check for Invalid Restaurant-Id', async () => {
        mockgetAdminDetails();
        const response = await request(server)
          .get(`/food/admin/coupon/restaurant/${invalid_restaurnat_id}`)
          .set('Authorization', `Bearer ${admin_token}`);
        expect(response.body.status).toBe(true);
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Successful Response');
        //expect(response.body.result.total_records_affected).toBe(0);
      });
      test('Check for Valid Restaurant-Id', async () => {
        mockgetAdminDetails();
        const response = await request(server)
          .get(`/food/admin/coupon/restaurant/${restaurant_id}`)
          .set('Authorization', `Bearer ${admin_token}`);
        expect(response.body.status).toBe(true);
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Successful Response');
      });
    });
  });
  describe('VENDOR', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let coupon_id: string;
    describe('CREATE', () => {
      test('Invalid Token Applied', async () => {
        const response = await request(server)
          .post('/food/vendor/coupon')
          .set('Authorization', `Bearer ${customer_token}`)
          .send(vendor_coupon_request_body);
        expect(response.statusCode).toBe(403);
      });
      test('Empty code', async () => {
        vendor_coupon_request_body.code = '';
        const response = await request(server)
          .post('/food/vendor/coupon')
          .set('Authorization', `Bearer ${vendor_token}`)
          .send(vendor_coupon_request_body);
        expect(response.body.status).toBe(false);
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toStrictEqual([
          {message: 'Please add Coupon code', code: 1000},
        ]);
        vendor_coupon_request_body.code = 'SUPER-20';
      });
      test('Added Coupon code | Empty Header', async () => {
        const response = await request(server)
          .post('/food/vendor/coupon')
          .set('Authorization', `Bearer ${vendor_token}`)
          .send(vendor_coupon_request_body);
        expect(response.body.status).toBe(false);
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toStrictEqual([
          {message: 'Header cannot be Empty', code: 1000},
        ]);
      });
      test('Added Header | Empty Description', async () => {
        vendor_coupon_request_body.header = 'Get 20% Cashback';
        const response = await request(server)
          .post('/food/vendor/coupon')
          .set('Authorization', `Bearer ${vendor_token}`)
          .send(vendor_coupon_request_body);
        expect(response.body.status).toBe(false);
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toStrictEqual([
          {message: 'Description cannot be Empty', code: 1000},
        ]);
      });
      test('Added Description | Empty Terms & conditions', async () => {
        vendor_coupon_request_body.description =
          'All new user can get 20% cashback on thier first order';
        const response = await request(server)
          .post('/food/vendor/coupon')
          .set('Authorization', `Bearer ${vendor_token}`)
          .send(vendor_coupon_request_body);
        expect(response.body.status).toBe(false);
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toStrictEqual([
          {message: 'Terms and Conditions cannot be empty', code: 1000},
        ]);
      });
      test('Added Terms & conditions | Empty Type', async () => {
        vendor_coupon_request_body.terms_and_conditions =
          'Terms & Conditions Apply 1. Applicable only for order above 100rs';
        const response = await request(server)
          .post('/food/vendor/coupon')
          .set('Authorization', `Bearer ${vendor_token}`)
          .send(vendor_coupon_request_body);
        expect(response.body.status).toBe(false);
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toStrictEqual([
          {message: '"type" must be one of [upto, flat]', code: 1000},
        ]);
      });
      test('Added Type | Other that upto, flat| Empty Level', async () => {
        vendor_coupon_request_body.type = 'discount';
        const response = await request(server)
          .post('/food/vendor/coupon')
          .set('Authorization', `Bearer ${vendor_token}`)
          .send(vendor_coupon_request_body);
        expect(response.body.status).toBe(false);
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toStrictEqual([
          {message: '"type" must be one of [upto, flat]', code: 1000},
        ]);
      });
      test('Added Type ', async () => {
        vendor_coupon_request_body.type = 'upto';
        const response = await request(server)
          .post('/food/vendor/coupon')
          .set('Authorization', `Bearer ${vendor_token}`)
          .send(vendor_coupon_request_body);
        expect(response.body.status).toBe(false);
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toStrictEqual([
          {
            message: 'coupon start time should be greater than current time',
            code: 1066,
          },
        ]);
      });
      test('Adding discount_percentage to Be Negative value | Invalid epoch', async () => {
        vendor_coupon_request_body.discount_percentage = -100;
        const response = await request(server)
          .post('/food/vendor/coupon')
          .set('Authorization', `Bearer ${vendor_token}`)
          .send(vendor_coupon_request_body);
        expect(response.body.status).toBe(false);
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toStrictEqual([
          {
            message: '"discount_percentage" must be greater than or equal to 1',
            code: 1000,
          },
        ]);
        vendor_coupon_request_body.discount_percentage = 20;
      });
      test('Adding Previous Day epoch time | It should Throw error.', async () => {
        vendor_coupon_request_body.start_time = Previous_Day_epoch_start;
        vendor_coupon_request_body.end_time = Previous_Day_epoch_end;
        const response = await request(server)
          .post('/food/vendor/coupon')
          .set('Authorization', `Bearer ${vendor_token}`)
          .send(vendor_coupon_request_body);
        expect(response.body.status).toBe(false);
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toStrictEqual([
          {
            message: 'coupon start time should be greater than current time',
            code: 1066,
          },
        ]);
      });
      test('Adding New epoch time', async () => {
        vendor_coupon_request_body.code = coupon_name;
        vendor_coupon_request_body.start_time = vendor_startDate;
        vendor_coupon_request_body.end_time = vendor_endDate;
        const response = await request(server)
          .post('/food/vendor/coupon')
          .set('Authorization', `Bearer ${vendor_token}`)
          .send(vendor_coupon_request_body);
        expect(response.body.status).toBe(true);
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Successful Response');
        expect(response.body.result.coupon_details.code).toBe(coupon_name);
        coupon_id = response.body.result.coupon_details.id;
      });
    });
    describe('FILTER', () => {
      test('Invalid Token Applied', async () => {
        const response = await request(server)
          .post('/food/vendor/coupon/filter')
          .set('Authorization', `Bearer ${customer_token}`)
          .send(vendor_coupon_request_body);
        expect(response.statusCode).toBe(403);
      });
      test('Empty Test On search_text', async () => {
        mockGetRestaurantVendors();
        const response = await request(server)
          .post('/food/vendor/coupon/filter')
          .set('Authorization', `Bearer ${vendor_token}`)
          .send({
            search_text: ' ',
            filter: {
              type: 'upto',
              max_use_count: 1,
              duration: {
                start_date: 1656413597,
                end_date: 1656413609,
              },
            },
            pagination: {
              page_index: 1,
              page_size: 5,
            },
          });
        expect(response.body.status).toBe(true);
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Successful Response');
      });
      test('Coupon Id On search_text', async () => {
        mockGetRestaurantVendors();
        const response = await request(server)
          .post('/food/vendor/coupon/filter')
          .set('Authorization', `Bearer ${vendor_token}`)
          .send({
            search_text: '1',
          });
        expect(response.body.status).toBe(true);
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Successful Response');
        expect(response.body.result.records).not.toEqual({});
        //const record = response.body.result.records;
        //expect(record).toBe([{id: '1', code: coupon_name}]);
        //expect(record).toBe([{code: coupon_name}]);
      });
      test('search_text by coupon_name', async () => {
        mockGetRestaurantVendors();
        const response = await request(server)
          .post('/food/vendor/coupon/filter')
          .set('Authorization', `Bearer ${vendor_token}`)
          .send({
            search_text: coupon_name,
          });
        expect(response.body.status).toBe(true);
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Successful Response');
        expect(response.body.result.records).not.toEqual({});
      });
      test('Invalid search_text', async () => {
        mockGetRestaurantVendors();
        const response = await request(server)
          .post('/food/vendor/coupon/filter')
          .set('Authorization', `Bearer ${vendor_token}`)
          .send({
            search_text: "SPEDYY's COUPON",
          });
        expect(response.body.status).toBe(true);
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Successful Response');
      });
    });
    describe('OPTIN', () => {
      test('Invalid Token Applied', async () => {
        const response = await request(server)
          .post('/food/vendor/coupon/optin')
          .set('Authorization', `Bearer ${customer_token}`)
          .send(vendor_coupon_request_body);
        expect(response.statusCode).toBe(403);
      });
      test('Invalid Coupon Id Applied', async () => {
        const response = await request(server)
          .post('/food/vendor/coupon/restaurant/optin')
          .set('Authorization', `Bearer ${vendor_token}`)
          .send({
            coupon_id: '60',
            mapping_duration: {
              start_time: startDate,
              end_time: endDate,
            },
          });
        expect(response.body.status).toBe(false);
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toStrictEqual([
          {message: 'Invalid coupon Id', code: 1052},
        ]);
      });
      test('Invalid Start_time Applied', async () => {
        const Invalid_start_time = new Date();
        Invalid_start_time.setDate(new Date().getDate() + 1);
        const invalid_epoch_start = Math.floor(
          Invalid_start_time.getTime() / 1000
        );

        const Invalid_end_time = new Date();
        Invalid_end_time.setDate(new Date().getDate() + 2);
        const invalid_epoch_end = Math.floor(Invalid_end_time.getTime() / 1000);

        const response = await request(server)
          .post('/food/vendor/coupon/restaurant/optin')
          .set('Authorization', `Bearer ${vendor_token}`)
          .send({
            coupon_id: opt_in_id,
            mapping_duration: {
              start_time: invalid_epoch_start,
              end_time: invalid_epoch_end,
            },
          });
        expect(response.body.status).toBe(false);
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toStrictEqual([
          {
            message: 'mapping duration must exists between coupon duration',
            code: 1071,
          },
        ]);
      });
      test('Valid Coupon Id Applied', async () => {
        const response = await request(server)
          .post('/food/vendor/coupon/restaurant/optin')
          .set('Authorization', `Bearer ${vendor_token}`)
          .send({
            coupon_id: opt_in_id,
            mapping_duration: {
              start_time: startDate,
              end_time: endDate,
            },
          });
        expect(response.body.status).toBe(true);
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Successful Response');
      });
      describe('RESTAURANT COUPON FILTER', () => {
        test('Invalid search_text', async () => {
          mockGetRestaurantVendors();
          const response = await request(server)
            .post('/food/vendor/coupon/restaurant/filter')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              search_text: "SPEDYY's COUPON",
            });
          expect(response.body.status).toBe(true);
          expect(response.statusCode).toBe(200);
          expect(response.body.message).toBe('Successful Response');
        });
        test('Valid search_text', async () => {
          mockGetRestaurantVendors();
          const response = await request(server)
            .post('/food/vendor/coupon/restaurant/filter')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              search_text: opt_in_id.toString(),
            });
          expect(response.body.status).toBe(true);
          expect(response.statusCode).toBe(200);
          expect(response.body.result.total_records).toEqual(2);
          expect(response.body.message).toBe('Successful Response');
        });
      });
    });
    describe('OPTOUT', () => {});
    describe('AVILABLE FOR OPTIN', () => {
      test('InValid Token', async () => {
        mockGetRestaurantVendors();
        const response = await request(server)
          .get('/food/vendor/coupon/available_for_optin')
          .set('Authorization', `Bearer ${customer_token}`);
        expect(response.statusCode).toBe(403);
        expect(response.body.status).toBe(false);
      });
      test('Valid Token', async () => {
        mockGetRestaurantVendors();
        const response = await request(server)
          .get('/food/vendor/coupon/available_for_optin')
          .set('Authorization', `Bearer ${vendor_token}`);
        expect(response.body.status).toBe(true);
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Successful Response');
        expect(response.body.result.coupons).not.toEqual({});
      });
    });
    describe('SEQUENCE', () => {
      test('Invalid Token Applied', async () => {
        const response = await request(server)
          .put('/food/vendor/coupon/restaurant/sequence')
          .set('Authorization', `Bearer ${customer_token}`)
          .send({
            coupon_mappings: [
              {
                id: 20,
                sequence: 1,
              },
            ],
          });
        expect(response.statusCode).toBe(403);
      });
      test('Invalid Coupon Id Applied | Need to return empty response', async () => {
        const response = await request(server)
          .put('/food/vendor/coupon/restaurant/sequence')
          .set('Authorization', `Bearer ${vendor_token}`)
          .send({
            coupon_mappings: [
              {
                id: 20,
                sequence: 1,
              },
            ],
          });
        expect(response.body.status).toBe(true);
        expect(response.statusCode).toBe(200);
        expect(response.body.result).toStrictEqual({
          total_records_affected: 0,
          records: [],
        });
      });
      test('Invalid Sequence Id Applied | Need to throw error', async () => {
        const response = await request(server)
          .put('/food/vendor/coupon/restaurant/sequence')
          .set('Authorization', `Bearer ${vendor_token}`)
          .send({
            coupon_mappings: [
              {
                id: 9000,
                sequence: -1,
              },
            ],
          });
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toStrictEqual([
          {
            message:
              '"coupon_mappings[0].sequence" must be greater than or equal to 1',
            code: 1000,
          },
        ]);
      });
      test('Valid Coupon Mapping Id And Valid Sequence Id Applied', async () => {
        const response = await request(server)
          .put('/food/vendor/coupon/restaurant/sequence')
          .set('Authorization', `Bearer ${vendor_token}`)
          .send({
            coupon_mappings: [
              {
                id: 400,
                sequence: 1,
              },
            ],
          });
        expect(response.statusCode).toBe(200);
        expect(response.body.status).toBe(true);
        expect(response.body.result.records[0].id).toBe(400);
        expect(response.body.result.records[0].sequence).toBe(1);

        const coupons = (await DB.read('coupon_vendor').where({id: 400}))[0];
        expect(coupons).toStrictEqual({
          id: 400,
          coupon_id: 9000,
          start_time: expect.anything(),
          end_time: expect.anything(),
          restaurant_id: 'b0909e52-a731-4665-a791-ee6479008805',
          mapped_by: 'admin',
          mapped_by_user_id: '64bfafb6-c273-4b64-a0fc-ca981f5819eb',
          is_deleted: false,
          created_at: expect.anything(),
          updated_at: expect.anything(),
          sequence: 1,
        });
      });
    });
  });
  describe('CUSTOMER', () => {
    describe('GET COUPONS BY RESTAURANT ID', () => {
      test('Invalid Token Applied', async () => {
        mockgetAdminDetails();
        const response = await request(server)
          .get(`/food/coupon/${invalid_restaurnat_id}`)
          .set('Authorization', `Bearer ${vendor_token}`);
        expect(response.statusCode).toBe(403);
      });
      test('Invalid RestaurantId Applied', async () => {
        mockgetAdminDetails();
        const response = await request(server)
          .get(`/food/coupon/${invalid_restaurnat_id}`)
          .set('Authorization', `Bearer ${vendor_token}`);
        expect(response.statusCode).toBe(403);
      });
      test('Valid Restaurant Id Applied', async () => {
        mockgetAdminDetails();
        const response = await request(server)
          .get(`/food/coupon/${restaurant_id}`)
          .set('Authorization', `Bearer ${vendor_token}`);
        expect(response.statusCode).toBe(403);
      });
    });
  });
});

describe('Scenerios', () => {
  describe('Coupon with same name and same time cannot be re-created by admin or vendor', () => {
    const start_time = new Date();
    start_time.setDate(new Date().getDate() + 5);
    const start = start_time.getTime() / 1000.0;

    const end_time = new Date();
    end_time.setDate(new Date().getDate() + 10);
    const end = end_time.getTime() / 1000.0;

    test('Coupon-1 Created By Admin ', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .post('/food/admin/coupon')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          code: 'COUPON-1',
          header: 'Get 20% Cashback',
          description: 'All new user can get 20% cashback on thier first order',
          terms_and_conditions:
            'Terms & Conditions Apply 1. Applicable only for order above 100rs',
          type: 'upto',
          discount_percentage: 20,
          start_time: start,
          end_time: end,
          level: 'global',
          max_use_count: 1,
          min_order_value_rupees: 100,
          max_discount_rupees: 20,
          discount_share_percent: 0,
        });
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Successful Response');
    });
    test('Creating same coupon with same code and same intevral and end time | Need to Throw Error', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .post('/food/admin/coupon')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          code: 'COUPON-1',
          header: 'Get 20% Cashback',
          description: 'All new user can get 20% cashback on thier first order',
          terms_and_conditions:
            'Terms & Conditions Apply 1. Applicable only for order above 100rs',
          type: 'upto',
          discount_percentage: 20,
          start_time: start,
          end_time: end,
          level: 'global',
          max_use_count: 1,
          min_order_value_rupees: 100,
          max_discount_rupees: 20,
          discount_share_percent: 0,
        });
      expect(response.body.status).toBe(false);
      expect(response.statusCode).toBe(400);
      expect(response.body.errors).toStrictEqual([
        {
          message: 'coupon already exists in selected coupon duration',
          code: 1051,
        },
      ]);
    });
    test('Creating same coupon with same code and same intevral | Coupon Created  By Vendor | Need to Throw Error', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .post('/food/vendor/coupon')
        .set('Authorization', `Bearer ${vendor_token}`)
        .send({
          code: 'COUPON-1',
          header: 'Get 20% Cashback',
          description: 'All new user can get 20% cashback on thier first order',
          terms_and_conditions:
            'Terms & Conditions Apply 1. Applicable only for order above 100rs',
          type: 'upto',
          discount_percentage: 20,
          start_time: start,
          end_time: end,
          max_use_count: 1,
          min_order_value_rupees: 100,
          max_discount_rupees: 20,
        });
      expect(response.body.status).toBe(false);
      expect(response.statusCode).toBe(400);
      expect(response.body.errors).toStrictEqual([
        {
          message: 'coupon already exists in selected coupon duration',
          code: 1051,
        },
      ]);
    });
  });
  describe('cannot create same coupon whose time is start_time and end_time are overlapping the Existing coupon', () => {
    const start_time = new Date();
    start_time.setDate(new Date().getDate() + 3);
    const start = start_time.getTime() / 1000;

    const end_time = new Date();
    end_time.setDate(new Date().getDate() + 8);
    const end = end_time.getTime() / 1000;

    const overlap_start_time = new Date();
    overlap_start_time.setDate(new Date().getDate() + 5);
    const overalap_start = overlap_start_time.getTime() / 1000;

    const overlap_end_time = new Date();
    overlap_end_time.setDate(new Date().getDate() + 10);
    const overlap_end = overlap_end_time.getTime() / 1000;

    test('Coupon-OT Created By Admin ', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .post('/food/admin/coupon')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          code: 'COUPON-OT',
          header: 'Get 20% Cashback',
          description: 'All new user can get 20% cashback on thier first order',
          terms_and_conditions:
            'Terms & Conditions Apply 1. Applicable only for order above 100rs',
          type: 'upto',
          discount_percentage: 20,
          start_time: start,
          end_time: end,
          level: 'global',
          max_use_count: 1,
          min_order_value_rupees: 100,
          max_discount_rupees: 20,
          discount_share_percent: 0,
        });
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Successful Response');
    });
    test('Creating Overlapping Coupon with same details', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .post('/food/admin/coupon')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          code: 'COUPON-OT',
          header: 'Get 20% Cashback',
          description: 'All new user can get 20% cashback on thier first order',
          terms_and_conditions:
            'Terms & Conditions Apply 1. Applicable only for order above 100rs',
          type: 'upto',
          discount_percentage: 20,
          start_time: overalap_start,
          end_time: overlap_end,
          level: 'global',
          max_use_count: 1,
          min_order_value_rupees: 100,
          max_discount_rupees: 20,
          discount_share_percent: 0,
        });
      expect(response.body.status).toBe(false);
      expect(response.statusCode).toBe(400);
      expect(response.body.errors).toStrictEqual([
        {
          message: 'coupon already exists in selected coupon duration',
          code: 1051,
        },
      ]);
    });
  });
  describe('we can create coupon for future and restaurant can optin for coupon | But customer cannot see coupon', () => {
    const start_time = new Date();
    start_time.setDate(new Date().getDate() + 5);
    const start = start_time.getTime() / 1000.0;

    const end_time = new Date();
    end_time.setDate(new Date().getDate() + 10);
    const end = end_time.getTime() / 1000.0;

    let coupon_id_X: string;

    test('Coupon-X Created By Admin ', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .post('/food/admin/coupon')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          code: 'COUPON-X',
          header: 'Get 20% Cashback',
          description: 'All new user can get 20% cashback on thier first order',
          terms_and_conditions:
            'Terms & Conditions Apply 1. Applicable only for order above 100rs',
          type: 'upto',
          discount_percentage: 20,
          start_time: start,
          end_time: end,
          level: 'restaurant',
          max_use_count: 1,
          min_order_value_rupees: 100,
          max_discount_rupees: 20,
          discount_share_percent: 0,
        });
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Successful Response');
      coupon_id_X = response.body.result.coupon_details.id;
    });
    test('Coupon-X opt-In By Admin for Vendor', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .post('/food/admin/coupon/restaurant/optin')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          coupon_id: coupon_id_X,
          restaurant_ids: ['b0909e52-a731-4665-a791-ee6479008805'],
          mapping_duration: {
            start_time: start,
            end_time: end,
          },
        });
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Successful Response');
    });
    test('Coupon-X cannot seen to Customer', async () => {
      const response = await request(server)
        .get(`/food/coupon/${restaurant_id}`)
        .set('Authorization', `Bearer ${customer_token}`);
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Successful Response');
      expect(response.body.result.total_records_found).toBeGreaterThan(1);
      expect(response.body.result.coupons).not.toBe([{code: 'COUPON - X'}]);
    });
  });
  describe('if coupon level is global then vendor can not optIn.| But Customer can use coupon', () => {
    mockGetRestaurantVendors();

    const start_time = new Date();
    start_time.setDate(new Date().getDate() + 5);
    const start = start_time.getTime() / 1000.0;

    const end_time = new Date();
    end_time.setDate(new Date().getDate() + 10);
    const end = end_time.getTime() / 1000.0;

    let opt_in_id_vendor: number;

    test('Coupon Created By Admin ', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .post('/food/admin/coupon')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          code: 'Customer-Coupon',
          header: 'Get 20% Cashback',
          description: 'All new user can get 20% cashback on thier first order',
          terms_and_conditions:
            'Terms & Conditions Apply 1. Applicable only for order above 100rs',
          type: 'upto',
          discount_percentage: 20,
          start_time: start,
          end_time: end,
          level: 'global',
          max_use_count: 1,
          min_order_value_rupees: 100,
          max_discount_rupees: 20,
          discount_share_percent: 0,
        });
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Successful Response');
      opt_in_id_vendor = response.body.result.coupon_details.id;
    });
    test('Valid Coupon Id Applied', async () => {
      const response = await request(server)
        .post('/food/vendor/coupon/restaurant/optin')
        .set('Authorization', `Bearer ${vendor_token}`)
        .send({
          coupon_id: opt_in_id_vendor,
        });
      expect(response.body.status).toBe(false);
      expect(response.statusCode).toBe(400);
      expect(response.body.errors).toStrictEqual([
        {message: 'Invalid coupon Id', code: 1052},
      ]);
    });
    test('Coupon can be used by Customer', async () => {
      const response = await request(server)
        .get(`/food/coupon/${restaurant_id}`)
        .set('Authorization', `Bearer ${customer_token}`);
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Successful Response');
    });
  });
  describe('Global level coupon can not be created by vendor and can be only created by admin', () => {
    test('Creating Coupon with Global level |  Need to throw error.', async () => {
      const start_time = new Date();
      start_time.setDate(new Date().getDate() + 5);
      const start = start_time.getTime() / 1000.0;

      const end_time = new Date();
      end_time.setDate(new Date().getDate() + 10);
      const end = end_time.getTime() / 1000.0;

      const response = await request(server)
        .post('/food/vendor/coupon')
        .set('Authorization', `Bearer ${vendor_token}`)
        .send({
          code: 'SPEEDYY20',
          header: 'Get 20% Cashback',
          description: 'All new user can get 20% cashback on thier first order',
          terms_and_conditions:
            'Terms & Conditions Apply 1. Applicable only for order above 100rs',
          type: 'upto',
          level: 'restaurant',
          discount_percentage: 20,
          start_time: start,
          end_time: end,
          max_use_count: 1,
          min_order_value_rupees: 100,
          max_discount_rupees: 20,
        });
      expect(response.body.status).toBe(false);
      expect(response.statusCode).toBe(400);
      expect(response.body.errors).toStrictEqual([
        {message: '"level" is not allowed', code: 1000},
      ]);
    });
  });
  describe('Global level coupon should not be available for vendor opt in', () => {
    const start_time = new Date();
    start_time.setDate(new Date().getDate() + 15);
    const start = start_time.getTime() / 1000.0;

    const end_time = new Date();
    end_time.setDate(new Date().getDate() + 20);
    const end = end_time.getTime() / 1000.0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let opt_in_id_COUPON_1: any;

    test('Creating Coupon with Global level', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .post('/food/admin/coupon')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          code: 'COUPON-1',
          header: 'Get 20% Cashback',
          description: 'All new user can get 20% cashback on thier first order',
          terms_and_conditions:
            'Terms & Conditions Apply 1. Applicable only for order above 100rs',
          type: 'upto',
          discount_percentage: 20,
          start_time: start,
          end_time: end,
          level: 'global',
          max_use_count: 1,
          min_order_value_rupees: 100,
          max_discount_rupees: 20,
          discount_share_percent: 0,
        });
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Successful Response');
      opt_in_id_COUPON_1 = response.body.result.coupon_details.id;
    });

    test('Vendor Applied Coupon Id of Global Level.', async () => {
      const response = await request(server)
        .post('/food/vendor/coupon/restaurant/optin')
        .set('Authorization', `Bearer ${vendor_token}`)
        .send({
          coupon_id: opt_in_id_COUPON_1,
          mapping_duration: {
            start_time: startDate,
            end_time: endDate,
          },
        });
      expect(response.body.status).toBe(false);
      expect(response.statusCode).toBe(400);
      expect(response.body.errors).toStrictEqual([
        {message: 'Invalid coupon Id', code: 1052},
      ]);
    });
  });
  describe('Global level coupons should be available to all customer with different carts following global coupon criteria', () => {
    const start_time = new Date();
    //Adding mintues to start time
    start_time.setMinutes(start_time.getMinutes() + 1);
    const start = Math.floor(start_time.getTime() / 1000);

    const end_time = new Date();
    end_time.setDate(new Date().getDate() + 18);
    const end = Math.floor(end_time.getTime() / 1000);

    // let opt_in_id_COUPON_1: any;

    test('Creating Coupon with Global level', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .post('/food/admin/coupon')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          code: 'GLOBALCOUPON',
          header: 'Get 20% Cashback',
          description: 'All new user can get 20% cashback on thier first order',
          terms_and_conditions:
            'Terms & Conditions Apply 1. Applicable only for order above 100rs',
          type: 'upto',
          discount_percentage: 20,
          start_time: start,
          end_time: end,
          level: 'global',
          max_use_count: 1,
          min_order_value_rupees: 100,
          max_discount_rupees: 20,
          discount_share_percent: 0,
        });
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Successful Response');
      //opt_in_id_COUPON_1 = response.body.result.coupon_details.id;
    });
    test('Coupon can be used by Customer', async () => {
      const response = await request(server)
        .get(`/food/coupon/${restaurant_id}`)
        .set('Authorization', `Bearer ${customer_token}`);
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Successful Response');
    });
  });
  describe('Admin can map vendor to active coupon only', () => {
    test('Opt In for Expired Coupon. | Need to throw error.', async () => {
      const start_time = new Date();
      start_time.setDate(new Date().getDate() + 4);
      const start = start_time.getTime() / 1000.0;

      const end_time = new Date();
      end_time.setDate(new Date().getDate() + 8);
      const end = end_time.getTime() / 1000.0;

      mockgetAdminDetails();

      const response = await request(server)
        .post('/food/admin/coupon/restaurant/optin')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          coupon_id: 1234,
          restaurant_ids: ['b0909e52-a731-4665-a791-ee6479008805'],
          mapping_duration: {
            start_time: start,
            end_time: end,
          },
        });
      expect(response.body.status).toBe(false);
      expect(response.statusCode).toBe(400);
      expect(response.body.errors).toStrictEqual([
        {message: 'Invalid coupon Id', code: 1052},
      ]);
    });
  });
  describe('Admin tries to Opt-In Coupon-A to another restaurant', () => {
    test('Need To Throw Error', async () => {
      /*============================
         *COUPON-A CREATED BY VENDOR
      ==============================*/
      const create_coupon_as_vendor = await request(server)
        .post('/food/vendor/coupon')
        .set('Authorization', `Bearer ${vendor_two_token}`)
        .send({
          code: 'COUPON-A',
          header: 'Vendor Coupon',
          description: 'none----',
          terms_and_conditions: 'none----',
          type: 'flat',
          discount_percentage: 10,
          start_time: vendor_startDate,
          end_time: vendor_endDate,
          max_use_count: 1,
          min_order_value_rupees: 100,
          max_discount_rupees: 20,
        });
      expect(create_coupon_as_vendor.body.status).toBe(true);
      expect(create_coupon_as_vendor.statusCode).toBe(200);
      expect(create_coupon_as_vendor.body.message).toBe('Successful Response');
      expect(create_coupon_as_vendor.body.result.coupon_details.code).toBe(
        'COUPON-A'
      );
      mockGetRestaurantVendors();
      mockgetAdminDetails();
      const opt_in_as_admin = await request(server)
        .post('/food/admin/coupon/restaurant/optin')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          coupon_id: create_coupon_as_vendor.body.result.coupon_details.id,
          restaurant_ids: [restaurant_id],
        });
      expect(opt_in_as_admin.body.status).toBe(false);
      expect(opt_in_as_admin.body.statusCode).toBe(400);
      expect(opt_in_as_admin.body.errors).toStrictEqual([
        {
          message:
            'restaurant or restaurants can not be mapped to coupon created by another restaurant',
          code: 1053,
        },
      ]);
    });
  });
});

describe('Test case for POST food/admin/coupon/restaurant/filter', () => {
  test('Check Restaurant Name and Coupon Code In Responce', async () => {
    mockgetAdminDetails();
    const response = await request(server)
      .post('/food/admin/coupon/restaurant/filter')
      .set('Authorization', `Bearer ${admin_token}`)
      .send({
        filter: {
          restaurant_id: restaurant_id,
        },
        pagination: {
          page_index: 1,
          page_size: 5,
        },
      });
    expect(response.body.status).toBe(true);
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Successful Response');
    expect(response.body.result.records).not.toBe({});
    expect(response.body.result.records[0].coupon_id).toBe(2000);
    expect(response.body.result.records[0].coupon_code).toBe('ExpiredCoupon');
    expect(response.body.result.records[0].restaurant_id).toBe(
      'b0909e52-a731-4665-a791-ee6479008805'
    );
    expect(response.body.result.records[0].restaurant_name).toBe('Burger King');
  });
});

//const now = moment().format('DD/MM/YYYY HH:mm:ss A');

//Global level coupon can not be created by vendor and can be only created by admin
//Global level coupon should not be available for vendor opt in
//Global level coupons should be available to all customer with different carts following global coupon criteria
//Restaurant level coupons created by Admin should be available for vendor opt in
//Restaurant level coupons created by Vendor should by default have a mapping because they are created by vendor itself
//Any coupon created at any interval its mapping should exist between coupon interval or be equal to coupon interval
//Duplicate coupon code can not exits in same time interval
//If customer applies an expired coupon it should throw error  //On Cart.test.ts
//vendor can only opt in to active coupons and not expired coupons
//Admin can map vendor to active coupon only
//Admin can only map vendors to Restaurant level coupons created by Admin and not by Vendor
//Check discount value of coupon and check if that discount is being applied on cart items or not // On Cart.test.ts
//In cart try to add a Restaurant 1 coupon for Restaurant 2 menu items, it should throw error // On Cart.test.ts
//While applying coupons check if cart items fulfil all coupon criteria like minimum order value, max discount //On Cart.test.ts
//Create restaurant level coupon with 20% of and 10% is paid by speedyy and 10% is paid for restaurant that opts in check
//   if customer gets 20 % and 10% each goes to speedy and vendor discount share //On Cart.test.ts
//If a coupon can be used once then try to re apply same coupon in customer cart and it should throw error // On Cart.test.ts
//If a coupon can be used multiple times and it will have coupon use interval is mins. //On Cart.test.ts and coupon.test.ts
//Try to apply coupon before interval - it should throw error after interval it should be applicable . Also check if coupon_customer table has updated coupon use count for that specific user.
