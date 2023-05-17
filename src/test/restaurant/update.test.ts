import request from 'supertest';
import {createTestServer} from '../utils/init';
import {Application} from 'express';
import {mockEsIndexData, mockgetAdminDetails} from '../utils/mock_services';
import {
  signToken,
  loadMockSeedData,
  testCasesClosingTasks,
} from '../utils/utils';
import {DB} from '../../data/knex';
import {IRestaurant_Basic} from '../../module/food/restaurant/models';
jest.mock('axios');

let server: Application;
let admin_token: string;
let vendor_token: string;

const admin_id = '64bfafb6-c273-4b64-a0fc-ca981f5819eb';

beforeAll(async () => {
  server = await createTestServer();

  await loadMockSeedData('cuisine');
  await loadMockSeedData('language');
  await loadMockSeedData('city');
  await loadMockSeedData('polygon');
  await loadMockSeedData('restaurant');
  await loadMockSeedData('subscription');
  admin_token = signToken({
    id: admin_id,
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

describe('Restaurnat PUT API Test cases', () => {
  describe('Admin', () => {
    test('Update restaurant as admin', async () => {
      const mock_es_index = mockEsIndexData();
      mockgetAdminDetails();
      const response = await request(server)
        .put('/food/admin/restaurant/b0909e52-a731-4665-a791-ee6479008805')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          name: 'Burger King BK',
          branch_name: 'Burger King Mumbai(E)',
          default_preparation_time: 7,
          free_delivery: false,
        });
      expect(response.body.statusCode).toBe(200);
      expect(response.body.status).toBe(true);
      expect(response.body.result).not.toBe({});
      expect(response.body.result.name).toBe('Burger King BK');
      expect(response.body.result.branch_name).toBe('Burger King Mumbai(E)');
      expect(response.body.result.default_preparation_time).toBe(7);
      expect(response.body.result.delivery_charge_paid_by).toBe('customer');
      expect(mock_es_index).toHaveBeenCalledTimes(1);

      const restaurant_details = (
        await DB.read('restaurant').where({
          id: 'b0909e52-a731-4665-a791-ee6479008805',
        })
      )[0];
      expect(restaurant_details.name).toBe('Burger King BK');
      expect(restaurant_details.branch_name).toBe('Burger King Mumbai(E)');
      expect(restaurant_details.default_preparation_time).toBe(7);
      expect(restaurant_details.delivery_charge_paid_by).toBe('customer');
    });
    test('Adding Float in default_preparation_time | Need to throw Error', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .put('/food/admin/restaurant/b0909e52-a731-4665-a791-ee6479008805')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          name: 'Burger King BK',
          default_preparation_time: 20.01,
        });
      expect(response.body.statusCode).toBe(400);
      expect(response.body.status).toBe(false);
      expect(response.body.errors).toStrictEqual([
        {
          message: '"default_preparation_time" must be an integer',
          code: 0,
        },
      ]);
    });
    test('Adding Interger in default_preparation_time', async () => {
      const restaurant = (await DB.read('restaurant').where({
        id: 'b0909e52-a731-4665-a791-ee6479008805',
      })) as IRestaurant_Basic[];
      expect(restaurant[0].default_preparation_time).toBe(7);
      const mock_es_index = mockEsIndexData();
      mockgetAdminDetails();
      const response = await request(server)
        .put('/food/admin/restaurant/b0909e52-a731-4665-a791-ee6479008805')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          name: 'Burger King BK',
          default_preparation_time: 20,
        });
      expect(response.body.statusCode).toBe(200);
      expect(response.body.status).toBe(true);
      expect(response.body.result.default_preparation_time).toBe(20);
      expect(mock_es_index).toHaveBeenCalledTimes(1);
    });
    test('Update restaurant speedyy account manager id', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .put('/food/admin/restaurant/b0909e52-a731-4665-a791-ee6479008805')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          speedyy_account_manager_id: '64bfafb6-c273-4b64-a0fc-ca981f5819eb',
        });
      expect(response.body.statusCode).toBe(200);
      expect(response.body.status).toBe(true);
      expect(response.body.result.speedyy_account_manager_id).toBe(
        '64bfafb6-c273-4b64-a0fc-ca981f5819eb'
      );
    });
  });
  describe('Vendor', () => {
    test('Adding Float in default_preparation_time | Need to throw Error', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .put('/food/vendor/restaurant/')
        .set('Authorization', `Bearer ${vendor_token}`)
        .send({
          name: 'Burger King BK',
          default_preparation_time: 20.01,
        });
      expect(response.body.statusCode).toBe(400);
      expect(response.body.status).toBe(false);
      expect(response.body.errors).toStrictEqual([
        {
          message: '"default_preparation_time" must be an integer',
          code: 0,
        },
      ]);
    });
    test('Adding Interger in default_preparation_time', async () => {
      const restaurant = (await DB.read('restaurant').where({
        id: 'b0909e52-a731-4665-a791-ee6479008805',
      })) as IRestaurant_Basic[];
      expect(restaurant[0].default_preparation_time).toBe(20);
      mockgetAdminDetails();
      const response = await request(server)
        .put('/food/vendor/restaurant/')
        .set('Authorization', `Bearer ${vendor_token}`)
        .send({
          default_preparation_time: 15,
        });
      expect(response.body.statusCode).toBe(200);
      expect(response.body.status).toBe(true);
      expect(response.body.result.default_preparation_time).toBe(15);
    });
  });
});
