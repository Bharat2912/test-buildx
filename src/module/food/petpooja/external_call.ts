import axios from 'axios';
import logger from '../../../utilities/logger/winston_logger';
import ResponseError from '../../../utilities/response_error';
import * as secretStore from '../../../utilities/secret/secret_store';
import {removePhoneCode} from '../../../utilities/utilFuncs';
import {PosPartner} from '../enum';
import {readRestaurantBasicById} from '../restaurant/models';
import {PosOrderStatus, PosRiderStatus} from './enum';
import {
  IPetPoojaPushMenu,
  IPetPoojaSaveOrder,
  IPetPoojaSaveOrderResponse,
} from './types';

interface IOrderStatusCallbackReq {
  app_key: string;
  app_secret: string;
  access_token: string;
  restID: string;
  orderID: ''; // pass it blank, will be deprecated soon.
  clientorderID: string;
  cancelReason: string;
  status: PosOrderStatus.CANCELLED;
}
interface IOrderStatusCallbackRes {
  success: string;
  message: string;
  restID: string;
  orderID: string;
  status: string;

  // Sample Response
  //   "success": "1",
  //   "message": "Order status updated successfully.",
  //   "restID": "xxxxxxx",
  //   "orderID": "26",
  //   "status": "-1"
}
/**
 * Called In
 * Vendor Cancel Order Api
 * Admin Cancel Order Api
 * Customer Cancel Api
 * Rider Cancel Callback
 *
 */
export async function cancelPetpoojaOrderStatus(
  restaurant_id: string,
  order_id: string,
  cancel_reason: string
) {
  if (!process.env.PETPOOJA_ORDER_STATUS_CALLBACK_URL) {
    logger.error('PETPOOJA_ORDER_STATUS_CALLBACK_URL Not Set');
    return;
  }
  const restaurant = await readRestaurantBasicById(restaurant_id);
  const restaurant_pos_id = restaurant.pos_id;
  if (!restaurant_pos_id || restaurant.pos_partner !== PosPartner.PETPOOJA) {
    return false;
  }
  try {
    const payload: IOrderStatusCallbackReq = {
      app_key: secretStore.getSecret('PETPOOJA_APP_KEY'),
      app_secret: secretStore.getSecret('PETPOOJA_APP_SECRET'),
      access_token: secretStore.getSecret('PETPOOJA_ACCESS_TOKEN'),
      restID: restaurant_pos_id,
      clientorderID: order_id,
      cancelReason: cancel_reason,
      orderID: '',
      status: PosOrderStatus.CANCELLED,
    };
    logger.debug('PETPOOJA_ORDER_STATUS_REQUEST_PAYLOAD', {
      restID: restaurant_pos_id,
      clientorderID: order_id,
      cancelReason: cancel_reason,
      status: PosOrderStatus.CANCELLED,
    });
    const result = await axios
      .post<{result: IOrderStatusCallbackRes}>(
        process.env.PETPOOJA_ORDER_STATUS_CALLBACK_URL,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      .then(response => {
        logger.debug('Petpooja order update response', response.data.result);
        return response.data.result;
      })
      .catch(error => {
        if (error.response) {
          logger.error(
            'Petpooja order update failed data',
            error.response.data
          );
        } else {
          logger.error('Petpooja order update failed error', error);
        }
        throw error;
      });
    if (result) return true;
    return false;
  } catch (error) {
    logger.error('Petpooja Order update failed', error);
    // TODO Send Email to admin
  }
  return false;
}

interface IRiderStatusCallbackReq {
  app_key: string;
  app_secret: string;
  access_token: string;
  // outlet_id: string;
  order_id: string;
  status: PosRiderStatus;
  rider_data: {
    rider_name: string;
    rider_phone_number: string;
  };
  external_order_id: ''; // pass this blank
}
interface IRiderStatusCallbackRes {
  code: string;
  success: string;
  message: string;

  // Sample Response
  //   "code": "200",
  //   "message": "Rider status saved successfully.",
  //   "success": "success"
}
export async function updatePetpoojaRiderStatus(
  restaurant_id: string,
  order_id: string,
  status: PosRiderStatus,
  rider_name: string,
  rider_phone_number: string
) {
  if (!process.env.PETPOOJA_RIDER_STATUS_CALLBACK_URL) {
    logger.error('PETPOOJA_RIDER_STATUS_CALLBACK_URL Not Set');
    return;
  }
  const restaurant = await readRestaurantBasicById(restaurant_id);
  const restaurant_pos_id = restaurant.pos_id;
  if (!restaurant_pos_id || restaurant.pos_partner !== PosPartner.PETPOOJA) {
    return false;
  }
  try {
    const payload: IRiderStatusCallbackReq = {
      app_key: secretStore.getSecret('PETPOOJA_APP_KEY'),
      app_secret: secretStore.getSecret('PETPOOJA_APP_SECRET'),
      access_token: secretStore.getSecret('PETPOOJA_ACCESS_TOKEN'),
      // outlet_id: restaurant_pos_id,
      order_id: order_id,
      status: status,
      rider_data: {
        rider_name: rider_name,
        rider_phone_number: removePhoneCode(rider_phone_number),
      },
      external_order_id: '',
    };
    logger.debug('PETPOOJA_RIDER_STATUS_REQUEST_PAYLOAD', {
      outlet_id: restaurant_pos_id,
      orderID: order_id,
      status: status,
      rider_data: {
        rider_name: rider_name,
        rider_phone_number: rider_phone_number,
      },
    });
    const result = await axios
      .post<{result: IRiderStatusCallbackRes}>(
        process.env.PETPOOJA_RIDER_STATUS_CALLBACK_URL,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      .then(response => {
        logger.debug('Petpooja rider update response', response.data);
        return response.data;
      })
      .catch(error => {
        if (error.response) {
          logger.error(
            'Petpooja rider update failed data',
            error.response.data
          );
        } else {
          logger.error('Petpooja rider update failed error', error);
        }
        throw error;
      });
    if (result) return true;
    return false;
  } catch (error) {
    logger.error('Petpooja Order update failed', error);
    // TODO Send Email to admin
  }
  return false;
}

interface IFetchMenuCallbackReq {
  app_key: string;
  app_secret: string;
  access_token: string;
  restID: string;
}
interface IFetchMenuFailedRes {
  success: '0';
  message: 'There were some error in restaurant mapping.';
  errorCode: 'MS_101';
  validation_errors: {
    restID: ['Please provide valid restaurant id.'];
  };
}
export async function fetchRestaurantMenu(
  restaurant_pos_id: string
): Promise<IPetPoojaPushMenu> {
  if (!process.env.PETPOOJA_FETCH_MENU_CALLBACK_URL) {
    logger.error('PETPOOJA_FETCH_MENU_CALLBACK_URL Not Set');
    throw 'PETPOOJA_FETCH_MENU_CALLBACK_URL Not Set';
  }
  const payload: IFetchMenuCallbackReq = {
    app_key: secretStore.getSecret('PETPOOJA_APP_KEY'),
    app_secret: secretStore.getSecret('PETPOOJA_APP_SECRET'),
    access_token: secretStore.getSecret('PETPOOJA_ACCESS_TOKEN'),
    restID: restaurant_pos_id,
  };
  logger.debug('PETPOOJA_RIDER_STATUS_REQUEST_PAYLOAD', {
    restID: restaurant_pos_id,
  });
  const result = await axios
    .post<IFetchMenuFailedRes | IPetPoojaPushMenu>(
      process.env.PETPOOJA_FETCH_MENU_CALLBACK_URL,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    .then(response => {
      logger.debug('Petpooja fetch Menu response', response.data);
      if (response.data.success === '0') {
        if (
          response.data.validation_errors &&
          response.data.validation_errors.restID &&
          response.data.validation_errors.restID.length
        ) {
          throw new ResponseError(
            400,
            response.data.validation_errors.restID[0]
          );
        } else {
          throw new ResponseError(400, response.data.message);
        }
      } else {
        return response.data;
      }
    });
  return result;
}
export async function saveOrderAtPetPooja(
  order: IPetPoojaSaveOrder
): Promise<IPetPoojaSaveOrderResponse> {
  if (!process.env.PETPOOJA_SAVE_ORDER_CALLBACK_URL) {
    logger.error('PETPOOJA_SAVE_ORDER_CALLBACK_URL Not Set');
    throw 'PETPOOJA_SAVE_ORDER_CALLBACK_URL Not Set';
  }
  try {
    logger.debug('PETPOOJA_SAVE_ORDER_REQUEST_PAYLOAD', order);
    return await axios
      .post<IPetPoojaSaveOrderResponse>(
        process.env.PETPOOJA_SAVE_ORDER_CALLBACK_URL,
        {
          app_key: secretStore.getSecret('PETPOOJA_APP_KEY'),
          app_secret: secretStore.getSecret('PETPOOJA_APP_SECRET'),
          access_token: secretStore.getSecret('PETPOOJA_ACCESS_TOKEN'),
          ...order,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      .then(response => {
        logger.debug('Petpooja save order response', response.data);
        return response.data;
      })
      .catch(error => {
        if (error.response) {
          logger.error('Petpooja save order failed data', error.response.data);
        } else {
          logger.error('Petpooja save order failed error', error);
        }
        throw error;
      });
  } catch (error) {
    logger.error('Petpooja save order failed', error);
    throw error;
  }
}
