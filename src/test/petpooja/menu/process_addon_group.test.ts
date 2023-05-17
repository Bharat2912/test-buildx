import request from 'supertest';
import {Application} from 'express';
import {createTestServer} from '../../utils/init';
import {loadMockSeedData, testCasesClosingTasks} from '../../utils/utils';
import {DB} from '../../../data/knex';
import {PETPOOJA_TEST_MENU} from '../constant';
import {mockEsIndexData} from '../../utils/mock_services';

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

describe('Petpooja Push Menu Items (Menu items) Test Cases', () => {
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
  });
  test('Deleting existing addon group', async () => {
    PETPOOJA_TEST_MENU_CLONE.addongroups = [
      {
        addongroupid: '8382',
        addongroup_rank: '1',
        active: '1',
        addongroupitems: [
          {
            addonitemid: '28411',
            addonitem_name: 'Coffee',
            addonitem_price: '63.75',
            active: '1',
            attributes: '1',
            addonitem_rank: '2',
          },
          {
            addonitemid: '28413',
            addonitem_name: 'Salt Fresh Lime Soda',
            addonitem_price: '68',
            active: '1',
            attributes: '1',
            addonitem_rank: '3',
          },
          {
            addonitemid: '28415',
            addonitem_name: 'Sweet Fresh Lime Soda',
            addonitem_price: '68',
            active: '1',
            attributes: '1',
            addonitem_rank: '4',
          },
          {
            addonitemid: '28417',
            addonitem_name: 'Virgin Mojito',
            addonitem_price: '110.5',
            active: '1',
            attributes: '1',
            addonitem_rank: '5',
          },
        ],
        addongroup_name: 'Beverages',
      },
      {
        addongroupid: '8383',
        addongroup_rank: '2',
        active: '1',
        addongroupitems: [
          {
            addonitemid: '28419',
            addonitem_name: 'Manchow Soup',
            addonitem_price: '106.25',
            active: '1',
            attributes: '1',
            addonitem_rank: '1',
          },
          {
            addonitemid: '28421',
            addonitem_name: 'Hot And Sour Soup',
            addonitem_price: '106.25',
            active: '1',
            attributes: '1',
            addonitem_rank: '2',
          },
        ],
        addongroup_name: 'Sides',
      },
      {
        addongroupid: '8385',
        addongroup_rank: '4',
        active: '1',
        addongroupitems: [
          {
            addonitemid: '28451',
            addonitem_name: 'Cheesy Loaded Fries',
            addonitem_price: '170',
            active: '1',
            attributes: '1',
            addonitem_rank: '1',
          },
        ],
        addongroup_name: 'Addons Starters',
      },
    ];

    mockEsIndexData();
    const response = await request(server)
      .post('/food/callback/petpooja/push_menu')
      .set('Authorization', `Bearer ${petpooja_token}`)
      .send(PETPOOJA_TEST_MENU_CLONE);
    expect(response.body).toStrictEqual({
      success: '1',
      message: 'Menu items are successfully listed.',
    });

    //read menu item
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
        is_deleted: false,
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

    //read menu item variants groups
    const read_menu_item_variant_groups = await DB.read('item_variant_group')
      .select('*')
      .where({pos_partner: 'petpooja'})
      .orderBy('id');
    expect(read_menu_item_variant_groups.length).toBe(1);
    expect(read_menu_item_variant_groups).toStrictEqual([
      {
        created_at: expect.anything(),
        id: 1,
        is_deleted: false,
        menu_item_id: 3,
        name: 'Size',
        pos_id: 'Size_10464621',
        pos_partner: 'petpooja',
        sequence: 1,
        updated_at: expect.anything(),
      },
    ]);

    //read menu item variants
    const read_menu_item_variants = await DB.read('item_variant')
      .select('*')
      .where({pos_partner: 'petpooja'})
      .orderBy('id');
    expect(read_menu_item_variants.length).toBe(2);
    expect(read_menu_item_variants).toStrictEqual([
      {
        created_at: expect.anything(),
        id: 1,
        in_stock: true,
        is_default: true,
        is_deleted: false,
        name: '8 Inch',
        next_available_after: null,
        pos_id: '7218',
        pos_partner: 'petpooja',
        pos_variant_item_id: '10464958',
        price: 290,
        sequence: 1,
        serves_how_many: 1,
        updated_at: expect.anything(),
        variant_group_id: 1,
        veg_egg_non: 'veg',
      },
      {
        created_at: expect.anything(),
        id: 2,
        in_stock: true,
        is_default: false,
        is_deleted: false,
        name: '12 Inch',
        next_available_after: null,
        pos_id: '7219',
        pos_partner: 'petpooja',
        pos_variant_item_id: '10464959',
        price: 505,
        sequence: 2,
        serves_how_many: 1,
        updated_at: expect.anything(),
        variant_group_id: 1,
        veg_egg_non: 'veg',
      },
    ]);

    //read  addons groups
    const read_addon_group = await DB.read('addon_group').select('*');

    expect(read_addon_group.length).toBe(4);
    expect(read_addon_group).toStrictEqual([
      {
        created_at: expect.anything(),
        id: 1,
        is_deleted: false,
        name: 'Beverages',
        pos_id: '8382',
        pos_partner: 'petpooja',
        restaurant_id: '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
        updated_at: expect.anything(),
      },
      {
        created_at: expect.anything(),
        id: 2,
        is_deleted: false,
        name: 'Sides',
        pos_id: '8383',
        pos_partner: 'petpooja',
        restaurant_id: '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
        updated_at: expect.anything(),
      },
      {
        created_at: expect.anything(),
        id: 4,
        is_deleted: false,
        name: 'Addons Starters',
        pos_id: '8385',
        pos_partner: 'petpooja',
        restaurant_id: '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
        updated_at: expect.anything(),
      },
      {
        created_at: expect.anything(),
        id: 3,
        is_deleted: true,
        name: 'Starters Add Ons',
        pos_id: '8384',
        pos_partner: 'petpooja',
        restaurant_id: '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
        updated_at: expect.anything(),
      },
    ]);

    //read  addons
    const read_addons = await DB.read('addon').select('*');
    expect(read_addons.length).toBe(10);
    expect(read_addons).toStrictEqual([
      {
        addon_group_id: 1,
        cgst_rate: 0,
        created_at: expect.anything(),
        external_id: null,
        gst_inclusive: true,
        id: 1,
        igst_rate: 0,
        in_stock: true,
        is_deleted: false,
        name: 'Coffee',
        next_available_after: null,
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
        is_deleted: false,
        name: 'Salt Fresh Lime Soda',
        next_available_after: null,
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
        is_deleted: false,
        name: 'Sweet Fresh Lime Soda',
        next_available_after: null,
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
        is_deleted: false,
        name: 'Virgin Mojito',
        next_available_after: null,
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
        is_deleted: false,
        name: 'Manchow Soup',
        next_available_after: null,
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
        is_deleted: false,
        name: 'Hot And Sour Soup',
        next_available_after: null,
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
        addon_group_id: 4,
        cgst_rate: 0,
        created_at: expect.anything(),
        external_id: null,
        gst_inclusive: true,
        id: 10,
        igst_rate: 0,
        in_stock: true,
        is_deleted: false,
        name: 'Cheesy Loaded Fries',
        next_available_after: null,
        pos_id: '28451',
        pos_partner: 'petpooja',
        price: 170,
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
        id: 7,
        igst_rate: 0,
        in_stock: true,
        is_deleted: true,
        name: 'Paneer Achari Tikka',
        next_available_after: null,
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
        is_deleted: true,
        name: 'Paneer Tikka',
        next_available_after: null,
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
        is_deleted: true,
        name: 'Aloo Stuffed',
        next_available_after: null,
        pos_id: '28475',
        pos_partner: 'petpooja',
        price: 272,
        sequence: 3,
        sgst_rate: 0,
        status: 'active',
        updated_at: expect.anything(),
        veg_egg_non: 'veg',
      },
    ]);

    //read menu item addons groups
    const read_menu_item_item_addon_group = await DB.read(
      'item_addon_group'
    ).select('*');

    expect(read_menu_item_item_addon_group.length).toBe(3);
    expect(read_menu_item_item_addon_group).toStrictEqual([
      {
        addon_group_id: 1,
        created_at: expect.anything(),
        free_limit: -1,
        max_limit: 4,
        menu_item_id: 2,
        min_limit: 0,
        sequence: 1,
        updated_at: expect.anything(),
      },
      {
        addon_group_id: 2,
        created_at: expect.anything(),
        free_limit: -1,
        max_limit: 2,
        menu_item_id: 2,
        min_limit: 0,
        sequence: 1,
        updated_at: expect.anything(),
      },
      {
        addon_group_id: 4,
        created_at: expect.anything(),
        free_limit: -1,
        max_limit: 1,
        menu_item_id: 2,
        min_limit: 0,
        sequence: 1,
        updated_at: expect.anything(),
      },
    ]);

    //read menu item addons
    const read_menu_item_addon = await DB.read('item_addon').select('*');

    expect(read_menu_item_addon.length).toBe(7);
    expect(read_menu_item_addon).toStrictEqual([
      {
        addon_id: 1,
        menu_item_id: 2,
      },
      {
        addon_id: 2,
        menu_item_id: 2,
      },
      {
        addon_id: 3,
        menu_item_id: 2,
      },
      {
        addon_id: 4,
        menu_item_id: 2,
      },
      {
        addon_id: 5,
        menu_item_id: 2,
      },
      {
        addon_id: 6,
        menu_item_id: 2,
      },
      {
        addon_id: 10,
        menu_item_id: 2,
      },
    ]);

    PETPOOJA_TEST_MENU_CLONE = JSON.parse(JSON.stringify(PETPOOJA_TEST_MENU));
  });

  test('Adding new addon group', async () => {
    PETPOOJA_TEST_MENU_CLONE.addongroups = [
      {
        addongroupid: '8382',
        addongroup_rank: '1',
        active: '1',
        addongroupitems: [
          {
            addonitemid: '28411',
            addonitem_name: 'Coffee',
            addonitem_price: '63.75',
            active: '1',
            attributes: '1',
            addonitem_rank: '2',
          },
          {
            addonitemid: '28413',
            addonitem_name: 'Salt Fresh Lime Soda',
            addonitem_price: '68',
            active: '1',
            attributes: '1',
            addonitem_rank: '3',
          },
          {
            addonitemid: '28415',
            addonitem_name: 'Sweet Fresh Lime Soda',
            addonitem_price: '68',
            active: '1',
            attributes: '1',
            addonitem_rank: '4',
          },
          {
            addonitemid: '28417',
            addonitem_name: 'Virgin Mojito',
            addonitem_price: '110.5',
            active: '1',
            attributes: '1',
            addonitem_rank: '5',
          },
        ],
        addongroup_name: 'Beverages',
      },
      {
        addongroupid: '8383',
        addongroup_rank: '2',
        active: '1',
        addongroupitems: [
          {
            addonitemid: '28419',
            addonitem_name: 'Manchow Soup',
            addonitem_price: '106.25',
            active: '1',
            attributes: '1',
            addonitem_rank: '1',
          },
          {
            addonitemid: '28421',
            addonitem_name: 'Hot And Sour Soup',
            addonitem_price: '106.25',
            active: '1',
            attributes: '1',
            addonitem_rank: '2',
          },
        ],
        addongroup_name: 'Sides',
      },
      {
        addongroupid: '8385',
        addongroup_rank: '4',
        active: '1',
        addongroupitems: [
          {
            addonitemid: '28451',
            addonitem_name: 'Cheesy Loaded Fries',
            addonitem_price: '170',
            active: '1',
            attributes: '1',
            addonitem_rank: '1',
          },
        ],
        addongroup_name: 'Addons Starters',
      },
      {
        addongroupid: '8395',
        addongroup_rank: '5',
        active: '1',
        addongroupitems: [
          {
            addonitemid: '28461',
            addonitem_name: 'Slice',
            addonitem_price: '45',
            active: '1',
            attributes: '1',
            addonitem_rank: '1',
          },
        ],
        addongroup_name: 'Cold Drinks',
      },
    ];

    mockEsIndexData();
    const response = await request(server)
      .post('/food/callback/petpooja/push_menu')
      .set('Authorization', `Bearer ${petpooja_token}`)
      .send(PETPOOJA_TEST_MENU_CLONE);
    expect(response.body).toStrictEqual({
      success: '1',
      message: 'Menu items are successfully listed.',
    });

    //read menu item
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
        is_deleted: false,
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

    //read menu item variants groups
    const read_menu_item_variant_groups = await DB.read('item_variant_group')
      .select('*')
      .where({pos_partner: 'petpooja'})
      .orderBy('id');
    expect(read_menu_item_variant_groups.length).toBe(1);
    expect(read_menu_item_variant_groups).toStrictEqual([
      {
        created_at: expect.anything(),
        id: 1,
        is_deleted: false,
        menu_item_id: 3,
        name: 'Size',
        pos_id: 'Size_10464621',
        pos_partner: 'petpooja',
        sequence: 1,
        updated_at: expect.anything(),
      },
    ]);

    //read menu item variants
    const read_menu_item_variants = await DB.read('item_variant')
      .select('*')
      .where({pos_partner: 'petpooja'})
      .orderBy('id');
    expect(read_menu_item_variants.length).toBe(2);
    expect(read_menu_item_variants).toStrictEqual([
      {
        created_at: expect.anything(),
        id: 1,
        in_stock: true,
        is_default: true,
        is_deleted: false,
        name: '8 Inch',
        next_available_after: null,
        pos_id: '7218',
        pos_partner: 'petpooja',
        pos_variant_item_id: '10464958',
        price: 290,
        sequence: 1,
        serves_how_many: 1,
        updated_at: expect.anything(),
        variant_group_id: 1,
        veg_egg_non: 'veg',
      },
      {
        created_at: expect.anything(),
        id: 2,
        in_stock: true,
        is_default: false,
        is_deleted: false,
        name: '12 Inch',
        next_available_after: null,
        pos_id: '7219',
        pos_partner: 'petpooja',
        pos_variant_item_id: '10464959',
        price: 505,
        sequence: 2,
        serves_how_many: 1,
        updated_at: expect.anything(),
        variant_group_id: 1,
        veg_egg_non: 'veg',
      },
    ]);

    //read  addons groups
    const read_addon_group = await DB.read('addon_group').select('*');

    expect(read_addon_group.length).toBe(5);
    expect(read_addon_group).toStrictEqual([
      {
        created_at: expect.anything(),
        id: 3,
        is_deleted: true,
        name: 'Starters Add Ons',
        pos_id: '8384',
        pos_partner: 'petpooja',
        restaurant_id: '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
        updated_at: expect.anything(),
      },
      {
        created_at: expect.anything(),
        id: 5,
        is_deleted: false,
        name: 'Cold Drinks',
        pos_id: '8395',
        pos_partner: 'petpooja',
        restaurant_id: '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
        updated_at: expect.anything(),
      },
      {
        created_at: expect.anything(),
        id: 1,
        is_deleted: false,
        name: 'Beverages',
        pos_id: '8382',
        pos_partner: 'petpooja',
        restaurant_id: '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
        updated_at: expect.anything(),
      },
      {
        created_at: expect.anything(),
        id: 2,
        is_deleted: false,
        name: 'Sides',
        pos_id: '8383',
        pos_partner: 'petpooja',
        restaurant_id: '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
        updated_at: expect.anything(),
      },
      {
        created_at: expect.anything(),
        id: 4,
        is_deleted: false,
        name: 'Addons Starters',
        pos_id: '8385',
        pos_partner: 'petpooja',
        restaurant_id: '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
        updated_at: expect.anything(),
      },
    ]);

    //read  addons
    const read_addons = await DB.read('addon').select('*');
    expect(read_addons.length).toBe(11);
    expect(read_addons).toStrictEqual([
      {
        addon_group_id: 3,
        cgst_rate: 0,
        created_at: expect.anything(),
        external_id: null,
        gst_inclusive: true,
        id: 7,
        igst_rate: 0,
        in_stock: true,
        is_deleted: true,
        name: 'Paneer Achari Tikka',
        next_available_after: null,
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
        is_deleted: true,
        name: 'Paneer Tikka',
        next_available_after: null,
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
        is_deleted: true,
        name: 'Aloo Stuffed',
        next_available_after: null,
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
        addon_group_id: 5,
        cgst_rate: 0,
        created_at: expect.anything(),
        external_id: null,
        gst_inclusive: true,
        id: 11,
        igst_rate: 0,
        in_stock: true,
        is_deleted: false,
        name: 'Slice',
        next_available_after: null,
        pos_id: '28461',
        pos_partner: 'petpooja',
        price: 45,
        sequence: 1,
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
        id: 1,
        igst_rate: 0,
        in_stock: true,
        is_deleted: false,
        name: 'Coffee',
        next_available_after: null,
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
        is_deleted: false,
        name: 'Salt Fresh Lime Soda',
        next_available_after: null,
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
        is_deleted: false,
        name: 'Sweet Fresh Lime Soda',
        next_available_after: null,
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
        is_deleted: false,
        name: 'Virgin Mojito',
        next_available_after: null,
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
        is_deleted: false,
        name: 'Manchow Soup',
        next_available_after: null,
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
        is_deleted: false,
        name: 'Hot And Sour Soup',
        next_available_after: null,
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
        addon_group_id: 4,
        cgst_rate: 0,
        created_at: expect.anything(),
        external_id: null,
        gst_inclusive: true,
        id: 10,
        igst_rate: 0,
        in_stock: true,
        is_deleted: false,
        name: 'Cheesy Loaded Fries',
        next_available_after: null,
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

    //read menu item addons groups
    const read_menu_item_item_addon_group = await DB.read(
      'item_addon_group'
    ).select('*');

    expect(read_menu_item_item_addon_group.length).toBe(3);
    expect(read_menu_item_item_addon_group).toStrictEqual([
      {
        addon_group_id: 1,
        created_at: expect.anything(),
        free_limit: -1,
        max_limit: 4,
        menu_item_id: 2,
        min_limit: 0,
        sequence: 1,
        updated_at: expect.anything(),
      },
      {
        addon_group_id: 2,
        created_at: expect.anything(),
        free_limit: -1,
        max_limit: 2,
        menu_item_id: 2,
        min_limit: 0,
        sequence: 1,
        updated_at: expect.anything(),
      },
      {
        addon_group_id: 4,
        created_at: expect.anything(),
        free_limit: -1,
        max_limit: 1,
        menu_item_id: 2,
        min_limit: 0,
        sequence: 1,
        updated_at: expect.anything(),
      },
    ]);

    //read menu item addons
    const read_menu_item_addon = await DB.read('item_addon').select('*');

    expect(read_menu_item_addon.length).toBe(7);
    expect(read_menu_item_addon).toStrictEqual([
      {
        addon_id: 1,
        menu_item_id: 2,
      },
      {
        addon_id: 2,
        menu_item_id: 2,
      },
      {
        addon_id: 3,
        menu_item_id: 2,
      },
      {
        addon_id: 4,
        menu_item_id: 2,
      },
      {
        addon_id: 5,
        menu_item_id: 2,
      },
      {
        addon_id: 6,
        menu_item_id: 2,
      },
      {
        addon_id: 10,
        menu_item_id: 2,
      },
    ]);

    PETPOOJA_TEST_MENU_CLONE = JSON.parse(JSON.stringify(PETPOOJA_TEST_MENU));
  });
});
