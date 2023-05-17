import request from 'supertest';
import {Application} from 'express';
import {createTestServer} from '../../utils/init';
import {loadMockSeedData, testCasesClosingTasks} from '../../utils/utils';
import {mockGetMatrix} from '../../mocks/map_mocks';
import {mockGenerateDownloadFileURL} from '../../mocks/s3_mocks';
import {clearIndex} from '../../../utilities/es_manager';
import {initEsIndexService} from '../../../module/food/service';

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

  await initEsIndexService();
});

afterAll(async () => {
  await testCasesClosingTasks();

  //elastic search
  await clearIndex('restaurant');
  await clearIndex('menu_item');
});

describe('Cuisine ids filter', () => {
  test('giving 3 cusinies', async () => {
    const generate_url_mock = mockGenerateDownloadFileURL();

    const get_map_matrix_mock = mockGetMatrix(4);

    const response = await request(server)
      .post('/food/restaurant/filter')
      .send({
        filter: {
          cuisine_ids: [
            'faad6b3e-f786-4325-9a64-ce0f4d240959',
            'bafad85e-3f7f-496f-9851-6070275609e9',
          ],
        },
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
    expect(response.body.result.restaurants.length).toEqual(3);

    const expected_restaurant_ids = [
      'b0909e52-a731-4665-a791-ee6479008805',
      '77e53c1f-6e9e-4724-9ba7-92edc69cff6b',
      '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
    ];

    expect(
      expected_restaurant_ids.includes(response.body.result.restaurants[0].id)
    ).toBe(true);
    expect(
      expected_restaurant_ids.includes(response.body.result.restaurants[1].id)
    ).toBe(true);
    expect(
      expected_restaurant_ids.includes(response.body.result.restaurants[2].id)
    ).toBe(true);

    expect(get_map_matrix_mock).toBeCalledTimes(1);
    expect(generate_url_mock).toBeCalledTimes(10);
  });

  test('giving cusinie id which does not match with any restaurant', async () => {
    const generate_url_mock = mockGenerateDownloadFileURL();

    const get_map_matrix_mock = mockGetMatrix(4);

    const response = await request(server)
      .post('/food/restaurant/filter')
      .send({
        filter: {
          cuisine_ids: ['065b32fb-2264-4393-8e5b-f862e1a3a695'],
        },
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
    expect(response.body.result.total_pages).toEqual(0);
    expect(response.body.result.restaurants.length).toEqual(0);

    expect(get_map_matrix_mock).toBeCalledTimes(1);
    expect(generate_url_mock).toBeCalledTimes(0);
  });
});
