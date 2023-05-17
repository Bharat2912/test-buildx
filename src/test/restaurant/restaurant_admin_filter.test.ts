import request from 'supertest';
import {createTestServer} from '../utils/init';
import {Application} from 'express';
import {
  signToken,
  loadMockSeedData,
  testCasesClosingTasks,
} from '../utils/utils';
import {
  mockgenerateDownloadFileURL,
  mockgetAdminDetails,
  mockgetAdminDetailsById,
} from '../utils/mock_services';

jest.mock('axios');

let server: Application;
let admin_token: string;

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
});

afterAll(async () => {
  await testCasesClosingTasks();
});

describe('FILTER RESTAURANT AS ADMIN', () => {
  test('Token Not Provided | Need To throw error', async () => {
    const response = await request(server)
      .post('/food/admin/restaurant/filter')
      .send({});
    expect(response.body.status).toBe(false);
    expect(response.body.statusCode).toBe(401);
    expect(response.body.errors).toStrictEqual([
      {message: 'Authorization Error', code: 0},
    ]);
  });
  test('Invalid search_text As Restaurant name', async () => {
    const mock_get_admin_details = await mockgetAdminDetails();
    const mock_get_admin_details_by_id = await mockgetAdminDetailsById();
    const response = await request(server)
      .post('/food/admin/restaurant/filter')
      .set('Authorization', `Bearer ${admin_token}`)
      .send({
        search_text: "mcdonald's",
        filter: {},
        pagination: {
          page_index: 0,
          page_size: 50,
        },
        sort: [
          {
            column: 'created_at',
            order: 'asc',
          },
        ],
      });
    expect(response.body.statusCode).toBe(200);
    expect(response.body.status).toBe(true);
    expect(response.body.result.total_records).toEqual(0);
    expect(mock_get_admin_details).toHaveBeenCalled();
    expect(mock_get_admin_details_by_id).toHaveBeenCalled();
  });
  test('Valid search_text As Restaurant name', async () => {
    const mock_get_admin_details = await mockgetAdminDetails();
    const mock_get_admin_details_by_id = await mockgetAdminDetailsById();
    const mock_generate_url = await mockgenerateDownloadFileURL();
    const response = await request(server)
      .post('/food/admin/restaurant/filter')
      .set('Authorization', `Bearer ${admin_token}`)
      .send({
        search_text: "Tiger's",
        filter: {},
        pagination: {
          page_index: 0,
          page_size: 50,
        },
        sort: [
          {
            column: 'created_at',
            order: 'asc',
          },
        ],
      });
    expect(response.body.statusCode).toBe(200);
    expect(response.body.status).toBe(true);
    expect(response.body.result.total_records).toEqual(1);
    expect(mock_get_admin_details_by_id).toHaveBeenCalled();
    expect(mock_get_admin_details).toHaveBeenCalled();
    expect(mock_generate_url).toHaveBeenCalled();
  });
  test('Invalid city_name', async () => {
    const mock_get_admin_details = await mockgetAdminDetails();
    const mock_get_admin_details_by_id = await mockgetAdminDetailsById();
    const response = await request(server)
      .post('/food/admin/restaurant/filter')
      .set('Authorization', `Bearer ${admin_token}`)
      .send({
        filter: {
          city_name: "pune's all",
        },
        pagination: {
          page_index: 0,
          page_size: 50,
        },
        sort: [
          {
            column: 'created_at',
            order: 'asc',
          },
        ],
      });
    expect(response.body.status).toBe(true);
    expect(response.body.statusCode).toBe(200);
    expect(response.body.result.total_records).toEqual(0);
    expect(mock_get_admin_details).toHaveBeenCalled();
    expect(mock_get_admin_details_by_id).toHaveBeenCalled();
  });
  test('Valid city_name', async () => {
    const mock_get_admin_details = await mockgetAdminDetails();
    const mock_get_admin_details_by_id = await mockgetAdminDetailsById();
    const mock_generate_url = await mockgenerateDownloadFileURL();
    const response = await request(server)
      .post('/food/admin/restaurant/filter')
      .set('Authorization', `Bearer ${admin_token}`)
      .send({
        filter: {
          city_name: 'mumbai',
        },
        pagination: {
          page_index: 0,
          page_size: 50,
        },
        sort: [
          {
            column: 'created_at',
            order: 'asc',
          },
        ],
      });
    expect(response.body.status).toBe(true);
    expect(response.body.statusCode).toBe(200);
    expect(response.body.result.total_records).toEqual(1);
    expect(mock_get_admin_details_by_id).toHaveBeenCalled();
    expect(mock_get_admin_details).toHaveBeenCalled();
    expect(mock_generate_url).toHaveBeenCalled();
  });
  test('Invalid area_name', async () => {
    const mock_get_admin_details = await mockgetAdminDetails();
    const mock_get_admin_details_by_id = await mockgetAdminDetailsById();
    const response = await request(server)
      .post('/food/admin/restaurant/filter')
      .set('Authorization', `Bearer ${admin_token}`)
      .send({
        filter: {
          area_name: "pune's all",
        },
        pagination: {
          page_index: 0,
          page_size: 50,
        },
        sort: [
          {
            column: 'created_at',
            order: 'asc',
          },
        ],
      });
    expect(response.body.status).toBe(true);
    expect(response.body.statusCode).toBe(200);
    expect(response.body.result.total_records).toEqual(0);
    expect(mock_get_admin_details).toHaveBeenCalled();
    expect(mock_get_admin_details_by_id).toHaveBeenCalled();
  });
  test('Valid area_name', async () => {
    const mock_get_admin_details = await mockgetAdminDetails();
    const mock_get_admin_details_by_id = await mockgetAdminDetailsById();
    const mock_generate_url = await mockgenerateDownloadFileURL();
    const response = await request(server)
      .post('/food/admin/restaurant/filter')
      .set('Authorization', `Bearer ${admin_token}`)
      .send({
        filter: {
          area_name: 'Mumbai test',
        },
        pagination: {
          page_index: 0,
          page_size: 50,
        },
        sort: [
          {
            column: 'created_at',
            order: 'asc',
          },
        ],
      });
    expect(response.body.status).toBe(true);
    expect(response.body.statusCode).toBe(200);
    expect(response.body.result.total_records).toEqual(1);
    expect(mock_get_admin_details_by_id).toHaveBeenCalled();
    expect(mock_get_admin_details).toHaveBeenCalled();
    expect(mock_generate_url).toHaveBeenCalled();
  });
});
