import {CashfreeRefundStatus} from '../../module/core/payment/cashfree/enum';
import * as cashfree_refund_apis from '../../module/core/payment/cashfree/refund';

export function mock_initiateCashfreeRefund_successful_response(
  refund_id: string,
  order_id: string
) {
  const mockedFunction = jest.spyOn(
    cashfree_refund_apis,
    'initiateCashfreeRefund'
  );
  mockedFunction.mockReturnValue(
    new Promise(resolve => {
      resolve({
        status: true,
        cf_payment_id: 918812,
        cf_refund_id: 'refund_1553338',
        refund_id: refund_id,
        order_id: order_id,
        entity: 'refund',
        refund_amount: 100.81,
        refund_currency: 'INR',
        refund_note: 'Refund for order #123',
        refund_status: CashfreeRefundStatus.PENDING,
        refund_type: 'MERCHANT_INITIATED',
        refund_splits: [],
        status_description: 'In Progress',
        refund_arn: 'RF12312',
        metadata: null,
        created_at: '2021-07-25T08:57:52+05:30',
        processed_at: '2021-07-25T12:57:52+05:30',
        refund_charge: 0,
        refund_mode: 'STANDARD',
      });
    })
  );
  return mockedFunction;
}

export function mock_getCashfreeRefund_successful_response(
  refund_id: string,
  order_id: string
) {
  const mockedFunction = jest.spyOn(cashfree_refund_apis, 'getCashfreeRefund');
  mockedFunction.mockReturnValue(
    new Promise(resolve => {
      resolve({
        cf_payment_id: 918812,
        cf_refund_id: 'refund_1553338',
        refund_id: refund_id,
        order_id: order_id,
        entity: 'refund',
        refund_amount: 100.81,
        refund_currency: 'INR',
        refund_note: 'Refund for order #123',
        refund_status: CashfreeRefundStatus.SUCCESS,
        refund_type: 'MERCHANT_PROCESSED',
        refund_splits: [],
        status_description: 'refund completed',
        refund_arn: 'RF12312',
        metadata: null,
        created_at: '2021-07-25T08:57:52+05:30',
        processed_at: '2021-07-25T12:57:52+05:30',
        refund_charge: 0,
        refund_mode: 'STANDARD',
      });
    })
  );
  return mockedFunction;
}
