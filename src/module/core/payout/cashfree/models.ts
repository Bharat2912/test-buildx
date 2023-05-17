import axios, {AxiosError, AxiosRequestConfig} from 'axios';
import {DB} from '../../../../data/knex';
import logger from '../../../../utilities/logger/winston_logger';
import ResponseError from '../../../../utilities/response_error';
import * as secretStore from '../../../../utilities/secret/secret_store';
import {PayoutStatus} from '../enum';
import {CashFreePayoutStatus} from './enum';

let auth_token = '';
interface ICFAuthTokenResponse {
  status: 'SUCCESS' | '';
  message: 'Token generated';
  subCode: '200';
  data: {
    token: string;
    expiry: number; // epoch
  };
}
export async function getCashfreeAuthToken() {
  logger.debug('get cashfree token');
  const options: AxiosRequestConfig = {
    method: 'POST',
    url: `${secretStore.getSecret('CASHFREE_PAYOUT_URL')}/payout/v1/authorize`,
    headers: {
      Accept: 'application/json',
      'x-client-id': secretStore.getSecret('CASHFREE_PAYOUT_CLIENT_ID'),
      'x-client-secret': secretStore.getSecret('CASHFREE_PAYOUT_CLIENT_SECRET'),
      'Content-Type': 'application/json',
    },
  };
  const cfResponse = await axios
    .request(options)
    .then(response => {
      logger.info('FETCHING AUTH TOKEN SUCCESSFUL');
      return response.data as ICFAuthTokenResponse;
    })
    .catch(error => {
      logger.error('FETCHING AUTH TOKEN Failed', error);
      throw error;
    });
  if (cfResponse.status === 'SUCCESS') {
    auth_token = cfResponse.data.token;
    return auth_token;
  }
  logger.error('CASHFREE AUTH TOKEN ERROR', cfResponse);
  throw 'unable to get token';
}

interface ICFPayoutTokenValidationResponseError {
  status: 'ERROR';
  subCode: '403';
  message: 'Token is not valid';
}
export async function validateCashfreeAuthToken(): Promise<boolean> {
  logger.debug('Validate cashfree token');
  const options: AxiosRequestConfig = {
    method: 'GET',
    url: `${secretStore.getSecret(
      'CASHFREE_PAYOUT_URL'
    )}/payout/v1/verifyToken`,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${auth_token}`,
      'Content-Type': 'application/json',
    },
  };
  const cfResponse = await axios
    .request(options)
    .then(response => {
      if (
        response.data.status === 'SUCCESS' &&
        response.data.message === 'Token is valid'
      ) {
        return true;
      }
      return false;
    })
    .catch((error: AxiosError<ICFPayoutTokenValidationResponseError>) => {
      if (error.response?.status === 403) {
        if (
          error.response?.data.status === 'ERROR' &&
          error.response?.data.message === 'Token is not valid'
        ) {
          return false;
        }
      }
      logger.error('VALIDATING TOKEN FAILED', error);
      throw error;
    });
  return cfResponse;
}

export async function getValidCashfreeToken() {
  logger.debug('get cashfree valid token');
  if (!auth_token) {
    await getCashfreeAuthToken();
  } else {
    if (!(await validateCashfreeAuthToken())) {
      await getCashfreeAuthToken();
    }
  }
}

export interface ICFBeneficiaryRequest {
  beneId: string;
  name: string;
  email: string;
  phone: string;
  address1: string;
  bankAccount: string;
  ifsc: string;
}
interface ICFBeneficiaryResponse {
  status: string;
  subCode: string;
  message: string;
}

export async function createCashfreeBeneficicary(
  beneficiary: ICFBeneficiaryRequest
) {
  await getValidCashfreeToken();
  logger.debug('registering cashfree beneficiary', beneficiary);
  const options: AxiosRequestConfig = {
    method: 'POST',
    url: `${secretStore.getSecret(
      'CASHFREE_PAYOUT_URL'
    )}/payout/v1/addBeneficiary`,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${auth_token}`,
      'Content-Type': 'application/json',
    },
    data: beneficiary,
  };
  const cfResponse = await axios
    .request(options)
    .then(response => {
      logger.info('register cashfree beneficiary response', response.data);
      return response.data as ICFBeneficiaryResponse;
    })
    .catch(error => {
      logger.error('REGISTER BENEFICIARY FAILED', error);
      throw error;
    });

  if (cfResponse.status !== 'SUCCESS') {
    const error_code = ['409', '422', '412', '520'];
    if (error_code.includes(cfResponse.subCode)) {
      throw new ResponseError(400, [
        {
          message: cfResponse.message,
          code: 0,
        },
      ]);
    } else {
      logger.error('beneficiary registration failed', cfResponse.message);
      throw new ResponseError(400, [
        {
          message: 'beneficiary registration failed',
          code: 0,
        },
      ]);
    }
  }
  return cfResponse;
}

interface ICFBalanceResponse {
  status: string;
  subCode: string;
  message: string;
  data: {
    balance: string;
    availableBalance: string;
  };
}

export async function getCashfreeBalance(): Promise<number> {
  await getValidCashfreeToken();
  logger.debug('get cashfree balance');
  const options: AxiosRequestConfig = {
    method: 'GET',
    url: `${secretStore.getSecret('CASHFREE_PAYOUT_URL')}/payout/v1/getBalance`,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${auth_token}`,
      'Content-Type': 'application/json',
    },
  };
  const cfResponse = await axios
    .request(options)
    .then(response => {
      logger.info('FETCHING BALANCE SUCCESSFUL', response.data);
      return response.data as ICFBalanceResponse;
    })
    .catch(error => {
      logger.error('FETCHING BALANCE FAILED', error);
      throw error;
    });
  if (cfResponse.status === 'SUCCESS') {
    return +cfResponse.data.availableBalance;
  }
  throw 'unable to get balance';
}

export interface ICFPayoutRequest {
  beneId: string;
  amount: string;
  transferId: string;
}
interface ICFTransferOutput_error {
  status: 'ERROR';
  subCode: string;
  message: string;
}
interface ICFTransferOutput_pending {
  status: 'PENDING';
  subCode: '201' | '202';
  message: string;
}
export type ICFPayoutResponse =
  | ICFTransferOutput_error
  | ICFTransferOutput_pending
  | {
      status: 'SUCCESS';
      subCode: '200' | '201';
      message: 'Transfer completed successfully';
      data: {
        referenceId: string;
        utr: string;
        acknowledged: number;
      };
    };

export async function processCashfreePayout(
  transfer_input: ICFPayoutRequest
): Promise<ICFPayoutResponse> {
  logger.debug('initiated cashfree transfer', transfer_input);
  await getValidCashfreeToken();
  // if (process.env.LOCAL_RUN)
  //   return {
  //     status: 'SUCCESS',
  //     subCode: '200',
  //     message: 'Transfer completed successfully',
  //     data: {
  //       referenceId: '10023',
  //       utr: 'P16111765023806',
  //       acknowledged: 1,
  //     },
  //   };
  const options: AxiosRequestConfig = {
    method: 'POST',
    url: `${secretStore.getSecret(
      'CASHFREE_PAYOUT_URL'
    )}/payout/v1.2/requestTransfer`,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${auth_token}`,
      'Content-Type': 'application/json',
    },
    data: transfer_input,
  };
  const cfResponse = await axios
    .request(options)
    .then(response => {
      logger.info('cashfree payout transfer successful', response.data);
      return response.data as ICFPayoutResponse;
    })
    .catch(error => {
      logger.error('CASHFREE PAYOUT TRANSFER FAILED', error);
      throw error;
    });
  return cfResponse;
}
interface ICFGetPayoutResponse_Error {
  status: 'ERROR';
  subCode: '404';
  message: string;
}
interface ICFGetPayoutResponse_Success {
  status: 'SUCCESS';
  subCode: '200';
  message: string;
  data: {
    transfer: {
      transferId: string;
      status: CashFreePayoutStatus;
      amount: string;
    };
  };
}
type ICFGetPayoutResponse =
  | ICFGetPayoutResponse_Success
  | ICFGetPayoutResponse_Error;

export async function getCashfreePayout(
  transferId: string
): Promise<ICFGetPayoutResponse> {
  await getValidCashfreeToken();
  const options: AxiosRequestConfig = {
    method: 'GET',
    url:
      secretStore.getSecret('CASHFREE_PAYOUT_URL') +
      '/payout/v1.2/getTransferStatus?transferId=' +
      transferId,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${auth_token}`,
      'Content-Type': 'application/json',
    },
  };
  const cfResponse = await axios
    .request(options)
    .then(response => {
      logger.info(
        'cashfree transfer details fetched successful',
        response.data
      );
      return response.data as ICFGetPayoutResponse;
    })
    .catch(error => {
      logger.error('CASHFREE TRANSFER DETAILS FETCHING FAILED', error);
      throw error;
    });
  return cfResponse;
}

export interface IBeneficiary {
  id: string;
  bank_account_number: string;
  ifsc_code: string;
  beneficiary_details: object;
  created_at?: Date;
  updated_at?: Date;
}
export async function getCashfreeBeneficiary(
  ifsc_code: string,
  bank_account_number: string
): Promise<IBeneficiary> {
  logger.debug('getting cashfree_beneficiary', {
    ifsc_code,
    bank_account_number,
  });
  return (
    await DB.read('cashfree_beneficiary')
      .select('*')
      .where({ifsc_code, bank_account_number})
  )[0];
}

export async function saveCashfreeBeneficiary(
  data: IBeneficiary
): Promise<IBeneficiary> {
  logger.debug('saving cashfree benificiary', data);
  return DB.write('cashfree_beneficiary')
    .insert(data)
    .returning('*')
    .then((payout_account: IBeneficiary[]) => {
      logger.debug('saved cashfree benificiary', payout_account[0]);
      return payout_account[0];
    })
    .catch((error: Error) => {
      logger.error('GOT ERROR WHILE SAVING CASHFREE BENIFICIARY', error);
      throw error;
    });
}
export function formatPayoutStatus(
  cashfree_payout_status: CashFreePayoutStatus
) {
  let payout_status: PayoutStatus;
  if (
    cashfree_payout_status === CashFreePayoutStatus.SUCCESS ||
    cashfree_payout_status === CashFreePayoutStatus.RECEIVED
  ) {
    payout_status = PayoutStatus.COMPLETE;
  } else if (cashfree_payout_status === CashFreePayoutStatus.PENDING) {
    payout_status = PayoutStatus.PENDING;
  } else if (cashfree_payout_status === CashFreePayoutStatus.FAILED) {
    payout_status = PayoutStatus.FAILED;
  } else if (cashfree_payout_status === CashFreePayoutStatus.REJECTED) {
    payout_status = PayoutStatus.REJECTED;
  } else if (cashfree_payout_status === CashFreePayoutStatus.REVERSED) {
    payout_status = PayoutStatus.REVERSED;
  } else {
    payout_status = PayoutStatus.FAILED;
  }
  return payout_status;
}
