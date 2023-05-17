import Joi from 'joi';
import {joi_restaurant_id} from '../../../utilities/joi_common';
import {
  CouponCreatedBy,
  CouponLevel,
  CouponMappedBy,
  CouponType,
  CouponVendorMappingTimeLine,
  DiscountSponseredBy,
} from './enum';

export const id = Joi.string()
  .guid({version: ['uuidv4', 'uuidv5']})
  .required();

export const numeric_id = Joi.number().required();

export const coupon_created_by_admin = Joi.object({
  code: Joi.string().trim().min(5).max(18).required().messages({
    'string.min': 'code should have a minimum length of 5',
    'string.max': 'code exceeding length of 18 characters',
    'string.empty': 'Please add Coupon code',
  }),
  header: Joi.string().trim().min(3).max(20).required().messages({
    'string.min': 'Header should have a minimum length of 5',
    'string.max': 'Header exceeding length of 20 characters',
    'string.empty': 'Header cannot be Empty',
  }),
  description: Joi.string().trim().min(5).max(100).required().messages({
    'string.min': 'Description should have a minimum length of 5',
    'string.max': 'Description exceeding length of 100 characters',
    'string.empty': 'Description cannot be Empty',
  }),
  terms_and_conditions: Joi.string()
    .min(5)
    .max(100)
    .trim()
    .required()
    .messages({
      'string.min': 'Terms and Conditions should have a minimum length of 5',
      'string.max': 'Terms and Conditions exceeding length of 100 characters',
      'string.empty': 'Terms and Conditions cannot be empty',
    }),
  type: Joi.string().valid(CouponType.UPTO, CouponType.FLAT).required(),
  discount_percentage: Joi.number().min(1).max(100),
  discount_amount_rupees: Joi.number().positive().integer(),
  start_time: Joi.number().required(),
  end_time: Joi.number().required(),
  level: Joi.string()
    .valid(CouponLevel.GLOBAL, CouponLevel.RESTAURANT)
    .required(),
  max_use_count: Joi.number()
    .required()
    .min(1)
    .max(2147483647)
    .positive()
    .integer(),
  coupon_use_interval_minutes: Joi.number().positive().positive().integer(),
  min_order_value_rupees: Joi.number().required().positive().allow(0),
  max_discount_rupees: Joi.number().min(1).positive().integer(),
  discount_share_percent: Joi.number().required().min(0).max(100),
  discount_sponsered_by: Joi.string().valid(
    DiscountSponseredBy.RESTAURANT,
    DiscountSponseredBy.BANK
  ),
});

export const coupon_created_by_vendor = Joi.object({
  code: Joi.string().trim().min(5).max(18).required().messages({
    'string.min': 'code should have a minimum length of 5',
    'string.max': 'code exceeding length of 18 characters',
    'string.empty': 'Please add Coupon code',
  }),
  header: Joi.string().trim().min(3).max(20).required().messages({
    'string.min': 'Header should have a minimum length of 5',
    'string.max': 'Header exceeding length of 20 characters',
    'string.empty': 'Header cannot be Empty',
  }),
  description: Joi.string().trim().min(5).max(100).required().messages({
    'string.min': 'Description should have a minimum length of 5',
    'string.max': 'Description exceeding length of 100 characters',
    'string.empty': 'Description cannot be Empty',
  }),
  terms_and_conditions: Joi.string()
    .min(5)
    .max(100)
    .trim()
    .required()
    .messages({
      'string.min': 'Terms and Conditions should have a minimum length of 5',
      'string.max': 'Terms and Conditions exceeding length of 100 characters',
      'string.empty': 'Terms and Conditions cannot be empty',
    }),
  type: Joi.string().valid(CouponType.UPTO, CouponType.FLAT).required(),
  discount_percentage: Joi.number().min(1).max(100).positive().integer(),
  discount_amount_rupees: Joi.number().positive().positive().integer(),
  start_time: Joi.number().required(),
  end_time: Joi.number().required(),
  max_use_count: Joi.number()
    .required()
    .min(1)
    .max(2147483647)
    .positive()
    .integer(),
  coupon_use_interval_minutes: Joi.number().positive().positive().integer(),
  min_order_value_rupees: Joi.number().required().positive().allow(0),
  max_discount_rupees: Joi.number().min(1),
});

const mapping_duration = Joi.object({
  start_time: Joi.number().required(),
  end_time: Joi.number().required(),
});

export const restaurant_optin_as_admin = Joi.object({
  coupon_id: Joi.number().required(),
  restaurant_ids: Joi.array().items(joi_restaurant_id.required()).required(),
  mapping_duration,
});

export const restaurant_optout_as_admin = Joi.object({
  coupon_mapping_ids: Joi.array()
    .items(Joi.number().required())
    .min(1)
    .max(10)
    .messages({
      'array.min': 'for optout as vendor add 1 id minimum',
      'array.max': 'for optout as admin add 10 ids maximum',
    })
    .required(),
});

export const restaurant_optout_as_vendor = Joi.object({
  coupon_mapping_ids: Joi.array()
    .items(Joi.number().required())
    .min(1)
    .max(5)
    .messages({
      'array.min': 'for optout as vendor add 1 id minimum',
      'array.max': 'for optout as vendor add 5 ids maximum',
    })
    .required(),
  restaurant_id: joi_restaurant_id.required(),
});

export const restaurant_optin_as_vendor = Joi.object({
  coupon_id: Joi.number().required(),
  restaurant_id: joi_restaurant_id.required(),
  mapping_duration,
});

export const bulk_update_coupon_vendor_sequence_as_vendor = Joi.object({
  coupon_mappings: Joi.array()
    .items({
      id: Joi.number().required(),
      sequence: Joi.number().min(1).max(100).required(),
    })
    .min(1)
    .required(),
});

const pagination = Joi.object({
  page_index: Joi.number().required().min(1).integer(),
  page_size: Joi.number().required().min(1).max(50).integer(),
});

export const filter_coupon_as_admin = Joi.object({
  search_text: Joi.string(),
  filter: Joi.object({
    restaurant_id: joi_restaurant_id,
    type: Joi.string().valid(CouponType.UPTO, CouponType.FLAT),
    level: Joi.string().valid(CouponLevel.GLOBAL, CouponLevel.RESTAURANT),
    max_use_count: Joi.number().min(1).max(20),
    discount_sponsered_by: Joi.string().valid(
      DiscountSponseredBy.RESTAURANT,
      DiscountSponseredBy.BANK
    ),
    created_by: Joi.string().valid(
      CouponCreatedBy.ADMIN,
      CouponCreatedBy.VENDOR
    ),
    duration: Joi.object({
      start_date: Joi.number().required(),
      end_date: Joi.number().required(),
    }),
  }),
  pagination: pagination,
});

export const filter_coupon_as_vendor = Joi.object({
  search_text: Joi.string(),
  filter: Joi.object({
    type: Joi.string().valid(CouponType.UPTO, CouponType.FLAT),
    max_use_count: Joi.number().min(1).max(20),
    duration: Joi.object({
      start_date: Joi.number().required(),
      end_date: Joi.number().required(),
    }),
  }),
  pagination: pagination,
});

export const filter_coupon_vendor_mapping_as_vendor = Joi.object({
  search_text: Joi.string(),
  filter: Joi.object({
    coupon_id: Joi.number().positive(),
    duration: Joi.object({
      start_date: Joi.number().required(),
      end_date: Joi.number().required(),
    }),
  }),
  pagination: pagination,
});

export const filter_coupon_vendor_mapping_as_admin = Joi.object({
  search_text: Joi.string(),
  filter: Joi.object({
    coupon_id: Joi.number().positive(),
    restaurant_id: joi_restaurant_id,
    mapped_by: Joi.string().valid(CouponMappedBy.ADMIN, CouponMappedBy.VENDOR),
    timeline: Joi.array()
      .items(
        Joi.string().valid(
          CouponVendorMappingTimeLine.ACTIVE,
          CouponVendorMappingTimeLine.EXPIRED,
          CouponVendorMappingTimeLine.UPCOMING
        )
      )
      .min(1)
      .max(3),
    duration: Joi.object({
      start_date: Joi.number().required(),
      end_date: Joi.number().required(),
    }),
  }),
  pagination: pagination,
});

export const validate_coupon = Joi.object({
  customer_id: id,
  restaurant_id: joi_restaurant_id.required(),
  total_food_and_taxes: Joi.number().positive().required(),
  coupon_id: Joi.number().positive(),
  coupon_code: Joi.string().allow(''),
});
