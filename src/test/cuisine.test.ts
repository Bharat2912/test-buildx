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
  get_cuisine_partner_response,
  get_cuisine_customer_response,
} from './utils/mock_responses';
import logger from '../utilities/logger/winston_logger';

jest.mock('axios');
let server: Application;
let admin_token: string;
let partner_token: string;
let customer_token: string;

beforeAll(async () => {
  server = await createTestServer();

  await loadMockSeedData('cuisine');
  logger.info('Jest DataBase Connection Created');
  customer_token = signToken({
    id: '0df0572f-84fa-4068-8a82-10f41c9dd39a',
    user_type: 'customer',
  });
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

const valid_id_response = [
  {
    id: 'acb0b0e4-dbcc-4688-8b1c-d79dfdabaf93',
    name: 'Chinese',
    status: 'active',
    image: {
      url: null,
    },
  },
];

describe('Cusine APIs Testing :- ADMIN', () => {
  //  CUSTOMER
  describe('GET Cuisine APIs Testing :- food/cuisine', () => {
    test('Response with 200 without any token ', async () => {
      const response = await request(server).get('/food/cuisine');
      expect(response.statusCode).toBe(200);
      expect(response.body.result).toEqual(get_cuisine_customer_response);
    });
  });

  //PARTNER
  describe('GET Cuisine APIs Testing :- food/partner/cuisine', () => {
    test('Response with 200 with PARTNER TOKEN Provided', async () => {
      const response = await request(server)
        .get('/food/partner/cuisine')
        .set('Authorization', `Bearer ${partner_token}`);
      expect(response.statusCode).toBe(200);
      expect(response.body.result).toEqual(get_cuisine_partner_response);
    });
    test('Response with 403 with CUSTOMER TOKEN Provided', async () => {
      const response = await request(server)
        .get('/food/partner/cuisine')
        .set('Authorization', `Bearer ${customer_token}`);
      expect(response.statusCode).toBe(403);
      expect(response.body.errors).toStrictEqual([
        {message: 'forbidden', code: 0},
      ]);
    });
  });
  //ADMIN
  describe('ADMIN', () => {
    const cuisine_id_valid = 'acb0b0e4-dbcc-4688-8b1c-d79dfdabaf93';
    const cuisine_id_invalid = 'acb0b0e4-dbcc-4688-8b1c-d79dksdjbbaf93';
    test('Response with 200 on creating Cuisine', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .post('/food/admin/cuisine')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          name: 'New Cuisine',
          status: 'active',
        });
      expect(response.statusCode).toBe(201);
    });
    test('Response with 400 on empty Cuisine name', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .post('/food/admin/cuisine')
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
    test('Response with 400 on empty Cuisine status', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .post('/food/admin/cuisine')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          name: 'Empty Status',
          status: ' ',
        });
      expect(response.statusCode).toBe(400);
      expect(response.body.errors).toStrictEqual([
        {message: '"status" is not allowed to be empty', code: 0},
      ]);
    });
    test('Response with 400 on not Valid Cuisine status name', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .post('/food/admin/cuisine')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          name: 'New Cuisine',
          status: 'Invalid Status',
        });
      expect(response.statusCode).toBe(400);
      expect(response.body.errors).toStrictEqual([
        {
          message: 'Cuisine cannot be created not in active/in_active state',
          code: 0,
        },
      ]);
    });
    test('Response with 200 on valid Token :-  GET ALL food/admin/cuisine :- ', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .get('/food/admin/cuisine')
        .set('Authorization', `Bearer ${admin_token}`);
      expect(response.statusCode).toBe(200);
    });
    test('Response with 200 on valid Token & Valid ID :- GET food/admin/cuisine/{id}', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .get(`/food/admin/cuisine/${cuisine_id_valid}`)
        .set('Authorization', `Bearer ${admin_token}`);
      expect(response.statusCode).toBe(200);
      expect(response.body.result).toStrictEqual(valid_id_response);
    });
    test('Response with 400 on valid Token & InValid ID :- GET food/admin/cuisine/{id}', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .get(`/food/admin/cuisine/${cuisine_id_invalid}`)
        .set('Authorization', `Bearer ${admin_token}`);
      expect(response.statusCode).toBe(400);
      expect(response.body.errors).toStrictEqual([
        {message: '"value" must be a valid GUID', code: 0},
      ]);
    });
    test('Response with 200 on valid ID & Valid Token :- PUT food/admin/cuisine/{id}', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .put(`/food/admin/cuisine/${cuisine_id_valid}`)
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          name: 'Cusine-Item-Updated',
          status: 'active',
        });
      expect(response.statusCode).toBe(200);
    });
    test('Response with 400 on valid Token & InValid ID :- PUT food/admin/cuisine/{id}', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .put(`/food/admin/cuisine/${cuisine_id_invalid}`)
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          name: 'Cusine-Item-Updated',
          status: 'active',
        });
      expect(response.statusCode).toBe(400);
      expect(response.body.errors).toStrictEqual([
        {message: '"value" must be a valid GUID', code: 0},
      ]);
    });
    test('Response with 400 on valid Token & Valid ID & Empty Name :- PUT food/admin/cuisine/{id}', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .put(`/food/admin/cuisine/${cuisine_id_valid}`)
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
    test('Response with 400 on valid Token & Valid ID & Empty Status :- PUT food/admin/cuisine/{id}', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .put(`/food/admin/cuisine/${cuisine_id_valid}`)
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          name: 'Cusine-Item-Updated',
          status: ' ',
        });
      expect(response.statusCode).toBe(400);
      expect(response.body.errors).toStrictEqual([
        {
          message: 'Cuisine cannot be created not in active/in_active state',
          code: 0,
        },
      ]);
    });
    test('Response with 400 on valid Token & Valid ID & Invalid Status :- PUT food/admin/cuisine/{id} ', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .put(`/food/admin/cuisine/${cuisine_id_valid}`)
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          name: 'Cusine-Item-Updated',
          status: 'skdjvb',
        });
      expect(response.statusCode).toBe(400);
      expect(response.body.errors).toStrictEqual([
        {
          message: 'Cuisine cannot be created not in active/in_active state',
          code: 0,
        },
      ]);
    });
    test('Response with 200 on Valid Token & Invalid ID :- DELETE food/admin/cuisine/{id}', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .delete(`/food/admin/cuisine/${cuisine_id_invalid}`)
        .set('Authorization', `Bearer ${admin_token}`);
      expect(response.statusCode).toBe(400);
      expect(response.body.errors).toStrictEqual([
        {message: '"value" must be a valid GUID', code: 0},
      ]);
    });
    test('Response with 200 on valid ID & Valid Token :- DELETE food/admin/cuisine/{id}', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .delete(`/food/admin/cuisine/${cuisine_id_valid}`)
        .set('Authorization', `Bearer ${admin_token}`);
      expect(response.statusCode).toBe(200);
    });
  });
});
