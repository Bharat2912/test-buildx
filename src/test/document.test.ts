import request from 'supertest';
import {createTestServer} from './utils/init';
import {Application} from 'express';
import {signToken, testCasesClosingTasks} from './utils/utils';
import logger from '../utilities/logger/winston_logger';
import {
  mocksaveS3File,
  mockgetAdminDetails,
  mockgenerateDownloadFileURL,
} from './utils/mock_services';
import {readDocumentById} from '../module/core/document/models';

jest.mock('axios');

let server: Application;
let partner_token: string;
let admin_token: string;
let document_pdf_id: string;
let document_html_id: string;
const invalid_document_id = 'b5af8efa-88f4-4993-aa34-eb149de8440b';
const document_pdf = {
  title: 'Document title',
  doc_type: 'pdf',
  doc_file: {
    name: '25887d2c-4dc4-42a1-9e3d-62a6f0c33cae.jpg',
  },
  category: 'restaurant_mou',
};
const document_updated_pdf = {
  doc_type: 'pdf',
  doc_file: {
    name: 'b5af8efa-88f4-4993-aa34-eb149de8440b.jpg',
  },
};
const document_html = {
  title: 'Document title',
  doc_type: 'html',
  data: '<html><h1>Hello</h1></html>',
  category: 'restaurant_mou',
};
beforeAll(async () => {
  server = await createTestServer();

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

describe('Document APIs Testing', () => {
  describe('Create Document POST /core/admin/document', () => {
    test('Not Provide Token | Need To Throw error', async () => {
      const response = await request(server)
        .post('/core/admin/document')
        .send({
          title: 'Give text to diplay for document',
          doc_type: 'pdf',
          doc_file: {
            name: '25887d2c-4dc4-42a1-9e3d-62a6f0c33cae.jpg',
          },
          category: 'restaurant_mou',
        });
      expect(response.body.status).toBe(false);
      expect(response.body.statusCode).toBe(401);
      expect(response.body.errors).toStrictEqual([
        {message: 'Authorization Error', code: 0},
      ]);
    });
    test('doc_type : ( image / pdf ) | doc_file not Provided | Need To Throw error', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .post('/core/admin/document')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          title: 'Document title',
          doc_type: 'pdf',
          category: 'restaurant_mou',
        });
      expect(response.body.status).toBe(false);
      expect(response.body.statusCode).toBe(400);
      expect(response.body.errors).toStrictEqual([
        {message: '"doc_file" is required', code: 0},
      ]);
    });
    test('doc_type : html | data not Provided | Need To Throw error', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .post('/core/admin/document')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          title: 'Document title',
          doc_type: 'html',
          category: 'restaurant_mou',
        });
      expect(response.body.status).toBe(false);
      expect(response.body.statusCode).toBe(400);
      expect(response.body.errors).toStrictEqual([
        {message: '"data" is required', code: 0},
      ]);
    });
    test('category not Provided | Need To Throw error', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .post('/core/admin/document')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          title: 'Document title',
          doc_type: 'html',
          data: '<html><h1>Hello</h1></html>',
        });
      expect(response.body.status).toBe(false);
      expect(response.body.statusCode).toBe(400);
      expect(response.body.errors).toStrictEqual([
        {message: '"category" is required', code: 0},
      ]);
    });
    test('create Document | doc : pdf', async () => {
      mockgetAdminDetails();
      mocksaveS3File();
      const response = await request(server)
        .post('/core/admin/document')
        .set('Authorization', `Bearer ${admin_token}`)
        .send(document_pdf);
      expect(response.body.status).toBe(true);
      expect(response.body.statusCode).toBe(201);
      expect(response.body.message).toBe('Successful Response');
      document_pdf_id = response.body.result.id;
      const database = await readDocumentById(document_pdf_id);
      expect(database.title).toBe(document_pdf.title);
      expect(database.doc_type).toBe(document_pdf.doc_type);
    });
    test('create Document | doc : html', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .post('/core/admin/document')
        .set('Authorization', `Bearer ${admin_token}`)
        .send(document_html);
      expect(response.body.status).toBe(true);
      expect(response.body.statusCode).toBe(201);
      expect(response.body.message).toBe('Successful Response');
      document_html_id = response.body.result.id;
      const database = await readDocumentById(document_html_id);
      expect(database.title).toBe(document_html.title);
      expect(database.doc_type).toBe(document_html.doc_type);
    });
    jest.clearAllMocks();
  });
  describe('GET document By ID GET /core/admin/document/{id}', () => {
    test('Not Provide Token | Need to throw error', async () => {
      const response = await request(server).get(
        `/core/admin/document/${document_pdf_id}`
      );
      expect(response.body.status).toBe(false);
      expect(response.body.statusCode).toBe(401);
      expect(response.body.errors).toStrictEqual([
        {message: 'Authorization Error', code: 0},
      ]);
    });
    test('Invalid ID | Need to throw error', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .get(`/core/admin/document/${invalid_document_id}`)
        .set('Authorization', `Bearer ${admin_token}`);
      expect(response.body.status).toBe(false);
      expect(response.body.statusCode).toBe(400);
      expect(response.body.errors).toStrictEqual([
        {message: 'Document  Not Found', code: 0},
      ]);
    });
    test('GET Document By ID', async () => {
      mockgetAdminDetails();
      mockgenerateDownloadFileURL();
      const response = await request(server)
        .get(`/core/admin/document/${document_pdf_id}`)
        .set('Authorization', `Bearer ${admin_token}`);
      expect(response.body.status).toBe(true);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.message).toBe('Successful Response');
      expect(response.body.result.title).toBe(document_pdf.title);
      expect(response.body.result.doc_type).toBe(document_pdf.doc_type);
    });
    jest.clearAllMocks();
  });
  describe('GET All document | GET /core/admin/document', () => {
    test('Not Provide Token | Need To Throw error', async () => {
      const response = await request(server).get('/core/admin/document');
      expect(response.body.status).toBe(false);
      expect(response.body.statusCode).toBe(401);
      expect(response.body.errors).toStrictEqual([
        {message: 'Authorization Error', code: 0},
      ]);
    });
    test('GET All document', async () => {
      mockgetAdminDetails();
      mockgenerateDownloadFileURL();
      const response = await request(server)
        .get('/core/admin/document')
        .set('Authorization', `Bearer ${admin_token}`);
      expect(response.body.status).toBe(true);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.message).toBe('Successful Response');
      expect(response.body.result.length).not.toEqual(0);
    });
    jest.clearAllMocks();
  });
  describe('Update document | PUT /core/admin/document/{id}', () => {
    test('Not Provide Token | Need to throw error', async () => {
      const response = await request(server).put(
        `/core/admin/document/${document_pdf_id}`
      );
      expect(response.body.status).toBe(false);
      expect(response.body.statusCode).toBe(401);
      expect(response.body.errors).toStrictEqual([
        {message: 'Authorization Error', code: 0},
      ]);
    });
    test('Invalid ID | Need to throw error', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .put(`/core/admin/document/${invalid_document_id}`)
        .set('Authorization', `Bearer ${admin_token}`)
        .send(document_updated_pdf);
      expect(response.body.status).toBe(false);
      expect(response.body.statusCode).toBe(404);
      expect(response.body.errors).toStrictEqual([
        {message: 'Document not found', code: 0},
      ]);
    });
    test('Valid ID | Update Document', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .put(`/core/admin/document/${document_pdf_id}`)
        .set('Authorization', `Bearer ${admin_token}`)
        .send(document_updated_pdf);
      expect(response.body.status).toBe(true);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.message).toBe('Successful Response');
      expect(response.body.result.id).toBe(document_pdf_id);
    });
    jest.clearAllMocks();
  });
  describe('GET document By category | Partner', () => {
    test('Not Provide Token | Need to throw error', async () => {
      const response = await request(server).get('/core/partner/document/');
      expect(response.body.status).toBe(false);
      expect(response.body.statusCode).toBe(401);
      expect(response.body.errors).toStrictEqual([
        {message: 'Authorization Error', code: 0},
      ]);
    });
    test('Not Provide category | Need to throw error', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .get('/core/partner/document/')
        .set('Authorization', `Bearer ${partner_token}`);
      expect(response.body.errors).toStrictEqual([
        {message: '"value" is required', code: 0},
      ]);
      expect(response.body.status).toBe(false);
      expect(response.body.statusCode).toBe(400);
    });
    test('GET Updated document| Partner | by category', async () => {
      mockgetAdminDetails();
      mockgenerateDownloadFileURL();
      const response = await request(server)
        .get('/core/partner/document/')
        .set('Authorization', `Bearer ${partner_token}`)
        .query({category: document_pdf.category});
      expect(response.body.status).toBe(true);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.message).toBe('Successful Response');
    });
    jest.clearAllMocks();
  });
  describe('DELETE document | DELETE /core/admin/document/{id}', () => {
    test('Not Provide Token | Need to throw error', async () => {
      const response = await request(server).delete(
        `/core/admin/document/${document_pdf_id}`
      );
      expect(response.body.status).toBe(false);
      expect(response.body.statusCode).toBe(401);
      expect(response.body.errors).toStrictEqual([
        {message: 'Authorization Error', code: 0},
      ]);
    });
    test('Invalid ID | Need to throw error', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .delete(`/core/admin/document/${invalid_document_id}`)
        .set('Authorization', `Bearer ${admin_token}`);
      expect(response.body.status).toBe(false);
      expect(response.body.statusCode).toBe(404);
      expect(response.body.errors).toStrictEqual([
        {message: 'Document  Not Found', code: 0},
      ]);
    });
    test('DELETE document', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .delete(`/core/admin/document/${document_pdf_id}`)
        .set('Authorization', `Bearer ${admin_token}`);
      expect(response.body.status).toBe(true);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.message).toBe('Successful Response');
      expect(response.body.result.id).toBe(document_pdf_id);
      const database = await readDocumentById(document_pdf_id);
      expect(database).toBeUndefined();
    });
    jest.clearAllMocks();
  });
});
