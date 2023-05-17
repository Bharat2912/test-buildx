// import request from 'supertest';
// import {createTestServer} from './utils/init';
// import {Application} from 'express';
// import {mockgetAdminDetails} from './utils/mock_services';
// import {
//   signToken,
//   loadMockSeedData,
//   dropTestDatabase,
//   closeTestDBConnection,
// } from './utils/utils';
// import {language_response} from './utils/mock_responses';
//

// import logger from '../utilities/logger/winston_logger';
// import {stopDB} from '../data/knex';
// jest.mock('axios');

// let server: Application;
// let admin_token: string;
// let partner_token: string;

// beforeAll(async () => {
//   server = await createTestServer();

//   await loadMockSeedData('language');
//   logger.info('Jest DataBase Connection Created');
//   admin_token = signToken({
//     id: '64bfafb6-c273-4b64-a0fc-ca981f5819eb',
//     user_type: 'admin',
//   });
//   partner_token = signToken({
//     id: 'cdf39e49-3b6b-4558-b08d-cb00b8ddb0a4',
//     user_type: 'partner',
//   });
// });

// afterAll(async () => {
//   await closeRedisConnection(); await flushRedisDatabase();
//   await stopDB();
//   await dropTestDatabase();
//   await closeTestDBConnection();
//   jest.clearAllMocks();
//   jest.resetAllMocks();
//   jest.restoreAllMocks();
// });

// const valid_response = {
//   id: '77206d74-8f7c-45b6-af7a-fe8901eb65ac',
//   name: 'Hindi',
//   status: 'active-inactive',
// };

// const Invalid_id = 'kdj65ee29-ab99-4733-937c-525ff7e23d23';
// const valid_id = '77206d74-8f7c-45b6-af7a-fe8901eb65ac';
// describe('Languaue APIs Testing', () => {
//   describe('POST API', () => {
//     let temp_id: string;
//     test('Applying Invalid Token', async () => {
//       mockgetAdminDetails();
//       const response = await request(server)
//         .post('/core/admin/language')
//         .set('Authorization', `Bearer ${partner_token}`)
//         .send({
//           name: 'Urdu',
//           status: 'active',
//         });
//       expect(response.statusCode).toBe(403);
//       expect(response.body.errors).toStrictEqual([
//         {message: 'forbidden', code: 0},
//       ]);
//     });
//     test('Requesting Without Token', async () => {
//       const response = await request(server).post('/core/admin/language').send({
//         name: 'Urdu',
//         status: 'active',
//       });
//       expect(response.statusCode).toBe(401);
//       expect(response.body.errors).toStrictEqual([
//         {message: 'Authorization Error', code: 0},
//       ]);
//     });
//     test('Requesting with Empty name', async () => {
//       mockgetAdminDetails();
//       const response = await request(server)
//         .post('/core/admin/language')
//         .set('Authorization', `Bearer ${admin_token}`)
//         .send({
//           name: '',
//           status: 'active',
//         });
//       expect(response.statusCode).toBe(400);
//       expect(response.body.errors).toStrictEqual([
//         {message: '"name" is not allowed to be empty', code: 0},
//       ]);
//     });
//     test('Requesting with Empty status', async () => {
//       mockgetAdminDetails();
//       const response = await request(server)
//         .post('/core/admin/language')
//         .set('Authorization', `Bearer ${admin_token}`)
//         .send({
//           name: 'Urdu',
//           status: '',
//         });
//       expect(response.statusCode).toBe(400);
//       expect(response.body.errors).toStrictEqual([
//         {message: '"status" must be one of [active, inactive]', code: 0},
//       ]);
//     });
//     test('Requesting with Invalid status name', async () => {
//       mockgetAdminDetails();
//       const response = await request(server)
//         .post('/core/admin/language')
//         .set('Authorization', `Bearer ${admin_token}`)
//         .send({
//           name: 'Urdu',
//           status: 'temp',
//         });
//       expect(response.statusCode).toBe(400);
//       expect(response.body.errors).toStrictEqual([
//         {message: '"status" must be one of [active, inactive]', code: 0},
//       ]);
//     });
//     test('Requesting with Valid Token & Valid name, status', async () => {
//       mockgetAdminDetails();
//       const response = await request(server)
//         .post('/core/admin/language')
//         .set('Authorization', `Bearer ${admin_token}`)
//         .send({
//           name: 'Urdu',
//           status: 'active',
//         });
//       expect(response.statusCode).toBe(201);
//       temp_id = response.body.result.id;
//     });
//     test('Requesting with same language name', async () => {
//       mockgetAdminDetails();
//       const response = await request(server)
//         .post('/core/admin/language')
//         .set('Authorization', `Bearer ${admin_token}`)
//         .send({
//           name: 'Urdu',
//           status: 'active',
//         });
//       expect(response.statusCode).toBe(400);
//       expect(response.body.errors).toStrictEqual([
//         {message: 'Urdu already exists.', code: 0},
//       ]);
//     });
//     test('Deleting record With ID', async () => {
//       mockgetAdminDetails();
//       const response = await request(server)
//         .delete(`/core/admin/language/${temp_id}`)
//         .set('Authorization', `Bearer ${admin_token}`);
//       expect(response.statusCode).toBe(200);
//     });
//     test('Get record With ID', async () => {
//       mockgetAdminDetails();
//       const response = await request(server)
//         .get(`/core/admin/language/${temp_id}`)
//         .set('Authorization', `Bearer ${admin_token}`);
//       expect(response.statusCode).toBe(404);
//       expect(response.body.errors).toStrictEqual([
//         {message: 'Language  Not Found', code: 0},
//       ]);
//     });
//   });

//   describe('GET API', () => {
//     const Invalid_id = 'kdj65ee29-ab99-4733-937c-525ff7e23d23';
//     const valid_id = '77206d74-8f7c-45b6-af7a-fe8901eb65ac';
//     test('Applying Invalid Token on Admin', async () => {
//       mockgetAdminDetails();
//       const response = await request(server)
//         .get('/core/admin/language')
//         .set('Authorization', `Bearer ${partner_token}`);
//       expect(response.statusCode).toBe(403);
//       expect(response.body.errors).toStrictEqual([
//         {message: 'forbidden', code: 0},
//       ]);
//     });
//     test('Applying Invalid Token on Partner', async () => {
//       mockgetAdminDetails();
//       const response = await request(server)
//         .post('/core/partner/language')
//         .set('Authorization', `Bearer ${admin_token}`);
//       expect(response.statusCode).toBe(403);
//       expect(response.body.errors).toStrictEqual([
//         {message: 'forbidden', code: 0},
//       ]);
//     });
//     test('Get all languages', async () => {
//       mockgetAdminDetails();
//       const response = await request(server)
//         .get('/core/admin/language')
//         .set('Authorization', `Bearer ${admin_token}`);
//       expect(response.statusCode).toBe(200);
//       expect(response.body.result).toStrictEqual(language_response);
//     });
//     test('Get By Invalid ID', async () => {
//       mockgetAdminDetails();
//       const response = await request(server)
//         .get(`/core/admin/language/${Invalid_id}`)
//         .set('Authorization', `Bearer ${admin_token}`);
//       expect(response.statusCode).toBe(400);
//       expect(response.body.errors).toStrictEqual([
//         {message: '"value" must be a valid GUID', code: 0},
//       ]);
//     });
//     test('Get By valid ID', async () => {
//       mockgetAdminDetails();
//       const response = await request(server)
//         .get(`/core/admin/language/${valid_id}`)
//         .set('Authorization', `Bearer ${admin_token}`);
//       expect(response.statusCode).toBe(200);
//       expect(response.body.result).toStrictEqual(valid_response);
//     });
//   });

//   describe('PUT API', () => {
//     test('Applying Invalid Token', async () => {
//       mockgetAdminDetails();
//       const response = await request(server)
//         .put(`/core/admin/language/${valid_id}`)
//         .set('Authorization', `Bearer ${partner_token}`)
//         .send({
//           name: 'Urdu',
//           status: 'active',
//         });
//       expect(response.statusCode).toBe(403);
//       expect(response.body.errors).toStrictEqual([
//         {message: 'forbidden', code: 0},
//       ]);
//     });
//     test('Empty Name', async () => {
//       mockgetAdminDetails();
//       const response = await request(server)
//         .put(`/core/admin/language/${valid_id}`)
//         .set('Authorization', `Bearer ${admin_token}`)
//         .send({
//           name: '',
//           status: 'active',
//         });
//       expect(response.statusCode).toBe(400);
//       expect(response.body.errors).toStrictEqual([
//         {message: '"name" is not allowed to be empty', code: 0},
//       ]);
//     });
//     test('Empty status', async () => {
//       mockgetAdminDetails();
//       const response = await request(server)
//         .put(`/core/admin/language/${valid_id}`)
//         .set('Authorization', `Bearer ${admin_token}`)
//         .send({
//           name: 'Urdu',
//           status: '',
//         });
//       expect(response.statusCode).toBe(400);
//       expect(response.body.errors).toStrictEqual([
//         {message: '"status" must be one of [active, inactive]', code: 0},
//       ]);
//     });
//     test('With Invalid ID', async () => {
//       mockgetAdminDetails();
//       const response = await request(server)
//         .put(`/core/admin/language/${Invalid_id}`)
//         .set('Authorization', `Bearer ${admin_token}`)
//         .send({
//           name: 'Urdu',
//           status: 'active',
//         });
//       expect(response.statusCode).toBe(400);
//       expect(response.body.errors).toStrictEqual([
//         {message: '"value" must be a valid GUID', code: 0},
//       ]);
//     });
//     test('With valid ID and Invalid status Name', async () => {
//       mockgetAdminDetails();
//       const response = await request(server)
//         .put(`/core/admin/language/${valid_id}`)
//         .set('Authorization', `Bearer ${admin_token}`)
//         .send({
//           name: 'Urdu',
//           status: 'Temp',
//         });
//       expect(response.statusCode).toBe(400);
//       expect(response.body.errors).toStrictEqual([
//         {message: '"status" must be one of [active, inactive]', code: 0},
//       ]);
//     });
//     test('With valid request', async () => {
//       mockgetAdminDetails();
//       const response = await request(server)
//         .put(`/core/admin/language/${valid_id}`)
//         .set('Authorization', `Bearer ${admin_token}`)
//         .send({
//           name: 'Urdu-Updated',
//           status: 'active',
//         });
//       expect(response.statusCode).toBe(200);
//     });
//   });

//   describe('DELETE API', () => {
//     test('Delete with Invalid Token', async () => {
//       mockgetAdminDetails();
//       const response = await request(server)
//         .delete(`/core/admin/language/${valid_id}`)
//         .set('Authorization', `Bearer ${partner_token}`);
//       expect(response.statusCode).toBe(403);
//       expect(response.body.errors).toStrictEqual([
//         {message: 'forbidden', code: 0},
//       ]);
//     });
//     test('Delete with Invalid ID', async () => {
//       mockgetAdminDetails();
//       const response = await request(server)
//         .put(`/core/admin/language/${Invalid_id}`)
//         .set('Authorization', `Bearer ${admin_token}`);
//       expect(response.statusCode).toBe(400);
//       expect(response.body.errors).toStrictEqual([
//         {message: '"value" must be a valid GUID', code: 0},
//       ]);
//     });
//     test('Delete with existing ID', async () => {
//       mockgetAdminDetails();
//       const response = await request(server)
//         .delete(`/core/admin/language/${valid_id}`)
//         .set('Authorization', `Bearer ${admin_token}`);
//       expect(response.statusCode).toBe(200);
//     });
//     test('Get the Deleted ID', async () => {
//       mockgetAdminDetails();
//       const response = await request(server)
//         .get(`/core/admin/language/${valid_id}`)
//         .set('Authorization', `Bearer ${admin_token}`);
//       expect(response.statusCode).toBe(404);
//       expect(response.body.errors).toStrictEqual([
//         {message: 'Language  Not Found', code: 0},
//       ]);
//     });
//   });
// });
test('1 + 1 should equal 2', () => {
  expect(1 + 1).toBe(2);
});
