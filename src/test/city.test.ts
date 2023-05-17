import request from 'supertest';
import {createTestServer} from './utils/init';
import {Application} from 'express';
import {
  signToken,
  loadMockSeedData,
  testCasesClosingTasks,
} from './utils/utils';
import {mockgetAdminDetails} from './utils/mock_services';
import {
  get_city_admin_response,
  get_city_partner_response,
} from './utils/mock_responses';
import logger from '../utilities/logger/winston_logger';

jest.mock('axios');

let server: Application;
let partner_token: string;
let admin_token: string;

beforeAll(async () => {
  server = await createTestServer();

  await loadMockSeedData('city');
  logger.info('Jest DataBase Connection Created');
  partner_token = signToken({
    id: 'cdf39e49-3b6b-4558-b08d-cb00b8ddb0a4',
    user_type: 'partner',
  });
  admin_token = signToken({
    id: '64bfafb6-c273-4b64-a0fc-ca981f5819eb',
    user_type: 'admin',
  });
});

afterAll(async () => {
  await testCasesClosingTasks();
});

const valid_city_response = {
  id: '15971528-ae60-4622-90c9-02b5d49d3fc3',
  name: 'Mumbai-suburban',
  status: 'active',
};

describe('City Test Cases :- ', () => {
  const valid_id = '15971528-ae60-4622-90c9-02b5d49d3fc3';
  const invalid_id = '15971528-ae60-4622-90c9-02b5d49d3sjkdc3';

  describe('Auth {Token} Validation ', () => {
    test('unauthorized 401 status code if admin token not provided', async () => {
      const response = await request(server).post('/core/admin/city');
      expect(response.statusCode).toBe(401);
    });
    test('unauthorized 401 status code if partner token not provided', async () => {
      const response = await request(server).get('/core/partner/city');
      expect(response.statusCode).toBe(401);
    });
    test('Forbidden 403 status code if wrong token is provided :- Admin', async () => {
      const response = await request(server)
        .get('/core/partner/city')
        .set('Authorization', `Bearer ${admin_token}`);
      expect(response.statusCode).toBe(403);
      expect(response.body.errors).toStrictEqual([
        {message: 'forbidden', code: 0},
      ]);
    });
    test('Forbidden 403 status code if wrong token is provided :- Partner', async () => {
      const response = await request(server)
        .get('/core/admin/city')
        .set('Authorization', `Bearer ${partner_token}`);
      expect(response.statusCode).toBe(403);
      expect(response.body.errors).toStrictEqual([
        {message: 'forbidden', code: 0},
      ]);
    });
  });

  describe('POST Request Test', () => {
    let temp_id: string;
    test('201 with Right Request Body & Token', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .post('/core/admin/city')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          name: 'new-city',
          status: 'active',
        });
      expect(response.statusCode).toBe(201);
      temp_id = response.body.result.id;
    });
    test('Deleting record', async () => {
      mockgetAdminDetails();
      const deleterecord = await request(server)
        .delete(`/core/admin/city/${temp_id}`)
        .set('Authorization', `Bearer ${admin_token}`);
      expect(deleterecord.statusCode).toBe(200);
    });
    test('Get Deleted Record record', async () => {
      mockgetAdminDetails();
      const getrecord = await request(server)
        .get(`/core/admin/city/${temp_id}`)
        .set('Authorization', `Bearer ${admin_token}`);
      expect(getrecord.statusCode).toBe(404);
    });

    test('400 with Wrong Request Body & Right Token', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .post('/core/admin/city')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          name: '',
          status: 'active',
        });
      expect(response.statusCode).toBe(400);
      expect(response.body.errors).toStrictEqual([
        {message: '"name" is not allowed to be empty', code: 0},
      ]);
    });
    test('400 with Wrong Request Body & Right Token', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .post('/core/admin/city')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          name: 'empty-status',
          status: '',
        });
      expect(response.statusCode).toBe(400);
      expect(response.body.errors).toStrictEqual([
        {message: '"status" must be one of [active, inactive]', code: 0},
      ]);
    });
    test('403 with Right Request Body & Wrong Token', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .post('/core/admin/city')
        .set('Authorization', `Bearer ${partner_token}`)
        .send({
          name: 'new-city',
          status: 'active',
        });
      expect(response.statusCode).toBe(403);
      expect(response.body.errors).toStrictEqual([
        {message: 'forbidden', code: 0},
      ]);
    });
    //City with Invalid status name should return 400.
  });

  describe('GET Request Test', () => {
    test('Get all cities', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .get('/core/admin/city')
        .set('Authorization', `Bearer ${admin_token}`);
      expect(response.statusCode).toBe(200);
      expect(response.body.result).toMatchObject(get_city_admin_response);
    });
    test('Get cities By ID with valid_id', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .get(`/core/admin/city/${valid_id}`)
        .set('Authorization', `Bearer ${admin_token}`);
      expect(response.statusCode).toBe(200);
      expect(response.body.result).toMatchObject(valid_city_response);
    });
    test('Get cities By ID with invalid_id', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .get(`/core/admin/city/${invalid_id}`)
        .set('Authorization', `Bearer ${admin_token}`);
      expect(response.statusCode).toBe(400);
      expect(response.body.errors).toStrictEqual([
        {message: '"value" must be a valid GUID', code: 0},
      ]);
    });
    test('Get all cities with invalid token', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .get('/core/admin/city')
        .set('Authorization', `Bearer ${partner_token}`);
      expect(response.statusCode).toBe(403);
      expect(response.body.errors).toStrictEqual([
        {message: 'forbidden', code: 0},
      ]);
    });
    test('Get all cities with valid token:- {partner}', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .get('/core/partner/city')
        .set('Authorization', `Bearer ${partner_token}`);
      expect(response.statusCode).toBe(200);
      expect(response.body.result).toMatchObject(get_city_partner_response);
    });
    test('Get all cities with valid token:- {partner}', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .get('/core/partner/city')
        .set('Authorization', `Bearer ${admin_token}`);
      expect(response.statusCode).toBe(403);
      expect(response.body.errors).toStrictEqual([
        {message: 'forbidden', code: 0},
      ]);
    });
  });

  describe('PUT Request Test', () => {
    test('Updating with invalid city ID :- ', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .put(`/core/admin/city/${invalid_id}`)
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          name: 'Updating-city-name',
          status: 'active',
        });
      expect(response.statusCode).toBe(400);
      expect(response.body.errors).toStrictEqual([
        {message: '"value" must be a valid GUID', code: 0},
      ]);
    });
    test('Updating with valid city ID & Empty city name:- ', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .put(`/core/admin/city/${valid_id}`)
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          name: '',
          status: 'active',
        });
      expect(response.statusCode).toBe(400);
      expect(response.body.errors).toStrictEqual([
        {message: '"name" is not allowed to be empty', code: 0},
      ]);
    });
    test('Updating with valid city ID & Empty city status:- ', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .put(`/core/admin/city/${valid_id}`)
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          name: 'Updating-city-name',
          status: '',
        });
      expect(response.statusCode).toBe(400);
      expect(response.body.errors).toStrictEqual([
        {message: '"status" must be one of [active, inactive]', code: 0},
      ]);
    });
    test('Updating with invalid Token :- ', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .put(`/core/admin/city/${valid_id}`)
        .set('Authorization', `Bearer ${partner_token}`)
        .send({
          name: 'Updating-city-name',
          status: 'active',
        });
      expect(response.statusCode).toBe(403);
      expect(response.body.errors).toStrictEqual([
        {message: 'forbidden', code: 0},
      ]);
    });
    test('Updating with valid city ID :- ', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .put(`/core/admin/city/${valid_id}`)
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          name: 'Updating-city-name',
          status: 'active',
        });
      expect(response.statusCode).toBe(200);
      expect(response.body.result.id).toBe(valid_id);
    });
  });

  describe('DELETE Request Test', () => {
    test('Deleting with invalid ID', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .delete(`/core/admin/city/${invalid_id}`)
        .set('Authorization', `Bearer ${admin_token}`);
      expect(response.statusCode).toBe(400);
    });
    test('Deleting with valid ID', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .delete(`/core/admin/city/${valid_id}`)
        .set('Authorization', `Bearer ${admin_token}`);
      expect(response.statusCode).toBe(200);
    });
    test('Get the DELETED city with id 400 response', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .get(`/core/admin/city/${valid_id}`)
        .set('Authorization', `Bearer ${admin_token}`);
      expect(response.statusCode).toBe(404);
      expect(response.body.errors).toStrictEqual([
        {message: 'City  Not Found', code: 0},
      ]);
    });
  });
});
