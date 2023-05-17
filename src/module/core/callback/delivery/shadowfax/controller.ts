import handleErrors from '../../../../../utilities/controllers/handle_errors';
import {Request, Response} from 'express';
import logger from '../../../../../utilities/logger/winston_logger';
import axios from 'axios';
import * as secretStore from '../../../../../utilities/secret/secret_store';
import {
  sendError,
  sendSuccess,
} from '../../../../../utilities/controllers/handle_response';
import Joi from 'joi';
import {
  processDeliveryOrderStatusCB,
  processDeliveryRiderLocationCB,
} from '../service';
import {
  IDeliveryOrderStatusCBRequest,
  IDeliveryRiderStatusCBRequest,
} from '../types';
import {DeliveryStatus} from '../../../../food/order/enums';

export enum SfxOrderStatus {
  PENDING = 'PENDING',
  ALLOTTED = 'ALLOTTED',
  ARRIVED = 'ARRIVED',
  DISPATCHED = 'DISPATCHED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  ARRIVED_CUSTOMER_DOORSTEP = 'ARRIVED_CUSTOMER_DOORSTEP',
}
function getDeliveryStatus(sfxOrderStatus: SfxOrderStatus) {
  let delivery_status: DeliveryStatus = DeliveryStatus.PENDING;
  if (sfxOrderStatus === SfxOrderStatus.ALLOTTED) {
    delivery_status = DeliveryStatus.ALLOCATED;
  }
  if (sfxOrderStatus === SfxOrderStatus.ARRIVED) {
    delivery_status = DeliveryStatus.ARRIVED;
  }
  if (sfxOrderStatus === SfxOrderStatus.DISPATCHED) {
    delivery_status = DeliveryStatus.DISPATCHED;
  }
  if (sfxOrderStatus === SfxOrderStatus.DELIVERED) {
    delivery_status = DeliveryStatus.DELIVERED;
  }
  if (sfxOrderStatus === SfxOrderStatus.ARRIVED_CUSTOMER_DOORSTEP) {
    delivery_status = DeliveryStatus.ARRIVED_CUSTOMER_DOORSTEP;
  }
  if (sfxOrderStatus === SfxOrderStatus.CANCELLED) {
    delivery_status = DeliveryStatus.CANCELLED;
  }
  return delivery_status;
}

export interface ISfxOrderStatusCBRequest {
  // delivery_order_id: string;
  // delivery_status: DeliveryStatus; //

  sfx_order_id: number; //
  client_order_id: string;

  rider_id: number;
  rider_image_url: string;
  rider_name: string;
  rider_contact: string;
  rider_latitude: number;
  rider_longitude: number;

  pickup_eta: number;
  drop_eta: number;
  order_status: SfxOrderStatus; //

  allot_time?: Date;
  arrival_time?: Date;
  dispatch_time?: Date;
  delivery_time?: Date;
  cancel_time?: Date;
  customer_doorstep_arrival_time?: Date;

  cancel_reason_text?: string;
  cancel_reason?: number;

  reason_text?: string;
  reason?: number;
  return_time?: Date;
  returns?: object;
  drop_image_url?: string;
}
export interface ISfxRiderStatusCBRequest {
  time: Date;
  client_order_id?: string;
  order_id: string;
  rider_name: string;
  rider_longitude: number;
  rider_latitude: number;
  sfx_rider_id: number;
  location_accuracy: string;
  pickup_eta: number;
  drop_eta: number;
}

/**
 * processOrderStatus processes the order status updates recived from shadowfax system
 */
export async function processOrderStatus(req: Request, res: Response) {
  try {
    logger.debug(
      'REQUEST BODY RECEIVED FROM SHADOWFAX FOR ORDER STATUS CALLBACK: ',
      req.body
    );
    const sfx_data = req.body as ISfxOrderStatusCBRequest;
    const delivery_data: IDeliveryOrderStatusCBRequest = {
      delivery_order_id: (sfx_data.sfx_order_id || 'Not Available') + '',
      rider_id: (sfx_data.rider_id || 'Not Available') + '',
      delivery_status: getDeliveryStatus(sfx_data.order_status),

      pickup_eta: sfx_data.pickup_eta,
      drop_eta: sfx_data.drop_eta,

      client_order_id: sfx_data.client_order_id,

      rider_image_url: sfx_data.rider_image_url,
      rider_name: sfx_data.rider_name,
      rider_contact: sfx_data.rider_contact,
      rider_latitude: sfx_data.rider_latitude,
      rider_longitude: sfx_data.rider_longitude,
    };
    if (sfx_data.cancel_reason) {
      delivery_data.cancel_reason_code = sfx_data.cancel_reason;
    }
    if (sfx_data.cancel_time || sfx_data.return_time)
      delivery_data.cancel_time = sfx_data.cancel_time || sfx_data.return_time;
    const cancel_reason_text =
      sfx_data.reason || sfx_data.cancel_reason_text || sfx_data.reason_text;
    if (cancel_reason_text)
      delivery_data.cancel_reason_text = cancel_reason_text + '';
    if (sfx_data.delivery_time)
      delivery_data.delivery_time = sfx_data.delivery_time;
    if (sfx_data.dispatch_time)
      delivery_data.dispatch_time = sfx_data.dispatch_time;
    if (sfx_data.arrival_time)
      delivery_data.arrival_time = sfx_data.arrival_time;
    if (sfx_data.allot_time) delivery_data.allot_time = sfx_data.allot_time;

    await processDeliveryOrderStatusCB(delivery_data);
    return res.sendStatus(200);
  } catch (error) {
    logger.error('FAIELD TO PROCESS DELIVERY ORDER STATUS CALLBACK', error);
    return handleErrors(res, error);
  }
}

/**
 * processRiderLocationUpdate processes the rider updated location recived from shadowfax system
 */
export async function processRiderLocationUpdate(req: Request, res: Response) {
  try {
    logger.debug(
      'REQUEST BODY RECEIVED FROM SHADOWFAX FOR RIDER LOCATION UPDATE CALLBACK: ',
      req.body
    );
    const sfx_rider_data = req.body as ISfxRiderStatusCBRequest;
    const delivery_rider_data: IDeliveryRiderStatusCBRequest = {
      ...sfx_rider_data,
      rider_id: sfx_rider_data.sfx_rider_id + '',
    };
    await processDeliveryRiderLocationCB(delivery_rider_data);
    return res.sendStatus(200);
  } catch (error) {
    return handleErrors(res, error);
  }
}

const verifyFakecallback = Joi.object({
  sfx_order_id: Joi.string().min(5).max(10).required(),
  order_id: Joi.string().min(1).max(10).required(),
  service: Joi.string().valid('food', 'grocery', 'pnd', 'pharmacy').required(),
  rider_id: Joi.string().min(5).max(10),
  rider_name: Joi.string().min(5).max(100).required(),
  rider_contact: Joi.string().min(5).max(20).required(),
  track_url: Joi.string().min(5).max(100),
  time_delay: Joi.number().min(5).max(100),
  location_accuracy: Joi.number(),
  data: Joi.array().items(Joi.object()).min(1).max(100),
});

interface IFakeShadowfaxCallback {
  id: string;
  start_time: Date;
  end_time: Date;
  status: string;

  sfx_order_id: number;
  order_id: string;
  service: 'food' | 'grocery' | 'pnd' | 'pharmacy';
  rider_id: number;
  rider_name: string;
  rider_contact: string;
  track_url: string;
  time_delay: number;
  location_accuracy: number;

  data: (ISfxOrderStatusCBRequest &
    ISfxRiderStatusCBRequest & {
      time_delay?: number;
      status?: string;
    })[];
}
let fakeCallbacks: IFakeShadowfaxCallback[] = [];
function wait_for(seconds: number) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('');
    }, seconds * 1000);
  });
}
async function invokeShadowfaxOrderCallback(data: ISfxOrderStatusCBRequest) {
  const authorizationToken = secretStore.getSecret('SHADOWFAX_CALLBACK_TOKEN');
  const result = await axios
    .post(
      (process.env.CORE_API_URL || '') +
        '/core/callback/shadowfax/order_status',
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          authorization: 'Bearer ' + authorizationToken,
        },
      }
    )
    .then(response => {
      return response.data.result;
    })
    .catch(error => {
      logger.error('ORDER STATUS UPDATE FAILED', error);
      throw error;
    });
  return result;
}
async function invokeShadowfaxRiderCallback(data: {}) {
  const authorizationToken = secretStore.getSecret('SHADOWFAX_CALLBACK_TOKEN');
  const result = await axios
    .post(
      (process.env.CORE_API_URL || '') +
        '/core/callback/shadowfax/rider_location_update',
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          authorization: 'Bearer ' + authorizationToken,
        },
      }
    )
    .then(response => {
      return response.data.result;
    })
    .catch(error => {
      logger.error('RIDER STATUS UPDATE FAILED', error);
      throw error;
    });
  return result;
}
export async function startFakeOrder(req: Request, res: Response) {
  try {
    const pendingJobs = fakeCallbacks.filter(item => item.status === 'pending');
    if (pendingJobs && pendingJobs.length) {
      return sendSuccess(res, 200, {
        status: 'pending',
        count: pendingJobs.length,
      });
    }

    const validation = verifyFakecallback.validate(req.body);
    if (validation.error)
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 1000,
        },
      ]);
    const fake_callback: IFakeShadowfaxCallback = req.body;
    if (fake_callback.service === 'food') {
      fake_callback.order_id = 'RES_' + fake_callback.order_id;
    }
    if (fake_callback.service === 'grocery') {
      fake_callback.order_id = 'GRO_' + fake_callback.order_id;
    }
    if (fake_callback.service === 'pharmacy') {
      fake_callback.order_id = 'PHR_' + fake_callback.order_id;
    }
    if (fake_callback.service === 'pnd') {
      fake_callback.order_id = 'PND_' + fake_callback.order_id;
    }
    fake_callback.id = new Date().getTime() + '';
    fake_callback.start_time = new Date();
    fake_callback.status = 'pending';
    fake_callback.time_delay = fake_callback.time_delay || 20;
    fake_callback.location_accuracy = fake_callback.location_accuracy || 10.0;
    fakeCallbacks.push(fake_callback);

    sendSuccess(res, 200, {id: fake_callback.id});
    for (let i = 0; i < fake_callback.data.length; i++) {
      try {
        fake_callback.data[i].status = 'Pending: ';
        await wait_for(
          fake_callback.data[i].time_delay || fake_callback.time_delay
        );
        const isActive = fakeCallbacks.find(
          item => item.id === fake_callback.id
        );
        if (!isActive) {
          logger.debug('Job Deleted');
          return;
        }
        if (fake_callback.data[i].order_status) {
          const payload: ISfxOrderStatusCBRequest = {
            sfx_order_id: fake_callback.sfx_order_id,
            client_order_id: fake_callback.order_id,
            order_status: fake_callback.data[i].order_status!,
            rider_id: fake_callback.rider_id,
            rider_image_url: '',
            rider_name: fake_callback.rider_name,
            rider_contact: fake_callback.rider_contact,
            rider_latitude: fake_callback.data[i].rider_latitude,
            rider_longitude: fake_callback.data[i].rider_longitude,
            pickup_eta: fake_callback.data[i].pickup_eta,
            drop_eta: fake_callback.data[i].drop_eta,
          };
          // console.log(fake_callback.data[i]);
          if (fake_callback.data[i].order_status === 'ALLOTTED') {
            payload.allot_time = new Date();
          }
          if (fake_callback.data[i].order_status === 'ARRIVED') {
            payload.arrival_time = new Date();
          }
          if (fake_callback.data[i].order_status === 'DISPATCHED') {
            payload.dispatch_time = new Date();
          }
          if (
            fake_callback.data[i].order_status === 'ARRIVED_CUSTOMER_DOORSTEP'
          ) {
            payload.customer_doorstep_arrival_time = new Date();
          }
          if (fake_callback.data[i].order_status === 'DELIVERED') {
            payload.delivery_time = new Date();
          }
          if (fake_callback.data[i].order_status === 'CANCELLED') {
            payload.cancel_time = new Date();
          }
          // console.log('after', fake_callback.data[i]);
          await invokeShadowfaxOrderCallback(payload);
        } else {
          await invokeShadowfaxRiderCallback({
            time: new Date(),
            order_id: fake_callback.order_id,
            rider_name: fake_callback.rider_name,
            rider_latitude: fake_callback.data[i].rider_latitude,
            rider_longitude: fake_callback.data[i].rider_longitude,
            location_accuracy:
              fake_callback.data[i].location_accuracy ||
              fake_callback.location_accuracy,
            pickup_eta: fake_callback.data[i].pickup_eta,
            drop_eta: fake_callback.data[i].drop_eta,
            sfx_rider_id: fake_callback.rider_id,
          });
        }
        fake_callback.data[i].status = 'Done: ';
      } catch (error) {
        fake_callback.data[i].status = 'Error: ' + error;
      }
    }

    fake_callback.end_time = new Date();
    fake_callback.status = 'finish';

    return;
  } catch (error) {
    // return handleErrors(res, error);
    return;
  }
}
export async function getFakeOrder(req: Request, res: Response) {
  try {
    logger.debug('Get Fake_Order id', req.params.id + ':');
    if (!req.params.id || req.params.id === '{id}' || req.params.id === 'All') {
      return sendSuccess(res, 200, fakeCallbacks);
    }
    const fakeOrder = fakeCallbacks.find(item => item.id === req.params.id);
    return sendSuccess(res, 200, fakeOrder);
  } catch (error) {
    return handleErrors(res, error);
  }
}
export async function deleteFakeOrder(req: Request, res: Response) {
  try {
    logger.debug('Delete Fake_Order id', req.params.id + ':');
    if (!req.params.id || req.params.id === '{id}' || req.params.id === 'All') {
      fakeCallbacks = [];
      return sendSuccess(res, 200, 'deleted all');
    }
    fakeCallbacks = fakeCallbacks.filter(item => {
      return item.id !== req.params.id;
    });
    return sendSuccess(res, 200, 'deleted : ' + req.params.id);
  } catch (error) {
    return handleErrors(res, error);
  }
}
