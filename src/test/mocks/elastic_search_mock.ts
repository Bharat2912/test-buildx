import * as restaurant_es_model from '../../module/food/restaurant/es_models';
import * as restaurant_menu_model from '../../module/food/menu/models';
import {IES_Restaurant} from '../../module/food/restaurant/models';

export function mockGetServiceableRestaurant(es_restaurants: IES_Restaurant[]) {
  const mock_function = jest.spyOn(
    restaurant_es_model,
    'getElasticSearchServiceableRestaurant'
  );
  mock_function.mockReturnValue(
    new Promise(resolve => {
      resolve(es_restaurants);
    })
  );
  return mock_function;
}

export function mockSearchRestaurantsInElasticSearch(
  es_restaurants: IES_Restaurant[]
) {
  const mock_function = jest.spyOn(
    restaurant_es_model,
    'searchRestaurantsInElasticSearch'
  );
  mock_function.mockReturnValue(
    new Promise(resolve => {
      resolve(es_restaurants);
    })
  );
  return mock_function;
}

export function mockSearchMenuItems(
  es_menu_items: restaurant_menu_model.IES_MenuItem[]
) {
  const mock_function = jest.spyOn(restaurant_menu_model, 'searchMenuItems');
  mock_function.mockReturnValue(
    new Promise(resolve => {
      resolve(es_menu_items);
    })
  );
  return mock_function;
}

export function mockGetRestaurantsFromElasticSearch(
  es_restaurants: IES_Restaurant[]
) {
  const mock_function = jest.spyOn(
    restaurant_es_model,
    'getRestaurantsFromElasticSearch'
  );
  mock_function.mockReturnValue(
    new Promise(resolve => {
      resolve(es_restaurants);
    })
  );
  return mock_function;
}
