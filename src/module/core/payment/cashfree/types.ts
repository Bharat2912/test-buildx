import {
  CashFreePaymentEvent,
  CashfreePaymentStatus,
  CashFreeRefundEvents,
} from './enum';

// export interface ICashFreeCreateOrder {
//   cf_order_id: number;
//   created_at: string; //'2023-04-15T14:08:55+05:30'
//   customer_details: {
//     customer_id?: string;
//     customer_name?: string;
//     customer_email?: string;
//     customer_phone?: string;
//   };
//   entity: 'order';
//   order_amount: number;
//   order_currency: 'INR';
//   order_expiry_time: string; //'2023-05-15T14:08:55+05:30'
//   order_id: string;
//   order_meta: {
//     return_url?: string;
//     notify_url?: string;
//     payment_methods?: string;
//   };
//   order_note: string;
//   order_splits: any;
//   order_status: string;
//   order_tags?: any;
//   payment_session_id: string;
//   payments: {
//     url: string;
//   };
//   refunds: {
//     url: string;
//   };
//   settlements: {
//     url: string;
//   };
//   terminal_data: any;
// }
export interface ICashFreeCustomerDetails {
  customer_id: string;
  customer_email: string;
  customer_phone: string;
}

export interface IRefundStatusDetails {
  event_time: string; //'2022-02-28T13:04:28+05:30'
  type: CashFreeRefundEvents.REFUND_STATUS_WEBHOOK;
  data: {
    refund: ICashFreeRefundDetails;
  };
}
export interface ICashFreeRefundDetails {
  cf_payment_id: number;
  cf_refund_id: string | number;
  refund_id: string;
  order_id: string;
  entity: string;
  refund_amount: number;
  refund_currency: string;
  refund_note: string;
  refund_status: string;
  refund_type: string;
  refund_splits: {
    merchantVendorId: string;
    amount: number;
    percentage: number;
  }[];
  status_description: string;
  refund_arn: string;
  metadata: object;
  created_at: string;
  processed_at: string;
  refund_charge: number;
  refund_mode: string;
}

export interface ICashFreeCreateRefundDetails {
  payment_id: string;
  refund_amount: number;
  refund_id: string;
  refund_note?: string;
}

export interface ICashFreeCreateRefundResponse {
  cf_payment_id: number;
  cf_refund_id: string;
  refund_id: string;
  order_id: string;
  entity: string;
  refund_amount: number;
  refund_currency: string;
  refund_note: string;
  refund_status: string;
  refund_type: string;
  refund_splits: [];
  status_description: string;
  refund_arn: string;
  metadata: object;
  created_at: string;
  processed_at: string;
  refund_charge: number;
  refund_mode: string;
}

export interface ICashFreeCreateRefundFailedResponse {
  status: boolean;
  message: string; // bad URL, please check API documentation
  code: string; //'request_failed';
  type:
    | 'invalid_request_error'
    | 'authentication_error'
    | 'rate_limit_error'
    | 'validation_error'
    | 'api_error';
}

export interface ICashFreeCreateRefundDetails {
  payment_id: string;
  refund_amount: number;
  refund_id: string;
  refund_note?: string;
}

export interface ICashFreeCreateRefundResponse {
  status: boolean;
  cf_payment_id: number;
  cf_refund_id: string;
  refund_id: string;
  order_id: string;
  entity: string;
  refund_amount: number;
  refund_currency: string;
  refund_note: string;
  refund_status: string;
  refund_type: string;
  refund_splits: [];
  status_description: string;
  refund_arn: string;
  metadata: object;
  created_at: string;
  processed_at: string;
  refund_charge: number;
  refund_mode: string;
}

export interface IRefundStatusDetails {
  event_time: string; //'2022-02-28T13:04:28+05:30'
  type: CashFreeRefundEvents.REFUND_STATUS_WEBHOOK;
  data: {
    refund: ICashFreeRefundDetails;
  };
}
export interface ICashFreeRefundDetails {
  cf_payment_id: number;
  cf_refund_id: string | number;
  refund_id: string;
  order_id: string;
  entity: string;
  refund_amount: number;
  refund_currency: string;
  refund_note: string;
  refund_status: string;
  refund_type: string;
  refund_splits: {
    merchantVendorId: string;
    amount: number;
    percentage: number;
  }[];
  status_description: string;
  refund_arn: string;
  metadata: object;
  created_at: string;
  processed_at: string;
  refund_charge: number;
  refund_mode: string;
}

export interface ICashFreePaymentMethodCard {
  card: {
    channel: string;
    card_number: string;
    card_network: string;
    card_type: string;
    card_country: string;
    card_bank_name: string;
  };
}

export interface ICashFreePaymentMethodNetBanking {
  netbanking: {
    channel: string;
    netbanking_bank_code: string;
    netbanking_bank_name: string;
  };
}

export interface ICashFreePaymentMethodUPI {
  upi: {
    channel: string;
    upi_id: string;
  };
}

export interface ICashFreePaymentMethodWallet {
  app: {
    channel: string; //'AmazonPay'
    upi_id: string;
  };
}

export type ICashFreePaymentMethods =
  | ICashFreePaymentMethodWallet
  | ICashFreePaymentMethodUPI
  | ICashFreePaymentMethodNetBanking
  | ICashFreePaymentMethodCard;

export type ICashFreePaymentGroups =
  | 'credit_card'
  | 'net_banking'
  | 'upi'
  | 'wallet';
export interface IPaymentCallbackResponse {
  data: {
    order: {
      order_id: string;
      order_amount: number;
      order_currency: 'INR';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      order_tags: any;
    };
    payment: {
      cf_payment_id: number;
      payment_status: CashfreePaymentStatus;
      payment_amount: number;
      payment_currency: 'INR';
      payment_message: string;
      payment_time: string;
      bank_reference: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      auth_id: any;
      payment_method: ICashFreePaymentMethods;
      payment_group: ICashFreePaymentGroups;
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
  type: CashFreePaymentEvent;
}

export interface IFormattedPaymentCallbackResponse {
  data: {
    payment_details: {
      transaction_id: string;
      transaction_amount: number;
      transaction_time: Date;
      payment_currency: string;
      external_payment_id: string;
      payment_status: string;
      payment_message: string;
      bank_reference: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      auth_id: any;
      payment_method_details: ICashFreePaymentMethods;
      payment_method: string;
      payment_group: ICashFreePaymentGroups;
    };
    customer_details: IPaymentCallbackResponse['data']['customer_details'];
    error_details: IPaymentCallbackResponse['data']['error_details'];
    payment_gateway_details?: IPaymentCallbackResponse['data']['payment_gateway_details'];
  };
  event_time: string;
  type: CashFreePaymentEvent;
}
