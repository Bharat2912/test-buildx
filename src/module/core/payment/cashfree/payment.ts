import axios, {AxiosRequestConfig} from 'axios';
import logger from '../../../../utilities/logger/winston_logger';
import {ICFOrderResponse, ICFPaymentResponse} from '../../../food/order/types';
import * as secretStore from '../../../../utilities/secret/secret_store';
import {ICashFreeCustomerDetails} from './types';

export async function getCashfreeTransactionToken(
  customer_data: ICashFreeCustomerDetails,
  order_value: number,
  order_payment_id: string
): Promise<string> {
  const options: AxiosRequestConfig = {
    method: 'POST',
    url: `${secretStore.getSecret('CASHFREE_URL')}/pg/orders`,
    headers: {
      Accept: 'application/json',
      'x-client-id': secretStore.getSecret('CASHFREE_CLIENT_ID'),
      'x-client-secret': secretStore.getSecret('CASHFREE_CLIENT_SECRET'),
      'x-api-version': '2022-01-01',
      'Content-Type': 'application/json',
    },
    data: {
      customer_details: {
        customer_id: customer_data.customer_id,
        customer_email: customer_data.customer_email,
        customer_phone: customer_data.customer_phone,
      },
      order_id: order_payment_id,
      order_amount: order_value,
      order_currency: 'INR',
      order_meta: {
        notify_url: process.env.PAYMENT_GATEWAY_CALLBACK_URL || '',
      },
    },
  };
  return await axios
    .request(options)
    .then(response => {
      logger.info('CREATED CASHFREE ORDER SUCCESSFUL', response.data);
      return response.data.order_token;
    })
    .catch(error => {
      logger.error('CREATED CASHFREE ORDER FAILED', error);
      throw error;
    });
}

export async function getCashfreeSessionId(
  customer_data: ICashFreeCustomerDetails,
  order_value: number,
  order_payment_id: string
): Promise<string> {
  const options: AxiosRequestConfig = {
    method: 'POST',
    url: `${secretStore.getSecret('CASHFREE_URL')}/pg/orders`,
    headers: {
      Accept: 'application/json',
      'x-client-id': secretStore.getSecret('CASHFREE_CLIENT_ID'),
      'x-client-secret': secretStore.getSecret('CASHFREE_CLIENT_SECRET'),
      'x-api-version': '2022-09-01',
      'Content-Type': 'application/json',
    },
    data: {
      customer_details: {
        customer_id: customer_data.customer_id,
        customer_email: customer_data.customer_email,
        customer_phone: customer_data.customer_phone,
      },
      order_id: order_payment_id,
      order_amount: order_value,
      order_currency: 'INR',
      order_meta: {
        notify_url: process.env.PAYMENT_GATEWAY_CALLBACK_URL || '',
      },
    },
  };
  return await axios
    .request(options)
    .then(response => {
      logger.info('CREATED CASHFREE ORDER SUCCESSFUL', response.data);
      return response.data.payment_session_id;
    })
    .catch(error => {
      logger.error('CREATED CASHFREE ORDER FAILED', error);
      throw error;
    });
}

export async function getCashfreeOrder(order_payment_id: string) {
  const options: AxiosRequestConfig = {
    method: 'GET',
    url: `${secretStore.getSecret(
      'CASHFREE_URL'
    )}/pg/orders/${order_payment_id}`,
    headers: {
      Accept: 'application/json',
      'x-client-id': secretStore.getSecret('CASHFREE_CLIENT_ID'),
      'x-client-secret': secretStore.getSecret('CASHFREE_CLIENT_SECRET'),
      'x-api-version': '2022-01-01',
      'Content-Type': 'application/json',
    },
  };
  return await axios
    .request(options)
    .then(response => {
      logger.info('FETCHING CASHFREE ORDER SUCCESSFUL', response.data);
      return response.data as ICFOrderResponse;
    })
    .catch(error => {
      logger.error('FETCHING CASHFREE ORDER Failed', error);
      throw error;
    });
}

export async function getCashfreePayment(payment_id: string) {
  const options: AxiosRequestConfig = {
    method: 'GET',
    url: `${secretStore.getSecret(
      'CASHFREE_URL'
    )}/pg/orders/${payment_id}/payments`,
    headers: {
      Accept: 'application/json',
      'x-client-id': secretStore.getSecret('CASHFREE_CLIENT_ID'),
      'x-client-secret': secretStore.getSecret('CASHFREE_CLIENT_SECRET'),
      'x-api-version': '2022-01-01',
      'Content-Type': 'application/json',
    },
  };
  const cfResponse = await axios
    .request(options)
    .then(response => {
      logger.info('FETCHING CASHFREE PAYMENT SUCCESSFUL', response.data);
      return (response.data as ICFPaymentResponse[])[0];
    })
    .catch(error => {
      logger.error('FETCHING CASHFREE PAYMENT Failed', error);
      throw error;
    });
  cfResponse.payment_method_details = cfResponse.payment_method;
  let payment_method = '';
  if (cfResponse && cfResponse.payment_method) {
    payment_method = Object.keys(cfResponse.payment_method)[0];
  }
  cfResponse.payment_method = payment_method;
  return cfResponse;
}
