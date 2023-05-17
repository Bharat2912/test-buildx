import {DB} from '../../../data/knex';
import payout_accountTable from './constants';
import logger from '../../../utilities/logger/winston_logger';
import Joi from 'joi';
import {v4 as uuidv4} from 'uuid';
import {Knex} from 'knex';

export interface IBeneficiaryDetail {
  beneficiary_id: string;
}
export interface IPayoutAccount {
  id: string;
  restaurant_id: string;
  created_vendor_id: string;

  name: string;
  bank_name: string;
  ifsc_code: string;
  bank_account_number: string;

  ifsc_verified: boolean;
  beneficiary_details?: IBeneficiaryDetail;
  is_primary: boolean;
  status: string;
  is_deleted: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export const verify_create_payout_account = Joi.object({
  name: Joi.string().trim().min(1).max(70).required(),
  ifsc_code: Joi.string().min(4).max(20).required(),
  bank_account_number: Joi.string().min(4).max(50).required(),
});

export async function createPayoutAccount(
  payout_account: IPayoutAccount,
  trx?: Knex.Transaction
): Promise<IPayoutAccount> {
  payout_account.id = uuidv4();
  logger.debug('creating PayoutAccount', payout_account);

  if (trx) {
    return (
      await DB.write(payout_accountTable.TableName)
        .insert(payout_account)
        .returning('*')
        .transacting(trx)
    )[0];
  } else {
    return (
      await DB.write(payout_accountTable.TableName)
        .insert(payout_account)
        .returning('*')
    )[0];
  }
}

export function readPayoutAccounts(
  restaurant_id?: string
): Promise<IPayoutAccount[]> {
  const qry = DB.read.select('*').from('payout_account').where({
    is_deleted: false,
    restaurant_id,
  });

  return qry
    .then((payout_account: IPayoutAccount[]) => {
      return payout_account;
    })
    .catch((error: Error) => {
      throw error;
    });
}

export function readPayoutAccount(id: string): Promise<IPayoutAccount> {
  return DB.read
    .select('*')
    .from('payout_account')
    .where({
      is_deleted: false,
      id,
    })
    .then((payout_account: IPayoutAccount[]) => {
      return payout_account[0];
    })
    .catch((error: Error) => {
      throw error;
    });
}

export function makePrimaryPayoutAccount(
  payout_account: IPayoutAccount
): Promise<IPayoutAccount[]> {
  payout_account.updated_at = new Date();
  logger.debug('updating PayoutAccount', payout_account);
  const DBQuery = DB.write(payout_accountTable.TableName)
    .update({is_primary: DB.write.raw(`?? = '${payout_account.id}'`, ['id'])})
    .returning('*')
    .where({restaurant_id: payout_account.restaurant_id, is_deleted: false});

  return DBQuery.then((payout_account: IPayoutAccount[]) => {
    return payout_account;
  }).catch((error: Error) => {
    throw error;
  });
}

export function updatePayoutAccount(
  payout_account: IPayoutAccount
): Promise<IPayoutAccount[]> {
  payout_account.updated_at = new Date();
  logger.debug('updating PayoutAccount', payout_account);
  return DB.write(payout_accountTable.TableName)
    .update(payout_account)
    .returning('*')
    .where({id: payout_account.id})
    .then((payout_account: IPayoutAccount[]) => {
      return payout_account;
    })
    .catch((error: Error) => {
      throw error;
    });
}

export function deletePayoutAccount(id: string): Promise<IPayoutAccount> {
  const payout_account = <IPayoutAccount>{
    id: id,
    is_deleted: true,
  };
  return DB.write(payout_accountTable.TableName)
    .update(payout_account)
    .where({is_deleted: false, id: id})
    .returning('*')
    .then((payout_account: IPayoutAccount[]) => {
      return payout_account[0];
    })
    .catch((error: Error) => {
      throw error;
    });
}

export function readPayoutAccountByBankAccAndIfscNumber(
  restaurant_id: string,
  bank_account_number: string,
  ifsc_code: string
): Promise<IPayoutAccount> {
  logger.debug('reading payout account by bank account number', {
    restaurant_id,
    bank_account_number,
    ifsc_code,
  });
  return DB.read
    .select('*')
    .from('payout_account')
    .where({
      is_deleted: false,
      restaurant_id: restaurant_id,
      bank_account_number: bank_account_number,
      ifsc_code: ifsc_code,
    })
    .then((payout_account: IPayoutAccount[]) => {
      return payout_account[0];
    })
    .catch((error: Error) => {
      throw error;
    });
}
