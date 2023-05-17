import logger from '../../../../utilities/logger/winston_logger';
import {DB} from '../../../../data/knex';
import {IOrder} from '../../order/types';
import {OrderStatus} from '../../order/enums';

export async function getVendorSalesOrders(
  start_date: Date,
  end_date: Date,
  restaurant_id: string
): Promise<IOrder[]> {
  logger.debug('start_date', start_date);
  logger.debug('end_date', end_date);
  //!BACKWARD_COMPATIBLE order_rating
  const DBQuery = DB.read
    .select(
      'id',
      'order_status',
      'delivery_status',
      'order_placed_time',
      'vendor_payout_amount',
      'invoice_breakout',
      'cancelled_by',
      'vote_type',
      'order_acceptance_status'
    )
    .from('order')
    .where('order_placed_time', '<', end_date)
    .where('order_placed_time', '>=', start_date)
    .whereRaw(
      `(restaurant_id = '${restaurant_id}' and ((order_status = '${OrderStatus.COMPLETED}') or (order_status = '${OrderStatus.CANCELLED}') or (order_status = '${OrderStatus.PLACED}')))`
    )
    .orderBy('order_placed_time', 'asc');
  return DBQuery.then((orders: IOrder[]) => {
    logger.debug('SUCCESSFULLY FETCHED ORDERS FOR RESTAURANT', restaurant_id);
    return orders;
  }).catch((error: Error) => {
    logger.debug('FAILED WHILE FETCHING ORDERS FOR RESTAURANT', error);
    throw error;
  });
}
