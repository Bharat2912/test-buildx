import {Service} from '../../../enum';
import {PayoutStatus} from './enum';

export interface IPayoutTransferDetails {
  payout_status?: PayoutStatus;
  payout_completed_time?: Date;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  additional_details?: any;
}

export interface IPayoutGetTransferDetails {
  transfer_id: string;
  service: Service;
}

export interface IProcessPayoutTransfer {
  beneId: string;
  amount: string;
  transferId: string;
  service: Service;
}
