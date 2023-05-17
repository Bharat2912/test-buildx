import {
  IMenuItem,
  bulkHardDeleteItemAddon,
  verify_update_menu_item,
} from './models';
import * as models from './models';
import {readSubCategory} from './sub_category/models';
import {
  bulkInsertItemAddonGroup,
  clearItemAddonGroup,
  IItem_AddonGroup,
} from './item_addon_group/models';
import {
  bulkDeleteVariant,
  bulkInsertVariant,
  bulkUpdateVariant,
  IVariant,
  readVariantByVariantGroupIdsForUpdate,
} from './variant/models';
import {
  bulkDeleteVariantGroup,
  bulkInsertVariantGroup,
  bulkUpdateVariantGroup,
  IVariantGroup,
  readVariantGroupByMenuItemIdsForUpdate,
} from './variant_group/models';
import {FileObject, saveS3File} from '../../../utilities/s3_manager';
import ResponseError from '../../../utilities/response_error';
import {Knex} from 'knex';
import {verify_update_petpooja_menu_item} from './validation';
import {readAddonGroups} from './addon_group/models';
import {readAddonByIds} from './addon/models';

export async function updatePetpoojaMenuItem(
  trx: Knex.Transaction,
  existing_menu_item: IMenuItem,
  menu_item_for_update: IMenuItem
) {
  const validation =
    verify_update_petpooja_menu_item.validate(menu_item_for_update);
  if (validation.error)
    throw new ResponseError(400, validation.error.details[0].message);
  const validated_req = validation.value as {
    id: number;
    restaurant_id: string;
    image?: FileObject | null;
  };

  if (existing_menu_item.restaurant_id !== validated_req.restaurant_id) {
    throw new ResponseError(400, 'can not change menu items origin restaurant');
  }

  if (validated_req.image) {
    validated_req.image.path = 'menu_item/images/';
    validated_req.image = await saveS3File(
      true,
      validated_req.image,
      existing_menu_item?.image
    );
  }
  await models.updateMenuItem(trx, validated_req);
}

export async function updateMenuItem(
  trx: Knex.Transaction,
  existing_menu_item: IMenuItem,
  menu_item_for_update: IMenuItem
) {
  const validation = verify_update_menu_item.validate(menu_item_for_update);
  if (validation.error)
    throw new ResponseError(400, validation.error.details[0].message);
  const validated_req = <IMenuItem>validation.value;

  if (existing_menu_item.restaurant_id !== validated_req.restaurant_id) {
    throw new ResponseError(400, 'can not change menu items origin restaurant');
  }

  // check new subcategory is from same restaurant
  const sub_category = await readSubCategory(
    validated_req.sub_category_id!,
    existing_menu_item.restaurant_id
  );
  if (!sub_category) throw new ResponseError(404, 'Sub Category Not Found');

  // check duplicate menu item name in same sub category
  if (validated_req.name)
    if (await models.CheckDuplicateName(validated_req))
      throw new ResponseError(400, 'Duplicate Item Name');

  /**--addon--*/
  const addon_ids: number[] = [];
  const addon_group_ids: number[] = [];

  const update_addons: models.IItem_Addon[] = [];
  const insert_addon_groups: IItem_AddonGroup[] = [];

  validated_req.addon_groups?.map(ag => {
    ag.addons?.map(ad => {
      addon_ids.push(ad.id!);
      update_addons.push({
        addon_id: ad.id,
      });
    });
    addon_group_ids.push(ag.id!);
    insert_addon_groups.push({
      addon_group_id: ag.id,
      max_limit: ag.max_limit,
      min_limit: ag.min_limit,
      free_limit: ag.free_limit,
      sequence: ag.sequence,
    });
  });

  const existing_addon_groups = await readAddonGroups(
    addon_group_ids,
    validated_req.restaurant_id
  );

  const invalid_addon_group_ids = addon_group_ids.filter(
    ag_id => !existing_addon_groups?.find(ag => ag.id === ag_id)
  );
  if (invalid_addon_group_ids.length > 0) {
    throw new ResponseError(
      400,
      `Invalid addon group Ids ${invalid_addon_group_ids}`
    );
  }

  const existing_addons = await readAddonByIds(
    addon_ids,
    validated_req.restaurant_id!
  );

  const invalid_addon_ids = addon_ids.filter(
    ad_id => !existing_addons.find(ad => ad.id === ad_id)
  );
  if (invalid_addon_ids.length > 0) {
    throw new ResponseError(400, `Invalid addon Ids ${invalid_addon_ids}`);
  }

  update_addons.forEach(item => {
    item.menu_item_id = validated_req.id;
  });
  await bulkHardDeleteItemAddon(trx, [validated_req.id!]);
  if (update_addons.length) {
    await models.bulkiInsertItemAddon(trx, update_addons);
  }

  insert_addon_groups.forEach(item => {
    item.menu_item_id = validated_req.id;
  });
  await clearItemAddonGroup(trx, validated_req.id!);
  if (insert_addon_groups.length) {
    await bulkInsertItemAddonGroup(trx, insert_addon_groups);
  }
  /**---*/

  // check for duplicate variant groups
  const duplicate: string[] = [];
  const default_Variant: string[] = [];

  validated_req.variant_groups?.map(vg_m => {
    const dflt_vr = vg_m.variants?.filter(vr_f => {
      return vr_f.is_default === true;
    });
    if (dflt_vr && dflt_vr?.length > 1) {
      default_Variant.push(
        'Variant Group id: ' +
          vg_m.id +
          '' +
          vg_m.name +
          ' >> Multiple default Variant'
      );
    }
    if (dflt_vr && dflt_vr?.length < 1) {
      default_Variant.push(
        'Variant Group id: ' +
          vg_m.id +
          '' +
          vg_m.name +
          ' >> No default Variant'
      );
    }
    const rpt_vg = validated_req.variant_groups?.filter(vg_f => {
      return vg_m.name === vg_f.name;
    });
    if (rpt_vg && rpt_vg?.length > 1) {
      duplicate.push('Duplicate Variant Group Id:' + vg_m.id + '' + vg_m.name);
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
  /**---*/

  /**---variant group---*/
  const insertVariantGroup: IVariantGroup[] = [];
  const updateVariantGroup: IVariantGroup[] = [];
  let vg_sequence = 1;
  validated_req.variant_groups?.map(vg => {
    if (vg.id) {
      updateVariantGroup.push({
        id: vg.id,
        menu_item_id: validated_req.id,
        name: vg.name,
        sequence: vg_sequence++,
      });
    } else {
      insertVariantGroup.push({
        id: vg.id,
        menu_item_id: validated_req.id,
        name: vg.name,
        sequence: vg_sequence++,
      });
    }
  });
  const variant_group_ids_for_update = updateVariantGroup.map(vg => vg.id!);
  const existing_variant_groups = await readVariantGroupByMenuItemIdsForUpdate(
    trx,
    [validated_req.id!]
  );
  const existing_variants = await readVariantByVariantGroupIdsForUpdate(
    trx,
    variant_group_ids_for_update
  );

  const deleteVariantGroupIds: number[] = [];
  existing_menu_item.variant_groups?.map(vg => {
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
    const invalid_variant_group_ids = variant_group_ids_for_update.filter(
      vg_id => !existing_variant_groups.find(vg => vg.id === vg_id)
    );
    if (invalid_variant_group_ids.length) {
      throw new ResponseError(
        400,
        `Invalid variant group Ids ${invalid_variant_group_ids}`
      );
    }

    await bulkUpdateVariantGroup(trx, updateVariantGroup);
  }
  let resultVariantGroups: IVariantGroup[] = [];
  if (insertVariantGroup.length) {
    resultVariantGroups = await bulkInsertVariantGroup(trx, insertVariantGroup);
  }
  /**---*/

  /**---variant---*/
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
  existing_menu_item.variant_groups?.map(vg => {
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
    const variant_ids_for_update = updateVariant.map(v => v.id!);
    const invalid_variant_ids = variant_ids_for_update.filter(
      v_id => !existing_variants.find(v => v.id === v_id)
    );
    if (invalid_variant_ids.length) {
      throw new ResponseError(
        400,
        `Invalid variant Ids ${invalid_variant_ids}`
      );
    }
    await bulkUpdateVariant(trx, updateVariant);
  }
  /**---*/

  if (validated_req.image) {
    validated_req.image.path = 'menu_item/images/';
    validated_req.image = await saveS3File(
      true,
      validated_req.image,
      existing_menu_item?.image
    );
  }

  delete validated_req.addon_groups;
  delete validated_req.variant_groups;
  const updatededMenuItem = await models.updateMenuItem(trx, validated_req);
  await models.putMenuItemSQS(updatededMenuItem);
}
