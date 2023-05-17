/* eslint-disable @typescript-eslint/no-explicit-any */
import request from 'supertest';
import {createTestServer} from '../../utils/init';
import {Application} from 'express';
import {
  signToken,
  loadMockSeedData,
  testCasesClosingTasks,
} from '../../utils/utils';
import logger from '../../../utilities/logger/winston_logger';
import {mockgetAdminDetails} from '../../utils/mock_services';
import {
  mockItemAddonDataInvalidRestaurantFail,
  mockItemAddonDataInvalidMenuItemFail,
  mockItemAddonDataInvalidAddonGroupFail,
  mockItemAddonDataInvalidAddonFail,
  mockItemAddonDataUpdateItemAddonSuccess,
  mockItemAddonDataAddedItemAddonSuccess,
} from './mock_services';

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
  describe('Get Restaurant Menu Items Addon In CSV File | GET /food/admin/menu/csv/menu_item_addon/{restaurant_id}', () => {
    test('Token Not Provided | Need To Throw Error', async () => {
      const response = await request(server).get(
        "/food/admin/menu/csv/menu_item_addon/['b0909e52-a731-4665-a791-ee6479008804']"
      );
      expect(response.body.statusCode).toBe(401);
      expect(response.body.status).toBe(false);
      expect(response.body.errors).toStrictEqual([
        {message: 'Authorization Error', code: 0},
      ]);
    });
    test('GET Restaurant Menu Items Addon Group', async () => {
      const mock_get_admin_details = mockgetAdminDetails();
      const response = await request(server)
        .get(
          "/food/admin/menu/csv/menu_item_addon/['b0909e52-a731-4665-a791-ee6479008804']"
        )
        .set('Authorization', `Bearer ${admin_token}`);

      expect(response.statusCode).toBe(200);
      expect(response.ok).toBe(true);
      expect(mock_get_admin_details).toHaveBeenCalled();
    });
  });
  describe('Menu Item Addon Group Using CSV | POST /food/admin/menu/csv/menu_item_addon', () => {
    test('Upload Temp CSV File Name | Restaurant Not Found', async () => {
      const mock_get_admin_details = mockgetAdminDetails();
      const mock_restaurant_id_not_found_fail =
        mockItemAddonDataInvalidRestaurantFail();
      const response = await request(server)
        .post('/food/admin/menu/csv/menu_item_addon/')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          csv_file_name: 'f4df4ea3-ce1c-47fa-ae8b-b4607408a97d.csv',
        });

      expect(response.body.status).toBe(false);
      expect(response.body.statusCode).toBe(400);
      expect(response.body.errors[0].data).toMatchObject({
        'Row (2)': [
          {
            column_name: 'Restaurant_Id',
            error: 'invalid',
            details: 'Data:[00a0980a-946f-45ca-82e7-8c80c24cccf0]',
          },
          {
            column_name: 'Items_Id',
            error: 'invalid',
            details: 'Data:[11102]',
          },
        ],
      });
      expect(mock_restaurant_id_not_found_fail).toHaveBeenCalled();
      expect(mock_get_admin_details).toHaveBeenCalled();
    });
    test('Upload Temp CSV File Name | Menu Item Not Found', async () => {
      const mock_get_admin_details = mockgetAdminDetails();
      const mock_menu_item_not_found_fail =
        mockItemAddonDataInvalidMenuItemFail();
      const response = await request(server)
        .post('/food/admin/menu/csv/menu_item_addon/')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          csv_file_name: 'f4df4ea3-ce1c-47fa-ae8b-b4607408a97d.csv',
        });

      expect(response.body.status).toBe(false);
      expect(response.body.statusCode).toBe(400);
      expect(response.body.errors[0].data).toMatchObject({
        'Row (2)': [
          {
            column_name: 'Items_Id',
            error: 'invalid',
            details: 'Data:[11105]',
          },
        ],
      });
      expect(mock_menu_item_not_found_fail).toHaveBeenCalled();
      expect(mock_get_admin_details).toHaveBeenCalled();
    });
    test('Upload Temp CSV File Name | Addon Group Not Found', async () => {
      const mock_get_admin_details = mockgetAdminDetails();
      const mock_addon_group_not_found_fail =
        mockItemAddonDataInvalidAddonGroupFail();
      const response = await request(server)
        .post('/food/admin/menu/csv/menu_item_addon/')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          csv_file_name: 'f4df4ea3-ce1c-47fa-ae8b-b4607408a97d.csv',
        });

      expect(response.body.status).toBe(false);
      expect(response.body.statusCode).toBe(400);
      expect(response.body.errors[0].data).toMatchObject({
        'Row (2)': [
          {
            column_name: 'AddonGroup_Id',
            error: 'invalid',
            details: 'Data:[78]',
          },
        ],
      });
      expect(mock_addon_group_not_found_fail).toHaveBeenCalled();
      expect(mock_get_admin_details).toHaveBeenCalled();
    });
    test('Upload Temp CSV File Name | Addon Not Found', async () => {
      const mock_get_admin_details = mockgetAdminDetails();
      const mock_addon_not_found_fail = mockItemAddonDataInvalidAddonFail();
      const response = await request(server)
        .post('/food/admin/menu/csv/menu_item_addon/')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          csv_file_name: 'f4df4ea3-ce1c-47fa-ae8b-b4607408a97d.csv',
        });
      expect(response.body.status).toBe(false);
      expect(response.body.statusCode).toBe(400);
      expect(response.body.errors[0].data).toMatchObject({
        'Row (2)': [
          {
            column_name: 'Addon_Id',
            error: 'invalid',
            details: 'Data:[7760]',
          },
        ],
      });
      expect(mock_addon_not_found_fail).toHaveBeenCalled();
      expect(mock_get_admin_details).toHaveBeenCalled();
    });
    test('Upload Temp CSV File Name | Update Addon', async () => {
      const mock_get_admin_details = mockgetAdminDetails();
      const mock_item_update_addon_success =
        mockItemAddonDataUpdateItemAddonSuccess();
      const response = await request(server)
        .post('/food/admin/menu/csv/menu_item_addon/')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          csv_file_name: 'f4df4ea3-ce1c-47fa-ae8b-b4607408a97d.csv',
        });
      expect(response.body.status).toBe(true);
      expect(response.body.statusCode).toBe(201);
      expect(response.body.message).toBe('Successful Response');
      expect(response.body.result).toMatchObject({
        Addon_Group: {Created: 0, Modified: 0},
        Addon: {Created: 0, Modified: 1},
      });
      expect(mock_item_update_addon_success).toHaveBeenCalled();
      expect(mock_get_admin_details).toHaveBeenCalled();
    });
    test('Upload Temp CSV File Name | Added New Addon', async () => {
      const mock_get_admin_details = mockgetAdminDetails();
      const mock_item_new_addon_success =
        mockItemAddonDataAddedItemAddonSuccess();
      const response = await request(server)
        .post('/food/admin/menu/csv/menu_item_addon/')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          csv_file_name: 'f4df4ea3-ce1c-47fa-ae8b-b4607408a97d.csv',
        });

      expect(response.body.status).toBe(true);
      expect(response.body.statusCode).toBe(201);
      expect(response.body.message).toBe('Successful Response');
      expect(response.body.result).toMatchObject({
        Addon_Group: {Created: 0, Modified: 0},
        Addon: {Created: 1, Modified: 0},
      });
      expect(mock_item_new_addon_success).toHaveBeenCalled();
      expect(mock_get_admin_details).toHaveBeenCalled();
    });
  });
});
