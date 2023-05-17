import {Request, Response} from 'express';
import handleErrors from '../../../utilities/controllers/handle_errors';
import {
  sendError,
  sendSuccess,
} from '../../../utilities/controllers/handle_response';
import logger from '../../../utilities/logger/winston_logger';
import {verify_sales_request} from './restaurant/validations';
import {id} from '../../../utilities/joi_common';
import {
  validateDuration,
  calculateDurationWiseOrders,
  calculateVendorSales,
} from './restaurant/service';
import {IOrder} from '../order/types';
import {readRestaurantById} from '../restaurant/models';
import {getVendorSalesOrders} from './restaurant/models';
import moment from 'moment';

export async function vendorSalesReport(req: Request, res: Response) {
  try {
    const validation = verify_sales_request.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = validation.value;

    const time_intervals: Date[] = validateDuration(validated_req);
    const restaurant = await readRestaurantById(req.user.data.restaurant_id);
    if (!restaurant) {
      return sendError(res, 404, [
        {
          message: 'restaurant not found',
          code: 1093,
        },
      ]);
    }
    const orders: IOrder[] = await getVendorSalesOrders(
      time_intervals[0],
      time_intervals[time_intervals.length - 1],
      req.user.data.restaurant_id
    );
    const duration_wise_orders = calculateDurationWiseOrders(
      time_intervals,
      orders
    );
    const {sales_report_with_duration, total_vendor_sales_amount} =
      calculateVendorSales(duration_wise_orders);

    return sendSuccess(res, 200, {
      start_time: moment(time_intervals[0]).unix(),
      end_time: moment(time_intervals[time_intervals.length - 1]).unix(),
      total_vendor_sales_amount,
      duration_wise_order_sales: sales_report_with_duration,
    });
  } catch (error) {
    logger.error('FAILED WHILE CALCULATING VENDOR SALES', error);
    return handleErrors(res, error);
  }
}
export async function adminSalesReport(req: Request, res: Response) {
  try {
    logger.info(
      'Calculating Restaurant Sales Report as Admin',
      req.params.restaurant_id
    );
    const validationParam = id.validate(req.params.restaurant_id);

    if (validationParam.error)
      return sendError(res, 400, validationParam.error.details[0].message);

    const validation = verify_sales_request.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = validation.value;

    const time_intervals: Date[] = validateDuration(validated_req);
    const restaurant = await readRestaurantById(validationParam.value);
    if (!restaurant) {
      return sendError(res, 404, [
        {
          message: 'restaurant not found',
          code: 1093,
        },
      ]);
    }
    const orders: IOrder[] = await getVendorSalesOrders(
      time_intervals[0],
      time_intervals[time_intervals.length - 1],
      validationParam.value
    );
    const duration_wise_orders = calculateDurationWiseOrders(
      time_intervals,
      orders
    );
    const {sales_report_with_duration, total_vendor_sales_amount} =
      calculateVendorSales(duration_wise_orders);

    return sendSuccess(res, 200, {
      start_time: moment(time_intervals[0]).unix(),
      end_time: moment(time_intervals[time_intervals.length - 1]).unix(),
      total_vendor_sales_amount,
      duration_wise_order_sales: sales_report_with_duration,
    });
  } catch (error) {
    logger.error('FAILED WHILE CALCULATING RESTAURANT SALES AS ADMIN', error);
    return handleErrors(res, error);
  }
}
