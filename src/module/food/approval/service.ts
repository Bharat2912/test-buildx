import logger from '../../../utilities/logger/winston_logger';
import {Knex} from 'knex';
import {bulkInsertApproval} from './model';
import {IMarkForApproval} from './types';

export async function markForApproval(
  trx: Knex.Transaction,
  data: IMarkForApproval
) {
  try {
    const result = await bulkInsertApproval(trx, data.approval_entities);
    return result;
  } catch (error) {
    logger.error('failed while updating approval entries', error);
    throw error;
  }
}
