import {IPayout} from './types';
import {convertToLocalTime, strToCsvRow} from '../../../utilities/utilFuncs';
import {IOrderDetails} from '../order/types';

const payout_csv_cols = {
  payout_id: 'Payout Id',
  restaurant_id: 'Restaurant Id',
  restaurant_name: 'Restaurant Name',
  start_time: 'Start Time',
  end_time: 'End Time',
  processed_on: 'Process On',
  payout_status: 'Payout Status',
  order_id: 'Order Id',
  customer_paid_amount: 'Customer Paid Amount',
  vendor_payout_amount: 'Vendor Payout Amount',
  actual_vendor_payout_amount: 'Actual Vendor Payout Amount',
  remarks: 'Remarks',
  total_all_order_amount: 'Total All Orders Amount',
  transaction_charges: 'Transaction Charges',
  payout_amount_paid_to_vendor: 'Payout Amount Paid To Vendor',
};

export function generatePayoutCSV(filtered_response: IPayout[]) {
  const rows: string[] = [];

  for (let i = 0; i < filtered_response.length; i++) {
    const payout: IPayout = filtered_response[i];
    if (payout?.payout_orders) {
      for (let j = 0; j < payout.payout_orders.length; j++) {
        const payout_row: string[] = [];

        const order: IOrderDetails = payout.payout_orders[j];

        // Payout Id
        payout_row.push(payout.id + '');

        // Restaurant Id
        payout_row.push(payout.restaurant_id + '');

        // Restaurant Name
        payout_row.push((payout.payout_details?.restaurant?.name ?? '') + '');

        // Start Time
        payout_row.push(convertToLocalTime(payout.start_time) + '');

        // End Time
        payout_row.push(convertToLocalTime(payout.end_time) + '');

        // Process On
        payout_row.push(
          (payout?.payout_completed_time
            ? convertToLocalTime(payout?.payout_completed_time)
            : 'N/A') + ''
        );

        // Payout Status
        payout_row.push(payout.status + '');

        // Order Id (multiple orders have same payout id)
        payout_row.push(order.order_id + '');

        // Customer Paid Amount Of One Order
        payout_row.push(order.total_customer_payable + '');

        // Estimated Vendor Payout Amount
        payout_row.push(
          (order?.invoice_breakout?.vendor_payout_amount ?? '') + ''
        );

        // Actual Vendor Payout Amount
        payout_row.push(
          (order.invoice_breakout?.refund_settlement_details
            ?.refund_settled_vendor_payout_amount ??
            order?.invoice_breakout?.vendor_payout_amount ??
            '') + ''
        );

        // Vendor Remark
        payout_row.push(
          (order.invoice_breakout?.refund_settlement_details
            ?.refund_settlement_note_to_vendor ?? 'N/A') + ''
        );

        // Total of All Orders Amount
        payout_row.push(payout.total_order_amount + '');

        // Transaction Charges
        payout_row.push(payout.transaction_charges + '');

        // Transaction Charges
        payout_row.push(payout.amount_paid_to_vendor + '');
        rows.push(strToCsvRow(payout_row));
      }
    }
  }
  const headerArray: string[] = [];
  for (const [key, value] of Object.entries(payout_csv_cols)) {
    if (key && value) headerArray.push(value);
  }

  const headersStr = headerArray.join(',');
  let rowsStr = '';

  if (rows.length) rowsStr = rows.join('\n');
  const result = headersStr + '\n' + rowsStr;
  return result;
}
