import request from 'supertest';
import {Application} from 'express';
import {createTestServer} from '../../utils/init';
import {
  loadMockSeedData,
  signToken,
  testCasesClosingTasks,
} from '../../utils/utils';
import {DB} from '../../../data/knex';
import {PosStatus} from '../../../module/food/petpooja/enum';
import {
  mockgetAdminDetails,
  mockGetRestaurantVendors,
} from '../../utils/mock_services';
import {
  pos_id,
  pos_restaurant_id,
  pos_status,
  pp_deleted_restaurant_id,
  pp_not_active_restaurant_id,
  pp_not_initiated_restaurant_id,
  pp_restaurant_id,
} from '../common';

jest.mock('axios');

let server: Application;
let admin_token: string;
const petpooja_token = 'petpooja_token';

const restaurant_id = pp_restaurant_id;

beforeAll(async () => {
  server = await createTestServer();
  await loadMockSeedData('restaurant');
  await loadMockSeedData('restaurant_menu');
  admin_token = signToken({
    id: '64bfafb6-c273-4b64-a0fc-ca981f5819eb',
    user_type: 'admin',
  });
});

afterAll(async () => {
  await testCasesClosingTasks();
});

describe('Petpooja restuarant onboarding As Admin :-', () => {
  describe('POST /food/admin/petpooja/initiate/{restaurant_id}', () => {
    const mock_get_admin_details = mockgetAdminDetails();
    test('Token Not Provided | Need to throw error', async () => {
      const response = await request(server)
        .post(`/food/admin/petpooja/initiate/${restaurant_id}`)
        .send({pos_restaurant_id: '4331'});
      expect(response.body.statusCode).toBe(401);
      expect(response.body.status).toBe(false);
      expect(response.body.errors).toStrictEqual([
        {message: 'Authorization Error', code: 0},
      ]);
    });
    test('pos_restaurant_id Not Provided | Need to throw error', async () => {
      const response = await request(server)
        .post(`/food/admin/petpooja/initiate/${restaurant_id}`)
        .set('Authorization', `Bearer ${admin_token}`)
        .send();
      expect(response.body.statusCode).toBe(400);
      expect(response.body.status).toBe(false);
      expect(response.body.errors).toStrictEqual([
        {message: '"pos_restaurant_id" is required', code: 0},
      ]);
      expect(mock_get_admin_details).toBeCalledTimes(1);
    });
    test('Invalid restaurant_id | Need to throw error', async () => {
      const response = await request(server)
        .post('/food/admin/petpooja/initiate/abc')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({pos_restaurant_id});
      expect(response.body.statusCode).toBe(400);
      expect(response.body.status).toBe(false);
      expect(response.body.errors).toStrictEqual([
        {message: 'Restaurant Not Found', code: 0},
      ]);
      expect(mock_get_admin_details).toBeCalledTimes(1);
    });
    test('initiate petpooja onboarding for draft restaurant | Need to throw error', async () => {
      const response = await request(server)
        .post(`/food/admin/petpooja/initiate/${pp_not_active_restaurant_id}`)
        .set('Authorization', `Bearer ${admin_token}`)
        .send({pos_restaurant_id});
      expect(response.body.statusCode).toBe(400);
      expect(response.body.status).toBe(false);
      expect(response.body.errors).toStrictEqual([
        {message: 'Restaurant Not Found', code: 0},
      ]);
      expect(mock_get_admin_details).toBeCalledTimes(1);
    });
    test('initiate petpooja onboarding for deleted restaurant | Need to throw error', async () => {
      const response = await request(server)
        .post(`/food/admin/petpooja/initiate/${pp_deleted_restaurant_id}`)
        .set('Authorization', `Bearer ${admin_token}`)
        .send({pos_restaurant_id});
      expect(response.body.statusCode).toBe(400);
      expect(response.body.status).toBe(false);
      expect(response.body.errors).toStrictEqual([
        {message: 'Restaurant Not Found', code: 0},
      ]);
      expect(mock_get_admin_details).toBeCalledTimes(1);
    });
    test('successfully initiate onboarding', async () => {
      const response = await request(server)
        .post(`/food/admin/petpooja/initiate/${restaurant_id}`)
        .set('Authorization', `Bearer ${admin_token}`)
        .send({pos_restaurant_id});
      expect(response.body.statusCode).toBe(200);
      expect(response.body.status).toBe(true);
      expect(response.body.result.pos_restaurant_id).toBe(pos_restaurant_id);
      expect(response.body.result.id).toBe(restaurant_id);
      expect(response.body.result.pos_status).toBe('init');
      expect(response.body.result.pos_id).toBeNull();
      expect(mock_get_admin_details).toBeCalledTimes(1);

      const petpooja_restaurant = await DB.read('petpooja_restaurant')
        .select('*')
        .where({id: restaurant_id});
      expect(petpooja_restaurant.length).toBe(1);
      expect(petpooja_restaurant[0]).toStrictEqual({
        id: restaurant_id,
        pos_restaurant_id,
        pos_id: null,
        pos_status: 'init',
        details: null,
        initiated_at: expect.anything(),
        onboarded_at: null,
        menu_last_updated_at: null,
        created_at: expect.anything(),
        updated_at: expect.anything(),
      });
    });
    test('Initiate onboarding for restaurants that have already initiated onboarding', async () => {
      const response = await request(server)
        .post(`/food/admin/petpooja/initiate/${restaurant_id}`)
        .set('Authorization', `Bearer ${admin_token}`)
        .send({pos_restaurant_id});
      expect(response.body.statusCode).toBe(400);
      expect(response.body.status).toBe(false);
      expect(response.body.errors).toStrictEqual([
        {message: 'Restaurant petpooja onboarding already initiated', code: 0},
      ]);
      expect(mock_get_admin_details).toBeCalledTimes(1);
    });
  });
  describe('PUT /food/admin/petpooja/onboard/{restaurant_id}', () => {
    const mock_get_admin_details = mockgetAdminDetails();
    test('Token Not Provided | Need to throw error', async () => {
      const response = await request(server)
        .put(`/food/admin/petpooja/onboard/${restaurant_id}`)
        .send({pos_restaurant_id: '4331'});
      expect(response.body.statusCode).toBe(401);
      expect(response.body.status).toBe(false);
      expect(response.body.errors).toStrictEqual([
        {message: 'Authorization Error', code: 0},
      ]);
    });
    test('pos_status : ready and pos_id Not Provided | Need to throw error', async () => {
      const response = await request(server)
        .put(`/food/admin/petpooja/onboard/${restaurant_id}`)
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          pos_status,
        });
      expect(response.body.statusCode).toBe(400);
      expect(response.body.status).toBe(false);
      expect(response.body.errors).toStrictEqual([
        {message: 'pos_id empty not allowed.', code: 0},
      ]);
      expect(mock_get_admin_details).toBeCalledTimes(1);
    });
    test('pos_status Not Provided | Need to throw error', async () => {
      const response = await request(server)
        .put(`/food/admin/petpooja/onboard/${restaurant_id}`)
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          pos_id,
        });
      expect(response.body.statusCode).toBe(400);
      expect(response.body.status).toBe(false);
      expect(response.body.errors).toStrictEqual([
        {message: '"pos_status" is required', code: 0},
      ]);
      expect(mock_get_admin_details).toBeCalledTimes(1);
    });
    test('Invalid pos_status | Need to throw error', async () => {
      const response = await request(server)
        .put(`/food/admin/petpooja/onboard/${restaurant_id}`)
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          pos_status: 'xyz',
        });
      expect(response.body.statusCode).toBe(400);
      expect(response.body.status).toBe(false);
      expect(response.body.errors).toStrictEqual([
        {message: '"pos_status" must be one of [ready, got_pos_id]', code: 0},
      ]);
      expect(mock_get_admin_details).toBeCalledTimes(1);
    });
    test('Invalid restaurant_id | Need to throw error', async () => {
      const response = await request(server)
        .put('/food/admin/petpooja/onboard/abc')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({pos_id, pos_status});
      expect(response.body.statusCode).toBe(400);
      expect(response.body.status).toBe(false);
      expect(response.body.errors).toStrictEqual([
        {message: 'Restaurant Not Found', code: 0},
      ]);
      expect(mock_get_admin_details).toBeCalledTimes(1);
    });
    test('draft restaurant provided | Need to throw error', async () => {
      const response = await request(server)
        .put(`/food/admin/petpooja/onboard/${pp_not_active_restaurant_id}`)
        .set('Authorization', `Bearer ${admin_token}`)
        .send({pos_id, pos_status});
      expect(response.body.statusCode).toBe(400);
      expect(response.body.status).toBe(false);
      expect(response.body.errors).toStrictEqual([
        {message: 'Restaurant Not Found', code: 0},
      ]);
      expect(mock_get_admin_details).toBeCalledTimes(1);
    });
    test('deleted restaurant provided |  Need to throw error', async () => {
      const response = await request(server)
        .put(`/food/admin/petpooja/onboard/${pp_deleted_restaurant_id}`)
        .set('Authorization', `Bearer ${admin_token}`)
        .send({pos_id, pos_status});
      expect(response.body.statusCode).toBe(400);
      expect(response.body.status).toBe(false);
      expect(response.body.errors).toStrictEqual([
        {message: 'Restaurant Not Found', code: 0},
      ]);
      expect(mock_get_admin_details).toBeCalledTimes(1);
    });
    test('onboard restaurants that have not initiated onboarding', async () => {
      const response = await request(server)
        .put(`/food/admin/petpooja/onboard/${pp_not_initiated_restaurant_id}`)
        .set('Authorization', `Bearer ${admin_token}`)
        .send({pos_id, pos_status});
      expect(response.body.statusCode).toBe(400);
      expect(response.body.status).toBe(false);
      expect(response.body.errors).toStrictEqual([
        {message: 'Restaurant petpooja onboarding not initiated', code: 0},
      ]);
      expect(mock_get_admin_details).toBeCalledTimes(1);
    });
    test('update pos_status : got_pos_id and try to submit for onaboarding | Need to throw error because pos_status must be ready for onaboarding', async () => {
      const response = await request(server)
        .put(`/food/admin/petpooja/onboard/${restaurant_id}`)
        .set('Authorization', `Bearer ${admin_token}`)
        .send({pos_id, pos_status: 'got_pos_id'});
      expect(response.body.statusCode).toBe(200);
      expect(response.body.status).toBe(true);
      expect(mock_get_admin_details).toBeCalledTimes(1);

      const onboard_response = await request(server)
        .post(`/food/admin/petpooja/onboard/${restaurant_id}`)
        .set('Authorization', `Bearer ${admin_token}`);
      expect(onboard_response.body.statusCode).toBe(400);
      expect(onboard_response.body.status).toBe(false);
      expect(onboard_response.body.errors).toStrictEqual([
        {
          message: 'Restaurant petpooja onboarding not Ready',
          code: 0,
        },
      ]);
      expect(mock_get_admin_details).toBeCalledTimes(2);
    });
    test('successfully update onboard status of restaurant', async () => {
      const response = await request(server)
        .put(`/food/admin/petpooja/onboard/${restaurant_id}`)
        .set('Authorization', `Bearer ${admin_token}`)
        .send({pos_id, pos_status});
      expect(response.body.statusCode).toBe(200);
      expect(response.body.status).toBe(true);
      expect(response.body.result.pos_restaurant_id).toBe(pos_restaurant_id);
      expect(response.body.result.id).toBe(restaurant_id);
      expect(response.body.result.pos_status).toBe('ready');
      expect(response.body.result.pos_id).toBe(pos_id);
      expect(mock_get_admin_details).toBeCalledTimes(1);

      const petpooja_restaurant = await DB.read('petpooja_restaurant')
        .select('*')
        .where({id: restaurant_id});
      expect(petpooja_restaurant.length).toBe(1);
      expect(petpooja_restaurant[0]).toStrictEqual({
        id: restaurant_id,
        pos_restaurant_id,
        pos_id,
        pos_status: 'ready',
        details: null,
        initiated_at: expect.anything(),
        onboarded_at: null,
        menu_last_updated_at: null,
        created_at: expect.anything(),
        updated_at: expect.anything(),
      });
    });
    test('Another restaurant already onboarded with pos_id provided', async () => {
      const response = await request(server)
        .put(`/food/admin/petpooja/onboard/${restaurant_id}`)
        .set('Authorization', `Bearer ${admin_token}`)
        .send({pos_id: 'ps82kz7f', pos_status});
      expect(response.body.statusCode).toBe(400);
      expect(response.body.status).toBe(false);
      expect(response.body.errors).toStrictEqual([
        {
          message:
            'Another restaurant already onboarded to:petpooja with pos id: ps82kz7f',
          code: 0,
        },
      ]);
      expect(mock_get_admin_details).toBeCalledTimes(1);
    });
    describe('GET /food/admin/petpooja/onboard/{restaurant_id}', () => {
      const mock_get_admin_details = mockgetAdminDetails();
      test('Get Restaurant status As Admin', async () => {
        const response = await request(server)
          .get(`/food/admin/petpooja/onboard/${restaurant_id}`)
          .set('Authorization', `Bearer ${admin_token}`);
        expect(response.body.statusCode).toBe(200);
        expect(response.body.status).toBe(true);
        expect(response.body.result).toStrictEqual({
          id: restaurant_id,
          pos_restaurant_id: pos_restaurant_id,
          pos_id: pos_id,
          pos_status: PosStatus.READY,
          details: null,
          initiated_at: expect.anything(),
          onboarded_at: null,
          menu_last_updated_at: null,
          created_at: expect.anything(),
          updated_at: expect.anything(),
        });
        expect(mock_get_admin_details).toBeCalledTimes(1);
      });
    });
  });
  describe('POST /food/admin/petpooja/onboard/{restaurant_id}', () => {
    const mock_get_admin_details = mockgetAdminDetails();
    test('Token Not Provided | Need to throw error', async () => {
      const response = await request(server).post(
        `/food/admin/petpooja/onboard/${restaurant_id}`
      );
      expect(response.body.statusCode).toBe(401);
      expect(response.body.status).toBe(false);
      expect(response.body.errors).toStrictEqual([
        {message: 'Authorization Error', code: 0},
      ]);
    });
    test('Not Active Restaurant provided | Need to throw error', async () => {
      const response = await request(server)
        .post(`/food/admin/petpooja/onboard/${pp_not_active_restaurant_id}`)
        .set('Authorization', `Bearer ${admin_token}`);
      expect(response.body.statusCode).toBe(400);
      expect(response.body.status).toBe(false);
      expect(response.body.errors).toStrictEqual([
        {message: 'Restaurant Not Found', code: 0},
      ]);
    });
    test('Deleted Restaurant provided | Need to throw error', async () => {
      const response = await request(server)
        .post(`/food/admin/petpooja/onboard/${pp_deleted_restaurant_id}`)
        .set('Authorization', `Bearer ${admin_token}`);
      expect(response.body.statusCode).toBe(400);
      expect(response.body.status).toBe(false);
      expect(response.body.errors).toStrictEqual([
        {message: 'Restaurant Not Found', code: 0},
      ]);
      expect(mock_get_admin_details).toBeCalledTimes(1);
    });
    test('restaurant not initiated onboarding provided | Need to throw error', async () => {
      const response = await request(server)
        .post(`/food/admin/petpooja/onboard/${pp_not_initiated_restaurant_id}`)
        .set('Authorization', `Bearer ${admin_token}`);
      expect(response.body.statusCode).toBe(400);
      expect(response.body.status).toBe(false);
      expect(response.body.errors).toStrictEqual([
        {message: 'Restaurant petpooja onboarding not initiated', code: 0},
      ]);
      expect(mock_get_admin_details).toBeCalledTimes(1);
    });
    test('successfully restuaurant onboarded', async () => {
      //const petpooja_menu_fetched = mockfetchRestaurantMenuSuccess();
      const response = await request(server)
        .post(`/food/admin/petpooja/onboard/${restaurant_id}`)
        .set('Authorization', `Bearer ${admin_token}`);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.status).toBe(true);
      //expect(petpooja_menu_fetched).toHaveBeenCalled();
      expect(mock_get_admin_details).toBeCalledTimes(1);

      const main_categories = await DB.read('main_category')
        .select('*')
        .where({is_deleted: false, restaurant_id: restaurant_id});
      expect(main_categories.length).toBe(0);

      const addon_groups = await DB.read('addon_group')
        .select('*')
        .where({is_deleted: false, restaurant_id: restaurant_id});
      expect(addon_groups.length).toBe(0);
    });
  });
  describe('GET /food/admin/petpooja/onboard/{restaurant_id}', () => {
    const mock_get_admin_details = mockgetAdminDetails();
    test('Token Not Provided | Need to throw error', async () => {
      const response = await request(server).get(
        `/food/admin/petpooja/onboard/${restaurant_id}`
      );
      expect(response.body.statusCode).toBe(401);
      expect(response.body.status).toBe(false);
      expect(response.body.errors).toStrictEqual([
        {message: 'Authorization Error', code: 0},
      ]);
    });
    test('Get Onboarded Restaurant status As Admin', async () => {
      const response = await request(server)
        .get(`/food/admin/petpooja/onboard/${restaurant_id}`)
        .set('Authorization', `Bearer ${admin_token}`);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.status).toBe(true);
      expect(response.body.result).toStrictEqual({
        id: restaurant_id,
        pos_restaurant_id: pos_restaurant_id,
        pos_id: pos_id,
        pos_status: PosStatus.ONBOARDED,
        details: null,
        initiated_at: expect.anything(),
        onboarded_at: expect.anything(),
        menu_last_updated_at: null,
        created_at: expect.anything(),
        updated_at: expect.anything(),
      });
      expect(mock_get_admin_details).toBeCalledTimes(1);
    });

    test('Cerate resataurant holidayslot ', async () => {
      mockGetRestaurantVendors();
      const response = await request(server)
        .post('/food/callback/petpooja/update_store_status')
        .send({
          restID: 'pj81skt7f',
          store_status: 0,
          reason: 'unknown reason',
        })
        .set('Authorization', `Bearer ${petpooja_token}`);
      expect(response.body).toStrictEqual({
        http_code: 200,
        status: 'success',
        message: 'Store Status updated successfully for store restID',
      });

      const holiday_slots = await DB.read('holiday_slot').where({
        restaurant_id,
        is_deleted: false,
      });
      expect(holiday_slots[0]).toMatchObject({
        restaurant_id: '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
        created_by: 'VENDOR_33c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
        is_deleted: false,
      });
    });
    test('Delete resataurant holidayslot ', async () => {
      mockGetRestaurantVendors();
      const response = await request(server)
        .post('/food/callback/petpooja/update_store_status')
        .send({
          restID: 'pj81skt7f',
          store_status: 1,
          reason: 'unknown reason',
        })
        .set('Authorization', `Bearer ${petpooja_token}`);
      expect(response.body).toStrictEqual({
        http_code: 200,
        status: 'success',
        message: 'Store Status updated successfully for store restID',
      });

      const holiday_slots = await DB.read('holiday_slot').where({
        restaurant_id,
        is_deleted: false,
      });
      expect(holiday_slots.length).toEqual(0);
    });
  });
});
