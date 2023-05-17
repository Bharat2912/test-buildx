import {Request, Response} from 'express';
import handleErrors from '../../../../utilities/controllers/handle_errors';
import * as Joi from '../../../../utilities/joi_common';
import * as models from './models';
import {
  sendError,
  sendSuccess,
} from '../../../../utilities/controllers/handle_response';
import {getTransaction} from '../../../../data/knex';
import {markForApproval} from '../../approval/service';
import {
  ApprovalAction,
  ApprovalEntityType,
  ApprovalStatus,
} from '../../approval/enums';
import logger from '../../../../utilities/logger/winston_logger';
import ResponseError from '../../../../utilities/response_error';
import {
  readRestaurantBasicPosById,
  readRestaurantById,
} from '../../restaurant/models';
import {validatePosPartnerAccess} from '../../service';
import {readAddons} from '../addon/models';

export async function createAddonGroup(req: Request, res: Response) {
  try {
    req.body.restaurant_id = req.user.data.restaurant_id;
    const validation = models.verify_create_addon_group.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = validation.value;
    if (await models.CheckDuplicateName(validated_req))
      return sendError(res, 400, 'Duplicate Addon Group Name');

    const restaurant = await readRestaurantBasicPosById(
      req.user.data.restaurant_id
    );
    validatePosPartnerAccess(restaurant.pos_partner);

    const trx = await getTransaction();
    try {
      const addonGroup = await models.createAddonGroup(validated_req, trx);
      const approval_details = await markForApproval(trx, {
        approval_entities: [
          {
            action: ApprovalAction.CREATE,
            restaurant_id: req.user.data.restaurant_id,
            entity_type: ApprovalEntityType.ADDON_GROUP,
            entity_id: addonGroup.id!,
            requested_entity_changes: addonGroup,
            status: ApprovalStatus.PENDING,
            change_requested_by: req.user.id,
          },
        ],
      });
      logger.debug('addon group approval details', approval_details);
      await trx.commit();
      return sendSuccess(res, 201, addonGroup);
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function readAddonGroups(req: Request, res: Response) {
  try {
    const readAddonGroupById = await models.readAddonGroupsByRestaurantId(
      req.user.data.restaurant_id
    );
    //if (!readAddonGroupById)
    //  return sendError(res, 404, 'Main-Category  Not Found');
    return sendSuccess(res, 200, readAddonGroupById);
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function updateAddonGroup(req: Request, res: Response) {
  try {
    req.body.id = req.params.id;

    const validation = models.verify_update_addon_group.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);

    const validated_req = validation.value;
    validated_req.restaurant_id = req.user.data.restaurant_id;
    const trx = await getTransaction();
    try {
      const addonGroup = await models.readAddonGroupForUpdate(
        trx,
        validated_req.id
      );
      if (
        !addonGroup ||
        addonGroup.restaurant_id !== req.user.data.restaurant_id
      )
        throw new ResponseError(404, 'Addon Group Not Found');

      validatePosPartnerAccess(addonGroup.pos_partner);

      if (await models.CheckDuplicateName(validated_req))
        throw new ResponseError(400, 'Duplicate Addon Group Name');

      const updatedaddonGroup = await models.updateAddonGroup(
        validated_req,
        trx
      );
      const approval_details = await markForApproval(trx, {
        approval_entities: [
          {
            action: ApprovalAction.UPDATE,
            restaurant_id: req.user.data.restaurant_id,
            entity_type: ApprovalEntityType.ADDON_GROUP,
            entity_id: updatedaddonGroup.id!,
            previous_entity_details: addonGroup,
            requested_entity_changes: updatedaddonGroup,
            status: ApprovalStatus.PENDING,
            change_requested_by: req.user.id,
          },
        ],
      });
      logger.debug('addon group approval details', approval_details);
      await trx.commit();
      return sendSuccess(res, 200, updatedaddonGroup);
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function inStockAddonGroup(req: Request, res: Response) {
  try {
    const param_id = Joi.id_num.validate(req.params.id);
    if (param_id.error)
      return sendError(res, 400, param_id.error.details[0].message);

    const setVal = models.verify_set_in_stock.validate(req.body);
    if (setVal.error)
      return sendError(res, 400, setVal.error.details[0].message);

    const addonGroup = await models.readAddonGroup(param_id.value);

    if (!addonGroup || addonGroup.restaurant_id !== req.user.data.restaurant_id)
      return sendError(res, 404, 'Addon Group Not Found');

    validatePosPartnerAccess(addonGroup.pos_partner);

    await models.inStockAddonByAddonGroupId(
      param_id.value,
      setVal.value.in_stock
    );

    return sendSuccess(res, 200, addonGroup);
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function deleteAddonGroup(req: Request, res: Response) {
  try {
    const validation = Joi.id_num.validate(req.params.id);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);

    const validated_req = validation.value;

    const addonGroup = await models.readAddonGroup(validated_req);

    if (!addonGroup || addonGroup.restaurant_id !== req.user.data.restaurant_id)
      return sendError(res, 404, 'Addon Group Not Found');

    validatePosPartnerAccess(addonGroup.pos_partner);

    const addon = await readAddons(validated_req, addonGroup.restaurant_id);

    if (addon.length > 0) {
      const existing_addons = addon.map(addon => {
        return {
          addon_id: addon.id!,
          addon_name: addon.name!,
        };
      });

      return sendError(res, 400, [
        {
          code: 1093,
          message: `Addon Group Containes ${existing_addons.length} Addons`,
          data: {addons: existing_addons},
        },
      ]);
    }

    await models.deleteAddonGroup(validated_req);

    return sendSuccess(res, 200, addonGroup);
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function admin_createAddonGroup(req: Request, res: Response) {
  try {
    const validation = models.verify_create_addon_group.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = validation.value;

    const restaurant = await readRestaurantById(validated_req.restaurant_id);
    if (!restaurant) {
      return sendError(res, 404, [
        {
          message: 'Restaurant Not Found',
          code: 1093,
        },
      ]);
    }
    validatePosPartnerAccess(restaurant.pos_partner);

    if (await models.CheckDuplicateName(validated_req))
      return sendError(res, 400, 'Duplicate Addon Group Name');
    const addonGroup = await models.createAddonGroup(validated_req);
    return sendSuccess(res, 201, addonGroup);
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function admin_readAddonGroups(req: Request, res: Response) {
  try {
    if (!req.query.restaurant_id)
      return sendError(res, 400, 'restaurant_id is required');
    const readAddonGroupById = await models.readAddonGroupsByRestaurantId(
      req.query.restaurant_id as string
    );
    // if (!readAddonGroupById || !readAddonGroupById.length)
    //   return sendError(res, 404, 'Main-Category  Not Found');
    return sendSuccess(res, 200, readAddonGroupById);
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function admin_updateAddonGroup(req: Request, res: Response) {
  try {
    req.body.id = req.params.id;

    const validation = models.verify_update_addon_group.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);

    const validated_req = validation.value;
    const trx = await getTransaction();
    try {
      const addonGroup = await models.readAddonGroupForUpdate(
        trx,
        validated_req.id
      );
      if (!addonGroup) throw new ResponseError(404, 'Addon Group Not Found');
      validatePosPartnerAccess(addonGroup.pos_partner);
      validated_req.restaurant_id = addonGroup.restaurant_id;

      if (await models.CheckDuplicateName(validated_req))
        throw new ResponseError(400, 'Duplicate Addon Group Name');

      const updatedaddonGroup = await models.updateAddonGroup(
        validated_req,
        trx
      );
      await trx.commit();
      return sendSuccess(res, 200, updatedaddonGroup);
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function admin_inStockAddonGroup(req: Request, res: Response) {
  try {
    const param_id = Joi.id_num.validate(req.params.id);
    if (param_id.error)
      return sendError(res, 400, param_id.error.details[0].message);

    const setVal = models.verify_set_in_stock.validate(req.body);
    if (setVal.error)
      return sendError(res, 400, setVal.error.details[0].message);

    const addonGroup = await models.readAddonGroup(param_id.value);

    if (!addonGroup) return sendError(res, 404, 'Addon Group Not Found');

    validatePosPartnerAccess(addonGroup.pos_partner);

    await models.inStockAddonByAddonGroupId(
      param_id.value,
      setVal.value.in_stock
    );

    return sendSuccess(res, 200, addonGroup);
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function admin_deleteAddonGroup(req: Request, res: Response) {
  try {
    const validation = Joi.id_num.validate(req.params.id);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);

    const validated_req = validation.value;

    const addonGroup = await models.readAddonGroup(validated_req);

    if (!addonGroup) return sendError(res, 404, 'Addon Group Not Found');

    validatePosPartnerAccess(addonGroup.pos_partner);

    const addon = await readAddons(validated_req, addonGroup.restaurant_id);

    if (addon.length > 0) {
      const existing_addons = addon.map(addon => {
        return {
          addon_id: addon.id!,
          addon_name: addon.name!,
        };
      });

      return sendError(res, 400, [
        {
          code: 1093,
          message: `Addon Group Containes ${existing_addons.length} Addons`,
          data: {addons: existing_addons},
        },
      ]);
    }

    await models.deleteAddonGroup(validated_req);

    return sendSuccess(res, 200, addonGroup);
  } catch (error) {
    return handleErrors(res, error);
  }
}
