import {getTransaction} from '../../../data/knex';
import logger from '../../../utilities/logger/winston_logger';
import {ISQSPayout} from '../../../utilities/sqs_manager';
import {IPayout} from './types';
import {readPayoutByTrxId, updatePayoutWithTrx} from './models';
import {PayoutStatus} from './enums';
import {generatePayoutCSV} from './payout_csv';

export async function processPayoutUpdate(data: ISQSPayout['data']) {
  try {
    const payout = await readPayoutByTrxId(data.transfer_id);
    if (!payout) {
      logger.error('Payout Not Found', data);
    } else {
      const trx = await getTransaction();
      try {
        const payout_update_details: IPayout = <IPayout>{
          id: payout.id,
          status: data.payout_status,
          transaction_details: data.additional_details,
        };
        if (data.payout_status === PayoutStatus.COMPLETE) {
          payout_update_details.payout_completed_time =
            data.payout_completed_time;
        }
        await updatePayoutWithTrx(trx, payout_update_details);
        await trx.commit();
      } catch (error) {
        await trx.rollback();
        throw error;
      }
    }
  } catch (error) {
    logger.error('error in processing payout update');
    throw error;
  }
}
export async function downloadPayoutCsvAsAdmin(payouts: IPayout[]) {
  try {
    const filtered_response = payouts;
    return generatePayoutCSV(filtered_response);
  } catch (error) {
    logger.error('FAILED WHILE GENRATING PAYOUT CSV FOR ADMIN', error);
    throw error;
  }
}
