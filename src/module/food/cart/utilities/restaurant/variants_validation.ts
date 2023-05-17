import Globals from '../../../../../utilities/global_var/globals';
import logger from '../../../../../utilities/logger/winston_logger';
import ResponseError from '../../../../../utilities/response_error';
import {roundUp} from '../../../../../utilities/utilFuncs';
import {
  ICartVariant,
  ICartVariantGroup,
  IMenuItemVariantGroup,
} from '../../types';

//databaseVariantGroups are all the variant groups for selected menu item fetched from database
//variantGroups are user selected variant groups
export async function validateVariantGroups(
  databaseVariantGroups: ICartVariantGroup[],
  variantGroups: IMenuItemVariantGroup[]
) {
  let variantsInStock = true;
  let totalVariantsCostWithoutTax = 0;
  let variantsCount = 0;
  const unavailableVariants: number[] = [];
  const NOTA_VG_DISPLAY_NAME = await Globals.NOTA_VG_DISPLAY_NAME.get();
  //check selected varaint groups by customer
  for (let vg = 0; vg < variantGroups.length; vg++) {
    const variantGroup = variantGroups[vg];
    let databaseVariantGroup: ICartVariantGroup | undefined;
    //check selected varaint groups by customer with database varaint groups for same item
    for (let index = 0; index < databaseVariantGroups.length; index++) {
      if (databaseVariantGroups[index].variant_group_name === 'NOTA') {
        databaseVariantGroups[index].variant_group_name = NOTA_VG_DISPLAY_NAME;
      }
      if (
        databaseVariantGroups[index].variant_group_id ===
        variantGroup.variant_group_id
      ) {
        //if variant group is_selected is already true then we found a dublicate variant group
        if (databaseVariantGroups[index].is_selected) {
          logger.error(
            `CART_VALIDATION_FAILED: duplicate_variant_group_found_in_cart variant_group_id: ${databaseVariantGroups[index].variant_group_id}`
          );
          throw new ResponseError(400, [
            {
              message: `${databaseVariantGroups[index].variant_group_name} is already selected`,
              code: 1010,
            },
          ]);
        } else {
          databaseVariantGroups[index].is_selected = true;
          databaseVariantGroup = databaseVariantGroups[index];
        }
      } else {
        //if variant group is_selected is true then dont make is false
        if (databaseVariantGroups[index].is_selected) true;
        else databaseVariantGroups[index].is_selected = false;
        //in any other case make is_selected = false
      }
    }
    //validate variants of variant group
    if (
      databaseVariantGroup &&
      Object.keys(databaseVariantGroup).length > 0 &&
      Object.keys(variantGroup).length > 0
    ) {
      const menuVariant = variantGroup.variant_id;
      let databaseVariant: ICartVariant | undefined;

      //check customer selected variants and database varinats
      for (
        let index = 0;
        index < databaseVariantGroup.variants.length;
        index++
      ) {
        if (databaseVariantGroup.variants[index].variant_id === menuVariant) {
          //thier can be only one variant selected from a variant group rest all varinats will be false
          databaseVariantGroup.variants[index].is_selected = true;
          databaseVariant = databaseVariantGroup.variants[index];
        } else {
          databaseVariantGroup.variants[index].is_selected = false;
        }
      }
      //validate each variant
      if (databaseVariant && Object.keys(databaseVariant).length > 0) {
        //Update Variant inStock
        if (
          databaseVariant.next_available_after &&
          databaseVariant.next_available_after !== null &&
          new Date(databaseVariant.next_available_after) > new Date()
        ) {
          variantsInStock = false;
        }
        if (!databaseVariant.in_stock) {
          variantsInStock = false;
          unavailableVariants.push(databaseVariant.variant_id!);
        }

        if (databaseVariant.price)
          totalVariantsCostWithoutTax += databaseVariant.price;
        else {
          if (databaseVariant.price === null) {
            logger.error(
              `CART_VALIDATION_FAILED: invalid_variant_price variant_id: ${databaseVariant.variant_id}`
            );
            throw new ResponseError(400, [
              {
                message: `variant_${databaseVariant.variant_name}_price_is_invalid`,
                code: 1011,
              },
            ]);
          }
          totalVariantsCostWithoutTax += 0;
        }

        variantsCount = variantsCount + 1;
        // databaseVariantGroup.variants = [databaseVariant];
      } else {
        logger.error(
          `CART_VALIDATION_FAILED: invalid_variant_id_${variantGroup.variant_id}_of_group_id_${variantGroup.variant_group_id}`
        );
        throw new ResponseError(400, [
          {
            message: `invalid_variant_id_${variantGroup.variant_id}_of_group_id_${variantGroup.variant_group_id}`,
            code: 1012,
          },
        ]);
      }
    } else {
      logger.error(
        `CART_VALIDATION_FAILED: invalid_variant_group_id_${variantGroup.variant_group_id}`
      );
      throw new ResponseError(400, [
        {
          message: `invalid_variant_group_id_${variantGroup.variant_group_id}`,
          code: 1013,
        },
      ]);
    }
  }

  return {
    databaseVariantGroups,
    variantsCount,
    variantsInStock,
    unavailableVariants,
    totalVariantsCostWithoutTax: roundUp(totalVariantsCostWithoutTax, 2),
  };
}
