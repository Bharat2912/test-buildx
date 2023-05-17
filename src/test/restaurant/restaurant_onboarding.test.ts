import request from 'supertest';
import {createTestServer} from '../utils/init';
import {mocksaveS3Files, mocksaveS3File} from '../utils/mock_services';
import {
  signToken,
  loadMockSeedDataFromPath,
  testCasesClosingTasks,
} from '../utils/utils';
import {Application} from 'express';
import {sample_request} from './mock_request';

jest.mock('axios');

let server: Application;
let partner_token: string;
const test_restaurnat_id = '7c756246-8a52-4f96-8ec2-99df8745e85f';

beforeAll(async () => {
  server = await createTestServer();
  loadMockSeedDataFromPath('src/test/restaurant/restaurant_onboarding.sql');
  partner_token = signToken({
    id: 'f1a41fd3-c764-43f7-a43d-e4087b6bf90e',
    user_type: 'partner',
  });
});

afterAll(async () => {
  await testCasesClosingTasks();
});

describe('Test cases for PUT food/partner/restaurant', () => {
  describe('slot test cases :-', () => {
    test('start_time equal to end_time', async () => {
      const response = await request(server)
        .put(`/food/partner/restaurant/${test_restaurnat_id}`)
        .set('Authorization', `Bearer ${partner_token}`)
        .send({
          status: 'draft',
          scheduling_type: 'all',
          slot_schedule: [
            {
              slot_name: 'all',
              start_time: '0001',
              end_time: '0001',
            },
          ],
        });
      expect(response.body.status).toBe(false);
      expect(response.body.statusCode).toBe(400);
      expect(response.body.errors).toStrictEqual([
        {message: 'Conflicting Slot: all Times: 0001 and 0001', code: 0},
      ]);
    });
    test('start_time greater than end_time', async () => {
      const response = await request(server)
        .put(`/food/partner/restaurant/${test_restaurnat_id}`)
        .set('Authorization', `Bearer ${partner_token}`)
        .send({
          status: 'draft',
          scheduling_type: 'all',
          slot_schedule: [
            {
              slot_name: 'all',
              start_time: '0009',
              end_time: '0001',
            },
          ],
        });
      expect(response.body.status).toBe(false);
      expect(response.body.statusCode).toBe(400);
      expect(response.body.errors).toStrictEqual([
        {message: 'Conflicting Slot: all Times: 0009 and 0001', code: 0},
      ]);
    });
    test('Not sending slot name', async () => {
      const response = await request(server)
        .put(`/food/partner/restaurant/${test_restaurnat_id}`)
        .set('Authorization', `Bearer ${partner_token}`)
        .send({
          status: 'draft',
          scheduling_type: 'all',
          slot_schedule: [
            {
              start_time: '0001',
              end_time: '0023',
            },
          ],
        });
      expect(response.body.status).toBe(false);
      expect(response.body.statusCode).toBe(400);
      expect(response.body.errors).toStrictEqual([
        {
          message: '"slot_schedule[0].slot_name" is required',
          code: 0,
        },
      ]);
    });
    test('Miss-match of scheduling_type and slot_name', async () => {
      const response = await request(server)
        .put(`/food/partner/restaurant/${test_restaurnat_id}`)
        .set('Authorization', `Bearer ${partner_token}`)
        .send({
          status: 'draft',
          scheduling_type: 'all',
          slot_schedule: [
            {
              slot_name: 'custom',
              start_time: '0001',
              end_time: '0023',
            },
          ],
        });
      expect(response.body.status).toBe(false);
      expect(response.body.statusCode).toBe(400);
      expect(response.body.errors).toStrictEqual([
        {
          message: 'Incorrect slots name custom for schedule_type all',
          code: 0,
        },
      ]);
    });
    test('Invalid start_time', async () => {
      const response = await request(server)
        .put(`/food/partner/restaurant/${test_restaurnat_id}`)
        .set('Authorization', `Bearer ${partner_token}`)
        .send({
          status: 'draft',
          scheduling_type: 'weekdays_and_weekends',
          slot_schedule: [
            {
              slot_name: 'weekdays',
              start_time: '0001',
              end_time: '0023',
            },
            {
              slot_name: 'weekends',
              start_time: '001',
              end_time: '0023',
            },
          ],
        });
      expect(response.body.status).toBe(false);
      expect(response.body.statusCode).toBe(400);
      expect(response.body.errors).toStrictEqual([
        {
          message: 'Incorrect Time: 001',
          code: 0,
        },
      ]);
    });
    test('sending Empty slot_schedule', async () => {
      const response = await request(server)
        .put(`/food/partner/restaurant/${test_restaurnat_id}`)
        .set('Authorization', `Bearer ${partner_token}`)
        .send({
          status: 'draft',
          scheduling_type: 'weekdays_and_weekends',
          slot_schedule: [],
        });
      expect(response.body.status).toBe(false);
      expect(response.body.statusCode).toBe(400);
      expect(response.body.errors).toStrictEqual([
        {
          message: '"slot_schedule" must contain at least 1 items',
          code: 0,
        },
      ]);
    });
    test('Not sending start_time', async () => {
      const response = await request(server)
        .put(`/food/partner/restaurant/${test_restaurnat_id}`)
        .set('Authorization', `Bearer ${partner_token}`)
        .send({
          status: 'draft',
          scheduling_type: 'all',
          slot_schedule: [
            {
              slot_name: 'all',
            },
          ],
        });
      expect(response.body.status).toBe(false);
      expect(response.body.statusCode).toBe(400);
      expect(response.body.errors).toStrictEqual([
        {
          message: '"slot_schedule[0].start_time" is required',
          code: 0,
        },
      ]);
    });
  });
  test('Check For Invalid status name', async () => {
    mocksaveS3Files();
    mocksaveS3File();
    sample_request.status = 'invalid';
    const response = await request(server)
      .put(`/food/partner/restaurant/${test_restaurnat_id}`)
      .set('Authorization', `Bearer ${partner_token}`)
      .send(sample_request);
    expect(response.statusCode).toStrictEqual(400);
    expect(response.body.errors).toStrictEqual([
      {message: '"status" must be [draft]', code: 0},
    ]);
    sample_request.status = 'draft';
  });
  test('Check For Empty status name', async () => {
    mocksaveS3Files();
    mocksaveS3File();
    sample_request.status = '   ';
    const response = await request(server)
      .put(`/food/partner/restaurant/${test_restaurnat_id}`)
      .set('Authorization', `Bearer ${partner_token}`)
      .send(sample_request);
    expect(response.statusCode).toStrictEqual(400);
    expect(response.body.errors).toStrictEqual([
      {message: '"status" must be [draft]', code: 0},
    ]);
    sample_request.status = 'draft';
  });
  test('Check For Empty Draft_Section', async () => {
    mocksaveS3Files();
    mocksaveS3File();
    sample_request.draft_section = '';
    const response = await request(server)
      .put(`/food/partner/restaurant/${test_restaurnat_id}`)
      .set('Authorization', `Bearer ${partner_token}`)
      .send(sample_request);
    expect(response.statusCode).toStrictEqual(400);
    expect(response.body.errors).toStrictEqual([
      {message: '"draft_section" is not allowed to be empty', code: 0},
    ]);
    sample_request.draft_section = 'basic / contact / fssai / bank';
  });
  describe('Test cases for City', () => {
    test('Check For Empty City ID', async () => {
      sample_request.city_id = '';
      const response = await request(server)
        .put(`/food/partner/restaurant/${test_restaurnat_id}`)
        .set('Authorization', `Bearer ${partner_token}`)
        .send(sample_request);
      expect(response.statusCode).toStrictEqual(400);
      expect(response.body.errors).toStrictEqual([
        {message: '"city_id" is not allowed to be empty', code: 0},
      ]);
      sample_request.city_id = 'd7aa9876-1ed0-4c47-831d-cf2e05d3fc91';
    });
    test('Check For Invalid City ID', async () => {
      sample_request.city_id = 'd7aa9876-0000-bbbb-11111-cf2e05d3fc91';
      const response = await request(server)
        .put(`/food/partner/restaurant/${test_restaurnat_id}`)
        .set('Authorization', `Bearer ${partner_token}`)
        .send(sample_request);
      expect(response.statusCode).toStrictEqual(400);
      expect(response.body.errors).toStrictEqual([
        {message: '"city_id" must be a valid GUID', code: 0},
      ]);
      sample_request.city_id = 'd7aa9876-1ed0-4c47-831d-cf2e05d3fc91';
    });
  });
  describe('Test cases for area ', () => {
    test('Check For Empty area ID', async () => {
      sample_request.area_id = '';
      const response = await request(server)
        .put(`/food/partner/restaurant/${test_restaurnat_id}`)
        .set('Authorization', `Bearer ${partner_token}`)
        .send(sample_request);
      expect(response.statusCode).toStrictEqual(400);
      expect(response.body.errors).toStrictEqual([
        {message: '"area_id" is not allowed to be empty', code: 0},
      ]);
      sample_request.area_id = '52c63582-2f9d-4249-964c-0d24c7725377';
    });
    test('Check For Invalid area ID', async () => {
      sample_request.area_id = '20c37d26-0000-1111-9365-16538f10fee8';
      const response = await request(server)
        .put(`/food/partner/restaurant/${test_restaurnat_id}`)
        .set('Authorization', `Bearer ${partner_token}`)
        .send(sample_request);
      expect(response.statusCode).toStrictEqual(400);
      expect(response.body.errors).toStrictEqual([
        {message: '"area_id" must be a valid GUID', code: 0},
      ]);
      sample_request.area_id = '52c63582-2f9d-4249-964c-0d24c7725377';
    });
  });

  test('Empty Owner name | It should Throw Error.', async () => {
    sample_request.owner_name = '';
    const response = await request(server)
      .put(`/food/partner/restaurant/${test_restaurnat_id}`)
      .set('Authorization', `Bearer ${partner_token}`)
      .send(sample_request);
    expect(response.statusCode).toStrictEqual(400);
    expect(response.body.errors).toStrictEqual([
      {
        message: '"owner_name" is not allowed to be empty',
        code: 0,
      },
    ]);
    sample_request.owner_name = 'Speedyy';
  });
  test('Invalid owner Email address. It should throw erorr.', async () => {
    sample_request.owner_email = 'amitabhbachchan..com';
    const response = await request(server)
      .put(`/food/partner/restaurant/${test_restaurnat_id}`)
      .set('Authorization', `Bearer ${partner_token}`)
      .send(sample_request);
    expect(response.statusCode).toStrictEqual(400);
    expect(response.body.errors).toStrictEqual([
      {
        message: '"owner_email" must be a valid email',
        code: 0,
      },
    ]);
    sample_request.owner_email = 'Speedyy@gmail.com';
  });
  test('location should not accept empty space', async () => {
    sample_request.location = ' ';
    const response = await request(server)
      .put(`/food/partner/restaurant/${test_restaurnat_id}`)
      .set('Authorization', `Bearer ${partner_token}`)
      .send(sample_request);
    expect(response.statusCode).toStrictEqual(400);
    expect(response.body.errors).toStrictEqual([
      {
        message: '"location" length must be at least 5 characters long',
        code: 0,
      },
    ]);
    sample_request.location = '13/67 G.B. road mumbai';
  });
  test('Added 00000 as a document_sign_number it should not accept 5 digit number.', async () => {
    sample_request.document_sign_number = '12345';
    const response = await request(server)
      .put(`/food/partner/restaurant/${test_restaurnat_id}`)
      .set('Authorization', `Bearer ${partner_token}`)
      .send(sample_request);
    expect(response.statusCode).toStrictEqual(400);
    expect(response.body.errors).toStrictEqual([
      {
        message:
          '"document_sign_number" length must be at least 10 characters long',
        code: 0,
      },
    ]);
    sample_request.document_sign_number = '+919089890998';
  });
  test('Invalid postal code | it should throw error.', async () => {
    sample_request.postal_code = '0000';
    const response = await request(server)
      .put(`/food/partner/restaurant/${test_restaurnat_id}`)
      .set('Authorization', `Bearer ${partner_token}`)
      .send(sample_request);
    expect(response.statusCode).toStrictEqual(400);
    expect(response.body.errors).toStrictEqual([
      {
        message: '"postal_code" length must be at least 5 characters long',
        code: 0,
      },
    ]);
    sample_request.postal_code = '401234';
  });
  test('Empty postal code | it should throw error.', async () => {
    sample_request.postal_code = '';
    const response = await request(server)
      .put(`/food/partner/restaurant/${test_restaurnat_id}`)
      .set('Authorization', `Bearer ${partner_token}`)
      .send(sample_request);
    expect(response.statusCode).toStrictEqual(400);
    expect(response.body.errors).toStrictEqual([
      {
        message: '"postal_code" is not allowed to be empty',
        code: 0,
      },
    ]);
    sample_request.postal_code = '401234';
  });
  test('Packaging charges order level | greater than 50 | it should throw error. | order level charges should be  between 0 to 50', async () => {
    const response = await request(server)
      .put(`/food/partner/restaurant/${test_restaurnat_id}`)
      .set('Authorization', `Bearer ${partner_token}`)
      .send({
        status: 'draft',
        packing_charge_type: 'order',
        packing_charge_order: {
          packing_charge: 100,
        },
      });
    expect(response.body.statusCode).toBe(400);
    expect(response.body.status).toBe(false);
    expect(response.body.errors).toStrictEqual([
      {
        message:
          '"packing_charge_order.packing_charge" must be less than or equal to 50',
        code: 0,
      },
    ]);
  });
  test('Packaging charges order level | less than 0 | it should throw error. | order level charges should be  between 0 to 50', async () => {
    const response = await request(server)
      .put(`/food/partner/restaurant/${test_restaurnat_id}`)
      .set('Authorization', `Bearer ${partner_token}`)
      .send({
        status: 'draft',
        packing_charge_type: 'order',
        packing_charge_order: {
          packing_charge: -5,
        },
      });
    expect(response.body.statusCode).toBe(400);
    expect(response.body.status).toBe(false);
    expect(response.body.errors).toStrictEqual([
      {
        message:
          '"packing_charge_order.packing_charge" must be greater than or equal to 0',
        code: 0,
      },
    ]);
  });
  test('Update restaurant name and restaurant branch name', async () => {
    const response = await request(server)
      .put(`/food/partner/restaurant/${test_restaurnat_id}`)
      .set('Authorization', `Bearer ${partner_token}`)
      .send({
        status: 'draft',
        name: 'Test restaurant name',
        branch_name: 'Mumbai restaurant name',
      });
    expect(response.body.statusCode).toBe(200);
    expect(response.body.status).toBe(true);
    expect(response.body.result.branch_name).toBe('Mumbai restaurant name');
    expect(response.body.result.name).toBe('Test restaurant name');
  });
  test('Update restaurant poc_number', async () => {
    const response = await request(server)
      .put(`/food/partner/restaurant/${test_restaurnat_id}`)
      .set('Authorization', `Bearer ${partner_token}`)
      .send({
        status: 'draft',
        name: 'Test restaurant name',
        poc_number: '+919819999999',
      });
    expect(response.body.statusCode).toBe(200);
    expect(response.body.status).toBe(true);
    expect(response.body.result.branch_name).toBe('Mumbai restaurant name');
    expect(response.body.result.name).toBe('Test restaurant name');
  });
  test('Adding Float in default_preparation_time | Need to throw Error', async () => {
    const response = await request(server)
      .put(`/food/partner/restaurant/${test_restaurnat_id}`)
      .set('Authorization', `Bearer ${partner_token}`)
      .send({
        status: 'draft',
        name: 'Test restaurant name',
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
});
