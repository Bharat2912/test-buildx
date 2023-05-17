import {init_globals} from '../utils/globals';
import {loadMockSeedData, testCasesClosingTasks} from '../utils/utils';
import main_category from './main_category';
import sub_category from './sub_category';
import addon_group from './addon_group';
import addon from './addon';
import menu_item from './menu_item';

jest.mock('axios');

beforeAll(async () => {
  await init_globals();

  await loadMockSeedData('restaurant');
});

export const menu_valid_restaurant_id = '77e53c1f-6e9e-4724-9ba7-92edc69cff6b';
export const menu_invalid_restaurant_id =
  '00000000-aaaa-1111-2b2b-333444555123';

describe('Cusine APIs Testing :- ADMIN', () => {
  main_category();
  sub_category();
  addon_group();
  addon();
  menu_item();
});

afterAll(async () => {
  await testCasesClosingTasks();
});
