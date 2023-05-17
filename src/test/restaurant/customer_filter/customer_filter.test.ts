import request from 'supertest';
import {Application} from 'express';
import {createTestServer} from '../../utils/init';
import {loadMockSeedData, testCasesClosingTasks} from '../../utils/utils';
import {mockGetMatrix} from '../../mocks/map_mocks';
import {mockGetServiceableRestaurant} from '../../mocks/elastic_search_mock';
import {mockGenerateDownloadFileURL} from '../../mocks/s3_mocks';

jest.mock('axios');

let server: Application;

beforeAll(async () => {
  server = await createTestServer();
  await loadMockSeedData('cuisine');
  await loadMockSeedData('language');
  await loadMockSeedData('city');
  await loadMockSeedData('polygon');
  await loadMockSeedData('restaurant');
  await loadMockSeedData('time_slot');
  await loadMockSeedData('subscription');
  await loadMockSeedData('coupon');
});

afterAll(async () => {
  await testCasesClosingTasks();
});

describe('POST /food/restaurant/filter', () => {
  test('Successful Response without filters', async () => {
    const es_restaurants = [
      {
        id: '77e53c1f-6e9e-4724-9ba7-92edc69cff6b',
        name: 'BurgerKing',
        cuisine_ids: ['bafad85e-3f7f-496f-9851-6070275609e9'],
        cuisine_names: ['Burgers'],
        default_preparation_time: 15,
        coordinates: {
          lat: 19.15844,
          lon: 72.89168,
        },
        lat: 19.15844,
        long: 72.89168,
        status: 'active',
      },
      {
        id: 'b0909e52-a731-4665-a791-ee6479008805',
        name: 'Burger King',
        cuisine_ids: ['bafad85e-3f7f-496f-9851-6070275609e9'],
        cuisine_names: ['Burgers'],
        default_preparation_time: 15,
        coordinates: {
          lat: 19.15844,
          lon: 72.89168,
        },
        lat: 19.15844,
        long: 72.89168,
        status: 'active',
      },
    ];
    const generate_url_mock = mockGenerateDownloadFileURL();
    const es_get_serviceable_restaurant_mock =
      mockGetServiceableRestaurant(es_restaurants);
    const get_map_matrix_mock = mockGetMatrix(2);
    const response = await request(server)
      .post('/food/restaurant/filter')
      .send({
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
    expect(response.body.result.restaurants.length).toEqual(2);
    expect(response.body.result.restaurants[0]).toHaveProperty(
      'delivery_time_in_seconds'
    );
    expect(response.body.result.restaurants[0]).toHaveProperty(
      'delivery_distance_in_meters'
    );
    expect(response.body.result.restaurants[0]).toHaveProperty(
      'delivery_time_string'
    );
    expect(response.body.result.restaurants[0]).toHaveProperty(
      'delivery_distance_string'
    );

    expect(response.body.result.restaurants[0].like_count_label).toBe('1.0M');
    expect(response.body.result.restaurants[0].like_count).toBe(1000000);
    expect(response.body.result.restaurants[0].name).toBe('BurgerKing');
    expect(response.body.result.restaurants[0].branch_name).toBe(
      'BurgerKing Mumbai(S)'
    );

    expect(response.body.result.restaurants[1].coupons[0].id).toBe(3000);
    expect(response.body.result.restaurants[1].coupons[0].sequence).toBe(1);
    expect(response.body.result.restaurants[1].coupons[1].id).toBe(9000);
    expect(response.body.result.restaurants[1].coupons[1].sequence).toBe(2);
    expect(response.body.result.restaurants[1].coupons[2].id).toBe(20);
    expect(response.body.result.restaurants[1].coupons[2].sequence).toBe(null);

    expect(es_get_serviceable_restaurant_mock).toBeCalledTimes(1);
    expect(get_map_matrix_mock).toBeCalledTimes(1);
    expect(generate_url_mock).toBeCalledTimes(7);
  });
});
