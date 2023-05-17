import Joi from 'joi';
import {SortOrder} from '../../../enum';
import {OrderByColumn} from './enums';
import * as joi from '../../../utilities/joi_common';

export const joi_id = Joi.string().guid({version: ['uuidv4', 'uuidv5']});
export const verify_file_type = Joi.valid('image', 'document');
export const id = joi_id.required();
export const verify_file = Joi.object({
  name: Joi.string().min(1).max(70).required(),
  path: Joi.string(),
  bucket: Joi.string(),
});

const sort = Joi.object({
  column: Joi.string()
    .valid(OrderByColumn.CREATED_AT, OrderByColumn.UPDATED_AT)
    .required(),
  order: Joi.string()
    .valid(SortOrder.ASCENDING, SortOrder.DESCENDING)
    .required(),
});

export const verify_review_filter_as_admin = Joi.object({
  restaurant_ids: Joi.array().items(Joi.string()).min(1).required(),
  filter: Joi.object({
    vote_type: Joi.number().valid(1, -1, 0),
    rating: Joi.number().min(1).max(5), //!BACKWARD_COMPATIBLE
    rating_gt: Joi.number().min(1).max(5), //!BACKWARD_COMPATIBLE
    rating_lt: Joi.number().min(1).max(5), //!BACKWARD_COMPATIBLE
  }),
  pagination: Joi.object({
    page_index: Joi.number().required(),
    page_size: Joi.number().min(1).required(),
  }).required(),
  sort: Joi.array().items(sort),
});

export const verify_review_filter_as_vendor = Joi.object({
  filter: Joi.object({
    vote_type: Joi.number().valid(1, -1, 0),
    rating: Joi.number().min(1).max(5), //!BACKWARD_COMPATIBLE
    rating_gt: Joi.number().min(1).max(5), //!BACKWARD_COMPATIBLE
    rating_lt: Joi.number().min(1).max(5), //!BACKWARD_COMPATIBLE
  }),
  pagination: Joi.object({
    page_index: Joi.number().required(),
    page_size: Joi.number().min(1).required(),
  }).required(),
  sort: Joi.array().items(sort),
});

export const verify_update_restaurant_as_admin = Joi.object({
  id: joi.joi_restaurant_id.required(),
  image: verify_file,
  images: Joi.array().items(verify_file),
  default_preparation_time: Joi.number().integer().min(1).max(120),
  free_delivery: Joi.boolean(),
  name: Joi.string(),
  branch_name: Joi.string().trim().max(80).allow(null),
  lat: Joi.number().min(-90).max(90),
  long: Joi.number().min(-180).max(180),
  city_id: joi_id,
  area_id: joi_id,
  location: Joi.string().min(5).max(250),
  postal_code: Joi.string().min(5).max(70),
  state: Joi.string().min(3).max(70),
  speedyy_account_manager_id: Joi.string().allow(null),
  poc_number: joi.phone.allow(null),
  delivery_charge_paid_by: Joi.string().valid(
    'customer',
    'speedyy',
    'restaurant'
  ),
});
