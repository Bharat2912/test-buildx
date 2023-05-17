import logger from '../../../utilities/logger/winston_logger';
import {CouponCustomerTable, CouponTable, CouponVendorTable} from './constants';
import {Knex} from 'knex';
import {
  ICoupon,
  ICouponAndMapping,
  ICouponCustomer,
  ICouponVendor,
  ICouponVendorAndCoupon,
  IFilterCouponByAdmin,
  IFilterCouponByVendor,
  IFilterCouponVendorByAdmin,
  IFilterCouponVendorByVendor,
  ICouponVendorSequence,
} from './types';
import {DB} from '../../../data/knex';
import {
  CouponCreatedBy,
  CouponLevel,
  CouponVendorMappingTimeLine,
  DiscountSponseredBy,
} from './enum';
import moment from 'moment';

const COUPON_DETAILS_SQL_QUERY = `(
  SELECT
  c.id as id,
  c.code as code,
  c.header as header,
  c.description as description,
  c.terms_and_conditions as terms_and_conditions,
  c.type as type,
  c.discount_percentage as discount_percentage,
  c.discount_amount_rupees as discount_amount_rupees,
  c.start_time as start_time,
  c.end_time as end_time,
  c.level as level,
  c.max_use_count as max_use_count,
  c.coupon_use_interval_minutes as coupon_use_interval_minutes,
  c.min_order_value_rupees as min_order_value_rupees,
  c.max_discount_rupees as max_discount_rupees,
  c.discount_share_percent as discount_share_percent,
  c.discount_sponsered_by as discount_sponsered_by,
  c.created_by as created_by,
  c.created_by_user_id as created_by_user_id,
  c.is_deleted as is_deleted,
  c.created_at as created_at,
  c.updated_at as updated_at
  FROM coupon AS c
) AS a
`;

const COUPON_VENDOR_DETAILS_SQL_QUERY = `(
    SELECT
    cv.id as id,
    cv.coupon_id as coupon_id,
    cv.start_time as start_time,
    cv.end_time as end_time,
    cv.restaurant_id as restaurant_id,
    cv.mapped_by as mapped_by,
    cv.mapped_by_user_id as mapped_by_user_id,
    cv.is_deleted as is_deleted,
    cv.created_at as created_at,
    cv.updated_at as updated_at,
    cv.sequence as sequence
    FROM coupon_vendor AS cv
) AS a`;

const COUPON_VENDOR_RESTAURANT_DETAILS_SQL_QUERY = `(
  SELECT
    cv.id as id,
    cv.coupon_id as coupon_id,
    cv.start_time as start_time,
    cv.end_time as end_time,
    cv.restaurant_id as restaurant_id,
    cv.mapped_by as mapped_by,
    cv.mapped_by_user_id as mapped_by_user_id,
    cv.is_deleted as is_deleted,
    cv.created_at as created_at,
    cv.updated_at as updated_at,
	c.code as coupon_code,
	r.name as restaurant_name
    FROM coupon_vendor AS cv
	join coupon as c on cv.coupon_id = c.id
	join restaurant as r on cv.restaurant_id = r.id
) AS a`;

export async function bulkInsertCoupon(
  trx: Knex.Transaction,
  insertRows: ICoupon[]
): Promise<ICoupon> {
  logger.debug('bulk insert coupon', insertRows);
  return DB.write(CouponTable.TableName)
    .insert(insertRows)
    .returning('*')
    .transacting(trx)
    .then((coupons: ICoupon[]) => {
      logger.debug('successfully inserted coupon', coupons[0]);
      return coupons[0];
    })
    .catch((error: Error) => {
      logger.error('GOT ERROR WHILE INSERTING DATA IN COUPON TABLE', error);
      throw error;
    });
}

export async function bulkInsertCouponVendor(
  trx: Knex.Transaction,
  insertRows: ICouponVendor[]
): Promise<ICouponVendor[]> {
  logger.debug('bulk insert coupon vendor', insertRows);
  return DB.write(CouponVendorTable.TableName)
    .insert(insertRows)
    .returning('*')
    .transacting(trx)
    .then((coupon_vendor_records: ICouponVendor[]) => {
      logger.debug(
        'successfully inserted vendor coupons',
        coupon_vendor_records
      );
      return coupon_vendor_records;
    })
    .catch((error: Error) => {
      logger.error(
        'GOT ERROR WHILE INSERTING DATA IN CouponVendor TABLE',
        error
      );
      throw error;
    });
}

export async function bulkUpdateCouponVendorSequence(
  trx: Knex.Transaction,
  update_rows: ICouponVendorSequence[],
  restaurant_id: string
): Promise<ICouponVendor[]> {
  logger.debug('bulk update coupon vendor', update_rows);

  const result = await DB.write
    .raw(
      `
    UPDATE coupon_vendor
    SET sequence = values.sequence
    FROM (VALUES ${update_rows
      .map(record => `(${record.id}, ${record.sequence})`)
      .join(', ')}) AS values(id, sequence)
    WHERE coupon_vendor.id = values.id
    AND restaurant_id = '${restaurant_id}'
    AND is_deleted = false
    AND start_time <= CURRENT_TIMESTAMP
    AND end_time >= CURRENT_TIMESTAMP
    RETURNING *
  `
    )
    .transacting(trx);

  return result.rows;
}

export async function bulkInsertCouponCustomer(
  trx: Knex.Transaction,
  insertRows: ICouponCustomer[]
): Promise<ICouponCustomer> {
  logger.debug('bulk insert coupon customer', insertRows);
  return DB.write(CouponCustomerTable.TableName)
    .insert(insertRows)
    .returning('*')
    .transacting(trx)
    .then((coupon_customer: ICouponCustomer[]) => {
      logger.debug(
        'successfully bulk inserted coupon for customer',
        coupon_customer[0]
      );
      return coupon_customer[0];
    })
    .catch((error: Error) => {
      logger.error(
        'GOT ERROR WHILE INSERTING DATA IN CouponCustomer TABLE',
        error
      );
      throw error;
    });
}

export async function readCouponCustomerByCustomerAndCouponId(
  coupon_id: number,
  customer_id: string
): Promise<ICouponCustomer> {
  logger.debug('reading coupon customer by customer', {coupon_id, customer_id});
  return DB.read
    .select('*')
    .from(CouponCustomerTable.TableName)
    .where({coupon_id: coupon_id, customer_id: customer_id})
    .then((coupon_customer: ICouponCustomer[]) => {
      logger.debug(
        'successfully fetched coupon for customer',
        coupon_customer[0]
      );
      return coupon_customer[0];
    })
    .catch((error: Error) => {
      logger.error(
        `GOT ERROR WHILE FETCHING DATA FROM COUPON CUSTOMER TABLE COUPON ID: ${coupon_id}`,
        error
      );
      throw error;
    });
}

export async function readAllCouponsUsedByCustomer(
  customer_id: string
): Promise<ICouponCustomer[]> {
  logger.debug('read all coupons used by customers', customer_id);
  return DB.read
    .select('*')
    .from(CouponCustomerTable.TableName)
    .where({customer_id: customer_id})
    .then((coupon_customer: ICouponCustomer[]) => {
      logger.debug('fetched all coupons used by customers', coupon_customer);
      return coupon_customer;
    })
    .catch((error: Error) => {
      logger.error(
        `GOT ERROR WHILE FETCHING DATA FROM COUPON CUSTOMER TABLE CUSTOMER ID: ${customer_id}`,
        error
      );
      throw error;
    });
}

export async function readCouponsByCodeAndDuration(
  code: string,
  start_time: string,
  end_time: string
): Promise<ICoupon[]> {
  logger.debug('read coupons by code and duration', {
    code,
    start_time,
    end_time,
  });
  return DB.read
    .select('*')
    .from(CouponTable.TableName)
    .whereRaw(
      `(start_time between '${start_time}' and '${end_time}'
       or end_time between '${start_time}' and '${end_time}')
       and
       (code = '${code}')
       and
       (is_deleted = false)
       `
    )
    .then((coupons: ICoupon[]) => {
      logger.debug('successfully fetched coupon by code and duration', coupons);
      return coupons;
    })
    .catch((error: Error) => {
      logger.error(
        `GOT ERROR WHILE FETCHING DATA FROM COUPON TABLE MATCHING CODE: ${code} IN DURATION ${start_time}
        and ${end_time}`,
        error
      );
      throw error;
    });
}

export async function updateCouponVendorById(
  trx: Knex.Transaction,
  coupon_mapping_ids: number[],
  updateRows: ICouponVendor,
  restaurant_id?: string
): Promise<ICouponVendor[]> {
  logger.debug('updating coupon vendor by coupon id restaurant ids', {
    coupon_mapping_ids,
    restaurant_id,
    updateRows,
  });
  const query = DB.write(CouponVendorTable.TableName)
    .update(updateRows)
    .returning('*')
    .whereIn('id', coupon_mapping_ids)
    .where({is_deleted: false})
    .transacting(trx);
  if (restaurant_id) {
    query.where('restaurant_id', restaurant_id);
  }
  return await query
    .then((coupon_vendor: ICouponVendor[]) => {
      logger.debug(
        'successfully updated coupon vendor by coupon id restaurant ids',
        coupon_vendor
      );
      return coupon_vendor;
    })
    .catch((error: Error) => {
      logger.error('GOT ERROR WHILE UPDATING COUPON VENDOR', error);
      throw error;
    });
}

export async function updateCouponCustomerById(
  trx: Knex.Transaction,
  coupon_customer_id: number,
  updateRows: ICouponCustomer
): Promise<ICouponCustomer[]> {
  logger.debug('update coupon customer by id', {
    coupon_customer_id,
    updateRows,
  });
  return DB.write(CouponCustomerTable.TableName)
    .update(updateRows)
    .returning('*')
    .where({id: coupon_customer_id})
    .transacting(trx)
    .then((coupon_customer: ICouponCustomer[]) => {
      logger.debug(
        'successfully update coupon customer by id',
        coupon_customer
      );
      return coupon_customer;
    })
    .catch((error: Error) => {
      logger.error('GOT ERROR WHILE UPDATING COUPON CUSTOMER', error);
      throw error;
    });
}

/**
 * function is used to get coupon by coupon id, coupon code and restaurant id
 * This function is used in cart for coupon validation
 */
export async function readCouponAndMappingByRestaurant(
  restaurant_id: string,
  customer_id: string,
  coupon_id?: number,
  coupon_code?: string
) {
  //to get all active coupons
  const current_time = new Date().toISOString();
  let DBQuery = DB.read.select('*').fromRaw(`
  (
  SELECT
  c.id,
  c.code,
  c.header,
  c.description,
  c.terms_and_conditions,
  c.type,
  c.discount_percentage,
  c.discount_amount_rupees,
  c.start_time,
  c.end_time,
  c.level,
  c.max_use_count,
  c.coupon_use_interval_minutes,
  c.min_order_value_rupees,
  c.max_discount_rupees,
  c.discount_share_percent,
  c.discount_sponsered_by,
  c.created_by,
  c.created_by_user_id,
  c.is_deleted,
  c.created_at,
  c.updated_at,
  (
    SELECT
      row_to_json(cv)
    FROM
      (
        SELECT
          cv.id,
          cv.coupon_id,
          cv.start_time,
          cv.end_time,
          cv.restaurant_id,
          cv.mapped_by,
          cv.mapped_by_user_id,
          cv.is_deleted,
          cv.created_at,
          cv.updated_at
        FROM
          coupon_vendor AS cv
        WHERE
          c.id = cv.coupon_id
          and cv.is_deleted = false
          and cv.restaurant_id = '${restaurant_id}'
          and (cv.start_time <= '${current_time}' and cv.end_time >= '${current_time}')
      ) AS cv
  ) AS mapping_details,
  (
    SELECT
      row_to_json(cc)
    FROM
      (
        SELECT
         cc.id,
         cc.customer_id,
         cc.coupon_id,
         cc.last_time_used,
         cc.coupon_use_count,
         cc.created_at,
         cc.updated_at
        FROM
          coupon_customer AS cc
        WHERE
          c.id = cc.coupon_id and cc.customer_id = '${customer_id}'
      ) AS cc
  ) AS coupon_customer_details
FROM
  coupon AS c
WHERE c.is_deleted = false and (c.start_time <= '${current_time}' and c.end_time >= '${current_time}')
 ) AS a
  `);

  if (coupon_id) {
    DBQuery = DBQuery.where('id', coupon_id);
  }
  if (coupon_code) {
    DBQuery = DBQuery.where('code', coupon_code);
  }
  const result = await DBQuery.select('*');
  return result[0];
}

/**
 * Get active/inactive coupon details and its active/inactve mapping details for admin
 */
export async function readCouponAndMappingByCouponId(coupon_id: number) {
  const DBQuery = DB.read.select('*').fromRaw(`
  (
    SELECT c.id
    ,c.code
    ,c.header
    ,c.description
    ,c.terms_and_conditions
    ,c.type
    ,c.discount_percentage
    ,c.discount_amount_rupees
    ,c.start_time
    ,c.end_time
    ,c.LEVEL
    ,c.max_use_count
    ,c.coupon_use_interval_minutes
    ,c.min_order_value_rupees
    ,c.max_discount_rupees
    ,c.discount_share_percent
    ,c.discount_sponsered_by
    ,c.created_by
    ,c.created_by_user_id
    ,c.is_deleted
    ,c.created_at
    ,c.updated_at
    ,(
      SELECT to_json(array_agg(row_to_json(cv)))
      FROM (
        SELECT cv.id
          ,cv.coupon_id
          ,cv.start_time
          ,cv.end_time
          ,cv.restaurant_id
          ,cv.mapped_by
          ,cv.mapped_by_user_id
          ,cv.is_deleted
          ,cv.created_at
          ,cv.updated_at
        FROM coupon_vendor AS cv
        WHERE c.id = cv.coupon_id
        ) AS cv
      ) AS mapping_details
  FROM coupon AS c
  WHERE c.id = ${coupon_id}
  ORDER BY c.updated_at DESC
 ) AS a
  `);

  const result = await DBQuery.select('*');

  return result[0];
}

/**
 * Read all active coupons used by a particular restaurant
 * the repsonse structure is coupon_vendor to coupon table
 */
export function readActiveCouponsUsedByRestaurant(restaurant_id: string) {
  //to get all active coupons
  const current_time = new Date().toISOString();
  return DB.read
    .fromRaw(
      `(
      SELECT
      cv.id,
      cv.coupon_id,
      cv.start_time,
      cv.end_time,
      cv.restaurant_id,
      cv.mapped_by,
      cv.mapped_by_user_id,
      cv.is_deleted,
      cv.created_at,
      cv.updated_at,
        (
          SELECT row_to_json(c)
          FROM (
          SELECT
          c.id,
          c.code,
          c.header,
          c.description,
          c.terms_and_conditions,
          c.type,
          c.discount_percentage,
          c.discount_amount_rupees,
          c.start_time,
          c.end_time,
          c.level,
          c.max_use_count,
          c.coupon_use_interval_minutes,
          c.min_order_value_rupees,
          c.max_discount_rupees,
          c.discount_share_percent,
          c.discount_sponsered_by,
          c.created_by,
          c.created_by_user_id,
          c.is_deleted,
          c.created_at,
          c.updated_at
          FROM coupon AS c
          WHERE c.id = cv.coupon_id
          and (c.start_time <= '${current_time}' and c.end_time >= '${current_time}')
          and c.is_deleted = false
          ) AS c
        ) AS coupon_details
    FROM "coupon_vendor" AS cv
    WHERE
    cv.is_deleted = false
    and cv.restaurant_id = '${restaurant_id}'
    and (cv.start_time <= '${current_time}' and cv.end_time >= '${current_time}')
    ORDER BY cv.updated_at desc
    ) AS a
    `
    )
    .select('*')
    .then((coupon_vendor_records: ICouponVendorAndCoupon[]) => {
      return coupon_vendor_records;
    })
    .catch((error: Error) => {
      throw error;
    });
}

/**
 * Read a active coupon and future coupons and its active mapping by restaurant id, and coupon id
 * This function is used for check in optin api for vendor to check for existing active mapping
 */
export async function readActiveCoupon(coupon_id: number) {
  const current_time = new Date().toISOString();
  const DBQuery = DB.read.select('*').fromRaw(
    `(
        SELECT c.id
        ,c.code
        ,c.header
        ,c.description
        ,c.terms_and_conditions
        ,c.type
        ,c.discount_percentage
        ,c.discount_amount_rupees
        ,c.start_time
        ,c.end_time
        ,c.LEVEL
        ,c.max_use_count
        ,c.coupon_use_interval_minutes
        ,c.min_order_value_rupees
        ,c.max_discount_rupees
        ,c.discount_share_percent
        ,c.discount_sponsered_by
        ,c.created_by
        ,c.created_by_user_id
        ,c.is_deleted
        ,c.created_at
        ,c.updated_at
      FROM coupon AS c
      WHERE c.is_deleted = false
        AND c.id = ${coupon_id}
        AND c.LEVEL = '${CouponLevel.RESTAURANT}'
        AND (c.end_time >= '${current_time}')
      ORDER BY c.updated_at DESC
      ) AS a
      `
  );
  const result = await DBQuery.select('*');

  return result[0];
}

export async function readCouponMappingOfSpecificDuration(
  coupon_id: number,
  restaurant_ids: string,
  start_time: Date,
  end_time: Date
) {
  const DBQuery = DB.read.select('*').fromRaw(`
  (
  SELECT cv.id
       ,cv.coupon_id
       ,cv.start_time
       ,cv.end_time
       ,cv.restaurant_id
       ,cv.mapped_by
       ,cv.mapped_by_user_id
       ,cv.is_deleted
       ,cv.created_at
       ,cv.updated_at
     FROM coupon_vendor AS cv
     WHERE cv.coupon_id = ${coupon_id}
       AND cv.is_deleted = false
       AND cv.restaurant_id IN (${restaurant_ids})
       AND (cv.start_time <= '${end_time.toISOString()}' and cv.end_time >= '${start_time.toISOString()}')
       ) AS a
   `);

  const result = await DBQuery.select('*');

  return result[0];
}

/**
 * Function returns all the coupons which are available for optin for a particular restaurant.
 * It check for active mapping and allows to optin into future active coupons
 */
export function readAllAvailableForOptinCouponsForRestaurant(
  restaurant_id: string,
  vendor_ids: string
) {
  const current_time = new Date().toISOString();
  return DB.read
    .select('*')
    .fromRaw(
      `(
      SELECT
      c.id,
      c.code,
      c.header,
      c.description,
      c.terms_and_conditions,
      c.type,
      c.discount_percentage,
      c.discount_amount_rupees,
      c.start_time,
      c.end_time,
      c.level,
      c.max_use_count,
      c.coupon_use_interval_minutes,
      c.min_order_value_rupees,
      c.max_discount_rupees,
      c.discount_share_percent,
      c.discount_sponsered_by,
      c.created_by,
      c.created_by_user_id,
      c.is_deleted,
      c.created_at,
      c.updated_at
        FROM
            coupon AS c
        LEFT JOIN coupon_vendor as cv on c.id = cv.coupon_id
        and cv.is_deleted = false
        and cv.restaurant_id = '${restaurant_id}'
        and (cv.end_time >= '${current_time}')

        where  c.is_deleted = false
        AND c.level = '${CouponLevel.RESTAURANT}'
        AND
        (
        (c.created_by = '${CouponCreatedBy.ADMIN}')
        OR
        (c.created_by = '${CouponCreatedBy.VENDOR}' and c.created_by_user_id in (${vendor_ids}))
        )
        and cv.coupon_id is null
        and c.end_time >= '${current_time}'
        ORDER BY c.updated_at desc ) AS a
      `
    )
    .then((coupons: ICoupon[]) => {
      return coupons;
    })
    .catch((error: Error) => {
      throw error;
    });
}

/**
 * Function returns all the global level coupons and coupons applicable to particular restaurant
 */
export function readCouponsForCustomer(
  restaurant_id: string,
  vendor_ids: string
) {
  const current_time = new Date().toISOString();
  logger.debug(current_time);
  return DB.read
    .select('*')
    .fromRaw(
      `(
      SELECT
      c.id,
      c.code,
      c.header,
      c.description,
      c.terms_and_conditions,
      c.type,
      c.discount_percentage,
      c.discount_amount_rupees,
      c.start_time,
      c.end_time,
      c.level,
      c.max_use_count,
      c.coupon_use_interval_minutes,
      c.min_order_value_rupees,
      c.max_discount_rupees,
      c.discount_share_percent,
      c.discount_sponsered_by,
      c.created_by,
      c.created_by_user_id,
      c.is_deleted,
      c.created_at,
      c.updated_at
        FROM
            coupon AS c
        LEFT JOIN coupon_vendor as cv on c.id = cv.coupon_id and cv.is_deleted = false
                   and cv.restaurant_id = '${restaurant_id}'
                   and (cv.start_time <= '${current_time}' and cv.end_time >= '${current_time}')
        where  c.is_deleted = false
        AND
        (
        c.level = '${CouponLevel.GLOBAL}'
        OR
        (c.level = '${CouponLevel.RESTAURANT}' and
         c.created_by = '${CouponCreatedBy.VENDOR}' and
         created_by_user_id in (${vendor_ids})
         and cv.coupon_id is not null
        )
        OR
        (c.level = '${CouponLevel.RESTAURANT}' and
         c.created_by = '${CouponCreatedBy.ADMIN}'
         and cv.coupon_id is not null
        )
        )
        AND (c.start_time <= '${current_time}' and c.end_time >= '${current_time}')
        ORDER BY c.updated_at desc ) AS a
      `
    )
    .then((coupons: ICoupon[]) => {
      return coupons;
    })
    .catch((error: Error) => {
      throw error;
    });
}

export async function readCouponsWithFilterAsAdmin(
  params: IFilterCouponByAdmin
): Promise<{
  total_records: number;
  total_pages: number;
  records: ICoupon[];
}> {
  const {search_text, filter, pagination} = params;

  let DBQuery = DB.read.fromRaw(COUPON_DETAILS_SQL_QUERY);

  if (filter) {
    if (filter.vendor_ids) {
      DBQuery = DBQuery.whereIn('created_by_user_id', filter.vendor_ids);
    }

    if (filter.created_by) {
      DBQuery = DBQuery.where('created_by', filter.created_by);
    }

    if (filter.discount_sponsered_by) {
      DBQuery = DBQuery.where(
        'discount_sponsered_by',
        filter.discount_sponsered_by
      );
    }

    if (filter.max_use_count) {
      DBQuery = DBQuery.where('max_use_count', filter.max_use_count);
    }

    if (filter.level) {
      DBQuery = DBQuery.where('level', filter.level);
    }

    if (filter.type) {
      DBQuery = DBQuery.where('type', filter.type);
    }

    if (filter.duration) {
      DBQuery = DBQuery.whereRaw(
        `start_time >= to_timestamp(${filter.duration.start_date}) and end_time <= to_timestamp(${filter.duration.end_date})`
      );
    }
  }

  if (search_text) {
    const updated_search_text = search_text.split("'").join("''");
    DBQuery = DBQuery.whereRaw(
      `id::character varying(20) LIKE '${updated_search_text}%' OR code LIKE '%${updated_search_text}%'`
    );
  }

  const total_records = await DBQuery.clone().count('*');

  let page_size;
  let page_index;
  if (pagination) {
    page_size = pagination.page_size;
    page_index = pagination.page_index - 1;
  } else {
    page_size = 10;
    page_index = 0;
  }
  const offset = page_index * page_size;
  DBQuery = DBQuery.offset(offset).limit(page_size);
  const total_pages = Math.ceil(total_records[0].count / page_size);

  const records = await DBQuery.clone().select('*');

  logger.debug('>>>', DBQuery.toSQL().toNative());

  return {
    total_records: total_records[0].count,
    total_pages,
    records,
  };
}

export async function readCouponsWithFilterAsVendor(
  params: IFilterCouponByVendor
): Promise<{
  total_records: number;
  total_pages: number;
  records: ICoupon[];
}> {
  const {search_text, filter, pagination} = params;

  let DBQuery = DB.read.fromRaw(COUPON_DETAILS_SQL_QUERY);

  if (filter) {
    if (filter.vendor_ids) {
      DBQuery = DBQuery.whereIn('created_by_user_id', filter.vendor_ids);
    }

    DBQuery = DBQuery.where('created_by', CouponCreatedBy.VENDOR);

    DBQuery = DBQuery.where(
      'discount_sponsered_by',
      DiscountSponseredBy.RESTAURANT
    );

    if (filter.max_use_count) {
      DBQuery = DBQuery.where('max_use_count', filter.max_use_count);
    }

    DBQuery = DBQuery.where('level', CouponLevel.RESTAURANT);

    if (filter.type) {
      DBQuery = DBQuery.where('type', filter.type);
    }

    if (filter.duration) {
      DBQuery = DBQuery.whereRaw(
        `start_time >= to_timestamp(${filter.duration.start_date}) and end_time <= to_timestamp(${filter.duration.end_date})`
      );
    }
  }

  if (search_text) {
    DBQuery = DBQuery.whereRaw(
      `id::character varying(20) LIKE '${search_text.split("'").join("''")}%'`
    );
  }

  const total_records = await DBQuery.clone().count('*');

  let page_size;
  let page_index;
  if (pagination) {
    page_size = pagination.page_size;
    page_index = pagination.page_index - 1;
  } else {
    page_size = 10;
    page_index = 0;
  }
  const offset = page_index * page_size;
  DBQuery = DBQuery.offset(offset).limit(page_size);
  const total_pages = Math.ceil(total_records[0].count / page_size);

  const records = await DBQuery.clone().select('*');

  logger.debug('>>>', DBQuery.toSQL().toNative());

  return {
    total_records: total_records[0].count,
    total_pages,
    records,
  };
}

export async function readCouponVendorMappingWithFilterAsAdmin(
  params: IFilterCouponVendorByAdmin
): Promise<{
  total_records: number;
  total_pages: number;
  records: ICoupon[];
}> {
  const {search_text, filter, pagination} = params;
  let DBQuery = DB.read.fromRaw(COUPON_VENDOR_RESTAURANT_DETAILS_SQL_QUERY);

  if (filter) {
    if (filter.coupon_id) {
      DBQuery = DBQuery.where('coupon_id', filter.coupon_id);
    }

    if (filter.restaurant_id) {
      DBQuery = DBQuery.where('restaurant_id', filter.restaurant_id);
    }

    if (filter.mapped_by) {
      DBQuery = DBQuery.where('mapped_by', filter.mapped_by);
    }

    if (filter.timeline) {
      let flag = 0;
      let DBSubQuery = '';
      filter.timeline.map((timeline: CouponVendorMappingTimeLine) => {
        if (timeline === CouponVendorMappingTimeLine.EXPIRED) {
          if (flag === 0) {
            DBSubQuery += `(
                start_time < to_timestamp(${moment().unix()}) and end_time < to_timestamp(${moment().unix()})
                or
                is_deleted = true
               )`;
          } else {
            DBSubQuery += `or (
                start_time < to_timestamp(${moment().unix()}) and end_time < to_timestamp(${moment().unix()})
                or
                is_deleted = true
               )`;
          }
          flag += 1;
        } else if (timeline === CouponVendorMappingTimeLine.ACTIVE) {
          if (flag === 0) {
            DBSubQuery += `(
                start_time <= to_timestamp(${moment().unix()}) and end_time > to_timestamp(${moment().unix()})
                and
                is_deleted = false
               )`;
          } else {
            DBSubQuery += `or (
                start_time <= to_timestamp(${moment().unix()}) and end_time > to_timestamp(${moment().unix()})
                and
                is_deleted = false
               )`;
          }
          flag += 1;
        } else if (timeline === CouponVendorMappingTimeLine.UPCOMING) {
          if (flag === 0) {
            DBSubQuery += `(
               start_time > to_timestamp(${moment().unix()}) and end_time > to_timestamp(${moment().unix()})
               and
               is_deleted = false
               )`;
          } else {
            DBSubQuery += `or (
               start_time > to_timestamp(${moment().unix()}) and end_time > to_timestamp(${moment().unix()})
               and
               is_deleted = false
               )`;
          }
          flag += 1;
        } else {
          throw 'invalid coupon vendor mapping timeline';
        }
      });
      DBQuery.whereRaw(`(${DBSubQuery})`);
    }

    if (filter.duration) {
      DBQuery = DBQuery.whereRaw(
        `start_time >= to_timestamp(${filter.duration.start_date}) and end_time <= to_timestamp(${filter.duration.end_date})`
      );
    }
  }

  if (search_text) {
    DBQuery = DBQuery.whereRaw(
      `id::character varying(20) LIKE '${search_text}%'`
    );
  }

  const total_records = await DBQuery.clone().count('*');

  let page_size;
  let page_index;
  if (pagination) {
    page_size = pagination.page_size;
    page_index = pagination.page_index - 1;
  } else {
    page_size = 10;
    page_index = 0;
  }
  const offset = page_index * page_size;
  DBQuery = DBQuery.offset(offset).limit(page_size);
  const total_pages = Math.ceil(total_records[0].count / page_size);

  const records = await DBQuery.clone().select('*');
  logger.debug('filter coupon vendor as admin sql', DBQuery.toSQL().toNative());

  return {
    total_records: total_records[0].count,
    total_pages,
    records,
  };
}

export async function readCouponVendorMappingWithFilterAsVendor(
  params: IFilterCouponVendorByVendor
): Promise<{
  total_records: number;
  total_pages: number;
  records: ICoupon[];
}> {
  const {search_text, filter, pagination} = params;

  let DBQuery = DB.read.fromRaw(COUPON_VENDOR_DETAILS_SQL_QUERY);

  if (filter) {
    if (filter.coupon_id) {
      DBQuery = DBQuery.where('coupon_id', filter.coupon_id);
    }

    DBQuery = DBQuery.where('restaurant_id', filter.restaurant_id);

    // DBQuery = DBQuery.where('mapped_by', CouponMappedBy.VENDOR);

    if (filter.duration) {
      DBQuery = DBQuery.whereRaw(
        `start_time >= to_timestamp(${filter.duration.start_date}) and end_time <= to_timestamp(${filter.duration.end_date})`
      );
    }
  }

  if (search_text) {
    DBQuery = DBQuery.whereRaw(
      `id::character varying(20) LIKE '${search_text.split("'").join("''")}%'`
    );
  }

  const total_records = await DBQuery.clone().count('*');

  let page_size;
  let page_index;
  if (pagination) {
    page_size = pagination.page_size;
    page_index = pagination.page_index - 1;
  } else {
    page_size = 10;
    page_index = 0;
  }
  const offset = page_index * page_size;
  DBQuery = DBQuery.offset(offset).limit(page_size);
  const total_pages = Math.ceil(total_records[0].count / page_size);

  const records = await DBQuery.clone().select('*');

  logger.debug(
    'readCouponVendorMappingWithFilterAsVendor_query',
    DBQuery.toSQL().toNative()
  );

  return {
    total_records: total_records[0].count,
    total_pages,
    records,
  };
}

export async function readCouponsOfAllTimeLine(
  restaurant_id: string,
  vendor_ids: string
): Promise<ICouponAndMapping[]> {
  logger.debug(
    'reading timeline of all coupon for restaurant_id',
    restaurant_id
  );
  logger.debug('CREATED BY VENDOR IDS', vendor_ids);

  return DB.read
    .select('*')
    .fromRaw(
      `(
      SELECT
      c.id,
      c.code,
      c.header,
      c.description,
      c.terms_and_conditions,
      c.type,
      c.discount_percentage,
      c.discount_amount_rupees,
      c.start_time,
      c.end_time,
      c.level,
      c.max_use_count,
      c.coupon_use_interval_minutes,
      c.min_order_value_rupees,
      c.max_discount_rupees,
      c.discount_share_percent,
      c.discount_sponsered_by,
      c.created_by,
      c.created_by_user_id,
      c.is_deleted,
      c.created_at,
      c.updated_at,
      (
        SELECT to_json(array_agg(row_to_json(cv)))
        FROM (
          SELECT cv.id
            ,cv.coupon_id
            ,cv.start_time
            ,cv.end_time
            ,cv.restaurant_id
            ,cv.mapped_by
            ,cv.mapped_by_user_id
            ,cv.is_deleted
            ,cv.created_at
            ,cv.updated_at
            ,cv.sequence
          FROM coupon_vendor AS cv
          WHERE c.id = cv.coupon_id
          and cv.restaurant_id = '${restaurant_id}'
          ORDER BY cv.end_time asc
          ) AS cv
        ) AS mapping_details
      FROM coupon AS c
      WHERE c.LEVEL = '${CouponLevel.RESTAURANT}'
      AND
      (
      (c.created_by = '${CouponCreatedBy.ADMIN}')
      OR
      (c.created_by = '${CouponCreatedBy.VENDOR}' and c.created_by_user_id in (${vendor_ids}))
      )
      ORDER BY c.updated_at desc ) AS a
      `
    )
    .then((coupons: ICouponAndMapping[]) => {
      return coupons;
    })
    .catch((error: Error) => {
      throw error;
    });
}

export async function readCouponVendorMappingByMappingIds(
  mapping_ids: number[]
) {
  return DB.read
    .select('*')
    .from(CouponVendorTable.TableName)
    .whereIn(CouponVendorTable.ColumnNames.id, mapping_ids)
    .then((coupon_vendor_mapping: ICouponVendor[]) => {
      logger.debug(
        'successfully fetched coupon vendor mapping  by mapping ids',
        coupon_vendor_mapping
      );
      return coupon_vendor_mapping;
    })
    .catch((error: Error) => {
      logger.error(
        'GOT ERROR WHILE FETCHING DATA FROM COUPON_VENDOR TABLE BY MAPPING IDS',
        error
      );
      throw error;
    });
}
