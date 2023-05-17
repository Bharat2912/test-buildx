import request from 'supertest';
import {createTestServer} from '../utils/init';
import {Application} from 'express';
import {
  signToken,
  loadMockSeedData,
  testCasesClosingTasks,
} from '../utils/utils';
import {DB} from '../../data/knex';

jest.mock('axios');

let server: Application;
let admin_token: string;
let vendor_token: string;

beforeAll(async () => {
  server = await createTestServer();

  await loadMockSeedData('city');
  await loadMockSeedData('polygon');
  await loadMockSeedData('restaurant');
  await loadMockSeedData('time_slot');
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

describe('Vendor Slot Test Cases', () => {
  test('Reading Current Slots', async () => {
    const response = await request(server)
      .get('/food/vendor/restaurant/slot')
      .set('Authorization', `Bearer ${vendor_token}`);
    expect(response.body.status).toBe(true);
    expect(response.body.statusCode).toBe(200);
    expect(response.body.result.slot_schedule).toStrictEqual([
      {
        end_time: '2300',
        slot_name: 'all',
        start_time: '0100',
      },
    ]);
  });
  describe('PUT Vendor Slots', () => {
    test('Invalid Token', async () => {
      const response = await request(server)
        .put('/food/vendor/restaurant/slot')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          scheduling_type: 'weekdays_and_weekends',
          slot_schedule: [
            {
              slot_name: 'monday',
              start_time: '0001',
              end_time: '0001',
            },
          ],
        });
      expect(response.statusCode).toStrictEqual(403);
      expect(response.body.errors).toStrictEqual([
        {message: 'forbidden', code: 0},
      ]);
    });
    test('creating slots with empty scheduling_type | need to throw error', async () => {
      const response = await request(server)
        .put('/food/vendor/restaurant/slot')
        .set('Authorization', `Bearer ${vendor_token}`)
        .send({
          scheduling_type: '',
          slot_schedule: [
            {
              slot_name: 'monday',
              start_time: '0001',
              end_time: '0001',
            },
          ],
        });
      expect(response.statusCode).toBe(400);
      expect(response.body.errors).toStrictEqual([
        {
          message:
            '"scheduling_type" must be one of [all, weekdays_and_weekends, custom]',
          code: 0,
        },
      ]);
    });
    test('creating slots with all three scheduling_type | need to throw error', async () => {
      const response = await request(server)
        .put('/food/vendor/restaurant/slot')
        .set('Authorization', `Bearer ${vendor_token}`)
        .send({
          scheduling_type: 'all / weekdays_and_weekends / custom',
          slot_schedule: [
            {
              slot_name: 'monday',
              start_time: '0001',
              end_time: '0001',
            },
          ],
        });
      expect(response.statusCode).toBe(400);
      expect(response.body.errors).toStrictEqual([
        {
          message:
            '"scheduling_type" must be one of [all, weekdays_and_weekends, custom]',
          code: 0,
        },
      ]);
    });
    test('creating slots with empty slot name | need to throw error', async () => {
      const response = await request(server)
        .put('/food/vendor/restaurant/slot')
        .set('Authorization', `Bearer ${vendor_token}`)
        .send({
          scheduling_type: 'all',
          slot_schedule: [
            {
              slot_name: '',
              start_time: '0001',
              end_time: '0001',
            },
          ],
        });
      expect(response.statusCode).toBe(400);
      expect(response.body.errors).toStrictEqual([
        {
          message: '"slot_schedule[0].slot_name" is not allowed to be empty',
          code: 0,
        },
      ]);
    });
    test('creating slots with empty start-time | need to throw error', async () => {
      const response = await request(server)
        .put('/food/vendor/restaurant/slot')
        .set('Authorization', `Bearer ${vendor_token}`)
        .send({
          scheduling_type: 'all',
          slot_schedule: [
            {
              slot_name: 'monday',
              start_time: '',
              end_time: '0001',
            },
          ],
        });
      expect(response.statusCode).toBe(400);
      expect(response.body.errors).toStrictEqual([
        {
          message: '"slot_schedule[0].start_time" is not allowed to be empty',
          code: 0,
        },
      ]);
    });
    test('creating slots with empty end-time | need to throw error', async () => {
      const response = await request(server)
        .put('/food/vendor/restaurant/slot')
        .set('Authorization', `Bearer ${vendor_token}`)
        .send({
          scheduling_type: 'all',
          slot_schedule: [
            {
              slot_name: 'monday',
              start_time: '0001',
              end_time: '',
            },
          ],
        });
      expect(response.statusCode).toBe(400);
      expect(response.body.errors).toStrictEqual([
        {
          message: '"slot_schedule[0].end_time" is not allowed to be empty',
          code: 0,
        },
      ]);
    });
    test('creating slots with overlapping time | need to throw error for conflicting time', async () => {
      const response = await request(server)
        .put('/food/vendor/restaurant/slot')
        .set('Authorization', `Bearer ${vendor_token}`)
        .send({
          scheduling_type: 'all',
          slot_schedule: [
            {
              slot_name: 'all',
              start_time: '0900',
              end_time: '2300',
            },
            {
              slot_name: 'all',
              start_time: '0900',
              end_time: '2200',
            },
          ],
        });
      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe(false);
      expect(response.body.errors).toStrictEqual([
        {
          message: 'Conflicting Slot: all Times: 0900 and 2200',
          code: 0,
        },
      ]);
    });
    test('creating slots with overlapping time of weekdays | need to throw error for conflicting time', async () => {
      const response = await request(server)
        .put('/food/vendor/restaurant/slot')
        .set('Authorization', `Bearer ${vendor_token}`)
        .send({
          scheduling_type: 'weekdays_and_weekends',
          slot_schedule: [
            {
              slot_name: 'weekdays',
              start_time: '0900',
              end_time: '2300',
            },
            {
              slot_name: 'weekdays',
              start_time: '0900',
              end_time: '2200',
            },
          ],
        });
      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe(false);
      expect(response.body.errors).toStrictEqual([
        {
          message: 'Conflicting Slot: weekdays Times: 0900 and 2200',
          code: 0,
        },
      ]);
    });
    test('creating slots with overlapping time of weekends | need to throw error for conflicting time', async () => {
      const response = await request(server)
        .put('/food/vendor/restaurant/slot')
        .set('Authorization', `Bearer ${vendor_token}`)
        .send({
          scheduling_type: 'weekdays_and_weekends',
          slot_schedule: [
            {
              slot_name: 'weekends',
              start_time: '0900',
              end_time: '2300',
            },
            {
              slot_name: 'weekends',
              start_time: '0900',
              end_time: '2200',
            },
          ],
        });
      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe(false);
      expect(response.body.errors).toStrictEqual([
        {
          message: 'Conflicting Slot: weekends Times: 0900 and 2200',
          code: 0,
        },
      ]);
    });
    test('creating slots with overlapping time of custom | need to throw error for conflicting time', async () => {
      const response = await request(server)
        .put('/food/vendor/restaurant/slot')
        .set('Authorization', `Bearer ${vendor_token}`)
        .send({
          scheduling_type: 'custom',
          slot_schedule: [
            {
              slot_name: 'mon',
              start_time: '0900',
              end_time: '2400',
            },
            {
              slot_name: 'mon',
              start_time: '0001',
              end_time: '2200',
            },
          ],
        });
      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe(false);
      expect(response.body.errors).toStrictEqual([
        {
          message: 'Conflicting Slot: mon Times: 0001 and 2200',
          code: 0,
        },
      ]);
    });
    test('creating slots with valid request body', async () => {
      const response = await request(server)
        .put('/food/vendor/restaurant/slot')
        .set('Authorization', `Bearer ${vendor_token}`)
        .send({
          scheduling_type: 'all',
          slot_schedule: [
            {slot_name: 'all', start_time: '0100', end_time: '0200'},
            {slot_name: 'all', start_time: '0300', end_time: '0400'},
            {slot_name: 'all', start_time: '0500', end_time: '0600'},
          ],
        });
      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe(true);
      expect(response.body.result).toStrictEqual({
        scheduling_type: 'all',
        slot_schedule: [
          {slot_name: 'all', start_time: '0100', end_time: '0200'},
          {slot_name: 'all', start_time: '0300', end_time: '0400'},
          {slot_name: 'all', start_time: '0500', end_time: '0600'},
        ],
      });
      const slot_db_result = await DB.read('slot').where({
        restaurant_id: 'b0909e52-a731-4665-a791-ee6479008805',
      });
      expect(slot_db_result[0].restaurant_id).toBe(
        'b0909e52-a731-4665-a791-ee6479008805'
      );
      expect(slot_db_result[0].slot_name).toBe('all');
      expect(slot_db_result[0].start_time).toBe('0100');
      expect(slot_db_result[0].end_time).toBe('0200');
    });

    test('creating slot schedule with more than 3 slots | need to throw errors', async () => {
      const response = await request(server)
        .put('/food/vendor/restaurant/slot')
        .set('Authorization', `Bearer ${vendor_token}`)
        .send({
          scheduling_type: 'all',
          slot_schedule: [
            {slot_name: 'all', start_time: '0100', end_time: '0200'},
            {slot_name: 'all', start_time: '0300', end_time: '0400'},
            {slot_name: 'all', start_time: '0500', end_time: '0600'},
            {slot_name: 'all', start_time: '0700', end_time: '0800'},
          ],
        });
      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe(false);
      expect(response.body.errors).toStrictEqual([
        {code: 0, message: 'Maximum 3 slots can be created for all'},
      ]);
    });
  });
  describe('GET Vendor Slots', () => {
    test('Invalid Token', async () => {
      const response = await request(server)
        .get('/food/vendor/restaurant/slot')
        .set('Authorization', `Bearer ${admin_token}`);
      expect(response.body.status).toBe(false);
      expect(response.statusCode).toStrictEqual(403);
      expect(response.body.errors).toStrictEqual([
        {message: 'forbidden', code: 0},
      ]);
    });
    test('Reading Current Slots', async () => {
      const response = await request(server)
        .get('/food/vendor/restaurant/slot')
        .set('Authorization', `Bearer ${vendor_token}`);
      expect(response.body.status).toBe(true);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.result).toStrictEqual({
        scheduling_type: 'all',
        slot_schedule: [
          {slot_name: 'all', start_time: '0100', end_time: '0200'},
          {slot_name: 'all', start_time: '0300', end_time: '0400'},
          {slot_name: 'all', start_time: '0500', end_time: '0600'},
        ],
      });
    });
  });
});
