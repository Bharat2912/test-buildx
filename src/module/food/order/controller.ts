import {Request, Response} from 'express';
import {getTransaction} from '../../../data/knex';
import handleErrors from '../../../utilities/controllers/handle_errors';
import {
  sendError,
  sendSuccess,
} from '../../../utilities/controllers/handle_response';
import logger from '../../../utilities/logger/winston_logger';
import ResponseError from '../../../utilities/response_error';
import {
  IChannelNotificationMessage,
  IPushNotificationsSQSMessage,
  IWebSocketSQSMessage,
  sendSQSMessage,
  SQS_URL,
} from '../../../utilities/sqs_manager';
import {getCartByUserID} from '../cart/models';
import {validateCart} from '../cart/service';
import {
  DeliveryStatus,
  OrderAcceptanceStatus,
  OrderCancelledBy,
  OrderStatus,
  PaymentStatus,
} from './enums';
import {
  updateOrder,
  readAdminOrdersWithFilter,
  readVendorOrdersWithFilter,
  readCustomerOrdersWithFilter,
  readCustomerOrders,
  readVendorOrders,
  readOrdersAsAdmin,
  readCustomerOrdersForUpdate,
  readOrdersAsAdminForUpdate,
  readVendorOrdersForUpdate,
  createCancellationReason,
  readCancellationReasonById,
  updateCancellationReason,
  deleteCancellationReasonById,
  readAllCancellationReason,
  readCancellationReasonWithUserType,
  getPaymentDetails,
  getPaymentOrderTableDetailsForUpdate,
  readOneViewOrder,
} from './models';
import {
  confirm_payment,
  admin_order_filter,
  vendor_order_filter,
  customer_order_filter,
  get_customer_orders,
  get_vendor_orders,
  cancel_order_as_customer,
  get_customer_orders_as_admin,
  accept_order,
  validate_rating,
  numeric_id,
  validate_settle_refund_details,
  cancel_order_as_admin_vendor,
  verify_cancellation_reason,
  verify_update_cancellation_reason,
  validate_place_order,
} from './validations';
import {
  confirmPaymentFromPaymentService,
  formatOrderResponse,
  createOrder,
  placeDeliveryOrder,
  updateOrderDetailsWithDynamicValues,
  updateVendorOrderDetailsWithDynamicValues,
  placeOrderToVendor,
  settleRefund,
  createOrderInvoicePdf,
  createPdfAndSaveToS3,
  createOrderSummaryPdf,
  createOrderV1_1,
} from './service';
import {
  IAdminFilterOrders,
  ICancelOrder,
  IConfirmPayment,
  ICustomerFilterOrders,
  IGetCustomerOrders,
  IGetCustomerOrdersAsAdmin,
  IGetVendorOrders,
  IOrder,
  IOrderDetails,
  IPayment,
  IPaymentOrderDetails,
  IVendorFilterOrders,
  IVendorOrderDetails,
} from './types';
import {
  IRestaurant_Basic,
  incrementRestaurantVoteCount,
  readRestaurantById,
} from '../restaurant/models';
import {
  generateDownloadFileURL,
  checkFileExistenceInS3,
  getS3DownloadSignedUrl,
} from '../../../utilities/s3_manager';
import {
  getAdminDetailsById,
  getVendorDetailsById,
  getCustomerDetailsWithFilter,
  getRestaurantVendors,
} from '../../../utilities/user_api';
import {strToCsvRow} from '../../../utilities/utilFuncs';
import {RefundStatus} from '../../core/payment/enum';
import {IRefundSettlementDetails} from './invoice';
import {cancelDelivery, updateOrderStatus} from '../../../internal/delivery';
import moment from 'moment';
import Globals from '../../../utilities/global_var/globals';
import {cancelPetpoojaOrderStatus} from '../petpooja/external_call';
import {Knex} from 'knex';
import {validatePosPartnerAccess} from '../service';
import Joi from 'joi';
import {formatTime} from '../../../utilities/date_time';
import {AdminRole, UserType} from '../../../enum';
import {IDeliveryOrderStatusCBRequest} from '../../core/callback/delivery/types';
/**
 * customer API to place order
 * @returns order details
 */
export async function initPaymentPlaceOrder(req: Request, res: Response) {
  try {
    req.body.user_id = req.user.id;
    const validation = validate_place_order.validate(req.body);
    if (validation.error)
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 1000,
        },
      ]);
    const validated_req = validation.value;
    const is_pod: boolean = validated_req.is_pod;
    //get cart from dynamoDB
    const dynamoDB_response = await getCartByUserID({
      customer_id: validated_req.user_id,
    });
    if (Object.keys(dynamoDB_response).length === 0) {
      logger.error(
        `USER ID: ${validated_req.user_id} tried to place order when cart is empty`
      );
      return sendError(res, 400, [
        {
          message: 'failed to place order cart is empty',
          code: 1045,
        },
      ]);
    }
    const authorizationToken = req.headers['authorization'];
    const {populated_cart, cart_meta_errors} = await validateCart(
      dynamoDB_response,
      authorizationToken,
      is_pod
    );
    if (!populated_cart.cart_status && cart_meta_errors) {
      logger.error(
        `USER ID: ${validated_req.user_id} tried to place order when cart is invalid`
      );
      return sendError(res, 400, [
        {
          message: 'invalid_cart',
          code: 1044,
        },
      ]);
    }
    if (is_pod && !populated_cart.pod_allowed) {
      return sendError(
        res,
        400,
        'POD Not allowed: ' + populated_cart.pod_not_allowed_reason
      );
    }
    populated_cart.is_pod = is_pod;
    const trx = await getTransaction();
    try {
      const {order_details} = await createOrder(
        trx,
        populated_cart,
        authorizationToken!
      );
      if (populated_cart.is_pod) {
        const payment_and_order_details = <IPaymentOrderDetails>{
          order_id: order_details.order_id,
          order_status: order_details.order_status,
          coupon_id: order_details.coupon_id,
          customer_id: validated_req.user_id,
          invoice_breakout: populated_cart.invoice_breakout,
        };
        const order_place_response = await placeOrderToVendor(
          trx,
          payment_and_order_details
        );
        await trx.commit();
        return sendSuccess(res, 200, {
          ...order_details,
          order_cancellation_duration:
            order_place_response.order_cancellation_duration,
        });
      }
      await trx.commit();
      logger.debug(`Order ID:${order_details.order_id} created`);
      return sendSuccess(res, 200, order_details);
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    logger.error('FAILED WHILE PLACING ORDER: ', error);
    return handleErrors(res, error);
  }
}

export async function initPaymentPlaceOrderV1_1(req: Request, res: Response) {
  try {
    req.body.user_id = req.user.id;
    const validation = validate_place_order.validate(req.body);
    if (validation.error)
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 1000,
        },
      ]);
    const validated_req = validation.value;
    const is_pod: boolean = validated_req.is_pod;
    //get cart from dynamoDB
    const dynamoDB_response = await getCartByUserID({
      customer_id: validated_req.user_id,
    });
    if (Object.keys(dynamoDB_response).length === 0) {
      logger.error(
        `USER ID: ${validated_req.user_id} tried to place order when cart is empty`
      );
      return sendError(res, 400, [
        {
          message: 'failed to place order cart is empty',
          code: 1045,
        },
      ]);
    }
    const authorizationToken = req.headers['authorization'];
    const {populated_cart, cart_meta_errors} = await validateCart(
      dynamoDB_response,
      authorizationToken,
      is_pod
    );
    if (!populated_cart.cart_status && cart_meta_errors) {
      logger.error(
        `USER ID: ${validated_req.user_id} tried to place order when cart is invalid`
      );
      return sendError(res, 400, [
        {
          message: 'invalid_cart',
          code: 1044,
        },
      ]);
    }
    if (is_pod && !populated_cart.pod_allowed) {
      return sendError(
        res,
        400,
        'POD Not allowed: ' + populated_cart.pod_not_allowed_reason
      );
    }
    populated_cart.is_pod = is_pod;
    const trx = await getTransaction();
    try {
      const {order_details} = await createOrderV1_1(
        trx,
        populated_cart,
        authorizationToken!
      );
      if (populated_cart.is_pod) {
        const payment_and_order_details = <IPaymentOrderDetails>{
          order_id: order_details.order_id,
          order_status: order_details.order_status,
          coupon_id: order_details.coupon_id,
          customer_id: validated_req.user_id,
          invoice_breakout: populated_cart.invoice_breakout,
        };
        const order_place_response = await placeOrderToVendor(
          trx,
          payment_and_order_details
        );
        await trx.commit();
        return sendSuccess(res, 200, {
          ...order_details,
          order_cancellation_duration:
            order_place_response.order_cancellation_duration,
        });
      }
      await trx.commit();
      logger.debug(`Order ID:${order_details.order_id} created`);
      return sendSuccess(res, 200, order_details);
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    logger.error('FAILED WHILE PLACING ORDER v2: ', error);
    return handleErrors(res, error);
  }
}

export async function vendorOrderReady(req: Request, res: Response) {
  try {
    const order_id = +req.params.order_id;
    const order_details = (
      await readVendorOrders(
        [order_id],
        req.user.data.restaurant_id!,
        req.user.data.child_restaurant_ids
      )
    )[0];
    if (
      !order_details
      // || order_details.restaurant_id !== req.user.data.restaurant_id
    ) {
      return sendError(res, 404, [
        {
          message: 'order_not_found',
          code: 1033,
        },
      ]);
    }

    validatePosPartnerAccess(order_details.pos_partner);

    if (order_details.order_status !== OrderStatus.PLACED) {
      return sendError(res, 400, [
        {
          message: 'order_status_not_placed',
          code: 1041,
        },
      ]);
    }

    if (
      order_details.order_acceptance_status !== OrderAcceptanceStatus.ACCEPTED
    ) {
      return sendError(res, 400, [
        {
          message: 'order_acceptance_status_not_accepted',
          code: 1042,
        },
      ]);
    }
    if (order_details.vendor_ready_marked_time) {
      return sendError(res, 400, [
        {
          message: 'order_already_marked_ready',
          code: 1043,
        },
      ]);
    }
    const trx = await getTransaction();
    try {
      const updatedOrder = await actionVendorOrderReady(trx, order_details);
      await trx.commit();
      await updateOrderStatus({
        delivery_order_id: order_details.delivery_order_id + '',
        delivery_service: order_details.delivery_service!,
        status: 'ready',
      });
      return sendSuccess(res, 200, updatedOrder);
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    logger.error('FAILED TO MARK ORDER READY', error);
    return handleErrors(res, error);
  }
}
export async function actionVendorOrderReady(
  trx: Knex.Transaction,
  order_details: IVendorOrderDetails
) {
  const updatedOrder = await updateOrder(trx, {
    id: order_details.order_id,
    vendor_ready_marked_time: new Date(),
    // order_acceptance_status: OrderAcceptanceStatus.READY,
  });
  const push_payload: {
    order_id: number;
    order_acceptance_status: string;
    outlet_id: string | undefined;
    outlet_name: string | undefined;
    outlet_image?: string | null;
  } = {
    order_id: order_details.order_id,
    order_acceptance_status: 'ready',
    outlet_id: order_details.restaurant_id,
    outlet_name: order_details.restaurant_details!.restaurant_name,
  };
  const ws_payload: {
    order_id: number;
    order_acceptance_status: string;
    restaurant_id: string | undefined;
    restaurant_name: string | undefined;
    restaurant_image?: string | null;
  } = {
    order_id: order_details.order_id,
    order_acceptance_status: 'ready',
    restaurant_id: order_details.restaurant_id,
    restaurant_name: order_details.restaurant_details!.restaurant_name,
  };
  if (
    order_details.restaurant_details &&
    order_details.restaurant_details.image
  ) {
    push_payload.outlet_image = (
      await generateDownloadFileURL(order_details.restaurant_details.image)
    ).url;

    ws_payload.restaurant_image = (
      await generateDownloadFileURL(order_details.restaurant_details.image)
    ).url;
  }

  const ws_msg: IWebSocketSQSMessage = {
    event: 'WS',
    action: 'VENDOR_ORDER_READY',
    data: {
      to_room_id: order_details.customer_id,
      ws_payload,
    },
  };

  const push_msg: IPushNotificationsSQSMessage = {
    event: 'PUSH_NOTIFICATIONS',
    action: 'SINGLE',
    data: {
      templateID: 'VENDOR_ORDER_READY_TEMPLATE',
      templateData: push_payload,
      userID: order_details.customer_id!,
      userType: UserType.CUSTOMER,
    },
  };
  const channel_msg: IChannelNotificationMessage = {
    event: 'CHANNELS',
    action: 2,
    data: [ws_msg, push_msg],
  };
  await sendSQSMessage(SQS_URL.NOTIFICATIONS, channel_msg);
  return updatedOrder;
}

export async function vendorOrderAccept(req: Request, res: Response) {
  try {
    const order_id = +req.params.order_id;
    const validation = accept_order.validate({
      accepted_vendor_id: req.user.id,
      id: order_id,
      ...req.body,
    });
    if (validation.error)
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 1000,
        },
      ]);

    const reason = validation.value.reason;
    delete validation.value.reason;
    const accept = validation.value.accept;
    delete validation.value.accept;
    const order_req = validation.value as IOrder;
    const order_details = (
      await readVendorOrders(
        [order_id],
        req.user.data.restaurant_id!,
        req.user.data.child_restaurant_ids
      )
    )[0];
    if (
      !order_details
      // ||order_details.restaurant_id !== req.user.data.restaurant_id
    ) {
      return sendError(res, 404, [
        {
          message: 'order_not_found',
          code: 1033,
        },
      ]);
    }

    validatePosPartnerAccess(order_details.pos_partner);

    if (order_details.order_status !== OrderStatus.PLACED) {
      return sendError(res, 400, [
        {
          message: 'order_status_not_placed',
          code: 1041,
        },
      ]);
    }
    if (
      order_details.order_acceptance_status !== OrderAcceptanceStatus.PENDING
    ) {
      return sendError(res, 400, [
        {
          message: 'order_acceptance_status_not_pending',
          code: 1035,
        },
      ]);
    }
    const restaurant_details = await readRestaurantById(
      req.user.data.restaurant_id!
    );
    const trx = await getTransaction();
    try {
      const updatedOrder = await actionVendorOrderAccept(
        trx,
        restaurant_details,
        order_details,
        accept,
        order_req.accepted_vendor_id!,
        order_req.preparation_time,
        reason
      );
      await trx.commit();
      return sendSuccess(res, 200, updatedOrder);
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    logger.error('FAILED TO ACCEPT ORDER', error);
    return handleErrors(res, error);
  }
}
export async function actionVendorOrderAccept(
  trx: Knex.Transaction,
  restaurant_details: IRestaurant_Basic,
  order_details: IVendorOrderDetails,
  accept: boolean,
  vendor_id: string,
  prep_time?: number,
  reason?: string
) {
  let order_req: IOrder = {
    id: order_details.order_id,
    accepted_vendor_id: vendor_id,
    preparation_time: Math.round(prep_time || 0),
    delivery_details: order_details.delivery_details,
  };
  const payment = await getPaymentDetails(
    order_details.payment_id!,
    order_details.customer_id!
  );
  const push_payload: {
    order_id: number;
    order_acceptance_status: string;
    outlet_id: string | undefined;
    outlet_name: string | undefined;
    outlet_image?: string | null;
  } = {
    order_id: order_details.order_id,
    order_acceptance_status: 'accepted',
    outlet_id: order_details.restaurant_id,
    outlet_name: order_details.restaurant_details!.restaurant_name,
  };

  const ws_payload: {
    order_id: number;
    order_acceptance_status: string;
    restaurant_id: string | undefined;
    restaurant_name: string | undefined;
    restaurant_image?: string | null;
    cancelled_by?: OrderCancelledBy.DELIVERY | 'Delivery Executive';
    cancellation_details?: {
      cancellation_reason: string;
    };
    cancellation_time?: Date;
  } = {
    order_id: order_details.order_id,
    order_acceptance_status: 'accepted',
    restaurant_id: order_details.restaurant_id,
    restaurant_name: order_details.restaurant_details!.restaurant_name,
  };
  if (
    order_details.restaurant_details &&
    order_details.restaurant_details.image
  ) {
    push_payload.outlet_image = (
      await generateDownloadFileURL(order_details.restaurant_details.image)
    ).url;
    ws_payload.restaurant_image = (
      await generateDownloadFileURL(order_details.restaurant_details.image)
    ).url;
  }
  const ws_msg: IWebSocketSQSMessage = {
    event: 'WS',
    action: 'VENDOR_ORDER_ACCEPTED',
    data: {
      to_room_id: order_details.customer_id,
    },
  };

  const push_msg: IPushNotificationsSQSMessage = {
    event: 'PUSH_NOTIFICATIONS',
    action: 'SINGLE',
    data: {
      templateID: 'VENDOR_ORDER_ACCEPT_TEMPLATE',
      templateData: push_payload,
      userID: order_details.customer_id!,
      userType: UserType.CUSTOMER,
    },
  };

  order_req.vendor_accepted_time = new Date();
  order_req.invoice_breakout = order_details.invoice_breakout;
  order_req.additional_details = JSON.parse(
    JSON.stringify(order_details.additional_details || {})
  );

  order_req.id = order_details.order_id!;
  order_req.customer_id = order_details.customer_id!;

  if (accept) {
    order_req.order_acceptance_status = OrderAcceptanceStatus.ACCEPTED;
    const delivery_result = await placeDeliveryOrder(
      order_details,
      restaurant_details
    );
    let pickup_eta = order_req.pickup_eta || 0;
    if (pickup_eta < order_req.preparation_time!)
      pickup_eta = order_req.preparation_time!;
    order_req.delivery_service = delivery_result.delivery_service;
    if (delivery_result && delivery_result.status === 'success') {
      order_req.invoice_breakout!.delivery_order_id =
        delivery_result.delivery_order_id;
      order_req.delivery_order_id = delivery_result.delivery_order_id;
      order_req.drop_eta = delivery_result.drop_eta;
      order_req.pickup_eta = pickup_eta;
      order_req.delivery_service = delivery_result.delivery_service;
      order_req.delivery_status = DeliveryStatus.ACCEPTED;

      if (!order_req.delivery_details)
        order_req.delivery_details = {} as IDeliveryOrderStatusCBRequest;
      order_req.delivery_details!.delivery_order_id =
        order_req.delivery_order_id;
      order_req.delivery_details!.drop_eta = delivery_result.drop_eta;
      order_req.delivery_details!.pickup_eta = delivery_result.pickup_eta;
      order_req.delivery_details!.delivery_service = order_req.delivery_service;
      order_req.delivery_details!.delivery_status = order_req.delivery_status;
      order_req.delivery_details!.eta_when_vendor_accepted = {
        epoch: new Date().getTime(),
        preparation_time: prep_time || 0,
        rider_to_vendor_eta: delivery_result.pickup_eta,
        rider_from_vendor_to_customer_eta: delivery_result.drop_eta,
      };
      ws_msg.action = 'VENDOR_ORDER_ACCEPTED';
    } else {
      // Order is rejected by delivery
      order_req.delivery_status = DeliveryStatus.REJECTED;
      order_req.order_status = OrderStatus.CANCELLED;
      order_req.cancelled_by = OrderCancelledBy.DELIVERY;
      order_req.cancellation_details = {
        cancellation_reason: delivery_result.reason,
      };
      order_req.cancellation_time = new Date();
      order_req.cancellation_user_id = order_req.accepted_vendor_id;

      ws_msg.action = 'ORDER_CANCELLED';
      ws_payload.cancelled_by = 'Delivery Executive';
      ws_payload.cancellation_details = {
        cancellation_reason: delivery_result.reason,
      };
      ws_payload.cancellation_time = new Date();

      push_payload.order_acceptance_status = 'failed';
      ws_payload.order_acceptance_status = 'failed';

      const refund_settlement_details: IRefundSettlementDetails = {
        refund_settled_by: 'system',
        refund_settlement_note_to_delivery_partner:
          'no delivery charges will be applicable since order has been cancelled by delivery partner',
        refund_settlement_note_to_vendor:
          'vendor payout will be not applicable on this order because order has been cancelled at the same time vendor accepted the order',
        refund_settlement_note_to_customer:
          'customer paid amount will be refunded, because order has been cancelled by delivery partner',
        refund_settled_customer_amount:
          order_req.invoice_breakout!.total_customer_payable!,
        refund_settled_delivery_charges: 0,
        refund_settled_vendor_payout_amount: 0,
      };

      if (order_details.is_pod) {
        refund_settlement_details.refund_settlement_note_to_customer =
          'no refund will be done to customer as order is pod.';
        refund_settlement_details.refund_settled_customer_amount = 0;
      }
      await cancelPetpoojaOrderStatus(
        order_details.restaurant_id!,
        order_details.order_id + '',
        delivery_result.reason
      );
      order_req = await settleRefund(
        refund_settlement_details,
        order_req,
        payment
      );
    }
  } else {
    // Order is rejected by vendor
    order_req.order_acceptance_status = OrderAcceptanceStatus.REJECTED;
    order_req.order_status = OrderStatus.CANCELLED;
    order_req.cancelled_by = OrderCancelledBy.VENDOR;
    order_req.cancellation_details = {
      cancellation_reason: reason,
    };
    order_req.cancellation_time = new Date();
    order_req.cancellation_user_id = order_req.accepted_vendor_id;
    ws_msg.action = 'VENDOR_ORDER_REJECTED';
    push_payload.order_acceptance_status = OrderAcceptanceStatus.REJECTED;
    ws_payload.order_acceptance_status = OrderAcceptanceStatus.REJECTED;

    const refund_settlement_details: IRefundSettlementDetails = {
      refund_settled_by: 'system',
      refund_settlement_note_to_delivery_partner:
        'No delivery charges will be applicable since order has not yet been placed with the delivery partner',
      refund_settlement_note_to_vendor:
        'vendor payout will be not applicable on this order because order has been cancelled by vendor',
      refund_settlement_note_to_customer:
        'customer paid amount will be refunded, because order has been cancelled by vendor',
      refund_settled_customer_amount:
        order_req.invoice_breakout!.total_customer_payable!,
      refund_settled_delivery_charges: 0,
      refund_settled_vendor_payout_amount: 0,
    };
    if (order_details.is_pod) {
      refund_settlement_details.refund_settlement_note_to_customer =
        'no refund will be done to customer as order is pod.';
      refund_settlement_details.refund_settled_customer_amount = 0;
    }
    order_req = await settleRefund(
      refund_settlement_details,
      order_req,
      payment
    );
  }
  order_req.pickup_eta = Math.round(
    order_details.customer_address?.delivery_details?.pickup_eta || 0
  );
  if ((order_req.preparation_time || 0) > order_req.pickup_eta) {
    order_req.pickup_eta = Math.round(order_req.preparation_time || 0);
  }
  const updatedOrder = await updateOrder(trx, order_req);
  ws_msg.data.payload = ws_payload;
  ws_msg.data.templateData = ws_payload;
  const channel_msg: IChannelNotificationMessage = {
    event: 'CHANNELS',
    action: 2,
    data: [ws_msg, push_msg],
  };
  await sendSQSMessage(SQS_URL.NOTIFICATIONS, channel_msg);
  return updatedOrder;
}

/**
 * post payment confirmation controller confirm payment and processed to order fulfillment
 */
export async function postPaymentPlaceOrder(req: Request, res: Response) {
  try {
    const validation = confirm_payment.validate({
      customer_id: req.user.id,
      payment_id: req.params.payment_id,
    });
    if (validation.error)
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 1000,
        },
      ]);
    const validated_req = validation.value as IConfirmPayment;

    const trx = await getTransaction();
    try {
      //get order details from db
      const payment_and_order_details =
        await getPaymentOrderTableDetailsForUpdate(
          trx,
          validated_req.payment_id,
          validated_req.customer_id
        );

      if (!payment_and_order_details) {
        throw new ResponseError(400, [
          {
            message: 'invalid payment id',
            code: 1046,
          },
        ]);
      }
      // If order is pod cannot process post payment palce order
      if (payment_and_order_details.is_pod) {
        throw new ResponseError(400, [
          {
            message: 'No confirm payment for pod order',
            code: 2015,
          },
        ]);
      }
      const order_cancellation_duration =
        await Globals.ORDER_CANCELLATION_DURATION_IN_SECONDS.get();
      if (
        payment_and_order_details.payment_status === PaymentStatus.COMPLETED
      ) {
        await trx.commit();
        return sendSuccess(res, 200, {
          message: 'TRANSACTION_COMPLETED',
          order_cancellation_duration: {
            start_time: Math.ceil(
              new Date(payment_and_order_details.order_placed_time!).getTime() /
                1000
            ),
            end_time:
              Math.ceil(
                new Date(
                  payment_and_order_details.order_placed_time!
                ).getTime() / 1000
              ) + order_cancellation_duration,
          },
        });
      }

      if (payment_and_order_details.payment_status === PaymentStatus.FAILED) {
        throw new ResponseError(400, [
          {
            message: 'order payment failed',
            code: 1047,
          },
        ]);
      }

      const updated_payment_record = await confirmPaymentFromPaymentService(
        trx,
        payment_and_order_details.id,
        payment_and_order_details.additional_details
      );

      /**
       * !If payment is completed but order is cancelled in between of payment confirmation
       * !then update successful payment details in payment table
       */
      if (payment_and_order_details.invoice_breakout) {
        payment_and_order_details.invoice_breakout.payment_transaction_id =
          updated_payment_record.transaction_id;
      }
      const order_place_response = await placeOrderToVendor(
        trx,
        payment_and_order_details
      );
      await trx.commit();
      return sendSuccess(res, 200, {
        message: 'TRANSACTION_COMPLETED',
        order_cancellation_duration:
          order_place_response.order_cancellation_duration,
      });
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    logger.error('FAILED WHILE CONFIRMING PAYMENT', error);
    return handleErrors(res, error);
  }
}

//cancel order as customer
export async function cancelCustomerOrderByOrderId(
  req: Request,
  res: Response
) {
  try {
    const validation = cancel_order_as_customer.validate({
      order_id: req.params.order_id,
      cancellation_reason: req.body.cancellation_reason,
    });
    if (validation.error)
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 1000,
        },
      ]);

    const validated_req = validation.value as ICancelOrder;
    const trx = await getTransaction();
    try {
      const order: IOrderDetails = (
        await readCustomerOrdersForUpdate(
          trx,
          [validated_req.order_id],
          req.user.id
        )
      )[0];

      if (!order) {
        throw new ResponseError(400, [
          {
            message: 'invalid order id',
            code: 1036,
          },
        ]);
      }
      if (order.order_status === OrderStatus.CANCELLED) {
        throw new ResponseError(400, [
          {
            message: 'order already cancelled',
            code: 1037,
          },
        ]);
      }
      if (order.order_status === OrderStatus.COMPLETED) {
        throw new ResponseError(400, [
          {
            message: 'order already completed',
            code: 1038,
          },
        ]);
      }

      // order can be calcelled by customer if it is pod and payment not completed
      const completed_payment_details = order.payment_details.find(
        (payment: IPayment) =>
          payment.is_pod || payment.payment_status === PaymentStatus.COMPLETED
      );
      if (!completed_payment_details) {
        throw new ResponseError(400, [
          {
            message: 'order payment not completed',
            code: 1039,
          },
        ]);
      }

      const delay = await Globals.ORDER_CANCELLATION_DELAY_IN_SECONDS.get();
      //check if order is cancelled under free limit or not
      const order_cancellation_refund_duration =
        await Globals.ORDER_CANCELLATION_DURATION_IN_SECONDS.get();
      const cancellation_refund_end_time = moment(order.order_placed_time!).add(
        order_cancellation_refund_duration + delay,
        's'
      );
      const current_time = moment();

      if (
        current_time > cancellation_refund_end_time &&
        !validated_req.cancellation_reason
      ) {
        throw new ResponseError(400, [
          {
            message:
              'cancellation reason is required if order is cancelled after free cancellation limit',
            code: 1099,
          },
        ]);
      }

      //update order table
      let order_updated_values: IOrder = {
        id: validated_req.order_id,
        order_status: OrderStatus.CANCELLED,
        cancelled_by: req.user.user_type,
        cancellation_details: {
          cancellation_reason: validated_req.cancellation_reason,
        },
        cancellation_user_id: req.user.id,
        cancellation_time: new Date(),
        invoice_breakout: order.invoice_breakout,
        additional_details: JSON.parse(
          JSON.stringify(order.additional_details || {})
        ),
      };

      //cancel delivery of order if delivery of active
      if (order.delivery_status !== DeliveryStatus.PENDING) {
        const delivery_cancellation_result = await cancelDelivery({
          delivery_service: order.delivery_service!,
          delivery_order_id: order.delivery_order_id!,
          reason:
            'Customer cancelled the order with reason: ' +
              validated_req.cancellation_reason || '',
          user: 'Customer',
        });
        if (!delivery_cancellation_result.cancelled) {
          logger.error(
            'delivery cancellation failed while customer cancel order',
            delivery_cancellation_result
          );
          order_updated_values.delivery_status =
            DeliveryStatus.FAILED_TO_CANCEL;
          order_updated_values.additional_details!.order_delivery_cancellation_details =
            {
              delivery_cancellation_failure_reason:
                delivery_cancellation_result.reason,
            };
        } else {
          order_updated_values.delivery_status = DeliveryStatus.CANCELLED;
          logger.debug(
            'order delivery successfully cancelled',
            delivery_cancellation_result
          );
        }
      }
      //refund settelment
      if (current_time > cancellation_refund_end_time) {
        if (
          completed_payment_details.is_pod &&
          order.order_acceptance_status === OrderAcceptanceStatus.PENDING
        ) {
          const refund_settlement_details: IRefundSettlementDetails = {
            refund_settled_by: 'system',
            refund_settlement_note_to_delivery_partner:
              'No delivery charges will be applicable since order has not yet been placed with the delivery partner',
            refund_settlement_note_to_vendor:
              'Vendor payout will be not applicable on this order because vendor has not accepted the order yet',
            refund_settlement_note_to_customer:
              'Customer will not get any refund as this is a pay on delivery order',
            refund_settled_customer_amount: 0,
            refund_settled_delivery_charges: 0,
            refund_settled_vendor_payout_amount: 0,
          };
          const payment = JSON.parse(JSON.stringify(order.payment_details[0]));
          payment.id = payment.payment_id;
          delete payment.payment_id;
          order_updated_values = await settleRefund(
            refund_settlement_details,
            order_updated_values,
            payment
          );
        } else {
          order_updated_values.refund_status = RefundStatus.APPROVAL_PENDING;
        }
      } else {
        const refund_settlement_details: IRefundSettlementDetails = {
          refund_settled_by: 'system',
          refund_settlement_note_to_delivery_partner:
            'No delivery charges will be applicable since order has not yet been placed with the delivery partner',
          refund_settlement_note_to_vendor:
            'vendor payout will be not applicable on this order because order has not yet placed at vendor',
          refund_settlement_note_to_customer:
            'customer paid amount will be refunded, because order has been cancelled by customer under free cancellation criteria',
          refund_settled_customer_amount:
            order.invoice_breakout!.total_customer_payable!,
          refund_settled_delivery_charges: 0,
          refund_settled_vendor_payout_amount: 0,
        };
        const payment = JSON.parse(JSON.stringify(order.payment_details[0]));
        payment.id = payment.payment_id;
        delete payment.payment_id;

        if (payment.is_pod) {
          refund_settlement_details.refund_settlement_note_to_customer =
            'no refund will be done to customer as order is pod.';
          refund_settlement_details.refund_settled_customer_amount = 0;
        }

        order_updated_values = await settleRefund(
          refund_settlement_details,
          order_updated_values,
          payment
        );
      }

      if (
        JSON.stringify(order_updated_values.additional_details) ===
        JSON.stringify(order.additional_details)
      ) {
        delete order_updated_values.additional_details;
      }
      const updated_order = await updateOrder(trx, order_updated_values);

      //websocket and push notification payloads
      const msg_payload = {
        order_id: updated_order.id,
        order_status: updated_order.order_status,
        order_acceptance_status: updated_order.order_acceptance_status,
        delivery_status: updated_order.delivery_status,
        pickup_eta: updated_order.pickup_eta,
        drop_eta: updated_order.drop_eta,
        cancelled_by: updated_order.cancelled_by,
        cancellation_details: updated_order.cancellation_details,
        cancellation_time: updated_order.cancellation_time,
        refund_status: updated_order.refund_status,
      };
      const push_msg: IPushNotificationsSQSMessage = {
        event: 'PUSH_NOTIFICATIONS',
        action: 'SINGLE',
        data: {
          templateID: 'ORDER_CANCELLED_TEMPLATE',
          templateData: msg_payload,
          userID: order.customer_id!,
          userType: UserType.CUSTOMER,
        },
      };

      const ws_msg: IWebSocketSQSMessage = {
        event: 'WS',
        action: 'ORDER_CANCELLED',
        data: {
          to_room_ids: [order.restaurant_id],
          payload: msg_payload,
        },
      };
      const vendors = await getRestaurantVendors(order.restaurant_id!);
      const vendor_ids = vendors.map(vendor => {
        return vendor.id;
      });
      const push_msg_vendor: IPushNotificationsSQSMessage = {
        event: 'PUSH_NOTIFICATIONS',
        action: 'BULK',
        data: {
          templateID: 'ORDER_CANCELLED_TEMPLATE',
          templateData: msg_payload,
          userID: vendor_ids,
          userType: UserType.VENDOR,
        },
      };
      if (order.restaurant_details?.parent_id) {
        ws_msg.data.to_room_ids.push(order.restaurant_details?.parent_id);
        const parent_vendors = await getRestaurantVendors(
          order.restaurant_details?.parent_id
        );
        const parent_vendor_ids = parent_vendors.map(vendor => {
          return vendor.id;
        });
        push_msg_vendor.data.userID.push(...parent_vendor_ids);
      }
      const order_cancelled_notification_sound =
        await Globals.ORDER_COMPLETE_NOTIFICATION_SOUND.get();
      const push_msg_admin: IPushNotificationsSQSMessage = {
        event: 'PUSH_NOTIFICATIONS',
        action: 'TOPIC',
        data: {
          templateID: 'ADMIN_ORDER_CANCELLED_TEMPLATE',
          templateData: {
            ...msg_payload,
            order_cancelled_notification_sound,
          },
          topics: [AdminRole.OPS_MANAGER],
          userType: UserType.ADMIN,
        },
      };
      const channel_msg: IChannelNotificationMessage = {
        event: 'CHANNELS',
        action: 2,
        data: [push_msg, push_msg_admin],
      };
      console.log(
        'order_cancellation_refund_duration + delay',
        order_cancellation_refund_duration + delay
      );
      if (current_time > cancellation_refund_end_time) {
        channel_msg.action = 4;
        channel_msg.data.push(ws_msg, push_msg_vendor);
      }
      await sendSQSMessage(SQS_URL.NOTIFICATIONS, channel_msg);

      await trx.commit();
      await cancelPetpoojaOrderStatus(
        updated_order.restaurant_id!,
        updated_order.id + '',
        validated_req.cancellation_reason || 'Cancelled By Customer'
      );
      logger.debug(
        `order id : ${validated_req.order_id} cancelled successfully`
      );
      return sendSuccess(res, 200, 'order cancelled successfully');
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    logger.error('failed while cancelling customer order as customer', error);
    return handleErrors(res, error);
  }
}

//cancel order as admin
export async function cancelCustomerOrderByOrderIdAsAdmin(
  req: Request,
  res: Response
) {
  try {
    const validation = cancel_order_as_admin_vendor.validate({
      order_id: req.params.order_id,
      cancellation_reason: req.body.cancellation_reason,
    });
    if (validation.error)
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 1000,
        },
      ]);

    const validated_req = validation.value as ICancelOrder;
    const trx = await getTransaction();
    try {
      const order: IOrderDetails = (
        await readOrdersAsAdminForUpdate(trx, [validated_req.order_id])
      )[0];
      if (!order) {
        throw new ResponseError(400, [
          {
            message: 'invalid order id',
            code: 1036,
          },
        ]);
      }
      if (order.order_status === OrderStatus.CANCELLED) {
        throw new ResponseError(400, [
          {
            message: 'order already cancelled',
            code: 1037,
          },
        ]);
      }
      // if (order.order_status === OrderStatus.COMPLETED) {
      //   throw new ResponseError(400, [
      //     {
      //       message: 'order already completed',
      //       code: 1038,
      //     },
      //   ]);
      // }
      // order can be calcelled by admin if it is pod and payment not completed
      const completed_payment_details = order.payment_details.find(
        (payment: IPayment) =>
          payment.is_pod || payment.payment_status === PaymentStatus.COMPLETED
      );
      const updated_rows: IOrder = {
        id: validated_req.order_id,
        order_status: OrderStatus.CANCELLED,
        cancelled_by: req.user.user_type,
        cancellation_details: {
          cancellation_reason: validated_req.cancellation_reason,
        },
        cancellation_time: new Date(),
        cancellation_user_id: req.user.id,
      };
      if (!order.additional_details) {
        order.additional_details = {};
      }
      updated_rows.additional_details = JSON.parse(
        JSON.stringify(order.additional_details)
      );
      if (completed_payment_details) {
        updated_rows.refund_status = RefundStatus.APPROVAL_PENDING;
      }

      //cancel delivery of order if delivery of active and not already cancelled
      if (
        order.delivery_status !== DeliveryStatus.PENDING &&
        order.delivery_status !== DeliveryStatus.DELIVERED
      ) {
        const delivery_cancellation_result = await cancelDelivery({
          delivery_service: order.delivery_service!,
          delivery_order_id: order.delivery_order_id!,
          reason:
            'Admin cancelled the order with reason: ' +
              validated_req.cancellation_reason || '',
          user: 'Customer',
        });
        if (!delivery_cancellation_result.cancelled) {
          logger.error(
            'delivery cancellation failed while admin cancel order',
            delivery_cancellation_result
          );
          updated_rows.delivery_status = DeliveryStatus.FAILED_TO_CANCEL;
          updated_rows.additional_details!.order_delivery_cancellation_details =
            {
              delivery_cancellation_failure_reason:
                delivery_cancellation_result.reason,
            };
        } else {
          updated_rows.delivery_status = DeliveryStatus.CANCELLED;
          logger.debug(
            'order delivery successfully cancelled',
            delivery_cancellation_result
          );
        }
      }
      if (
        JSON.stringify(updated_rows.additional_details) ===
        JSON.stringify(order.additional_details)
      ) {
        delete updated_rows.additional_details;
      }
      const updated_order = await updateOrder(trx, updated_rows);

      // inform restaurant and customer about order cancellation
      const msg_payload = {
        order_id: updated_order.id,
        order_acceptance_status: updated_order.order_acceptance_status,
        order_status: updated_order.order_status,
        delivery_status: updated_order.delivery_status,
        pickup_eta: updated_order.pickup_eta,
        drop_eta: updated_order.drop_eta,
        cancelled_by: updated_order.cancelled_by,
        cancellation_details: updated_order.cancellation_details,
        cancellation_time: updated_order.cancellation_time,
        refund_status: updated_order.refund_status,
      };
      const ws_msg: IWebSocketSQSMessage = {
        event: 'WS',
        action: 'ORDER_CANCELLED',
        data: {
          to_room_ids: [order.restaurant_id],
          payload: msg_payload,
        },
      };
      const push_msg: IPushNotificationsSQSMessage = {
        event: 'PUSH_NOTIFICATIONS',
        action: 'SINGLE',
        data: {
          templateID: 'ORDER_CANCELLED_TEMPLATE',
          templateData: msg_payload,
          userID: order.customer_id!,
          userType: UserType.CUSTOMER,
        },
      };
      const vendors = await getRestaurantVendors(order.restaurant_id!);
      const vendor_ids = vendors.map(vendor => {
        return vendor.id;
      });
      const push_msg_vendor: IPushNotificationsSQSMessage = {
        event: 'PUSH_NOTIFICATIONS',
        action: 'BULK',
        data: {
          templateID: 'ORDER_CANCELLED_TEMPLATE',
          templateData: msg_payload,
          userID: vendor_ids,
          userType: UserType.VENDOR,
        },
      };
      if (order.restaurant_details?.parent_id) {
        ws_msg.data.to_room_ids.push(order.restaurant_details?.parent_id);
        const parent_vendors = await getRestaurantVendors(
          order.restaurant_details?.parent_id
        );
        const parent_vendor_ids = parent_vendors.map(vendor => {
          return vendor.id;
        });
        push_msg_vendor.data.userID.push(...parent_vendor_ids);
      }
      const channel_msg: IChannelNotificationMessage = {
        event: 'CHANNELS',
        action: 2,
        data: [ws_msg, push_msg, push_msg_vendor],
      };
      await sendSQSMessage(SQS_URL.NOTIFICATIONS, channel_msg);
      logger.debug(
        `order id: ${validated_req.order_id} cancelled successfully`,
        updated_order
      );
      await trx.commit();
      await cancelPetpoojaOrderStatus(
        updated_order.restaurant_id!,
        updated_order.id + '',
        validated_req.cancellation_reason || 'Cancelled By Admin'
      );
      return sendSuccess(res, 200, 'order cancelled successfully');
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    logger.error('failed while cancelling customer order as admin', error);
    return handleErrors(res, error);
  }
}

//cancel order as vendor
export async function cancelCustomerOrderByOrderIdAsVendor(
  req: Request,
  res: Response
) {
  try {
    const validation = cancel_order_as_admin_vendor.validate({
      order_id: req.params.order_id,
      cancellation_reason: req.body.cancellation_reason,
    });
    if (validation.error)
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 1000,
        },
      ]);
    const validated_req = validation.value as ICancelOrder;
    const trx = await getTransaction();
    try {
      const order: IVendorOrderDetails = (
        await readVendorOrdersForUpdate(
          trx,
          [validated_req.order_id],
          req.user.data.restaurant_id,
          req.user.data.child_restaurant_ids
        )
      )[0];
      if (!order) {
        throw new ResponseError(400, [
          {
            message: 'invalid order id',
            code: 1036,
          },
        ]);
      }

      validatePosPartnerAccess(order.pos_partner);

      if (order.order_status === OrderStatus.CANCELLED) {
        throw new ResponseError(400, [
          {
            message: 'order already cancelled',
            code: 1037,
          },
        ]);
      }
      if (order.order_status === OrderStatus.COMPLETED) {
        throw new ResponseError(400, [
          {
            message: 'order already completed',
            code: 1038,
          },
        ]);
      }
      if (order.order_acceptance_status === OrderAcceptanceStatus.PENDING) {
        throw new ResponseError(400, [
          {
            message: 'order has not been accepted by vendor to cancel',
            code: 1098,
          },
        ]);
      }
      const updated_rows: IOrder = {
        id: validated_req.order_id,
        order_status: OrderStatus.CANCELLED,
        cancelled_by: req.user.user_type,
        cancellation_details: {
          cancellation_reason: validated_req.cancellation_reason,
        },
        cancellation_time: new Date(),
        cancellation_user_id: req.user.id,
        refund_status: RefundStatus.APPROVAL_PENDING,
      };
      if (!order.additional_details) {
        order.additional_details = {};
      }
      updated_rows.additional_details = JSON.parse(
        JSON.stringify(order.additional_details)
      );

      //cancel delivery of order
      const delivery_cancellation_result = await cancelDelivery({
        delivery_service: order.delivery_service!,
        delivery_order_id: order.delivery_order_id!,
        reason:
          'Vendor cancelled the order with reason: ' +
            validated_req.cancellation_reason || '',
        user: 'Seller',
      });
      if (!delivery_cancellation_result.cancelled) {
        logger.error(
          'delivery cancellation failed while vendor cancel order',
          delivery_cancellation_result
        );
        updated_rows.delivery_status = DeliveryStatus.FAILED_TO_CANCEL;
        updated_rows.additional_details!.order_delivery_cancellation_details = {
          delivery_cancellation_failure_reason:
            delivery_cancellation_result.reason,
        };
      } else {
        updated_rows.delivery_status = DeliveryStatus.CANCELLED;
        logger.debug(
          'order delivery successfully cancelled',
          delivery_cancellation_result
        );
      }

      if (
        JSON.stringify(updated_rows.additional_details) ===
        JSON.stringify(order.additional_details)
      ) {
        delete updated_rows.additional_details;
      }
      const updated_order = await updateOrder(trx, updated_rows);
      const msg_payload = {
        order_id: updated_order.id,
        order_acceptance_status: updated_order.order_acceptance_status,
        order_status: updated_order.order_status,
        delivery_status: updated_order.delivery_status,
        pickup_eta: updated_order.pickup_eta,
        drop_eta: updated_order.drop_eta,
        cancelled_by: updated_order.cancelled_by,
        cancellation_details: updated_order.cancellation_details,
        cancellation_time: updated_order.cancellation_time,
        refund_status: updated_order.refund_status,
      };
      const ws_msg: IWebSocketSQSMessage = {
        event: 'WS',
        action: 'ORDER_CANCELLED',
        data: {
          to_room_ids: [order.customer_id, order.restaurant_id],
          payload: msg_payload,
        },
      };
      const push_msg: IPushNotificationsSQSMessage = {
        event: 'PUSH_NOTIFICATIONS',
        action: 'SINGLE',
        data: {
          templateID: 'ORDER_CANCELLED_TEMPLATE',
          templateData: msg_payload,
          userID: order.customer_id!,
          userType: UserType.CUSTOMER,
        },
      };
      const order_cancelled_notification_sound =
        await Globals.ORDER_COMPLETE_NOTIFICATION_SOUND.get();
      const push_msg_admin: IPushNotificationsSQSMessage = {
        event: 'PUSH_NOTIFICATIONS',
        action: 'TOPIC',
        data: {
          templateID: 'ADMIN_ORDER_CANCELLED_TEMPLATE',
          templateData: {
            ...msg_payload,
            order_cancelled_notification_sound,
          },
          topics: [AdminRole.OPS_MANAGER],
          userType: UserType.ADMIN,
        },
      };
      if (order.restaurant_details?.parent_id) {
        ws_msg.data.to_room_ids.push(order.restaurant_details?.parent_id);
      }
      const channel_msg: IChannelNotificationMessage = {
        event: 'CHANNELS',
        action: 3,
        data: [ws_msg, push_msg, push_msg_admin],
      };
      await sendSQSMessage(SQS_URL.NOTIFICATIONS, channel_msg);
      await trx.commit();
      await cancelPetpoojaOrderStatus(
        updated_order.restaurant_id!,
        updated_order.id + '',
        validated_req.cancellation_reason || 'Cancelled By Vendor'
      );
      logger.debug(
        `order id: ${validated_req.order_id} cancelled successfully`
      );
      return sendSuccess(res, 200, 'order cancelled successfully');
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    logger.error('failed while cancelling customer order as vendor', error);
    return handleErrors(res, error);
  }
}

//get orders by order ids

export async function getOrderByOrderIdAsAdmin(req: Request, res: Response) {
  try {
    const validation = get_customer_orders_as_admin.validate({
      order_id: req.params.order_id,
      admin_id: req.user.id,
    });
    if (validation.error)
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 1000,
        },
      ]);
    const validated_req = validation.value as IGetCustomerOrdersAsAdmin;
    const records = await readOrdersAsAdmin([validated_req.order_id]);
    if (records.length === 0) {
      return sendError(res, 400, [
        {
          message: 'invalid order id',
          code: 1036,
        },
      ]);
    }
    await formatOrderResponse(records);
    await updateOrderDetailsWithDynamicValues(records);
    return sendSuccess(res, 200, {records});
  } catch (error) {
    logger.error('FAILED WHILE FETCHING ORDER DETAILS', error);
    return handleErrors(res, error);
  }
}

export async function getCustomerOrderByOrderIdAsCustomer(
  req: Request,
  res: Response
) {
  try {
    const validation = get_customer_orders.validate({
      order_id: req.params.order_id,
      customer_id: req.user.id,
    });
    if (validation.error)
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 1000,
        },
      ]);
    const validated_req = validation.value as IGetCustomerOrders;
    const records = await readCustomerOrders(
      [validated_req.order_id],
      validated_req.customer_id
    );
    if (records.length === 0) {
      return sendError(res, 400, [
        {
          message: 'invalid order id',
          code: 1036,
        },
      ]);
    }
    await formatOrderResponse(records);
    await updateOrderDetailsWithDynamicValues(records);
    return sendSuccess(res, 200, {records});
  } catch (error) {
    logger.error('FAILED WHILE FETCHING ORDER DETAILS', error);
    return handleErrors(res, error);
  }
}

export async function getVendorOrderByOrderIdAsVendor(
  req: Request,
  res: Response
) {
  try {
    const validation = get_vendor_orders.validate({
      order_id: req.params.order_id,
      restaurant_id: req.user.data.restaurant_id,
    });
    if (validation.error)
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 1000,
        },
      ]);
    const validated_req = validation.value as IGetVendorOrders;
    const records = await readVendorOrders(
      [validated_req.order_id],
      validated_req.restaurant_id,
      req.user.data.child_restaurant_ids
    );
    if (records.length === 0) {
      return sendError(res, 400, [
        {
          message: 'invalid order id',
          code: 1036,
        },
      ]);
    }
    await formatOrderResponse(records);
    await updateVendorOrderDetailsWithDynamicValues(records);
    return sendSuccess(res, 200, {records});
  } catch (error) {
    logger.error('FAILED WHILE FETCHING ORDER DETAILS', error);
    return handleErrors(res, error);
  }
}

//filter orders

export async function filterOrdersAsVendor(req: Request, res: Response) {
  try {
    const validation = vendor_order_filter.validate({
      search_text: req.body.search_text,
      filter: {
        restaurant_id: req.user.data.restaurant_id,
        order_status: req.body.filter?.order_status,
        order_acceptance_status: req.body.filter?.order_acceptance_status,
        delivery_status: req.body.filter?.delivery_status,
        duration: req.body.filter?.duration,
        cancelled_by: req.body.filter?.cancelled_by,
      },
      pagination: req.body.pagination,
      sort: req.body.sort,
    });
    if (validation.error)
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 1000,
        },
      ]);

    const validated_req = validation.value as IVendorFilterOrders;
    if (req.user.data.child_restaurant_ids) {
      if (!validated_req.filter) validated_req.filter = {};
      delete validated_req.filter.restaurant_id;
      validated_req.filter!.child_restaurant_ids =
        req.user.data.child_restaurant_ids;
    }

    const data = await readVendorOrdersWithFilter(validated_req);
    await formatOrderResponse(data.records);
    await updateVendorOrderDetailsWithDynamicValues(data.records);
    return sendSuccess(res, 200, data);
  } catch (error) {
    logger.error('FAILED WHILE FETCHING VENDOR ORDERS', error);
    return handleErrors(res, error);
  }
}

export async function filterOrdersAsAdmin(req: Request, res: Response) {
  try {
    const validation = admin_order_filter.validate(req.body);
    if (validation.error)
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 1000,
        },
      ]);
    const validated_req = validation.value as IAdminFilterOrders;
    let data;
    if (
      validated_req.filter?.customer_email ||
      validated_req.filter?.customer_phone ||
      validated_req.filter?.customer_id
    ) {
      const customers = await getCustomerDetailsWithFilter({
        filter: {
          email: validated_req.filter.customer_email,
          phone: validated_req.filter.customer_phone,
          id: validated_req.filter?.customer_id,
        },
      });
      const customer_ids = customers.map(customer => {
        return customer.id;
      });
      validated_req.filter.customer_id = customer_ids;
      data = await readAdminOrdersWithFilter(validated_req);
      data.records.map(item => {
        const customer = customers.find(cust => cust.id === item.customer_id);
        if (customer)
          item.customer_details = {
            id: customer.id,
            full_name: customer.full_name,
            phone: customer.phone,
            email: customer.email,
            alternate_phone: customer.alternate_phone,
            image_url: customer.image_url,
          };
      });
    } else {
      data = await readAdminOrdersWithFilter(validated_req);
      if (data.records.length) {
        const customer_ids = data.records.map(item => {
          return item.customer_id!;
        });
        const customers = await getCustomerDetailsWithFilter({
          filter: {id: customer_ids},
        });
        data.records.map(item => {
          const customer = customers.find(cust => cust.id === item.customer_id);
          if (customer)
            item.customer_details = {
              id: customer.id,
              full_name: customer.full_name,
              phone: customer.phone,
              email: customer.email,
              alternate_phone: customer.alternate_phone,
              image_url: customer.image_url,
            };
        });
      }
    }
    await formatOrderResponse(data.records);
    await updateOrderDetailsWithDynamicValues(data.records);
    if (validated_req.filter?.in_csv === true) {
      const result = await downloadOrdersCsvAsAdmin(data.records, res);
      res.setHeader('Content-type', 'application/octet-stream');
      res.setHeader('Content-disposition', 'attachment; filename=orders.csv');
      return res.send(result);
    } else {
      return sendSuccess(res, 200, data);
    }
  } catch (error) {
    logger.error('FAILED WHILE FETCHING ORDERS FOR ADMIN', error);
    return handleErrors(res, error);
  }
}

export async function downloadOrdersCsvAsAdmin(
  orders: IOrderDetails[],
  res: Response
) {
  try {
    const filtered_response = orders;
    if (!filtered_response) {
      return sendError(res, 400, 'csv is not genrated');
    }

    const rows: string[] = [];
    for (let i = 0; i < filtered_response.length; i++) {
      const order = filtered_response[i];
      const order_row: string[] = [];
      const menu_item_names: string[] = [];
      const menu_item_quantity: string[] = [];
      const addon_name: string[] = [];

      order_row.push(order.order_id + '');
      order_row.push(order.restaurant_id + '');
      order_row.push(order.restaurant_details!.restaurant_name + '');
      order_row.push(order.order_status + '');

      if (order.customer_address!.customer_name) {
        order_row.push(order.customer_address!.customer_name + '');
      } else {
        order_row.push();
      }

      order_row.push((order?.customer_address?.phone ?? '') + '');

      if (order.customer_address) {
        const customer_address = [
          order.customer_address.customer_name!,
          order.customer_address.email!,
          order.customer_address.city,
          order.customer_address.state,
          order.customer_address.country,
          order.customer_address.apartment_road_area,
          order.customer_address.house_flat_block_no,
        ];
        order_row.push(customer_address.join(', '));
      } else {
        order_row.push('N/A');
      }

      const paymentDetails = order.payment_details?.[0];
      order_row.push(
        paymentDetails?.payment_id ?? 'N/A',
        order.invoice_breakout?.is_pod === true
          ? 'Pay On Delivery'
          : paymentDetails?.payment_method ?? 'N/A',
        paymentDetails?.payment_status ?? 'N/A',
        paymentDetails?.payment_gateway ?? 'N/A',
        paymentDetails?.transaction_id ?? 'N/A',
        paymentDetails!.transaction_time
          ? formatTime(paymentDetails!.transaction_time!)
          : paymentDetails!.transaction_time ?? 'N/A',
        paymentDetails?.amount_paid_by_customer?.toString() ?? 'N/A'
      );

      order_row.push(order.delivery_details?.rider_id ?? '');
      order_row.push(order.delivery_details?.rider_name ?? '');
      order_row.push(order.delivery_details?.rider_id ?? '');

      if (order.invoice_breakout) {
        for (let j = 0; j < order.invoice_breakout!.menu_items.length; j++) {
          const menu_item = order.invoice_breakout!.menu_items[j];
          const item_names = menu_item.item_name.split(',');
          if (item_names.length > 1) {
            menu_item_names.push(item_names.join('\n'));
          } else {
            menu_item_names.push(item_names[0].trim());
          }
          menu_item_quantity.push(menu_item.item_quantity + '');
        }
        order_row.push(menu_item_names.join('\n'));
        order_row.push(menu_item_quantity.join('\n'));
      } else {
        order_row.push('');
        order_row.push('');
      }

      if (order.invoice_breakout) {
        for (let i = 0; i < order.invoice_breakout!.menu_items.length; i++) {
          const menu_item = order.invoice_breakout!.menu_items[i];
          if (menu_item.addon_groups.length > 0) {
            for (let k = 0; k < menu_item.addon_groups.length; k++) {
              for (
                let l = 0;
                l < menu_item.addon_groups[k].addons.length;
                l++
              ) {
                addon_name.push(menu_item.addon_groups[k].addons[l].addon_name);
              }
            }
          } else {
            addon_name.push('N/A');
          }
        }

        order_row.push(addon_name.join('\n'));
      } else {
        order_row.push('');
      }

      if (order.invoice_breakout) {
        order_row.push(
          `${order.invoice_breakout!.total_food_cost}`,
          `${order.invoice_breakout!.total_packing_charges}`,
          `${order.invoice_breakout!.delivery_charges}`,
          `${order.total_tax}`,
          `${order.invoice_breakout!.transaction_charges}`
        );
      } else {
        order_row.push('', '', '', '', '');
      }

      if (order.invoice_breakout && order.invoice_breakout!.coupon_details) {
        order_row.push(order.invoice_breakout!.coupon_details.code + '');
        order_row.push(
          order.invoice_breakout!.coupon_details.discount_amount_rupees + ''
        );
      } else {
        order_row.push('N/A');
        order_row.push('N/A');
      }

      order_row.push(
        order.invoice_breakout! &&
          order.invoice_breakout!.vendor_payout_amount + ''
      );

      order_row.push(order.total_customer_payable!.toString());

      if (order.order_placed_time instanceof Date) {
        order_row.push(formatTime(order.order_placed_time));
      } else {
        order_row.push('');
      }

      if (order.vendor_accepted_start_time instanceof Date) {
        order_row.push(formatTime(order.vendor_accepted_start_time));
      } else {
        order_row.push('');
      }
      //
      if (order.vendor_accepted_end_time instanceof Date) {
        order_row.push(formatTime(order.vendor_accepted_end_time));
      } else {
        order_row.push('');
      }

      if (order.vendor_ready_marked_time instanceof Date) {
        order_row.push(formatTime(order.vendor_ready_marked_time));
      } else {
        order_row.push('');
      }

      if (order.order_pickedup_time instanceof Date) {
        order_row.push(formatTime(order.order_pickedup_time));
      } else {
        order_row.push('');
      }

      if (
        order.order_delivered_at &&
        order.order_delivered_at instanceof Date
      ) {
        order_row.push(formatTime(order.order_delivered_at));
      } else {
        order_row.push('');
      }

      order_row.push(order.order_acceptance_status + '');

      order_row.push(order.delivery_status + '');

      order_row.push(order.order_status + '');

      if (order.refund_status) {
        order_row.push(order.refund_status + '');
      } else {
        order_row.push('N/A');
      }

      if (order.cancelled_by) {
        order_row.push(order.cancelled_by + '');
      } else {
        order_row.push('N/A');
      }

      if (
        order.cancellation_details &&
        order.cancellation_details.cancellation_reason
      ) {
        order_row.push(order.cancellation_details.cancellation_reason + '');
      } else {
        order_row.push('');
      }

      if (order.cancellation_time) {
        order_row.push(formatTime(order.cancellation_time) + '');
      } else {
        order_row.push('N/A');
      }

      if (
        order.invoice_breakout &&
        order.invoice_breakout!.refund_settlement_details
      ) {
        order_row.push(
          order.invoice_breakout!.refund_settlement_details
            .refund_settled_customer_amount + ''
        );
      } else {
        order_row.push('N/A');
      }

      if (
        order.invoice_breakout &&
        order.invoice_breakout!.refund_settlement_details &&
        order.invoice_breakout!.refund_settlement_details
          .refund_settlement_note_to_customer
      ) {
        order_row.push(
          order.invoice_breakout!.refund_settlement_details
            .refund_settlement_note_to_customer + ''
        );
      } else {
        order_row.push('N/A');
      }

      if (
        order.invoice_breakout &&
        order.invoice_breakout!.refund_settlement_details
      ) {
        order_row.push(
          order.invoice_breakout!.refund_settlement_details
            .refund_settled_vendor_payout_amount + ''
        );
      } else {
        order_row.push('N/A');
      }

      if (
        order.invoice_breakout &&
        order.invoice_breakout!.refund_settlement_details &&
        order.invoice_breakout!.refund_settlement_details
          .refund_settlement_note_to_vendor
      ) {
        order_row.push(
          order.invoice_breakout!.refund_settlement_details
            .refund_settlement_note_to_vendor + ''
        );
      } else {
        order_row.push('N/A');
      }
      if (
        order.invoice_breakout &&
        order.invoice_breakout!.refund_settlement_details
      ) {
        order_row.push(
          order.invoice_breakout!.refund_settlement_details
            .refund_settled_delivery_charges + ''
        );
      } else {
        order_row.push('N/A');
      }

      if (
        order.invoice_breakout &&
        order.invoice_breakout!.refund_settlement_details &&
        order.invoice_breakout!.refund_settlement_details
          .refund_settlement_note_to_delivery_partner
      ) {
        order_row.push(
          order.invoice_breakout!.refund_settlement_details
            .refund_settlement_note_to_delivery_partner + ''
        );
      } else {
        order_row.push('N/A');
      }
      rows.push(strToCsvRow(order_row));
    }

    const headerArray: string[] = [];
    for (const [key, value] of Object.entries(order_csv_cols)) {
      if (key && value) headerArray.push(value);
    }

    const headersStr = headerArray.join(',');
    let rowsStr = '';

    if (rows.length) rowsStr = rows.join('\n');
    const result = headersStr + '\n' + rowsStr;
    return result;
  } catch (error) {
    logger.error('FAILED WHILE GENRATING ORDERS CSV FOR ADMIN', error);
    return handleErrors(res, error);
  }
}

export async function orderOneView(req: Request, res: Response) {
  try {
    const validation = Joi.string().validate(req.params.search_key);
    if (validation.error)
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 1000,
        },
      ]);

    const search_key = validation.value;
    let order_id: number | undefined = undefined;
    let customer_contact: string | undefined = undefined;
    if ((search_key + '').length >= 10 || (search_key + '').startsWith('+91')) {
      customer_contact = search_key + '';
    } else {
      order_id = +search_key;
    }
    const order = await readOneViewOrder(order_id, customer_contact);

    if (!order) {
      return sendError(res, 400, [
        {
          message: order_id ? 'invalid order id' : 'invalid contact no.',
          code: 1036,
        },
      ]);
    }

    //restaurant image url is generated under this function
    await formatOrderResponse([order]);
    await updateOrderDetailsWithDynamicValues([order]);

    if (!order) {
      return sendError(res, 400, [
        {
          message: order_id ? 'invalid order id' : 'invalid contact no.',
          code: 1036,
        },
      ]);
    }
    const restaurant = await readRestaurantById(order.restaurant_id!);

    const completed_payment_details = order.payment_details.find(
      (payment: IPayment) => payment.payment_status === PaymentStatus.COMPLETED
    );

    let cancellation_user_name = null;
    if (order.order_status === OrderStatus.CANCELLED) {
      if (order.cancelled_by === OrderCancelledBy.ADMIN) {
        //get admin details
        const admin_details = await getAdminDetailsById(
          order.cancellation_user_id!
        );
        if (admin_details) {
          cancellation_user_name = admin_details.user_name;
        }
      } else if (order.cancelled_by === OrderCancelledBy.CUSTOMER) {
        cancellation_user_name = order.customer_address?.customer_name;
        //get customer details
      } else if (order.cancelled_by === OrderCancelledBy.VENDOR) {
        //get vendor details
        const vendor_details = await getVendorDetailsById(
          order.cancellation_user_id!
        );
        cancellation_user_name = vendor_details.name;
      }
    }
    if (order.delivery_details)
      order.delivery_details.delivery_service = order.delivery_service;
    return sendSuccess(res, 200, {
      restaurant_deatils: {
        id: order.restaurant_id,
        name: order.restaurant_details?.restaurant_name,
        image: order.restaurant_details?.image,
        address: restaurant.business_address,
        contact:
          restaurant.poc_number ||
          restaurant.manager_contact_number ||
          restaurant.owner_contact_number,
        branch_name: restaurant.branch_name,
        pos_id: restaurant.pos_id,
        pos_partner: restaurant.pos_partner,
        latitude: restaurant.lat,
        longitude: restaurant.long,
      },
      customer_details: {
        customer_id: order.customer_id,
        customer_name: order.customer_address?.customer_name,
        alternate_phone: order.customer_address?.alternate_phone,
        phone: order.customer_address?.phone,
        customer_address: {
          id: order.customer_address?.id,
          city: order.customer_address?.city,
          name: order.customer_address?.name,
          email: order.customer_address?.email,
          state: order.customer_address?.state,
          country: order.customer_address?.country,
          pincode: order.customer_address?.pincode,
          latitude: order.customer_address?.latitude
            ? +order.customer_address.latitude
            : null,
          longitude: order.customer_address?.longitude
            ? +order.customer_address.longitude
            : null,
          house_flat_block_no: order.customer_address?.house_flat_block_no,
          apartment_road_area: order.customer_address?.apartment_road_area,
          directions: order.customer_address?.directions,
        },
      },
      order_invoice: order.invoice_breakout,
      order_payment_details: order.payment_details[0],
      order_delivery_details: order.delivery_details || {
        delivery_order_id: order.delivery_order_id,
        drop_eta: order.drop_eta,
        pickup_eta: order.pickup_eta,
        delivery_service: order.delivery_service,
        delivery_status: order.delivery_status,
      },
      order_events: {
        order_created_at: order.created_at,
        order_payment_completed_at: completed_payment_details?.transaction_time,
        order_vendor_accepted_at: order.vendor_accepted_time,
        order_mark_ready_vendor: order.vendor_ready_marked_time,
        order_pickedup_time: order.order_pickedup_time,
        order_delivered_time: order.order_delivered_at,
        order_cancelation_time: order.cancellation_time,
      },
      order_details: {
        order_id: order.order_id,
        order_status: order.order_status,
        order_acceptance_status: order.order_acceptance_status,
        delivery_status: order.delivery_status,
        order_status_label: order.order_status_label,
        order_status_code: order.order_status_code,
        cancelled_by: order.cancelled_by,
        cancellation_details: order.cancellation_details,
        cancellation_user_id: order.cancellation_user_id,
        cancellation_refund_end_time: order.cancellation_refund_end_time,
        cancellation_user_name,
        pos_id: order.pos_id,
        pos_partner: order.pos_partner,
        customer_pickup_eta: order.pickup_eta,
        customer_drop_eta: order.drop_eta,
      },
      payment_details: order.payment_details,
      refund_details: order.additional_details?.refund_details
        ? order.additional_details.refund_details
        : null,
    });
  } catch (error) {
    logger.error('FAILED WHILE FETCHING ORDERS FOR ADMIN', error);
    return handleErrors(res, error);
  }
}

export async function filterOrdersAsCustomer(req: Request, res: Response) {
  try {
    const validation = customer_order_filter.validate({
      filter: {
        customer_id: req.user.id,
        order_status: req.body.filter?.order_status,
        duration: req.body.filter?.duration,
      },
      pagination: req.body.pagination,
    });
    if (validation.error)
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 1000,
        },
      ]);
    logger.debug(
      'request received for filter order as customer',
      validation.value
    );
    const validated_req = validation.value as ICustomerFilterOrders;
    const data = await readCustomerOrdersWithFilter(validated_req);
    await formatOrderResponse(data.records);
    await updateOrderDetailsWithDynamicValues(data.records);
    return sendSuccess(res, 200, data);
  } catch (error) {
    logger.error('FAILED WHILE FETCHING CUSTOMER ORDERS', error);
    return handleErrors(res, error);
  }
}

export async function orderRating(req: Request, res: Response) {
  try {
    req.body.id = req.params.order_id;
    const validation = validate_rating.validate(req.body);
    if (validation.error)
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 1000,
        },
      ]);

    const validated_req = validation.value as {
      id: IOrder['id'];
      vote_type: 1 | -1;
      order_rating?: number; //! BACKWARD_COMPATIBLE
      comments: IOrder['comments'];
    };
    if (validated_req.order_rating) {
      //! BACKWARD_COMPATIBLE
      return sendSuccess(
        res,
        200,
        {
          order_rating: 0,
          restaurant_rating: 0,
        },
        'Thanks for your feedback, Your response has been recorded'
      );
    } else if (!validated_req.vote_type) {
      return sendError(res, 400, [
        {
          message: 'vote_type is required',
          code: 1000,
        },
      ]);
    }

    const order: IOrderDetails = (
      await readCustomerOrders([validated_req.id!], req.user.id)
    )[0];

    if (!order) {
      return sendError(res, 400, [
        {
          message: 'invalid order id',
          code: 1036,
        },
      ]);
    }
    if (order.order_status !== OrderStatus.COMPLETED) {
      return sendError(res, 400, [
        {
          message: 'order_not_complete',
          code: 1079,
        },
      ]);
    }
    if (order.vote_type !== 0) {
      return sendError(res, 400, [
        {
          message: 'rating_already_done',
          code: 1080,
        },
      ]);
    }

    const trx = await getTransaction();
    try {
      await updateOrder(trx, {...validated_req, reviewed_at: new Date()});
      await incrementRestaurantVoteCount(
        trx,
        order.restaurant_id!,
        validated_req.vote_type
      );
      await trx.commit();
      return sendSuccess(
        res,
        200,
        {
          order_rating: 0,
          restaurant_rating: 0,
        }, //! BACKWARD_COMPATIBLE
        'Thanks for your feedback, Your response has been recorded'
      );
    } catch (error) {
      await trx.rollback();
      logger.error('Failed saving order vote', error);
      throw error;
    }
  } catch (error) {
    logger.error('FAILED WHILE RATING ORDERS', error);
    return handleErrors(res, error);
  }
}

export async function settleRefundAsAdmin(req: Request, res: Response) {
  try {
    const order_id = +req.params.order_id;
    const validation = validate_settle_refund_details.validate({
      refund_settled_by: 'admin',
      refund_settled_admin_id: req.user.id,
      refund_settled_vendor_payout_amount:
        req.body.refund_settled_vendor_payout_amount,
      refund_settled_delivery_charges: req.body.refund_settled_delivery_charges,
      refund_settled_customer_amount: req.body.refund_settled_customer_amount,
      refund_settlement_note_to_delivery_partner:
        req.body.refund_settlement_note_to_delivery_partner,
      refund_settlement_note_to_vendor:
        req.body.refund_settlement_note_to_vendor,
      refund_settlement_note_to_customer:
        req.body.refund_settlement_note_to_customer,
    });
    if (validation.error)
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 1000,
        },
      ]);
    const refund_settlement_details =
      validation.value as IRefundSettlementDetails;
    const order = (await readOrdersAsAdmin([order_id]))[0];
    if (!order) {
      return sendError(res, 400, [
        {
          message: 'invalid order id',
          code: 1036,
        },
      ]);
    }
    const completed_payment_details = order.payment_details.find(
      (payment: IPayment) =>
        payment.is_pod || payment.payment_status === PaymentStatus.COMPLETED
    );
    if (!completed_payment_details) {
      return sendError(res, 400, [
        {
          message: 'order payment not completed',
          code: 1039,
        },
      ]);
    }

    // if payment not (prepayment/ POD) done ant customer_refund >0 return 400

    if (
      completed_payment_details.payment_status !== PaymentStatus.COMPLETED &&
      refund_settlement_details.refund_settled_customer_amount > 0
    ) {
      return sendError(res, 400, [
        {
          message: 'cannot refund to customer: payment not completed',
          code: 2016,
        },
      ]);
    }
    if (order.refund_status !== RefundStatus.APPROVAL_PENDING) {
      return sendError(res, 400, [
        {
          message: `refund status on order ${order_id} is not in 'approval pending' state`,
          code: 0,
        },
      ]);
    }

    if (
      refund_settlement_details.refund_settled_customer_amount >
      completed_payment_details.amount_paid_by_customer!
    ) {
      return sendError(res, 400, [
        {
          message: `refund settled customer amount must be less than or equal to Rs.${completed_payment_details.amount_paid_by_customer}`,
          code: 0,
        },
      ]);
    }

    if (
      refund_settlement_details.refund_settled_vendor_payout_amount >
      order.vendor_payout_amount!
    ) {
      return sendError(res, 400, [
        {
          message: `refund settled vendor payout amount must be less than or equal to Rs.${order.vendor_payout_amount}`,
          code: 0,
        },
      ]);
    }

    if (
      refund_settlement_details.refund_settled_delivery_charges >
      order.delivery_charges!
    ) {
      return sendError(res, 400, [
        {
          message: `refund settled delivery charges must be less than or equal to Rs.${order.delivery_charges}`,
          code: 0,
        },
      ]);
    }

    const trx = await getTransaction();
    try {
      let updated_order: IOrder = {
        id: order.order_id,
        additional_details: JSON.parse(
          JSON.stringify(order.additional_details || {})
        ),
        invoice_breakout: JSON.parse(JSON.stringify(order.invoice_breakout!)),
        customer_id: order.customer_id,
      };
      const payment = JSON.parse(JSON.stringify(order.payment_details[0]));
      payment.id = payment.payment_id;
      delete payment.payment_id;

      updated_order = await settleRefund(
        refund_settlement_details,
        updated_order,
        payment
      );

      updated_order = await updateOrder(trx, updated_order);
      await trx.commit();
      return sendSuccess(res, 200, {
        order_details: updated_order,
      });
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    logger.error('FAILED TO SETTLE REFUND', error);
    return handleErrors(res, error);
  }
}

export async function markForRefund(req: Request, res: Response) {
  try {
    const validation = numeric_id.validate(req.params.order_id);
    if (validation.error)
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 1000,
        },
      ]);
    const validated_req = validation.value as number;
    const trx = await getTransaction();
    try {
      const order = (await readOrdersAsAdminForUpdate(trx, [validated_req]))[0];
      if (!order) {
        throw new ResponseError(400, [
          {message: 'invalid order id', code: 1036},
        ]);
      }
      if (order.order_status !== OrderStatus.COMPLETED) {
        throw new ResponseError(400, [
          {
            message: 'only completed orders can be marked for refund',
            code: 2000,
          },
        ]);
      }
      if (order.refund_status !== null) {
        throw new ResponseError(400, [
          {
            message:
              'order can not be marked for refund if it is already in a refund state',
            code: 2001,
          },
        ]);
      }
      if (order.payout_transaction_id !== null) {
        throw new ResponseError(400, [
          {
            message:
              'order can not be marked for refund because payout is genrated',
            code: 2027,
          },
        ]);
      }

      const updated_order = await updateOrder(trx, {
        id: order.order_id,
        refund_status: RefundStatus.APPROVAL_PENDING,
      });
      await trx.commit();
      logger.debug('order successfully marked for refund by admin');
      return sendSuccess(res, 200, updated_order);
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    logger.error('FAILED WHILE MARKING A ORDER FOR REFUND');
    return handleErrors(res, error);
  }
}

// Cancellation-Reason
export async function createCancellationReasonAsAdmin(
  req: Request,
  res: Response
) {
  try {
    const validation = await verify_cancellation_reason.validate(req.body);
    if (validation.error)
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 1000,
        },
      ]);
    const validated_req = validation.value;
    const reason = await createCancellationReason(validated_req);
    logger.debug('Successfully Returned Created Cancellation Reason', reason);
    return sendSuccess(res, 200, {
      id: reason.id,
      user_type: reason.user_type,
      cancellation_reason: reason.cancellation_reason,
    });
  } catch (error) {
    logger.error('FAILED WHILE CREATING NEW REASON AS ADMIN: ', error);
    return handleErrors(res, error);
  }
}

export async function getCancellationReasonByIdAsAdmin(
  req: Request,
  res: Response
) {
  try {
    const validationParam = numeric_id.validate(req.params.id);
    if (validationParam.error)
      return sendError(res, 400, [
        {
          message: validationParam.error.details[0].message,
          code: 1000,
        },
      ]);
    const validated_req = validationParam.value;
    const reason = await readCancellationReasonById(validated_req);
    if (!reason) return sendError(res, 400, 'No Cancellation Reason Found');
    logger.debug('Successfully Returned Get Cancellation Reason', reason);
    return sendSuccess(res, 200, reason);
  } catch (error) {
    logger.error('FAILED WHILE READING REASON AS ADMIN: ', error);
    return handleErrors(res, error);
  }
}

export async function putCancellationReasonAsAdmin(
  req: Request,
  res: Response
) {
  try {
    const validation = verify_update_cancellation_reason.validate({
      id: req.params.id,
      user_type: req.body.user_type,
      cancellation_reason: req.body.cancellation_reason,
    });
    if (validation.error)
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 1000,
        },
      ]);

    const validated_req = validation.value;

    const reason = await readCancellationReasonById(validated_req.id);
    if (!reason) return sendError(res, 400, 'cancellation_reason Not Found');

    const updated_reason = await updateCancellationReason(validated_req);
    logger.debug('Successfully Returned Updated Cancellation Reason', reason);
    return sendSuccess(res, 200, {
      id: updated_reason.id,
      user_type: updated_reason.user_type,
      cancellation_reason: updated_reason.cancellation_reason,
    });
  } catch (error) {
    logger.error('FAILED TO PUT REASON AS ADMIN: ', error);
    return handleErrors(res, error);
  }
}

export async function deleteCancellationReasonAsAdmin(
  req: Request,
  res: Response
) {
  try {
    const validationParam = numeric_id.validate(req.params.id);
    if (validationParam.error)
      return sendError(res, 400, [
        {
          message: validationParam.error.details[0].message,
          code: 1000,
        },
      ]);

    const reason = await readCancellationReasonById(validationParam.value);

    if (!reason) return sendError(res, 400, 'cancellation_reason Not Found');
    logger.debug('Successfully Returned Deleted Cancellation Reason', reason);
    await deleteCancellationReasonById(validationParam.value);
    return sendSuccess(res, 200, {id: reason.id});
  } catch (error) {
    logger.error('FAILED READING REASON AS ADMIN: ', error);
    return handleErrors(res, error);
  }
}

export async function readAllCancellationReasonAsAdmin(
  req: Request,
  res: Response
) {
  try {
    const reasons = await readAllCancellationReason();

    logger.debug('Successfully Returned Cancellation Reason As Admin', reasons);
    return sendSuccess(res, 200, {
      reasons,
    });
  } catch (error) {
    logger.error('FAILED WHILE READING REASON AS ADMIN: ', error);
    return handleErrors(res, error);
  }
}

export async function readCancellationReasonForCustomer(
  req: Request,
  res: Response
) {
  try {
    const reasons = await readCancellationReasonWithUserType('customer');
    logger.debug(
      'Successfully Returned Cancellation Reasons For Customer',
      reasons
    );
    return sendSuccess(res, 200, {
      reasons,
      cancellation_policy: await Globals.CUSTOMER_CANCELLATION_POLICY.get(),
    });
  } catch (error) {
    logger.error('FAILED WHILE READING REASON AS CUSTOMER ', error);
    return handleErrors(res, error);
  }
}

export async function readCancellationReasonForVendor(
  req: Request,
  res: Response
) {
  try {
    const reasons = await readCancellationReasonWithUserType('vendor');
    logger.debug('Successfully Returned Created Cancellation Vendor', reasons);
    return sendSuccess(res, 200, {
      reasons,
      cancellation_policy: await Globals.VENDOR_CANCELLATION_POLICY.get(),
    });
  } catch (error) {
    logger.error('FAILED WHILE READING REASON AS VENDOR', error);
    return handleErrors(res, error);
  }
}

export async function readCancellationReasonForAdmin(
  req: Request,
  res: Response
) {
  try {
    const reasons = await readCancellationReasonWithUserType('admin');
    logger.debug('Successfully Returned Created Cancellation Admin', reasons);
    return sendSuccess(res, 200, {
      reasons,
    });
  } catch (error) {
    logger.error('FAILED FAILED WHILE READING REASON AS ADMIN ', error);
    return handleErrors(res, error);
  }
}

export async function downloadCustomerOrderInvoicePdf(
  req: Request,
  res: Response
) {
  try {
    const validation = get_customer_orders.validate({
      order_id: req.params.order_id,
      customer_id: req.user.id,
    });
    if (validation.error)
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 1000,
        },
      ]);
    const validated_req = validation.value as IGetCustomerOrders;

    const records = await readCustomerOrders(
      [validated_req.order_id],
      validated_req.customer_id
    );
    if (records.length === 0 || !records[0]?.restaurant_id) {
      return sendError(res, 400, [
        {
          message: 'invalid order id',
          code: 1036,
        },
      ]);
    }
    if (records[0].invoice_breakout?.description?.version !== '0.0.2') {
      return sendError(res, 400, [
        {
          message: 'invoice not available',
          code: 2025,
        },
      ]);
    }
    if (records[0].payment_details[0].payment_status !== 'completed') {
      return sendError(res, 400, [
        {
          message: 'Invoice available post order completion',
          code: 2024,
        },
      ]);
    }
    const restaurant = await readRestaurantById(records[0]?.restaurant_id);
    const file_name = `speedyy_restaurant_order_${records[0].order_id}_invoice.pdf`;
    const file = {
      path: 'order/invoice_document/',
      name: file_name,
    };
    const existing_s3_file = await checkFileExistenceInS3(false, file);
    if (!existing_s3_file) {
      logger.debug(
        'order invoice pdf file does not exist in s3',
        existing_s3_file
      );
      const pdf_file = await createOrderInvoicePdf(records[0], restaurant);

      const pdf_s3_file = await createPdfAndSaveToS3(pdf_file, file);
      logger.debug('new order invoice pdf file created', pdf_s3_file);
      const pdf_file_with_url = await getS3DownloadSignedUrl(pdf_s3_file);

      return sendSuccess(res, 200, {file: pdf_file_with_url});
    } else {
      logger.debug(
        'order invoice pdf file already exists in s3',
        existing_s3_file
      );
      const pdf_file_with_url = await getS3DownloadSignedUrl(existing_s3_file);
      return sendSuccess(res, 200, {file: pdf_file_with_url});
    }
  } catch (error) {
    logger.error('FAILED FAILED CREATING ORDER INVOICE PDF ', error);
    return handleErrors(res, error);
  }
}

export async function downloadCustomerOrderSummaryPdf(
  req: Request,
  res: Response
) {
  try {
    const validation = get_customer_orders.validate({
      order_id: req.params.order_id,
      customer_id: req.user.id,
    });
    if (validation.error)
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 1000,
        },
      ]);
    const validated_req = validation.value as IGetCustomerOrders;
    const records = await readCustomerOrders(
      [validated_req.order_id],
      validated_req.customer_id
    );
    if (records.length === 0) {
      return sendError(res, 400, [
        {
          message: 'invalid order id',
          code: 1036,
        },
      ]);
    }
    await formatOrderResponse(records);
    await updateOrderDetailsWithDynamicValues(records);

    const file_name = `speedyy_restaurant_order_${records[0].order_id}_summary.pdf`;
    const file = {
      path: 'order/summary_document/',
      name: file_name,
    };

    const existing_s3_file = await checkFileExistenceInS3(false, file);

    if (!existing_s3_file) {
      logger.debug(
        'order summary pdf file does not exists in s3',
        existing_s3_file
      );
      const pdf_file = await createOrderSummaryPdf(records[0]);
      const pdf_s3_file = await createPdfAndSaveToS3(pdf_file, file);
      logger.debug('new order summary pdf file created', pdf_s3_file);
      const pdf_file_with_url = await generateDownloadFileURL(pdf_s3_file);

      return sendSuccess(res, 200, {file: pdf_file_with_url});
    } else {
      logger.debug(
        'order summary pdf file already exist in s3',
        existing_s3_file
      );
      const pdf_file_with_url = await generateDownloadFileURL(existing_s3_file);

      return sendSuccess(res, 200, {file: pdf_file_with_url});
    }
  } catch (error) {
    logger.error('FAILED FAILED CREATING ORDER SUMMARY PDF', error);
    return handleErrors(res, error);
  }
}

const order_csv_cols = {
  order_id: 'Order Id',
  restaurant_id: 'Restaurant Id',
  restaurant_name: 'Restaurant Name',
  order_delivered_at: 'Order Status',
  customer_name: 'Customer Name',
  customer_phone: 'Customer Phone',
  customer_address: 'Customer Address',
  payment_id: 'Payment Id',
  payment_method: 'Payment Method',
  payment_status: 'Payment Status',
  payment_gateway: 'Payment Gateway',
  transaction_id: 'Payment Transaction Id',
  transaction_time: 'Payment Transaction Time',
  amount_paid_by_customer: 'Amount Paid By Customer',
  rider_id: 'Rider Id',
  rider_name: 'Rider Name',
  ride_phone_number: 'Rider Phone Number',
  menu_item_name: 'Menu Item Name',
  quantity: 'Quantity',
  addon_name: 'Addon Name',
  total_item_cost: 'Total Item Cost',
  packing_charges: 'Packaging Charges',
  delivery_charges: 'Delivery Charges (Inclusive Of Taxes)',
  total_tax: 'GST (Item + Packaging)',
  transaction_charges: 'Transaction Charges',
  coupon_code: 'Coupon Code',
  offer_discount: 'Offer Discount',
  vendor_payout_amount: 'Vendor Payout Amount',
  total_customer_payable: 'Total Customer Payable',
  order_placed_at: 'Placed At',
  vendor_accepted_time: 'Vendor Accepted Time',
  order_accpeted_end_time: 'Accpeted End Time',
  marked_ready_at: 'Marked Ready At',
  picked_up_at: 'Picked Up At',
  delivered_at: 'Delivered At',
  vendor_order_status: 'Vendor Order Status',
  delivery_status: 'Delivery Status',
  order_status: 'Order Status',
  refund_status: 'Refund Status',
  cancelled_by: 'Cancelled By',
  cancellation_reason: 'Cancellation Reason',
  cancellation_time: 'Cancellation Time',
  customer_refund_amount: 'Customer Refund Amount',
  customer_refund_note: 'Customer Refund Note',
  vendor_refund_amount: 'Vendor Refund Amount',
  vendor_refund_note: 'Vendor Refund Note',
  rider_refund_amount: 'Rider Refund Amount',
  rider_refund_note: 'Rider Refund Note',
};
