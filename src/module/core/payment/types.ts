import {Service} from '../../../enum';
import {RefundGateway, RefundStatus} from './enum';

export interface IGeneratePaymentTransactionToken {
  service_name: Service;
  customer_details: {
    customer_id: string;
    customer_email: string;
    customer_phone: string;
  };
  order_value: number;
  order_payment_id: string;
}

export interface IConfirmPayment {
  service_name: Service;
  order_payment_id: string;
}

export interface IRefundMaster {
  id?: string;
  service?: string;
  payment_id?: string;
  order_id?: number;
  customer_id?: string;
  refund_status?: RefundStatus;
  status_description?: string;
  refund_gateway?: RefundGateway;
  refund_charges?: number;
  refund_amount?: number;
  refund_currency?: string;
  refund_note?: string;
  is_pod?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  additional_details?: any;
  processed_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}

interface IPaymentSuccessResponse {
  status: 'success';
  transaction_id: string;
  payment_method: string;
  transaction_time: Date;
  transaction_amount: number;
  payment_currency: string;
  payment_message: string;
  external_payment_id: string;
  transaction_details: {};
}
interface IPaymentPendingResponse {
  status: 'pending';
  transaction_id: string;
  payment_currency: string;
  transaction_details: {};
}
interface IPaymentFailedResponse {
  status: 'failed';
  transaction_id: string;
  payment_currency: string;
  transaction_details: {};
}
export type PaymentStatusResponse =
  | IPaymentSuccessResponse
  | IPaymentPendingResponse
  | IPaymentFailedResponse;

export interface IRefundMasterFilter {
  service_name?: string[];
  order_id?: number[];
  payment_id?: string[];
  refund_status?: RefundStatus[];
}

export enum OrderByColumn {
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
}

export enum SortOrder {
  ASCENDING = 'asc',
  DESCENDING = 'desc',
}

export interface IPagination {
  page_index: number;
  page_size: number;
}

export interface IOrderBy {
  column: OrderByColumn;
  order: SortOrder;
}
