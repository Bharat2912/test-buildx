import Joi from 'joi';
import * as joi from '../../../utilities/joi_common';
import {DB} from '../../../data/knex';
import {FileObject} from '../../../utilities/s3_manager';
import menuItemTable from './constants';
import {IPagination} from '../restaurant/models';
import {Knex} from 'knex';
import logger from '../../../utilities/logger/winston_logger';
import {QueryDslQueryContainer} from '@elastic/elasticsearch/lib/api/types';
import {createIndex, esIndexData, query} from '../../../utilities/es_manager';
import moment, {Moment} from 'moment';
import {Weekdays} from '../../../utilities/utilFuncs';
import {databaseResponseTimeHistogram} from '../../../utilities/metrics/prometheus';
import {IVariantGroup} from './variant_group/models';
import {IItem_AddonGroup} from './item_addon_group/models';
import {ICartMenuITem} from '../cart/types';
import {common_name} from '../../../utilities/joi_common';
import {PosPartner} from '../enum';
import {IMainCategory} from './main_category/models';
import {ISubCategory} from './sub_category/models';
import {IRestaurantMenu} from './type';

export interface IItem_Addon {
  addon_id?: number;
  menu_item_id?: number;
}
export interface IMenuItem_Slot {
  menu_item_id?: number;
  weekday: string;
  slot_num: number;
  open_time: number;
  close_time: number;
}
export interface IMenuItem_Slot {
  menu_item_id?: number;
  weekday: string;
  slot_num: number;
  open_time: number;
  close_time: number;
}
export interface IMenuItem {
  id?: number;
  restaurant_id?: string;
  name?: string;
  description?: string | null;
  main_category_id?: number;
  main_category_name?: string;
  sub_category_id?: number;
  sub_category_name?: string;
  in_stock?: boolean;
  price?: number;
  veg_egg_non?: string;
  packing_charges?: number;
  is_spicy?: boolean;
  serves_how_many?: number;
  service_charges?: number;
  item_sgst_utgst?: number;
  item_cgst?: number;
  item_igst?: number;
  item_inclusive?: boolean;
  tax_applied_on?: 'core' | 'total';
  disable?: boolean;
  external_id?: string;
  allow_long_distance?: boolean;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
  image?: FileObject | null;
  // This key is to hold the next available slots opening time
  // It is generated dynamically to send to frontend
  next_available_at?: Date;
  // This Key holds the timestamp select by vendor to make item available after this time
  next_available_after?: Date | null;
  menu_item_slots?: IMenuItem_Slot[];
  variant_groups?: IVariantGroup[];
  addon_groups?: IItem_AddonGroup[];
  sequence?: number;
  pos_id?: string;
  pos_partner?: PosPartner;
  display_price?: number;
  discount_rate?: number;
  discount_updated_at?: Date;
  discount_updated_user_id?: string;
  discount_updated_user_type?: string;
}
export interface IMenu_MainCategory {
  id: IMainCategory['id'];
  name: IMainCategory['name'];
  in_stock?: boolean;
  discount_rate?: number;
  sub_categories: {
    id: ISubCategory['id'];
    name: ISubCategory['name'];
    discount_rate?: number;
    menu_items: IMenuItem[];
    in_stock?: boolean;
  }[];
}
interface IMenu {
  main_category: {
    id: IMainCategory['id'];
    name: IMainCategory['name'];
    sub_category: {
      id: ISubCategory['id'];
      name: ISubCategory['name'];
      menu_item: IMenuItem[];
    }[];
  }[];
}

export interface IES_MenuItem {
  id: number;
  restaurant_id: string;
  name: string;
  veg_egg_non: string;
  is_spicy: boolean;
  serves_how_many: number;
  allow_long_distance: boolean;
}
export const id = Joi.string()
  .guid({version: ['uuidv4', 'uuidv5']})
  .required();

export const verify_update_discount = Joi.object({
  restaurant: Joi.object({
    restaurant_id: Joi.string().required(),
    discount_rate: Joi.number().required().max(100).min(0),
  }),
  main_categories: Joi.array()
    .items({
      main_category_id: Joi.number().required(),
      discount_rate: Joi.number().required().max(100).min(0),
    })
    .min(1),
  sub_categories: Joi.array()
    .items({
      sub_category_id: Joi.number().required(),
      discount_rate: Joi.number().required().max(100).min(0),
    })
    .min(1),
  menu_items: Joi.array()
    .items({
      menu_item_id: Joi.number().required(),
      discount_rate: Joi.number().required().max(100).min(0),
    })
    .min(1),

  // main_category_ids: Joi.array().items(Joi.number()).min(1),
  // sub_category_ids: Joi.array().items(Joi.number()).min(1),
  // menu_item_ids: Joi.array().items(Joi.number()).min(1),
  // discount_rate: Joi.number().required(),
});
export interface IUpdateDiscount {
  restaurant?: {
    restaurant_id: string;
    discount_rate: number;
  };
  main_categories: {
    main_category_id: number;
    discount_rate: number;
  }[];
  sub_categories: {
    sub_category_id: number;
    discount_rate: number;
  }[];
  menu_items: {
    menu_item_id: number;
    discount_rate: number;
  }[];

  // main_category_ids?: number[];
  // sub_category_ids?: number[];
  // menu_item_ids?: number[];
  // discount_rate: number;
}
export const verify_holiday_slot = Joi.object({
  id: Joi.number().required(),
  end_epoch: Joi.number().required().allow(null),
});

export const schema_upload_file = Joi.object({
  csv_file_name: Joi.string().min(1).max(70).required(),
});

export const verify_item_addon = Joi.object({
  id: Joi.number().integer().required(),
});
export const verify_item_addon_group = Joi.object({
  id: joi.id_num,
  max_limit: Joi.number().integer().required(),
  min_limit: Joi.number().integer().required(),
  free_limit: Joi.number().integer().required(),
  sequence: Joi.number().integer().required(),
  addons: Joi.array().items(verify_item_addon).min(1),
});

export const verify_variant = Joi.object({
  name: common_name.required(),
  is_default: Joi.boolean().required(),
  in_stock: Joi.boolean().required(),
  price: Joi.number().precision(2).required(),
  veg_egg_non: Joi.valid('veg', 'egg', 'non-veg').required(),
  serves_how_many: Joi.number().integer().min(1).required(),
});
export const verify_variant_group = Joi.object({
  name: common_name.required(),
  variants: Joi.array().items(verify_variant).min(1),
});
export const verify_create_menu_item = Joi.object({
  restaurant_id: joi.joi_restaurant_id.required(),
  sub_category_id: joi.id_num,
  name: common_name.required(),
  description: Joi.string().min(1).allow(null),
  price: Joi.number().precision(2).required(),
  veg_egg_non: Joi.valid('veg', 'egg', 'non-veg').required(),
  packing_charges: Joi.number().precision(2).required(),
  is_spicy: Joi.boolean().required(),
  serves_how_many: Joi.number().integer().min(1).required(),
  service_charges: Joi.number().precision(2).required(),
  item_sgst_utgst: Joi.number().precision(3).required(),
  item_cgst: Joi.number().precision(3).required(),
  item_igst: Joi.number().precision(3).required(),
  item_inclusive: Joi.boolean().required(),
  external_id: Joi.string().required(),
  allow_long_distance: Joi.boolean().required(),
  image: joi.verify_file,
  variant_groups: Joi.array().items(verify_variant_group).min(1),
  addon_groups: Joi.array().items(verify_item_addon_group).min(1),
});

export const verify_update_variant = Joi.object({
  id: Joi.number().integer(),
  name: common_name.required(),
  is_default: Joi.boolean().required(),
  in_stock: Joi.boolean().required(),
  price: Joi.number().precision(2).required(),
  veg_egg_non: Joi.valid('veg', 'egg', 'non-veg').required(),
  serves_how_many: Joi.number().integer().min(1).required(),
});
export const verify_update_variant_group = Joi.object({
  id: Joi.number().integer(),
  name: common_name.required(),
  variants: Joi.array().items(verify_update_variant).min(1),
});
export const verify_update_menu_item = Joi.object({
  id: joi.id_num,
  restaurant_id: joi.joi_restaurant_id.required(),
  sub_category_id: joi.id_num,
  name: common_name,
  description: Joi.string().min(1).allow(null),
  price: Joi.number().precision(2),
  veg_egg_non: Joi.valid('veg', 'egg', 'non-veg'),
  packing_charges: Joi.number().precision(2),
  is_spicy: Joi.boolean(),
  serves_how_many: Joi.number().min(1).integer(),
  service_charges: Joi.number().precision(2),
  item_sgst_utgst: Joi.number().precision(3),
  item_cgst: Joi.number().precision(3),
  item_igst: Joi.number().precision(3),
  item_inclusive: Joi.boolean(),
  external_id: Joi.string(),
  allow_long_distance: Joi.boolean(),
  image: joi.verify_file,
  variant_groups: Joi.array().items(verify_update_variant_group).min(1),
  addon_groups: Joi.array().items(verify_item_addon_group).min(1),
});

export function getNextAvailableSlot(
  datetime: Date,
  menu_item_slots?: IMenuItem_Slot[]
) {
  let result: Moment | null = null;

  if (menu_item_slots && menu_item_slots.length) {
    for (let dayCntr = 0; dayCntr < 8; dayCntr++) {
      const date = moment(datetime).add(dayCntr, 'day');
      const weekday = Weekdays[(date.day() + 6) % 7].toLowerCase();
      const time = +date.format('kkmm');
      let todaySlot: IMenuItem_Slot[] = [];
      if (dayCntr === 0) {
        todaySlot = menu_item_slots.filter(slot => {
          return slot.weekday === weekday && slot.close_time > time;
        });
      } else {
        todaySlot = menu_item_slots.filter(slot => {
          return slot.weekday === weekday;
        });
      }
      todaySlot.map(slot => {
        const nextslot = moment(
          date.format('YYYY-MM-DD') + ' ' + ('0000' + slot.open_time).slice(-4),
          'YYYY-MM-DD kkmm'
        );
        if (!result || result > nextslot) {
          result = nextslot;
        }
      });
      if (result) {
        return result;
      }
    }
  }

  return moment(datetime);
}
export function calculateNextAvailableAt(item: {
  in_stock?: boolean;
  next_available_after?: Date | null;
}) {
  const CurrentDateTime = new Date();
  let next_available_at: Date | undefined;
  if (item.next_available_after) {
    item.next_available_after = new Date(item.next_available_after);
    if (item.next_available_after > CurrentDateTime) {
      next_available_at = item.next_available_after;
      item.in_stock = false;
    }
  }
  return {in_stock: item.in_stock, next_available_at};
}
export function calculateMenuItemNextAvailableTime(
  menu_item: IMenuItem
): IMenuItem {
  if (!menu_item) return menu_item;
  let startDateTime = new Date();
  if (menu_item.next_available_after) {
    menu_item.next_available_after = new Date(menu_item.next_available_after);
    if (menu_item.next_available_after > new Date())
      startDateTime = menu_item.next_available_after;
  }
  const nextDatetime = getNextAvailableSlot(
    startDateTime,
    menu_item.menu_item_slots
  );
  delete menu_item.menu_item_slots;
  menu_item.next_available_at = nextDatetime.toDate();

  if (menu_item.addon_groups) {
    menu_item.addon_groups = menu_item.addon_groups.map(addon_group => {
      if (addon_group.addons) {
        addon_group.addons = addon_group.addons.map(addon => {
          const {in_stock, next_available_at} = calculateNextAvailableAt(addon);
          addon.in_stock = in_stock;
          addon.next_available_at = next_available_at;
          return addon;
        });
      }
      return addon_group;
    });
  }
  if (menu_item.variant_groups) {
    menu_item.variant_groups = menu_item.variant_groups.map(variant_group => {
      if (variant_group.variants) {
        variant_group.variants = variant_group.variants.map(variant => {
          const {in_stock, next_available_at} =
            calculateNextAvailableAt(variant);
          variant.in_stock = in_stock;
          variant.next_available_at = next_available_at;
          return variant;
        });
      }
      return variant_group;
    });
  }
  if (menu_item.next_available_at <= new Date()) {
    menu_item.in_stock = true;
  } else {
    menu_item.in_stock = false;
  }
  return menu_item;
}
export function calculateMenuItemsNextAvailableTime(menu_items: IMenuItem[]) {
  menu_items = menu_items.map(menu_item =>
    calculateMenuItemNextAvailableTime(menu_item)
  );
  return menu_items;
}
export function calculateNextAvailableTime(menu: IMenu) {
  menu.main_category?.map(mc => {
    mc.sub_category?.map(sc => {
      if (sc.menu_item) {
        sc.menu_item = calculateMenuItemsNextAvailableTime(sc.menu_item);
      }
    });
  });
  return menu;
}

export async function CheckDuplicateName(
  menu_item: IMenuItem
): Promise<boolean> {
  const menu_items = await getMenuItemByName(
    menu_item.sub_category_id!,
    menu_item.name!
  );
  if (menu_items && menu_items.length) {
    if (menu_items[0].id !== menu_item.id) {
      return true;
    }
  }
  return false;
}

export function getMenuItemByName(
  sub_category_id: number,
  name: string
): Promise<IMenuItem[]> {
  return DB.read(menuItemTable.TableName)
    .where({is_deleted: false, sub_category_id, name})
    .select([
      menuItemTable.ColumnNames.id,
      menuItemTable.ColumnNames.sub_category_id,
      menuItemTable.ColumnNames.name,
    ])
    .then((menu_item: IMenuItem[]) => {
      return menu_item;
    })
    .catch((error: Error) => {
      throw error;
    });
}

const READ_MENU_ITEM_SQL_QUERY = `(
  SELECT
    mi.id as menu_item_id,
    mi.restaurant_id AS restaurant_id,
    mi.NAME AS menu_item_name,
	  main_category.id AS main_category_id,
	  main_category.name AS main_category_name,
    mi.sub_category_id AS sub_category_id,
	  sub_category.name AS sub_category_name,
    mi.description AS description,
    mi.price AS price,
    mi.veg_egg_non AS veg_egg_non,
    mi.packing_charges AS packing_charges,
    mi.is_spicy AS is_spicy,
    mi.serves_how_many AS serves_how_many,
    mi.service_charges AS service_charges,
    mi.item_sgst_utgst AS item_sgst_utgst,
    mi.item_cgst AS item_cgst,
    mi.item_igst AS item_igst,
    mi.item_inclusive AS item_inclusive,
    mi.image AS image,
    mi.disable AS disable,
    mi.external_id AS external_id,
    mi.allow_long_distance AS allow_long_distance,
    mi.next_available_after as next_available_after,
    mi.is_deleted AS is_deleted,
    mi.pos_partner AS pos_partner,
    mi.pos_id AS pos_id,
    mi.sequence,
    mi.discount_rate,
    (select
      to_json(array_agg(row_to_json(v)))
    from
      (select
        vg.id,
        vg.name as variant_group_name,
        vg.sequence,
        (select
          to_json(array_agg(row_to_json(w)))
        from
          (select
            iv.id,
            iv.variant_group_id,
            iv.name as variant_name,
            iv.is_default,
            iv.price,
            iv.veg_egg_non,
            iv.in_stock,
            iv.serves_how_many,
            iv.sequence
            from
              item_variant as iv
            where
              iv.variant_group_id = vg.id
              and iv.is_deleted = false
          ) as w
        )as variants
      from
        item_variant_group as vg
      where
        vg.menu_item_id = mi.id
        and vg.is_deleted = false
      ) as v
    )as variant_groups,
    (
      SELECT
        to_json(
          array_agg(
            row_to_json(x)
          )
        )
      FROM
        (
          SELECT
            ag.id,
            ag.NAME AS addon_group_name,
            iag.min_limit,
            iag.max_limit,
            iag.free_limit,
            iag.sequence,
            json_agg(
              json_build_object(
                'id', ad.id,
                'addon_name', ad.NAME,
                'sequence', ad.sequence,
                'price', ad.price,
                'veg_egg_non', ad.veg_egg_non,
                'in_stock', ad.in_stock,
                'sgst_rate', ad.sgst_rate,
                'cgst_rate', ad.cgst_rate,
                'igst_rate', ad.igst_rate,
                'gst_inclusive', ad.gst_inclusive,
                'external_id', ad.external_id
              )
            ) AS addons
          FROM
            addon AS ad
            JOIN item_addon AS ia ON ia.addon_id = ad.id
            AND ia.menu_item_id = mi.id
            JOIN addon_group ag ON ad.addon_group_id = ag.id
            JOIN item_addon_group iag ON iag.addon_group_id = ag.id
            AND iag.menu_item_id = mi.id
          WHERE
            ad.is_deleted = false
            AND ag.is_deleted = false
          GROUP BY
            ag.id,
            iag.min_limit,
            iag.max_limit,
            iag.free_limit,
            iag.sequence
        ) AS x
    ) AS addon_groups,
    (select
      to_json(array_agg(row_to_json(y)))
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
      ) as y
    ) as menu_item_slots
  FROM
    menu_item AS mi
  JOIN sub_category ON sub_category.id = mi.sub_category_id
  JOIN main_category ON main_category.id = sub_category.main_category_id
  AND main_category.restaurant_id = mi.restaurant_id
  order by (mi.sequence, sub_category.sequence)
) AS a
`;

/*
 *Read menu item details from read replica
 */
export async function readMenuItem(item_id: number) {
  logger.debug('Reading Menu Item from read replica', item_id);
  const query = DB.read
    .select('*')
    .fromRaw(READ_MENU_ITEM_SQL_QUERY)
    .where({is_deleted: false})
    .where({menu_item_id: item_id});

  return await query
    .then(menu => {
      if (menu[0]) menu[0].addon_groups = menu[0].addon_groups || [];
      logger.debug('successful fetched menu item from read replica', menu[0]);
      return menu[0];
    })
    .catch((error: Error) => {
      throw error;
    });
}
export async function getItemDiscount(menu_item_id: number): Promise<number> {
  const result = await DB.read.raw(
    `SELECT
      mi.discount_rate AS menu_item_discount_rate,
      sc.discount_rate AS sub_category_discount_rate,
      mc.discount_rate AS main_category_discount_rate,
      rs.discount_rate AS restaurant_discount_rate

      FROM menu_item AS mi
      JOIN sub_category AS sc ON sc.id = mi.sub_category_id
      JOIN main_category AS mc ON mc.id = sc.main_category_id
      JOIN restaurant AS rs ON rs.id = mc.restaurant_id
      WHERE mi.id = ?`,
    [menu_item_id]
  );
  if (result && result.rows && result.rows.length) {
    return (
      result.rows[0].menu_item_discount_rate ||
      result.rows[0].sub_category_discount_rate ||
      result.rows[0].main_category_discount_rate ||
      result.rows[0].restaurant_discount_rate ||
      0
    );
  }
  return 0;
}
/*
 *Read menu item details from write replica
 */
export async function readMenuItemFromWR(
  item_id: number,
  trx?: Knex.Transaction
): Promise<IMenuItem> {
  logger.debug('Reading Menu Item from write replica', item_id);
  const query = DB.write
    .select('*')
    .fromRaw(READ_MENU_ITEM_SQL_QUERY)
    .where({is_deleted: false})
    .where({menu_item_id: item_id});
  if (trx) {
    query.transacting(trx);
  }
  return await query
    .then((menu: IMenuItem[]) => {
      if (menu[0]) menu[0].addon_groups = menu[0].addon_groups || [];
      logger.debug('successfully fetched menu item:', menu[0]);
      return menu[0];
    })
    .catch((error: Error) => {
      logger.error('FAILED TO FETCH MENU ITEM', error);
      throw error;
    });
}

export async function readMenuItemForUpdate(
  trx: Knex.Transaction,
  item_id: number
): Promise<IMenuItem> {
  logger.debug('Reading Menu Item:', item_id);
  const query = DB.write
    .select('*')
    .fromRaw(READ_MENU_ITEM_SQL_QUERY)
    .where({is_deleted: false})
    .where({menu_item_id: item_id})
    .forUpdate()
    .transacting(trx);

  return await query
    .then((menu: IMenuItem[]) => {
      if (menu[0]) menu[0].addon_groups = menu[0].addon_groups || [];
      return menu[0];
    })
    .catch((error: Error) => {
      throw error;
    });
}
export function readMenuItems(item_ids: number[]): Promise<ICartMenuITem[]> {
  return DB.read
    .select('*')
    .fromRaw(
      `(
        SELECT
          mi.id as menu_item_id,
          mi.restaurant_id AS restaurant_id,
          mi.NAME AS menu_item_name,
          mi.sub_category_id AS sub_category_id,
          mi.description AS description,
          mi.price AS price,
          mi.price AS display_price,
          mi.veg_egg_non AS veg_egg_non,
          mi.packing_charges AS packing_charges,
          mi.is_spicy AS is_spicy,
          mi.serves_how_many AS serves_how_many,
          mi.service_charges AS service_charges,
          mi.item_sgst_utgst AS item_sgst_utgst,
          mi.item_cgst AS item_cgst,
          mi.item_igst AS item_igst,
          mi.item_inclusive AS item_inclusive,
          mi.disable AS disable,
          mi.image AS image,
          mi.external_id AS external_id,
          mi.allow_long_distance AS allow_long_distance,
          mi.next_available_after as next_available_after,
          mi.is_deleted AS is_deleted,
          mi.pos_id AS pos_id,
          mi.pos_partner AS pos_partner,
          mi.tax_applied_on as tax_applied_on,
          mi.discount_rate as menu_item_discount_rate,
          (select sc.discount_rate from sub_category sc where sc.id = mi.sub_category_id) as sub_category_discount_rate,
          (select mc.discount_rate from main_category mc where mc.id = (select sc.main_category_id from sub_category sc where sc.id = mi.sub_category_id) ) as main_category_discount_rate,
          (select
            to_json(array_agg(row_to_json(v)))
          from
            (select
              vg.id as variant_group_id,
              vg.name as variant_group_name,
              vg.pos_id as pos_id,
              vg.pos_partner as pos_partner,
              (select
                to_json(array_agg(row_to_json(w)))
              from
                (select
                  iv.id as variant_id,
                  iv.variant_group_id,
                  iv.name as variant_name,
                  iv.is_default,
                  iv.price,
                  iv.price as display_price,
                  iv.veg_egg_non,
                  iv.in_stock,
                  iv.next_available_after,
                  iv.serves_how_many,
                  iv.pos_id,
                  iv.pos_variant_item_id,
                  iv.pos_partner
                  from
                    item_variant as iv
                  where
                    iv.variant_group_id = vg.id
                    and iv.is_deleted = false
                ) as w
              )as variants
            from
              item_variant_group as vg
            where
              vg.menu_item_id = mi.id
              and vg.is_deleted = false
            ) as v
          )as variant_groups,
          (
            SELECT
              to_json(
                array_agg(
                  row_to_json(x)
                )
              )
            FROM
              (
                SELECT
                  ag.id AS addon_group_id,
                  ag.NAME AS addon_group_name,
                  ag.pos_id AS pos_id,
                  ag.pos_partner AS pos_partner,
                  iag.min_limit,
                  iag.max_limit,
                  iag.free_limit,
                  iag.sequence,
                  json_agg(
                    json_build_object(
                      'addon_id', ad.id,
                      'addon_name', ad.NAME,
                      'sequence', ad.sequence,
                      'price', ad.price,
                      'display_price', ad.price,
                      'veg_egg_non', ad.veg_egg_non,
                      'in_stock', ad.in_stock,
                      'next_available_after', next_available_after,
                      'sgst_rate', ad.sgst_rate,
                      'cgst_rate', ad.cgst_rate,
                      'igst_rate', ad.igst_rate,
                      'gst_inclusive', ad.gst_inclusive,
                      'external_id', ad.external_id,
                      'pos_id' , ad.pos_id,
                      'pos_partner', ad.pos_partner
                    )
                  ) AS addons
                FROM
                  addon AS ad
                  JOIN item_addon AS ia ON ia.addon_id = ad.id
                  AND ia.menu_item_id = mi.id
                  JOIN addon_group ag ON ad.addon_group_id = ag.id
                  JOIN item_addon_group iag ON iag.addon_group_id = ag.id
                  AND iag.menu_item_id = mi.id
                WHERE
                  ad.is_deleted = false
                  AND ag.is_deleted = false
                GROUP BY
                  ag.id,
                  iag.min_limit,
                  iag.max_limit,
                  iag.free_limit,
                  iag.sequence
              ) AS x
          ) AS addon_groups,
          (select
            to_json(array_agg(row_to_json(y)))
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
            ) as y
          ) as menu_item_slots
        FROM
          menu_item AS mi
      ) AS a
      `
    )
    .where({is_deleted: false})
    .whereIn('menu_item_id', item_ids)
    .then((menu: ICartMenuITem[]) => {
      return menu;
    })
    .catch((error: Error) => {
      throw error;
    });
}
//returns all data related to restaurant menu - menuitems and its associstaed data
export function getRestaurantMenu(
  restaurant_id: string
): Promise<IRestaurantMenu> {
  const startmillis = Date.now();
  const metrix_label = {operation: 'get_menu_db'};
  const timer = databaseResponseTimeHistogram.startTimer();
  return DB.read
    .select('*')
    .fromRaw(
      `(select
          rs.id as restaurant_id,
          rs.city_id as city_id,
          rs.discount_rate,
          (select
            to_json(array_agg(row_to_json(s)))
          from
            (select
              mc.id as main_category_id,
              mc.name as main_category_name,
              mc.discount_rate,
              (select
                to_json(array_agg(row_to_json(t)))
              from
                (select
                  sc.id as sub_category_id,
                  sc.name as sub_category_name,
                  sc.discount_rate,
                  (select
                    to_json(array_agg(row_to_json(u)))
                  from
                    (select
                      mi.id as menu_item_id,
                      mi.name menu_item_name,
                      mi.sub_category_id as sub_category_id,
                      mi.description as description,
                      mi.discount_rate,
                      mi.price as display_price,
                      mi.price as price,
                      mi.veg_egg_non as veg_egg_non,
                      mi.packing_charges as packing_charges,
                      mi.is_spicy as is_spicy,
                      mi.serves_how_many as serves_how_many,
                      mi.service_charges as service_charges,
                      mi.item_sgst_utgst as item_sgst_utgst,
                      mi.item_cgst as item_cgst,
                      mi.item_igst as item_igst,
                      mi.item_inclusive as item_inclusive,
                      mi.disable as disable,
                      mi.image as image,
                      mi.external_id as external_id,
                      mi.allow_long_distance as allow_long_distance,
                      mi.next_available_after as next_available_after,
                      (select
                        to_json(array_agg(row_to_json(v)))
                      from
                        (select
                          vg.id as variant_group_id,
                          vg.name as variant_group_name,
                          (select
                            to_json(array_agg(row_to_json(w)))
                          from
                            (select
                              iv.id as variant_id,
                              iv.variant_group_id as variant_group_id,
                              iv.name as variant_name,
                              iv.is_default as is_default,
                              iv.price,
                              iv.price as display_price,
                              iv.veg_egg_non,
                              iv.in_stock,
                              iv.next_available_after,
                              iv.serves_how_many
                              from
                                item_variant as iv
                              where
                                iv.variant_group_id = vg.id
                                and iv.is_deleted = false
                              order by iv.sequence
                            ) as w
                          )as variants
                        from
                          item_variant_group as vg
                        where
                          vg.menu_item_id = mi.id
                          and vg.is_deleted = false
                        order by vg.sequence
                        ) as v
                      )as variant_groups,
                      (select
                        to_json(array_agg(row_to_json(x)))
                        from
                        (select
                          ag.id as addon_group_id,
                          ag.name as addon_group_name,
                          iag.min_limit,
                          iag.max_limit,
                          iag.free_limit,
                          iag.sequence,
                          json_agg(json_build_object(
                            'addon_id',ad.id,
                            'addon_name',ad.name,
                            'sequence',ad.sequence,
                            'price',ad.price,
                            'display_price',ad.price,
                            'veg_egg_non',ad.veg_egg_non,
                            'in_stock',ad.in_stock,
                            'next_available_after',ad.next_available_after,
                            'sgst_rate',ad.sgst_rate,
                            'cgst_rate',ad.cgst_rate,
                            'igst_rate',ad.igst_rate,
                            'gst_inclusive',ad.gst_inclusive,
                            'external_id',ad.external_id
                          )) as addons
                        from addon as ad
                        join item_addon as ia on ia.addon_id = ad.id and ia.menu_item_id = mi.id
                        join addon_group ag on ad.addon_group_id = ag.id
                        join item_addon_group iag on iag.addon_group_id = ag.id and iag.menu_item_id = mi.id
                        where ad.is_deleted = false and ag.is_deleted = false
                        group by ag.id,iag.min_limit,iag.max_limit,iag.free_limit,iag.sequence
                        ) as x
                      ) as addon_groups,
                      (select
                        to_json(array_agg(row_to_json(y)))
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
                        ) as y
                      ) as menu_item_slots
                    from
                      menu_item as mi
                    where
                      mi.sub_category_id = sc.id
                      and mi.is_deleted = false
                      and mi.disable = false
                    order by mi.sequence
                    ) as u
                  )as menu_item
                from
                  sub_category as sc
                where
                  sc.main_category_id = mc.id
                  and sc.is_deleted = false
                order by sc.sequence
                ) as t
              )as sub_category
            from
              main_category as mc
            where
              mc.restaurant_id = rs.id
              and mc.is_deleted = false
            order by mc.sequence
            ) as s
          ) as main_category
        from
          restaurant as rs
        ) as a`
    )
    .where({restaurant_id: restaurant_id})
    .then(menu => {
      if (menu && menu.length) {
        menu[0] = calculateNextAvailableTime(menu[0]);
        timer({...metrix_label, success: 'true'});
        const endmillis = Date.now();
        logger.debug('duration db', endmillis - startmillis);
        return menu[0];
      }
      return null;
    })
    .catch((error: Error) => {
      timer({...metrix_label, success: 'false'});
      throw error;
    });
}
export function getMenuItems(
  restaurant_id: string
): Promise<IMenu_MainCategory[]> {
  return DB.read
    .select(['mc.id', 'mc.name', 'mc.sequence', 'mc.discount_rate'])
    .select(
      DB.read.raw(
        `
          (select
            to_json(array_agg(row_to_json(t)))
          from
            (select
              sc.id,
              sc.name,
              sc.sequence,
              sc.discount_rate,
              (select
                to_json(array_agg(row_to_json(u)))
              from
                (select
                  mi.id,
                  mi.name,
                  mi.description,
                  mi.image,
                  mi.price,
                  mi.veg_egg_non,
                  mi.next_available_after,
                  mi.sequence,
                  mi.discount_rate
                from
                  menu_item as mi
                where
                  mi.sub_category_id = sc.id
                  and mi.is_deleted = false
                order by mi.sequence asc
                ) as u
              )as menu_items
            from
              sub_category as sc
            where
              sc.main_category_id = mc.id
              and sc.is_deleted = false
            order by sc.sequence asc
            ) as t
          )as sub_categories`
      )
    )
    .from('main_category as mc')
    .where({restaurant_id})
    .where('is_deleted', 'false')
    .orderBy('mc.sequence', 'asc')
    .then((result: IMenu_MainCategory[]) => {
      result?.map(mc => {
        mc.sub_categories?.map(sc => {
          if (sc.menu_items) {
            sc.menu_items = calculateMenuItemsNextAvailableTime(sc.menu_items);
          }
        });
      });
      return result;
    })
    .catch((error: Error) => {
      throw error;
    });
}
export function readMenuItemByRestaurantIds(
  Ids: (string | undefined)[]
): Promise<IMenuItem[]> {
  return DB.read(menuItemTable.TableName)
    .select([
      menuItemTable.ColumnNames.id,
      menuItemTable.ColumnNames.restaurant_id,
      menuItemTable.ColumnNames.name,
      menuItemTable.ColumnNames.description,
      menuItemTable.ColumnNames.sub_category_id,
      menuItemTable.ColumnNames.price,
      menuItemTable.ColumnNames.veg_egg_non,
      menuItemTable.ColumnNames.packing_charges,
      menuItemTable.ColumnNames.is_spicy,
      menuItemTable.ColumnNames.serves_how_many,
      menuItemTable.ColumnNames.service_charges,
      menuItemTable.ColumnNames.item_sgst_utgst,
      menuItemTable.ColumnNames.item_cgst,
      menuItemTable.ColumnNames.item_igst,
      menuItemTable.ColumnNames.item_inclusive,
      menuItemTable.ColumnNames.disable,
      menuItemTable.ColumnNames.external_id,
      menuItemTable.ColumnNames.allow_long_distance,
    ])
    .where({is_deleted: false})
    .whereIn(menuItemTable.ColumnNames.restaurant_id, Ids as string[])
    .then((rows: IMenuItem[]) => {
      return rows;
    })
    .catch((error: Error) => {
      throw error;
    });
}

export function updateMenuItem(
  trx: Knex.Transaction,
  menu_item: IMenuItem
): Promise<IMenuItem> {
  return DB.write(menuItemTable.TableName)
    .update(menu_item)
    .where({id: menu_item.id})
    .returning('*')
    .transacting(trx)
    .then((menu_item: IMenuItem[]) => {
      return menu_item[0];
    })
    .catch((error: Error) => {
      throw error;
    });
}

export function deleteMenuItem(id: number): Promise<IMenuItem> {
  const menu_item = <IMenuItem>{
    id: id,
    is_deleted: true,
  };
  return DB.write(menuItemTable.TableName)
    .update(menu_item)
    .where({is_deleted: false, id: id})
    .returning('*')
    .then((menu_item: IMenuItem[]) => {
      return menu_item[0];
    })
    .catch((error: Error) => {
      throw error;
    });
}

export async function bulkSoftDeleteMenuItems(
  trx: Knex.Transaction,
  ids: number[]
): Promise<IMenuItem[]> {
  const menu_items = await DB.write(menuItemTable.TableName)
    .update({
      is_deleted: true,
    })
    .where({is_deleted: false})
    .whereIn('id', ids)
    .transacting(trx)
    .returning('*');
  return menu_items;
}

export function bulkUpdateMenuItem(
  trx: Knex.Transaction,
  updateRows: IMenuItem[]
): Promise<IMenuItem[]> {
  const subquery = `
    (select * from json_to_recordset(?)
      as x(
        id int,
        name text,
        sub_category_id int,
        sequence int,
        description text,
        price float,
        veg_egg_non text,
        packing_charges float,
        is_spicy boolean,
        serves_how_many int,
        service_charges float,
        item_sgst_utgst float,
        item_cgst float,
        item_igst float,
        item_inclusive boolean,
        disable boolean,
        is_deleted boolean,
        external_id text,
        allow_long_distance boolean
      )
    ) as data_table`;

  return DB.write
    .raw(
      `update ${menuItemTable.TableName}
        set
          name = data_table.name,
          sub_category_id = data_table.sub_category_id,
          description = data_table.description,
          price = data_table.price,
          veg_egg_non = data_table.veg_egg_non,
          packing_charges = data_table.packing_charges,
          is_spicy = data_table.is_spicy,
          serves_how_many = data_table.serves_how_many,
          service_charges = data_table.service_charges,
          item_sgst_utgst = data_table.item_sgst_utgst,
          item_cgst = data_table.item_cgst,
          item_igst = data_table.item_igst,
          item_inclusive = data_table.item_inclusive,
          disable = data_table.disable,
          is_deleted = data_table.is_deleted,
          external_id = data_table.external_id,
          sequence = data_table.sequence,
          allow_long_distance = data_table.allow_long_distance
        from  ${subquery}
        where ${menuItemTable.TableName}.id = data_table.id
        RETURNING *
        `,
      [JSON.stringify(updateRows)]
    )
    .transacting(trx)
    .then(menu_item => {
      return menu_item.rows;
    })
    .catch((error: Error) => {
      throw error;
    });
}

export function bulkUpdateMenuItemWithImage(
  trx: Knex.Transaction,
  updateRows: IMenuItem[]
): Promise<IMenuItem[]> {
  const subquery = `
    (select * from json_to_recordset(?)
      as x(
        id int,
        name text,
        sub_category_id int,
        sequence int,
        description text,
        price float,
        veg_egg_non text,
        packing_charges float,
        is_spicy boolean,
        serves_how_many int,
        service_charges float,
        item_sgst_utgst float,
        item_cgst float,
        item_igst float,
        item_inclusive boolean,
        disable boolean,
        is_deleted boolean,
        external_id text,
        allow_long_distance boolean,
        image jsonb
      )
    ) as data_table`;

  return DB.write
    .raw(
      `update ${menuItemTable.TableName}
        set
          name = data_table.name,
          sub_category_id = data_table.sub_category_id,
          description = data_table.description,
          price = data_table.price,
          veg_egg_non = data_table.veg_egg_non,
          packing_charges = data_table.packing_charges,
          is_spicy = data_table.is_spicy,
          serves_how_many = data_table.serves_how_many,
          service_charges = data_table.service_charges,
          item_sgst_utgst = data_table.item_sgst_utgst,
          item_cgst = data_table.item_cgst,
          item_igst = data_table.item_igst,
          item_inclusive = data_table.item_inclusive,
          disable = data_table.disable,
          is_deleted = data_table.is_deleted,
          external_id = data_table.external_id,
          sequence = data_table.sequence,
          image = data_table.image,
          allow_long_distance = data_table.allow_long_distance
        from  ${subquery}
        where ${menuItemTable.TableName}.id = data_table.id
        RETURNING *
        `,
      [JSON.stringify(updateRows)]
    )
    .transacting(trx)
    .then(menu_item => {
      return menu_item.rows;
    })
    .catch((error: Error) => {
      throw error;
    });
}

export function bulkInsertMenuItem(
  trx: Knex.Transaction,
  insertRows: IMenuItem[]
): Promise<IMenuItem[]> {
  return DB.write(menuItemTable.TableName)
    .insert(insertRows)
    .returning('*')
    .transacting(trx)
    .then((menu_item: IMenuItem[]) => {
      return menu_item;
    })
    .catch((error: Error) => {
      logger.error('ERROR WHILE BULK INSERT IN MENU ITEM', error);
      throw error;
    });
}

export function readMenuItemBySubCategoryIds(
  Ids: (number | undefined)[]
): Promise<IMenuItem[]> {
  return DB.read(menuItemTable.TableName)
    .select([
      menuItemTable.ColumnNames.id,
      menuItemTable.ColumnNames.restaurant_id,
      menuItemTable.ColumnNames.name,
      menuItemTable.ColumnNames.description,
      menuItemTable.ColumnNames.sub_category_id,
      menuItemTable.ColumnNames.price,
      menuItemTable.ColumnNames.veg_egg_non,
      menuItemTable.ColumnNames.packing_charges,
      menuItemTable.ColumnNames.is_spicy,
      menuItemTable.ColumnNames.serves_how_many,
      menuItemTable.ColumnNames.service_charges,
      menuItemTable.ColumnNames.item_sgst_utgst,
      menuItemTable.ColumnNames.item_cgst,
      menuItemTable.ColumnNames.item_igst,
      menuItemTable.ColumnNames.item_inclusive,
      menuItemTable.ColumnNames.disable,
      menuItemTable.ColumnNames.external_id,
      menuItemTable.ColumnNames.allow_long_distance,
      menuItemTable.ColumnNames.sequence,
    ])
    .where({is_deleted: false})
    .whereIn(menuItemTable.ColumnNames.sub_category_id, Ids as number[])
    .orderBy(menuItemTable.ColumnNames.sequence, 'asc')
    .then((rows: IMenuItem[]) => {
      return rows;
    })
    .catch((error: Error) => {
      throw error;
    });
}

export async function createMenuItemIndex() {
  logger.debug('creating menu item index in elastic search');
  // await clearIndex('menu_item');
  await createIndex('menu_item', {
    properties: {
      id: {type: 'keyword'},
      name: {
        type: 'text',
        fields: {
          keyword: {
            type: 'keyword',
          },
        },
      },
      veg_egg_non: {type: 'keyword'},
      is_spicy: {type: 'boolean'},
      serves_how_many: {type: 'integer'},
      allow_long_distance: {type: 'boolean'},
      restaurant_id: {type: 'keyword'},
    },
  });
}
export async function getIndexMenuItems(): Promise<IES_MenuItem[]> {
  return DB.read(menuItemTable.TableName)
    .select([
      'id',
      'restaurant_id',
      'name',
      'veg_egg_non',
      'is_spicy',
      'serves_how_many',
      'allow_long_distance',
    ])
    .where({
      is_deleted: false,
    })
    .then((restaurant: IES_MenuItem[]) => {
      return restaurant;
    })
    .catch((error: Error) => {
      throw error;
    });
}
export async function getIndexMenuItemByIds(
  ids: number[]
): Promise<IES_MenuItem[]> {
  return DB.read(menuItemTable.TableName)
    .select([
      'id',
      'restaurant_id',
      'name',
      'veg_egg_non',
      'is_spicy',
      'serves_how_many',
      'allow_long_distance',
    ])
    .where({
      is_deleted: false,
    })
    .whereIn('id', ids)
    .then((restaurant: IES_MenuItem[]) => {
      return restaurant;
    })
    .catch((error: Error) => {
      throw error;
    });
}

export async function bulkUpdateItemSlots(
  trx: Knex.Transaction,
  menu_item_ids: number[],
  insertRows: IMenuItem_Slot[]
): Promise<IMenuItem_Slot[]> {
  logger.debug('Updating item Slots');
  await DB.write('menu_item_slot')
    .whereIn('menu_item_id', menu_item_ids)
    .del()
    .transacting(trx)
    .then(slots => {
      logger.debug('menu_item_slot deleted');
      return slots;
    })
    .catch((error: Error) => {
      throw error;
    });
  if (insertRows.length) {
    logger.debug('inserting menu_item_slot');
    return DB.write('menu_item_slot')
      .insert(insertRows)
      .returning('*')
      .transacting(trx)
      .then((slots: IMenuItem_Slot[]) => {
        return slots;
      })
      .catch((error: Error) => {
        throw error;
      });
  }
  return [];
}

export function readMenuItemSlotByMenuItemIds(
  Ids: (number | undefined)[]
): Promise<IMenuItem_Slot[]> {
  return DB.read('menu_item_slot')
    .select('*')
    .whereIn('menu_item_id', Ids as number[])
    .then((rows: IMenuItem_Slot[]) => {
      return rows;
    })
    .catch((error: Error) => {
      throw error;
    });
}
export async function insertItemAddon(
  trx: Knex.Transaction,
  insertRows: IItem_Addon[]
): Promise<IItem_Addon[]> {
  const itemIds = insertRows.map(item => item.menu_item_id);
  await DB.write('item_addon')
    .del()
    .transacting(trx)
    .whereIn('menu_item_id', itemIds as number[])
    .then(addon => {
      logger.debug('Item Addon deleted');
      return addon;
    })
    .catch((error: Error) => {
      throw error;
    });
  logger.debug('inserting mapping');
  return DB.write('item_addon')
    .insert(insertRows)
    .returning('*')
    .transacting(trx)
    .then((addon: IItem_Addon[]) => {
      return addon;
    })
    .catch((error: Error) => {
      throw error;
    });
}

export async function bulkHardDeleteItemAddon(
  trx: Knex.Transaction,
  menu_item_ids: number[]
): Promise<void> {
  await DB.write('item_addon')
    .del()
    .transacting(trx)
    .whereIn('menu_item_id', menu_item_ids)
    .then(addon => {
      logger.debug('Item Addon deleted');
      return addon;
    })
    .catch((error: Error) => {
      throw error;
    });
}
export async function bulkiInsertItemAddon(
  trx: Knex.Transaction,
  insertRows: IItem_Addon[]
): Promise<IItem_Addon[]> {
  logger.debug('inserting mapping');
  return DB.write('item_addon')
    .insert(insertRows)
    .returning('*')
    .transacting(trx)
    .then((addon: IItem_Addon[]) => {
      return addon;
    })
    .catch((error: Error) => {
      throw error;
    });
}
export async function bulkUpdateItemAddon(
  trx: Knex.Transaction,
  insertRows: IItem_Addon[]
): Promise<IItem_Addon[]> {
  const addonIds = insertRows.map(item => item.addon_id);
  await DB.write('item_addon')
    .del()
    .whereIn('addon_id', addonIds as number[])
    .transacting(trx)
    .then(addon => {
      logger.debug('Item Addon deleted');
      return addon;
    })
    .catch((error: Error) => {
      throw error;
    });
  logger.debug('inserting mapping');
  return DB.write('item_addon')
    .insert(insertRows)
    .returning('*')
    .transacting(trx)
    .then((addon: IItem_Addon[]) => {
      return addon;
    })
    .catch((error: Error) => {
      throw error;
    });
}
export async function searchMenuItems(
  searchText?: string,
  filterRestaurantIds?: string[],
  pagination?: IPagination
): Promise<IES_MenuItem[]> {
  // POST /menu_item/_search
  // {
  //   "query": {
  //     "bool": {
  //       "filter": [
  //         {
  //           "terms": {
  //             "restaurant_id": [
  //               "68f5dbbd-2141-422f-9beb-b2e8e13ddabe"
  //             ]
  //           }
  //         }
  //       ],
  //       "must": [
  //         {
  //           "multi_match": {
  //             "query": "Vegge",
  //             "fuzziness": "AUTO",
  //             "fields": [
  //               "name"
  //             ]
  //           }
  //         }
  //       ]
  //     }
  //   }
  // }

  const searchObject: QueryDslQueryContainer = {
    bool: {},
  };
  if (filterRestaurantIds && filterRestaurantIds.length && searchObject.bool) {
    searchObject.bool.filter = [
      {
        terms: {
          restaurant_id: filterRestaurantIds,
        },
      },
    ];
  }
  if (searchText && searchText.length && searchObject.bool) {
    searchObject.bool.must = [
      {
        multi_match: {
          query: searchText,
          fuzziness: 'AUTO',
          fields: ['name'],
        },
      },
    ];
  }
  // searchObject.bool = {
  //   should: [
  //     {
  //       bool: {
  //         must: [
  //           {
  //             terms: {
  //               _id: ['68f5dbbd-2141-422f-9beb-b2e8e13ddabe'],
  //             },
  //           },
  //           {
  //             multi_match: {
  //               query: 'Haldi',
  //               fuzziness: 'AUTO',
  //               fields: ['name', 'cuisine_names'],
  //             },
  //           },
  //         ],
  //       },
  //     },
  //     {
  //       bool: {
  //         must: [
  //           {
  //             terms: {
  //               restaurant_id: ['68f5dbbd-2141-422f-9beb-b2e8e13ddabe'],
  //             },
  //           },
  //           {
  //             multi_match: {
  //               query: 'Vegge',
  //               fuzziness: 'AUTO',
  //               fields: ['name'],
  //             },
  //           },
  //         ],
  //       },
  //     },
  //   ],
  // };

  const result = await query<IES_MenuItem>(
    'menu_item', //'restaurant,menu_item',
    searchObject,
    pagination
  );
  const res: IES_MenuItem[] = [];
  result.map(item => {
    if (item) {
      res.push(item);
    }
  });
  return res;
}
export async function putMenuItemSQS(menu_item: IMenuItem) {
  await esIndexData({
    event: 'MENUITEM',
    action: 'PUT',
    data: {
      id: menu_item.id!,
      restaurant_id: menu_item.restaurant_id!,
      name: menu_item.name!,
      veg_egg_non: menu_item.veg_egg_non!,
      is_spicy: menu_item.is_spicy!,
      serves_how_many: menu_item.serves_how_many!,
      allow_long_distance: menu_item.allow_long_distance!,
    },
  });
}
export async function deleteMenuItemSQS(menu_item_id: number) {
  await esIndexData({
    event: 'MENUITEM',
    action: 'DELETE',
    data: {id: menu_item_id},
  });
}
export function getMenuItemsByPosIds(pos_ids: string[]): Promise<IMenuItem[]> {
  return DB.read('menu_item')
    .whereIn('pos_id', pos_ids)
    .where('is_deleted', 'false')
    .then((result: IMenuItem[]) => {
      return result;
    })
    .catch((error: Error) => {
      throw error;
    });
}

// export async function readMenuItemsAssociatedWithPosForUpdate(
//   trx: Knex.Transaction,
//   pos_ids: string[],
//   restaurant_id: string
// ): Promise<IMenuItem[]> {
//   logger.debug('reading menu items by pos ids and restaurant id', {
//     pos_ids,
//     restaurant_id,
//   });
//   try {
//     const menu_items = await DB.write(menuItemTable.TableName)
//       .select('*')
//       .transacting(trx)
//       .forUpdate()
//       .where({is_deleted: false, restaurant_id: restaurant_id})
//       .whereIn('pos_id', pos_ids);
//     logger.debug('successfully fetched menu items', menu_items);
//     return menu_items;
//   } catch (error) {
//     logger.error('GOT ERROR WHILE FETCHING MENU ITEMS BY POS IDS', error);
//     throw error;
//   }
// }

export async function clearItemAddon(
  trx: Knex.Transaction,
  menu_item_id: number[]
): Promise<IItem_Addon[]> {
  return await DB.write('item_addon')
    .del()
    .returning('*')
    .transacting(trx)
    .whereIn('menu_item_id', menu_item_id)
    .then(addons => {
      logger.debug('Item Addon deleted', addons);
      return addons;
    })
    .catch((error: Error) => {
      throw error;
    });
}

export async function insertItemAddonOnly(
  trx: Knex.Transaction,
  insertRows: IItem_Addon[]
): Promise<IItem_Addon[]> {
  logger.debug('inserting mapping');
  return DB.write('item_addon')
    .insert(insertRows)
    .returning('*')
    .transacting(trx)
    .then((addon: IItem_Addon[]) => {
      return addon;
    })
    .catch((error: Error) => {
      throw error;
    });
}

export async function bulkHardDeleteItemAddonByAddonIds(
  trx: Knex.Transaction,
  addon_ids: number[]
): Promise<IItem_Addon[]> {
  return await DB.write('item_addon')
    .del()
    .returning('*')
    .transacting(trx)
    .whereIn('addon_id', addon_ids)
    .then(addon => {
      logger.debug('Item Addons deleted');
      return addon;
    })
    .catch((error: Error) => {
      throw error;
    });
}

export async function readMenuItemByRestaurantIdForUpdate(
  trx: Knex.Transaction,
  restaurant_id: string
): Promise<IMenuItem[]> {
  logger.debug('Reading Menu Item:', restaurant_id);
  const query = DB.write('menu_item')
    .select('*')
    .where({is_deleted: false, restaurant_id})
    .forUpdate()
    .transacting(trx);
  return await query
    .then((menu_items: IMenuItem[]) => {
      return menu_items;
    })
    .catch((error: Error) => {
      throw error;
    });
}

export async function bulkRemovePosDetailsFromMenuItems(
  trx: Knex.Transaction,
  menu_items_ids: number[]
): Promise<IMenuItem[]> {
  logger.debug('bulk removing pos partner from menu items', menu_items_ids);
  return await DB.write(menuItemTable.TableName)
    .update({pos_id: null, pos_partner: null})
    .returning('*')
    .whereIn(menuItemTable.ColumnNames.id, menu_items_ids)
    .transacting(trx)
    .then((menu_items: IMenuItem[]) => {
      logger.debug(
        'successfully removed pos partner from menu items',
        menu_items
      );
      return menu_items;
    })
    .catch((error: Error) => {
      logger.error(
        'GOT ERROR WHILE REMOVING POS PARTNER FROM MENU ITEMS',
        error
      );
      throw error;
    });
}

export async function readPosMenuItemByRestaurantIdForUpdate(
  trx: Knex.Transaction,
  restaurant_id: string,
  pos_partner: string
): Promise<IMenuItem[]> {
  logger.debug('Reading Menu Item:', restaurant_id);
  const query = DB.write('menu_item')
    .select('*')
    .where({restaurant_id, pos_partner})
    .forUpdate()
    .transacting(trx);
  return await query
    .then((menu_items: IMenuItem[]) => {
      return menu_items;
    })
    .catch((error: Error) => {
      throw error;
    });
}

export async function bulkUpdateMenuSequence(
  updateRows: {id?: number; sequence?: number}[],
  table_name: string
): Promise<{id: number; sequence: number}[]> {
  logger.debug('bulk updating sequence', updateRows);
  const subquery = `
  (select * from json_to_recordset(?)
      as x(
        id int,
        sequence int
      )
    ) as data_table`;
  const result = await DB.write.raw(
    `update ${table_name}
          set
            sequence = data_table.sequence
          from  ${subquery}
          where ${table_name}.id = data_table.id
          RETURNING *
          `,
    [JSON.stringify(updateRows)]
  );
  return result.rows;
}

export function readMenuDiscount(restaurant_id: string) {
  return DB.read
    .select('*')
    .fromRaw(
      `(select
          rs.id as restaurant_id,
          rs.discount_rate,
          rs.discount_updated_at,
          rs.discount_updated_user_id,
          rs.discount_updated_user_type,
          (select
            to_json(array_agg(row_to_json(s)))
          from
            (select
              mc.id as main_category_id,
              mc.name as main_category_name,
              mc.discount_rate,
              mc.discount_updated_at,
              mc.discount_updated_user_id,
              mc.discount_updated_user_type,
              (select
                to_json(array_agg(row_to_json(t)))
              from
                (select
                  sc.id as sub_category_id,
                  sc.name as sub_category_name,
                  sc.discount_rate,
                  sc.discount_updated_at,
                  sc.discount_updated_user_id,
                  sc.discount_updated_user_type,
                  (select
                    to_json(array_agg(row_to_json(u)))
                  from
                    (select
                      mi.id as menu_item_id,
                      mi.name menu_item_name,
                      mi.discount_rate,
                      mi.discount_updated_at,
                      mi.discount_updated_user_id,
                      mi.discount_updated_user_type,
                      mi.price as display_price,
                      mi.price as price,
                      mi.veg_egg_non as veg_egg_non,
                      mi.packing_charges as packing_charges,
                      mi.is_spicy as is_spicy,
                      mi.serves_how_many as serves_how_many,
                      mi.service_charges as service_charges,
                      mi.item_sgst_utgst as item_sgst_utgst,
                      mi.item_cgst as item_cgst,
                      mi.item_igst as item_igst,
                      mi.item_inclusive as item_inclusive,
                      mi.disable as disable,
                      mi.image as image,
                      mi.external_id as external_id,
                      mi.allow_long_distance as allow_long_distance,
                      mi.next_available_after as next_available_after
                    from
                      menu_item as mi
                    where
                      mi.sub_category_id = sc.id
                      and mi.is_deleted = false
                    order by mi.sequence
                    ) as u
                  )as menu_item
                from
                  sub_category as sc
                where
                  sc.main_category_id = mc.id
                  and sc.is_deleted = false
                order by sc.sequence
                ) as t
              )as sub_category
            from
              main_category as mc
            where
              mc.restaurant_id = rs.id
              and mc.is_deleted = false
            order by mc.sequence
            ) as s
          ) as main_category
        from
          restaurant as rs
        ) as a`
    )
    .where({restaurant_id})
    .then((result: IRestaurantMenu[]) => {
      return result[0];
    })
    .catch((error: Error) => {
      throw error;
    });
}

export async function setRestaurantDiscount(
  trx: Knex.Transaction,
  restaurants: {
    restaurant_id: string;
    discount_rate: number;
  }[],
  discount_updated_user_id: string,
  discount_updated_user_type: 'admin' | 'vendor'
) {
  const clear_object = {
    discount_rate: 0,
    discount_updated_at: null,
    discount_updated_user_id: null,
    discount_updated_user_type: null,
  };
  const restaurant_ids = restaurants.map(r => r.restaurant_id);
  const mc_res = await DB.write('main_category')
    .update(clear_object)
    .whereIn('restaurant_id', restaurant_ids)
    .returning('*')
    .transacting(trx);

  const main_category_ids = mc_res.map(res => res.id);

  const sc_res = await DB.write('sub_category')
    .update(clear_object)
    .whereIn('main_category_id', main_category_ids)
    .returning('*')
    .transacting(trx);

  const sub_category_ids = sc_res.map(res => res.id);

  await DB.write('menu_item')
    .update(clear_object)
    .whereIn('sub_category_id', sub_category_ids)
    .returning('*')
    .transacting(trx);

  await DB.write
    .raw(
      `update restaurant
    set
      discount_rate = data_table.discount_rate,
      discount_updated_at = ?,
      discount_updated_user_id = ?,
      discount_updated_user_type = ?
    from
      (select * from json_to_recordset(?)
        as x(
          restaurant_id varchar(255),
        discount_rate NUMERIC(10,2))
      ) as data_table
    where restaurant.id = data_table.restaurant_id
    RETURNING *
    `,
      [
        new Date(),
        discount_updated_user_id,
        discount_updated_user_type,
        JSON.stringify(restaurants),
      ]
    )
    .transacting(trx);
}

export async function setMainCategoryDiscount(
  trx: Knex.Transaction,
  restaurant_id: string,
  main_categoryies: {
    main_category_id: number;
    discount_rate: number;
  }[],
  discount_updated_user_id: string,
  discount_updated_user_type: 'admin' | 'vendor'
) {
  const clear_object = {
    discount_rate: 0,
    discount_updated_at: null,
    discount_updated_user_id: null,
    discount_updated_user_type: null,
  };

  await DB.write('restaurant')
    .update(clear_object)
    .where('id', restaurant_id)
    .returning('*')
    .transacting(trx);

  await DB.write
    .raw(
      `update main_category
    set
      discount_rate = data_table.discount_rate,
      discount_updated_at = ?,
      discount_updated_user_id = ?,
      discount_updated_user_type = ?
    from
      (select * from json_to_recordset(?)
        as x(
          main_category_id int,
        discount_rate NUMERIC(10,2))
      ) as data_table
    where main_category.id = data_table.main_category_id
    RETURNING *
    `,
      [
        new Date(),
        discount_updated_user_id,
        discount_updated_user_type,
        JSON.stringify(main_categoryies),
      ]
    )
    .transacting(trx);

  await DB.write('sub_category')
    .update(clear_object)
    .where(
      DB.write.raw(
        'main_category_id in (select id from main_category where restaurant_id = ?)',
        [restaurant_id]
      )
    )
    .returning('*')
    .transacting(trx);

  await DB.write('menu_item')
    .update(clear_object)
    .where('restaurant_id', restaurant_id)
    .returning('*')
    .transacting(trx);
}

export async function setSubCategoryDiscount(
  trx: Knex.Transaction,
  restaurant_id: string,
  sub_categories: {
    sub_category_id: number;
    discount_rate: number;
  }[],
  discount_updated_user_id: string,
  discount_updated_user_type: 'admin' | 'vendor'
) {
  // const sub_category_ids = sub_categories.map(sc => sc.sub_category_id);
  const clear_object = {
    discount_rate: 0,
    discount_updated_at: null,
    discount_updated_user_id: null,
    discount_updated_user_type: null,
  };
  await DB.write('menu_item')
    .update(clear_object)
    .where('restaurant_id', restaurant_id)
    .returning('*')
    .transacting(trx);

  await DB.write
    .raw(
      `update sub_category
    set
      discount_rate = data_table.discount_rate,
      discount_updated_at = ?,
      discount_updated_user_id = ?,
      discount_updated_user_type = ?
    from
      (select * from json_to_recordset(?)
        as x(
          sub_category_id int,
        discount_rate NUMERIC(10,2))
      ) as data_table
    where sub_category.id = data_table.sub_category_id
    RETURNING *
    `,
      [
        new Date(),
        discount_updated_user_id,
        discount_updated_user_type,
        JSON.stringify(sub_categories),
      ]
    )
    .transacting(trx);

  await DB.write('main_category')
    .update(clear_object)
    .where('restaurant_id', restaurant_id)
    .returning('*')
    .transacting(trx);

  await DB.write('restaurant')
    .update(clear_object)
    .where('id', restaurant_id)
    .returning('*')
    .transacting(trx);
}

export async function setMenuItemDiscount(
  trx: Knex.Transaction,
  restaurant_id: string,
  menu_items: {
    menu_item_id: number;
    discount_rate: number;
  }[],
  discount_updated_user_id: string,
  discount_updated_user_type: 'admin' | 'vendor'
) {
  const clear_object = {
    discount_rate: 0,
    discount_updated_at: null,
    discount_updated_user_id: null,
    discount_updated_user_type: null,
  };

  await DB.write('restaurant')
    .update(clear_object)
    .where('id', restaurant_id)
    .returning('*')
    .transacting(trx);

  const mc_res = await DB.write('main_category')
    .update(clear_object)
    .where('restaurant_id', restaurant_id)
    .returning('*')
    .transacting(trx);

  const mc_ids = mc_res.map(mc => mc.id);

  await DB.write('sub_category')
    .update(clear_object)
    .whereIn('main_category_id', mc_ids)
    .returning('*')
    .transacting(trx);

  await DB.write
    .raw(
      `update menu_item
      set
        discount_rate = data_table.discount_rate,
        discount_updated_at = ?,
        discount_updated_user_id = ?,
        discount_updated_user_type = ?
      from
        (select * from json_to_recordset(?)
          as x(
          menu_item_id int,
          discount_rate NUMERIC(10,2))
        ) as data_table
      where menu_item.id = data_table.menu_item_id
      RETURNING *
      `,
      [
        new Date(),
        discount_updated_user_id,
        discount_updated_user_type,
        JSON.stringify(menu_items),
      ]
    )
    .transacting(trx);
}
