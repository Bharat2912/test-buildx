import {Request, Response} from 'express';
import * as RestaurantModels from './restaurant/models';
import * as MenuModels from './menu/models';
import * as RestaurantController from './restaurant/controller';
import * as MenuController from './menu/controller';
import logger from '../../utilities/logger/winston_logger';
import {
  sendError,
  sendSuccess,
} from '../../utilities/controllers/handle_response';
import handleErrors from '../../utilities/controllers/handle_errors';
import {esPutBulkMenuItems, esPutBulkRestaurants} from '../../es_models';
import {sendSQSMessage, SQS_URL} from '../../utilities/sqs_manager';
import {search, search_v2} from './model';
import {
  calculateRestaurantsTravelTimeAndDistance,
  setRestaurantAvailability,
} from './restaurant/service';
import {ISearch, ISearchRestaurant} from './types';
import {humanizeNumber} from '../../utilities/utilFuncs';
import {
  getElasticSearchServiceableRestaurant,
  getRestaurantsFromElasticSearch,
  searchRestaurantsAndCuisinesInElasticSearch,
} from './restaurant/es_models';
import {IRestaurantGetDeliveryDetails} from './restaurant/types';
import {checkESIndexExists} from '../../utilities/es_manager';
import {
  getPreSearchDetails,
  initEsIndexService,
  searchService,
} from './service';
import {calculateMenuItemDisplayPrice} from './menu/controller';
import {pre_search_input} from './validation';

export async function initEsIndex(req: Request, res: Response) {
  try {
    const result = await initEsIndexService();
    return sendSuccess(
      res,
      200,
      result,
      'Elastic search Inital indexing completed'
    );
  } catch (error) {
    logger.error('ES Restaurant Put Bulk Error', error);
    return sendError(res, 500, 'Error while initializing elastic search index');
  }
}

export async function putEsIndex(req: Request, res: Response) {
  try {
    if (!(await checkESIndexExists('restaurant')))
      return sendError(res, 400, 'Restaurant index does not exits');

    const restaurants = await RestaurantModels.getIndexRestaurants();
    if (restaurants && restaurants.length) {
      logger.debug(
        `put ${restaurants.length} restaurant elastic search documents`
      );
      await esPutBulkRestaurants(restaurants);
    }

    if (!(await checkESIndexExists('menu_item')))
      return sendError(res, 400, 'Menu Item index does not exits');

    const menu_items = await MenuModels.getIndexMenuItems();
    if (menu_items && menu_items.length) {
      logger.debug(
        `put ${menu_items.length} menu item elastic search documents`
      );
      await esPutBulkMenuItems(menu_items);
    }

    return sendSuccess(
      res,
      200,
      {
        restaurant_documents_count: restaurants.length,
        menu_item_documents_count: menu_items.length,
      },
      'Elastic search documents upserted'
    );
  } catch (error) {
    logger.error('ES Restaurant Put Bulk Error', error);
    return sendError(res, 500, 'Error in put elastic search documents');
  }
}

export async function ws_msg(req: Request, res: Response) {
  try {
    await sendSQSMessage(SQS_URL.NOTIFICATIONS, {
      event: 'WS',
      action: 'MESSAGE',
      data: req.body,
    });
    return sendSuccess(res, 200, 'msg sent');
  } catch (error) {
    return sendError(res, 500, 'WebSocket Error');
  }
}
//!DEPRECATED
export async function searchFood(req: Request, res: Response) {
  try {
    const validation = search.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = validation.value as ISearchRestaurant;

    logger.debug('Searching restaurants', validated_req);
    const elastic_serviceable_restaurants: RestaurantModels.IES_Restaurant[] =
      await getElasticSearchServiceableRestaurant(
        validated_req.coordinates.lat,
        validated_req.coordinates.long
      );
    logger.debug('es serviceable restaurants', elastic_serviceable_restaurants);

    const es_serviceable_restaurant_ids = elastic_serviceable_restaurants.map(
      esr => esr.id
    );

    const es_search_menu_item_ids: number[] = [];
    const es_search_menu_item_restaurant_ids: string[] = [];

    const es_search_restaurants =
      await searchRestaurantsAndCuisinesInElasticSearch(
        validated_req.searchText,
        es_serviceable_restaurant_ids
      );
    logger.debug('es search restaurants', es_search_restaurants);
    const es_search_restaurant_ids: string[] = es_search_restaurants.map(
      r => r.id
    );

    const es_menu_items = await MenuModels.searchMenuItems(
      validated_req.searchText,
      es_serviceable_restaurant_ids
      // req.body.pagination
    );
    logger.debug('es_menu_items', es_menu_items);
    es_menu_items.forEach(item => {
      es_search_menu_item_restaurant_ids.push(item.restaurant_id);
      es_search_menu_item_ids.push(item.id);
    });

    logger.debug(
      'es search menu item restaurant_ids',
      es_search_menu_item_restaurant_ids
    );
    logger.debug('es search menu item ids', es_search_menu_item_ids);

    const get_delivery_details: IRestaurantGetDeliveryDetails[] = [];

    es_search_restaurants.forEach(restaurant => {
      get_delivery_details.push({
        id: restaurant.id!,
        default_preparation_time: restaurant.default_preparation_time || 15, //GET THIS FROM ELASTIC
        coordinates: {
          latitude: restaurant.coordinates.lat!,
          longitude: restaurant.coordinates.lon!,
        },
      });
    });
    const get_restaurants_from_es = es_search_menu_item_restaurant_ids.filter(
      id => !es_search_restaurant_ids.includes(id)
    );
    if (get_restaurants_from_es.length > 0) {
      const es_menu_item_restaurants = await getRestaurantsFromElasticSearch(
        get_restaurants_from_es
      );

      es_menu_item_restaurants.forEach(restaurant => {
        get_delivery_details.push({
          id: restaurant.id!,
          default_preparation_time: restaurant.default_preparation_time || 15, //GET THIS FROM ELASTIC
          coordinates: {
            latitude: restaurant.coordinates.lat!,
            longitude: restaurant.coordinates.lon!,
          },
        });
      });
    }

    if (get_delivery_details.length === 0) {
      return sendSuccess(res, 200, {
        total_pages: 0,
        restaurant: [],
      });
    }

    const restaurants_delivery =
      await calculateRestaurantsTravelTimeAndDistance(get_delivery_details, {
        latitude: validated_req.coordinates.lat,
        longitude: validated_req.coordinates.long,
      });
    logger.debug(
      'restaurants updated with distance and time',
      restaurants_delivery
    );

    const restaurants_availability_delivery = await setRestaurantAvailability(
      restaurants_delivery
    );
    logger.debug('restaurants availability fetched');

    const open_restaurant_ids: string[] = [];
    const closed_restaurant_ids: string[] = [];

    restaurants_availability_delivery.forEach(r => {
      if (r.availability?.is_open) {
        open_restaurant_ids.push(r.id);
      } else {
        closed_restaurant_ids.push(r.id);
      }
    });

    const {total_pages, restaurants} = await RestaurantModels.filterRestaurants(
      open_restaurant_ids,
      closed_restaurant_ids,
      undefined,
      validated_req.pagination
    );
    logger.debug('restaurants fetched from restaurant table', restaurants);

    if (restaurants.length === 0) {
      return sendSuccess(res, 200, {
        total_pages: 0,
        restaurant: [],
      });
    }

    const search_menu_items = await MenuModels.readMenuItems(
      es_search_menu_item_ids
    );
    logger.debug('menu items fetched from menu item table', search_menu_items);

    MenuModels.calculateMenuItemsNextAvailableTime(search_menu_items);

    for (let i = 0; i < restaurants.length; i++) {
      delete restaurants[i].poc_number;

      const match_menu_items = search_menu_items.filter(item => {
        return item.restaurant_id === restaurants[i].id;
      });
      match_menu_items.map(mi => {
        const discount_rate =
          mi.menu_item_discount_rate ||
          mi.sub_category_discount_rate ||
          mi.main_category_discount_rate ||
          restaurants[i].discount_rate ||
          0;
        calculateMenuItemDisplayPrice(mi, discount_rate);
      });

      restaurants[i].menu_items = await MenuController.generateDownloadURLs(
        match_menu_items
      );

      const result = restaurants_availability_delivery.find(
        rad => rad.id === restaurants[i].id
      );
      if (result) {
        restaurants[i].availability = result.availability;
        restaurants[i].delivery_time_in_seconds =
          result.delivery_time_in_seconds;
        restaurants[i].delivery_time_string = result.delivery_time_string;
        restaurants[i].delivery_distance_in_meters =
          result.delivery_distance_in_meters;
        restaurants[i].delivery_distance_string =
          result.delivery_distance_string;
      }

      //Update Dynamic values
      restaurants[i].like_count_label = humanizeNumber(
        restaurants[i].like_count
      );
    }
    logger.debug('restaurants updated with menu items', restaurants);

    await RestaurantController.generateDownloadURLs(restaurants);

    logger.debug('restaurants updated with download url', restaurants);
    return sendSuccess(res, 200, {total_pages, restaurant: restaurants});
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function preSearchFood(req: Request, res: Response) {
  try {
    const validation = pre_search_input.validate({
      lat: req.query.lat,
      long: req.query.long,
      customer_id: req.user?.id,
    });
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = validation.value as {
      lat: number;
      long: number;
      customer_id?: string;
    };
    const result = await getPreSearchDetails(
      validated_req.lat,
      validated_req.long,
      validated_req.customer_id
    );

    return sendSuccess(res, 200, result);
  } catch (error) {
    return handleErrors(
      res,
      error,
      'FAILED WHILE FETCHING PRE SEARCH DETAILS FOR CUSTOMER'
    );
  }
}

export async function searchFoodV2(req: Request, res: Response) {
  try {
    const validation = search_v2.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = validation.value as ISearch;
    logger.debug('Searching restaurants', validated_req);
    const result = await searchService(validated_req);
    return sendSuccess(res, 200, result);
  } catch (error) {
    return handleErrors(res, error, 'failed while searching food using v2');
  }
}
