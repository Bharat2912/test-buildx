import logger from '../../../../../utilities/logger/winston_logger';
import ResponseError from '../../../../../utilities/response_error';
import {getNextAvailableSlot, readMenuItems} from '../../../menu/models';
import {ICartAddonGroup, ICartMenuITem, IPutCartMenuItem} from '../../types';
import {validateAddonGroups} from './addons_validation';
import {validateVariantGroups} from './variants_validation';
import {IRestaurant} from '../../../restaurant/models';
import {roundUp} from '../../../../../utilities/utilFuncs';
import {calculateMenuItemDisplayPrice} from '../../../menu/controller';

export async function validateMenuItems(
  restaurant: IRestaurant,
  menu_items: IPutCartMenuItem[]
) {
  let menuItemsAvailable = true;
  let menuItemsCount = 0;
  const unavailableMenuItems = [];

  //get detailed information of menu items from databse
  const userSelectedMenuItemsIds = menu_items.map(
    (item: IPutCartMenuItem) => item.menu_item_id
  );
  const menuItemsData = await readMenuItems(userSelectedMenuItemsIds);
  menuItemsData.map(mi => {
    calculateMenuItemDisplayPrice(
      mi,
      mi.menu_item_discount_rate ||
        mi.sub_category_discount_rate ||
        mi.main_category_discount_rate ||
        restaurant.discount_rate ||
        0
    );
  });
  const inValidItems: number[] = [];
  const menuItemsIds: number[] = [];
  menuItemsData.map((item: ICartMenuITem) => {
    if (item.restaurant_id !== restaurant.id) {
      inValidItems.push(item.menu_item_id!);
    }
    menuItemsIds.push(item.menu_item_id!);
  });

  //check for invalid items
  inValidItems.push(
    ...userSelectedMenuItemsIds.filter(
      (item: number) => !menuItemsIds.includes(item)
    )
  );

  if (inValidItems.length > 0) {
    logger.error(
      `CART_VALIDATION_FAILED: invalid_menu_items_found_in_cart_${inValidItems}`
    );
    throw new ResponseError(400, [
      {message: `invalid_menu_items_found_in_cart_${inValidItems}`, code: 1006},
    ]);
  }

  const validatedMenuItems = [];
  //validate each menu item
  for (let item = 0; item < menu_items.length; item++) {
    let totalMenuItemCostWithoutTax = 0;
    let totalMenuItemTax = 0;
    let nextAvailableAt;
    let menuItemAvailable = true;
    let menuItemUnavailableAddons: number[] = [];
    let menuItemUnavailableVariants: number[] = [];
    const databaseMenuItemData = menuItemsData.find(
      (menuitem: ICartMenuITem) =>
        menuitem.menu_item_id === menu_items[item].menu_item_id
    );

    // user selected menu Items
    const menuItem: IPutCartMenuItem = JSON.parse(
      JSON.stringify(menu_items[item])
    );

    //menu item data from database
    const dbMenuItemData: ICartMenuITem = JSON.parse(
      JSON.stringify(databaseMenuItemData)
    );
    dbMenuItemData.sequence = item + 1;
    if (menuItem) {
      if (dbMenuItemData.disable) {
        menuItemAvailable = false;
      }
      const startDateTime = new Date();
      /**we need to wrap dbMenuItemData.next_available_after in new Date() because
      dbMenuItemData.next_available_after is string type for date comparision we need
      both values to be dates
      */
      if (
        dbMenuItemData.next_available_after &&
        dbMenuItemData.next_available_after !== null &&
        new Date(dbMenuItemData.next_available_after) > startDateTime
      ) {
        menuItemAvailable = false;
      } else if (
        dbMenuItemData.menu_item_slots &&
        dbMenuItemData.menu_item_slots !== null &&
        dbMenuItemData.menu_item_slots.length > 0
      ) {
        nextAvailableAt = getNextAvailableSlot(
          startDateTime,
          dbMenuItemData.menu_item_slots
        );
        dbMenuItemData.next_available_at = nextAvailableAt.toDate();
        if (nextAvailableAt.toDate() > startDateTime) {
          menuItemAvailable = false;
        }
      }

      dbMenuItemData.quantity = menuItem.quantity;
      menuItemsCount += menuItem.quantity;
      // if menuitem is valid and menu items dont have any variants available in DB
      if (dbMenuItemData.variant_groups === null) {
        // if no variants available and still passed in request then throw error
        if (menuItem.variant_groups && menuItem.variant_groups.length > 0) {
          logger.error(
            `CART_VALIDATION_FAILED: variants_dont_exist_for_selected_menu_item menu_item_id: ${[
              dbMenuItemData.menu_item_id,
            ]}`
          );
          throw new ResponseError(400, [
            {
              message: `variants dont exist for ${[
                dbMenuItemData.menu_item_name,
              ]}`,
              code: 1007,
            },
          ]);
        }
        dbMenuItemData.variant_groups = [];
      } // if menuitem is valid and menu item have variants available in DB
      else if (
        dbMenuItemData.variant_groups &&
        dbMenuItemData.variant_groups.length > 0
      ) {
        //check if variant_grps are passed in requests or not
        if (menuItem.variant_groups && menuItem.variant_groups.length > 0) {
          //if passed then is total variant grps count is equal to db variants grps
          if (
            menuItem.variant_groups.length <
            dbMenuItemData.variant_groups.length
          ) {
            logger.error(
              `CART_VALIDATION_FAILED: all_variants_not_selected_for_selected_menu_item menu_item_id: ${[
                dbMenuItemData.menu_item_id,
              ]}`
            );
            throw new ResponseError(400, [
              {
                message: `Please select all variants for ${[
                  dbMenuItemData.menu_item_name,
                ]}`,
                code: 1008,
              },
            ]);
          }

          const {
            databaseVariantGroups,
            variantsCount,
            variantsInStock,
            unavailableVariants,
            totalVariantsCostWithoutTax,
          } = await validateVariantGroups(
            dbMenuItemData.variant_groups,
            menuItem.variant_groups
          );

          if (!variantsInStock) {
            menuItemUnavailableVariants = unavailableVariants;
            menuItemAvailable = false;
          }

          totalMenuItemCostWithoutTax += totalVariantsCostWithoutTax;
          dbMenuItemData.variants_total_cost_without_tax =
            totalVariantsCostWithoutTax;
          dbMenuItemData.variants_instock = variantsInStock;
          dbMenuItemData.variants_count = variantsCount;
          dbMenuItemData.variant_groups = databaseVariantGroups;
        } else {
          //variant groups exists but not provided
          logger.error(
            `CART_VALIDATION_FAILED: variant_groups_and_its_variants_not_provided_for_selected_menu_item menu_item_id: ${dbMenuItemData.menu_item_id}`
          );

          throw new ResponseError(400, [
            {
              message: `variant_groups_and_its_variants_not_provided_for_selected_menu_item_${[
                dbMenuItemData.menu_item_name,
              ]}`,
              code: 1009,
            },
          ]);
        }
      }

      if (dbMenuItemData.addon_groups === null) {
        if (menuItem.addon_groups && menuItem.addon_groups.length > 0) {
          logger.error(
            `CART_VALIDATION_FAILED: addons_dont_exist_for_selected_menu_item menu_item_id: ${[
              dbMenuItemData.menu_item_id,
            ]}`
          );
          throw new ResponseError(400, [
            {
              message: `addons dont exist for ${[
                dbMenuItemData.menu_item_name,
              ]}`,

              code: 1014,
            },
          ]);
        }
        dbMenuItemData.addon_groups = [];
      } else if (
        dbMenuItemData.addon_groups &&
        dbMenuItemData.addon_groups.length > 0
      ) {
        if (menuItem.addon_groups && menuItem.addon_groups.length > 0) {
          const {
            databaseAddonGroups,
            addonsCount,
            addonsInStock,
            unavailableAddons,
            totalAddonsCostWithoutTax,
            totalAddonsTax,
          } = validateAddonGroups(
            dbMenuItemData.addon_groups,
            menuItem.addon_groups
          );

          if (!addonsInStock) {
            menuItemUnavailableAddons = unavailableAddons;
            menuItemAvailable = false;
          }

          totalMenuItemTax += totalAddonsTax;
          totalMenuItemCostWithoutTax += totalAddonsCostWithoutTax;
          dbMenuItemData.addons_total_cost_without_tax =
            totalAddonsCostWithoutTax;
          dbMenuItemData.addons_total_tax = totalAddonsTax;
          dbMenuItemData.addons_instock = addonsInStock;
          dbMenuItemData.addons_count = addonsCount;
          dbMenuItemData.addon_groups = databaseAddonGroups;
        } else {
          //if no addons are selected, then we by default make all addon groups is_selected as false
          dbMenuItemData.addon_groups.forEach(
            (addonGroup: ICartAddonGroup) => (addonGroup.is_selected = false)
          );
        }
      }
    }

    //calculate addons tax + menu items tax + service charge for specific item
    if (dbMenuItemData.price !== undefined) {
      if (!dbMenuItemData.item_inclusive) {
        if (
          dbMenuItemData.item_sgst_utgst !== undefined &&
          dbMenuItemData.item_cgst !== undefined &&
          dbMenuItemData.item_igst !== undefined
        ) {
          totalMenuItemTax +=
            (dbMenuItemData.price / 100) *
            (dbMenuItemData.item_sgst_utgst +
              dbMenuItemData.item_cgst +
              dbMenuItemData.item_igst);
        } else {
          logger.error(
            `CART_VALIDATION_FAILED: invalid_menu_item_tax_price menu_item_id: ${dbMenuItemData.menu_item_id}`
          );
          throw new ResponseError(400, [
            {
              message: `invalid_tax_price_for_${dbMenuItemData.menu_item_name}`,
              code: 1015,
            },
          ]);
        }
      }

      //totalMenuItemTax = menu_item_tax + menu_item_addon_tax for one item

      //total_tax = ( menu_item_tax + menu_item_addon_tax for one item ) x total_quantity
      dbMenuItemData.total_tax = roundUp(
        totalMenuItemTax * dbMenuItemData.quantity,
        2
      );

      let sub_total = 0;
      //totalMenuItemCostWithoutTax = variants price + addons price
      //subtotal = variants price + addons price + menu item price for one item
      sub_total += totalMenuItemCostWithoutTax + dbMenuItemData.price;

      //if service charges are applicable then add
      if (dbMenuItemData.service_charges !== undefined) {
        //service charges for one menu item
        sub_total +=
          (dbMenuItemData.price / 100) * dbMenuItemData.service_charges;
      }

      //total_cost =  (menu_item_price + menu_item service charge + varints_price + addons_price for one item ) x total_quantity
      dbMenuItemData.total_cost_without_tax = roundUp(
        sub_total * dbMenuItemData.quantity,
        2
      );
    } else {
      logger.error(
        `CART_VALIDATION_FAILED: invalid_menu_item_price menu_item_id: ${dbMenuItemData.menu_item_id}`
      );
      throw new ResponseError(400, [
        {
          message: `invalid_price_for_${dbMenuItemData.menu_item_name}`,
          code: 1016,
        },
      ]);
    }

    //calculate packing charges for specific item
    // let packing_charges = 0;
    // if (
    //   restaurant.packing_charge_type === 'order' &&
    //   restaurant.packing_charge_order?.packing_charge
    // ) {
    //   packing_charges = restaurant.packing_charge_order?.packing_charge;
    // } else if (
    //   restaurant.packing_charge_type === 'item' &&
    //   dbMenuItemData.packing_charges
    // ) {
    //   packing_charges +=
    //     dbMenuItemData.packing_charges * dbMenuItemData.quantity;
    // } else {
    //   packing_charges = 0;
    // }
    // dbMenuItemData.packing_charges = packing_charges;
    dbMenuItemData.in_stock = menuItemAvailable;
    if (!menuItemAvailable) {
      unavailableMenuItems.push({
        menu_item_id: dbMenuItemData.menu_item_id,
        variants: menuItemUnavailableVariants,
        addons: menuItemUnavailableAddons,
      });
      menuItemsAvailable = false;
    }

    validatedMenuItems.push(dbMenuItemData);
  }

  const result: {
    menu_items_available: boolean;
    menu_items: ICartMenuITem[];
    menu_items_count: number;
    unavailableMenuItems?: {
      menu_item_id: number;
      variants: number[];
      addons: number[];
    }[];
  } = {
    menu_items_available: menuItemsAvailable,
    menu_items: validatedMenuItems,
    menu_items_count: menuItemsCount,
  };

  if (!menuItemsAvailable) {
    result.unavailableMenuItems = unavailableMenuItems;
  }

  return result;
}
