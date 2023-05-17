import {Knex} from 'knex';
import {DB} from '../../../../data/knex';
import subCatTable from './constants';
import menuItemTable from '../constants';
import logger from '../../../../utilities/logger/winston_logger';
import Joi from 'joi';
import {IMenuItem} from '../models';
import {common_name} from '../../../../utilities/joi_common';
import {ISubCategoryAndMainCategory} from './types';
import {PosPartner} from '../../enum';

export interface ISubCategory {
  id?: number;
  name?: string;
  main_category_id?: number;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
  restaurant_id?: string;
  sequence?: number;
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
export const create_sub_category = Joi.object({
  name: common_name.required(),
  main_category_id: Joi.number().required(),
});

export const update_sub_category = Joi.object({
  id: Joi.number().required(),
  name: common_name.required(),
  main_category_id: Joi.number().required(),
});

export async function CheckDuplicateName(
  sub_category: ISubCategory
): Promise<boolean> {
  const sub_categories = await getSubCategoryByName(
    sub_category.main_category_id!,
    sub_category.name!
  );
  if (sub_categories && sub_categories.length) {
    if (sub_categories[0].id !== sub_category.id) {
      return true;
    }
  }
  return false;
}

export function getSubCategoryByName(main_category_id: number, name: string) {
  logger.debug('reading sub category by name', {main_category_id, name});
  return DB.read(subCatTable.TableName)
    .where({is_deleted: false, main_category_id, name})
    .select([
      subCatTable.ColumnNames.id,
      subCatTable.ColumnNames.main_category_id,
      subCatTable.ColumnNames.name,
    ])
    .then((sub_category: ISubCategory[]) => {
      logger.debug('successfully fetched sub category by name', sub_category);
      return sub_category;
    })
    .catch((error: Error) => {
      logger.error('GOT ERROR WHILE FETCHING SUB CATEGORY BY NAME', error);
      throw error;
    });
}

export async function createSubCategory(
  sub_category: ISubCategory,
  trx?: Knex.Transaction
): Promise<ISubCategory> {
  logger.debug('creating sub category', sub_category);
  const query = DB.write(subCatTable.TableName)
    .insert({
      ...sub_category,
      sequence: DB.write.raw(
        '(SELECT COALESCE(MAX(SEQUENCE),0)+1 FROM sub_category WHERE main_category_id = ? AND is_deleted = FALSE)',
        [sub_category.main_category_id]
      ),
    })
    .returning('*');
  if (trx) {
    query.transacting(trx);
  }
  return await query
    .then((sub_category: ISubCategory[]) => {
      logger.debug('successfully created sub category by name', sub_category);
      return sub_category[0];
    })
    .catch((error: Error) => {
      logger.error('GOT ERROR WHILE CREATING SUB CATEGORY', error);
      throw error;
    });
}

export function readSubCategories(
  main_category_id: number,
  restaurant_id?: string
) {
  logger.debug('reading sub categories', {main_category_id, restaurant_id});
  const qry = DB.read
    .select([
      'sc.id',
      'sc.name',
      'sc.sequence',
      'sc.discount_rate',
      'mc.id as main_category_id',
      'mc.restaurant_id',
    ])
    .from('sub_category as sc')
    .join('main_category as mc', 'sc.main_category_id', 'mc.id')
    .where({['mc.is_deleted']: false})
    .where({['sc.is_deleted']: false})
    .where({['sc.main_category_id']: main_category_id});
  if (restaurant_id) qry.where({['mc.restaurant_id']: restaurant_id});
  return qry
    .then((sub_category: ISubCategory[]) => {
      logger.debug('successfully fetched sub category', sub_category);
      return sub_category;
    })
    .catch((error: Error) => {
      logger.error(
        'GOT ERROR WHILE FETCHING SUB CATEGORY BY MAIN CATEGORY IDS AND RESTAURANT IDS',
        error
      );
      throw error;
    });
}

export function readSubCategoriesByRestaurantId(
  restaurant_id: string
): Promise<ISubCategory[]> {
  logger.debug('reading sub category', {restaurant_id});
  const qry = DB.read
    .select([
      'sc.id',
      'sc.name',
      'sc.pos_partner',
      'sc.sequence',
      'mc.id as main_category_id',
      'mc.restaurant_id',
    ])
    .from('sub_category as sc')
    .join('main_category as mc', 'sc.main_category_id', 'mc.id')
    .where({['mc.is_deleted']: false})
    .where({['sc.is_deleted']: false})
    .where({['mc.restaurant_id']: restaurant_id});
  return qry
    .then((sub_category: ISubCategory[]) => {
      logger.debug('successfully fetched sub category ', sub_category[0]);
      return sub_category;
    })
    .catch((error: Error) => {
      logger.error('FAILED TO FETCH SUB CATEGORY BY ID', error);
      throw error;
    });
}
export function readSubCategory(
  id: number,
  restaurant_id?: string
): Promise<ISubCategory> {
  logger.debug('reading sub category', {id, restaurant_id});
  const qry = DB.read
    .select([
      'sc.id',
      'sc.name',
      'sc.pos_partner',
      'sc.sequence',
      'mc.id as main_category_id',
      'mc.restaurant_id',
    ])
    .from('sub_category as sc')
    .join('main_category as mc', 'sc.main_category_id', 'mc.id')
    .where({['mc.is_deleted']: false})
    .where({['sc.is_deleted']: false})
    .where({['sc.id']: id});
  if (restaurant_id) qry.where({['mc.restaurant_id']: restaurant_id});
  return qry
    .then((sub_category: ISubCategory[]) => {
      logger.debug('successfully fetched sub category ', sub_category[0]);
      return sub_category[0];
    })
    .catch((error: Error) => {
      logger.error('FAILED TO FETCH SUB CATEGORY BY ID', error);
      throw error;
    });
}

export function readSubCategoryForUpdate(
  trx: Knex.Transaction,
  id: number,
  restaurant_id?: string
): Promise<ISubCategoryAndMainCategory> {
  logger.debug('reading sub category for update', {id, restaurant_id});
  const qry = DB.write
    .select([
      'sc.id',
      'sc.name',
      'sc.created_at',
      'sc.updated_at',
      'sc.is_deleted',
      'sc.pos_partner',
      'mc.id as main_category_id',
      'mc.name as main_category_name',
      'mc.restaurant_id',
    ])
    .from('sub_category as sc')
    .join('main_category as mc', 'sc.main_category_id', 'mc.id')
    .where({['mc.is_deleted']: false})
    .where({['sc.is_deleted']: false})
    .where({['sc.id']: id})
    .forUpdate()
    .transacting(trx);
  if (restaurant_id) qry.where({['mc.restaurant_id']: restaurant_id});
  return qry
    .then((sub_category: ISubCategoryAndMainCategory[]) => {
      logger.debug(
        'successfully fetched sub category for update',
        sub_category
      );
      return sub_category[0];
    })
    .catch((error: Error) => {
      logger.error(
        'GOT ERROR WHILE FETCHING SUB CATEGORY BY RESTAURANT IDS',
        error
      );
      throw error;
    });
}

export async function updateSubCategory(
  sub_category: ISubCategory,
  trx?: Knex.Transaction
): Promise<ISubCategory> {
  sub_category.updated_at = new Date();
  logger.debug('updating sub category', sub_category);
  const query = DB.write(subCatTable.TableName)
    .update(sub_category)
    .returning('*')
    .where({id: sub_category.id});
  if (trx) {
    query.transacting(trx);
  }
  return await query
    .then((sub_category: ISubCategory[]) => {
      logger.debug('successfully updated sub category', sub_category[0]);
      return sub_category[0];
    })
    .catch((error: Error) => {
      logger.error('GOT ERROR WHILE UPDATING SUB CATEGORY', error);
      throw error;
    });
}

export function availableAfterSubCategory(
  sub_category_id: number,
  next_available_after: Date | null
): Promise<IMenuItem> {
  logger.debug('updating avilable after sub category', {
    sub_category_id,
    next_available_after,
  });
  return DB.write(menuItemTable.TableName)
    .update({
      next_available_after,
    })
    .where({sub_category_id: sub_category_id, is_deleted: false})
    .returning('*')
    .then((addon: IMenuItem[]) => {
      logger.debug(
        'successfully updated avilable after sub category',
        addon[0]
      );
      return addon[0];
    })
    .catch((error: Error) => {
      logger.error(
        'GOT ERROR WHILE UPDATING AVILABLE AFTER SUB CATEGORY',
        error
      );
      throw error;
    });
}

export function deleteSubCategory(id: number): Promise<ISubCategory> {
  const sub_category = <ISubCategory>{
    id: id,
    is_deleted: true,
  };
  logger.debug('deleting sub category', id);
  return DB.write(subCatTable.TableName)
    .update(sub_category)
    .where({is_deleted: false, id: id})
    .returning('*')
    .then((sub_category: ISubCategory[]) => {
      logger.debug('successfully deleted sub category', sub_category);
      return sub_category[0];
    })
    .catch((error: Error) => {
      logger.error('GOT ERROR WHILE DELETING SUB CATEGORY', error);
      throw error;
    });
}

export function bulkUpdateSubCategory(
  trx: Knex.Transaction,
  updateRows: ISubCategory[]
): Promise<ISubCategory[]> {
  logger.debug('bulk updating sub category', updateRows);
  const subquery = `
  (select * from json_to_recordset(?)
  as x(
    id int,
    sequence int,
    name text)
  ) as data_table`;
  return DB.write
    .raw(
      `update ${subCatTable.TableName}
        set name = data_table.name, sequence = data_table.sequence
        from  ${subquery}
        where ${subCatTable.TableName}.id = data_table.id
        RETURNING *
        `,
      [JSON.stringify(updateRows)]
    )
    .transacting(trx)
    .then(sub_category => {
      return sub_category.rows;
    })
    .catch((error: Error) => {
      logger.error('GOT ERROR WHILE UPDATING SUB CATEGORY', error);
      throw error;
    });
}

export function bulkInsertSubCategory(
  trx: Knex.Transaction,
  insertRows: ISubCategory[]
): Promise<ISubCategory[]> {
  logger.debug('bulk insert sub category', insertRows);
  return DB.write(subCatTable.TableName)
    .insert(insertRows)
    .returning('*')
    .transacting(trx)
    .then((sub_category: ISubCategory[]) => {
      logger.debug('successfully bulk inserted sub category', sub_category);
      return sub_category;
    })
    .catch((error: Error) => {
      logger.error('GOT ERROR WHILE BULK INSERTED SUB CATEGORY', error);
      throw error;
    });
}

export function readSubCategoryByMainCategoryIds(
  Ids: (number | undefined)[]
): Promise<ISubCategory[]> {
  logger.debug('reading sub category by main category ids', Ids);
  return DB.read(subCatTable.TableName)
    .select(['id', 'main_category_id', 'name', 'sequence'])
    .where({is_deleted: false})
    .whereIn(subCatTable.ColumnNames.main_category_id, Ids as number[])
    .orderBy('sequence', 'asc')
    .then((rows: ISubCategory[]) => {
      logger.debug(
        'successfully fetched sub category by main category ids',
        rows
      );
      return rows;
    })
    .catch((error: Error) => {
      logger.error(
        'GOT ERROR WHILE FETCHING SUB CATEGORY BY MAIN CATEGORY IDS',
        error
      );
      throw error;
    });
}

// export async function readSubCategoriesAssociatedWithPosForUpdate(
//   trx: Knex.Transaction,
//   pos_ids: string[],
//   main_category_ids: number[]
// ): Promise<ISubCategory[]> {
//   logger.debug('reading sub categories by pos ids and main category ids', {
//     pos_ids,
//     main_category_ids,
//   });
//   try {
//     const sub_categories = await DB.write(subCatTable.TableName)
//       .select('*')
//       .transacting(trx)
//       .forUpdate()
//       .where({is_deleted: false})
//       .whereIn('pos_id', pos_ids)
//       .whereIn('main_category_id', main_category_ids);
//     logger.debug('successfully fetched sub categories', sub_categories);
//     return sub_categories;
//   } catch (error) {
//     logger.error('GOT ERROR WHILE FETCHING SUB CATEGORIES BY POS IDS', error);
//     throw error;
//   }
// }

export async function readSubCategoryByMainCategoryIdsForUpdate(
  trx: Knex.Transaction,
  main_category_ids: number[]
): Promise<ISubCategory[]> {
  logger.debug(
    'reading sub category ids by main category ids',
    main_category_ids
  );
  try {
    const rows = await DB.write(subCatTable.TableName)
      .select('*')
      .where({is_deleted: false})
      .whereIn('main_category_id', main_category_ids)
      .forUpdate()
      .transacting(trx);
    logger.debug(
      'successfully fetched sub category by main category ids',
      rows
    );
    return rows;
  } catch (error) {
    logger.error(
      'GOT ERROR WHILE FETCHING SUB CATEGORY BY MAIN CATEGORY IDS',
      error
    );
    throw error;
  }
}

export async function bulkSoftDeleteSubCategories(
  trx: Knex.Transaction,
  ids: number[]
): Promise<ISubCategory[]> {
  logger.debug('deleting sub category', ids);
  try {
    const sub_category = await DB.write(subCatTable.TableName)
      .update({
        is_deleted: true,
      })
      .where({is_deleted: false})
      .whereIn('id', ids)
      .transacting(trx)
      .returning('*');
    logger.debug('successfully deleted sub category', sub_category);
    return sub_category;
  } catch (error) {
    logger.error('GOT ERROR WHILE DELETING SUB CATEGORY', error);
    throw error;
  }
}

export async function bulkRemovePosDetailsFromSubCategories(
  trx: Knex.Transaction,
  sub_categories_ids: number[]
): Promise<ISubCategory[]> {
  logger.debug(
    'bulk removing pos partner from sub categories',
    sub_categories_ids
  );
  return await DB.write(subCatTable.TableName)
    .update({pos_id: null, pos_partner: null})
    .returning('*')
    .whereIn(subCatTable.ColumnNames.id, sub_categories_ids)
    .transacting(trx)
    .then((sub_categories: ISubCategory[]) => {
      logger.debug(
        'successfully removed pos partner from sub categories',
        sub_categories
      );
      return sub_categories;
    })
    .catch((error: Error) => {
      logger.error('GOT ERROR WHILE REMOVING POS PARTNER FROM SUB CATEGORIES');
      throw error;
    });
}
export async function readPosSubCategoryByMainCategoryIdsForUpdate(
  trx: Knex.Transaction,
  main_category_ids: number[],
  pos_partner: string
): Promise<ISubCategory[]> {
  logger.debug(
    'reading sub category ids by main category ids',
    main_category_ids
  );
  try {
    const rows = await DB.write(subCatTable.TableName)
      .select('*')
      .where({pos_partner: pos_partner})
      .whereIn('main_category_id', main_category_ids)
      .forUpdate()
      .transacting(trx);
    logger.debug(
      'successfully fetched sub category by main category ids',
      rows
    );
    return rows;
  } catch (error) {
    logger.error(
      'GOT ERROR WHILE FETCHING SUB CATEGORY BY MAIN CATEGORY IDS',
      error
    );
    throw error;
  }
}

export function readMenuItemsFromSubCategories(
  sub_category_id: number,
  restaurant_id?: string
) {
  logger.debug('reading menu items from sub category id', {
    sub_category_id,
    restaurant_id,
  });
  const qry = DB.read
    .select([
      'mi.id',
      'mi.name',
      'mi.sub_category_id as sub_category_id',
      'mi.restaurant_id',
    ])
    .from('menu_item as mi')
    .join('sub_category as sc', 'mi.sub_category_id', 'sc.id')
    .where({['sc.is_deleted']: false})
    .where({['mi.is_deleted']: false})
    .where({['mi.sub_category_id']: sub_category_id});
  if (restaurant_id) qry.where({['mi.restaurant_id']: restaurant_id});
  return qry
    .then((menu_item: IMenuItem[]) => {
      logger.debug('successfully fetched menu item', menu_item);
      return menu_item;
    })
    .catch((error: Error) => {
      logger.error(
        'GOT ERROR WHILE FETCHING MENU ITEM BY MAIN CATEGORY IDS AND RESTAURANT IDS',
        error
      );
      throw error;
    });
}
