import {
  readOrdersAsAdminForUpdate,
  readOrdersAsAdmin,
  updateOrder,
  updatePaymentById,
} from '../../../food/order/models';
import {IOrder} from '../../../food/order/types';
import {
  DeliveryStatus,
  OrderCancelledBy,
  OrderStatus,
} from '../../../food/order/enums';
import logger from '../../../../utilities/logger/winston_logger';
import {
  IChannelNotificationMessage,
  IPushNotificationsSQSMessage,
  IWebSocketSQSMessage,
  sendSQSMessage,
  SQS_URL,
} from '../../../../utilities/sqs_manager';
import {getTransaction} from '../../../../data/knex';
import {RefundStatus} from '../../payment/enum';
import {roundUp, sendEmail} from '../../../../utilities/utilFuncs';
import {AdminRole, Service, UserType} from '../../../../enum';
import {updateSubscriptionStatsInRestaurantBasic} from '../../../food/subscription/service';
import {
  IDeliveryOrderStatusCBRequest,
  IDeliveryRiderStatusCBRequest,
} from './types';
import Globals from '../../../../utilities/global_var/globals';
import {
  cancelPetpoojaOrderStatus,
  updatePetpoojaRiderStatus,
} from '../../../food/petpooja/external_call';
import {PosRiderStatus} from '../../../food/petpooja/enum';
import moment from 'moment';
import {getRestaurantVendors} from '../../../../utilities/user_api';
import {updateRestaurantOrderCount} from '../../../food/restaurant/models';

export async function processFoodOrderStatus(
  delivery_data: IDeliveryOrderStatusCBRequest
) {
  const order_id = delivery_data.client_order_id;
  const delivery_order_status = delivery_data.delivery_status;
  const trx = await getTransaction();
  try {
    const order_details = (
      await readOrdersAsAdminForUpdate(trx, [+order_id])
    )[0];
    if (order_details) {
      const order: IOrder = {
        id: order_details.order_id,
        order_status: order_details.order_status,
        pickup_eta: order_details.pickup_eta,
        drop_eta: order_details.drop_eta,
      };
      if (
        order_details.order_status === OrderStatus.CANCELLED ||
        order_details.order_status === OrderStatus.COMPLETED
      ) {
        logger.error(
          `received delivery order status callback for ${order_details.order_status} order for Food API`,
          delivery_data
        );
        await sendEmail(
          'AdminAlertEmailTemplate',
          await Globals.BACKEND_TEAM_EMAIL.get(),
          {
            subject: 'Unexpected Error while processing delivery',
            application_name: Service.FOOD_API,
            error_details: `received delivery order status callback for ${order_details.order_status} order for Food API`,
            priority: 'high',
            time: new Date().toDateString(),
            meta_details: delivery_data,
          }
        );
        await trx.rollback();
      } else {
        let pickup_eta = delivery_data.pickup_eta || 0;
        if (pickup_eta) {
          if (!order_details.vendor_ready_marked_time) {
            const prep_time_passed = roundUp(
              (order_details.preparation_time || 0) -
                (moment().unix() -
                  moment(order_details.vendor_accepted_time).unix()) /
                  60,
              0
            );
            if (prep_time_passed > 0 && pickup_eta < prep_time_passed) {
              pickup_eta = prep_time_passed;
            }
          }
          order.pickup_eta = Math.round(pickup_eta);
        }
        if (delivery_data.drop_eta)
          order.drop_eta = Math.round(delivery_data.drop_eta);

        order.delivery_status = delivery_order_status;

        if (delivery_order_status === DeliveryStatus.DISPATCHED) {
          order.order_pickedup_time = delivery_data.dispatch_time;
        } else if (delivery_order_status === DeliveryStatus.DELIVERED) {
          order.order_status = OrderStatus.COMPLETED;
          order.order_delivered_at = delivery_data.delivery_time;
        } else if (delivery_order_status === DeliveryStatus.CANCELLED) {
          order.order_status = OrderStatus.CANCELLED;
        } else if (
          delivery_order_status === DeliveryStatus.CANCELLED_BY_CUSTOMER
        ) {
          order.order_status = OrderStatus.CANCELLED;
        }
        const notification_payload = {
          order_id: order_details.order_id,
          order_status: order.order_status,
          delivery_status: delivery_order_status,
          pickup_eta: Math.round(delivery_data.pickup_eta),
          drop_eta: Math.round(delivery_data.drop_eta),
          rider_image_url: delivery_data.rider_image_url,
          rider_name: delivery_data.rider_name,
          rider_contact: delivery_data.rider_contact,
          rider_latitude: delivery_data.rider_latitude,
          rider_longitude: delivery_data.rider_longitude,
        };
        const ws_msg: IWebSocketSQSMessage = {
          event: 'WS',
          action: 'DELIVERY_ORDER_STATUS',
          data: {
            // to_room_id: order_details.customer_id,
            to_room_ids: [
              order_details.customer_id,
              order_details.restaurant_id,
            ],
            payload: notification_payload,
          },
        };
        const push_msg: IPushNotificationsSQSMessage = {
          event: 'PUSH_NOTIFICATIONS',
          action: 'SINGLE',
          data: {
            templateID: '',
            templateData: notification_payload,
            userID: order_details.customer_id!,
            userType: UserType.CUSTOMER,
          },
        };
        const vendors = await getRestaurantVendors(
          order_details.restaurant_id!
        );
        const vendor_ids = vendors.map(vendor => {
          return vendor.id;
        });
        const push_msg_vendor: IPushNotificationsSQSMessage = {
          event: 'PUSH_NOTIFICATIONS',
          action: 'BULK',
          data: {
            templateID: '',
            templateData: notification_payload,
            userID: vendor_ids,
            userType: UserType.VENDOR,
          },
        };

        if (order_details.restaurant_details?.parent_id) {
          ws_msg.data.to_room_ids.push(
            order_details.restaurant_details?.parent_id
          );
          const parent_vendors = await getRestaurantVendors(
            order_details.restaurant_details?.parent_id
          );
          const parent_vendor_ids = parent_vendors.map(vendor => {
            return vendor.id;
          });
          push_msg_vendor.data.userID.push(...parent_vendor_ids);
        }
        const channel_msg: IChannelNotificationMessage = {
          event: 'CHANNELS',
          action: 3,
          data: [ws_msg, push_msg, push_msg_vendor],
        };
        if (order.order_status === OrderStatus.COMPLETED) {
          // if pod_status recieved
          if (
            order_details.payment_details[0].is_pod &&
            delivery_data.pod_status
          ) {
            //Update payment
            const payment_id = order_details.payment_details[0].payment_id;
            await updatePaymentById(trx, {
              id: payment_id,
              payment_status: delivery_data.pod_status,
              additional_details: delivery_data.pod_details,
              amount_paid_by_customer: order_details.total_customer_payable,
            });
          }
          push_msg.data.templateID = 'ORDER_COMPLETE_TEMPLATE';
          push_msg_vendor.data.templateID = 'ORDER_COMPLETE_TEMPLATE';
          await sendSQSMessage(SQS_URL.NOTIFICATIONS, channel_msg);
          //* Update Restaurant subscription consumption limit
          await updateSubscriptionStatsInRestaurantBasic(
            order_details.order_id,
            order_details.restaurant_id!
          );
          await updateRestaurantOrderCount(order_details.restaurant_id!);
        } else if (order.order_status === OrderStatus.CANCELLED) {
          /**
             * Reason Code	Reason text
              0	Cancelled by Customer
              1	Rider Not Available or is Late
              2	Customer Not Available
              3	Duplicate Order
              4	Delivery Address Unserviceable or Incorrect
              5	Operational Issue with order
              6	Cancelled by Seller
              7	Rider not having enough cash for purchase
            */
          if (delivery_data.cancel_reason_code === 0) {
            order.cancelled_by = OrderCancelledBy.CUSTOMER;
            logger.debug(
              'delivery cancellation reason',
              'Cancelled by Customer'
            );
          } else if (delivery_data.cancel_reason_code === 1) {
            order.cancelled_by = OrderCancelledBy.DELIVERY;
            logger.debug(
              'delivery cancellation reason',
              'Rider Not Available or is Late'
            );
          } else if (delivery_data.cancel_reason_code === 2) {
            order.cancelled_by = OrderCancelledBy.DELIVERY;
            logger.debug(
              'delivery cancellation reason',
              'Customer Not Available'
            );
          } else if (delivery_data.cancel_reason_code === 3) {
            order.cancelled_by = OrderCancelledBy.DELIVERY;
            logger.debug('delivery cancellation reason', 'Duplicate Order');
            await sendEmail(
              'AdminAlertEmailTemplate',
              await Globals.BACKEND_TEAM_EMAIL.get(),
              {
                subject: 'Unexpected Error while processing delivery callback',
                application_name: Service.FOOD_API,
                error_details: 'cancellation reason: Duplicate Order',
                priority: 'high',
                time: new Date().toDateString(),
                meta_details: delivery_data,
              }
            );
          } else if (delivery_data.cancel_reason_code === 4) {
            order.cancelled_by = OrderCancelledBy.DELIVERY;
            logger.debug(
              'delivery cancellation reason',
              'Delivery Address Unserviceable or Incorrect'
            );
          } else if (delivery_data.cancel_reason_code === 5) {
            order.cancelled_by = OrderCancelledBy.DELIVERY;
            logger.debug(
              'delivery cancellation reason',
              'Operational Issue with order'
            );
          } else if (delivery_data.cancel_reason_code === 6) {
            order.cancelled_by = OrderCancelledBy.VENDOR;
            logger.debug('delivery cancellation reason', 'Cancelled by Seller');
          } else if (delivery_data.cancel_reason_code === 7) {
            order.cancelled_by = OrderCancelledBy.DELIVERY;
            logger.debug(
              'delivery cancellation reason',
              'Rider not having enough cash for purchase'
            );
          } else {
            order.cancelled_by = OrderCancelledBy.DELIVERY;
            logger.debug('could not identify delivery cancellation reason');
          }
          push_msg.data.templateID = 'ORDER_CANCELLED_TEMPLATE';
          push_msg_vendor.data.templateID = 'ORDER_CANCELLED_TEMPLATE';

          ws_msg.action = 'ORDER_CANCELLED';
          ws_msg.data.payload.cancelled_by = 'Delivery Executive';
          ws_msg.data.payload.cancellation_details = {
            cancellation_reason: delivery_data.cancel_reason_text,
          };
          ws_msg.data.payload.cancellation_time = delivery_data.cancel_time;
          order.cancellation_details = {
            cancellation_reason: delivery_data.cancel_reason_text,
          };

          order.cancellation_time = delivery_data.cancel_time;

          if (!order.refund_status) {
            order.refund_status = RefundStatus.APPROVAL_PENDING;
          }
          const order_cancelled_notification_sound =
            await Globals.ORDER_COMPLETE_NOTIFICATION_SOUND.get();
          const push_msg_admin: IPushNotificationsSQSMessage = {
            event: 'PUSH_NOTIFICATIONS',
            action: 'TOPIC',
            data: {
              templateID: 'ADMIN_ORDER_CANCELLED_TEMPLATE',
              templateData: {
                ...notification_payload,
                order_cancelled_notification_sound,
              },
              topics: [AdminRole.OPS_MANAGER],
              userType: UserType.ADMIN,
            },
          };
          channel_msg.data.push(push_msg_admin);
          channel_msg.action++;
          await sendSQSMessage(SQS_URL.NOTIFICATIONS, channel_msg);
        } else {
          await sendSQSMessage(SQS_URL.NOTIFICATIONS, ws_msg);
        }
        order.delivery_details = {
          ...order_details.delivery_details,
          ...delivery_data,
        };
        await updateOrder(trx, order);
        await trx.commit();
        if (order.order_status === OrderStatus.CANCELLED) {
          await cancelPetpoojaOrderStatus(
            order_details.restaurant_id!,
            order.id + '',
            delivery_data.cancel_reason_text || 'Cancelled By Delivery Partner'
          );
        } else if (
          order.delivery_status === DeliveryStatus.ALLOCATED ||
          order.delivery_status === DeliveryStatus.ARRIVED ||
          order.delivery_status === DeliveryStatus.DISPATCHED ||
          order.delivery_status === DeliveryStatus.DELIVERED
        ) {
          let pos_rider_status = PosRiderStatus.ASSIGNED;
          if (order.delivery_status === DeliveryStatus.ARRIVED) {
            pos_rider_status = PosRiderStatus.ARRIVED;
          }
          if (order.delivery_status === DeliveryStatus.DISPATCHED) {
            pos_rider_status = PosRiderStatus.DISPATCHED;
          }
          if (order.delivery_status === DeliveryStatus.DELIVERED) {
            pos_rider_status = PosRiderStatus.DELIVERED;
          }
          await updatePetpoojaRiderStatus(
            order_details.restaurant_id!,
            order.id + '',
            pos_rider_status,
            delivery_data.rider_name,
            delivery_data.rider_contact
          );
        }
      }
    } else {
      logger.error(
        'order details not found in DB while processing delivery order status for Food API',
        delivery_data
      );
      if (process.env.NODE_ENV === 'PROD') {
        await sendEmail(
          'AdminAlertEmailTemplate',
          await Globals.BACKEND_TEAM_EMAIL.get(),
          {
            subject: 'Unexpected Error while processing delivery',
            application_name: Service.FOOD_API,
            error_details:
              'order details not found in DB while processing delivery order status for Food API',
            priority: 'high',
            time: new Date().toDateString(),
            meta_details: delivery_data,
          }
        );
      }
      await trx.rollback();
    }
  } catch (error) {
    logger.error(
      'failed while processing delivery order status for Food API',
      error
    );
    await trx.rollback();
  }
}
export async function processGroceryOrderStatus(
  delivery_data: IDeliveryOrderStatusCBRequest
) {
  await sendSQSMessage(SQS_URL.GROCERY_WORKER, {
    event: 'DELIVERY',
    action: 'ORDER_STATUS_UPDATE',
    data: delivery_data,
  });
}
export async function processPharmacyOrderStatus(
  delivery_data: IDeliveryOrderStatusCBRequest
) {
  await sendSQSMessage(SQS_URL.PHARMACY_WORKER, {
    event: 'DELIVERY',
    action: 'ORDER_STATUS_UPDATE',
    data: delivery_data,
  });
}
export async function processPndOrderStatus(
  delivery_data: IDeliveryOrderStatusCBRequest
) {
  await sendSQSMessage(SQS_URL.PICKUP_DROP_WORKER, {
    event: 'DELIVERY',
    action: 'ORDER_STATUS_UPDATE',
    data: delivery_data,
  });
}

export async function processGroceryRiderStatus(
  delivery_rider_data: IDeliveryRiderStatusCBRequest
) {
  await sendSQSMessage(SQS_URL.GROCERY_WORKER, {
    event: 'DELIVERY',
    action: 'RIDER_STATUS_UPDATE',
    data: delivery_rider_data,
  });
}
export async function processPharmacyRiderStatus(
  delivery_rider_data: IDeliveryRiderStatusCBRequest
) {
  await sendSQSMessage(SQS_URL.PHARMACY_WORKER, {
    event: 'DELIVERY',
    action: 'RIDER_STATUS_UPDATE',
    data: delivery_rider_data,
  });
}
export async function processPndRiderStatus(
  delivery_rider_data: IDeliveryRiderStatusCBRequest
) {
  await sendSQSMessage(SQS_URL.PICKUP_DROP_WORKER, {
    event: 'DELIVERY',
    action: 'RIDER_STATUS_UPDATE',
    data: delivery_rider_data,
  });
}
export async function processFoodRiderStatus(
  delivery_rider_data: IDeliveryRiderStatusCBRequest
) {
  const order_details = (
    await readOrdersAsAdmin([+delivery_rider_data.order_id])
  )[0];
  let pickup_eta = delivery_rider_data.pickup_eta;
  if (!order_details.vendor_ready_marked_time) {
    const prep_time_passed = roundUp(
      (order_details.preparation_time || 0) -
        (moment().unix() - moment(order_details.vendor_accepted_time).unix()) /
          60,
      0
    );
    if (prep_time_passed > 0 && pickup_eta < prep_time_passed) {
      pickup_eta = prep_time_passed;
    }
  }
  if (
    order_details.delivery_status === DeliveryStatus.ARRIVED ||
    order_details.delivery_status === DeliveryStatus.DISPATCHED
  ) {
    pickup_eta = 0;
    const prep_time_passed = roundUp(
      (order_details.preparation_time || 0) -
        (moment().unix() - moment(order_details.vendor_accepted_time).unix()) /
          60,
      0
    );
    if (
      order_details.delivery_status === DeliveryStatus.ARRIVED &&
      !order_details.vendor_ready_marked_time &&
      prep_time_passed > 0 &&
      delivery_rider_data.drop_eta < prep_time_passed
    ) {
      delivery_rider_data.drop_eta = prep_time_passed;
    }
  }
  order_details.drop_eta = Math.round(delivery_rider_data.drop_eta);
  order_details.pickup_eta = Math.round(pickup_eta);
  const trx = await getTransaction();
  try {
    await updateOrder(trx, {
      id: order_details.order_id,
      pickup_eta: order_details.pickup_eta,
      drop_eta: order_details.drop_eta,
      delivery_details: {
        ...order_details.delivery_details!,
        rider_id: delivery_rider_data.rider_id,
        rider_name:
          (delivery_rider_data.rider_name ||
            order_details.delivery_details?.rider_name) + '',
        rider_longitude: delivery_rider_data.rider_longitude,
        rider_latitude: delivery_rider_data.rider_latitude,
        pickup_eta: delivery_rider_data.pickup_eta,
        drop_eta: delivery_rider_data.drop_eta,
      },
    });
    await trx.commit();
  } catch (error) {
    await trx.rollback();
  }
  const ws_msg: IWebSocketSQSMessage = {
    event: 'WS',
    action: 'DELIVERY_RIDER_STATUS',
    data: {
      to_room_ids: [order_details.customer_id, order_details.restaurant_id],
      payload: {
        ...delivery_rider_data,
        order_status: order_details.order_status,
        delivery_status: order_details.delivery_status,
      },
    },
  };
  if (order_details.restaurant_details?.parent_id) {
    ws_msg.data.to_room_ids.push(order_details.restaurant_details?.parent_id);
  }
  await sendSQSMessage(SQS_URL.NOTIFICATIONS, ws_msg);
}

/**
 * processOrderStatus processes the order status updates recived from Delivery system
 */
export async function processDeliveryOrderStatusCB(
  delivery_data: IDeliveryOrderStatusCBRequest
) {
  if (delivery_data) {
    const order_id = delivery_data.client_order_id;
    if (order_id.startsWith('GRO_')) {
      delivery_data.client_order_id = order_id.replace('GRO_', '');
      await processGroceryOrderStatus(delivery_data);
    } else if (order_id.startsWith('PHR_')) {
      delivery_data.client_order_id = order_id.replace('PHR_', '');
      await processPharmacyOrderStatus(delivery_data);
    } else if (order_id.startsWith('RES_')) {
      delivery_data.client_order_id = order_id.replace('RES_', '');
      await processFoodOrderStatus(delivery_data);
    } else if (order_id.startsWith('PND_')) {
      delivery_data.client_order_id = order_id.replace('PND_', '');
      await processPndOrderStatus(delivery_data);
    } else {
      await processFoodOrderStatus(delivery_data);
    }
  } else {
    logger.error(
      'Delivery Callback Failed >> delivery_data not found',
      delivery_data
    );
  }
}

/**
 * processRiderLocationUpdate processes the rider updated location recived from Delivery system
 */
export async function processDeliveryRiderLocationCB(
  delivery_rider_data: IDeliveryRiderStatusCBRequest
) {
  if (delivery_rider_data) {
    const order_id =
      delivery_rider_data.client_order_id || delivery_rider_data.order_id;
    if (order_id.startsWith('GRO_')) {
      delivery_rider_data.order_id = order_id.replace('GRO_', '');
      await processGroceryRiderStatus(delivery_rider_data);
    } else if (order_id.startsWith('PHR_')) {
      delivery_rider_data.order_id = order_id.replace('PHR_', '');
      await processPharmacyRiderStatus(delivery_rider_data);
    } else if (order_id.startsWith('RES_')) {
      delivery_rider_data.order_id = order_id.replace('RES_', '');
      await processFoodRiderStatus(delivery_rider_data);
    } else if (order_id.startsWith('PND_')) {
      delivery_rider_data.order_id = order_id.replace('PND_', '');
      await processPndRiderStatus(delivery_rider_data);
    } else {
      await processFoodRiderStatus(delivery_rider_data);
    }
  } else {
    logger.error(
      'Delivery Callback Failed >> delivery_data not found',
      delivery_rider_data
    );
  }
}
