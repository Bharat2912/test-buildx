import axios from 'axios';
import {Service} from '../enum';
import {PaymentStatus} from '../module/core/payment/enum';
import {IPaymentGroups, IPaymentMethods} from '../module/food/order/types';
import logger from '../utilities/logger/winston_logger';

export interface ITransactionTokenRequest {
  customer_details: {
    customer_id: string;
    customer_email: string;
    customer_phone: string;
  };
  order_payment_id: string;
  order_value: number;
}
interface ITransactionTokenResponse {
  transaction_token: string;
  payment_gateway: string;
}

interface IGetSessionIdResponse {
  session_id: string;
  payment_gateway: string;
}
export async function getTransactionToken(
  data: ITransactionTokenRequest
): Promise<ITransactionTokenResponse> {
  const result = await axios
    .post<{result: ITransactionTokenResponse}>(
      (process.env.CORE_API_URL || '') + '/internal/payment/transaction_token',
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
      if (error.response) {
        logger.error(
          'get payment transaction token failed',
          error.response.data
        );
      } else {
        logger.error('get payment transaction token failed', error);
      }
      throw error;
    });
  return {
    transaction_token: result.transaction_token,
    payment_gateway: 'CASHFREE',
  };
}

export async function getSessionId(
  data: ITransactionTokenRequest
): Promise<IGetSessionIdResponse> {
  const result = await axios
    .post<{result: IGetSessionIdResponse}>(
      (process.env.CORE_API_URL || '') + '/internal/payment/session_id',
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
      if (error.response) {
        logger.error('get payment session id failed', error.response.data);
      } else {
        logger.error('get payment session id failed', error);
      }
      throw error;
    });
  return {
    session_id: result.session_id,
    payment_gateway: 'CASHFREE',
  };
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
  transaction_details: {
    external_payment_id: number;
    transaction_id: string;
    entity: string;
    payment_currency: string;
    order_amount: number;
    is_captured: true;
    payment_group: IPaymentGroups;
    authorization: null;
    payment_method: IPaymentMethods | string;
    payment_method_details?: Object;
    payment_amount: number;
    payment_time: Date;
    payment_completion_time: Date;
    payment_status: string;
    payment_message: string;
    bank_reference: string;
    auth_id: string;
  };
}
interface IPaymentPendingResponse {
  status: PaymentStatus.PENDING;
  transaction_id: string;
  payment_currency: string;
  transaction_details: {};
}
interface IPaymentFailedResponse {
  status: PaymentStatus.FAILED;
  transaction_id: string;
  payment_currency: string;
  transaction_details: {};
}
type PaymentStatusResponse =
  | IPaymentSuccessResponse
  | IPaymentPendingResponse
  | IPaymentFailedResponse;

export async function getTransactionStatus(
  order_payment_id: string
): Promise<PaymentStatusResponse> {
  const result = await axios
    .post<{result: PaymentStatusResponse}>(
      (process.env.CORE_API_URL || '') + '/internal/payment/transaction_status',
      {
        service_name: Service.FOOD_API,
        order_payment_id,
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
      if (error.response) {
        logger.error('CONFIRM PAYMENT FAILED', error.response.data);
      } else {
        logger.error('CONFIRM PAYMENT FAILED', error);
      }
      throw error;
    });
  return result;
}
