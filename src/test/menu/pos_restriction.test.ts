import request from 'supertest';
import {Application} from 'express';
import {createTestServer} from '../utils/init';
import {
  createTableDynamoDB,
  loadMockSeedData,
  signToken,
  testCasesClosingTasks,
} from '../utils/utils';
import {pp_restaurant_id} from '../petpooja/common';
import {
  mockgetAdminDetails,
  mockputMenuItemSQS,
  mocksaveS3File,
} from '../utils/mock_services';
import {mockGenerateDownloadFileURL} from '../mocks/s3_mocks';

jest.mock('axios');

let server: Application;
let vendor_token: string;
let admin_token: string;

beforeAll(async () => {
  server = await createTestServer();
  vendor_token = signToken({
    id: '33c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
    data: {
      type: 'restaurant',
      outlet_id: pp_restaurant_id,
      force_reset_password: false,
    },
    user_type: 'vendor',
  });
  admin_token = signToken({
    id: '64bfafb6-c273-4b64-a0fc-ca981f5819eb',
    user_type: 'admin',
  });
  await createTableDynamoDB('user');
  await loadMockSeedData('restaurant');
  await loadMockSeedData('restaurant_menu');
  await loadMockSeedData('subscription');
  await loadMockSeedData('coupon');
  await loadMockSeedData('global_var');
});

afterAll(async () => {
  await testCasesClosingTasks();
});

describe('Menu', () => {
  describe('Menu-Item', () => {
    describe('Vendor', () => {
      test('Vendor Creating Menu Item ', async () => {
        const create_menu_item = await request(server)
          .post('/food/vendor/menu/menu_item')
          .set('Authorization', `Bearer ${vendor_token}`)
          .send({
            sub_category_id: 211,
            name: 'Paratha',
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
                max_limit: 5,
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
        expect(create_menu_item.statusCode).toBe(400);
        expect(create_menu_item.body.status).toBe(false);
        expect(create_menu_item.body.errors).toStrictEqual([
          {
            message:
              'restaurants registered with petpooja system can not take this action from speedyy apps',
            code: 2017,
          },
        ]);
      });
      test('Vendor Updating Menu Item', async () => {
        const update_menu_item = await request(server)
          .put('/food/vendor/menu/menu_item/12101')
          .set('Authorization', `Bearer ${vendor_token}`)
          .send({
            sub_category_id: 211,
            name: 'Parathas',
          });
        expect(update_menu_item.statusCode).toBe(400);
        expect(update_menu_item.body.status).toBe(false);
        expect(update_menu_item.body.errors).toStrictEqual([
          {
            message:
              'restaurants registered with petpooja system can not take this action from speedyy apps',
            code: 2017,
          },
        ]);
      });
      test('Vendor Adding Menu Item In Holiday Slot', async () => {
        const epoch = Math.floor(new Date().getTime() / 1000) + 86400;
        const add_in_holiday_slot = await request(server)
          .post('/food/vendor/menu/menu_item/12101/createHolidaySlot')
          .set('Authorization', `Bearer ${vendor_token}`)
          .send({
            end_epoch: epoch,
          });
        expect(add_in_holiday_slot.statusCode).toBe(400);
        expect(add_in_holiday_slot.body.status).toBe(false);
        expect(add_in_holiday_slot.body.errors).toStrictEqual([
          {
            message:
              'restaurants registered with petpooja system can not take this action from speedyy apps',
            code: 2017,
          },
        ]);
      });
      test('Vendor Deleting Menu Item', async () => {
        const delete_menu_item = await request(server)
          .delete('/food/vendor/menu/menu_item/12101')
          .set('Authorization', `Bearer ${vendor_token}`);
        expect(delete_menu_item.statusCode).toBe(400);
        expect(delete_menu_item.body.status).toBe(false);
        expect(delete_menu_item.body.errors).toStrictEqual([
          {
            message:
              'restaurants registered with petpooja system can not take this action from speedyy apps',
            code: 2017,
          },
        ]);
      });
      test('Vendor Reading Menu Item By Id | Need to allow it', async () => {
        const get_menu_item = await request(server)
          .get('/food/vendor/menu/menu_item/12101')
          .set('Authorization', `Bearer ${vendor_token}`);
        expect(get_menu_item.statusCode).toBe(200);
        expect(get_menu_item.body.status).toBe(true);
      });
    });
    describe('Admin', () => {
      test('Admin Creating Menu Item ', async () => {
        mockgetAdminDetails();
        const crreate_menu_item = await request(server)
          .post('/food/admin/menu/menu_item')
          .set('Authorization', `Bearer ${admin_token}`)
          .send({
            sub_category_id: 211,
            restaurant_id: pp_restaurant_id,
            name: 'Paratha',
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
                max_limit: 5,
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
        expect(crreate_menu_item.statusCode).toBe(400);
        expect(crreate_menu_item.body.status).toBe(false);
        expect(crreate_menu_item.body.errors).toStrictEqual([
          {
            message:
              'restaurants registered with petpooja system can not take this action from speedyy apps',
            code: 2017,
          },
        ]);
      });
      test('Admin Updating Menu Item', async () => {
        mockgetAdminDetails();
        const update_menu_item = await request(server)
          .put('/food/admin/menu/menu_item/12101')
          .set('Authorization', `Bearer ${admin_token}`)
          .send({
            sub_category_id: 211,
            restaurant_id: pp_restaurant_id,
          });
        expect(update_menu_item.statusCode).toBe(400);
        expect(update_menu_item.body.status).toBe(false);
        expect(update_menu_item.body.errors).toStrictEqual([
          {
            message: '"sub_category_id" is not allowed',
            code: 0,
          },
        ]);
      });
      test('Admin Updating Menu Item', async () => {
        mockgetAdminDetails();
        mockputMenuItemSQS();
        mocksaveS3File();
        mockGenerateDownloadFileURL();
        const update_menu_item = await request(server)
          .put('/food/admin/menu/menu_item/12101')
          .set('Authorization', `Bearer ${admin_token}`)
          .send({
            restaurant_id: pp_restaurant_id,
            image: {
              name: '6fc40636-f034-4267-81c9-c2537923dc7f.jpg',
            },
          });
        expect(update_menu_item.statusCode).toBe(200);
        expect(update_menu_item.body.status).toBe(true);
        expect(update_menu_item.body.result).toStrictEqual({
          addon_groups: [],
          allow_long_distance: true,
          description: 'description',
          disable: false,
          external_id: '123',
          image: {
            name: 'name',
            url: 'url',
          },
          is_deleted: false,
          is_spicy: true,
          item_cgst: 0,
          item_igst: 0,
          item_inclusive: true,
          item_sgst_utgst: 0,
          main_category_id: 21,
          main_category_name: 'main category name',
          menu_item_id: 12101,
          menu_item_name: 'menu item name',
          menu_item_slots: null,
          next_available_after: expect.anything(),
          packing_charges: 10,
          pos_id: '0003',
          pos_partner: 'petpooja',
          price: 100,
          restaurant_id: '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
          sequence: 0,
          serves_how_many: 1,
          service_charges: 10,
          sub_category_id: 211,
          sub_category_name: 'sub category name',
          variant_groups: null,
          veg_egg_non: 'veg',
          discount_rate: 0,
        });
      });
      test('Admin Adding Menu Item In Holiday Slot', async () => {
        mockgetAdminDetails();

        const epoch = Math.floor(new Date().getTime() / 1000) + 86400;

        const add_in_holiday_slot = await request(server)
          .post('/food/admin/menu/menu_item/12101/createHolidaySlot')
          .set('Authorization', `Bearer ${admin_token}`)
          .send({
            end_epoch: epoch,
          });
        expect(add_in_holiday_slot.statusCode).toBe(400);
        expect(add_in_holiday_slot.body.status).toBe(false);
        expect(add_in_holiday_slot.body.errors).toStrictEqual([
          {
            message:
              'restaurants registered with petpooja system can not take this action from speedyy apps',
            code: 2017,
          },
        ]);
      });
      test('Admin Deleting Menu Item', async () => {
        mockgetAdminDetails();
        const delete_menu_item = await request(server)
          .delete('/food/admin/menu/menu_item/12101')
          .set('Authorization', `Bearer ${admin_token}`);
        expect(delete_menu_item.statusCode).toBe(400);
        expect(delete_menu_item.body.status).toBe(false);
        expect(delete_menu_item.body.errors).toStrictEqual([
          {
            message:
              'restaurants registered with petpooja system can not take this action from speedyy apps',
            code: 2017,
          },
        ]);
      });
    });
  });
  describe('Addon Group', () => {
    describe('Vendor', () => {
      test('Vendor Creating Addon', async () => {
        const create_addon_group = await request(server)
          .post('/food/vendor/menu/addon_group')
          .set('Authorization', `Bearer ${vendor_token}`)
          .send({
            name: 'sweets',
          });
        expect(create_addon_group.statusCode).toBe(400);
        expect(create_addon_group.body.status).toBe(false);
        expect(create_addon_group.body.errors).toStrictEqual([
          {
            message:
              'restaurants registered with petpooja system can not take this action from speedyy apps',
            code: 2017,
          },
        ]);
      });
      test('Vendor Updating Addon', async () => {
        const update_addon_group = await request(server)
          .put('/food/vendor/menu/addon_group/12102')
          .set('Authorization', `Bearer ${vendor_token}`)
          .send({
            name: 'sweets',
          });
        expect(update_addon_group.statusCode).toBe(400);
        expect(update_addon_group.body.status).toBe(false);
        expect(update_addon_group.body.errors).toStrictEqual([
          {
            message:
              'restaurants registered with petpooja system can not take this action from speedyy apps',
            code: 2017,
          },
        ]);
      });
      test('Vendor Adding Addon In Stock', async () => {
        const addon_group_in_stock = await request(server)
          .post('/food/vendor/menu/addon_group/12102/in_stock')
          .set('Authorization', `Bearer ${vendor_token}`)
          .send({
            in_stock: false,
          });
        expect(addon_group_in_stock.statusCode).toBe(400);
        expect(addon_group_in_stock.body.status).toBe(false);
        expect(addon_group_in_stock.body.errors).toStrictEqual([
          {
            message:
              'restaurants registered with petpooja system can not take this action from speedyy apps',
            code: 2017,
          },
        ]);
      });
      test('Vendor Deleting Addon', async () => {
        const delete_addon_group = await request(server)
          .delete('/food/vendor/menu/addon_group/12102')
          .set('Authorization', `Bearer ${vendor_token}`);
        expect(delete_addon_group.statusCode).toBe(400);
        expect(delete_addon_group.body.status).toBe(false);
        expect(delete_addon_group.body.errors).toStrictEqual([
          {
            message:
              'restaurants registered with petpooja system can not take this action from speedyy apps',
            code: 2017,
          },
        ]);
      });
      test('Vendor Reading Addon By Addon Group Id | Need to allow it', async () => {
        const delete_menu_item = await request(server)
          .get('/food/vendor/menu/addon_group')
          .set('Authorization', `Bearer ${vendor_token}`);
        expect(delete_menu_item.statusCode).toBe(200);
        expect(delete_menu_item.body.status).toBe(true);
      });
    });
    describe('Admin', () => {
      test('Admin Creating Addon', async () => {
        mockgetAdminDetails();
        const crreate_menu_item = await request(server)
          .post('/food/admin/menu/addon_group')
          .set('Authorization', `Bearer ${admin_token}`)
          .send({
            restaurant_id: pp_restaurant_id,
            name: 'Sugar',
          });
        expect(crreate_menu_item.statusCode).toBe(400);
        expect(crreate_menu_item.body.status).toBe(false);
        expect(crreate_menu_item.body.errors).toStrictEqual([
          {
            message:
              'restaurants registered with petpooja system can not take this action from speedyy apps',
            code: 2017,
          },
        ]);
      });
      test('Admin Updating Addon', async () => {
        mockgetAdminDetails();
        const update_menu_item = await request(server)
          .put('/food/admin/menu/addon_group/12102')
          .set('Authorization', `Bearer ${admin_token}`)
          .send({
            name: 'Sweet',
          });
        expect(update_menu_item.statusCode).toBe(400);
        expect(update_menu_item.body.status).toBe(false);
        expect(update_menu_item.body.errors).toStrictEqual([
          {
            message:
              'restaurants registered with petpooja system can not take this action from speedyy apps',
            code: 2017,
          },
        ]);
      });
      test('Admin Adding Addon In Stock', async () => {
        mockgetAdminDetails();
        const add_in_stock = await request(server)
          .post('/food/admin/menu/addon_group/12102/in_stock')
          .set('Authorization', `Bearer ${admin_token}`)
          .send({
            in_stock: false,
          });
        expect(add_in_stock.statusCode).toBe(400);
        expect(add_in_stock.body.status).toBe(false);
        expect(add_in_stock.body.errors).toStrictEqual([
          {
            message:
              'restaurants registered with petpooja system can not take this action from speedyy apps',
            code: 2017,
          },
        ]);
      });
      test('Admin Deleting Addon', async () => {
        mockgetAdminDetails();
        const delete_menu_item = await request(server)
          .delete('/food/admin/menu/addon_group/12102')
          .set('Authorization', `Bearer ${admin_token}`);
        expect(delete_menu_item.statusCode).toBe(400);
        expect(delete_menu_item.body.status).toBe(false);
        expect(delete_menu_item.body.errors).toStrictEqual([
          {
            message:
              'restaurants registered with petpooja system can not take this action from speedyy apps',
            code: 2017,
          },
        ]);
      });
    });
  });
  describe('Addon', () => {
    describe('Vendor', () => {
      test('Vendor Creating Addon', async () => {
        const crreate_menu_item = await request(server)
          .post('/food/vendor/menu/addon')
          .set('Authorization', `Bearer ${vendor_token}`)
          .send({
            addon_group_id: 12102,
            name: 'sweets',
            sequence: 91,
            price: 12.5,
            veg_egg_non: 'veg',
            sgst_rate: 12.5,
            cgst_rate: 12.5,
            igst_rate: 12.5,
            gst_inclusive: true,
            external_id: 'ght-128978912bkj129',
          });
        expect(crreate_menu_item.statusCode).toBe(400);
        expect(crreate_menu_item.body.status).toBe(false);
        expect(crreate_menu_item.body.errors).toStrictEqual([
          {
            message:
              'restaurants registered with petpooja system can not take this action from speedyy apps',
            code: 2017,
          },
        ]);
      });
      test('Vendor Updating Addon', async () => {
        const update_menu_item = await request(server)
          .put('/food/vendor/menu/addon/12103')
          .set('Authorization', `Bearer ${vendor_token}`)
          .send({
            addon_group_id: 12102,
            name: 'Sweet',
          });
        expect(update_menu_item.statusCode).toBe(400);
        expect(update_menu_item.body.status).toBe(false);
        expect(update_menu_item.body.errors).toStrictEqual([
          {
            message:
              'restaurants registered with petpooja system can not take this action from speedyy apps',
            code: 2017,
          },
        ]);
      });
      test('Vendor Adding Addon In Stock', async () => {
        const add_in_stock = await request(server)
          .post('/food/vendor/menu/addon/12103/in_stock')
          .set('Authorization', `Bearer ${vendor_token}`)
          .send({
            in_stock: false,
          });
        expect(add_in_stock.statusCode).toBe(400);
        expect(add_in_stock.body.status).toBe(false);
        expect(add_in_stock.body.errors).toStrictEqual([
          {
            message:
              'restaurants registered with petpooja system can not take this action from speedyy apps',
            code: 2017,
          },
        ]);
      });
      test('Vendor Deleting Addon', async () => {
        const delete_addon = await request(server)
          .delete('/food/vendor/menu/addon/12103')
          .set('Authorization', `Bearer ${vendor_token}`);
        expect(delete_addon.statusCode).toBe(400);
        expect(delete_addon.body.status).toBe(false);
        expect(delete_addon.body.errors).toStrictEqual([
          {
            message:
              'restaurants registered with petpooja system can not take this action from speedyy apps',
            code: 2017,
          },
        ]);
      });
      test('Vendor Reading Addon By ID', async () => {
        const read_addon = await request(server)
          .get('/food/vendor/menu/addon?addon_group_id=' + 12102)
          .set('Authorization', `Bearer ${vendor_token}`);
        expect(read_addon.statusCode).toBe(200);
        expect(read_addon.body.status).toBe(true);
      });
    });
    describe('Admin', () => {
      test('Admin Creating Addon', async () => {
        mockgetAdminDetails();
        const create_menu_item = await request(server)
          .post('/food/admin/menu/addon')
          .set('Authorization', `Bearer ${admin_token}`)
          .send({
            addon_group_id: 12102,
            name: 'Sugar',
            sequence: 91,
            price: 12.5,
            veg_egg_non: 'veg',
            sgst_rate: 12.5,
            cgst_rate: 12.5,
            igst_rate: 12.5,
            gst_inclusive: true,
            external_id: 'ght-128978912bkj129',
          });
        expect(create_menu_item.statusCode).toBe(400);
        expect(create_menu_item.body.status).toBe(false);
        expect(create_menu_item.body.errors).toStrictEqual([
          {
            message:
              'restaurants registered with petpooja system can not take this action from speedyy apps',
            code: 2017,
          },
        ]);
      });
      test('Admin Updating Addon', async () => {
        mockgetAdminDetails();
        const update_menu_item = await request(server)
          .put('/food/admin/menu/addon/12103')
          .set('Authorization', `Bearer ${admin_token}`)
          .send({
            addon_group_id: 12102,
            name: 'Sweet',
          });
        expect(update_menu_item.statusCode).toBe(400);
        expect(update_menu_item.body.status).toBe(false);
        expect(update_menu_item.body.errors).toStrictEqual([
          {
            message:
              'restaurants registered with petpooja system can not take this action from speedyy apps',
            code: 2017,
          },
        ]);
      });
      test('Admin Adding Addon In Stock', async () => {
        mockgetAdminDetails();
        const addon_in_stock = await request(server)
          .post('/food/admin/menu/addon/12103/in_stock')
          .set('Authorization', `Bearer ${admin_token}`)
          .send({
            in_stock: false,
          });
        expect(addon_in_stock.statusCode).toBe(400);
        expect(addon_in_stock.body.status).toBe(false);
        expect(addon_in_stock.body.errors).toStrictEqual([
          {
            message:
              'restaurants registered with petpooja system can not take this action from speedyy apps',
            code: 2017,
          },
        ]);
      });
      test('Admin Deleting Addon', async () => {
        mockgetAdminDetails();
        const delete_addon = await request(server)
          .delete('/food/admin/menu/addon/12103')
          .set('Authorization', `Bearer ${admin_token}`);
        expect(delete_addon.statusCode).toBe(400);
        expect(delete_addon.body.status).toBe(false);
        expect(delete_addon.body.errors).toStrictEqual([
          {
            message:
              'restaurants registered with petpooja system can not take this action from speedyy apps',
            code: 2017,
          },
        ]);
      });
    });
  });
  describe('Main Category', () => {
    describe('Vendor', () => {
      test('Vendor Creating Main Category', async () => {
        const crreate_menu_item = await request(server)
          .post('/food/vendor/menu/main_category')
          .set('Authorization', `Bearer ${vendor_token}`)
          .send({name: 'sweets'});
        expect(crreate_menu_item.statusCode).toBe(400);
        expect(crreate_menu_item.body.status).toBe(false);
        expect(crreate_menu_item.body.errors).toStrictEqual([
          {
            message:
              'restaurants registered with petpooja system can not take this action from speedyy apps',
            code: 2017,
          },
        ]);
      });
      test('Vendor Updating Main Category', async () => {
        const update_menu_item = await request(server)
          .put('/food/vendor/menu/main_category/21')
          .set('Authorization', `Bearer ${vendor_token}`)
          .send({
            name: 'Sweet',
          });
        expect(update_menu_item.statusCode).toBe(400);
        expect(update_menu_item.body.status).toBe(false);
        expect(update_menu_item.body.errors).toStrictEqual([
          {
            message:
              'restaurants registered with petpooja system can not take this action from speedyy apps',
            code: 2017,
          },
        ]);
      });
      test('Vendor Adding Main Category In Holiday Slot', async () => {
        const epoch = Math.floor(new Date().getTime() / 1000) + 86400;
        const add_in_stock = await request(server)
          .post('/food/vendor/menu/main_category/21/createHolidaySlot')
          .set('Authorization', `Bearer ${vendor_token}`)
          .send({
            end_epoch: epoch,
          });
        expect(add_in_stock.statusCode).toBe(400);
        expect(add_in_stock.body.status).toBe(false);
        expect(add_in_stock.body.errors).toStrictEqual([
          {
            message:
              'restaurants registered with petpooja system can not take this action from speedyy apps',
            code: 2017,
          },
        ]);
      });
      test('Vendor Deleting Main Category', async () => {
        const delete_menu_item = await request(server)
          .delete('/food/vendor/menu/main_category/21')
          .set('Authorization', `Bearer ${vendor_token}`);
        expect(delete_menu_item.statusCode).toBe(400);
        expect(delete_menu_item.body.status).toBe(false);
        expect(delete_menu_item.body.errors).toStrictEqual([
          {
            message:
              'restaurants registered with petpooja system can not take this action from speedyy apps',
            code: 2017,
          },
        ]);
      });
      test('Vendor Reading Main Category By Id', async () => {
        const read_menu_item = await request(server)
          .get('/food/vendor/menu/main_category')
          .set('Authorization', `Bearer ${vendor_token}`);
        expect(read_menu_item.statusCode).toBe(200);
        expect(read_menu_item.body.status).toBe(true);
      });
    });
    describe('Admin', () => {
      test('Admin Creating Main Category', async () => {
        mockgetAdminDetails();
        const crreate_menu_item = await request(server)
          .post('/food/admin/menu/main_category')
          .set('Authorization', `Bearer ${admin_token}`)
          .send({
            restaurant_id: pp_restaurant_id,
            name: 'Sugar',
          });
        expect(crreate_menu_item.statusCode).toBe(400);
        expect(crreate_menu_item.body.status).toBe(false);
        expect(crreate_menu_item.body.errors).toStrictEqual([
          {
            message:
              'restaurants registered with petpooja system can not take this action from speedyy apps',
            code: 2017,
          },
        ]);
      });
      test('Admin Updating Main Category', async () => {
        mockgetAdminDetails();
        const update_menu_item = await request(server)
          .put('/food/admin/menu/main_category/21')
          .set('Authorization', `Bearer ${admin_token}`)
          .send({
            name: 'Sweet',
          });
        expect(update_menu_item.statusCode).toBe(400);
        expect(update_menu_item.body.status).toBe(false);
        expect(update_menu_item.body.errors).toStrictEqual([
          {
            message:
              'restaurants registered with petpooja system can not take this action from speedyy apps',
            code: 2017,
          },
        ]);
      });
      test('Admin Adding Main Category In Stock', async () => {
        mockgetAdminDetails();

        const epoch = Math.floor(new Date().getTime() / 1000) + 86400;

        const add_in_stock = await request(server)
          .post('/food/admin/menu/main_category/21/createHolidaySlot')
          .set('Authorization', `Bearer ${admin_token}`)
          .send({
            end_epoch: epoch,
          });
        expect(add_in_stock.statusCode).toBe(400);
        expect(add_in_stock.body.status).toBe(false);
        expect(add_in_stock.body.errors).toStrictEqual([
          {
            message:
              'restaurants registered with petpooja system can not take this action from speedyy apps',
            code: 2017,
          },
        ]);
      });
      test('Admin Deleting Main Category', async () => {
        mockgetAdminDetails();
        const delete_menu_item = await request(server)
          .delete('/food/admin/menu/main_category/21')
          .set('Authorization', `Bearer ${admin_token}`);
        expect(delete_menu_item.statusCode).toBe(400);
        expect(delete_menu_item.body.status).toBe(false);
        expect(delete_menu_item.body.errors).toStrictEqual([
          {
            message:
              'restaurants registered with petpooja system can not take this action from speedyy apps',
            code: 2017,
          },
        ]);
      });
    });
  });
  describe('Sub Category', () => {
    describe('Vendor', () => {
      test('Vendor Creating Sub Category', async () => {
        const crreate_menu_item = await request(server)
          .post('/food/vendor/menu/sub_category')
          .set('Authorization', `Bearer ${vendor_token}`)
          .send({
            main_category_id: 21,
            name: 'sweets',
          });
        expect(crreate_menu_item.statusCode).toBe(400);
        expect(crreate_menu_item.body.status).toBe(false);
        expect(crreate_menu_item.body.errors).toStrictEqual([
          {
            message:
              'restaurants registered with petpooja system can not take this action from speedyy apps',
            code: 2017,
          },
        ]);
      });
      test('Vendor Updating Sub Category', async () => {
        const update_menu_item = await request(server)
          .put('/food/vendor/menu/sub_category/211')
          .set('Authorization', `Bearer ${vendor_token}`)
          .send({
            main_category_id: 21,
            name: 'Sweet',
          });
        expect(update_menu_item.statusCode).toBe(400);
        expect(update_menu_item.body.status).toBe(false);
        expect(update_menu_item.body.errors).toStrictEqual([
          {
            message:
              'restaurants registered with petpooja system can not take this action from speedyy apps',
            code: 2017,
          },
        ]);
      });
      test('Vendor Adding Sub Category In Holiday Slot', async () => {
        const epoch = Math.floor(new Date().getTime() / 1000) + 86400;
        const add_in_stock = await request(server)
          .post('/food/vendor/menu/sub_category/211/createHolidaySlot')
          .set('Authorization', `Bearer ${vendor_token}`)
          .send({
            end_epoch: epoch,
          });
        expect(add_in_stock.statusCode).toBe(400);
        expect(add_in_stock.body.status).toBe(false);
        expect(add_in_stock.body.errors).toStrictEqual([
          {
            message:
              'restaurants registered with petpooja system can not take this action from speedyy apps',
            code: 2017,
          },
        ]);
      });
      test('Vendor Deleting Sub Category', async () => {
        const delete_menu_item = await request(server)
          .delete('/food/vendor/menu/sub_category/211')
          .set('Authorization', `Bearer ${vendor_token}`);
        expect(delete_menu_item.statusCode).toBe(400);
        expect(delete_menu_item.body.status).toBe(false);
        expect(delete_menu_item.body.errors).toStrictEqual([
          {
            message:
              'restaurants registered with petpooja system can not take this action from speedyy apps',
            code: 2017,
          },
        ]);
      });
      test('Vendor Reading Sub Category', async () => {
        const delete_menu_item = await request(server)
          .get('/food/vendor/menu/sub_category?main_category_id=21')
          .set('Authorization', `Bearer ${vendor_token}`);
        expect(delete_menu_item.statusCode).toBe(200);
        expect(delete_menu_item.body.status).toBe(true);
      });
    });
    describe('Admin', () => {
      test('Admin Creating Sub Category', async () => {
        mockgetAdminDetails();
        const crreate_menu_item = await request(server)
          .post('/food/admin/menu/sub_category')
          .set('Authorization', `Bearer ${admin_token}`)
          .send({
            main_category_id: 21,
            name: 'Sugar',
          });
        expect(crreate_menu_item.statusCode).toBe(400);
        expect(crreate_menu_item.body.status).toBe(false);
        expect(crreate_menu_item.body.errors).toStrictEqual([
          {
            message:
              'restaurants registered with petpooja system can not take this action from speedyy apps',
            code: 2017,
          },
        ]);
      });
      test('Admin Updating Sub Category', async () => {
        mockgetAdminDetails();
        const update_menu_item = await request(server)
          .put('/food/admin/menu/sub_category/211')
          .set('Authorization', `Bearer ${admin_token}`)
          .send({
            main_category_id: 21,
            name: 'Sweet',
          });
        expect(update_menu_item.statusCode).toBe(400);
        expect(update_menu_item.body.status).toBe(false);
        expect(update_menu_item.body.errors).toStrictEqual([
          {
            message:
              'restaurants registered with petpooja system can not take this action from speedyy apps',
            code: 2017,
          },
        ]);
      });
      test('Admin Adding Sub Category In Stock', async () => {
        mockgetAdminDetails();
        const epoch = Math.floor(new Date().getTime() / 1000) + 86400;
        const add_in_stock = await request(server)
          .post('/food/admin/menu/sub_category/211/createHolidaySlot')
          .set('Authorization', `Bearer ${admin_token}`)
          .send({
            end_epoch: epoch,
          });
        expect(add_in_stock.statusCode).toBe(400);
        expect(add_in_stock.body.status).toBe(false);
        expect(add_in_stock.body.errors).toStrictEqual([
          {
            message:
              'restaurants registered with petpooja system can not take this action from speedyy apps',
            code: 2017,
          },
        ]);
      });
      test('Admin Deleting Sub Category', async () => {
        mockgetAdminDetails();
        const delete_menu_item = await request(server)
          .delete('/food/admin/menu/sub_category/211')
          .set('Authorization', `Bearer ${admin_token}`);
        expect(delete_menu_item.statusCode).toBe(400);
        expect(delete_menu_item.body.status).toBe(false);
        expect(delete_menu_item.body.errors).toStrictEqual([
          {
            message:
              'restaurants registered with petpooja system can not take this action from speedyy apps',
            code: 2017,
          },
        ]);
      });
    });
  });
});
