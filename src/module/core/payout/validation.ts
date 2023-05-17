import Joi from 'joi';
import {Service} from '../../../enum';

export const validate_beneficicary_details = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required(),
  phone: Joi.string().required(),
  address: Joi.string(),
  bank_account_number: Joi.string().required(),
  bank_ifsc: Joi.string().required(),
});

export const validate_request_payout_transfer_details = Joi.object({
  service: Joi.string()
    .valid(Service.FOOD_API, Service.GROCERY_API, Service.PHARMACY_API)
    .required(),
  beneId: Joi.string().required(),
  amount: Joi.string().required(),
  transferId: Joi.string().required(),
});

export const validate_transfer_id = Joi.object({
  service: Joi.string()
    .valid(Service.FOOD_API, Service.GROCERY_API, Service.PHARMACY_API)
    .required(),
  transfer_id: Joi.string().required(),
});
