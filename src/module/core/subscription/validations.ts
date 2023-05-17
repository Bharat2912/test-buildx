import Joi from 'joi';

export const plan_details = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().required().max(40),
  type: Joi.string().required(),
  max_cycles: Joi.number(),
  amount: Joi.number().required(),
  interval_type: Joi.string().required(),
  intervals: Joi.number(),
  description: Joi.string().max(200),
});

export const subscription_details = Joi.object({
  id: Joi.string().required(),
  plan_id: Joi.string().required(),
  customer_name: Joi.string().required(),
  customer_email: Joi.string().required(),
  customer_phone: Joi.string().required(),
  first_charge_date: Joi.date().required(),
  authorization_amount: Joi.number().required(),
  expires_on: Joi.date().required(),
  return_url: Joi.string().required(),
  description: Joi.string().max(200),
});

export const external_subscription_id = Joi.string().required();
export const external_payment_id = Joi.string();

export const subscription_single_payment_details = Joi.object({
  external_subscription_id: external_subscription_id,
  external_payment_id: external_payment_id.required(),
});

export const subscription_payments_details = Joi.object({
  external_subscription_id: external_subscription_id,
  last_external_payment_id: external_payment_id,
  count: Joi.number(),
});

export const subscription_retry_payments_details = Joi.object({
  external_subscription_id: external_subscription_id,
  next_payment_on: Joi.date(),
});

export const subscription_manual_activation_details = Joi.object({
  external_subscription_id: external_subscription_id,
  next_payment_on: Joi.date(),
});
