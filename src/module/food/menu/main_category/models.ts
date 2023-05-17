import Joi from 'joi';
import {Knex} from 'knex';
import {DB} from '../../../../data/knex';
import mainCatTable from './constants';
import menuItemTable from '../constants';
import logger from '../../../../utilities/logger/winston_logger';
import {IMenuItem} from '../models';
import {common_name, joi_restaurant_id} from '../../../../utilities/joi_common';
import {PosPartner} from '../../enum';

export interface IMainCategory {
  id?: number;
  restaurant_id?: string;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  sequence?: number;
  is_deleted?: boolean;
  pos_id?: string;
  pos_partner?: PosPartner;
  discount_rate?: number;
  discount_updated_at?: Date;
  discount_updated_user_id?: string;
  discount_updated_user_type?: string;
}
export const verify_holiday_slot = Joi.object({
  id: Joi.number().required(),
  end_epoch: Joi.number().required().allow(null),
});

export const verify_create_main_category = Joi.object({
  name: common_name.required(),
  restaurant_id: joi_restaurant_id,
});

export const verify_update_main_category = Joi.object({
  id: Joi.number().required(),
  name: common_name.required(),
});

export async function CheckDuplicateName(
  main_category: IMainCategory
): Promise<boolean> {
  logger.debug('checking duplicate name', main_category);
  const main_categories = await getMainCategoryByName(
    main_category.restaurant_id!,
    main_category.name!
  );
  logger.debug('fetched main category by name', main_category);
  if (main_categories && main_categories.length) {
    if (main_categories[0].id !== main_category.id) {
      return true;
    }
  }
  return false;
}

export function getMainCategoryByName(
  restaurant_id: string,
  name: string
): Promise<IMainCategory[]> {
  logger.debug('reading main category by name', {restaurant_id, name});
  return DB.read(mainCatTable.TableName)
    .where({is_deleted: false, restaurant_id, name})
    .select([
      mainCatTable.ColumnNames.id,
      mainCatTable.ColumnNames.restaurant_id,
      mainCatTable.ColumnNames.name,
    ])
    .then((main_category: IMainCategory[]) => {
      logger.debug('successfully fetched main category by name', main_category);
      return main_category;
    })
    .catch((error: Error) => {
      logger.error('GOT ERROR WHILE FETCHING MAIN CATEGORY BY NAME', error);
      throw error;
    });
}

export async function createMainCategory(
  main_category: IMainCategory,
  trx?: Knex.Transaction
): Promise<IMainCategory> {
  logger.debug('creating main Category', main_category);
  const query = DB.write(mainCatTable.TableName)
    .insert({
      ...main_category,
      sequence: DB.write.raw(
        '(SELECT COALESCE(MAX(SEQUENCE),0)+1 FROM main_category WHERE restaurant_id = ? AND is_deleted = FALSE)',
        [main_category.restaurant_id]
      ),
    })
    .returning('*');
  if (trx) {
    query.transacting(trx);
  }
  return await query
    .then((main_category: IMainCategory[]) => {
      logger.debug('successfully created main category', main_category[0]);
      return main_category[0];
    })
    .catch((error: Error) => {
      logger.error('GOT ERROR WHILE CREATING MAIN CATEGORY', error);
      throw error;
    });
}

export function readMainCategories(
  restaurant_id: string
): Promise<IMainCategory[]> {
  logger.debug('reading main category of restaurant', restaurant_id);
  return DB.read(mainCatTable.TableName)
    .select([
      mainCatTable.ColumnNames.id,
      mainCatTable.ColumnNames.name,
      mainCatTable.ColumnNames.restaurant_id,
      mainCatTable.ColumnNames.sequence,
      mainCatTable.ColumnNames.discount_rate,
    ])
    .where({is_deleted: false, restaurant_id: restaurant_id})
    .then((main_category: IMainCategory[]) => {
      logger.debug('successfully fetched main category', main_category);
      return main_category;
    })
    .catch((error: Error) => {
      logger.error(
        'GOT ERROR WHILE FETCHING MAIN CATEGORY BY RESTAURANT IDS',
        error
      );
      throw error;
    });
}

export function readMainCategory(id: number): Promise<IMainCategory> {
  logger.debug('reading main category', id);
  return DB.read(mainCatTable.TableName)
    .select([
      mainCatTable.ColumnNames.id,
      mainCatTable.ColumnNames.name,
      mainCatTable.ColumnNames.restaurant_id,
      mainCatTable.ColumnNames.pos_partner,
    ])
    .where({is_deleted: false, id: id})
    .then((main_category: IMainCategory[]) => {
      logger.debug(
        'successfully fetched main category by id',
        main_category[0]
      );
      return main_category[0];
    })
    .catch((error: Error) => {
      logger.error('ERROR GOT WHILE FETCHING MAIN CATEGORY BY ID', error);
      throw error;
    });
}

export function readMainCategoryForUpdate(
  trx: Knex.Transaction,
  id: number
): Promise<IMainCategory> {
  logger.debug('reading main category for update', id);
  return DB.write(mainCatTable.TableName)
    .select('*')
    .where({is_deleted: false, id: id})
    .forUpdate()
    .transacting(trx)
    .then((main_category: IMainCategory[]) => {
      logger.debug(
        'successfully read main category for update',
        main_category[0]
      );
      return main_category[0];
    })
    .catch((error: Error) => {
      logger.error(
        'ERROR GENRATED WHILE FETCHING MAIN_CATEGORY FOR UPDATE',
        error
      );
      throw error;
    });
}

export async function updateMainCategory(
  main_category: IMainCategory,
  trx?: Knex.Transaction
): Promise<IMainCategory> {
  logger.debug('updating main category', main_category);
  main_category.updated_at = new Date();
  const query = DB.write(mainCatTable.TableName)
    .update(main_category)
    .returning('*')
    .where({id: main_category.id});
  if (trx) {
    query.transacting(trx);
  }
  return await query
    .then((main_category: IMainCategory[]) => {
      logger.debug('successfully updated main category', main_category[0]);
      return main_category[0];
    })
    .catch((error: Error) => {
      logger.error('ERROR GENRATED WHILE UPDATING MAIN_CATEGORY', error);
      throw error;
    });
}

export function availableAfterMainCategory(
  sub_category_ids: number[],
  next_available_after: Date | null
): Promise<IMenuItem> {
  logger.debug('updating main category avilable after', {
    sub_category_ids,
    next_available_after,
  });
  return DB.write(menuItemTable.TableName)
    .update({
      next_available_after,
    })
    .whereIn('sub_category_id', sub_category_ids)
    .returning('*')
    .then((addon: IMenuItem[]) => {
      logger.debug(
        'successfully updated avilable after main category',
        addon[0]
      );
      return addon[0];
    })
    .catch((error: Error) => {
      logger.error(
        'GOT ERROR WHILE UPDATING AVILABLE AFTER MAIN CATEGORY',
        error
      );
      throw error;
    });
}

export function deleteMainCategory(id: number): Promise<IMainCategory> {
  logger.debug('deleting main category by id', id);
  const main_category = <IMainCategory>{
    id: id,
    is_deleted: true,
  };
  return DB.write(mainCatTable.TableName)
    .update(main_category)
    .where({is_deleted: false, id: id})
    .returning('*')
    .then((main_category: IMainCategory[]) => {
      logger.debug('successfully deleted main category', main_category[0]);
      return main_category[0];
    })
    .catch((error: Error) => {
      logger.error('GOT ERROR WHILE DELETING MAIN CATEGORY', error);
      throw error;
    });
}

export function bulkUpdateMainCategory(
  trx: Knex.Transaction,
  updateRows: IMainCategory[]
): Promise<IMainCategory[]> {
  logger.debug('bulk updating main category', updateRows);
  const subquery = `
  (select * from json_to_recordset(?)
   as x(
     id int,
     sequence int,
     name text)
  ) as data_table`;
  return DB.write
    .raw(
      `update ${mainCatTable.TableName}
        set name = data_table.name, sequence = data_table.sequence
        from  ${subquery}
        where ${mainCatTable.TableName}.id = data_table.id
        RETURNING *
        `,
      [JSON.stringify(updateRows)]
    )
    .transacting(trx)
    .then(main_category => {
      logger.debug('successfully bulk updated main category', main_category);
      return main_category.rows;
    })
    .catch((error: Error) => {
      logger.error('GOT ERROR WHILE UPDATED MAIN CATEGORY', error);
      throw error;
    });
}

export function bulkInsertMainCategory(
  trx: Knex.Transaction,
  insertRows: IMainCategory[]
): Promise<IMainCategory[]> {
  logger.debug('bulk inserting main category', insertRows);
  return DB.write(mainCatTable.TableName)
    .insert(insertRows)
    .returning('*')
    .transacting(trx)
    .then((main_category: IMainCategory[]) => {
      logger.debug('successfully bulk inserted main category', main_category);
      return main_category;
    })
    .catch((error: Error) => {
      logger.error('GOT ERROR WHILE BULK INSERTING MAIN CATEGORY', error);
      throw error;
    });
}

export function readMainCategoryByRestaurantIds(
  Ids: string[]
): Promise<IMainCategory[]> {
  logger.debug('reading main category by restaurant ids', Ids);
  return DB.read(mainCatTable.TableName)
    .select(['id', 'restaurant_id', 'name', 'sequence', 'discount_rate'])
    .where({is_deleted: false})
    .whereIn(mainCatTable.ColumnNames.restaurant_id, Ids)
    .orderBy('sequence', 'asc')
    .then((rows: IMainCategory[]) => {
      logger.debug(
        'successfully fetched main category by restaurant ids',
        rows
      );
      return rows;
    })
    .catch((error: Error) => {
      logger.error(
        'GOT ERROR WHILE FETCHING MAIN CATEGORY BY RESTAURANT IDS',
        error
      );
      throw error;
    });
}

// export async function readMainCategoriesAssociatedWithPosForUpdate(
//   trx: Knex.Transaction,
//   pos_ids: string[],
//   restaurant_id: string
// ): Promise<IMainCategory[]> {
//   logger.debug('reading main category by pos ids and restaurant id', {
//     pos_ids,
//     restaurant_id,
//   });
//   try {
//     const main_categories = await DB.write(mainCatTable.TableName)
//       .select([
//         mainCatTable.ColumnNames.id,
//         mainCatTable.ColumnNames.name,
//         mainCatTable.ColumnNames.restaurant_id,
//         mainCatTable.ColumnNames.pos_id,
//         mainCatTable.ColumnNames.pos_partner,
//       ])
//       .transacting(trx)
//       .forUpdate()
//       .where({is_deleted: false, restaurant_id: restaurant_id})
//       .whereIn('pos_id', pos_ids);
//     logger.debug('successfully fetched main categories', main_categories);
//     return main_categories;
//   } catch (error) {
//     logger.error('GOT ERROR WHILE FETCHING MAIN CATEGORIES BY POS IDS', error);
//     throw error;
//   }
// }

export async function readMainCategorieByRestaurantIdForUpdate(
  trx: Knex.Transaction,
  restaurant_id: string
): Promise<IMainCategory[]> {
  logger.debug('reading main categories of restaurant id', restaurant_id);
  try {
    const main_categories = await DB.write(mainCatTable.TableName)
      .select('*')
      .where({is_deleted: false, restaurant_id: restaurant_id})
      .forUpdate()
      .transacting(trx);
    logger.debug('successfully fetched main categories', main_categories);
    return main_categories;
  } catch (error) {
    logger.error(
      'GOT ERROR WHILE FETCHING MAIN CATEGORIES BY RESTAURANT IDS',
      error
    );
    throw error;
  }
}

export async function bulkSoftDeleteMainCategories(
  trx: Knex.Transaction,
  ids: number[]
): Promise<IMainCategory[]> {
  logger.debug('deleting main category by ids', ids);

  try {
    const main_categories = await DB.write(mainCatTable.TableName)
      .update({
        is_deleted: true,
      })
      .where({is_deleted: false})
      .whereIn('id', ids)
      .transacting(trx)
      .returning('*');
    logger.debug('successfully deleted main category', main_categories);
    return main_categories;
  } catch (error) {
    logger.error('GOT ERROR WHILE DELETING MAIN CATEGORY', error);
    throw error;
  }
}
export async function readPosMainCategorieByRestaurantIdForUpdate(
  trx: Knex.Transaction,
  restaurant_id: string,
  pos_partner: string
): Promise<IMainCategory[]> {
  logger.debug('reading main categories of restaurant id', restaurant_id);
  try {
    const main_categories = await DB.write(mainCatTable.TableName)
      .select('*')
      .where({
        restaurant_id: restaurant_id,
        pos_partner: pos_partner,
      })
      .forUpdate()
      .transacting(trx);
    logger.debug('successfully fetched main categories', main_categories);
    return main_categories;
  } catch (error) {
    logger.error(
      'GOT ERROR WHILE FETCHING MAIN CATEGORIES BY RESTAURANT IDS',
      error
    );
    throw error;
  }
}
export async function bulkRemovePosDeatilsFromMainCategories(
  trx: Knex.Transaction,
  main_categories_ids: number[]
): Promise<IMainCategory[]> {
  logger.debug(
    'bulk removing pos partner from main categories',
    main_categories_ids
  );
  return await DB.write(mainCatTable.TableName)
    .update({pos_id: null, pos_partner: null})
    .returning('*')
    .whereIn(mainCatTable.ColumnNames.id, main_categories_ids)
    .transacting(trx)
    .then((main_categories: IMainCategory[]) => {
      logger.debug(
        'successfully removed pos partner from main categories',
        main_categories
      );
      return main_categories;
    })
    .catch((error: Error) => {
      logger.error(
        'GOT ERROR WHILE REMOVING POS PARTNER FROM MAIN CATEGORIES',
        error
      );
      throw error;
    });
}
