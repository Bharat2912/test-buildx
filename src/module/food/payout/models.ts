import {DB} from '../../../data/knex';
import logger from '../../../utilities/logger/winston_logger';
import {Knex} from 'knex';
import {v4 as uuidv4} from 'uuid';
import {IOrderDetails} from '../order/types';
import {Service} from '../../../enum';
import {OrderStatus} from '../order/enums';
import {RefundStatus} from '../../core/payment/enum';
import {getUpcomingPayoutOrders} from '../order/models';
import {IPayout, IPayoutFilter, IPayoutRestaurant} from './types';
import {PayoutStatus} from './enums';
import {PAYOUT_WITH_ORDERS_QUERY} from './constants';
import {
  getPayoutTransferDetails,
  processPayoutTransfer,
} from '../../../internal/payout';

export function createPayout(
  trx: Knex.Transaction,
  payout: IPayout
): Promise<IPayout[]> {
  logger.debug('creating Payout', payout);
  return DB.write('payout')
    .insert(payout)
    .returning('*')
    .transacting(trx)
    .then((payout: IPayout[]) => {
      logger.debug('successfully created payout', payout);
      return payout;
    })
    .catch((error: Error) => {
      throw error;
    });
}

export async function readPayoutsByStatus(
  status: PayoutStatus[]
): Promise<IPayout[]> {
  logger.debug('reading payouts by status', status);
  const DBQuery = DB.read
    .select('*')
    .from('payout')
    .where({
      is_deleted: false,
      retry: true,
    })
    .whereIn('status', status);

  logger.debug('readPendingPayouts >>>', DBQuery.toSQL().toNative());
  return DBQuery.then((payouts: IPayout[]) => {
    logger.debug('read pending payouts from db result', payouts);
    return payouts;
  }).catch((error: Error) => {
    throw error;
  });
}

export async function getPayoutRestaurants(): Promise<IPayoutRestaurant[]> {
  let DBQuery = DB.read('restaurant').select([
    'id',
    'name',
    'image',
    'created_at',
  ]);
  DBQuery = DBQuery.where({
    is_deleted: false,
    status: 'active',
    hold_payout: false,
  }).select(
    DB.read.raw(`(
      SELECT to_json(r)
      FROM (
        select *
        from payout_account
        where
        restaurant.id = payout_account.restaurant_id
          and is_primary = true
          and is_deleted = false
        limit 1
        ) AS r
      ) AS account`)
  );

  logger.debug('getPayoutRestaurants sql query', DBQuery.toSQL().toNative());
  return DBQuery.then((restaurants: IPayoutRestaurant[]) => {
    logger.debug('getPayoutRestaurants DB Result', restaurants);
    return restaurants;
  }).catch((error: Error) => {
    throw error;
  });
}

export async function getLastPayout(restaurant_id: string): Promise<IPayout> {
  let DBQuery = DB.read.select('*');
  DBQuery = DBQuery.fromRaw(
    '(SELECT *, MAX(end_time) OVER (PARTITION BY restaurant_id) as max_end_time FROM payout) as a'
  )
    .where({restaurant_id: restaurant_id})
    .where(DB.read.raw('end_time = max_end_time'));

  logger.debug('getLastPayout sql query', DBQuery.toSQL().toNative());
  return DBQuery.then((payouts: IPayout[]) => {
    logger.debug('getLastPayout DB result', payouts);
    return payouts[0];
  }).catch((error: Error) => {
    throw error;
  });
}

export function readPayouts(restaurant_id?: string): Promise<IPayout[]> {
  const qry = DB.read.select('*').from('payout').where({
    is_deleted: false,
    restaurant_id,
  });

  return qry
    .then((payout: IPayout[]) => {
      return payout;
    })
    .catch((error: Error) => {
      throw error;
    });
}

export function readPayout(id: string): Promise<IPayout> {
  return DB.read
    .select('*')
    .from('payout')
    .where({
      is_deleted: false,
      id,
    })
    .then((payout: IPayout[]) => {
      return payout[0];
    })
    .catch((error: Error) => {
      throw error;
    });
}

export function readPayoutByTrxId(trx_id: string): Promise<IPayout> {
  return DB.read
    .select('*')
    .from('payout')
    .where({
      is_deleted: false,
      transaction_id: trx_id,
    })
    .then((payout: IPayout[]) => {
      return payout[0];
    })
    .catch((error: Error) => {
      throw error;
    });
}

export function updatePayout(payout: IPayout): Promise<IPayout[]> {
  payout.updated_at = new Date();
  logger.debug('updating Payout', payout);
  return DB.write('payout')
    .update(payout)
    .returning('*')
    .where({id: payout.id})
    .then((payout: IPayout[]) => {
      return payout;
    })
    .catch((error: Error) => {
      throw error;
    });
}

export async function filterPayouts(
  restaurant_ids: string[],
  data: IPayoutFilter
) {
  let DBQuery = DB.read.fromRaw(PAYOUT_WITH_ORDERS_QUERY);
  if (restaurant_ids && restaurant_ids.length) {
    DBQuery = DBQuery.whereIn('restaurant_id', restaurant_ids);
  }
  if (data.filter) {
    if (data.filter.status) {
      DBQuery = DBQuery.whereIn('status', data.filter.status);
    }
    if (data.filter.start_date) {
      DBQuery = DBQuery.where('start_time', '>=', data.filter.start_date);
    }
    if (data.filter.end_date) {
      DBQuery = DBQuery.where('end_time', '<=', data.filter.end_date);
    }
    if (data.filter.amount_gt) {
      DBQuery = DBQuery.where(
        'amount_paid_to_vendor',
        '>=',
        data.filter.amount_gt
      );
    }
    if (data.filter.amount_lt) {
      DBQuery = DBQuery.where(
        'amount_paid_to_vendor',
        '<=',
        data.filter.amount_lt
      );
    }
    if (data.filter.retry !== undefined) {
      DBQuery = DBQuery.where({retry: data.filter.retry});
    }
    if (data.filter.completed_by_admin !== undefined) {
      if (data.filter.completed_by_admin)
        DBQuery = DBQuery.where(
          DB.read.raw('completed_marked_admin_id is not null')
        );
      else
        DBQuery = DBQuery.where(
          DB.read.raw('completed_marked_admin_id is null')
        );
    }
  }
  if (data.search_text) {
    data.search_text = data.search_text.split("'").join("''");
    DBQuery = DBQuery.whereRaw(
      `( restaurant_id LIKE '${data.search_text}%' or id LIKE '${data.search_text}%')`
    );
  }
  const total_records: number = (await DBQuery.clone().count('*'))[0].count;
  let total_pages = total_records;
  logger.debug('filterPayouts >>>', DBQuery.toSQL().toNative());

  if (data.pagination) {
    const offset =
      (data.pagination.page_index || 0) * data.pagination.page_size;
    DBQuery = DBQuery.offset(offset).limit(data.pagination.page_size);
    total_pages = Math.ceil(total_records / data.pagination.page_size);
  }

  if (data.sort_by && data.sort_by.column) {
    DBQuery = DBQuery.orderBy(
      data.sort_by.column,
      data.sort_by.direction || 'asc'
    );
  }

  const records: IPayout[] = await DBQuery.clone().select('*');

  return {
    total_records,
    total_pages,
    payouts: records,
  };
}

export async function processPayout(payout: IPayout) {
  try {
    if (
      payout.transaction_id &&
      payout.payout_details &&
      payout.payout_details.account &&
      payout.payout_details.account.beneficiary_details
    ) {
      const result = await processPayoutTransfer({
        beneId:
          payout.payout_details.account.beneficiary_details.beneficiary_id,
        amount: payout.amount_paid_to_vendor + '',
        transferId: payout.transaction_id,
        service: Service.FOOD_API,
      });
      payout.transaction_details = result.additional_details;
      payout.status = result.payout_status!;
      if (result.payout_status === PayoutStatus.COMPLETE) {
        payout.payout_completed_time = result.payout_completed_time;
      }
      await updatePayoutStatus(payout);
    }
  } catch (error) {
    logger.error('process payout failed with error', error);
    logger.error('process payout failed with payout details', payout);
    payout.status = PayoutStatus.FAILED;
    payout.transaction_details = {
      messgae: 'Internal server error',
      data: error,
    };
    try {
      const save_payout: IPayout = <IPayout>{
        id: payout.id,
        status: payout.status,
        transaction_details: payout.transaction_details,
        payout_completed_time: payout.payout_completed_time,
      };
      await updatePayout(save_payout);
    } catch (error) {
      logger.error('Failed payout:' + payout.id, error);
      throw payout.id + '\t amount:' + payout.amount_paid_to_vendor;
    }
  }
  return payout;
}
export async function updatePayoutWithTrx(
  trx: Knex.Transaction,
  payout: IPayout
): Promise<IPayout[]> {
  payout.updated_at = new Date();
  logger.debug('updating Payout', payout);
  return await DB.write('payout')
    .update(payout)
    .returning('*')
    .where({id: payout.id})
    .transacting(trx)
    .then((payout: IPayout[]) => {
      return payout;
    })
    .catch((error: Error) => {
      throw error;
    });
}
export async function updatePayoutStatus(payout: IPayout) {
  try {
    logger.debug('updating payout status', payout);
    const result = await getPayoutTransferDetails({
      transfer_id: payout.transaction_id!,
      service: Service.FOOD_API,
    });
    payout.transaction_details = result.additional_details;
    payout.status = result.payout_status!;
    if (result.payout_status === PayoutStatus.COMPLETE) {
      payout.payout_completed_time = result.payout_completed_time;
    }
  } catch (error) {
    payout.status = PayoutStatus.FAILED;
    payout.transaction_details = {
      messgae: 'Internal server error',
      data: error,
    };
  }
  try {
    const save_payout: IPayout = <IPayout>{
      id: payout.id,
      status: payout.status,
      transaction_details: payout.transaction_details,
      payout_completed_time: payout.payout_completed_time,
    };
    await updatePayout(save_payout);
  } catch (error) {
    logger.error('Failed payout:' + payout.id, error);
    throw payout.id + '\t amount:' + payout.amount_paid_to_vendor;
  }
  return payout;
}

export async function generateUpcomingPayout(
  restaurant_id: string,
  start_timestamp: Date,
  end_timestamp: Date
): Promise<{payout: IPayout; payout_orders: IOrderDetails[]}> {
  const orders = await getUpcomingPayoutOrders(
    start_timestamp,
    end_timestamp,
    restaurant_id
  );
  logger.debug('getting upcoming payout orders', orders);
  const uuid = uuidv4();
  const payout: IPayout = {
    id: uuid,
    restaurant_id: restaurant_id,
    start_time: start_timestamp,
    end_time: end_timestamp,
    total_order_amount: 0,
    transaction_charges: 0,
    transaction_id: uuid.split('-').join('_'),
    amount_paid_to_vendor: 0,
    status: PayoutStatus.INIT,
    retry: true,
    payout_gateway: 'CASHFREE',
  };
  //payout orders will only have settleted orders
  const payout_orders: IOrderDetails[] = [];
  if (orders && orders.length) {
    for (let order_cntr = 0; order_cntr < orders.length; order_cntr++) {
      const payout_order = orders[order_cntr];
      if (payout_order.refund_status === RefundStatus.APPROVAL_PENDING) {
        if (order_cntr === 0) {
          payout.end_time = start_timestamp;
        } else {
          payout.end_time = payout_order.order_placed_time!;
        }
        break;
      } else {
        if (payout_order.order_status === OrderStatus.COMPLETED) {
          if (
            payout_order.invoice_breakout?.refund_settlement_details
              ?.refund_settled_vendor_payout_amount
          ) {
            payout.total_order_amount +=
              payout_order.invoice_breakout.refund_settlement_details.refund_settled_vendor_payout_amount;
          } else {
            payout.total_order_amount +=
              payout_order.vendor_payout_amount ||
              payout_order.invoice_breakout!.vendor_payout_amount!;
          }
        } else if (payout_order.order_status === OrderStatus.CANCELLED) {
          if (
            payout_order.invoice_breakout?.refund_settlement_details
              ?.refund_settled_vendor_payout_amount
          ) {
            payout.total_order_amount +=
              payout_order.invoice_breakout.refund_settlement_details.refund_settled_vendor_payout_amount;
          }
        }
        payout_orders.push(payout_order);
      }
    }
    payout.transaction_charges = (payout.total_order_amount / 100) * 1;
    payout.amount_paid_to_vendor =
      payout.total_order_amount - payout.transaction_charges;
  }
  logger.debug('successfully fetched upcoming payout orders', {
    payout,
    payout_orders,
  });
  return {payout, payout_orders};
}
