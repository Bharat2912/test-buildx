/* eslint-disable @typescript-eslint/no-explicit-any */
import request from 'supertest';
import {createTestServer} from './utils/init';
import {Application} from 'express';
import {signToken, testCasesClosingTasks} from './utils/utils';
import logger from './../utilities/logger/winston_logger';
import {mockGetS3TempUploadSignedUrl} from './utils/mock_services';

let server: Application;
let admin_token: string;

beforeAll(async () => {
  server = await createTestServer();

  logger.info('DataBase Connection Created For Testing');
  admin_token = signToken({
    id: '64bfafb6-c273-4b64-a0fc-ca981f5819eb',
    user_type: 'admin',
  });
});
afterAll(async () => {
  await testCasesClosingTasks();
});

jest.mock('axios');
describe('Generate signUrl for upload document on it | GET /core/common/getUploadURL/{file_extn}', () => {
  test('Token Not Provided | Need To Throw Error', async () => {
    const response = await request(server).get(
      `/core/common/getUploadURL/${'csv'}`
    );
    expect(response.body.status).toBe(false);
    expect(response.body.statusCode).toBe(401);
    expect(response.body.errors).toStrictEqual([
      {message: 'Authorization Error', code: 0},
    ]);
  });
  test('Generate signURL', async () => {
    const mock_get_s3_temp_upload_signed_url = mockGetS3TempUploadSignedUrl();
    const response = await request(server)
      .get(`/core/common/getUploadURL/${'csv'}`)
      .set('Authorization', `Bearer ${admin_token}`);
    expect(response.body.status).toBe(true);
    expect(response.body.statusCode).toBe(200);
    expect(response.body.message).toBe('Successful Response');
    expect(response.body.result.file_name).not.toBeUndefined();
    expect(response.body.result.uploadUrl).not.toBeUndefined();
    expect(mock_get_s3_temp_upload_signed_url).toHaveBeenCalled();
  });
});
