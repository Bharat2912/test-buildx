import redis_client from '../../../utilities/cache_manager';
import logger from '../../../utilities/logger/winston_logger';
import {
  createSearchClickRecord,
  getCustomerSearchClickRecords,
  getCustomerSearchClickRecordsForRestaurant,
  readTrendingRestaurantsFromSearchClicks,
  incrementSearchClickCount,
  countTrendingRestaurantsFromSearchClicks,
} from './model';
import {ISaveSearchClickRecord} from './type';
import {SQS_URL, sendSQSMessage} from '../../../utilities/sqs_manager';
import {readActiveCity} from '../../core/city/models';
import {readTrendingRestaurantByIds} from '../restaurant/models';
import {FileObject} from '../../../utilities/s3_manager';

export async function saveCustomerSearchClick(data: ISaveSearchClickRecord) {
  const existing_search_click = (
    await getCustomerSearchClickRecordsForRestaurant(
      data.customer_id,
      data.restaurant_id,
      new Date()
    )
  )[0];
  logger.debug(
    'existing customer search click record exists',
    existing_search_click
  );
  if (existing_search_click) {
    await incrementSearchClickCount(existing_search_click.id);
  } else {
    const {city_id, ...search_click_details} = data;
    await redis_client.ZINCRBY(
      `CITY_ID:${data.city_id}:SEARCH_CLICKS`,
      1,
      data.restaurant_id
    );
    await createSearchClickRecord(search_click_details);
  }
}

export async function getCustomerRecentRestaurantSearchClicks(
  customer_id: string,
  limit?: number
): Promise<
  {
    id: string;
    name: string;
    image: FileObject;
  }[]
> {
  const restaurants = await getCustomerSearchClickRecords(
    customer_id,
    new Date(),
    limit
  );
  return restaurants;
}

export async function getTrendingRestaurantSearchesByCity(
  city_id: string,
  limit = 4
): Promise<{id: string; name: string; image: FileObject}[]> {
  const exists = await redis_client.exists(`CITY_ID:${city_id}:SEARCH_CLICKS`);
  if (exists) {
    const restaurant_ids = await redis_client.ZRANGE(
      `CITY_ID:${city_id}:SEARCH_CLICKS`,
      0,
      limit,
      {REV: true}
    );
    logger.debug('Top restaurant ids for city id', {
      city_id,
      restaurant_ids,
    });
    const restaurants = await readTrendingRestaurantByIds(restaurant_ids);
    return restaurants;
  } else {
    logger.debug(
      'Top restaurant ids for city id does not exist,sending sqs message to recalculate',
      {
        city_id,
      }
    );
    await sendSQSMessage(SQS_URL.CORE_WORKER, {
      event: 'TRENDING_RESTAURANTS',
      action: 'RECALCULATE',
      data: {
        city_id: city_id,
      },
    });
    return [];
  }
}

export async function recalculateTrendingRestaurantsForCity(city_id: string) {
  // const before_n_days =
  //   await Globals.CALCULATE_TRENDING_RESTAURANTS_FOR_PAST_N_DAYS.get();

  // const start_time = moment().subtract(before_n_days, 'days');
  const group_limit = 30;
  const redis_sorted_set_key_name = `CITY_ID:${city_id}:SEARCH_CLICKS`;

  const {total_pages, total_records} =
    await countTrendingRestaurantsFromSearchClicks(city_id, group_limit);

  logger.debug('countTrendingRestaurantsFromSearchClicks', {
    total_pages,
    total_records,
  });

  const members: {score: number; value: string}[] = [];
  for (let page_no = 0; page_no < total_pages; page_no++) {
    const {records} = await readTrendingRestaurantsFromSearchClicks(city_id, {
      page_index: page_no,
      page_size: group_limit,
    });

    for (let r = 0; r < records.length; r++) {
      members.push({
        score: records[r].restaurant_search_clicks,
        value: records[r].id,
      });
    }
  }
  if (members.length > 0) {
    await redis_client.ZADD(redis_sorted_set_key_name, members);
  }
}

export async function recalculateTrendingRestaurantsForAllCities() {
  const cities = await readActiveCity();
  for (let c = 0; c < cities.length; c++) {
    const exists = await redis_client.exists(
      `CITY_ID:${cities[c].id}:SEARCH_CLICKS`
    );
    if (!exists) {
      await sendSQSMessage(SQS_URL.CORE_WORKER, {
        event: 'TRENDING_RESTAURANTS',
        action: 'RECALCULATE',
        data: {
          city_id: cities[c].id,
        },
      });
    }
  }
}
