import {Knex} from 'knex';
import {getDayStart} from '../../../utilities/date_time';
import logger from '../../../utilities/logger/winston_logger';
import {
  bulkSoftDeleteAddons,
  readAddonByAddonGroupIdsForUpdate,
  bulkRemovePosDetailsFromAddon,
  readPosAddonByAddonGroupIdsForUpdate,
} from '../menu/addon/models';
import {
  bulkSoftDeleteAddonGroups,
  readAddonGroupByRestaurantIdForUpdate,
  bulkRemovePosDetailsFromAddonGroup,
  readPosAddonGroupByRestaurantIdForUpdate,
} from '../menu/addon_group/models';
import {clearItemAddonGroups} from '../menu/item_addon_group/models';
import {
  bulkSoftDeleteMainCategories,
  readMainCategorieByRestaurantIdForUpdate,
  bulkRemovePosDeatilsFromMainCategories,
  readPosMainCategorieByRestaurantIdForUpdate,
} from '../menu/main_category/models';
import {
  bulkSoftDeleteMenuItems,
  clearItemAddon,
  readMenuItemByRestaurantIdForUpdate,
  bulkRemovePosDetailsFromMenuItems,
  readPosMenuItemByRestaurantIdForUpdate,
} from '../menu/models';
import {
  bulkSoftDeleteSubCategories,
  readSubCategoryByMainCategoryIdsForUpdate,
  bulkRemovePosDetailsFromSubCategories,
  readPosSubCategoryByMainCategoryIdsForUpdate,
} from '../menu/sub_category/models';
import {
  bulkDeleteVariant,
  bulkRemovePosDetailsFromVariant,
  readPosVariantByVariantGroupIdsForUpdate,
  readVariantByVariantGroupIdsForUpdate,
} from '../menu/variant/models';
import {
  bulkDeleteVariantGroup,
  bulkRemovePosDetailsFromVariantGroup,
  readPosVariantGroupByMenuItemIdsForUpdate,
  readVariantGroupByMenuItemIdsForUpdate,
} from '../menu/variant_group/models';
import ResponseError from '../../../utilities/response_error';
import {
  actionVendorOrderAccept,
  actionVendorOrderReady,
} from '../order/controller';
import {OrderAcceptanceStatus} from '../order/enums';
import {readVendorOrders} from '../order/models';
import {setRestaurantAvailability} from '../restaurant/service';
import {
  createHolidaySlot,
  deleteHolidaySlot,
  IHolidaySlot,
  IRestaurant_Basic,
} from '../restaurant/models';
import {PosOrderStatus} from './enum';
import {
  addItemsHolidaySlot,
  addAddonsHolidaySlot,
  deleteAddonsHolidaySlot,
  deleteItemsHolidaySlot,
  getVariantByVariantItemPosId,
  deleteVariantsHolidaySlot,
  addVariantsHolidaySlot,
} from './model';
import {IPetPoojaUpdateOrderReq} from './types';
import {PosPartner} from '../enum';
import {sendEmail} from '../../../utilities/utilFuncs';
import Globals from '../../../utilities/global_var/globals';
import {Service} from '../../../enum';
import {getRestaurantVendors} from '../../../utilities/user_api';

export async function setRestaurantStatus(
  trx: Knex.Transaction,
  restaurant: IRestaurant_Basic,
  pos_stauts: 1 | 0,
  reason: string
) {
  logger.debug('setRestaurantStatus', {
    restaurant,
    pos_stauts,
    reason,
  });
  const restaurant_vendors = await getRestaurantVendors(restaurant.id);
  const restaurant_vendor =
    restaurant_vendors.find(vendor => {
      vendor.role === 'owner';
    }) || restaurant_vendors[0];
  if (pos_stauts === 1) {
    await deleteHolidaySlot(trx, restaurant.id);
  } else {
    const open_after = getDayStart();
    open_after.setMinutes(open_after.getMinutes() + 1);
    open_after.setDate(open_after.getDate() + 1);
    const holiday_data = <IHolidaySlot>{
      created_by: 'VENDOR_' + restaurant_vendor.id,
      restaurant_id: restaurant.id,
      open_after: open_after,
    };
    await createHolidaySlot(trx, holiday_data);
  }
}
export async function getRestaurantServiceableStatus(
  restaurant: IRestaurant_Basic
) {
  logger.debug('getRestaurantStatus', {
    restaurant,
  });
  const restaurant_with_slot = (
    await setRestaurantAvailability([restaurant])
  )[0];
  return restaurant_with_slot.availability!.is_open;
}

export async function setItemHolidaySlot(
  trx: Knex.Transaction,
  restaurant_id: string,
  pos_item_ids: string[],
  holiday_slot_end_time: Date
) {
  logger.debug('setItemHolidaySlot', {
    restaurant_id,
    pos_item_ids,
    holiday_slot_end_time,
  });
  try {
    holiday_slot_end_time = new Date(holiday_slot_end_time);
    const current_time = new Date();
    current_time.setMinutes(current_time.getMinutes() + 5);
    if (holiday_slot_end_time < current_time) {
      throw new ResponseError(
        400,
        'holiday_slot_end_time is less than current time'
      );
    }
    const variants = await getVariantByVariantItemPosId(pos_item_ids);
    if (variants && variants.length) {
      await addVariantsHolidaySlot(trx, pos_item_ids, holiday_slot_end_time);
    }
    const item_ids: string[] = [];
    pos_item_ids.filter(id => {
      if (!variants.find(variant => variant.pos_variant_item_id === id)) {
        item_ids.push(id);
      }
    });
    if (item_ids.length) {
      const updatedItems = await addItemsHolidaySlot(
        trx,
        restaurant_id,
        item_ids,
        holiday_slot_end_time
      );
      return updatedItems;
    } else return null;
  } catch (error) {
    if (error instanceof ResponseError) {
      throw error;
    }
    logger.error('Create Item Holiday Slot Transaction Failed', error);
    throw 'Create Item Holiday Slot Transaction Failed';
  }
}
export async function deleteItemHolidaySlot(
  trx: Knex.Transaction,
  restaurant_id: string,
  pos_item_ids: string[]
) {
  logger.debug('deleteItemHolidaySlot', {restaurant_id, pos_item_ids});
  try {
    const variants = await getVariantByVariantItemPosId(pos_item_ids);
    if (variants && variants.length) {
      await deleteVariantsHolidaySlot(trx, pos_item_ids);
    }
    const item_ids: string[] = [];
    pos_item_ids.filter(id => {
      if (!variants.find(variant => variant.pos_variant_item_id === id)) {
        item_ids.push(id);
      }
    });
    if (item_ids.length) {
      const updatedItems = await deleteItemsHolidaySlot(
        trx,
        restaurant_id,
        item_ids
      );
      return updatedItems;
    } else return null;
  } catch (error) {
    logger.error('delete Item holiday Transaction Failed', error);
    throw 'delete Item holiday Transaction Failed';
  }
}
export async function setAddonHolidaySlot(
  trx: Knex.Transaction,
  restaurant_id: string,
  addon_ids: string[],
  holiday_slot_end_time: Date
) {
  logger.debug('setAddonHolidaySlot', {
    restaurant_id,
    addon_ids,
    holiday_slot_end_time,
  });
  holiday_slot_end_time = new Date(holiday_slot_end_time);
  const current_time = new Date();
  current_time.setMinutes(current_time.getMinutes() + 5);
  if (holiday_slot_end_time < current_time) {
    throw new ResponseError(
      400,
      'holiday_slot_end_time is less than current time'
    );
  }
  await addAddonsHolidaySlot(trx, addon_ids, holiday_slot_end_time);
}
export async function deleteAddonHolidaySlot(
  trx: Knex.Transaction,
  restaurant_id: string,
  addon_ids: string[]
) {
  logger.debug('deleteAddonHolidaySlot', {restaurant_id, addon_ids});
  await deleteAddonsHolidaySlot(trx, addon_ids);
}

export async function updateOrder(
  trx: Knex.Transaction,
  restaurant: IRestaurant_Basic,
  order_data: IPetPoojaUpdateOrderReq
) {
  logger.debug('Update Order Status', {
    restaurant,
    order_data,
  });
  //  Cancelled, 1/2/3 = Accepted, 4 = Dispatch, 5 = Food Ready,10 = Delivered
  const order = (
    await readVendorOrders([+order_data.orderID], restaurant.id)
  )[0];
  const restaurant_vendors = await getRestaurantVendors(restaurant.id);
  const restaurant_vendor =
    restaurant_vendors.find(vendor => {
      vendor.role === 'owner';
    }) || restaurant_vendors[0];
  if (
    order.order_acceptance_status === OrderAcceptanceStatus.PENDING &&
    order_data.status === PosOrderStatus.CANCELLED
  ) {
    // Order Rejected
    await actionVendorOrderAccept(
      trx,
      restaurant,
      order,
      false,
      restaurant_vendor.id,
      order_data.minimum_prep_time,
      order_data.cancel_reason
    );
  } else if (
    // accepted status 1,2,3 are all same according to petpooja
    order.order_acceptance_status === OrderAcceptanceStatus.PENDING &&
    (order_data.status === PosOrderStatus.ACCEPTED_STATUS_1 ||
      order_data.status === PosOrderStatus.ACCEPTED_STATUS_2 ||
      order_data.status === PosOrderStatus.ACCEPTED_STATUS_3)
  ) {
    // Order Accepted
    await actionVendorOrderAccept(
      trx,
      restaurant,
      order,
      true,
      restaurant_vendor.id,
      order_data.minimum_prep_time,
      order_data.cancel_reason
    );
  } else if (order_data.status === PosOrderStatus.FOODREADY) {
    // Order Marked Ready
    await actionVendorOrderReady(trx, order);
  } else {
    await sendEmail(
      'AdminAlertEmailTemplate',
      await Globals.BACKEND_TEAM_EMAIL.get(),
      {
        subject: 'Petpooja update order status api error',
        application_name: Service.FOOD_API,
        error_details:
          'Unhandled petpooja order status received in update order',
        priority: 'high',
        time: new Date().toDateString(),
        meta_details: {order_data},
      }
    );
  }
}

export async function deleteRestaurantMenu(
  trx: Knex.Transaction,
  restaurant_id: string
): Promise<{
  deleted_main_categories: number;
  deleted_sub_categories: number;
  deleted_menu_items: number;
  deleted_variant_group: number;
  deleted_variants: number;
  deleted_addon_groups: number;
  deleted_addons: number;
  deleted_item_addon_groups: number;
  deleted_item_addons: number;
}> {
  //*read

  const main_categories = await readMainCategorieByRestaurantIdForUpdate(
    trx,
    restaurant_id
  );
  const main_category_ids: number[] = main_categories.map(mc => mc.id!);

  const sub_categories = await readSubCategoryByMainCategoryIdsForUpdate(
    trx,
    main_category_ids
  );
  const sub_category_ids: number[] = sub_categories.map(sc => sc.id!);

  const menu_items = await readMenuItemByRestaurantIdForUpdate(
    trx,
    restaurant_id
  );
  const menu_item_ids: number[] = menu_items.map(mi => mi.id!);

  const addon_groups = await readAddonGroupByRestaurantIdForUpdate(
    trx,
    restaurant_id
  );
  const addon_group_ids: number[] = addon_groups.map(ag => ag.id!);

  const addons = await readAddonByAddonGroupIdsForUpdate(trx, addon_group_ids);
  const addon_ids: number[] = addons.map(a => a.id!);

  const variant_groups = await readVariantGroupByMenuItemIdsForUpdate(
    trx,
    menu_item_ids
  );
  const variant_group_ids: number[] = variant_groups.map(vg => vg.id!);

  const variants = await readVariantByVariantGroupIdsForUpdate(
    trx,
    variant_group_ids
  );
  const variant_ids: number[] = variants.map(v => v.id!);

  //*deleted
  const deleted_item_addons = await clearItemAddon(trx, menu_item_ids);
  const deleted_item_addon_groups = await clearItemAddonGroups(
    trx,
    menu_item_ids
  );

  const deleted_addons = await bulkSoftDeleteAddons(trx, addon_ids);
  const deleted_addon_groups = await bulkSoftDeleteAddonGroups(
    trx,
    addon_group_ids
  );

  const deleted_variants = await bulkDeleteVariant(trx, variant_ids);
  const deleted_variant_group = await bulkDeleteVariantGroup(
    trx,
    variant_group_ids
  );

  const deleted_menu_items = await bulkSoftDeleteMenuItems(trx, menu_item_ids);

  const deleted_sub_categories = await bulkSoftDeleteSubCategories(
    trx,
    sub_category_ids
  );

  const deleted_main_categories = await bulkSoftDeleteMainCategories(
    trx,
    main_category_ids
  );
  logger.debug('Reading Menu entities for delete', {
    main_categories: main_category_ids,
    sub_categories: sub_category_ids,
    menu_items: menu_item_ids,
    addon_groups: addon_group_ids,
    addons: addon_ids,
    variant_groups: variant_group_ids,
    variants: variant_ids,
  });

  const result = {
    deleted_main_categories: deleted_main_categories.length,
    deleted_sub_categories: deleted_sub_categories.length,
    deleted_menu_items: deleted_menu_items.length,
    deleted_variant_group: deleted_variant_group.length,
    deleted_variants: deleted_variants.length,
    deleted_addon_groups: deleted_addon_groups.length,
    deleted_addons: deleted_addons.length,
    deleted_item_addon_groups: deleted_item_addon_groups.length,
    deleted_item_addons: deleted_item_addons.length,
  };

  logger.debug('successfully deleted menu', result);

  return result;
}

export async function deleteRestaurantMenuPosDetails(
  trx: Knex.Transaction,
  restaurant_id: string
) {
  //*read

  const main_categories = await readPosMainCategorieByRestaurantIdForUpdate(
    trx,
    restaurant_id,
    PosPartner.PETPOOJA
  );
  const main_category_ids: number[] = main_categories.map(mc => mc.id!);

  const sub_categories = await readPosSubCategoryByMainCategoryIdsForUpdate(
    trx,
    main_category_ids,
    PosPartner.PETPOOJA
  );
  const sub_category_ids: number[] = sub_categories.map(sc => sc.id!);

  const menu_items = await readPosMenuItemByRestaurantIdForUpdate(
    trx,
    restaurant_id,
    PosPartner.PETPOOJA
  );
  const menu_item_ids: number[] = menu_items.map(mi => mi.id!);

  const variant_groups = await readPosVariantGroupByMenuItemIdsForUpdate(
    trx,
    menu_item_ids,
    PosPartner.PETPOOJA
  );
  const variant_group_ids: number[] = variant_groups.map(vg => vg.id!);

  const variants = await readPosVariantByVariantGroupIdsForUpdate(
    trx,
    variant_group_ids,
    PosPartner.PETPOOJA
  );
  const variant_ids: number[] = variants.map(v => v.id!);

  const addon_groups = await readPosAddonGroupByRestaurantIdForUpdate(
    trx,
    restaurant_id,
    PosPartner.PETPOOJA
  );
  const addon_group_ids: number[] = addon_groups.map(ag => ag.id!);

  const addon = await readPosAddonByAddonGroupIdsForUpdate(
    trx,
    addon_group_ids,
    PosPartner.PETPOOJA
  );
  const addon_ids: number[] = addon.map(a => a.id!);

  await bulkRemovePosDetailsFromVariant(trx, variant_ids);
  await bulkRemovePosDetailsFromVariantGroup(trx, variant_group_ids);
  await bulkRemovePosDetailsFromAddon(trx, addon_ids);
  await bulkRemovePosDetailsFromAddonGroup(trx, addon_group_ids);
  await bulkRemovePosDetailsFromMenuItems(trx, menu_item_ids);
  await bulkRemovePosDetailsFromSubCategories(trx, sub_category_ids);
  await bulkRemovePosDeatilsFromMainCategories(trx, main_category_ids);

  logger.debug('successfully removed pos partner from menu');
}
