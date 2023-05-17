import Joi from 'joi';
import {Knex} from 'knex';
import {DB} from '../../../../data/knex';
import addonGroupTable from './constants';
import addonTable from '../addon/constants';
import logger from '../../../../utilities/logger/winston_logger';
import {IAddon} from '../addon/models';
import {common_name, joi_restaurant_id} from '../../../../utilities/joi_common';
import {PosPartner} from '../../enum';

export const verify_set_in_stock = Joi.object({
  in_stock: Joi.boolean().required(),
});

export interface IAddonGroup {
  id?: number;
  restaurant_id?: string;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
  addons?: IAddon[];
  pos_id?: string;
  pos_partner?: PosPartner;
}

export const verify_create_addon_group = Joi.object({
  name: common_name.required(),
  restaurant_id: joi_restaurant_id,
});

export const verify_update_addon_group = Joi.object({
  id: Joi.number().required(),
  name: common_name.required(),
});

export async function CheckDuplicateName(
  addon_group: IAddonGroup
): Promise<boolean> {
  const addon_groups = await getAddonGroupByName(
    addon_group.restaurant_id!,
    addon_group.name!
  );
  if (addon_groups && addon_groups.length) {
    if (addon_groups[0].id !== addon_group.id) {
      return true;
    }
  }
  return false;
}

export function getAddonGroupByName(
  restaurant_id: string,
  name: string
): Promise<IAddonGroup[]> {
  logger.debug('getting addon group by name', {restaurant_id, name});
  return DB.read(addonGroupTable.TableName)
    .where({is_deleted: false, restaurant_id, name})
    .select([
      addonGroupTable.ColumnNames.id,
      addonGroupTable.ColumnNames.restaurant_id,
      addonGroupTable.ColumnNames.name,
    ])
    .then((addon_group: IAddonGroup[]) => {
      logger.debug('successfully fetched addon group by name', addon_group);
      return addon_group;
    })
    .catch((error: Error) => {
      logger.error('GOT ERROR WHILE FETCHING ADDON GROUP BY NAME', error);
      throw error;
    });
}

export async function createAddonGroup(
  addon_group: IAddonGroup,
  trx?: Knex.Transaction
): Promise<IAddonGroup> {
  logger.debug('creating addon group', addon_group);
  const query = DB.write(addonGroupTable.TableName)
    .insert(addon_group)
    .returning('*');
  if (trx) {
    query.transacting(trx);
  }
  return await query
    .then((addon_group: IAddonGroup[]) => {
      logger.debug('successfully created addon group', addon_group[0]);
      return addon_group[0];
    })
    .catch((error: Error) => {
      logger.error('GOT ERROR WHILE CREATING ADDON GROUP', error);
      throw error;
    });
}

export function readAddonGroupsByRestaurantId(
  restaurant_id: string
): Promise<IAddonGroup[]> {
  logger.debug('reading addon group by restaurant id', restaurant_id);
  return DB.read(addonGroupTable.TableName)
    .where({is_deleted: false, restaurant_id: restaurant_id})
    .select([
      addonGroupTable.ColumnNames.id,
      addonGroupTable.ColumnNames.restaurant_id,
      addonGroupTable.ColumnNames.name,
      DB.read.raw(
        `(
          select
              count(*) > 0
          from
            addon
          where
            addon_group.id = addon.addon_group_id
            and addon.is_deleted=false
            and addon.in_stock=true
          ) as in_stock`
      ),
    ])
    .then((addon_group: IAddonGroup[]) => {
      logger.debug(
        'successfully fetched addon group by restaurant id',
        addon_group
      );
      return addon_group;
    })
    .catch((error: Error) => {
      logger.error(
        'GOT ERROR WHILE FETCHING ADDON GROUP BY RESTAURANT ID',
        error
      );
      throw error;
    });
}

export function readAddonGroups(
  ids: number[],
  restaurant_id?: string
): Promise<IAddonGroup[]> {
  logger.debug('reading addon groups', {ids, restaurant_id});
  const qry = DB.read(addonGroupTable.TableName)
    .where({is_deleted: false})
    .whereIn('id', ids)
    .select([
      addonGroupTable.ColumnNames.id,
      addonGroupTable.ColumnNames.restaurant_id,
      addonGroupTable.ColumnNames.name,
    ]);
  if (restaurant_id) qry.where({restaurant_id: restaurant_id});
  return qry
    .then((addon_group: IAddonGroup[]) => {
      logger.debug('successfully fetched addon groups', addon_group);
      return addon_group;
    })
    .catch((error: Error) => {
      logger.error(
        'ERROR GOT WHILE FETCHING ADDON GROUPS BY RESTAURANT ID',
        error
      );
      throw error;
    });
}

export function readAddonGroup(id: number): Promise<IAddonGroup> {
  logger.debug('reading addon group by id', id);
  return DB.read(addonGroupTable.TableName)
    .where({is_deleted: false, id: id})
    .select([
      addonGroupTable.ColumnNames.id,
      addonGroupTable.ColumnNames.restaurant_id,
      addonGroupTable.ColumnNames.name,
      addonGroupTable.ColumnNames.pos_partner,
    ])
    .then((addon_group: IAddonGroup[]) => {
      logger.debug('successfully fetched addon group', addon_group[0]);
      return addon_group[0];
    })
    .catch((error: Error) => {
      logger.error(
        `ERROR GENRATED WHILE READING ADDON GROUP BY ID ${id}`,
        error
      );
      throw error;
    });
}

export function readAddonGroupForUpdate(
  trx: Knex.Transaction,
  id: number
): Promise<IAddonGroup> {
  logger.debug('reading addon group for update', id);
  return DB.write(addonGroupTable.TableName)
    .where({is_deleted: false, id: id})
    .select('*')
    .forUpdate()
    .transacting(trx)
    .then((addon_group: IAddonGroup[]) => {
      logger.debug(
        'successfully fetched addon group for update',
        addon_group[0]
      );
      return addon_group[0];
    })
    .catch((error: Error) => {
      logger.error('GOT ERROR WHILE UPDATING ADDON GROUP', error);
      throw error;
    });
}

export async function updateAddonGroup(
  addon_group: IAddonGroup,
  trx?: Knex.Transaction
): Promise<IAddonGroup> {
  logger.debug('updating addon group', addon_group);
  addon_group.updated_at = new Date();
  const query = DB.write(addonGroupTable.TableName)
    .update(addon_group)
    .returning('*')
    .where({id: addon_group.id});
  if (trx) {
    query.transacting(trx);
  }
  return await query
    .then((addon_group: IAddonGroup[]) => {
      logger.debug('successfully updated addon group', addon_group[0]);
      return addon_group[0];
    })
    .catch((error: Error) => {
      logger.error('GOT ERROR WHILE UPDATING ADDON GROUP', error);
      throw error;
    });
}

export function inStockAddonByAddonGroupId(
  addon_group_id: number,
  in_stock: boolean
): Promise<IAddon> {
  logger.debug('updating in stock addon group', {addon_group_id, in_stock});
  return DB.write(addonTable.TableName)
    .update({
      in_stock,
    })
    .where({addon_group_id: addon_group_id, is_deleted: false})
    .returning('*')
    .then((addon: IAddon[]) => {
      logger.debug('successfully updated in stock addon group', addon[0]);
      return addon[0];
    })
    .catch((error: Error) => {
      logger.error(
        'GOT ERROR WHILE UPDATING IN STOCK ADDON GROUP BY ID',
        error
      );
      throw error;
    });
}

export function deleteAddonGroup(id: number): Promise<IAddonGroup> {
  const addon_group = <IAddonGroup>{
    id: id,
    is_deleted: true,
  };
  logger.debug('deleting addon group by id', id);
  return DB.write(addonGroupTable.TableName)
    .update(addon_group)
    .where({is_deleted: false, id: id})
    .returning('*')
    .then((addon_group: IAddonGroup[]) => {
      logger.debug('successfully deleted addon group', addon_group[0]);
      return addon_group[0];
    })
    .catch((error: Error) => {
      logger.error('GOT ERROR WHILE DELETING ADDON GROUP', error);
      throw error;
    });
}

export function bulkUpdateAddonGroup(
  trx: Knex.Transaction,
  updateRows: IAddonGroup[]
): Promise<IAddonGroup[]> {
  logger.debug('bulk updating addon group', updateRows);
  const subquery = `
  (select * from json_to_recordset(?)
  as x(
    id int,
    name text)
  ) as data_table`;
  return DB.write
    .raw(
      `update ${addonGroupTable.TableName}
        set name = data_table.name
        from  ${subquery}
        where ${addonGroupTable.TableName}.id = data_table.id
        RETURNING *
        `,
      [JSON.stringify(updateRows)]
    )
    .transacting(trx)
    .then(addon_group => {
      logger.debug('successfully updated addon group', addon_group);
      return addon_group.rows;
    })
    .catch((error: Error) => {
      logger.error('GOT ERROR WHILE UPDATING ADDON GROUP', error);
      throw error;
    });
}

export function bulkInsertAddonGroup(
  trx: Knex.Transaction,
  insertRows: IAddonGroup[]
): Promise<IAddonGroup[]> {
  logger.debug('bulk inserting addon group', insertRows);
  return DB.write(addonGroupTable.TableName)
    .insert(insertRows)
    .returning('*')
    .transacting(trx)
    .then((addon_group: IAddonGroup[]) => {
      logger.debug('successfully inserted addon group', addon_group);
      return addon_group;
    })
    .catch((error: Error) => {
      logger.error('GOT ERROR WHILE INSERTING ADDON GROUP', error);
      throw error;
    });
}

export function readAddonGroupByRestaurantIds(
  Ids: (string | undefined)[]
): Promise<IAddonGroup[]> {
  logger.debug('reading addon group by restaurant id', Ids);
  return DB.read(addonGroupTable.TableName)
    .select(['id', 'restaurant_id', 'name'])
    .where({is_deleted: false})
    .whereIn(addonGroupTable.ColumnNames.restaurant_id, Ids as string[])
    .then((rows: IAddonGroup[]) => {
      logger.debug('successfully fetched addon group by restaurant id', rows);
      return rows;
    })
    .catch((error: Error) => {
      logger.error(
        'GOT ERROR WHILE FETCHING ADDON GROUP BY RESTAURANT ID',
        error
      );
      throw error;
    });
}

// export async function readAddonGroupsAssociatedWithPosForUpdate(
//   trx: Knex.Transaction,
//   pos_ids: string[],
//   restaurant_id: string
// ): Promise<IAddon[]> {
//   logger.debug('reading addon groups by pos ids and restaurant id', {
//     pos_ids,
//     restaurant_id,
//   });
//   try {
//     const addon_groups = await DB.write(addonGroupTable.TableName)
//       .select('*')
//       .transacting(trx)
//       .forUpdate()
//       .where({is_deleted: false, restaurant_id: restaurant_id})
//       .whereIn('pos_id', pos_ids);
//     logger.debug('successfully fetched addon groups', addon_groups);
//     return addon_groups;
//   } catch (error) {
//     logger.error('GOT ERROR WHILE FETCHING ADDON GROUPS BY POS IDS', error);
//     throw error;
//   }
// }

export async function bulkSoftDeleteAddonGroups(
  trx: Knex.Transaction,
  ids: number[]
): Promise<IAddonGroup[]> {
  logger.debug('deleting addon groups by addon group ids', ids);
  try {
    const addon_groups = await DB.write(addonGroupTable.TableName)
      .update({
        is_deleted: true,
      })
      .where({is_deleted: false})
      .whereIn('id', ids)
      .transacting(trx)
      .returning('*');
    logger.debug('successfully deleted addon groups', addon_groups);
    return addon_groups;
  } catch (error) {
    logger.error(
      'GOT ERROR WHILE BULK DELETING ADDON GROUPS BY ADDON GROUP IDS',
      error
    );
    throw error;
  }
}

export async function readAddonGroupByRestaurantIdForUpdate(
  trx: Knex.Transaction,
  restaurant_id: string
): Promise<IAddonGroup[]> {
  logger.debug('reading addon groups by restaurant id', restaurant_id);
  try {
    const addon_groups = await DB.write(addonGroupTable.TableName)
      .select('*')
      .where({is_deleted: false, restaurant_id})
      .forUpdate()
      .transacting(trx);
    logger.debug(
      'successfully fetched addon groups by restaurant id',
      addon_groups
    );
    return addon_groups;
  } catch (error) {
    logger.error(
      'GOT ERROR WHILE FETCHING ADDON GROUPS BY RESTAURANT ID',
      error
    );
    throw error;
  }
}

export async function bulkRemovePosDetailsFromAddonGroup(
  trx: Knex.Transaction,
  addon_group_ids: number[]
): Promise<IAddonGroup[]> {
  logger.debug('bulk removing pos partner from addon group', addon_group_ids);
  return await DB.write(addonGroupTable.TableName)
    .update({pos_id: null, pos_partner: null})
    .returning('*')
    .whereIn(addonGroupTable.ColumnNames.id, addon_group_ids)
    .transacting(trx)
    .then((addon_groups: IAddonGroup[]) => {
      logger.debug(
        'successfully removed pos partner from addon groups',
        addon_groups
      );
      return addon_groups;
    })
    .catch((error: Error) => {
      logger.error(
        'GOT ERROR WHILE REMOVING POS PARTNER FROM ADDON GROUPS',
        error
      );
      throw error;
    });
}

export async function readPosAddonGroupByRestaurantIdForUpdate(
  trx: Knex.Transaction,
  restaurant_id: string,
  pos_partner: string
): Promise<IAddonGroup[]> {
  logger.debug('reading addon groups by restaurant id', restaurant_id);
  try {
    const addon_groups = await DB.write(addonGroupTable.TableName)
      .select('*')
      .where({pos_partner, restaurant_id})
      .forUpdate()
      .transacting(trx);
    logger.debug(
      'successfully fetched addon groups by restaurant id',
      addon_groups
    );
    return addon_groups;
  } catch (error) {
    logger.error(
      'GOT ERROR WHILE FETCHING ADDON GROUPS BY RESTAURANT ID',
      error
    );
    throw error;
  }
}
