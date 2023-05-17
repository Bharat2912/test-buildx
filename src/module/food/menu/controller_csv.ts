import {Request, Response} from 'express';
import handleErrors from '../../../utilities/controllers/handle_errors';
import Joi from 'joi';
import {joi_restaurant_id} from '../../../utilities/joi_common';
import {
  sendError,
  sendSuccess,
} from '../../../utilities/controllers/handle_response';
import csvtojson from 'csvtojson';
import logger from '../../../utilities/logger/winston_logger';
import {
  arrToCsvRow,
  compareArray,
  Weekdays,
} from '../../../utilities/utilFuncs';

import * as models_csv from './models_csv';
import * as models from './models';
import moment from 'moment';
import {
  bulkInsertMainCategory,
  bulkUpdateMainCategory,
  IMainCategory,
  readMainCategoryByRestaurantIds,
} from './main_category/models';
import {
  bulkInsertSubCategory,
  bulkUpdateSubCategory,
  ISubCategory,
  readSubCategoryByMainCategoryIds,
} from './sub_category/models';
import {
  bulkInsertVariantGroup,
  bulkUpdateVariantGroup,
  IVariantGroup,
  readVariantGroupByMenuIds,
} from './variant_group/models';
import {
  bulkInsertVariant,
  bulkUpdateVariant,
  IVariant,
  readVariantByVariantGroupIds,
} from './variant/models';
import {
  IAddon,
  bulkInsertAddon,
  bulkUpdateAddon,
  readAddonByAddonGroupIds,
} from './addon/models';
import {
  IAddonGroup,
  bulkInsertAddonGroup,
  bulkUpdateAddonGroup,
  readAddonGroupByRestaurantIds,
} from './addon_group/models';
import {
  IItem_AddonGroup,
  bulkInsertItemAddonGroup,
  bulkUpdateItemAddonGroup,
  readItemAddonGroupByItemIds,
} from './item_addon_group/models';
import {getTransaction} from '../../../data/knex';
import ResponseError from '../../../utilities/response_error';
import {getTempFileData} from '../../../utilities/s3_manager';
import {esIndexData} from '../../../utilities/es_manager';

interface IColumnError {
  column_name: string;
  error: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details?: any;
}

//
//  Menu Item
//
const menu_items_cols = {
  restaurant_id: 'Restaurant_Id',

  main_category_id: 'Main_Category_Id',
  main_category_name: 'Main_Category_Name',
  sub_category_id: 'Sub_Category_Id',
  sub_category_name: 'Sub_Category_Name',

  menu_item_id: 'Item_Id',
  name: 'Name',
  description: 'Description',

  parent: 'Parent',

  variant_group_id: 'Variant_Group_Id',
  variant_group_name: 'Variant_Group_Name',
  variant_id: 'Variant_Id',
  variant_is_default: 'Variant_Default_Value',

  in_stock: 'In_Stock',
  price: 'Price',
  veg_egg_non: 'Veg_Egg_Non',
  packing_charges: 'Packing_Charges',
  is_spicy: 'Is_Spicy',
  serves_how_many: 'Serves_How_Many',
  service_charges: 'Service_Charges_(%)',
  item_sgst_utgst: 'Item_SGST_UTGST',
  item_cgst: 'Item_CGST',
  item_igst: 'Item_IGST',
  item_inclusive: 'Item_Inclusive',
  disable: 'Disable',
  is_deleted: 'Delete',
  external_id: 'External_Id',
  allow_long_distance: 'Eligible_For_Long_Distance',

  monday_open_1: 'Monday Open 1',
  monday_close_1: 'Monday Close 1',
  monday_open_2: 'Monday Open 2',
  monday_close_2: 'Monday Close 2',
  monday_open_3: 'Monday Open 3',
  monday_close_3: 'Monday Close 3',
  tuesday_open_1: 'Tuesday Open 1',
  tuesday_close_1: 'Tuesday Close 1',
  tuesday_open_2: 'Tuesday Open 2',
  tuesday_close_2: 'Tuesday Close 2',
  tuesday_open_3: 'Tuesday Open 3',
  tuesday_close_3: 'Tuesday Close 3',
  wednesday_open_1: 'Wednesday Open 1',
  wednesday_close_1: 'Wednesday Close 1',
  wednesday_open_2: 'Wednesday Open 2',
  wednesday_close_2: 'Wednesday Close 2',
  wednesday_open_3: 'Wednesday Open 3',
  wednesday_close_3: 'Wednesday Close 3',
  thursday_open_1: 'Thursday Open 1',
  thursday_close_1: 'Thursday Close 1',
  thursday_open_2: 'Thursday Open 2',
  thursday_close_2: 'Thursday Close 2',
  thursday_open_3: 'Thursday Open 3',
  thursday_close_3: 'Thursday Close 3',
  friday_open_1: 'Friday Open 1',
  friday_close_1: 'Friday Close 1',
  friday_open_2: 'Friday Open 2',
  friday_close_2: 'Friday Close 2',
  friday_open_3: 'Friday Open 3',
  friday_close_3: 'Friday Close 3',
  saturday_open_1: 'Saturday Open 1',
  saturday_close_1: 'Saturday Close 1',
  saturday_open_2: 'Saturday Open 2',
  saturday_close_2: 'Saturday Close 2',
  saturday_open_3: 'Saturday Open 3',
  saturday_close_3: 'Saturday Close 3',
  sunday_open_1: 'Sunday Open 1',
  sunday_close_1: 'Sunday Close 1',
  sunday_open_2: 'Sunday Open 2',
  sunday_close_2: 'Sunday Close 2',
  sunday_open_3: 'Sunday Open 3',
  sunday_close_3: 'Sunday Close 3',
};

function CompareSlotList(
  a1: models.IMenuItem_Slot[],
  a2: models.IMenuItem_Slot[]
) {
  if (!a1 && a2) {
    return false;
  }
  if (a1 && !a2) {
    return false;
  }
  if (!a1 && !a2) {
    return true;
  }
  if (a1 && a2) {
    let same = true;
    a1.map(A1 => {
      const filt = a2.filter(A2 => {
        return (
          // A1.menu_item_id === A2.menu_item_id &&
          A1.weekday === A2.weekday &&
          A1.slot_num === A2.slot_num &&
          A1.open_time === A2.open_time &&
          A1.close_time === A2.close_time
        );
      });
      if (filt.length === 0) {
        same = false;
      }
    });
    if (!same) return same;
    a2.map(A2 => {
      const filt = a1.filter(A1 => {
        return (
          // A1.menu_item_id === A2.menu_item_id &&
          A1.weekday === A2.weekday &&
          A1.slot_num === A2.slot_num &&
          A1.open_time === A2.open_time &&
          A1.close_time === A2.close_time
        );
      });
      if (filt.length === 0) {
        same = false;
      }
    });
    if (!same) return same;
  }
  return true;
}

interface IMenuItemCsvResponse {
  errors?: {[key: string]: IColumnError[]};
  Main_Category?: {
    Created: number;
    Modified: number;
  };
  Sub_Category?: {
    Created: number;
    Modified: number;
  };
  Menu_Item?: {
    Created: number;
    Modified: number;
  };
  Variant_Group?: {
    Created: number;
    Modified: number;
  };
  Variant?: {
    Created: number;
    Modified: number;
  };
}
function getNextSeq(data: {sequence?: number}[]) {
  let max = 0;
  data.map(item => {
    if (item.sequence && item.sequence > max) max = item.sequence;
  });
  return max + 1;
}
async function precessMenuItemCsv(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  CsvRows: any[],
  options: {is_partial: boolean}
): Promise<IMenuItemCsvResponse> {
  const update_seq = !options.is_partial;
  /**
    SELECT setval('addon_id_seq', 1, FALSE);
    SELECT setval('addon_group_id_seq', 1, FALSE);
    SELECT setval('item_variant_id_seq', 1, FALSE);
    SELECT setval('item_variant_group_id_seq', 1, FALSE);
    SELECT setval('menu_item_id_seq', 1, FALSE);
    SELECT setval('sub_category_id_seq', 1, FALSE);
    SELECT setval('main_category_id_seq', 1, FALSE);

    delete from item_addon_group;

    delete from item_addon;
    delete from addon;
    delete from addon_group;

    delete from item_variant;
    delete from item_variant_group;
    delete from menu_item_slot;
    delete from menu_item;
    delete from sub_category;
    delete from main_category;

    select count (*) from restaurant;

    select r.id, (select count(*) from menu_item where restaurant_id = r.id) from restaurant r where status = 'active';

    delete from item_addon_group where menu_item_id in (select id from menu_item where restaurant_id = '68f5dbbd-2141-422f-9beb-b2e8e13ddabe') or addon_group_id in (select id from addon_group where restaurant_id = '68f5dbbd-2141-422f-9beb-b2e8e13ddabe') ;
    delete from addon where addon_group_id in (select id from addon_group where restaurant_id = '68f5dbbd-2141-422f-9beb-b2e8e13ddabe') ;
    delete from addon_group where restaurant_id = '68f5dbbd-2141-422f-9beb-b2e8e13ddabe';
    delete from item_variant  where variant_group_id in (select id from item_variant_group  where menu_item_id in (select id from menu_item where restaurant_id = '68f5dbbd-2141-422f-9beb-b2e8e13ddabe') ) ;
    delete from item_variant_group  where menu_item_id in (select id from menu_item where restaurant_id = '68f5dbbd-2141-422f-9beb-b2e8e13ddabe') ;
    delete from menu_item where restaurant_id = '68f5dbbd-2141-422f-9beb-b2e8e13ddabe';
    delete from sub_category where main_category_id in (select id from main_category where restaurant_id = '68f5dbbd-2141-422f-9beb-b2e8e13ddabe')  ;
    delete from main_category where restaurant_id = '68f5dbbd-2141-422f-9beb-b2e8e13ddabe';
   */
  const cols = menu_items_cols;
  let pkey = 0;
  function getPK() {
    pkey--;
    return pkey;
  }

  const RowPrefix = 'Row_Num_';
  const row_error: {
    [key: string]: IColumnError[];
  } = {};

  // collect Restaurants data from database for all the Restaurant ids in csv file
  const restaurantIds = CsvRows.map(
    (item: {[x: string]: string}) => item[cols.restaurant_id]
  );
  const restaurants = await models_csv.readRestaurantsByIds(restaurantIds);
  // collect Main Categories data from database for all the Restaurant ids in csv file
  const mainCategories = await readMainCategoryByRestaurantIds(restaurantIds);

  // collect Sub Categories data from database for all the  Restaurant ids >> Main Category Ids in csv file
  const mainCategoryIds = mainCategories.map(item => item.id);
  let subCategories = await readSubCategoryByMainCategoryIds(mainCategoryIds);

  // collect Menu Items data from database for all the  Main Category Ids >> Sub Categories ids
  const subCategoryIds = subCategories.map(item => item.id);
  let menuItems = await models.readMenuItemBySubCategoryIds(subCategoryIds);
  // collect All Varient Group from database for all the  Sub Categories ids >> Variant Group Ids
  const menuItemIds = menuItems.map(item => item.id);
  const menuItemSlots = await models.readMenuItemSlotByMenuItemIds(menuItemIds);
  let variantGroups = await readVariantGroupByMenuIds(menuItemIds);
  // collect All Varient from database for all the  Variant Group Ids >> Variants Ids
  const variantGroupIds = variantGroups.map(item => item.id);
  let variants = await readVariantByVariantGroupIds(variantGroupIds);
  logger.debug('restaurants', restaurants.length);
  logger.debug('mainCategories', mainCategories.length);
  logger.debug('subCategory', subCategories.length);
  logger.debug('menuItems', menuItems.length);
  logger.debug('variantGroups', variantGroups.length);
  logger.debug('variants', variants.length);
  logger.debug('menuItemSlots', menuItemSlots.length);

  /***
   *    Processing Parant Item
   */
  const parent_row: models_csv.IMenuItemCsvRow[] = [];
  for (let cntr = 0; cntr < CsvRows.length; cntr++) {
    const parent_csv = <models_csv.IMenuItemCsvRow>{};
    const csv_row = CsvRows[cntr];

    const errors: IColumnError[] = [];
    try {
      // Put data from csv column in interface and validate
      parent_csv.restaurant_id = csv_row[cols.restaurant_id];
      parent_csv.parent = csv_row[cols.parent].toLowerCase();
      parent_csv.parent_id = csv_row[cols.parent].substr(
        1,
        csv_row[cols.parent].length
      );
      parent_csv.csv_index = cntr;
      parent_csv.menu_item_id = Number(csv_row[cols.menu_item_id]);
      parent_csv.menu_item_name = csv_row[cols.name];
      parent_csv.main_category_id = Number(csv_row[cols.main_category_id]);
      parent_csv.main_category_name = csv_row[cols.main_category_name];
      parent_csv.sub_category_id = Number(csv_row[cols.sub_category_id]);
      parent_csv.sub_category_name = csv_row[cols.sub_category_name];
      parent_csv.description = csv_row[cols.description];

      if (parent_csv.parent?.startsWith('v')) {
        // if row is not parent skip it
        // logger.debug('skipping.....', csv_row);
        continue;
      } else if (!parent_csv.parent?.startsWith('i')) {
        errors.push({
          column_name: cols.parent,
          error: 'invalid',
          details: `Data:[${parent_csv.parent}]`,
        });
        throw `Parent', error: 'invalid ${parent_csv.parent?.toLowerCase()}`;
      }

      const menu_item_slots: models.IMenuItem_Slot[] = [];
      Weekdays.map(day => {
        const weekday_slots: models.IMenuItem_Slot[] = [];
        for (let slot_num = 1; slot_num <= 3; slot_num++) {
          let open_time = csv_row[`${day} Open ${slot_num}`];
          let close_time = csv_row[`${day} Close ${slot_num}`];
          if (!open_time && close_time) {
            // check if open and close both time are not provided
            errors.push({
              column_name: `${day} Open ${slot_num}`,
              error: 'Empty',
            });
          } else if (open_time && !close_time) {
            // check if open and close both time are not provided
            errors.push({
              column_name: `${day} Close ${slot_num}`,
              error: 'Empty',
            });
          } else if (open_time && close_time) {
            open_time = ('0000' + open_time).slice(-4);
            close_time = ('0000' + close_time).slice(-4);
            if (!moment(open_time, 'kkmm', true).isValid()) {
              // check if open time is valid 'kkmm' format
              errors.push({
                column_name: `${day} Open ${slot_num}`,
                error: 'invalid Time: ' + open_time,
                details: `Data:[${open_time}]`,
              });
            } else if (!moment(close_time, 'kkmm', true).isValid()) {
              // check if close time is valid 'kkmm' format
              errors.push({
                column_name: `${day} Close ${slot_num}`,
                error: 'invalid Time: ' + close_time,
                details: `Data:[${close_time}]`,
              });
            } else if (+open_time >= +close_time) {
              // check if close time is not greater than open time
              errors.push({
                column_name: `${day} Open/Close ${slot_num}`,
                error: 'open time is not less than close time ',
                details: `Open Time:[${open_time}]  -  Close Time:[${close_time}]`,
              });
            } else {
              weekday_slots.push({
                weekday: day.toLowerCase(),
                slot_num,
                open_time: +open_time,
                close_time: +close_time,
              });
            }
          }
        }
        // check if slots of one day dose not overlap or conflict with other slot of same day
        for (let slot_num = 0; slot_num < weekday_slots.length; slot_num++) {
          for (
            let last_slot_num = 0;
            last_slot_num < weekday_slots.length;
            last_slot_num++
          ) {
            if (last_slot_num !== slot_num) {
              if (
                (weekday_slots[last_slot_num].open_time <=
                  weekday_slots[slot_num].open_time &&
                  weekday_slots[last_slot_num].close_time >=
                    weekday_slots[slot_num].open_time) ||
                (weekday_slots[last_slot_num].open_time <=
                  weekday_slots[slot_num].close_time &&
                  weekday_slots[last_slot_num].close_time >=
                    weekday_slots[slot_num].close_time)
              ) {
                errors.push({
                  column_name: `${day} Slots ${last_slot_num + 1} & ${
                    slot_num + 1
                  }`,
                  error: 'Slots Time Conflict',
                  details: `
                      Slot:${last_slot_num + 1} Close Time: ${
                    weekday_slots[last_slot_num].close_time
                  }
                      Slot:${slot_num + 1} Open Time: ${
                    weekday_slots[slot_num].open_time
                  }
                    `,
                });
              }
            }
          }
        }
        menu_item_slots.push(...weekday_slots);
      });
      parent_csv.menu_item_slots = menu_item_slots;

      const foundParents = parent_row.filter(prnt => {
        return prnt.parent_id === parent_csv.parent_id;
      });
      if (foundParents.length > 0) {
        // if Parent id is present means parentid is duplicate
        errors.push({
          column_name: cols.parent,
          error: 'duplicate',
          details: `Duplicate Parent Row ${foundParents[0].csv_index + 2}`,
        });
      }
      /***
       * Restaurant ID
       */
      if (!parent_csv.restaurant_id) {
        errors.push({column_name: cols.restaurant_id, error: 'empty'});
      }
      const foundRestaurant = restaurants.filter(
        rest => parent_csv.restaurant_id && rest.id === parent_csv.restaurant_id
      )[0];
      if (!foundRestaurant) {
        // Restaurant not found for restaurant_id in csv file it is invalid
        errors.push({
          column_name: cols.restaurant_id,
          error: 'invalid',
          details: `Data:[${parent_csv.restaurant_id}]`,
        });
      }

      /***
       * Item Name
       */
      if (!parent_csv.menu_item_name) {
        errors.push({column_name: cols.name, error: 'empty'});
      }

      /***
       * Main Category Name
       */
      if (!parent_csv.main_category_name) {
        errors.push({column_name: cols.main_category_name, error: 'empty'});
      }

      /***
       * SUB CATEGORY
       */
      if (parent_csv.sub_category_id && !parent_csv.sub_category_name) {
        // if subcategory name is not present while id is present this is error
        errors.push({
          column_name: cols.sub_category_name,
          error: 'empty',
          details: `Data:[${parent_csv.sub_category_id}]`,
        });
      }
      if (!parent_csv.sub_category_name) {
        // if sub category name is not provided by default it is "nota"
        parent_csv.sub_category_name = 'nota';
      }

      //collect all other data for parent
      // if (!['0', '1'].includes(csv_row[cols.in_stock])) {
      //   errors.push({column_name: 'in_stock', error: 'empty/invalid'});
      // } else {
      //   csv_row[cols.in_stock] = csv_row[cols.in_stock] === '1' ? true : false;
      // }
      // parent_csv.in_stock = csv_row[cols.in_stock];

      if (!csv_row[cols.price] || isNaN(csv_row[cols.price])) {
        errors.push({
          column_name: cols.price,
          error: 'invalid/empty',
          details: `Data:[${csv_row[cols.price]}]`,
        });
      } else {
        csv_row[cols.price] = parseFloat(csv_row[cols.price]);
        if (csv_row[cols.price] <= 0) {
          errors.push({
            column_name: cols.price,
            error: 'Zero/Less then zero',
            details: `Data:[${csv_row[cols.price]}]`,
          });
        }
      }
      parent_csv.price = csv_row[cols.price];

      csv_row[cols.veg_egg_non] = csv_row[cols.veg_egg_non].toLowerCase();
      if (!['veg', 'egg', 'non-veg'].includes(csv_row[cols.veg_egg_non])) {
        errors.push({
          column_name: cols.veg_egg_non,
          error: 'not in veg / egg / non-veg',
          details: `Data:[${csv_row[cols.veg_egg_non]}]`,
        });
      }
      parent_csv.veg_egg_non = csv_row[cols.veg_egg_non];

      if (!csv_row[cols.packing_charges]) csv_row[cols.packing_charges] = 0;
      if (isNaN(csv_row[cols.packing_charges])) {
        errors.push({
          column_name: cols.packing_charges,
          error: 'Not number',
          details: `Data:[${csv_row[cols.packing_charges]}]`,
        });
      } else {
        csv_row[cols.packing_charges] = parseFloat(
          csv_row[cols.packing_charges]
        );
      }
      parent_csv.packing_charges = csv_row[cols.packing_charges];

      if (!['0', '1'].includes(csv_row[cols.is_spicy])) {
        errors.push({
          column_name: cols.is_spicy,
          error: 'empty/invalid Not [ 0 / 1 ]',
          details: `Data:[${csv_row[cols.is_spicy]}]`,
        });
      } else {
        csv_row[cols.is_spicy] = csv_row[cols.is_spicy] === '1' ? true : false;
      }
      parent_csv.is_spicy = csv_row[cols.is_spicy];

      if (!csv_row[cols.serves_how_many]) csv_row[cols.serves_how_many] = 1;
      if (isNaN(csv_row[cols.serves_how_many])) {
        errors.push({
          column_name: cols.serves_how_many,
          error: 'Not number',
          details: `Data:[${parent_csv.serves_how_many}]`,
        });
      } else {
        csv_row[cols.serves_how_many] = Number(csv_row[cols.serves_how_many]);
      }
      parent_csv.serves_how_many = csv_row[cols.serves_how_many];

      if (!csv_row[cols.service_charges]) csv_row[cols.service_charges] = 0;
      if (isNaN(csv_row[cols.service_charges])) {
        errors.push({
          column_name: cols.service_charges,
          error: 'Not number',
          details: `Data:[${parent_csv.service_charges}]`,
        });
      } else {
        csv_row[cols.service_charges] = parseFloat(
          csv_row[cols.service_charges]
        );
      }
      parent_csv.service_charges = csv_row[cols.service_charges];

      if (!csv_row[cols.item_sgst_utgst]) csv_row[cols.item_sgst_utgst] = 0;
      if (isNaN(csv_row[cols.item_sgst_utgst])) {
        errors.push({
          column_name: cols.item_sgst_utgst,
          error: 'Not number',
          details: `Data:[${parent_csv.item_sgst_utgst}]`,
        });
      } else {
        csv_row[cols.item_sgst_utgst] = parseFloat(
          csv_row[cols.item_sgst_utgst]
        );
      }
      parent_csv.item_sgst_utgst = csv_row[cols.item_sgst_utgst];

      if (!csv_row[cols.item_cgst]) csv_row[cols.item_cgst] = 0;
      if (isNaN(csv_row[cols.item_cgst])) {
        errors.push({
          column_name: cols.item_cgst,
          error: 'Not number',
          details: `Data:[${parent_csv.item_cgst}]`,
        });
      } else {
        csv_row[cols.item_cgst] = parseFloat(csv_row[cols.item_cgst]);
      }
      parent_csv.item_cgst = csv_row[cols.item_cgst];

      if (!csv_row[cols.item_igst]) csv_row[cols.item_igst] = 0;
      if (isNaN(csv_row[cols.item_igst])) {
        errors.push({
          column_name: cols.item_igst,
          error: 'Not number',
          details: `Data:[${parent_csv.item_igst}]`,
        });
      } else {
        csv_row[cols.item_igst] = parseFloat(csv_row[cols.item_igst]);
      }
      parent_csv.item_igst = csv_row[cols.item_igst];

      if (!['', '0', '1'].includes(csv_row[cols.item_inclusive])) {
        errors.push({
          column_name: cols.item_inclusive,
          error: 'empty/invalid Not [ "empty" / 0 / 1 ]',
          details: `Data:[${parent_csv.item_inclusive}]`,
        });
      } else {
        csv_row[cols.item_inclusive] =
          csv_row[cols.item_inclusive] === '1' ? true : false;
      }
      parent_csv.item_inclusive = csv_row[cols.item_inclusive];

      if (!['', '0', '1'].includes(csv_row[cols.disable])) {
        errors.push({
          column_name: cols.disable,
          error: 'empty/invalid Not [ "empty" / 0 / 1 ]',
          details: `Data:[${parent_csv.disable}]`,
        });
      } else {
        csv_row[cols.disable] = csv_row[cols.disable] === '1' ? true : false;
      }
      parent_csv.disable = csv_row[cols.disable];

      if (!['', '0', '1'].includes(csv_row[cols.is_deleted])) {
        errors.push({
          column_name: cols.is_deleted,
          error: 'empty/invalid Not [ "empty" / 0 / 1 ]',
          details: `Data:[${parent_csv.is_deleted}]`,
        });
      } else {
        csv_row[cols.is_deleted] =
          csv_row[cols.is_deleted] === '1' ? true : false;
      }
      parent_csv.is_deleted = csv_row[cols.is_deleted];

      if (!['', '0', '1'].includes(csv_row[cols.allow_long_distance])) {
        errors.push({
          column_name: cols.allow_long_distance,
          error: 'empty/invalid Not [ "empty" / 0 / 1 ]',
          details: `Data:[${parent_csv.allow_long_distance}]`,
        });
      } else {
        csv_row[cols.allow_long_distance] =
          csv_row[cols.allow_long_distance] === '1' ? true : false;
      }
      parent_csv.allow_long_distance = csv_row[cols.allow_long_distance];

      if (!csv_row[cols.external_id]) csv_row[cols.external_id] = null;
      parent_csv.external_id = csv_row[cols.external_id];

      if (!errors.length) parent_row.push(parent_csv);
    } catch (error) {
      logger.error('logger' + RowPrefix + parent_csv.csv_index, error);
      if (!error) {
        errors.push({column_name: 'N/A', error: 'Server Error'});
      }
    }
    row_error[RowPrefix + parent_csv.csv_index] = errors;
  }

  /***
   *    Process Main Category for each parent csv row
   */
  const mc_id_seq: {id: number; sequence: number}[] = [];
  for (let cntr = 0; cntr < parent_row.length; cntr++) {
    const parent_csv = parent_row[cntr];
    // Skip this csv-row if already has error from previous loop
    if (row_error[RowPrefix + parent_csv.csv_index].length) continue;
    const errors: IColumnError[] = [];

    try {
      // If id not provided check for id by name
      if (!parent_csv.main_category_id) {
        const foundMainCategory = mainCategories.filter(
          catg =>
            catg.restaurant_id === parent_csv.restaurant_id &&
            catg.name === parent_csv.main_category_name
        )[0];
        // if found id for category update in csv row name
        if (foundMainCategory) {
          parent_csv.main_category_id = foundMainCategory.id;
          logger.debug('Got Main Catg Id', parent_csv.main_category_name);
        }
      }

      // Check if main category id is still empty after fetching by name
      if (!parent_csv.main_category_id) {
        // if id is still empty it means it is a new record
        // saved this to Menu-JSON for refference to following rows with same name with flag "create" new
        parent_csv.main_category_id = getPK();
        // parent_csv.action_mc = 'create';
        let max = 0;
        if (update_seq) {
          max = getNextSeq(mc_id_seq);
          mc_id_seq.push({id: parent_csv.main_category_id, sequence: max});
        } else {
          max = getNextSeq(mainCategories);
          mc_id_seq.push({id: parent_csv.main_category_id, sequence: max});
        }
        mainCategories.push({
          id: parent_csv.main_category_id,
          restaurant_id: parent_csv.restaurant_id,
          name: parent_csv.main_category_name,
          sequence: max,
          created_at: new Date(),
          updated_at: new Date(),
        });
      } else {
        // find record from Menu-JSON by id
        const foundMainCategory = mainCategories.filter(
          catg => catg.id === parent_csv.main_category_id
        )[0];
        if (!foundMainCategory) {
          // if no record found : it means id is not in database or deleted aka:invalid
          errors.push({
            column_name: cols.main_category_id,
            error: 'invalid',
            details: `Data:[${parent_csv.main_category_id}]`,
          });
        } else {
          // if record found : check if Data is may be modiifed
          if (update_seq) {
            const foundseq = mc_id_seq.find(
              item => item.id === foundMainCategory.id
            );
            if (!foundseq) {
              const max = getNextSeq(mc_id_seq);
              mc_id_seq.push({id: foundMainCategory.id!, sequence: max});
            }
          }
          if (foundMainCategory.name !== parent_csv.main_category_name) {
            // if data is modified
            // chack if it is already medified in previous csv-row
            // ie: In database it was [South-india] then in csv-row-3: it became [South-Indian] and again in csv-row-5 it chaned to [South-Dish]
            if (foundMainCategory.updated_at) {
              errors.push({
                column_name: cols.main_category_id,
                error: 'Multiple Update',
                details: `Previous:[${foundMainCategory.name}]  -  Current:[${parent_csv.main_category_name}]`,
              });
            } else {
              // If data is being updated first time
              // sync changes with Menu-JSON and add flag for "update"
              // parent_csv.action_mc = 'update';
              foundMainCategory.name = parent_csv.main_category_name;
              foundMainCategory.updated_at = new Date();
              logger.debug('update main catg', parent_csv.main_category_name);
            }
          }
        }
      }
    } catch (error) {
      logger.error(RowPrefix + parent_csv.csv_index, error);
      errors.push({column_name: 'N/A', error: 'Server Error'});
    }
    // Push all the errors from this loop to csv-row index
    row_error[RowPrefix + parent_csv.csv_index] = errors;
  }
  mainCategories.map(mc => {
    const foundseq = mc_id_seq.find(item => item.id === mc.id);
    if (foundseq && foundseq.sequence !== mc.sequence) {
      // console.log(
      //   `Main Seq ${mc.id} new:${foundseq.sequence} old:${mc.sequence}`
      // );
      mc.sequence = foundseq.sequence;
      if (!mc.updated_at) {
        mc.updated_at = new Date();
      }
    }
  });

  /***
   *    Process Sub Category for each parent csv-row
   */
  const sc_id_seq: {mc_id: number; id: number; sequence: number}[] = [];
  for (let cntr = 0; cntr < parent_row.length; cntr++) {
    const parent_csv = parent_row[cntr];
    // Skip this csv-row if already has error from previous loop
    if (row_error[RowPrefix + parent_csv.csv_index].length) continue;
    const errors: IColumnError[] = [];
    try {
      // If id not provided check for id by name
      if (!parent_csv.sub_category_id) {
        const foundSubCategory = subCategories.filter(
          catg =>
            catg.main_category_id === parent_csv.main_category_id &&
            catg.name === parent_csv.sub_category_name
        )[0];
        // if found id for category update in csv row name
        if (foundSubCategory) {
          parent_csv.sub_category_id = foundSubCategory.id;
          logger.debug('Got Sub Catg Id', parent_csv.sub_category_name);
        }
      }
      // Check if sub category id is still empty after fetching by name
      if (!parent_csv.sub_category_id) {
        // if id is still empty it means it is a new record
        // saved this to Menu-JSON for refference to following rows with same name with flag "create" new
        parent_csv.sub_category_id = getPK();
        // parent_csv.action_sc = 'create';
        let max = 0;
        if (update_seq) {
          const sc_mc_seq = sc_id_seq.filter(
            item => item.mc_id === parent_csv.main_category_id
          );
          max = getNextSeq(sc_mc_seq);
          sc_id_seq.push({
            id: parent_csv.sub_category_id!,
            mc_id: parent_csv.main_category_id!,
            sequence: max,
          });
        } else {
          const mc_scs = subCategories.filter(
            item => item.main_category_id === parent_csv.main_category_id
          );
          max = getNextSeq(mc_scs);
          sc_id_seq.push({
            id: parent_csv.sub_category_id!,
            mc_id: parent_csv.main_category_id!,
            sequence: max,
          });
        }
        subCategories.push({
          id: parent_csv.sub_category_id,
          main_category_id: parent_csv.main_category_id,
          name: parent_csv.sub_category_name,
          sequence: max,
          created_at: new Date(),
          updated_at: new Date(),
        });
      } else {
        // find record from Menu-JSON by id
        const foundSubCategory = subCategories.filter(
          catg => catg.id === parent_csv.sub_category_id
        )[0];
        if (!foundSubCategory) {
          // if no record found : it means id is not in database or deleted aka:invalid
          errors.push({
            column_name: cols.sub_category_id,
            error: 'invalid',
            details: `Data:[${parent_csv.sub_category_id}]`,
          });
        } else {
          // if record found : check if Data is may be modiifed
          if (update_seq) {
            const foundseq = sc_id_seq.find(
              item => item.id === foundSubCategory.id
            );
            if (!foundseq) {
              const sc_mc_seq = sc_id_seq.filter(
                item => item.mc_id === foundSubCategory.main_category_id
              );
              const max = getNextSeq(sc_mc_seq);
              sc_id_seq.push({
                id: foundSubCategory.id!,
                mc_id: foundSubCategory.main_category_id!,
                sequence: max,
              });
            }
          }
          if (
            foundSubCategory.name !== parent_csv.sub_category_name ||
            foundSubCategory.main_category_id !== parent_csv.main_category_id
          ) {
            // if data is modified
            // chack if it is already medified in previous csv-row
            // ie: In database it was [South-india] then in csv-row-3: it became [South-Indian] and again in csv-row-5 it chaned to [South-Dish]
            if (foundSubCategory.updated_at) {
              errors.push({
                column_name: cols.sub_category_name,
                error: 'Multiple Update',
                details: `
                Category Id: Previous:[${foundSubCategory.main_category_id}]  -  Current:[${parent_csv.main_category_id}]
                Name: Previous:[${foundSubCategory.name}]  -  Current:[${parent_csv.sub_category_name}]
                `,
              });
            } else {
              // If data is being updated first time
              // sync changes with Menu-JSON and add flag for "update"
              // parent_csv.action_sc = 'update';
              foundSubCategory.name = parent_csv.sub_category_name;
              foundSubCategory.updated_at = new Date();
              logger.debug('update sub catg', parent_csv.sub_category_name);
            }
          }
        }
      }
    } catch (error) {
      logger.error(RowPrefix + parent_csv.csv_index, error);
      errors.push({column_name: 'N/A', error: 'Server Error'});
    }
    // Push all the errors from this loop to csv-row index
    row_error[RowPrefix + parent_csv.csv_index] = errors;
  }
  subCategories.map(sc => {
    const foundseq = sc_id_seq.find(item => item.id === sc.id);
    if (foundseq && foundseq.sequence !== sc.sequence) {
      // console.log(
      //   `Sub Seq ${sc.id} new:${foundseq.sequence} old:${sc.sequence}`
      // );
      sc.sequence = foundseq.sequence;
      if (!sc.updated_at) {
        sc.updated_at = new Date();
      }
    }
  });

  /***
   *    Process Menu Items for each parent csv-row
   */
  const mi_id_seq: {sc_id: number; id: number; sequence: number}[] = [];
  for (let cntr = 0; cntr < parent_row.length; cntr++) {
    const parent_csv = parent_row[cntr];
    // Skip this csv-row if already has error from previous loop
    if (row_error[RowPrefix + parent_csv.csv_index].length) continue;
    const errors: IColumnError[] = [];
    try {
      // If id not provided check for id by name
      if (!parent_csv.menu_item_id) {
        const foundMenuItem = menuItems.filter(
          catg =>
            catg.sub_category_id === parent_csv.sub_category_id &&
            catg.name === parent_csv.menu_item_name
        )[0];
        // if found id for menuItem update in csv row name

        if (foundMenuItem) {
          parent_csv.menu_item_id = foundMenuItem.id;
          logger.debug('Got Id of ', parent_csv.menu_item_name);
        }
      }
      // Check if menu item id is still empty after fetching by name
      if (!parent_csv.menu_item_id) {
        // if id is still empty it means it is a new record
        // saved this to Menu-JSON for refference to following rows with same name with flag "create" new
        // parent_csv.action_mi = 'create';
        parent_csv.menu_item_id = getPK();
        let max = 0;
        if (update_seq) {
          const mi_sc_seq = mi_id_seq.filter(
            item => item.sc_id === parent_csv.sub_category_id
          );
          max = getNextSeq(mi_sc_seq);
          mi_id_seq.push({
            id: parent_csv.menu_item_id!,
            sc_id: parent_csv.sub_category_id!,
            sequence: max,
          });
        } else {
          const sc_mis = subCategories.filter(
            item => item.main_category_id === parent_csv.main_category_id
          );
          max = getNextSeq(sc_mis);
          mi_id_seq.push({
            id: parent_csv.menu_item_id!,
            sc_id: parent_csv.sub_category_id!,
            sequence: max,
          });
        }
        menuItems.push({
          id: parent_csv.menu_item_id,
          restaurant_id: parent_csv.restaurant_id,
          name: parent_csv.menu_item_name,
          sub_category_id: parent_csv.sub_category_id,
          description: parent_csv.description,
          in_stock: parent_csv.in_stock,
          price: parent_csv.price,
          veg_egg_non: parent_csv.veg_egg_non,
          packing_charges: parent_csv.packing_charges,
          is_spicy: parent_csv.is_spicy,
          serves_how_many: parent_csv.serves_how_many,
          service_charges: parent_csv.service_charges,
          item_sgst_utgst: parent_csv.item_sgst_utgst,
          item_cgst: parent_csv.item_cgst,
          item_igst: parent_csv.item_igst,
          item_inclusive: parent_csv.item_inclusive,
          disable: parent_csv.disable,
          is_deleted: parent_csv.is_deleted,
          external_id: parent_csv.external_id,
          allow_long_distance: parent_csv.allow_long_distance,
          menu_item_slots: parent_csv.menu_item_slots,
          sequence: max,
          created_at: new Date(),
          updated_at: new Date(),
        });
      } else {
        // find record from Menu-JSON by id
        const foundMenuItem = menuItems.filter(
          catg => catg.id === parent_csv.menu_item_id
        )[0];
        if (!foundMenuItem) {
          // if no record found : it means id is not in database or deleted aka:invalid
          errors.push({
            column_name: cols.menu_item_id,
            error: 'invalid',
            details: `Data:[${parent_csv.menu_item_id}]`,
          });
        } else {
          if (update_seq) {
            const foundseq = mi_id_seq.find(
              item => item.id === foundMenuItem.id
            );
            if (!foundseq) {
              const mi_sc_seq = mi_id_seq.filter(
                item => item.sc_id === foundMenuItem.sub_category_id
              );
              const max = getNextSeq(mi_sc_seq);
              mi_id_seq.push({
                id: foundMenuItem.id!,
                sc_id: foundMenuItem.sub_category_id!,
                sequence: max,
              });
            }
          }
          // if record found : check if Data is may be modiifed
          foundMenuItem.menu_item_slots = menuItemSlots.filter(
            item => item.menu_item_id === foundMenuItem.id
          );
          if (
            foundMenuItem.name !== parent_csv.menu_item_name ||
            foundMenuItem.sub_category_id !== parent_csv.sub_category_id ||
            foundMenuItem.description !== parent_csv.description ||
            foundMenuItem.in_stock !== parent_csv.in_stock ||
            foundMenuItem.price !== parent_csv.price ||
            foundMenuItem.veg_egg_non !== parent_csv.veg_egg_non ||
            foundMenuItem.packing_charges !== parent_csv.packing_charges ||
            foundMenuItem.is_spicy !== parent_csv.is_spicy ||
            foundMenuItem.serves_how_many !== parent_csv.serves_how_many ||
            foundMenuItem.service_charges !== parent_csv.service_charges ||
            foundMenuItem.item_sgst_utgst !== parent_csv.item_sgst_utgst ||
            foundMenuItem.item_cgst !== parent_csv.item_cgst ||
            foundMenuItem.item_igst !== parent_csv.item_igst ||
            foundMenuItem.item_inclusive !== parent_csv.item_inclusive ||
            foundMenuItem.disable !== parent_csv.disable ||
            parent_csv.is_deleted ||
            !CompareSlotList(
              foundMenuItem.menu_item_slots,
              parent_csv.menu_item_slots
            ) ||
            foundMenuItem.external_id !== parent_csv.external_id ||
            foundMenuItem.allow_long_distance !== parent_csv.allow_long_distance
          ) {
            // if data is modified
            // chack if it is already medified in previous csv-row
            // ie: In database it was [South-india] then in csv-row-3: it became [South-Indian] and again in csv-row-5 it chaned to [South-Dish]
            if (foundMenuItem.updated_at) {
              const err: IColumnError = {
                column_name: 'Menu Item',
                error: 'Multiple Updates',
                details: {},
              };

              if (foundMenuItem.name !== parent_csv.menu_item_name) {
                err.details.name = {
                  new: parent_csv.menu_item_name,
                  old: foundMenuItem.name,
                };
              } else {
                err.details.name = foundMenuItem.name;
              }
              if (foundMenuItem.sub_category_id !== parent_csv.sub_category_id)
                err.details.sub_category_id = {
                  new: parent_csv.sub_category_id,
                  old: foundMenuItem.sub_category_id,
                };
              if (foundMenuItem.description !== parent_csv.description)
                err.details.description = {
                  new: parent_csv.description,
                  old: foundMenuItem.description,
                };
              if (foundMenuItem.in_stock !== parent_csv.in_stock)
                err.details.in_stock = {
                  new: parent_csv.in_stock,
                  old: foundMenuItem.in_stock,
                };
              if (foundMenuItem.price !== parent_csv.price)
                err.details.price = {
                  new: parent_csv.price,
                  old: foundMenuItem.price,
                };
              if (foundMenuItem.veg_egg_non !== parent_csv.veg_egg_non)
                err.details.veg_egg_non = {
                  new: parent_csv.veg_egg_non,
                  old: foundMenuItem.veg_egg_non,
                };
              if (foundMenuItem.packing_charges !== parent_csv.packing_charges)
                err.details.packing_charges = {
                  new: parent_csv.packing_charges,
                  old: foundMenuItem.packing_charges,
                };
              if (foundMenuItem.is_spicy !== parent_csv.is_spicy)
                err.details.is_spicy = {
                  new: parent_csv.is_spicy,
                  old: foundMenuItem.is_spicy,
                };
              if (foundMenuItem.serves_how_many !== parent_csv.serves_how_many)
                err.details.serves_how_many = {
                  new: parent_csv.serves_how_many,
                  old: foundMenuItem.serves_how_many,
                };
              if (foundMenuItem.service_charges !== parent_csv.service_charges)
                err.details.service_charges = {
                  new: parent_csv.service_charges,
                  old: foundMenuItem.service_charges,
                };
              if (foundMenuItem.item_sgst_utgst !== parent_csv.item_sgst_utgst)
                err.details.item_sgst_utgst = {
                  new: parent_csv.item_sgst_utgst,
                  old: foundMenuItem.item_sgst_utgst,
                };
              if (foundMenuItem.item_cgst !== parent_csv.item_cgst)
                err.details.item_cgst = {
                  new: parent_csv.item_cgst,
                  old: foundMenuItem.item_cgst,
                };
              if (foundMenuItem.item_igst !== parent_csv.item_igst)
                err.details.item_igst = {
                  new: parent_csv.item_igst,
                  old: foundMenuItem.item_igst,
                };
              if (foundMenuItem.item_inclusive !== parent_csv.item_inclusive)
                err.details.item_inclusive = {
                  new: parent_csv.item_inclusive,
                  old: foundMenuItem.item_inclusive,
                };
              if (foundMenuItem.disable !== parent_csv.disable)
                err.details.disable = {
                  new: parent_csv.disable,
                  old: foundMenuItem.disable,
                };
              if (foundMenuItem.external_id !== parent_csv.external_id)
                err.details.external_id = {
                  new: parent_csv.external_id,
                  old: foundMenuItem.external_id,
                };
              if (
                foundMenuItem.allow_long_distance !==
                parent_csv.allow_long_distance
              )
                err.details.allow_long_distance = {
                  new: parent_csv.allow_long_distance,
                  old: foundMenuItem.allow_long_distance,
                };
              errors.push(err);
            } else {
              // If data is being updated first time
              // sync changes with Menu-JSON and add flag for "update"
              // parent_csv.action_mi = 'update';
              foundMenuItem.name = parent_csv.menu_item_name;
              foundMenuItem.sub_category_id = parent_csv.sub_category_id;
              foundMenuItem.description = parent_csv.description;
              foundMenuItem.in_stock = parent_csv.in_stock;
              foundMenuItem.price = parent_csv.price;
              foundMenuItem.veg_egg_non = parent_csv.veg_egg_non;
              foundMenuItem.packing_charges = parent_csv.packing_charges;
              foundMenuItem.is_spicy = parent_csv.is_spicy;
              foundMenuItem.serves_how_many = parent_csv.serves_how_many;
              foundMenuItem.service_charges = parent_csv.service_charges;
              foundMenuItem.item_sgst_utgst = parent_csv.item_sgst_utgst;
              foundMenuItem.item_cgst = parent_csv.item_cgst;
              foundMenuItem.item_igst = parent_csv.item_igst;
              foundMenuItem.item_inclusive = parent_csv.item_inclusive;
              foundMenuItem.disable = parent_csv.disable;
              foundMenuItem.is_deleted = parent_csv.is_deleted;
              foundMenuItem.external_id = parent_csv.external_id;
              foundMenuItem.allow_long_distance =
                parent_csv.allow_long_distance;
              foundMenuItem.menu_item_slots = parent_csv.menu_item_slots;
              foundMenuItem.updated_at = new Date();
              logger.debug('update Menu Item', parent_csv.menu_item_name);
            }
          }
        }
      }
    } catch (error) {
      logger.error(RowPrefix + parent_csv.csv_index, error);
      errors.push({column_name: 'N/A', error: 'Server Error'});
    }
    // Push all the errors from this loop to csv-row index
    row_error[RowPrefix + parent_csv.csv_index] = errors;
  }
  menuItems.map(mi => {
    const foundseq = mi_id_seq.find(item => item.id === mi.id);
    if (foundseq && foundseq.sequence !== mi.sequence) {
      // console.log(
      //   `item Seq ${mi.id} new:${foundseq.sequence} old:${mi.sequence}`
      // );
      mi.sequence = foundseq.sequence;
      if (!mi.updated_at) {
        mi.updated_at = new Date();
        mi.is_deleted = false;
      }
    }
  });

  /***
   *    Processing Varients
   */
  const variant_row: models_csv.IItemVariantCsvRow[] = [];
  for (let cntr = 0; cntr < CsvRows.length; cntr++) {
    const variant_csv = <models_csv.IItemVariantCsvRow>{};
    const csv_row = CsvRows[cntr];
    const errors: IColumnError[] = [];

    try {
      if (CsvRows[cntr].errors && CsvRows[cntr].errors.length) continue;
      variant_csv.parent = csv_row[cols.parent].toLowerCase();
      variant_csv.parent_id = csv_row[cols.parent].substr(
        1,
        csv_row[cols.parent].length
      );
      variant_csv.csv_index = cntr;
      variant_csv.menu_item_id = Number(csv_row[cols.menu_item_id]);
      variant_csv.variant_group_id = Number(csv_row[cols.variant_group_id]);
      variant_csv.variant_group_name = csv_row[cols.variant_group_name];
      variant_csv.variant_id = Number(csv_row[cols.variant_id]);
      variant_csv.variant_name = csv_row[cols.name];

      if (variant_csv.parent?.startsWith('i')) {
        // if row is not parent skip it
        continue;
      } else if (!variant_csv.parent?.startsWith('v')) {
        errors.push({
          column_name: cols.parent,
          error: 'invalid',
          details: `Data:[${variant_csv.parent}]`,
        });
        throw `Parent', error: 'invalid ${variant_csv.parent}`;
      }
      const foundParent = parent_row.filter(catg => {
        return catg.parent_id === variant_csv.parent_id;
      })[0];
      if (foundParent) {
        if (
          CsvRows[foundParent.csv_index].errors &&
          CsvRows[foundParent.csv_index].errors.length
        ) {
          // if parent row has error dont process
          errors.push({
            column_name: cols.parent,
            error: 'invalid',
          });
        }
        variant_csv.restaurant_id = foundParent.restaurant_id;
        variant_csv.menu_item_id = foundParent.menu_item_id;
        variant_csv.menu_item_name = foundParent.menu_item_name;
        variant_csv.main_category_id = foundParent.main_category_id;
        variant_csv.main_category_name = foundParent.main_category_name;
        variant_csv.sub_category_id = foundParent.sub_category_id;
        variant_csv.sub_category_name = foundParent.sub_category_name;
      } else {
        errors.push({
          column_name: cols.parent,
          error: 'not found',
          details: `Parent id: ${variant_csv.parent}]`,
        });
      }

      /***
       * variant_group_name
       */
      if (!variant_csv.variant_group_name) {
        errors.push({column_name: cols.variant_group_name, error: 'empty'});
      }
      variant_csv.variant_group_name = csv_row[cols.variant_group_name];

      /***
       * Item Name
       */
      if (!variant_csv.variant_name) {
        errors.push({column_name: cols.name, error: 'empty'});
      }

      //collect all other data for parent

      if (!['0', '1'].includes(csv_row[cols.in_stock])) {
        errors.push({
          column_name: cols.in_stock,
          error: 'empty/invalid Not [ 0 / 1 ]',
          details: `Data:[${csv_row[cols.in_stock]}]`,
        });
      } else {
        csv_row[cols.in_stock] = csv_row[cols.in_stock] === '1' ? true : false;
      }
      variant_csv.in_stock = csv_row[cols.in_stock];

      if (!csv_row[cols.price] || isNaN(csv_row[cols.price])) {
        errors.push({
          column_name: cols.price,
          error: 'empty/invalid',
          details: `Data:[${csv_row[cols.price]}]`,
        });
      } else {
        csv_row[cols.price] = parseFloat(csv_row[cols.price]);
      }
      variant_csv.price = csv_row[cols.price];

      csv_row[cols.veg_egg_non] = csv_row[cols.veg_egg_non].toLowerCase();
      if (!['veg', 'egg', 'non-veg'].includes(csv_row[cols.veg_egg_non])) {
        errors.push({
          column_name: cols.veg_egg_non,
          error: 'not in veg / egg / non-veg',
          details: `Data:[${csv_row[cols.veg_egg_non]}]`,
        });
      }
      variant_csv.veg_egg_non = csv_row[cols.veg_egg_non];

      if (!csv_row[cols.serves_how_many]) csv_row[cols.serves_how_many] = 1;
      if (isNaN(csv_row[cols.serves_how_many])) {
        errors.push({
          column_name: cols.serves_how_many,
          error: 'Not number',
          details: `Data:[${csv_row[cols.serves_how_many]}]`,
        });
      } else {
        csv_row[cols.serves_how_many] = Number(csv_row[cols.serves_how_many]);
      }
      variant_csv.serves_how_many = csv_row[cols.serves_how_many];

      if (!['', '0', '1'].includes(csv_row[cols.variant_is_default])) {
        errors.push({
          column_name: cols.variant_is_default,
          error: 'empty/invalid Not [ "empty" / 0 / 1 ]',
          details: `Data:[${csv_row.variant_is_default}]`,
        });
      } else {
        csv_row[cols.variant_is_default] =
          csv_row[cols.variant_is_default] === '1' ? true : false;
      }
      variant_csv.is_default = csv_row[cols.variant_is_default];

      if (!['', '0', '1'].includes(csv_row[cols.is_deleted])) {
        errors.push({column_name: 'is_deleted', error: 'invalid'});
        errors.push({
          column_name: cols.is_deleted,
          error: 'empty/invalid Not [ "empty" / 0 / 1 ]',
          details: `Data:[${csv_row.variant_is_default}]`,
        });
      } else {
        csv_row[cols.is_deleted] =
          csv_row[cols.is_deleted] === '1' ? true : false;
      }
      variant_csv.is_deleted = csv_row[cols.is_deleted];

      if (!errors.length) variant_row.push(variant_csv);
    } catch (error) {
      logger.error('variant logger' + RowPrefix + variant_csv.csv_index, error);
      if (!error) {
        errors.push({column_name: 'N/A', error: 'Server Error'});
      }
    }
    row_error[RowPrefix + variant_csv.csv_index] = errors;
  }

  /***
   *    Processing Variant Group
   */
  const vg_id_seq: {mi_id: number; id: number; sequence: number}[] = [];
  for (let cntr = 0; cntr < variant_row.length; cntr++) {
    const variant_csv = variant_row[cntr];
    // Skip this csv-row if already has error from previous loop
    if (row_error[RowPrefix + variant_csv.csv_index].length) continue;
    const errors: IColumnError[] = [];
    try {
      // If id not provided check for id by name
      if (!variant_csv.variant_group_id) {
        const foundVariantGroup = variantGroups?.filter(
          catg =>
            catg.menu_item_id === variant_csv.menu_item_id &&
            catg.name === variant_csv.variant_group_name
        )[0];
        // if found id for Variant Group update in csv row name
        if (foundVariantGroup) {
          variant_csv.variant_group_id = foundVariantGroup.id;
          logger.debug(
            'Got Id of ',
            variant_csv.variant_group_name + ':' + variant_csv.variant_group_id
          );
        }
      }
      // Check if variant_group_id id is still empty after fetching by name
      if (!variant_csv.variant_group_id) {
        // if id is still empty it means it is a new record
        // saved this to Menu-JSON for refference to following rows with same name with flag "create" new
        // variant_csv.action_vg = 'create';
        variant_csv.variant_group_id = getPK();
        if (update_seq) {
          const vg_mi_seq = vg_id_seq.filter(
            item => item.mi_id === variant_csv.menu_item_id
          );
          const max = getNextSeq(vg_mi_seq);
          vg_id_seq.push({
            id: variant_csv.variant_group_id!,
            mi_id: variant_csv.menu_item_id!,
            sequence: max,
          });
        } else {
          const mi_vgs = variantGroups.filter(
            item => item.menu_item_id === variant_csv.menu_item_id
          );
          const max = getNextSeq(mi_vgs);
          vg_id_seq.push({
            id: variant_csv.variant_group_id!,
            mi_id: variant_csv.menu_item_id!,
            sequence: max,
          });
        }
        variantGroups.push({
          id: variant_csv.variant_group_id,
          menu_item_id: variant_csv.menu_item_id,
          name: variant_csv.variant_group_name,
          created_at: new Date(),
          updated_at: new Date(),
        });
      } else {
        // find record from Menu-JSON by id
        const foundVariantGroup = variantGroups.filter(
          catg => catg.id === variant_csv.variant_group_id
        )[0];
        if (!foundVariantGroup) {
          // if no record found : it means id is not in database or deleted aka:invalid
          errors.push({
            column_name: cols.variant_group_id,
            error: 'invalid',
            details: `Data:[${variant_csv.variant_group_id}]`,
          });
        } else {
          // console.log('uppdate', foundVariantGroup.name);
          if (update_seq) {
            const foundseq = vg_id_seq.find(
              item => item.id === foundVariantGroup.id
            );
            if (!foundseq) {
              const vg_mi_seq = vg_id_seq.filter(
                item => item.mi_id === foundVariantGroup.menu_item_id
              );
              const max = getNextSeq(vg_mi_seq);
              vg_id_seq.push({
                id: foundVariantGroup.id!,
                mi_id: foundVariantGroup.menu_item_id!,
                sequence: max,
              });
              // console.log(
              //   `variant group Seq ${foundVariantGroup.id} new:${max} old:${foundVariantGroup.sequence}`
              // );
            }
          }
          // if record found : check if Data is may be modiifed
          if (foundVariantGroup.name !== variant_csv.variant_group_name) {
            // if data is modified
            // chack if it is already medified in previous csv-row
            // ie: In database it was [South-india] then in csv-row-3: it became [South-Indian] and again in csv-row-5 it chaned to [South-Dish]
            if (foundVariantGroup.updated_at) {
              errors.push({
                column_name: 'variant_group_id',
                error: 'many update',
              });
              errors.push({
                column_name: cols.variant_group_id,
                error: 'Multiple Updates',
                details: foundVariantGroup.name,
              });
            } else {
              // If data is being updated first time
              // sync changes with Menu-JSON and add flag for "update"
              // variant_csv.action_vg = 'update';
              foundVariantGroup.name = variant_csv.variant_group_name;
              foundVariantGroup.updated_at = new Date();
              logger.debug(
                'update variant_group',
                variant_csv.variant_group_name
              );
            }
          }
        }
      }
    } catch (error) {
      logger.error(RowPrefix + variant_csv.csv_index, error);
      errors.push({column_name: 'N/A', error: 'Server Error'});
    }
    // Push all the errors from this loop to csv-row index
    row_error[RowPrefix + variant_csv.csv_index] = errors;
  }
  variantGroups.map(vg => {
    const foundseq = vg_id_seq.find(item => item.id === vg.id);
    if (foundseq && foundseq.sequence !== vg.sequence) {
      // console.log(
      //   `variant group Seq ${vg.id} new:${foundseq.sequence} old:${vg.sequence}`
      // );
      vg.sequence = foundseq.sequence;
      if (!vg.updated_at) {
        vg.updated_at = new Date();
        vg.is_deleted = false;
      }
    }
  });

  /***
   *    Processing Variant
   */
  const iv_id_seq: {vg_id: number; id: number; sequence: number}[] = [];
  for (let cntr = 0; cntr < variant_row.length; cntr++) {
    const variant_csv = variant_row[cntr];
    // Skip this csv-row if already has error from previous loop
    if (row_error[RowPrefix + variant_csv.csv_index].length) continue;
    const errors: IColumnError[] = [];
    try {
      // If id not provided check for id by name
      if (!variant_csv.variant_id) {
        const foundVariant = variants.filter(
          catg =>
            catg.variant_group_id === variant_csv.variant_group_id &&
            catg.name === variant_csv.variant_name
        )[0];
        // if found id for Variant update in csv row name
        if (foundVariant) {
          variant_csv.variant_id = foundVariant.id;
          logger.debug('Got Id of ', variant_csv.variant_name);
        }
      }
      // Check if variant_id is still empty after fetching by name
      if (!variant_csv.variant_id) {
        // if id is still empty it means it is a new record
        // saved this to Menu-JSON for refference to following rows with same name with flag "create" new
        // variant_csv.action_v = 'create';
        variant_csv.variant_id = getPK();
        if (update_seq) {
          const iv_vg_seq = iv_id_seq.filter(
            item => item.vg_id === variant_csv.variant_group_id
          );
          const max = getNextSeq(iv_vg_seq);
          iv_id_seq.push({
            id: variant_csv.variant_id!,
            vg_id: variant_csv.variant_group_id!,
            sequence: max,
          });
        } else {
          const vg_ivs = variants.filter(
            item => item.variant_group_id === variant_csv.variant_group_id
          );
          const max = getNextSeq(vg_ivs);
          iv_id_seq.push({
            id: variant_csv.variant_id!,
            vg_id: variant_csv.variant_group_id!,
            sequence: max,
          });
        }
        variants.push({
          id: variant_csv.variant_id,
          variant_group_id: variant_csv.variant_group_id,
          name: variant_csv.variant_name,
          in_stock: variant_csv.in_stock,
          price: variant_csv.price,
          veg_egg_non: variant_csv.veg_egg_non,
          serves_how_many: variant_csv.serves_how_many,
          is_default: variant_csv.is_default,
          is_deleted: variant_csv.is_deleted,
          created_at: new Date(),
          updated_at: new Date(),
        });
      } else {
        // find record from Menu-JSON by id
        const foundVariant = variants.filter(
          catg => catg.id === variant_csv.variant_id
        )[0];
        if (!foundVariant) {
          // if no record found : it means id is not in database or deleted aka:invalid
          errors.push({
            column_name: cols.variant_id,
            error: 'invalid',
            details: `Data:[${variant_csv.variant_id}]`,
          });
        } else {
          if (update_seq) {
            const foundseq = iv_id_seq.find(
              item => item.id === foundVariant.id
            );
            if (!foundseq) {
              const iv_vg_seq = iv_id_seq.filter(
                item => item.vg_id === foundVariant.variant_group_id
              );
              const max = getNextSeq(iv_vg_seq);
              iv_id_seq.push({
                id: foundVariant.id!,
                vg_id: foundVariant.variant_group_id!,
                sequence: max,
              });
            }
          }
          // if record found : check if Data is may be modiifed
          if (
            foundVariant.name !== variant_csv.variant_name ||
            foundVariant.in_stock !== variant_csv.in_stock ||
            foundVariant.price !== variant_csv.price ||
            foundVariant.veg_egg_non !== variant_csv.veg_egg_non ||
            foundVariant.serves_how_many !== variant_csv.serves_how_many ||
            foundVariant.is_default !== variant_csv.is_default ||
            variant_csv.is_deleted
          ) {
            // if data is modified
            // chack if it is already medified in previous csv-row
            // ie: In database it was [South-india] then in csv-row-3: it became [South-Indian] and again in csv-row-5 it chaned to [South-Dish]
            if (foundVariant.updated_at) {
              const err: IColumnError = {
                column_name: 'Variant',
                error: 'Multiple Updates',
                details: {},
              };
              if (foundVariant.name !== variant_csv.variant_name)
                err.details.name = {
                  old: foundVariant.name,
                  new: variant_csv.variant_name,
                };
              if (foundVariant.in_stock !== variant_csv.in_stock)
                err.details.in_stock = {
                  old: foundVariant.in_stock,
                  new: variant_csv.in_stock,
                };
              if (foundVariant.price !== variant_csv.price)
                err.details.price = {
                  old: foundVariant.price,
                  new: variant_csv.price,
                };
              if (foundVariant.veg_egg_non !== variant_csv.veg_egg_non)
                err.details.veg_egg_non = {
                  old: foundVariant.veg_egg_non,
                  new: variant_csv.veg_egg_non,
                };
              if (foundVariant.serves_how_many !== variant_csv.serves_how_many)
                err.details.serves_how_many = {
                  old: foundVariant.serves_how_many,
                  new: variant_csv.serves_how_many,
                };
              if (foundVariant.is_default !== variant_csv.is_default)
                err.details.is_default = {
                  old: foundVariant.is_default,
                  new: variant_csv.is_default,
                };
              errors.push(err);
            } else {
              // If data is being updated first time
              // sync changes with Menu-JSON and add flag for "update"
              // variant_csv.action_v = 'update';
              foundVariant.name = variant_csv.variant_name;
              foundVariant.in_stock = variant_csv.in_stock;
              foundVariant.price = variant_csv.price;
              foundVariant.veg_egg_non = variant_csv.veg_egg_non;
              foundVariant.serves_how_many = variant_csv.serves_how_many;
              foundVariant.is_default = variant_csv.is_default;
              foundVariant.updated_at = new Date();
              foundVariant.is_deleted = variant_csv.is_deleted;
              logger.debug('update variant', variant_csv.variant_name);
            }
          }
        }
      }
    } catch (error) {
      logger.error(RowPrefix + variant_csv.csv_index, error);
      errors.push({column_name: 'N/A', error: 'Server Error'});
    }
    // Push all the errors from this loop to csv-row index
    row_error[RowPrefix + variant_csv.csv_index] = errors;
  }
  variants.map(iv => {
    const foundseq = iv_id_seq.find(item => item.id === iv.id);
    if (foundseq && foundseq.sequence !== iv.sequence) {
      // console.log(
      //   `variant Seq ${iv.id} new:${foundseq.sequence} old:${iv.sequence}`
      // );
      iv.sequence = foundseq.sequence;
      if (!iv.updated_at) {
        iv.updated_at = new Date();
        iv.is_deleted = false;
      }
    }
  });

  /***
   *    Final Data Integrety test at menu object level
   */
  let error = false;
  for (let i = 0; i < CsvRows.length; i++) {
    if (row_error[RowPrefix + i] && row_error[RowPrefix + i].length) {
      row_error['Row (' + (i + 2) + ')'] = row_error[RowPrefix + i];
      error = true;
    }
    delete row_error[RowPrefix + i];
  }
  if (error) {
    return {errors: row_error};
  }

  const errors: IColumnError[] = [];

  mainCategories.map(item => {
    const duplicate = mainCategories.filter(
      row => row.restaurant_id === item.restaurant_id && row.name === item.name
    );
    if (duplicate.length > 1) {
      errors.push({
        column_name: 'Main Category',
        error: 'Duplicate',
        details: `Data:[${item.name}]`,
      });
    }
  });
  subCategories.map(item => {
    const duplicate = subCategories.filter(
      row =>
        row.main_category_id === item.main_category_id && row.name === item.name
    );
    if (duplicate.length > 1) {
      errors.push({
        column_name: 'Sub Category',
        error: 'Duplicate',
        details: `Data:[${item.name}]`,
      });
    }
  });
  menuItems.map(item => {
    const duplicate = menuItems.filter(
      row =>
        row.sub_category_id === item.sub_category_id && row.name === item.name
    );
    if (duplicate.length > 1) {
      errors.push({
        column_name: 'Menu Item',
        error: 'Duplicate',
        details: `Data:[${item.name}]`,
      });
    }
  });
  variantGroups.map(item => {
    const duplicate = variantGroups.filter(
      row => row.menu_item_id === item.menu_item_id && row.name === item.name
    );
    if (duplicate.length > 1) {
      errors.push({
        column_name: 'Variant Group',
        error: 'Duplicate',
        details: `Data:[${item.name}]`,
      });
    }
  });
  variants.map(item => {
    const duplicate = variants.filter(
      row =>
        row.variant_group_id === item.variant_group_id && row.name === item.name
    );
    if (duplicate.length > 1) {
      errors.push({
        column_name: 'Variant',
        error: 'Duplicate',
        details: `Data:[${item.name}]`,
      });
    }
  });
  variantGroups.map(vg => {
    const dflt_vrnt = variants.filter(
      vrnt => vrnt.variant_group_id === vg.id && vrnt.is_default
    );
    if (dflt_vrnt.length < 1) {
      errors.push({
        column_name: 'Varient',
        error: 'No Default',
      });
    } else if (dflt_vrnt.length > 1) {
      errors.push({
        column_name: 'Variant',
        error: 'Multiple Defaults',
      });
    }
  });

  if (errors.length) {
    return {errors: {other_errors: errors}};
  }

  const ProcessResult = {
    Main_Category: {
      Created: 0,
      Modified: 0,
    },
    Sub_Category: {
      Created: 0,
      Modified: 0,
    },
    Menu_Item: {
      Created: 0,
      Modified: 0,
    },
    Variant_Group: {
      Created: 0,
      Modified: 0,
    },
    Variant: {
      Created: 0,
      Modified: 0,
    },
  };
  const trx = await getTransaction();
  try {
    /***
     *    Save To Database
     */
    const insertMainCategory: IMainCategory[] = [];
    const updateMainCategory: IMainCategory[] = [];
    mainCategories.map(row => {
      if (row.updated_at) {
        if (row.created_at) {
          const r = JSON.parse(JSON.stringify(row));
          delete r.id;
          insertMainCategory.push(r);
        } else {
          updateMainCategory.push(row);
        }
      }
    });
    if (updateMainCategory.length) {
      await bulkUpdateMainCategory(trx, updateMainCategory);
      ProcessResult.Main_Category.Modified = updateMainCategory.length;
    }
    if (insertMainCategory.length) {
      const resultMainCategory = await bulkInsertMainCategory(
        trx,
        insertMainCategory
      );
      resultMainCategory.map(newMainCategory => {
        const oldMainCategory = mainCategories.filter(item => {
          return (
            newMainCategory.name === item.name &&
            newMainCategory.restaurant_id === item.restaurant_id
          );
        })[0];
        subCategories = subCategories.map(subCategory => {
          if (subCategory.main_category_id === oldMainCategory.id) {
            subCategory.main_category_id = newMainCategory.id;
          }
          return subCategory;
        });
        oldMainCategory.id = newMainCategory.id;
      });
      ProcessResult.Main_Category.Created = insertMainCategory.length;
    }

    const insertSubCategory: ISubCategory[] = [];
    const updateSubCategory: ISubCategory[] = [];
    subCategories.map(row => {
      if (row.updated_at) {
        if (row.created_at) {
          const r = JSON.parse(JSON.stringify(row));
          delete r.id;
          insertSubCategory.push(r);
        } else {
          updateSubCategory.push(row);
        }
      }
    });
    if (updateSubCategory.length) {
      await bulkUpdateSubCategory(trx, updateSubCategory);
      ProcessResult.Sub_Category.Modified = updateSubCategory.length;
    }
    if (insertSubCategory.length) {
      const resultSubCategory = await bulkInsertSubCategory(
        trx,
        insertSubCategory
      );
      resultSubCategory.map(newSubCategory => {
        const oldSubCategory = subCategories.filter(item => {
          return (
            newSubCategory.name === item.name &&
            newSubCategory.main_category_id === item.main_category_id
          );
        })[0];
        menuItems = menuItems.map(menuItem => {
          if (menuItem.sub_category_id === oldSubCategory.id) {
            menuItem.sub_category_id = newSubCategory.id;
          }
          return menuItem;
        });
        oldSubCategory.id = newSubCategory.id;
      });
      ProcessResult.Sub_Category.Created = insertSubCategory.length;
    }

    const insertMenuItem: models.IMenuItem[] = [];
    const updateMenuItem: models.IMenuItem[] = [];
    menuItems.map(row => {
      if (row.updated_at) {
        const r = JSON.parse(JSON.stringify(row)) as models.IMenuItem;
        delete r.menu_item_slots;
        if (row.created_at) {
          delete r.id;
          insertMenuItem.push(r);
        } else {
          updateMenuItem.push(r);
        }
      }
    });
    if (updateMenuItem.length) {
      await models.bulkUpdateMenuItem(trx, updateMenuItem);
      ProcessResult.Menu_Item.Modified = updateMenuItem.length;
    }
    if (insertMenuItem.length) {
      const resultMenuItem = await models.bulkInsertMenuItem(
        trx,
        insertMenuItem
      );
      resultMenuItem.map(newMenuItem => {
        const oldMenuItem = menuItems.filter(item => {
          return (
            newMenuItem.name === item.name &&
            newMenuItem.sub_category_id === item.sub_category_id
          );
        })[0];
        variantGroups = variantGroups.map(variantGroup => {
          if (variantGroup.menu_item_id === oldMenuItem.id) {
            variantGroup.menu_item_id = newMenuItem.id;
          }
          return variantGroup;
        });
        oldMenuItem.id = newMenuItem.id;
      });
      ProcessResult.Menu_Item.Created = insertMenuItem.length;
    }

    const updateMenuItemSlots: models.IMenuItem_Slot[] = [];
    const updateMenuItemSlotsIds: number[] = [];
    menuItems.map(row => {
      if (row.updated_at && row.id) {
        updateMenuItemSlotsIds.push(row.id);
        const slots = JSON.parse(
          JSON.stringify(row.menu_item_slots)
        ) as models.IMenuItem_Slot[];
        slots.map(s => {
          updateMenuItemSlots.push({
            menu_item_id: row.id,
            ...s,
          });
        });
      }
    });
    await models.bulkUpdateItemSlots(
      trx,
      updateMenuItemSlotsIds,
      updateMenuItemSlots
    );

    const insertVariantGroup: IVariantGroup[] = [];
    const updateVariantGroup: IVariantGroup[] = [];
    variantGroups.map(row => {
      if (row.updated_at) {
        if (row.created_at) {
          const r = JSON.parse(JSON.stringify(row));
          delete r.id;
          insertVariantGroup.push(r);
        } else {
          updateVariantGroup.push(row);
        }
      }
    });
    if (updateVariantGroup.length) {
      await bulkUpdateVariantGroup(trx, updateVariantGroup);
      ProcessResult.Variant_Group.Modified = updateVariantGroup.length;
    }
    if (insertVariantGroup.length) {
      const resultVariantGroup = await bulkInsertVariantGroup(
        trx,
        insertVariantGroup
      );
      resultVariantGroup.map(newVariantGroup => {
        const oldVariantGroup = variantGroups.filter(item => {
          return (
            newVariantGroup.name === item.name &&
            newVariantGroup.menu_item_id === item.menu_item_id
          );
        })[0];
        variants = variants.map(variant => {
          if (variant.variant_group_id === oldVariantGroup.id) {
            variant.variant_group_id = newVariantGroup.id;
          }
          return variant;
        });
        oldVariantGroup.id = newVariantGroup.id;
      });
      ProcessResult.Variant_Group.Created = insertVariantGroup.length;
    }

    const insertVariant: IVariant[] = [];
    const updateVariant: IVariant[] = [];
    variants.map(row => {
      if (row.updated_at) {
        if (row.created_at) {
          const r = JSON.parse(JSON.stringify(row));
          delete r.id;
          insertVariant.push(r);
        } else {
          updateVariant.push(row);
        }
      }
    });
    if (updateVariant.length) {
      await bulkUpdateVariant(trx, updateVariant);
      ProcessResult.Variant.Modified = updateVariant.length;
    }
    if (insertVariant.length) {
      const resultVariant = await bulkInsertVariant(trx, insertVariant);
      resultVariant.map(newVariant => {
        const oldVariant = variants.filter(item => {
          return (
            newVariant.name === item.name &&
            newVariant.variant_group_id === item.variant_group_id
          );
        })[0];
        variants = variants.map(variant => {
          if (variant.variant_group_id === oldVariant.id) {
            variant.variant_group_id = newVariant.id;
          }
          return variant;
        });
        oldVariant.id = newVariant.id;
      });
      ProcessResult.Variant.Created = insertVariant.length;
    }

    const ESputIds: number[] = [];
    const ESDeleteIds: number[] = [];
    menuItems.map(item => {
      if (item.updated_at && item.id) {
        if (item.is_deleted) {
          ESDeleteIds.push(item.id);
        } else {
          ESputIds.push(item.id);
        }
      }
    });
    if (ESputIds.length)
      await esIndexData({
        event: 'MENUITEM',
        action: 'BULK_PUT',
        data: {
          ids: ESputIds,
        },
      });
    if (ESDeleteIds.length)
      await esIndexData({
        event: 'MENUITEM',
        action: 'BULK_DELETE',
        data: {
          ids: ESDeleteIds,
        },
      });
    await trx.commit();
  } catch (error) {
    await trx.rollback();
    logger.error('MEnu Item Import Transaction Error', error);
    throw new ResponseError(500, 'Error While Importing Data !!');
  }

  return ProcessResult;
}
export async function processMenuUpload(
  menuDataStr: string,
  options: {is_partial: boolean}
) {
  const JsonData = await csvtojson()
    .fromString(menuDataStr)
    .on('error', () => {
      logger.error('#### Error in compiling');
    })
    .then(csvRow => {
      return csvRow;
    });
  const valid_column_check = await checkvalidcolumns(JsonData, menu_items_cols);
  if (valid_column_check) {
    return valid_column_check;
  }
  const start = new Date().getMilliseconds();
  logger.debug('start process', start);
  const result = await precessMenuItemCsv(JsonData, options);
  const end = new Date().getMilliseconds();
  logger.debug('end process', end);
  logger.debug('diff', end - start);
  return result;
}
export async function uploadMenuItem(req: Request, res: Response) {
  try {
    if (!req.file?.buffer)
      return sendError(res, 400, [
        {
          code: 0,
          message: 'file is required',
        },
      ]);
    const result = await processMenuUpload(String(req.file?.buffer), {
      is_partial: req.body.is_partial === 'true',
    });
    return sendSuccess(res, 201, result);
  } catch (error) {
    return handleErrors(res, error);
  }
}
export async function downloadMenuItem(req: Request, res: Response) {
  try {
    req.params.restaurant_ids = req.params.restaurant_ids || '';
    const validation = Joi.array()
      .items(joi_restaurant_id.min(0))
      .required()
      .validate(req.params.restaurant_ids.split(','));
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const restaurant_ids: string[] = validation.value;
    const restaurantsMenu = await models_csv.exportMenuItems(restaurant_ids);
    const rows: string[] = [];
    let row_counter = 0;
    restaurant_ids.map(restaurant_id => {
      restaurantsMenu
        .filter(menu => {
          return menu.restaurant_id === restaurant_id;
        })
        .map(menuItem => {
          row_counter++;
          const menuRow: string[] = [];
          menuRow.push(menuItem.restaurant_id + '');
          menuRow.push(menuItem.main_category_id + '');
          menuRow.push(menuItem.main_category_name + '');
          menuRow.push(menuItem.sub_category_id + '');
          menuRow.push(menuItem.sub_category_name + '');
          menuRow.push(menuItem.menu_item_id + '');
          menuRow.push(menuItem.menu_item_name + '');
          menuRow.push(menuItem.description + '');
          menuRow.push('I' + row_counter);
          menuRow.push(''); //variant group id
          menuRow.push(''); //variant_group_name
          menuRow.push(''); //variant_id
          menuRow.push(''); //is_default variant
          menuRow.push(''); //in_stock
          menuRow.push(menuItem.price + '');
          menuRow.push(menuItem.veg_egg_non + '');
          menuRow.push(menuItem.packing_charges + '');
          menuRow.push(menuItem.is_spicy ? '1' : '0');
          menuRow.push(menuItem.serves_how_many + '');
          menuRow.push(menuItem.service_charges + '');
          menuRow.push(menuItem.item_sgst_utgst + '');
          menuRow.push(menuItem.item_cgst + '');
          menuRow.push(menuItem.item_igst + '');
          menuRow.push(menuItem.item_inclusive ? '1' : '0');
          menuRow.push(menuItem.disable ? '1' : '0');
          menuRow.push(''); //delete
          menuRow.push(menuItem.external_id + '');
          menuRow.push(menuItem.allow_long_distance ? '1' : '0');
          Weekdays.map(day => {
            for (let slot_num = 1; slot_num <= 3; slot_num++) {
              const slot = menuItem.menu_item_slots?.filter(item => {
                return (
                  item.weekday === day.toLowerCase() &&
                  item.slot_num === slot_num
                );
              })[0];
              if (slot?.open_time !== undefined) {
                menuRow.push(slot.open_time + '');
              } else {
                menuRow.push('');
              }
              if (slot?.close_time !== undefined) {
                menuRow.push(slot.close_time + '');
              } else {
                menuRow.push('');
              }
            }
          });

          rows.push(arrToCsvRow(menuRow));

          menuItem.variant_groups?.map(vrntGroup => {
            vrntGroup.variants.map(vrnt => {
              const variantRow: string[] = [];
              variantRow.push(menuItem.restaurant_id + '');
              variantRow.push(''); //main_category_id
              variantRow.push(''); //main_category_name
              variantRow.push(''); //sub_category_id
              variantRow.push(''); //sub_category_name
              variantRow.push(''); //menu_item_id
              variantRow.push(vrnt.variant_name + '');
              variantRow.push('');
              variantRow.push('V' + row_counter);
              variantRow.push(vrntGroup.variant_group_id + '');
              variantRow.push(vrntGroup.variant_group_name + '');
              variantRow.push(vrnt.variant_id + '');
              variantRow.push(vrnt.is_default ? '1' : '0');
              variantRow.push(vrnt.in_stock ? '1' : '0');
              variantRow.push(vrnt.price + '');
              variantRow.push(vrnt.veg_egg_non + '');
              variantRow.push(''); //packing_charges
              variantRow.push(''); //is_spicy
              variantRow.push(''); //serves_how_many
              variantRow.push(''); //service_charges
              variantRow.push(''); //item_sgst_utgst
              variantRow.push(''); //item_cgst
              variantRow.push(''); //item_igst
              variantRow.push(''); //item_inclusive
              variantRow.push(''); //disable
              variantRow.push(''); //delete
              variantRow.push(''); //external_id
              variantRow.push(''); //allow_long_distance
              rows.push(arrToCsvRow(variantRow));
            });
          });
        });
    });

    const headerArray: string[] = [];
    for (const [key, value] of Object.entries(menu_items_cols)) {
      if (key && value) headerArray.push(value);
    }
    const headers_str = headerArray.join(',');
    let rows_str: string = restaurant_ids.map(id => `"${id}"`).join('\n');
    if (rows.length) rows_str = rows.join('\n');
    const result = headers_str + '\n' + rows_str;
    res.setHeader('Content-type', 'application/octet-stream');
    res.setHeader('Content-disposition', 'attachment; filename=menu_item.csv');
    return res.send(result);
  } catch (error) {
    return handleErrors(res, error);
  }
}
export async function s3uploadMenuItem(req: Request, res: Response) {
  try {
    const is_partial = req.body.is_partial === true;
    delete req.body.is_partial;
    const validation = models.schema_upload_file.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = validation.value;

    const menuDataStr = await getTempFileData(validated_req.csv_file_name);
    const result = await processMenuUpload(menuDataStr, {
      is_partial,
    });
    if (result.errors) {
      return sendError(res, 400, [
        {
          code: 0,
          message: 'Error found in uploaded file',
          data: result.errors,
        },
      ]);
    }

    return sendSuccess(res, 201, result);
  } catch (error) {
    return handleErrors(res, error);
  }
}

//
//  Addon Addon Group
//
const addon_addon_group_cols = {
  restaurant_id: 'Restaurant_Id',
  menu_item_ids: 'Items_Id',
  addon_group_id: 'AddonGroup_Id',
  addon_group_name: 'AddonGroup_Name',
  addon_id: 'Addon_Id',
  addon_name: 'Addon_Name',
  sequence: 'Addon_Order',
  price: 'Addon_Price',
  veg_egg_non: 'Addon_IsVeg',
  in_stock: 'Addon_Instock',
  sgst_rate: 'Addon_SGST',
  cgst_rate: 'Addon_CGST',
  igst_rate: 'Addon_IGST',
  gst_inclusive: 'Addon_Inclusive',
  is_deleted: 'Delete',
  external_id: 'External_Addon_Id',
};
interface IAddonCsvResponse {
  errors?: {[key: string]: IColumnError[]};
  Addon_Group?: {
    Created: number;
    Modified: number;
  };
  Addon?: {
    Created: number;
    Modified: number;
  };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function precessAddonCsv(CsvRows: any[]): Promise<IAddonCsvResponse> {
  /**

   delete from addon;
   delete from addon_group;

   drop table addon;
   drop table addon_group;
   delete from knex_migrations where name like '%addon.ts'
   delete from knex_migrations where name like '%addon_group.ts'

   */
  const cols = addon_addon_group_cols;
  let pkey = 0;
  function getPK() {
    pkey--;
    return pkey;
  }

  const RowPrefix = 'Row_Num_';
  const row_error: {
    [key: string]: IColumnError[];
  } = {};

  // collect Restaurants data from database for all the Restaurant ids in csv file
  const restaurantIds = CsvRows.map(
    (item: {[x: string]: string}) => item[cols.restaurant_id]
  );
  const restaurants = await models_csv.readRestaurantsByIds(restaurantIds);
  const menuItems = await models.readMenuItemByRestaurantIds(restaurantIds);
  const addonGroups = await readAddonGroupByRestaurantIds(restaurantIds);
  // collect Addons data from database for all the  Restaurant ids >> Addon Group Ids in csv file
  const addonGroupIds = addonGroups.map(item => item.id);
  let addons = await readAddonByAddonGroupIds(addonGroupIds);

  for (let cntr = 0; cntr < CsvRows.length; cntr++) {
    const parent_csv = CsvRows[cntr];
    parent_csv.csv_index = cntr;
    const errors: IColumnError[] = [];

    if (!parent_csv[cols.restaurant_id]) {
      errors.push({column_name: cols.restaurant_id, error: 'empty'});
    }
    const foundRestaurant = restaurants.filter(
      rest => rest.id === parent_csv[cols.restaurant_id]
    )[0];
    if (!foundRestaurant) {
      errors.push({
        column_name: cols.restaurant_id,
        error: 'invalid',
        details: `Data:[${parent_csv[cols.restaurant_id]}]`,
      });
    }
    parent_csv[cols.menu_item_ids] = parent_csv[cols.menu_item_ids].split(',');

    const invalidItems: string[] = [];
    parent_csv[cols.menu_item_ids] = parent_csv[cols.menu_item_ids].map(
      (item: string) => {
        const item_id = parseInt(item);
        if (isNaN(item_id)) {
          invalidItems.push(item);
        }
        const foundItem = menuItems.filter(mi => {
          return (
            mi.id === item_id &&
            mi.restaurant_id === parent_csv[cols.restaurant_id]
          );
        })[0];
        if (!foundItem) {
          invalidItems.push(item);
        }
        return item_id;
      }
    );
    if (invalidItems.length) {
      errors.push({
        column_name: cols.menu_item_ids,
        error: 'invalid',
        details: `Data:[${invalidItems.join(', ')}]`,
      });
    }
    if (
      parent_csv[cols.addon_group_id] &&
      isNaN(parent_csv[cols.addon_group_id])
    ) {
      errors.push({
        column_name: cols.addon_group_id,
        error: 'invalid/empty',
        details: `Data:[${parent_csv[cols.addon_group_id]}]`,
      });
    } else {
      parent_csv[cols.addon_group_id] = parseInt(
        parent_csv[cols.addon_group_id]
      );
    }
    if (!parent_csv[cols.addon_group_name]) {
      errors.push({
        column_name: cols.addon_group_name,
        error: 'invalid/empty',
        details: `Data:[${parent_csv[cols.addon_group_name]}]`,
      });
    }
    if (parent_csv[cols.addon_id] && isNaN(parent_csv[cols.addon_id])) {
      errors.push({
        column_name: cols.addon_id,
        error: 'invalid/empty',
        details: `Data:[${parent_csv[cols.addon_id]}]`,
      });
    } else {
      parent_csv[cols.addon_id] = parseInt(parent_csv[cols.addon_id]);
    }
    if (!parent_csv[cols.addon_name]) {
      errors.push({
        column_name: cols.addon_name,
        error: 'invalid/empty',
        details: `Data:[${parent_csv[cols.addon_name]}]`,
      });
    }
    if (!parent_csv[cols.sequence] || isNaN(parent_csv[cols.sequence])) {
      errors.push({
        column_name: cols.sequence,
        error: 'invalid/empty',
        details: `Data:[${parent_csv[cols.sequence]}]`,
      });
    } else {
      parent_csv[cols.sequence] = parseInt(parent_csv[cols.sequence]);
    }

    if (!parent_csv[cols.price] || isNaN(parent_csv[cols.price])) {
      errors.push({
        column_name: cols.price,
        error: 'invalid/empty',
        details: `Data:[${parent_csv[cols.price]}]`,
      });
    } else {
      parent_csv[cols.price] = parseFloat(parent_csv[cols.price]);
    }
    parent_csv[cols.veg_egg_non] = parent_csv[cols.veg_egg_non].toLowerCase();
    if (parent_csv[cols.veg_egg_non] === '1')
      parent_csv[cols.veg_egg_non] = 'veg';
    if (parent_csv[cols.veg_egg_non] === '0')
      parent_csv[cols.veg_egg_non] = 'non-veg';
    if (!['veg', 'egg', 'non-veg'].includes(parent_csv[cols.veg_egg_non])) {
      errors.push({
        column_name: cols.veg_egg_non,
        error: 'not in veg / egg / non-veg',
        details: `Data:[${parent_csv[cols.veg_egg_non]}]`,
      });
    }
    if (!['', '0', '1'].includes(parent_csv[cols.in_stock])) {
      errors.push({
        column_name: cols.in_stock,
        error: 'invalid',
        details: `Data:[${parent_csv[cols.in_stock]}]`,
      });
    } else {
      parent_csv[cols.in_stock] =
        parent_csv[cols.in_stock] === '1' ? true : false;
    }
    if (!parent_csv[cols.sgst_rate]) parent_csv[cols.sgst_rate] = '0';
    if (!parent_csv[cols.sgst_rate] || isNaN(parent_csv[cols.sgst_rate])) {
      errors.push({
        column_name: cols.sgst_rate,
        error: 'invalid/empty',
        details: `Data:[${parent_csv[cols.sgst_rate]}]`,
      });
    } else {
      parent_csv[cols.sgst_rate] = parseFloat(parent_csv[cols.sgst_rate]);
    }
    if (!parent_csv[cols.cgst_rate]) parent_csv[cols.cgst_rate] = '0';
    if (!parent_csv[cols.cgst_rate] || isNaN(parent_csv[cols.cgst_rate])) {
      errors.push({
        column_name: cols.cgst_rate,
        error: 'invalid/empty',
        details: `Data:[${parent_csv[cols.cgst_rate]}]`,
      });
    } else {
      parent_csv[cols.cgst_rate] = parseFloat(parent_csv[cols.cgst_rate]);
    }
    if (!parent_csv[cols.igst_rate]) parent_csv[cols.igst_rate] = '0';
    if (!parent_csv[cols.igst_rate] || isNaN(parent_csv[cols.igst_rate])) {
      errors.push({
        column_name: cols.igst_rate,
        error: 'invalid/empty',
        details: `Data:[${parent_csv[cols.igst_rate]}]`,
      });
    } else {
      parent_csv[cols.igst_rate] = parseFloat(parent_csv[cols.igst_rate]);
    }

    if (!parent_csv[cols.gst_inclusive]) parent_csv[cols.gst_inclusive] = '0';
    if (!['0', '1'].includes(parent_csv[cols.gst_inclusive])) {
      errors.push({
        column_name: cols.gst_inclusive,
        error: 'invalid',
        details: `Data:[${parent_csv[cols.gst_inclusive]}]`,
      });
    } else {
      parent_csv[cols.gst_inclusive] =
        parent_csv[cols.gst_inclusive] === '1' ? true : false;
    }
    if (!parent_csv[cols.is_deleted]) parent_csv[cols.is_deleted] = '0';
    if (!['0', '1'].includes(parent_csv[cols.is_deleted])) {
      errors.push({
        column_name: cols.is_deleted,
        error: 'invalid',
        details: `Data:[${parent_csv[cols.is_deleted]}]`,
      });
    } else {
      parent_csv[cols.is_deleted] =
        parent_csv[cols.is_deleted] === '1' ? true : false;
    }
    if (!parent_csv[cols.external_id]) parent_csv[cols.external_id] = null;

    row_error[RowPrefix + cntr] = errors;
  }
  /***
   *    Process Addon Group for each parent csv row
   */
  for (let cntr = 0; cntr < CsvRows.length; cntr++) {
    const parent_csv = CsvRows[cntr];
    // Skip this csv-row if already has error from previous loop
    if (row_error[RowPrefix + parent_csv.csv_index].length) continue;
    const errors: IColumnError[] = [];

    try {
      // If id not provided check for id by name
      if (!parent_csv[cols.addon_group_id]) {
        const foundAddonGroup = addonGroups.filter(
          addGrp =>
            addGrp.restaurant_id === parent_csv[cols.restaurant_id] &&
            addGrp.name === parent_csv[cols.addon_group_name]
        )[0];
        // if found id for group update in csv row name
        if (foundAddonGroup) {
          parent_csv[cols.addon_group_id] = foundAddonGroup.id;
          logger.debug('Got Addon Group Id', parent_csv[cols.addon_group_name]);
        }
      }

      // Check if group id is still empty after fetching by name
      if (!parent_csv[cols.addon_group_id]) {
        // if id is still empty it means it is a new record
        // saved this to Menu-JSON for refference to following rows with same name with flag "create" new
        parent_csv[cols.addon_group_id] = getPK();
        parent_csv.action_ag = 'create';
        addonGroups.push({
          id: parent_csv[cols.addon_group_id],
          restaurant_id: parent_csv[cols.restaurant_id],
          name: parent_csv[cols.addon_group_name],
          created_at: new Date(),
          updated_at: new Date(),
        });
        logger.debug('Create Addon Group ', parent_csv[cols.addon_group_name]);
      } else {
        // find record from Menu-JSON by id
        const foundAddonGroup = addonGroups.filter(
          addGrp => addGrp.id === parent_csv[cols.addon_group_id]
        )[0];
        if (!foundAddonGroup) {
          // if no record found : it means id is not in database or deleted aka:invalid
          errors.push({
            column_name: cols.addon_group_id,
            error: 'invalid',
            details: `Data:[${parent_csv[cols.addon_group_id]}]`,
          });
        } else {
          // if record found : check if Data is may be modiifed
          if (foundAddonGroup.name !== parent_csv[cols.addon_group_name]) {
            // if data is modified
            // chack if it is already medified in previous csv-row
            // ie: In database it was [South-india] then in csv-row-3: it became [South-Indian] and again in csv-row-5 it chaned to [South-Dish]
            if (foundAddonGroup.updated_at) {
              errors.push({
                column_name: cols.addon_group_id,
                error: 'many update',
                details: `Data1:[${parent_csv[cols.addon_group_name]}]
                Data2:[${foundAddonGroup.name}]`,
              });
            } else {
              // If data is being updated first time
              // sync changes with Menu-JSON and add flag for "update"
              parent_csv.action_ag = 'update';
              foundAddonGroup.name = parent_csv[cols.addon_group_name];
              foundAddonGroup.updated_at = new Date();
              logger.debug(
                'update addon group',
                parent_csv[cols.addon_group_name]
              );
            }
          }
        }
      }
    } catch (error) {
      errors.push({column_name: 'N/A', error: error + ''});
    }
    // Push all the errors from this loop to csv-row index
    row_error[RowPrefix + parent_csv.csv_index] = errors;
  }

  /***
   *    Process addon for each parent csv row
   */
  for (let cntr = 0; cntr < CsvRows.length; cntr++) {
    const parent_csv = CsvRows[cntr];
    // Skip this csv-row if already has error from previous loop
    if (row_error[RowPrefix + parent_csv.csv_index].length) continue;
    const errors: IColumnError[] = [];

    try {
      // If id not provided check for id by name
      if (!parent_csv[cols.addon_id]) {
        const foundAddon = addons.filter(
          addGrp =>
            addGrp.addon_group_id === parent_csv[cols.addon_group_id] &&
            addGrp.name === parent_csv[cols.addon_name]
        )[0];
        // if found id for addon update in csv row name
        if (foundAddon) {
          parent_csv[cols.addon_id] = foundAddon.id;
          logger.debug('Got Addon Id', parent_csv[cols.addon_name]);
        }
      }

      // Check if addon id is still empty after fetching by name
      if (!parent_csv[cols.addon_id]) {
        // if id is still empty it means it is a new record
        // saved this to Menu-JSON for refference to following rows with same name with flag "create" new
        parent_csv[cols.addon_id] = getPK();
        parent_csv.action_ad = 'create';
        addons.push({
          id: parent_csv[cols.addon_id],
          addon_group_id: parent_csv[cols.addon_group_id],
          name: parent_csv[cols.addon_name],
          menu_item_ids: parent_csv[cols.menu_item_ids],
          sequence: parent_csv[cols.sequence],
          price: parent_csv[cols.price],
          veg_egg_non: parent_csv[cols.veg_egg_non],
          in_stock: parent_csv[cols.in_stock],
          sgst_rate: parent_csv[cols.sgst_rate],
          cgst_rate: parent_csv[cols.cgst_rate],
          igst_rate: parent_csv[cols.igst_rate],
          gst_inclusive: parent_csv[cols.gst_inclusive],
          external_id: parent_csv[cols.external_id],
          created_at: new Date(),
          updated_at: new Date(),
        });
        logger.debug('Create Addon ', parent_csv[cols.addon_name]);
      } else {
        // find record from Menu-JSON by id
        const foundAddon = addons.filter(
          addGrp => addGrp.id === parent_csv[cols.addon_id]
        )[0];
        if (!foundAddon) {
          // if no record found : it means id is not in database or deleted aka:invalid
          errors.push({
            column_name: cols.addon_id,
            error: 'invalid',
            details: `Data:[${parent_csv[cols.addon_id]}]`,
          });
        } else {
          // if record found : check if Data is may be modiifed

          if (
            foundAddon.name !== parent_csv[cols.addon_name] ||
            !compareArray(
              foundAddon.menu_item_ids,
              parent_csv[cols.menu_item_ids]
            ) ||
            foundAddon.sequence !== parent_csv[cols.sequence] ||
            foundAddon.price !== parent_csv[cols.price] ||
            foundAddon.veg_egg_non !== parent_csv[cols.veg_egg_non] ||
            foundAddon.in_stock !== parent_csv[cols.in_stock] ||
            foundAddon.sgst_rate !== parent_csv[cols.sgst_rate] ||
            foundAddon.cgst_rate !== parent_csv[cols.cgst_rate] ||
            foundAddon.igst_rate !== parent_csv[cols.igst_rate] ||
            foundAddon.gst_inclusive !== parent_csv[cols.gst_inclusive] ||
            foundAddon.external_id !== parent_csv[cols.external_id] ||
            parent_csv[cols.is_deleted]
          ) {
            // if data is modified
            // chack if it is already medified in previous csv-row
            // ie: In database it was [South-india] then in csv-row-3: it became [South-Indian] and again in csv-row-5 it chaned to [South-Dish]
            if (foundAddon.updated_at) {
              errors.push({
                column_name: cols.addon_id,
                error: 'many update::',
                details: `Data1:[${parent_csv[cols.addon_name]}]
                Data2:[${foundAddon.name}]`,
              });
            } else {
              // If data is being updated first time
              // sync changes with Menu-JSON and add flag for "update"
              parent_csv.action_ad = 'update';
              foundAddon.name = parent_csv[cols.addon_name];

              foundAddon.menu_item_ids = parent_csv[cols.menu_item_ids];
              foundAddon.sequence = parent_csv[cols.sequence];
              foundAddon.price = parent_csv[cols.price];
              foundAddon.veg_egg_non = parent_csv[cols.veg_egg_non];
              foundAddon.in_stock = parent_csv[cols.in_stock];
              foundAddon.sgst_rate = parent_csv[cols.sgst_rate];
              foundAddon.cgst_rate = parent_csv[cols.cgst_rate];
              foundAddon.igst_rate = parent_csv[cols.igst_rate];
              foundAddon.gst_inclusive = parent_csv[cols.gst_inclusive];
              foundAddon.external_id = parent_csv[cols.external_id];

              foundAddon.updated_at = new Date();
              logger.debug('update addon', parent_csv[cols.addon_name]);
            }
          }
        }
      }
    } catch (error) {
      errors.push({column_name: 'N/A', error: error + ''});
    }
    // Push all the errors from this loop to csv-row index
    row_error[RowPrefix + parent_csv.csv_index] = errors;
  }

  let error = false;
  for (let i = 0; i < CsvRows.length; i++) {
    if (row_error[RowPrefix + i] && row_error[RowPrefix + i].length) {
      row_error['Row (' + (i + 2) + ')'] = row_error[RowPrefix + i];
      error = true;
    }
    delete row_error[RowPrefix + i];
  }
  if (error) {
    return {errors: row_error};
  }
  const errors: IColumnError[] = [];

  addonGroups.map(item => {
    const duplicate = addonGroups.filter(
      row => row.restaurant_id === item.restaurant_id && row.name === item.name
    );
    if (duplicate.length > 1) {
      errors.push({
        column_name: cols.addon_group_name,
        error: 'Duplicate',
        details: `Id:[${duplicate[0].id}]
       Name:[${duplicate[0].name}] `,
      });
    }
  });
  addons.map(item => {
    const duplicate = addons.filter(
      row =>
        row.addon_group_id === item.addon_group_id && row.name === item.name
    );
    if (duplicate.length > 1) {
      errors.push({
        column_name: cols.addon_name,
        error: 'Duplicate',
        details: `Id:[${duplicate[0].id}]
       Name:[${duplicate[0].name}] `,
      });
    }
  });

  if (errors.length) {
    return {errors: {other_errors: errors}};
  }

  const ProcessResult = {
    Addon_Group: {
      Created: 0,
      Modified: 0,
    },
    Addon: {
      Created: 0,
      Modified: 0,
    },
  };
  const trx = await getTransaction();
  try {
    const updateAddonGroupRows: IAddonGroup[] = [];
    const insertAddonGroupRows: IAddonGroup[] = [];
    addonGroups.map(row => {
      if (row.updated_at) {
        if (row.created_at) {
          const r = JSON.parse(JSON.stringify(row));
          delete r.id;
          insertAddonGroupRows.push(r);
        } else {
          updateAddonGroupRows.push(row);
        }
      }
    });
    if (updateAddonGroupRows.length) {
      await bulkUpdateAddonGroup(trx, updateAddonGroupRows);
      ProcessResult.Addon_Group.Modified = updateAddonGroupRows.length;
    }
    if (insertAddonGroupRows.length) {
      const resultAddonGroup = await bulkInsertAddonGroup(
        trx,
        insertAddonGroupRows
      );
      resultAddonGroup.map(newAddonGroup => {
        const oldAddonGroup = addonGroups.filter(addGrp => {
          return (
            newAddonGroup.name === addGrp.name &&
            newAddonGroup.restaurant_id === addGrp.restaurant_id
          );
        })[0];
        addons = addons.map(addon => {
          if (addon.addon_group_id === oldAddonGroup.id) {
            addon.addon_group_id = newAddonGroup.id;
          }
          return addon;
        });
        oldAddonGroup.id = newAddonGroup.id;
      });
      ProcessResult.Addon_Group.Created = insertAddonGroupRows.length;
    }

    const updateAddonRows: IAddon[] = [];
    const insertAddonRows: IAddon[] = [];

    addons.map(row => {
      if (row.updated_at) {
        const r = JSON.parse(JSON.stringify(row));
        delete r.menu_item_ids;
        if (row.created_at) {
          delete r.id;
          insertAddonRows.push(r);
        } else {
          updateAddonRows.push(r);
        }
      }
    });
    if (updateAddonRows.length) {
      await bulkUpdateAddon(trx, updateAddonRows);
      ProcessResult.Addon.Modified = updateAddonRows.length;
    }
    if (insertAddonRows.length) {
      const resultAddon = await bulkInsertAddon(trx, insertAddonRows);
      resultAddon.map(newAddon => {
        const oldAddon = addons.filter(addGrp => {
          return (
            newAddon.name === addGrp.name &&
            newAddon.addon_group_id === addGrp.addon_group_id
          );
        })[0];
        oldAddon.id = newAddon.id;
      });
      ProcessResult.Addon.Created = insertAddonRows.length;
    }
    const updateItemAddon: models.IItem_Addon[] = [];
    addons.map(row => {
      if (row.updated_at) {
        row.menu_item_ids?.map(item => {
          updateItemAddon.push({
            addon_id: row.id,
            menu_item_id: item,
          });
        });
      }
    });
    if (updateItemAddon.length) {
      await models.bulkUpdateItemAddon(trx, updateItemAddon);
    }
    await trx.commit();
  } catch (error) {
    await trx.rollback();
    logger.error('Addon Addon Group Import Transaction Error', error);
    throw new ResponseError(500, 'Error While Importing Data !!');
  }

  return ProcessResult;
}
async function processAddonUpload(menuDataStr: string) {
  const JsonData = await csvtojson()
    .fromString(menuDataStr)
    .on('error', () => {
      logger.error('#### Error in compiling');
    })
    .then(csvRow => {
      return csvRow;
    });
  const valid_column_check = await checkvalidcolumns(
    JsonData,
    addon_addon_group_cols
  );
  if (valid_column_check) {
    return valid_column_check;
  }
  const start = new Date().getMilliseconds();
  logger.debug('start process', start);
  const result = await precessAddonCsv(JsonData);
  const end = new Date().getMilliseconds();
  logger.debug('end process', end);
  logger.debug('diff', end - start);
  return result;
}
export async function uploadMenuItemAddon(req: Request, res: Response) {
  try {
    const result = await processAddonUpload(String(req.file?.buffer));
    return sendSuccess(res, 201, result);
  } catch (error) {
    return handleErrors(res, error);
  }
}
export async function downloadMenuItemAddon(req: Request, res: Response) {
  try {
    req.params.restaurant_id = req.params.restaurant_id || '';
    // const validation = joi_restaurant_id
    //   .required()
    //   .validate(req.params.restaurant_id);
    // if (validation.error)
    //   return sendError(res, 400, validation.error.details[0].message);

    const addons = await models_csv.exportAddons([req.params.restaurant_id]);

    const rows: string[] = [];
    addons.map(addon => {
      const addonRow: string[] = [];
      addonRow.push(addon.restaurant_id + '');
      addonRow.push(addon.menu_item_ids + '');
      addonRow.push(addon.addon_group_id + '');
      addonRow.push(addon.addon_group_name + '');
      addonRow.push(addon.addon_id + '');
      addonRow.push(addon.addon_name + '');
      addonRow.push(addon.sequence + '');
      addonRow.push(addon.price + '');
      addonRow.push(addon.veg_egg_non + '');
      addonRow.push(addon.in_stock ? '1' : '0');
      addonRow.push(addon.sgst_rate + '');
      addonRow.push(addon.cgst_rate + '');
      addonRow.push(addon.igst_rate + '');
      addonRow.push(addon.gst_inclusive ? '1' : '0');
      addonRow.push(''); //delete
      addonRow.push(addon.external_id || '');
      rows.push(arrToCsvRow(addonRow));
    });

    const headerArray: string[] = [];
    for (const [key, value] of Object.entries(addon_addon_group_cols)) {
      if (key && value) headerArray.push(value);
    }
    const headers_str = headerArray.join(',');
    const rows_str = rows.join('\n');
    const result = headers_str + '\n' + rows_str;
    res.setHeader('Content-type', 'application/octet-stream');
    res.setHeader(
      'Content-disposition',
      'attachment; filename=addon_addon_group.csv'
    );
    return res.send(result);
  } catch (error) {
    return handleErrors(res, error);
  }
}
export async function s3uploadMenuItemAddon(req: Request, res: Response) {
  try {
    const validation = models.schema_upload_file.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = validation.value;

    const menuDataStr = await getTempFileData(validated_req.csv_file_name);
    const result = await processAddonUpload(menuDataStr);
    if (result.errors) {
      return sendError(res, 400, [
        {
          code: 0,
          message: 'Error found in uploaded file',
          data: result.errors,
        },
      ]);
    }

    return sendSuccess(res, 201, result);
  } catch (error) {
    return handleErrors(res, error);
  }
}

//
//  Item Addon Group
//
const item_addon_group_cols = {
  restaurant_id: 'Restaurant_Id',
  menu_item_id: 'Item_Id',
  addon_group_id: 'AddonGroup_Id',
  addon_group_name: 'AddonGroup_Name',
  max_limit: 'Max_Limit',
  min_limit: 'Min_Limit',
  free_limit: 'Free_Limit',
  sequence: 'Order',
};
interface IAddonGroupCsvResponse {
  errors?: {[key: string]: IColumnError[]};
  Item_Addon_Group?: {
    Created: number;
    Modified: number;
  };
}
async function precessItemAddonGroupCsv(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  CsvRows: any[]
): Promise<IAddonGroupCsvResponse> {
  /**

   delete from item_addon_group;

   drop table item_addon_group;
   delete from knex_migrations where name like '%item_addon_group.ts'

   */
  const cols = item_addon_group_cols;

  const RowPrefix = 'Row_Num_';
  const row_error: {
    [key: string]: IColumnError[];
  } = {};

  // collect Restaurants data from database for all the Restaurant ids in csv file
  const restaurantIds = CsvRows.map(
    (item: {[x: string]: string}) => item[cols.restaurant_id]
  );
  const restaurants = await models_csv.readRestaurantsByIds(restaurantIds);
  const menuItems = await models.readMenuItemByRestaurantIds(restaurantIds);
  const addonGroups = await readAddonGroupByRestaurantIds(restaurantIds);
  const menu_item_Ids = menuItems.map(item => item.id);
  const itemAddonGroups = await readItemAddonGroupByItemIds(menu_item_Ids);

  const updateItemAddonGroupRows: IItem_AddonGroup[] = [];
  const insertItemAddonGroupRows: IItem_AddonGroup[] = [];

  for (let cntr = 0; cntr < CsvRows.length; cntr++) {
    const parent_csv = CsvRows[cntr];
    parent_csv.csv_index = cntr;
    const errors: IColumnError[] = [];

    if (!parent_csv[cols.restaurant_id]) {
      errors.push({column_name: cols.restaurant_id, error: 'empty'});
    }
    const foundRestaurant = restaurants.filter(
      rest => rest.id === parent_csv[cols.restaurant_id]
    )[0];
    if (!foundRestaurant) {
      errors.push({column_name: cols.restaurant_id, error: 'invalid'});
    }

    if (!parent_csv[cols.menu_item_id]) {
      errors.push({column_name: cols.menu_item_id, error: 'empty'});
    } else {
      parent_csv[cols.menu_item_id] = parseInt(parent_csv[cols.menu_item_id]);
    }
    const foundMenuItem = menuItems.filter(
      item =>
        item.id === parent_csv[cols.menu_item_id] &&
        item.restaurant_id === parent_csv[cols.restaurant_id]
    )[0];
    if (!foundMenuItem) {
      errors.push({column_name: cols.menu_item_id, error: 'invalid'});
    }
    if (!parent_csv[cols.addon_group_id]) {
      const foundAddonGroup = addonGroups.filter(
        addongroup =>
          addongroup.name === parent_csv[cols.addon_group_name] &&
          addongroup.restaurant_id === parent_csv[cols.restaurant_id]
      )[0];
      if (!foundAddonGroup) {
        errors.push({column_name: cols.addon_group_id, error: 'invalid'});
      } else {
        parent_csv[cols.addon_group_id] = foundAddonGroup.id;
      }
    } else if (
      parent_csv[cols.addon_group_id] &&
      isNaN(parent_csv[cols.addon_group_id])
    ) {
      errors.push({column_name: cols.addon_group_id, error: 'invalid/empty'});
    } else {
      parent_csv[cols.addon_group_id] = parseInt(
        parent_csv[cols.addon_group_id]
      );
      const foundAddonGroup = addonGroups.filter(
        addongroup => addongroup.id === parent_csv[cols.addon_group_id]
      )[0];
      if (!foundAddonGroup) {
        errors.push({column_name: cols.addon_group_id, error: 'invalid'});
      }
      if (!parent_csv[cols.addon_group_name])
        parent_csv[cols.addon_group_name] = foundAddonGroup.name;
      if (
        foundAddonGroup &&
        foundAddonGroup.name !== parent_csv[cols.addon_group_name]
      ) {
        errors.push({column_name: cols.addon_group_id, error: 'invalid'});
      }
    }
    if (!parent_csv[cols.addon_group_name]) {
      errors.push({column_name: cols.addon_group_name, error: 'invalid/empty'});
    }

    if (!parent_csv[cols.max_limit] || isNaN(parent_csv[cols.max_limit])) {
      errors.push({column_name: cols.max_limit, error: 'invalid/empty'});
    } else {
      parent_csv[cols.max_limit] = parseInt(parent_csv[cols.max_limit]);
    }

    if (!parent_csv[cols.min_limit] || isNaN(parent_csv[cols.min_limit])) {
      errors.push({column_name: cols.min_limit, error: 'invalid/empty'});
    } else {
      parent_csv[cols.min_limit] = parseInt(parent_csv[cols.min_limit]);
    }

    if (!parent_csv[cols.free_limit] || isNaN(parent_csv[cols.free_limit])) {
      errors.push({column_name: cols.free_limit, error: 'invalid/empty'});
    } else {
      parent_csv[cols.free_limit] = parseInt(parent_csv[cols.free_limit]);
    }

    if (!parent_csv[cols.sequence] || isNaN(parent_csv[cols.sequence])) {
      errors.push({column_name: cols.sequence, error: 'invalid/empty'});
    } else {
      parent_csv[cols.sequence] = parseInt(parent_csv[cols.sequence]);
    }
    const foundDuplicateIetmAddonGroup = CsvRows.filter(item => {
      return (
        item.menu_item_id === parent_csv[cols.menu_item_id] &&
        item.addon_group_id === parent_csv[cols.addon_group_id]
      );
    });
    if (foundDuplicateIetmAddonGroup.length > 1) {
      errors.push({
        column_name: 'Record',
        error: 'Duplicate Item and Addon Group Entry',
      });
    }
    const foundItemAddonGroup = itemAddonGroups.filter(item => {
      return (
        item.menu_item_id === parent_csv[cols.menu_item_id] &&
        item.addon_group_id === parent_csv[cols.addon_group_id]
      );
    })[0];
    if (foundItemAddonGroup) {
      if (
        foundItemAddonGroup.max_limit !== parent_csv[cols.max_limit] ||
        foundItemAddonGroup.min_limit !== parent_csv[cols.min_limit] ||
        foundItemAddonGroup.free_limit !== parent_csv[cols.free_limit] ||
        foundItemAddonGroup.sequence !== parent_csv[cols.sequence]
      )
        updateItemAddonGroupRows.push({
          menu_item_id: parent_csv[cols.menu_item_id],
          addon_group_id: parent_csv[cols.addon_group_id],
          max_limit: parent_csv[cols.max_limit],
          min_limit: parent_csv[cols.min_limit],
          free_limit: parent_csv[cols.free_limit],
          sequence: parent_csv[cols.sequence],
        });
    } else {
      insertItemAddonGroupRows.push({
        menu_item_id: parent_csv[cols.menu_item_id],
        addon_group_id: parent_csv[cols.addon_group_id],
        max_limit: parent_csv[cols.max_limit],
        min_limit: parent_csv[cols.min_limit],
        free_limit: parent_csv[cols.free_limit],
        sequence: parent_csv[cols.sequence],
      });
    }
    row_error[RowPrefix + cntr] = errors;
  }

  let error = false;
  for (let i = 0; i < CsvRows.length; i++) {
    if (row_error[RowPrefix + i] && row_error[RowPrefix + i].length) {
      row_error['Row (' + (i + 2) + ')'] = row_error[RowPrefix + i];
      error = true;
    }
    delete row_error[RowPrefix + i];
  }
  if (error) {
    return {errors: row_error};
  }

  const errors: IColumnError[] = [];
  const newitemAddonGroups = [
    ...updateItemAddonGroupRows,
    ...insertItemAddonGroupRows,
  ];
  newitemAddonGroups.map(item => {
    const duplicate = newitemAddonGroups.filter(
      row =>
        row.menu_item_id === item.menu_item_id &&
        row.addon_group_id === item.addon_group_id
    );
    if (duplicate.length > 1) {
      errors.push({
        column_name: 'Addon Group Id || Menu Item Id',
        error:
          'Duplicate :: ' + item.addon_group_id + ' :: ' + item.menu_item_id,
      });
    }
  });
  if (errors.length) {
    return {errors: {other_errors: errors}};
  }

  const ProcessResult = {
    Item_Addon_Group: {
      Created: 0,
      Modified: 0,
    },
  };
  const trx = await getTransaction();
  try {
    if (updateItemAddonGroupRows.length) {
      await bulkUpdateItemAddonGroup(trx, updateItemAddonGroupRows);
      ProcessResult.Item_Addon_Group.Modified = updateItemAddonGroupRows.length;
    }
    if (insertItemAddonGroupRows.length) {
      await bulkInsertItemAddonGroup(trx, insertItemAddonGroupRows);
      ProcessResult.Item_Addon_Group.Created = insertItemAddonGroupRows.length;
    }
    await trx.commit();
  } catch (error) {
    await trx.rollback();
    logger.error('Item Addon Group Mapping import Transaction Error', error);
    throw new ResponseError(500, 'Error While Importing Data !!');
  }

  return ProcessResult;
}
async function processItemAddonGroupUpload(menuDataStr: string) {
  const JsonData = await csvtojson()
    .fromString(menuDataStr)
    .on('error', () => {
      logger.error('#### Error in compiling');
    })
    .then(csvRow => {
      return csvRow;
    });
  const valid_column_check = await checkvalidcolumns(
    JsonData,
    item_addon_group_cols
  );
  if (valid_column_check) {
    return valid_column_check;
  }
  const start = new Date().getMilliseconds();
  logger.debug('start process', start);
  const result = await precessItemAddonGroupCsv(JsonData);
  const end = new Date().getMilliseconds();
  logger.debug('end process', end);
  logger.debug('diff', end - start);
  return result;
}
export async function uploadMenuItemAddonGroup(req: Request, res: Response) {
  try {
    const result = await processItemAddonGroupUpload(String(req.file?.buffer));
    return sendSuccess(res, 201, result);
  } catch (error) {
    return handleErrors(res, error);
  }
}
export async function downloadMenuItemAddonGroup(req: Request, res: Response) {
  try {
    req.params.restaurant_id = req.params.restaurant_id || '';
    // const validation = joi_restaurant_id
    //   .required()
    //   .validate(req.params.restaurant_id);
    // if (validation.error)
    //   return sendError(res, 400, validation.error.details[0].message);

    const addons = await models_csv.exportItemAddonGroup([
      req.params.restaurant_id,
    ]);

    const rows: string[] = [];
    addons.map(addon => {
      const addonRow: string[] = [];
      addonRow.push(addon.restaurant_id + '');
      addonRow.push(addon.menu_item_id + '');
      addonRow.push(addon.addon_group_id + '');
      addonRow.push(addon.addon_group_name + '');
      addonRow.push((addon.max_limit || 0) + '');
      addonRow.push((addon.min_limit || 0) + '');
      addonRow.push((addon.free_limit || 0) + '');
      addonRow.push((addon.sequence || 0) + '');
      rows.push(arrToCsvRow(addonRow));
    });

    const headerArray: string[] = [];
    for (const [key, value] of Object.entries(item_addon_group_cols)) {
      if (key && value) headerArray.push(value);
    }
    const headers_str = headerArray.join(',');
    const rows_str = rows.join('\n');
    const result = headers_str + '\n' + rows_str;
    res.setHeader('Content-type', 'application/octet-stream');
    res.setHeader(
      'Content-disposition',
      'attachment; filename=item_addon_group.csv'
    );
    return res.send(result);
  } catch (error) {
    return handleErrors(res, error);
  }
}
export async function s3uploadMenuItemAddonGroup(req: Request, res: Response) {
  try {
    const validation = models.schema_upload_file.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = validation.value;
    const menuDataStr = await getTempFileData(validated_req.csv_file_name);

    const result = await processItemAddonGroupUpload(menuDataStr);
    if (result.errors) {
      return sendError(res, 400, [
        {
          code: 0,
          message: 'Error found in uploaded file',
          data: result.errors,
        },
      ]);
    }

    return sendSuccess(res, 201, result);
  } catch (error) {
    return handleErrors(res, error);
  }
}
export async function checkvalidcolumns(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  jsonData: any[],
  valid_column: {[key: string]: string}
) {
  const input_keys: string[] = [];
  const valid_keys: string[] = [];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for (const [key, value] of Object.entries(jsonData[0])) {
    input_keys.push(key);
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for (const [key, value] of Object.entries(valid_column)) {
    valid_keys.push(value);
  }
  const missingColumns = valid_keys.filter(item => !input_keys.includes(item));
  const extraColumns = input_keys.filter(item => !valid_keys.includes(item));

  if (missingColumns.length > 0 || extraColumns.length > 0) {
    const errors: IColumnError[] = [];

    errors.push({
      column_name: 'Row_Num_0',
      error: 'Invalid File Structure',
      details: {missingColumns, extraColumns},
    });

    if (errors.length) {
      return {errors: {headers_errors: errors}};
    }

    return {
      valid_column_check: {errors},
    };
  } else return null;
}
