import {DeliveryService} from '../../../enum';

export interface IDeliverabilityCheckRequest {
  pickup_latitude: number;
  pickup_longitude: number;
  drop_latitude: number;
  drop_longitude: number;
  data: {
    stage_of_check?: string;
    order_value: number;
  };
  delivery_service: DeliveryService;
  delivery_services: DeliveryService[];
}
export interface IDeliverabilityCheckSuccessResponse {
  deliverable: true;
  delivery_cost: number;
  drop_eta: number;
  pickup_eta: number;
  delivery_service: DeliveryService;
  pod_allowed: boolean;
  pod_not_allowed_reason?: string;
}
export interface IDeliverabilityCheckFailResponse {
  deliverable: false;
  reason: string;
  delivery_service: DeliveryService;
}
export type DeliverabilityCheckResponse =
  | IDeliverabilityCheckSuccessResponse
  | IDeliverabilityCheckFailResponse;

export interface IPlaceOrderRequest {
  service_name: 'food' | 'grocery' | 'pnd' | 'pharmacy';
  is_pod: boolean;
  pickup_details: {
    city: string;
    contact_number: string;
    name: string;
    longitude: number;
    latitude: number;
    address: string;
  };
  drop_details: {
    city: string;
    contact_number: string;
    name: string;
    longitude: number;
    latitude: number;
    address: string;
  };
  order_details: {
    order_id: string;
    order_value: number;
    payment_status: 'post-paid' | 'pre-paid';
    delivery_instruction?: {
      drop_instruction_text: string;
    };
  };
  order_items: {
    name: string;
    price: number;
    quantity: number;
    id: string;
  }[];
  delivery_service: DeliveryService;
}
export interface IPlaceOrderSuccessResponse {
  status: 'success';
  order_id: string;
  delivery_order_id: string;
  delivery_cost: number;
  pickup_eta: number;
  drop_eta: number;
  delivery_service: DeliveryService;
  delivery_details: {
    track_url?: string;
  };
}
export interface IPlaceOrderFailResponse {
  status: 'failed';
  order_id: string;
  reason: string;
  delivery_service: DeliveryService;
  error_details: {};
}
export type PlaceOrderResponse =
  | IPlaceOrderSuccessResponse
  | IPlaceOrderFailResponse;

export interface ICancelDeliveryRequest {
  delivery_service: DeliveryService;
  delivery_order_id: string;
  reason: string;
  user: 'Customer' | 'Seller' | 'Rider';
}
export type CancelDeliveryResponse =
  | {
      cancelled: true;
    }
  | {
      cancelled: false;
      reason: string;
    };
export type UpdateDeliveryResponse =
  | {
      success: true;
    }
  | {
      success: false;
      reason: string;
    };
export interface IUpdateOrderStatusRequest {
  delivery_service: DeliveryService;
  delivery_order_id: string;
  status: 'ready';
}
