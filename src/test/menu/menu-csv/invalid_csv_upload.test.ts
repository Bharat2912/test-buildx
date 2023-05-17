import request from 'supertest';
import {createTestServer} from '../../utils/init';
import {Application} from 'express';
import {
  signToken,
  loadMockSeedData,
  testCasesClosingTasks,
} from '../../utils/utils';
import logger from '../../../utilities/logger/winston_logger';
import {
  mockGetTempFileDataCreatedMenuItemSuccess,
  mockItemAddonDataAddedItemAddonSuccess,
  mockItemAddonGroupDataAddedAddonGroupSuccess,
} from './mock_services';
import {mockgetAdminDetails} from '../../utils/mock_services';

let server: Application;
let admin_token: string;

beforeAll(async () => {
  server = await createTestServer();

  await loadMockSeedData('restaurant');
  await loadMockSeedData('restaurant_menu');
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

describe('Menu CSV Testing :- ADMIN', () => {
  test('Uploading Menu-Addon-Group CSV in Menu-Item| Need To Throw 400 Error With Details', async () => {
    const mock_get_admin_details = mockgetAdminDetails();
    const mock_added_addon_group_success =
      mockItemAddonGroupDataAddedAddonGroupSuccess();
    const response = await request(server)
      .post('/food/admin/menu/csv/menu_item/')
      .set('Authorization', `Bearer ${admin_token}`)
      .send({
        csv_file_name: 'f4df4ea3-ce1c-47fa-ae8b-b4607408a97d.csv',
      });
    expect(response.body.status).toBe(false);
    expect(response.body.statusCode).toBe(400);
    expect(
      response.body.errors[0].data.headers_errors[0].details.missingColumns[0]
    ).not.toBe(null);
    expect(
      response.body.errors[0].data.headers_errors[0].details.extraColumns[0]
    ).not.toBe(null);
    expect(mock_added_addon_group_success).toHaveBeenCalled();
    expect(mock_get_admin_details).toHaveBeenCalled();
  });
  test('Uploading Menu-Item-Addon CSV in Menu-Addon-Group| Need To Throw 400 Error With Details', async () => {
    const mock_get_admin_details = mockgetAdminDetails();
    const mock_item_new_addon_success =
      mockItemAddonDataAddedItemAddonSuccess();
    const response = await request(server)
      .post('/food/admin/menu/csv/item_addon_group/')
      .set('Authorization', `Bearer ${admin_token}`)
      .send({
        csv_file_name: 'f4df4ea3-ce1c-47fa-ae8b-b4607408a97d.csv',
      });
    expect(response.body.status).toBe(false);
    expect(response.body.statusCode).toBe(400);
    expect(
      response.body.errors[0].data.headers_errors[0].details.missingColumns[0]
    ).not.toBe(null);
    expect(
      response.body.errors[0].data.headers_errors[0].details.extraColumns[0]
    ).not.toBe(null);
    expect(mock_item_new_addon_success).toHaveBeenCalled();
    expect(mock_get_admin_details).toHaveBeenCalled();
  });
  test('Uploading Menu-Item CSV in Menu-Item-Addon| Need To Throw 400 Error With Details', async () => {
    const mock_get_admin_details = mockgetAdminDetails();
    const mock__menu_item_created_success =
      mockGetTempFileDataCreatedMenuItemSuccess();
    const response = await request(server)
      .post('/food/admin/menu/csv/menu_item_addon/')
      .set('Authorization', `Bearer ${admin_token}`)
      .send({
        csv_file_name: 'f4df4ea3-ce1c-47fa-ae8b-b4607408a97d.csv',
      });
    expect(response.body.status).toBe(false);
    expect(response.body.statusCode).toBe(400);
    expect(
      response.body.errors[0].data.headers_errors[0].details.missingColumns[0]
    ).not.toBe(null);
    expect(
      response.body.errors[0].data.headers_errors[0].details.extraColumns[0]
    ).not.toBe(null);
    expect(mock__menu_item_created_success).toHaveBeenCalled();
    expect(mock_get_admin_details).toHaveBeenCalled();
  });
});
