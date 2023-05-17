import handleErrors from '../../../../../utilities/controllers/handle_errors';
import {Request, Response} from 'express';
import logger from '../../../../../utilities/logger/winston_logger';
import {
  processDeliveryOrderStatusCB,
  processDeliveryRiderLocationCB,
} from '../service';
import {
  IDeliveryOrderStatusCBRequest,
  IDeliveryRiderStatusCBRequest,
} from '../types';
import {DeliveryStatus, PaymentStatus} from '../../../../food/order/enums';

export enum RiderDeliveryStatus {
  PENDING = 'PENDING',
  ALLOTTED = 'ALLOTTED',
  ARRIVED = 'ARRIVED',
  DISPATCHED = 'DISPATCHED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  ARRIVED_CUSTOMER_DOORSTEP = 'ARRIVED_CUSTOMER_DOORSTEP',
}
function getDeliveryStatus(riderDeliveryStatus: RiderDeliveryStatus) {
  let delivery_status: DeliveryStatus = DeliveryStatus.PENDING;
  if (riderDeliveryStatus === RiderDeliveryStatus.ALLOTTED) {
    delivery_status = DeliveryStatus.ALLOCATED;
  }
  if (riderDeliveryStatus === RiderDeliveryStatus.ARRIVED) {
    delivery_status = DeliveryStatus.ARRIVED;
  }
  if (riderDeliveryStatus === RiderDeliveryStatus.DISPATCHED) {
    delivery_status = DeliveryStatus.DISPATCHED;
  }
  if (riderDeliveryStatus === RiderDeliveryStatus.DELIVERED) {
    delivery_status = DeliveryStatus.DELIVERED;
  }
  if (riderDeliveryStatus === RiderDeliveryStatus.ARRIVED_CUSTOMER_DOORSTEP) {
    delivery_status = DeliveryStatus.ARRIVED_CUSTOMER_DOORSTEP;
  }
  if (riderDeliveryStatus === RiderDeliveryStatus.CANCELLED) {
    delivery_status = DeliveryStatus.CANCELLED;
  }
  return delivery_status;
}

export interface IRiderOrderStatusCBRequest {
  order_id: number;
  client_order_id: string;

  rider_id: string;
  rider_image_url: string;
  rider_name: string;
  rider_contact: string;
  rider_latitude: number;
  rider_longitude: number;

  pickup_eta: number;
  drop_eta: number;
  delivery_status: RiderDeliveryStatus;

  allot_time?: Date;
  arrival_time?: Date;
  dispatch_time?: Date;
  delivery_time?: Date;
  cancel_time?: Date;

  cancel_reason_text?: string;
  cancel_reason_code?: number;

  pod_status: PaymentStatus;
  pod_details?: {};
}
export interface IRiderRiderStatusCBRequest {
  order_id: string;
  client_order_id?: string;
  rider_id: string;
  rider_name: string;
  rider_longitude: number;
  rider_latitude: number;
  location_accuracy: string;
  pickup_eta: number;
  drop_eta: number;
}

/**
 * processOrderStatus processes the order status updates recived from rider system
 */
export async function processOrderStatus(req: Request, res: Response) {
  try {
    logger.debug(
      'REQUEST BODY RECEIVED FROM RIDER FOR ORDER STATUS CALLBACK: ',
      req.body
    );
    const rider_data = req.body as IRiderOrderStatusCBRequest;
    const delivery_data: IDeliveryOrderStatusCBRequest = {
      ...rider_data,
      delivery_order_id: rider_data.order_id + '',
      rider_id: rider_data.rider_id + '',
      delivery_status: getDeliveryStatus(rider_data.delivery_status),
    };
    await processDeliveryOrderStatusCB(delivery_data);
    return res.sendStatus(200);
  } catch (error) {
    logger.error('FAIELD TO PROCESS DELIVERY ORDER STATUS CALLBACK', error);
    return handleErrors(res, error);
  }
}

/**
 * processRiderLocationUpdate processes the rider updated location recived from rider system
 */
export async function processRiderLocationUpdate(req: Request, res: Response) {
  try {
    logger.debug(
      'REQUEST BODY RECEIVED FROM RIDER FOR RIDER LOCATION UPDATE CALLBACK: ',
      req.body
    );
    const rider_data = req.body as IRiderRiderStatusCBRequest;
    const delivery_data: IDeliveryRiderStatusCBRequest = {
      ...rider_data,
    };
    await processDeliveryRiderLocationCB(delivery_data);
    return res.sendStatus(200);
  } catch (error) {
    return handleErrors(res, error);
  }
}
