import request from 'supertest';
import {createTestServer} from './utils/init';
import {Application} from 'express';
import {
  signToken,
  loadMockSeedData,
  testCasesClosingTasks,
} from './utils/utils';
import logger from '../utilities/logger/winston_logger';
import {mockgetAdminDetails} from './utils/mock_services';
import {readPolygonById} from '../module/core/polygon/models';

jest.mock('axios');

let server: Application;
let admin_token: string;
let partner_token: string;
const polygon = {
  name: 'Dadar (Mumbai)',
  city_id: 'd7aa9876-1ed0-4c47-831d-cf2e05d3fc91',
  coordinates: [
    [19.0350766380292, 72.85821064336159],
    [19.02410463866311, 72.83312610386065],
    [19.00268945672246, 72.83949083776388],
    [19.013308899953877, 72.87562006256748],
  ],
};
let polygon_id: string;
const invalid_city_id = '2b60f6ca-2065-4606-9b84-48f3916e4c66';
const invalid_polygon_id = 'a309833a-0716-4b3c-aa6f-64109af12453';
beforeAll(async () => {
  server = await createTestServer();

  await loadMockSeedData('city');
  await loadMockSeedData('polygon');
  logger.info('Jest DataBase Connection Created');
  admin_token = signToken({
    id: '64bfafb6-c273-4b64-a0fc-ca981f5819eb',
    user_type: 'admin',
    role: 'superadmin',
  });
  partner_token = signToken({
    id: '28dad7e4-138a-4ad8-933a-e06667631a5f',
    user_type: 'partner',
  });
});
afterAll(async () => {
  await testCasesClosingTasks();
});

describe('Polygon Test Cases :- ', () => {
  describe('Create Polygon | POST /core/admin/polygon', () => {
    test('Not Provide Token | Need to throw error', async () => {
      mockgetAdminDetails();
      const response = await request(server).post('/core/admin/polygon');
      expect(response.body.status).toBe(false);
      expect(response.body.statusCode).toBe(401);
      expect(response.body.errors).toStrictEqual([
        {message: 'Authorization Error', code: 0},
      ]);
    });
    test('Not Provide name | Need to throw error', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .post('/core/admin/polygon')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({});
      expect(response.body.status).toBe(false);
      expect(response.body.statusCode).toBe(400);
      expect(response.body.errors).toStrictEqual([
        {message: '"name" is required', code: 0},
      ]);
    });
    test('Not Provide city | Need to throw error', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .post('/core/admin/polygon')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({name: 'Dadar(Mumbai)'});
      expect(response.body.status).toBe(false);
      expect(response.body.statusCode).toBe(400);
      expect(response.body.errors).toStrictEqual([
        {message: '"city_id" is required', code: 0},
      ]);
    });
    test('Invalid city ID | Need to throw error', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .post('/core/admin/polygon')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({name: 'Dadar(Mumbai)', city_id: invalid_city_id});
      expect(response.body.status).toBe(false);
      expect(response.body.statusCode).toBe(404);
      expect(response.body.errors).toStrictEqual([
        {message: 'City  Not Found', code: 0},
      ]);
    });
    test('creating polygon | valid city ID', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .post('/core/admin/polygon')
        .set('Authorization', `Bearer ${admin_token}`)
        .send(polygon);
      expect(response.body.status).toBe(true);
      expect(response.body.statusCode).toBe(201);
      expect(response.body.message).toBe('Successful Response');
      expect(response.body.result.city_id).toBe(polygon.city_id);
      expect(response.body.result.name).toBe(polygon.name);
      polygon_id = response.body.result.id;
      const databse = await readPolygonById(polygon_id);
      expect(databse.city_id).toBe(polygon.city_id);
      expect(databse.name).toBe(polygon.name);
    });
  });
  describe('GET Polygon By ID | GET /core/admin/polygon/{id}', () => {
    test('Not Provide Token | Need to throw error', async () => {
      mockgetAdminDetails();
      const response = await request(server).get(
        `/core/admin/polygon/${polygon_id}`
      );
      expect(response.body.status).toBe(false);
      expect(response.body.statusCode).toBe(401);
      expect(response.body.errors).toStrictEqual([
        {message: 'Authorization Error', code: 0},
      ]);
    });
    test('Invalid polygon ID | Need to throw error', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .get(`/core/admin/polygon/${invalid_polygon_id}`)
        .set('Authorization', `Bearer ${admin_token}`);
      expect(response.body.status).toBe(false);
      expect(response.body.statusCode).toBe(404);
      expect(response.body.errors).toStrictEqual([
        {message: 'polygon not found', code: 0},
      ]);
    });
    test('GET polygon By ID', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .get(`/core/admin/polygon/${polygon_id}`)
        .set('Authorization', `Bearer ${admin_token}`);
      expect(response.body.status).toBe(true);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.message).toBe('Successful Response');
      expect(response.body.result.city_id).toBe(polygon.city_id);
      expect(response.body.result.name).toBe(polygon.name);
    });
  });
  describe('GET All Polygon | GET /core/admin/polygon', () => {
    test('Not Provide Token | Need to throw error', async () => {
      mockgetAdminDetails();
      const response = await request(server).get('/core/admin/polygon/');
      expect(response.body.status).toBe(false);
      expect(response.body.statusCode).toBe(401);
      expect(response.body.errors).toStrictEqual([
        {message: 'Authorization Error', code: 0},
      ]);
    });
    test('GET All Polygon', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .get('/core/admin/polygon/')
        .set('Authorization', `Bearer ${admin_token}`);
      expect(response.body.status).toBe(true);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.message).toBe('Successful Response');
      expect(response.body.result.length).not.toEqual(0);
      expect(response.body.result.length).toEqual(5);
    });
  });
  describe('GET Polygon By city IDS | GET /core/admin/polygon/filter', () => {
    test('Not Provide Token | Need to throw error', async () => {
      mockgetAdminDetails();
      const response = await request(server).post('/core/admin/polygon/filter');
      expect(response.body.status).toBe(false);
      expect(response.body.statusCode).toBe(401);
      expect(response.body.errors).toStrictEqual([
        {message: 'Authorization Error', code: 0},
      ]);
    });
    test('Provide empty city IDS | Need to throw error', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .post('/core/admin/polygon/filter')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          filter: {
            city_ids: [''],
          },
        });
      expect(response.body.status).toBe(false);
      expect(response.body.statusCode).toBe(400);
      expect(response.body.errors).toStrictEqual([
        {message: 'Please add city_id', code: 0},
      ]);
    });
    test('Not Provide city IDS | GET All Polygon', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .post('/core/admin/polygon/filter')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({filter: {}});
      expect(response.body.status).toBe(true);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.message).toBe('Successful Response');
      expect(response.body.result.length).not.toEqual(0);
      expect(response.body.result.length).toEqual(5);
    });
    test('Provide city IDS | GET  Polygon', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .post('/core/admin/polygon/filter')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          filter: {
            city_ids: [polygon.city_id],
          },
        });
      expect(response.body.status).toBe(true);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.message).toBe('Successful Response');
      expect(response.body.result.length).toBe(2);
    });
  });
  describe('GET polygon As Partner', () => {
    test('Not Provide Token | Need to throw error', async () => {
      const response = await request(server)
        .get('/core/partner/polygon/')
        .query({city_id: polygon.city_id});
      expect(response.body.status).toBe(false);
      expect(response.body.statusCode).toBe(401);
      expect(response.body.errors).toStrictEqual([
        {message: 'Authorization Error', code: 0},
      ]);
    });
    test('Invalid city ID | Empty Response', async () => {
      const response = await request(server)
        .get('/core/partner/polygon/')
        .set('Authorization', `Bearer ${partner_token}`)
        .query({city_id: invalid_city_id});
      expect(response.body.status).toBe(true);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.message).toBe('Successful Response');
      expect(response.body.result.length).toEqual(0);
    });
    test('Valid city ID', async () => {
      const response = await request(server)
        .get('/core/partner/polygon/')
        .set('Authorization', `Bearer ${partner_token}`)
        .query({city_id: polygon.city_id});
      expect(response.body.status).toBe(true);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.message).toBe('Successful Response');
      expect(response.body.result.length).toEqual(2);
    });
  });
  describe('DELETE Polygon By ID | DELETE /core/admin/polygon/{id}', () => {
    test('Not Provide Token | Need To throw error', async () => {
      mockgetAdminDetails();
      const response = await request(server).delete(
        `/core/admin/polygon/${polygon_id}`
      );
      expect(response.body.status).toBe(false);
      expect(response.body.statusCode).toBe(401);
      expect(response.body.errors).toStrictEqual([
        {message: 'Authorization Error', code: 0},
      ]);
    });
    test('Invalid Polygon ID | Need To throw error', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .delete(`/core/admin/polygon/${invalid_polygon_id}`)
        .set('Authorization', `Bearer ${admin_token}`);
      expect(response.body.status).toBe(false);
      expect(response.body.statusCode).toBe(404);
      expect(response.body.errors).toStrictEqual([
        {message: 'polygon not found', code: 0},
      ]);
    });
    test('valid Polygon ID', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .delete(`/core/admin/polygon/${polygon_id}`)
        .set('Authorization', `Bearer ${admin_token}`);
      expect(response.body.status).toBe(true);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.message).toBe('Successful Response');
      expect(response.body.result.id).toBe(polygon_id);
      const database = await readPolygonById(polygon_id);
      expect(database).toBeUndefined();
    });
  });
});
