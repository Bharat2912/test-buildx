import request from 'supertest';
import {createTestServer} from './utils/init';
import {Application} from 'express';
import {signToken, testCasesClosingTasks} from './utils/utils';
import logger from '../utilities/logger/winston_logger';

jest.mock('axios');

let server: Application;
let vendor_invalid_token: string;
let key_missing_vendor_token: string;
let null_key_vendor_token: string;

beforeAll(async () => {
  server = await createTestServer();
  logger.info('Test DataBase Connection Created');

  vendor_invalid_token = signToken({
    id: '33c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
    data: {
      type: 'restaurant',
      outlet_id: 'b0909e52-a731-4665-a791-ee6479008805',
      force_reset_password: true,
    },
    user_type: 'vendor',
  });
  key_missing_vendor_token = signToken({
    id: '33c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
    data: {
      type: 'restaurant',
      outlet_id: 'b0909e52-a731-4665-a791-ee6479008805',
    },
    user_type: 'vendor',
  });
  null_key_vendor_token = signToken({
    id: '33c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
    data: {
      type: 'restaurant',
      outlet_id: 'b0909e52-a731-4665-a791-ee6479008805',
      force_reset_password: null,
    },
    user_type: 'vendor',
  });
});
afterAll(async () => {
  await testCasesClosingTasks();
});
describe('Vendor Force Reset Password', () => {
  test('Get Main Category Of Restaurant', async () => {
    const menu_response = await request(server)
      .get('/food/vendor/menu/main_category')
      .set('Authorization', `Bearer ${vendor_invalid_token}`);
    expect(menu_response.body.status).toBe(false);
    expect(menu_response.body.statusCode).toBe(403);
    expect(menu_response.body.errors).toStrictEqual([
      {message: 'Please reset your password.', code: 0},
    ]);
  });
  test('Get Main Category Of Restaurant', async () => {
    const menu_response = await request(server)
      .get('/food/vendor/menu/main_category')
      .set('Authorization', `Bearer ${key_missing_vendor_token}`);
    expect(menu_response.body.status).toBe(false);
    expect(menu_response.body.statusCode).toBe(403);
    expect(menu_response.body.errors).toStrictEqual([
      {message: 'forbidden', code: 0},
    ]);
  });
  test('Get Main Category Of Restaurant', async () => {
    const menu_response = await request(server)
      .get('/food/vendor/menu/main_category')
      .set('Authorization', `Bearer ${null_key_vendor_token}`);
    expect(menu_response.body.status).toBe(false);
    expect(menu_response.body.statusCode).toBe(403);
    expect(menu_response.body.errors).toStrictEqual([
      {message: 'forbidden', code: 0},
    ]);
  });
});
