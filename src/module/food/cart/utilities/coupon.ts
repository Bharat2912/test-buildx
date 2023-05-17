import moment from 'moment';
import {IError} from '../../../../types';
import logger from '../../../../utilities/logger/winston_logger';
// import ResponseError from '../../../../utilities/response_error';
import {
  CouponCreatedBy,
  CouponLevel,
  DiscountSponseredBy,
} from '../../coupons/enum';
import {readCouponAndMappingByRestaurant} from '../../coupons/models';
import {ICouponMappingCustomer} from '../../coupons/types';
import {ICouponDetailCost} from '../../order/invoice';

export async function validateSelectedCoupon(
  customer_id: string,
  restaurant_id: string,
  total_food_and_taxes: number,
  coupon_id?: number,
  coupon_code?: string
) {
  const coupon_validation_errors: IError[] = [];
  if (!coupon_id && !coupon_code) {
    return {
      coupon_details: null,
      coupon_detail_cost: null,
    };
  }
  logger.debug('validateSelectedCoupon_utility_input', {
    customer_id: customer_id,
    restaurant_id: restaurant_id,
    coupon_id: coupon_id,
    coupon_code: coupon_code,
  });

  const coupon: ICouponMappingCustomer = await readCouponAndMappingByRestaurant(
    restaurant_id,
    customer_id,
    coupon_id,
    coupon_code
  );
  logger.debug('coupon', coupon);

  if (!coupon) {
    // throw new ResponseError(400, [{message: 'invalid_coupon', code: 1052}]);
    coupon_validation_errors.push({message: 'invalid_coupon', code: 1052});
    return {
      coupon_details: null,
      coupon_detail_cost: null,
      coupon_validation_errors,
    };
  }

  if (coupon.level === CouponLevel.RESTAURANT && !coupon.mapping_details) {
    // throw new ResponseError(400, [
    //   {message: 'coupon_not_applicable_to_this_restaurant', code: 1072},
    // ]);
    coupon_validation_errors.push({
      message: 'coupon_not_applicable_to_this_restaurant',
      code: 1072,
    });
    return {
      coupon_details: null,
      coupon_detail_cost: null,
      coupon_validation_errors,
    };
  }
  if (coupon.coupon_customer_details) {
    if (
      coupon.coupon_customer_details.coupon_use_count! >= coupon.max_use_count
    ) {
      // throw new ResponseError(400, [
      //   {message: 'coupon_max_use_count_limit_exceeded', code: 1073},
      // ]);
      coupon_validation_errors.push({
        message: 'coupon_max_use_count_limit_exceeded',
        code: 1073,
      });
    } else if (
      coupon.coupon_customer_details.coupon_use_count! < coupon.max_use_count
    ) {
      const last_use_time = moment(
        coupon.coupon_customer_details.last_time_used!
      );
      const current_time = moment();
      const difference_in_mins = current_time.diff(last_use_time, 'minutes');
      if (difference_in_mins <= coupon.coupon_use_interval_minutes) {
        // throw new ResponseError(400, [
        //   {
        //     message: `coupon_can_be_used_after_${
        //       coupon.coupon_use_interval_minutes - difference_in_mins
        //     }_mins`,
        //     code: 1074,
        //   },
        // ]);
        coupon_validation_errors.push({
          message: `coupon_can_be_used_after_${
            coupon.coupon_use_interval_minutes - difference_in_mins
          }_mins`,
          code: 1074,
        });
      }
    }
  }

  if (total_food_and_taxes < coupon.min_order_value_rupees) {
    // throw new ResponseError(400, [
    //   {
    //     message: `Item total value must be atleast ${coupon.min_order_value_rupees} to apply coupon`,
    //     code: 1075,
    //   },
    // ]);
    coupon_validation_errors.push({
      message: `Item total value must be atleast ${coupon.min_order_value_rupees} to apply coupon`,
      code: 1075,
    });
  }

  const coupon_detail_cost: ICouponDetailCost = {
    coupon_id: coupon.id,
    code: coupon.code,
    type: coupon.type,
    level: coupon.level,
    min_order_value_rupees: coupon.min_order_value_rupees,
    max_discount_rupees: coupon.max_discount_rupees,
    discount_percentage: coupon.discount_percentage,
    discount_amount_rupees: coupon.discount_amount_rupees,
  };

  if (coupon.level === CouponLevel.GLOBAL) {
    if (coupon.created_by === CouponCreatedBy.ADMIN) {
      coupon_detail_cost.discount_share_percentage_vendor = 0;
      coupon_detail_cost.discount_share_percentage_speedyy = 100;
    }
  } else if (coupon.level === CouponLevel.RESTAURANT) {
    if (coupon.created_by === CouponCreatedBy.ADMIN) {
      if (
        coupon.discount_share_percent > 0 &&
        coupon.discount_sponsered_by === DiscountSponseredBy.RESTAURANT
      ) {
        coupon_detail_cost.discount_share_percentage_vendor =
          coupon.discount_share_percent;
        coupon_detail_cost.discount_share_percentage_speedyy =
          100 - coupon.discount_share_percent;
      } else if (
        coupon.discount_share_percent === 0 &&
        !coupon.discount_sponsered_by
      ) {
        coupon_detail_cost.discount_share_percentage_vendor = 0;
        coupon_detail_cost.discount_share_percentage_speedyy = 100;
      }
    } else if (coupon.created_by === CouponCreatedBy.VENDOR) {
      coupon_detail_cost.discount_share_percentage_vendor = 100;
      coupon_detail_cost.discount_share_percentage_speedyy = 0;
    }
  }
  logger.debug('coupon_detail_cost', coupon_detail_cost);

  if (coupon_validation_errors.length > 0) {
    return {
      coupon_details: coupon,
      coupon_detail_cost,
      coupon_validation_errors,
    };
  } else {
    return {coupon_details: coupon, coupon_detail_cost};
  }
}
