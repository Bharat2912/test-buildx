import request from 'supertest';
import {createTestServer} from './utils/init';
import {Application} from 'express';
import {signToken, testCasesClosingTasks} from './utils/utils';
import logger from '../utilities/logger/winston_logger';
import {mockgetAdminDetails} from './utils/mock_services';
import {readBannerById} from '../module/core/banner/models';
import * as s3_manager from '../utilities/s3_manager';

jest.mock('axios');
jest.mock('../utilities/s3_manager', () => {
  return {
    saveS3File: jest.fn().mockImplementation(() => {
      return {
        name: '088066b3-c5c3-4e49-9d75-068346b5d094.jpg',
        bucket: 'restaurant/image/',
        path: 'restaurant/image/',
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

let server: Application;
let admin_token: string;
let banner_id: string;

const banner_details = {
  title: 'Delicious Pizza',
  image_name: '25887d2c-4dc4-42a1-9e3d-62a6f0c33cae.jpg',
  status: 'created',
};
const invalid_banner_id = 'c9cab2be-c5e2-4782-a226-ace44e88d7d4';

beforeAll(async () => {
  server = await createTestServer();

  logger.info('DataBase Connection Created');
  admin_token = signToken({
    id: '64bfafb6-c273-4b64-a0fc-ca981f5819eb',
    user_type: 'admin',
  });
});

afterAll(async () => {
  await testCasesClosingTasks();
});

describe('Banner API Testing :- ', () => {
  describe('create banner | POST core/admin/banner', () => {
    test('Not Provide token | Need to throw error', async () => {
      const response = await request(server).post('/core/admin/banner').send({
        title: banner_details.title,
        image_name: banner_details.image_name,
      });
      expect(response.body.status).toBe(false);
      expect(response.body.statusCode).toBe(401);
      expect(response.body.errors).toStrictEqual([
        {message: 'Authorization Error', code: 0},
      ]);
    });
    test('Not Provide title | Need to throw error', async () => {
      const mock_get_admin_details = mockgetAdminDetails();
      const response = await request(server)
        .post('/core/admin/banner')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          status: banner_details.status,
          image_name: banner_details.image_name,
        });
      expect(response.body.status).toBe(false);
      expect(response.body.statusCode).toBe(400);
      expect(response.body.errors).toStrictEqual([
        {message: '"title" is required', code: 0},
      ]);
      expect(mock_get_admin_details).toHaveBeenCalled();
    });
    test('Not Provide status | Need to throw error', async () => {
      const mock_get_admin_details = mockgetAdminDetails();

      const response = await request(server)
        .post('/core/admin/banner')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          title: banner_details.title,
          image_name: banner_details.image_name,
        });
      expect(response.body.status).toBe(false);
      expect(response.body.statusCode).toBe(400);
      expect(response.body.errors).toStrictEqual([
        {message: '"status" is required', code: 0},
      ]);
      expect(mock_get_admin_details).toHaveBeenCalled();
    });
    test('POST core/admin/banner', async () => {
      const mock_get_admin_details = mockgetAdminDetails();
      const response = await request(server)
        .post('/core/admin/banner')
        .set('Authorization', `Bearer ${admin_token}`)
        .send(banner_details);
      expect(response.body.status).toBe(true);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.message).toBe('Successful Response');
      expect(response.body.result.title).toBe(banner_details.title);
      expect(response.body.result.status).toBe(banner_details.status);
      expect(mock_get_admin_details).toHaveBeenCalled();
      banner_id = response.body.result.id;
    });
  });
  describe('Get banner BY ID | GET core/admin/banner/{id}', () => {
    test('Not Provide token | Need to throw error', async () => {
      const response = await request(server).get(
        `/core/admin/banner/${banner_id}`
      );
      expect(response.body.status).toBe(false);
      expect(response.body.statusCode).toBe(401);
      expect(response.body.errors).toStrictEqual([
        {message: 'Authorization Error', code: 0},
      ]);
    });
    test('Invalid banner ID | Need to throw error', async () => {
      const mock_get_admin_details = mockgetAdminDetails();
      const response = await request(server)
        .get(`/core/admin/banner/${invalid_banner_id}`)
        .set('Authorization', `Bearer ${admin_token}`);
      expect(response.body.status).toBe(false);
      expect(response.body.statusCode).toBe(400);
      expect(response.body.errors).toStrictEqual([
        {message: 'Banner  Not Found', code: 0},
      ]);
      expect(mock_get_admin_details).toHaveBeenCalled();
    });

    test('Get Banner by id', async () => {
      const mock_get_admin_details = mockgetAdminDetails();
      const response = await request(server)
        .get(`/core/admin/banner/${banner_id}`)
        .set('Authorization', `Bearer ${admin_token}`);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.status).toBe(true);
      expect(mock_get_admin_details).toHaveBeenCalled();
    });
  });
  describe('PUT banner | PUT core/admin/banner/{id}', () => {
    test('Not Provide token | Need to throw error', async () => {
      const response = await request(server)
        .put(`/core/admin/banner/${banner_id}`)
        .send({
          title: 'Delicious Burgers',
        });
      expect(response.body.status).toBe(false);
      expect(response.body.statusCode).toBe(401);
      expect(response.body.errors).toStrictEqual([
        {message: 'Authorization Error', code: 0},
      ]);
    });
    test('Invalid banner ID | Need to throw error', async () => {
      const mock_get_admin_details = mockgetAdminDetails();
      const response = await request(server)
        .put(`/core/admin/banner/${invalid_banner_id}`)
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          title: 'Delicious Burgers',
          status: 'active',
        });
      expect(response.body.status).toBe(false);
      expect(response.body.statusCode).toBe(404);
      expect(response.body.errors).toStrictEqual([
        {message: 'Banner not found', code: 0},
      ]);
      expect(mock_get_admin_details).toHaveBeenCalled();
    });
    test('valid banner ID', async () => {
      const mock_get_admin_details = mockgetAdminDetails();
      const response = await request(server)
        .put(`/core/admin/banner/${banner_id}`)
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          title: 'Delicious Burgers',
          status: 'active',
          image_name: '25887d2c-4dc4-42a1-9e3d-62a6f0c33cae.jpg',
        });
      expect(response.body.status).toBe(true);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.message).toBe('Successful Response');
      const database = await readBannerById(banner_id);
      expect(database.title).toBe('Delicious Burgers');
      expect(database.status).toBe('active');
      expect(mock_get_admin_details).toHaveBeenCalled();
    });
  });
});
