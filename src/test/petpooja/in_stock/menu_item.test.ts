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

describe('Petpooja Menu Item on/off item', () => {
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
    const menu_item_next_available_after = moment().add(2, 'days');

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
        customTurnOnTime:
          menu_item_next_available_after.format('YYYY-MM-DD HH:mm'),
      });
    expect(item_out_of_stock.body.status).toBe('success');
    expect(item_out_of_stock.body.message).toBe(
      'Stock status updated successfully'
    );

    const read_out_off_stock_menu_item = await DB.read
      .from('menu_item')
      .where({pos_id: '10464639'});
    expect(
      moment(read_out_off_stock_menu_item[0].next_available_after).format(
        'YYYY-MM-DD HH:mm'
      )
    ).toBe(menu_item_next_available_after.format('YYYY-MM-DD HH:mm'));

    const get_out_off_stock_menu_item = await request(server)
      .get(`/food/vendor/menu/menu_item/${read_out_off_stock_menu_item[0].id}`)
      .set('Authorization', `Bearer ${vendor_token}`);
    expect(get_out_off_stock_menu_item.body.status).toBe(true);
    expect(get_out_off_stock_menu_item.statusCode).toBe(200);
    expect(
      moment(
        get_out_off_stock_menu_item.body.result.next_available_after
      ).format('YYYY-MM-DD HH:mm')
    ).toBe(menu_item_next_available_after.format('YYYY-MM-DD HH:mm'));

    // if restID is not added in request it throws 500 error
    const item_in_of_stock = await request(server)
      .post('/food/callback/petpooja/item_in_stock')
      .set('Authorization', `Bearer ${petpooja_token}`)
      .send({
        restID: 'ps82kz7f',
        type: 'item',
        inStock: true,
        itemID: ['10464639'],
        autoTurnOnTime: 'custom',
        customTurnOnTime: current_time.format('YYYY-MM-DD HH:mm'),
      });
    expect(item_in_of_stock.body.status).toBe('success');
    expect(item_in_of_stock.body.message).toBe(
      'Stock status updated successfully'
    );

    const read_in_stock_menu_item = await DB.read
      .from('menu_item')
      .where({pos_id: '10464639'});
    expect(read_in_stock_menu_item[0].next_available_after).toBe(null);

    const get_in_stock_menu_item = await request(server)
      .get(`/food/vendor/menu/menu_item/${read_in_stock_menu_item[0].id}`)
      .set('Authorization', `Bearer ${vendor_token}`);
    expect(get_in_stock_menu_item.body.status).toBe(true);
    expect(get_in_stock_menu_item.statusCode).toBe(200);
    expect(get_in_stock_menu_item.body.result.next_available_after).toBe(null);
  });
});
