import request from 'supertest';
import {Application} from 'express';
import {createTestServer} from '../../utils/init';
import {loadMockSeedData, testCasesClosingTasks} from '../../utils/utils';
import {DB} from '../../../data/knex';
import {PETPOOJA_TEST_MENU} from '../constant';
import {mockEsIndexData} from '../../utils/mock_services';
import {pp_restaurant_id} from '../common';

jest.mock('axios');

let server: Application;
const petpooja_token = 'petpooja_token';
const PETPOOJA_TEST_MENU_CLONE = JSON.parse(JSON.stringify(PETPOOJA_TEST_MENU));
beforeAll(async () => {
  server = await createTestServer();
  await loadMockSeedData('restaurant');
});

afterAll(async () => {
  await testCasesClosingTasks();
});

describe('Petpooja Push Menu Parent Category (Main Category) Test Cases', () => {
  test('Sending valid push menu', async () => {
    mockEsIndexData();
    PETPOOJA_TEST_MENU_CLONE.categories[0].parent_category_id = '0';
    const response = await request(server)
      .post('/food/callback/petpooja/push_menu')
      .set('Authorization', `Bearer ${petpooja_token}`)
      .send(PETPOOJA_TEST_MENU_CLONE);
    expect(response.body).toStrictEqual({
      success: '1',
      message: 'Menu items are successfully listed.',
    });

    //Reading Main Category
    const read_main_category = await DB.read
      .from('main_category')
      .where({restaurant_id: pp_restaurant_id});

    expect(read_main_category.length).toBe(2);
    expect(read_main_category).toStrictEqual([
      {
        created_at: expect.anything(),
        id: 1,
        is_deleted: false,
        name: 'Starters',
        pos_id: '1',
        pos_partner: 'petpooja',
        restaurant_id: '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
        sequence: 1,
        updated_at: expect.anything(),
        discount_rate: 0,
        discount_updated_at: null,
        discount_updated_user_id: null,
        discount_updated_user_type: null,
      },
      {
        created_at: expect.anything(),
        id: 2,
        is_deleted: false,
        name: 'NOTA',
        pos_id: '0',
        pos_partner: 'petpooja',
        restaurant_id: '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
        sequence: 2,
        updated_at: expect.anything(),
        discount_rate: 0,
        discount_updated_at: null,
        discount_updated_user_id: null,
        discount_updated_user_type: null,
      },
    ]);
  });

  test('Deleting existing main category', async () => {
    mockEsIndexData();
    PETPOOJA_TEST_MENU_CLONE.parentcategories = [];
    PETPOOJA_TEST_MENU_CLONE.categories[0].parent_category_id = '0';
    PETPOOJA_TEST_MENU_CLONE.categories[1].parent_category_id = '0';
    PETPOOJA_TEST_MENU_CLONE.categories[2].parent_category_id = '0';

    const response = await request(server)
      .post('/food/callback/petpooja/push_menu')
      .set('Authorization', `Bearer ${petpooja_token}`)
      .send(PETPOOJA_TEST_MENU_CLONE);
    expect(response.body).toStrictEqual({
      success: '1',
      message: 'Menu items are successfully listed.',
    });

    //Reading Main Category
    const read_main_category = await DB.read
      .from('main_category')
      .where({restaurant_id: pp_restaurant_id});

    expect(read_main_category.length).toBe(2);
    expect(read_main_category).toStrictEqual([
      {
        created_at: expect.anything(),
        id: 2,
        is_deleted: false,
        name: 'NOTA',
        pos_id: '0',
        pos_partner: 'petpooja',
        restaurant_id: '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
        sequence: 1,
        updated_at: expect.anything(),
        discount_rate: 0,
        discount_updated_at: null,
        discount_updated_user_id: null,
        discount_updated_user_type: null,
      },
      {
        created_at: expect.anything(),
        id: 1,
        is_deleted: true,
        name: 'Starters',
        pos_id: '1',
        pos_partner: 'petpooja',
        restaurant_id: '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
        sequence: 1,
        updated_at: expect.anything(),
        discount_rate: 0,
        discount_updated_at: null,
        discount_updated_user_id: null,
        discount_updated_user_type: null,
      },
    ]);
  });

  test('Adding new main category', async () => {
    mockEsIndexData();
    PETPOOJA_TEST_MENU_CLONE.parentcategories = [
      {
        name: 'Juice',
        rank: '1',
        image_url: '',
        status: '1',
        id: '2',
      },
    ];
    PETPOOJA_TEST_MENU_CLONE.categories[0].parent_category_id = '0';
    PETPOOJA_TEST_MENU_CLONE.categories[1].parent_category_id = '0';
    PETPOOJA_TEST_MENU_CLONE.categories[2].parent_category_id = '0';

    const response = await request(server)
      .post('/food/callback/petpooja/push_menu')
      .set('Authorization', `Bearer ${petpooja_token}`)
      .send(PETPOOJA_TEST_MENU_CLONE);
    expect(response.body).toStrictEqual({
      success: '1',
      message: 'Menu items are successfully listed.',
    });

    //Reading Main Category
    const read_main_category = await DB.read
      .from('main_category')
      .where({restaurant_id: pp_restaurant_id});

    expect(read_main_category.length).toBe(3);
    expect(read_main_category).toStrictEqual([
      {
        created_at: expect.anything(),
        id: 1,
        is_deleted: true,
        name: 'Starters',
        pos_id: '1',
        pos_partner: 'petpooja',
        restaurant_id: '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
        sequence: 1,
        updated_at: expect.anything(),
        discount_rate: 0,
        discount_updated_at: null,
        discount_updated_user_id: null,
        discount_updated_user_type: null,
      },
      {
        created_at: expect.anything(),
        id: 3,
        is_deleted: false,
        name: 'Juice',
        pos_id: '2',
        pos_partner: 'petpooja',
        restaurant_id: '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
        sequence: 1,
        updated_at: expect.anything(),
        discount_rate: 0,
        discount_updated_at: null,
        discount_updated_user_id: null,
        discount_updated_user_type: null,
      },
      {
        created_at: expect.anything(),
        id: 2,
        is_deleted: false,
        name: 'NOTA',
        pos_id: '0',
        pos_partner: 'petpooja',
        restaurant_id: '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
        sequence: 2,
        updated_at: expect.anything(),
        discount_rate: 0,
        discount_updated_at: null,
        discount_updated_user_id: null,
        discount_updated_user_type: null,
      },
    ]);
  });
});
