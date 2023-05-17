import axios from 'axios';
import {DeliveryService} from '../../../../enum';
import Globals from '../../../../utilities/global_var/globals';
import logger from '../../../../utilities/logger/winston_logger';
import * as secretStore from '../../../../utilities/secret/secret_store';
import {sendEmail} from '../../../../utilities/utilFuncs';
import {
  CancelDeliveryResponse,
  DeliverabilityCheckResponse,
  IDeliverabilityCheckFailResponse,
  IDeliverabilityCheckSuccessResponse,
  IPlaceOrderFailResponse,
  IPlaceOrderRequest,
  IPlaceOrderSuccessResponse,
  PlaceOrderResponse,
  UpdateDeliveryResponse,
} from '../types';

export async function deliverabilityCheck(
  pickup_latitude: number,
  pickup_longitude: number,
  drop_latitude: number,
  drop_longitude: number,
  data: {
    stage_of_check?: string;
    order_value: number;
  }
): Promise<DeliverabilityCheckResponse> {
  logger.debug('request for deliverability check of speedyy rider', {
    pickup_latitude,
    pickup_longitude,
    drop_latitude,
    drop_longitude,
  });
  const rider_payload = {
    pickup: {
      latitude: pickup_latitude,
      longitude: pickup_longitude,
    },
    drop: {
      latitude: drop_latitude,
      longitude: drop_longitude,
    },
    order_value: data.order_value,
  };
  const result = await axios({
    method: 'put',
    url: `${secretStore.getSecret(
      'RIDER_APP_HOSTNAME'
    )}/rider/client/order/serviceability`,
    headers: {
      Authorization: `Token ${secretStore.getSecret('RIDER_APP_AUTH_TOKEN')}`,
    },
    data: rider_payload,
  })
    .then(response => {
      // {
      //   "status": true,
      //   "statusCode": 200,
      //   "message": "Successful Response",
      //   "result": {
      //     "serviceable": true,
      //     "pickup_eta": 10,
      //     "drop_eta": 10,
      //     "charge": 40
      //   }
      // }
      logger.debug(
        'RIDER_API SERVICEABILITY RESPONSE FOR ADDRESS',
        `STORE LAT : ${pickup_latitude}
         STORE LONG: ${pickup_longitude}
         USER ADD LAT: ${drop_latitude}
         USER ADD LONG: ${drop_longitude},
         RESULT: ${JSON.stringify(response.data.result)}`
      );
      if (response.data.result.serviceable) {
        const result: IDeliverabilityCheckSuccessResponse = {
          deliverable: true,
          delivery_cost: response.data.result.charge,
          drop_eta: Math.round(response.data.result.drop_eta),
          pickup_eta: Math.round(response.data.result.pickup_eta),
          delivery_service: DeliveryService.SPEEDYY_RIDER,
          pod_allowed: response.data.result.pod_allowed,
          pod_not_allowed_reason: response.data.result.pod_not_allowed_reason,
        };
        return result;
      } else {
        if (
          response.data.result.reason ===
          'NO_FREE_RIDER_AVAILABLE_PLEASE_TRY_AGAIN_IN_SOME_TIME'
        ) {
          const result: IDeliverabilityCheckFailResponse = {
            deliverable: false,
            reason: 'No rider available, please try again after some time',
            delivery_service: DeliveryService.SPEEDYY_RIDER,
          };
          return result;
        } else {
          const result: IDeliverabilityCheckFailResponse = {
            deliverable: false,
            reason: 'Something went wrong please try again in some time.',
            delivery_service: DeliveryService.SPEEDYY_RIDER,
          };
          return result;
        }
      }
    })
    .catch(error => {
      if (error.response) {
        logger.error(
          'RIDER_APP SERVICEABILITY FAILED WITH RESPONSE',
          error.response.data
        );
      } else {
        logger.error('RIDER_APP SERVICEABILITY FAILED', error);
      }
      const result: IDeliverabilityCheckFailResponse = {
        deliverable: false,
        reason: 'Something went wrong please try again in some time.',
        delivery_service: DeliveryService.SPEEDYY_RIDER,
      };
      return result;
    });

  if (!result.deliverable && result.reason === 'Location is non-deliverable') {
    await sendEmail(
      'AdminAlertEmailTemplate',
      secretStore.getSecret('SUPER_ADMIN_EMAIL'),
      {
        subject: 'RIDER_APP SERVICEABILITY FAILED',
        application_name: 'core-api',
        error_details: {
          message: 'Location is non-deliverable',
          pickup_latitude,
          pickup_longitude,
          drop_latitude,
          drop_longitude,
        },
        priority: 'high',
        time: new Date().toDateString(),
        meta_details: result,
      }
    );
  }
  return result;
}

export async function placeOrder(
  data: IPlaceOrderRequest
): Promise<PlaceOrderResponse> {
  logger.debug('Placing Rider_App Order', data);
  const payload = {
    client_order_id: data.order_details.order_id,
    is_pod: data.is_pod,
    details: {
      items: data.order_items,
      amount: data.order_details.order_value,
    },

    pickup_latitude: data.pickup_details.latitude,
    pickup_longitude: data.pickup_details.longitude,
    pickup_name: data.pickup_details.name,
    pickup_contact: data.pickup_details.contact_number,
    pickup_address: data.pickup_details.address,
    drop_latitude: data.drop_details.latitude,
    drop_longitude: data.drop_details.longitude,
    drop_name: data.drop_details.name,
    drop_contact: data.drop_details.contact_number,
    drop_address: data.drop_details.address,

    delivery_instruction:
      data.order_details.delivery_instruction || 'no instruction',
    take_drop_off_picture: false,
  };
  if (data.service_name === 'grocery') {
    payload.client_order_id = 'GRO_' + payload.client_order_id;
  } else if (data.service_name === 'pharmacy') {
    payload.client_order_id = 'PHR_' + payload.client_order_id;
  } else if (data.service_name === 'food') {
    payload.client_order_id = 'RES_' + payload.client_order_id;
  } else if (data.service_name === 'pnd') {
    payload.client_order_id = 'PND_' + payload.client_order_id;
  }
  logger.debug('placing order at RIDER_APP', payload);
  const rider_app_result: PlaceOrderResponse = await axios
    .post(
      `${secretStore.getSecret('RIDER_APP_HOSTNAME')}/rider/client/order/place`,
      payload,
      {
        headers: {
          Authorization: `Token ${secretStore.getSecret(
            'RIDER_APP_AUTH_TOKEN'
          )}`,
        },
      }
    )
    .then(response => {
      logger.debug('order placed RIDER_APP response', response.data);
      const result: IPlaceOrderSuccessResponse = {
        status: 'success',
        order_id: data.order_details.order_id,
        delivery_order_id: response.data.result.id,
        delivery_cost: response.data.result.delivery_charges,
        pickup_eta: Math.round(response.data.result.pickup_eta),
        drop_eta: Math.round(response.data.result.drop_eta),
        delivery_details: response.data,
        delivery_service: DeliveryService.SPEEDYY_RIDER,
      };
      return result;
    })
    .catch(async error => {
      if (error.response && error.response.data) {
        logger.error('failed to place order at RIDER_APP', error.response.data);
        const result: IPlaceOrderFailResponse = {
          status: 'failed',
          order_id: data.order_details.order_id,
          reason:
            error.response.data?.errors && error.response.data?.errors.length
              ? error.response.data?.errors[0]?.message
              : 'RIDER_APP ERROR',
          error_details: error.response.data,
          delivery_service: DeliveryService.SPEEDYY_RIDER,
        };
        return result;
      } else {
        logger.error('failed to place order at RIDER_APP', error);

        const result: IPlaceOrderFailResponse = {
          status: 'failed',
          order_id: data.order_details.order_id,
          reason: 'RIDER_APP ERROR',
          error_details: error,
          delivery_service: DeliveryService.SPEEDYY_RIDER,
        };
        await sendEmail(
          'AdminAlertEmailTemplate',
          await Globals.BACKEND_TEAM_EMAIL.get(),
          {
            subject: 'Unexpected Error while placing a order at RIDER_APP',
            application_name: 'core-api',
            error_details: error,
            priority: 'high',
            time: new Date().toDateString(),
            meta_details: {request_payload: payload},
          }
        );
        return result;
      }
    });
  logger.debug('rider_app result', rider_app_result);
  return rider_app_result;
}

export async function cancelOrder(
  rider_app_order_id: string,
  reason: string
): Promise<CancelDeliveryResponse> {
  logger.debug('request for cancel order to speedyy rider', {
    rider_app_order_id,
    reason,
  });
  const result = await axios({
    method: 'post',
    url: `${secretStore.getSecret(
      'RIDER_APP_HOSTNAME'
    )}/rider/client/order/cancel/${rider_app_order_id}`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${secretStore.getSecret('RIDER_APP_AUTH_TOKEN')}`,
    },
    data: {reason},
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

export async function updateOrderStatus(
  rider_app_order_id: string,
  status: string
) {
  logger.debug('request for update order status to speedyy rider', {
    rider_app_order_id,
    status,
  });
  const result = await axios({
    method: 'put',
    url: `${secretStore.getSecret(
      'RIDER_APP_HOSTNAME'
    )}/rider/client/order/status/${rider_app_order_id}`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${secretStore.getSecret('RIDER_APP_AUTH_TOKEN')}`,
    },
    data: {status},
  })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .then(response => {
      return {
        success: true,
      } as UpdateDeliveryResponse;
    })
    .catch(error => {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        logger.error('UPDATE ORDER STATUS FAILED', error.response.data);
        return {
          success: false,
          reason: error.response.data.message,
        } as UpdateDeliveryResponse;
      } else {
        logger.error('UPDATE ORDER STATUS FAILED', error);
      }
      throw error;
    });
  return result;
}
