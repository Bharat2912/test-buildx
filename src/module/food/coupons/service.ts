import {getTransaction} from '../../../data/knex';
import logger from '../../../utilities/logger/winston_logger';
import ResponseError from '../../../utilities/response_error';
import {CouponCreatedBy, CouponLevel} from './enum';
import {bulkUpdateCouponVendorSequence} from './models';
import {
  ICoupon,
  ICouponVendor,
  ICouponVendorSequence,
  IValidateMappingDetails,
} from './types';

export async function validateCoupon(coupon: ICoupon) {
  const start_time = new Date(0);
  start_time.setUTCSeconds(coupon.start_time as number);
  coupon.start_time = start_time;
  const end_time = new Date(0);
  end_time.setUTCSeconds(coupon.end_time as number);
  coupon.end_time = end_time;

  await validateCouponDuration(coupon);

  if (coupon.max_use_count > 1 && !coupon.coupon_use_interval_minutes) {
    throw new ResponseError(400, [
      {
        message:
          'coupon use interval is necessary when coupon can be used multiple times',
        code: 1056,
      },
    ]);
  } else if (coupon.max_use_count === 1 && coupon.coupon_use_interval_minutes) {
    throw new ResponseError(400, [
      {
        message:
          'coupon use interval is not applicable for one time use coupons',
        code: 1057,
      },
    ]);
  }

  if (!coupon.discount_amount_rupees && !coupon.discount_percentage) {
    throw new ResponseError(400, [
      {
        message: 'coupon discount value is missing',
        code: 1058,
      },
    ]);
  }

  if (coupon.discount_amount_rupees && coupon.discount_percentage) {
    throw new ResponseError(400, [
      {
        message:
          'coupon discount value can only be percentage or number, it can not be both',
        code: 1059,
      },
    ]);
  }

  if (coupon.discount_amount_rupees && coupon.max_discount_rupees) {
    throw new ResponseError(400, [
      {
        message: 'max discount is only applicable for percentage discounts',
        code: 1060,
      },
    ]);
  }
  if (coupon.discount_percentage && !coupon.max_discount_rupees) {
    throw new ResponseError(400, [
      {
        message:
          'max discount is required for coupons with upto percentage discount offers',
        code: 1060,
      },
    ]);
  }

  if (coupon.level === CouponLevel.GLOBAL) {
    if (coupon.created_by !== CouponCreatedBy.ADMIN) {
      throw new ResponseError(400, [
        {
          message: 'Invalid coupon level',
          code: 1061,
        },
      ]);
    }
    if (coupon.discount_share_percent > 0) {
      throw new ResponseError(400, [
        {
          message:
            'coupon created at global level can not share discount percentage with any entity',
          code: 1062,
        },
      ]);
    }

    if (coupon.discount_sponsered_by) {
      throw new ResponseError(400, [
        {
          message: 'coupon created at global level can not have sponsered by',
          code: 1063,
        },
      ]);
    }
  } else if (coupon.level === CouponLevel.RESTAURANT) {
    if (coupon.created_by === CouponCreatedBy.VENDOR) {
      if (coupon.discount_share_percent !== 100) {
        throw new ResponseError(400, [
          {
            message:
              'coupon created by vendor needs to bear 100% cost of coupon',
            code: 1064,
          },
        ]);
      }
    } else if (coupon.created_by === CouponCreatedBy.ADMIN) {
      if (coupon.discount_share_percent > 0 && !coupon.discount_sponsered_by) {
        throw new ResponseError(400, [
          {
            message:
              'coupons with discount share percent must have sponsered by name',
            code: 1065,
          },
        ]);
      }

      if (coupon.discount_share_percent === 0 && coupon.discount_sponsered_by) {
        throw new ResponseError(400, [
          {
            message:
              'coupons with discount share percent zero can not have sponsered by name',
            code: 1065,
          },
        ]);
      }
    }
  }
  return coupon;
}

async function validateCouponDuration(coupon: ICoupon) {
  const current_time = new Date();
  if (current_time > coupon.start_time) {
    throw new ResponseError(400, [
      {
        message: 'coupon start time should be greater than current time',
        code: 1066,
      },
    ]);
  }
  if (current_time > coupon.end_time) {
    throw new ResponseError(400, [
      {
        message: 'coupon end time should be greater than current time',
        code: 1067,
      },
    ]);
  }
  if (coupon.end_time <= coupon.start_time) {
    throw new ResponseError(400, [
      {
        message: 'coupon end_time should be greater than start time',
        code: 1068,
      },
    ]);
  }
}

export function validateMappingDetails(
  mapping_details: IValidateMappingDetails
) {
  logger.debug('mapping details for validation', mapping_details);
  if (mapping_details.coupon.level !== CouponLevel.RESTAURANT) {
    throw new ResponseError(400, [
      {
        message: 'restaurant can only optin to restaurant level coupons',
        code: 1069,
      },
    ]);
  }

  const current_time = new Date();
  if (mapping_details.coupon.end_time < current_time) {
    //? should we update coupon is_deleted to true if duration is expired

    throw new ResponseError(400, [
      {
        message: 'coupon duration is expired',
        code: 1070,
      },
    ]);
  }
  logger.info('Coupon Duration start_time:', mapping_details.coupon.start_time);
  logger.info('Coupon Duration end_time:', mapping_details.coupon.end_time);

  if (
    mapping_details.mapping_duration.end_time! <=
    mapping_details.mapping_duration.start_time!
  ) {
    throw new ResponseError(400, [
      {
        message: 'coupon mapping end_time should be greater than start time',
        code: 1068,
      },
    ]);
  }

  if (
    mapping_details.mapping_duration.start_time! <
      mapping_details.coupon.start_time ||
    mapping_details.mapping_duration.end_time! > mapping_details.coupon.end_time
  ) {
    throw new ResponseError(400, [
      {
        message: 'mapping duration must exists between coupon duration',
        code: 1071,
      },
    ]);
  }

  const insert_records: ICouponVendor[] = [];
  for (let r = 0; r < mapping_details.restaurant_ids.length; r++) {
    insert_records.push({
      coupon_id: mapping_details.coupon.id,
      start_time: mapping_details.mapping_duration.start_time as Date,
      end_time: mapping_details.mapping_duration.end_time as Date,
      restaurant_id: mapping_details.restaurant_ids[r],
      mapped_by: mapping_details.mapped_by!,
      mapped_by_user_id: mapping_details.mapped_by_user_id!,
    });
  }
  return insert_records;
}

export async function updateCouponVendorSequence(
  new_coupon_vendor_sequence_mappings: ICouponVendorSequence[],
  restaurant_id: string
): Promise<{
  total_records_affected: number;
  records: ICouponVendor[];
}> {
  const trx = await getTransaction();
  try {
    const updated_coupon_vendor_mappings = await bulkUpdateCouponVendorSequence(
      trx,
      new_coupon_vendor_sequence_mappings,
      restaurant_id
    );
    await trx.commit();
    logger.debug(
      `coupon vendor records updated ${updated_coupon_vendor_mappings.length}`
    );
    return {
      total_records_affected: updated_coupon_vendor_mappings.length,
      records: updated_coupon_vendor_mappings,
    };
  } catch (error) {
    await trx.rollback();
    throw error;
  }
}
