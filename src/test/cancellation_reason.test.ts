import request from 'supertest';
import {createTestServer} from './utils/init';
import {Application} from 'express';
import {
  signToken,
  loadMockSeedData,
  testCasesClosingTasks,
} from './utils/utils';
import {mockgetAdminDetails} from './utils/mock_services';
import logger from '../utilities/logger/winston_logger';
import {DB} from '../data/knex';
jest.mock('axios');

let server: Application;
let admin_token: string;
let customer_token: string;
let vendor_token: string;
let cancellation_reason_id: string;

beforeAll(async () => {
  server = await createTestServer();

  await loadMockSeedData('city');
  logger.info('Jest DataBase Connection Created');
  admin_token = signToken({
    id: '64bfafb6-c273-4b64-a0fc-ca981f5819eb',
    user_type: 'admin',
  });
  customer_token = signToken({
    id: '0df0572f-84fa-4068-8a82-10f41c9dd39a',
    user_type: 'customer',
  });
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

describe('Cancellation Reason Test Cases', () => {
  describe('Assiging Invalid Token To', () => {
    test('POST /food/admin/order/cancellation_reason | forbidden 403 status ', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .post('/food/admin/order/cancellation_reason')
        .set('Authorization', `Bearer ${customer_token}`);
      expect(response.body.status).toBe(false);
      expect(response.statusCode).toBe(403);
      expect(response.body.errors).toStrictEqual([
        {message: 'forbidden', code: 0},
      ]);
    });
    test('GET /food/admin/order/cancellation_reason | forbidden 403 status ', async () => {
      const response = await request(server)
        .get('/food/admin/order/cancellation_reason')
        .set('Authorization', `Bearer ${customer_token}`);
      expect(response.body.status).toBe(false);
      expect(response.statusCode).toBe(403);
      expect(response.body.errors).toStrictEqual([
        {message: 'forbidden', code: 0},
      ]);
    });
    test('GET /food/admin/order/cancellation_reason | forbidden 403 status ', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .get('/food/admin/order/cancellation_reason')
        .set('Authorization', `Bearer ${customer_token}`);
      expect(response.body.status).toBe(false);
      expect(response.statusCode).toBe(403);
      expect(response.body.errors).toStrictEqual([
        {message: 'forbidden', code: 0},
      ]);
    });
    test('PUT /food/admin/order/cancellation_reason | forbidden 403 status ', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .put('/food/admin/order/cancellation_reason')
        .set('Authorization', `Bearer ${customer_token}`);
      expect(response.body.status).toBe(false);
      expect(response.statusCode).toBe(403);
      expect(response.body.errors).toStrictEqual([
        {message: 'forbidden', code: 0},
      ]);
    });
    test('DELETE /food/admin/order/cancellation_reason | forbidden 403 status ', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .delete('/food/admin/order/cancellation_reason')
        .set('Authorization', `Bearer ${customer_token}`);
      expect(response.body.status).toBe(false);
      expect(response.statusCode).toBe(403);
      expect(response.body.errors).toStrictEqual([
        {message: 'forbidden', code: 0},
      ]);
    });
  });

  describe('POST food/admin/order/cancellation_reason', () => {
    test('With Empty user_type', async () => {
      await mockgetAdminDetails();
      const response = await request(server)
        .post('/food/admin/order/cancellation_reason')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({user_type: ' ', cancellation_reason: 'Restaurant Not Found'});
      expect(response.body.status).toBe(false);
      expect(response.body.statusCode).toBe(400);
      expect(response.body.errors).toStrictEqual([
        {
          message: '"user_type" must be one of [admin, vendor, customer]',
          code: 1000,
        },
      ]);
    });
    test('With Empty cancellation_reason', async () => {
      await mockgetAdminDetails();
      const response = await request(server)
        .post('/food/admin/order/cancellation_reason')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          user_type: 'admin',
          cancellation_reason: '',
        });
      expect(response.body.status).toBe(false);
      expect(response.body.statusCode).toBe(400);
      expect(response.body.errors).toStrictEqual([
        {
          message: '"cancellation_reason" is not allowed to be empty',
          code: 1000,
        },
      ]);
    });
    test('Adding user_type other than customer | vendor | admin', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .post('/food/admin/order/cancellation_reason')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          user_type: 'partner',
          cancellation_reason: 'Fixing Issue',
        });
      expect(response.body.status).toBe(false);
      expect(response.body.statusCode).toBe(400);
      expect(response.body.errors).toStrictEqual([
        {
          message: '"user_type" must be one of [admin, vendor, customer]',
          code: 1000,
        },
      ]);
    });
    test('Creating cancellation_reason for vendor', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .post('/food/admin/order/cancellation_reason')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          user_type: 'vendor',
          cancellation_reason: 'Ingridents not available',
        });
      expect(response.body.status).toBe(true);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.result.id).not.toBe(null);
      expect(response.body.result.user_type).toBe('vendor');
      expect(response.body.result.cancellation_reason).toBe(
        'Ingridents not available'
      );
      const read_cancellation_reason = await DB.read(
        'cancellation_reason'
      ).where({user_type: 'vendor'});
      expect(read_cancellation_reason[0].id).not.toBe(null);
      expect(read_cancellation_reason[0].user_type).toBe('vendor');
      expect(read_cancellation_reason[0].cancellation_reason).toBe(
        'Ingridents not available'
      );
    });
    test('Creating cancellation_reason for customer', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .post('/food/admin/order/cancellation_reason')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          user_type: 'customer',
          cancellation_reason: 'Changed My Mind',
        });
      expect(response.body.status).toBe(true);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.result.id).not.toBe(null);
      expect(response.body.result.user_type).toBe('customer');
      expect(response.body.result.cancellation_reason).toBe('Changed My Mind');
      const read_cancellation_reason = await DB.read(
        'cancellation_reason'
      ).where({user_type: 'customer'});
      expect(read_cancellation_reason[0].id).not.toBe(null);
      expect(read_cancellation_reason[0].user_type).toBe('customer');
      expect(read_cancellation_reason[0].cancellation_reason).toBe(
        'Changed My Mind'
      );
    });
    test('Creating cancellation_reason for admin', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .post('/food/admin/order/cancellation_reason')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          user_type: 'admin',
          cancellation_reason: 'Restaurnat Is Not Accepting Order',
        });
      expect(response.body.status).toBe(true);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.result.id).not.toBe(null);
      expect(response.body.result.user_type).toBe('admin');
      expect(response.body.result.cancellation_reason).toBe(
        'Restaurnat Is Not Accepting Order'
      );
      const read_cancellation_reason = await DB.read(
        'cancellation_reason'
      ).where({user_type: 'admin'});
      expect(read_cancellation_reason[0].id).not.toBe(null);
      expect(read_cancellation_reason[0].user_type).toBe('admin');
      expect(read_cancellation_reason[0].cancellation_reason).toBe(
        'Restaurnat Is Not Accepting Order'
      );
      cancellation_reason_id = response.body.result.id;
    });
    test('Creating cancellation_reason With Special Character for vendor', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .post('/food/admin/order/cancellation_reason')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          user_type: 'vendor',
          cancellation_reason: "test's reason for vendor",
        });
      expect(response.body.status).toBe(true);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.result.id).not.toBe(null);
      expect(response.body.result.user_type).toBe('vendor');
      expect(response.body.result.cancellation_reason).toBe(
        "test's reason for vendor"
      );
    });
    test('Creating cancellation_reason With Special Character for customer', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .post('/food/admin/order/cancellation_reason')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          user_type: 'customer',
          cancellation_reason: "test's reason for customer",
        });
      expect(response.body.status).toBe(true);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.result.id).not.toBe(null);
      expect(response.body.result.user_type).toBe('customer');
      expect(response.body.result.cancellation_reason).toBe(
        "test's reason for customer"
      );
    });
    test('Creating cancellation_reason With Special Character for admin', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .post('/food/admin/order/cancellation_reason')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          user_type: 'admin',
          cancellation_reason: "test's reason for customer",
        });
      expect(response.body.status).toBe(true);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.result.id).not.toBe(null);
      expect(response.body.result.user_type).toBe('admin');
      expect(response.body.result.cancellation_reason).toBe(
        "test's reason for customer"
      );
    });
  });

  describe('GET food/admin/order/cancellation_reason', () => {
    test('With Valid Toekn', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .get('/food/admin/order/cancellation_reason')
        .set('Authorization', `Bearer ${admin_token}`);
      expect(response.body.status).toBe(true);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.result).not.toHaveProperty('cancellation_policy');
      expect(response.body.result).toHaveProperty('reasons');
      expect(response.body.result.reasons[0].id).not.toBe(null);
      expect(response.body.result.reasons[0].user_type).toBe('admin');
      expect(response.body.result.reasons[0].cancellation_reason).toBe(
        'Restaurnat Is Not Accepting Order'
      );
    });
  });

  describe('GET All Cancellation Resason From Admin', () => {
    test('With Valid Token', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .get('/food/admin/order/cancellation_reason/all')
        .set('Authorization', `Bearer ${admin_token}`);
      expect(response.body.status).toBe(true);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.result).not.toHaveProperty('cancellation_policy');
      expect(response.body.result).toHaveProperty('reasons');
      expect(response.body.result.reasons[0].id).not.toBe(null);
      expect(response.body.result.reasons[0].user_type).toBe('vendor');
      expect(response.body.result.reasons[0].cancellation_reason).toBe(
        'Ingridents not available'
      );
      expect(response.body.result.reasons[1].id).not.toBe(null);
      expect(response.body.result.reasons[1].user_type).toBe('customer');
      expect(response.body.result.reasons[1].cancellation_reason).toBe(
        'Changed My Mind'
      );
      expect(response.body.result.reasons[2].id).not.toBe(null);
      expect(response.body.result.reasons[2].user_type).toBe('admin');
      expect(response.body.result.reasons[2].cancellation_reason).toBe(
        'Restaurnat Is Not Accepting Order'
      );
    });
  });

  describe('GET Cancellation Reason For Customer', () => {
    test('food/order/cancellation_reason', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .get('/food/order/cancellation_reason')
        .set('Authorization', `Bearer ${customer_token}`);
      expect(response.body.status).toBe(true);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.result).toHaveProperty('cancellation_policy');
      expect(response.body.result).toHaveProperty('reasons');
      expect(response.body.result.reasons[0].id).not.toBe(null);
      expect(response.body.result.reasons[0].user_type).toBe('customer');
      expect(response.body.result.reasons[0].cancellation_reason).toBe(
        'Changed My Mind'
      );
    });
  });

  describe('GET Cancellation Reason For Vendor', () => {
    test('With Valid Token', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .get('/food/vendor/order/cancellation_reason')
        .set('Authorization', `Bearer ${vendor_token}`);
      expect(response.body.status).toBe(true);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.result).toHaveProperty('cancellation_policy');
      expect(response.body.result).toHaveProperty('reasons');
      expect(response.body.result.reasons[0].id).not.toBe(null);
      expect(response.body.result.reasons[0].user_type).toBe('vendor');
      expect(response.body.result.reasons[0].cancellation_reason).toBe(
        'Ingridents not available'
      );
    });
  });

  describe('PUT food/admin/order/cancellation_reason', () => {
    test('Updating cancellation_reason with admin', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .put(`/food/admin/order/cancellation_reason/${cancellation_reason_id}`)
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          user_type: 'admin',
          cancellation_reason: 'Restaurnat Is Busy',
        });
      expect(response.body.status).toBe(true);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.result.id).toBe(cancellation_reason_id);
      const read_cancellation_reason = await DB.read(
        'cancellation_reason'
      ).where({id: cancellation_reason_id});
      expect(read_cancellation_reason[0].id).toBe(cancellation_reason_id);
      expect(read_cancellation_reason[0].user_type).toBe('admin');
      expect(read_cancellation_reason[0].cancellation_reason).toBe(
        'Restaurnat Is Busy'
      );
    });
  });

  describe('DELETE food/admin/order/cancellation_reason', () => {
    test('Deleting cancellation_reason with admin', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .delete(
          `/food/admin/order/cancellation_reason/${cancellation_reason_id}`
        )
        .set('Authorization', `Bearer ${admin_token}`);
      expect(response.body.status).toBe(true);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.result.id).toBe(cancellation_reason_id);
      const read_cancellation_reason = await DB.read(
        'cancellation_reason'
      ).where({id: cancellation_reason_id});
      expect(read_cancellation_reason[0].id).toBe(cancellation_reason_id);
      expect(read_cancellation_reason[0].user_type).toBe('admin');
      expect(read_cancellation_reason[0].cancellation_reason).toBe(
        'Restaurnat Is Busy'
      );
      expect(read_cancellation_reason[0].is_deleted).toBe(true);
    });
  });
});
