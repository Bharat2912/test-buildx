import request from 'supertest';
import {Application} from 'express';
import {createTestServer} from '../../utils/init';
import {loadMockSeedData, testCasesClosingTasks} from '../../utils/utils';
import {DB} from '../../../data/knex';
import {PETPOOJA_TEST_MENU} from '../constant';
import {mockEsIndexData} from '../../utils/mock_services';

let server: Application;
const petpooja_token = 'petpooja_token';
const restaurant_id = '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242';

beforeAll(async () => {
  server = await createTestServer();
  await loadMockSeedData('restaurant');
});

afterAll(async () => {
  await testCasesClosingTasks();
});

describe('Petpooja Push Menu', () => {
  // test('item_order_type 2 or 3 then skip item', async () => {
  //   const mock_es_index_data = mockEsIndexData();

  //   PETPOOJA_TEST_MENU.items[2].item_ordertype = '2,3';
  //   const response = await request(server)
  //     .post('/food/callback/petpooja/push_menu')
  //     .set('Authorization', `Bearer ${petpooja_token}`)
  //     .send(PETPOOJA_TEST_MENU);
  //   expect(response.statusCode).toBe(200);
  //   expect(response.body).toStrictEqual({
  //     success: '1',
  //     message: 'Menu items are successfully listed.',
  //   });
  //   expect(mock_es_index_data).toHaveBeenCalled();
  //   const main_categories = await DB.read('main_category')
  //     .select('*')
  //     .where({is_deleted: false, restaurant_id: restaurant_id});
  //   expect(main_categories.length).toBe(2);
  //   expect(main_categories).toStrictEqual([
  //     {
  //       id: 1,
  //       name: 'Starters',
  //       restaurant_id: '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
  //       pos_id: '1',
  //       pos_partner: 'petpooja',
  //       is_deleted: false,
  //       created_at: expect.anything(),
  //       updated_at: expect.anything(),
  //     },
  //     {
  //       id: 2,
  //       name: 'NOTA',
  //       restaurant_id: '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
  //       pos_id: '0',
  //       pos_partner: 'petpooja',
  //       is_deleted: false,
  //       created_at: expect.anything(),
  //       updated_at: expect.anything(),
  //     },
  //   ]);

  //   const sub_categories = await DB.read('sub_category')
  //     .select('*')
  //     .where({is_deleted: false})
  //     .whereIn('main_category_id', [1, 2]);
  //   expect(sub_categories.length).toBe(3);
  //   expect(sub_categories).toStrictEqual([
  //     {
  //       id: 1,
  //       is_deleted: false,
  //       main_category_id: 2,
  //       name: 'Pizza',
  //       pos_id: '72541',
  //       pos_partner: 'petpooja',
  //       updated_at: expect.anything(),
  //       created_at: expect.anything(),
  //     },
  //     {
  //       id: 2,
  //       is_deleted: false,
  //       main_category_id: 1,
  //       name: 'Tandoori Starters',
  //       pos_id: '72560',
  //       pos_partner: 'petpooja',
  //       updated_at: expect.anything(),
  //       created_at: expect.anything(),
  //     },
  //     {
  //       id: 3,
  //       is_deleted: false,
  //       main_category_id: 1,
  //       name: 'Panner Starters',
  //       pos_id: '72544',
  //       pos_partner: 'petpooja',
  //       updated_at: expect.anything(),
  //       created_at: expect.anything(),
  //     },
  //   ]);

  //   const addon_groups = await DB.read('addon_group')
  //     .select('*')
  //     .where({is_deleted: false, restaurant_id: restaurant_id});
  //   expect(addon_groups.length).toBe(4);
  //   expect(addon_groups).toStrictEqual([
  //     {
  //       id: 1,
  //       name: 'Beverages',
  //       restaurant_id: '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
  //       pos_id: '8382',
  //       pos_partner: 'petpooja',
  //       is_deleted: false,
  //       created_at: expect.anything(),
  //       updated_at: expect.anything(),
  //     },
  //     {
  //       id: 2,
  //       is_deleted: false,
  //       name: 'Sides',
  //       pos_id: '8383',
  //       pos_partner: 'petpooja',
  //       restaurant_id: '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
  //       created_at: expect.anything(),
  //       updated_at: expect.anything(),
  //     },
  //     {
  //       id: 3,
  //       is_deleted: false,
  //       name: 'Starters Add Ons',
  //       pos_id: '8384',
  //       pos_partner: 'petpooja',
  //       restaurant_id: '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
  //       created_at: expect.anything(),
  //       updated_at: expect.anything(),
  //     },
  //     {
  //       id: 4,
  //       is_deleted: false,
  //       name: 'Addons Starters',
  //       pos_id: '8385',
  //       pos_partner: 'petpooja',
  //       restaurant_id: '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
  //       created_at: expect.anything(),
  //       updated_at: expect.anything(),
  //     },
  //   ]);

  //   const addons = await DB.read('addon')
  //     .select('*')
  //     .where({is_deleted: false})
  //     .whereIn('addon_group_id', [1, 2, 3, 4]);
  //   expect(addons.length).toBe(10);
  //   expect(addons).toStrictEqual([
  //     {
  //       addon_group_id: 1,
  //       cgst_rate: 0,
  //       created_at: expect.anything(),
  //       external_id: null,
  //       gst_inclusive: true,
  //       id: 1,
  //       igst_rate: 0,
  //       in_stock: true,
  //       next_available_after: null,
  //       is_deleted: false,
  //       name: 'Coffee',
  //       pos_id: '28411',
  //       pos_partner: 'petpooja',
  //       price: 63.75,
  //       sequence: 2,
  //       sgst_rate: 0,
  //       status: 'active',
  //       updated_at: expect.anything(),
  //       veg_egg_non: 'veg',
  //     },
  //     {
  //       addon_group_id: 1,
  //       cgst_rate: 0,
  //       created_at: expect.anything(),
  //       external_id: null,
  //       gst_inclusive: true,
  //       id: 2,
  //       igst_rate: 0,
  //       in_stock: true,
  //       next_available_after: null,
  //       is_deleted: false,
  //       name: 'Salt Fresh Lime Soda',
  //       pos_id: '28413',
  //       pos_partner: 'petpooja',
  //       price: 68,
  //       sequence: 3,
  //       sgst_rate: 0,
  //       status: 'active',
  //       updated_at: expect.anything(),
  //       veg_egg_non: 'veg',
  //     },
  //     {
  //       addon_group_id: 1,
  //       cgst_rate: 0,
  //       created_at: expect.anything(),
  //       external_id: null,
  //       gst_inclusive: true,
  //       id: 3,
  //       igst_rate: 0,
  //       in_stock: true,
  //       next_available_after: null,
  //       is_deleted: false,
  //       name: 'Sweet Fresh Lime Soda',
  //       pos_id: '28415',
  //       pos_partner: 'petpooja',
  //       price: 68,
  //       sequence: 4,
  //       sgst_rate: 0,
  //       status: 'active',
  //       updated_at: expect.anything(),
  //       veg_egg_non: 'veg',
  //     },
  //     {
  //       addon_group_id: 1,
  //       cgst_rate: 0,
  //       created_at: expect.anything(),
  //       external_id: null,
  //       gst_inclusive: true,
  //       id: 4,
  //       igst_rate: 0,
  //       in_stock: true,
  //       next_available_after: null,
  //       is_deleted: false,
  //       name: 'Virgin Mojito',
  //       pos_id: '28417',
  //       pos_partner: 'petpooja',
  //       price: 110.5,
  //       sequence: 5,
  //       sgst_rate: 0,
  //       status: 'active',
  //       updated_at: expect.anything(),
  //       veg_egg_non: 'veg',
  //     },
  //     {
  //       addon_group_id: 2,
  //       cgst_rate: 0,
  //       created_at: expect.anything(),
  //       external_id: null,
  //       gst_inclusive: true,
  //       id: 5,
  //       igst_rate: 0,
  //       in_stock: true,
  //       next_available_after: null,
  //       is_deleted: false,
  //       name: 'Manchow Soup',
  //       pos_id: '28419',
  //       pos_partner: 'petpooja',
  //       price: 106.25,
  //       sequence: 1,
  //       sgst_rate: 0,
  //       status: 'active',
  //       updated_at: expect.anything(),
  //       veg_egg_non: 'veg',
  //     },
  //     {
  //       addon_group_id: 2,
  //       cgst_rate: 0,
  //       created_at: expect.anything(),
  //       external_id: null,
  //       gst_inclusive: true,
  //       id: 6,
  //       igst_rate: 0,
  //       in_stock: true,
  //       next_available_after: null,
  //       is_deleted: false,
  //       name: 'Hot And Sour Soup',
  //       pos_id: '28421',
  //       pos_partner: 'petpooja',
  //       price: 106.25,
  //       sequence: 2,
  //       sgst_rate: 0,
  //       status: 'active',
  //       updated_at: expect.anything(),
  //       veg_egg_non: 'veg',
  //     },
  //     {
  //       addon_group_id: 3,
  //       cgst_rate: 0,
  //       created_at: expect.anything(),
  //       external_id: null,
  //       gst_inclusive: true,
  //       id: 7,
  //       igst_rate: 0,
  //       in_stock: true,
  //       next_available_after: null,
  //       is_deleted: false,
  //       name: 'Paneer Achari Tikka',
  //       pos_id: '28471',
  //       pos_partner: 'petpooja',
  //       price: 284.75,
  //       sequence: 1,
  //       sgst_rate: 0,
  //       status: 'active',
  //       updated_at: expect.anything(),
  //       veg_egg_non: 'veg',
  //     },
  //     {
  //       addon_group_id: 3,
  //       cgst_rate: 0,
  //       created_at: expect.anything(),
  //       external_id: null,
  //       gst_inclusive: true,
  //       id: 8,
  //       igst_rate: 0,
  //       in_stock: true,
  //       next_available_after: null,
  //       is_deleted: false,
  //       name: 'Paneer Tikka',
  //       pos_id: '28473',
  //       pos_partner: 'petpooja',
  //       price: 284.75,
  //       sequence: 2,
  //       sgst_rate: 0,
  //       status: 'active',
  //       updated_at: expect.anything(),
  //       veg_egg_non: 'veg',
  //     },
  //     {
  //       addon_group_id: 3,
  //       cgst_rate: 0,
  //       created_at: expect.anything(),
  //       external_id: null,
  //       gst_inclusive: true,
  //       id: 9,
  //       igst_rate: 0,
  //       in_stock: true,
  //       next_available_after: null,
  //       is_deleted: false,
  //       name: 'Aloo Stuffed',
  //       pos_id: '28475',
  //       pos_partner: 'petpooja',
  //       price: 272,
  //       sequence: 3,
  //       sgst_rate: 0,
  //       status: 'active',
  //       updated_at: expect.anything(),
  //       veg_egg_non: 'veg',
  //     },
  //     {
  //       addon_group_id: 4,
  //       cgst_rate: 0,
  //       created_at: expect.anything(),
  //       external_id: null,
  //       gst_inclusive: true,
  //       id: 10,
  //       igst_rate: 0,
  //       in_stock: true,
  //       next_available_after: null,
  //       is_deleted: false,
  //       name: 'Cheesy Loaded Fries',
  //       pos_id: '28451',
  //       pos_partner: 'petpooja',
  //       price: 170,
  //       sequence: 1,
  //       sgst_rate: 0,
  //       status: 'active',
  //       updated_at: expect.anything(),
  //       veg_egg_non: 'veg',
  //     },
  //   ]);

  //   const menu_items = await DB.read('menu_item')
  //     .select('*')
  //     .where({is_deleted: false})
  //     .whereIn('sub_category_id', [1, 2, 3]);

  //   expect(menu_items.length).toBe(2);
  //   expect(menu_items).toStrictEqual([
  //     {
  //       id: 1,
  //       restaurant_id: '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
  //       name: 'Pudina Chaap',
  //       description: '',
  //       sub_category_id: 3,
  //       price: 375,
  //       veg_egg_non: 'veg',
  //       packing_charges: 0,
  //       is_spicy: false,
  //       serves_how_many: 1,
  //       service_charges: 0,
  //       item_sgst_utgst: 2.5,
  //       item_cgst: 2.5,
  //       item_igst: 0,
  //       item_inclusive: false,
  //       disable: false,
  //       external_id: null,
  //       allow_long_distance: true,
  //       image: null,
  //       created_at: expect.anything(),
  //       updated_at: expect.anything(),
  //       is_deleted: false,
  //       next_available_after: null,
  //       pos_id: '10464639',
  //       pos_partner: 'petpooja',
  //       tax_applied_on: 'core',
  //     },
  //     {
  //       id: 2,
  //       restaurant_id: '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
  //       name: 'Afghani Chaap',
  //       description: '',
  //       sub_category_id: 2,
  //       price: 355,
  //       veg_egg_non: 'veg',
  //       packing_charges: 0,
  //       is_spicy: false,
  //       serves_how_many: 1,
  //       service_charges: 0,
  //       item_sgst_utgst: 2.5,
  //       item_cgst: 2.5,
  //       item_igst: 0,
  //       item_inclusive: false,
  //       disable: false,
  //       external_id: null,
  //       allow_long_distance: true,
  //       image: null,
  //       created_at: expect.anything(),
  //       updated_at: expect.anything(),
  //       is_deleted: false,
  //       next_available_after: null,
  //       pos_id: '10464922',
  //       pos_partner: 'petpooja',
  //       tax_applied_on: 'core',
  //     },
  //   ]);

  //   const item_variant_groups = await DB.read('item_variant_group')
  //     .select('*')
  //     .where({is_deleted: false})
  //     .whereIn('menu_item_id', [1, 2, 3]);

  //   expect(item_variant_groups.length).toBe(0);

  //   const item_variants = await DB.read('item_variant')
  //     .select('*')
  //     .where({is_deleted: false})
  //     .whereIn('variant_group_id', [1]);

  //   expect(item_variants.length).toBe(0);

  //   const item_addon_groups = await DB.read('item_addon_group')
  //     .select('*')
  //     .whereIn('menu_item_id', [1, 2, 3]);

  //   expect(item_addon_groups.length).toBe(4);
  //   expect(item_addon_groups).toStrictEqual([
  //     {
  //       menu_item_id: 2,
  //       addon_group_id: 1,
  //       max_limit: 4,
  //       min_limit: 0,
  //       free_limit: -1,
  //       sequence: 1,
  //       created_at: expect.anything(),
  //       updated_at: expect.anything(),
  //     },
  //     {
  //       menu_item_id: 2,
  //       addon_group_id: 2,
  //       max_limit: 2,
  //       min_limit: 0,
  //       free_limit: -1,
  //       sequence: 1,
  //       created_at: expect.anything(),
  //       updated_at: expect.anything(),
  //     },
  //     {
  //       menu_item_id: 2,
  //       addon_group_id: 4,
  //       max_limit: 1,
  //       min_limit: 0,
  //       free_limit: -1,
  //       sequence: 1,
  //       created_at: expect.anything(),
  //       updated_at: expect.anything(),
  //     },
  //     {
  //       menu_item_id: 2,
  //       addon_group_id: 3,
  //       max_limit: 1,
  //       min_limit: 0,
  //       free_limit: -1,
  //       sequence: 1,
  //       created_at: expect.anything(),
  //       updated_at: expect.anything(),
  //     },
  //   ]);

  //   const item_addons = await DB.read('item_addon')
  //     .select('*')
  //     .whereIn('menu_item_id', [1, 2, 3]);

  //   expect(item_addons.length).toBe(10);
  //   expect(item_addons).toStrictEqual([
  //     {menu_item_id: 2, addon_id: 1},
  //     {menu_item_id: 2, addon_id: 2},
  //     {menu_item_id: 2, addon_id: 3},
  //     {menu_item_id: 2, addon_id: 4},
  //     {menu_item_id: 2, addon_id: 5},
  //     {menu_item_id: 2, addon_id: 6},
  //     {menu_item_id: 2, addon_id: 10},
  //     {menu_item_id: 2, addon_id: 7},
  //     {menu_item_id: 2, addon_id: 8},
  //     {menu_item_id: 2, addon_id: 9},
  //   ]);
  //   PETPOOJA_TEST_MENU.items[2].item_ordertype = '1,2,3';
  // });

  test('Valid menu entities', async () => {
    const mock_es_index_data = mockEsIndexData();

    const response = await request(server)
      .post('/food/callback/petpooja/push_menu')
      .set('Authorization', `Bearer ${petpooja_token}`)
      .send(PETPOOJA_TEST_MENU);
    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual({
      success: '1',
      message: 'Menu items are successfully listed.',
    });
    expect(mock_es_index_data).toHaveBeenCalled();

    const main_categories = await DB.read('main_category')
      .select('*')
      .where({is_deleted: false, restaurant_id: restaurant_id});
    expect(main_categories.length).toBe(2);
    expect(main_categories).toStrictEqual([
      {
        id: 1,
        name: 'Starters',
        restaurant_id: '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
        pos_id: '1',
        pos_partner: 'petpooja',
        is_deleted: false,
        sequence: 1,
        created_at: expect.anything(),
        updated_at: expect.anything(),
        discount_rate: 0,
        discount_updated_at: null,
        discount_updated_user_id: null,
        discount_updated_user_type: null,
      },
      {
        id: 2,
        name: 'NOTA',
        restaurant_id: '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
        pos_id: '0',
        pos_partner: 'petpooja',
        sequence: 2,
        is_deleted: false,
        created_at: expect.anything(),
        updated_at: expect.anything(),
        discount_rate: 0,
        discount_updated_at: null,
        discount_updated_user_id: null,
        discount_updated_user_type: null,
      },
    ]);

    const sub_categories = await DB.read('sub_category')
      .select('*')
      .where({is_deleted: false})
      .whereIn('main_category_id', [1, 2]);
    expect(sub_categories.length).toBe(3);
    expect(sub_categories).toStrictEqual([
      {
        id: 1,
        is_deleted: false,
        main_category_id: 2,
        name: 'Pizza',
        pos_id: '72541',
        pos_partner: 'petpooja',
        sequence: 1,
        updated_at: expect.anything(),
        created_at: expect.anything(),
        discount_rate: 0,
        discount_updated_at: null,
        discount_updated_user_id: null,
        discount_updated_user_type: null,
      },
      {
        id: 2,
        is_deleted: false,
        main_category_id: 1,
        name: 'Tandoori Starters',
        pos_id: '72560',
        pos_partner: 'petpooja',
        sequence: 1,
        updated_at: expect.anything(),
        created_at: expect.anything(),
        discount_rate: 0,
        discount_updated_at: null,
        discount_updated_user_id: null,
        discount_updated_user_type: null,
      },
      {
        id: 3,
        is_deleted: false,
        main_category_id: 1,
        name: 'Panner Starters',
        pos_id: '72544',
        pos_partner: 'petpooja',
        sequence: 2,
        updated_at: expect.anything(),
        created_at: expect.anything(),
        discount_rate: 0,
        discount_updated_at: null,
        discount_updated_user_id: null,
        discount_updated_user_type: null,
      },
    ]);

    const addon_groups = await DB.read('addon_group')
      .select('*')
      .where({is_deleted: false, restaurant_id: restaurant_id});
    expect(addon_groups.length).toBe(4);
    expect(addon_groups).toStrictEqual([
      {
        id: 1,
        name: 'Beverages',
        restaurant_id: '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
        pos_id: '8382',
        pos_partner: 'petpooja',
        is_deleted: false,
        created_at: expect.anything(),
        updated_at: expect.anything(),
      },
      {
        id: 2,
        is_deleted: false,
        name: 'Sides',
        pos_id: '8383',
        pos_partner: 'petpooja',
        restaurant_id: '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
        created_at: expect.anything(),
        updated_at: expect.anything(),
      },
      {
        id: 3,
        is_deleted: false,
        name: 'Starters Add Ons',
        pos_id: '8384',
        pos_partner: 'petpooja',
        restaurant_id: '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
        created_at: expect.anything(),
        updated_at: expect.anything(),
      },
      {
        id: 4,
        is_deleted: false,
        name: 'Addons Starters',
        pos_id: '8385',
        pos_partner: 'petpooja',
        restaurant_id: '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
        created_at: expect.anything(),
        updated_at: expect.anything(),
      },
    ]);

    const addons = await DB.read('addon')
      .select('*')
      .where({is_deleted: false})
      .whereIn('addon_group_id', [1, 2, 3, 4]);
    expect(addons.length).toBe(10);
    expect(addons).toStrictEqual([
      {
        addon_group_id: 1,
        cgst_rate: 0,
        created_at: expect.anything(),
        external_id: null,
        gst_inclusive: true,
        id: 1,
        igst_rate: 0,
        in_stock: true,
        next_available_after: null,
        is_deleted: false,
        name: 'Coffee',
        pos_id: '28411',
        pos_partner: 'petpooja',
        price: 63.75,
        sequence: 2,
        sgst_rate: 0,
        status: 'active',
        updated_at: expect.anything(),
        veg_egg_non: 'veg',
      },
      {
        addon_group_id: 1,
        cgst_rate: 0,
        created_at: expect.anything(),
        external_id: null,
        gst_inclusive: true,
        id: 2,
        igst_rate: 0,
        in_stock: true,
        next_available_after: null,
        is_deleted: false,
        name: 'Salt Fresh Lime Soda',
        pos_id: '28413',
        pos_partner: 'petpooja',
        price: 68,
        sequence: 3,
        sgst_rate: 0,
        status: 'active',
        updated_at: expect.anything(),
        veg_egg_non: 'veg',
      },
      {
        addon_group_id: 1,
        cgst_rate: 0,
        created_at: expect.anything(),
        external_id: null,
        gst_inclusive: true,
        id: 3,
        igst_rate: 0,
        in_stock: true,
        next_available_after: null,
        is_deleted: false,
        name: 'Sweet Fresh Lime Soda',
        pos_id: '28415',
        pos_partner: 'petpooja',
        price: 68,
        sequence: 4,
        sgst_rate: 0,
        status: 'active',
        updated_at: expect.anything(),
        veg_egg_non: 'veg',
      },
      {
        addon_group_id: 1,
        cgst_rate: 0,
        created_at: expect.anything(),
        external_id: null,
        gst_inclusive: true,
        id: 4,
        igst_rate: 0,
        in_stock: true,
        next_available_after: null,
        is_deleted: false,
        name: 'Virgin Mojito',
        pos_id: '28417',
        pos_partner: 'petpooja',
        price: 110.5,
        sequence: 5,
        sgst_rate: 0,
        status: 'active',
        updated_at: expect.anything(),
        veg_egg_non: 'veg',
      },
      {
        addon_group_id: 2,
        cgst_rate: 0,
        created_at: expect.anything(),
        external_id: null,
        gst_inclusive: true,
        id: 5,
        igst_rate: 0,
        in_stock: true,
        next_available_after: null,
        is_deleted: false,
        name: 'Manchow Soup',
        pos_id: '28419',
        pos_partner: 'petpooja',
        price: 106.25,
        sequence: 1,
        sgst_rate: 0,
        status: 'active',
        updated_at: expect.anything(),
        veg_egg_non: 'veg',
      },
      {
        addon_group_id: 2,
        cgst_rate: 0,
        created_at: expect.anything(),
        external_id: null,
        gst_inclusive: true,
        id: 6,
        igst_rate: 0,
        in_stock: true,
        next_available_after: null,
        is_deleted: false,
        name: 'Hot And Sour Soup',
        pos_id: '28421',
        pos_partner: 'petpooja',
        price: 106.25,
        sequence: 2,
        sgst_rate: 0,
        status: 'active',
        updated_at: expect.anything(),
        veg_egg_non: 'veg',
      },
      {
        addon_group_id: 3,
        cgst_rate: 0,
        created_at: expect.anything(),
        external_id: null,
        gst_inclusive: true,
        id: 7,
        igst_rate: 0,
        in_stock: true,
        next_available_after: null,
        is_deleted: false,
        name: 'Paneer Achari Tikka',
        pos_id: '28471',
        pos_partner: 'petpooja',
        price: 284.75,
        sequence: 1,
        sgst_rate: 0,
        status: 'active',
        updated_at: expect.anything(),
        veg_egg_non: 'veg',
      },
      {
        addon_group_id: 3,
        cgst_rate: 0,
        created_at: expect.anything(),
        external_id: null,
        gst_inclusive: true,
        id: 8,
        igst_rate: 0,
        in_stock: true,
        next_available_after: null,
        is_deleted: false,
        name: 'Paneer Tikka',
        pos_id: '28473',
        pos_partner: 'petpooja',
        price: 284.75,
        sequence: 2,
        sgst_rate: 0,
        status: 'active',
        updated_at: expect.anything(),
        veg_egg_non: 'veg',
      },
      {
        addon_group_id: 3,
        cgst_rate: 0,
        created_at: expect.anything(),
        external_id: null,
        gst_inclusive: true,
        id: 9,
        igst_rate: 0,
        in_stock: true,
        next_available_after: null,
        is_deleted: false,
        name: 'Aloo Stuffed',
        pos_id: '28475',
        pos_partner: 'petpooja',
        price: 272,
        sequence: 3,
        sgst_rate: 0,
        status: 'active',
        updated_at: expect.anything(),
        veg_egg_non: 'veg',
      },
      {
        addon_group_id: 4,
        cgst_rate: 0,
        created_at: expect.anything(),
        external_id: null,
        gst_inclusive: true,
        id: 10,
        igst_rate: 0,
        in_stock: true,
        next_available_after: null,
        is_deleted: false,
        name: 'Cheesy Loaded Fries',
        pos_id: '28451',
        pos_partner: 'petpooja',
        price: 170,
        sequence: 1,
        sgst_rate: 0,
        status: 'active',
        updated_at: expect.anything(),
        veg_egg_non: 'veg',
      },
    ]);

    const menu_items = await DB.read('menu_item')
      .select('*')
      .where({is_deleted: false})
      .whereIn('sub_category_id', [1, 2, 3]);

    expect(menu_items.length).toBe(3);
    expect(menu_items).toStrictEqual([
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
        pos_partner: 'petpooja',
        tax_applied_on: 'core',
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
        allow_long_distance: true,
        image: {
          url: 'https://online-logo.thumb_2022_06_13_13_52_58_Afghani_Chaap.jpg',
        },
        created_at: expect.anything(),
        updated_at: expect.anything(),
        is_deleted: false,
        next_available_after: null,
        pos_id: '10464922',
        pos_partner: 'petpooja',
        tax_applied_on: 'core',
        sequence: 1,
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
        sub_category_id: 1,
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
        pos_partner: 'petpooja',
        tax_applied_on: 'core',
        sequence: 1,
        discount_rate: 0,
        discount_updated_at: null,
        discount_updated_user_id: null,
        discount_updated_user_type: null,
      },
    ]);
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
        next_available_after: null,
        veg_egg_non: 'veg',
        created_at: expect.anything(),
        updated_at: expect.anything(),
        is_deleted: false,
        pos_id: '7218',
        pos_variant_item_id: '10464958',
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
        next_available_after: null,
        veg_egg_non: 'veg',
        created_at: expect.anything(),
        updated_at: expect.anything(),
        is_deleted: false,
        pos_id: '7219',
        pos_variant_item_id: '10464959',
        pos_partner: 'petpooja',
        sequence: 2,
      },
    ]);

    const item_addon_groups = await DB.read('item_addon_group')
      .select('*')
      .whereIn('menu_item_id', [1, 2, 3]);

    expect(item_addon_groups.length).toBe(4);
    expect(item_addon_groups).toStrictEqual([
      {
        menu_item_id: 2,
        addon_group_id: 1,
        max_limit: 4,
        min_limit: 0,
        free_limit: -1,
        sequence: 1,
        created_at: expect.anything(),
        updated_at: expect.anything(),
      },
      {
        menu_item_id: 2,
        addon_group_id: 2,
        max_limit: 2,
        min_limit: 0,
        free_limit: -1,
        sequence: 1,
        created_at: expect.anything(),
        updated_at: expect.anything(),
      },
      {
        menu_item_id: 2,
        addon_group_id: 4,
        max_limit: 1,
        min_limit: 0,
        free_limit: -1,
        sequence: 1,
        created_at: expect.anything(),
        updated_at: expect.anything(),
      },
      {
        menu_item_id: 2,
        addon_group_id: 3,
        max_limit: 1,
        min_limit: 0,
        free_limit: -1,
        sequence: 1,
        created_at: expect.anything(),
        updated_at: expect.anything(),
      },
    ]);

    const item_addons = await DB.read('item_addon')
      .select('*')
      .whereIn('menu_item_id', [1, 2, 3]);

    expect(item_addons.length).toBe(10);
    expect(item_addons).toStrictEqual([
      {menu_item_id: 2, addon_id: 1},
      {menu_item_id: 2, addon_id: 2},
      {menu_item_id: 2, addon_id: 3},
      {menu_item_id: 2, addon_id: 4},
      {menu_item_id: 2, addon_id: 5},
      {menu_item_id: 2, addon_id: 6},
      {menu_item_id: 2, addon_id: 10},
      {menu_item_id: 2, addon_id: 7},
      {menu_item_id: 2, addon_id: 8},
      {menu_item_id: 2, addon_id: 9},
    ]);
  });
});
