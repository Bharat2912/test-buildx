import * as internal_payout from '../../../src/internal/payout';
import {PayoutStatus} from '../../module/core/payout/enum';

export function mockgetAccountBalance() {
  const mockedFunction = jest.spyOn(internal_payout, 'getPayoutAccountBalance');
  mockedFunction.mockReturnValue(
    new Promise(resolve => {
      resolve({
        account_balance: 100000.12,
      });
    })
  );
  return mockedFunction;
}

export function mockgetZeroAccountBalance() {
  const mockedFunction = jest.spyOn(internal_payout, 'getPayoutAccountBalance');
  mockedFunction.mockReturnValue(
    new Promise(resolve => {
      resolve({
        account_balance: 0,
      });
    })
  );
  return mockedFunction;
}

export function mockprocessPayoutTransfer() {
  const mockedFunction = jest.spyOn(internal_payout, 'processPayoutTransfer');
  mockedFunction.mockReturnValue(
    new Promise(resolve => {
      resolve({
        payout_status: PayoutStatus.COMPLETE,
      });
    })
  );
  return mockedFunction;
}

export function mockgetPayoutTransferDetails() {
  const mockedFunction = jest.spyOn(
    internal_payout,
    'getPayoutTransferDetails'
  );
  mockedFunction.mockReturnValue(
    new Promise(resolve => {
      resolve({
        payout_status: PayoutStatus.COMPLETE,
        payout_completed_time: new Date(),
      });
    })
  );
  return mockedFunction;
}
