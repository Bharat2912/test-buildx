import request from 'supertest';
import {DB} from '../../data/knex';
import {mockGenerateDownloadFileURL} from '../mocks/s3_mocks';
import {vendor_token, admin_token, server} from '../utils/globals';
import {
  mockdeleteMenuItemSQS,
  mockgetAdminDetails,
  mockputMenuItemSQS,
} from '../utils/mock_services';
import {menu_valid_restaurant_id} from './menu.test';

const valid_main_category_id = 2;
const invalid_main_category_id = 20;

export default () => {
  describe('Testing Sub Category', () => {
    describe('Admin Apis', () => {
      describe('POST Sub Category', () => {
        test('Request Wtih Invalid Main Category ID', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .post('/food/admin/menu/sub_category')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              main_category_id: invalid_main_category_id,
              name: 'Soft-Drinks',
            });
          expect(response.statusCode).toBe(404);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: 'Main Category Not Found', code: 0},
          ]);
        });
        test('Request Wtih Empty name', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .post('/food/admin/menu/sub_category')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              main_category_id: valid_main_category_id,
              name: ' ',
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: '"name" is not allowed to be empty', code: 0},
          ]);
        });
        test('Successful Create Request', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .post('/food/admin/menu/sub_category')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              main_category_id: valid_main_category_id,
              name: 'Red - Chilli',
            });
          expect(response.statusCode).toBe(201);
          expect(response.body.status).toBe(true);
          delete response.body.result.created_at;
          delete response.body.result.updated_at;
          expect(response.body.result).toStrictEqual({
            id: 3,
            name: 'Red - Chilli',
            main_category_id: 2,
            main_category_name: 'Soft-Drinks',
            is_deleted: false,
            pos_id: null,
            pos_partner: null,
            sequence: 1,
            discount_rate: 0,
            discount_updated_at: null,
            discount_updated_user_id: null,
            discount_updated_user_type: null,
          });
          const read_sub_category = await DB.read('sub_category');
          expect(read_sub_category[2].id).toBe(3);
          expect(read_sub_category[2].name).toBe('Red - Chilli');
          expect(read_sub_category[2].main_category_id).toBe(
            valid_main_category_id
          );
          expect(read_sub_category[2].is_deleted).toBe(false);
        });
        test('Failed Create Request >> duplicate name', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .post('/food/admin/menu/sub_category')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              main_category_id: valid_main_category_id,
              name: 'Red - Chilli',
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {
              message: 'Duplicate Sub Category Name',
              code: 0,
            },
          ]);
        });
      });
      describe('GET Sub Category', () => {
        test('With Invalid Main Category ID', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .get(
              '/food/admin/menu/sub_category?main_category_id=' +
                invalid_main_category_id
            )
            .set('Authorization', `Bearer ${admin_token}`);
          expect(response.statusCode).toBe(404);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: 'Sub-Category Not Found', code: 0},
          ]);
        });
        test('With Valid Main Category ID', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .get(
              '/food/admin/menu/sub_category?main_category_id=' +
                valid_main_category_id
            )
            .set('Authorization', `Bearer ${admin_token}`);
          expect(response.statusCode).toBe(200);
          expect(response.body.status).toBe(true);
          expect(response.body.result).toStrictEqual([
            {
              discount_rate: 0,
              id: 3,
              name: 'Red - Chilli',
              main_category_id: 2,
              restaurant_id: '77e53c1f-6e9e-4724-9ba7-92edc69cff6b',
              sequence: 1,
            },
          ]);
        });
      });
      describe('PUT Sub Category', () => {
        test('With Invalid Sub Category ID', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .put('/food/admin/menu/sub_category/20')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              main_category_id: valid_main_category_id,
              name: 'Chillis',
            });
          expect(response.statusCode).toBe(404);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: 'Sub-Category Not Found', code: 0},
          ]);
        });
        test('With Empty Name', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .put('/food/admin/menu/sub_category/1')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              main_category_id: valid_main_category_id,
              name: ' ',
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: '"name" is not allowed to be empty', code: 0},
          ]);
        });
        test('Successful Update Request', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .put('/food/admin/menu/sub_category/3')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              main_category_id: valid_main_category_id,
              name: 'Green - Chillies',
            });
          expect(response.statusCode).toBe(200);
          expect(response.body.status).toBe(true);
          delete response.body.result.created_at;
          delete response.body.result.updated_at;
          expect(response.body.result).toStrictEqual({
            id: 3,
            name: 'Green - Chillies',
            main_category_id: 2,
            main_category_name: 'Soft-Drinks',
            is_deleted: false,
            pos_id: null,
            pos_partner: null,
            sequence: 1,
            discount_rate: 0,
            discount_updated_at: null,
            discount_updated_user_id: null,
            discount_updated_user_type: null,
          });
          const read_sub_category = await DB.read('sub_category');
          expect(read_sub_category[2].id).toBe(3);
          expect(read_sub_category[2].name).toBe('Green - Chillies');
          expect(read_sub_category[2].main_category_id).toBe(
            valid_main_category_id
          );
          expect(read_sub_category[2].is_deleted).toBe(false);
        });
      });
      describe('POST Sub Category', () => {
        test('Successful Create Request', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .post('/food/admin/menu/sub_category')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              main_category_id: valid_main_category_id,
              name: 'Dairy',
            });
          expect(response.statusCode).toBe(201);
          expect(response.body.status).toBe(true);
          delete response.body.result.created_at;
          delete response.body.result.updated_at;
          expect(response.body.result).toStrictEqual({
            id: 4,
            name: 'Dairy',
            main_category_id: 2,
            main_category_name: 'Soft-Drinks',
            is_deleted: false,
            pos_id: null,
            pos_partner: null,
            sequence: 2,
            discount_rate: 0,
            discount_updated_at: null,
            discount_updated_user_id: null,
            discount_updated_user_type: null,
          });
          const read_sub_category = await DB.read('sub_category');
          expect(read_sub_category[3].id).toBe(4);
          expect(read_sub_category[3].name).toBe('Dairy');
          expect(read_sub_category[3].main_category_id).toBe(
            valid_main_category_id
          );
          expect(read_sub_category[3].is_deleted).toBe(false);
        });
      });
      describe('POST Sub Category Holiday Slot', () => {
        test('Invalid Main Category', async () => {
          mockgetAdminDetails();
          const epoch = Math.floor(new Date().getTime() / 1000) + 86400;
          const response = await request(server)
            .post('/food/admin/menu/sub_category/20/createHolidaySlot')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              end_epoch: epoch,
            });
          expect(response.statusCode).toBe(404);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: 'Sub-Category Not Found', code: 0},
          ]);
        });
        test('Invalid Epoch Time To Add / Remove HolidaySlot Remove Request', async () => {
          const epoch = Math.floor(new Date().getTime() / 1000) - 86400;
          mockgetAdminDetails();
          const response = await request(server)
            .post('/food/admin/menu/sub_category/1/createHolidaySlot')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              end_epoch: epoch,
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: 'End time is before current date', code: 0},
          ]);
        });
        test('Successful HolidaySlot Request', async () => {
          mockgetAdminDetails();
          const epoch = Math.floor(new Date().getTime() / 1000) + 86400;
          const response = await request(server)
            .post('/food/admin/menu/sub_category/4/createHolidaySlot')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              end_epoch: epoch,
            });
          expect(response.statusCode).toBe(200);
          expect(response.body.status).toBe(true);
          delete response.body.result.created_at;
          delete response.body.result.updated_at;
          expect(response.body.result).toStrictEqual({
            id: 4,
          });
        });
        test('Successfuly HolidaySlot Remove Request', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .post('/food/admin/menu/sub_category/4/createHolidaySlot')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              end_epoch: null,
            });
          expect(response.statusCode).toBe(200);
          expect(response.body.status).toBe(true);
          delete response.body.result.created_at;
          delete response.body.result.updated_at;
          expect(response.body.result).toStrictEqual({
            id: 4,
          });
        });
      });
      describe('DELETE Sub Category', () => {
        test('Invalid Sub Category ID', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .delete('/food/admin/menu/sub_category/20')
            .set('Authorization', `Bearer ${admin_token}`);
          expect(response.statusCode).toBe(404);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: 'Sub-Category Not Found', code: 0},
          ]);
        });
        test('Successful Delete Request', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .delete('/food/admin/menu/sub_category/4')
            .set('Authorization', `Bearer ${admin_token}`);
          expect(response.statusCode).toBe(200);
          expect(response.body.status).toBe(true);
          expect(response.body.result).toStrictEqual({
            id: 4,
          });
          const read_sub_category = await DB.read('sub_category');
          expect(read_sub_category[3].name).toBe('Dairy');
          expect(read_sub_category[3].main_category_id).toBe(
            valid_main_category_id
          );
          expect(read_sub_category[3].is_deleted).toBe(true);
        });
        test('Failed Delete Request >> Not found', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .delete('/food/admin/menu/sub_category/4')
            .set('Authorization', `Bearer ${admin_token}`);
          expect(response.statusCode).toBe(404);
        });
      });
      describe('Cannot Delete Sub Category It Containes Menu Item | First Delete Menu Item Then We Can Delete Sub Category', () => {
        test('Successful Create Request For Sub Category , Addon Group, Addon', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .post('/food/admin/menu/sub_category')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              main_category_id: valid_main_category_id,
              name: 'Test-Delete',
            });
          expect(response.statusCode).toBe(201);
          expect(response.body.status).toBe(true);

          const create_addon_group = await request(server)
            .post('/food/admin/menu/addon_group')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              restaurant_id: menu_valid_restaurant_id,
              name: 'Soft-Drinks',
            });
          expect(create_addon_group.statusCode).toBe(201);
          expect(create_addon_group.body.status).toBe(true);

          const create_addon = await request(server)
            .post('/food/admin/menu/addon')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              addon_group_id: 1,
              name: 'Chilli',
              sequence: 91,
              price: 12.5,
              veg_egg_non: 'veg',
              sgst_rate: 12.5,
              cgst_rate: 12.5,
              igst_rate: 12.5,
              gst_inclusive: true,
              external_id: 'ght-128978912bkj129',
            });
          expect(create_addon.statusCode).toBe(201);
          expect(create_addon.body.status).toBe(true);
        });
        test('Successful Menu Item Create Request', async () => {
          mockgetAdminDetails();
          mockputMenuItemSQS();
          mockGenerateDownloadFileURL();
          const response = await request(server)
            .post('/food/admin/menu/menu_item')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              sub_category_id: 3,
              restaurant_id: menu_valid_restaurant_id,
              name: 'Test-Menu-Item',
              price: 12.5,
              veg_egg_non: 'veg',
              packing_charges: 12.5,
              is_spicy: true,
              serves_how_many: 2,
              service_charges: 12.5,
              item_sgst_utgst: 12.5,
              item_cgst: 12.5,
              item_igst: 12.5,
              item_inclusive: true,
              external_id: 'ght-128978912bkj129',
              allow_long_distance: true,
              variant_groups: [
                {
                  name: 'South Indian',
                  variants: [
                    {
                      name: 'Thali',
                      is_default: true,
                      in_stock: true,
                      price: 12.5,
                      veg_egg_non: 'veg',
                      serves_how_many: 1,
                    },
                  ],
                },
              ],
              addon_groups: [
                {
                  id: 1,
                  max_limit: 1,
                  min_limit: -1,
                  free_limit: -1,
                  sequence: 90,
                  addons: [
                    {
                      id: 1,
                    },
                  ],
                },
              ],
            });
          expect(response.statusCode).toBe(201);
          expect(response.body.status).toBe(true);
        });
        test('Sub Category Containes One Menu Item | Need to throw error', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .delete('/food/admin/menu/sub_category/3')
            .set('Authorization', `Bearer ${admin_token}`);
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {
              code: 1093,
              message: 'Sub Category Containes 1 Menu Items',
              data: {
                menu_items: [
                  {
                    menu_item_id: 1,
                    menu_item_name: 'Test-Menu-Item',
                    sub_category_id: 3,
                  },
                ],
              },
            },
          ]);
        });
        test('Successful Delete Request For Menu Item', async () => {
          mockgetAdminDetails();
          mockdeleteMenuItemSQS();
          const response = await request(server)
            .delete('/food/admin/menu/menu_item/1')
            .set('Authorization', `Bearer ${admin_token}`);
          expect(response.statusCode).toBe(200);
          expect(response.body.status).toBe(true);
          expect(response.body.result.id).toBe(1);
        });
        test('Successful Delete Request For Sub Category', async () => {
          mockgetAdminDetails();
          mockdeleteMenuItemSQS();
          const response = await request(server)
            .delete('/food/admin/menu/sub_category/3')
            .set('Authorization', `Bearer ${admin_token}`);
          expect(response.statusCode).toBe(200);
          expect(response.body.status).toBe(true);
          expect(response.body.result).toStrictEqual({
            id: 3,
          });
        });
      });
    });

    describe('Vendor Apis', () => {
      describe('POST Sub Category', () => {
        test('Request Wtih Invalid Main Category ID', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .post('/food/vendor/menu/sub_category')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              main_category_id: invalid_main_category_id,
              name: 'Soft-Drinks',
            });
          expect(response.statusCode).toBe(404);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: 'Main Category Not Found', code: 0},
          ]);
        });
        test('Request Wtih Empty name', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .post('/food/vendor/menu/sub_category')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              main_category_id: valid_main_category_id,
              name: ' ',
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: '"name" is not allowed to be empty', code: 0},
          ]);
        });
        test('Successful Create Request', async () => {
          const response = await request(server)
            .post('/food/vendor/menu/sub_category')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              main_category_id: valid_main_category_id,
              name: 'Sugar',
            });
          expect(response.statusCode).toBe(201);
          expect(response.body.status).toBe(true);
          delete response.body.result.created_at;
          delete response.body.result.updated_at;
          expect(response.body.result).toStrictEqual({
            id: 6,
            name: 'Sugar',
            main_category_id: 2,
            main_category_name: 'Soft-Drinks',
            is_deleted: false,
            pos_id: null,
            pos_partner: null,
            sequence: 3,
            discount_rate: 0,
            discount_updated_at: null,
            discount_updated_user_id: null,
            discount_updated_user_type: null,
          });
          const read_sub_category = await DB.read('sub_category');
          expect(read_sub_category[5].id).toBe(6);
          expect(read_sub_category[5].name).toBe('Sugar');
          expect(read_sub_category[5].main_category_id).toBe(
            valid_main_category_id
          );
          expect(read_sub_category[5].is_deleted).toBe(false);
        });
        test('Failed Create Request >> duplicate name', async () => {
          const response = await request(server)
            .post('/food/vendor/menu/sub_category')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              main_category_id: valid_main_category_id,
              name: 'Sugar',
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.errors).toStrictEqual([
            {
              message: 'Duplicate Sub Category Name',
              code: 0,
            },
          ]);
        });
      });
      describe('GET Sub Category', () => {
        test('With Invalid Main Category ID', async () => {
          const response = await request(server)
            .get(
              '/food/vendor/menu/sub_category?main_category_id=' +
                invalid_main_category_id
            )
            .set('Authorization', `Bearer ${vendor_token}`);
          expect(response.statusCode).toBe(404);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: 'Sub-Category Not Found', code: 0},
          ]);
        });
        test('With Valid Main Category ID', async () => {
          const response = await request(server)
            .get(
              '/food/vendor/menu/sub_category?main_category_id=' +
                valid_main_category_id
            )
            .set('Authorization', `Bearer ${vendor_token}`);
          expect(response.statusCode).toBe(200);
          expect(response.body.status).toBe(true);
          expect(response.body.result).toStrictEqual([
            {
              discount_rate: 0,
              id: 5,
              name: 'Test-Delete',
              main_category_id: 2,
              restaurant_id: '77e53c1f-6e9e-4724-9ba7-92edc69cff6b',
              sequence: 2,
            },
            {
              discount_rate: 0,
              id: 6,
              name: 'Sugar',
              main_category_id: 2,
              restaurant_id: '77e53c1f-6e9e-4724-9ba7-92edc69cff6b',
              sequence: 3,
            },
          ]);
        });
      });
      describe('PUT Sub Category', () => {
        test('With Invalid Sub Category ID', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .put('/food/vendor/menu/sub_category/20')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              main_category_id: invalid_main_category_id,
              name: 'Chillis',
            });
          expect(response.statusCode).toBe(404);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: 'Sub-Category Not Found', code: 0},
          ]);
        });
        test('With Empty Name', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .put('/food/vendor/menu/sub_category/3')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              main_category_id: valid_main_category_id,
              name: ' ',
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: '"name" is not allowed to be empty', code: 0},
          ]);
        });
        test('Successful Update Request', async () => {
          const response = await request(server)
            .put('/food/vendor/menu/sub_category/5')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              main_category_id: valid_main_category_id,
              name: 'Sweet',
            });
          expect(response.statusCode).toBe(200);
          expect(response.body.status).toBe(true);
          delete response.body.result.created_at;
          delete response.body.result.updated_at;
          expect(response.body.result).toStrictEqual({
            id: 5,
            name: 'Sweet',
            main_category_id: 2,
            main_category_name: 'Soft-Drinks',
            is_deleted: false,
            pos_id: null,
            pos_partner: null,
            sequence: 2,
            discount_rate: 0,
            discount_updated_at: null,
            discount_updated_user_id: null,
            discount_updated_user_type: null,
          });
          const read_sub_category = await DB.read('sub_category');
          expect(read_sub_category[5].id).toBe(5);
          expect(read_sub_category[5].name).toBe('Sweet');
          expect(read_sub_category[5].main_category_id).toBe(
            valid_main_category_id
          );
          expect(read_sub_category[5].is_deleted).toBe(false);
        });
      });
      describe('POST Sub Category', () => {
        test('Successful Create Request', async () => {
          const response = await request(server)
            .post('/food/vendor/menu/sub_category')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              main_category_id: valid_main_category_id,
              name: 'Brown-Sugar',
            });
          expect(response.statusCode).toBe(201);
          expect(response.body.status).toBe(true);
          delete response.body.result.created_at;
          delete response.body.result.updated_at;
          expect(response.body.result).toStrictEqual({
            id: 7,
            name: 'Brown-Sugar',
            main_category_id: 2,
            main_category_name: 'Soft-Drinks',
            is_deleted: false,
            pos_id: null,
            sequence: 4,
            pos_partner: null,
            discount_rate: 0,
            discount_updated_at: null,
            discount_updated_user_id: null,
            discount_updated_user_type: null,
          });
          const read_sub_category = await DB.read('sub_category');
          expect(read_sub_category[6].id).toBe(7);
          expect(read_sub_category[6].name).toBe('Brown-Sugar');
          expect(read_sub_category[6].main_category_id).toBe(
            valid_main_category_id
          );
          expect(read_sub_category[6].is_deleted).toBe(false);
        });
      });
      describe('POST Sub Category Holiday Slot', () => {
        test('Invalid Main Category', async () => {
          mockgetAdminDetails();
          const epoch = Math.floor(new Date().getTime() / 1000) + 86400;
          const response = await request(server)
            .post('/food/vendor/menu/sub_category/20/createHolidaySlot')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              end_epoch: epoch,
            });
          expect(response.statusCode).toBe(404);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: 'Sub-Category Not Found', code: 0},
          ]);
        });
        test('Invalid Epoch Time To Add / Remove HolidaySlot Remove Request', async () => {
          const epoch = Math.floor(new Date().getTime() / 1000) - 86400;
          mockgetAdminDetails();
          const response = await request(server)
            .post('/food/vendor/menu/sub_category/1/createHolidaySlot')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              end_epoch: epoch,
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: 'End time is before current date', code: 0},
          ]);
        });
        test('Successful HolidaySlot Request', async () => {
          const epoch = Math.floor(new Date().getTime() / 1000) + 86400;
          const response = await request(server)
            .post('/food/vendor/menu/sub_category/7/createHolidaySlot')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              end_epoch: epoch,
            });
          expect(response.statusCode).toBe(200);
          delete response.body.result.created_at;
          delete response.body.result.updated_at;
          expect(response.body.result).toStrictEqual({
            id: 7,
          });
        });
        test('Successfuly HolidaySlot Remove Request', async () => {
          const response = await request(server)
            .post('/food/vendor/menu/sub_category/7/createHolidaySlot')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              end_epoch: null,
            });
          expect(response.statusCode).toBe(200);
          expect(response.body.status).toBe(true);
          delete response.body.result.created_at;
          delete response.body.result.updated_at;
          expect(response.body.result).toStrictEqual({
            id: 7,
          });
        });
      });
      describe('DELETE Sub Category', () => {
        test('Invalid Sub Category ID', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .delete('/food/vendor/menu/sub_category/20')
            .set('Authorization', `Bearer ${vendor_token}`);
          expect(response.statusCode).toBe(404);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: 'Sub-Category Not Found', code: 0},
          ]);
        });
        test('Successful Delete Request', async () => {
          const response = await request(server)
            .delete('/food/vendor/menu/sub_category/7')
            .set('Authorization', `Bearer ${vendor_token}`);
          expect(response.statusCode).toBe(200);
          expect(response.body.status).toBe(true);
          expect(response.body.result).toStrictEqual({
            id: 7,
          });
        });
        test('Failed Delete Request >> Not found', async () => {
          const response = await request(server)
            .delete('/food/vendor/menu/sub_category/7')
            .set('Authorization', `Bearer ${vendor_token}`);
          expect(response.statusCode).toBe(404);
        });
      });
      describe('Cannot Delete Sub Category It Containes Menu Item | First Delete Menu Item Then We Can Delete Sub Category', () => {
        test('Successful Create Request For Sub Category , Addon Group, Addon', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .post('/food/vendor/menu/sub_category')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              main_category_id: valid_main_category_id,
              name: 'Test-Delete',
            });
          expect(response.statusCode).toBe(201);
          expect(response.body.status).toBe(true);

          const create_addon_group = await request(server)
            .post('/food/vendor/menu/addon_group')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              name: 'Delete-Addon-Group',
            });
          expect(create_addon_group.statusCode).toBe(201);
          expect(create_addon_group.body.status).toBe(true);

          const create_addon = await request(server)
            .post('/food/vendor/menu/addon')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              addon_group_id: 2,
              name: 'Chilli',
              sequence: 91,
              price: 12.5,
              veg_egg_non: 'veg',
              sgst_rate: 12.5,
              cgst_rate: 12.5,
              igst_rate: 12.5,
              gst_inclusive: true,
              external_id: 'ght-128978912bkj129',
            });
          expect(create_addon.statusCode).toBe(201);
          expect(create_addon.body.status).toBe(true);
        });
        test('Successful Menu Item Create Request', async () => {
          mockgetAdminDetails();
          mockputMenuItemSQS();
          mockGenerateDownloadFileURL();
          const response = await request(server)
            .post('/food/vendor/menu/menu_item')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              sub_category_id: 6,
              name: 'Test-Menu-Item',
              price: 12.5,
              veg_egg_non: 'veg',
              packing_charges: 12.5,
              is_spicy: true,
              serves_how_many: 2,
              service_charges: 12.5,
              item_sgst_utgst: 12.5,
              item_cgst: 12.5,
              item_igst: 12.5,
              item_inclusive: true,
              external_id: 'ght-128978912bkj129',
              allow_long_distance: true,
              variant_groups: [
                {
                  name: 'South Indian',
                  variants: [
                    {
                      name: 'Thali',
                      is_default: true,
                      in_stock: true,
                      price: 12.5,
                      veg_egg_non: 'veg',
                      serves_how_many: 1,
                    },
                  ],
                },
              ],
              addon_groups: [
                {
                  id: 2,
                  max_limit: 1,
                  min_limit: -1,
                  free_limit: -1,
                  sequence: 90,
                  addons: [
                    {
                      id: 2,
                    },
                  ],
                },
              ],
            });
          expect(response.statusCode).toBe(201);
          expect(response.body.status).toBe(true);
        });
        test('Sub Category Containes One Menu Item | Need to throw error', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .delete('/food/vendor/menu/sub_category/6')
            .set('Authorization', `Bearer ${vendor_token}`);
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {
              code: 1093,
              message: 'Sub Category Containes 1 Menu Items',
              data: {
                menu_items: [
                  {
                    menu_item_id: 2,
                    menu_item_name: 'Test-Menu-Item',
                    sub_category_id: 6,
                  },
                ],
              },
            },
          ]);
        });
        test('Successful Delete Request For Menu Item', async () => {
          mockgetAdminDetails();
          mockdeleteMenuItemSQS();
          const response = await request(server)
            .delete('/food/vendor/menu/menu_item/2')
            .set('Authorization', `Bearer ${vendor_token}`);
          expect(response.statusCode).toBe(200);
          expect(response.body.status).toBe(true);
          expect(response.body.result.id).toBe(2);
        });
        test('Successful Delete Request For Sub Category', async () => {
          mockgetAdminDetails();
          mockdeleteMenuItemSQS();
          const response = await request(server)
            .delete('/food/vendor/menu/sub_category/6')
            .set('Authorization', `Bearer ${vendor_token}`);
          expect(response.statusCode).toBe(200);
          expect(response.body.status).toBe(true);
          expect(response.body.result).toStrictEqual({
            id: 6,
          });
        });
      });
    });
  });
};
