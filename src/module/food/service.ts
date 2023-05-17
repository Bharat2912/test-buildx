import {esPutBulkMenuItems, esPutBulkRestaurants} from '../../es_models';
import ResponseError from '../../utilities/response_error';
import * as MenuModels from './menu/models';
import * as RestaurantController from './restaurant/controller';
import {createMenuItemIndex, getIndexMenuItems} from './menu/models';
import {
  createRestaurantIndexInElasticSearch,
  getElasticSearchServiceableRestaurant,
  getRestaurantsFromElasticSearch,
  searchCuisinesInElasticSearch,
  searchRestaurantsInElasticSearch,
} from './restaurant/es_models';
import {
  IES_Restaurant,
  IRestaurant,
  filterRestaurants,
  getIndexRestaurants,
} from './restaurant/models';
import logger from '../../utilities/logger/winston_logger';
import {
  getCustomerRecentRestaurantSearchClicks,
  getTrendingRestaurantSearchesByCity,
} from './search_click/service';
import {getPopularCuisinesByCity} from './cuisine/service';
import {FileObject, generateDownloadFileURL} from '../../utilities/s3_manager';
import {ISearch} from './types';
import {SearchType} from './enum';
import {IRestaurantGetDeliveryDetails} from './restaurant/types';
import {
  calculateRestaurantsTravelTimeAndDistance,
  setRestaurantAvailability,
} from './restaurant/service';
import {humanizeNumber} from '../../utilities/utilFuncs';
import {PosPartner} from './enum';
import {
  calculateMenuItemDisplayPrice,
  generateDownloadURLs,
} from './menu/controller';

export function validatePosPartnerAccess(pos_partner?: PosPartner | null) {
  if (pos_partner === PosPartner.PETPOOJA) {
    throw new ResponseError(400, [
      {
        message:
          'restaurants registered with petpooja system can not take this action from speedyy apps',
        code: 2017,
      },
    ]);
  } else {
    return;
  }
}

export async function initEsIndexService() {
  await createRestaurantIndexInElasticSearch();

  const restaurants = await getIndexRestaurants();
  if (restaurants && restaurants.length) {
    logger.debug(
      `put ${restaurants.length} restaurant elastic search documents`
    );
    await esPutBulkRestaurants(restaurants);
  }

  await createMenuItemIndex();

  const menu_items = await getIndexMenuItems();
  if (menu_items && menu_items.length) {
    logger.debug(`put ${menu_items.length} menu item elastic search documents`);
    await esPutBulkMenuItems(menu_items);
  }
  return {
    restaurant_documents_count: restaurants.length,
    menu_item_documents_count: menu_items.length,
  };
}

//we need to take customer lat and long as input.
//then identify area id or city id from lat long and caculate.
export async function getPreSearchDetails(
  lat: number,
  long: number,
  customer_id?: string
) {
  logger.debug('getting pre search details for customer', {
    lat,
    long,
    customer_id,
  });
  const recent_searches: {id: string; name: string; image: FileObject}[] = [];
  const trending_searches: {id: string; name: string; image: FileObject}[] = [];
  const popular_cuisines: {id: string; name: string; image: FileObject}[] = [];

  if (customer_id) {
    const customer_recent_searches =
      await getCustomerRecentRestaurantSearchClicks(customer_id);

    for (let i = 0; i < customer_recent_searches.length; i++) {
      customer_recent_searches[i].image = await generateDownloadFileURL(
        customer_recent_searches[i].image
      );
    }

    recent_searches.push(...customer_recent_searches);
    logger.debug('customer recent searches fetched', recent_searches);
  }

  if (process.env.NAGPUR_CITY_ID) {
    const city_trending_seaches = await getTrendingRestaurantSearchesByCity(
      process.env.NAGPUR_CITY_ID,
      4
    );

    for (let i = 0; i < city_trending_seaches.length; i++) {
      city_trending_seaches[i].image = await generateDownloadFileURL(
        city_trending_seaches[i].image
      );
    }

    trending_searches.push(...city_trending_seaches);
    logger.debug('trending searches fetched', trending_searches);
  }

  const global_popular_cuisines = await getPopularCuisinesByCity();
  popular_cuisines.push(...global_popular_cuisines);
  logger.debug('popular cuisines fetched', global_popular_cuisines);

  return {
    recent_searches,
    trending_searches,
    popular_cuisines,
  };
}

export async function searchService(data: ISearch): Promise<{
  total_pages: number;
  restaurants?: IRestaurant[];
  menu_item_restaurants?: IRestaurant[];
  cuisine_restaurants?: IRestaurant[];
}> {
  logger.debug('Searching serviceable restaurants', data);
  const elastic_serviceable_restaurants: IES_Restaurant[] =
    await getElasticSearchServiceableRestaurant(
      data.coordinates.lat,
      data.coordinates.long
    );
  logger.debug('es serviceable restaurants', elastic_serviceable_restaurants);

  const es_serviceable_restaurant_ids = elastic_serviceable_restaurants.map(
    esr => esr.id
  );
  if (data.type === SearchType.RESTAURANT) {
    return searchRestaurants(data, es_serviceable_restaurant_ids);
  } else if (data.type === SearchType.CUISINE_RESTAURANT) {
    return searchCuisineRestaurants(data, es_serviceable_restaurant_ids);
  } else {
    return searchMenuItemRestaurants(data, es_serviceable_restaurant_ids);
  }
}

export async function searchRestaurants(
  data: ISearch,
  es_serviceable_restaurant_ids: string[]
): Promise<{
  total_pages: number;
  restaurants: IRestaurant[];
}> {
  if (es_serviceable_restaurant_ids.length === 0) {
    return {
      total_pages: 0,
      restaurants: [],
    };
  }

  const es_search_restaurants = await searchRestaurantsInElasticSearch(
    data.search_text,
    es_serviceable_restaurant_ids
  );
  logger.debug('es search restaurants', es_search_restaurants);

  if (es_search_restaurants.length === 0) {
    return {
      total_pages: 0,
      restaurants: [],
    };
  }

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

  const restaurants_delivery = await calculateRestaurantsTravelTimeAndDistance(
    get_delivery_details,
    {
      latitude: data.coordinates.lat,
      longitude: data.coordinates.long,
    }
  );
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

  const {total_pages, restaurants} = await filterRestaurants(
    open_restaurant_ids,
    closed_restaurant_ids,
    undefined,
    data.pagination
  );

  if (restaurants.length === 0) {
    return {
      total_pages: 0,
      restaurants: [],
    };
  }

  for (let i = 0; i < restaurants.length; i++) {
    delete restaurants[i].poc_number;

    const result = restaurants_availability_delivery.find(
      rad => rad.id === restaurants[i].id
    );
    if (result) {
      restaurants[i].availability = result.availability;
      restaurants[i].delivery_time_in_seconds = result.delivery_time_in_seconds;
      restaurants[i].delivery_time_string = result.delivery_time_string;
      restaurants[i].delivery_distance_in_meters =
        result.delivery_distance_in_meters;
      restaurants[i].delivery_distance_string = result.delivery_distance_string;
    }

    //Update Dynamic values
    restaurants[i].like_count_label = humanizeNumber(restaurants[i].like_count);
  }
  await RestaurantController.generateDownloadURLs(restaurants);
  return {
    total_pages,
    restaurants,
  };
}

export async function searchMenuItemRestaurants(
  data: ISearch,
  es_serviceable_restaurant_ids: string[]
): Promise<{
  total_pages: number;
  menu_item_restaurants: IRestaurant[];
}> {
  if (es_serviceable_restaurant_ids.length === 0) {
    return {
      total_pages: 0,
      menu_item_restaurants: [],
    };
  }

  const es_search_menu_item_ids: number[] = [];
  const es_search_menu_item_restaurant_ids: string[] = [];

  const es_menu_items = await MenuModels.searchMenuItems(
    data.search_text,
    es_serviceable_restaurant_ids
    // req.body.pagination
  );
  logger.debug('es_menu_items', es_menu_items);
  es_menu_items.forEach(item => {
    es_search_menu_item_restaurant_ids.push(item.restaurant_id);
    es_search_menu_item_ids.push(item.id);
  });

  const get_delivery_details: IRestaurantGetDeliveryDetails[] = [];

  const get_menu_item_restaurants_from_es = es_menu_items.map(
    mi => mi.restaurant_id
  );

  if (get_menu_item_restaurants_from_es.length > 0) {
    const es_menu_item_restaurants = await getRestaurantsFromElasticSearch(
      get_menu_item_restaurants_from_es
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
    return {
      total_pages: 0,
      menu_item_restaurants: [],
    };
  }

  const restaurants_delivery = await calculateRestaurantsTravelTimeAndDistance(
    get_delivery_details,
    {
      latitude: data.coordinates.lat,
      longitude: data.coordinates.long,
    }
  );
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

  const {total_pages, restaurants} = await filterRestaurants(
    open_restaurant_ids,
    closed_restaurant_ids,
    undefined,
    data.pagination
  );

  if (restaurants.length === 0) {
    return {
      total_pages: 0,
      menu_item_restaurants: [],
    };
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
    match_menu_items.forEach(mi => {
      const discount_rate =
        mi.menu_item_discount_rate ||
        mi.sub_category_discount_rate ||
        mi.main_category_discount_rate ||
        restaurants[i].discount_rate ||
        0;
      calculateMenuItemDisplayPrice(mi, discount_rate);
    });

    restaurants[i].menu_items = await generateDownloadURLs(match_menu_items);
    const result = restaurants_availability_delivery.find(
      rad => rad.id === restaurants[i].id
    );
    if (result) {
      restaurants[i].availability = result.availability;
      restaurants[i].delivery_time_in_seconds = result.delivery_time_in_seconds;
      restaurants[i].delivery_time_string = result.delivery_time_string;
      restaurants[i].delivery_distance_in_meters =
        result.delivery_distance_in_meters;
      restaurants[i].delivery_distance_string = result.delivery_distance_string;
    }

    //Update Dynamic values
    restaurants[i].like_count_label = humanizeNumber(restaurants[i].like_count);
  }

  await RestaurantController.generateDownloadURLs(restaurants);

  return {
    total_pages,
    menu_item_restaurants: restaurants,
  };
}

export async function searchCuisineRestaurants(
  data: ISearch,
  es_serviceable_restaurant_ids: string[]
): Promise<{
  total_pages: number;
  cuisine_restaurants: IRestaurant[];
}> {
  if (es_serviceable_restaurant_ids.length === 0) {
    return {
      total_pages: 0,
      cuisine_restaurants: [],
    };
  }

  const es_search_cuisines_restaurants = await searchCuisinesInElasticSearch(
    data.search_text,
    es_serviceable_restaurant_ids
  );
  logger.debug(
    'es search cuisines restaurants',
    es_search_cuisines_restaurants
  );

  if (es_search_cuisines_restaurants.length === 0) {
    return {
      total_pages: 0,
      cuisine_restaurants: [],
    };
  }

  const get_delivery_details: IRestaurantGetDeliveryDetails[] = [];

  es_search_cuisines_restaurants.forEach(restaurant => {
    get_delivery_details.push({
      id: restaurant.id!,
      default_preparation_time: restaurant.default_preparation_time || 15, //GET THIS FROM ELASTIC
      coordinates: {
        latitude: restaurant.coordinates.lat!,
        longitude: restaurant.coordinates.lon!,
      },
    });
  });

  const restaurants_delivery = await calculateRestaurantsTravelTimeAndDistance(
    get_delivery_details,
    {
      latitude: data.coordinates.lat,
      longitude: data.coordinates.long,
    }
  );
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

  const {total_pages, restaurants} = await filterRestaurants(
    open_restaurant_ids,
    closed_restaurant_ids,
    undefined,
    data.pagination
  );

  if (restaurants.length === 0) {
    return {
      total_pages: 0,
      cuisine_restaurants: [],
    };
  }

  for (let i = 0; i < restaurants.length; i++) {
    delete restaurants[i].poc_number;

    const result = restaurants_availability_delivery.find(
      rad => rad.id === restaurants[i].id
    );
    if (result) {
      restaurants[i].availability = result.availability;
      restaurants[i].delivery_time_in_seconds = result.delivery_time_in_seconds;
      restaurants[i].delivery_time_string = result.delivery_time_string;
      restaurants[i].delivery_distance_in_meters =
        result.delivery_distance_in_meters;
      restaurants[i].delivery_distance_string = result.delivery_distance_string;
    }

    //Update Dynamic values
    restaurants[i].like_count_label = humanizeNumber(restaurants[i].like_count);
  }
  await RestaurantController.generateDownloadURLs(restaurants);
  return {
    total_pages,
    cuisine_restaurants: restaurants,
  };
}
