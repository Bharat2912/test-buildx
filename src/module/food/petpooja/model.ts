import {Knex} from 'knex';
import {DB} from '../../../data/knex';
import logger from '../../../utilities/logger/winston_logger';
import {IVariant} from '../menu/variant/models';
import {IRestaurant_Basic} from '../restaurant/models';
import {
  IPetpoojaItemTax,
  IPetPoojaItemTaxDetails,
  IPetPoojaTax,
  IRestaurantPetpooja,
} from './types';

export function readRestaurantByPosId(
  pos_id: string
): Promise<IRestaurant_Basic> {
  logger.debug('reading restaurant by id', pos_id);
  const DBQuery = DB.read('restaurant')
    .select('*')
    .where({is_deleted: false})
    .where('pos_id', pos_id);

  return DBQuery.then((restaurant: IRestaurant_Basic[]) => {
    return restaurant[0];
  }).catch((error: Error) => {
    logger.error('Exception Reading restaurant by POS ID', error);
    throw error;
  });
}

export async function deleteItemsHolidaySlot(
  trx: Knex.Transaction,
  restaurant_id: string,
  item_pos_ids: string[]
) {
  logger.debug('deleting holidaslot By Pos Id', {restaurant_id, item_pos_ids});
  const DBQuery = DB.read('menu_item')
    .update({next_available_after: null})
    .transacting(trx)
    .where('restaurant_id', restaurant_id)
    .whereIn('pos_id', item_pos_ids);

  return DBQuery.then(result => {
    return result;
  }).catch((error: Error) => {
    logger.error('Exception deleting holidaslot by POS ID', error);
    throw error;
  });
}

export async function addItemsHolidaySlot(
  trx: Knex.Transaction,
  restaurant_id: string,
  item_pos_ids: string[],
  holiday_slot_end_time: Date
) {
  logger.debug('adding holiday slot by pos id', {
    restaurant_id,
    item_pos_ids,
    holiday_slot_end_time,
  });
  const DBQuery = DB.read('menu_item')
    .update({next_available_after: holiday_slot_end_time})
    .transacting(trx)
    .where('restaurant_id', restaurant_id)
    .whereIn('pos_id', item_pos_ids);

  return DBQuery.then(result => {
    return result;
  }).catch((error: Error) => {
    logger.error('Exception Adding holiday slot by POS ID', error);
    throw error;
  });
}

export function readRestaurantPetpoojaOnboarding(
  restaurant_id: string
): Promise<IRestaurantPetpooja> {
  logger.debug('reading restaurant petpooja by id', restaurant_id);
  const DBQuery = DB.read('petpooja_restaurant')
    .select('*')
    .where('id', restaurant_id);

  return DBQuery.then((restaurant: IRestaurantPetpooja[]) => {
    return restaurant[0];
  }).catch((error: Error) => {
    logger.error(
      'Exception Reading restaurant petpooja onboarding by POS ID',
      error
    );
    throw error;
  });
}

export function insertRestaurantPetpooja(
  restaurant: IRestaurantPetpooja
): Promise<IRestaurantPetpooja> {
  return DB.write('petpooja_restaurant')
    .insert(restaurant)
    .returning('*')
    .then((restaurant: IRestaurantPetpooja[]) => {
      return restaurant[0];
    })
    .catch((error: Error) => {
      throw error;
    });
}

export function updateRestaurantPetpooja(
  trx: Knex.Transaction,
  restaurant: IRestaurantPetpooja
): Promise<IRestaurantPetpooja> {
  restaurant.updated_at = new Date();
  return DB.write('petpooja_restaurant')
    .update(restaurant)
    .transacting(trx)
    .where({id: restaurant.id})
    .returning('*')
    .then((restaurant: IRestaurantPetpooja[]) => {
      return restaurant[0];
    })
    .catch((error: Error) => {
      throw error;
    });
}

export async function updatePetpoojaItemTax(
  trx: Knex.Transaction,
  restaurant_id: string,
  itemTaxes: IPetpoojaItemTax[]
) {
  logger.debug('inserting petpooja item taxes', itemTaxes.length);
  await DB.write('petpooja_item_tax')
    .delete()
    .where({restaurant_id})
    .transacting(trx);
  return await DB.write('petpooja_item_tax')
    .insert(itemTaxes)
    .returning('*')
    .transacting(trx);
}

export async function upsertPetpoojaTax(
  trx: Knex.Transaction,
  taxes: IPetPoojaTax[]
): Promise<IPetPoojaTax[]> {
  logger.debug('upsert petpooja taxes', taxes.length);
  return await DB.write('petpooja_tax')
    .insert(taxes)
    .onConflict(['taxid', 'restaurant_id'])
    .merge()
    .returning('*')
    .transacting(trx);
}

export async function getPetpoojaTaxDetailsByItemIds(
  item_pos_ids: string[]
): Promise<IPetPoojaItemTaxDetails[]> {
  return await DB.read('petpooja_tax as tax')
    .select('*')
    .leftOuterJoin('petpooja_item_tax as it', 'it.tax_pos_id', 'tax.taxid')
    .whereIn('item_pos_id', item_pos_ids);
}

// export async function getPetpoojaTaxByIds(
//   taxids: string[]
// ): Promise<IPetPoojaTax[]> {
//   return await DB.read('petpooja_tax').select('*').whereIn('taxid', taxids);
// }

export async function deletePetpoojaTaxByRestaurantID(
  trx: Knex.Transaction,
  restaurant_id: string
): Promise<IPetPoojaTax[]> {
  return await DB.write('petpooja_tax')
    .del()
    .returning('*')
    .transacting(trx)
    .where('restaurant_id', restaurant_id)
    .then(taxes => {
      logger.debug('petpooja taxes deleted', taxes);
      return taxes;
    })
    .catch((error: Error) => {
      throw error;
    });
}

export async function deletePetpoojaItemTaxByRestaurantID(
  trx: Knex.Transaction,
  restaurant_id: string
): Promise<IPetpoojaItemTax[]> {
  return await DB.write('petpooja_item_tax')
    .del()
    .returning('*')
    .transacting(trx)
    .where('restaurant_id', restaurant_id)
    .then(taxes => {
      logger.debug('petpooja item taxes deleted', taxes);
      return taxes;
    })
    .catch((error: Error) => {
      throw error;
    });
}

export async function deleteVariantsHolidaySlot(
  trx: Knex.Transaction,
  pos_variant_item_ids: string[]
) {
  logger.debug('deleting holidaslot By Pos Id', {
    pos_variant_item_ids,
  });
  const DBQuery = DB.read('item_variant')
    .update({next_available_after: null})
    .transacting(trx)
    .whereIn('pos_variant_item_id', pos_variant_item_ids);

  return DBQuery.then(result => {
    return result;
  }).catch((error: Error) => {
    logger.error('Exception deleting variant holidaslot by POS ID', error);
    throw error;
  });
}

export async function addVariantsHolidaySlot(
  trx: Knex.Transaction,
  pos_variant_item_ids: string[],
  holiday_slot_end_time: Date
) {
  logger.debug('adding holiday slot by pos id', {
    pos_variant_item_ids,
    holiday_slot_end_time,
  });
  const DBQuery = DB.read('item_variant')
    .update({next_available_after: holiday_slot_end_time})
    .transacting(trx)
    .whereIn('pos_variant_item_id', pos_variant_item_ids);

  return DBQuery.then(result => {
    return result;
  }).catch((error: Error) => {
    logger.error('Exception Adding variant holiday slot by POS ID', error);
    throw error;
  });
}

export async function deleteAddonsHolidaySlot(
  trx: Knex.Transaction,
  pos_ids: string[]
) {
  logger.debug('deleting holidaslot By Pos Id', {
    pos_ids,
  });
  const DBQuery = DB.read('addon')
    .update({next_available_after: null})
    .transacting(trx)
    .whereIn('pos_id', pos_ids);

  return DBQuery.then(result => {
    return result;
  }).catch((error: Error) => {
    logger.error('Exception deleting variant holidaslot by POS ID', error);
    throw error;
  });
}

export async function addAddonsHolidaySlot(
  trx: Knex.Transaction,
  pos_ids: string[],
  holiday_slot_end_time: Date
) {
  logger.debug('adding holiday slot by pos id', {
    pos_ids,
    holiday_slot_end_time,
  });
  const DBQuery = DB.read('addon')
    .update({next_available_after: holiday_slot_end_time})
    .transacting(trx)
    .whereIn('pos_id', pos_ids);

  return DBQuery.then(result => {
    logger.debug('successfully added addons in holiday slot', result);
    return result;
  }).catch((error: Error) => {
    logger.error('Exception Adding variant holiday slot by POS ID', error);
    throw error;
  });
}

export async function getVariantByVariantItemPosId(
  pos_variant_item_ids: string[]
): Promise<IVariant[]> {
  return await DB.read('item_variant')
    .select('*')
    .whereIn('pos_variant_item_id', pos_variant_item_ids);
}
