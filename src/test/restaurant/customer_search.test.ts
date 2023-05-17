import request from 'supertest';
import {Application} from 'express';
import {createTestServer} from '../utils/init';
import {loadMockSeedData, testCasesClosingTasks} from '../utils/utils';
import {mockGetMatrix} from '../mocks/map_mocks';
import {mockGenerateDownloadFileURL} from '../mocks/s3_mocks';
import {clearIndex} from '../../utilities/es_manager';
import {initEsIndexService} from '../../module/food/service';

let server: Application;

beforeAll(async () => {
  server = await createTestServer();

  await loadMockSeedData('cuisine');
  await loadMockSeedData('language');
  await loadMockSeedData('city');
  await loadMockSeedData('polygon');
  await loadMockSeedData('restaurant');
  await loadMockSeedData('restaurant_menu');
  await loadMockSeedData('time_slot');
  await loadMockSeedData('subscription');
  await loadMockSeedData('coupon');

  await initEsIndexService();
});

afterAll(async () => {
  await testCasesClosingTasks();

  //elastic search
  await clearIndex('restaurant');
  await clearIndex('menu_item');
});
describe('POST /food/search', () => {
  test('Successful Response when provided search string', async () => {
    const generate_url_mock = mockGenerateDownloadFileURL();

    const get_map_matrix_mock = mockGetMatrix(2);
    const response = await request(server)
      .post('/food/search')
      .send({
        searchText: 'burger',
        coordinates: {
          lat: 19.15844,
          long: 72.89168,
        },
        pagination: {
          page_index: 0,
          page_size: 10,
        },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe(true);
    expect(response.body.result.total_pages).toEqual(1);
    expect(response.body.result.restaurant.length).toBe(2);
    expect(response.body.result.restaurant[0].menu_items.length).toBe(0);
    expect(response.body.result.restaurant[1].menu_items.length).toBe(1);
    expect(
      response.body.result.restaurant[1].menu_items[0].menu_item_name
    ).toBe('Veg Burger');
    expect(response.body.result.restaurant[0]).toHaveProperty(
      'delivery_time_in_seconds'
    );
    expect(response.body.result.restaurant[0]).toHaveProperty(
      'delivery_distance_in_meters'
    );
    expect(response.body.result.restaurant[0]).toHaveProperty(
      'delivery_time_string'
    );
    expect(response.body.result.restaurant[0]).toHaveProperty(
      'delivery_distance_string'
    );
    expect(response.body.result.restaurant[0]).toHaveProperty('branch_name');
    expect(response.body.result.restaurant[0]).toHaveProperty('name');
    expect(response.body.result.restaurant[0].like_count_label).toBe('1.0M');
    expect(response.body.result.restaurant[0].like_count).toBe(1000000);
    expect(response.body.result.restaurant[0].name).toBe('BurgerKing');
    expect(response.body.result.restaurant[0].branch_name).toBe(
      'BurgerKing Mumbai(S)'
    );

    //Coupon Sequence Test
    expect(response.body.result.restaurant[1].coupons[0].id).toBe(3000);
    expect(response.body.result.restaurant[1].coupons[0].sequence).toBe(1);
    expect(response.body.result.restaurant[1].coupons[1].id).toBe(9000);
    expect(response.body.result.restaurant[1].coupons[1].sequence).toBe(2);
    expect(response.body.result.restaurant[1].coupons[2].id).toBe(20);
    expect(response.body.result.restaurant[1].coupons[2].sequence).toBe(null);

    expect(get_map_matrix_mock).toBeCalledTimes(1);
    expect(generate_url_mock).toBeCalledTimes(7);
  });

  test('Error when search string is empty', async () => {
    const generate_url_mock = mockGenerateDownloadFileURL();

    const get_map_matrix_mock = mockGetMatrix(4);
    const response = await request(server)
      .post('/food/search')
      .send({
        searchText: '',
        coordinates: {
          lat: 19.15844,
          long: 72.89168,
        },
        pagination: {
          page_index: 0,
          page_size: 10,
        },
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.status).toBe(false);
    expect(response.body.errors).toStrictEqual([
      {message: '"searchText" is not allowed to be empty', code: 0},
    ]);

    expect(get_map_matrix_mock).toBeCalledTimes(0);
    expect(generate_url_mock).toBeCalledTimes(0);
  });
});
