import {FileObject} from '../../../utilities/s3_manager';
import {IPayoutAccount} from '../payout_account/models';
import {IOrderDetails} from '../order/types';
import {PayoutStatus} from './enums';

export interface IPayoutDetails {
  restaurant?: {
    id: string;
    name: string;
  };
  account?: IPayoutAccount;
  orders?: IOrderDetails[];
}
export interface IPayout {
  id: string;
  restaurant_id: string;
  start_time: Date; //start date time of payout slot
  end_time: Date; //end date time of payout slot
  total_order_amount: number; // amount calculated by orders
  transaction_charges: number; // Transaction fee charged to vendor for payout transaction
  amount_paid_to_vendor: number; // Actual amount paid to vendor
  transaction_id?: string; // transaction / reference_id by payment Gateway
  transaction_details?: {}; // transaction
  status: PayoutStatus;
  retry: boolean; // if true cron job will keep retrying
  completed_marked_admin_id?: string; // if admin marks it complete save admin id also transaction details
  payout_gateway: 'CASHFREE' | 'PAYTM';
  payout_details?: IPayoutDetails; // order details for payout amount caculation invoice_breakout
  payout_completed_time?: Date; // Date Time when payout marked completed by system or by admin
  is_deleted?: boolean;
  created_at?: Date;
  updated_at?: Date;
  payout_orders?: IOrderDetails[];
}
export interface IPayoutRestaurant {
  id: string;
  name: string;
  image: FileObject;
  account?: IPayoutAccount;
  created_at: Date;
}
export interface IPayoutFilter {
  search_text?: string;
  filter?: {
    status?: string[];
    start_date?: Date;
    end_date?: Date;
    amount_gt?: number;
    amount_lt?: number;
    retry?: boolean;
    completed_by_admin?: boolean;
    in_csv?: boolean;
  };
  sort_by?: {
    column: 'created_at' | 'amount';
    direction?: 'asc' | 'desc';
  };
  pagination?: {
    page_index: number;
    page_size: number;
  };
}
