import {Request, Response} from 'express';
import * as Joi from '../../../utilities/joi_common';
import handleErrors from '../../../utilities/controllers/handle_errors';
import * as models from './models';
import * as service from './service';
import {
  sendError,
  sendSuccess,
} from '../../../utilities/controllers/handle_response';
import {
  readSubCategoriesByRestaurantId,
  readSubCategory,
  readSubCategoryByMainCategoryIds,
} from './sub_category/models';
import logger from '../../../utilities/logger/winston_logger';
import {readAddonGroup, readAddonGroups} from './addon_group/models';
import {readAddon, readAddonByIds} from './addon/models';
import {getTransaction} from '../../../data/knex';
import {
  bulkInsertItemAddonGroup,
  clearItemAddonGroup,
  clearItemAddonGroups,
  IItem_AddonGroup,
} from './item_addon_group/models';
import {
  bulkDeleteVariant,
  bulkInsertVariant,
  bulkUpdateVariant,
  IVariant,
  readVariantByVariantGroupIds,
} from './variant/models';
import {
  bulkDeleteVariantGroup,
  bulkInsertVariantGroup,
  bulkUpdateVariantGroup,
  IVariantGroup,
  readVariantGroupByIds,
  readVariantGroupByMenuIds,
} from './variant_group/models';
import {
  generateDownloadFileURL,
  saveS3File,
} from '../../../utilities/s3_manager';
import {markForApproval} from '../approval/service';
import {
  ApprovalAction,
  ApprovalEntityType,
  ApprovalStatus,
} from '../approval/enums';
import ResponseError from '../../../utilities/response_error';
import {
  getRestaurantCoupons,
  getRestaurantMaxDiscount,
  readRestaurantBasicById,
  readRestaurantById,
} from '../restaurant/models';
import {validatePosPartnerAccess} from '../service';
import Globals from '../../../utilities/global_var/globals';
import {bulkUpdateMenuSequence, clearItemAddon} from './models';
import {
  readMainCategories,
  readMainCategory,
  readMainCategoryByRestaurantIds,
} from './main_category/models';
import {UserType} from '../../../enum';
import {isEmpty, roundUp} from '../../../utilities/utilFuncs';
import {getPercentAmount} from '../order/invoice';
import {IRestaurantMenu} from './type';
import {PosPartner} from '../enum';
import {verify_get_menu, verify_menu_item_id} from './validation';
import {saveCustomerSearchClick} from '../search_click/service';
import {GetMenuOrigin} from './enum';
import {setCouponText} from '../restaurant/service';

async function generateDownloadURL(menu_item: models.IMenuItem) {
  if (
    menu_item.image &&
    menu_item.image.bucket &&
    menu_item.image.path &&
    menu_item.image.name
  ) {
    menu_item.image = await generateDownloadFileURL(menu_item.image);
  } else if (
    menu_item.image &&
    menu_item.image.url &&
    !isEmpty(menu_item.image.url)
  ) {
    //petpooja menu items are stored with image urls
    return menu_item;
  } else {
    menu_item.image = {url: await Globals.DUMMY_MENU_ITEM_IMAGE.get()};
  }
  return menu_item;
}

export function calculateMenuItemDisplayPrice(
  mi: models.IMenuItem,
  discount_rate: number
) {
  if (discount_rate) {
    if (!mi.display_price) mi.display_price = mi.price;
    mi.price = roundUp(
      mi.display_price! - getPercentAmount(mi.display_price!, discount_rate),
      2
    );
    if (mi.variant_groups && mi.variant_groups.length) {
      mi.variant_groups.map(vg => {
        if (vg.variants && vg.variants.length) {
          vg.variants.map(iv => {
            if (!iv.display_price) iv.display_price = iv.price;
            iv.price = roundUp(
              iv.display_price! -
                getPercentAmount(iv.display_price!, discount_rate),
              2
            );
          });
        }
      });
    }
    if (mi.addon_groups && mi.addon_groups.length) {
      mi.addon_groups.map(ag => {
        if (ag.addons && ag.addons.length) {
          ag.addons.map(ia => {
            if (!ia.display_price) ia.display_price = ia.price;
            ia.price = roundUp(
              ia.display_price! -
                getPercentAmount(ia.display_price!, discount_rate),
              2
            );
          });
        }
      });
    }
  }
}

function calculateDisplayPrice(menu: IRestaurantMenu) {
  if (menu) {
    if (menu.main_category && menu.main_category.length) {
      menu.main_category.map(mc => {
        if (mc.sub_category && mc.sub_category.length) {
          mc.sub_category.map(sc => {
            if (sc.menu_item && sc.menu_item.length) {
              sc.menu_item.map(mi => {
                const discount_rate =
                  mi.discount_rate ||
                  sc.discount_rate ||
                  mc.discount_rate ||
                  menu.discount_rate ||
                  0;
                calculateMenuItemDisplayPrice(mi, discount_rate);
              });
            }
          });
        }
      });
    }
  }
  return menu;
}

export async function generateDownloadURLs(menu_items: models.IMenuItem[]) {
  for (let i = 0; i < menu_items.length; i++) {
    menu_items[i] = await generateDownloadURL(menu_items[i]);
  }
  return menu_items;
}
export async function getMenu(req: Request, res: Response) {
  try {
    const validation = verify_get_menu.required().validate({
      restaurant_id: req.params.restaurant_id,
      origin: req.query.origin,
    });
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const {restaurant_id, origin} = validation.value;

    const menu = await models.getRestaurantMenu(restaurant_id);

    if (!menu) return sendError(res, 404, 'Restaurant Menu not found');
    const NOTA_MC_DISPLAY_NAME = await Globals.NOTA_MC_DISPLAY_NAME.get();
    const NOTA_VG_DISPLAY_NAME = await Globals.NOTA_VG_DISPLAY_NAME.get();
    const coupons = await getRestaurantCoupons(restaurant_id);
    const discount = await getRestaurantMaxDiscount(restaurant_id);
    const offers = await setCouponText(coupons, discount);
    menu.offers = offers;
    calculateDisplayPrice(menu);
    if (menu && menu.main_category) {
      const mcs = menu.main_category;
      for (let i = 0; i < mcs.length; i++) {
        const mc = menu.main_category[i];

        if (menu.main_category[i].main_category_name === 'NOTA') {
          menu.main_category[i].main_category_name = NOTA_MC_DISPLAY_NAME;
        }
        if (mc && mc.sub_category) {
          const scs = mc.sub_category;
          for (let j = 0; j < scs.length; j++) {
            const sc = scs[j];
            if (sc && sc.menu_item) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              sc.menu_item = (await generateDownloadURLs(sc.menu_item)) as any;
              if (sc.menu_item && sc.menu_item.length) {
                for (let k = 0; k < sc.menu_item.length; k++) {
                  const mi = sc.menu_item[k];
                  if (mi.price === 0) {
                    if (mi.variant_groups && mi.variant_groups.length === 1) {
                      if (mi.variant_groups[0].variant_group_name === 'NOTA') {
                        mi.variant_groups[0].variant_group_name =
                          NOTA_VG_DISPLAY_NAME;
                      }
                      const vg = mi.variant_groups[0];
                      if (vg && vg.variants && vg.variants.length) {
                        let min_iv_price = -1;
                        vg.variants.map(iv => {
                          if (
                            min_iv_price < 0 ||
                            (iv.price || 0) < min_iv_price
                          )
                            min_iv_price = iv.price || 0;
                        });
                        if (min_iv_price > 0) {
                          mi.price = min_iv_price;
                          vg.variants.map(iv => {
                            iv.price = roundUp(
                              (iv.price || 0) - min_iv_price,
                              2
                            );
                          });
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    if (origin === GetMenuOrigin.SEARCH && req.user) {
      await saveCustomerSearchClick({
        restaurant_id,
        customer_id: req.user.id,
        city_id: menu.city_id,
      });
    }
    return sendSuccess(res, 200, menu);
  } catch (error) {
    return handleErrors(res, error);
  }
}

async function getRestaurantMenuItems(restaurant_id: string) {
  const result = await models.getMenuItems(restaurant_id);
  const restaurant = await readRestaurantBasicById(restaurant_id);
  if (result) {
    const NOTA_MC_DISPLAY_NAME = await Globals.NOTA_MC_DISPLAY_NAME.get();
    for (let i = 0; i < result.length; i++) {
      let mc_in_stock = false;
      if (result[i]) {
        if (result[i].name === 'NOTA') {
          result[i].name = NOTA_MC_DISPLAY_NAME;
        }
        if (result[i].sub_categories) {
          for (let j = 0; j < result[i].sub_categories.length; j++) {
            let sc_in_stock = false;
            if (result[i].sub_categories[j]) {
              if (result[i].sub_categories[j].menu_items) {
                result[i].sub_categories[j].menu_items.map(item => {
                  const discount_rate =
                    item.discount_rate ||
                    result[i].sub_categories[j].discount_rate ||
                    result[i].discount_rate ||
                    restaurant.discount_rate ||
                    0;
                  calculateMenuItemDisplayPrice(item, discount_rate);
                  if (item.in_stock) sc_in_stock = true;
                });
                if (sc_in_stock) sc_in_stock = true;
                result[i].sub_categories[j].menu_items =
                  await generateDownloadURLs(
                    result[i].sub_categories[j].menu_items
                  );
              }
            }
            result[i].sub_categories[j].in_stock = sc_in_stock;
            if (sc_in_stock) mc_in_stock = true;
          }
        }
      }
      result[i].in_stock = mc_in_stock;
    }
  }
  return result;
}

export async function getMenuAsVendor(req: Request, res: Response) {
  try {
    const result = await getRestaurantMenuItems(req.user.data.restaurant_id);
    return sendSuccess(res, 200, result);
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function getMenuItem(req: Request, res: Response) {
  try {
    const validation = Joi.id_num.validate(req.params.id);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);

    const menu_item = await models.readMenuItem(validation.value);
    if (!menu_item || menu_item.restaurant_id !== req.user.data.restaurant_id) {
      return sendError(res, 404, 'Menu Item not found');
    }

    if (menu_item.variant_groups) {
      const NOTA_VG_DISPLAY_NAME = await Globals.NOTA_VG_DISPLAY_NAME.get();

      menu_item.variant_groups.forEach((vg: {variant_group_name: string}) => {
        if (vg.variant_group_name === 'NOTA') {
          vg.variant_group_name = NOTA_VG_DISPLAY_NAME;
        }
      });
    }

    const discount_rate = await models.getItemDiscount(validation.value);
    calculateMenuItemDisplayPrice(menu_item, discount_rate);
    return sendSuccess(res, 200, await generateDownloadURL(menu_item));
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function createMenuItem(req: Request, res: Response) {
  try {
    req.body.restaurant_id = req.user.data.restaurant_id;
    const validation = models.verify_create_menu_item.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = <models.IMenuItem>validation.value;

    logger.debug('create menu item as vendor validated req ', validated_req);
    // check subcategory is from same restaurant
    const sub_category = await readSubCategory(
      validated_req.sub_category_id!,
      req.user.data.restaurant_id
    );
    if (
      !sub_category ||
      sub_category.restaurant_id !== req.user.data.restaurant_id
    )
      return sendError(res, 404, 'Sub Category Not Found');

    validatePosPartnerAccess(sub_category.pos_partner);

    // check duplicate name in same sub category
    if (await models.CheckDuplicateName(validated_req))
      return sendError(res, 400, 'Duplicate Item Name');

    // check Addon Groups owner
    const addongroupIds: number[] = [];
    const addonIds: number[] = [];
    const InsertAddons: models.IItem_Addon[] = [];
    const InsertAddonGroups: IItem_AddonGroup[] = [];

    if (validated_req.addon_groups !== undefined || null) {
      validated_req.addon_groups?.map(ag => {
        addongroupIds.push(ag.id!);
        ag.addons?.map(ad => {
          addonIds.push(ad.id!);
          InsertAddons.push({
            addon_id: ad.id,
          });
        });
        InsertAddonGroups.push({
          addon_group_id: ag.id,
          max_limit: ag.max_limit,
          min_limit: ag.min_limit,
          free_limit: ag.free_limit,
          sequence: ag.sequence,
        });
      });
      logger.debug('successfully mapped addon groups');

      const read_addon_groups = await readAddonGroups(
        addongroupIds,
        req.user.data.restaurant_id
      );
      const unauthaddongroups = read_addon_groups.filter(ag => {
        return ag.restaurant_id !== req.user.data.restaurant_id;
      });
      if (
        unauthaddongroups.length > 0 ||
        read_addon_groups.length !== addongroupIds.length
      ) {
        return sendError(res, 404, 'Addon Group Not Found');
      }

      // check Addons Owner
      const read_addon = await readAddonByIds(
        addonIds,
        req.user.data.restaurant_id
      );
      const unauthaddon = read_addon.filter(ad => {
        return ad.restaurant_id !== req.user.data.restaurant_id;
      });
      if (unauthaddon.length > 0 || read_addon.length !== addonIds.length) {
        logger.error('Addon not found ');
        return sendError(res, 404, 'Addon Not Found');
      }
    }
    // check for duplicate variant groups
    const duplicate: string[] = [];
    const default_Variant: string[] = [];
    validated_req.variant_groups?.map(vg_m => {
      const dflt_vr = vg_m.variants?.filter(vr_f => {
        return vr_f.is_default === true;
      });
      if (dflt_vr && dflt_vr?.length > 1) {
        default_Variant.push(
          'Variant Group id: ' + vg_m + ' >> Multiple default Variant'
        );
      }
      if (dflt_vr && dflt_vr?.length < 1) {
        default_Variant.push(
          'Variant Group id: ' + vg_m + ' >> No default Variant'
        );
      }
      const rpt_vg = validated_req.variant_groups?.filter(vg_f => {
        return vg_m.name === vg_f.name;
      });
      if (rpt_vg && rpt_vg?.length > 1) {
        duplicate.push(
          'Duplicate Variant Group Id:' + vg_m.id + '' + vg_m.name
        );
      } else {
        vg_m.variants?.map(vr_m => {
          const rpt_vr = vg_m.variants?.filter(vr_f => {
            return vr_m.name === vr_f.name;
          });
          if (rpt_vr && rpt_vr?.length > 1) {
            duplicate.push(
              'Duplicate Variant Id:' +
                vr_m.id +
                ' >>' +
                vr_m.name +
                ' in Group: id' +
                vg_m.id +
                '' +
                vg_m.name
            );
          }
        });
      }
    });
    if (duplicate.length || default_Variant.length) {
      return sendError(
        res,
        400,
        JSON.stringify([...duplicate, ...default_Variant])
      );
    }

    const trx = await getTransaction();
    // save Image
    try {
      const insertMenuItem = <models.IMenuItem>(
        JSON.parse(JSON.stringify(validated_req))
      );
      delete insertMenuItem.addon_groups;
      delete insertMenuItem.variant_groups;
      const createdMenuItem = (
        await models.bulkInsertMenuItem(trx, [insertMenuItem])
      )[0];

      InsertAddons.map(item => {
        item.menu_item_id = createdMenuItem.id;
      });
      if (InsertAddons.length) {
        await models.insertItemAddon(trx, InsertAddons);
      }

      InsertAddonGroups.map(item => {
        item.menu_item_id = createdMenuItem.id;
      });
      if (InsertAddonGroups.length) {
        await bulkInsertItemAddonGroup(trx, InsertAddonGroups);
      }

      const insertVariantGroup: IVariantGroup[] = [];
      let vg_sequence = 1;
      validated_req.variant_groups?.map(vg => {
        insertVariantGroup.push({
          id: vg.id,
          menu_item_id: createdMenuItem.id,
          name: vg.name,
          sequence: vg_sequence++,
        });
      });

      if (insertVariantGroup.length) {
        const resultVariantGroups = await bulkInsertVariantGroup(
          trx,
          insertVariantGroup
        );

        const insertVariant: IVariant[] = [];
        validated_req.variant_groups?.map(vg => {
          const newvg_id = resultVariantGroups.filter(new_vg => {
            return vg.name === new_vg.name;
          })[0];
          if (newvg_id) {
            let iv_sequence = 1;
            vg.variants?.map(vr => {
              insertVariant.push({
                id: vr.id,
                variant_group_id: newvg_id.id,
                name: vr.name,
                is_default: vr.is_default,
                in_stock: vr.in_stock,
                price: vr.price,
                veg_egg_non: vr.veg_egg_non,
                serves_how_many: vr.serves_how_many,
                sequence: iv_sequence++,
              });
            });
          }
        });
        if (insertVariant.length) {
          await bulkInsertVariant(trx, insertVariant);
        }
      }

      if (insertMenuItem.image) {
        insertMenuItem.image.path = 'menu_item/images/';
        createdMenuItem.image = await saveS3File(true, insertMenuItem.image);
      }
      await models.updateMenuItem(trx, createdMenuItem);
      await models.putMenuItemSQS(createdMenuItem);
      const created_menu_item = await models.readMenuItemFromWR(
        createdMenuItem.id!,
        trx
      );
      const created_menu_item_with_url = await generateDownloadURL(
        created_menu_item
      );
      const approval_details = await markForApproval(trx, {
        approval_entities: [
          {
            action: ApprovalAction.CREATE,
            restaurant_id: req.user.data.restaurant_id,
            entity_type: ApprovalEntityType.MENU_ITEM,
            entity_id: createdMenuItem.id!,
            requested_entity_changes: created_menu_item_with_url,
            status: ApprovalStatus.PENDING,
            change_requested_by: req.user.id,
          },
        ],
      });
      logger.debug('menu item approval details', approval_details);
      await trx.commit();

      return sendSuccess(res, 201, created_menu_item_with_url);
    } catch (error) {
      logger.error('create menu item as vendor transaction failed', error);
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function updateMenuItem(req: Request, res: Response) {
  try {
    req.body.id = req.params.id;
    req.body.restaurant_id = req.user.data.restaurant_id;
    const validation = models.verify_update_menu_item.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = <models.IMenuItem>validation.value;

    // save Image
    const trx = await getTransaction();
    try {
      const read_menu_item = await models.readMenuItemForUpdate(
        trx,
        validated_req.id!
      );
      if (
        !read_menu_item ||
        read_menu_item.restaurant_id !== req.user.data.restaurant_id
      ) {
        throw new ResponseError(404, 'Menu Item not found');
      }

      validatePosPartnerAccess(read_menu_item.pos_partner);

      // check subcategory is from same restaurant
      const sub_category = await readSubCategory(
        validated_req.sub_category_id!,
        req.user.data.restaurant_id
      );
      if (
        !sub_category ||
        sub_category.restaurant_id !== req.user.data.restaurant_id
      )
        throw new ResponseError(404, 'Sub Category Not Found');

      // check duplicate name in same sub category

      if (validated_req.name)
        if (await models.CheckDuplicateName(validated_req))
          throw new ResponseError(400, 'Duplicate Item Name');

      const addongroupIds: number[] = [];
      const addonIds: number[] = [];
      const updateAddons: models.IItem_Addon[] = [];
      const insertAddonGroups: IItem_AddonGroup[] = [];

      if (validated_req.addon_groups !== undefined || null) {
        validated_req.addon_groups?.map(ag => {
          addongroupIds.push(ag.id!);
          ag.addons?.map(ad => {
            addonIds.push(ad.id!);
            updateAddons.push({
              addon_id: ad.id,
            });
          });
          insertAddonGroups.push({
            addon_group_id: ag.id,
            max_limit: ag.max_limit,
            min_limit: ag.min_limit,
            free_limit: ag.free_limit,
            sequence: ag.sequence,
          });
        });
        logger.debug('successfully mapped addon groups');
      }

      const read_addon_groups = await readAddonGroups(
        addongroupIds,
        req.user.data.restaurant_id
      );
      const unauthaddongroups = read_addon_groups.filter(ag => {
        return ag.restaurant_id !== req.user.data.restaurant_id;
      });
      if (
        unauthaddongroups.length > 0 ||
        read_addon_groups.length !== addongroupIds.length
      ) {
        throw new ResponseError(404, 'Addon Group Not Found');
      }

      // check Addons Owner
      const read_addon = await readAddonByIds(
        addonIds,
        req.user.data.restaurant_id
      );
      const unauthaddon = read_addon.filter(ad => {
        return ad.restaurant_id !== req.user.data.restaurant_id;
      });
      if (unauthaddon.length > 0 || read_addon.length !== addonIds.length) {
        throw new ResponseError(404, 'Addon Not Found');
      }
      // check for duplicate variant groups
      const duplicate: string[] = [];
      const default_Variant: string[] = [];
      validated_req.variant_groups?.map(vg_m => {
        const dflt_vr = vg_m.variants?.filter(vr_f => {
          return vr_f.is_default === true;
        });
        if (dflt_vr && dflt_vr?.length > 1) {
          default_Variant.push(
            'Variant Group id: ' + vg_m + ' >> Multiple default Variant'
          );
        }
        if (dflt_vr && dflt_vr?.length < 1) {
          default_Variant.push(
            'Variant Group id: ' + vg_m + ' >> No default Variant'
          );
        }
        const rpt_vg = validated_req.variant_groups?.filter(vg_f => {
          return vg_m.name === vg_f.name;
        });
        if (rpt_vg && rpt_vg?.length > 1) {
          duplicate.push(
            'Duplicate Variant Group Id:' + vg_m.id + '' + vg_m.name
          );
        } else {
          vg_m.variants?.map(vr_m => {
            const rpt_vr = vg_m.variants?.filter(vr_f => {
              return vr_m.name === vr_f.name;
            });
            if (rpt_vr && rpt_vr?.length > 1) {
              duplicate.push(
                'Duplicate Variant Id:' +
                  vr_m.id +
                  ' >>' +
                  vr_m.name +
                  ' in Group: id' +
                  vg_m.id +
                  '' +
                  vg_m.name
              );
            }
          });
        }
      });
      if (duplicate.length || default_Variant.length) {
        throw new ResponseError(
          400,
          JSON.stringify([...duplicate, ...default_Variant])
        );
      }

      const updateMenuItem = <models.IMenuItem>(
        JSON.parse(JSON.stringify(validated_req))
      );
      delete updateMenuItem.addon_groups;
      delete updateMenuItem.variant_groups;
      const updatededMenuItem = await models.updateMenuItem(
        trx,
        updateMenuItem
      );

      updateAddons.map(item => {
        item.menu_item_id = updatededMenuItem.id;
      });
      if (updateAddons.length) {
        await models.insertItemAddon(trx, updateAddons);
      }

      insertAddonGroups.map(item => {
        item.menu_item_id = updatededMenuItem.id;
      });
      await clearItemAddonGroup(trx, updatededMenuItem.id!);
      if (insertAddonGroups.length) {
        await bulkInsertItemAddonGroup(trx, insertAddonGroups);
      }

      const insertVariantGroup: IVariantGroup[] = [];
      const updateVariantGroup: IVariantGroup[] = [];
      let vg_sequence = 1;
      validated_req.variant_groups?.map(vg => {
        if (vg.id) {
          updateVariantGroup.push({
            id: vg.id,
            menu_item_id: updatededMenuItem.id,
            name: vg.name,
            sequence: vg_sequence++,
          });
        } else {
          insertVariantGroup.push({
            id: vg.id,
            menu_item_id: updatededMenuItem.id,
            name: vg.name,
            sequence: vg_sequence++,
          });
        }
      });

      const deleteVariantGroupIds: number[] = [];
      read_menu_item.variant_groups?.map(vg => {
        const foundVG = updateVariantGroup?.filter(vg_f => {
          return vg.id === vg_f.id;
        })[0];
        if (!foundVG) {
          deleteVariantGroupIds.push(vg.id!);
        }
      });
      if (deleteVariantGroupIds.length) {
        await bulkDeleteVariantGroup(trx, deleteVariantGroupIds);
      }
      if (updateVariantGroup.length) {
        await bulkUpdateVariantGroup(trx, updateVariantGroup);
      }
      let resultVariantGroups: IVariantGroup[] = [];
      if (insertVariantGroup.length) {
        resultVariantGroups = await bulkInsertVariantGroup(
          trx,
          insertVariantGroup
        );
      }
      const insertVariant: IVariant[] = [];
      const updateVariant: IVariant[] = [];
      validated_req.variant_groups?.map(vg => {
        let newvg_id = resultVariantGroups.filter(new_vg => {
          return vg.name === new_vg.name;
        })[0];
        if (!newvg_id) {
          newvg_id = updateVariantGroup.filter(new_vg => {
            return vg.name === new_vg.name;
          })[0];
        }
        if (newvg_id) {
          let iv_sequence = 1;
          vg.variants?.map(vr => {
            if (vr.id) {
              updateVariant.push({
                id: vr.id,
                variant_group_id: newvg_id.id,
                name: vr.name,
                is_default: vr.is_default,
                in_stock: vr.in_stock,
                price: vr.price,
                veg_egg_non: vr.veg_egg_non,
                serves_how_many: vr.serves_how_many,
                is_deleted: false,
                sequence: iv_sequence++,
              });
            } else {
              insertVariant.push({
                variant_group_id: newvg_id.id,
                name: vr.name,
                is_default: vr.is_default,
                in_stock: vr.in_stock,
                price: vr.price,
                veg_egg_non: vr.veg_egg_non,
                serves_how_many: vr.serves_how_many,
                sequence: iv_sequence++,
              });
            }
          });
        }
      });
      const deleteVariantIds: number[] = [];
      read_menu_item.variant_groups?.map(vg => {
        vg.variants?.map(vr => {
          const foundVR = updateVariant.filter(vr_f => {
            return vr.id === vr_f.id;
          })[0];
          if (!foundVR) {
            deleteVariantIds.push(vr.id!);
          }
        });
      });
      if (deleteVariantIds.length) {
        await bulkDeleteVariant(trx, deleteVariantIds);
      }
      if (insertVariant.length) {
        await bulkInsertVariant(trx, insertVariant);
      }
      if (updateVariant.length) {
        await bulkUpdateVariant(trx, updateVariant);
      }

      if (updateMenuItem.image) {
        updateMenuItem.image.path = 'menu_item/images/';
        updatededMenuItem.image = await saveS3File(
          true,
          updateMenuItem.image,
          read_menu_item?.image
        );
      }
      await models.updateMenuItem(trx, updatededMenuItem);
      await models.putMenuItemSQS(updatededMenuItem);
      const updated_menu_item = await models.readMenuItemFromWR(
        updatededMenuItem.id!,
        trx
      );
      const updated_menu_item_with_url = await generateDownloadURL(
        updated_menu_item
      );

      const approval_details = await markForApproval(trx, {
        approval_entities: [
          {
            action: ApprovalAction.UPDATE,
            restaurant_id: req.user.data.restaurant_id,
            entity_type: ApprovalEntityType.MENU_ITEM,
            entity_id: updatededMenuItem.id!,
            previous_entity_details: await generateDownloadURL(read_menu_item),
            requested_entity_changes: updated_menu_item_with_url,
            status: ApprovalStatus.PENDING,
            change_requested_by: req.user.id,
          },
        ],
      });
      logger.debug('menu item approval details', approval_details);
      await trx.commit();
      return sendSuccess(res, 200, updated_menu_item_with_url);
    } catch (error) {
      logger.error('Update Item Transaction Failed', error);
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function setMenuItemAvailableAfter(req: Request, res: Response) {
  try {
    req.body.id = req.params.id;
    const setVal = models.verify_holiday_slot.validate(req.body);
    if (setVal.error)
      return sendError(res, 400, setVal.error.details[0].message);
    let end_date_time: Date | null = new Date(0);
    if (setVal.value.end_epoch) {
      end_date_time.setUTCSeconds(setVal.value.end_epoch);
      if (end_date_time < new Date()) {
        return sendError(res, 400, 'End time is before current date');
      }
    } else {
      end_date_time = null;
    }
    const inputData = <models.IMenuItem>{
      id: setVal.value.id,
      next_available_after: end_date_time,
    };
    const menu_item = await models.readMenuItem(inputData.id!);
    if (!menu_item || menu_item.restaurant_id !== req.user.data.restaurant_id) {
      return sendError(res, 404, 'Menu Item not found');
    }
    validatePosPartnerAccess(menu_item.pos_partner);
    const trx = await getTransaction();
    try {
      const deletedItem = await models.updateMenuItem(trx, inputData);
      await trx.commit();
      return sendSuccess(res, 200, deletedItem);
    } catch (error) {
      logger.error('Create Item Transaction Failed', error);
      await trx.rollback();
      return sendError(res, 500, 'internal server error');
    }
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function deleteMenuItem(req: Request, res: Response) {
  try {
    const validation = Joi.id_num.validate(req.params.id);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const menu_item = await models.readMenuItem(validation.value);

    if (!menu_item || menu_item.restaurant_id !== req.user.data.restaurant_id) {
      return sendError(res, 404, 'Menu Item not found');
    }

    validatePosPartnerAccess(menu_item.pos_partner);

    const variant_groups = await readVariantGroupByMenuIds([validation.value]);
    const variant_group_ids: number[] = variant_groups.map(vg => vg.id!);

    const variants = await readVariantByVariantGroupIds(variant_group_ids);
    const variant_ids: number[] = variants.map(v => v.id!);

    const trx = await getTransaction();
    try {
      const deletedItem = await models.deleteMenuItem(validation.value);

      await clearItemAddon(trx, [validation.value]);

      await clearItemAddonGroups(trx, [validation.value]);

      await bulkDeleteVariant(trx, variant_ids);

      await bulkDeleteVariantGroup(trx, variant_group_ids);

      await trx.commit();

      models.deleteMenuItemSQS(validation.value);

      return sendSuccess(res, 200, deletedItem);
    } catch (error) {
      await trx.rollback();
      logger.error('Failed Saving Restaurant POS ID', error);
      throw 'Failed Saving Restaurant POS ID';
    }
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function admin_getMenuItem(req: Request, res: Response) {
  try {
    const validation = Joi.id_num.validate(req.params.id);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);

    const menu_item = await models.readMenuItem(validation.value);
    if (!menu_item) {
      return sendError(res, 404, 'Menu Item not found');
    }

    if (menu_item.variant_groups) {
      const NOTA_VG_DISPLAY_NAME = await Globals.NOTA_VG_DISPLAY_NAME.get();

      menu_item.variant_groups.forEach((vg: {variant_group_name: string}) => {
        if (vg.variant_group_name === 'NOTA') {
          vg.variant_group_name = NOTA_VG_DISPLAY_NAME;
        }
      });
    }

    const discount_rate = await models.getItemDiscount(validation.value);
    calculateMenuItemDisplayPrice(menu_item, discount_rate);
    return sendSuccess(res, 200, await generateDownloadURL(menu_item));
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function admin_getMenuItems(req: Request, res: Response) {
  try {
    const result = await getRestaurantMenuItems(req.params.restaurant_id);
    return sendSuccess(res, 200, result);
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function admin_createMenuItem(req: Request, res: Response) {
  try {
    const validation = models.verify_create_menu_item.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = <models.IMenuItem>validation.value;

    const restaurant = await readRestaurantById(validated_req.restaurant_id!);

    if (!restaurant) return sendError(res, 404, 'Restaurnat Not Found');

    validatePosPartnerAccess(restaurant.pos_partner);

    logger.error('validated_req ', validated_req);
    // check subcategory is from same restaurant
    const sub_category = await readSubCategory(validated_req.sub_category_id!);
    if (!sub_category) return sendError(res, 404, 'Sub Category Not Found');

    // check duplicate name in same sub category
    if (await models.CheckDuplicateName(validated_req))
      return sendError(res, 400, 'Duplicate Item Name');

    // check Addon Groups owner
    const addongroupIds: number[] = [];
    const addonIds: number[] = [];
    const InsertAddons: models.IItem_Addon[] = [];
    const InsertAddonGroups: IItem_AddonGroup[] = [];

    if (validated_req.addon_groups !== undefined || null) {
      validated_req.addon_groups?.map(ag => {
        addongroupIds.push(ag.id!);
        ag.addons?.map(ad => {
          addonIds.push(ad.id!);
          InsertAddons.push({
            addon_id: ad.id,
          });
        });
        InsertAddonGroups.push({
          addon_group_id: ag.id,
          max_limit: ag.max_limit,
          min_limit: ag.min_limit,
          free_limit: ag.free_limit,
          sequence: ag.sequence,
        });
      });
      logger.debug('successfully mapped addon groups');

      // reading addon group
      const addon_group = await readAddonGroup(
        InsertAddonGroups[0].addon_group_id!
      );
      if (!addon_group) return sendError(res, 404, 'Addon Group Not Found');

      // reading addons
      const addons = await readAddon(InsertAddons[0].addon_id!);
      if (!addons) return sendError(res, 404, 'Addons Not Found');
    }

    // check for duplicate variant groups
    const duplicate: string[] = [];
    const default_Variant: string[] = [];
    validated_req.variant_groups?.map(vg_m => {
      const dflt_vr = vg_m.variants?.filter(vr_f => {
        return vr_f.is_default === true;
      });
      if (dflt_vr && dflt_vr?.length > 1) {
        default_Variant.push(
          'Variant Group id: ' + vg_m + ' >> Multiple default Variant'
        );
      }
      if (dflt_vr && dflt_vr?.length < 1) {
        default_Variant.push(
          'Variant Group id: ' + vg_m + ' >> No default Variant'
        );
      }
      const rpt_vg = validated_req.variant_groups?.filter(vg_f => {
        return vg_m.name === vg_f.name;
      });
      if (rpt_vg && rpt_vg?.length > 1) {
        duplicate.push(
          'Duplicate Variant Group Id:' + vg_m.id + '' + vg_m.name
        );
      } else {
        vg_m.variants?.map(vr_m => {
          const rpt_vr = vg_m.variants?.filter(vr_f => {
            return vr_m.name === vr_f.name;
          });
          if (rpt_vr && rpt_vr?.length > 1) {
            duplicate.push(
              'Duplicate Variant Id:' +
                vr_m.id +
                ' >>' +
                vr_m.name +
                ' in Group: id' +
                vg_m.id +
                '' +
                vg_m.name
            );
          }
        });
      }
    });
    if (duplicate.length || default_Variant.length) {
      return sendError(
        res,
        400,
        JSON.stringify([...duplicate, ...default_Variant])
      );
    }

    const trx = await getTransaction();
    // save Image
    try {
      const insertMenuItem = <models.IMenuItem>(
        JSON.parse(JSON.stringify(validated_req))
      );
      delete insertMenuItem.addon_groups;
      delete insertMenuItem.variant_groups;
      const createdMenuItem = (
        await models.bulkInsertMenuItem(trx, [insertMenuItem])
      )[0];

      InsertAddons.map(item => {
        item.menu_item_id = createdMenuItem.id;
      });
      if (InsertAddons.length) {
        await models.insertItemAddon(trx, InsertAddons);
      }

      InsertAddonGroups.map(item => {
        item.menu_item_id = createdMenuItem.id;
      });
      if (InsertAddonGroups.length) {
        await bulkInsertItemAddonGroup(trx, InsertAddonGroups);
      }

      const insertVariantGroup: IVariantGroup[] = [];

      let vg_sequence = 1;
      validated_req.variant_groups?.map(vg => {
        insertVariantGroup.push({
          id: vg.id,
          menu_item_id: createdMenuItem.id,
          name: vg.name,
          sequence: vg_sequence++,
        });
      });

      if (insertVariantGroup.length) {
        const resultVariantGroups = await bulkInsertVariantGroup(
          trx,
          insertVariantGroup
        );

        const insertVariant: IVariant[] = [];
        validated_req.variant_groups?.map(vg => {
          const newvg_id = resultVariantGroups.filter(new_vg => {
            return vg.name === new_vg.name;
          })[0];
          if (newvg_id) {
            let iv_sequence = 1;
            vg.variants?.map(vr => {
              insertVariant.push({
                id: vr.id,
                variant_group_id: newvg_id.id,
                name: vr.name,
                is_default: vr.is_default,
                in_stock: vr.in_stock,
                price: vr.price,
                veg_egg_non: vr.veg_egg_non,
                serves_how_many: vr.serves_how_many,
                sequence: iv_sequence++,
              });
            });
          }
        });
        if (insertVariant.length) {
          await bulkInsertVariant(trx, insertVariant);
        }
      }

      if (insertMenuItem.image) {
        insertMenuItem.image.path = 'menu_item/images/';
        createdMenuItem.image = await saveS3File(true, insertMenuItem.image);
      }
      await models.updateMenuItem(trx, createdMenuItem);
      await models.putMenuItemSQS(createdMenuItem);
      await trx.commit();

      const read_menu_item = await models.readMenuItemFromWR(
        createdMenuItem.id!
      );
      return sendSuccess(res, 201, await generateDownloadURL(read_menu_item));
    } catch (error) {
      logger.error('Create Item Transaction Failed', error);
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function admin_updateMenuItem(req: Request, res: Response) {
  try {
    req.body.id = req.params.id;
    const validation = verify_menu_item_id.validate(req.params.id);
    if (validation.error)
      throw new ResponseError(400, validation.error.details[0].message);
    const menu_item_id = validation.value as number;

    // save Image
    const trx = await getTransaction();
    try {
      const existing_menu_item = await models.readMenuItemForUpdate(
        trx,
        menu_item_id
      );
      if (!existing_menu_item) {
        throw new ResponseError(404, 'Menu Item not found');
      }
      if (existing_menu_item.pos_partner === PosPartner.PETPOOJA) {
        await service.updatePetpoojaMenuItem(trx, existing_menu_item, req.body);
      } else {
        await service.updateMenuItem(trx, existing_menu_item, req.body);
      }
      await trx.commit();
    } catch (error) {
      logger.debug('Menu item update error', error);
      await trx.rollback();
      throw error;
    }
    const updated_menu_item = await models.readMenuItemFromWR(menu_item_id);
    return sendSuccess(res, 200, await generateDownloadURL(updated_menu_item));
  } catch (error) {
    return handleErrors(res, error, 'Failed while update menu item as admin');
  }
}

export async function admin_setMenuItemAvailableAfter(
  req: Request,
  res: Response
) {
  try {
    req.body.id = req.params.id;
    const setVal = models.verify_holiday_slot.validate(req.body);
    if (setVal.error)
      return sendError(res, 400, setVal.error.details[0].message);
    let end_date_time: Date | null = new Date(0);
    if (setVal.value.end_epoch) {
      end_date_time.setUTCSeconds(setVal.value.end_epoch);
      if (end_date_time < new Date()) {
        return sendError(res, 400, 'End time is before current date');
      }
    } else {
      end_date_time = null;
    }
    const inputData = <models.IMenuItem>{
      id: setVal.value.id,
      next_available_after: end_date_time,
    };
    const menu_item = await models.readMenuItem(inputData.id!);
    if (!menu_item) {
      return sendError(res, 404, 'Menu Item not found');
    }
    validatePosPartnerAccess(menu_item.pos_partner);
    const trx = await getTransaction();
    try {
      const deletedItem = await models.updateMenuItem(trx, inputData);
      await trx.commit();
      return sendSuccess(res, 200, deletedItem);
    } catch (error) {
      logger.error('Create Item Transaction Failed', error);
      await trx.rollback();
      return sendError(res, 500, 'internal server error');
    }
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function admin_deleteMenuItem(req: Request, res: Response) {
  try {
    const validation = Joi.id_num.validate(req.params.id);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const menu_item = await models.readMenuItem(validation.value);

    if (!menu_item) {
      return sendError(res, 404, 'Menu Item not found');
    }

    validatePosPartnerAccess(menu_item.pos_partner);

    const variant_groups = await readVariantGroupByMenuIds([validation.value]);
    const variant_group_ids: number[] = variant_groups.map(vg => vg.id!);

    const variants = await readVariantByVariantGroupIds(variant_group_ids);
    const variant_ids: number[] = variants.map(v => v.id!);

    const trx = await getTransaction();
    try {
      const deletedItem = await models.deleteMenuItem(validation.value);

      await clearItemAddon(trx, [validation.value]);

      await clearItemAddonGroups(trx, [validation.value]);

      await bulkDeleteVariant(trx, variant_ids);

      await bulkDeleteVariantGroup(trx, variant_group_ids);

      await trx.commit();

      models.deleteMenuItemSQS(validation.value);

      return sendSuccess(res, 200, deletedItem);
    } catch (error) {
      await trx.rollback();
      logger.error('Failed Saving Restaurant POS ID', error);
      throw 'Failed Saving Restaurant POS ID';
    }
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function setItemMenuSequence(
  req: Request,
  res: Response,
  table_name: string
) {
  try {
    const ids_validation = Joi.ids_num.validate(req.body.sorted_ids);
    if (ids_validation.error)
      return sendError(res, 400, ids_validation.error.details[0].message);

    const is_admin = req.user.user_type === UserType.ADMIN;

    let records: {id?: number; sequence?: number}[] = [];

    if (table_name === 'main_category') {
      let restaurant_id = req.params.parent_id;
      if (!is_admin) {
        restaurant_id = req.user.data.restaurant_id;
      }
      records = await readMainCategoryByRestaurantIds([restaurant_id]);
    } else {
      const id_validation = Joi.id_num.validate(req.params.parent_id);
      if (id_validation.error)
        return sendError(
          res,
          400,
          id_validation.error.details[0].message + 'xx'
        );
      const parent_id = id_validation.value;

      if (table_name === 'sub_category') {
        const main_category = await readMainCategory(parent_id!);
        if (
          is_admin ||
          main_category.restaurant_id === req.user.data.restaurant_id
        )
          records = await readSubCategoryByMainCategoryIds([parent_id]);
      } else if (table_name === 'menu_item') {
        const menu_items = await models.readMenuItemBySubCategoryIds([
          parent_id,
        ]);
        const invalid_item = menu_items.filter(
          item => item.restaurant_id !== req.user.data.restaurant_id
        );
        if (is_admin || !invalid_item.length) records = menu_items;
      } else if (table_name === 'item_variant_group') {
        const menu_item = await models.readMenuItem(parent_id);
        if (is_admin || menu_item.restaurant_id === req.user.data.restaurant_id)
          records = await readVariantGroupByMenuIds([parent_id]);
      } else if (table_name === 'item_variant') {
        const variant_group = await readVariantGroupByIds([parent_id]);
        if (variant_group.length) {
          const menu_item = await models.readMenuItem(
            variant_group[0].menu_item_id!
          );
          if (
            is_admin ||
            menu_item.restaurant_id === req.user.data.restaurant_id
          )
            records = await readVariantByVariantGroupIds([parent_id]);
        }
      }
    }
    if (!records.length) return sendError(res, 400, 'Invalid parent id');
    const input_data: {id?: number; sequence?: number}[] = [];
    records.map(item => (item.sequence = 0));
    for (let index = 0; index < ids_validation.value.length; index++) {
      const id = ids_validation.value[index];
      const rec = records.find(rec => rec.id === id);
      if (rec) {
        input_data.push({id, sequence: index + 1});
        rec.sequence = index + 1;
      } else return sendError(res, 400, 'Invalid id:' + id);
    }
    const notfound = records.filter(item => item.sequence === 0);
    if (notfound.length)
      return sendError(
        res,
        400,
        'Not found ids:' + notfound.map(item => item.id)
      );
    const result = await bulkUpdateMenuSequence(input_data, table_name);
    result.sort((a, b) => a.sequence - b.sequence);
    return sendSuccess(res, 200, result);
  } catch (error) {
    return handleErrors(res, error);
  }
}
export async function setItemVariantSequence(req: Request, res: Response) {
  setItemMenuSequence(req, res, 'item_variant');
}
export async function setVariantGroupSequence(req: Request, res: Response) {
  setItemMenuSequence(req, res, 'item_variant_group');
}
export async function setMenuItemSequence(req: Request, res: Response) {
  setItemMenuSequence(req, res, 'menu_item');
}

export async function getMenuDiscount(req: Request, res: Response) {
  try {
    const menu = await models.readMenuDiscount(req.params.restaurant_id);
    if (!menu) return sendError(res, 404, 'Restaurant Menu not found');
    calculateDisplayPrice(menu);
    return sendSuccess(res, 200, menu);
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function updateMenuDiscount(req: Request, res: Response) {
  try {
    const validation = models.verify_update_discount.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = validation.value as models.IUpdateDiscount;
    const restaurant_id = req.params.restaurant_id;
    const trx = await getTransaction();
    try {
      if (validated_req.main_categories) {
        if (validated_req.sub_categories || validated_req.menu_items) {
          return sendError(res, 400, 'Multiple type not allowed');
        }
        // set main category discount
        const main_categories = await readMainCategories(restaurant_id);
        const invalid_ids = validated_req.main_categories.filter(mci => {
          if (main_categories.find(mc => mc.id === mci.main_category_id)) {
            return false;
          } else {
            return true;
          }
        });
        if (invalid_ids.length) {
          return sendError(res, 400, 'invalid main_category_ids:', invalid_ids);
        }
        await models.setMainCategoryDiscount(
          trx,
          restaurant_id,
          validated_req.main_categories,
          req.user.id,
          'admin'
        );
      } else if (validated_req.sub_categories) {
        if (validated_req.menu_items) {
          return sendError(res, 400, 'Multiple type not allowed');
        }
        // set sub category discount
        const sub_categories = await readSubCategoriesByRestaurantId(
          restaurant_id
        );
        const invalid_ids = validated_req.sub_categories.filter(sci => {
          if (sub_categories.find(sc => sc.id === sci.sub_category_id)) {
            return false;
          } else {
            return true;
          }
        });
        if (invalid_ids.length) {
          return sendError(res, 400, 'invalid sub_category_ids:', invalid_ids);
        }
        await models.setSubCategoryDiscount(
          trx,
          restaurant_id,
          validated_req.sub_categories,
          req.user.id,
          'admin'
        );
      } else if (validated_req.menu_items) {
        // set menu item discount
        const menu_ites = await models.readMenuItems(
          validated_req.menu_items.map(mi => mi.menu_item_id)
        );
        const invalid_ids = validated_req.menu_items.filter(mii => {
          if (
            menu_ites.find(
              mi =>
                mi.menu_item_id === mii.menu_item_id &&
                mi.restaurant_id === restaurant_id
            )
          ) {
            return false;
          } else {
            return true;
          }
        });
        if (invalid_ids.length) {
          return sendError(res, 400, 'invalid menu_item_ids:', invalid_ids);
        }
        await models.setMenuItemDiscount(
          trx,
          restaurant_id,
          validated_req.menu_items,
          req.user.id,
          'admin'
        );
      } else if (validated_req.restaurant) {
        // set restaurant discount
        if (validated_req.restaurant.restaurant_id !== restaurant_id) {
          return sendError(
            res,
            400,
            'invalid restaurant_id:',
            validated_req.restaurant.restaurant_id
          );
        }
        await models.setRestaurantDiscount(
          trx,
          [validated_req.restaurant],
          req.user.id,
          'admin'
        );
      }
      await trx.commit();
    } catch (error) {
      await trx.rollback();
      logger.error(
        'EXCEPTION while updaitng menu discount for restaurant:' +
          restaurant_id,
        {error, request: validated_req}
      );
      throw error;
    }
    const menu = await models.readMenuDiscount(restaurant_id);
    if (!menu) return sendError(res, 404, 'Restaurant Menu not found');
    calculateDisplayPrice(menu);
    return sendSuccess(res, 200, menu);
  } catch (error) {
    return handleErrors(res, error);
  }
}
