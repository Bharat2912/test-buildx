import axios from 'axios';
import {PayoutStatus} from '../module/food/payout/enums';
import logger from '../utilities/logger/winston_logger';

export interface IBeneficiaryRequest {
  name: string;
  email: string;
  phone: string;
  address: string;
  bank_account_number: string;
  bank_ifsc: string;
}
interface IBeneficiaryResponse {
  beneficiary_id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  beneficiary_details: any;
}
export async function createBeneficicary(
  payload: IBeneficiaryRequest
): Promise<IBeneficiaryResponse> {
  logger.debug('registering beneficiary', payload);

  const result = await axios
    .post<{result: IBeneficiaryResponse}>(
      (process.env.CORE_API_URL || '') + '/internal/payout/create_beneficicary',
      payload,
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
        logger.error('create beneficicary failed', error.response.data);
      } else {
        logger.error('create beneficicary failed', error);
      }
      throw error;
    });
  return result;
}

interface IProcessPayout {
  beneId: string;
  amount: string;
  transferId: string;
  service: string;
}
interface IPayoutTransferDetails {
  payout_status?: PayoutStatus;
  payout_completed_time?: Date;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  additional_details?: any;
}

export async function processPayoutTransfer(
  data: IProcessPayout
): Promise<IPayoutTransferDetails> {
  logger.debug('processing payout transfer details', data);
  const result = await axios
    .post<{result: IPayoutTransferDetails}>(
      (process.env.CORE_API_URL || '') + '/internal/payout/request_transfer',
      data,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    .then(response => {
      logger.debug('payout transfer successful', response.data.result);
      return response.data.result;
    })
    .catch(error => {
      logger.error('PAYOUT TRANSFER REQUEST FAILED', error.response.data);
      throw error;
    });
  return result;
}

interface IGetPayoutTransferDetails {
  transfer_id: string;
  service: string;
}
export async function getPayoutTransferDetails(
  details: IGetPayoutTransferDetails
): Promise<IPayoutTransferDetails> {
  logger.debug('getting payout transfer details', details);
  const data = {
    service: details.service,
  };
  const result = await axios
    .post<{result: IPayoutTransferDetails}>(
      (process.env.CORE_API_URL || '') +
        `/internal/payout/transfer_details/${details.transfer_id}`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    .then(response => {
      logger.debug(
        'payout transfer details fetch successful',
        response.data.result
      );
      return response.data.result;
    })
    .catch(error => {
      logger.error('PAYOUT TRANSFER DETAILS FETCH FAILED', error.response.data);
      throw error;
    });
  return result;
}

export interface IGetPayoutAccountBalanceResponse {
  account_balance: number;
}
export async function getPayoutAccountBalance(): Promise<IGetPayoutAccountBalanceResponse> {
  logger.debug('getting payout account balance');
  const result = await axios
    .get<{result: IGetPayoutAccountBalanceResponse}>(
      (process.env.CORE_API_URL || '') + '/internal/payout/account_balance',
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    .then(response => {
      logger.debug(
        'payout account balance fetch successful',
        response.data.result
      );
      return response.data.result;
    })
    .catch(error => {
      logger.error('PAYOUT ACCOUNT BALANCE FETCH FAILED', error.response.data);
      if (error.response.data) {
        throw error.response.data;
      }
      throw error;
    });
  return result;
}
