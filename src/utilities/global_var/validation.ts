import Joi from 'joi';
import {GlobalVarAccessRole} from './enums';

export const verify_update_global_var = Joi.object({
  key: Joi.string().min(5).max(70),
  value: [
    Joi.string().trim().required(),
    Joi.object(),
    Joi.array(),
    Joi.number(),
  ],
  description: Joi.string().max(255),
  access_roles: Joi.array().items(
    Joi.string().valid(GlobalVarAccessRole.CUSTOMER, GlobalVarAccessRole.VENDOR)
  ),
});
