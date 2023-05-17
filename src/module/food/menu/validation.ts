import Joi from 'joi';
import * as joi from '../../../utilities/joi_common';
import {GetMenuOrigin} from './enum';

export const verify_update_petpooja_menu_item = Joi.object({
  id: joi.id_num,
  restaurant_id: joi.joi_restaurant_id.required(),
  image: joi.verify_file,
});

export const verify_menu_item_id = joi.id_num;

export const verify_get_menu = Joi.object({
  origin: Joi.string().valid(GetMenuOrigin.SEARCH),
  restaurant_id: joi.joi_restaurant_id,
});
