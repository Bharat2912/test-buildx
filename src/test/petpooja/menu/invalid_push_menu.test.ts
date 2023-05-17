import request from 'supertest';
import {Application} from 'express';
import {createTestServer} from '../../utils/init';
import {
  loadMockSeedData,
  signToken,
  testCasesClosingTasks,
} from '../../utils/utils';
import {DB} from '../../../data/knex';
import {PETPOOJA_TEST_MENU} from '../constant';
import {
  PetPoojaPackagingApplicableOn,
  PetPoojaPackagingChargeType,
} from '../../../module/food/petpooja/enum';
import {mockEsIndexData, mockSendSQSMessage} from '../../utils/mock_services';
import {pp_restaurant_id} from '../common';

jest.mock('axios');

let server: Application;
const petpooja_token = 'petpooja_token';
let vendor_token: string;

beforeAll(async () => {
  server = await createTestServer();
  vendor_token = signToken({
    id: '33c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
    data: {
      type: 'restaurant',
      outlet_id: '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
      force_reset_password: false,
    },
    user_type: 'vendor',
  });
  await loadMockSeedData('restaurant');
});

afterAll(async () => {
  await testCasesClosingTasks();
});

describe('Petpooja Push Menu Test Cases', () => {
  describe('Restaurant', () => {
    test('Empty menusharingcode | Need to throw error ', async () => {
      PETPOOJA_TEST_MENU.restaurants[0].details.menusharingcode = '';
      const response = await request(server)
        .post('/food/callback/petpooja/push_menu')
        .set('Authorization', `Bearer ${petpooja_token}`)
        .send(PETPOOJA_TEST_MENU);
      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe(false);
      expect(response.body.errors).toStrictEqual([
        {message: 'restaurant not found', code: 0},
      ]);
      PETPOOJA_TEST_MENU.restaurants[0].details.menusharingcode = 'ps82kz7f';
    });
    test('Sending Valid packaging_applicable_on to Be NONE', async () => {
      const mock_es_index_data = mockEsIndexData();
      PETPOOJA_TEST_MENU.restaurants[0].details.packaging_applicable_on =
        PetPoojaPackagingApplicableOn.NONE;
      const response = await request(server)
        .post('/food/callback/petpooja/push_menu')
        .set('Authorization', `Bearer ${petpooja_token}`)
        .send(PETPOOJA_TEST_MENU);
      expect(response.body).toStrictEqual({
        success: '1',
        message: 'Menu items are successfully listed.',
      });
      expect(mock_es_index_data).toHaveBeenCalled();
      const petpooja_restaurant_details = await DB.read('restaurant').where({
        pos_id: 'ps82kz7f',
      });
      expect(petpooja_restaurant_details[0].packing_charge_type).toBe('none');
    });
    test('Sending packaging_applicable_on Order| calculatetaxonpacking to false | Expect Sgst and Cgst to be 0', async () => {
      const mock_es_index_data = mockEsIndexData();
      PETPOOJA_TEST_MENU.restaurants[0].details.calculatetaxonpacking = 0;
      PETPOOJA_TEST_MENU.restaurants[0].details.packaging_applicable_on =
        PetPoojaPackagingApplicableOn.ORDER;
      PETPOOJA_TEST_MENU.restaurants[0].details.pc_taxes_id = '1983,1984';
      const packaging_applicable_on_response = await request(server)
        .post('/food/callback/petpooja/push_menu')
        .set('Authorization', `Bearer ${petpooja_token}`)
        .send(PETPOOJA_TEST_MENU);
      expect(packaging_applicable_on_response.body).toStrictEqual({
        success: '1',
        message: 'Menu items are successfully listed.',
      });
      expect(mock_es_index_data).toHaveBeenCalled();
      const petpooja_restaurant_details = await DB.read('restaurant').where({
        pos_id: 'ps82kz7f',
      });

      expect(petpooja_restaurant_details[0].packing_sgst_utgst).toBe(0);
      expect(petpooja_restaurant_details[0].packing_cgst).toBe(0);
      expect(petpooja_restaurant_details[0].packing_charge_type).toBe('order');
      expect(petpooja_restaurant_details[0].taxes_applicable_on_packing).toBe(
        false
      );
    });
    test('Sending Valid packaging_applicable_on Order | calculatetaxonpacking to true | Expect Sgst and Cgst to be 2.5', async () => {
      const mock_es_index_data = mockEsIndexData();

      PETPOOJA_TEST_MENU.restaurants[0].details.calculatetaxonpacking = 1;
      PETPOOJA_TEST_MENU.restaurants[0].details.packaging_applicable_on =
        PetPoojaPackagingApplicableOn.ORDER;
      PETPOOJA_TEST_MENU.restaurants[0].details.pc_taxes_id = '1983,1984';

      const packaging_applicable_on_response = await request(server)
        .post('/food/callback/petpooja/push_menu')
        .set('Authorization', `Bearer ${petpooja_token}`)
        .send(PETPOOJA_TEST_MENU);
      expect(packaging_applicable_on_response.body).toStrictEqual({
        success: '1',
        message: 'Menu items are successfully listed.',
      });
      expect(mock_es_index_data).toHaveBeenCalled();

      const petpooja_restaurant_details = await DB.read('restaurant').where({
        pos_id: 'ps82kz7f',
      });
      expect(petpooja_restaurant_details[0].packing_sgst_utgst).toBe(2.5);
      expect(petpooja_restaurant_details[0].packing_cgst).toBe(2.5);
      expect(petpooja_restaurant_details[0].packing_charge_type).toBe('order');
      expect(petpooja_restaurant_details[0].taxes_applicable_on_packing).toBe(
        true
      );

      /// Making Sgst and Cgst to 0

      PETPOOJA_TEST_MENU.restaurants[0].details.calculatetaxonpacking = 0;
      const packaging_applicable_off_response = await request(server)
        .post('/food/callback/petpooja/push_menu')
        .set('Authorization', `Bearer ${petpooja_token}`)
        .send(PETPOOJA_TEST_MENU);
      expect(packaging_applicable_off_response.body).toStrictEqual({
        success: '1',
        message: 'Menu items are successfully listed.',
      });

      const sgst_cgst_details = await DB.read('restaurant').where({
        pos_id: 'ps82kz7f',
      });
      expect(sgst_cgst_details[0].packing_sgst_utgst).toBe(0);
      expect(sgst_cgst_details[0].packing_cgst).toBe(0);
      expect(sgst_cgst_details[0].packing_charge_type).toBe('order');
      expect(sgst_cgst_details[0].taxes_applicable_on_packing).toBe(false);
    });
    test('Sending Valid packaging_applicable_on Item false | Expect Sgst and Cgst to be 0', async () => {
      const mock_es_index_data = mockEsIndexData();

      PETPOOJA_TEST_MENU.restaurants[0].details.calculatetaxonpacking = 0;
      PETPOOJA_TEST_MENU.restaurants[0].details.packaging_applicable_on =
        PetPoojaPackagingApplicableOn.ITEM;
      PETPOOJA_TEST_MENU.restaurants[0].details.pc_taxes_id = '1983,1984';

      const packaging_applicable_on_response = await request(server)
        .post('/food/callback/petpooja/push_menu')
        .set('Authorization', `Bearer ${petpooja_token}`)
        .send(PETPOOJA_TEST_MENU);
      expect(packaging_applicable_on_response.body).toStrictEqual({
        success: '1',
        message: 'Menu items are successfully listed.',
      });
      expect(mock_es_index_data).toHaveBeenCalled();
      const petpooja_restaurant_details = await DB.read('restaurant').where({
        pos_id: 'ps82kz7f',
      });
      expect(petpooja_restaurant_details[0].packing_sgst_utgst).toBe(0);
      expect(petpooja_restaurant_details[0].packing_cgst).toBe(0);
      expect(petpooja_restaurant_details[0].taxes_applicable_on_packing).toBe(
        false
      );
      expect(petpooja_restaurant_details[0].packing_charge_type).toBe('item');
    });
    test('Sending Valid packaging_applicable_on Item true | Expect Sgst and Cgst to be 2.5', async () => {
      const mock_es_index_data = mockEsIndexData();
      PETPOOJA_TEST_MENU.restaurants[0].details.calculatetaxonpacking = 1;
      PETPOOJA_TEST_MENU.restaurants[0].details.packaging_applicable_on =
        PetPoojaPackagingApplicableOn.ITEM;
      PETPOOJA_TEST_MENU.restaurants[0].details.pc_taxes_id = '1983,1984';
      const packaging_applicable_on_response = await request(server)
        .post('/food/callback/petpooja/push_menu')
        .set('Authorization', `Bearer ${petpooja_token}`)
        .send(PETPOOJA_TEST_MENU);
      expect(packaging_applicable_on_response.body).toStrictEqual({
        success: '1',
        message: 'Menu items are successfully listed.',
      });
      expect(mock_es_index_data).toHaveBeenCalled();
      const petpooja_restaurant_details = await DB.read('restaurant').where({
        pos_id: 'ps82kz7f',
      });

      expect(petpooja_restaurant_details[0].packing_sgst_utgst).toBe(2.5);
      expect(petpooja_restaurant_details[0].packing_cgst).toBe(2.5);
      expect(petpooja_restaurant_details[0].packing_charge_type).toBe('item');
    });
    test('Sending packaging_charge_type to fixed', async () => {
      const mock_es_index_data = mockEsIndexData();
      PETPOOJA_TEST_MENU.restaurants[0].details.packaging_charge_type =
        PetPoojaPackagingChargeType.FIXED;
      const response = await request(server)
        .post('/food/callback/petpooja/push_menu')
        .set('Authorization', `Bearer ${petpooja_token}`)
        .send(PETPOOJA_TEST_MENU);
      expect(response.body).toStrictEqual({
        success: '1',
        message: 'Menu items are successfully listed.',
      });
      expect(mock_es_index_data).toHaveBeenCalled();
      const petpooja_restaurant_details = await DB.read('restaurant').where({
        pos_id: 'ps82kz7f',
      });

      expect(petpooja_restaurant_details[0].packing_charge_fixed_percent).toBe(
        'fixed'
      );
    });
    test('Sending packaging_charge_type to percentage', async () => {
      const mock_es_index_data = mockEsIndexData();
      PETPOOJA_TEST_MENU.restaurants[0].details.packaging_charge_type =
        PetPoojaPackagingChargeType.PERCENTAGE;
      const response = await request(server)
        .post('/food/callback/petpooja/push_menu')
        .set('Authorization', `Bearer ${petpooja_token}`)
        .send(PETPOOJA_TEST_MENU);
      expect(response.body).toStrictEqual({
        success: '1',
        message: 'Menu items are successfully listed.',
      });
      expect(mock_es_index_data).toHaveBeenCalled();
      const petpooja_restaurant_details = await DB.read('restaurant').where({
        pos_id: 'ps82kz7f',
      });

      expect(petpooja_restaurant_details[0].packing_charge_fixed_percent).toBe(
        'percent'
      );
    });
  });
  describe('Parent Category (Main Category)', () => {
    test('Sending Invalid parent_category_id| Need to throw error ', async () => {
      mockSendSQSMessage();
      PETPOOJA_TEST_MENU.categories[0].parent_category_id = '50000';
      const response = await request(server)
        .post('/food/callback/petpooja/push_menu')
        .set('Authorization', `Bearer ${petpooja_token}`)
        .send(PETPOOJA_TEST_MENU);
      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe(false);
      expect(response.body.errors[0].message).toBe(
        'main category not found while processing petpooja sub category Pizza'
      );
      expect(response.body.errors[0].code).toBe(2019);
    });
    test('Sending Valid parent_category_id', async () => {
      PETPOOJA_TEST_MENU.categories[0].parent_category_id = '0';
      const response = await request(server)
        .post('/food/callback/petpooja/push_menu')
        .set('Authorization', `Bearer ${petpooja_token}`)
        .send(PETPOOJA_TEST_MENU);
      expect(response.body).toStrictEqual({
        success: '1',
        message: 'Menu items are successfully listed.',
      });
    });
  });
  describe('Categories (Sub Category)', () => {
    test('Sending Invalid parent_category_id| Need to throw error ', async () => {
      PETPOOJA_TEST_MENU.categories[0].parent_category_id = '50000';
      const response = await request(server)
        .post('/food/callback/petpooja/push_menu')
        .set('Authorization', `Bearer ${petpooja_token}`)
        .send(PETPOOJA_TEST_MENU);
      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe(false);
      expect(response.body.errors[0].message).toBe(
        'main category not found while processing petpooja sub category Pizza'
      );
      expect(response.body.errors[0].code).toBe(2019);
      PETPOOJA_TEST_MENU.categories[0].parent_category_id = '1';
    });
    test('Sending Valid active_status', async () => {
      PETPOOJA_TEST_MENU.categories[0].active = '0';
      const response = await request(server)
        .post('/food/callback/petpooja/push_menu')
        .set('Authorization', `Bearer ${petpooja_token}`)
        .send(PETPOOJA_TEST_MENU);
      expect(response.body).toStrictEqual({
        success: '1',
        message: 'Menu items are successfully listed.',
      });
    });
  });
  describe('Addon', () => {
    const end_time = new Date();
    end_time.setMonth(2);
    end_time.setDate(30);
    end_time.setFullYear(end_time.getUTCFullYear() + 1);
    end_time.setHours(18);
    end_time.setMinutes(0);
    end_time.setSeconds(0);
    end_time.setMilliseconds(0);
    //Sending Addon Out Of Stock | restID key is not added then 500 error thrown
    test('Sending Addon Out Of Stock | Vadlid Request Body', async () => {
      // addon is not showing out of stock

      end_time.setFullYear(end_time.getUTCFullYear() + 1);

      const addon_out_of_stock = await request(server)
        .post('/food/callback/petpooja/item_out_of_stock')
        .set('Authorization', `Bearer ${petpooja_token}`)
        .send({
          restID: 'ps82kz7f',
          type: 'addon',
          inStock: false,
          itemID: ['28411'],
          autoTurnOnTime: 'custom',
          customTurnOnTime: '2025-03-30 18:00',
        });
      expect(addon_out_of_stock.body.status).toBe('success');
      expect(addon_out_of_stock.body.message).toBe(
        'Stock status updated successfully'
      );
      const read_addon = await DB.read.from('addon').where({pos_id: '28411'});
      expect(read_addon[0].next_available_after.toISOString()).toEqual(
        end_time.toISOString()
      );

      const get_addon_by_id = await request(server)
        .get('/food/vendor/menu/addon?addon_group_id=1')
        .set('Authorization', `Bearer ${vendor_token}`);
      expect(get_addon_by_id.body.status).toBe(true);
      expect(get_addon_by_id.statusCode).toBe(200);
      expect(get_addon_by_id.body.result[0].id).toBe(1);
      const next_available_after = new Date(
        get_addon_by_id.body.result[0].next_available_after
      );
      expect(next_available_after.toISOString()).toBe(end_time.toISOString());
    });
    test('Sending Addon In Of Stock | Vadlid Request Body', async () => {
      end_time.setFullYear(end_time.getUTCFullYear() - 1);
      const addon_in_stock = await request(server)
        .post('/food/callback/petpooja/item_out_of_stock')
        .set('Authorization', `Bearer ${petpooja_token}`)
        .send({
          restID: 'ps82kz7f',
          type: 'addon',
          inStock: true,
          itemID: ['28411'],
          autoTurnOnTime: 'custom',
          customTurnOnTime: '2024-03-30 18:00',
        });
      expect(addon_in_stock.body.status).toBe('success');
      expect(addon_in_stock.body.message).toBe(
        'Stock status updated successfully'
      );

      const read_addon = await DB.read.from('addon').where({pos_id: '28411'});
      expect(read_addon[0].next_available_after.toISOString()).toEqual(
        end_time.toISOString()
      );

      const get_addon_by_id = await request(server)
        .get('/food/vendor/menu/addon?addon_group_id=1')
        .set('Authorization', `Bearer ${vendor_token}`);
      expect(get_addon_by_id.body.status).toBe(true);
      expect(get_addon_by_id.statusCode).toBe(200);
      expect(get_addon_by_id.body.result[0].id).toBe(1);
      const next_available_after = new Date(
        get_addon_by_id.body.result[0].next_available_after
      );
      expect(next_available_after.toISOString()).toBe(end_time.toISOString());
    });
    test('Sending Addon Out Of Stock By Push Menu | In Stock By API', async () => {
      PETPOOJA_TEST_MENU.addongroups[0].addongroupitems[2].active = '0';
      const mock_es_index_data = mockEsIndexData();
      const response = await request(server)
        .post('/food/callback/petpooja/push_menu')
        .set('Authorization', `Bearer ${petpooja_token}`)
        .send(PETPOOJA_TEST_MENU);
      expect(response.body).toStrictEqual({
        success: '1',
        message: 'Menu items are successfully listed.',
      });
      expect(mock_es_index_data).toHaveBeenCalled();

      const read_addon = await DB.read.from('addon').where({pos_id: '28415'});
      expect(read_addon[0].in_stock).toBe(false);

      const get_addon_by_id = await request(server)
        .get('/food/vendor/menu/addon?addon_group_id=1')
        .set('Authorization', `Bearer ${vendor_token}`);
      expect(get_addon_by_id.body.status).toBe(true);
      expect(get_addon_by_id.statusCode).toBe(200);
      expect(get_addon_by_id.body.result[2].id).toBe(3);
      expect(get_addon_by_id.body.result[2].in_stock).toBe(false);

      /// Adding Addon in by in_Stock api

      const addon_in_stock = await request(server)
        .post('/food/callback/petpooja/item_out_of_stock')
        .set('Authorization', `Bearer ${petpooja_token}`)
        .send({
          restID: 'ps82kz7f',
          type: 'addon',
          inStock: true,
          itemID: ['28415'],
          autoTurnOnTime: 'custom',
          customTurnOnTime: '2024-03-30 18:00',
        });
      expect(addon_in_stock.body.status).toBe('success');
      expect(addon_in_stock.body.message).toBe(
        'Stock status updated successfully'
      );

      end_time.setFullYear(end_time.getUTCFullYear());

      const reading_in_stock_addon = await DB.read
        .from('addon')
        .where({pos_id: '28415'});
      expect(
        reading_in_stock_addon[0].next_available_after.toISOString()
      ).toEqual(end_time.toISOString());

      const get_in_stock_addon_by_id = await request(server)
        .get('/food/vendor/menu/addon?addon_group_id=1')
        .set('Authorization', `Bearer ${vendor_token}`);
      expect(get_in_stock_addon_by_id.body.status).toBe(true);
      expect(get_in_stock_addon_by_id.statusCode).toBe(200);
      expect(get_in_stock_addon_by_id.body.result[2].id).toBe(3);
      expect(get_in_stock_addon_by_id.body.result[2].in_stock).toBe(false);
      const next_available_after = new Date(
        get_in_stock_addon_by_id.body.result[0].next_available_after
      );
      expect(next_available_after.toISOString()).toBe(end_time.toISOString());
    });
    test('Sending Addon Out Of Stock By API | In stock by push menu', async () => {
      const addon_in_stock = await request(server)
        .post('/food/callback/petpooja/item_out_of_stock')
        .set('Authorization', `Bearer ${petpooja_token}`)
        .send({
          restID: 'ps82kz7f',
          type: 'addon',
          inStock: false,
          itemID: ['28415'],
          autoTurnOnTime: 'custom',
          customTurnOnTime: '2024-03-30 18:00',
        });
      expect(addon_in_stock.body.status).toBe('success');
      expect(addon_in_stock.body.message).toBe(
        'Stock status updated successfully'
      );

      end_time.setFullYear(end_time.getUTCFullYear());

      const reading_in_stock_addon = await DB.read
        .from('addon')
        .where({pos_id: '28415'});
      expect(
        reading_in_stock_addon[0].next_available_after.toISOString()
      ).toEqual(end_time.toISOString());

      const get_in_stock_addon_by_id = await request(server)
        .get('/food/vendor/menu/addon?addon_group_id=1')
        .set('Authorization', `Bearer ${vendor_token}`);
      expect(get_in_stock_addon_by_id.body.status).toBe(true);
      expect(get_in_stock_addon_by_id.statusCode).toBe(200);
      expect(get_in_stock_addon_by_id.body.result[2].id).toBe(3);
      expect(get_in_stock_addon_by_id.body.result[2].in_stock).toBe(false);
      const next_available_after = new Date(
        get_in_stock_addon_by_id.body.result[0].next_available_after
      );
      expect(next_available_after.toISOString()).toBe(end_time.toISOString());

      ///Adding Addon Instock by Push Menu

      PETPOOJA_TEST_MENU.addongroups[0].addongroupitems[2].active = '1';
      const mock_es_index_data = mockEsIndexData();
      const response = await request(server)
        .post('/food/callback/petpooja/push_menu')
        .set('Authorization', `Bearer ${petpooja_token}`)
        .send(PETPOOJA_TEST_MENU);
      expect(response.body).toStrictEqual({
        success: '1',
        message: 'Menu items are successfully listed.',
      });
      expect(mock_es_index_data).toHaveBeenCalled();

      const read_addon = await DB.read.from('addon').where({pos_id: '28415'});
      expect(read_addon[0].in_stock).toBe(true);

      const get_addon_by_id = await request(server)
        .get('/food/vendor/menu/addon?addon_group_id=1')
        .set('Authorization', `Bearer ${vendor_token}`);
      expect(get_addon_by_id.body.status).toBe(true);
      expect(get_addon_by_id.statusCode).toBe(200);
      expect(get_addon_by_id.body.result[2].id).toBe(3);
      expect(get_addon_by_id.body.result[2].in_stock).toBe(true);
    });
  });
  describe('Items', () => {
    test('Sending Menu Item Out Of Stock', async () => {
      const read_menu_item_before_out_of_stock = await DB.read
        .from('menu_item')
        .where({pos_id: '10464639'});
      expect(read_menu_item_before_out_of_stock[0].next_available_after).toBe(
        null
      );

      // if restID is not added in request it throws 500 error
      const item_out_of_stock = await request(server)
        .post('/food/callback/petpooja/item_out_of_stock')
        .set('Authorization', `Bearer ${petpooja_token}`)
        .send({
          restID: 'ps82kz7f',
          type: 'item',
          inStock: false,
          itemID: ['10464639'],
          autoTurnOnTime: 'custom',
          customTurnOnTime: '2024-02-24 18:00',
        });
      expect(item_out_of_stock.body.status).toBe('success');
      expect(item_out_of_stock.body.message).toBe(
        'Stock status updated successfully'
      );

      const read_menu_item = await DB.read
        .from('menu_item')
        .where({pos_id: '10464639'});
      expect(read_menu_item[0].next_available_after).not.toBe(null);

      const get_menu = await request(server)
        .get('/food/vendor/menu')
        .set('Authorization', `Bearer ${vendor_token}`);
      expect(get_menu.body.status).toBe(true);
      expect(get_menu.statusCode).toBe(200);
      expect(get_menu.body.result[0].sub_categories[2].id).toBe(3);
      expect(get_menu.body.result[0].sub_categories[2].in_stock).toBe(false);
      expect(
        get_menu.body.result[0].sub_categories[2].menu_items[0].in_stock
      ).toBe(false);
    });
    test('Sending Menu Item In Stock', async () => {
      // if restID is not added in request it throws 500 error
      const item_out_of_stock = await request(server)
        .post('/food/callback/petpooja/item_in_stock')
        .set('Authorization', `Bearer ${petpooja_token}`)
        .send({
          restID: 'ps82kz7f',
          type: 'item',
          inStock: true,
          itemID: ['10464639'],
          autoTurnOnTime: 'custom',
          customTurnOnTime: new Date(),
        });
      expect(item_out_of_stock.body.status).toBe('success');
      expect(item_out_of_stock.body.message).toBe(
        'Stock status updated successfully'
      );

      const read_menu_item = await DB.read
        .from('menu_item')
        .where({pos_id: '10464639'});
      expect(read_menu_item[0].next_available_after).toBe(null);

      const get_menu = await request(server)
        .get('/food/vendor/menu')
        .set('Authorization', `Bearer ${vendor_token}`);
      expect(get_menu.body.status).toBe(true);
      expect(get_menu.statusCode).toBe(200);
      expect(get_menu.body.result[0].sub_categories[2].id).toBe(3);
      expect(get_menu.body.result[0].sub_categories[2].in_stock).toBe(true);
      expect(
        get_menu.body.result[0].sub_categories[2].menu_items[0].in_stock
      ).toBe(true);
    });
    // test('Sending Menu Item Out Of Stock in_stock API | And In Stock by push menu', async () => {
    //   const end_time = new Date();
    //   end_time.setUTCMonth(2);
    //   end_time.setUTCDate(30);
    //   end_time.setUTCFullYear(end_time.getUTCFullYear() + 2);
    //   end_time.setUTCHours(12);
    //   end_time.setUTCMinutes(30);
    //   end_time.setUTCSeconds(0);
    //   end_time.setUTCMilliseconds(0);

    //   const item_out_of_stock = await request(server)
    //     .post('/food/callback/petpooja/item_out_of_stock')
    //     .set('Authorization', `Bearer ${petpooja_token}`)
    //     .send({
    //       restID: 'ps82kz7f',
    //       type: 'item',
    //       inStock: false,
    //       itemID: ['10464639'],
    //       autoTurnOnTime: 'custom',
    //       customTurnOnTime: '2025-03-30 18:00',
    //     });
    //   expect(item_out_of_stock.body.status).toBe('success');
    //   expect(item_out_of_stock.body.message).toBe(
    //     'Stock status updated successfully'
    //   );

    //   const read_menu_item = await DB.read
    //     .from('menu_item')
    //     .where({pos_id: '10464639'});
    //   expect(read_menu_item[0].in_stock).toBe(false);
    //   expect(read_menu_item[0].next_available_after.toISOString()).toEqual(
    //     end_time.toISOString()
    //   );

    //   const get_menu = await request(server)
    //     .get('/food/vendor/menu')
    //     .set('Authorization', `Bearer ${vendor_token}`);
    //   expect(get_menu.body.status).toBe(true);
    //   expect(get_menu.statusCode).toBe(200);
    //   expect(get_menu.body.result[1].sub_categories[2].id).toBe(3);
    //   expect(get_menu.body.result[1].sub_categories[2].in_stock).toBe(false);
    //   expect(
    //     get_menu.body.result[1].sub_categories[2].menu_items[0].in_stock
    //   ).toBe(false);
    //   const next_available_after = new Date(
    //     get_menu.body.result[1].sub_categories[2].menu_items[0].next_available_after
    //   );
    //   expect(next_available_after.toISOString()).toBe(end_time.toISOString());

    //   /// Sending Menu Item In Stock by Push Menu

    //   PETPOOJA_TEST_MENU.items[1].in_stock = '1';
    //   const mock_es_index_data = mockEsIndexData();
    //   const response = await request(server)
    //     .post('/food/callback/petpooja/push_menu')
    //     .set('Authorization', `Bearer ${petpooja_token}`)
    //     .send(PETPOOJA_TEST_MENU);
    //   expect(response.body).toStrictEqual({
    //     success: '1',
    //     message: 'Menu items are successfully listed.',
    //   });
    //   expect(mock_es_index_data).toHaveBeenCalled();

    //   const read_menu_item_in_stock = await DB.read
    //     .from('menu_item')
    //     .where({pos_id: '10464639'});

    //   const get_menu_item_in_stock = await request(server)
    //     .get('/food/vendor/menu')
    //     .set('Authorization', `Bearer ${vendor_token}`);
    //   console.log(JSON.stringify(get_menu_item_in_stock.body.result));
    //   expect(get_menu_item_in_stock.body.status).toBe(true);
    //   expect(get_menu_item_in_stock.statusCode).toBe(200);
    //   expect(get_menu_item_in_stock.body.result[1].sub_categories[2].id).toBe(
    //     3
    //   );
    //   expect(
    //     get_menu_item_in_stock.body.result[1].sub_categories[2].in_stock
    //   ).toBe(true);
    //   expect(
    //     get_menu_item_in_stock.body.result[1].sub_categories[2].menu_items[0]
    //       .in_stock
    //   ).toBe(true);
    // });
  });
  describe('Reading Menu', () => {
    test('Reading Main Category', async () => {
      const read_main_category = await DB.read
        .from('main_category')
        .where({restaurant_id: pp_restaurant_id})
        .whereIn('id', [1, 2]);
      expect(read_main_category.length).toBe(2);
      expect(read_main_category).toStrictEqual([
        {
          id: 2,
          name: 'NOTA',
          restaurant_id: '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
          created_at: expect.anything(),
          updated_at: expect.anything(),
          is_deleted: false,
          pos_id: '0',
          pos_partner: 'petpooja',
          sequence: 2,
          discount_rate: 0,
          discount_updated_at: null,
          discount_updated_user_id: null,
          discount_updated_user_type: null,
        },
        {
          id: 1,
          name: 'Starters',
          restaurant_id: '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
          created_at: expect.anything(),
          updated_at: expect.anything(),
          is_deleted: false,
          pos_id: '1',
          pos_partner: 'petpooja',
          sequence: 1,
          discount_rate: 0,
          discount_updated_at: null,
          discount_updated_user_id: null,
          discount_updated_user_type: null,
        },
      ]);
    });
    test('Reading Sub Category', async () => {
      const read_sub_category = await DB.read('sub_category')
        .select('*')
        .where({is_deleted: false, pos_partner: 'petpooja'})
        .whereIn('main_category_id', [1, 2]);
      expect(read_sub_category.length).toBe(4);
      expect(read_sub_category).toStrictEqual([
        {
          id: 1,
          name: 'Pizza',
          main_category_id: 2,
          created_at: expect.anything(),
          updated_at: expect.anything(),
          is_deleted: false,
          pos_id: '72541',
          pos_partner: 'petpooja',
          sequence: 1,
          discount_rate: 0,
          discount_updated_at: null,
          discount_updated_user_id: null,
          discount_updated_user_type: null,
        },
        {
          id: 4,
          name: 'Pizza',
          main_category_id: 1,
          created_at: expect.anything(),
          updated_at: expect.anything(),
          is_deleted: false,
          pos_id: '72541',
          pos_partner: 'petpooja',
          sequence: 1,
          discount_rate: 0,
          discount_updated_at: null,
          discount_updated_user_id: null,
          discount_updated_user_type: null,
        },
        {
          id: 2,
          name: 'Tandoori Starters',
          main_category_id: 1,
          created_at: expect.anything(),
          updated_at: expect.anything(),
          is_deleted: false,
          pos_id: '72560',
          pos_partner: 'petpooja',
          sequence: 2,
          discount_rate: 0,
          discount_updated_at: null,
          discount_updated_user_id: null,
          discount_updated_user_type: null,
        },
        {
          id: 3,
          name: 'Panner Starters',
          main_category_id: 1,
          created_at: expect.anything(),
          updated_at: expect.anything(),
          is_deleted: false,
          pos_id: '72544',
          pos_partner: 'petpooja',
          sequence: 3,
          discount_rate: 0,
          discount_updated_at: null,
          discount_updated_user_id: null,
          discount_updated_user_type: null,
        },
      ]);
    });
    test('Reading Menu Item', async () => {
      const read_menu_item = await DB.read('menu_item')
        .select('*')
        .where({is_deleted: false})
        .whereIn('sub_category_id', [1, 2, 3, 4]);
      expect(read_menu_item.length).toBe(3);
      expect(read_menu_item).toEqual([
        {
          id: 1,
          restaurant_id: '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
          name: 'Pudina Chaap',
          description: '',
          sub_category_id: 3,
          price: 375,
          veg_egg_non: 'veg',
          packing_charges: 0,
          is_spicy: false,
          serves_how_many: 1,
          service_charges: 0,
          item_sgst_utgst: 2.5,
          item_cgst: 2.5,
          item_igst: 0,
          item_inclusive: false,
          disable: false,
          external_id: null,
          allow_long_distance: true,
          image: null,
          created_at: expect.anything(),
          updated_at: expect.anything(),
          is_deleted: false,
          next_available_after: null,
          pos_id: '10464639',
          tax_applied_on: 'core',
          pos_partner: 'petpooja',
          sequence: 1,
          discount_rate: 0,
          discount_updated_at: null,
          discount_updated_user_id: null,
          discount_updated_user_type: null,
        },
        {
          id: 2,
          restaurant_id: '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
          name: 'Afghani Chaap',
          description: '',
          sub_category_id: 2,
          price: 355,
          veg_egg_non: 'veg',
          packing_charges: 0,
          is_spicy: false,
          serves_how_many: 1,
          service_charges: 0,
          item_sgst_utgst: 2.5,
          item_cgst: 2.5,
          item_igst: 0,
          item_inclusive: false,
          disable: false,
          external_id: null,
          image: {
            url: 'https://online-logo.thumb_2022_06_13_13_52_58_Afghani_Chaap.jpg',
          },
          created_at: expect.anything(),
          updated_at: expect.anything(),
          is_deleted: false,
          next_available_after: null,
          pos_id: '10464922',
          tax_applied_on: 'core',
          pos_partner: 'petpooja',
          sequence: 1,
          allow_long_distance: true,
          discount_rate: 0,
          discount_updated_at: null,
          discount_updated_user_id: null,
          discount_updated_user_type: null,
        },
        {
          id: 3,
          restaurant_id: '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
          name: 'Arrosteo Bells Pizza',
          description: '',
          sub_category_id: 4,
          price: 0,
          veg_egg_non: 'veg',
          packing_charges: 0,
          is_spicy: false,
          serves_how_many: 1,
          service_charges: 0,
          item_sgst_utgst: 2.5,
          item_cgst: 2.5,
          item_igst: 0,
          item_inclusive: false,
          disable: false,
          external_id: null,
          allow_long_distance: true,
          image: null,
          created_at: expect.anything(),
          updated_at: expect.anything(),
          is_deleted: false,
          next_available_after: null,
          pos_id: '10464621',
          tax_applied_on: 'core',
          pos_partner: 'petpooja',
          sequence: 1,
          discount_rate: 0,
          discount_updated_at: null,
          discount_updated_user_id: null,
          discount_updated_user_type: null,
        },
      ]);
    });
    test('Reading Addon', async () => {
      const addon = await DB.read('addon')
        .select('*')
        .where({is_deleted: false})
        .whereIn('addon_group_id', [1, 2, 3, 4]);
      expect(addon.length).toBe(10);
      expect(addon).toStrictEqual([
        {
          id: 1,
          name: 'Coffee',
          addon_group_id: 1,
          sequence: 2,
          price: 63.75,
          veg_egg_non: 'veg',
          in_stock: true,
          sgst_rate: 0,
          cgst_rate: 0,
          igst_rate: 0,
          gst_inclusive: true,
          external_id: null,
          status: 'active',
          created_at: expect.anything(),
          updated_at: expect.anything(),
          is_deleted: false,
          pos_id: '28411',
          next_available_after: expect.anything(),
          pos_partner: 'petpooja',
        },
        {
          id: 2,
          name: 'Salt Fresh Lime Soda',
          addon_group_id: 1,
          sequence: 3,
          price: 68,
          veg_egg_non: 'veg',
          in_stock: true,
          sgst_rate: 0,
          cgst_rate: 0,
          igst_rate: 0,
          gst_inclusive: true,
          external_id: null,
          status: 'active',
          created_at: expect.anything(),
          updated_at: expect.anything(),
          is_deleted: false,
          pos_id: '28413',
          next_available_after: null,
          pos_partner: 'petpooja',
        },
        {
          id: 3,
          name: 'Sweet Fresh Lime Soda',
          addon_group_id: 1,
          sequence: 4,
          price: 68,
          veg_egg_non: 'veg',
          in_stock: true,
          sgst_rate: 0,
          cgst_rate: 0,
          igst_rate: 0,
          gst_inclusive: true,
          external_id: null,
          status: 'active',
          created_at: expect.anything(),
          updated_at: expect.anything(),
          is_deleted: false,
          pos_id: '28415',
          next_available_after: expect.anything(),
          pos_partner: 'petpooja',
        },
        {
          id: 4,
          name: 'Virgin Mojito',
          addon_group_id: 1,
          sequence: 5,
          price: 110.5,
          veg_egg_non: 'veg',
          in_stock: true,
          sgst_rate: 0,
          cgst_rate: 0,
          igst_rate: 0,
          gst_inclusive: true,
          external_id: null,
          status: 'active',
          created_at: expect.anything(),
          updated_at: expect.anything(),
          is_deleted: false,
          pos_id: '28417',
          next_available_after: null,
          pos_partner: 'petpooja',
        },
        {
          id: 5,
          name: 'Manchow Soup',
          addon_group_id: 2,
          sequence: 1,
          price: 106.25,
          veg_egg_non: 'veg',
          in_stock: true,
          sgst_rate: 0,
          cgst_rate: 0,
          igst_rate: 0,
          gst_inclusive: true,
          external_id: null,
          status: 'active',
          created_at: expect.anything(),
          updated_at: expect.anything(),
          is_deleted: false,
          pos_id: '28419',
          next_available_after: null,
          pos_partner: 'petpooja',
        },
        {
          id: 6,
          name: 'Hot And Sour Soup',
          addon_group_id: 2,
          sequence: 2,
          price: 106.25,
          veg_egg_non: 'veg',
          in_stock: true,
          sgst_rate: 0,
          cgst_rate: 0,
          igst_rate: 0,
          gst_inclusive: true,
          external_id: null,
          status: 'active',
          created_at: expect.anything(),
          updated_at: expect.anything(),
          is_deleted: false,
          pos_id: '28421',
          next_available_after: null,
          pos_partner: 'petpooja',
        },
        {
          id: 7,
          name: 'Paneer Achari Tikka',
          addon_group_id: 3,
          sequence: 1,
          price: 284.75,
          veg_egg_non: 'veg',
          in_stock: true,
          sgst_rate: 0,
          cgst_rate: 0,
          igst_rate: 0,
          gst_inclusive: true,
          external_id: null,
          status: 'active',
          created_at: expect.anything(),
          updated_at: expect.anything(),
          is_deleted: false,
          pos_id: '28471',
          next_available_after: null,
          pos_partner: 'petpooja',
        },
        {
          id: 8,
          name: 'Paneer Tikka',
          addon_group_id: 3,
          sequence: 2,
          price: 284.75,
          veg_egg_non: 'veg',
          in_stock: true,
          sgst_rate: 0,
          cgst_rate: 0,
          igst_rate: 0,
          gst_inclusive: true,
          external_id: null,
          status: 'active',
          created_at: expect.anything(),
          updated_at: expect.anything(),
          is_deleted: false,
          pos_id: '28473',
          next_available_after: null,
          pos_partner: 'petpooja',
        },
        {
          id: 9,
          name: 'Aloo Stuffed',
          addon_group_id: 3,
          sequence: 3,
          price: 272,
          veg_egg_non: 'veg',
          in_stock: true,
          sgst_rate: 0,
          cgst_rate: 0,
          igst_rate: 0,
          gst_inclusive: true,
          external_id: null,
          status: 'active',
          created_at: expect.anything(),
          updated_at: expect.anything(),
          is_deleted: false,
          pos_id: '28475',
          next_available_after: null,
          pos_partner: 'petpooja',
        },
        {
          id: 10,
          name: 'Cheesy Loaded Fries',
          addon_group_id: 4,
          sequence: 1,
          price: 170,
          veg_egg_non: 'veg',
          in_stock: true,
          sgst_rate: 0,
          cgst_rate: 0,
          igst_rate: 0,
          gst_inclusive: true,
          external_id: null,
          status: 'active',
          created_at: expect.anything(),
          updated_at: expect.anything(),
          is_deleted: false,
          pos_id: '28451',
          next_available_after: null,
          pos_partner: 'petpooja',
        },
      ]);
    });
    test('Reading Addon Group', async () => {
      const addons = await DB.read('addon_group')
        .select('*')
        .where({is_deleted: false, restaurant_id: pp_restaurant_id});
      expect(addons.length).toBe(4);
      expect(addons).toStrictEqual([
        {
          id: 1,
          name: 'Beverages',
          restaurant_id: '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
          created_at: expect.anything(),
          updated_at: expect.anything(),
          is_deleted: false,
          pos_id: '8382',
          pos_partner: 'petpooja',
        },
        {
          id: 2,
          name: 'Sides',
          restaurant_id: '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
          created_at: expect.anything(),
          updated_at: expect.anything(),
          is_deleted: false,
          pos_id: '8383',
          pos_partner: 'petpooja',
        },
        {
          id: 3,
          name: 'Starters Add Ons',
          restaurant_id: '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
          created_at: expect.anything(),
          updated_at: expect.anything(),
          is_deleted: false,
          pos_id: '8384',
          pos_partner: 'petpooja',
        },
        {
          id: 4,
          name: 'Addons Starters',
          restaurant_id: '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
          created_at: expect.anything(),
          updated_at: expect.anything(),
          is_deleted: false,
          pos_id: '8385',
          pos_partner: 'petpooja',
        },
      ]);
    });
    test('Reading Item Variant Group', async () => {
      const item_variant_groups = await DB.read('item_variant_group')
        .select('*')
        .where({is_deleted: false})
        .whereIn('menu_item_id', [1, 2, 3]);
      expect(item_variant_groups.length).toBe(1);
      expect(item_variant_groups).toStrictEqual([
        {
          id: 1,
          menu_item_id: 3,
          name: 'Size',
          created_at: expect.anything(),
          updated_at: expect.anything(),
          is_deleted: false,
          pos_id: 'Size_10464621',
          pos_partner: 'petpooja',
          sequence: 1,
        },
      ]);
    });
    test('Reading Item Variant', async () => {
      const item_variants = await DB.read('item_variant')
        .select('*')
        .where({is_deleted: false})
        .whereIn('variant_group_id', [1]);
      expect(item_variants.length).toBe(2);
      expect(item_variants).toStrictEqual([
        {
          id: 1,
          variant_group_id: 1,
          name: '8 Inch',
          is_default: true,
          serves_how_many: 1,
          price: 290,
          in_stock: true,
          veg_egg_non: 'veg',
          created_at: expect.anything(),
          updated_at: expect.anything(),
          is_deleted: false,
          pos_id: '7218',
          pos_variant_item_id: '10464958',
          next_available_after: null,
          pos_partner: 'petpooja',
          sequence: 1,
        },
        {
          id: 2,
          variant_group_id: 1,
          name: '12 Inch',
          is_default: false,
          serves_how_many: 1,
          price: 505,
          in_stock: true,
          veg_egg_non: 'veg',
          created_at: expect.anything(),
          updated_at: expect.anything(),
          is_deleted: false,
          pos_id: '7219',
          pos_variant_item_id: '10464959',
          next_available_after: null,
          pos_partner: 'petpooja',
          sequence: 2,
        },
      ]);
    });
  });
});

//  Restaurant name is diffrent in speedy then petpooja '\n 'Selecting Order type as Dine In Or Pickup
//  sending packaging_applicable_on other then NONE, ITEM, ORDER | PETPOOJA_TEST_MENU.restaurants[0].details.packaging_applicable_on
// sending 2 in itemallowvariation| need to throw error '\n expect Order -> item_ordertype to be only 1 (Home Delivery)
// if itemallowvariation is 0 then expect variation to be empty
// In items -> itemallowvariation is 0 then expect variation_groupname and variation to be empty
