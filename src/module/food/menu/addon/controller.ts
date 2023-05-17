import {Request, Response} from 'express';
import handleErrors from '../../../../utilities/controllers/handle_errors';
import * as Joi from '../../../../utilities/joi_common';
import * as models from './models';
import {
  sendError,
  sendSuccess,
} from '../../../../utilities/controllers/handle_response';
import {readAddonGroup} from '../addon_group/models';
import {markForApproval} from '../../approval/service';
import {
  ApprovalAction,
  ApprovalEntityType,
  ApprovalStatus,
} from '../../approval/enums';
import {getTransaction} from '../../../../data/knex';
import ResponseError from '../../../../utilities/response_error';
import logger from '../../../../utilities/logger/winston_logger';
import {validatePosPartnerAccess} from '../../service';

export async function createAddon(req: Request, res: Response) {
  try {
    const validation = models.verify_create_addon.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = <models.IAddon>validation.value;
    const addongroup = await readAddonGroup(validated_req.addon_group_id!);
    if (!addongroup || addongroup.restaurant_id !== req.user.data.restaurant_id)
      return sendError(res, 404, 'Addon Group Not Found');

    validatePosPartnerAccess(addongroup.pos_partner);

    if (await models.CheckDuplicateName(validated_req))
      return sendError(res, 400, 'Duplicate Addon Name');
    const trx = await getTransaction();
    try {
      const addon = await models.createAddon(validated_req, trx);
      const addon_with_addon_group = {
        ...addon,
        addon_group_name: addongroup.name,
      };
      const approval_details = await markForApproval(trx, {
        approval_entities: [
          {
            action: ApprovalAction.CREATE,
            restaurant_id: req.user.data.restaurant_id,
            entity_type: ApprovalEntityType.ADDON,
            entity_id: addon.id!,
            requested_entity_changes: addon_with_addon_group,
            status: ApprovalStatus.PENDING,
            change_requested_by: req.user.id,
          },
        ],
      });
      logger.debug('addon approval details', approval_details);
      await trx.commit();
      return sendSuccess(res, 201, addon_with_addon_group);
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function readAddons(req: Request, res: Response) {
  try {
    const validation = Joi.id_num.validate(req.query.addon_group_id);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);

    const validated_req = validation.value;

    const addons = await models.readAddons(
      validated_req,
      req.user.data.restaurant_id
    );
    if (!addons || !addons.length)
      return sendError(res, 404, 'Addon Not Found');
    return sendSuccess(res, 200, addons);
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function updateAddon(req: Request, res: Response) {
  try {
    const validationParam = Joi.id_num.validate(req.params.id);
    if (validationParam.error)
      return sendError(res, 400, validationParam.error.details[0].message);

    req.body.id = validationParam.value;

    const validation = models.verify_update_addon.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);

    const validated_req = <models.IAddon>validation.value;

    const trx = await getTransaction();
    try {
      // we are using forUpdate sql operation in below readAddonAllDetails function
      const addon = await models.readAddonForUpdate(trx, validated_req.id!);
      if (!addon || addon.restaurant_id !== req.user.data.restaurant_id)
        throw new ResponseError(404, 'Addon Not Found');

      validatePosPartnerAccess(addon.pos_partner);

      const addongroup = await readAddonGroup(validated_req.addon_group_id!);
      if (
        !addongroup ||
        addongroup.restaurant_id !== req.user.data.restaurant_id
      )
        throw new ResponseError(404, 'Addon Group Not Found');
      /**
       * Reason for using ResponseError is that when ever a condition fails the error is thrown and that error is
       * caught in catch block.In the same catch block before returning the error we do trx.rollback() which will release
       * the lock place by forUpdate in readAddonAllDetails function
       *
       * we can handel the same by using sendError() but the problem is, it does not throw error . It simply returns the
       * response due to which we might need to add await trx.rollback() before using sendError() everywhere
       */
      if (validated_req.name) {
        if (await models.CheckDuplicateName(validated_req))
          throw new ResponseError(400, 'Duplicate Addon Name');
      }

      const updatedaddon = await models.updateAddon(validated_req, trx);
      const updated_addon_with_addon_group = {
        ...updatedaddon,
        addon_group_name: addongroup.name,
      };
      delete addon.restaurant_id;
      const approval_details = await markForApproval(trx, {
        approval_entities: [
          {
            action: ApprovalAction.UPDATE,
            restaurant_id: req.user.data.restaurant_id,
            entity_type: ApprovalEntityType.ADDON,
            entity_id: addon.id!,
            previous_entity_details: addon,
            requested_entity_changes: updated_addon_with_addon_group,
            status: ApprovalStatus.PENDING,
            change_requested_by: req.user.id,
          },
        ],
      });
      logger.debug('addon approval details', approval_details);
      await trx.commit();
      return sendSuccess(res, 200, updated_addon_with_addon_group);
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function inStockAddon(req: Request, res: Response) {
  try {
    req.body.id = req.params.id;
    const setVal = models.verify_set_in_stock.validate(req.body);
    if (setVal.error)
      return sendError(res, 400, setVal.error.details[0].message);

    const inputData = <models.IAddon>setVal.value;
    const addon = await models.readAddon(inputData.id!);
    if (!addon || addon.restaurant_id !== req.user.data.restaurant_id)
      return sendError(res, 404, 'Addon Not Found');

    validatePosPartnerAccess(addon.pos_partner);

    await models.updateAddon(inputData);

    return sendSuccess(res, 200, addon);
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function deleteAddon(req: Request, res: Response) {
  try {
    const validation = Joi.id_num.validate(req.params.id);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);

    const validated_req = validation.value;

    const addon = await models.readAddon(validated_req!);
    if (!addon || addon.restaurant_id !== req.user.data.restaurant_id)
      return sendError(res, 404, 'Addon Not Found');

    validatePosPartnerAccess(addon.pos_partner);

    await models.deleteAddon(validated_req);

    return sendSuccess(res, 200, addon);
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function admin_createAddon(req: Request, res: Response) {
  try {
    const validation = models.verify_create_addon.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = <models.IAddon>validation.value;
    const addongroup = await readAddonGroup(validated_req.addon_group_id!);
    if (!addongroup) return sendError(res, 404, 'Addon Group Not Found');

    validatePosPartnerAccess(addongroup.pos_partner);

    if (await models.CheckDuplicateName(validated_req))
      return sendError(res, 400, 'Duplicate Addon Name');
    const addon = await models.createAddon(validated_req);
    return sendSuccess(res, 201, {
      ...addon,
      addon_group_name: addongroup.name,
    });
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function admin_readAddons(req: Request, res: Response) {
  try {
    const validation = Joi.id_num.validate(req.query.addon_group_id);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);

    const validated_req = validation.value;

    const addons = await models.readAddons(validated_req);
    if (!addons || !addons.length)
      return sendError(res, 404, 'Addon Not Found');
    return sendSuccess(res, 200, addons);
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function admin_updateAddon(req: Request, res: Response) {
  try {
    const validationParam = Joi.id_num.validate(req.params.id);
    if (validationParam.error)
      return sendError(res, 400, validationParam.error.details[0].message);

    req.body.id = validationParam.value;

    const validation = models.verify_update_addon.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);

    const validated_req = <models.IAddon>validation.value;

    const trx = await getTransaction();
    try {
      const addon = await models.readAddonForUpdate(trx, validated_req.id!);
      if (!addon) throw new ResponseError(404, 'Addon Not Found');

      validatePosPartnerAccess(addon.pos_partner);

      const addongroup = await readAddonGroup(validated_req.addon_group_id!);
      if (!addongroup) throw new ResponseError(404, 'Addon Group Not Found');

      if (validated_req.name) {
        if (await models.CheckDuplicateName(validated_req))
          throw new ResponseError(400, 'Duplicate Addon Name');
      }

      const updatedaddon = await models.updateAddon(validated_req, trx);
      await trx.commit();
      return sendSuccess(res, 200, {
        ...updatedaddon,
        addon_group_name: addongroup.name,
      });
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function admin_inStockAddon(req: Request, res: Response) {
  try {
    req.body.id = req.params.id;
    const setVal = models.verify_set_in_stock.validate(req.body);
    if (setVal.error)
      return sendError(res, 400, setVal.error.details[0].message);

    const inputData = <models.IAddon>setVal.value;
    const addon = await models.readAddon(inputData.id!);
    if (!addon) return sendError(res, 404, 'Addon Not Found');

    validatePosPartnerAccess(addon.pos_partner);

    await models.updateAddon(inputData);

    return sendSuccess(res, 200, addon);
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function admin_deleteAddon(req: Request, res: Response) {
  try {
    const validation = Joi.id_num.validate(req.params.id);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);

    const validated_req = validation.value;

    const addon = await models.readAddon(validated_req!);
    if (!addon) return sendError(res, 404, 'Addon Not Found');

    validatePosPartnerAccess(addon.pos_partner);

    const addon_error = await models.validateAddonDelete([validated_req]);
    if (addon_error.error) return sendSuccess(res, 400, addon_error);

    await models.deleteAddon(validated_req);

    return sendSuccess(res, 200, addon);
  } catch (error) {
    return handleErrors(res, error);
  }
}
