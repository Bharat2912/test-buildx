import Joi from 'joi';
import {PosStatus} from './enum';

export const restaurant_set_status = Joi.object({}).required().unknown(true);
export const restaurant_get_status = Joi.object({}).required().unknown(true);
export const item_addon_in_stock = Joi.object({}).required().unknown(true);
export const item_addon_out_stock = Joi.object({}).required().unknown(true);
export const update_order = Joi.object({}).required().unknown(true);

export const init_onboard_restaurant = Joi.object({
  id: Joi.string().required(),
  pos_restaurant_id: Joi.string().required(),
});
export const update_onboard_restaurant = Joi.object({
  id: Joi.string().required(),
  pos_status: Joi.string()
    .valid(PosStatus.READY, PosStatus.GOT_POS_ID)
    .required(),
  pos_id: Joi.string(),
  pos_restaurant_id: Joi.string(),
  details: Joi.object(),
});
export const onboard_restaurant = Joi.object({
  id: Joi.string().required(),
});
export const detach_restaurant = Joi.object({
  id: Joi.string().required(),
});
