import Joi from 'joi';
import {OrderByColumn, SortOrder} from '../enum';
import {isValidPhone} from './utilFuncs';

export const id = Joi.string()
  .guid({version: ['uuidv4', 'uuidv5']})
  .required();
export const ids = Joi.array()
  .items(Joi.string().guid({version: ['uuidv4', 'uuidv5']}))
  .required();
export const id_num = Joi.number().required();
export const ids_num = Joi.array().items(Joi.number()).required();
export const verify_file = Joi.object({
  name: Joi.string().min(1).max(70).required(),
}).allow(null);
export const phone = Joi.string()
  .min(10)
  .max(13)
  .trim()
  .custom(value => {
    if (!isValidPhone(value)) {
      throw new Error('invalid.');
    } else {
      return value;
    }
  });

export const joi_restaurant_id = Joi.string();
export const pagination = Joi.object({
  page_index: Joi.number().required().min(0).integer(),
  page_size: Joi.number().required().min(1).max(50).integer(),
});
export const common_name = Joi.string().trim().min(1).max(150);

export const sort = Joi.object({
  column: Joi.string()
    .valid(OrderByColumn.CREATED_AT, OrderByColumn.UPDATED_AT)
    .required(),
  order: Joi.string()
    .valid(SortOrder.ASCENDING, SortOrder.DESCENDING)
    .required(),
});
export const duration_epoch = Joi.object({
  start_date: Joi.number().required(),
  end_date: Joi.number().required(),
});
export const search_text = Joi.string().max(255);
