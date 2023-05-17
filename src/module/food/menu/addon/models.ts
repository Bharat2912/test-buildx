import {Knex} from 'knex';
import {DB} from '../../../../data/knex';
import addonTable from './constants';
import logger from '../../../../utilities/logger/winston_logger';
import Joi from 'joi';
import {common_name} from '../../../../utilities/joi_common';
import {IAddonAndAddonGroup} from './types';
import {PosPartner} from '../../enum';
import {readMenuItems} from '../models';

export interface IAddon {
  id?: number;
  addon_group_id?: number;
  menu_item_ids?: number[];
  name?: string;
  sequence?: number;
  price?: number;
  display_price?: number;
  veg_egg_non?: 'veg' | 'egg' | 'non-veg';
  in_stock?: boolean;
  next_available_at?: Date;
  next_available_after?: Date | null;
  sgst_rate?: number;
  cgst_rate?: number;
  igst_rate?: number;
  gst_inclusive?: boolean;
  external_id?: string;

  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;

  restaurant_id?: string;

  pos_id?: string;
  pos_partner?: PosPartner;
}

export const verify_set_in_stock = Joi.object({
  id: Joi.number().required(),
  in_stock: Joi.boolean().required(),
});

export const verify_create_addon = Joi.object({
  addon_group_id: Joi.number().required(),
  name: common_name.required(),
  sequence: Joi.number().required(),
  price: Joi.number().required(),
  veg_egg_non: Joi.valid('veg', 'egg', 'non-veg').required(),
  sgst_rate: Joi.number().required(),
  cgst_rate: Joi.number().required(),
  igst_rate: Joi.number().required(),
  gst_inclusive: Joi.boolean().required(),
  external_id: Joi.string().required(),
  in_stock: Joi.boolean(),
});

export const verify_update_addon = Joi.object({
  id: Joi.number().required(),
  addon_group_id: Joi.number().required(),
  name: common_name,
  sequence: Joi.number(),
  price: Joi.number(),
  veg_egg_non: Joi.valid('veg', 'egg', 'non-veg'),
  sgst_rate: Joi.number(),
  cgst_rate: Joi.number(),
  igst_rate: Joi.number(),
  gst_inclusive: Joi.boolean(),
  external_id: Joi.string(),
  in_stock: Joi.boolean(),
});

export async function CheckDuplicateName(addon: IAddon): Promise<boolean> {
  const addons = await getAddonByName(addon.addon_group_id!, addon.name!);
  if (addons && addons.length) {
    if (addons[0].id !== addon.id) {
      return true;
    }
  }
  return false;
}

export function getAddonByName(addon_group_id: number, name: string) {
  logger.debug('getting addon by name', addon_group_id);
  return DB.read(addonTable.TableName)
    .where({is_deleted: false, addon_group_id, name})
    .select([
      addonTable.ColumnNames.id,
      addonTable.ColumnNames.addon_group_id,
      addonTable.ColumnNames.name,
    ])
    .then((addon_group: IAddon[]) => {
      logger.debug('successfully fetched addon by name', addon_group);
      return addon_group;
    })
    .catch((error: Error) => {
      logger.error('ERROR GENRATED WHILE FETCHING ADDON BY NAME', error);
      throw error;
    });
}

export async function createAddon(
  addon: IAddon,
  trx?: Knex.Transaction
): Promise<IAddon> {
  logger.debug('creating addon', addon);
  const query = DB.write(addonTable.TableName).insert(addon).returning('*');
  if (trx) {
    query.transacting(trx);
  }
  return await query
    .then((addon: IAddon[]) => {
      logger.debug('successfully created addon', addon);
      return addon[0];
    })
    .catch((error: Error) => {
      logger.error('ERROR GENRATED WHILE CREATING ADDON', error);
      throw error;
    });
}

export function readAddonByIds(ids: number[], restaurant_id: string) {
  logger.debug('reading addon by ids', ids);
  return DB.read
    .select(['ad.id', 'ad.name', 'ag.id as addon_group_id', 'ag.restaurant_id'])
    .from('addon as ad')
    .join('addon_group as ag', 'ad.addon_group_id', 'ag.id')
    .where({['ag.restaurant_id']: restaurant_id})
    .where({['ag.is_deleted']: false})
    .where({['ad.is_deleted']: false})
    .whereIn('ad.id', ids)
    .then((addon: IAddon[]) => {
      logger.debug('successfully fetched addon by ids', addon);
      return addon;
    })
    .catch((error: Error) => {
      logger.error('ERROR GENRATED WHILE FETCHING ADDON BY IDS', error);
      throw error;
    });
}
export function readAddons(addon_group_id: number, restaurant_id?: string) {
  logger.debug('reading addon of restaurant', {addon_group_id, restaurant_id});
  const qry = DB.read
    .select([
      'ag.restaurant_id',
      'ad.' + addonTable.ColumnNames.id,
      'ad.' + addonTable.ColumnNames.addon_group_id,
      'ad.' + addonTable.ColumnNames.name,
      'ad.' + addonTable.ColumnNames.sequence,
      'ad.' + addonTable.ColumnNames.price,
      'ad.' + addonTable.ColumnNames.veg_egg_non,
      'ad.' + addonTable.ColumnNames.in_stock,
      'ad.' + addonTable.ColumnNames.sgst_rate,
      'ad.' + addonTable.ColumnNames.cgst_rate,
      'ad.' + addonTable.ColumnNames.igst_rate,
      'ad.' + addonTable.ColumnNames.gst_inclusive,
      'ad.' + addonTable.ColumnNames.external_id,
      'ad.' + addonTable.ColumnNames.next_available_after,
    ])
    .from('addon as ad')
    .join('addon_group as ag', 'ad.addon_group_id', 'ag.id')
    .where({['ag.is_deleted']: false})
    .where({['ad.is_deleted']: false})
    .where({['ad.addon_group_id']: addon_group_id});

  if (restaurant_id) qry.where({['ag.restaurant_id']: restaurant_id});
  return qry
    .then((addon: IAddon[]) => {
      logger.debug('successfully fetched addons', addon);
      return addon;
    })
    .catch((error: Error) => {
      logger.error('ERROR GENRATED WHILE FETCHING ADDONS', error);
      throw error;
    });
}

export function readAddon(id: number) {
  logger.debug('reading addon by id', id);
  return (
    DB.read
      // .transacting(trx)
      .select([
        'ad.id',
        'ad.name',
        'ad.pos_partner',
        'ag.id as addon_group_id',
        'ag.restaurant_id',
      ])
      .from('addon as ad')
      .join('addon_group as ag', 'ad.addon_group_id', 'ag.id')
      .where({['ag.is_deleted']: false})
      .where({['ad.is_deleted']: false})
      .where({['ad.id']: id})
      .then((addon: IAddon[]) => {
        logger.debug('successfully reading addon', addon[0]);
        return addon[0];
      })
      .catch((error: Error) => {
        logger.error(`ERROR WHILE READING ADDON BY ID ${id}`, error);
        throw error;
      })
  );
}

export async function readAddonForUpdate(
  trx: Knex.Transaction,
  id: number
): Promise<IAddonAndAddonGroup> {
  logger.debug('reading addon for update', id);
  return await DB.write
    .select([
      'ad.id',
      'ad.name',
      'ad.sequence',
      'ad.price',
      'ad.status',
      'ad.veg_egg_non',
      'ad.in_stock',
      'ad.sgst_rate',
      'ad.cgst_rate',
      'ad.igst_rate',
      'ad.gst_inclusive',
      'ad.external_id',
      'ad.created_at',
      'ad.updated_at',
      'ad.is_deleted',
      'ad.pos_partner',
      'ag.id as addon_group_id',
      'ag.name as addon_group_name',
      'ag.restaurant_id',
    ])
    .from('addon as ad')
    .join('addon_group as ag', 'ad.addon_group_id', 'ag.id')
    .where({['ag.is_deleted']: false})
    .where({['ad.is_deleted']: false})
    .where({['ad.id']: id})
    .forUpdate()
    .transacting(trx)
    .then((addon: IAddonAndAddonGroup[]) => {
      logger.debug('successfully updated addon', addon[0]);
      return addon[0];
    })
    .catch((error: Error) => {
      logger.error('ERROR GENRATED WHILE FETCHING ADDON FOR UPDATE', error);
      throw error;
    });
}

export async function updateAddon(
  addon: IAddon,
  trx?: Knex.Transaction
): Promise<IAddon> {
  addon.updated_at = new Date();
  logger.debug('updating addon', addon);
  const query = DB.write(addonTable.TableName)
    .update(addon)
    .returning('*')
    .where({id: addon.id});
  if (trx) {
    query.transacting(trx);
  }
  return await query
    .then((addon: IAddon[]) => {
      logger.debug('successfully updated addon', addon[0]);
      return addon[0];
    })
    .catch((error: Error) => {
      logger.error('ERROR GENRATED WHILE UPDATING ADDON BY NAME', error);
      throw error;
    });
}

export async function updateStockAddonByPosId(
  trx: Knex.Transaction,
  pos_ids: string[],
  in_stock: boolean
) {
  return await DB.write(addonTable.TableName)
    .update({in_stock, updated_at: new Date()})
    .returning('*')
    .transacting(trx)
    .whereIn('pos_id', pos_ids);
}

export function deleteAddon(id: number) {
  const addon = <IAddon>{
    id: id,
    is_deleted: true,
  };
  logger.debug('deleting addon', addon);
  return DB.write(addonTable.TableName)
    .update(addon)
    .where({is_deleted: false, id: id})
    .returning('*')
    .then((addon: IAddon[]) => {
      logger.debug('successfully deleted addon', addon[0]);
      return addon[0];
    })
    .catch((error: Error) => {
      logger.error('ERROR GENRATED WHILE DELETING ADDON', error);
      throw error;
    });
}

export async function bulkUpdateAddon(
  trx: Knex.Transaction,
  updateRows: IAddon[]
): Promise<IAddon[]> {
  logger.debug('bulk updating addon', updateRows);
  const subquery = `
  (select * from json_to_recordset(?)
    as x(
      id int,
      name text,
      addon_group_id int,
      sequence int,
      price float,
      veg_egg_non text,
      in_stock boolean,
      sgst_rate float,
      cgst_rate float,
      igst_rate float,
      gst_inclusive boolean,
      external_id text
      )) as data_table`;
  return DB.write
    .raw(
      `update ${addonTable.TableName}
        set
          name = data_table.name,
          addon_group_id = data_table.addon_group_id,
          sequence = data_table.sequence,
          price = data_table.price,
          veg_egg_non = data_table.veg_egg_non,
          in_stock = data_table.in_stock,
          sgst_rate = data_table.sgst_rate,
          cgst_rate = data_table.cgst_rate,
          igst_rate = data_table.igst_rate,
          gst_inclusive = data_table.gst_inclusive,
          external_id = data_table.external_id
        from  ${subquery}
        where ${addonTable.TableName}.id = data_table.id
        RETURNING *
        `,
      [JSON.stringify(updateRows)]
    )
    .transacting(trx)
    .then(addon => {
      logger.debug('successfully updated addon', addon);
      return addon.rows;
    })
    .catch((error: Error) => {
      logger.error('ERROR GENRATED WHILE BULK UPDATE ADDON', error);
      throw error;
    });
}

export function bulkInsertAddon(
  trx: Knex.Transaction,
  insertRows: IAddon[]
): Promise<IAddon[]> {
  logger.debug('bulk insert addon', insertRows);
  return DB.write(addonTable.TableName)
    .insert(insertRows)
    .returning('*')
    .transacting(trx)
    .then((addon: IAddon[]) => {
      logger.debug('successfully inserted addons', addon);
      return addon;
    })
    .catch((error: Error) => {
      logger.error('ERROR GENRATED WHILE BULK INSERT ADDON', error);
      throw error;
    });
}

export function readAddonByAddonGroupIds(Ids: (number | undefined)[]) {
  logger.debug('reading addon by addon group ids', Ids);
  return DB.read(addonTable.TableName)
    .select([
      'id',
      'addon_group_id',
      'name',
      DB.read.raw(
        '(select to_json(array_agg(menu_item_id)) from item_addon where addon_id = addon.id) as menu_item_ids'
      ),
      'sequence',
      'price',
      'veg_egg_non',
      'in_stock',
      'sgst_rate',
      'cgst_rate',
      'igst_rate',
      'gst_inclusive',
      'external_id',
    ])
    .where({is_deleted: false})
    .whereIn(addonTable.ColumnNames.addon_group_id, Ids as number[])
    .then((rows: IAddon[]) => {
      logger.debug('successfully fecthed addon by addon group id', rows);
      return rows;
    })
    .catch((error: Error) => {
      logger.error(
        'ERROR GENRATED WHILE FETCHING ADDON BY ADDON GROUP IDS',
        error
      );
      throw error;
    });
}

// export async function readAddonsAssociatedWithPosForUpdate(
//   trx: Knex.Transaction,
//   pos_ids: string[],
//   addon_group_ids: number[]
// ): Promise<IAddon[]> {
//   logger.debug('reading addons by pos ids and addon group ids', {
//     pos_ids,
//     addon_group_ids,
//   });
//   try {
//     const addons = await DB.write(addonTable.TableName)
//       .select('*')
//       .transacting(trx)
//       .forUpdate()
//       .where({is_deleted: false})
//       .whereIn('pos_id', pos_ids)
//       .whereIn('addon_group_id', addon_group_ids);
//     logger.debug('successfully fetched addons', addons);
//     return addons;
//   } catch (error) {
//     logger.error('GOT ERROR WHILE FETCHING ADDONS BY POS IDS', error);
//     throw error;
//   }
// }

export async function readAddonByAddonGroupIdsForUpdate(
  trx: Knex.Transaction,
  addon_group_ids: number[]
): Promise<IAddon[]> {
  logger.debug('reading addons by addon group ids', {
    addon_group_ids,
  });
  try {
    const addons = await DB.write(addonTable.TableName)
      .select('*')
      .forUpdate()
      .transacting(trx)
      .where({is_deleted: false})
      .whereIn('addon_group_id', addon_group_ids);
    logger.debug('successfully fetched addons', addons);
    return addons;
  } catch (error) {
    logger.error('GOT ERROR WHILE FETCHING ADDONS BY POS IDS', error);
    throw error;
  }
}

export async function bulkSoftDeleteAddons(
  trx: Knex.Transaction,
  ids: number[]
) {
  logger.debug('deleting addons by addon ids', ids);
  try {
    const addon = await DB.write(addonTable.TableName)
      .update({
        is_deleted: true,
      })
      .where({is_deleted: false})
      .whereIn('id', ids)
      .returning('*')
      .transacting(trx);
    logger.debug('successfully deleted addons', addon);
    return addon;
  } catch (error) {
    logger.error('ERROR GENRATED WHILE DELETING ADDONS BY ADDON IDS', error);
    throw error;
  }
}

export async function bulkRemovePosDetailsFromAddon(
  trx: Knex.Transaction,
  addon_ids: number[]
): Promise<IAddon[]> {
  logger.debug('bulk removing pos partner from addon', addon_ids);
  return await DB.write(addonTable.TableName)
    .update({pos_id: null, pos_partner: null})
    .returning('*')
    .whereIn(addonTable.ColumnNames.id, addon_ids)
    .transacting(trx)
    .then((addon: IAddon[]) => {
      logger.debug('successfully removed pos partner from addon', addon);
      return addon;
    })
    .catch((error: Error) => {
      logger.error('GOT ERROR WHILE REMOVING POS PARTNER FROM ADDON', error);
      throw error;
    });
}

export async function readPosAddonByAddonGroupIdsForUpdate(
  trx: Knex.Transaction,
  addon_group_ids: number[],
  pos_partner: string
): Promise<IAddon[]> {
  logger.debug('reading addons by addon group ids', {
    addon_group_ids,
  });
  try {
    const addons = await DB.write(addonTable.TableName)
      .select('*')
      .forUpdate()
      .transacting(trx)
      .where({pos_partner})
      .whereIn('addon_group_id', addon_group_ids);
    logger.debug('successfully fetched addons', addons);
    return addons;
  } catch (error) {
    logger.error('GOT ERROR WHILE FETCHING ADDONS BY POS IDS', error);
    throw error;
  }
}

export function readAddonsItemMapping(addon_ids: number[]) {
  logger.debug('reading addon by ids', addon_ids);
  return DB.read
    .select('*')
    .from('item_addon as ia')
    .join('menu_item as mi', 'ia.menu_item_id', 'mi.id')
    .where({['mi.is_deleted']: false})
    .whereIn('ia.addon_id', addon_ids)
    .then((addon_mapping: {menu_item_id: number; addon_id: number}[]) => {
      logger.debug('successfully fetched addon_mapping', addon_mapping);
      return addon_mapping;
    })
    .catch((error: Error) => {
      logger.error('ERROR GENRATED WHILE FETCHING ADDON BY IDS', error);
      throw error;
    });
}

export async function validateAddonDelete(
  addon_ids: number[]
): Promise<{error: false} | {error: true; error_menu_items: unknown[]}> {
  const item_addon_mapping = await readAddonsItemMapping(addon_ids);
  const item_ids = item_addon_mapping.map(item => item.menu_item_id);
  const menu_items = await readMenuItems(item_ids);
  const error_menu_items: unknown[] = [];
  menu_items.map(menu_item => {
    if (menu_item.addon_groups) {
      const error_addon_groups: unknown[] = [];
      menu_item.addon_groups.map(a_group => {
        if (a_group.addons) {
          a_group.addons = a_group.addons.map(addon => {
            return {
              addon_id: addon.addon_id,
              addon_name: addon.addon_name,
            };
          });
          const x_addons = a_group.addons.filter(addon =>
            addon_ids.includes(addon.addon_id!)
          );
          if (x_addons.length) {
            const addon_count = a_group.addons.length;
            const min_limit = a_group.min_limit || 0;
            const delete_count = x_addons.length;
            if (addon_count - delete_count < min_limit) {
              error_addon_groups.push({
                addon_group_id: a_group.addon_group_id,
                addon_group_name: a_group.addon_group_name,
                addon_count,
                min_limit,
                delete_count,
                existing_addons: a_group.addons,
                deleting_addons: x_addons,
              });
            }
          }
        }
      });
      if (error_addon_groups.length) {
        error_menu_items.push({
          menu_item_id: menu_item.menu_item_id,
          menu_item_name: menu_item.menu_item_name,
          error_addon_groups: error_addon_groups,
        });
      }
    }
  });
  if (error_menu_items.length) {
    return {
      error: true,
      error_menu_items,
    };
  }
  return {
    error: false,
  };
}
