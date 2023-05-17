import {Knex} from 'knex';
import {ifscBankname} from '../../../utilities/ifsc_bankname';
import logger from '../../../utilities/logger/winston_logger';
import ResponseError from '../../../utilities/response_error';
import {createBeneficicary} from '../../core/payout/models';
import {IRestaurant} from '../restaurant/models';
import {createPayoutAccount, IPayoutAccount} from './models';

/**
 * 1. create restaurant payout account
 * 2. make it primary
 * 3. verify its ifsc code
 * 4. create its beneficiary
 */
export async function createRestaurantPayoutAccount(
  trx: Knex.Transaction,
  restaurant: IRestaurant,
  payout_account_name = 'Default'
) {
  try {
    let bank_name = '';
    let ifsc_verified = false;
    const bank_details = await ifscBankname(restaurant.ifsc_code!);
    if (bank_details) {
      bank_name = bank_details.BANK;
      ifsc_verified = true;
    } else {
      throw new ResponseError(400, [
        {
          message: 'could not verify restaurant bank account ifsc code',
          code: 1086,
        },
      ]);
    }
    const payout_account: IPayoutAccount = {
      id: '',
      restaurant_id: restaurant.id,
      created_vendor_id: '',
      name: payout_account_name,
      bank_name,
      ifsc_code: restaurant.ifsc_code!,
      bank_account_number: restaurant.bank_account_number!,
      is_deleted: false,
      ifsc_verified,
      is_primary: false,
      status: 'active',
    };

    const beneficiary_details = await createBeneficicary({
      name: restaurant.name!,
      email: restaurant.owner_email!,
      phone:
        restaurant.manager_contact_number || restaurant.owner_contact_number!,
      address: restaurant.business_address || 'No Address',
      bank_account_number: payout_account.bank_account_number,
      bank_ifsc: payout_account.ifsc_code,
    });
    if (beneficiary_details.beneficiary_id) {
      payout_account.beneficiary_details = {
        beneficiary_id: beneficiary_details.beneficiary_id,
      };
      payout_account.is_primary = true;
    }

    await createPayoutAccount(payout_account, trx);
  } catch (error) {
    logger.error('Failed while creating restaurant payout account', error);
    throw error;
  }
}
