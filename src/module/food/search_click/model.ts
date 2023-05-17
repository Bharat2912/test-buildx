import moment from 'moment';
import {DB} from '../../../data/knex';
import {SEARCH_CLICK_TABLE_NAME} from './constant';
import {ICreateSearchClickRecord, ISearchClick} from './type';
import {IPagination} from '../coupons/types';
import {FileObject} from '../../../utilities/s3_manager';

export async function createSearchClickRecord(
  data: ICreateSearchClickRecord
): Promise<void> {
  await DB.write(SEARCH_CLICK_TABLE_NAME).insert(data);
}

export async function incrementSearchClickCount(id: number): Promise<void> {
  await DB.write(SEARCH_CLICK_TABLE_NAME).increment('count', 1).where({id});
}

export async function getCustomerSearchClickRecordsForRestaurant(
  customer_id: string,
  restaurant_id: string,
  date: Date
): Promise<ISearchClick[]> {
  return await DB.read
    .from(SEARCH_CLICK_TABLE_NAME)
    .where({customer_id, restaurant_id})
    .whereRaw(`date(created_at) = '${moment(date).format('YYYY-MM-DD')}'`);
}

export async function getCustomerSearchClickRecords(
  customer_id: string,
  date: Date,
  limit = 5
): Promise<
  {
    name: string;
    id: string;
    image: FileObject;
  }[]
> {
  return await DB.read
    .from(SEARCH_CLICK_TABLE_NAME)
    .where({customer_id})
    .whereRaw(
      `date(${SEARCH_CLICK_TABLE_NAME}.created_at) = '${moment(date).format(
        'YYYY-MM-DD'
      )}'`
    )
    .join(
      'restaurant',
      `${SEARCH_CLICK_TABLE_NAME}.restaurant_id`,
      'restaurant.id'
    )
    .select(['restaurant.name', 'restaurant.id', 'restaurant.image'])
    .orderBy(`${SEARCH_CLICK_TABLE_NAME}.count`, 'desc')
    .limit(limit);
}

export async function countTrendingRestaurantsFromSearchClicks(
  city_id: string,
  page_size: number,
  start_date?: Date,
  end_date?: Date
) {
  let query = DB.read
    .from(SEARCH_CLICK_TABLE_NAME)
    .join(
      'restaurant',
      'restaurant.id',
      '=',
      `${SEARCH_CLICK_TABLE_NAME}.restaurant_id`
    )
    .where('restaurant.city_id', '=', city_id)
    .groupBy('restaurant.id')
    .count('*');

  if (start_date && end_date) {
    query = query
      .whereRaw(
        `date(${SEARCH_CLICK_TABLE_NAME}.created_at) >= '${moment(
          start_date
        ).format('YYYY-MM-DD')}'`
      )
      .whereRaw(
        `date(${SEARCH_CLICK_TABLE_NAME}.created_at) <= '${moment(
          end_date
        ).format('YYYY-MM-DD')}'`
      );
  }

  const total_records = await DB.read(query.as('subquery')).count('*');

  const total_pages = Math.ceil(+total_records[0].count / page_size);

  return {
    total_records,
    total_pages,
  };
}

export async function readTrendingRestaurantsFromSearchClicks(
  city_id: string,
  pagination: IPagination,
  start_date?: Date,
  end_date?: Date
) {
  let query = DB.read
    .from(SEARCH_CLICK_TABLE_NAME)
    .join(
      'restaurant',
      'restaurant.id',
      '=',
      `${SEARCH_CLICK_TABLE_NAME}.restaurant_id`
    )

    .where('restaurant.city_id', '=', city_id)
    .groupBy('restaurant.id')
    .orderBy('restaurant_search_clicks', 'desc')
    .select([
      'restaurant.id',
      'restaurant.name',
      'restaurant.area_id',
      'restaurant.city_id',
      DB.read.raw(
        'count(search_click.restaurant_id) as restaurant_search_clicks'
      ),
    ])
    .limit(pagination.page_size)
    .offset(pagination.page_index * pagination.page_size);

  if (start_date && end_date) {
    query = query
      .whereRaw(
        `date(${SEARCH_CLICK_TABLE_NAME}.created_at) >= '${moment(
          start_date
        ).format('YYYY-MM-DD')}'`
      )
      .whereRaw(
        `date(${SEARCH_CLICK_TABLE_NAME}.created_at) <= '${moment(
          end_date
        ).format('YYYY-MM-DD')}'`
      );
  }

  const records: {
    id: string;
    name: string;
    area_id: string;
    city_id: string;
    restaurant_search_clicks: number;
  }[] = await query;

  return {
    records,
  };
}
