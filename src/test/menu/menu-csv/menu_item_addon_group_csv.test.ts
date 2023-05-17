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
  mockItemAddonGroupDataInvalidRestaurantFail,
  mockItemAddonGroupDataItemIdEmptyFail,
  mockItemAddonGroupDataInvalidItemIdFail,
  mockItemAddonGroupDataEmptyAddonGroupIdFail,
  mockItemAddonGroupDataAddedAddonGroupSuccess,
  mockItemAddonGroupDataChangeAddonGroupSuccess,
  mockItemAddonGroupDataInvalidAddonGroupIDFail,
} from './mock_services';
import {DB} from '../../../data/knex';

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
  describe('Get Restaurant Menu Items Addon Group In CSV File | GET /food/admin/menu/csv/item_addon_group/{restaurant_id}', () => {
    test('Token Not Provided | Need To Throw Error', async () => {
      const response = await request(server).get(
        "/food/admin/menu/csv/item_addon_group/['b0909e52-a731-4665-a791-ee6479008804']"
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
          "/food/admin/menu/csv/item_addon_group/['b0909e52-a731-4665-a791-ee6479008804']"
        )
        .set('Authorization', `Bearer ${admin_token}`);

      expect(response.statusCode).toBe(200);
      expect(response.ok).toBe(true);
      expect(mock_get_admin_details).toHaveBeenCalled();
    });
  });
  describe('Menu Item Addon Group Using CSV | POST /food/admin/menu/csv/item_addon_group', () => {
    test('Upload Temp CSV File Name | Restaurant Not Found', async () => {
      const mock_get_admin_details = mockgetAdminDetails();
      const mock_restaurant_id_not_found_fail =
        mockItemAddonGroupDataInvalidRestaurantFail();
      const response = await request(server)
        .post('/food/admin/menu/csv/item_addon_group/')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          csv_file_name: 'f4df4ea3-ce1c-47fa-ae8b-b4607408a97d.csv',
        });
      expect(response.body.status).toBe(false);
      expect(response.body.statusCode).toBe(400);
      expect(response.body.errors[0].data).toMatchObject({
        'Row (2)': [
          {column_name: 'Restaurant_Id', error: 'invalid'},
          {column_name: 'Item_Id', error: 'invalid'},
          {column_name: 'AddonGroup_Id', error: 'invalid'},
        ],
      });
      expect(mock_restaurant_id_not_found_fail).toHaveBeenCalled();
      expect(mock_get_admin_details).toHaveBeenCalled();
    });
    test('Upload Temp CSV File Name | Empty Menu Item ID', async () => {
      const mock_get_admin_details = mockgetAdminDetails();
      const mock_empty_menu_item_id_fail =
        mockItemAddonGroupDataItemIdEmptyFail();
      const response = await request(server)
        .post('/food/admin/menu/csv/item_addon_group/')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          csv_file_name: 'f4df4ea3-ce1c-47fa-ae8b-b4607408a97d.csv',
        });

      expect(response.body.status).toBe(false);
      expect(response.body.statusCode).toBe(400);
      expect(response.body.errors[0].data).toMatchObject({
        'Row (2)': [
          {column_name: 'Item_Id', error: 'empty'},
          {column_name: 'Item_Id', error: 'invalid'},
          {column_name: 'AddonGroup_Id', error: 'invalid'},
        ],
      });
      expect(mock_empty_menu_item_id_fail).toHaveBeenCalled();
      expect(mock_get_admin_details).toHaveBeenCalled();
    });
    test('Upload Temp CSV File Name | Invalid Menu Item ID', async () => {
      const mock_get_admin_details = mockgetAdminDetails();
      const mock_invalid_menu_item_id_fail =
        mockItemAddonGroupDataInvalidItemIdFail();
      const response = await request(server)
        .post('/food/admin/menu/csv/item_addon_group/')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          csv_file_name: 'f4df4ea3-ce1c-47fa-ae8b-b4607408a97d.csv',
        });
      expect(response.body.status).toBe(false);
      expect(response.body.statusCode).toBe(400);
      expect(response.body.errors[0].data).toMatchObject({
        'Row (2)': [{column_name: 'Item_Id', error: 'invalid'}],
      });
      expect(mock_invalid_menu_item_id_fail).toHaveBeenCalled();
      expect(mock_get_admin_details).toHaveBeenCalled();
    });
    test('Upload Temp CSV File Name | Empty Addon Group ID | Invalid Addon Group Name', async () => {
      const mock_get_admin_details = mockgetAdminDetails();
      const mock_invalid_addon_group_name_fail =
        mockItemAddonGroupDataEmptyAddonGroupIdFail();
      const response = await request(server)
        .post('/food/admin/menu/csv/item_addon_group/')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          csv_file_name: 'f4df4ea3-ce1c-47fa-ae8b-b4607408a97d.csv',
        });
      expect(response.body.status).toBe(false);
      expect(response.body.statusCode).toBe(400);
      expect(JSON.stringify(response.body.errors[0].data)).toBe(
        JSON.stringify({
          'Row (2)': [{column_name: 'AddonGroup_Id', error: 'invalid'}],
        })
      );
      expect(mock_invalid_addon_group_name_fail).toHaveBeenCalled();
      expect(mock_get_admin_details).toHaveBeenCalled();
    });
    test('Upload Temp CSV File Name | Invalid Addon Group ID | New Valid Addon Group Name', async () => {
      const mock_get_admin_details = mockgetAdminDetails();
      const mock_invalid_addon_group_id_fail =
        mockItemAddonGroupDataInvalidAddonGroupIDFail();
      const response = await request(server)
        .post('/food/admin/menu/csv/item_addon_group/')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          csv_file_name: 'f4df4ea3-ce1c-47fa-ae8b-b4607408a97d.csv',
        });
      expect(response.body.status).toBe(false);
      expect(response.body.statusCode).toBe(400);
      expect(JSON.stringify(response.body.errors[0].data)).toBe(
        JSON.stringify({
          'Row (2)': [{column_name: 'AddonGroup_Id', error: 'invalid'}],
        })
      );
      expect(mock_invalid_addon_group_id_fail).toHaveBeenCalled();
      expect(mock_get_admin_details).toHaveBeenCalled();
    });
    test('Upload Temp CSV File Name | Added Addon Group For Menu Item', async () => {
      const menu_item_db_read_before = await DB.read('item_addon_group').where({
        menu_item_id: 11102,
      });
      expect(menu_item_db_read_before.length).toEqual(0);

      const mock_get_admin_details = mockgetAdminDetails();
      const mock_added_addon_group_success =
        mockItemAddonGroupDataAddedAddonGroupSuccess();
      const response = await request(server)
        .post('/food/admin/menu/csv/item_addon_group/')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          csv_file_name: 'f4df4ea3-ce1c-47fa-ae8b-b4607408a97d.csv',
        });
      expect(response.body.status).toBe(true);
      expect(response.body.statusCode).toBe(201);
      expect(response.body.message).toBe('Successful Response');
      expect(response.body.result.Item_Addon_Group.Created).toEqual(1);
      expect(response.body.result.Item_Addon_Group.Modified).toEqual(0);
      expect(mock_added_addon_group_success).toHaveBeenCalled();
      expect(mock_get_admin_details).toHaveBeenCalled();

      const menu_item_db_read_after = await DB.read('item_addon_group').where({
        menu_item_id: 11102,
      });
      expect(menu_item_db_read_after[0].addon_group_id).toEqual(77);
    });
    test('Upload Temp CSV File Name | Change Addon Group For Menu Item', async () => {
      const menu_item_db_read_before = await DB.read('item_addon_group').where({
        menu_item_id: 11101,
      });
      expect(menu_item_db_read_before[0].addon_group_id).toEqual(77);
      expect(menu_item_db_read_before[0].max_limit).toEqual(3);
      expect(menu_item_db_read_before[0].min_limit).toEqual(2);
      expect(menu_item_db_read_before[0].free_limit).toEqual(1);

      const mock_get_admin_details = mockgetAdminDetails();
      const mock_change_addon_group_success =
        mockItemAddonGroupDataChangeAddonGroupSuccess();
      const response = await request(server)
        .post('/food/admin/menu/csv/item_addon_group/')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          csv_file_name: 'f4df4ea3-ce1c-47fa-ae8b-b4607408a97d.csv',
        });
      expect(response.body.status).toBe(true);
      expect(response.body.statusCode).toBe(201);
      expect(response.body.message).toBe('Successful Response');
      expect(response.body.result.Item_Addon_Group.Created).toEqual(0);
      expect(response.body.result.Item_Addon_Group.Modified).toEqual(1);
      expect(mock_change_addon_group_success).toHaveBeenCalled();
      expect(mock_get_admin_details).toHaveBeenCalled();

      const menu_item_db_read_after = await DB.read('item_addon_group').where({
        menu_item_id: 11101,
      });
      expect(menu_item_db_read_after[0].addon_group_id).toEqual(77);
      expect(menu_item_db_read_after[0].max_limit).toEqual(2);
      expect(menu_item_db_read_after[0].min_limit).toEqual(0);
      expect(menu_item_db_read_after[0].free_limit).toEqual(-1);
    });
  });
});
