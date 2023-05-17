import {DB} from '../../../data/knex';
import logger from '../../../utilities/logger/winston_logger';
import {IRestaurant} from '../restaurant/models';
import {IMenuItem_Slot} from './models';

export interface IVariant_Export {
  variant_id: number;
  variant_name: string;
  price: number;
  serves_how_many: number;
  in_stock: boolean;
  veg_egg_non: string;
  is_default: boolean;
}

export interface IVariantGroup_Export {
  variant_group_id: number;
  variant_group_name: string;
  variants: IVariant_Export[];
}
export interface IMenuItemCsvRow {
  restaurant_id?: string;
  menu_item_id?: number;
  menu_item_name?: string;

  main_category_id?: number;
  main_category_name?: string;
  sub_category_id?: number;
  sub_category_name?: string;

  description?: string;
  in_stock?: boolean;
  price?: number;
  veg_egg_non?: 'veg' | 'egg' | 'non-veg';
  packing_charges?: number;
  is_spicy?: boolean;
  serves_how_many?: number;
  service_charges?: number;
  item_sgst_utgst?: number;
  item_cgst?: number;
  item_igst?: number;
  item_inclusive?: boolean;
  disable?: boolean;
  is_deleted?: boolean;
  external_id?: string;
  allow_long_distance?: boolean;

  parent?: string;
  parent_id?: string;
  csv_index: number;
  menu_item_slots: IMenuItem_Slot[];
}
export interface IItemVariantCsvRow {
  restaurant_id?: string;

  main_category_id?: number;
  main_category_name?: string;

  sub_category_id?: number;
  sub_category_name?: string;

  menu_item_id?: number;
  menu_item_name?: string;

  variant_id?: number;
  variant_name?: string;

  variant_group_id?: number;
  variant_group_name?: string;

  in_stock?: boolean;
  price?: number;
  veg_egg_non?: 'veg' | 'egg' | 'non-veg';
  serves_how_many?: number;
  is_default?: boolean;
  is_deleted?: boolean;

  parent_id?: string;
  parent?: string;
  csv_index: number;
}
export interface IMenu_Export {
  restaurant_id: string;
  menu_item_id: number;
  menu_item_name: string;
  main_category_id: number;
  main_category_name: string;
  sub_category_id: number;
  sub_category_name: string;
  description: string;
  price: number;
  veg_egg_non: string;
  packing_charges: number;
  is_spicy: boolean;
  serves_how_many: number;
  service_charges: number;
  item_sgst_utgst: number;
  item_cgst: number;
  item_igst: number;
  item_inclusive: boolean;
  disable: boolean;
  external_id: string;
  allow_long_distance: boolean;
  variant_groups?: IVariantGroup_Export[];
  menu_item_slots?: IMenuItem_Slot[];
}

export function exportMenuItems(
  restaurant_ids: string[]
): Promise<IMenu_Export[]> {
  logger.debug('exporting menu items by restaurant ids', restaurant_ids);
  return DB.read
    .select([
      'mc.restaurant_id as restaurant_id',
      'mi.id as menu_item_id',
      'mi.name as menu_item_name',

      'mc.id as main_category_id',
      'mc.name as main_category_name',
      'mc.sequence as mc_sequence',
      'sc.sequence as sc_sequence',
      'mi.sequence as mi_sequence',
      'sc.id as sub_category_id',
      'sc.name as sub_category_name',

      'mi.description as description',
      'mi.price as price',
      'mi.veg_egg_non as veg_egg_non',
      'mi.packing_charges as packing_charges',
      'mi.is_spicy as is_spicy',
      'mi.serves_how_many as serves_how_many',
      'mi.service_charges as service_charges',
      'mi.item_sgst_utgst as item_sgst_utgst',
      'mi.item_cgst as item_cgst',
      'mi.item_igst as item_igst',
      'mi.item_inclusive as item_inclusive',
      'mi.disable as disable',
      'mi.external_id as external_id',
      'mi.allow_long_distance as allow_long_distance',
    ])
    .select(
      DB.read.raw(
        `(select
          to_json(array_agg(row_to_json(v)))
        from
          (select
            vg.id as variant_group_id,
            vg.name as variant_group_name,
            vg.sequence as sequence,
            (select
              to_json(array_agg(row_to_json(w)))
            from
              (select
                iv.id as variant_id,
                iv.name as variant_name,
                iv.price,
                iv.serves_how_many,
                iv.is_default,
                iv.in_stock,
                iv.sequence as sequence,
                iv.veg_egg_non
               from
                item_variant as iv
               where
                iv.variant_group_id = vg.id and iv.is_deleted = false
               order by iv.sequence asc
              ) w
            )as variants
           from
            item_variant_group as vg
           where
            vg.menu_item_id = mi.id  and vg.is_deleted = false
           order by vg.sequence asc
          ) v
        )as variant_groups`
      )
    )
    .select(
      DB.read.raw(
        `(select
          to_json(array_agg(row_to_json(w)))
        from
          (select
            mis.weekday,
            mis.slot_num,
            mis.open_time,
            mis.close_time
          from
           menu_item_slot as mis
          where
            mis.menu_item_id = mi.id
          ) w
        )as menu_item_slots`
      )
    )
    .from('menu_item as mi')
    .leftOuterJoin('sub_category as sc', 'mi.sub_category_id', 'sc.id')
    .leftOuterJoin('main_category as mc', 'sc.main_category_id', 'mc.id')
    .where({
      'mc.is_deleted': false,
      'sc.is_deleted': false,
      'mi.is_deleted': false,
      // 'mi.restaurant_id': restaurant_id,
    })
    .whereIn('mi.restaurant_id', restaurant_ids)
    .orderBy('mc.sequence', 'asc')
    .orderBy('sc.sequence', 'asc')
    .orderBy('mi.sequence', 'asc')
    .then((menu: IMenu_Export[]) => {
      logger.debug('successfully exported menu items by restaurant ids', menu);
      return menu;
    })
    .catch((error: Error) => {
      logger.error('ERROR EXPORTING MENU ITEMS BY RESTAURANT IDS', error);
      throw error;
    });
}
export function readRestaurantsByIds(Ids: string[]): Promise<IRestaurant[]> {
  return DB.read('restaurant')
    .select('*')
    .where({is_deleted: false})
    .whereIn('id', Ids)
    .then((rows: IRestaurant[]) => {
      return rows;
    })
    .catch((error: Error) => {
      throw error;
    });
}
//

//  Addon Addon Group

//

export interface IAddon_AddonGroup_CSV {
  restaurant_id?: string;
  addon_group_id?: number;
  addon_group_name?: string;
  addon_id?: number;
  menu_item_ids?: number[];
  addon_name?: string;
  sequence?: number;
  price?: number;
  veg_egg_non?: 'veg' | 'egg' | 'non-veg';
  in_stock?: boolean;
  sgst_rate?: number;
  cgst_rate?: number;
  igst_rate?: number;
  gst_inclusive?: boolean;
  external_id?: string;
}

export function exportAddons(
  restIds: string[]
): Promise<IAddon_AddonGroup_CSV[]> {
  logger.debug('exporting addons by restaurant ids', restIds);
  return (
    DB.read
      // .select('*')
      .select([
        'ag.restaurant_id as restaurant_id',
        'ag.id as addon_group_id',
        'ag.name as addon_group_name',
        'ad.id as addon_id',
        'ad.name as addon_name',
        DB.read.raw(
          `(select to_json(array_agg(menu_item_id))
          from item_addon as ia
          join menu_item as mi on mi.id = ia.menu_item_id
          where mi.is_deleted = false
            and ia.addon_id = ad.id) as menu_item_ids`
        ),
        'ad.sequence as sequence',
        'ad.price as price',
        'ad.veg_egg_non as veg_egg_non',
        'ad.in_stock as in_stock',
        'ad.sgst_rate as sgst_rate',
        'ad.cgst_rate as cgst_rate',
        'ad.igst_rate as igst_rate',
        'ad.gst_inclusive as gst_inclusive',
        'ad.external_id as external_id',
      ])
      .from('addon_group as ag')
      .leftJoin('addon as ad', 'ad.addon_group_id', 'ag.id')
      .where({['ag.is_deleted']: false})
      .where({['ad.is_deleted']: false})
      .whereIn('ag.restaurant_id', restIds)
      .then((addon_group: IAddon_AddonGroup_CSV[]) => {
        logger.debug(
          'successfully exported addon group restaurant ids',
          addon_group
        );
        return addon_group;
      })
      .catch((error: Error) => {
        logger.error('ERROR EXPORTING ADDONS BY RESTAURANT IDS', error);
        throw error;
      })
  );
}

//

//  Item Addon Group

//

export interface IItem_AddonGroup_CSV {
  restaurant_id?: string;
  menu_item_id?: number;
  addon_group_id?: number;
  addon_group_name?: string;
  max_limit?: number;
  min_limit?: number;
  free_limit?: number;
  sequence?: number;
}

export function exportItemAddonGroup(
  restIds: string[]
): Promise<IItem_AddonGroup_CSV[]> {
  logger.debug('exporting items addon group by restaurant ids', restIds);
  /**
    select
	distinct
      mi.restaurant_id as restaurant_id,
      mi.id as menu_item_id,
      mi.name as item_name,
      ag.id as addon_group_id,
      ag.name as addon_group_name,
      iag.max_limit as max_limit,
      iag.min_limit as min_limit,
      iag.free_limit as free_limit,
      iag.sequence as sequence
    from menu_item as mi
	join item_addon as ia on ia.menu_item_id = mi.id
	join addon as ad on ad.id = ia.addon_id
    join addon_group as ag on ag.id = ad.addon_group_id
    left Outer Join item_addon_group as iag on iag.addon_group_id = ag.id and iag.menu_item_id = mi.id
 */

  return DB.read
    .distinct()
    .select([
      'mi.restaurant_id as restaurant_id',
      'mi.id as menu_item_id',
      'mi.name as item_name',
      'ag.id as addon_group_id',
      'ag.name as addon_group_name',
      'iag.max_limit as max_limit',
      'iag.min_limit as min_limit',
      'iag.free_limit as free_limit',
      'iag.sequence as sequence',
    ])
    .from('menu_item as mi')
    .join('item_addon as ia', 'ia.menu_item_id', 'mi.id')
    .join('addon as ad', 'ad.id', 'ia.addon_id')
    .join('addon_group as ag', 'ag.id', 'ad.addon_group_id')
    .leftOuterJoin('item_addon_group as iag', function () {
      this.on('iag.addon_group_id', '=', 'ag.id').on(
        'iag.menu_item_id',
        '=',
        'mi.id'
      );
    })
    .where({['mi.is_deleted']: false})
    .where({['ag.is_deleted']: false})
    .where({['ad.is_deleted']: false})
    .whereIn('ag.restaurant_id', restIds)
    .then((addon_group: IItem_AddonGroup_CSV[]) => {
      logger.debug(
        'successfully exported items addon group by restaurant ids',
        addon_group
      );
      return addon_group;
    })
    .catch((error: Error) => {
      logger.error(
        'ERROR EXPORTING ITEMS ADDON GROUP BY RESTAURANT IDS',
        error
      );
      throw error;
    });
}
