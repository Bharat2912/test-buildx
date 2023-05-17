import variantTable from './constants';
import {Knex} from 'knex';
import {DB} from '../../../../data/knex';
import logger from '../../../../utilities/logger/winston_logger';
import {PosPartner} from '../../enum';

export interface IVariant {
  id?: number;
  variant_group_id?: number;
  name?: string;
  is_default?: boolean;
  in_stock?: boolean;
  next_available_at?: Date;
  next_available_after?: Date | null;
  price?: number;
  display_price?: number;
  veg_egg_non?: string;
  serves_how_many?: number;
  created_at?: Date;
  updated_at?: Date;
  sequence?: number;
  is_deleted?: boolean;
  pos_id?: string | null;
  pos_variant_item_id?: string | null;
  pos_partner?: PosPartner | null;
}

export function bulkDeleteVariant(
  trx: Knex.Transaction,
  ids: number[]
): Promise<IVariant[]> {
  logger.debug('bulk deleting variant by variant ids', ids);
  return DB.write(variantTable.TableName)
    .update({is_deleted: true})
    .where({is_deleted: false})
    .whereIn('id', ids)
    .returning('*')
    .transacting(trx)
    .then((variants: IVariant[]) => {
      logger.debug('successfully bulk deleted variants', variants);
      return variants;
    })
    .catch((error: Error) => {
      logger.error('GOT ERROR BULK DELETING VARIANTS BY VARIANT IDS', error);
      throw error;
    });
}

export function bulkUpdateVariant(
  trx: Knex.Transaction,
  updateRows: IVariant[]
): Promise<IVariant[]> {
  logger.debug('bulk updating variant', updateRows);
  const subquery = `
  (select * from json_to_recordset(?)
      as x(
        id int,
        name text,
        price float,
        serves_how_many int,
        sequence int,
        is_default boolean,
        is_deleted boolean
      )
    ) as data_table`;
  return DB.write
    .raw(
      `update ${variantTable.TableName}
          set
            name = data_table.name,
            price = data_table.price,
            sequence = data_table.sequence,
            serves_how_many = data_table.serves_how_many,
            is_default = data_table.is_default,
            is_deleted = data_table.is_deleted
          from  ${subquery}
          where ${variantTable.TableName}.id = data_table.id
          RETURNING *
          `,
      [JSON.stringify(updateRows)]
    )
    .transacting(trx)
    .then(variant => {
      logger.debug('successfully bulk updated variant', variant);
      return variant.rows;
    })
    .catch((error: Error) => {
      logger.error('GOT ERROR UPDATING VARIANT', error);
      throw error;
    });
}

export async function bulkUpdateVariantAllFields(
  trx: Knex.Transaction,
  updateRows: IVariant[]
): Promise<IVariant[]> {
  logger.debug('bulk updating variant', updateRows);
  const subquery = `
  (select * from json_to_recordset(?)
      as x(
        id int,
        variant_group_id int,
        name text,
        price float,
        sequence int,
        serves_how_many int,
        veg_egg_non text,
        is_default boolean,
        is_deleted boolean
      )
    ) as data_table`;
  try {
    const variant = await DB.write
      .raw(
        `update ${variantTable.TableName}
          set
            variant_group_id = data_table.variant_group_id,
            name = data_table.name,
            price = data_table.price,
            sequence = data_table.sequence,
            serves_how_many = data_table.serves_how_many,
            veg_egg_non = data_table.veg_egg_non,
            is_default = data_table.is_default,
            is_deleted = data_table.is_deleted
          from  ${subquery}
          where ${variantTable.TableName}.id = data_table.id
          RETURNING *
          `,
        [JSON.stringify(updateRows)]
      )
      .transacting(trx);
    logger.debug('successfully bulk updated variant', variant);
    return variant.rows;
  } catch (error) {
    logger.error('GOT ERROR UPDATING VARIANT', error);
    throw error;
  }
}

export function bulkInsertVariant(
  trx: Knex.Transaction,
  insertRows: IVariant[]
): Promise<IVariant[]> {
  logger.debug('bulk inserting variant', insertRows);
  return DB.write(variantTable.TableName)
    .insert(insertRows)
    .returning('*')
    .transacting(trx)
    .then((variant: IVariant[]) => {
      logger.debug('successfully bulk insert variant', variant);
      return variant;
    })
    .catch((error: Error) => {
      logger.error('GOT ERROR INSERTING VARIANT', error);
      throw error;
    });
}
export function readVariantByVariantGroupIds(
  Ids: (number | undefined)[]
): Promise<IVariant[]> {
  logger.debug('reading variant by group ids', Ids);
  return DB.read(variantTable.TableName)
    .select([
      'id',
      'variant_group_id',
      'name',
      'is_default',
      'price',
      'serves_how_many',
      'veg_egg_non',
      'sequence',
      'in_stock',
    ])
    .where({is_deleted: false})
    .whereIn(variantTable.ColumnNames.variant_group_id, Ids as number[])
    .orderBy('sequence', 'asc')
    .then((rows: IVariant[]) => {
      logger.debug('successfully fetched variant by group ids', rows);
      return rows;
    })
    .catch((error: Error) => {
      logger.error('ERROR FETCHING VARIANT BY GROUP IDS', error);
      throw error;
    });
}

// export async function readVariantsAssociatedWithPosForUpdate(
//   trx: Knex.Transaction,
//   pos_variant_item_ids: string[],
//   variant_group_ids: number[]
// ): Promise<IVariant[]> {
//   logger.debug(
//     'reading variants by pos variant item ids and variant group ids',
//     {
//       pos_variant_item_ids,
//       variant_group_ids,
//     }
//   );
//   try {
//     const variants = await DB.write(variantTable.TableName)
//       .select('*')
//       .transacting(trx)
//       .forUpdate()
//       .where({is_deleted: false})
//       .whereIn('pos_variant_item_id', pos_variant_item_ids)
//       .whereIn('variant_group_id', variant_group_ids);
//     logger.debug('successfully fetched variants', variants);
//     return variants;
//   } catch (error) {
//     logger.error('GOT ERROR WHILE FETCHING VARIANTS BY POS IDS', error);
//     throw error;
//   }
// }

export async function readVariantByVariantGroupIdsForUpdate(
  trx: Knex.Transaction,
  variant_group_ids: number[]
): Promise<IVariant[]> {
  logger.debug('reading variant by group ids', variant_group_ids);
  try {
    const rows = await DB.write(variantTable.TableName)
      .select('*')
      .where({is_deleted: false})
      .whereIn(variantTable.ColumnNames.variant_group_id, variant_group_ids)
      .forUpdate()
      .transacting(trx);
    logger.debug('successfully fetched variant by group ids', rows);
    return rows;
  } catch (error) {
    logger.error('ERROR FETCHING VARIANT BY GROUP IDS', error);
    throw error;
  }
}

export async function bulkRemovePosDetailsFromVariant(
  trx: Knex.Transaction,
  variants_ids: number[]
): Promise<IVariant[]> {
  logger.debug('bulk removing pos partner from variants', variants_ids);
  return await DB.write(variantTable.TableName)
    .update({pos_id: null, pos_partner: null, pos_variant_item_id: null})
    .returning('*')
    .whereIn(variantTable.ColumnNames.id, variants_ids)
    .transacting(trx)
    .then((variants: IVariant[]) => {
      logger.debug('successfully removed pos partner from variants', variants);
      return variants;
    })
    .catch((error: Error) => {
      logger.error('GOT ERROR WHILE REMOVING POS PARTNER FROM VARIANTS', error);
      throw error;
    });
}

export async function readPosVariantByVariantGroupIdsForUpdate(
  trx: Knex.Transaction,
  variant_group_ids: number[],
  pos_partner: string
): Promise<IVariant[]> {
  logger.debug('reading variant by group ids', variant_group_ids);
  try {
    const rows = await DB.write(variantTable.TableName)
      .select('*')
      .where({pos_partner})
      .whereIn(variantTable.ColumnNames.variant_group_id, variant_group_ids)
      .forUpdate()
      .transacting(trx);
    logger.debug('successfully fetched variant by group ids', rows);
    return rows;
  } catch (error) {
    logger.error('ERROR FETCHING VARIANT BY GROUP IDS', error);
    throw error;
  }
}
