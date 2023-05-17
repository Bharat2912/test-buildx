import logger from '../../../../../utilities/logger/winston_logger';
import ResponseError from '../../../../../utilities/response_error';
import {roundUp} from '../../../../../utilities/utilFuncs';
import {ICartAddon, ICartAddonGroup, IMenuItemAddonGroup} from '../../types';

/**
 * databaseAddonGroups are all the addon groups for selected menu item fetched from database
 * addonGroups are user selected addon groups
 */
export function validateAddonGroups(
  databaseAddonGroups: ICartAddonGroup[],
  addonGroups: IMenuItemAddonGroup[]
) {
  let addonsCount = 0;
  let addonsInStock = true;
  let totalAddonsCostWithoutTax = 0;
  let totalAddonsTax = 0;
  const unavailableAddons: number[] = [];

  for (let ag = 0; ag < addonGroups.length; ag++) {
    //get addon groups information
    const addonGroup = addonGroups[ag];
    let databaseAddonGroup: ICartAddonGroup | undefined;
    for (let index = 0; index < databaseAddonGroups.length; index++) {
      if (
        databaseAddonGroups[index].addon_group_id === addonGroup.addon_group_id
      ) {
        if (databaseAddonGroups[index].is_selected) {
          logger.error(
            `CART_VALIDATION_FAILED: duplicate_addon_group_found_in_cart addon_group_id: ${databaseAddonGroups[index].addon_group_id}`
          );
          throw new ResponseError(400, [
            {
              message: `${databaseAddonGroups[index].addon_group_name} is already selected`,
              code: 1017,
            },
          ]);
        }
        databaseAddonGroups[index].is_selected = true;
        databaseAddonGroup = databaseAddonGroups[index];
      } else {
        if (databaseAddonGroups[index].is_selected) true;
        else databaseAddonGroups[index].is_selected = false;
      }
    }
    if (
      databaseAddonGroup &&
      Object.keys(databaseAddonGroup).length > 0 &&
      Object.keys(addonGroup).length > 0
    ) {
      //thorw error if any of the limits are undefined
      if (
        databaseAddonGroup.max_limit === undefined &&
        databaseAddonGroup.min_limit === undefined &&
        databaseAddonGroup.free_limit === undefined
      ) {
        throw new ResponseError(400, [
          {
            message: `addon_group_id_${addonGroup.addon_group_id}_is_invalid`,
            code: 1032,
          },
        ]);
      }

      if (
        databaseAddonGroup.max_limit === -1 ||
        (addonGroup.addons.length <= databaseAddonGroup.max_limit! &&
          addonGroup.addons.length >= databaseAddonGroup.min_limit!)
      ) {
        //validate indivisual addon
        for (let ad = 0; ad < addonGroup.addons.length; ad++) {
          let databaseAddon: ICartAddon | undefined;
          let addonCost = 0;
          let addonTaxCost = 0;
          for (
            let index = 0;
            index < databaseAddonGroup.addons.length;
            index++
          ) {
            if (
              databaseAddonGroup.addons[index].addon_id ===
              addonGroup.addons[ad]
            ) {
              if (databaseAddonGroup.addons[index].is_selected) {
                logger.error(
                  `CART_VALIDATION_FAILED: duplicate_addon_found_in_cart addon_id:${databaseAddonGroup.addons[index].addon_id}`
                );
                throw new ResponseError(400, [
                  {
                    message: `${databaseAddonGroup.addons[index].addon_name} is already selected`,
                    code: 1018,
                  },
                ]);
              } else {
                databaseAddonGroup.addons[index].is_selected = true;
                databaseAddon = databaseAddonGroup.addons[index];
              }
            } else {
              if (!databaseAddonGroup.addons[index].is_selected)
                databaseAddonGroup.addons[index].is_selected = false;
            }
          }
          if (databaseAddon && Object.keys(databaseAddon).length > 0) {
            //Update Addon inStock
            if (
              databaseAddon.next_available_after &&
              databaseAddon.next_available_after !== null &&
              new Date(databaseAddon.next_available_after) > new Date()
            ) {
              addonsInStock = false;
            }
            if (!databaseAddon.in_stock) {
              addonsInStock = false;
              unavailableAddons.push(databaseAddon.addon_id!);
            }
            addonsCount = addonsCount + 1;

            if (databaseAddon.price !== null) {
              logger.debug(
                `calculating price for addon id: ${databaseAddon.addon_id}`
              );
              if (databaseAddon.price) addonCost = databaseAddon.price;
              if (!databaseAddon.gst_inclusive && databaseAddon.price) {
                if (
                  databaseAddon.igst_rate !== undefined &&
                  databaseAddon.cgst_rate !== undefined &&
                  databaseAddon.sgst_rate !== undefined
                ) {
                  addonTaxCost =
                    (databaseAddon.price / 100) *
                    (databaseAddon.igst_rate +
                      databaseAddon.cgst_rate +
                      databaseAddon.sgst_rate);
                } else {
                  logger.error(
                    `CART_VALIDATION_FAILED: invalid_addon_tax_price addon_id: ${addonGroup.addons[ad]}`
                  );
                  throw new ResponseError(400, [
                    {
                      message: `invalid_tax_price_for_addon_${databaseAddon.addon_name}`,
                      code: 1019,
                    },
                  ]);
                }
              }
            } else {
              logger.error(
                `CART_VALIDATION_FAILED: invalid_addon_price addon_id: ${addonGroup.addons[ad]}`
              );
              throw new ResponseError(400, [
                {
                  message: `invalid_price_for_addon_${databaseAddon.addon_name}`,
                  code: 1020,
                },
              ]);
            }
          } else {
            logger.error(
              `CART_VALIDATION_FAILED: addon_group_id_${addonGroup.addon_group_id}_contains_invalid_addon_id_${addonGroup.addons[ad]}`
            );
            throw new ResponseError(400, [
              {
                message: `addon_group_id_${addonGroup.addon_group_id}_contains_invalid_addon_id_${addonGroup.addons[ad]}`,
                code: 1021,
              },
            ]);
          }

          totalAddonsCostWithoutTax += addonCost;
          totalAddonsTax += addonTaxCost;
        }
      } else {
        logger.error(
          `CART_VALIDATION_FAILED: addons selected : ${addonGroup.addons.length} addon_group_id_${databaseAddonGroup.addon_group_id}_should_contain_addons_between_range_${databaseAddonGroup.min_limit}_and_${databaseAddonGroup.max_limit}`
        );
        if (addonGroup.addons.length > databaseAddonGroup.max_limit!) {
          throw new ResponseError(400, [
            {
              message: `${databaseAddonGroup.addon_group_name} limit can not exceed ${databaseAddonGroup.max_limit}`,
              code: 1023,
            },
          ]);
        } else if (addonGroup.addons.length < databaseAddonGroup.min_limit!) {
          throw new ResponseError(400, [
            {
              message: `minimum ${databaseAddonGroup.min_limit} addons of ${databaseAddonGroup.addon_group_name} should be selected`,
              code: 1022,
            },
          ]);
        }
      }
    } else {
      logger.error(
        `CART_VALIDATION_FAILED: invalid_addon_group_id addon_group_id: ${addonGroup.addon_group_id}`
      );
      throw new ResponseError(400, [
        {
          message: `addon_group_id_${addonGroup.addon_group_id}_is_invalid`,
          code: 1024,
        },
      ]);
    }
  }
  return {
    databaseAddonGroups,
    addonsCount,
    addonsInStock,
    unavailableAddons,
    totalAddonsCostWithoutTax: roundUp(totalAddonsCostWithoutTax, 2),
    totalAddonsTax: roundUp(totalAddonsTax, 2),
  };
}
