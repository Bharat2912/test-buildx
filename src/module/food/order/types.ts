import {FileObject} from '../../../utilities/s3_manager';
import {ICartAddonGroup, ICartVariantGroup} from '../cart/types';
import {IDeliveryOrderStatusCBRequest} from '../../core/callback/delivery/types';
import {ICusomerDeliverableAddress} from '../cart/types';
import {IAddon} from '../menu/addon/models';
import {IMenuItem} from '../menu/models';
import {IVariant} from '../menu/variant/models';
import {IPagination} from '../restaurant/models';
import {
  DeliveryStatus,
  OrderStatus,
  PaymentStatus,
  OrderAcceptanceStatus,
  OrderByColumn,
  SortOrder,
  OrderCancelledBy,
  ExternalPaymentStatus,
  ExternalPaymentEvent,
} from './enums';
import {IInvoiceBreakout, IRefundSettlementDetails} from './invoice';
import {RefundGateway, RefundStatus} from '../../core/payment/enum';
import {DeliveryService} from '../../../enum';
import {PosPartner} from '../enum';

export interface OrderRefundDetails {
  refund_id?: string;
  order_id: number;
  payment_id: string;
  customer_id: string;
  created_at: Date;
  processed_at?: Date;
  refund_status: string;
  status_description?: string;
  refund_gateway?: RefundGateway;
  refund_charges: number;
}

export interface IOrderAdditionalDetails {
  refund_details?: OrderRefundDetails;
  order_delivery_cancellation_details?: {
    delivery_cancellation_failure_reason: string;
  };
}
export interface IOrder {
  id?: number;
  restaurant_id?: string;
  customer_id?: string;
  customer_device_id?: string;
  customer_address?: ICusomerDeliverableAddress;
  order_delivered_at?: Date;
  delivery_status?: DeliveryStatus;
  delivery_details?: IDeliveryOrderStatusCBRequest;
  delivery_charges?: number;
  delivery_service?: DeliveryService;
  delivery_tip?: number;
  order_status?: OrderStatus;
  order_acceptance_status?: OrderAcceptanceStatus;
  vendor_detail?: object;
  total_customer_payable?: number;
  total_tax?: number;
  packing_charges?: number;
  offer_discount?: number;
  coupon_id?: number;
  vote_type?: 1 | -1 | 0;
  any_special_request?: string;
  cancelled_by?: string;
  cancellation_details?: {
    cancellation_reason?: string;
  };
  cancellation_time?: Date;
  cancellation_user_id?: string;
  created_at?: Date;
  updated_at?: Date;
  delivery_order_id?: string;
  pickup_eta?: number;
  drop_eta?: number;
  order_placed_time?: Date;
  vendor_accepted_start_time?: Date;
  vendor_accepted_end_time?: Date;
  vendor_accepted_time?: Date;
  accepted_vendor_id?: string;
  preparation_time?: number;
  vendor_ready_marked_time?: Date;
  payout_transaction_id?: string;
  transaction_charges?: number;
  // refundable_amount?: number;
  vendor_payout_amount?: number;
  invoice_breakout?: IInvoiceBreakout;
  order_pickedup_time?: Date;
  stop_payment?: boolean;
  comments?: string;
  reviewed_at?: Date;
  refund_status?: string;
  additional_details?: IOrderAdditionalDetails;
  pos_id?: string;
  pos_partner?: PosPartner;
  order_rating?: number; //! BACKWARD_COMPATIBLE
}

export interface IOrderItem extends IMenuItem {
  sequence: number;
  order_id: number;
  order_item_id?: number;
  menu_item_id?: number;
  quantity?: number;
  pos_id?: string;
  order_variants?: IOrderVariant[];
  order_addons?: IOrderAddon[];
}

export interface IOrderVariant extends IVariant {
  order_id: number;
  order_item_id: number;
  variant_group_name: string;
  variant_id?: number;
  variant_name?: string;
  pos_variant_id?: string | null;
  pos_variant_item_id?: string | null;
  pos_variant_group_id?: string | null;
}

export interface IOrderAddon extends IAddon {
  order_id: number;
  order_item_id: number;
  addon_name?: string;
  addon_id?: number;
  addon_group_name?: string;
  addon_group_id?: number;
  pos_addon_id?: string;
  pos_addon_group_id?: string;
}

interface IPaytmPaymentMode {
  mode?: string;
  channels?: string[];
}

export interface IInitiateTransaction {
  requestType: string;
  mid: string;
  websiteName: string;
  callbackUrl: string;
  orderId: string;
  txnAmount: {value: number; currency: string};
  userInfo: object;
  enablePaymentMode?: IPaytmPaymentMode[];
  disablePaymentMode?: IPaytmPaymentMode[];
}

export interface ITransactionStatus {
  mid: string;
  orderId: string;
}

export interface IPayment {
  id?: string;
  order_id?: number;
  customer_id?: string;
  transaction_id?: string;
  transaction_token?: string;
  session_id?: string;
  payment_status?: PaymentStatus;
  payment_method?: string;
  payment_gateway?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  additional_details?: any;
  amount_paid_by_customer?: number; //  amount paid by customer
  transaction_time?: Date;
  created_at?: Date;
  updated_at?: Date;
  is_pod?: boolean;
}

export interface IPaymentDetails extends IPayment {
  payment_id?: string;
  payment_order_id?: number;
}

export interface IConfirmPayment {
  customer_id: string;
  payment_id: string;
}

export interface IGetCustomerOrders {
  order_id: number;
  customer_id: string;
}

export interface IGetCustomerOrdersAsAdmin {
  order_id: number;
  admin_id: string;
}

export interface IGetVendorOrders {
  order_id: number;
  restaurant_id: string;
}

export interface IOrderBy {
  column: OrderByColumn;
  order: SortOrder;
}

export interface IVendorFilterOrders {
  search_text?: string;
  filter?: {
    restaurant_id?: string;
    order_status?: OrderStatus[];
    order_acceptance_status?: OrderAcceptanceStatus[];
    delivery_status?: DeliveryStatus[];
    duration?: {
      start_date: number;
      end_date: number;
    };
    cancelled_by?: OrderCancelledBy[];
    child_restaurant_ids?: string[];
  };
  pagination?: IPagination;
  sort?: IOrderBy[];
}

export interface ICustomerFilterOrders {
  filter?: {
    customer_id?: string;
    order_status?: OrderStatus[];
    duration?: {
      start_date: number;
      end_date: number;
    };
  };
  pagination?: IPagination;
  sort: IOrderBy[];
}

export interface IAdminFilterOrders {
  search_text?: string;
  filter?: {
    restaurant_id?: string;
    customer_id?: string[];
    order_acceptance_status?: OrderAcceptanceStatus[];
    order_status?: OrderStatus[];
    delivery_status?: DeliveryStatus[];
    refund_status?: RefundStatus[];
    payout_transaction_id?: string[];
    payment_id?: string[];
    customer_phone?: string[];
    customer_email?: string[];
    duration?: {
      start_date: number;
      end_date: number;
    };
    cancelled_by?: OrderCancelledBy[];
    in_csv?: boolean;
  };
  pagination?: IPagination;
  sort: IOrderBy[];
}

export interface IOrderItemDetails extends IOrderItem {
  variant_groups: ICartVariantGroup[];
  addon_groups: ICartAddonGroup[];
}

export interface IOrderDetails extends IOrder {
  order_id: number;
  payment_details: IPaymentDetails[];
  order_items: IOrderItemDetails[];
  order_status_label: string;
  order_status_code: number;
  order_status_title: string;
  cancellation_refund_end_time: number | null;
  restaurant_details?: {
    restaurant_id: string;
    restaurant_name: string;
    restaurant_status: string;
    like_count: number;
    like_count_label: string;
    image: FileObject;
    pos_id?: string;
    pos_partner?: string;
    pos_name?: string;

    default_preparation_time?: number;
    poc_contact_number?: string; //! BACKWARD COMPATIBLE
    poc_number?: string;
    manager_contact_number?: string;
    owner_contact_number?: string;
    location?: string;
    parent_id?: string;
    parent_or_child?: 'parent' | 'child';
  };
  customer_details?: {
    id?: string;
    full_name?: string;
    customer_name?: string;
    phone?: string;
    email?: string;
    alternate_phone?: string;
    image_url?: string;
  };
}

export interface IVendorOrderDetails extends IOrder {
  order_id: number;
  payment_id?: string;
  payment_status: PaymentStatus;
  is_pod: boolean;
  transaction_time?: Date;
  order_status_title?: string;
  order_status_label?: string;
  order_status_code?: number;
  order_items: IOrderItemDetails[];
  cancellation_refund_end_time?: number;
  restaurant_details?: {
    restaurant_name?: string;
    image?: FileObject;
    latitude?: number;
    longitude?: number;
    pos_id?: string;
    pos_partner?: string;
    pos_name?: string;
    parent_id?: string;
    parent_or_child?: 'parent' | 'child';
  };
}

export interface ICancelOrder {
  order_id: number;
  cancellation_reason?: string;
}

export interface ICFOrderResponse {
  cf_order_id: number;
  created_at: Date;
  order_id: string;
  entity: string;
  order_currency: 'INR';
  order_amount: number;
  order_expiry_time: Date;
  customer_details: {
    customer_id: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
  };
  order_meta: {
    return_url: string;
    notify_url: string;
    payment_methods: null;
  };
  settlements: {
    url: string;
  };
  payments: {
    url: string;
  };
  refunds: {
    url: string;
  };
  order_status: 'ACTIVE' | 'PAID' | 'EXPIRED';
  order_token: string; // This is the order_token that has to be sent to the SDK
  order_note: string;
  payment_link: string; // This link opens the payment page provided by Payment Gateway
}

export interface ICFPaymentResponse {
  cf_payment_id?: number;
  order_id?: string;
  entity: string;
  payment_currency: string;
  order_amount: number;
  is_captured: true;
  payment_group: IPaymentGroups;
  authorization: null;
  payment_method: IPaymentMethods | string;
  payment_method_details?: Object;
  payment_amount: 10.01;
  payment_time: Date;
  payment_completion_time: Date;
  payment_status: string;
  payment_message: string;
  bank_reference: string;
  auth_id: string;
}

export interface ISettleRefund extends IRefundSettlementDetails {
  order_id?: number;
}

export interface IPaymentMethodCard {
  card: {
    channel: string;
    card_number: string;
    card_network: string;
    card_type: string;
    card_country: string;
    card_bank_name: string;
  };
}

export interface IPaymentMethodNetBanking {
  netbanking: {
    channel: string;
    netbanking_bank_code: string;
    netbanking_bank_name: string;
  };
}

export interface IPaymentMethodUPI {
  upi: {
    channel: string;
    upi_id: string;
  };
}

export interface IPaymentMethodWallet {
  app: {
    channel: string; //'AmazonPay'
    upi_id: string;
  };
}

export type IPaymentMethods =
  | IPaymentMethodWallet
  | IPaymentMethodUPI
  | IPaymentMethodNetBanking
  | IPaymentMethodCard;

export type IPaymentGroups = 'credit_card' | 'net_banking' | 'upi' | 'wallet';
export interface IPaymentCallbackResponse {
  data: {
    payment_details: {
      transaction_id: string;
      transaction_amount: number;
      transaction_time: Date;
      payment_currency: string;
      external_payment_id: string;
      payment_status: ExternalPaymentStatus;
      payment_message: string;
      bank_reference: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      auth_id: any;
      payment_method_details: IPaymentMethods;
      payment_method: string;
      payment_group: IPaymentGroups;
    };
    customer_details: {
      customer_name: string;
      customer_id: string;
      customer_email: string;
      customer_phone: string;
    };
    error_details?: {
      error_code: string;
      error_description: string;
      error_reason: string;
      error_source: string;
    };
    payment_gateway_details?: {
      gateway_name: string;
      gateway_order_id: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      gateway_payment_id: any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      gateway_status_code: any;
    };
  };
  event_time: string;
  type: ExternalPaymentEvent;
}

export interface IPaymentOrderDetails extends IPayment {
  total_bill?: number;
  total_customer_payable: number;
  coupon_id: number;
  invoice_breakout: IInvoiceBreakout;
  order_status: OrderStatus;
  order_placed_time: Date;
}

export interface CancellationReason {
  id: number;
  user_type: string;
  cancellation_reason: string;
  created_at: Date;
  updated_at: Date;
  is_deleted: boolean;
}
