import request from 'supertest';
import {createTestServer} from '../utils/init';
import {Application} from 'express';
import {
  signToken,
  loadMockSeedData,
  testCasesClosingTasks,
} from '../utils/utils';
import {mockgetAdminDetails} from '../utils/mock_services';
import * as s3_manager from '../../utilities/s3_manager';

jest.mock('axios');

let server: Application;
let admin_token: string;

beforeAll(async () => {
  server = await createTestServer();
  await loadMockSeedData('global_var');
  admin_token = signToken({
    id: '64bfafb6-c273-4b64-a0fc-ca981f5819eb',
    user_type: 'admin',
  });
});

afterAll(async () => {
  await testCasesClosingTasks();
});

jest.mock('axios');
jest.mock('../../utilities/s3_manager', () => {
  return {
    saveS3File: jest.fn().mockImplementation(() => {
      return {
        name: '088066b3-c5c3-4e49-9d75-068346b5d094.jpg',
        bucket: 'global_var_files/',
        path: 'global_var_files/',
      };
    }),
    generateDownloadURLs: jest.fn().mockImplementation(() => {
      // the child function is called within the parent function
      s3_manager.generateDownloadURL({
        image_bucket: '',
        image_url: '',
        image_path: '',
      });
      return [
        {
          image_bucket: '',
          image_url: '',
          image_path: '',
        },
      ];
    }),
    generateDownloadURL: jest.fn().mockImplementation(() => {
      return {image_url: ''};
    }),
  };
});

let key = '';
describe('Test Cases For PUT', () => {
  describe('GET by key', () => {
    test('Get For Number Type Key', async () => {
      mockgetAdminDetails();
      key = 'SUPPORT_CONTACT';
      const response = await request(server)
        .get(`/food/admin/globalVar/${key}`)
        .set('Authorization', `Bearer ${admin_token}`);
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.result.key).toBe(key);
      expect(response.body.result.value).toStrictEqual('0000000000');
    });
    test('Get For String Type Key', async () => {
      mockgetAdminDetails();
      key = 'PAYMENT_GATEWAY';
      const response = await request(server)
        .get(`/food/admin/globalVar/${key}`)
        .set('Authorization', `Bearer ${admin_token}`);
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.result.key).toBe(key);
      expect(response.body.result.value).toStrictEqual('CASHFREE');
    });
    test('Get For Json Type Key | JSON', async () => {
      mockgetAdminDetails();
      key = 'JSON-TYPE';
      const response = await request(server)
        .get(`/food/admin/globalVar/${key}`)
        .set('Authorization', `Bearer ${admin_token}`);
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.result.key).toBe(key);
      expect(response.body.result.value).toStrictEqual({
        age: 30,
        isMarried: false,
        name: 'John Doe',
      });
    });
    test('Get For Json Type Key | Array', async () => {
      mockgetAdminDetails();
      key = 'ARRAY-TYPE';
      const response = await request(server)
        .get(`/food/admin/globalVar/${key}`)
        .set('Authorization', `Bearer ${admin_token}`);
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.result.key).toBe(key);
      expect(response.body.result.value).toEqual([
        {name: 'Alice', age: 25},
        {name: 'Bob', age: 30},
        {name: 'Charlie', age: 20},
      ]);
    });
    test('Get For File Type Key', async () => {
      mockgetAdminDetails();
      key = 'FILE-TYPE';
      const response = await request(server)
        .get(`/food/admin/globalVar/${key}`)
        .set('Authorization', `Bearer ${admin_token}`);
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.result.key).toBe(key);
    });
  });
  describe('Checking type of input value of', () => {
    test('Adding type key in request body | Need to throw error', async () => {
      mockgetAdminDetails();
      key = 'NUMBER-TYPE';
      const response = await request(server)
        .put(`/food/admin/globalVar/${key}`)
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          value: 1,
          type: 'number',
        });
      expect(response.body.status).toBe(false);
      expect(response.statusCode).toBe(400);
      expect(response.body.errors).toStrictEqual([
        {message: '"type" is not allowed', code: 0},
      ]);
    });
    test('adding access_roles type key in request body with empty value| Need to throw error', async () => {
      mockgetAdminDetails();
      key = 'NUMBER-TYPE';
      const response = await request(server)
        .put(`/food/admin/globalVar/${key}`)
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          value: 1,
          type: 'number',
          access_roles: [''],
        });
      expect(response.body.status).toBe(false);
      expect(response.statusCode).toBe(400);
      expect(response.body.errors).toStrictEqual([
        {
          message: '"access_roles[0]" must be one of [customer, vendor]',
          code: 0,
        },
      ]);
    });
    test('file type with extension', async () => {
      mockgetAdminDetails();
      key = 'FILE-TYPE';
      const response = await request(server)
        .put(`/food/admin/globalVar/${key}`)
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          value: 'testfile.jpg',
        });
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.result.key).toBe(key);
    });
    test('String type', async () => {
      key = 'STRING-TYPE';
      mockgetAdminDetails();
      const response = await request(server)
        .put(`/food/admin/globalVar/${key}`)
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          value: 'test string',
        });
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.result.key).toBe(key);
      expect(response.body.result.value).toBe('test string');
    });
    test('Array type', async () => {
      mockgetAdminDetails();
      key = 'ARRAY-TYPE';
      const response = await request(server)
        .put(`/food/admin/globalVar/${key}`)
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          value: [1, 2, 3],
        });
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.result.key).toBe(key);
      expect(response.body.result.value).toStrictEqual([1, 2, 3]);
    });
    test('JSON type', async () => {
      mockgetAdminDetails();
      key = 'JSON-TYPE';
      const response = await request(server)
        .put(`/food/admin/globalVar/${key}`)
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          value: {
            key: 'value',
          },
        });
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.result.key).toBe(key);
      expect(response.body.result.value).toStrictEqual({key: 'value'});
    });
    test('Number type', async () => {
      mockgetAdminDetails();
      key = 'NUMBER-TYPE';
      const response = await request(server)
        .put(`/food/admin/globalVar/${key}`)
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          value: 1,
        });
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.result.key).toBe(key);
    });
  });
  describe('New Scenerio', () => {
    test('Updating Number as string where type is string | need to allow', async () => {
      mockgetAdminDetails();
      key = 'SUPPORT_CONTACT';
      const response = await request(server)
        .put(`/food/admin/globalVar/${key}`)
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          value: '1234556789',
        });
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.result.key).toBe(key);
    });
    test('Updating Number as number where type is number | need to allow', async () => {
      mockgetAdminDetails();
      key = 'CASHFREE_PAYOUT_MIN_BALANCE';
      const response = await request(server)
        .put(`/food/admin/globalVar/${key}`)
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          value: 1500,
        });
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.result.key).toBe(key);
    });
    test('Updating Email as string where type is string | need to allow', async () => {
      mockgetAdminDetails();
      key = 'SUPER_ADMIN_EMAIL';
      const response = await request(server)
        .put(`/food/admin/globalVar/${key}`)
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          value: 'speedyy@gmail.com',
        });
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.result.key).toBe(key);
    });
  });
});
