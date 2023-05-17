import axios from 'axios';
import {Service} from '../enum';
import logger from '../utilities/logger/winston_logger';
import {
  CancelDeliveryResponse,
  ICancelDeliveryRequest,
  IPlaceOrderRequest,
  PlaceOrderResponse,
  DeliverabilityCheckResponse,
  IDeliverabilityCheckRequest,
  IUpdateOrderRequest,
} from './types';

export async function deliverabilityCheck(
  deliverability_check_request: IDeliverabilityCheckRequest
): Promise<DeliverabilityCheckResponse> {
  logger.debug(
    'internal deliverability check request',
    deliverability_check_request
  );
  const result = await axios
    .post<{result: DeliverabilityCheckResponse}>(
      (process.env.CORE_API_URL || '') +
        '/internal/delivery/deliverabilityCheck',
      deliverability_check_request,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    .then(response => {
      logger.debug(
        'sucessfull internal deliverability check response',
        response.data.result
      );
      return response.data.result;
    })
    .catch(error => {
      if (error.response) {
        logger.error('DELIVERABILITY CHECK FAILED', error.response.data);
      } else {
        logger.error('DELIVERABILITY CHECK FAILED', error);
      }
      throw error;
    });
  return result;
}

export async function placeOrder(
  data: IPlaceOrderRequest
): Promise<PlaceOrderResponse> {
  logger.debug('internal place order request', data);
  const result = await axios
    .post<{result: PlaceOrderResponse}>(
      (process.env.CORE_API_URL || '') + '/internal/delivery/placeOrder',
      data,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    .then(response => {
      logger.debug('place order response', response.data.result);
      return response.data.result;
    })
    .catch(error => {
      if (error.response) {
        logger.error('place order failed', error.response.data);
      } else {
        logger.error('place order failed', error);
      }
      throw error;
    });
  return result;
}

export async function cancelDelivery(
  data: ICancelDeliveryRequest
): Promise<CancelDeliveryResponse> {
  logger.debug('Cancelling Delivery Order', data);
  const result = await axios
    .post<{result: CancelDeliveryResponse}>(
      (process.env.CORE_API_URL || '') + '/internal/delivery/cancelDelivery',
      {
        service_name: Service.FOOD_API,
        ...data,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    .then(response => {
      return response.data.result;
    })
    .catch(error => {
      if (error.response.data) {
        logger.error('delivery cancellation failed', error.response.data);
        throw error.response.data;
      } else {
        logger.error('delivery cancellation failed', error);
      }
      throw error;
    });
  return result;
}

export async function updateOrderStatus(data: IUpdateOrderRequest) {
  logger.debug('Cancelling Delivery Order', data);
  const result = await axios
    .put(
      (process.env.CORE_API_URL || '') + '/internal/delivery/status',
      {
        service_name: Service.FOOD_API,
        ...data,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    .then(response => {
      return response.data.result;
    })
    .catch(error => {
      if (error.response.data) {
        logger.error('Update order status failed', error.response.data);
        throw error.response.data;
      } else {
        logger.error('Updaet order status failed', error);
      }
      throw error;
    });
  return result;
}
