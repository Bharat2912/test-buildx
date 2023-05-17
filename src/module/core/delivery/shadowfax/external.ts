import axios from 'axios';
import logger from '../../../../utilities/logger/winston_logger';
import * as secretStore from '../../../../utilities/secret/secret_store';
import {sendEmail} from '../../../../utilities/utilFuncs';
import {DeliveryService, Service, ServiceTag} from '../../../../enum';
import {
  CancelDeliveryResponse,
  DeliverabilityCheckResponse,
  IDeliverabilityCheckFailResponse,
  IDeliverabilityCheckSuccessResponse,
  IPlaceOrderFailResponse,
  IPlaceOrderRequest,
  IPlaceOrderSuccessResponse,
  PlaceOrderResponse,
} from '../types';
import Globals from '../../../../utilities/global_var/globals';

export async function podDeliverabilityCheck(
  pickup_latitude: string,
  pickup_longitude: string,
  drop_latitude: string,
  drop_longitude: string,
  paid: boolean,
  data: {
    stage_of_check?: string;
    order_value: number;
  }
): Promise<DeliverabilityCheckResponse> {
  logger.debug('request for sfx deliverability check', {
    pickup_latitude,
    pickup_longitude,
    drop_latitude,
    drop_longitude,
    data,
  });
  if (process.env.MOCK_SFX_SERVICEABILITY === 'true') {
    return {
      deliverable: true,
      delivery_cost: 58,
      drop_eta: 10,
      pickup_eta: 10,
      delivery_service: DeliveryService.SHADOWFAX,
      pod_allowed: true,
    };
  }
  const sfx_payload = {
    drop_latitude: drop_latitude,
    drop_longitude: drop_longitude,
    pickup_latitude: pickup_latitude,
    pickup_longitude: pickup_longitude,
    paid: paid,
    stage_of_check: data.stage_of_check || 'pre_order',
    order_value: data.order_value,
  };
  const result = await axios({
    method: 'put',
    url: `${secretStore.getSecret(
      'SHADOWFAX_HOSTNAME'
    )}/api/v1/order-serviceability/`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${secretStore.getSecret('SHADOWFAX_AUTH_TOKEN')}`,
    },
    data: sfx_payload,
  })
    .then(response => {
      logger.debug(
        'SHADOWFAX SERVICEABILITY RESPONSE FOR ADDRESS',
        `STORE LAT : ${pickup_latitude}
         STORE LONG: ${pickup_longitude}
         USER ADD LAT: ${drop_latitude}
         USER ADD LONG: ${drop_longitude},
         RESULT: ${JSON.stringify(response.data)}`
      );
      if (response.data.serviceable) {
        const result: IDeliverabilityCheckSuccessResponse = {
          deliverable: true,
          delivery_cost: response.data.delivery_cost,
          drop_eta: Math.round(response.data.drop_eta),
          pickup_eta: Math.round(response.data.pickup_eta),
          delivery_service: DeliveryService.SHADOWFAX,
          pod_allowed: paid ? false : true,
          pod_not_allowed_reason: 'COD not available right now.',
        };
        return result;
      } else {
        if (
          response.data.reason ===
          'NO_FREE_RIDER_AVAILABLE_PLEASE_TRY_AGAIN_IN_SOME_TIME.'
        ) {
          const result: IDeliverabilityCheckFailResponse = {
            deliverable: false,
            reason: 'No rider available, please try again after some time',
            delivery_service: DeliveryService.SHADOWFAX,
          };
          return result;
        } else if (
          response.data.reason ===
          'THE_DISTANCE_BETWEEN_PICKUP_AND_DROP_LOCATION_IS_HIGHER_THAN_SET_LIMIT.'
        ) {
          const result: IDeliverabilityCheckFailResponse = {
            deliverable: false,
            reason:
              'The distance between pickup and drop location is too long, please select another location',
            delivery_service: DeliveryService.SHADOWFAX,
          };
          return result;
        } else {
          const result: IDeliverabilityCheckFailResponse = {
            deliverable: false,
            reason: 'Something went wrong please try again in some time',
            delivery_service: DeliveryService.SHADOWFAX,
          };
          return result;
        }
      }
    })
    .catch(error => {
      logger.error('SHADOWFAX SERVICEABILITY FAILED', error);
      logger.error(
        'SHADOWFAX SERVICEABILITY FAILED RESPONSE',
        error.response.data
      );
      if (
        error.response.data.message ===
          'Outside Shadowfax serviceability area' ||
        error.response.data.message === 'Order in non-serviceable area'
      ) {
        return <DeliverabilityCheckResponse>{
          deliverable: false,
          reason: 'Location is non-deliverable',
        };
      } else {
        throw error;
      }
    });
  if (!result.deliverable && result.reason === 'Location is non-deliverable') {
    // await sendEmail(
    //   'AdminAlertEmailTemplate',
    //   await Globals.SUPER_ADMIN_EMAIL.get(),
    //   {
    //     subject: 'SHADOWFAX SERVICEABILITY FAILED',
    //     application_name: 'core-api',
    //     error_details: {
    //       message: 'Location is non-deliverable',
    //       pickup_latitude,
    //       pickup_longitude,
    //       drop_latitude,
    //       drop_longitude,
    //     },
    //     priority: 'high',
    //     time: new Date().toDateString(),
    //     meta_details: result,
    //   }
    // );
    logger.error('Location is non-deliverable');
  }
  return result;
}
export async function deliverabilityCheck(
  pickup_latitude: string,
  pickup_longitude: string,
  drop_latitude: string,
  drop_longitude: string,
  data: {
    stage_of_check?: string;
    order_value: number;
  }
): Promise<DeliverabilityCheckResponse> {
  try {
    let result = await podDeliverabilityCheck(
      pickup_latitude,
      pickup_longitude,
      drop_latitude,
      drop_longitude,
      false,
      data
    );
    if (!result.deliverable) {
      result = await podDeliverabilityCheck(
        pickup_latitude,
        pickup_longitude,
        drop_latitude,
        drop_longitude,
        true,
        data
      );
    }
    return result;
  } catch (error) {
    return {
      deliverable: false,
      delivery_service: DeliveryService.SHADOWFAX,
      reason: 'Failed To Get Deliverability, please try again after some time',
    };
  }
}
export async function placeOrder(
  data: IPlaceOrderRequest
): Promise<PlaceOrderResponse> {
  logger.debug('Placing SFX Order', data);
  if (process.env.MOCK_SFX_SERVICEABILITY === 'true') {
    data.pickup_details.longitude = 77.0563207;
    data.pickup_details.latitude = 28.5833332;
    data.drop_details.longitude = 77.0563207;
    data.drop_details.latitude = 28.588891;
    data.is_pod = false;
  }
  const payload = {
    client_code: secretStore.getSecret('SHADOWFAX_CLIENT_CODE'), // From env
    order_details: {
      client_order_id: data.order_details.order_id,
      paid: data.is_pod ? 'false' : 'true',
      order_value: data.order_details.order_value,
      delivery_instruction: {
        drop_instruction_text:
          data.order_details.delivery_instruction || 'no instruction',
        take_drop_off_picture: false,
        drop_off_picture_mandatory: false,
      },
    },

    pickup_details: data.pickup_details,
    drop_details: data.drop_details,
    order_items: data.order_items,
  };

  if (data.service_name === Service.GROCERY_API) {
    payload.order_details.client_order_id =
      ServiceTag.GROCERY_SERVICE_TAG +
      '_' +
      payload.order_details.client_order_id;
  } else if (data.service_name === Service.PHARMACY_API) {
    payload.order_details.client_order_id =
      ServiceTag.PHARMACY_SERVICE_TAG +
      '_' +
      payload.order_details.client_order_id;
  } else if (data.service_name === Service.FOOD_API) {
    payload.order_details.client_order_id =
      ServiceTag.FOOD_SERVICE_TAG + '_' + payload.order_details.client_order_id;
  } else if (data.service_name === Service.PICKUP_DROP_API) {
    payload.order_details.client_order_id =
      ServiceTag.PICKUP_DROP_SERVICE_TAG +
      '_' +
      payload.order_details.client_order_id;
  }
  logger.debug('placing order at shadowfax', payload);
  const sfx_result: PlaceOrderResponse = await axios
    .post(
      `${secretStore.getSecret('SHADOWFAX_HOSTNAME')}/api/v2/orders/`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${secretStore.getSecret(
            'SHADOWFAX_AUTH_TOKEN'
          )}`,
        },
      }
    )
    .then(response => {
      if (response.data.message === 'Success') {
        logger.debug('order placed shadowfax response', response.data);
        const result: IPlaceOrderSuccessResponse = {
          status: 'success',
          order_id: data.order_details.order_id,
          delivery_order_id: response.data.data.sfx_order_id,
          delivery_cost: response.data.data.delivery_cost,
          pickup_eta: Math.round(response.data.data.order_details.pickup_eta),
          drop_eta: Math.round(response.data.data.order_details.drop_eta),
          delivery_details: {
            track_url: response.data.data.track_url,
          },
          delivery_service: DeliveryService.SHADOWFAX,
        };
        return result;
      } else {
        logger.debug('order placed shadowfax response', response.data);
        const result: IPlaceOrderFailResponse = {
          status: 'failed',
          order_id: data.order_details.order_id,
          reason: 'No rider available, please try again after some time',
          error_details: response.data,
          delivery_service: DeliveryService.SHADOWFAX,
        };
        return result;
      }
    })
    .catch(error => {
      if (error.response.data && error.response.data.message) {
        logger.error('shadowfax place order response', error.response.data);
        const result: IPlaceOrderFailResponse = {
          status: 'failed',
          order_id: data.order_details.order_id,
          reason: 'No rider available, please try again after some time',
          error_details: error.response.data,
          delivery_service: DeliveryService.SHADOWFAX,
        };
        return result;
      } else {
        logger.error('failed to place order at shadowfax', error);
        const result: IPlaceOrderFailResponse = {
          status: 'failed',
          order_id: data.order_details.order_id,
          reason: 'No rider available, please try again after some time',
          error_details: error,
          delivery_service: DeliveryService.SHADOWFAX,
        };
        return result;
      }
    });
  if (sfx_result.status === 'failed') {
    await sendEmail(
      'AdminAlertEmailTemplate',
      await Globals.BACKEND_TEAM_EMAIL.get(),
      {
        subject: 'Unexpected Error while placing a order at shadowfax',
        application_name: 'core-api',
        error_details: sfx_result,
        priority: 'high',
        time: new Date().toDateString(),
        meta_details: {request_payload: payload},
      }
    );
  }
  logger.debug('sfx result', sfx_result);
  return sfx_result;
}

export async function cancelOrder(
  delivery_order_id: string,
  reason: string,
  user: 'Customer' | 'Seller' | 'Rider'
): Promise<CancelDeliveryResponse> {
  logger.debug('request for sfx cancel order', {
    delivery_order_id,
    reason,
    user,
  });
  const result = await axios({
    method: 'put',
    url: `${secretStore.getSecret(
      'SHADOWFAX_HOSTNAME'
    )}/api/v2/orders/${delivery_order_id}/cancel/`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${secretStore.getSecret('SHADOWFAX_AUTH_TOKEN')}`,
    },
    data: {reason, user},
  })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .then(response => {
      return {
        cancelled: true,
      } as CancelDeliveryResponse;
    })
    .catch(error => {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        logger.error('DELIVERABILITY CANCELLATION FAILED', error.response.data);
        return {
          cancelled: false,
          reason: error.response.data.message,
        } as CancelDeliveryResponse;
      } else {
        logger.error('DELIVERABILITY CANCELLATION FAILED', error);
      }
      throw error;
    });
  return result;
}
