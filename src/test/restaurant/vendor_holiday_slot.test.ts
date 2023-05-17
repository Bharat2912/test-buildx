import request from 'supertest';
import {createTestServer} from '../utils/init';
import {Application} from 'express';
import {} from '../utils/mock_services';
import {
  signToken,
  loadMockSeedData,
  testCasesClosingTasks,
} from '../utils/utils';
import {returnHolidaySlots} from '../../module/food/restaurant/models';
import {sample_request} from './mock_request';

jest.mock('axios');

let server: Application;
let admin_token: string;
let partner_token: string;
let invalid_vendor_token: string;

const admin_id = '64bfafb6-c273-4b64-a0fc-ca981f5819eb';
const restaurant_id = '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242';

const start_time = new Date();
start_time.setDate(new Date().getDate() + 1);
const next_day_epoch = Math.floor(start_time.getTime() / 1000);

const invalid_start_time = new Date();
invalid_start_time.setDate(new Date().getDate() - 1);
const previous_day_epoch = Math.floor(invalid_start_time.getTime() / 1000);

beforeAll(async () => {
  server = await createTestServer();

  await loadMockSeedData('cuisine');
  await loadMockSeedData('language');
  await loadMockSeedData('city');
  await loadMockSeedData('polygon');
  await loadMockSeedData('restaurant');
  await loadMockSeedData('time_slot');
  await loadMockSeedData('subscription');
  partner_token = signToken({
    id: 'f1a41fd3-c764-43f7-a43d-e4087b6bf90e',
    user_type: 'partner',
  });

  admin_token = signToken({
    id: admin_id,
    user_type: 'admin',
  });

  invalid_vendor_token = signToken({
    id: 'cdf39e49-3b6b-4558-b08d-cb00b8ddb0b4',
    user_type: 'vendor',
    data: {
      type: 'restaurant',
      outlet_id: '64bfafb6-1111-4b64-0000-ca981f5819eb',
      force_reset_password: false,
    },
  });
});

afterAll(async () => {
  await testCasesClosingTasks();
});

describe('Test cases for POST food/vendor/restaurant/createHolidaySlot', () => {
  let restaurant_vendor_token: string;
  beforeAll(async () => {
    restaurant_vendor_token = signToken({
      id: 'cdf39e49-3b6b-4558-b08d-cb00b8ddb0a4',
      user_type: 'vendor',
      data: {
        type: 'restaurant',
        outlet_id: restaurant_id,
        force_reset_password: false,
      },
    });
  });
  test('Applying valid Restaurnat ID | Invalid Token | Partner Token', async () => {
    const response = await request(server)
      .post('/food/vendor/restaurant/createHolidaySlot')
      .set('Authorization', `Bearer ${partner_token}`);
    expect(response.body.status).toBe(false);
    expect(response.body.statusCode).toBe(403);
    expect(response.body.errors).toStrictEqual([
      {message: 'forbidden', code: 0},
    ]);
  });
  test('Applying valid Restaurnat ID | Invalid Token | Admin Token', async () => {
    const response = await request(server)
      .post('/food/vendor/restaurant/createHolidaySlot')
      .set('Authorization', `Bearer ${admin_token}`);
    expect(response.body.status).toBe(false);
    expect(response.body.statusCode).toBe(403);
    expect(response.body.errors).toStrictEqual([
      {message: 'forbidden', code: 0},
    ]);
  });
  test('Applying valid restaurant ID | valid Token | Invalid epoch', async () => {
    const response = await request(server)
      .post('/food/vendor/restaurant/createHolidaySlot')
      .set('Authorization', `Bearer ${restaurant_vendor_token}`)
      .send({
        end_epoch: previous_day_epoch,
      });
    expect(response.body.status).toBe(false);
    expect(response.body.statusCode).toBe(400);
    expect(response.body.errors).toStrictEqual([
      {
        message: 'end time is before current date',
        code: 1094,
      },
    ]);
  });
  test('Applying Invalid restaurant ID | Invalid Token | valid epoch', async () => {
    const response = await request(server)
      .post('/food/vendor/restaurant/createHolidaySlot')
      .set('Authorization', `Bearer ${invalid_vendor_token}`)
      .send({
        end_epoch: next_day_epoch,
      });
    expect(response.body.status).toBe(false);
    expect(response.body.statusCode).toBe(404);
    expect(response.body.errors).toStrictEqual([
      {message: 'restaurant not found', code: 1093},
    ]);
  });
  test('Applying valid restaurant ID | valid Token | valid epoch', async () => {
    const response = await request(server)
      .post('/food/vendor/restaurant/createHolidaySlot')
      .set('Authorization', `Bearer ${restaurant_vendor_token}`)
      .send({
        end_epoch: next_day_epoch,
      });
    expect(response.body.statusCode).toBe(200);
    expect(response.body.status).toBe(true);
    expect(response.body.message).toBe('Successful Response');
    expect(response.body.result.restaurant_id).toBe(restaurant_id);
    //  once holiday is created we will check if the details are inserted into database holiday_slot table
    const databaseResponse = await returnHolidaySlots([restaurant_id]);
    expect(databaseResponse[0].open_after).not.toBe(null);
    expect(databaseResponse[0].restaurant_id).toBe(restaurant_id);
  });
  describe('Test cases for POST food/restaurant/serviceable | valid Req | Need to Throw error | restaurant in holiday slot', () => {
    test('check servicibility', async () => {
      const response = await request(server)
        .post('/food/restaurant/serviceable')
        .send({
          restaurant_id: restaurant_id,
          customer_coordinates: {
            latitude: sample_request.lat,
            longitude: sample_request.long,
          },
        });
      expect(response.body.status).toBe(false);
      expect(response.body.statusCode).toBe(400);
      expect(response.body.errors).toStrictEqual([
        {message: 'restaurant_selected_in_cart_is_closed', code: 1029},
      ]);
    });
  });
});
describe('Test cases for DELETE food/vendor/restaurant/holidaySlot', () => {
  let restaurant_vendor_token: string;
  beforeAll(async () => {
    restaurant_vendor_token = signToken({
      id: 'cdf39e49-3b6b-4558-b08d-cb00b8ddb0a4',
      user_type: 'vendor',
      data: {
        type: 'restaurant',
        outlet_id: restaurant_id,
        force_reset_password: false,
      },
    });
  });
  test('Applying Invalid restaurant ID | Need to throw error', async () => {
    const response = await request(server)
      .delete('/food/vendor/restaurant/holidaySlot')
      .set('Authorization', `Bearer ${invalid_vendor_token}`);
    expect(response.body.status).toBe(false);
    expect(response.body.statusCode).toBe(404);
    expect(response.body.errors).toStrictEqual([
      {message: 'restaurant not found', code: 1093},
    ]);
  });
  test('Applying Invalid Token | admin Token | Need to throw error', async () => {
    const response = await request(server)
      .delete('/food/vendor/restaurant/holidaySlot')
      .set('Authorization', `Bearer ${admin_token}`);
    expect(response.body.status).toBe(false);
    expect(response.body.statusCode).toBe(403);
    expect(response.body.errors).toStrictEqual([
      {message: 'forbidden', code: 0},
    ]);
  });
  test('Applying valid restaurant | valid Token | Remove holiday slot', async () => {
    const response = await request(server)
      .delete('/food/vendor/restaurant/holidaySlot')
      .set('Authorization', `Bearer ${restaurant_vendor_token}`);
    expect(response.body.status).toBe(true);
    expect(response.body.statusCode).toBe(200);
    expect(response.body.message).toBe('Successful Response');
    expect(response.body.result).toBe('removed from holiday slot');

    //  once holiday is removed we will check if the details are inserted into database holiday_slot table
    const databaseResponse = await returnHolidaySlots([restaurant_id]);
    expect(databaseResponse.length).toEqual(0);
  });
  test('Applying restaurant not in holiday slot | Remove holiday slot | Need to throw error', async () => {
    const response = await request(server)
      .delete('/food/vendor/restaurant/holidaySlot')
      .set('Authorization', `Bearer ${restaurant_vendor_token}`);
    expect(response.body.status).toBe(false);
    expect(response.body.statusCode).toBe(400);
    expect(response.body.errors).toEqual([
      {message: 'not in holiday', code: 1096},
    ]);
  });
});
