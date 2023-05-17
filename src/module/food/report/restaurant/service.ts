import {IVendorSales, ICalculateVendorSales} from './types';
import {IOrder} from '../../order/types';
import {SalesFilterDurationStatus} from './enums';
import {
  DeliveryStatus,
  OrderAcceptanceStatus,
  OrderCancelledBy,
  OrderStatus,
} from '../../order/enums';
import logger from '../../../../utilities/logger/winston_logger';
import ResponseError from '../../../../utilities/response_error';
import moment from 'moment';
import {getDayStart} from '../../../../utilities/date_time';

export function enumerateDaysBetweenDates(
  start_date: Date,
  end_date: Date,
  addition: number
): Date[] {
  const time_chunk_arr: Date[] = [];
  while (start_date < end_date) {
    time_chunk_arr.push(start_date);
    start_date = moment(start_date).add({day: addition}).toDate();
  }
  time_chunk_arr.push(end_date);
  return time_chunk_arr;
}
export function validateDuration(validated_req: {
  duration: string;
  start_epoch?: number;
  end_epoch?: number;
}) {
  let time_duration: Date[] = [];
  time_duration[0] = getDayStart();
  time_duration[1] = moment().toDate();
  const current_time = moment().toDate();

  if (validated_req.duration === SalesFilterDurationStatus.CUSTOM_RANGE) {
    if (validated_req.start_epoch! > validated_req.end_epoch!) {
      throw new ResponseError(400, [
        {
          message: 'end_epoch is less than start_epoch',
          code: 1099,
        },
      ]);
    } else {
      time_duration[0] = moment.unix(validated_req.start_epoch!).toDate();
      time_duration[1] = moment.unix(validated_req.end_epoch!).toDate();
      if (time_duration[1] > current_time) {
        time_duration[1] = current_time;
      }
    }
  } else if (validated_req.duration === SalesFilterDurationStatus.THIS_WEEK) {
    time_duration[0] = moment().startOf('isoWeek').toDate();
    time_duration[1] = moment().endOf('isoWeek').toDate();
    time_duration = enumerateDaysBetweenDates(
      time_duration[0],
      time_duration[1],
      1
    );
  } else if (validated_req.duration === SalesFilterDurationStatus.THIS_MONTH) {
    time_duration[0] = moment().startOf('month').toDate();
    time_duration[1] = moment().endOf('month').toDate();
    time_duration = enumerateDaysBetweenDates(
      time_duration[0],
      time_duration[1],
      7
    );
  }

  return time_duration;
}
export function calculateDurationWiseOrders(
  time_duration: Date[],
  orders: IOrder[]
) {
  const time_duration_wise_orders = new Map<string, IOrder[]>();
  for (let i = 0; i < time_duration.length - 1; i++) {
    time_duration_wise_orders.set(
      `${moment(time_duration[i]).toISOString()}_${moment(
        time_duration[i + 1]
      ).toISOString()}`,
      []
    );
  }

  const time_duration_wise_orders_keys_array = Array.from(
    time_duration_wise_orders.keys()
  );
  for (let i = 0; i < orders.length; i++) {
    const order: IOrder = orders[i];

    for (let j = 0; j < time_duration_wise_orders_keys_array.length; j++) {
      const duration_interval = time_duration_wise_orders_keys_array[j];

      const start_date: Date = moment(duration_interval.split('_')[0]).toDate();
      const end_date: Date = moment(duration_interval.split('_')[1]).toDate();
      const order_place_time: Date = moment(order.order_placed_time).toDate();

      if (
        order.order_placed_time &&
        start_date <= order_place_time &&
        order_place_time < end_date
      ) {
        const existing_orders: IOrder[] =
          time_duration_wise_orders.get(duration_interval)!;

        if (existing_orders.length) {
          existing_orders.push(order);
          time_duration_wise_orders.set(duration_interval, existing_orders);
        } else {
          time_duration_wise_orders.set(duration_interval, [order]);
        }
      }
    }
  }
  return time_duration_wise_orders;
}
export function calculateVendorSales(
  orders: Map<string, IOrder[]>
): ICalculateVendorSales {
  logger.info('Calculating Vendor Sales');
  const sales_report_with_duration: IVendorSales[] = [];
  let total_vendor_sales_amount = 0;
  for (const key of orders.keys()) {
    let total_orders_count = 0;

    let orders_with_likes = 0;
    let orders_with_dislikes = 0;

    let orders_cancelled_by_customer_count = 0;
    let orders_cancelled_by_delivery_partner_count = 0;
    let orders_cancelled_by_vendor_count = 0;

    let vendor_sales_amount = 0;

    if (orders.get(key) && orders.get(key)!.length) {
      for (
        let order_cntr = 0;
        order_cntr < orders.get(key)!.length;
        order_cntr++
      ) {
        const order: IOrder = orders.get(key)![order_cntr];
        if (order.order_status === OrderStatus.CANCELLED) {
          if (order.cancelled_by === OrderCancelledBy.CUSTOMER) {
            orders_cancelled_by_customer_count += 1;
          } else if (order.cancelled_by === OrderCancelledBy.VENDOR) {
            orders_cancelled_by_vendor_count += 1;
          } else if (order.cancelled_by === OrderCancelledBy.DELIVERY) {
            orders_cancelled_by_delivery_partner_count += 1;
          }
        }
        if (
          order.order_status === OrderStatus.PLACED &&
          order.order_acceptance_status === OrderAcceptanceStatus.ACCEPTED
        ) {
          vendor_sales_amount += order.vendor_payout_amount!;
        } else if (
          order.order_status === OrderStatus.CANCELLED &&
          order.order_acceptance_status === OrderAcceptanceStatus.ACCEPTED &&
          order.cancelled_by !== OrderCancelledBy.VENDOR &&
          order.delivery_status !== DeliveryStatus.REJECTED
        ) {
          vendor_sales_amount += order.vendor_payout_amount!;
        } else if (
          order.order_status === OrderStatus.COMPLETED &&
          order.order_acceptance_status === OrderAcceptanceStatus.ACCEPTED
        ) {
          vendor_sales_amount += order.vendor_payout_amount!;

          if (order.vote_type === 1) {
            orders_with_likes += 1;
          } else if (order.vote_type === -1) {
            orders_with_dislikes += 1;
          }
        }
        total_orders_count += 1;
      }

      total_vendor_sales_amount += vendor_sales_amount;
      sales_report_with_duration.push({
        start_time: moment(key.split('_')[0]).unix(),
        end_time: moment(key.split('_')[1]).unix(),
        total_orders_count,
        vendor_sales_amount: Math.round(vendor_sales_amount),
        orders_with_likes,
        orders_with_dislikes,
        average_orders_rating: 0, //! BACKWARD_COMPATIBLE
        orders_cancelled_by_customer_count,
        orders_cancelled_by_vendor_count,
        orders_cancelled_by_delivery_partner_count,
      });
    } else {
      sales_report_with_duration.push({
        start_time: moment(key.split('_')[0]).unix(),
        end_time: moment(key.split('_')[1]).unix(),
        total_orders_count,
        vendor_sales_amount,
        orders_with_likes,
        orders_with_dislikes,
        average_orders_rating: 0, //! BACKWARD_COMPATIBLE
        orders_cancelled_by_customer_count,
        orders_cancelled_by_vendor_count,
        orders_cancelled_by_delivery_partner_count,
      });
    }
  }
  return {
    sales_report_with_duration,
    total_vendor_sales_amount: Math.round(total_vendor_sales_amount),
  };
}
