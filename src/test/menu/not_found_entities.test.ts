import request from 'supertest';
import {createTestServer} from '../utils/init';
import {Application} from 'express';
import {signToken, testCasesClosingTasks} from '../utils/utils';
import {mockgetAdminDetails} from '../utils/mock_services';

jest.mock('axios');

let server: Application;
let admin_token: string;
let vendor_token: string;

beforeAll(async () => {
  server = await createTestServer();

  admin_token = signToken({
    id: '64bfafb6-c273-4b64-a0fc-ca981f5819eb',
    user_type: 'admin',
  });
  vendor_token = signToken({
    id: 'cdf39e49-3b6b-4558-b08d-cb00b8ddb0a4',
    user_type: 'vendor',
    data: {
      type: 'restaurant',
      outlet_id: '77e53c1f-6e9e-4724-9ba7-92edc69cff6b',
      force_reset_password: false,
    },
  });
});

afterAll(async () => {
  await testCasesClosingTasks();
});

describe('Other Scenerios', () => {
  test('GET | Addon Group Does Not Exist | Need To Send Empty Object ', async () => {
    mockgetAdminDetails();
    const response = await request(server)
      .get(
        '/food/admin/menu/addon_group?restaurant_id=77e53c1f-6e9e-4724-9ba7-92edc69cff6b'
      )
      .set('Authorization', `Bearer ${admin_token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe(true);
    expect(response.body.result).toStrictEqual([]);
  });
  test('Vendor Trying To Get Addon-Group Before Creating | Should Return Empty Array with 200', async () => {
    const response = await request(server)
      .get('/food/vendor/menu/addon_group')
      .set('Authorization', `Bearer ${vendor_token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe(true);
    expect(response.body.result).toStrictEqual([]);
  });
});
