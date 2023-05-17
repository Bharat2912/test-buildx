import {Knex} from 'knex';
import {DB} from '../../../../data/knex';
import logger from '../../../../utilities/logger/winston_logger';
import {IAddonGroup} from '../addon_group/models';
import itemAddonGroupTable from './constants';

export interface IItem_AddonGroup extends IAddonGroup {
  menu_item_id?: number;
  addon_group_id?: number;
  max_limit?: number;
  min_limit?: number;
  free_limit?: number;
  sequence?: number;
  created_at?: Date;
  updated_at?: Date;
}

export function bulkUpdateItemAddonGroup(
  trx: Knex.Transaction,
  updateRows: IItem_AddonGroup[]
): Promise<IItem_AddonGroup[]> {
  logger.debug('bulk udpateding item addon group', updateRows);
  const subquery = `
  (select * from json_to_recordset(?)
    as x(
      menu_item_id integer,
      addon_group_id integer,
      max_limit integer,
      min_limit integer,
      free_limit integer,
      sequence integer
    )
  ) as data_table`;
  return DB.write
    .raw(
      `update ${itemAddonGroupTable.TableName}
        set
          max_limit = data_table.max_limit,
          min_limit = data_table.min_limit,
          free_limit = data_table.free_limit,
          sequence = data_table.sequence
        from  ${subquery}
        where
          ${itemAddonGroupTable.TableName}.menu_item_id = data_table.menu_item_id and
          ${itemAddonGroupTable.TableName}.addon_group_id = data_table.addon_group_id
        `,
      [JSON.stringify(updateRows)]
    )
    .transacting(trx)
    .then((addon_group: IItem_AddonGroup[]) => {
      logger.debug('successfully updated item addon group', addon_group);
      return addon_group;
    })
    .catch((error: Error) => {
      logger.error('GOT ERROR WHILE UPDATING ITEM ADDON GROUP', error);
      throw error;
    });
}
export function bulkInsertItemAddonGroup(
  trx: Knex.Transaction,
  insertRows: IItem_AddonGroup[]
): Promise<IItem_AddonGroup[]> {
  logger.debug('bulk inserting item addon group', insertRows);
  return DB.write(itemAddonGroupTable.TableName)
    .insert(insertRows)
    .transacting(trx)
    .returning('*')
    .then((addon_group: IItem_AddonGroup[]) => {
      logger.debug('successfully inserted item addon group', addon_group);
      return addon_group;
    })
    .catch((error: Error) => {
      logger.error('GOT ERROR WHILE INSERTING ITEM ADDON GROUP', error);
      throw error;
    });
}
export function clearItemAddonGroup(
  trx: Knex.Transaction,
  menu_item_id: number
): Promise<IItem_AddonGroup[]> {
  logger.debug('deleting item addon group', menu_item_id);
  return DB.write(itemAddonGroupTable.TableName)
    .del()
    .where({menu_item_id: menu_item_id})
    .transacting(trx)
    .returning('*')
    .then((addon: IItem_AddonGroup[]) => {
      logger.debug('successfully deleted item addon group', addon);
      return addon;
    })
    .catch((error: Error) => {
      logger.error('GOT ERROR WHILE DELETING ITEM ADDON GROUP', error);
      throw error;
    });
}
export function readItemAddonGroupByItemIds(
  Ids: (number | undefined)[]
): Promise<IItem_AddonGroup[]> {
  logger.debug('reading item addon group by item ids', Ids);
  return DB.read(itemAddonGroupTable.TableName)
    .select('*')
    .whereIn(itemAddonGroupTable.ColumnNames.menu_item_id, Ids as number[])
    .then((rows: IItem_AddonGroup[]) => {
      logger.debug('successfully fetched item addon group', rows);
      return rows;
    })
    .catch((error: Error) => {
      logger.error('GOT ERROR WHILE READING ITEM ADDON GROUP', error);
      throw error;
    });
}

export async function clearItemAddonGroups(
  trx: Knex.Transaction,
  menu_item_id: number[]
): Promise<IItem_AddonGroup[]> {
  logger.debug('deleting item addon group by menu item ids', menu_item_id);
  try {
    const addon = await DB.write(itemAddonGroupTable.TableName)
      .del()
      .whereIn('menu_item_id', menu_item_id)
      .transacting(trx)
      .returning('*');
    logger.debug('successfully deleted item addon groups', addon);
    return addon;
  } catch (error) {
    logger.error('GOT ERROR WHILE DELETING ITEM ADDON GROUPS', error);
    throw error;
  }
}

export async function bulkHardDeleteItemAddonGroupByAddonGroupIds(
  trx: Knex.Transaction,
  addon_group_ids: number[]
): Promise<IItem_AddonGroup[]> {
  logger.debug('deleting item addon group by addon group ids', addon_group_ids);
  try {
    const addon = await DB.write(itemAddonGroupTable.TableName)
      .del()
      .whereIn('addon_group_id', addon_group_ids)
      .transacting(trx)
      .returning('*');
    logger.debug('successfully deleted item addon groups', addon);
    return addon;
  } catch (error) {
    logger.error('GOT ERROR WHILE DELETING ITEM ADDON GROUPS', error);
    throw error;
  }
}
