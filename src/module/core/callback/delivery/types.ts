import {DeliveryService} from '../../../../enum';
import {DeliveryStatus, PaymentStatus} from '../../../food/order/enums';

export interface IDeliveryOrderStatusCBRequest {
  delivery_order_id: string;
  client_order_id: string;

  rider_id: string;
  rider_image_url: string;
  rider_name: string;
  rider_contact: string;
  rider_latitude: number;
  rider_longitude: number;

  pickup_eta: number;
  drop_eta: number;
  delivery_status: DeliveryStatus; //

  allot_time?: Date;
  arrival_time?: Date;
  dispatch_time?: Date;
  delivery_time?: Date;
  cancel_time?: Date;

  cancel_reason_text?: string;
  cancel_reason_code?: number;

  pod_status?: PaymentStatus;
  pod_details?: {};
  delivery_service?: DeliveryService;
  eta_when_order_placed?: {
    epoch: number;
    default_preparation_time: number;
    rider_to_vendor_eta: number;
    rider_from_vendor_to_customer_eta: number;
  };
  eta_when_vendor_accepted?: {
    epoch: number;
    preparation_time: number;
    rider_to_vendor_eta: number;
    rider_from_vendor_to_customer_eta: number;
  };
}
export interface IDeliveryRiderStatusCBRequest {
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
