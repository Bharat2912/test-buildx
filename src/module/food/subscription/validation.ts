import Joi from 'joi';
import {
  duration_epoch,
  joi_restaurant_id,
  pagination,
  sort,
  verify_file,
} from '../../../utilities/joi_common';
import {
  PlanType,
  PlanIntervalType,
  PlanCategory,
  SubscriptionStatus,
  SubscriptionAuthStatus,
  SubscriptionCancelledBy,
  SubscriptionPartner,
  SubscriptionPaymentStatus,
} from './enum';

export const plan_id_string = Joi.string().required();
export const joi_subscription_id = Joi.string().max(200);

export const create_plan_details = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().valid(PlanType.PERIODIC, PlanType.FREE).required(),
  category: Joi.string()
    .valid(PlanCategory.BASIC, PlanCategory.ADVANCE, PlanCategory.PREMIUM)
    .required(),
  amount: Joi.number().required().when('type', {
    is: PlanType.FREE,
    then: Joi.forbidden(),
  }),
  max_cycles: Joi.number().when('type', {
    is: PlanType.FREE,
    then: Joi.forbidden(),
  }),
  interval_type: Joi.string()
    .valid(
      PlanIntervalType.MONTH,
      PlanIntervalType.YEAR,
      PlanIntervalType.DAY,
      PlanIntervalType.WEEK
    )
    .required(),
  // intervals: Joi.number().required().when('type', {
  //   is: PlanType.FREE,
  //   then: Joi.forbidden(),
  // }),
  description: Joi.string().required(),
  no_of_orders: Joi.number().min(1).required(),
  no_of_grace_period_orders: Joi.number().min(1).required(),
  terms_and_conditions: Joi.string().required().max(255),
  image: verify_file,
});

export const update_plan_details = Joi.object({
  id: plan_id_string,
  name: Joi.string(),
  category: Joi.string().valid(
    PlanCategory.BASIC,
    PlanCategory.ADVANCE,
    PlanCategory.PREMIUM
  ),
  description: Joi.string(),
  no_of_orders: Joi.number(),
  no_of_grace_period_orders: Joi.number(),
  terms_and_conditions: Joi.string().max(200),
  image: verify_file,
  active: Joi.boolean(),
});

export const create_subscription_as_admin_details = Joi.object({
  restaurant_id: joi_restaurant_id.required(),
  plan_id: plan_id_string,
  customer_name: Joi.string().required(),
  customer_email: Joi.string().required(),
  customer_phone: Joi.string().required(),
});

export const create_subscription_as_vendor_details = Joi.object({
  plan_id: plan_id_string,
  customer_name: Joi.string().required(),
  customer_email: Joi.string().required(),
  customer_phone: Joi.string().required(),
});

export const cancel_subscription_details = Joi.object({
  subscription_id: joi_subscription_id.required(),
  cancellation_reason: Joi.string().required(),
});

export const retry_subscription_payment_details = Joi.object({
  subscription_id: joi_restaurant_id.required(),
  next_payment_on: Joi.number(),
});

export const manual_subscription_activation_as_admin_details = Joi.object({
  subscription_id: joi_restaurant_id.required(),
  next_payment_on: Joi.number(),
});

export const plan_filter_admin_options = Joi.object({
  search_text: Joi.string().max(255),
  filter: Joi.object({
    plan_id: Joi.string(),
    type: Joi.array().items(
      Joi.string().valid(PlanType.PERIODIC, PlanType.FREE)
    ),
    category: Joi.array().items(
      Joi.string().valid(
        PlanCategory.BASIC,
        PlanCategory.ADVANCE,
        PlanCategory.PREMIUM
      )
    ),
    amount: Joi.number(),
    max_cycles: Joi.number(),
    interval_type: Joi.array().items(
      Joi.string().valid(
        PlanIntervalType.MONTH,
        PlanIntervalType.YEAR,
        PlanIntervalType.DAY,
        PlanIntervalType.WEEK
      )
    ),
    intervals: Joi.number(),
    no_of_orders: Joi.number(),
    active: Joi.boolean(),
    duration: duration_epoch,
  }),
  pagination: pagination,
  sort: Joi.array().items(sort),
});

export const plan_filter_vendor_options = Joi.object({
  search_text: Joi.string().max(255),
  filter: Joi.object({
    type: Joi.array().items(
      Joi.string().valid(PlanType.PERIODIC, PlanType.FREE)
    ),
    category: Joi.array().items(
      Joi.string().valid(
        PlanCategory.BASIC,
        PlanCategory.ADVANCE,
        PlanCategory.PREMIUM
      )
    ),
    amount: Joi.number(),
    max_cycles: Joi.number(),
    interval_type: Joi.array().items(
      Joi.string().valid(
        PlanIntervalType.MONTH,
        PlanIntervalType.YEAR,
        PlanIntervalType.DAY,
        PlanIntervalType.WEEK
      )
    ),
    intervals: Joi.number().default(1),
    no_of_orders: Joi.number(),
    duration: duration_epoch,
  }),
  pagination: pagination,
  sort: Joi.array().items(sort),
});

export const filter_subscriptions_as_admin = Joi.object({
  search_text: Joi.string().max(255),
  filter: Joi.object({
    subscription_id: joi_subscription_id,
    external_subscription_id: Joi.string().max(200),
    plan_id: Joi.string().max(200),
    restaurant_id: joi_restaurant_id,
    status: Joi.array().items(
      Joi.string().valid(
        SubscriptionStatus.PENDING,
        SubscriptionStatus.INITIALIZED,
        SubscriptionStatus.ON_HOLD,
        SubscriptionStatus.ACTIVE,
        SubscriptionStatus.BANK_APPROVAL_PENDING,
        SubscriptionStatus.CANCELLED,
        SubscriptionStatus.COMPLETED,
        SubscriptionStatus.FAILED_TO_CANCEL
      )
    ),
    include_grace_period_subscription: Joi.boolean().valid(true),
    mode: Joi.string(),
    authorization_status: Joi.array().items(
      Joi.string().valid(
        SubscriptionAuthStatus.PENDING,
        SubscriptionAuthStatus.FAILED,
        SubscriptionAuthStatus.AUTHORIZED
      )
    ),
    cancelled_by: Joi.array().items(
      Joi.string().valid(
        SubscriptionCancelledBy.ADMIN,
        SubscriptionCancelledBy.PARTNER,
        SubscriptionCancelledBy.SYSTEM,
        SubscriptionCancelledBy.VENDOR
      )
    ),
    partner: Joi.array().items(
      Joi.string().valid(SubscriptionPartner.CASHFREE)
    ),
    next_payment_on: Joi.number(),
    duration: duration_epoch,
  }),
  pagination: pagination,
  sort: Joi.array().items(sort),
});

export const filter_subscriptions_as_vendor = Joi.object({
  filter: Joi.object({
    subscription_id: joi_subscription_id,
    plan_id: Joi.string().max(200),
    status: Joi.array().items(
      Joi.string().valid(
        // SubscriptionStatus.PENDING,
        SubscriptionStatus.INITIALIZED,
        SubscriptionStatus.ON_HOLD,
        SubscriptionStatus.ACTIVE,
        SubscriptionStatus.BANK_APPROVAL_PENDING,
        SubscriptionStatus.CANCELLED,
        SubscriptionStatus.COMPLETED,
        SubscriptionStatus.FAILED_TO_CANCEL
      )
    ),
    include_grace_period_subscription: Joi.boolean().valid(true),
    mode: Joi.string(),
    authorization_status: Joi.array().items(
      Joi.string().valid(
        SubscriptionAuthStatus.PENDING,
        SubscriptionAuthStatus.FAILED,
        SubscriptionAuthStatus.AUTHORIZED
      )
    ),
  }),
  pagination: pagination,
  sort: Joi.array().items(sort),
});

export const filter_subscription_payment_as_admin = Joi.object({
  search_text: Joi.string().max(255),
  filter: Joi.object({
    restaurant_id: joi_restaurant_id,
    subscription_payment_id: Joi.number(),
    subscription_id: joi_subscription_id,
    external_payment_id: Joi.string().max(200),
    status: Joi.array().items(
      Joi.string().valid(
        SubscriptionPaymentStatus.PENDING,
        SubscriptionPaymentStatus.FAILED,
        SubscriptionPaymentStatus.SUCCESS
      )
    ),
    no_of_grace_period_orders_allotted: Joi.number(),
    no_of_orders_bought: Joi.number(),
    no_of_orders_consumed: Joi.number(),
    cycle: Joi.number(),
    amount: Joi.number(),
    retry_attempts: Joi.number(),
    currency: Joi.string(),
    duration: duration_epoch,
  }),
  pagination: pagination,
  sort: Joi.array().items(sort),
});

export const filter_subscription_payment_as_vendor = Joi.object({
  search_text: Joi.string().max(255),
  filter: Joi.object({
    subscription_payment_id: Joi.number(),
    subscription_id: joi_subscription_id,
    status: Joi.array().items(
      Joi.string().valid(
        SubscriptionPaymentStatus.PENDING,
        SubscriptionPaymentStatus.FAILED,
        SubscriptionPaymentStatus.SUCCESS
      )
    ),
    cycle: Joi.number(),
    duration: duration_epoch,
  }),
  pagination: pagination,
  sort: Joi.array().items(sort),
});
