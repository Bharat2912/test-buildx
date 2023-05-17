import {getTransaction} from '../../../data/knex';
import {PosPartner} from '../enum';
import {
  bulkInsertAddon,
  bulkSoftDeleteAddons,
  bulkUpdateAddon,
  IAddon,
  readAddonByAddonGroupIdsForUpdate,
} from '../menu/addon/models';
import {
  bulkInsertAddonGroup,
  bulkUpdateAddonGroup,
  readAddonGroupByRestaurantIdForUpdate,
  IAddonGroup,
  bulkSoftDeleteAddonGroups,
} from '../menu/addon_group/models';
import {
  bulkInsertItemAddonGroup,
  clearItemAddonGroups,
  bulkHardDeleteItemAddonGroupByAddonGroupIds,
  IItem_AddonGroup,
} from '../menu/item_addon_group/models';
import {
  bulkInsertMainCategory,
  bulkSoftDeleteMainCategories,
  bulkUpdateMainCategory,
  IMainCategory,
  readMainCategorieByRestaurantIdForUpdate,
} from '../menu/main_category/models';
import {
  bulkInsertMenuItem,
  bulkSoftDeleteMenuItems,
  bulkUpdateMenuItemWithImage,
  clearItemAddon,
  bulkHardDeleteItemAddonByAddonIds,
  IItem_Addon,
  IMenuItem,
  insertItemAddonOnly,
  readMenuItemByRestaurantIdForUpdate,
} from '../menu/models';
import {
  bulkInsertSubCategory,
  bulkSoftDeleteSubCategories,
  bulkUpdateSubCategory,
  ISubCategory,
  readSubCategoryByMainCategoryIdsForUpdate,
} from '../menu/sub_category/models';
import {
  bulkDeleteVariant,
  bulkInsertVariant,
  bulkUpdateVariantAllFields,
  IVariant,
  readVariantByVariantGroupIdsForUpdate,
} from '../menu/variant/models';
import {
  bulkInsertVariantGroup,
  bulkUpdateVariantGroup,
  IVariantGroup,
  readVariantGroupByMenuItemIdsForUpdate,
} from '../menu/variant_group/models';
import {
  IPetPoojaAddonGroup,
  IPetPoojaAttribute,
  IPetPoojaCategory,
  IPetpoojaItemTax,
  IPetPoojaMenuItem,
  IPetpoojaParentCategory,
  IPetPoojaPushMenu,
  IPetPoojaRestaurant,
  IPetPoojaTax,
} from './types';
import {
  calculatePetpoojaMenuEntityTaxes,
  filterInsertUpdateAndDeleteEntities,
  getItemAttribute,
  stringToBoolean,
} from './utils';
import {Knex} from 'knex';
import logger from '../../../utilities/logger/winston_logger';
import {
  updatePetpoojaItemTax,
  updateRestaurantPetpooja,
  upsertPetpoojaTax,
} from './model';
import {
  PetPoojaPackagingApplicableOn,
  PetPoojaPackagingChargeType,
} from './enum';
import {
  IPackingDetailsOrder,
  IRestaurant_Basic,
  updateRestaurantBasic,
} from '../restaurant/models';
import {
  addPhoneCode,
  getBackwardPercentAmount,
  isEmpty,
  roundUp,
} from '../../../utilities/utilFuncs';
import {IError} from '../../../types';
import ResponseError from '../../../utilities/response_error';
import {esIndexData} from '../../../utilities/es_manager';
import {FileObject} from '../../../utilities/s3_manager';
import {bulkDeleteVariantGroup} from '../menu/variant_group/models';

export async function processMainCategories(
  trx: Knex.Transaction,
  restaurant_id: string,
  petpooja_main_categories: IPetpoojaParentCategory[],
  petpooja_sub_categories: IPetPoojaCategory[]
): Promise<{
  main_categories: IMainCategory[];
  main_categories_manipulation_details: {
    main_categories_inserted: number;
    main_categories_updated: number;
    main_categories_deleted: number;
  };
}> {
  const formatted_main_categories: IMainCategory[] = [];
  // const main_categorie_pos_ids: string[] = [];
  const main_categories: IMainCategory[] = [];

  for (let i = 0; i < petpooja_main_categories.length; i++) {
    formatted_main_categories.push({
      restaurant_id,
      name: petpooja_main_categories[i].name,
      pos_id: petpooja_main_categories[i].id,
      pos_partner: PosPartner.PETPOOJA,
      sequence: formatted_main_categories.length + 1,
    });
    // main_categorie_pos_ids.push(petpooja_main_categories[i].id);
  }

  //if thier exists a sub category without any main category then create a NOTA main category
  //and associate all those sub categories with that NOTA main category
  if (petpooja_sub_categories.find(sc => sc.parent_category_id === '0')) {
    formatted_main_categories.push({
      restaurant_id,
      name: 'NOTA',
      pos_id: '0',
      pos_partner: PosPartner.PETPOOJA,
      sequence: formatted_main_categories.length + 1,
    });
    // main_categorie_pos_ids.push('0');
  }

  const existing_main_categories =
    await readMainCategorieByRestaurantIdForUpdate(trx, restaurant_id);
  const {insert_entities, update_entities, delete_entities} =
    filterInsertUpdateAndDeleteEntities(
      formatted_main_categories,
      existing_main_categories
    );
  if (insert_entities.length) {
    main_categories.push(
      ...(await bulkInsertMainCategory(trx, insert_entities))
    );
  }
  if (update_entities.length) {
    main_categories.push(
      ...(await bulkUpdateMainCategory(trx, update_entities))
    );
  }
  if (delete_entities.length) {
    main_categories.push(
      ...(await bulkSoftDeleteMainCategories(
        trx,
        delete_entities.map(e => e.id)
      ))
    );
  }

  logger.debug(`${insert_entities.length} new main categories created`);
  logger.debug(`${update_entities.length} existing main categories updated`);

  const main_categories_inserted = insert_entities.length;
  const main_categories_updated = update_entities.length;
  const main_categories_deleted = delete_entities.length;
  return {
    main_categories,
    main_categories_manipulation_details: {
      main_categories_inserted,
      main_categories_updated,
      main_categories_deleted,
    },
  };
}

export async function processSubCategories(
  trx: Knex.Transaction,
  main_categories: IMainCategory[],
  petpooja_sub_categories: IPetPoojaCategory[]
): Promise<{
  sub_categories: ISubCategory[];
  sub_categories_manipulation_details: {
    sub_categories_inserted: number;
    sub_categories_updated: number;
    sub_categories_deleted: number;
  };
}> {
  const sub_categories: ISubCategory[] = [];
  const formatted_sub_categories: ISubCategory[] = [];
  // const sub_categorie_pos_ids: string[] = [];
  const main_category_ids: number[] = main_categories.map(mc => mc.id!);
  const errors: IError[] = [];

  for (let i = 0; i < petpooja_sub_categories.length; i++) {
    //find main category
    const main_category = main_categories.find(
      mc => mc.pos_id === petpooja_sub_categories[i].parent_category_id
    );
    if (main_category) {
      if (!main_category.is_deleted) {
        const sc_count_in_mc = formatted_sub_categories.filter(
          item => item.main_category_id === main_category.id
        ).length;
        formatted_sub_categories.push({
          main_category_id: main_category.id,
          name: petpooja_sub_categories[i].categoryname,
          pos_id: petpooja_sub_categories[i].categoryid,
          pos_partner: PosPartner.PETPOOJA,
          sequence: sc_count_in_mc + 1,
        });
      }
      // sub_categorie_pos_ids.push(petpooja_sub_categories[i].categoryid);
    } else {
      logger.error(
        'main category not found while processing petpooja sub category',
        {
          petpooja_sub_category: petpooja_sub_categories[i],
        }
      );
      errors.push({
        message: `main category not found while processing petpooja sub category ${petpooja_sub_categories[i].categoryname}`,
        code: 2019,
        data: {
          petpooja_sub_category: petpooja_sub_categories[i],
        },
      });
    }
  }

  if (errors.length > 0) {
    throw new ResponseError(400, errors);
  }
  const existing_sub_categories =
    await readSubCategoryByMainCategoryIdsForUpdate(trx, main_category_ids);
  const {insert_entities, update_entities, delete_entities} =
    filterInsertUpdateAndDeleteEntities(
      formatted_sub_categories,
      existing_sub_categories
    );
  if (insert_entities.length) {
    sub_categories.push(...(await bulkInsertSubCategory(trx, insert_entities)));
  }
  if (update_entities.length) {
    sub_categories.push(...(await bulkUpdateSubCategory(trx, update_entities)));
  }
  if (delete_entities.length) {
    sub_categories.push(
      ...(await bulkSoftDeleteSubCategories(
        trx,
        delete_entities.map(e => e.id)
      ))
    );
  }
  logger.debug(`${insert_entities.length} new sub categories created`);
  logger.debug(`${update_entities.length} existing sub categories updated`);

  const sub_categories_inserted = insert_entities.length;
  const sub_categories_updated = update_entities.length;
  const sub_categories_deleted = delete_entities.length;
  return {
    sub_categories,
    sub_categories_manipulation_details: {
      sub_categories_inserted,
      sub_categories_updated,
      sub_categories_deleted,
    },
  };
}

export async function processAddons(
  trx: Knex.Transaction,
  addon_groups: IAddonGroup[],
  petpooja_addon_groups: IPetPoojaAddonGroup[],
  petpooja_attributes: IPetPoojaAttribute[]
): Promise<{
  addons: IAddon[];
  addons_manipulation_details: {
    addons_inserted: number;
    addons_updated: number;
    addons_deleted: number;
  };
}> {
  const addons: IAddon[] = [];
  const formatted_addons: IAddon[] = [];
  // const pos_addon_ids: string[] = [];
  const addon_group_ids: number[] = addon_groups.map(ag => ag.id!);
  const errors: IError[] = [];

  for (let j = 0; j < petpooja_addon_groups.length; j++) {
    const petpooja_addon_group = petpooja_addon_groups[j];
    const petpooja_addons = petpooja_addon_group.addongroupitems;
    const addon_group = addon_groups.find(
      ag => ag.pos_id === petpooja_addon_group.addongroupid
    );
    for (let i = 0; i < petpooja_addons.length; i++) {
      if (addon_group) {
        if (!addon_group.is_deleted) {
          formatted_addons.push({
            addon_group_id: addon_group.id,
            name: petpooja_addons[i].addonitem_name,
            sequence: +petpooja_addons[i].addonitem_rank,
            price: +petpooja_addons[i].addonitem_price,
            veg_egg_non: getItemAttribute(
              petpooja_addons[i].attributes,
              petpooja_attributes
            ) as 'veg' | 'egg' | 'non-veg',
            in_stock: true, //if item is coming in push menu then it is always active
            sgst_rate: 0.0,
            cgst_rate: 0.0,
            igst_rate: 0.0,
            gst_inclusive: true, //! pet pooja does not provide any tax details on addon
            pos_id: petpooja_addons[i].addonitemid,
            pos_partner: PosPartner.PETPOOJA,
          });
          // pos_addon_ids.push(petpooja_addons[i].addonitemid);
        }
      } else {
        logger.error('addon group not found while processing petpooja addon', {
          petpooja_addon: petpooja_addons[i],
        });
        errors.push({
          message: `addon group not found while processing petpooja addon ${petpooja_addons[i].addonitem_name}`,
          code: 2020,
          data: {
            petpooja_addon: petpooja_addons[i],
          },
        });
      }
    }
  }

  if (errors.length > 0) {
    throw new ResponseError(400, errors);
  }

  const existing_addons = await readAddonByAddonGroupIdsForUpdate(
    trx,
    addon_group_ids
  );
  const {insert_entities, update_entities, delete_entities} =
    filterInsertUpdateAndDeleteEntities(formatted_addons, existing_addons);

  if (insert_entities.length) {
    addons.push(...(await bulkInsertAddon(trx, insert_entities)));
  }
  if (update_entities.length) {
    addons.push(...(await bulkUpdateAddon(trx, update_entities)));
  }
  if (delete_entities.length) {
    addons.push(
      ...(await bulkSoftDeleteAddons(
        trx,
        delete_entities.map(e => e.id)
      ))
    );
  }

  logger.debug(`${insert_entities.length} new addons created`);
  logger.debug(`${update_entities.length} existing addons updated`);
  const addons_inserted = insert_entities.length;
  const addons_updated = update_entities.length;
  const addons_deleted = delete_entities.length;
  return {
    addons,
    addons_manipulation_details: {
      addons_inserted,
      addons_updated,
      addons_deleted,
    },
  };
}

export async function processAddonGroups(
  trx: Knex.Transaction,
  restaurant_id: string,
  petpooja_addon_groups: IPetPoojaAddonGroup[]
): Promise<{
  addon_groups: IAddonGroup[];
  addon_groups_manipulation_details: {
    addon_groups_inserted: number;
    addon_groups_updated: number;
    addon_groups_deleted: number;
  };
}> {
  const addon_groups: IAddonGroup[] = [];
  const formatted_addon_groups: IAddonGroup[] = [];
  // const pos_addon_group_ids: string[] = [];

  for (let i = 0; i < petpooja_addon_groups.length; i++) {
    formatted_addon_groups.push({
      restaurant_id,
      name: petpooja_addon_groups[i].addongroup_name,
      pos_id: petpooja_addon_groups[i].addongroupid,
      pos_partner: PosPartner.PETPOOJA,
    });
    // pos_addon_group_ids.push(petpooja_addon_groups[i].addongroupid);
  }
  const existing_addon_groups = await readAddonGroupByRestaurantIdForUpdate(
    trx,
    restaurant_id
  );
  const {insert_entities, update_entities, delete_entities} =
    filterInsertUpdateAndDeleteEntities(
      formatted_addon_groups,
      existing_addon_groups
    );

  if (insert_entities.length) {
    addon_groups.push(...(await bulkInsertAddonGroup(trx, insert_entities)));
  }
  if (update_entities.length) {
    addon_groups.push(...(await bulkUpdateAddonGroup(trx, update_entities)));
  }
  if (delete_entities.length) {
    addon_groups.push(
      ...(await bulkSoftDeleteAddonGroups(
        trx,
        delete_entities.map(e => e.id)
      ))
    );
  }
  logger.debug(`${insert_entities.length} new addon groups created`);
  logger.debug(`${update_entities.length} existing addon groups updated`);

  const addon_groups_inserted = insert_entities.length;
  const addon_groups_updated = update_entities.length;
  const addon_groups_deleted = delete_entities.length;
  return {
    addon_groups,
    addon_groups_manipulation_details: {
      addon_groups_inserted,
      addon_groups_updated,
      addon_groups_deleted,
    },
  };
}

export async function processMenuItems(
  trx: Knex.Transaction,
  restaurant: IRestaurant_Basic,
  sub_categories: ISubCategory[],
  petpooja_items: IPetPoojaMenuItem[],
  taxes: IPetPoojaTax[],
  petpooja_attributes: IPetPoojaAttribute[],
  packing_tax_convert_to_forward_tax: boolean
): Promise<{
  menu_items: IMenuItem[];
  menu_items_manipulation_details: {
    menu_items_inserted: number;
    menu_items_updated: number;
    menu_items_deleted: number;
  };
}> {
  const menu_items: IMenuItem[] = [];
  const formatted_menu_items: IMenuItem[] = [];
  // const menu_item_pos_ids: string[] = [];
  const errors: IError[] = [];

  const itemTaxRows: IPetpoojaItemTax[] = [];
  for (let i = 0; i < petpooja_items.length; i++) {
    /*====== IGNORE item_ordertype ======= */
    // if (!petpooja_items[i].item_ordertype.split(',').includes('1')) {
    //   if (
    //     petpooja_items[i].item_ordertype.split(',').includes('2') ||
    //     petpooja_items[i].item_ordertype.split(',').includes('3')
    //   ) {
    //     continue;
    //   } else {
    //     logger.error(
    //       'item order type does not includes 1 while processing petpooja menu item',
    //       {
    //         petpooja_menu_item: petpooja_items[i],
    //       }
    //     );
    //     errors.push({
    //       message: `item order does type not includes 1 while processing petpooja menu item ${petpooja_items[i].itemname}`,
    //       code: 2028,
    //       data: {
    //         petpooja_menu_item: petpooja_items[i],
    //       },
    //     });
    //     continue;
    //   }
    // }
    const sub_category = sub_categories.find(
      sc => sc.pos_id === petpooja_items[i].item_categoryid
    );
    if (sub_category) {
      if (!sub_category.is_deleted) {
        let tax_applied_on: 'core' | 'total' = 'core';
        let item_cgst_tax = 0;
        let item_sgst_tax = 0;
        if (petpooja_items[i].item_tax) {
          let tax_backward = 0;
          const tax_ids = petpooja_items[i].item_tax.split(',');
          tax_ids.map(tax_id => {
            const tax = taxes.find(tax => tax.taxid === tax_id);
            if (tax) {
              if (tax.taxname === 'CGST' && !isNaN(+tax.tax)) {
                item_cgst_tax = +tax.tax;
                if (tax.tax_taxtype === '2') {
                  tax_backward++;
                }
                if (tax.tax_coreortotal === '1') {
                  tax_applied_on = 'total';
                }
              }
              if (tax.taxname === 'SGST' && !isNaN(+tax.tax)) {
                item_sgst_tax = +tax.tax;
                if (tax.tax_taxtype === '2') {
                  tax_backward++;
                }
                if (tax.tax_coreortotal === '1') {
                  tax_applied_on = 'total';
                }
              }
            }
            itemTaxRows.push({
              item_pos_id: petpooja_items[i].itemid,
              restaurant_id: restaurant.id,
              tax_pos_id: tax_id,
            });
          });
          if (tax_backward > 0) {
            const new_price = roundUp(
              getBackwardPercentAmount(
                +petpooja_items[i].price,
                item_cgst_tax + item_sgst_tax
              ),
              2
            );
            petpooja_items[i].price = new_price + '';
          }
        }

        let packing_charges = +petpooja_items[i].item_packingcharges || 0;
        if (
          restaurant.packing_charge_type === 'item' &&
          restaurant.taxes_applicable_on_packing &&
          packing_tax_convert_to_forward_tax
        ) {
          packing_charges = roundUp(
            getBackwardPercentAmount(
              +petpooja_items[i].item_packingcharges || 0,
              restaurant.packing_cgst! + restaurant.packing_sgst_utgst!
            ),
            2
          );
        }
        let menu_item_image: FileObject | undefined;
        if (!isEmpty(petpooja_items[i].item_image_url)) {
          menu_item_image = {
            url: petpooja_items[i].item_image_url,
          };
        }
        const mi_count_in_sc = formatted_menu_items.filter(
          item => item.sub_category_id === sub_category.id
        ).length;
        formatted_menu_items.push({
          restaurant_id: restaurant.id,
          name: petpooja_items[i].itemname,
          description: petpooja_items[i].itemdescription,
          sub_category_id: sub_category.id,
          price: +petpooja_items[i].price,
          veg_egg_non: getItemAttribute(
            petpooja_items[i].item_attributeid,
            petpooja_attributes
          ),
          packing_charges: packing_charges,
          is_spicy: false, //! hardcoded
          serves_how_many: 1, //! hardcoded,
          service_charges: 0.0, //! hardcoded,
          item_sgst_utgst: item_sgst_tax,
          item_cgst: item_cgst_tax,
          item_igst: 0.0, //! hardcoded,
          tax_applied_on: tax_applied_on,
          item_inclusive: stringToBoolean(petpooja_items[i].ignore_taxes),
          allow_long_distance: true, //! hardcoded,
          image: menu_item_image,
          disable: false,
          pos_id: petpooja_items[i].itemid,
          pos_partner: PosPartner.PETPOOJA,
          is_deleted: false,
          sequence: mi_count_in_sc + 1,
        });
      }
      // menu_item_pos_ids.push(petpooja_items[i].itemid);
    } else {
      logger.error(
        'sub category not found while processing petpooja menu item',
        {
          petpooja_menu_item: petpooja_items[i],
        }
      );
      errors.push({
        message: `sub category not found while processing petpooja menu item ${petpooja_items[i].itemname}`,
        code: 2021,
        data: {
          petpooja_menu_item: petpooja_items[i],
        },
      });
    }
  }

  if (errors.length > 0) {
    throw new ResponseError(400, errors);
  }
  if (itemTaxRows.length)
    await updatePetpoojaItemTax(trx, restaurant.id, itemTaxRows);
  const existing_menu_items = await readMenuItemByRestaurantIdForUpdate(
    trx,
    restaurant.id
  );
  const {
    insert_entities,
    update_entities,
    delete_entities,
  }: {
    insert_entities: IMenuItem[];
    update_entities: IMenuItem[];
    delete_entities: IMenuItem[];
  } = filterInsertUpdateAndDeleteEntities(
    formatted_menu_items,
    existing_menu_items
  );

  for (let i = 0; i < update_entities.length; i++) {
    if (
      isEmpty(update_entities[i].image) ||
      isEmpty(update_entities[i].image!.url)
    ) {
      const existing_menu_item = existing_menu_items.find(
        mi => mi.pos_id === update_entities[i].pos_id
      );
      if (existing_menu_item && existing_menu_item.image) {
        update_entities[i].image = existing_menu_item.image;
      }
    }
  }

  if (insert_entities.length) {
    menu_items.push(...(await bulkInsertMenuItem(trx, insert_entities)));
  }
  if (update_entities.length) {
    menu_items.push(
      ...(await bulkUpdateMenuItemWithImage(trx, update_entities))
    );
  }
  if (delete_entities.length) {
    menu_items.push(
      ...(await bulkSoftDeleteMenuItems(
        trx,
        delete_entities.map(e => e.id!)
      ))
    );
  }

  logger.debug(`${insert_entities.length} new menu items created`);
  logger.debug(`${update_entities.length} existing menu items updated`);

  const menu_items_inserted = insert_entities.length;
  const menu_items_updated = update_entities.length;
  const menu_items_deleted = delete_entities.length;
  return {
    menu_items,
    menu_items_manipulation_details: {
      menu_items_inserted,
      menu_items_updated,
      menu_items_deleted,
    },
  };
}

export async function processVariantGroups(
  trx: Knex.Transaction,
  menu_items: IMenuItem[],
  petpooja_items: IPetPoojaMenuItem[]
): Promise<{
  variant_groups: IVariantGroup[];
  variant_groups_manipulation_details: {
    variant_groups_inserted: number;
    variant_groups_updated: number;
    variant_groups_deleted: number;
  };
}> {
  const variant_groups: IVariantGroup[] = [];
  const formatted_variant_groups: IVariantGroup[] = [];
  // const pos_variant_group_ids: string[] = [];
  const menu_item_ids: number[] = menu_items.map(mi => mi.id!);
  const errors: IError[] = [];

  for (let i = 0; i < petpooja_items.length; i++) {
    // if (!petpooja_items[i].item_ordertype.split(',').includes('1')) {
    //   if (
    //     petpooja_items[i].item_ordertype.split(',').includes('2') ||
    //     petpooja_items[i].item_ordertype.split(',').includes('3')
    //   ) {
    //     continue;
    //   }
    // }

    if (petpooja_items[i].variation.length > 0) {
      // if (
      //   petpooja_items[i].variation_groupname === null ||
      //   petpooja_items[i].variation_groupname === undefined
      // ) {
      //   logger.error(
      //     `${petpooja_items[i].variation_groupname} variant group name found while processing petpooja variant group`,
      //     {
      //       petpooja_menu_item: petpooja_items[i],
      //     }
      //   );
      //   errors.push({
      //     message: `invalid variant group name found while processing petpooja variant group ${petpooja_items[i].variation_groupname}`,
      //     code: 2029,
      //     data: {
      //       petpooja_menu_item: petpooja_items[i],
      //     },
      //   });
      //   continue;
      // } else if (
      //   petpooja_items[i].variation_groupname === '' ||
      //   petpooja_items[i].variation_groupname.trim() === ''
      // ) {
      //   logger.error(
      //     'empty string variant group name found while processing petpooja variant group',
      //     {
      //       petpooja_menu_item: petpooja_items[i],
      //     }
      //   );
      //   errors.push({
      //     message: `invalid variant group name found while processing petpooja variant group ${petpooja_items[i].variation_groupname}`,
      //     code: 2029,
      //     data: {
      //       petpooja_menu_item: petpooja_items[i],
      //     },
      //   });
      //   continue;
      // }

      if (isEmpty(petpooja_items[i].variation_groupname)) {
        petpooja_items[i].variation_groupname = 'NOTA';
      }
      const menu_item = menu_items.find(
        mi => mi.pos_id === petpooja_items[i].itemid
      );
      if (menu_item) {
        if (!menu_item.is_deleted) {
          const pos_id =
            petpooja_items[i].variation_groupname + '_' + menu_item!.pos_id;
          const vg_count_in_mi = formatted_variant_groups.filter(
            item => item.menu_item_id === menu_item!.id
          ).length;
          formatted_variant_groups.push({
            menu_item_id: menu_item!.id,
            name: petpooja_items[i].variation_groupname,
            pos_id,
            pos_partner: PosPartner.PETPOOJA,
            is_deleted: false,
            sequence: vg_count_in_mi + 1,
          });
        }
        // pos_variant_group_ids.push(pos_id);
      } else {
        logger.error(
          'menu item not found while processing petpooja variant group',
          {
            petpooja_variant_group: petpooja_items[i].variation,
          }
        );
        errors.push({
          message: `menu item not found while processing petpooja variant group ${petpooja_items[i].variation_groupname}`,
          code: 2022,
          data: {
            petpooja_variant_group: petpooja_items[i].variation,
          },
        });
      }
    }
  }

  if (errors.length > 0) {
    throw new ResponseError(400, errors);
  }

  const existing_variant_groups = await readVariantGroupByMenuItemIdsForUpdate(
    trx,
    menu_item_ids
  );
  const {insert_entities, update_entities, delete_entities} =
    filterInsertUpdateAndDeleteEntities(
      formatted_variant_groups,
      existing_variant_groups
    );

  if (insert_entities.length) {
    variant_groups.push(
      ...(await bulkInsertVariantGroup(trx, insert_entities))
    );
  }
  if (update_entities.length) {
    variant_groups.push(
      ...(await bulkUpdateVariantGroup(trx, update_entities))
    );
  }
  if (delete_entities.length) {
    variant_groups.push(
      ...(await bulkDeleteVariantGroup(
        trx,
        delete_entities.map(e => e.id)
      ))
    );
  }
  logger.debug(`${insert_entities.length} new variant groups created`);
  logger.debug(`${update_entities.length} existing variant groups updated`);

  const variant_groups_inserted = insert_entities.length;
  const variant_groups_updated = update_entities.length;
  const variant_groups_deleted = delete_entities.length;
  return {
    variant_groups,
    variant_groups_manipulation_details: {
      variant_groups_inserted,
      variant_groups_updated,
      variant_groups_deleted,
    },
  };
}

export async function processVariants(
  trx: Knex.Transaction,
  variant_groups: IVariantGroup[],
  petpooja_items: IPetPoojaMenuItem[],
  petpooja_attributes: IPetPoojaAttribute[]
): Promise<{
  variants: IVariant[];
  variants_manipulation_details: {
    variants_inserted: number;
    variants_updated: number;
    variants_deleted: number;
  };
}> {
  const variants: IVariant[] = [];
  const formatted_variants: IVariant[] = [];
  // const pos_variant_item_ids: string[] = [];
  const variant_group_ids: number[] = variant_groups.map(vg => vg.id!);
  const errors: IError[] = [];

  const variant_map: {
    [key: number]: {
      pos_variant_item_id: string;
      price: number;
    };
  } = {};

  for (let i = 0; i < petpooja_items.length; i++) {
    const variant_group = variant_groups.find(
      vg =>
        vg.pos_id ===
        petpooja_items[i].variation_groupname + '_' + petpooja_items[i].itemid
    );
    for (let j = 0; j < petpooja_items[i].variation.length; j++) {
      if (variant_group) {
        if (!variant_group.is_deleted) {
          const iv_count_in_vg = formatted_variants.filter(
            item => item.variant_group_id === variant_group.id
          ).length;
          formatted_variants.push({
            variant_group_id: variant_group.id,
            name: petpooja_items[i].variation[j].name,
            price: +petpooja_items[i].variation[j].price,
            in_stock: true, //if item is coming in push menu then it is always active
            //in_stock: petpooja_items[i].variation[j].active === '1' ? true : false,
            veg_egg_non: getItemAttribute(
              petpooja_items[i].item_attributeid,
              petpooja_attributes
            ),
            pos_id: petpooja_items[i].variation[j].variationid,
            pos_variant_item_id: petpooja_items[i].variation[j].id, //!Variant menu item id
            pos_partner: PosPartner.PETPOOJA,
            is_default: false,
            is_deleted: false,
            serves_how_many: 1,
            sequence: iv_count_in_vg + 1,
          });
          if (variant_map[variant_group.id!]) {
            if (
              +petpooja_items[i].variation[j].price <
              variant_map[variant_group.id!].price
            ) {
              variant_map[variant_group.id!] = {
                pos_variant_item_id: petpooja_items[i].variation[j].id,
                price: +petpooja_items[i].variation[j].price,
              };
            }
          } else {
            variant_map[variant_group.id!] = {
              pos_variant_item_id: petpooja_items[i].variation[j].id,
              price: +petpooja_items[i].variation[j].price,
            };
          }
        }

        // pos_variant_item_ids.push(petpooja_items[i].variation[j].id);
      } else {
        logger.error(
          'variant group not found while processing petpooja variant',
          {
            petpooja_variant: petpooja_items[i].variation[j],
          }
        );
        errors.push({
          message: `variant group not found while processing petpooja variant ${petpooja_items[i].variation[j].name}`,
          code: 2023,
          data: {
            petpooja_variant: petpooja_items[i].variation[j],
          },
        });
      }
    }
  }

  //variant with the lowest price will be set as default variant for that variant group
  for (let i = 0; i < formatted_variants.length; i++) {
    const default_variant =
      variant_map[formatted_variants[i].variant_group_id!];
    if (
      formatted_variants[i].pos_variant_item_id ===
      default_variant.pos_variant_item_id
    ) {
      formatted_variants[i].is_default = true;
    }
  }

  const existing_variants = await readVariantByVariantGroupIdsForUpdate(
    trx,
    variant_group_ids
  );
  const {insert_entities, update_entities, delete_entities} =
    filterInsertUpdateAndDeleteEntities(
      formatted_variants,
      existing_variants,
      'pos_variant_item_id'
    );

  if (insert_entities.length) {
    variants.push(...(await bulkInsertVariant(trx, insert_entities)));
  }

  if (update_entities.length) {
    variants.push(...(await bulkUpdateVariantAllFields(trx, update_entities)));
  }

  if (delete_entities.length) {
    variants.push(
      ...(await bulkDeleteVariant(
        trx,
        delete_entities.map(e => e.id)
      ))
    );
  }

  logger.debug(`${insert_entities.length} new variants created`);
  logger.debug(`${update_entities.length} existing variants updated`);

  const variants_inserted = insert_entities.length;
  const variants_updated = update_entities.length;
  const variants_deleted = delete_entities.length;
  return {
    variants,
    variants_manipulation_details: {
      variants_inserted,
      variants_updated,
      variants_deleted,
    },
  };
}

export async function processMenuItemAddonsAndAddonGroupAssociations(
  trx: Knex.Transaction,
  addon_groups: IAddonGroup[],
  addons: IAddon[],
  menu_items: IMenuItem[],
  petpooja_items: IPetPoojaMenuItem[]
): Promise<{
  item_addon_groups: IItem_AddonGroup[];
  item_addon_groups_manipulation_details: {
    item_addon_groups_inserted: number;
    item_addon_groups_updated: number;
    item_addon_groups_deleted: number;
  };
  item_addons: IItem_Addon[];
  item_addons_manipulation_details: {
    item_addons_inserted: number;
    item_addons_updated: number;
    item_addons_deleted: number;
  };
}> {
  let item_addon_groups: IItem_AddonGroup[] = [];
  let item_addons: IItem_Addon[] = [];
  const menu_item_ids: number[] = menu_items.map(mi => mi.id!);
  const addon_group_ids: number[] = addon_groups.map(ag => ag.id!);
  const addon: number[] = addons.map(ad => ad.id!);
  const deleted_item_addon_groups: IItem_AddonGroup[] = [];
  const deleted_item_addons: IItem_Addon[] = [];
  const errors: IError[] = [];

  for (let i = 0; i < petpooja_items.length; i++) {
    // if (!petpooja_items[i].item_ordertype.split(',').includes('1')) {
    //   if (
    //     petpooja_items[i].item_ordertype.split(',').includes('2') ||
    //     petpooja_items[i].item_ordertype.split(',').includes('3')
    //   ) {
    //     continue;
    //   }
    // }
    const menu_item = menu_items.find(
      mi => mi.pos_id === petpooja_items[i].itemid
    );

    if (menu_item) {
      for (let j = 0; j < petpooja_items[i].addon.length; j++) {
        if (!menu_item.is_deleted) {
          const addon_group = addon_groups.find(
            ag => ag.pos_id === petpooja_items[i].addon[j].addon_group_id
          );
          if (addon_group && !addon_group.is_deleted) {
            item_addon_groups.push({
              menu_item_id: menu_item?.id,
              addon_group_id: addon_group.id,
              max_limit: +petpooja_items[i].addon[j].addon_item_selection_max,
              min_limit: +petpooja_items[i].addon[j].addon_item_selection_min,
              free_limit: -1,
              sequence: 1,
            });

            const current_addon_group_addons: IAddon[] = addons.filter(
              ad => ad.addon_group_id === addon_group.id
            );

            for (let k = 0; k < current_addon_group_addons.length; k++) {
              if (
                current_addon_group_addons &&
                !current_addon_group_addons[k].is_deleted
              ) {
                item_addons.push({
                  menu_item_id: menu_item?.id,
                  addon_id: current_addon_group_addons[k].id,
                });
              }
            }
          }
        }
      }
    } else {
      logger.error(
        'menu item not found while processing petpooja item addon group and item addons associations',
        {
          petpooja_menu_item: petpooja_items[i],
        }
      );
      errors.push({
        message: `menu item not found while processing petpooja item addon group and item addon associations ${petpooja_items[i].itemname}`,
        code: 2030,
        data: {
          petpooja_menu_item: petpooja_items[i],
        },
      });
    }
  }
  if (errors.length > 0) {
    throw new ResponseError(400, errors);
  }
  if (addon_group_ids.length) {
    deleted_item_addon_groups.concat(
      await bulkHardDeleteItemAddonGroupByAddonGroupIds(trx, addon_group_ids)
    );
  }
  if (addon.length) {
    deleted_item_addons.concat(
      await bulkHardDeleteItemAddonByAddonIds(trx, addon)
    );
  }
  if (menu_item_ids.length) {
    deleted_item_addon_groups.concat(
      await clearItemAddonGroups(trx, menu_item_ids)
    );
    deleted_item_addons.concat(await clearItemAddon(trx, menu_item_ids));
  }
  if (item_addon_groups.length) {
    item_addon_groups = await bulkInsertItemAddonGroup(trx, item_addon_groups);
  }
  if (item_addons.length) {
    item_addons = await insertItemAddonOnly(trx, item_addons);
  }

  logger.debug(
    `${item_addon_groups.length} new menu item addon group associations created`
  );
  logger.debug(
    `${item_addons.length} new menu item addon associations created`
  );

  return {
    item_addon_groups,
    item_addon_groups_manipulation_details: {
      item_addon_groups_inserted: item_addon_groups.length,
      item_addon_groups_updated: 0,
      item_addon_groups_deleted: deleted_item_addon_groups.length,
    },
    item_addons,
    item_addons_manipulation_details: {
      item_addons_inserted: item_addons.length,
      item_addons_updated: 0,
      item_addons_deleted: deleted_item_addons.length,
    },
  };
}

export async function processTaxes(
  trx: Knex.Transaction,
  restaurant_id: string,
  taxes: IPetPoojaTax[]
) {
  taxes.map(tax => (tax.restaurant_id = restaurant_id));
  return await upsertPetpoojaTax(trx, taxes);
}

export async function processRestaurant(
  trx: Knex.Transaction,
  restaurant: IRestaurant_Basic,
  petpooja_restaurant: IPetPoojaRestaurant,
  petpooja_taxes: IPetPoojaTax[]
): Promise<{
  updated_restaurant: IRestaurant_Basic;
  packing_tax_convert_to_forward_tax: boolean;
}> {
  const restaurant_updates: IRestaurant_Basic = {id: restaurant.id};
  let packing_tax_convert_to_forward_tax = false;

  if (petpooja_restaurant.details.restaurantname) {
    restaurant_updates.pos_name = petpooja_restaurant.details.restaurantname;
  }
  if (petpooja_restaurant.details.contact) {
    const poc_number = addPhoneCode(
      '+91' + petpooja_restaurant.details.contact
    );
    if (!isEmpty(poc_number)) {
      restaurant_updates.poc_number = poc_number;
    }
  }
  if (petpooja_restaurant.details.calculatetaxonpacking === 1) {
    restaurant_updates.taxes_applicable_on_packing = true;
  } else {
    restaurant_updates.taxes_applicable_on_packing = false;
  }

  if (
    petpooja_restaurant.details.packaging_applicable_on ===
    PetPoojaPackagingApplicableOn.ORDER
  ) {
    restaurant_updates.packing_charge_type = 'order';

    const packing_charge_order_clone: IPackingDetailsOrder = JSON.parse(
      JSON.stringify(restaurant.packing_charge_order)
    );

    if (
      !isEmpty(petpooja_restaurant.details.pc_taxes_id) &&
      restaurant_updates.taxes_applicable_on_packing
    ) {
      const packing_taxes_price = calculatePetpoojaMenuEntityTaxes(
        petpooja_restaurant.details.pc_taxes_id.split(','),
        petpooja_taxes
      );
      packing_tax_convert_to_forward_tax =
        packing_taxes_price.convert_to_forward_tax;
      packing_charge_order_clone.packing_charge =
        packing_taxes_price.entity_price;
      restaurant_updates.packing_sgst_utgst = packing_taxes_price.sgst_tax;
      restaurant_updates.packing_cgst = packing_taxes_price.cgst_tax;
      restaurant_updates.packing_igst = 0;
    } else {
      // packing_charge is set to undefined look into this
      packing_charge_order_clone.packing_charge =
        +petpooja_restaurant.details.packaging_charge || 0;
      restaurant_updates.packing_sgst_utgst = 0;
      restaurant_updates.packing_cgst = 0;
      restaurant_updates.packing_igst = 0;
    }
    restaurant_updates.packing_charge_order = packing_charge_order_clone;
  } else {
    if (
      petpooja_restaurant.details.packaging_applicable_on ===
      PetPoojaPackagingApplicableOn.ITEM
    ) {
      restaurant_updates.packing_charge_type = 'item';
    } else {
      restaurant_updates.packing_charge_type = 'none';
    }

    if (
      !isEmpty(petpooja_restaurant.details.pc_taxes_id) &&
      restaurant_updates.taxes_applicable_on_packing
    ) {
      const packing_taxes_price = calculatePetpoojaMenuEntityTaxes(
        petpooja_restaurant.details.pc_taxes_id.split(','),
        petpooja_taxes
      );
      packing_tax_convert_to_forward_tax =
        packing_taxes_price.convert_to_forward_tax;
      restaurant_updates.packing_sgst_utgst = packing_taxes_price.sgst_tax;
      restaurant_updates.packing_cgst = packing_taxes_price.cgst_tax;
      restaurant_updates.packing_igst = 0;
    }
  }

  if (
    petpooja_restaurant.details.packaging_charge_type ===
    PetPoojaPackagingChargeType.FIXED
  ) {
    restaurant_updates.packing_charge_fixed_percent = 'fixed';
  } else if (
    petpooja_restaurant.details.packaging_charge_type ===
    PetPoojaPackagingChargeType.PERCENTAGE
  ) {
    restaurant_updates.packing_charge_fixed_percent = 'percent';
  }

  const updated_restaurant = await updateRestaurantBasic(
    trx,
    restaurant_updates
  );

  logger.debug('updated restaurant details', updated_restaurant);

  return {updated_restaurant, packing_tax_convert_to_forward_tax};
}

export async function populatePetPoojaMenu(
  restaurant: IRestaurant_Basic,
  petpooja_menu: IPetPoojaPushMenu
) {
  const restaurant_id = restaurant.id;
  const trx = await getTransaction();
  try {
    const {updated_restaurant, packing_tax_convert_to_forward_tax} =
      await processRestaurant(
        trx,
        restaurant,
        petpooja_menu.restaurants[0],
        petpooja_menu.taxes
      );

    const {main_categories, main_categories_manipulation_details} =
      await processMainCategories(
        trx,
        restaurant_id,
        petpooja_menu.parentcategories,
        petpooja_menu.categories
      );

    const {sub_categories, sub_categories_manipulation_details} =
      await processSubCategories(
        trx,
        main_categories,
        petpooja_menu.categories
      );

    const {addon_groups, addon_groups_manipulation_details} =
      await processAddonGroups(trx, restaurant_id, petpooja_menu.addongroups);

    const {addons, addons_manipulation_details} = await processAddons(
      trx,
      addon_groups,
      petpooja_menu.addongroups,
      petpooja_menu.attributes
    );

    const taxes = await processTaxes(trx, restaurant_id, petpooja_menu.taxes);

    const {menu_items, menu_items_manipulation_details} =
      await processMenuItems(
        trx,
        restaurant,
        sub_categories,
        petpooja_menu.items,
        taxes,
        petpooja_menu.attributes,
        packing_tax_convert_to_forward_tax
      );

    const {variant_groups, variant_groups_manipulation_details} =
      await processVariantGroups(trx, menu_items, petpooja_menu.items);

    const {
      //variants,
      variants_manipulation_details,
    } = await processVariants(
      trx,
      variant_groups,
      petpooja_menu.items,
      petpooja_menu.attributes
    );

    const {
      //item_addon_groups,
      item_addon_groups_manipulation_details,
      //item_addons,
      item_addons_manipulation_details,
    } = await processMenuItemAddonsAndAddonGroupAssociations(
      trx,
      addon_groups,
      addons,
      menu_items,
      petpooja_menu.items
    );

    const updated_petpooja_restaurant = await updateRestaurantPetpooja(trx, {
      id: restaurant_id,
      menu_last_updated_at: new Date(),
    });
    logger.debug(
      'updated petpooja restaurant onboarding record',
      updated_petpooja_restaurant
    );

    await trx.commit();
    if (menu_items.length) {
      const menu_items_ids: number[] = menu_items.map(
        menu_item => menu_item.id!
      );
      await esIndexData({
        event: 'MENUITEM',
        action: 'BULK_PUT',
        data: {
          ids: menu_items_ids,
        },
      });
    }
    return {
      restaurant: updated_restaurant,
      main_categories: main_categories_manipulation_details,
      sub_categories: sub_categories_manipulation_details,
      addons: addons_manipulation_details,
      addon_groups: addon_groups_manipulation_details,
      menu_items: menu_items_manipulation_details,
      variants: variants_manipulation_details,
      variant_groups: variant_groups_manipulation_details,
      item_addons: item_addons_manipulation_details,
      item_addon_groups: item_addon_groups_manipulation_details,
      taxes,
    };
  } catch (error) {
    await trx.rollback();
    throw error;
  }
}
