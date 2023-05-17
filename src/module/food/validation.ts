import Joi from 'joi';

export const pre_search_input = Joi.object({
  lat: Joi.number().required(),
  long: Joi.number().required(),
  customer_id: Joi.string().max(255),
});
