import variantGroupTable from './constants';
import {Knex} from 'knex';
import {DB} from '../../../../data/knex';
import {IVariant} from '../variant/models';
import logger from '../../../../utilities/logger/winston_logger';
import {PosPartner} from '../../enum';

export interface IVariantGroup {
  id?: number;
  menu_item_id?: number;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
  variants?: IVariant[];
  sequence?: number;
  pos_id?: string | null;
  pos_partner?: PosPartner | null;
}

export function bulkDeleteVariantGroup(
  trx: Knex.Transaction,
  ids: number[]
): Promise<IVariantGroup[]> {
  logger.debug('bulk delete variant group', ids);
  return DB.write(variantGroupTable.TableName)
    .update({is_deleted: true})
    .transacting(trx)
    .where({is_deleted: false})
    .whereIn('id', ids)
    .returning('*')
    .then((variant_groups: IVariantGroup[]) => {
      logger.debug('successfully deleted variant groups', variant_groups);
      return variant_groups;
    })
    .catch((error: Error) => {
      logger.error('ERROR DELETING VARIANT GROUPS BY VARIANT GROUP IDS', error);
      throw error;
    });
}
export function bulkUpdateVariantGroup(
  trx: Knex.Transaction,
  updateRows: IVariantGroup[]
): Promise<IVariantGroup[]> {
  logger.debug('bulk update variant group', updateRows);
  const subquery = `
  (select * from json_to_recordset(?)
  as x(
    id int,
    sequence int,
    name text)
  ) as data_table`;
  return DB.write
    .raw(
      `update ${variantGroupTable.TableName}
        set name = data_table.name,
        sequence = data_table.sequence
        from  ${subquery}
        where ${variantGroupTable.TableName}.id = data_table.id
        RETURNING *
        `,
      [JSON.stringify(updateRows)]
    )
    .transacting(trx)
    .then(variant_group => {
      logger.debug('successfully update variant group', variant_group);
      return variant_group.rows;
    })
    .catch((error: Error) => {
      logger.error('ERROR UPDATING VARIANT GROUP', error);
      throw error;
    });
}
export function bulkInsertVariantGroup(
  trx: Knex.Transaction,
  insertRows: IVariantGroup[]
): Promise<IVariantGroup[]> {
  logger.debug('bulk insert variant group', insertRows);
  return DB.write(variantGroupTable.TableName)
    .insert(insertRows)
    .returning('*')
    .transacting(trx)
    .then((variant_group: IVariantGroup[]) => {
      logger.debug('successfully insert variant group', variant_group);
      return variant_group;
    })
    .catch((error: Error) => {
      logger.error('ERROR INSERTING VARIANT GROUP', error);
      throw error;
    });
}
export function readVariantGroupByIds(Ids: number[]): Promise<IVariantGroup[]> {
  logger.debug('bulk reading variant group by menu item ids', Ids);
  return DB.read(variantGroupTable.TableName)
    .select(['id', 'menu_item_id', 'name', 'sequence'])
    .where({is_deleted: false})
    .whereIn(variantGroupTable.ColumnNames.id, Ids)
    .orderBy('sequence', 'asc')
    .then((rows: IVariantGroup[]) => {
      logger.debug('successfully fetched variant group', rows);
      return rows;
    })
    .catch((error: Error) => {
      logger.error('ERROR FETCHING VARIANT GROUP BY MENU ITEM IDS', error);
      throw error;
    });
}
export function readVariantGroupByMenuIds(
  Ids: (number | undefined)[]
): Promise<IVariantGroup[]> {
  logger.debug('bulk reading variant group by menu item ids', Ids);
  return DB.read(variantGroupTable.TableName)
    .select(['id', 'menu_item_id', 'name', 'sequence'])
    .where({is_deleted: false})
    .whereIn(variantGroupTable.ColumnNames.menu_item_id, Ids as number[])
    .orderBy('sequence', 'asc')
    .then((rows: IVariantGroup[]) => {
      logger.debug('successfully fetched variant group', rows);
      return rows;
    })
    .catch((error: Error) => {
      logger.error('ERROR FETCHING VARIANT GROUP BY MENU ITEM IDS', error);
      throw error;
    });
}

// export async function readVariantGroupsAssociatedWithPosForUpdate(
//   trx: Knex.Transaction,
//   pos_ids: string[],
//   menu_item_ids: number[]
// ): Promise<IVariantGroup[]> {
//   logger.debug('reading variant groups by pos ids and menu item ids', {
//     pos_ids,
//     menu_item_ids,
//   });
//   try {
//     const variant_groups = await DB.write(variantGroupTable.TableName)
//       .select('*')
//       .transacting(trx)
//       .forUpdate()
//       .where({is_deleted: false})
//       .whereIn('pos_id', pos_ids)
//       .whereIn('menu_item_id', menu_item_ids);
//     logger.debug('successfully fetched variant groups', variant_groups);
//     return variant_groups;
//   } catch (error) {
//     logger.error('GOT ERROR WHILE FETCHING VARIANT GROUPS BY POS IDS', error);
//     throw error;
//   }
// }

export async function readVariantGroupByMenuItemIdsForUpdate(
  trx: Knex.Transaction,
  menu_item_ids: number[]
): Promise<IVariantGroup[]> {
  logger.debug('bulk reading variant group by menu item ids', menu_item_ids);
  try {
    const variant_group_ids = await DB.write(variantGroupTable.TableName)
      .select('*')
      .where({is_deleted: false})
      .whereIn(variantGroupTable.ColumnNames.menu_item_id, menu_item_ids)
      .forUpdate()
      .transacting(trx);

    logger.debug('successfully fetched variant group', variant_group_ids);
    return variant_group_ids;
  } catch (error) {
    logger.error('ERROR FETCHING VARIANT GROUP BY MENU ITEM IDS', error);
    throw error;
  }
}

export async function bulkRemovePosDetailsFromVariantGroup(
  trx: Knex.Transaction,
  variant_groups_ids: number[]
): Promise<IVariantGroup[]> {
  logger.debug(
    'bulk removing pos partner from variant group',
    variant_groups_ids
  );
  return await DB.write(variantGroupTable.TableName)
    .update({pos_id: null, pos_partner: null})
    .returning('*')
    .whereIn(variantGroupTable.ColumnNames.id, variant_groups_ids)
    .transacting(trx)
    .then((variant_groups: IVariantGroup[]) => {
      logger.debug(
        'successfully removed pos partner from variant groups',
        variant_groups
      );
      return variant_groups;
    })
    .catch((error: Error) => {
      logger.error(
        'GOT ERROR WHILE REMOVING POS PARTNER FROM VARIANT GROUPS',
        error
      );
      throw error;
    });
}

export async function readPosVariantGroupByMenuItemIdsForUpdate(
  trx: Knex.Transaction,
  menu_item_ids: number[],
  pos_partner: string
): Promise<IVariantGroup[]> {
  logger.debug('bulk reading variant group by menu item ids', menu_item_ids);
  try {
    const variant_group_ids = await DB.write(variantGroupTable.TableName)
      .select('*')
      .where({pos_partner})
      .whereIn(variantGroupTable.ColumnNames.menu_item_id, menu_item_ids)
      .forUpdate()
      .transacting(trx);

    logger.debug('successfully fetched variant group', variant_group_ids);
    return variant_group_ids;
  } catch (error) {
    logger.error('ERROR FETCHING VARIANT GROUP BY MENU ITEM IDS', error);
    throw error;
  }
}
