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

describe('Cost for two filter', () => {
  test('between 100 to 1000', async () => {
    const generate_url_mock = mockGenerateDownloadFileURL();

    const get_map_matrix_mock = mockGetMatrix(4);
    const response = await request(server)
      .post('/food/restaurant/filter')
      .send({
        filter: {
          cost_lt: 1001,
          cost_gt: 99,
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
    expect(response.body.result.restaurants.length).toEqual(2);

    const expected_restaurant_ids = [
      '77e53c1f-6e9e-4724-9ba7-92edc69cff6b',
      '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
    ];

    expect(
      expected_restaurant_ids.includes(response.body.result.restaurants[0].id)
    ).toBe(true);
    expect(
      expected_restaurant_ids.includes(response.body.result.restaurants[1].id)
    ).toBe(true);

    expect(get_map_matrix_mock).toBeCalledTimes(1);
    expect(generate_url_mock).toBeCalledTimes(6);
  });

  test('between 2000 to 3000', async () => {
    const generate_url_mock = mockGenerateDownloadFileURL();

    const get_map_matrix_mock = mockGetMatrix(4);
    const response = await request(server)
      .post('/food/restaurant/filter')
      .send({
        filter: {
          cost_lt: 3000,
          cost_gt: 1999,
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
