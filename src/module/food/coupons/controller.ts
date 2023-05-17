import {Request, Response} from 'express';
import handleErrors from '../../../utilities/controllers/handle_errors';
import logger from '../../../utilities/logger/winston_logger';
import {
  sendError,
  sendSuccess,
} from '../../../utilities/controllers/handle_response';
import {
  coupon_created_by_admin,
  coupon_created_by_vendor,
  numeric_id,
  id,
  restaurant_optin_as_admin,
  restaurant_optin_as_vendor,
  restaurant_optout_as_admin,
  restaurant_optout_as_vendor,
  filter_coupon_as_admin,
  filter_coupon_as_vendor,
  filter_coupon_vendor_mapping_as_vendor,
  filter_coupon_vendor_mapping_as_admin,
  validate_coupon,
  bulk_update_coupon_vendor_sequence_as_vendor,
} from './validations';
import {
  updateCouponVendorSequence,
  validateCoupon,
  validateMappingDetails,
} from './service';
import {getTransaction} from '../../../data/knex';
import {
  bulkInsertCoupon,
  bulkInsertCouponVendor,
  readAllAvailableForOptinCouponsForRestaurant,
  readCouponsByCodeAndDuration,
  readCouponsForCustomer,
  readActiveCouponsUsedByRestaurant,
  readCouponsWithFilterAsAdmin,
  readCouponsWithFilterAsVendor,
  readCouponVendorMappingWithFilterAsVendor,
  readCouponVendorMappingWithFilterAsAdmin,
  readActiveCoupon,
  readCouponAndMappingByCouponId,
  readAllCouponsUsedByCustomer,
  readCouponMappingOfSpecificDuration,
  readCouponsOfAllTimeLine,
  updateCouponVendorById,
  readCouponVendorMappingByMappingIds,
} from './models';
import {
  ICoupon,
  ICouponAndMapping,
  ICouponVendor,
  IFilterCouponByAdmin,
  IFilterCouponByVendor,
  IFilterCouponVendorByAdmin,
  IFilterCouponVendorByVendor,
  IRestaurantOptinDetailsAdmin,
  IRestaurantOptinDetailsVendor,
  IRestaurantOptoutDetailsAdmin,
  IRestaurantOptoutDetailsVendor,
  ICouponVendorSequence,
  IValidateCoupon,
} from './types';
import {
  CouponCreatedBy,
  CouponLevel,
  CouponMappedBy,
  DiscountSponseredBy,
} from './enum';
import {
  getAdminDetailsByIds,
  getRestaurantVendors,
  getVendorDetailsByIds,
} from '../../../utilities/user_api';
import {
  readRestaurantBasicPosById,
  readRestaurantBasicsPosByIds,
  readRestaurantById,
  readRestaurantsByIdsAndStatus,
} from '../restaurant/models';
import {validateSelectedCoupon} from '../cart/utilities/coupon';
import {ICouponValidationResponse} from '../cart/types';
import {joi_restaurant_id} from '../../../utilities/joi_common';
import moment from 'moment';
import {validatePosPartnerAccess} from '../service';

export async function createCouponAsAdmin(req: Request, res: Response) {
  try {
    const validation = coupon_created_by_admin.validate(req.body);
    if (validation.error)
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 1000,
        },
      ]);
    const coupon = validation.value as ICoupon;
    const validated_coupon = await validateCoupon({
      ...coupon,
      created_by: req.user.user_type as CouponCreatedBy.ADMIN,
      created_by_user_id: req.user.id,
    });

    const start_time = validated_coupon.start_time as Date;
    const end_time = validated_coupon.end_time as Date;
    const coupons_with_same_code = await readCouponsByCodeAndDuration(
      validated_coupon.code,
      start_time.toISOString(),
      end_time.toISOString()
    );
    logger.debug('coupons_with_same_code: ', coupons_with_same_code);
    if (coupons_with_same_code.length > 0) {
      return sendError(res, 400, [
        {
          message: 'coupon already exists in selected coupon duration',
          code: 1051,
        },
      ]);
    }
    logger.debug('New Coupon', validated_coupon);
    const trx = await getTransaction();
    try {
      const coupon = await bulkInsertCoupon(trx, [validated_coupon]);
      await trx.commit();
      logger.debug(`coupon ID:${coupon.id} created`);
      return sendSuccess(res, 200, {coupon_details: coupon});
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    logger.error('FAILED WHILE CREATING NEW COUPON AS ADMIN: ', error);
    return handleErrors(res, error);
  }
}

export async function createCouponAsVendor(req: Request, res: Response) {
  try {
    const validation = coupon_created_by_vendor.validate(req.body);
    if (validation.error)
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 1000,
        },
      ]);
    const coupon = validation.value as ICoupon;

    //validate vendor created coupon
    const validated_coupon = await validateCoupon({
      ...coupon,
      level: CouponLevel.RESTAURANT,
      discount_share_percent: 100,
      discount_sponsered_by: DiscountSponseredBy.RESTAURANT,
      created_by: req.user.user_type as CouponCreatedBy.VENDOR,
      created_by_user_id: req.user.id,
    });

    const restaurant = await readRestaurantBasicPosById(
      req.user.data.restaurant_id
    );
    validatePosPartnerAccess(restaurant.pos_partner);

    const start_time = validated_coupon.start_time as Date;
    const end_time = validated_coupon.end_time as Date;
    const coupons_with_same_code = await readCouponsByCodeAndDuration(
      validated_coupon.code,
      start_time.toISOString(),
      end_time.toISOString()
    );
    logger.debug('coupons_with_same_code: ', coupons_with_same_code);
    if (coupons_with_same_code.length > 0) {
      return sendError(res, 400, [
        {
          message: 'coupon already exists in selected coupon duration',
          code: 1051,
        },
      ]);
    }
    logger.debug('New Coupon ', validated_coupon);

    const trx = await getTransaction();
    try {
      const coupon = await bulkInsertCoupon(trx, [validated_coupon]);
      const mapping_details = await bulkInsertCouponVendor(trx, [
        {
          coupon_id: coupon.id,
          start_time: coupon.start_time as Date,
          end_time: coupon.end_time as Date,
          restaurant_id: req.user.data.restaurant_id,
          mapped_by: coupon.created_by,
          mapped_by_user_id: coupon.created_by_user_id,
        },
      ]);
      await trx.commit();
      logger.debug(
        `coupon ID:${coupon.id} created, mapping ID: ${mapping_details[0].id}`
      );
      return sendSuccess(res, 200, {coupon_details: coupon, mapping_details});
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    logger.error('FAILED WHILE CREATING NEW COUPON AS VENDOR: ', error);
    return handleErrors(res, error);
  }
}

export async function filterCouponsAsAdmin(req: Request, res: Response) {
  try {
    const validation = filter_coupon_as_admin.validate(req.body);
    if (validation.error)
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 1000,
        },
      ]);

    const filter_params = validation.value as IFilterCouponByAdmin;

    if (filter_params.filter?.restaurant_id) {
      const read_restaurant_by_id = await readRestaurantById(
        filter_params.filter?.restaurant_id
      );
      if (!read_restaurant_by_id) {
        return sendError(res, 400, [
          {
            message: 'Invalid restaurant Id',
            code: 2009,
          },
        ]);
      }
      const vendors = await getRestaurantVendors(
        filter_params.filter?.restaurant_id
      );

      filter_params.filter.vendor_ids = vendors.map(vendor => vendor.id);
    }
    const token = req.headers.authorization!;
    const result = await readCouponsWithFilterAsAdmin(filter_params);
    if (result.records.length) {
      const admin_ids: string[] = [];
      const vendor_ids: string[] = [];

      result.records.map((coupon: ICoupon) => {
        if (coupon.created_by === CouponCreatedBy.ADMIN) {
          admin_ids.push(coupon.created_by_user_id);
        } else if (coupon.created_by === CouponCreatedBy.VENDOR) {
          vendor_ids.push(coupon.created_by_user_id);
        }
      });

      const admins = await getAdminDetailsByIds(token, admin_ids);
      const vendors = await getVendorDetailsByIds(vendor_ids);
      result.records.map((coupon: ICoupon) => {
        const admin = admins.find(
          admin => admin.id === coupon.created_by_user_id
        );
        const vendor = vendors.find(
          vendor => vendor.id === coupon.created_by_user_id
        );
        if (admin) {
          coupon.created_by_name = admin.user_name;
        } else if (vendor) {
          coupon.created_by_name = vendor.name;
        } else {
          coupon.created_by_name = '';
        }
      });
    }
    return sendSuccess(res, 200, result);
  } catch (error) {
    logger.error('FAILED WHILE FILTERING COUPONS AS ADMIN: ', error);
    return handleErrors(res, error);
  }
}

export async function filterCouponVendorAsAdmin(req: Request, res: Response) {
  try {
    const validation = filter_coupon_vendor_mapping_as_admin.validate(req.body);
    if (validation.error)
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 1000,
        },
      ]);
    const filter_params = validation.value as IFilterCouponVendorByAdmin;

    const result = await readCouponVendorMappingWithFilterAsAdmin(
      filter_params
    );
    return sendSuccess(res, 200, result);
  } catch (error) {
    logger.error(
      'FAILED WHILE FILTERING COUPON VENDOR MAPPING AS ADMIN',
      error
    );
    return handleErrors(res, error);
  }
}

export async function filterCouponsAsVendor(req: Request, res: Response) {
  try {
    const validation = filter_coupon_as_vendor.validate(req.body);
    if (validation.error)
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 1000,
        },
      ]);
    const filter_params = validation.value as IFilterCouponByVendor;

    const vendors = await getRestaurantVendors(req.user.data.restaurant_id);

    if (!filter_params.filter) filter_params.filter = {};
    filter_params.filter.vendor_ids = vendors.map(vendor => vendor.id);

    const result = await readCouponsWithFilterAsVendor(filter_params);
    return sendSuccess(res, 200, result);
  } catch (error) {
    logger.error('FAILED WHILE FILTERING COUPONS AS VENDOR: ', error);
    return handleErrors(res, error);
  }
}

export async function filterCouponVendorAsVendor(req: Request, res: Response) {
  try {
    const validation = filter_coupon_vendor_mapping_as_vendor.validate(
      req.body
    );
    if (validation.error)
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 1000,
        },
      ]);
    const filter_params = validation.value as IFilterCouponVendorByVendor;

    if (!filter_params.filter) filter_params.filter = {};
    filter_params.filter.restaurant_id = req.user.data.restaurant_id;

    const result = await readCouponVendorMappingWithFilterAsVendor(
      filter_params
    );
    return sendSuccess(res, 200, result);
  } catch (error) {
    logger.error(
      'FAILED WHILE FILTERING COUPON VENDOR MAPPING AS VENDOR: ',
      error
    );
    return handleErrors(res, error);
  }
}

export async function restaurantOptinAsAdmin(req: Request, res: Response) {
  try {
    const validation = restaurant_optin_as_admin.validate(req.body);
    if (validation.error)
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 1000,
        },
      ]);
    const optin_details = validation.value as IRestaurantOptinDetailsAdmin;

    const formated_restaurant_ids: string[] = [];
    const restaurants = await readRestaurantBasicsPosByIds(
      optin_details.restaurant_ids
    );
    restaurants.forEach(restaurant => {
      validatePosPartnerAccess(restaurant.pos_partner);
      formated_restaurant_ids.push("'" + restaurant.id + "'");
    });

    const coupon = await readActiveCoupon(optin_details.coupon_id);
    if (!coupon) {
      return sendError(res, 400, [
        {
          message: 'Invalid coupon Id',
          code: 1052,
        },
      ]);
    }
    logger.debug('Coupon :', coupon);

    const validated_restaurants = await readRestaurantsByIdsAndStatus(
      optin_details.restaurant_ids
    );
    const invalid_restaurant_ids = optin_details.restaurant_ids.filter(
      id => !validated_restaurants.find(r => r.id === id)
    );

    if (invalid_restaurant_ids.length > 0) {
      return sendError(res, 400, [
        {
          message: `Restaurant not found ${invalid_restaurant_ids}`,
          code: 1093,
        },
      ]);
    }

    if (optin_details.mapping_duration) {
      if (optin_details.mapping_duration.start_time < moment().unix()) {
        return sendError(res, 400, [
          {
            message: 'mapping start time should be greater than current time',
            code: 1066,
          },
        ]);
      }
      const start_time = new Date(0);
      start_time.setUTCSeconds(
        optin_details.mapping_duration.start_time as number
      );
      const end_time = new Date(0);
      end_time.setUTCSeconds(optin_details.mapping_duration.end_time as number);
      optin_details.mapping_duration.start_time = start_time;
      optin_details.mapping_duration.end_time = end_time;
    } else {
      /**
       * checking if coupon start time and end time are greater than current time.
       * then assiging coupons start time and end time to coupon optin duration.
       * (Note:- while optin for coupon optin duration is undefined)
       */
      if (coupon.start_time > new Date() && coupon.end_time > new Date()) {
        optin_details.mapping_duration = {
          start_time: coupon.start_time,
          end_time: coupon.end_time,
        };
      } else {
        optin_details.mapping_duration = {
          start_time: new Date(),
          end_time: coupon.end_time,
        };
      }
    }

    logger.debug(
      'Mapping Duration start_time:',
      optin_details.mapping_duration.start_time
    );
    logger.debug(
      'Mapping Duration end_time:',
      optin_details.mapping_duration.end_time
    );
    logger.debug('coupon optin details', optin_details);

    const mapping_details = await readCouponMappingOfSpecificDuration(
      optin_details.coupon_id,
      formated_restaurant_ids.join(','),
      optin_details.mapping_duration.start_time as Date,
      optin_details.mapping_duration.end_time as Date
    );
    if (mapping_details) {
      logger.debug('mapping details', mapping_details);
      return sendError(res, 400, [
        {
          message: 'Coupon mapping already exists',
          code: 0,
        },
      ]);
    }

    if (
      coupon.level === CouponLevel.RESTAURANT &&
      coupon.created_by === CouponCreatedBy.VENDOR
    ) {
      if (optin_details.restaurant_ids.length > 1) {
        return sendError(res, 400, [
          {
            message:
              'multiple restaurants can not be mapped to a coupon created by vendor for a praticular restaurant',
            code: 1053,
          },
        ]);
      }
      const vendors = await getRestaurantVendors(
        optin_details.restaurant_ids[0]
      );
      if (!vendors.find(vendor => vendor.id === coupon.created_by_user_id)) {
        return sendError(res, 400, [
          {
            message:
              'restaurant or restaurants can not be mapped to coupon created by another restaurant',
            code: 1053,
          },
        ]);
      }
    }

    if (coupon.mapping_details && coupon.mapping_details.length > 0) {
      const existing_mapping_restaurant_ids = coupon.mapping_details.map(
        (mapping: ICouponVendor) => mapping.restaurant_id
      );
      return sendError(res, 400, [
        {
          message: 'mapping with given configuration already exists',
          code: 1054,
          data: {
            restaurant_ids: existing_mapping_restaurant_ids,
          },
        },
      ]);
    }

    const mapping_records = validateMappingDetails({
      ...optin_details,
      mapped_by: req.user.user_type,
      mapped_by_user_id: req.user.id,
      coupon: coupon,
    });

    const trx = await getTransaction();
    try {
      const new_mapping_record = await bulkInsertCouponVendor(
        trx,
        mapping_records
      );
      await trx.commit();
      logger.debug(`records created ${new_mapping_record.length}`);
      return sendSuccess(res, 200, {
        total_records_affected: new_mapping_record.length,
        records: new_mapping_record,
        coupon_details: coupon,
      });
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    logger.error(
      'FAILED WHILE MAPPING RESTAURANT WITH COUPON AS ADMIN ',
      error
    );
    return handleErrors(res, error);
  }
}

export async function restaurantOptoutAsAdmin(req: Request, res: Response) {
  try {
    const validation = restaurant_optout_as_admin.validate(req.body);
    if (validation.error)
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 1000,
        },
      ]);
    const optout_details = validation.value as IRestaurantOptoutDetailsAdmin;

    const trx = await getTransaction();
    try {
      const updated_records = await updateCouponVendorById(
        trx,
        optout_details.coupon_mapping_ids,
        {
          is_deleted: true,
          updated_at: new Date(),
        }
      );
      await trx.commit();
      logger.debug(`records updated ${updated_records.length}`);
      return sendSuccess(res, 200, {
        total_records_affected: updated_records.length,
        records: updated_records,
      });
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    logger.error(
      'FAILED WHILE DELETING MAPPING BETWEEN RESTAURANT WITH COUPON AS ADMIN ' +
        error
    );
    return handleErrors(res, error);
  }
}

export async function restaurantOptinAsVendor(req: Request, res: Response) {
  try {
    const validation = restaurant_optin_as_vendor.validate({
      coupon_id: req.body.coupon_id,
      restaurant_id: req.user.data.restaurant_id,
      mapping_duration: req.body.mapping_duration,
    });
    if (validation.error)
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 1000,
        },
      ]);
    const optin_details = validation.value as IRestaurantOptinDetailsVendor;

    const formated_restaurant_ids: string[] = [];
    formated_restaurant_ids.push("'" + optin_details.restaurant_id + "'");

    const coupon = await readActiveCoupon(optin_details.coupon_id);

    if (!coupon) {
      return sendError(res, 400, [
        {
          message: 'Invalid coupon Id',
          code: 1052,
        },
      ]);
    }
    logger.debug('Coupon :', coupon);

    const restaurant = await readRestaurantBasicPosById(
      req.user.data.restaurant_id
    );
    validatePosPartnerAccess(restaurant.pos_partner);

    if (optin_details.mapping_duration) {
      if (optin_details.mapping_duration.start_time! < moment().unix()) {
        return sendError(res, 400, [
          {
            message: 'mapping start time should be greater than current time',
            code: 1066,
          },
        ]);
      }
      const start_time = new Date(0);
      start_time.setUTCSeconds(
        optin_details.mapping_duration.start_time as number
      );
      const end_time = new Date(0);
      end_time.setUTCSeconds(optin_details.mapping_duration.end_time as number);
      optin_details.mapping_duration.start_time = start_time;
      optin_details.mapping_duration.end_time = end_time;
    } else {
      /**
       * checking if coupon start time and end time are greater than current time.
       * then assiging coupons start time and end time to coupon optin duration.
       * (Note:- while optin for coupon optin duration is undefined)
       */
      if (coupon.start_time > new Date() && coupon.end_time > new Date()) {
        optin_details.mapping_duration = {
          start_time: coupon.start_time,
          end_time: coupon.end_time,
        };
      } else {
        optin_details.mapping_duration = {
          start_time: new Date(),
          end_time: coupon.end_time,
        };
      }
    }

    logger.debug(
      'Mapping Duration start_time:',
      optin_details.mapping_duration.start_time
    );
    logger.debug(
      'Mapping Duration end_time:',
      optin_details.mapping_duration.end_time
    );
    logger.debug('coupon optin details', optin_details);

    const mapping_details = await readCouponMappingOfSpecificDuration(
      optin_details.coupon_id,
      formated_restaurant_ids.join(','),
      optin_details.mapping_duration.start_time as Date,
      optin_details.mapping_duration.end_time as Date
    );
    if (mapping_details) {
      logger.debug('mapping details', mapping_details);
      return sendError(res, 400, [
        {
          message: 'Coupon mapping already exists',
          code: 0,
        },
      ]);
    }

    if (
      coupon.level === CouponLevel.RESTAURANT &&
      coupon.created_by === CouponCreatedBy.VENDOR
    ) {
      const vendors = await getRestaurantVendors(optin_details.restaurant_id);

      const formatted_vendor_ids: string[] = [];
      vendors.forEach(vendor =>
        formatted_vendor_ids.push("'" + vendor.id + "'")
      );

      if (!vendors.find(vendor => vendor.id === coupon.created_by_user_id)) {
        return sendError(res, 400, [
          {
            message: 'invalid coupon id',
            code: 1053,
          },
        ]);
      }
    }

    if (coupon.mapping_details && coupon.mapping_details.length > 0) {
      const existing_mapping_restaurant_ids = coupon.mapping_details.map(
        (mapping: ICouponVendor) => mapping.restaurant_id
      );
      return sendError(res, 400, [
        {
          message: 'mapping with given configuration already exists',
          code: 1054,
          data: {
            restaurant_ids: existing_mapping_restaurant_ids,
          },
        },
      ]);
    }

    const mapping_records = validateMappingDetails({
      restaurant_ids: [optin_details.restaurant_id],
      mapping_duration: optin_details.mapping_duration,
      mapped_by: req.user.user_type,
      mapped_by_user_id: req.user.id,
      coupon: coupon,
    });

    const trx = await getTransaction();
    try {
      const new_mapping_record = await bulkInsertCouponVendor(
        trx,
        mapping_records
      );
      await trx.commit();
      logger.debug(`records created ${new_mapping_record.length}`);
      return sendSuccess(res, 200, {
        total_records_affected: new_mapping_record.length,
        records: new_mapping_record,
        coupon_details: coupon,
      });
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    logger.error(
      'FAILED WHILE MAPPING RESTAURANT WITH COUPON AS VENDOR ',
      error
    );
    return handleErrors(res, error);
  }
}

export async function restaurantOptoutAsVendor(req: Request, res: Response) {
  try {
    const validation = restaurant_optout_as_vendor.validate({
      coupon_mapping_ids: req.body.coupon_mapping_ids,
      restaurant_id: req.user.data.restaurant_id,
    });
    if (validation.error)
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 1000,
        },
      ]);
    const optout_details = validation.value as IRestaurantOptoutDetailsVendor;
    const coupon_mapping_details = await readCouponVendorMappingByMappingIds(
      optout_details.coupon_mapping_ids
    );
    const coupon_mapping_by_admin = coupon_mapping_details.filter(
      coupon_mapping => coupon_mapping.mapped_by === CouponMappedBy.ADMIN
    );
    if (coupon_mapping_by_admin.length) {
      return sendError(res, 400, [
        {
          message:
            'Restaurant cannot opt out from coupon mapping done by admin',
          code: 2026,
        },
      ]);
    }

    const trx = await getTransaction();
    try {
      const updated_records = await updateCouponVendorById(
        trx,
        optout_details.coupon_mapping_ids,
        {
          is_deleted: true,
          updated_at: new Date(),
        },
        optout_details.restaurant_id
      );
      await trx.commit();
      logger.debug(`records updated ${updated_records.length}`);
      return sendSuccess(res, 200, {
        total_records_affected: updated_records.length,
        records: updated_records,
      });
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    logger.error(
      'FAILED WHILE DELETING MAPPING BETWEEN RESTAURANT WITH COUPON AS VENDOR ' +
        error
    );
    return handleErrors(res, error);
  }
}

export async function getCouponDetailsAsAdmin(req: Request, res: Response) {
  try {
    const validation = numeric_id.validate(req.params.coupon_id);
    if (validation.error)
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 1000,
        },
      ]);
    const coupon_id = validation.value as number;

    const coupon_details = await readCouponAndMappingByCouponId(coupon_id);
    if (!coupon_details) {
      return sendError(res, 400, [{message: 'Invalid coupon id', code: 1052}]);
    }

    return sendSuccess(res, 200, {coupon_details});
  } catch (error) {
    logger.error('FAILED WHILE FETCHIN COUPON DETAILS AS ADMIN ', error);
    return handleErrors(res, error);
  }
}

export async function getCouponsUsedByCustomerAsAdmin(
  req: Request,
  res: Response
) {
  try {
    const validation = id.validate(req.params.customer_id);
    if (validation.error)
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 1000,
        },
      ]);
    const customer_id = validation.value as string;

    const records = await readAllCouponsUsedByCustomer(customer_id);

    return sendSuccess(res, 200, {
      total_records: records.length,
      records,
    });
  } catch (error) {
    logger.error('FAILED WHILE FILTERING CUSTOMER COUPONS AS ADMIN: ', error);
    return handleErrors(res, error);
  }
}

export async function getCouponsUsedByRestaurantAsAdmin(
  req: Request,
  res: Response
) {
  try {
    const validation = joi_restaurant_id
      .required()
      .validate(req.params.restaurant_id);
    if (validation.error)
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 1000,
        },
      ]);
    const restaurant_id = validation.value as string;
    const records = await readActiveCouponsUsedByRestaurant(restaurant_id);
    return sendSuccess(res, 200, {
      total_records_found: records.length,
      records,
    });
  } catch (error) {
    logger.error('GET COUPONS USED BY RESTAURANT AS ADMIN: ', error);
    return handleErrors(res, error);
  }
}

export async function getCouponsUsedByRestaurantAsVendor(
  req: Request,
  res: Response
) {
  try {
    const validation = joi_restaurant_id
      .required()
      .validate(req.user.data.restaurant_id);
    if (validation.error)
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 1000,
        },
      ]);
    const restaurant_id = validation.value as string;
    const records = await readActiveCouponsUsedByRestaurant(restaurant_id);
    return sendSuccess(res, 200, {
      total_records_found: records.length,
      records,
    });
  } catch (error) {
    logger.error('GET COUPONS USED BY RESTAURANT AS VENDOR: ', error);
    return handleErrors(res, error);
  }
}

export async function getAllCouponsAvailableForOptinForRestaurantAsVendor(
  req: Request,
  res: Response
) {
  try {
    const validation = joi_restaurant_id
      .required()
      .validate(req.user.data.restaurant_id);
    if (validation.error)
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 1000,
        },
      ]);
    const restaurant_id = validation.value as string;
    const vendors = await getRestaurantVendors(restaurant_id);

    const formatted_vendor_ids: string[] = [];
    vendors.forEach(vendor => formatted_vendor_ids.push("'" + vendor.id + "'"));

    logger.debug('formatted_vendor_ids for query: ', formatted_vendor_ids);
    const coupons = await readAllAvailableForOptinCouponsForRestaurant(
      restaurant_id,
      formatted_vendor_ids.join(',')
    );
    return sendSuccess(res, 200, {
      total_records_found: coupons.length,
      coupons,
    });
  } catch (error) {
    logger.error(
      'FAILED BY FETCHING ALL AVAIABLE COUPONS FOR RESTAURANT AS VENDOR',
      error
    );
    return handleErrors(res, error);
  }
}

export async function getAllCouponsForCustomer(req: Request, res: Response) {
  try {
    const validation = joi_restaurant_id
      .required()
      .validate(req.params.restaurant_id);
    if (validation.error)
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 1000,
        },
      ]);
    const restaurant_id = validation.value as string;
    const restaurant = await readRestaurantById(restaurant_id);
    if (!restaurant) {
      return sendError(res, 400, [
        {
          message: 'invalid_restaurant_id',
          code: 1055,
        },
      ]);
    }
    const vendors = await getRestaurantVendors(restaurant_id);

    const formatted_vendor_ids: string[] = [];
    vendors.forEach(vendor => formatted_vendor_ids.push("'" + vendor.id + "'"));

    logger.debug('formatted_vendor_ids for query: ', formatted_vendor_ids);
    const coupons = await readCouponsForCustomer(
      restaurant_id,
      formatted_vendor_ids.join(',')
    );
    return sendSuccess(res, 200, {
      total_records_found: coupons.length,
      coupons,
    });
  } catch (error) {
    logger.error(
      'FAILED BY FETCHING ALL AVAIABLE COUPONS FOR CUSTOMER AS CUSTOMER',
      error
    );
    return handleErrors(res, error);
  }
}

export async function validateCustomerSelectedCoupon(
  req: Request,
  res: Response
) {
  try {
    const validation = validate_coupon.validate({
      customer_id: req.user.id,
      restaurant_id: req.body.restaurant_id,
      total_food_and_taxes: req.body.total_food_and_taxes,
      coupon_id: req.body.coupon_id,
      coupon_code: req.body.coupon_code,
    });
    if (validation.error)
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 1000,
        },
      ]);
    const validated_coupon_details = validation.value as IValidateCoupon;

    const coupon: ICouponValidationResponse = await validateSelectedCoupon(
      validated_coupon_details.customer_id,
      validated_coupon_details.restaurant_id,
      validated_coupon_details.total_food_and_taxes,
      validated_coupon_details.coupon_id,
      validated_coupon_details.coupon_code
    );

    // if (!coupon) {
    //   return sendError(res, 400, [
    //     {
    //       message: 'coupon id or coupon code is required to validate coupon',
    //       code: 1078,
    //     },
    //   ]);
    // }

    if (coupon.coupon_validation_errors) {
      return sendError(res, 400, coupon.coupon_validation_errors);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {coupon_customer_details, ...coupon_details} = coupon.coupon_details!;

    return sendSuccess(res, 200, {
      coupon_details: coupon_details,
    });
  } catch (error) {
    logger.error('FAILED WHILE VALIDATING CUSTOMER SELECTED COUPON', error);
    return handleErrors(res, error);
  }
}

export async function getCoupons(req: Request, res: Response) {
  try {
    const validation = req.user.data;

    const vendors = await getRestaurantVendors(validation.restaurant_id);

    const formatted_vendor_ids: string[] = [];
    vendors.forEach(vendor => formatted_vendor_ids.push("'" + vendor.id + "'"));

    const get_all_coupon = await readCouponsOfAllTimeLine(
      validation.restaurant_id,
      formatted_vendor_ids.join(',')
    );

    const expired_coupon: ICouponAndMapping[] = [];
    const active_coupon: ICouponAndMapping[] = [];
    const upcoming_coupon: ICouponAndMapping[] = [];
    const avilable_for_optin_coupon: ICouponAndMapping[] = [];

    const current_time = new Date();

    for (let i = 0; i < get_all_coupon.length; i++) {
      const {mapping_details, ...coupon} = get_all_coupon[i];

      coupon.start_time = new Date(get_all_coupon[i].start_time);
      coupon.end_time = new Date(get_all_coupon[i].end_time);

      //expired coupon
      if (current_time > coupon.end_time) {
        if (mapping_details) {
          expired_coupon.push({
            ...coupon,
            mapping_details,
          });
        }
      } else if (
        //Active Coupons
        coupon.start_time <= current_time &&
        coupon.end_time >= current_time &&
        !coupon.is_deleted
      ) {
        if (mapping_details) {
          const active_mapping: ICouponVendor[] = [];
          const upcoming_mapping: ICouponVendor[] = [];
          const expired_mapping: ICouponVendor[] = [];

          mapping_details.map(coupon_mapping => {
            if (
              moment(coupon_mapping.start_time).toDate() <= current_time &&
              moment(coupon_mapping.end_time).toDate() >= current_time &&
              !coupon_mapping.is_deleted
            ) {
              active_mapping.push(coupon_mapping);
            } else if (
              moment(coupon_mapping.start_time).toDate() > current_time &&
              moment(coupon_mapping.end_time).toDate() > current_time &&
              !coupon_mapping.is_deleted
            ) {
              upcoming_mapping.push(coupon_mapping);
            } else if (
              moment(coupon_mapping.end_time).toDate() < current_time ||
              coupon_mapping.is_deleted === true
            ) {
              expired_mapping.push(coupon_mapping);
            }
          });

          if (active_mapping.length === 1) {
            active_coupon.push({
              ...coupon,
              mapping_details: active_mapping,
            });
            if (
              upcoming_mapping.length === 0 &&
              moment(coupon.end_time).unix() !==
                moment(active_mapping[0].end_time!).unix()
            ) {
              avilable_for_optin_coupon.push({
                ...coupon,
                mapping_details: [],
              });
            }
          } else {
            avilable_for_optin_coupon.push({...coupon, mapping_details: []});
          }

          if (expired_mapping.length > 0) {
            expired_coupon.push({
              ...coupon,
              mapping_details: expired_mapping.sort((a, b) => {
                return (
                  new Date(b.updated_at!).valueOf() -
                  new Date(a.updated_at!).valueOf()
                );
              }),
            });
          }

          if (upcoming_mapping.length > 0) {
            upcoming_coupon.push({
              ...coupon,
              mapping_details: upcoming_mapping.sort((a, b) => {
                return (
                  new Date(a.start_time!).valueOf() -
                  new Date(b.start_time!).valueOf()
                );
              }),
            });
          }
        } else {
          avilable_for_optin_coupon.push({...coupon, mapping_details: []});
        }
      }

      //Upcomming Coupons
      else if (
        coupon.start_time > current_time &&
        coupon.end_time > current_time &&
        !coupon.is_deleted
      ) {
        if (mapping_details) {
          const upcomming_mapping: ICouponVendor[] = [];
          const expired_mapping: ICouponVendor[] = [];
          mapping_details.map(coupon_mapping => {
            // upcomming mapping
            if (
              moment(coupon_mapping.start_time).toDate() > current_time &&
              moment(coupon_mapping.end_time).toDate() > current_time &&
              !coupon_mapping.is_deleted
            ) {
              upcomming_mapping.push(coupon_mapping);
            } // expired coupon
            else if (coupon_mapping.is_deleted) {
              expired_mapping.push(coupon_mapping);
            }
          });
          if (expired_mapping.length) {
            expired_coupon.push({
              ...coupon,
              mapping_details: expired_mapping.sort((a, b) => {
                return (
                  new Date(b.updated_at!).valueOf() -
                  new Date(a.updated_at!).valueOf()
                );
              }),
            });
          }

          const upcomming_mapping_length = upcomming_mapping.length;
          if (upcomming_mapping_length > 0) {
            upcoming_coupon.push({
              ...coupon,
              mapping_details: upcomming_mapping.sort((a, b) => {
                return (
                  new Date(a.start_time!).valueOf() -
                  new Date(b.start_time!).valueOf()
                );
              }),
            });
            if (
              upcomming_mapping_length === 1 &&
              (moment(coupon.start_time).unix() !==
                moment(upcomming_mapping[0].start_time!).unix() ||
                moment(coupon.end_time).unix() !==
                  moment(upcomming_mapping[0].end_time!).unix())
            ) {
              avilable_for_optin_coupon.push({
                ...coupon,
                mapping_details: [],
              });
            } else {
              for (let j = 1; j < upcomming_mapping.length; j++) {
                if (
                  new Date(upcomming_mapping[j - 1].end_time!) <
                  new Date(upcomming_mapping[j].start_time!)
                ) {
                  avilable_for_optin_coupon.push({
                    ...coupon,
                    mapping_details: [],
                  });
                  break;
                }
              }
            }
          } else {
            avilable_for_optin_coupon.push({...coupon, mapping_details: []});
          }
        } else {
          avilable_for_optin_coupon.push({...coupon, mapping_details: []});
        }
      }
    }
    return sendSuccess(res, 200, {
      expired_coupon,
      active_coupon,
      upcoming_coupon,
      avilable_for_optin_coupon,
    });
  } catch (error) {
    logger.error('FAILED WHILE FETCHING COUPON', error);
    return handleErrors(res, error);
  }
}

export async function updateCouponVendorSequenceAsVendor(
  req: Request,
  res: Response
) {
  try {
    const validation = bulk_update_coupon_vendor_sequence_as_vendor.validate(
      req.body
    );
    if (validation.error)
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 1000,
        },
      ]);
    const validated_req = validation.value as {
      coupon_mappings: ICouponVendorSequence[];
    };

    logger.debug('coupon vendor mappings', validated_req);

    const result = await updateCouponVendorSequence(
      validated_req.coupon_mappings,
      req.user.data.restaurant_id
    );

    return sendSuccess(res, 200, result);
  } catch (error) {
    logger.error(
      'FAILED WHILE UPDATING COUPON MAPPING SEQUENCE AS VENDOR ',
      error
    );
    return handleErrors(res, error);
  }
}
