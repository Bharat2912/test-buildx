import {DeliveryService} from '../../../enum';
import * as sfx from './shadowfax/external';
import * as rider from './speedyy_rider/external';
import {
  CancelDeliveryResponse,
  IDeliverabilityCheckRequest,
  DeliverabilityCheckResponse,
  IPlaceOrderRequest,
  PlaceOrderResponse,
  ICancelDeliveryRequest,
  IUpdateOrderStatusRequest,
} from './types';

export async function deliverabilityCheck(
  deliverability_check_request: IDeliverabilityCheckRequest
): Promise<DeliverabilityCheckResponse> {
  const delivery_services: DeliveryService[] = [];
  if (deliverability_check_request.delivery_service) {
    delivery_services.push(deliverability_check_request.delivery_service);
    if (delivery_services[0] === DeliveryService.SHADOWFAX) {
      delivery_services.push(DeliveryService.SPEEDYY_RIDER);
    }
    if (delivery_services[0] === DeliveryService.SPEEDYY_RIDER) {
      delivery_services.push(DeliveryService.SHADOWFAX);
    }
  }
  if (deliverability_check_request.delivery_services) {
    delivery_services.push(...deliverability_check_request.delivery_services);
  }
  if (!delivery_services.length) {
    delivery_services.push(DeliveryService.SPEEDYY_RIDER);
    delivery_services.push(DeliveryService.SHADOWFAX);
  }
  let result: DeliverabilityCheckResponse = {
    deliverable: false,
    reason: '',
    delivery_service: DeliveryService.SPEEDYY_RIDER,
  };
  for (let i = 0; i < delivery_services.length; i++) {
    if (delivery_services[i] === DeliveryService.SHADOWFAX) {
      result = await sfx.deliverabilityCheck(
        deliverability_check_request.pickup_latitude + '',
        deliverability_check_request.pickup_longitude + '',
        deliverability_check_request.drop_latitude + '',
        deliverability_check_request.drop_longitude + '',
        deliverability_check_request.data
      );
    } else if (delivery_services[i] === DeliveryService.SPEEDYY_RIDER) {
      result = await rider.deliverabilityCheck(
        deliverability_check_request.pickup_latitude,
        deliverability_check_request.pickup_longitude,
        deliverability_check_request.drop_latitude,
        deliverability_check_request.drop_longitude,
        deliverability_check_request.data
      );
    } else {
      throw 'invalid delivery partner';
    }
    if (result.deliverable) {
      return result;
    }
  }
  return result;
}

export async function placeOrder(
  data: IPlaceOrderRequest
): Promise<PlaceOrderResponse> {
  if (data.delivery_service === DeliveryService.SHADOWFAX) {
    let result = await sfx.placeOrder(data);
    if (result.status === 'failed') {
      result = await rider.placeOrder(data);
    }
    if (result.status === 'failed') {
      // TODO send notification to admin
    }
    return result;
  } else if (data.delivery_service === DeliveryService.SPEEDYY_RIDER) {
    let result = await rider.placeOrder(data);
    if (result.status === 'failed') {
      result = await sfx.placeOrder(data);
    }
    if (result.status === 'failed') {
      // TODO send notification to admin
    }
    return result;
  } else {
    throw 'invalid delivery partner';
  }
}

export async function cancelOrder(
  data: ICancelDeliveryRequest
): Promise<CancelDeliveryResponse> {
  if (data.delivery_service === DeliveryService.SHADOWFAX) {
    return sfx.cancelOrder(data.delivery_order_id, data.reason, data.user);
  } else if (data.delivery_service === DeliveryService.SPEEDYY_RIDER) {
    return rider.cancelOrder(data.delivery_order_id, data.reason);
  } else {
    throw 'invalid delivery partner';
  }
}

export async function updateOrderStatus(data: IUpdateOrderStatusRequest) {
  if (data.delivery_service === DeliveryService.SPEEDYY_RIDER) {
    return rider.updateOrderStatus(data.delivery_order_id, data.status);
  } else if (data.delivery_service === DeliveryService.SHADOWFAX) {
    return {
      success: true,
    };
  } else {
    throw 'invalid delivery partner';
  }
}
