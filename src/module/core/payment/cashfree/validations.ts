import Joi from 'joi';

import {
  CashFreePaymentEvent,
  CashfreePaymentStatus,
  CashFreeRefundEvents,
} from '../../payment/cashfree/enum';
import {RefundStatus} from '../../payment/enum';

export const refund_status_details = Joi.object({
  event_time: Joi.string(), //'2022-02-28T13:04:28+05:30'
  type: Joi.string().allow(CashFreeRefundEvents.REFUND_STATUS_WEBHOOK),
  data: Joi.object({
    refund: Joi.object({
      cf_refund_id: Joi.number(),
      cf_payment_id: Joi.number(),
      refund_id: Joi.string(), //'refund_sampleorder0413'
      order_id: Joi.string(), //'sampleorder0413'
      refund_amount: Joi.number(),
      refund_currency: Joi.string(),
      entity: Joi.string(), //'Refund'
      refund_type: Joi.string(), //'MERCHANT_INITIATED'
      refund_arn: Joi.string(), //'205907014017'
      refund_status: Joi.string().allow(
        RefundStatus.CANCELLED,
        RefundStatus.ONHOLD,
        RefundStatus.PENDING,
        RefundStatus.SUCCESS
      ), //'SUCCESS'
      status_description: Joi.string(), //'Refund processed successfully'
      created_at: Joi.string(), //'2022-02-28T12:54:25+05:30'
      processed_at: Joi.string(), //'2022-02-28T12:54:25+05:30'
      refund_charge: Joi.number(),
      refund_note: Joi.string(), //'Test'
      refund_splits: Joi.array().allow(null),
      metadata: Joi.any(),
      refund_mode: Joi.string().allow(null), //'STANDARD'
    }),
  }),
});

export const payment_status_details = Joi.object({
  event_time: Joi.string().required(), //'2022-02-28T13:04:28+05:30'
  type: Joi.string()
    .allow(
      CashFreePaymentEvent.PAYMENT_FAILED_WEBHOOK,
      CashFreePaymentEvent.PAYMENT_SUCCESS_WEBHOOK,
      CashFreePaymentEvent.PAYMENT_USER_DROPPED_WEBHOOK
    )
    .required(),
  data: Joi.object({
    order: Joi.object({
      order_id: Joi.string().required(),
      order_amount: Joi.number().required(),
      order_currency: Joi.string().required(),
      order_tags: Joi.any().allow(null),
    }).required(),
    payment: Joi.object({
      cf_payment_id: Joi.number().required(),
      payment_status: Joi.string().allow(
        CashfreePaymentStatus.FAILED,
        CashfreePaymentStatus.PENDING,
        CashfreePaymentStatus.SUCCESS,
        CashfreePaymentStatus.USER_DROPPED
      ),
      payment_amount: Joi.number().required(),
      payment_currency: Joi.string().required(),
      payment_message: Joi.string().allow(null),
      payment_time: Joi.string().required(),
      bank_reference: Joi.string().allow(null),
      auth_id: Joi.any().allow(null),
      payment_method: Joi.any(),
      payment_group: Joi.string(),
    }).required(),
    customer_details: Joi.object({
      customer_name: Joi.string().allow(null),
      customer_id: Joi.string(),
      customer_email: Joi.string().allow(null),
      customer_phone: Joi.string().allow(null),
    }),
    error_details: Joi.object({
      error_code: Joi.string().allow(null),
      error_description: Joi.string().allow(null),
      error_reason: Joi.string().allow(null),
      error_source: Joi.string().allow(null),
    }).allow(null),
    payment_gateway_details: Joi.object({
      gateway_name: Joi.string().allow(null),
      gateway_order_id: Joi.string().allow(null),
      gateway_payment_id: Joi.any().allow(null),
      gateway_status_code: Joi.any().allow(null),
    }).allow(null),
  }).required(),
});
