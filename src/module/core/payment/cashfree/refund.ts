import * as secretStore from '../../../../utilities/secret/secret_store';
import axios, {AxiosRequestConfig} from 'axios';
import {ICashFreeCreateRefundDetails} from './types';
import logger from '../../../../utilities/logger/winston_logger';

export async function initiateCashfreeRefund(
  cashfree_refund_details: ICashFreeCreateRefundDetails
) {
  const options: AxiosRequestConfig = {
    method: 'POST',
    url: `${secretStore.getSecret('CASHFREE_URL')}/pg/orders/${
      cashfree_refund_details.payment_id
    }/refunds`,
    headers: {
      Accept: 'application/json',
      'x-client-id': secretStore.getSecret('CASHFREE_CLIENT_ID'),
      'x-client-secret': secretStore.getSecret('CASHFREE_CLIENT_SECRET'),
      'x-api-version': '2022-01-01',
      'Content-Type': 'application/json',
    },
    data: {
      refund_amount: cashfree_refund_details.refund_amount,
      refund_id: cashfree_refund_details.refund_id,
      refund_note: cashfree_refund_details.refund_note,
    },
  };

  const cf_response = await axios
    .request(options)
    .then(response => {
      logger.info('CASHFREE REFUND INITIATED RESPONSE', response.data);
      response.data.status = true;
      return response.data;
    })
    .catch(error => {
      logger.error('CASHFREE REFUND FAILED', error);
      if (error.response.data) {
        logger.error('CASHFREE REFUND FAILED RESPONSE', error.response.data);
        error.response.data.status = false;
        return error.response.data;
      }
      throw error;
    });
  return cf_response;
}

export async function getAllCashfreeRefunds(payment_id: string) {
  const options: AxiosRequestConfig = {
    method: 'GET',
    url: `${secretStore.getSecret(
      'CASHFREE_URL'
    )}/pg/orders/${payment_id}/refunds`,
    headers: {
      Accept: 'application/json',
      'x-client-id': secretStore.getSecret('CASHFREE_CLIENT_ID'),
      'x-client-secret': secretStore.getSecret('CASHFREE_CLIENT_SECRET'),
      'x-api-version': '2022-01-01',
      'Content-Type': 'application/json',
    },
  };

  const cf_response = await axios
    .request(options)
    .then(response => {
      logger.info('CASHFREE GET ALL REFUNDS FETCHED', response.data);
      return response.data;
    })
    .catch(error => {
      logger.error('READING CASHFREE ALL REFUNDS FAILED', error);
      logger.error(
        'READING CASHFREE ALL REFUNDS FAILED RESPONSE',
        error.response.data
      );
      throw error;
    });
  return cf_response;
}

export async function getCashfreeRefund(payment_id: string, refund_id: string) {
  const options: AxiosRequestConfig = {
    method: 'GET',
    url: `${secretStore.getSecret(
      'CASHFREE_URL'
    )}/pg/orders/${payment_id}/refunds/${refund_id}`,
    headers: {
      Accept: 'application/json',
      'x-client-id': secretStore.getSecret('CASHFREE_CLIENT_ID'),
      'x-client-secret': secretStore.getSecret('CASHFREE_CLIENT_SECRET'),
      'x-api-version': '2022-01-01',
      'Content-Type': 'application/json',
    },
  };

  const cf_response = await axios
    .request(options)
    .then(response => {
      logger.info('CASHFREE REFUND FETCHED', response.data);
      return response.data;
    })
    .catch(error => {
      logger.error('READING CASHFREE REFUND FAILED', error);
      logger.error(
        'READING CASHFREE REFUND FAILED RESPONSE',
        error.response.data
      );
      throw error;
    });
  return cf_response;
}
