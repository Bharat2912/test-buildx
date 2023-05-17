import {getCustomerDetails, ICustomer} from './utilities/get_customer_details';
import {Knex} from 'knex';
import {insertRecords} from './utilities/insert_records';
import {
  ICartAddonGroup,
  ICartResponse,
  ICartVariantGroup,
  ICustomerAddress,
} from '../cart/types';
import {
  IOrder,
  IOrderAddon,
  IOrderDetails,
  IOrderVariant,
  IPayment,
  IPaymentOrderDetails,
  IVendorOrderDetails,
} from './types';
import {
  DeliveryStatus,
  ExternalPaymentStatus,
  OrderAcceptanceStatus,
  OrderCancelledBy,
  OrderStatus,
  ExternalPaymentEvent,
  PaymentStatus,
} from './enums';
import logger from '../../../utilities/logger/winston_logger';
import {
  bulkInsertPayment,
  getPaymentOrderTableDetailsForUpdate,
  readOrdersAsAdmin,
  updateOrder,
  updatePaymentById,
} from './models';
import ResponseError from '../../../utilities/response_error';
import {v4 as uuidv4} from 'uuid';
import {
  FileObject,
  generateDownloadFileURL,
  saveFileToS3,
} from '../../../utilities/s3_manager';
import moment from 'moment';
import {
  IChannelNotificationMessage,
  IPushNotificationsSQSMessage,
  IUpdateOrderPaymentDetails,
  IUpdateOrderRefundDetails,
  IWebSocketSQSMessage,
  sendSQSMessage,
  SQS_URL,
} from '../../../utilities/sqs_manager';
import {getRestaurantVendors} from '../../../utilities/user_api';
import {humanizeNumber, sendEmail} from '../../../utilities/utilFuncs';
import * as pg from '../../../internal/payment';
import {AdminRole, Service, ServiceTag, UserType} from '../../../enum';
import {IRestaurant} from '../restaurant/models';
import {getTransaction} from '../../../data/knex';
import {ICouponCustomer} from '../coupons/types';
import {
  bulkInsertCouponCustomer,
  readCouponCustomerByCustomerAndCouponId,
  updateCouponCustomerById,
} from '../coupons/models';
import {putCartByUserId} from '../cart/models';
import {RefundGateway, RefundStatus} from '../../core/payment/enum';
import * as delivery from '../../../internal/delivery';
import {IPlaceOrderRequest} from '../../../internal/types';
import Globals from '../../../utilities/global_var/globals';
import {IRefundSettlementDetails} from './invoice';
import {PosPartner} from '../enum';
import {placeOrderAtPetPooja} from '../petpooja/place_order_service';
import pdfMake from 'pdfmake';
import {TDocumentDefinitions} from 'pdfmake/interfaces';
import {generatePdfDocument} from './pdf_service';

async function getTransactionToken(
  customer_data: ICustomer,
  order: IOrder,
  payment: IPayment
) {
  const {transaction_token, payment_gateway} = await pg.getTransactionToken({
    customer_details: {
      customer_id: customer_data.id,
      customer_email: customer_data.email,
      customer_phone: customer_data.phone,
    },
    order_payment_id: payment.id!,
    order_value: order.total_customer_payable!,
  });

  payment.transaction_token = transaction_token;
  payment.payment_gateway = payment_gateway;
  return payment;
}

async function getPaymentSessionId(
  customer_data: ICustomer,
  order: IOrder,
  payment_id: string
) {
  return await pg.getSessionId({
    customer_details: {
      customer_id: customer_data.id,
      customer_email: customer_data.email,
      customer_phone: customer_data.phone,
    },
    order_payment_id: payment_id,
    order_value: order.total_customer_payable!,
  });
}

export async function notifyNewOrderToVendor(
  order_id: number,
  attempt: number
) {
  /**
   * Attemp 0 > first attempt after order cancellation time is passed
   * Attempt 1> first retry to notify vendor
   * Attempt 2.. > notify vendor to take action
   */
  const order_vendor_retry_attempt =
    await Globals.ORDER_VENDOR_RETRY_ATTEMPTS.get();
  const order_details = (await readOrdersAsAdmin([+order_id]))[0];
  if (order_details.order_status !== OrderStatus.PLACED) {
    logger.info(
      'order_status is not placed current status: ',
      order_details.order_status
    );
    return;
  }
  if (order_details.order_acceptance_status !== OrderAcceptanceStatus.PENDING) {
    logger.info(
      'order_acceptance_status is not pending current status: ' +
        order_details.order_acceptance_status,
      order_details
    );
    return;
  }
  const one_view_link =
    process.env.ADMIN_ONEVIEW_ORDER_URL + `${order_details.order_id}`;
  if (attempt >= order_vendor_retry_attempt) {
    await sendEmail(
      'OrderNotAcceptedAlertEmailTemplate',
      await Globals.ORDER_NOT_ACCEPT_ADMIN_EMAIL.get(),
      {
        subject: 'Order not accepted by vendor',
        restaurant_name: order_details.restaurant_details!.restaurant_name,
        order_id: order_details.order_id,
        service: Service.FOOD_API,
        link: one_view_link,
      }
    );
    return;
  }
  const vendors = await getRestaurantVendors(order_details.restaurant_id!);
  const vendor_ids = vendors.map(vendor => {
    return vendor.id;
  });
  if (!vendor_ids || !vendor_ids.length) {
    logger.error(
      'ERROR_WHILE_FETCHING_RESTAURANT_VENDORS',
      order_details.restaurant_id
    );
    throw 'ERROR_WHILE_FETCHING_RESTAURANT_VENDORS';
  }
  const order_reattempt_duration =
    await Globals.ORDER_REATTEMPT_DURATION_IN_SECONDS.get();
  const order_data: IVendorOrderDetails = {
    order_id: order_details.order_id,
    delivery_status: order_details.delivery_status,
    delivery_charges: order_details.delivery_charges,
    delivery_tip: order_details.delivery_tip,
    order_status: order_details.order_status,
    order_acceptance_status: order_details.order_acceptance_status,
    total_customer_payable: order_details.total_customer_payable,
    total_tax: order_details.total_tax,
    packing_charges: order_details.packing_charges,
    offer_discount: order_details.offer_discount,
    coupon_id: order_details.coupon_id,
    any_special_request: order_details.any_special_request,
    order_items: order_details.order_items,
    order_placed_time: order_details.order_placed_time,
    vendor_accepted_end_time: order_details.vendor_accepted_end_time,
    payment_status: order_details.payment_details[0].payment_status!,
    is_pod: order_details.payment_details[0].is_pod!,
  };
  const ws_msg: IWebSocketSQSMessage = {
    event: 'WS',
    action: 'ORDER_PLACED',
    data: {
      to_room_ids: [order_details.restaurant_id!],
      payload: {...order_data, attempt: attempt + 1},
    },
  };
  const push_msg: IPushNotificationsSQSMessage = {
    event: 'PUSH_NOTIFICATIONS',
    action: 'BULK',
    data: {
      templateID: 'ORDER_PLACED_TEMPLATE',
      templateData: {
        items_count: order_data.order_items.length,
        order_id: order_data.order_id,
        total_bill: order_data.total_customer_payable,
        attempt,
      },
      userID: vendor_ids,
      userType: UserType.VENDOR,
    },
  };
  const order_placed_notification_sound =
    await Globals.ORDER_PLACED_NOTIFICATION_SOUND.get();
  const push_msg_admin: IPushNotificationsSQSMessage = {
    event: 'PUSH_NOTIFICATIONS',
    action: 'TOPIC',
    data: {
      templateID: 'ADMIN_ORDER_PLACED_TEMPLATE',
      templateData: {
        items_count: order_data.order_items.length,
        order_id: order_data.order_id,
        total_bill: order_data.total_customer_payable,
        attempt,
        order_placed_notification_sound,
      },
      topics: [AdminRole.OPS_MANAGER],
      userType: UserType.ADMIN,
    },
  };

  if (order_details.restaurant_details?.parent_id) {
    ws_msg.data.to_room_ids.push(order_details.restaurant_details?.parent_id);
    const parent_vendors = await getRestaurantVendors(
      order_details.restaurant_details?.parent_id
    );
    const parent_vendor_ids = parent_vendors.map(vendor => {
      return vendor.id;
    });
    push_msg.data.userID.push(...parent_vendor_ids);
  }
  const channel_msg: IChannelNotificationMessage = {
    event: 'CHANNELS',
    action: 3,
    data: [ws_msg, push_msg, push_msg_admin],
  };
  //*place order in external POS
  if (
    attempt === 0 &&
    !order_details.pos_id &&
    order_details.restaurant_details &&
    order_details.restaurant_details.pos_id &&
    order_details.restaurant_details.pos_partner === PosPartner.PETPOOJA
  ) {
    const trx = await getTransaction();
    try {
      const response = await placeOrderAtPetPooja(order_details);
      const updated_order = await updateOrder(trx, {
        id: order_details.order_id,
        pos_id: response.pos_id,
        pos_partner: PosPartner.PETPOOJA,
      });
      logger.debug(
        'updated order with extenral pos system details',
        updated_order.id
      );
      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  await sendSQSMessage(SQS_URL.NOTIFICATIONS, channel_msg);
  await sendSQSMessage(
    SQS_URL.CORE_WORKER,
    {
      event: 'NEW_ORDER',
      action: 'DELAYED_NOTIFICATION',
      data: {
        order_id: order_data.order_id,
        attempt: attempt + 1,
      },
    },
    order_reattempt_duration
  );
}

/**
 * placeOrder service convert cart to order, checks if delivery executives are avaiable near restaurant
 * @param validatedCart
 * @returns orderDetails
 */
export async function createOrder(
  trx: Knex.Transaction,
  validatedCart: ICartResponse,
  authorizationToken: string
) {
  //create order
  delete validatedCart.cart_id;
  delete validatedCart.cart_status;
  delete validatedCart.last_updated_at;
  //get customer details
  const customer_data = await getCustomerDetails(
    validatedCart.customer_details!.customer_id!,
    authorizationToken
  );
  if (
    validatedCart.customer_details &&
    validatedCart.customer_details.delivery_address
  ) {
    validatedCart.customer_details.delivery_address.customer_name =
      customer_data.full_name;
    validatedCart.customer_details.delivery_address.phone = customer_data.phone;
    validatedCart.customer_details.delivery_address.email = customer_data.email;
    validatedCart.customer_details.delivery_address.alternate_phone =
      customer_data.alternate_phone;
  }
  // insert all order data in respective tables
  const order: IOrder = await insertRecords(trx, validatedCart);

  let payment: IPayment = {
    id: ServiceTag.FOOD_SERVICE_TAG + '_' + uuidv4(),
    order_id: order.id,
    customer_id: customer_data.id,
    payment_status: PaymentStatus.PENDING,
    additional_details: {
      payment_attempt_details: [],
    },
    is_pod: validatedCart.is_pod,
  };

  if (!payment.is_pod) {
    payment = await getTransactionToken(customer_data, order, payment);
  }

  payment = await bulkInsertPayment(trx, [payment]);
  const {customer_details, ...cartDetails} = validatedCart;

  //return response
  const order_details = {
    order_id: order.id,
    order_acceptance_status: order.order_acceptance_status,
    delivery_status: order.delivery_status,
    order_status: order.order_status,
    order_created_at: order.created_at,
    payment_details: {
      id: payment.id,
      payment_status: payment.payment_status,
      transaction_token: payment.transaction_token,
      session_id: payment.session_id,
      is_pod: payment.is_pod,
    },
    customer_details: JSON.parse(
      JSON.stringify({
        full_name: customer_data.full_name,
        phone: customer_data.phone,
        email: customer_data.email,
        alternate_phone: customer_data.alternate_phone,
        ...customer_details,
      })
    ),
    ...cartDetails,
  };
  return {order_details};
}

export async function createOrderV1_1(
  trx: Knex.Transaction,
  validatedCart: ICartResponse,
  authorizationToken: string
) {
  //create order
  delete validatedCart.cart_id;
  delete validatedCart.cart_status;
  delete validatedCart.last_updated_at;
  //get customer details
  const customer_data = await getCustomerDetails(
    validatedCart.customer_details!.customer_id!,
    authorizationToken
  );
  if (
    validatedCart.customer_details &&
    validatedCart.customer_details.delivery_address
  ) {
    validatedCart.customer_details.delivery_address.customer_name =
      customer_data.full_name;
    validatedCart.customer_details.delivery_address.phone = customer_data.phone;
    validatedCart.customer_details.delivery_address.email = customer_data.email;
    validatedCart.customer_details.delivery_address.alternate_phone =
      customer_data.alternate_phone;
  }
  // insert all order data in respective tables
  const order: IOrder = await insertRecords(trx, validatedCart);

  let payment: IPayment = {
    id: ServiceTag.FOOD_SERVICE_TAG + '_' + uuidv4(),
    order_id: order.id,
    customer_id: customer_data.id,
    payment_status: PaymentStatus.PENDING,
    additional_details: {
      payment_attempt_details: [],
    },
    is_pod: validatedCart.is_pod,
  };

  if (!payment.is_pod) {
    const {session_id, payment_gateway} = await getPaymentSessionId(
      customer_data,
      order,
      payment.id!
    );
    payment.session_id = session_id;
    payment.payment_gateway = payment_gateway;
  }

  payment = await bulkInsertPayment(trx, [payment]);
  const {customer_details, ...cartDetails} = validatedCart;

  //return response
  const order_details = {
    order_id: order.id,
    order_acceptance_status: order.order_acceptance_status,
    delivery_status: order.delivery_status,
    order_status: order.order_status,
    order_created_at: order.created_at,
    payment_details: {
      id: payment.id,
      payment_status: payment.payment_status,
      transaction_token: payment.transaction_token,
      session_id: payment.session_id,
      is_pod: payment.is_pod,
    },
    customer_details: JSON.parse(
      JSON.stringify({
        full_name: customer_data.full_name,
        phone: customer_data.phone,
        email: customer_data.email,
        alternate_phone: customer_data.alternate_phone,
        ...customer_details,
      })
    ),
    ...cartDetails,
  };
  return {order_details};
}

/**
 * confirmPayment service check if order payment is completed or not. If payment is completed then the service
 * updates information to payment table
 */
export async function confirmPaymentFromPaymentService(
  trx: Knex.Transaction,
  payment_id: IPayment['id'],
  payment_additional_details: IPayment['additional_details']
) {
  //confirm with external service
  const pgResponse = await pg.getTransactionStatus(payment_id!);
  if (pgResponse.status === 'pending') {
    throw new ResponseError(400, [
      {
        message: 'payment pending',
        code: 1049,
      },
    ]);
  } else if (pgResponse.status === 'failed') {
    const updatedPaymentRecord: IPayment = {
      id: payment_id,
      transaction_id: pgResponse.transaction_id,
      additional_details: pgResponse,
    };
    await updatePaymentById(trx, updatedPaymentRecord);
    throw new ResponseError(400, [
      {
        message: 'payment pending',
        code: 1049,
      },
    ]);
  } else {
    payment_additional_details.payment_attempt_details.push({
      external_payment_id: pgResponse.external_payment_id,
      external_payment_status: pgResponse.transaction_details.payment_status,
      payment_message: pgResponse.payment_message,
      payment_method: pgResponse.transaction_details.payment_method_details,
      payment_group: pgResponse.transaction_details.payment_group,
      bank_reference: pgResponse.transaction_details.bank_reference,
      auth_id: pgResponse.transaction_details.auth_id,
      transaction_time: pgResponse.transaction_time,
      transaction_amount: pgResponse.transaction_amount,
    });
    const updatedPaymentRecord: IPayment = {
      id: payment_id,
      transaction_id: pgResponse.external_payment_id,
      payment_status: PaymentStatus.COMPLETED,
      additional_details: payment_additional_details,
      payment_method: pgResponse.payment_method,
      transaction_time: pgResponse.transaction_time,
      amount_paid_by_customer: pgResponse.transaction_amount,
    };
    await updatePaymentById(trx, updatedPaymentRecord);
    logger.info(`Payment id: ${payment_id} confirmed and updated successfully`);
    return updatedPaymentRecord;
  }
}
// eslint-disable-next-line
export async function formatOrderResponse(orders: any[]) {
  for (let i = 0; i < orders.length; i++) {
    if (!orders[i].order_items) orders[i].order_items = [];
    for (let j = 0; j < orders[i].order_items.length; j++) {
      //restructure order variants
      if (orders[i].order_items[j].order_variants) {
        orders[i].order_items[j].variant_groups = Object.values(
          orders[i].order_items[j].order_variants.reduce(
            (
              r: {[key: string]: ICartVariantGroup},
              {variant_group_id, variant_group_name, ...rest}: IOrderVariant
            ) => {
              const key = `${variant_group_id}-${variant_group_name}`;
              r[key] = {
                variant_group_id: variant_group_id!,
                variant_group_name,
                variants: [],
              };
              r[key]['variants'].push({
                variant_group_id,
                ...rest,
              });
              return r;
            },
            {}
          )
        );
        delete orders[i].order_items[j].order_variants;
      } else {
        delete orders[i].order_items[j].order_variants;
        orders[i].order_items[j].variant_groups = [];
      }

      //restructure order addons
      if (orders[i].order_items[j].order_addons) {
        orders[i].order_items[j].addon_groups = Object.values(
          orders[i].order_items[j].order_addons.reduce(
            (
              r: {[key: string]: ICartAddonGroup},
              {addon_group_id, addon_group_name, ...rest}: IOrderAddon
            ) => {
              const key = `${addon_group_id}-${addon_group_name}`;
              if (!r[key]) {
                r[key] = {
                  addon_group_id,
                  addon_group_name: addon_group_name!,
                  addons: [
                    {
                      addon_group_id,
                      ...rest,
                    },
                  ],
                };
              } else {
                r[key]['addons'].push({
                  addon_group_id,
                  ...rest,
                });
              }
              return r;
            },
            {}
          )
        );
        delete orders[i].order_items[j].order_addons;
      } else {
        delete orders[i].order_items[j].order_addons;
        orders[i].order_items[j].addon_groups = [];
      }
    }

    //generate Download url for restaurant image
    if (orders[i].restaurant_details && orders[i].restaurant_details.image) {
      orders[i].restaurant_details.image = await generateDownloadFileURL(
        orders[i].restaurant_details.image
      );
      orders[i].restaurant_details.like_count_label = humanizeNumber(
        orders[i].restaurant_details.like_count
      );
    }
  }
}

export function calculateCombinedOrderStatus(
  order_status: OrderStatus,
  delivery_status: DeliveryStatus,
  order_acceptance_status: OrderAcceptanceStatus,
  payment_status: PaymentStatus,
  cancelled_by?: string,
  vendor_ready_marked_time?: Date
) {
  let order_status_code = 0;
  let order_status_title = 'Order Unknown';
  let order_status_label = 'could not identify order status';

  if (order_status === OrderStatus.PENDING) {
    if (order_acceptance_status === OrderAcceptanceStatus.PENDING) {
      order_status_code = 101;
      order_status_title = 'Payment Pending';
      order_status_label = 'Order payment is pending';
    }
  } else if (order_status === OrderStatus.PLACED) {
    if (order_acceptance_status === OrderAcceptanceStatus.PENDING) {
      order_status_code = 102;
      order_status_title = 'Order Placed';
      order_status_label = 'Waiting for restaurant to accept the order.';
    } else if (order_acceptance_status === OrderAcceptanceStatus.ACCEPTED) {
      if (delivery_status === DeliveryStatus.ACCEPTED) {
        order_status_code = 103;
        order_status_title = 'Order Accepted';
        order_status_label = 'Food being prepared';
      } else if (delivery_status === DeliveryStatus.ALLOCATED) {
        if (!vendor_ready_marked_time) {
          order_status_code = 105;
          order_status_title = 'Rider Assigned';
          order_status_label = 'The rider will pick up your order shortly.';
        } else {
          order_status_code = 106;
          order_status_title = 'Food Ready';
          order_status_label = 'The rider will pick up your order shortly.';
        }
      } else if (delivery_status === DeliveryStatus.ARRIVED) {
        if (vendor_ready_marked_time) {
          order_status_code = 108;
          order_status_title = 'Rider Arrived';
          order_status_label = 'The rider is picking up your order';
        } else {
          order_status_code = 108;
          order_status_title = 'Rider Arrived';
          order_status_label = 'Food being prepared';
        }
      } else if (delivery_status === DeliveryStatus.DISPATCHED) {
        order_status_code = 107;
        order_status_title = 'Order Picked up';
        order_status_label = 'Food on the way to you.';
      } else if (delivery_status === DeliveryStatus.ARRIVED_CUSTOMER_DOORSTEP) {
        order_status_code = 109;
        order_status_title = 'Order Arrived';
        order_status_label = 'Rider has arrived customers doorstep';
      }
    }
  } else if (order_status === OrderStatus.COMPLETED) {
    order_status_code = 110;
    order_status_title = 'Order Delivered';
    order_status_label = 'Rider has delivered the order to customer';
  } else if (order_status === OrderStatus.CANCELLED) {
    if (cancelled_by === OrderCancelledBy.VENDOR) {
      order_status_code = 111;
      order_status_title = 'Order Cancelled';
      order_status_label = 'Order has been cancelled by restaurant';
    } else if (cancelled_by === OrderCancelledBy.DELIVERY) {
      order_status_code = 112;
      order_status_title = 'Order Cancelled';
      order_status_label = 'Order has been cancelled by delivery executive';
    } else if (cancelled_by === OrderCancelledBy.CUSTOMER) {
      order_status_code = 113;
      order_status_title = 'Order Cancelled';
      order_status_label = 'Order has been cancelled by customer';
    } else if (cancelled_by === OrderCancelledBy.ADMIN) {
      order_status_code = 114;
      order_status_title = 'Order Cancelled';
      order_status_label = 'Order has been cancelled by speedyy';
    }
  }
  return {order_status_label, order_status_code, order_status_title};
}
// export function calculateCombinedOrderStatusx(
//   order_status: OrderStatus,
//   delivery_status: DeliveryStatus,
//   order_acceptance_status: OrderAcceptanceStatus,
//   payment_status: PaymentStatus,
//   cancelled_by?: string,
//   vendor_ready_marked_time?: Date
// ) {
//   let order_status_title;
//   let order_status_label;
//   let order_status_code;
//   if (
//     order_status === OrderStatus.CANCELLED &&
//     cancelled_by === OrderCancelledBy.CUSTOMER
//   ) {
//     order_status_code = 113;
//     order_status_title = 'Order Cancelled';
//     order_status_label = 'Order has been cancelled by customer';
//   } else if (
//     order_status === OrderStatus.CANCELLED &&
//     cancelled_by === OrderCancelledBy.ADMIN
//   ) {
//     order_status_code = 114;
//     order_status_title = 'Order Cancelled';
//     order_status_label = 'Order has been cancelled by speedyy';
//   } else if (
//     order_status === OrderStatus.PENDING &&
//     // payment_status === PaymentStatus.PENDING &&
//     order_acceptance_status === OrderAcceptanceStatus.PENDING &&
//     delivery_status === DeliveryStatus.PENDING
//   ) {
//     order_status_title = 'Payment Pending';
//     order_status_label = 'Order payment is pending';
//     order_status_code = 101;
//   } else if (
//     order_status === OrderStatus.PLACED &&
//     // payment_status === PaymentStatus.COMPLETED &&
//     order_acceptance_status === OrderAcceptanceStatus.PENDING &&
//     delivery_status === DeliveryStatus.PENDING
//   ) {
//     // order_status_label = 'Waiting for the restaurant to accept your order';
//     order_status_title = 'Order Placed';
//     order_status_label = 'Waiting for restaurant to accept the order.';
//     order_status_code = 102;
//   } else if (
//     order_status === OrderStatus.PLACED &&
//     // payment_status === PaymentStatus.COMPLETED &&
//     order_acceptance_status === OrderAcceptanceStatus.ACCEPTED &&
//     delivery_status === DeliveryStatus.ACCEPTED
//   ) {
//     // order_status_label =
//     //   'Your order has been accepted by restaurant. Searching for riders';
//     order_status_title = 'Order Accepted';
//     order_status_label = 'Food being prepared';
//     order_status_code = 103;
//   }
//   // else if (
//   //   order_status === OrderStatus.PLACED &&
//   //   payment_status === PaymentStatus.COMPLETED &&
//   //   order_acceptance_status === OrderAcceptanceStatus.ACCEPTED &&
//   //   delivery_status === DeliveryStatus.ACCEPTED
//   // ) {
//   //   order_status_label = 'Searching for riders';
//   //   order_status_code = 104;
//   // }
//   else if (
//     order_status === OrderStatus.PLACED &&
//     // payment_status === PaymentStatus.COMPLETED &&
//     order_acceptance_status === OrderAcceptanceStatus.ACCEPTED &&
//     delivery_status === DeliveryStatus.ALLOCATED &&
//     !vendor_ready_marked_time
//   ) {
//     // order_status_label = 'Rider has been allocated';
//     order_status_title = 'Rider Assigned';
//     order_status_label = 'Rider has been assigned';
//     order_status_code = 105;
//   } else if (
//     order_status === OrderStatus.PLACED &&
//     // payment_status === PaymentStatus.COMPLETED &&
//     order_acceptance_status === OrderAcceptanceStatus.ACCEPTED &&
//     delivery_status === DeliveryStatus.ALLOCATED &&
//     vendor_ready_marked_time
//   ) {
//     order_status_title = 'Food Ready';
//     order_status_label = 'The rider will pick up your order shortly.';
//     order_status_code = 106;
//   } else if (
//     order_status === OrderStatus.PLACED &&
//     // payment_status === PaymentStatus.COMPLETED &&
//     order_acceptance_status === OrderAcceptanceStatus.ACCEPTED &&
//     delivery_status === DeliveryStatus.DISPATCHED
//   ) {
//     // order_status_label =
//     //   'Rider has picked up order from restaurant. Rider is on the way to your location';
//     order_status_title = 'Order Dispatched';
//     order_status_label =
//       'Rider has picked up the order from the restaurant and is on the way to your location';
//     order_status_code = 107;
//   } else if (
//     order_status === OrderStatus.PLACED &&
//     // payment_status === PaymentStatus.COMPLETED &&
//     order_acceptance_status === OrderAcceptanceStatus.ACCEPTED &&
//     delivery_status === DeliveryStatus.ARRIVED
//   ) {
//     // order_status_label = 'Rider has arrived at restaurant';
//     order_status_title = 'Rider Arrived';
//     order_status_label = 'Food being prepared';
//     order_status_code = 108;
//   } else if (
//     order_status === OrderStatus.PLACED &&
//     // payment_status === PaymentStatus.COMPLETED &&
//     order_acceptance_status === OrderAcceptanceStatus.ACCEPTED &&
//     delivery_status === DeliveryStatus.ARRIVED_CUSTOMER_DOORSTEP
//   ) {
//     order_status_code = 109;
//     order_status_title = 'Order Arrived';
//     order_status_label = 'Rider has arrived customers doorstep';
//   } else if (order_status === OrderStatus.COMPLETED) {
//     order_status_label =
//       'Rider has delivered the order to customer. order has been completed';
//     order_status_title = 'Order Delivered';
//     order_status_code = 110;
//   } else if (
//     order_status === OrderStatus.CANCELLED &&
//     cancelled_by === OrderCancelledBy.VENDOR
//   ) {
//     order_status_code = 111;
//     order_status_title = 'Order Cancelled';
//     order_status_label = 'Your order has been cancelled by restaurant';
//   } else if (
//     order_status === OrderStatus.CANCELLED &&
//     cancelled_by === OrderCancelledBy.DELIVERY
//   ) {
//     order_status_code = 112;
//     order_status_title = 'Order Cancelled';
//     order_status_label =
//       'order delivery has been cancelled by delivery executive';
//   } else {
//     order_status_code = 0;
//     order_status_title = 'Order Unknown';
//     order_status_label = 'could not identify order status';
//   }

//   return {order_status_label, order_status_code, order_status_title};
// }
export async function updateOrderDetailsWithDynamicValues(
  orders: IOrderDetails[]
) {
  for (let i = 0; i < orders.length; i++) {
    let order_payment_status: PaymentStatus;
    const order = orders[i];
    const order_completed_payment = orders[i].payment_details.find(
      payment =>
        payment.is_pod || payment.payment_status === PaymentStatus.COMPLETED
    );

    //check if payment is confirmed or not else set payment status to last payment attempt status made on this order
    if (order_completed_payment) {
      order_payment_status = order_completed_payment.payment_status!;

      const order_cancellation_duration =
        await Globals.ORDER_CANCELLATION_DURATION_IN_SECONDS.get();

      const cancellation_refund_end_time = Math.ceil(
        moment(order.order_placed_time!)
          .add(order_cancellation_duration, 's')
          .valueOf() / 1000
      );

      orders[i].cancellation_refund_end_time = cancellation_refund_end_time;
    } else {
      order_payment_status = orders[i].payment_details[0].payment_status!;
      orders[i].cancellation_refund_end_time = null;
    }

    const status_details = calculateCombinedOrderStatus(
      orders[i].order_status!,
      orders[i].delivery_status!,
      orders[i].order_acceptance_status!,
      order_payment_status!,
      orders[i].cancelled_by,
      orders[i].vendor_ready_marked_time
    );

    orders[i].order_status_label = status_details.order_status_label;
    orders[i].order_status_code = status_details.order_status_code;
    orders[i].order_status_title = status_details.order_status_title;
  }
}

export async function updateVendorOrderDetailsWithDynamicValues(
  orders: IVendorOrderDetails[]
) {
  for (let i = 0; i < orders.length; i++) {
    const status_details = calculateCombinedOrderStatus(
      orders[i].order_status!,
      orders[i].delivery_status!,
      orders[i].order_acceptance_status!,
      orders[i].payment_status!, //vendor can only see orders with completed payments
      orders[i].cancelled_by,
      orders[i].vendor_ready_marked_time
    );

    const order_cancellation_duration =
      await Globals.ORDER_CANCELLATION_DURATION_IN_SECONDS.get();

    const cancellation_refund_end_time = Math.abs(
      moment(orders[i].order_placed_time!)
        .add(
          order_cancellation_duration +
            +(process.env.ORDER_CANCELLATION_DELAY || 5),
          's'
        )
        .valueOf() / 1000
    );
    orders[i].cancellation_refund_end_time = cancellation_refund_end_time;
    orders[i].order_status_label = status_details.order_status_label;
    orders[i].order_status_code = status_details.order_status_code;
    orders[i].order_status_title = status_details.order_status_title;
  }
}
function buildAddress(customer_address: ICustomerAddress): string {
  let address =
    customer_address.house_flat_block_no +
    ', ' +
    customer_address.apartment_road_area +
    ', ' +
    customer_address.city +
    ', ' +
    customer_address.state +
    ', ' +
    customer_address.country +
    '-' +
    customer_address.pincode +
    '.';
  if (customer_address.directions) {
    address += customer_address.directions;
  }
  return address;
}

export async function placeDeliveryOrder(
  order_details: IVendorOrderDetails,
  restaurant_details: IRestaurant
) {
  const order_items = order_details.order_items.map(item => {
    return {
      name: item.name!,
      price: item.price!,
      quantity: item.quantity!,
      id: item.order_item_id + '',
    };
  });
  const payload: IPlaceOrderRequest = {
    is_pod: order_details.is_pod,
    delivery_service: order_details.delivery_service!,
    service_name: 'food',
    pickup_details: {
      city: restaurant_details.city!,
      contact_number:
        restaurant_details.poc_number ||
        restaurant_details.manager_contact_number ||
        restaurant_details.owner_contact_number!,
      name: restaurant_details.name!,
      longitude: restaurant_details.long!,
      latitude: restaurant_details.lat!,
      address: restaurant_details.location!,
    },
    drop_details: {
      city: order_details.customer_address!.city!,
      name: order_details.customer_address!.customer_name!,
      longitude: +order_details.customer_address!.longitude,
      latitude: +order_details.customer_address!.latitude,
      contact_number: order_details.customer_address!.phone!,
      address: buildAddress(order_details.customer_address!),
    },
    order_details: {
      order_id: order_details.order_id + '',
      payment_status: 'pre-paid',
      order_value: order_details.total_customer_payable!,
    },
    order_items: order_items,
  };

  const result = await delivery.placeOrder(payload);
  return result;
}

// Process Placing order on payment callback from payment gateway
export async function processOrderPaymentDetails(
  sqs_data: IUpdateOrderPaymentDetails['data']
) {
  const trx = await getTransaction();
  try {
    const payment_and_order_details =
      await getPaymentOrderTableDetailsForUpdate(
        trx,
        sqs_data.data.payment_details.transaction_id,
        sqs_data.data.customer_details.customer_id
      );
    if (!payment_and_order_details) {
      // throw 'can not find payment order details while processing payment status update';
      logger.error(
        'can not find payment order details while processing payment status update',
        sqs_data
      );
      await trx.rollback();
      return;
    }
    if (payment_and_order_details.payment_status === PaymentStatus.COMPLETED) {
      logger.error(
        'payment is already completed no need to process payment updates',
        sqs_data
      );
      await trx.rollback();
      return;
    }
    const updated_payment_attempt_details =
      payment_and_order_details.additional_details.payment_attempt_details;
    updated_payment_attempt_details.push({
      external_payment_id: sqs_data.data.payment_details.external_payment_id,
      external_payment_status: sqs_data.data.payment_details.payment_status,
      payment_message: sqs_data.data.payment_details.payment_message,
      payment_method: sqs_data.data.payment_details.payment_method_details,
      payment_group: sqs_data.data.payment_details.payment_group,
      bank_reference: sqs_data.data.payment_details.bank_reference,
      auth_id: sqs_data.data.payment_details.auth_id,
      error_details: sqs_data.data.error_details,
      transaction_time: sqs_data.data.payment_details.transaction_time,
      transaction_amount: sqs_data.data.payment_details.transaction_amount,
      payment_gateway_details: sqs_data.data.payment_gateway_details,
    });
    if (
      sqs_data.type === ExternalPaymentEvent.PAYMENT_SUCCESS_WEBHOOK &&
      sqs_data.data.payment_details.payment_status ===
        ExternalPaymentStatus.SUCCESS
    ) {
      const updatedPaymentRecord: IPayment = {
        id: sqs_data.data.payment_details.transaction_id,
        transaction_id: sqs_data.data.payment_details.external_payment_id,
        payment_status: PaymentStatus.COMPLETED,
        additional_details: {
          payment_attempt_details: updated_payment_attempt_details,
        },
        payment_method: sqs_data.data.payment_details.payment_method,
        transaction_time: sqs_data.data.payment_details.transaction_time,
        amount_paid_by_customer:
          sqs_data.data.payment_details.transaction_amount,
      };
      // const updated_payment_details =
      await updatePaymentById(trx, updatedPaymentRecord);

      /**
       * !If payment is completed but order is cancelled in between of payment confirmation
       * !then update successful payment details in payment table
       */
      if (payment_and_order_details.invoice_breakout) {
        payment_and_order_details.invoice_breakout.payment_transaction_id =
          sqs_data.data.payment_details.external_payment_id;
      }
      await placeOrderToVendor(trx, payment_and_order_details);
      await trx.commit();
    } else if (
      sqs_data.type === ExternalPaymentEvent.PAYMENT_FAILED_WEBHOOK &&
      sqs_data.data.payment_details.payment_status ===
        ExternalPaymentStatus.FAILED
    ) {
      const updatedPaymentRecord: IPayment = {
        id: sqs_data.data.payment_details.transaction_id,
        additional_details: {
          payment_attempt_details: updated_payment_attempt_details,
        },
      };
      await updatePaymentById(trx, updatedPaymentRecord);

      await trx.commit();
    } else if (
      sqs_data.type === ExternalPaymentEvent.PAYMENT_USER_DROPPED_WEBHOOK &&
      sqs_data.data.payment_details.payment_status ===
        ExternalPaymentStatus.USER_DROPPED
    ) {
      const updatedPaymentRecord: IPayment = {
        id: sqs_data.data.payment_details.transaction_id,
        additional_details: {
          payment_attempt_details: updated_payment_attempt_details,
        },
      };
      await updatePaymentById(trx, updatedPaymentRecord);
      await trx.commit();
    } else {
      logger.error(
        'invalid external payment event type or invalid external payment status',
        sqs_data
      );
      throw 'invalid payment event type';
    }
  } catch (error) {
    await trx.rollback();
    throw error;
  }
}

export async function processOrderRefundDetails(
  data: IUpdateOrderRefundDetails['data']
) {
  const order = (await readOrdersAsAdmin([data.order_id]))[0];
  if (!order) {
    throw 'invalid order id';
  }
  const trx = await getTransaction();
  try {
    if (!order.additional_details) {
      order.additional_details = {};
    }
    const additional_details = JSON.parse(
      JSON.stringify(order.additional_details)
    );
    additional_details.refund_details = data;
    const updated_order = await updateOrder(trx, {
      id: order.order_id,
      refund_status: data.refund_status,
      additional_details: additional_details,
    });
    logger.debug('order updated with refund details', updated_order);
    if (updated_order.refund_status === RefundStatus.PENDING) {
      await sendSQSMessage(SQS_URL.NOTIFICATIONS, {
        event: 'PUSH_NOTIFICATIONS',
        action: 'SINGLE',
        data: {
          templateID: 'CUSTOMER_REFUND_INITIATED',
          templateData: {
            refund_id: data.refund_id,
            order_id: order.order_id,
            order_status: order.order_status,
            refund_status: data.refund_status,
            customer_refund_amount: data.refund_amount,
          },
          userID: order.customer_id!,
          userType: UserType.CUSTOMER,
        },
      });
    } else if (updated_order.refund_status === RefundStatus.SUCCESS) {
      await sendSQSMessage(SQS_URL.NOTIFICATIONS, {
        event: 'PUSH_NOTIFICATIONS',
        action: 'SINGLE',
        data: {
          templateID: 'CUSTOMER_REFUND_SUCCESSFUL',
          templateData: {
            refund_id: data.refund_id,
            order_id: order.order_id,
            order_status: order.order_status,
            refund_status: data.refund_status,
            processed_at: data.processed_at,
            customer_refund_amount: data.refund_amount,
          },
          userID: order.customer_id!,
          userType: UserType.CUSTOMER,
        },
      });
    }
    await trx.commit();
  } catch (error) {
    await trx.rollback();
    throw error;
  }
}
export async function couponCustomerUpdateService(
  trx: Knex.Transaction,
  coupon_id: number,
  customer_id: string
) {
  const coupon_customer_details: ICouponCustomer =
    await readCouponCustomerByCustomerAndCouponId(coupon_id, customer_id);
  if (coupon_customer_details) {
    //update
    await updateCouponCustomerById(trx, coupon_customer_details.id!, {
      coupon_use_count: coupon_customer_details.coupon_use_count! + 1,
      last_time_used: new Date(),
    });
  } else {
    //insert
    await bulkInsertCouponCustomer(trx, [
      {
        customer_id: customer_id,
        coupon_id: coupon_id,
        last_time_used: new Date(),
        coupon_use_count: 1,
      },
    ]);
  }
}

export async function placeOrderToVendor(
  trx: Knex.Transaction,
  payment_and_order_details: IPaymentOrderDetails
) {
  //*Post payment confirmation activities - start

  const delay = await Globals.ORDER_CANCELLATION_DELAY_IN_SECONDS.get();
  const order_cancellation_refund_duration =
    await Globals.ORDER_CANCELLATION_DURATION_IN_SECONDS.get();
  const place_order_at_vendor_in_seconds =
    order_cancellation_refund_duration + delay;

  if (payment_and_order_details.order_status === OrderStatus.PLACED) {
    const order_cancellation_duration = {
      start_time: Math.ceil(
        new Date(payment_and_order_details.order_placed_time!).getTime() / 1000
      ),
      end_time:
        Math.ceil(
          new Date(payment_and_order_details.order_placed_time!).getTime() /
            1000
        ) + order_cancellation_refund_duration,
    };
    return {order_cancellation_duration};
  }

  await sendSQSMessage(
    SQS_URL.CORE_WORKER,
    {
      event: 'NEW_ORDER',
      action: 'DELAYED_NOTIFICATION',
      data: {
        order_id: payment_and_order_details.order_id!,
        attempt: 0,
      },
    },
    place_order_at_vendor_in_seconds
  );

  //*if coupon is used then update coupon customer table
  if (payment_and_order_details.coupon_id) {
    await couponCustomerUpdateService(
      trx,
      payment_and_order_details.coupon_id,
      payment_and_order_details.customer_id!
    );
  }
  //*once payment is completed clear user cart
  const dynamoDB_response = await putCartByUserId(
    payment_and_order_details.customer_id!,
    {}
  );
  logger.info('delete user cart from dynamoDB response: ', dynamoDB_response);
  //*Post payment confirmation activities - end

  const updated_order = await updateOrder(trx, {
    id: payment_and_order_details.order_id,
    order_placed_time: new Date(),
    order_status: OrderStatus.PLACED,
    invoice_breakout: payment_and_order_details.invoice_breakout,
  });
  const order_cancellation_duration = {
    start_time: Math.ceil(
      new Date(updated_order.order_placed_time!).getTime() / 1000
    ),
    end_time:
      Math.ceil(new Date(updated_order.order_placed_time!).getTime() / 1000) +
      order_cancellation_refund_duration,
  };
  return {order_cancellation_duration};
}

export async function settleRefund(
  refund_settlement_details: IRefundSettlementDetails,
  order: IOrder,
  payment: IPayment
) {
  order.invoice_breakout!.refund_settlement_details = refund_settlement_details;
  if (refund_settlement_details.refund_settled_customer_amount > 0) {
    order.refund_status = RefundStatus.PENDING;
    if (!order.additional_details) {
      order.additional_details = {};
    }
    order.additional_details!.refund_details = {
      payment_id: payment.id!,
      order_id: order.id!,
      customer_id: payment.customer_id!,
      refund_gateway: RefundGateway.CASHFREE,
      refund_charges: 0,
      created_at: new Date(),
      refund_status: RefundStatus.PENDING,
      status_description: 'customer refund has been initiated',
    };
    await sendSQSMessage(SQS_URL.CORE_WORKER, {
      event: 'REFUND',
      action: 'CREATE',
      data: {
        service: 'food',
        payment_id: payment.id!,
        order_id: order.id!,
        customer_id: payment.customer_id!,
        refund_gateway: RefundGateway.CASHFREE,
        refund_charges: 0,
        is_pod: payment.is_pod!,
        refund_amount: refund_settlement_details.refund_settled_customer_amount,
        refund_currency: 'INR',
        refund_note:
          refund_settlement_details.refund_settlement_note_to_customer,
      },
    });
  } else {
    order.refund_status = RefundStatus.SUCCESS;
  }
  return order;
}

export async function createPdfAndSaveToS3(
  doc: PDFKit.PDFDocument,
  file: FileObject
): Promise<FileObject> {
  logger.debug('saving invoice in s3 file path', file);
  return await new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', async () => {
      try {
        const file_with_url = await saveFileToS3(
          false,
          Buffer.concat(chunks),
          file
        );
        logger.debug('order invoice pdf file overwritten in s3', file_with_url);
        resolve(file_with_url);
      } catch (error) {
        logger.error('GOT ERROR WHILE SAVING INVOICE IN S3', error);
        reject(error);
      }
    });
    doc.end();
  });
}

export async function createOrderInvoicePdf(
  order: IOrderDetails,
  restaurant: IRestaurant
) {
  const printer = new pdfMake({
    Courier: {
      normal: 'Courier',
      bold: 'Courier-Bold',
      italics: 'Courier-Oblique',
      bolditalics: 'Courier-BoldOblique',
    },
    Helvetica: {
      normal: 'Helvetica',
      bold: 'Helvetica-Bold',
      italics: 'Helvetica-Oblique',
      bolditalics: 'Helvetica-BoldOblique',
    },
    Times: {
      normal: 'Times-Roman',
      bold: 'Times-Bold',
      italics: 'Times-Italic',
      bolditalics: 'Times-BoldItalic',
    },
    Symbol: {
      normal: 'Symbol',
    },
    ZapfDingbats: {
      normal: 'ZapfDingbats',
    },
  });
  const pdf_document = await generatePdfDocument(order, restaurant);

  return printer.createPdfKitDocument(pdf_document);
}

export async function createOrderSummaryPdf(order: IOrderDetails) {
  const printer = new pdfMake({
    Courier: {
      normal: 'Courier',
      bold: 'Courier-Bold',
      italics: 'Courier-Oblique',
      bolditalics: 'Courier-BoldOblique',
    },
    Helvetica: {
      normal: 'Helvetica',
      bold: 'Helvetica-Bold',
      italics: 'Helvetica-Oblique',
      bolditalics: 'Helvetica-BoldOblique',
    },
    Times: {
      normal: 'Times-Roman',
      bold: 'Times-Bold',
      italics: 'Times-Italic',
      bolditalics: 'Times-BoldItalic',
    },
    Symbol: {
      normal: 'Symbol',
    },
    ZapfDingbats: {
      normal: 'ZapfDingbats',
    },
  });

  const pdf_document: TDocumentDefinitions = {
    content: [
      {
        text: `order id: ${order.order_id}`,
        fontSize: 10,
      },
    ],
    defaultStyle: {
      font: 'Helvetica',
    },
  };
  return printer.createPdfKitDocument(pdf_document);
}
