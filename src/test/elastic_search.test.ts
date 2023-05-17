import request from 'supertest';
import {createTestServer} from './utils/init';
import {Application} from 'express';
import {
  signToken,
  loadMockSeedData,
  testCasesClosingTasks,
} from './utils/utils';
import {
  mockgenerateDownloadFileURL,
  mockgetAdminDetails,
  mockgetMapMatrix,
} from './utils/mock_services';
import {clearIndex} from '../utilities/es_manager';
import {mockGetMatrix} from './mocks/map_mocks';
jest.mock('axios');

let server: Application;
let admin_token: string;
const punjabi_cuisine_id = ['b5af8efa-88f4-4993-aa34-eb149de8440b'];
const south_cuisine_id = ['171e0d02-eafc-413b-be7a-ffc28624880f'];
const punjabi_restaurant_near_location = {
  lat: 72.34563,
  long: 23.01197,
};
const punjabi_restaurant_far_location = {
  lat: 19.138731,
  long: 72.96697,
};
const punjabi_restaurant_id = 'b0909e52-a731-4665-a791-ee6479008805';
const south_restaurant_near_location = {
  long: 18.30297,
  lat: 73.50447,
};
const south_restaurant_id = '77e53c1f-6e9e-4724-9ba7-92edc69cff6b';
beforeAll(async () => {
  process.env.LOCAL_RUN = 'true';
  server = await createTestServer();

  await loadMockSeedData('elastic_search');
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

describe('Elastic Search Testing :-', () => {
  test('Resturant Filter Testing :-', async () => {
    /*=============================
      *INITIALIZE ELASTIC SET UP
    =============================== */
    const mock_get_admin_details = mockgetAdminDetails();
    const response = await request(server)
      .post('/food/init_es_index')
      .set('Authorization', `Bearer ${admin_token}`);
    expect(response.body.status).toBe(true);
    expect(response.body.statusCode).toBe(200);
    expect(response.body.message).toBe(
      'Elastic search Inital indexing completed'
    );
    expect(response.body.result).toStrictEqual({
      menu_item_documents_count: 4,
      restaurant_documents_count: 3,
    });
    expect(mock_get_admin_details).toHaveBeenCalledTimes(1);

    /*============================
          *TOO FAR LOCATION
    ============================== */
    mockGetMatrix(1);
    const filter_by_coordinates_response = await request(server)
      .post('/food/restaurant/filter')
      .send({
        coordinates: punjabi_restaurant_far_location,
      });
    expect(filter_by_coordinates_response.body.status).toBe(true);
    expect(filter_by_coordinates_response.body.statusCode).toBe(200);
    expect(filter_by_coordinates_response.body.message).toBe(
      'Successful Response'
    );
    expect(
      filter_by_coordinates_response.body.result.restaurants.length
    ).toEqual(0);

    /*====================================
          *NEAR LOCATION | MATCH CUISINE
    ====================================== */
    const mock_matrix_distance = mockgetMapMatrix();

    const filter_success_response_generate_url = mockgenerateDownloadFileURL();
    const filter_success_response = await request(server)
      .post('/food/restaurant/filter')
      .send({
        filter: {
          cuisine_ids: punjabi_cuisine_id,
        },
        coordinates: punjabi_restaurant_near_location,
      });
    expect(filter_success_response.body.status).toBe(true);
    expect(filter_success_response.body.statusCode).toBe(200);
    expect(filter_success_response.body.message).toBe('Successful Response');
    expect(filter_success_response.body.result.restaurants.length).toEqual(1);
    expect(filter_success_response.body.result.restaurants[0].id).toBe(
      punjabi_restaurant_id
    );
    expect(filter_success_response_generate_url).toHaveBeenCalled();
    expect(mock_matrix_distance).toHaveBeenCalledTimes(2);

    /*====================================
          *NEAR LOCATION | NOT MATCH CUISINE
    ====================================== */
    const filter_by_cuision_fail = await request(server)
      .post('/food/restaurant/filter')
      .send({
        filter: {
          cuisine_ids: south_cuisine_id,
        },
        coordinates: punjabi_restaurant_near_location,
      });
    expect(filter_by_cuision_fail.body.status).toBe(true);
    expect(filter_by_cuision_fail.body.statusCode).toBe(200);
    expect(filter_by_cuision_fail.body.message).toBe('Successful Response');
    expect(filter_by_cuision_fail.body.result.restaurants.length).toEqual(0);

    /*=====================
        *NEAR LOCATION
        *COST MATCHING
        *RESTURANT CLOSED
    ========================*/
    const filter_by_restaurant_slot_generate_url =
      mockgenerateDownloadFileURL();
    const filter_by_restaurant_slot = await request(server)
      .post('/food/restaurant/filter')
      .send({
        coordinates: south_restaurant_near_location,
        filter: {cost_gt: 500},
      });
    expect(filter_by_restaurant_slot.body.status).toBe(true);
    expect(filter_by_restaurant_slot.body.statusCode).toBe(200);
    expect(filter_by_restaurant_slot.body.message).toBe('Successful Response');
    expect(filter_by_restaurant_slot.body.result.restaurants[0].id).toBe(
      south_restaurant_id
    );
    expect(
      filter_by_restaurant_slot.body.result.restaurants[0].availability.is_open
    ).toBe(false);
    expect(filter_by_restaurant_slot_generate_url).toHaveBeenCalled();
    expect(mock_matrix_distance).toHaveBeenCalledTimes(4);

    /*================================
        *NEAR LOCATION
        *COST MATCHING
        *RESTURANT OPEN
    ==================================*/
    const filter_by_restaurant_slot_success_generate_url =
      mockgenerateDownloadFileURL();
    const filter_by_restaurant_slot_success = await request(server)
      .post('/food/restaurant/filter')
      .send({
        coordinates: punjabi_restaurant_near_location,
        filter: {cost_lt: 1000},
      });
    expect(filter_by_restaurant_slot_success.body.status).toBe(true);
    expect(filter_by_restaurant_slot_success.body.statusCode).toBe(200);
    expect(filter_by_restaurant_slot_success.body.message).toBe(
      'Successful Response'
    );
    expect(
      filter_by_restaurant_slot_success.body.result.restaurants.length
    ).toEqual(1);
    expect(
      filter_by_restaurant_slot_success.body.result.restaurants[0].id
    ).toBe(punjabi_restaurant_id);
    expect(
      filter_by_restaurant_slot_success.body.result.restaurants[0].availability
        .is_open
    ).toBe(true);
    expect(mock_matrix_distance).toHaveBeenCalledTimes(5);
    expect(filter_by_restaurant_slot_success_generate_url).toHaveBeenCalled();
  });
});
