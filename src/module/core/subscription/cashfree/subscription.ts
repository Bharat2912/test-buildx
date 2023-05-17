import axios from 'axios';
import {
  IActivateCashFreeSubscription,
  ICashFreeGetSubscriptionPaymentResponse,
  ICreateCashFreePlan,
  ICashFreeSubscription,
  ICreateCashFreeSubscription,
  ICreateCashFreePlanResponse,
  ICreateCashFreeSubscriptionResponse,
  ICancelCashFreeSubscriptionResponse,
  IActivateCashFreeSubscriptionResponse,
  ICashFreeGetSubscriptionPaymentsResponse,
  IRetryPaymentCashFreeSubscriptionResponse,
  IRetryPaymentCashFreeSubscription,
} from './types';
import logger from '../../../../utilities/logger/winston_logger';
import * as secretStore from '../../../../utilities/secret/secret_store';

export async function createCashFreePlan(
  plan_details: ICreateCashFreePlan
): Promise<ICreateCashFreePlanResponse> {
  logger.debug('creating plan at cashfree', plan_details);
  return await axios({
    method: 'post',
    url: `${process.env.CASHFREE_SUBSCRIPTION_HOSTNAME}/api/v2/subscription-plans`,
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Id': secretStore.getSecret('CASHFREE_CLIENT_ID'),
      'X-Client-Secret': secretStore.getSecret('CASHFREE_CLIENT_SECRET'),
    },
    data: plan_details,
  })
    .then(response => {
      logger.debug('cashfree plan created successfully', response.data);
      return response.data;
    })
    .catch(error => {
      logger.error('FAILED TO CREAT PLAN AT CASHFREE', error.response.data);
      throw error;
    });
}

export async function createCashFreeSubscription(
  subscription_details: ICreateCashFreeSubscription
): Promise<ICreateCashFreeSubscriptionResponse> {
  logger.debug('creating subscription at cashfree', subscription_details);
  return await axios({
    method: 'post',
    url: `${process.env.CASHFREE_SUBSCRIPTION_HOSTNAME}/api/v2/subscriptions`,
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Id': secretStore.getSecret('CASHFREE_CLIENT_ID'),
      'X-Client-Secret': secretStore.getSecret('CASHFREE_CLIENT_SECRET'),
    },
    data: subscription_details,
  })
    .then(response => {
      logger.debug('cashfree subscription successfully created', response.data);
      return response.data;
    })
    .catch(error => {
      logger.error(
        'FAIELD TO CREATE SUBSCRIPTION AT CASHFREE',
        error.response.data
      );
      throw error;
    });
}

export async function getCashFreeSubscription(
  subscription_id: number
): Promise<ICashFreeSubscription> {
  logger.debug(
    'fetch cashfree subscription details by subscription id',
    subscription_id
  );
  return await axios({
    method: 'get',
    url: `${process.env.CASHFREE_SUBSCRIPTION_HOSTNAME}/api/v2/subscriptions/${subscription_id}`,
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Id': secretStore.getSecret('CASHFREE_CLIENT_ID'),
      'X-Client-Secret': secretStore.getSecret('CASHFREE_CLIENT_SECRET'),
    },
  })
    .then(response => {
      logger.debug(
        'subscription details fetched successfully from cashfree',
        response.data
      );
      return response.data;
      // return {
      //   status: 'OK',
      //   message: 'Subscription Details',
      //   subscription: {
      //     subscriptionId: 'RES_5a1b283c-1070-459d-adde-5b78c4a87c72',
      //     subReferenceId: 98616,
      //     planId: 'RES_e6372ad4-0a69-4dc1-a936-26393cd4b100',
      //     customerName: 'Amogh Chavan',
      //     customerEmail: 'amogh.c@speedyy.com',
      //     customerPhone: '9819997648',
      //     mode: 'NPCI_SBC',
      //     cardNumber: null,
      //     status: 'ACTIVE',
      //     firstChargeDate: '2022-11-30',
      //     addedOn: '2022-11-28 10:57:49',
      //     scheduledOn: '2022-11-30 07:00:00',
      //     currentCycle: 2,
      //     authLink: 'https://cfre.in/f2tejfp',
      //     bankAccountNumber: '4444333322221111',
      //     bankAccountHolder: 'Test',
      //     umrn: 'NACH33772132794642441364',
      //     tpvEnabled: false,
      //     payerAccountDetails: {},
      //   },
      // } as any;
    })
    .catch(error => {
      logger.error(
        'FAILED TO READ CASHFREE SUBSCRIPTION DETAILS',
        error.response.data
      );
      throw error;
      // return {
      //   status: 'OK',
      //   message: 'Subscription Details',
      //   subscription: {
      //     subscriptionId: 'RES_5a1b283c-1070-459d-adde-5b78c4a87c72',
      //     subReferenceId: 98616,
      //     planId: 'RES_e6372ad4-0a69-4dc1-a936-26393cd4b100',
      //     customerName: 'Amogh Chavan',
      //     customerEmail: 'amogh.c@speedyy.com',
      //     customerPhone: '9819997648',
      //     mode: 'NPCI_SBC',
      //     cardNumber: null,
      //     status: 'CANCELLED',
      //     firstChargeDate: '2022-11-30',
      //     addedOn: '2022-11-28 10:57:49',
      //     scheduledOn: '2022-11-30 07:00:00',
      //     currentCycle: 0,
      //     authLink: 'https://cfre.in/f2tejfp',
      //     bankAccountNumber: '4444333322221111',
      //     bankAccountHolder: 'Test',
      //     umrn: 'NACH33772132794642441364',
      //     tpvEnabled: false,
      //     payerAccountDetails: {},
      //   },
      // };
    });
}

export async function getCashFreeSingleSubscriptionPayment(
  subscription_id: number,
  payment_id: number
): Promise<ICashFreeGetSubscriptionPaymentResponse> {
  logger.debug('fetching cashfree subscription payment', {
    subscription_id,
    payment_id,
  });
  return await axios({
    method: 'get',
    url: `${process.env.CASHFREE_SUBSCRIPTION_HOSTNAME}/api/v2/subscriptions/${subscription_id}/payments/${payment_id}`,
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Id': secretStore.getSecret('CASHFREE_CLIENT_ID'),
      'X-Client-Secret': secretStore.getSecret('CASHFREE_CLIENT_SECRET'),
    },
  })
    .then(response => {
      logger.debug(
        'cashfree subscription payments fetched successfully',
        response.data
      );
      return response.data;
    })
    .catch(error => {
      logger.error(
        'FAILED TO READ CASHFREE GET SUBSCRIPTION PAYMENT DETAILS',
        error.response.data
      );
      throw error;
      // return {
      //   status: 'OK',
      //   message: 'Subscription Payment',
      //   payment: {
      //     paymentId: 22765621,
      //     referenceId: 2142089201,
      //     cfOrderId: 232864051,
      //     orderId: 'ORD_245321',
      //     subReferenceId: 98616,
      //     currency: 'INR',
      //     amount: 100,
      //     cycle: 3,
      //     status: 'SUCCESS',
      //     remarks: null,
      //     scheduledOn: '2022-11-28',
      //     addedOn: '2022-12-01 11:05:19',
      //     retryAttempts: 0,
      //     failureReason: null,
      //   },
      // };
    });
}

export async function getCashFreeSubscriptionPayments(
  subscription_id: number,
  last_subscription_payment_id?: number,
  count?: number
): Promise<ICashFreeGetSubscriptionPaymentsResponse> {
  logger.debug('fetching cashfree subscription payments', {
    subscription_id,
    last_subscription_payment_id,
    count,
  });
  return await axios({
    method: 'get',
    url: `${process.env.CASHFREE_SUBSCRIPTION_HOSTNAME}/api/v2/subscriptions/${subscription_id}/payments`,
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Id': secretStore.getSecret('CASHFREE_CLIENT_ID'),
      'X-Client-Secret': secretStore.getSecret('CASHFREE_CLIENT_SECRET'),
    },
    params: {
      lastId: last_subscription_payment_id,
      count,
    },
  })
    .then(response => {
      logger.debug(
        'cashfree subscription payments fetched successfully',
        response.data
      );
      return response.data;
    })
    .catch(error => {
      logger.error(
        'FAILED TO READ CASHFREE GET SUBSCRIPTION PAYMENTS DETAILS',
        error.response.data
      );
      throw error;
    });
}

export async function cancelCashFreeSubscription(
  subscription_id: number
): Promise<ICancelCashFreeSubscriptionResponse> {
  logger.debug('cancel cashfree subscription', {subscription_id});
  return await axios({
    method: 'post',
    url: `${process.env.CASHFREE_SUBSCRIPTION_HOSTNAME}/api/v2/subscriptions/${subscription_id}/cancel`,
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Id': secretStore.getSecret('CASHFREE_CLIENT_ID'),
      'X-Client-Secret': secretStore.getSecret('CASHFREE_CLIENT_SECRET'),
    },
  })
    .then(response => {
      logger.debug(
        'cashfree subscription cancelled successfully',
        response.data
      );
      return response.data;
    })
    .catch(error => {
      logger.error(
        'FAILED WHILE CANCELLING CASHFREE SUBSCRIPTION',
        error.response.data
      );
      throw error;
    });
}

export async function activateCashFreeSubscription(
  subscription_id: number,
  body?: IActivateCashFreeSubscription
): Promise<IActivateCashFreeSubscriptionResponse> {
  logger.debug('activate subscription at cashfree', {subscription_id});
  return await axios({
    method: 'post',
    url: `${process.env.CASHFREE_SUBSCRIPTION_HOSTNAME}/api/v2/subscriptions/${subscription_id}/activate`,
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Id': secretStore.getSecret('CASHFREE_CLIENT_ID'),
      'X-Client-Secret': secretStore.getSecret('CASHFREE_CLIENT_SECRET'),
    },
    data: body,
  })
    .then(response => {
      logger.debug(
        'cashfree subscription activated successfully',
        response.data
      );
      return response.data;
    })
    .catch(error => {
      logger.error(
        'FAILED WHILE ACTIVATING CASHFREE SUBSCRIPTION',
        error.response.data
      );
      throw error;
    });
}

export async function retryPaymentCashFreeSubscription(
  subscription_id: number,
  body?: IRetryPaymentCashFreeSubscription
): Promise<IRetryPaymentCashFreeSubscriptionResponse> {
  logger.debug('retry subscription payment at cashfree', {subscription_id});
  return await axios({
    method: 'post',
    url: `${process.env.CASHFREE_SUBSCRIPTION_HOSTNAME}/api/v2/subscriptions/${subscription_id}/charge-retry`,
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Id': secretStore.getSecret('CASHFREE_CLIENT_ID'),
      'X-Client-Secret': secretStore.getSecret('CASHFREE_CLIENT_SECRET'),
    },
    data: body,
  })
    .then(response => {
      logger.debug(
        'cashfree subscription payment retried successfully',
        response.data
      );
      return response.data;
    })
    .catch(error => {
      logger.error(
        'FAILED WHILE RETRYING CASHFREE SUBSCRIPTION PAYMENT',
        error.response.data
      );
      throw error;
    });
}
