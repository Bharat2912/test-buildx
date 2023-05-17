import request from 'supertest';
import {Application} from 'express';
import {createTestServer} from '../../utils/init';
import {
  loadMockSeedData,
  signToken,
  testCasesClosingTasks,
} from '../../utils/utils';
import {DB} from '../../../data/knex';
import moment from 'moment';
import {mockEsIndexData} from '../../utils/mock_services';
import {PETPOOJA_TEST_MENU} from '../constant';

jest.mock('axios');

let server: Application;
const petpooja_token = 'petpooja_token';
let vendor_token: string;
const PETPOOJA_TEST_MENU_CLONE = JSON.parse(JSON.stringify(PETPOOJA_TEST_MENU));

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

describe('Petpooja Addon on/off item', () => {
  test('In and Out of stock by item availability petpooja api', async () => {
    mockEsIndexData();
    const response = await request(server)
      .post('/food/callback/petpooja/push_menu')
      .set('Authorization', `Bearer ${petpooja_token}`)
      .send(PETPOOJA_TEST_MENU_CLONE);
    expect(response.body).toStrictEqual({
      success: '1',
      message: 'Menu items are successfully listed.',
    });
    const current_time = moment();
    const addon_next_available_after = moment().add(2, 'days');
    const addon_out_stock = await request(server)
      .post('/food/callback/petpooja/item_out_of_stock')
      .set('Authorization', `Bearer ${petpooja_token}`)
      .send({
        restID: 'ps82kz7f',
        type: 'addon',
        inStock: false,
        itemID: ['28415'],
        autoTurnOnTime: 'custom',
        customTurnOnTime: addon_next_available_after.format('YYYY-MM-DD HH:mm'),
      });
    expect(addon_out_stock.body.status).toBe('success');
    expect(addon_out_stock.body.message).toBe(
      'Stock status updated successfully'
    );

    const reading_out_stock_addon = await DB.read
      .from('addon')
      .where({pos_id: '28415'});

    expect(
      moment(reading_out_stock_addon[0].next_available_after).format(
        'YYYY-MM-DD HH:mm'
      )
    ).toEqual(addon_next_available_after.format('YYYY-MM-DD HH:mm'));

    const get_out_stock_addon_by_id = await request(server)
      .get('/food/vendor/menu/addon?addon_group_id=1')
      .set('Authorization', `Bearer ${vendor_token}`);
    expect(get_out_stock_addon_by_id.body.status).toBe(true);
    expect(get_out_stock_addon_by_id.statusCode).toBe(200);
    expect(get_out_stock_addon_by_id.body.result).toStrictEqual([
      {
        restaurant_id: '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
        id: 1,
        addon_group_id: 1,
        name: 'Coffee',
        sequence: 2,
        price: 63.75,
        veg_egg_non: 'veg',
        in_stock: true,
        sgst_rate: 0,
        cgst_rate: 0,
        igst_rate: 0,
        gst_inclusive: true,
        external_id: null,
        next_available_after: null,
      },
      {
        restaurant_id: '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
        id: 2,
        addon_group_id: 1,
        name: 'Salt Fresh Lime Soda',
        sequence: 3,
        price: 68,
        veg_egg_non: 'veg',
        in_stock: true,
        sgst_rate: 0,
        cgst_rate: 0,
        igst_rate: 0,
        gst_inclusive: true,
        external_id: null,
        next_available_after: null,
      },
      {
        restaurant_id: '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
        id: 3,
        addon_group_id: 1,
        name: 'Sweet Fresh Lime Soda',
        sequence: 4,
        price: 68,
        veg_egg_non: 'veg',
        in_stock: true,
        sgst_rate: 0,
        cgst_rate: 0,
        igst_rate: 0,
        gst_inclusive: true,
        external_id: null,
        next_available_after: expect.anything(),
      },
      {
        restaurant_id: '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
        id: 4,
        addon_group_id: 1,
        name: 'Virgin Mojito',
        sequence: 5,
        price: 110.5,
        veg_egg_non: 'veg',
        in_stock: true,
        sgst_rate: 0,
        cgst_rate: 0,
        igst_rate: 0,
        gst_inclusive: true,
        external_id: null,
        next_available_after: null,
      },
    ]);

    expect(
      moment(
        get_out_stock_addon_by_id.body.result[2].next_available_after
      ).format('YYYY-MM-DD HH:mm')
    ).toBe(addon_next_available_after.format('YYYY-MM-DD HH:mm'));

    const addon_in_stock = await request(server)
      .post('/food/callback/petpooja/item_in_stock')
      .set('Authorization', `Bearer ${petpooja_token}`)
      .send({
        restID: 'ps82kz7f',
        type: 'addon',
        inStock: true,
        itemID: ['28415'],
        autoTurnOnTime: 'custom',
        customTurnOnTime: current_time.format('YYYY-MM-DD HH:mm'),
      });

    expect(addon_in_stock.statusCode).toBe(200);
    expect(addon_in_stock.body.status).toBe('success');
    expect(addon_in_stock.body.message).toBe(
      'Stock status updated successfully'
    );

    const reading_in_stock_addon = await DB.read
      .from('addon')
      .where({pos_id: '28415'});
    expect(reading_in_stock_addon[0].next_available_after).toEqual(null);

    const get_in_stock_addon_by_id = await request(server)
      .get('/food/vendor/menu/addon?addon_group_id=1')
      .set('Authorization', `Bearer ${vendor_token}`);
    expect(get_in_stock_addon_by_id.body.status).toBe(true);
    expect(get_in_stock_addon_by_id.statusCode).toBe(200);
    expect(get_in_stock_addon_by_id.body.result).toStrictEqual([
      {
        restaurant_id: '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
        id: 1,
        addon_group_id: 1,
        name: 'Coffee',
        sequence: 2,
        price: 63.75,
        veg_egg_non: 'veg',
        in_stock: true,
        sgst_rate: 0,
        cgst_rate: 0,
        igst_rate: 0,
        gst_inclusive: true,
        external_id: null,
        next_available_after: null,
      },
      {
        restaurant_id: '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
        id: 2,
        addon_group_id: 1,
        name: 'Salt Fresh Lime Soda',
        sequence: 3,
        price: 68,
        veg_egg_non: 'veg',
        in_stock: true,
        sgst_rate: 0,
        cgst_rate: 0,
        igst_rate: 0,
        gst_inclusive: true,
        external_id: null,
        next_available_after: null,
      },
      {
        restaurant_id: '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
        id: 3,
        addon_group_id: 1,
        name: 'Sweet Fresh Lime Soda',
        sequence: 4,
        price: 68,
        veg_egg_non: 'veg',
        in_stock: true,
        sgst_rate: 0,
        cgst_rate: 0,
        igst_rate: 0,
        gst_inclusive: true,
        external_id: null,
        next_available_after: null,
      },
      {
        restaurant_id: '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
        id: 4,
        addon_group_id: 1,
        name: 'Virgin Mojito',
        sequence: 5,
        price: 110.5,
        veg_egg_non: 'veg',
        in_stock: true,
        sgst_rate: 0,
        cgst_rate: 0,
        igst_rate: 0,
        gst_inclusive: true,
        external_id: null,
        next_available_after: null,
      },
    ]);
  });
});
