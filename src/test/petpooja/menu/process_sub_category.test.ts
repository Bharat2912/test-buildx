import request from 'supertest';
import {Application} from 'express';
import {createTestServer} from '../../utils/init';
import {loadMockSeedData, testCasesClosingTasks} from '../../utils/utils';
import {DB} from '../../../data/knex';
import {PETPOOJA_TEST_MENU} from '../constant';
import {mockEsIndexData, mockSendSQSMessage} from '../../utils/mock_services';

jest.mock('axios');

let server: Application;
const petpooja_token = 'petpooja_token';
let PETPOOJA_TEST_MENU_CLONE = JSON.parse(JSON.stringify(PETPOOJA_TEST_MENU));
beforeAll(async () => {
  server = await createTestServer();
  await loadMockSeedData('restaurant');
});

afterAll(async () => {
  await testCasesClosingTasks();
});

describe('Petpooja Push Menu Categories (Sub Category) Test Cases', () => {
  test('Sending Invalid parent_category_id| Need to throw error ', async () => {
    PETPOOJA_TEST_MENU_CLONE.categories[0].parent_category_id = '50000';
    mockSendSQSMessage();
    const response = await request(server)
      .post('/food/callback/petpooja/push_menu')
      .set('Authorization', `Bearer ${petpooja_token}`)
      .send(PETPOOJA_TEST_MENU_CLONE);
    expect(response.statusCode).toBe(400);
    expect(response.body.status).toBe(false);
    expect(response.body.errors[0].message).toBe(
      'main category not found while processing petpooja sub category Pizza'
    );
    expect(response.body.errors[0].code).toBe(2019);
    PETPOOJA_TEST_MENU_CLONE.categories[0].parent_category_id = '0';
  });
  test('Sending valid push menu', async () => {
    mockEsIndexData();
    const response = await request(server)
      .post('/food/callback/petpooja/push_menu')
      .set('Authorization', `Bearer ${petpooja_token}`)
      .send(PETPOOJA_TEST_MENU_CLONE);
    expect(response.body).toStrictEqual({
      success: '1',
      message: 'Menu items are successfully listed.',
    });

    //read sub category
    const read_sub_category = await DB.read('sub_category')
      .select('*')
      .where({pos_partner: 'petpooja'})
      .orderBy('id');
    expect(read_sub_category.length).toBe(3);
    expect(read_sub_category).toStrictEqual([
      {
        id: 1,
        name: 'Pizza',
        main_category_id: 3,
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
        main_category_id: 2,
        created_at: expect.anything(),
        updated_at: expect.anything(),
        is_deleted: false,
        pos_id: '72560',
        pos_partner: 'petpooja',
        sequence: 1,
        discount_rate: 0,
        discount_updated_at: null,
        discount_updated_user_id: null,
        discount_updated_user_type: null,
      },
      {
        id: 3,
        name: 'Panner Starters',
        main_category_id: 2,
        created_at: expect.anything(),
        updated_at: expect.anything(),
        is_deleted: false,
        pos_id: '72544',
        pos_partner: 'petpooja',
        sequence: 2,
        discount_rate: 0,
        discount_updated_at: null,
        discount_updated_user_id: null,
        discount_updated_user_type: null,
      },
    ]);
  });
  test('Deleting existing sub category', async () => {
    PETPOOJA_TEST_MENU_CLONE.categories = [
      {
        categoryid: '72560',
        active: '1',
        categoryrank: '1',
        parent_category_id: '1',
        categoryname: 'Tandoori Starters',
        categorytimings: '',
        category_image_url: '',
      },
      {
        categoryid: '72544',
        active: '1',
        categoryrank: '1',
        parent_category_id: '1',
        categoryname: 'Panner Starters',
        categorytimings: '',
        category_image_url: '',
      },
    ];
    PETPOOJA_TEST_MENU_CLONE.items.pop();

    mockEsIndexData();
    const response = await request(server)
      .post('/food/callback/petpooja/push_menu')
      .set('Authorization', `Bearer ${petpooja_token}`)
      .send(PETPOOJA_TEST_MENU_CLONE);
    expect(response.body).toStrictEqual({
      success: '1',
      message: 'Menu items are successfully listed.',
    });

    //read sub category
    const read_sub_category = await DB.read('sub_category')
      .select('*')
      .where({pos_partner: 'petpooja'})
      .orderBy('id');
    expect(read_sub_category.length).toBe(3);
    expect(read_sub_category).toStrictEqual([
      {
        id: 1,
        name: 'Pizza',
        main_category_id: 3,
        created_at: expect.anything(),
        updated_at: expect.anything(),
        is_deleted: true,
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
        main_category_id: 2,
        created_at: expect.anything(),
        updated_at: expect.anything(),
        is_deleted: false,
        pos_id: '72560',
        pos_partner: 'petpooja',
        sequence: 1,
        discount_rate: 0,
        discount_updated_at: null,
        discount_updated_user_id: null,
        discount_updated_user_type: null,
      },
      {
        id: 3,
        name: 'Panner Starters',
        main_category_id: 2,
        created_at: expect.anything(),
        updated_at: expect.anything(),
        is_deleted: false,
        pos_id: '72544',
        pos_partner: 'petpooja',
        sequence: 2,
        discount_rate: 0,
        discount_updated_at: null,
        discount_updated_user_id: null,
        discount_updated_user_type: null,
      },
    ]);

    //read sub category menu items
    const read_menu_items = await DB.read('menu_item')
      .select('*')
      .where({pos_partner: 'petpooja'})
      .orderBy('id');
    expect(read_menu_items.length).toBe(3);
    expect(read_menu_items).toStrictEqual([
      {
        allow_long_distance: true,
        created_at: expect.anything(),
        description: '',
        disable: false,
        external_id: null,
        id: 1,
        image: null,
        is_deleted: false,
        is_spicy: false,
        item_cgst: 2.5,
        item_igst: 0,
        item_inclusive: false,
        item_sgst_utgst: 2.5,
        name: 'Pudina Chaap',
        next_available_after: null,
        packing_charges: 0,
        pos_id: '10464639',
        pos_partner: 'petpooja',
        price: 375,
        restaurant_id: '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
        sequence: 1,
        serves_how_many: 1,
        service_charges: 0,
        sub_category_id: 3,
        tax_applied_on: 'core',
        updated_at: expect.anything(),
        veg_egg_non: 'veg',
        discount_rate: 0,
        discount_updated_at: null,
        discount_updated_user_id: null,
        discount_updated_user_type: null,
      },
      {
        allow_long_distance: true,
        created_at: expect.anything(),
        description: '',
        disable: false,
        external_id: null,
        id: 2,
        image: {
          url: 'https://online-logo.thumb_2022_06_13_13_52_58_Afghani_Chaap.jpg',
        },
        is_deleted: false,
        is_spicy: false,
        item_cgst: 2.5,
        item_igst: 0,
        item_inclusive: false,
        item_sgst_utgst: 2.5,
        name: 'Afghani Chaap',
        next_available_after: null,
        packing_charges: 0,
        pos_id: '10464922',
        pos_partner: 'petpooja',
        price: 355,
        restaurant_id: '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
        sequence: 1,
        serves_how_many: 1,
        service_charges: 0,
        sub_category_id: 2,
        tax_applied_on: 'core',
        updated_at: expect.anything(),
        veg_egg_non: 'veg',
        discount_rate: 0,
        discount_updated_at: null,
        discount_updated_user_id: null,
        discount_updated_user_type: null,
      },
      {
        allow_long_distance: true,
        created_at: expect.anything(),
        description: '',
        disable: false,
        external_id: null,
        id: 3,
        image: null,
        is_deleted: true,
        is_spicy: false,
        item_cgst: 2.5,
        item_igst: 0,
        item_inclusive: false,
        item_sgst_utgst: 2.5,
        name: 'Arrosteo Bells Pizza',
        next_available_after: null,
        packing_charges: 0,
        pos_id: '10464621',
        pos_partner: 'petpooja',
        price: 0,
        restaurant_id: '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
        sequence: 1,
        serves_how_many: 1,
        service_charges: 0,
        sub_category_id: 1,
        tax_applied_on: 'core',
        updated_at: expect.anything(),
        veg_egg_non: 'veg',
        discount_rate: 0,
        discount_updated_at: null,
        discount_updated_user_id: null,
        discount_updated_user_type: null,
      },
    ]);

    PETPOOJA_TEST_MENU_CLONE = JSON.parse(JSON.stringify(PETPOOJA_TEST_MENU));
  });

  test('Adding new sub category and new item in that sub category', async () => {
    PETPOOJA_TEST_MENU_CLONE.categories = [
      {
        categoryid: '72561',
        active: '1',
        categoryrank: '1',
        parent_category_id: '1',
        categoryname: 'Burgers',
        categorytimings: '',
        category_image_url: '',
      },
      {
        categoryid: '72560',
        active: '1',
        categoryrank: '1',
        parent_category_id: '1',
        categoryname: 'Tandoori Starters',
        categorytimings: '',
        category_image_url: '',
      },
      {
        categoryid: '72544',
        active: '1',
        categoryrank: '1',
        parent_category_id: '1',
        categoryname: 'Panner Starters',
        categorytimings: '',
        category_image_url: '',
      },
    ];
    PETPOOJA_TEST_MENU_CLONE.items.pop();
    PETPOOJA_TEST_MENU_CLONE.items.push({
      itemid: '10464647',
      itemallowvariation: '0',
      itemrank: '1',
      item_categoryid: '72561',
      item_ordertype: '1,2,3',
      item_packingcharges: '0',
      itemallowaddon: '0',
      itemaddonbasedon: '0',
      item_favorite: '0',
      ignore_taxes: '0',
      ignore_discounts: '0',
      in_stock: '1',
      cuisine: [],
      variation_groupname: '',
      variation: [],
      addon: [],
      itemname: 'Veg Burger',
      item_attributeid: '1',
      itemdescription: '',
      minimumpreparationtime: '',
      price: '200.00',
      active: '1',
      item_image_url: '',
      item_tax: '1983,1984',
    });

    mockEsIndexData();
    const response = await request(server)
      .post('/food/callback/petpooja/push_menu')
      .set('Authorization', `Bearer ${petpooja_token}`)
      .send(PETPOOJA_TEST_MENU_CLONE);
    expect(response.body).toStrictEqual({
      success: '1',
      message: 'Menu items are successfully listed.',
    });

    //read sub category
    const read_sub_category = await DB.read('sub_category')
      .select('*')
      .where({pos_partner: 'petpooja'})
      .orderBy('id');
    expect(read_sub_category.length).toBe(4);
    expect(read_sub_category).toStrictEqual([
      {
        id: 1,
        name: 'Pizza',
        main_category_id: 3,
        created_at: expect.anything(),
        updated_at: expect.anything(),
        is_deleted: true,
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
        main_category_id: 2,
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
        main_category_id: 2,
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
      {
        id: 4,
        name: 'Burgers',
        main_category_id: 2,
        created_at: expect.anything(),
        updated_at: expect.anything(),
        is_deleted: false,
        pos_id: '72561',
        pos_partner: 'petpooja',
        sequence: 1,
        discount_rate: 0,
        discount_updated_at: null,
        discount_updated_user_id: null,
        discount_updated_user_type: null,
      },
    ]);

    //read sub category menu items
    const read_menu_items = await DB.read('menu_item')
      .select('*')
      .where({pos_partner: 'petpooja'})
      .orderBy('id');
    expect(read_menu_items.length).toBe(4);
    expect(read_menu_items).toStrictEqual([
      {
        allow_long_distance: true,
        created_at: expect.anything(),
        description: '',
        disable: false,
        external_id: null,
        id: 1,
        image: null,
        is_deleted: false,
        is_spicy: false,
        item_cgst: 2.5,
        item_igst: 0,
        item_inclusive: false,
        item_sgst_utgst: 2.5,
        name: 'Pudina Chaap',
        next_available_after: null,
        packing_charges: 0,
        pos_id: '10464639',
        pos_partner: 'petpooja',
        price: 375,
        restaurant_id: '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
        sequence: 1,
        serves_how_many: 1,
        service_charges: 0,
        sub_category_id: 3,
        tax_applied_on: 'core',
        updated_at: expect.anything(),
        veg_egg_non: 'veg',
        discount_rate: 0,
        discount_updated_at: null,
        discount_updated_user_id: null,
        discount_updated_user_type: null,
      },
      {
        allow_long_distance: true,
        created_at: expect.anything(),
        description: '',
        disable: false,
        external_id: null,
        id: 2,
        image: {
          url: 'https://online-logo.thumb_2022_06_13_13_52_58_Afghani_Chaap.jpg',
        },
        is_deleted: false,
        is_spicy: false,
        item_cgst: 2.5,
        item_igst: 0,
        item_inclusive: false,
        item_sgst_utgst: 2.5,
        name: 'Afghani Chaap',
        next_available_after: null,
        packing_charges: 0,
        pos_id: '10464922',
        pos_partner: 'petpooja',
        price: 355,
        restaurant_id: '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
        sequence: 1,
        serves_how_many: 1,
        service_charges: 0,
        sub_category_id: 2,
        tax_applied_on: 'core',
        updated_at: expect.anything(),
        veg_egg_non: 'veg',
        discount_rate: 0,
        discount_updated_at: null,
        discount_updated_user_id: null,
        discount_updated_user_type: null,
      },
      {
        allow_long_distance: true,
        created_at: expect.anything(),
        description: '',
        disable: false,
        external_id: null,
        id: 3,
        image: null,
        is_deleted: true,
        is_spicy: false,
        item_cgst: 2.5,
        item_igst: 0,
        item_inclusive: false,
        item_sgst_utgst: 2.5,
        name: 'Arrosteo Bells Pizza',
        next_available_after: null,
        packing_charges: 0,
        pos_id: '10464621',
        pos_partner: 'petpooja',
        price: 0,
        restaurant_id: '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
        sequence: 1,
        serves_how_many: 1,
        service_charges: 0,
        sub_category_id: 1,
        tax_applied_on: 'core',
        updated_at: expect.anything(),
        veg_egg_non: 'veg',
        discount_rate: 0,
        discount_updated_at: null,
        discount_updated_user_id: null,
        discount_updated_user_type: null,
      },
      {
        allow_long_distance: true,
        created_at: expect.anything(),
        description: '',
        disable: false,
        external_id: null,
        id: 4,
        image: null,
        is_deleted: false,
        is_spicy: false,
        item_cgst: 2.5,
        item_igst: 0,
        item_inclusive: false,
        item_sgst_utgst: 2.5,
        name: 'Veg Burger',
        next_available_after: null,
        packing_charges: 0,
        pos_id: '10464647',
        pos_partner: 'petpooja',
        price: 200,
        restaurant_id: '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
        sequence: 1,
        serves_how_many: 1,
        service_charges: 0,
        sub_category_id: 4,
        tax_applied_on: 'core',
        updated_at: expect.anything(),
        veg_egg_non: 'veg',
        discount_rate: 0,
        discount_updated_at: null,
        discount_updated_user_id: null,
        discount_updated_user_type: null,
      },
    ]);

    PETPOOJA_TEST_MENU_CLONE = JSON.parse(JSON.stringify(PETPOOJA_TEST_MENU));
  });
});
