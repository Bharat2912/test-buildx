import Joi from 'joi';
import {DeliveryService, Service} from '../../../enum';

export const verify_check_deliverability = Joi.object({
  pickup_latitude: Joi.number().required(),
  pickup_longitude: Joi.number().required(),
  drop_latitude: Joi.number().required(),
  drop_longitude: Joi.number().required(),
  data: Joi.object({
    stage_of_check: Joi.string(),
    order_value: Joi.number().required(),
  }).required(),
  delivery_service: Joi.string().valid(
    DeliveryService.SHADOWFAX,
    DeliveryService.SPEEDYY_RIDER
  ),
  delivery_services: Joi.array().items(
    DeliveryService.SHADOWFAX,
    DeliveryService.SPEEDYY_RIDER
  ),
});

export const verify_place_order = Joi.object({
  service_name: Joi.string()
    .valid(
      Service.FOOD_API,
      Service.GROCERY_API,
      Service.PICKUP_DROP_API,
      Service.PHARMACY_API
    )
    .required(),
  is_pod: Joi.boolean().default(false),
  pickup_details: Joi.object({
    name: Joi.string().required(),
    contact_number: Joi.string().required(),
    city: Joi.string().required(),
    address: Joi.string().required(),
    longitude: Joi.number().required(),
    latitude: Joi.number().required(),
  }).required(),
  drop_details: Joi.object({
    name: Joi.string().required(),
    contact_number: Joi.string().required(),
    city: Joi.string().required(),
    address: Joi.string().required(),
    longitude: Joi.number().required(),
    latitude: Joi.number().required(),
  }).required(),
  order_details: Joi.object({
    order_id: Joi.string().required(),
    order_value: Joi.number().required(),
    payment_status: Joi.string().valid('post-paid', 'pre-paid').required(),
    delivery_instruction: Joi.object({
      drop_instruction_text: Joi.string().required(),
    }),
  }).required(),
  order_items: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().required(),
        name: Joi.string().required(),
        price: Joi.number().required(),
        quantity: Joi.number().required(),
      })
    )
    .min(1)
    .required(),
  delivery_service: Joi.string().valid(
    DeliveryService.SHADOWFAX,
    DeliveryService.SPEEDYY_RIDER
  ),
});

export const verify_cancel_delivery = Joi.object({
  service_name: Joi.string()
    .valid(
      Service.FOOD_API,
      Service.GROCERY_API,
      Service.PICKUP_DROP_API,
      Service.PHARMACY_API
    )
    .required(),
  user: Joi.string().valid('Customer', 'Seller', 'Rider').required(),
  delivery_order_id: Joi.string().required(),
  reason: Joi.string().required(),
  delivery_service: Joi.string()
    .valid(DeliveryService.SHADOWFAX, DeliveryService.SPEEDYY_RIDER)
    .required(),
});

export const verify_update_order_status = Joi.object({
  service_name: Joi.string()
    .valid(
      Service.FOOD_API,
      Service.GROCERY_API,
      Service.PICKUP_DROP_API,
      Service.PHARMACY_API
    )
    .required(),
  delivery_order_id: Joi.string().required(),
  status: Joi.string().valid('ready').required(),
  delivery_service: Joi.string()
    .valid(DeliveryService.SHADOWFAX, DeliveryService.SPEEDYY_RIDER)
    .required(),
});

export const verify_cancel_delivery_admin = Joi.object({
  delivery_order_id: Joi.string().required(),
  reason: Joi.string().required(),
  delivery_service: Joi.string()
    .valid(DeliveryService.SHADOWFAX, DeliveryService.SPEEDYY_RIDER)
    .required(),
});
