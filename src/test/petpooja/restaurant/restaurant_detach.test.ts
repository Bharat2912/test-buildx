import request from 'supertest';
import {Application} from 'express';
import {createTestServer} from '../../utils/init';
import {
  closeTestDBConnection,
  dropTestDatabase,
  loadMockSeedData,
  signToken,
} from '../../utils/utils';
import {DB, stopDB} from '../../../data/knex';
import {closeRedisConnection} from '../../../utilities/cache_manager';
import {mockgetAdminDetails} from '../../utils/mock_services';
import {PosStatus} from '../../../module/food/petpooja/enum';
import {PosPartner} from '../../../module/food/enum';
jest.mock('axios');

let server: Application;
let admin_token: string;
const restaurant_id = '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242';

beforeAll(async () => {
  server = await createTestServer();
  await loadMockSeedData('restaurant');
  await loadMockSeedData('petpooja_restaurant_menu');
  admin_token = signToken({
    id: '64bfafb6-c273-4b64-a0fc-ca981f5819eb',
    user_type: 'admin',
  });
});

afterAll(async () => {
  await closeRedisConnection();
  await stopDB();
  await dropTestDatabase();
  await closeTestDBConnection();
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
});

describe('Petpooja Detach Restaurant', () => {
  test('POST /food/admin/petpooja/detach/{restaurant_id}', async () => {
    const onboarded_restaurant = await DB.read('restaurant')
      .select('*')
      .where({id: restaurant_id});
    expect(onboarded_restaurant.length).toBe(1);
    expect(onboarded_restaurant[0].pos_id).toBe('ps82kz7f');
    expect(onboarded_restaurant[0].pos_name).toBe('petpooja speedyy');
    expect(onboarded_restaurant[0].pos_partner).toBe(PosPartner.PETPOOJA);

    const onboarded_petpooja_restaurant = await DB.read('petpooja_restaurant')
      .select('*')
      .where({id: restaurant_id});
    expect(onboarded_petpooja_restaurant.length).toBe(1);
    expect(onboarded_petpooja_restaurant[0].pos_status).toBe(
      PosStatus.ONBOARDED
    );

    const onboarded_petpooja_tax = await DB.read('petpooja_tax')
      .select('*')
      .where({restaurant_id: restaurant_id});
    expect(onboarded_petpooja_tax.length).toBe(2);

    const onboarded_petpooja_item_tax = await DB.read('petpooja_item_tax')
      .select('*')
      .where({restaurant_id: restaurant_id});
    expect(onboarded_petpooja_item_tax.length).toBe(6);

    const onboarded_main_categories = await DB.read('main_category')
      .select('*')
      .where({restaurant_id: restaurant_id, is_deleted: false});
    expect(onboarded_main_categories.length).toBe(1);
    expect(onboarded_main_categories[0].pos_id).not.toBeNull();
    expect(onboarded_main_categories[0].pos_partner).toBe(PosPartner.PETPOOJA);

    const onboarded_sub_categories = await DB.read('sub_category')
      .select('*')
      .where({
        main_category_id: onboarded_main_categories[0].id,
        is_deleted: false,
      });
    expect(onboarded_sub_categories.length).toBe(3);
    const sub_categories_ids: number[] = [];
    onboarded_sub_categories.map(sub_category => {
      sub_categories_ids.push(sub_category.id);
      expect(sub_category.pos_id).not.toBeNull();
      expect(sub_category.pos_partner).toBe(PosPartner.PETPOOJA);
    });

    const onboarded_addon_groups = await DB.read('addon_group')
      .select('*')
      .where({restaurant_id: restaurant_id, is_deleted: false});
    expect(onboarded_addon_groups.length).toBe(4);
    const addon_groups_ids: number[] = [];
    onboarded_addon_groups.map(addon_group => {
      addon_groups_ids.push(addon_group.id);
      expect(addon_group.pos_id).not.toBeNull();
      expect(addon_group.pos_partner).not.toBeNull();
    });

    const onboarded_addons = await DB.read('addon')
      .select('*')
      .where({is_deleted: false})
      .whereIn('addon_group_id', addon_groups_ids);
    expect(onboarded_addons.length).toBe(10);
    onboarded_addons.map(addon => {
      expect(addon.pos_id).not.toBeNull();
      expect(addon.pos_partner).not.toBeNull();
    });

    const onboarded_menu_items = await DB.read('menu_item')
      .select('*')
      .where({is_deleted: false})
      .whereIn('sub_category_id', sub_categories_ids);
    expect(onboarded_menu_items.length).toBe(3);
    const menu_items_ids: number[] = [];
    onboarded_menu_items.map(menu_item => {
      menu_items_ids.push(menu_item.id);
      expect(menu_item.pos_id).not.toBeNull();
      expect(menu_item.pos_partner).toBe(PosPartner.PETPOOJA);
    });

    const onboarded_item_variant_groups = await DB.read('item_variant_group')
      .select('*')
      .where({is_deleted: false})
      .whereIn('menu_item_id', menu_items_ids);
    expect(onboarded_item_variant_groups.length).toBe(1);
    const item_variant_groups_ids: number[] = [];
    onboarded_item_variant_groups.map(item_variant_group => {
      item_variant_groups_ids.push(item_variant_group.id);
      expect(item_variant_group.pos_id).not.toBeNull();
      expect(item_variant_group.pos_partner).toBe(PosPartner.PETPOOJA);
    });

    const onboarded_item_variants = await DB.read('item_variant')
      .select('*')
      .where({is_deleted: false})
      .whereIn('variant_group_id', item_variant_groups_ids);
    expect(onboarded_item_variants.length).toBe(2);
    onboarded_item_variants.map(item_variant => {
      expect(item_variant.pos_id).not.toBeNull();
      expect(item_variant.pos_partner).toBe(PosPartner.PETPOOJA);
    });

    const onboarded_item_addon_groups = await DB.read('item_addon_group')
      .select('*')
      .whereIn('menu_item_id', menu_items_ids);
    expect(onboarded_item_addon_groups.length).toBe(4);

    const onboarded_item_addons = await DB.read('item_addon')
      .select('*')
      .whereIn('menu_item_id', menu_items_ids);
    expect(onboarded_item_addons.length).toBe(10);

    /*DETACHING RESTAUARANT BELOW*/
    const mock_get_admin_details = mockgetAdminDetails();
    const response = await request(server)
      .post(`/food/admin/petpooja/detach/${restaurant_id}`)
      .set('Authorization', `Bearer ${admin_token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe(
      'Restaurant has been successfully detached'
    );
    expect(mock_get_admin_details).toHaveBeenCalled();

    const detched_restaurant = await DB.read('restaurant')
      .select('*')
      .where({id: restaurant_id});
    expect(detched_restaurant.length).toBe(1);
    expect(detched_restaurant[0].pos_id).toBeNull();
    expect(detched_restaurant[0].pos_partner).toBeNull();
    expect(detched_restaurant[0].pos_name).toBeNull();

    const detached_petpooja_restaurant = await DB.read('petpooja_restaurant')
      .select('*')
      .where({id: restaurant_id});
    expect(detached_petpooja_restaurant.length).toBe(1);
    expect(detached_petpooja_restaurant[0].pos_status).toBe(PosStatus.DETACHED);

    const detached_petpooja_tax = await DB.read('petpooja_tax')
      .select('*')
      .where({restaurant_id: restaurant_id});
    expect(detached_petpooja_tax.length).toBe(0);

    const detached_petpooja_item_tax = await DB.read('petpooja_item_tax')
      .select('*')
      .where({restaurant_id: restaurant_id});
    expect(detached_petpooja_item_tax.length).toBe(0);

    const detached_main_categories = await DB.read('main_category')
      .select('*')
      .where({restaurant_id: restaurant_id, is_deleted: false});
    expect(detached_main_categories.length).toBe(1);
    expect(detached_main_categories[0].pos_id).toBeNull();
    expect(detached_main_categories[0].pos_partner).toBeNull();

    const detached_sub_categories = await DB.read('sub_category')
      .select('*')
      .where({
        main_category_id: detached_main_categories[0].id,
        is_deleted: false,
      });
    expect(detached_sub_categories.length).toBe(3);

    const addon_groups = await DB.read('addon_group')
      .select('*')
      .where({restaurant_id: restaurant_id, is_deleted: false});
    expect(addon_groups.length).toBe(4);
    addon_groups.map(addon_group => {
      expect(addon_group.pos_id).toBeNull();
      expect(addon_group.pos_partner).toBeNull();
    });

    const addons = await DB.read('addon')
      .select('*')
      .where({is_deleted: false})
      .whereIn('addon_group_id', addon_groups_ids);
    expect(addons.length).toBe(10);
    addons.map(addon => {
      expect(addon.pos_id).toBeNull();
      expect(addon.pos_partner).toBeNull();
    });

    const menu_items = await DB.read('menu_item')
      .select('*')
      .where({is_deleted: false})
      .whereIn('sub_category_id', sub_categories_ids);
    expect(menu_items.length).toBe(3);
    menu_items.map(menu_item => {
      expect(menu_item.pos_id).toBeNull();
      expect(menu_item.pos_partner).toBeNull();
    });

    const item_variant_groups = await DB.read('item_variant_group')
      .select('*')
      .where({is_deleted: false})
      .whereIn('menu_item_id', menu_items_ids);
    expect(item_variant_groups.length).toBe(1);
    item_variant_groups.map(item_variant_group => {
      expect(item_variant_group.pos_id).toBeNull();
      expect(item_variant_group.pos_partner).toBeNull();
    });

    const item_variants = await DB.read('item_variant')
      .select('*')
      .where({is_deleted: false})
      .whereIn('variant_group_id', item_variant_groups_ids);
    expect(item_variants.length).toBe(2);
    item_variants.map(item_variant => {
      expect(item_variant.pos_id).toBeNull();
      expect(item_variant.pos_partner).toBeNull();
    });

    const item_addon_groups = await DB.read('item_addon_group')
      .select('*')
      .whereIn('menu_item_id', menu_items_ids);
    expect(item_addon_groups.length).toBe(4);

    const item_addons = await DB.read('item_addon')
      .select('*')
      .whereIn('menu_item_id', menu_items_ids);
    expect(item_addons.length).toBe(10);
  });
});
