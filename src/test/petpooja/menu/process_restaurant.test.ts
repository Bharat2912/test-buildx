import request from 'supertest';
import {Application} from 'express';
import {createTestServer} from '../../utils/init';
import {loadMockSeedData, testCasesClosingTasks} from '../../utils/utils';
import {DB} from '../../../data/knex';
import {PETPOOJA_TEST_MENU} from '../constant';
import {
  PetPoojaPackagingApplicableOn,
  PetPoojaPackagingChargeType,
} from '../../../module/food/petpooja/enum';
import {mockEsIndexData} from '../../utils/mock_services';

jest.mock('axios');

let server: Application;
const petpooja_token = 'petpooja_token';

beforeAll(async () => {
  server = await createTestServer();

  await loadMockSeedData('restaurant');
});

afterAll(async () => {
  await testCasesClosingTasks();
});

describe('Petpooja Push Menu Restaurant Test Cases', () => {
  test('Empty menusharingcode | Need to throw error ', async () => {
    PETPOOJA_TEST_MENU.restaurants[0].details.menusharingcode = '';
    const response = await request(server)
      .post('/food/callback/petpooja/push_menu')
      .set('Authorization', `Bearer ${petpooja_token}`)
      .send(PETPOOJA_TEST_MENU);
    expect(response.statusCode).toBe(400);
    expect(response.body.status).toBe(false);
    expect(response.body.errors).toStrictEqual([
      {message: 'restaurant not found', code: 0},
    ]);
    PETPOOJA_TEST_MENU.restaurants[0].details.menusharingcode = 'ps82kz7f';
  });
  test('Sending Valid packaging_applicable_on to Be NONE', async () => {
    const mock_es_index_data = mockEsIndexData();
    PETPOOJA_TEST_MENU.restaurants[0].details.packaging_applicable_on =
      PetPoojaPackagingApplicableOn.NONE;
    const response = await request(server)
      .post('/food/callback/petpooja/push_menu')
      .set('Authorization', `Bearer ${petpooja_token}`)
      .send(PETPOOJA_TEST_MENU);
    expect(response.body).toStrictEqual({
      success: '1',
      message: 'Menu items are successfully listed.',
    });
    expect(mock_es_index_data).toHaveBeenCalled();
    const petpooja_restaurant_details = await DB.read('restaurant').where({
      pos_id: 'ps82kz7f',
    });
    expect(petpooja_restaurant_details[0].packing_charge_type).toBe('none');
  });
  test('Sending packaging_applicable_on Order| calculatetaxonpacking to false | Expect Sgst and Cgst to be 0', async () => {
    const mock_es_index_data = mockEsIndexData();
    PETPOOJA_TEST_MENU.restaurants[0].details.calculatetaxonpacking = 0;
    PETPOOJA_TEST_MENU.restaurants[0].details.packaging_applicable_on =
      PetPoojaPackagingApplicableOn.ORDER;
    PETPOOJA_TEST_MENU.restaurants[0].details.pc_taxes_id = '1983,1984';
    const packaging_applicable_on_response = await request(server)
      .post('/food/callback/petpooja/push_menu')
      .set('Authorization', `Bearer ${petpooja_token}`)
      .send(PETPOOJA_TEST_MENU);
    expect(packaging_applicable_on_response.body).toStrictEqual({
      success: '1',
      message: 'Menu items are successfully listed.',
    });
    expect(mock_es_index_data).toHaveBeenCalled();
    const petpooja_restaurant_details = await DB.read('restaurant').where({
      pos_id: 'ps82kz7f',
    });

    expect(petpooja_restaurant_details[0].packing_sgst_utgst).toBe(0);
    expect(petpooja_restaurant_details[0].packing_cgst).toBe(0);
    expect(petpooja_restaurant_details[0].packing_charge_type).toBe('order');
    expect(petpooja_restaurant_details[0].taxes_applicable_on_packing).toBe(
      false
    );
  });
  test('Sending Valid packaging_applicable_on Order | calculatetaxonpacking to true | Expect Sgst and Cgst to be 2.5', async () => {
    const mock_es_index_data = mockEsIndexData();

    PETPOOJA_TEST_MENU.restaurants[0].details.calculatetaxonpacking = 1;
    PETPOOJA_TEST_MENU.restaurants[0].details.packaging_applicable_on =
      PetPoojaPackagingApplicableOn.ORDER;
    PETPOOJA_TEST_MENU.restaurants[0].details.pc_taxes_id = '1983,1984';

    const packaging_applicable_on_response = await request(server)
      .post('/food/callback/petpooja/push_menu')
      .set('Authorization', `Bearer ${petpooja_token}`)
      .send(PETPOOJA_TEST_MENU);
    expect(packaging_applicable_on_response.body).toStrictEqual({
      success: '1',
      message: 'Menu items are successfully listed.',
    });
    expect(mock_es_index_data).toHaveBeenCalled();

    const petpooja_restaurant_details = await DB.read('restaurant').where({
      pos_id: 'ps82kz7f',
    });
    expect(petpooja_restaurant_details[0].packing_sgst_utgst).toBe(2.5);
    expect(petpooja_restaurant_details[0].packing_cgst).toBe(2.5);
    expect(petpooja_restaurant_details[0].packing_charge_type).toBe('order');
    expect(petpooja_restaurant_details[0].taxes_applicable_on_packing).toBe(
      true
    );

    /// Making Sgst and Cgst to 0

    PETPOOJA_TEST_MENU.restaurants[0].details.calculatetaxonpacking = 0;
    const packaging_applicable_off_response = await request(server)
      .post('/food/callback/petpooja/push_menu')
      .set('Authorization', `Bearer ${petpooja_token}`)
      .send(PETPOOJA_TEST_MENU);
    expect(packaging_applicable_off_response.body).toStrictEqual({
      success: '1',
      message: 'Menu items are successfully listed.',
    });

    const sgst_cgst_details = await DB.read('restaurant').where({
      pos_id: 'ps82kz7f',
    });
    expect(sgst_cgst_details[0].packing_sgst_utgst).toBe(0);
    expect(sgst_cgst_details[0].packing_cgst).toBe(0);
    expect(sgst_cgst_details[0].packing_charge_type).toBe('order');
    expect(sgst_cgst_details[0].taxes_applicable_on_packing).toBe(false);
  });
  test('Sending Valid packaging_applicable_on Item false | Expect Sgst and Cgst to be 0', async () => {
    const mock_es_index_data = mockEsIndexData();

    PETPOOJA_TEST_MENU.restaurants[0].details.calculatetaxonpacking = 0;
    PETPOOJA_TEST_MENU.restaurants[0].details.packaging_applicable_on =
      PetPoojaPackagingApplicableOn.ITEM;
    PETPOOJA_TEST_MENU.restaurants[0].details.pc_taxes_id = '1983,1984';

    const packaging_applicable_on_response = await request(server)
      .post('/food/callback/petpooja/push_menu')
      .set('Authorization', `Bearer ${petpooja_token}`)
      .send(PETPOOJA_TEST_MENU);
    expect(packaging_applicable_on_response.body).toStrictEqual({
      success: '1',
      message: 'Menu items are successfully listed.',
    });
    expect(mock_es_index_data).toHaveBeenCalled();
    const petpooja_restaurant_details = await DB.read('restaurant').where({
      pos_id: 'ps82kz7f',
    });
    expect(petpooja_restaurant_details[0].packing_sgst_utgst).toBe(0);
    expect(petpooja_restaurant_details[0].packing_cgst).toBe(0);
    expect(petpooja_restaurant_details[0].taxes_applicable_on_packing).toBe(
      false
    );
    expect(petpooja_restaurant_details[0].packing_charge_type).toBe('item');
  });
  test('Sending Valid packaging_applicable_on Item true | Expect Sgst and Cgst to be 2.5', async () => {
    const mock_es_index_data = mockEsIndexData();
    PETPOOJA_TEST_MENU.restaurants[0].details.calculatetaxonpacking = 1;
    PETPOOJA_TEST_MENU.restaurants[0].details.packaging_applicable_on =
      PetPoojaPackagingApplicableOn.ITEM;
    PETPOOJA_TEST_MENU.restaurants[0].details.pc_taxes_id = '1983,1984';
    const packaging_applicable_on_response = await request(server)
      .post('/food/callback/petpooja/push_menu')
      .set('Authorization', `Bearer ${petpooja_token}`)
      .send(PETPOOJA_TEST_MENU);
    expect(packaging_applicable_on_response.body).toStrictEqual({
      success: '1',
      message: 'Menu items are successfully listed.',
    });
    expect(mock_es_index_data).toHaveBeenCalled();
    const petpooja_restaurant_details = await DB.read('restaurant').where({
      pos_id: 'ps82kz7f',
    });

    expect(petpooja_restaurant_details[0].packing_sgst_utgst).toBe(2.5);
    expect(petpooja_restaurant_details[0].packing_cgst).toBe(2.5);
    expect(petpooja_restaurant_details[0].packing_charge_type).toBe('item');
  });
  test('Sending packaging_charge_type to fixed', async () => {
    const mock_es_index_data = mockEsIndexData();
    PETPOOJA_TEST_MENU.restaurants[0].details.packaging_charge_type =
      PetPoojaPackagingChargeType.FIXED;
    const response = await request(server)
      .post('/food/callback/petpooja/push_menu')
      .set('Authorization', `Bearer ${petpooja_token}`)
      .send(PETPOOJA_TEST_MENU);
    expect(response.body).toStrictEqual({
      success: '1',
      message: 'Menu items are successfully listed.',
    });
    expect(mock_es_index_data).toHaveBeenCalled();
    const petpooja_restaurant_details = await DB.read('restaurant').where({
      pos_id: 'ps82kz7f',
    });

    expect(petpooja_restaurant_details[0].packing_charge_fixed_percent).toBe(
      'fixed'
    );
  });
  test('Sending packaging_charge_type to percentage', async () => {
    const mock_es_index_data = mockEsIndexData();
    PETPOOJA_TEST_MENU.restaurants[0].details.packaging_charge_type =
      PetPoojaPackagingChargeType.PERCENTAGE;
    const response = await request(server)
      .post('/food/callback/petpooja/push_menu')
      .set('Authorization', `Bearer ${petpooja_token}`)
      .send(PETPOOJA_TEST_MENU);
    expect(response.body).toStrictEqual({
      success: '1',
      message: 'Menu items are successfully listed.',
    });
    expect(mock_es_index_data).toHaveBeenCalled();
    const petpooja_restaurant_details = await DB.read('restaurant').where({
      pos_id: 'ps82kz7f',
    });

    expect(petpooja_restaurant_details[0].packing_charge_fixed_percent).toBe(
      'percent'
    );
  });
});
