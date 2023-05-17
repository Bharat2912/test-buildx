import request from 'supertest';
import {Application} from 'express';
import {createTestServer} from '../../../utils/init';
import {
  loadMockSeedData,
  signToken,
  testCasesClosingTasks,
} from '../../../utils/utils';
import {mockGetMatrix} from '../../../mocks/map_mocks';
import {mockGenerateDownloadFileURL} from '../../../mocks/s3_mocks';
import {RestaurantSortBy} from '../../../../module/food/restaurant/enums';
import {SortOrder} from '../../../../enum';
import {mockgetAdminDetails} from '../../../utils/mock_services';
import moment from 'moment';
import {clearIndex} from '../../../../utilities/es_manager';
import {initEsIndexService} from '../../../../module/food/service';

jest.mock('axios');

let server: Application;
let admin_token: string;
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

  admin_token = signToken({
    id: '64bfafb6-c273-4b64-a0fc-ca981f5819eb',
    user_type: 'admin',
  });
});

afterAll(async () => {
  await testCasesClosingTasks();
  //elastic search
  await clearIndex('restaurant');
  await clearIndex('menu_item');
});

describe('Sort By Popularity', () => {
  test('In desc order', async () => {
    /***
     *  '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242' 100 orders - online - 2 rank
     *  'b0909e52-a731-4665-a791-ee6479008805' 228 orders - offline - 3 rank
     *  '609a460e-6316-417e-9e87-836bfbcded0f' 124 orders - no subscription - will not come in response
     *  '77e53c1f-6e9e-4724-9ba7-92edc69cff6b' 1000047 orders - online - 1 rank
     */

    const generate_url_mock = mockGenerateDownloadFileURL();

    const get_map_matrix_mock = mockGetMatrix(4);

    mockgetAdminDetails();
    const response = await request(server)
      .post(
        '/food/admin/restaurant/b0909e52-a731-4665-a791-ee6479008805/createHolidaySlot'
      )
      .set('Authorization', `Bearer ${admin_token}`)
      .send({
        end_epoch: moment().add(2, 'day').unix(),
      });
    expect(response.body.status).toBe(true);
    expect(response.body.statusCode).toBe(200);
    expect(response.body.message).toBe('Successful Response');
    expect(response.body.result.restaurant_id).toBe(
      'b0909e52-a731-4665-a791-ee6479008805'
    );

    const page_0_response = await request(server)
      .post('/food/restaurant/filter')
      .send({
        filter: {
          sort_by: RestaurantSortBy.ORDER_COUNT,
          sort_direction: SortOrder.DESCENDING,
        },
        coordinates: {
          lat: 19.15844,
          long: 72.89168,
        },
        pagination: {
          page_index: 0,
          page_size: 1,
        },
      });

    expect(page_0_response.statusCode).toBe(200);
    expect(page_0_response.body.status).toBe(true);
    expect(page_0_response.body.result.total_pages).toEqual(3);
    expect(page_0_response.body.result.restaurants.length).toEqual(1);
    expect(page_0_response.body.result.restaurants[0].id).toBe(
      '77e53c1f-6e9e-4724-9ba7-92edc69cff6b'
    );

    expect(get_map_matrix_mock).toBeCalledTimes(1);
    expect(generate_url_mock).toBeCalledTimes(3);

    const page_1_response = await request(server)
      .post('/food/restaurant/filter')
      .send({
        filter: {
          sort_by: RestaurantSortBy.ORDER_COUNT,
          sort_direction: SortOrder.DESCENDING,
        },
        coordinates: {
          lat: 19.15844,
          long: 72.89168,
        },
        pagination: {
          page_index: 1,
          page_size: 1,
        },
      });

    expect(page_1_response.statusCode).toBe(200);
    expect(page_1_response.body.status).toBe(true);
    expect(page_1_response.body.result.total_pages).toEqual(3);
    expect(page_1_response.body.result.restaurants.length).toEqual(1);
    expect(page_1_response.body.result.restaurants[0].id).toBe(
      '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242'
    );

    expect(get_map_matrix_mock).toBeCalledTimes(2);
    expect(generate_url_mock).toBeCalledTimes(6);

    const page_2_response = await request(server)
      .post('/food/restaurant/filter')
      .send({
        filter: {
          sort_by: RestaurantSortBy.ORDER_COUNT,
          sort_direction: SortOrder.DESCENDING,
        },
        coordinates: {
          lat: 19.15844,
          long: 72.89168,
        },
        pagination: {
          page_index: 2,
          page_size: 1,
        },
      });

    expect(page_2_response.statusCode).toBe(200);
    expect(page_2_response.body.status).toBe(true);
    expect(page_2_response.body.result.total_pages).toEqual(3);
    expect(page_2_response.body.result.restaurants.length).toEqual(1);
    expect(page_2_response.body.result.restaurants[0].id).toBe(
      'b0909e52-a731-4665-a791-ee6479008805'
    );

    expect(get_map_matrix_mock).toBeCalledTimes(3);
    expect(generate_url_mock).toBeCalledTimes(10);

    expect(
      page_0_response.body.result.restaurants[0].orders_count
    ).toBeGreaterThan(page_1_response.body.result.restaurants[0].orders_count);

    if (
      page_1_response.body.result.restaurants[0].availability.is_open &&
      page_2_response.body.result.restaurants[0].availability.is_open
    ) {
      expect(
        page_1_response.body.result.restaurants[0].orders_count
      ).toBeGreaterThan(
        page_2_response.body.result.restaurants[0].orders_count
      );
    }
  });
});
