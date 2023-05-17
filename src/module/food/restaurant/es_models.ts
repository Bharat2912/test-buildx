import {createIndex, query} from '../../../utilities/es_manager';
import {QueryDslQueryContainer} from '@elastic/elasticsearch/lib/api/types';
import {IES_Restaurant, IPagination} from './models';
import Globals from '../../../utilities/global_var/globals';
import logger from '../../../utilities/logger/winston_logger';

export async function getElasticSearchServiceableRestaurant(
  lat: number,
  long: number,
  distance?: number
): Promise<IES_Restaurant[]> {
  const searchObject: QueryDslQueryContainer = {
    bool: {
      must: {
        match_all: {},
      },
      filter: {
        geo_distance: {
          distance:
            (distance ||
              (await Globals.SERVICEABILITY_RADIUS_IN_METRES.get())) + 'm',
          coordinates: {
            lon: long,
            lat: lat,
          },
        },
      },
    },
  };
  logger.debug('Elastic Query search restaurant', searchObject);
  return await query<IES_Restaurant>('restaurant', searchObject);
}

export async function searchRestaurantsAndCuisinesInElasticSearch(
  searchText?: string,
  filterRestaurantIds?: string[],
  pagination?: IPagination
) {
  // GET restaurant/_search
  // {
  //   "query": {
  //     "bool": {
  //       "must": [
  //         {
  //           "ids" : {
  //             "values" : ["109e9afc-1032-4ec1-920b-62a8c2273a68"]
  //           }
  //         },
  //         {
  //           "multi_match": {
  //             "query": "fod",
  //             "fuzziness": "AUTO",
  //             "fields": [
  //               "name",
  //               "cuisine_names"
  //             ]
  //           }
  //         }
  //       ]
  //     }
  //   }
  // }

  const queryObject = [];

  if (filterRestaurantIds && filterRestaurantIds.length) {
    queryObject.push({
      ids: {
        values: filterRestaurantIds,
      },
    });
  }
  if (searchText) {
    queryObject.push({
      multi_match: {
        query: searchText,
        fuzziness: 'AUTO',
        fields: ['name', 'cuisine_names'],
      },
    });
  }

  const searchObject: QueryDslQueryContainer = {
    bool: {
      must: queryObject,
    },
  };
  const result = await query<IES_Restaurant>(
    'restaurant',
    searchObject,
    pagination
  );
  const res: IES_Restaurant[] = [];
  result.map(item => {
    if (item) {
      res.push(item);
    }
  });
  return res;
}

export async function searchCuisinesInElasticSearch(
  search_text?: string,
  filter_restaurant_ids?: string[],
  pagination?: IPagination
) {
  const queryObject = [];

  if (filter_restaurant_ids && filter_restaurant_ids.length) {
    queryObject.push({
      ids: {
        values: filter_restaurant_ids,
      },
    });
  }
  if (search_text) {
    queryObject.push({
      multi_match: {
        query: search_text,
        fuzziness: 'AUTO',
        fields: ['cuisine_names'],
      },
    });
  }

  const searchObject: QueryDslQueryContainer = {
    bool: {
      must: queryObject,
    },
  };
  const result = await query<IES_Restaurant>(
    'restaurant',
    searchObject,
    pagination
  );
  const res: IES_Restaurant[] = [];
  result.map(item => {
    if (item) {
      res.push(item);
    }
  });
  return res;
}

export async function searchRestaurantsInElasticSearch(
  search_text?: string,
  filter_restaurant_ids?: string[],
  pagination?: IPagination
) {
  const queryObject = [];

  if (filter_restaurant_ids && filter_restaurant_ids.length) {
    queryObject.push({
      ids: {
        values: filter_restaurant_ids,
      },
    });
  }
  if (search_text) {
    queryObject.push({
      multi_match: {
        query: search_text,
        fuzziness: 'AUTO',
        fields: ['name'],
      },
    });
  }

  const searchObject: QueryDslQueryContainer = {
    bool: {
      must: queryObject,
    },
  };
  const result = await query<IES_Restaurant>(
    'restaurant',
    searchObject,
    pagination
  );
  const res: IES_Restaurant[] = [];
  result.map(item => {
    if (item) {
      res.push(item);
    }
  });
  return res;
}

export async function createRestaurantIndexInElasticSearch() {
  logger.debug('creating restaurant index in elastic search');
  // await clearIndex('restaurant');
  await createIndex('restaurant', {
    properties: {
      id: {type: 'text'},
      name: {
        type: 'text',
        fields: {
          keyword: {
            type: 'keyword',
          },
        },
      },
      cuisine_ids: {type: 'text'},
      cuisine_names: {
        type: 'text',
        fields: {
          keyword: {
            type: 'keyword',
          },
        },
      },
      coordinates: {
        type: 'geo_point',
      },
    },
  });
}

export async function getRestaurantsFromElasticSearch(
  restaturant_ids: string[],
  pagination?: IPagination
) {
  // GET restaurant/_search
  // {
  //   "query": {
  //     "bool": {
  //       "must": [
  //         {
  //           "ids" : {
  //             "values" : ["109e9afc-1032-4ec1-920b-62a8c2273a68"]
  //           }
  //         }
  //       ]
  //     }
  //   }
  // }

  const queryObject = [];

  if (restaturant_ids && restaturant_ids.length) {
    queryObject.push({
      ids: {
        values: restaturant_ids,
      },
    });
  }

  const searchObject: QueryDslQueryContainer = {
    bool: {
      must: queryObject,
    },
  };
  const result = await query<IES_Restaurant>(
    'restaurant',
    searchObject,
    pagination
  );
  const res: IES_Restaurant[] = [];
  result.map(item => {
    if (item) {
      res.push(item);
    }
  });
  return res;
}
