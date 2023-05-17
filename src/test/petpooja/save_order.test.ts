import request from 'supertest';
import {Application} from 'express';
import {createTestServer} from '../utils/init';
import {loadMockSeedData, testCasesClosingTasks} from '../utils/utils';
import {PETPOOJA_TEST_MENU} from './constant';
import {mockEsIndexData} from '../utils/mock_services';

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

describe('Petpooja Push Menu', () => {
  test('Valid menu entities', async () => {
    const mock_es_index_data = mockEsIndexData();
    const response = await request(server)
      .post('/food/callback/petpooja/push_menu')
      .set('Authorization', `Bearer ${petpooja_token}`)
      .send(PETPOOJA_TEST_MENU);
    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual({
      success: '1',
      message: 'Menu items are successfully listed.',
    });
    expect(mock_es_index_data).toHaveBeenCalled();
  });
});
