import Joi from 'joi';
import {
  CashFreeSubscriptionAuthStatus,
  CashFreeSubscriptionEvents,
  CashFreeSubscriptionStatus,
} from './enums';

const subscription_status = Joi.string()
  .valid(
    CashFreeSubscriptionStatus.ACTIVE,
    CashFreeSubscriptionStatus.BANK_APPROVAL_PENDING,
    CashFreeSubscriptionStatus.CANCELLED,
    CashFreeSubscriptionStatus.COMPLETED,
    CashFreeSubscriptionStatus.INITIALIZED,
    CashFreeSubscriptionStatus.ON_HOLD
  )
  .required();

export const cf_event = Joi.string()
  .valid(
    CashFreeSubscriptionEvents.SUBSCRIPTION_AUTH_STATUS,
    CashFreeSubscriptionEvents.SUBSCRIPTION_NEW_PAYMENT,
    CashFreeSubscriptionEvents.SUBSCRIPTION_PAYMENT_DECLINED,
    CashFreeSubscriptionEvents.SUBSCRIPTION_STATUS_CHANGE
  )
  .required();
export const cf_subReferenceId = Joi.number().required();

export const subscription_status_change_details = Joi.object({
  cf_event: cf_event,
  cf_subReferenceId: cf_subReferenceId,
  cf_status: subscription_status,
  cf_lastStatus: subscription_status,
  cf_eventTime: Joi.string().required(),
  signature: Joi.string().required(),
});

export const subscription_new_payment_details = Joi.object({
  cf_event: cf_event,
  cf_subReferenceId: cf_subReferenceId,
  cf_eventTime: Joi.string().required(),
  cf_orderId: Joi.string(),
  cf_paymentId: Joi.number().required(),
  cf_amount: Joi.number().required(),
  cf_referenceId: Joi.number().required(),
  cf_retryAttempts: Joi.number(),
  signature: Joi.string().required(),
});

export const subscription_payment_declined_details = Joi.object({
  cf_event: cf_event,
  cf_subReferenceId: cf_subReferenceId,
  cf_eventTime: Joi.string().required(),
  cf_paymentId: Joi.number().required(),
  cf_amount: Joi.number().required(),
  cf_referenceId: Joi.number(),
  cf_retryAttempts: Joi.number().required(),
  cf_reasons: Joi.string().required(),
  signature: Joi.string().required(),
});

export const subscription_auth_status_details = Joi.object({
  cf_event: cf_event,
  cf_subReferenceId: cf_subReferenceId,
  cf_eventTime: Joi.string().required(),
  cf_subscriptionStatus: subscription_status,
  cf_authStatus: Joi.string()
    .valid(CashFreeSubscriptionAuthStatus.FAILED)
    .required(),
  cf_authTimestamp: Joi.string().required(),
  cf_authFailureReason: Joi.string().required(),
  signature: Joi.string().required(),
});
