import {
  DeliveryStatus,
  OrderAcceptanceStatus,
  OrderByColumn,
  OrderCancelledBy,
  OrderStatus,
  SortOrder,
} from './enums';
import {joi_restaurant_id} from '../../../utilities/joi_common';
import {RefundStatus} from '../../core/payment/enum';
import Joi from 'joi';
import * as joi from '../../../utilities/joi_common';
export const id = Joi.string()
  .guid({version: ['uuidv4', 'uuidv5']})
  .required();

export const numeric_id = Joi.number().required();

const sort = Joi.object({
  column: Joi.string()
    .valid(
      OrderByColumn.CREATED_AT,
      OrderByColumn.UPDATED_AT,
      OrderByColumn.VENDOR_ACCEPTED_TIME
    )
    .required(),
  order: Joi.string()
    .valid(SortOrder.ASCENDING, SortOrder.DESCENDING)
    .required(),
});

export const validate_place_order = Joi.object({
  user_id: id,
  is_pod: Joi.boolean().default(false),
});

export const validate_settle_refund_details = Joi.object({
  refund_settled_by: Joi.string().required(),
  refund_settled_admin_id: Joi.string().required(),
  refund_settled_vendor_payout_amount: Joi.number().required(),
  refund_settled_delivery_charges: Joi.number().required(),
  refund_settled_customer_amount: Joi.number().min(0).required(),
  refund_settlement_note_to_delivery_partner: Joi.string().required(),
  refund_settlement_note_to_vendor: Joi.string().required(),
  refund_settlement_note_to_customer: Joi.string().required(),
});

export const cancel_order_as_customer = Joi.object({
  order_id: Joi.number().required(),
  cancellation_reason: Joi.string().max(255),
});

export const cancel_order_as_admin_vendor = Joi.object({
  order_id: Joi.number().required(),
  cancellation_reason: Joi.string().required().max(255),
});

export const get_customer_orders = Joi.object({
  order_id: numeric_id,
  customer_id: id,
});

export const get_customer_orders_as_admin = Joi.object({
  order_id: numeric_id,
  admin_id: id,
});

export const get_vendor_orders = Joi.object({
  order_id: numeric_id,
  restaurant_id: joi_restaurant_id.required(),
});

export const confirm_payment = Joi.object({
  customer_id: id,
  payment_id: Joi.string().min(40).max(40).required(),
});
export const accept_order = Joi.object({
  id: numeric_id,
  accepted_vendor_id: id,
  accept: Joi.boolean().required(),
  preparation_time: Joi.number().when('accept', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
  reason: Joi.string().min(10).max(155).when('accept', {
    is: false,
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
});
export const paytm_statusAPI_success_response = Joi.object({
  resultInfo: {
    resultStatus: Joi.string().required(),
    resultCode: Joi.string().required(),
    resultMsg: Joi.string().required(),
  },
  txnId: Joi.string().required(),
  bankTxnId: Joi.string().required(),
  orderId: Joi.string().required(),
  txnAmount: Joi.string().required(),
  txnType: Joi.string().required(),
  gatewayName: Joi.string().required(),
  bankName: Joi.string().required(),
  mid: Joi.string().required(),
  paymentMode: Joi.string().required(),
  refundAmt: Joi.string().required(),
  txnDate: Joi.string().required(),
});

const pagination = Joi.object({
  page_index: Joi.number().required().min(0).integer(),
  page_size: Joi.number().required().min(1).max(50).integer(),
});

export const vendor_order_filter = Joi.object({
  search_text: Joi.string(),
  filter: Joi.object({
    restaurant_id: joi_restaurant_id.required(),
    order_status: Joi.array().items(
      Joi.string().valid(
        OrderStatus.PLACED,
        OrderStatus.CANCELLED,
        OrderStatus.COMPLETED
      )
    ),
    order_acceptance_status: Joi.array().items(
      Joi.string().valid(
        OrderAcceptanceStatus.PENDING,
        OrderAcceptanceStatus.ACCEPTED,
        OrderAcceptanceStatus.REJECTED
        // OrderAcceptanceStatus.READY,
        // OrderAcceptanceStatus.IGNORED
      )
    ),
    delivery_status: Joi.array().items(
      Joi.string().valid(
        DeliveryStatus.PENDING,
        DeliveryStatus.ACCEPTED,
        DeliveryStatus.REJECTED,
        DeliveryStatus.ALLOCATED,
        DeliveryStatus.ARRIVED,
        DeliveryStatus.DISPATCHED,
        DeliveryStatus.ARRIVED_CUSTOMER_DOORSTEP,
        DeliveryStatus.DELIVERED,
        DeliveryStatus.CANCELLED,
        DeliveryStatus.CANCELLED_BY_CUSTOMER,
        DeliveryStatus.RETURNED_TO_SELLER
      )
    ),
    duration: Joi.object({
      start_date: Joi.number().required(),
      end_date: Joi.number().required(),
    }),
    cancelled_by: Joi.array().items(
      Joi.string().valid(OrderCancelledBy.CUSTOMER, OrderCancelledBy.VENDOR)
    ),
  }),
  pagination: pagination,
  sort: Joi.array().items(sort),
});

export const admin_order_filter = Joi.object({
  search_text: Joi.string(),
  filter: Joi.object({
    restaurant_id: joi_restaurant_id,
    customer_id: Joi.array().items(
      Joi.string().guid({version: ['uuidv4', 'uuidv5']})
    ),
    order_status: Joi.array().items(
      Joi.string().valid(
        OrderStatus.PLACED,
        OrderStatus.CANCELLED,
        OrderStatus.COMPLETED,
        OrderStatus.PENDING
      )
    ),
    delivery_status: Joi.array().items(
      Joi.string().valid(
        DeliveryStatus.PENDING,
        DeliveryStatus.ACCEPTED,
        DeliveryStatus.REJECTED,
        DeliveryStatus.ALLOCATED,
        DeliveryStatus.ARRIVED,
        DeliveryStatus.DISPATCHED,
        DeliveryStatus.ARRIVED_CUSTOMER_DOORSTEP,
        DeliveryStatus.DELIVERED,
        DeliveryStatus.CANCELLED,
        DeliveryStatus.CANCELLED_BY_CUSTOMER,
        DeliveryStatus.RETURNED_TO_SELLER
      )
    ),
    order_acceptance_status: Joi.array().items(
      Joi.string().valid(
        OrderAcceptanceStatus.PENDING,
        OrderAcceptanceStatus.ACCEPTED,
        OrderAcceptanceStatus.REJECTED
        // OrderAcceptanceStatus.READY,
        // OrderAcceptanceStatus.IGNORED
      )
    ),
    refund_status: Joi.array().items(
      Joi.string().valid(
        RefundStatus.APPROVAL_PENDING,
        RefundStatus.CANCELLED,
        RefundStatus.ONHOLD,
        RefundStatus.PENDING,
        RefundStatus.SUCCESS
      )
    ),
    duration: Joi.object({
      start_date: Joi.number().required(),
      end_date: Joi.number().required(),
    }),
    cancelled_by: Joi.array().items(
      Joi.string().valid(
        OrderCancelledBy.DELIVERY,
        OrderCancelledBy.ADMIN,
        OrderCancelledBy.CUSTOMER,
        OrderCancelledBy.VENDOR
      )
    ),
    payout_transaction_id: Joi.array().items(
      Joi.string().guid({version: ['uuidv4', 'uuidv5']})
    ),
    payment_id: Joi.array().items(Joi.string()),
    customer_phone: Joi.array().items(joi.phone),
    customer_email: Joi.array().items(
      Joi.string().email({minDomainSegments: 2})
    ),
    in_csv: Joi.boolean(),
  }),
  pagination: pagination,
  sort: Joi.array().items(sort),
});

export const customer_order_filter = Joi.object({
  search_text: Joi.string().min(3),
  filter: Joi.object({
    customer_id: Joi.string().guid({version: ['uuidv4', 'uuidv5']}),
    order_status: Joi.array().items(
      Joi.string().valid(
        OrderStatus.PLACED,
        OrderStatus.CANCELLED,
        OrderStatus.COMPLETED,
        OrderStatus.PENDING
      )
    ),
    duration: Joi.object({
      start_date: Joi.number().required(),
      end_date: Joi.number().required(),
    }),
  }),
  pagination: pagination,
  sort: Joi.array().items(sort),
});

export const validate_rating = Joi.object({
  id: Joi.number().integer().required(),
  order_rating: Joi.number().integer().min(1).max(5), //! BACKWARD_COMPATIBLE
  vote_type: Joi.number().integer().valid(1, -1), //! ADD REQUIRED AFTER REMOVING order_rating
  comments: Joi.string(),
});

export const get_customer_order_by_id = Joi.object({
  order_id: numeric_id,
  customer_id: id,
});

export const paytm_statusAPI_pending_response = Joi.object({
  resultInfo: {
    resultStatus: Joi.string().required(),
    resultCode: Joi.string().required(),
    resultMsg: Joi.string().required(),
  },
  txnId: Joi.string().required(),
  orderId: Joi.string().required(),
  txnAmount: Joi.string().required(),
  txnType: Joi.string().required(),
  mid: Joi.string().required(),
  refundAmt: Joi.string().required(),
  txnDate: Joi.string().required(),
});

export const verify_cancellation_reason = Joi.object({
  user_type: Joi.string().valid('admin', 'vendor', 'customer'),
  cancellation_reason: Joi.string().trim().min(4).max(80).required(),
});

export const verify_update_cancellation_reason = Joi.object({
  id: numeric_id,
  user_type: Joi.string().valid('admin', 'vendor', 'customer'),
  cancellation_reason: Joi.string().trim().min(4).max(80).required(),
});
