import {v4 as uuidv4} from 'uuid';
import constants, {
  FSSAI_Table,
  GST_Bank_Table,
  HolidaySlot,
  Onboarding_Table,
  restaurantCouponsSqlQuery,
  restaurantListingAsAdminSqlQuery,
  restaurantListingSqlQuery,
  Slot,
} from './constants';
import languageConstants from '../../core/language/constants';
import cuisineConstants from '../cuisine/constants';
import Joi from 'joi';
import * as joi from '../../../utilities/joi_common';
import {DB} from '../../../data/knex';
import logger from '../../../utilities/logger/winston_logger';
import {FileObject} from '../../../utilities/s3_manager';
import ResponseError from '../../../utilities/response_error';
import moment from 'moment';
import {IMenuItem} from '../menu/models';
import {Knex} from 'knex';
import {OrderByColumn, RestaurantSortBy} from './enums';
import {IOrderBy, IRestaurantAvailability} from './types';
import {SortOrder} from '../../../enum';
import Globals from '../../../utilities/global_var/globals';
import {PosPartner} from '../enum';
import {joi_id, verify_file, verify_file_type} from './validations';
import {ICoupon, IRestaurantMaxDiscount} from '../coupons/types';

type fileType = 'image' | 'document';

export interface IES_Restaurant {
  id: string;
  name: string;
  cuisine_ids: string[];
  cuisine_names: string[];
  default_preparation_time: number;
  coordinates: {
    lat: number;
    lon: number;
  };
  lat?: number;
  long?: number;
  status?: string;
}
export interface IPackingDetailsOrder {
  packing_charge?: number;
  packing_image?: FileObject;
}
export interface IHolidaySlot {
  restaurant_id: string;
  created_by: string;
  open_after?: Date;
}
export interface IPackingDetailsItem {
  item_name: string;
  item_price: number;
  packing_charge: number;
  packing_image?: FileObject;
}
export interface IRestaurant_Slot {
  id?: string;
  restaurant_id: string;
  slot_name?: string;
  start_time: string;
  end_time: string;
}

export interface IRestaurant
  extends IRestaurant_Basic,
    IRestaurant_OnBoarding,
    IRestaurant_FSSAI,
    IRestaurant_GST_Bank {}

export type Restaurant = {
  basic: IRestaurant_Basic;
  onboarding: IRestaurant_OnBoarding;
  fssai: IRestaurant_FSSAI;
  gst_bank: IRestaurant_GST_Bank;
};

export interface IRestaurant_Basic {
  id: string;
  name?: string;
  branch_name?: string;
  area_name?: string;
  lat?: number;
  long?: number;
  partner_id?: string;
  status?: string;
  image?: FileObject;
  images?: FileObject[];
  orders_count?: number;
  rating?: number; //!BACKWARD_COMPATIBLE
  delivery_time?: number;
  delivery_time_in_seconds?: number;
  delivery_distance_in_meters?: number;
  delivery_time_string?: string;
  delivery_distance_string?: string;
  city_id?: string;
  city?: string;
  area_id?: string;
  cuisine_ids?: string[];
  is_pure_veg?: boolean;
  cost_of_two?: number;
  allow_long_distance?: boolean;
  packing_charge_type?: 'none' | 'item' | 'order';
  custom_packing_charge_item?: boolean;
  packing_charge_item?: IPackingDetailsItem[];
  packing_charge_order?: IPackingDetailsOrder;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
  hold_payout?: boolean;
  poc_number?: string;
  menu_items?: IMenuItem[];
  time_slot?: IRestaurant_Slot[];
  default_preparation_time?: number;
  all_time_rating_order_count?: number; //!BACKWARD_COMPATIBLE
  availability?: IRestaurantAvailability;
  subscription_remaining_orders?: number;
  subscription_grace_period_remaining_orders?: number;
  subscription_end_time?: Date;
  subscription_id?: string;
  pos_id?: string | null;
  pos_partner?: PosPartner | null;
  pos_name?: string | null;
  packing_charge_fixed_percent?: 'fixed' | 'percent';
  taxes_applicable_on_packing?: boolean;
  packing_sgst_utgst?: number;
  packing_cgst?: number;
  packing_igst?: number;
  like_count?: number;
  like_count_label?: string;
  dislike_count?: number;
  delivery_charge_paid_by?: 'customer' | 'restaurant' | 'speedyy';
  speedyy_account_manager_id?: string;
  speedyy_account_manager_name?: string;
  discount_rate?: number;
  discount_updated_at?: Date;
  discount_updated_user_id?: string;
  discount_updated_user_type?: string;
  parent_id?: string | null;
  parent_or_child?: 'parent' | 'child' | null;
}
export interface IRestaurant_OnBoarding {
  id: string;
  draft_section?: string;
  preferred_language_ids?: string[];
  tnc_accepted?: boolean;
  user_profile?: 'owner' | 'manager';
  owner_name?: string;
  owner_contact_number?: string;
  owner_contact_number_verified?: boolean;
  owner_email?: string;
  owner_email_verified?: boolean;
  owner_is_manager?: boolean;
  manager_name?: string;
  manager_contact_number?: string;
  manager_email?: string;
  invoice_email?: string;
  location?: string;
  postal_code?: string;
  postal_code_verified?: boolean;
  state?: string;
  read_mou?: boolean;
  document_sign_number?: string;
  document_sign_number_verified?: boolean;
  menu_document_type?: fileType;
  menu_documents?: FileObject[];
  scheduling_type?: 'all_days' | 'weekdays' | 'custom';
  approved_by?: string;
  approved_by_name?: string;
  status_comments?: string;
  catalog_approved_by?: string;
  catalog_approved_by_name?: string;
}

export interface IRestaurant_FSSAI {
  id: string;
  fssai_has_certificate?: boolean;

  fssai_application_date?: Date;
  fssai_ack_number?: string;
  fssai_ack_document_type?: fileType;
  fssai_ack_document?: FileObject;

  fssai_expiry_date?: Date;
  fssai_cert_number?: string;
  fssai_cert_verified?: boolean;
  fssai_cert_document_type?: fileType;
  fssai_cert_document?: FileObject;

  fssai_firm_name?: string;
  fssai_firm_address?: string;
}
export interface IRestaurant_GST_Bank {
  id: string;
  gst_category?: 'restaurant' | 'non-restaurant' | 'hybrid';
  pan_number?: string;
  pan_number_verified?: boolean;
  pan_owner_name?: string;
  pan_document_type?: fileType;
  pan_document?: FileObject;

  has_gstin?: boolean;
  gstin_number?: string;
  gstin_number_verified?: boolean;
  gstin_document_type?: fileType;
  gstin_document?: FileObject;

  business_name?: string;
  business_address?: string;

  bank_account_number?: string;
  ifsc_code?: string;
  ifsc_verified?: boolean;
  bank_document_type?: fileType;
  kyc_document_type?: fileType;
  bank_document?: FileObject;
  kyc_document?: FileObject;
}

export enum SchedulingType {
  ALL = 'all',
  WEEKDAYS_AND_WEEKENDS = 'weekdays_and_weekends',
  CUSTOM = 'custom',
}

export interface IRestaurant_Filter {
  sort_by?: RestaurantSortBy;
  sort_direction?: 'asc' | 'desc';
  cuisine_ids?: string[];
  cost_lt?: number;
  cost_gt?: number;
  status?: string[];
}
export interface IRestaurant_AdminFilter {
  status: string[];
  city_id: string[];
  area_id: string[];

  city_name: string;
  area_name: string;

  packing_charge_type: 'order' | 'item';

  is_pure_veg: boolean;
  allow_long_distance: boolean;
  hold_payout: boolean;

  cost_of_two_eq: number;
  cost_of_two_lt: number;
  cost_of_two_gt: number;
  order_count_eq: number;
  order_count_lt: number;
  order_count_gt: number;
  default_preparation_time_eq: number;
  default_preparation_time_lt: number;
  default_preparation_time_gt: number;

  speedyy_account_manager_id: string;
}
export interface ICordinates_Filter {
  lat: number;
  long: number;
  distance?: number;
}
export interface IPagination {
  page_index: number;
  page_size: number;
}

export const verify_sendOtp = Joi.object({
  id: joi.joi_restaurant_id.required(),
  phone: joi.phone.required(),
});
export const verify_sendOtp_email = Joi.object({
  id: joi.joi_restaurant_id.required(),
  email: Joi.string().email({minDomainSegments: 2}).required(),
});

export const verify_velidateOtp = Joi.object({
  id: joi.joi_restaurant_id.required(),
  phone: joi.phone.required(),
  otp: Joi.string().min(5).max(5).required(),
});

export const verify_velidateOtp_email = Joi.object({
  id: joi.joi_restaurant_id.required(),
  email: Joi.string().email({minDomainSegments: 2}).required(),
  otp: Joi.string().min(5).max(5).required(),
});

export const verify_validateHolidaySlot = Joi.object({
  end_epoch: Joi.number().required(),
});

export const verify_updateRestaurant = Joi.object({
  id: joi.joi_restaurant_id.required(),
  image: verify_file,
  images: Joi.array().items(verify_file),
  default_preparation_time: Joi.number().integer().min(1).max(120),
  free_delivery: Joi.boolean(),
});

export const filterRestaurant = Joi.object({
  filter: Joi.object({
    sort_by: Joi.string().valid(
      RestaurantSortBy.ORDER_COUNT,
      RestaurantSortBy.DELIVERY_TIME,
      RestaurantSortBy.LIKE_COUNT
    ),
    sort_direction: Joi.string()
      .valid(SortOrder.ASCENDING, SortOrder.DESCENDING)
      .when('sort_by', {
        is: Joi.exist(),
        then: Joi.required(),
      }),
    cuisine_ids: Joi.array().items(Joi.string()),
    cost_lt: Joi.number(),
    cost_gt: Joi.number(),
  }),
  coordinates: Joi.object({
    lat: Joi.number().required(),
    long: Joi.number().required(),
  }).required(),
  pagination: joi.pagination,
}).required();

export const verify_validateHolidaySlotAdmin = Joi.object({
  restaurant_id: joi.joi_restaurant_id.required(),
  end_epoch: Joi.number().required(),
});
const sort = Joi.object({
  column: Joi.string()
    .valid(OrderByColumn.CREATED_AT, OrderByColumn.UPDATED_AT)
    .required(),
  order: Joi.string()
    .valid(SortOrder.ASCENDING, SortOrder.DESCENDING)
    .required(),
});
export const verify_filter_restaurant = Joi.object({
  search_text: Joi.string(),
  filter: Joi.object({
    status: Joi.array().items(Joi.string()),
    city_id: Joi.array().items(Joi.string()),
    area_id: Joi.array().items(Joi.string()),

    city_name: Joi.string(),
    area_name: Joi.string(),

    packing_charge_type: Joi.string().valid('order', 'item'),

    is_pure_veg: Joi.boolean(),
    allow_long_distance: Joi.boolean(),
    hold_payout: Joi.boolean(),

    cost_of_two_eq: Joi.number(),
    cost_of_two_lt: Joi.number(),
    cost_of_two_gt: Joi.number(),
    order_count_eq: Joi.number(),
    order_count_lt: Joi.number(),
    order_count_gt: Joi.number(),
    default_preparation_time_eq: Joi.number().integer(),
    default_preparation_time_lt: Joi.number().integer(),
    default_preparation_time_gt: Joi.number().integer(),
    all_time_rating_order_count_eq: Joi.number(),
    all_time_rating_order_count_lt: Joi.number(),
    all_time_rating_order_count_gt: Joi.number(),

    speedyy_account_manager_id: Joi.string(),
  }).required(),
  pagination: joi.pagination.required(),
  sort: Joi.array().items(sort),
});

export const verify_cart_restaurant_serviceable = Joi.object({
  restaurant_id: joi.joi_restaurant_id.required(),
  customer_coordinates: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
  }).required(),
});

export const verify_create_restaurant = Joi.object({
  name: Joi.string().min(3).max(40).trim().required(),
  lat: Joi.number().min(-90).max(90),
  long: Joi.number().min(-180).max(180),
});
export const verify_update_slot = Joi.object({
  scheduling_type: Joi.valid(
    SchedulingType.ALL,
    SchedulingType.WEEKDAYS_AND_WEEKENDS,
    SchedulingType.CUSTOM
  ).required(),
  slot_schedule: Joi.array()
    .items(
      Joi.object({
        slot_name: Joi.string().min(1).max(50).required(),
        start_time: Joi.string().min(1).max(50).required(),
        end_time: Joi.string().min(1).max(50).required(),
      })
    )
    .min(1)
    .required(),
});

export const verify_update_restaurant = Joi.object({
  id: joi.joi_restaurant_id,
  name: Joi.string().min(3).max(40).trim(),
  branch_name: Joi.string().trim().max(80).allow(null),
  lat: Joi.number().min(-90).max(90),
  long: Joi.number().min(-180).max(180),
  status: Joi.string().valid(constants.StatusNames.draft).required(),
  image: verify_file,
  images: Joi.array().items(verify_file),
  slot_schedule: Joi.array()
    .items(
      Joi.object({
        slot_name: Joi.string().min(1).max(50).required(),
        start_time: Joi.string().min(1).max(50).required(),
        end_time: Joi.string().min(1).max(50).required(),
      })
    )
    .min(1),
  draft_section: Joi.string().min(1).max(50),
  city_id: joi_id,
  area_id: joi_id,
  // preferred_language_ids: Joi.array().items(joi_id).min(1),
  // preferred_language_ids: Joi.array().allow(null),
  tnc_accepted: Joi.boolean(),
  user_profile: Joi.valid('owner', 'manager'),
  owner_name: Joi.string().min(5).max(70),
  owner_contact_number: joi.phone,
  owner_email: Joi.string().email({minDomainSegments: 2}),
  owner_is_manager: Joi.boolean(),
  manager_name: Joi.string().min(5).max(70),
  manager_contact_number: joi.phone,
  manager_email: Joi.string().email({minDomainSegments: 2}),
  invoice_email: Joi.string().email({minDomainSegments: 2}),
  location: Joi.string().min(5).max(250),
  postal_code: Joi.string().min(5).max(70),
  state: Joi.string().min(3).max(70),
  read_mou: Joi.boolean(),
  document_sign_number: joi.phone,
  packing_charge_type: Joi.valid('none', 'item', 'order'),
  custom_packing_charge_item: Joi.boolean().when('packing_charge_type', {
    is: 'item',
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
  packing_charge_order: Joi.object({
    packing_charge: Joi.number().min(0).max(50).required(),
    packing_image: verify_file,
  }).when('packing_charge_type', {
    is: 'order',
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
  packing_charge_item: Joi.array()
    .items({
      item_name: Joi.string().min(3).max(250).required(),
      item_price: Joi.number().required(),
      packing_charge: Joi.number().required(),
      packing_image: verify_file,
    })
    .when('packing_charge_type', {
      is: 'item',
      then: Joi.when('custom_packing_charge_item', {
        is: true,
        then: Joi.required(),
        otherwise: Joi.forbidden(),
      }),
      otherwise: Joi.forbidden(),
    }),
  cuisine_ids: Joi.array().items(joi_id).min(1),
  is_pure_veg: Joi.boolean(),
  cost_of_two: Joi.number(),
  menu_documents: Joi.array().items(verify_file),
  scheduling_type: Joi.valid(
    SchedulingType.ALL,
    SchedulingType.WEEKDAYS_AND_WEEKENDS,
    SchedulingType.CUSTOM
  ),
  allow_long_distance: Joi.boolean(),
  default_preparation_time: Joi.number().integer().min(1).max(120),
  poc_number: joi.phone,
  /**
   * FSSAI Table Data
   */
  fssai_has_certificate: Joi.boolean(),
  fssai_application_date: Joi.date(),
  fssai_ack_number: Joi.string().min(1).max(70),
  fssai_ack_document: verify_file,
  fssai_expiry_date: Joi.date(),
  fssai_cert_number: Joi.string().min(1).max(70),
  fssai_cert_document: verify_file,

  fssai_firm_name: Joi.string().min(1).max(250),
  fssai_firm_address: Joi.string().min(1).max(250),

  /**
   * GST_BANK Table Data
   */
  gst_category: Joi.string().valid('restaurant', 'non-restaurant', 'hybrid'),
  pan_number: Joi.string().min(1).max(70),
  pan_owner_name: Joi.string().min(1).max(70),
  pan_document: verify_file,
  has_gstin: Joi.boolean(),
  gstin_number: Joi.string().min(1).max(70),
  gstin_document: verify_file,

  business_name: Joi.string().min(5).max(250),
  business_address: Joi.string().min(5).max(250),

  bank_account_number: Joi.string().min(1).max(70),
  ifsc_code: Joi.string().min(1).max(20),
  bank_document: verify_file,
  kyc_document: verify_file,
});
export const verify_admin_approval = Joi.object({
  id: joi.joi_restaurant_id.required(),
  approved: Joi.boolean().required(),
  status_comments: Joi.string().min(1).max(500),
});

export const verify_submit_restaurant = Joi.object({
  id: joi.joi_restaurant_id,
  name: Joi.string().min(1).max(70).required(),
  branch_name: Joi.string().trim().max(80).allow(null),
  lat: Joi.number().min(-90).max(90).required(),
  long: Joi.number().min(-180).max(180).required(),
  status: Joi.string()
    .valid(constants.StatusNames.draft, constants.StatusNames.approvalRejected)
    .required(),
  image: verify_file,
  images: Joi.array().items(verify_file),
  city_id: joi_id.required(),
  area_id: joi_id.required(),
  //preferred_language_ids: Joi.array().items(joi_id).min(1).required(),
  // preferred_language_ids: Joi.array().allow(null),
  orders_count: Joi.number().valid(0),
  tnc_accepted: Joi.boolean().valid(true).required(),
  user_profile: Joi.valid('owner', 'manager').required(),
  owner_name: Joi.string().min(5).max(70).when('user_profile', {
    is: 'owner',
    then: Joi.required(),
  }),
  owner_contact_number: joi.phone.when('user_profile', {
    is: 'owner',
    then: Joi.required(),
  }),
  owner_contact_number_verified: Joi.boolean().when('user_profile', {
    is: 'owner',
    then: Joi.valid(true).required(),
  }),
  owner_email: Joi.string().email({minDomainSegments: 2}).when('user_profile', {
    is: 'owner',
    then: Joi.required(),
  }),
  owner_email_verified: Joi.boolean().when('user_profile', {
    is: 'owner',
    then: Joi.valid(true).required(),
  }),
  owner_is_manager: Joi.boolean().required(),
  manager_name: Joi.string().min(5).max(70).when('user_profile', {
    is: 'manager',
    then: Joi.required(),
  }),
  manager_contact_number: Joi.string().when('user_profile', {
    is: 'manager',
    then: Joi.required(),
  }),
  manager_email: Joi.string()
    .email({minDomainSegments: 2})
    .when('user_profile', {
      is: 'manager',
      then: Joi.required(),
    }),
  invoice_email: Joi.string().email({minDomainSegments: 2}).required(),
  location: Joi.string().min(5).max(250).required(),
  postal_code: Joi.string().min(5).max(70).required(),
  postal_code_verified: Joi.boolean(), //.valid(true).required(),
  state: Joi.string().min(3).max(70).required(),
  read_mou: Joi.boolean().valid(true).required(),
  document_sign_number: joi.phone.required(),
  document_sign_number_verified: Joi.boolean().valid(true).required(),
  packing_charge_type: Joi.valid('none', 'item', 'order').required(),
  custom_packing_charge_item: Joi.boolean().when('packing_charge_type', {
    is: 'item',
    then: Joi.required(),
  }),
  packing_charge_order: Joi.object({
    packing_charge: Joi.number().min(0).max(50).required(),
    packing_image: verify_file,
  }).when('packing_charge_type', {
    is: 'order',
    then: Joi.required(),
  }),
  packing_charge_item: Joi.array()
    .items({
      item_name: Joi.string().min(3).max(250).required(),
      item_price: Joi.number().required(),
      packing_charge: Joi.number().required(),
      packing_image: verify_file,
    })
    .when('packing_charge_type', {
      is: 'item',
      then: Joi.when('custom_packing_charge_item', {
        is: true,
        then: Joi.required(),
      }),
    }),
  cuisine_ids: Joi.array().items(joi_id).min(1).required(),
  is_pure_veg: Joi.boolean().required(),
  cost_of_two: Joi.number().required(),
  menu_documents: Joi.array().items(verify_file),
  menu_document_type: verify_file_type.when('menu_documents', {
    is: Joi.exist(),
    then: Joi.required(),
  }),
  scheduling_type: Joi.valid(
    'all',
    'weekdays_and_weekends',
    'custom'
  ).required(),
  allow_long_distance: Joi.boolean().required(),
  poc_number: joi.phone.required(),
  /**
   * FSSAI Virify JOI
   */
  fssai_has_certificate: Joi.boolean().required(),

  fssai_application_date: Joi.date().when('fssai_has_certificate', {
    is: false,
    then: Joi.required(),
  }),
  fssai_ack_number: Joi.string().min(1).max(70).when('fssai_has_certificate', {
    is: false,
    then: Joi.required(),
  }),
  fssai_ack_document: verify_file.when('fssai_has_certificate', {
    is: false,
    then: Joi.required(),
  }),
  fssai_ack_document_type: verify_file_type.when('fssai_has_certificate', {
    is: false,
    then: Joi.required(),
  }),
  fssai_expiry_date: Joi.date().when('fssai_has_certificate', {
    is: true,
    then: Joi.required(),
  }),
  fssai_cert_number: Joi.string().min(1).max(70).when('fssai_has_certificate', {
    is: true,
    then: Joi.required(),
  }),
  fssai_cert_verified: Joi.boolean(), //.when('fssai_has_certificate', {is: true,then: Joi.required(),}),
  fssai_cert_document_type: verify_file_type.when('fssai_has_certificate', {
    is: true,
    then: Joi.required(),
  }),
  fssai_cert_document: verify_file.when('fssai_has_certificate', {
    is: true,
    then: Joi.required(),
  }),
  fssai_firm_name: Joi.string().min(1).max(250).required(),
  fssai_firm_address: Joi.string().min(1).max(250).required(),

  /**
   * GST BANK Joi Verify
   */
  gst_category: Joi.string()
    .valid('restaurant', 'non-restaurant', 'hybrid')
    .required(),
  pan_number: Joi.string().min(1).max(70).required(),
  pan_number_verified: Joi.boolean(), //.valid(true).required(),
  pan_owner_name: Joi.string().min(1).max(70).required(),
  pan_document_type: verify_file_type.required(),
  pan_document: verify_file.required(),

  has_gstin: Joi.boolean().required(),

  gstin_number: Joi.string().min(1).max(70).when('has_gstin', {
    is: true,
    then: Joi.required(),
  }),
  gstin_number_verified: Joi.boolean(), //.valid(true).when('has_gstin', {is: true,then: Joi.required(),}),
  gstin_document_type: verify_file_type.when('has_gstin', {
    is: true,
    then: Joi.required(),
  }),
  gstin_document: verify_file.when('has_gstin', {
    is: true,
    then: Joi.required(),
  }),
  business_name: Joi.string().min(5).max(250).when('has_gstin', {
    is: false,
    then: Joi.required(),
  }),
  business_address: Joi.string().min(5).max(250).when('has_gstin', {
    is: false,
    then: Joi.required(),
  }),

  bank_account_number: Joi.string().min(1).max(70).required(),
  ifsc_code: Joi.string().min(1).max(20).required(),
  ifsc_verified: Joi.boolean().valid(true).required(),
  bank_document: verify_file.required(),
  bank_document_type: verify_file_type.required(),
  kyc_document: verify_file.required(),
  kyc_document_type: verify_file_type.required(),

  packing_charge_fixed_percent: Joi.string().valid('fixed', 'percent'),
  taxes_applicable_on_packing: Joi.boolean(),
  packing_sgst_utgst: Joi.number().precision(3),
  packing_cgst: Joi.number().precision(3),
  packing_igst: Joi.number().precision(3),
});

export async function getInvalidLanuageIds(ids: string[]) {
  return DB.read(languageConstants.TableName)
    .where({is_deleted: false})
    .whereIn(languageConstants.ColumnNames.id, ids)
    .select([constants.ColumnNames.id])
    .then((langs: {id: string}[]) => {
      const diff = ids.filter(id => {
        // return !langIds.includes(x);
        return !langs.filter(lang => {
          return lang.id === id;
        }).length;
      });
      if (diff.length) return diff;
      return null;
    })
    .catch((error: Error) => {
      throw error;
    });
}

export async function getInvalidCuisineIds(ids: string[]) {
  return DB.read(cuisineConstants.TableName)
    .where({is_deleted: false})
    .whereIn(cuisineConstants.ColumnNames.id, ids)
    .select([constants.ColumnNames.id])
    .then((cuisines: {id: string}[]) => {
      const diff = ids.filter(id => {
        return !cuisines.filter(cuisine => {
          return cuisine.id === id;
        }).length;
      });
      if (diff && diff.length) return diff;
      return null;
    })
    .catch((error: Error) => {
      throw error;
    });
}

export function getRestaurantStruct(restaurantdata: IRestaurant): Restaurant {
  const result = <Restaurant>{};

  result.basic = <IRestaurant_Basic>{};
  if (restaurantdata.id !== undefined) result.basic.id = restaurantdata.id;
  if (restaurantdata.name !== undefined)
    result.basic.name = restaurantdata.name;
  if (restaurantdata.branch_name !== undefined)
    result.basic.branch_name = restaurantdata.branch_name;
  if (restaurantdata.lat !== undefined) result.basic.lat = restaurantdata.lat;
  if (restaurantdata.long !== undefined)
    result.basic.long = restaurantdata.long;
  if (restaurantdata.partner_id !== undefined)
    result.basic.partner_id = restaurantdata.partner_id;
  if (restaurantdata.status !== undefined)
    result.basic.status = restaurantdata.status;
  if (restaurantdata.image !== undefined)
    result.basic.image = restaurantdata.image;
  if (restaurantdata.images !== undefined)
    result.basic.images = restaurantdata.images;
  if (restaurantdata.orders_count !== undefined)
    result.basic.orders_count = restaurantdata.orders_count;
  if (restaurantdata.delivery_time !== undefined)
    result.basic.delivery_time = restaurantdata.delivery_time;
  if (restaurantdata.city_id !== undefined)
    result.basic.city_id = restaurantdata.city_id;
  if (restaurantdata.area_id !== undefined)
    result.basic.area_id = restaurantdata.area_id;
  if (restaurantdata.cuisine_ids !== undefined)
    result.basic.cuisine_ids = restaurantdata.cuisine_ids;
  if (restaurantdata.is_pure_veg !== undefined)
    result.basic.is_pure_veg = restaurantdata.is_pure_veg;
  if (restaurantdata.cost_of_two !== undefined)
    result.basic.cost_of_two = restaurantdata.cost_of_two;
  if (restaurantdata.allow_long_distance !== undefined)
    result.basic.allow_long_distance = restaurantdata.allow_long_distance;
  if (restaurantdata.packing_charge_type !== undefined)
    result.basic.packing_charge_type = restaurantdata.packing_charge_type;
  if (restaurantdata.packing_charge_item !== undefined)
    result.basic.packing_charge_item = restaurantdata.packing_charge_item;
  if (restaurantdata.packing_charge_order !== undefined)
    result.basic.packing_charge_order = restaurantdata.packing_charge_order;
  if (restaurantdata.created_at !== undefined)
    result.basic.created_at = restaurantdata.created_at;
  if (restaurantdata.updated_at !== undefined)
    result.basic.updated_at = restaurantdata.updated_at;
  if (restaurantdata.is_deleted !== undefined)
    result.basic.is_deleted = restaurantdata.is_deleted;
  if (restaurantdata.default_preparation_time !== undefined)
    result.basic.default_preparation_time =
      restaurantdata.default_preparation_time;
  if (restaurantdata.custom_packing_charge_item !== undefined)
    result.basic.custom_packing_charge_item =
      restaurantdata.custom_packing_charge_item;
  if (restaurantdata.delivery_charge_paid_by !== undefined)
    result.basic.delivery_charge_paid_by =
      restaurantdata.delivery_charge_paid_by;
  if (restaurantdata.speedyy_account_manager_id !== undefined)
    result.basic.speedyy_account_manager_id =
      restaurantdata.speedyy_account_manager_id;
  if (restaurantdata.poc_number !== undefined)
    result.basic.poc_number = restaurantdata.poc_number;

  result.onboarding = <IRestaurant_OnBoarding>{};
  if (restaurantdata.id !== undefined) result.onboarding.id = restaurantdata.id;
  if (restaurantdata.draft_section !== undefined)
    result.onboarding.draft_section = restaurantdata.draft_section;
  if (restaurantdata.preferred_language_ids !== undefined)
    result.onboarding.preferred_language_ids =
      restaurantdata.preferred_language_ids;
  if (restaurantdata.tnc_accepted !== undefined)
    result.onboarding.tnc_accepted = restaurantdata.tnc_accepted;
  if (restaurantdata.user_profile !== undefined)
    result.onboarding.user_profile = restaurantdata.user_profile;
  if (restaurantdata.owner_name !== undefined)
    result.onboarding.owner_name = restaurantdata.owner_name;
  if (restaurantdata.owner_contact_number !== undefined)
    result.onboarding.owner_contact_number =
      restaurantdata.owner_contact_number;
  if (restaurantdata.owner_contact_number_verified !== undefined)
    result.onboarding.owner_contact_number_verified =
      restaurantdata.owner_contact_number_verified;
  if (restaurantdata.owner_email !== undefined)
    result.onboarding.owner_email = restaurantdata.owner_email;
  if (restaurantdata.owner_email_verified !== undefined)
    result.onboarding.owner_email_verified =
      restaurantdata.owner_email_verified;
  if (restaurantdata.owner_is_manager !== undefined)
    result.onboarding.owner_is_manager = restaurantdata.owner_is_manager;
  if (restaurantdata.manager_name !== undefined)
    result.onboarding.manager_name = restaurantdata.manager_name;
  if (restaurantdata.manager_contact_number !== undefined)
    result.onboarding.manager_contact_number =
      restaurantdata.manager_contact_number;
  if (restaurantdata.manager_email !== undefined)
    result.onboarding.manager_email = restaurantdata.manager_email;
  if (restaurantdata.invoice_email !== undefined)
    result.onboarding.invoice_email = restaurantdata.invoice_email;
  if (restaurantdata.location !== undefined)
    result.onboarding.location = restaurantdata.location;
  if (restaurantdata.postal_code !== undefined)
    result.onboarding.postal_code = restaurantdata.postal_code;
  if (restaurantdata.postal_code_verified !== undefined)
    result.onboarding.postal_code_verified =
      restaurantdata.postal_code_verified;
  if (restaurantdata.state !== undefined)
    result.onboarding.state = restaurantdata.state;
  if (restaurantdata.read_mou !== undefined)
    result.onboarding.read_mou = restaurantdata.read_mou;
  if (restaurantdata.document_sign_number !== undefined)
    result.onboarding.document_sign_number =
      restaurantdata.document_sign_number;
  if (restaurantdata.document_sign_number_verified !== undefined)
    result.onboarding.document_sign_number_verified =
      restaurantdata.document_sign_number_verified;
  if (restaurantdata.menu_document_type !== undefined)
    result.onboarding.menu_document_type = restaurantdata.menu_document_type;
  if (restaurantdata.menu_documents !== undefined)
    result.onboarding.menu_documents = restaurantdata.menu_documents;
  if (restaurantdata.scheduling_type !== undefined)
    result.onboarding.scheduling_type = restaurantdata.scheduling_type;
  if (restaurantdata.approved_by !== undefined)
    result.onboarding.approved_by = restaurantdata.approved_by;
  if (restaurantdata.status_comments !== undefined)
    result.onboarding.status_comments = restaurantdata.status_comments;
  if (restaurantdata.catalog_approved_by !== undefined)
    result.onboarding.catalog_approved_by = restaurantdata.catalog_approved_by;

  result.fssai = <IRestaurant_FSSAI>{};
  if (restaurantdata.id !== undefined) result.fssai.id = restaurantdata.id;
  if (restaurantdata.fssai_has_certificate !== undefined)
    result.fssai.fssai_has_certificate = restaurantdata.fssai_has_certificate;
  if (restaurantdata.fssai_application_date !== undefined)
    result.fssai.fssai_application_date = restaurantdata.fssai_application_date;
  if (restaurantdata.fssai_ack_number !== undefined)
    result.fssai.fssai_ack_number = restaurantdata.fssai_ack_number;
  if (restaurantdata.fssai_ack_document_type !== undefined)
    result.fssai.fssai_ack_document_type =
      restaurantdata.fssai_ack_document_type;
  if (restaurantdata.fssai_ack_document !== undefined)
    result.fssai.fssai_ack_document = restaurantdata.fssai_ack_document;
  if (restaurantdata.fssai_expiry_date !== undefined)
    result.fssai.fssai_expiry_date = restaurantdata.fssai_expiry_date;
  if (restaurantdata.fssai_cert_number !== undefined)
    result.fssai.fssai_cert_number = restaurantdata.fssai_cert_number;
  if (restaurantdata.fssai_cert_verified !== undefined)
    result.fssai.fssai_cert_verified = restaurantdata.fssai_cert_verified;
  if (restaurantdata.fssai_cert_document_type !== undefined)
    result.fssai.fssai_cert_document_type =
      restaurantdata.fssai_cert_document_type;
  if (restaurantdata.fssai_cert_document !== undefined)
    result.fssai.fssai_cert_document = restaurantdata.fssai_cert_document;
  if (restaurantdata.fssai_firm_name !== undefined)
    result.fssai.fssai_firm_name = restaurantdata.fssai_firm_name;
  if (restaurantdata.fssai_firm_address !== undefined)
    result.fssai.fssai_firm_address = restaurantdata.fssai_firm_address;

  result.gst_bank = <IRestaurant_GST_Bank>{};
  if (restaurantdata.id !== undefined) result.gst_bank.id = restaurantdata.id;
  if (restaurantdata.gst_category !== undefined)
    result.gst_bank.gst_category = restaurantdata.gst_category;
  if (restaurantdata.pan_number !== undefined)
    result.gst_bank.pan_number = restaurantdata.pan_number;
  if (restaurantdata.pan_number_verified !== undefined)
    result.gst_bank.pan_number_verified = restaurantdata.pan_number_verified;
  if (restaurantdata.pan_owner_name !== undefined)
    result.gst_bank.pan_owner_name = restaurantdata.pan_owner_name;
  if (restaurantdata.pan_document_type !== undefined)
    result.gst_bank.pan_document_type = restaurantdata.pan_document_type;
  if (restaurantdata.pan_document !== undefined)
    result.gst_bank.pan_document = restaurantdata.pan_document;
  if (restaurantdata.has_gstin !== undefined)
    result.gst_bank.has_gstin = restaurantdata.has_gstin;
  if (restaurantdata.gstin_number !== undefined)
    result.gst_bank.gstin_number = restaurantdata.gstin_number;
  if (restaurantdata.gstin_number_verified !== undefined)
    result.gst_bank.gstin_number_verified =
      restaurantdata.gstin_number_verified;
  if (restaurantdata.gstin_document_type !== undefined)
    result.gst_bank.gstin_document_type = restaurantdata.gstin_document_type;
  if (restaurantdata.gstin_document !== undefined)
    result.gst_bank.gstin_document = restaurantdata.gstin_document;
  if (restaurantdata.business_name !== undefined)
    result.gst_bank.business_name = restaurantdata.business_name;
  if (restaurantdata.business_address !== undefined)
    result.gst_bank.business_address = restaurantdata.business_address;
  if (restaurantdata.bank_account_number !== undefined)
    result.gst_bank.bank_account_number = restaurantdata.bank_account_number;
  if (restaurantdata.ifsc_code !== undefined)
    result.gst_bank.ifsc_code = restaurantdata.ifsc_code;
  if (restaurantdata.ifsc_verified !== undefined)
    result.gst_bank.ifsc_verified = restaurantdata.ifsc_verified;
  if (restaurantdata.bank_document_type !== undefined)
    result.gst_bank.bank_document_type = restaurantdata.bank_document_type;
  if (restaurantdata.kyc_document_type !== undefined)
    result.gst_bank.kyc_document_type = restaurantdata.kyc_document_type;
  if (restaurantdata.bank_document !== undefined)
    result.gst_bank.bank_document = restaurantdata.bank_document;
  if (restaurantdata.kyc_document !== undefined)
    result.gst_bank.kyc_document = restaurantdata.kyc_document;
  return result;
}

function getColumnList() {
  const col_bas = JSON.parse(JSON.stringify(constants.ColumnNames));
  const col_onb = JSON.parse(JSON.stringify(Onboarding_Table.ColumnNames));
  const col_fss = JSON.parse(JSON.stringify(FSSAI_Table.ColumnNames));
  const col_gst = JSON.parse(JSON.stringify(GST_Bank_Table.ColumnNames));
  delete col_bas.id;
  delete col_onb.id;
  delete col_fss.id;
  delete col_gst.id;
  const cols = Object.keys({
    ...col_bas,
    ...col_onb,
    ...col_fss,
    ...col_gst,
  });
  return cols;
}

export function readAllRestaurants(status?: string, city_id?: string) {
  const filter: {is_deleted: boolean; status?: string; city_id?: string} = {
    is_deleted: false,
  };
  filter.is_deleted = false;
  if (status) {
    filter.status = status;
  }
  if (city_id) {
    filter.city_id = city_id;
  }
  return DB.read(constants.TableName)
    .where(filter)
    .select('*')
    .then((restaurant: IRestaurant[]) => {
      return restaurant;
    })
    .catch((error: Error) => {
      throw error;
    });
}

export function readRestaurantDetailsByIds(restIds: string[]) {
  return DB.read
    .select(['a.id', ...getColumnList()])
    .from(constants.TableName + ' AS a')
    .leftJoin(Onboarding_Table.TableName + ' AS b', 'b.id', 'a.id')
    .leftJoin(FSSAI_Table.TableName + ' AS c', 'c.id', 'a.id')
    .leftJoin(GST_Bank_Table.TableName + ' AS d', 'd.id', 'a.id')
    .where({is_deleted: false, status: constants.StatusNames.active})
    .whereIn('a.' + constants.ColumnNames.id, restIds)
    .then((restaurant: IRestaurant[]) => {
      return restaurant;
    })
    .catch((error: Error) => {
      throw error;
    });
}

export function readRestaurantByPartnerId(partner_id: string) {
  return DB.read
    .select(['a.id', ...getColumnList()])
    .from(constants.TableName + ' AS a')
    .leftJoin(Onboarding_Table.TableName + ' AS b', 'b.id', 'a.id')
    .leftJoin(FSSAI_Table.TableName + ' AS c', 'c.id', 'a.id')
    .leftJoin(GST_Bank_Table.TableName + ' AS d', 'd.id', 'a.id')
    .where({is_deleted: false, partner_id: partner_id})
    .then((restaurant: IRestaurant[]) => {
      return restaurant;
    })
    .catch((error: Error) => {
      throw error;
    });
}

export function readRestaurantById(id: string): Promise<IRestaurant> {
  logger.debug('reading restaurant by id', id);
  const DBQuery = DB.read
    .select(['a.id', ...getColumnList()])
    .select(
      DB.read.raw(
        `(select
          name
        from
          city_master
        where
          city_master.id = a.city_id
        )as city`
      )
    )
    .select(
      DB.read.raw(
        `(select
          name
        from
          polygon_master
        where
        polygon_master.id = a.area_id
        )as area_name`
      )
    )
    .from(constants.TableName + ' AS a')
    .leftOuterJoin(Onboarding_Table.TableName + ' AS b', 'b.id', 'a.id')
    .leftOuterJoin(FSSAI_Table.TableName + ' AS c', 'c.id', 'a.id')
    .leftOuterJoin(GST_Bank_Table.TableName + ' AS d', 'd.id', 'a.id')
    .where({is_deleted: false})
    .whereRaw(`a.id = '${id}'`);
  logger.debug('>>>', DBQuery.toSQL().toNative());

  return DBQuery.then((restaurant: IRestaurant[]) => {
    logger.debug('successfully fetched restaurant', id);
    return restaurant[0];
  }).catch((error: Error) => {
    throw error;
  });
}
export function customerAddressById(id: string): Promise<IRestaurant> {
  const DBQuery = DB.read
    .select(['a.id', ...getColumnList()])
    .from(constants.TableName + ' AS a')
    .leftOuterJoin(Onboarding_Table.TableName + ' AS b', 'b.id', 'a.id')
    .leftOuterJoin(FSSAI_Table.TableName + ' AS c', 'c.id', 'a.id')
    .leftOuterJoin(GST_Bank_Table.TableName + ' AS d', 'd.id', 'a.id')
    .where({is_deleted: false})
    .whereRaw(`a.id = '${id}'`);
  logger.debug('>>>', DBQuery.toSQL().toNative());

  return DBQuery.then((restaurant: IRestaurant[]) => {
    return restaurant[0];
  }).catch((error: Error) => {
    throw error;
  });
}
export async function createRestaurant(
  restaurantdata: IRestaurant,
  partner_id: string
): Promise<IRestaurant> {
  restaurantdata.id = uuidv4();
  restaurantdata.partner_id = partner_id;

  const restaurant = getRestaurantStruct(restaurantdata);

  const createdRestBasic: IRestaurant_Basic = await createRestaurantBasic(
    restaurant.basic
  );
  const createdRestOnBoarding: IRestaurant_OnBoarding =
    await createRestaurantOnBoard(restaurant.onboarding);
  const createdRestFsai: IRestaurant_FSSAI = await createRestaurantFssai(
    restaurant.fssai
  );
  const createdRestGstBank: IRestaurant_GST_Bank =
    await createRestaurantGstBank(restaurant.gst_bank);

  return {
    ...createdRestBasic,
    ...createdRestOnBoarding,
    ...createdRestFsai,
    ...createdRestGstBank,
  };
}
export function createRestaurantBasic(
  restaurant: IRestaurant_Basic
): Promise<IRestaurant_Basic> {
  return DB.write(constants.TableName)
    .insert(restaurant)
    .returning('*')
    .then((restaurant: IRestaurant_Basic[]) => {
      return restaurant[0];
    })
    .catch((error: Error) => {
      throw error;
    });
}
export function createRestaurantOnBoard(
  restaurant: IRestaurant_OnBoarding
): Promise<IRestaurant_OnBoarding> {
  return DB.write(Onboarding_Table.TableName)
    .insert(restaurant)
    .returning('*')
    .then((result: IRestaurant_OnBoarding[]) => {
      return result[0];
    })
    .catch((error: Error) => {
      throw error;
    });
}
export function createRestaurantFssai(
  restaurant: IRestaurant_FSSAI
): Promise<IRestaurant_FSSAI> {
  return DB.write(FSSAI_Table.TableName)
    .insert(restaurant)
    .returning('*')
    .then((result: IRestaurant_FSSAI[]) => {
      return result[0];
    })
    .catch((error: Error) => {
      throw error;
    });
}
export function createRestaurantGstBank(
  restaurant: IRestaurant_GST_Bank
): Promise<IRestaurant_GST_Bank> {
  return DB.write(GST_Bank_Table.TableName)
    .insert(restaurant)
    .returning('*')
    .then((result: IRestaurant_GST_Bank[]) => {
      return result[0];
    })
    .catch((error: Error) => {
      throw error;
    });
}

export async function getRestaurantSlots(
  restaurant_ids: string[]
): Promise<IRestaurant_Slot[]> {
  return DB.read(Slot.TableName)
    .whereIn(Slot.ColumnNames.restaurant_id, restaurant_ids)
    .select([
      Slot.ColumnNames.slot_name,
      Slot.ColumnNames.restaurant_id,
      Slot.ColumnNames.start_time,
      Slot.ColumnNames.end_time,
    ])
    .then((slots: IRestaurant_Slot[]) => {
      return slots;
    })
    .catch((error: Error) => {
      throw error;
    });
}
export async function returnHolidaySlots(
  data: Array<string>
): Promise<IHolidaySlot[]> {
  return DB.read(HolidaySlot.TableName)
    .whereIn(HolidaySlot.ColumnNames.restaurant_id, data)
    .where({is_deleted: false})
    .select([
      HolidaySlot.ColumnNames.restaurant_id,
      HolidaySlot.ColumnNames.open_after,
      HolidaySlot.ColumnNames.created_by,
    ])
    .then((slots: IHolidaySlot[]) => {
      return slots;
    })
    .catch((error: Error) => {
      throw error;
    });
}

export async function deleteHolidaySlot(
  trx: Knex.Transaction,
  restaurant_id: string
) {
  await DB.write(HolidaySlot.TableName)
    .update({is_deleted: true})
    .returning('*')
    .where({restaurant_id: restaurant_id})
    .transacting(trx)
    .then((restaurant: IRestaurant_Basic[]) => {
      return restaurant[0];
    })
    .catch((error: Error) => {
      logger.error('Can not delete HOLIDAY SLOT for:', restaurant_id);
      throw error;
    });
}

export async function createHolidaySlot(
  trx: Knex.Transaction,
  data: IHolidaySlot
): Promise<IHolidaySlot> {
  await deleteHolidaySlot(trx, data.restaurant_id);

  return await DB.write(HolidaySlot.TableName)
    .insert(data)
    .returning([
      HolidaySlot.ColumnNames.restaurant_id,
      HolidaySlot.ColumnNames.open_after,
      HolidaySlot.ColumnNames.created_by,
    ])
    .transacting(trx)
    .then((result: Array<IHolidaySlot>) => {
      return result[0];
    })
    .catch((error: Error) => {
      throw error;
    });
}

export async function createSlot(
  trx: Knex.Transaction,
  restaurant_id: string,
  slot_schedule: IRestaurant_Slot[]
): Promise<IRestaurant_Slot[]> {
  const new_slot_schedule: IRestaurant_Slot[] = [];

  for (let i = 0; i < slot_schedule.length; i++) {
    slot_schedule[i].id = uuidv4();
    slot_schedule[i].restaurant_id = restaurant_id;
    if (
      parseInt(slot_schedule[i].start_time) >=
      parseInt(slot_schedule[i].end_time)
    ) {
      throw new ResponseError(
        400,
        'Conflicting Slot: ' +
          slot_schedule[i].slot_name +
          ' Times: ' +
          slot_schedule[i].start_time +
          ' and ' +
          slot_schedule[i].end_time
      );
    }
    if (i === 0) {
      if (!moment(slot_schedule[i].start_time, 'kkmm', true).isValid()) {
        throw new ResponseError(
          400,
          'Incorrect Time: ' + slot_schedule[i].start_time
        );
      }
      if (!moment(slot_schedule[i].end_time, 'kkmm', true).isValid()) {
        throw new ResponseError(
          400,
          'Incorrect Time: ' + slot_schedule[i].end_time
        );
      }
      new_slot_schedule.push(slot_schedule[i]);
    } else {
      if (!moment(slot_schedule[i].start_time, 'kkmm', true).isValid()) {
        throw new ResponseError(
          400,
          'Incorrect Time: ' + slot_schedule[i].start_time
        );
      }
      if (!moment(slot_schedule[i].end_time, 'kkmm', true).isValid()) {
        throw new ResponseError(
          400,
          'Incorrect Time: ' + slot_schedule[i].end_time
        );
      }
      for (let k = 0; k < new_slot_schedule.length; k++) {
        if (slot_schedule[i].slot_name === new_slot_schedule[k].slot_name) {
          const s1 = new_slot_schedule[k].start_time;
          const e1 = new_slot_schedule[k].end_time;
          const s2 = slot_schedule[i].start_time;
          const e2 = slot_schedule[i].end_time;
          if (!moment(s1, 'kkmm', true).isValid()) {
            throw new ResponseError(400, 'Incorrect Time: ' + s1);
          }
          if (!moment(s2, 'kkmm', true).isValid()) {
            throw new ResponseError(400, 'Incorrect Time: ' + s2);
          }
          if (!moment(e1, 'kkmm', true).isValid()) {
            throw new ResponseError(400, 'Incorrect Time: ' + e2);
          }
          if (!moment(e2, 'kkmm', true).isValid()) {
            throw new ResponseError(400, 'Incorrect Time: ' + e2);
          }
          if (s1 === s2 || e1 === e2) {
            throw new ResponseError(
              400,
              'Conflicting Slot: ' +
                slot_schedule[i].slot_name +
                ' Times: ' +
                slot_schedule[i].start_time +
                ' and ' +
                slot_schedule[i].end_time
            );
          }

          if (s2 > s1 && s2 < e1) {
            throw new ResponseError(
              400,
              'Conflicting Slot: ' +
                slot_schedule[i].slot_name +
                ' Times: ' +
                slot_schedule[i].start_time +
                ' and ' +
                slot_schedule[i].end_time
            );
          }

          if (e2 > s1 && e2 < e1) {
            throw new ResponseError(
              400,
              'Conflicting Slot: ' +
                slot_schedule[i].slot_name +
                ' Times: ' +
                slot_schedule[i].start_time +
                ' and ' +
                slot_schedule[i].end_time
            );
          }

          if (s1 > s2 && e1 < e2) {
            throw new ResponseError(
              400,
              'Conflicting Slot: ' +
                slot_schedule[i].slot_name +
                ' Times: ' +
                slot_schedule[i].start_time +
                ':00 and ' +
                slot_schedule[i].end_time +
                ':00'
            );
          }
        } else {
          continue;
        }
      }
      new_slot_schedule.push(slot_schedule[i]);
    }
  }

  //delete all existing slots before creating new slots for restaurant
  await DB.write(Slot.TableName)
    .transacting(trx)
    .delete()
    .where({restaurant_id: restaurant_id})
    .catch((error: Error) => {
      throw error;
    });

  return await DB.write(Slot.TableName)
    .insert(new_slot_schedule)
    .returning([
      Slot.ColumnNames.slot_name,
      Slot.ColumnNames.restaurant_id,
      Slot.ColumnNames.start_time,
      Slot.ColumnNames.end_time,
    ])
    .transacting(trx)
    .catch((error: Error) => {
      throw error;
    });
}

export async function updateRestaurant(
  trx: Knex.Transaction,
  restaurantdata: IRestaurant
): Promise<IRestaurant> {
  logger.debug('updating Restaurant', restaurantdata.id);
  const restaurant = getRestaurantStruct(restaurantdata);
  const basic = await updateRestaurantBasic(trx, restaurant.basic);
  const onboarding = await updateRestaurantOnboarding(
    trx,
    restaurant.onboarding
  );
  const fssai = await updateRestaurantFSSAI(trx, restaurant.fssai);
  const gstbank = await updateRestaurantGstBank(trx, restaurant.gst_bank);

  return {
    ...basic,
    ...onboarding,
    ...fssai,
    ...gstbank,
  };
}
export function updateRestaurantBasic(
  trx: Knex.Transaction,
  restaurant: IRestaurant_Basic
): Promise<IRestaurant_Basic> {
  restaurant.updated_at = new Date();
  return DB.write(constants.TableName)
    .update(restaurant)
    .transacting(trx)
    .where({id: restaurant.id})
    .returning('*')
    .then((restaurant: IRestaurant_Basic[]) => {
      return restaurant[0];
    })
    .catch((error: Error) => {
      throw error;
    });
}
export function updateRestaurantOnboarding(
  trx: Knex.Transaction,
  restaurant: IRestaurant_OnBoarding
): Promise<IRestaurant_OnBoarding> {
  logger.debug('updating');
  return DB.write(Onboarding_Table.TableName)
    .insert(restaurant)
    .transacting(trx)
    .onConflict('id')
    .merge()
    .returning('*')
    .then((restaurant: IRestaurant_OnBoarding[]) => {
      return restaurant[0];
    })
    .catch((error: Error) => {
      throw error;
    });
}
export function updateRestaurantFSSAI(
  trx: Knex.Transaction,
  restaurant_fssai: IRestaurant_FSSAI
): Promise<IRestaurant_FSSAI> {
  return DB.write(FSSAI_Table.TableName)
    .transacting(trx)
    .insert(restaurant_fssai)
    .onConflict('id')
    .merge()
    .returning('*')
    .then((restaurant: IRestaurant_FSSAI[]) => {
      return restaurant[0];
    })
    .catch((error: Error) => {
      throw error;
    });
}
export function updateRestaurantGstBank(
  trx: Knex.Transaction,
  restaurant_gst_bank: IRestaurant_GST_Bank
): Promise<IRestaurant_GST_Bank> {
  return DB.write(GST_Bank_Table.TableName)
    .insert(restaurant_gst_bank)
    .transacting(trx)
    .onConflict('id')
    .merge()
    .returning('*')
    .then((restaurant: IRestaurant_GST_Bank[]) => {
      return restaurant[0];
    })
    .catch((error: Error) => {
      throw error;
    });
}

export function deleteRestaurantById(id: string): Promise<IRestaurant> {
  const restaurant = <IRestaurant>{
    id: id,
    is_deleted: true,
  };
  return DB.write(constants.TableName)
    .update(restaurant)
    .where({is_deleted: false, id: id})
    .returning('*')
    .then((restaurant: IRestaurant[]) => {
      return restaurant[0];
    })
    .catch((error: Error) => {
      throw error;
    });
}

export async function getServiceableRestaurant(
  lat: number,
  long: number,
  distance?: number
): Promise<string[]> {
  let DBQuery = DB.read.select([constants.ColumnNames.id]);

  DBQuery = DBQuery.fromRaw(
    `(select *,
        ((6371 * acos
          (
            cos ( radians(${lat}) )
            * cos( radians( restaurant.lat ) )
            * cos( radians( restaurant.long ) - radians(${long}) )
            + sin ( radians(${lat}) )
            * sin( radians( restaurant.lat ) )
          )
        )*1000) AS distance
      from restaurant) as dist`
  ).where(
    'distance',
    '<',
    distance ? distance : await Globals.SERVICEABILITY_RADIUS_IN_METRES.get()
  );

  logger.debug('>>>', DBQuery.toSQL().toNative());
  return DBQuery.then((restaurant: IRestaurant[]) => {
    const restaurant_ids = restaurant.map(rest => {
      return rest?.id || '';
    });
    return restaurant_ids;
  }).catch((error: Error) => {
    throw error;
  });
}

export async function filterRestaurantsAsAdmin(
  search_text?: string,
  filter?: IRestaurant_AdminFilter,
  pagination?: IPagination,
  sort?: IOrderBy[]
) {
  let DBQuery = DB.read
    .fromRaw(restaurantListingAsAdminSqlQuery())
    .where('is_deleted', false);

  if (search_text) {
    search_text = search_text.toLowerCase();
    search_text = search_text.split("'").join("''");
    DBQuery = DBQuery.whereRaw(
      `( id LIKE '${search_text}%'or LOWER(name) LIKE '%${search_text}%')`
    );
  }
  if (filter) {
    if (filter.city_name) {
      filter.city_name = filter.city_name.toLowerCase();
      filter.city_name = filter.city_name.split("'").join("''");
      DBQuery = DBQuery.whereRaw(
        `(LOWER(city_name) LIKE '%${filter.city_name}%')`
      );
    }
    if (filter.area_name) {
      filter.area_name = filter.area_name.toLowerCase();
      filter.area_name = filter.area_name.split("'").join("''");
      DBQuery = DBQuery.whereRaw(
        `(LOWER(area_name) LIKE '%${filter.area_name}%')`
      );
    }
    if (filter.status && filter.status.length) {
      DBQuery = DBQuery.whereIn('status', filter.status);
    }
    if (filter.city_id && filter.city_id.length) {
      DBQuery = DBQuery.whereIn('city_id', filter.city_id);
    }
    if (filter.area_id && filter.area_id.length) {
      DBQuery = DBQuery.whereIn('area_id', filter.area_id);
    }
    if (filter.is_pure_veg !== undefined) {
      DBQuery = DBQuery.where('is_pure_veg', filter.is_pure_veg);
    }
    if (filter.allow_long_distance !== undefined) {
      DBQuery = DBQuery.where(
        'allow_long_distance',
        filter.allow_long_distance
      );
    }
    if (filter.hold_payout !== undefined) {
      DBQuery = DBQuery.where('hold_payout', filter.hold_payout);
    }

    if (filter.speedyy_account_manager_id) {
      DBQuery = DBQuery.where(
        'speedyy_account_manager_id',
        filter.speedyy_account_manager_id
      );
    }
  }

  logger.debug('>>>', DBQuery.toSQL().toNative());
  const total_records: number = (await DBQuery.clone().count('*'))[0].count;
  let total_pages = total_records;

  if (pagination) {
    pagination.page_size = pagination.page_size || 10;
    pagination.page_index = pagination.page_index || 0;
    const offset = pagination.page_index * pagination.page_size;
    DBQuery = DBQuery.offset(offset).limit(pagination.page_size);
    total_pages = Math.ceil(total_records / pagination.page_size);
  }

  if (sort) {
    DBQuery = DBQuery.orderBy(sort);
  } else {
    DBQuery = DBQuery.orderBy(OrderByColumn.CREATED_AT, SortOrder.DESCENDING);
  }

  const restaurants: IRestaurant[] = await DBQuery.clone().select('*');

  restaurants.forEach(r => {
    //!BACKWARD_COMPATIBLE
    r.rating = 0;
    r.all_time_rating_order_count = 0;
  });
  return {restaurants, total_pages, total_records};
}

export async function filterRestaurants(
  open_restaurant_ids: string[],
  closed_restaurant_ids: string[],
  filterData?: IRestaurant_Filter,
  pagination?: IPagination
): Promise<{total_pages: number; restaurants: IRestaurant[]}> {
  logger.debug('open and close restaurant ids', {
    open_restaurant_ids,
    closed_restaurant_ids,
  });
  let DBQuery = DB.read.fromRaw(await restaurantListingSqlQuery());
  DBQuery = DBQuery.where({
    is_deleted: false,
    status: constants.StatusNames.active,
  });

  if (filterData) {
    if (filterData.cuisine_ids && filterData.cuisine_ids.length) {
      DBQuery = DBQuery.whereRaw(
        `'{${filterData.cuisine_ids.join()}}' && (cuisine_ids)`
      );
    }
    if (filterData.cost_lt) {
      DBQuery = DBQuery.where('cost_of_two', '<', filterData.cost_lt);
    }
    if (filterData.cost_gt) {
      DBQuery = DBQuery.where('cost_of_two', '>', filterData.cost_gt);
    }
  }
  if (open_restaurant_ids.length || closed_restaurant_ids.length) {
    DBQuery = DBQuery.whereIn(
      constants.ColumnNames.id,
      open_restaurant_ids.concat(closed_restaurant_ids)
    );
  }

  const total_records = await DBQuery.clone().count('*');

  // ORDER BY
  if (filterData && filterData.sort_by) {
    if (
      filterData.sort_by === 'delivery_time' ||
      filterData.sort_by === 'distance'
    ) {
      //order and paginate results by input restaurant id sequence
      const restaurant_ids = open_restaurant_ids.concat(closed_restaurant_ids);
      if (restaurant_ids.length > 0) {
        DBQuery = DBQuery.orderByRaw('array_position(?, id)', [restaurant_ids]);
      }
    } else {
      if (closed_restaurant_ids.length) {
        DBQuery = DBQuery.orderByRaw(
          `CASE WHEN id IN (${closed_restaurant_ids
            .map(id => "'" + id + "'")
            .join(',')}) THEN 1 ELSE 0 END`
        );
      }
      DBQuery = DBQuery.orderBy(
        filterData.sort_by,
        filterData.sort_direction || 'desc',
        'last'
      );

      //To define a sequence so duplicate records wont come on different pages
      DBQuery = DBQuery.orderBy(constants.ColumnNames.id);
    }
  }

  let total_pages = Math.ceil(total_records[0].count / 10);
  if (pagination) {
    if (pagination.page_size) {
      const offset = (pagination.page_index || 0) * pagination.page_size;
      DBQuery = DBQuery.offset(offset).limit(pagination.page_size);
      total_pages = Math.ceil(total_records[0].count / pagination.page_size);
    }
  }

  logger.debug('Filter restaurants sql query', DBQuery.toSQL().toNative());
  return DBQuery.clone()
    .select('*')
    .then((restaurants: IRestaurant[]) => {
      restaurants.forEach(r => {
        //!BACKWARD_COMPATIBLE
        r.rating = 0;
        r.all_time_rating_order_count = 0;
      });
      return {total_pages, restaurants};
    })
    .catch((error: Error) => {
      throw error;
    });
}

export async function getIndexRestaurants(): Promise<IES_Restaurant[]> {
  return DB.read
    .select('*')
    .fromRaw(
      `(SELECT
          r.id,
          r.name,
          array_agg(c.id) as cuisine_ids,
          array_agg(c.name) as cuisine_names,
          r.default_preparation_time,
          r.lat,
          r.long,
          r.status
        FROM
          ${constants.TableName} r
        LEFT JOIN
          cuisine_master c on c.id =  any(r.cuisine_ids)
         GROUP BY r.id, r.name) as a`
    )
    .then((restaurants: IES_Restaurant[]) => {
      const result: IES_Restaurant[] = [];
      restaurants.map(restaurant => {
        if (restaurant.status === 'active' || restaurant.status === 'disable')
          result.push({
            id: restaurant.id,
            name: restaurant.name || '',
            cuisine_ids: restaurant.cuisine_ids || [],
            cuisine_names: restaurant.cuisine_names || [],
            default_preparation_time: restaurant.default_preparation_time,
            coordinates: {
              lat: restaurant.lat!,
              lon: restaurant.long!,
            },
          });
      });
      return result;
    })
    .catch((error: Error) => {
      throw error;
    });
}

export async function readRestaurantBasicByIdForUpdate(
  trx: Knex.Transaction,
  restaurant_id: string
): Promise<IRestaurant_Basic> {
  logger.debug('reading restaurant by id', {restaurant_id});
  return await DB.write
    .select('*')
    .from(constants.TableName)
    .where({is_deleted: false, id: restaurant_id})
    .forUpdate()
    .transacting(trx)
    .then((restaurant: IRestaurant_Basic[]) => {
      logger.debug('restaurant fetched successfully', restaurant[0]);
      return restaurant[0];
    })
    .catch((error: Error) => {
      logger.error('ERROR RAISED WHILE READING RESTAURANT', error);
      throw error;
    });
}

export async function readRestaurantBasicById(
  restaurant_id: string
): Promise<IRestaurant_Basic> {
  logger.debug('reading restaurant by id', {restaurant_id});
  return await DB.write
    .select('*')
    .from(constants.TableName)
    .where({is_deleted: false, id: restaurant_id})
    .then((restaurant: IRestaurant_Basic[]) => {
      logger.debug('restaurant fetched successfully', restaurant[0]);
      return restaurant[0];
    })
    .catch((error: Error) => {
      logger.error('ERROR RAISED WHILE READING RESTAURANT', error);
      throw error;
    });
}

export async function readRestaurantBasicPosById(
  restaurant_id: string
): Promise<{
  id: IRestaurant_Basic['id'];
  name: IRestaurant_Basic['name'];
  pos_partner: IRestaurant_Basic['pos_partner'];
}> {
  logger.debug('reading restaurant by id', {restaurant_id});
  return await DB.write
    .select(['id', 'name', 'pos_partner'])
    .from(constants.TableName)
    .where({id: restaurant_id})
    .then(restaurant => {
      logger.debug('restaurant fetched successfully', restaurant[0]);
      return restaurant[0];
    })
    .catch((error: Error) => {
      logger.error('ERROR RAISED WHILE READING RESTAURANT', error);
      throw error;
    });
}

export async function readRestaurantBasicsPosByIds(
  restaurant_ids: string[]
): Promise<
  {
    id: IRestaurant_Basic['id'];
    name: IRestaurant_Basic['name'];
    pos_partner: IRestaurant_Basic['pos_partner'];
  }[]
> {
  logger.debug('reading restaurants by ids', {restaurant_ids});
  return await DB.write
    .select(['id', 'name', 'pos_partner'])
    .from(constants.TableName)
    .whereIn('id', restaurant_ids)
    .then(restaurants => {
      logger.debug('restaurants fetched successfully', restaurants);
      return restaurants;
    })
    .catch((error: Error) => {
      logger.error('ERROR RAISED WHILE READING RESTAURANTS', error);
      throw error;
    });
}
export async function incrementRestaurantVoteCount(
  trx: Knex.Transaction,
  restaurant_id: string,
  vote_type: 1 | -1
): Promise<void> {
  if (vote_type === 1) {
    const like_count = await DB.write
      .select(['like_count'])
      .from(constants.TableName)
      .where({id: restaurant_id})
      .forUpdate()
      .transacting(trx);

    logger.debug('restaurant current like_count', like_count);

    const updated_like_count = await DB.write(constants.TableName)
      .where({id: restaurant_id})
      .increment('like_count', 1)
      .returning(['like_count'])
      .transacting(trx);

    logger.debug('restaurant updated like_count', updated_like_count);
  } else if (vote_type === -1) {
    const dislike_count = (
      await DB.write
        .select(['dislike_count'])
        .from(constants.TableName)
        .where({id: restaurant_id})
        .forUpdate()
        .transacting(trx)
    )[0].dislike_count;
    logger.debug('restaurant current voting stats', dislike_count);

    const updated_dislike_count = await DB.write(constants.TableName)
      .where({id: restaurant_id})
      .increment('dislike_count', 1)
      .returning('dislike_count')
      .transacting(trx);

    logger.debug(
      'restaurant updated_dislike_count voting stats',
      updated_dislike_count
    );
  }
}

export async function readRestaurantsByIdsAndStatus(restaurant_ids: string[]) {
  logger.debug('reading restaurant by ids', restaurant_ids);
  return await DB.read(constants.TableName)
    .select(constants.ColumnNames.id, constants.ColumnNames.status)
    .whereIn(constants.ColumnNames.id, restaurant_ids)
    .where({is_deleted: false})
    .then((restaurant_details: {id: string; status: string}[]) => {
      logger.debug('restaurants fetched successfully', restaurant_details);
      return restaurant_details;
    })
    .catch((error: Error) => {
      logger.error('ERROR RAISED WHILE READING RESTAURANT', error);
      throw error;
    });
}

export async function updateRestaurantOrderCount(
  restaurant_id: string
): Promise<void> {
  await DB.write(constants.TableName)
    .where('id', restaurant_id)
    .increment('orders_count', 1);
  logger.debug('Restaurant order count updated by 1', restaurant_id);
}

export async function readRestaurantWithTimeSlotsAndHolidaySlot(
  restaurant_ids?: string[],
  pagination?: IPagination
): Promise<{
  total_pages: number;
  restaurants: {
    id: string;
    time_slot: IRestaurant_Slot[];
    holiday_slot: IHolidaySlot;
  }[];
}> {
  let DBQuery = DB.read.fromRaw(`(
  SELECT ID as id,
  (SELECT TO_JSON(ARRAY_AGG(ROW_TO_JSON(TS)))
   FROM
     (SELECT
      S.SLOT_NAME,
      S.START_TIME,
      S.END_TIME,
      S.RESTAURANT_ID
      FROM SLOT AS S
      WHERE S.RESTAURANT_ID = R.ID ) AS TS
     ) AS TIME_SLOT,

  (SELECT TO_JSON(HS)
   FROM
     (SELECT
      HS.RESTAURANT_ID,
      HS.OPEN_AFTER,
      HS.CREATED_BY
      FROM HOLIDAY_SLOT AS HS
      WHERE HS.RESTAURANT_ID = R.ID
        AND HS.IS_DELETED = FALSE
        AND HS.OPEN_AFTER > CURRENT_TIMESTAMP ) AS HS
     ) AS HOLIDAY_SLOT
  FROM RESTAURANT AS R
  WHERE R.IS_dELETED = FALSE
  AND
  (STATUS = '${constants.StatusNames.active}'
  OR STATUS = '${constants.StatusNames.disable}'
  OR STATUS = '${constants.StatusNames.catalogPending}'
  OR STATUS = '${constants.StatusNames.approvalPending}'
  )
  ) as a`);

  if (restaurant_ids) {
    DBQuery = DBQuery.whereIn('id', restaurant_ids);
  }

  const total_records = await DBQuery.clone().count('*');
  let total_pages = Math.ceil(total_records[0].count / 10);

  if (pagination) {
    if (pagination.page_size) {
      const offset = (pagination.page_index || 0) * pagination.page_size;
      DBQuery = DBQuery.offset(offset).limit(pagination.page_size);
      total_pages = Math.ceil(total_records[0].count / pagination.page_size);
    }
  }

  const restaurants = await DBQuery.clone().select('*');

  return {
    total_pages,
    restaurants,
  };
}

export async function readRestaurantChildren(
  restaurant_id: string
): Promise<IRestaurant[]> {
  return DB.read
    .select(['a.id', ...getColumnList()])
    .from(constants.TableName + ' AS a')
    .leftJoin(Onboarding_Table.TableName + ' AS b', 'b.id', 'a.id')
    .leftJoin(FSSAI_Table.TableName + ' AS c', 'c.id', 'a.id')
    .leftJoin(GST_Bank_Table.TableName + ' AS d', 'd.id', 'a.id')
    .where({is_deleted: false})
    .where('a.' + constants.ColumnNames.parent_id, restaurant_id)
    .then((restaurant: IRestaurant[]) => {
      return restaurant;
    })
    .catch((error: Error) => {
      throw error;
    });
}

export async function readRestaurantParent(
  restaurant_id: string
): Promise<IRestaurant_Basic> {
  const result = await DB.read(constants.TableName).select('*').where({
    parent_id: restaurant_id,
    is_deleted: false,
  });
  return result[0];
}

export async function readTrendingRestaurantByIds(
  restaurant_ids: string[]
): Promise<
  {
    id: string;
    name: string;
    image: FileObject;
  }[]
> {
  logger.debug('reading restaurants by ids', {restaurant_ids});
  return await DB.write
    .select(['id', 'name', 'image'])
    .from(constants.TableName)
    .whereIn('id', restaurant_ids)
    .orderByRaw('array_position(?, id)', [restaurant_ids])
    .then(restaurants => {
      logger.debug('restaurants fetched successfully', restaurants);
      return restaurants;
    })
    .catch((error: Error) => {
      logger.error('ERROR RAISED WHILE READING RESTAURANTS', error);
      throw error;
    });
}
export async function getRestaurantCoupons(
  restaurant_id: string
): Promise<ICoupon[]> {
  const result = await DB.read.raw(restaurantCouponsSqlQuery(), [
    restaurant_id,
  ]);
  return result.rows || [];
}

export async function getRestaurantMaxDiscount(
  restaurant_id: string
): Promise<IRestaurantMaxDiscount | undefined> {
  const result = await DB.read.raw(
    `
    SELECT
      max(rs.discount_rate) AS max_restaurant_discount,
      max(mc.discount_rate) AS max_main_category_discount,
      max(sc.discount_rate) AS max_sub_category_discount,
      max(mi.discount_rate) AS max_menu_item_discount
    FROM restaurant rs
    JOIN main_category mc ON mc.restaurant_id = rs.id
    JOIN sub_category sc ON sc.main_category_id = mc.id
    JOIN menu_item mi ON mi.sub_category_id = sc.id
    WHERE rs.id = ?;
  `,
    [restaurant_id]
  );
  if (result.rows && result.rows.length) {
    const data = result.rows[0];
    data.discount_level = null;
    data.max_discount = 0;
    if (data.max_restaurant_discount) {
      data.discount_level = 'restaurant';
      data.max_discount = data.max_restaurant_discount;
    } else if (data.max_main_category_discount) {
      data.discount_level = 'main_category';
      data.max_discount = data.max_main_category_discount;
    } else if (data.max_sub_category_discount) {
      data.discount_level = 'sub_category';
      data.max_discount = data.max_sub_category_discount;
    } else if (data.max_menu_item_discount) {
      data.discount_level = 'menu_item';
      data.max_discount = data.max_menu_item_discount;
    }
    return data;
  }
  return;
}
