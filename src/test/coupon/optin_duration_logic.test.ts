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
import {CouponLevel, CouponType} from '../../module/food/coupons/enum';
import moment from 'moment';
import {ICoupon} from '../../module/food/coupons/types';

jest.mock('axios');

let server: Application;
let admin_token: string;
let vendor_token: string;
const restaurant_id = '77e53c1f-6e9e-4724-9ba7-92edc69cff6b';
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

describe('Testing coupon optin logic', () => {
  //! coupon optin duration is same as coupon duration
  /**
   * !      coupon_start |----------| coupon_end
   * !      optin_start  |----------| optin_end
   * */

  /**
   * ?1. create coupon as admin at restaurant level
   * ?2. optin to the above coupon as vendor with optin duration same and coupon duration
   * ?3. again optin in the same coupon with same duration (i.e coupon duration) and it should
   * ?   throw error because mapping alread exists
   */
  test('optin duration === coupon duration', async () => {
    const coupon_start_time = moment().add(1, 'hours').unix();
    const coupon_end_time = moment().add(2, 'hours').unix();
    mockgetAdminDetails();
    const response = await request(server)
      .post('/food/admin/coupon')
      .set('Authorization', `Bearer ${admin_token}`)
      .send({
        code: 'COUPON_1',
        header: 'coupon header',
        description: 'coupon description',
        terms_and_conditions: 'coupon t&c',
        type: CouponType.UPTO,
        discount_percentage: 20,
        start_time: coupon_start_time,
        end_time: coupon_end_time,
        level: CouponLevel.RESTAURANT,
        max_use_count: 1,
        min_order_value_rupees: 100,
        max_discount_rupees: 20,
        discount_share_percent: 100,
        discount_sponsered_by: 'restaurant',
      });
    expect(response.body.status).toBe(true);
    expect(response.statusCode).toBe(200);
    expect(response.body.result.coupon_details.code).toBe('COUPON_1');
    const coupon: ICoupon = response.body.result.coupon_details;

    const optin_response_1 = await request(server)
      .post('/food/vendor/coupon/restaurant/optin')
      .set('Authorization', `Bearer ${vendor_token}`)
      .send({
        coupon_id: coupon.id,
        mapping_duration: {
          start_time: coupon_start_time,
          end_time: coupon_end_time,
        },
      });

    expect(optin_response_1.statusCode).toBe(200);
    expect(optin_response_1.body.status).toBe(true);

    const optin_response_2 = await request(server)
      .post('/food/vendor/coupon/restaurant/optin')
      .set('Authorization', `Bearer ${vendor_token}`)
      .send({
        coupon_id: coupon.id,
        mapping_duration: {
          start_time: coupon_start_time,
          end_time: coupon_end_time,
        },
      });
    expect(optin_response_2.statusCode).toBe(400);
    expect(optin_response_2.body.status).toBe(false);
    expect(optin_response_2.body.errors).toStrictEqual([
      {message: 'Coupon mapping already exists', code: 0},
    ]);
  });

  //! coupon optin duration time is less than coupon duration time
  /**
   * !                                             coupon_start |----------| coupon_end
   * !      optin_start  |----------| optin_end
   * */

  /**
   * ?1. create coupon as admin at restaurant level
   * ?2. optin to the above coupon as vendor with optin duration less than actual coupon start duration
   * ?   optin should fail because coupon optin durations can only exist between the coupon duration
   */
  test('optin duration is less than coupon start duration which should throw error', async () => {
    const coupon_start_time = moment().add(1, 'hours').unix();
    const coupon_end_time = moment().add(2, 'hours').unix();
    mockgetAdminDetails();
    const response = await request(server)
      .post('/food/admin/coupon')
      .set('Authorization', `Bearer ${admin_token}`)
      .send({
        code: 'COUPON_2',
        header: 'coupon header',
        description: 'coupon description',
        terms_and_conditions: 'coupon t&c',
        type: CouponType.UPTO,
        discount_percentage: 20,
        start_time: coupon_start_time,
        end_time: coupon_end_time,
        level: CouponLevel.RESTAURANT,
        max_use_count: 1,
        min_order_value_rupees: 100,
        max_discount_rupees: 20,
        discount_share_percent: 100,
        discount_sponsered_by: 'restaurant',
      });
    expect(response.body.status).toBe(true);
    expect(response.statusCode).toBe(200);
    expect(response.body.result.coupon_details.code).toBe('COUPON_2');
    const coupon: ICoupon = response.body.result.coupon_details;

    const optin_start_duration = moment
      .unix(coupon_start_time)
      .subtract('40', 'minutes')
      .unix();
    const optin_end_duration = moment
      .unix(coupon_start_time)
      .subtract('30', 'minutes')
      .unix();
    const optin_response_1 = await request(server)
      .post('/food/vendor/coupon/restaurant/optin')
      .set('Authorization', `Bearer ${vendor_token}`)
      .send({
        coupon_id: coupon.id,
        mapping_duration: {
          start_time: optin_start_duration,
          end_time: optin_end_duration,
        },
      });
    expect(optin_response_1.statusCode).toBe(400);
    expect(optin_response_1.body.status).toBe(false);
    expect(optin_response_1.body.errors).toStrictEqual([
      {
        message: 'mapping duration must exists between coupon duration',
        code: 1071,
      },
    ]);
  });

  //! coupon optin duration time is more than coupon duration time
  /**
   * !      coupon_start |----------| coupon_end
   * !                                              optin_start  |----------| optin_end
   * */
  /**
   * ?1. create coupon as admin at restaurant level
   * ?2. optin to the above coupon as vendor with optin duration more than actual coupon start duration
   * ?   optin should fail because coupon optin durations can only exist between the coupon duration
   */
  test('optin duration is more than coupon end duration which should throw error', async () => {
    const coupon_start_time = moment().add(1, 'hours').unix();
    const coupon_end_time = moment().add(2, 'hours').unix();
    mockgetAdminDetails();
    const response = await request(server)
      .post('/food/admin/coupon')
      .set('Authorization', `Bearer ${admin_token}`)
      .send({
        code: 'COUPON_3',
        header: 'coupon header',
        description: 'coupon description',
        terms_and_conditions: 'coupon t&c',
        type: CouponType.UPTO,
        discount_percentage: 20,
        start_time: coupon_start_time,
        end_time: coupon_end_time,
        level: CouponLevel.RESTAURANT,
        max_use_count: 1,
        min_order_value_rupees: 100,
        max_discount_rupees: 20,
        discount_share_percent: 100,
        discount_sponsered_by: 'restaurant',
      });
    expect(response.body.status).toBe(true);
    expect(response.statusCode).toBe(200);
    expect(response.body.result.coupon_details.code).toBe('COUPON_3');
    const coupon: ICoupon = response.body.result.coupon_details;

    const optin_start_duration = moment
      .unix(coupon_start_time)
      .add('6', 'hours')
      .unix();
    const optin_end_duration = moment
      .unix(coupon_start_time)
      .add('7', 'hours')
      .unix();
    const optin_response_1 = await request(server)
      .post('/food/vendor/coupon/restaurant/optin')
      .set('Authorization', `Bearer ${vendor_token}`)
      .send({
        coupon_id: coupon.id,
        mapping_duration: {
          start_time: optin_start_duration,
          end_time: optin_end_duration,
        },
      });
    expect(optin_response_1.statusCode).toBe(400);
    expect(optin_response_1.body.status).toBe(false);
    expect(optin_response_1.body.errors).toStrictEqual([
      {
        message: 'mapping duration must exists between coupon duration',
        code: 1071,
      },
    ]);
  });

  //! coupon optin duration time is in between of existing coupon mapping duration time
  /**
   * !      coupon duration              |------------------------------------------|
   * !      existing_optin_mapping_start |------------------------------------------| existing_optin_mapping_end
   * !                              new_optin_mapping_start  |----------| new_optin_mapping_end
   *                                                           *overlap
   * */
  /**
   * ?1. create coupon as admin at restaurant level
   * ?2. existing coupon mapping duration is equal to coupon duration
   * ?3. when we create a new mapping between existing coupon mapping duration it should throw errors
   */
  test('new optin duration between existing optin duration', async () => {
    const coupon_start_time = moment().add(1, 'hours').unix();
    const coupon_end_time = moment().add(2, 'hours').unix();
    mockgetAdminDetails();
    const response = await request(server)
      .post('/food/admin/coupon')
      .set('Authorization', `Bearer ${admin_token}`)
      .send({
        code: 'COUPON_4',
        header: 'coupon header',
        description: 'coupon description',
        terms_and_conditions: 'coupon t&c',
        type: CouponType.UPTO,
        discount_percentage: 20,
        start_time: coupon_start_time,
        end_time: coupon_end_time,
        level: CouponLevel.RESTAURANT,
        max_use_count: 1,
        min_order_value_rupees: 100,
        max_discount_rupees: 20,
        discount_share_percent: 100,
        discount_sponsered_by: 'restaurant',
      });
    expect(response.body.status).toBe(true);
    expect(response.statusCode).toBe(200);
    expect(response.body.result.coupon_details.code).toBe('COUPON_4');
    const coupon: ICoupon = response.body.result.coupon_details;

    const optin_response_1 = await request(server)
      .post('/food/vendor/coupon/restaurant/optin')
      .set('Authorization', `Bearer ${vendor_token}`)
      .send({
        coupon_id: coupon.id,
        mapping_duration: {
          start_time: coupon_start_time,
          end_time: coupon_end_time,
        },
      });
    expect(optin_response_1.statusCode).toBe(200);
    expect(optin_response_1.body.status).toBe(true);

    const new_optin_start_duration = moment
      .unix(coupon_start_time)
      .add('10', 'minutes')
      .unix();
    const new_optin_end_duration = moment
      .unix(coupon_start_time)
      .add('30', 'minutes')
      .unix();

    const optin_response_2 = await request(server)
      .post('/food/vendor/coupon/restaurant/optin')
      .set('Authorization', `Bearer ${vendor_token}`)
      .send({
        coupon_id: coupon.id,
        mapping_duration: {
          start_time: new_optin_start_duration,
          end_time: new_optin_end_duration,
        },
      });

    expect(optin_response_2.statusCode).toBe(400);
    expect(optin_response_2.body.status).toBe(false);
    expect(optin_response_2.body.errors).toStrictEqual([
      {
        message: 'Coupon mapping already exists',
        code: 0,
      },
    ]);
  });

  //! (new optin duration start time < existing optin duration start time)
  //! &&
  //! (
  //!   (new optin duration end time > existing optin duration start time )
  //!    &&
  //!   (new optin duration end time < existing optin duration end time )
  //! )
  /**
   * ! coupon duration  |-------------------------------|
   * ! existing_optin_mapping_start |-------------------| existing_optin_mapping_end
   * ! new_optin_mapping_start  |------------| new_optin_mapping_end
   *                                 *overlap
   * */
  /**
   * ?1. create coupon as admin at restaurant level
   * ?2. existing mapping duration already exists which starts at 1 hr from coupon start time and ends at coupon end duration
   * ?3. now we will create a new mapping that over laps with existing mapping and should return errro
   * ?
   */
  test('new_optin_start < existing_optin_start && new_optin_end > existing_optin_start && new_optin_end < existing_optin_end', async () => {
    //! 3 hrs coupon
    const coupon_start_time = moment().add(1, 'hours').unix();
    const coupon_end_time = moment().add(4, 'hours').unix();
    mockgetAdminDetails();
    const response = await request(server)
      .post('/food/admin/coupon')
      .set('Authorization', `Bearer ${admin_token}`)
      .send({
        code: 'COUPON_5',
        header: 'coupon header',
        description: 'coupon description',
        terms_and_conditions: 'coupon t&c',
        type: CouponType.UPTO,
        discount_percentage: 20,
        start_time: coupon_start_time,
        end_time: coupon_end_time,
        level: CouponLevel.RESTAURANT,
        max_use_count: 1,
        min_order_value_rupees: 100,
        max_discount_rupees: 20,
        discount_share_percent: 100,
        discount_sponsered_by: 'restaurant',
      });
    expect(response.body.status).toBe(true);
    expect(response.statusCode).toBe(200);
    expect(response.body.result.coupon_details.code).toBe('COUPON_5');
    const coupon: ICoupon = response.body.result.coupon_details;

    const mapping_1_start_time = moment
      .unix(coupon_start_time)
      .add('1', 'hours')
      .unix();
    const mapping_1_end_time = coupon_end_time;
    const optin_response_1 = await request(server)
      .post('/food/vendor/coupon/restaurant/optin')
      .set('Authorization', `Bearer ${vendor_token}`)
      .send({
        coupon_id: coupon.id,
        //! 2 hr mapping duration
        mapping_duration: {
          start_time: mapping_1_start_time,
          end_time: mapping_1_end_time,
        },
      });
    expect(optin_response_1.statusCode).toBe(200);
    expect(optin_response_1.body.status).toBe(true);

    //! 1 hr mapping duration
    const mapping_2_start_duration = moment
      .unix(mapping_1_start_time)
      .subtract('30', 'minutes')
      .unix();
    const mapping_2_end_duration = moment
      .unix(mapping_1_start_time)
      .add('30', 'minutes')
      .unix();

    const optin_response_2 = await request(server)
      .post('/food/vendor/coupon/restaurant/optin')
      .set('Authorization', `Bearer ${vendor_token}`)
      .send({
        coupon_id: coupon.id,
        mapping_duration: {
          start_time: mapping_2_start_duration,
          end_time: mapping_2_end_duration,
        },
      });
    expect(optin_response_2.statusCode).toBe(400);
    expect(optin_response_2.body.status).toBe(false);
    expect(optin_response_2.body.errors).toStrictEqual([
      {
        message: 'Coupon mapping already exists',
        code: 0,
      },
    ]);
  });

  //!(
  //!   (new optin duration start time > existing optin duration start time)
  //!   &&
  //!   (new optin duration start time < existing optin duration end time)
  //!)
  //! &&
  //!
  //!   (new optin duration end time > existing optin duration end time)
  //!
  /**
   * !              coupon duration |---------------------|
   * ! existing_optin_mapping_start |-------------| existing_optin_mapping_end
   * !               new_optin_mapping_start |----------| new_optin_mapping_end
   *                                           *overlap
   * */
  /**
   * ?1. create coupon as admin at restaurant level
   * ?2. existing mapping duration already exists which starts from coupon start time and ends after 3 hrs
   * ?3. now we will create a new mapping that over laps with existing mapping and should return errro
   * ?
   */
  test('new_optin_start > existing_optin_start && new_optin_start < existing_optin_end && new_optin_end > existing_optin_end', async () => {
    //! 3 hrs coupon duration
    const coupon_start_time = moment().add(1, 'hours').unix();
    const coupon_end_time = moment().add(4, 'hours').unix();
    mockgetAdminDetails();
    const response = await request(server)
      .post('/food/admin/coupon')
      .set('Authorization', `Bearer ${admin_token}`)
      .send({
        code: 'COUPON_6',
        header: 'coupon header',
        description: 'coupon description',
        terms_and_conditions: 'coupon t&c',
        type: CouponType.UPTO,
        discount_percentage: 20,
        start_time: coupon_start_time,
        end_time: coupon_end_time,
        level: CouponLevel.RESTAURANT,
        max_use_count: 1,
        min_order_value_rupees: 100,
        max_discount_rupees: 20,
        discount_share_percent: 100,
        discount_sponsered_by: 'restaurant',
      });
    expect(response.body.status).toBe(true);
    expect(response.statusCode).toBe(200);
    expect(response.body.result.coupon_details.code).toBe('COUPON_6');
    const coupon: ICoupon = response.body.result.coupon_details;

    //! 2 hr duration
    const mapping_1_start_time = coupon_start_time;
    const mapping_1_end_time = moment
      .unix(coupon_start_time)
      .add('2', 'hours')
      .unix();
    const optin_response_1 = await request(server)
      .post('/food/vendor/coupon/restaurant/optin')
      .set('Authorization', `Bearer ${vendor_token}`)
      .send({
        coupon_id: coupon.id,
        mapping_duration: {
          start_time: mapping_1_start_time,
          end_time: mapping_1_end_time,
        },
      });
    expect(optin_response_1.statusCode).toBe(200);
    expect(optin_response_1.body.status).toBe(true);

    //! 1 hr mapping duration
    const mapping_2_start_duration = moment
      .unix(mapping_1_start_time)
      .add('10', 'minutes')
      .unix();
    const mapping_2_end_duration = moment
      .unix(mapping_1_end_time)
      .subtract('30', 'minutes')
      .unix();

    const optin_response_2 = await request(server)
      .post('/food/vendor/coupon/restaurant/optin')
      .set('Authorization', `Bearer ${vendor_token}`)
      .send({
        coupon_id: coupon.id,
        mapping_duration: {
          start_time: mapping_2_start_duration,
          end_time: mapping_2_end_duration,
        },
      });
    expect(optin_response_2.statusCode).toBe(400);
    expect(optin_response_2.body.status).toBe(false);
    expect(optin_response_2.body.errors).toStrictEqual([
      {
        message: 'Coupon mapping already exists',
        code: 0,
      },
    ]);
  });

  test('opt in new_optin_start < current_time but greater than coupon_start_time | need to throw error', async () => {
    /**
     * !              coupon duration |---------------------|
     * !                                    |                  current time
     * !        new_optin_mapping_start |---------------| new_optin_mapping_end
     *                                           *less than current time
     * */
    const coupon_start_time = moment().subtract(3, 'days').unix();
    const coupon_end_time = moment().add(4, 'days').unix();
    const coupon_id = 5000;
    mockgetAdminDetails();
    const mapping_start_duration = moment
      .unix(coupon_start_time)
      .add('30', 'minutes')
      .unix();
    const mapping_end_duration = moment
      .unix(coupon_end_time)
      .subtract('30', 'minutes')
      .unix();
    const optin_as_admin_response = await request(server)
      .post('/food/admin/coupon/restaurant/optin')
      .set('Authorization', `Bearer ${admin_token}`)
      .send({
        coupon_id: coupon_id,
        restaurant_ids: [restaurant_id],
        mapping_duration: {
          start_time: mapping_start_duration,
          end_time: mapping_end_duration,
        },
      });
    expect(optin_as_admin_response.body.status).toBe(false);
    expect(optin_as_admin_response.body.statusCode).toBe(400);
    expect(optin_as_admin_response.body.errors).toStrictEqual([
      {
        message: 'mapping start time should be greater than current time',
        code: 1066,
      },
    ]);
    const optin_as_vendor_response = await request(server)
      .post('/food/vendor/coupon/restaurant/optin')
      .set('Authorization', `Bearer ${vendor_token}`)
      .send({
        coupon_id: coupon_id,
        mapping_duration: {
          start_time: mapping_start_duration,
          end_time: mapping_end_duration,
        },
      });
    expect(optin_as_vendor_response.body.status).toBe(false);
    expect(optin_as_vendor_response.body.statusCode).toBe(400);
    expect(optin_as_vendor_response.body.errors).toStrictEqual([
      {
        message: 'mapping start time should be greater than current time',
        code: 1066,
      },
    ]);
  });
  //! optin on active coupon without adding start time and end time.
  //! so it should allow to optin.
  //! start time will be current time + 10 seconds.
  //! end time will be end time of coupon.
  describe('Optin into the coupon without mapping details', () => {
    test('optin as admin without restaurant_ids | need to throw error', async () => {
      mockgetAdminDetails();
      const optin_response = await request(server)
        .post('/food/admin/coupon/restaurant/optin')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          coupon_id: 3000,
        });
      expect(optin_response.statusCode).toBe(400);
      expect(optin_response.body.status).toBe(false);
      expect(optin_response.body.errors).toStrictEqual([
        {message: '"restaurant_ids" is required', code: 1000},
      ]);
    });
    test('optin as admin with invalid restaurant_ids | need to throw error', async () => {
      mockgetAdminDetails();
      const optin_response = await request(server)
        .post('/food/admin/coupon/restaurant/optin')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          restaurant_ids: ['0e3a1a2b-9816-4abf-9edb-06c855ec476c'],
          coupon_id: 3000,
        });
      expect(optin_response.statusCode).toBe(400);
      expect(optin_response.body.status).toBe(false);
      expect(optin_response.body.errors).toStrictEqual([
        {
          message: 'Restaurant not found 0e3a1a2b-9816-4abf-9edb-06c855ec476c',
          code: 1093,
        },
      ]);
    });
    test('optin as admin with invalid restaurant_ids | need to throw error', async () => {
      mockgetAdminDetails();
      const optin_response = await request(server)
        .post('/food/admin/coupon/restaurant/optin')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          restaurant_ids: [
            '77e53c1f-6e9e-4724-9ba7-92edc69cff6b',
            '0e3a1a2b-9816-4abf-9edb-06c855ec476c',
          ],
          coupon_id: 3000,
        });
      expect(optin_response.statusCode).toBe(400);
      expect(optin_response.body.status).toBe(false);
      expect(optin_response.body.errors).toStrictEqual([
        {
          message: 'Restaurant not found 0e3a1a2b-9816-4abf-9edb-06c855ec476c',
          code: 1093,
        },
      ]);
    });
    test('optin as admin', async () => {
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
    });
    test('optin as vendor', async () => {
      mockGetRestaurantVendors();
      const optin_response = await request(server)
        .post('/food/vendor/coupon/restaurant/optin')
        .set('Authorization', `Bearer ${vendor_token}`)
        .send({
          coupon_id: 3,
        });
      expect(optin_response.statusCode).toBe(200);
      expect(optin_response.body.status).toBe(true);
      expect(optin_response.body.result.records[0].coupon_id).toBe(3);
    });
  });
});
