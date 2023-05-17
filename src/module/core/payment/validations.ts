import Joi from 'joi';

export const validate_generate_payment_tranasaction_token_details = Joi.object({
  service_name: Joi.string().required(),
  customer_details: Joi.object({
    customer_id: Joi.string().required(),
    customer_email: Joi.string().required(),
    customer_phone: Joi.string().required(),
  }),
  order_value: Joi.number().required(),
  order_payment_id: Joi.string().required(),
});

export const validate_confirm_payment_details = Joi.object({
  service_name: Joi.string().required(),
  order_payment_id: Joi.string().required(),
});
