import {initGlobalServices} from '../utils/init';
import {loadMockSeedData, testCasesClosingTasks} from '../utils/utils';
import {DB} from '../../data/knex';
import {mockSendSQSMessage} from '../utils/mock_services';
import {
  mockgetPayoutTransferDetails,
  mockgetZeroAccountBalance,
  mockprocessPayoutTransfer,
} from './mock_service';
import {processPayouts} from '../../module/food/payout/cron_service';
jest.mock('axios');

beforeAll(async () => {
  await initGlobalServices();

  await loadMockSeedData('restaurant');
  await loadMockSeedData('coupon');
  await loadMockSeedData('payout_account');
  await loadMockSeedData('payout_order');
});

afterAll(async () => {
  await testCasesClosingTasks();
});

describe('Day 2 | Vendor Check Payout Details', () => {
  test('Genrating Payout Of Orders', async () => {
    try {
      const balance = mockgetZeroAccountBalance();
      const get_payout_transfer_details = mockgetPayoutTransferDetails();
      const process_payout_transfer = mockprocessPayoutTransfer();
      const mock_sqs = mockSendSQSMessage();
      await processPayouts();
      expect(balance).toHaveBeenCalled();
      expect(get_payout_transfer_details).toHaveBeenCalled();
      expect(process_payout_transfer).toHaveBeenCalled();
      expect(mock_sqs).toHaveBeenCalled();
    } catch (error) {
      expect(error).toBe('Out of cashfree available balance');
    }
  });
  test('Reading Payout', async () => {
    const payout_details = await DB.read('payout');
    expect(payout_details[0].status).toBe('INIT');
  });
});
