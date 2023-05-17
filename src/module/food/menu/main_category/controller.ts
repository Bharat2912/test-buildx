import {Request, Response} from 'express';
import handleErrors from '../../../../utilities/controllers/handle_errors';
import * as Joi from '../../../../utilities/joi_common';
import * as models from './models';
import {
  sendError,
  sendSuccess,
} from '../../../../utilities/controllers/handle_response';
import logger from '../../../../utilities/logger/winston_logger';
import {readSubCategories} from '../sub_category/models';
import {getTransaction} from '../../../../data/knex';
import {markForApproval} from '../../approval/service';
import {
  ApprovalAction,
  ApprovalEntityType,
  ApprovalStatus,
} from '../../approval/enums';
import ResponseError from '../../../../utilities/response_error';
import {validatePosPartnerAccess} from '../../service';
import {readRestaurantBasicPosById} from '../../restaurant/models';
import Globals from '../../../../utilities/global_var/globals';
import {setItemMenuSequence} from '../controller';

//Vendor
export async function createMainCategory(req: Request, res: Response) {
  try {
    req.body.restaurant_id = req.user.data.restaurant_id;
    const validation = models.verify_create_main_category.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = validation.value;
    if (await models.CheckDuplicateName(validated_req))
      return sendError(res, 400, 'Duplicate Main Category Name');

    const restaurant = await readRestaurantBasicPosById(
      req.user.data.restaurant_id
    );
    if (!restaurant) {
      return sendError(res, 400, 'Restaurant not found');
    }
    validatePosPartnerAccess(restaurant.pos_partner);

    const trx = await getTransaction();
    try {
      const maincategory = await models.createMainCategory(validated_req, trx);
      const approval_details = await markForApproval(trx, {
        approval_entities: [
          {
            action: ApprovalAction.CREATE,
            restaurant_id: req.user.data.restaurant_id,
            entity_type: ApprovalEntityType.MAIN_CATEGORY,
            entity_id: maincategory.id!,
            requested_entity_changes: maincategory,
            status: ApprovalStatus.PENDING,
            change_requested_by: req.user.id,
          },
        ],
      });
      logger.debug('main category approval details', approval_details);
      await trx.commit();
      return sendSuccess(res, 201, maincategory);
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function readMainCategories(req: Request, res: Response) {
  try {
    const readMainCategories = await models.readMainCategories(
      req.user.data.restaurant_id
    );
    for (let i = 0; i < readMainCategories.length; i++) {
      if (readMainCategories[i].name === 'NOTA') {
        readMainCategories[i].name = await Globals.NOTA_MC_DISPLAY_NAME.get();
        break;
      } else {
        continue;
      }
    }
    return sendSuccess(res, 200, readMainCategories);
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function updateMainCategory(req: Request, res: Response) {
  try {
    req.body.id = req.params.id;

    const validation = models.verify_update_main_category.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);

    const validated_req = validation.value;
    validated_req.restaurant_id = req.user.data.restaurant_id;

    const trx = await getTransaction();
    try {
      const maincategory = await models.readMainCategoryForUpdate(
        trx,
        validated_req.id
      );
      if (
        !maincategory ||
        maincategory.restaurant_id !== req.user.data.restaurant_id
      )
        throw new ResponseError(404, 'Main Category Not Found');

      validatePosPartnerAccess(maincategory.pos_partner);

      if (await models.CheckDuplicateName(validated_req))
        throw new ResponseError(404, 'Duplicate Main Category Name');

      const updatedmaincategory = await models.updateMainCategory(
        validated_req,
        trx
      );
      const approval_details = await markForApproval(trx, {
        approval_entities: [
          {
            action: ApprovalAction.UPDATE,
            restaurant_id: req.user.data.restaurant_id,
            entity_type: ApprovalEntityType.MAIN_CATEGORY,
            entity_id: updatedmaincategory.id!,
            previous_entity_details: maincategory,
            requested_entity_changes: updatedmaincategory,
            status: ApprovalStatus.PENDING,
            change_requested_by: req.user.id,
          },
        ],
      });
      logger.debug('main category approval details', approval_details);
      await trx.commit();
      return sendSuccess(res, 200, updatedmaincategory);
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function availableAfterMainCategory(req: Request, res: Response) {
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

    const maincategory = await models.readMainCategory(setVal.value.id);
    if (
      !maincategory ||
      maincategory.restaurant_id !== req.user.data.restaurant_id
    )
      return sendError(res, 404, 'Main-Category Not Found');

    validatePosPartnerAccess(maincategory.pos_partner);
    const sub_categories = await readSubCategories(
      setVal.value.id,
      req.user.data.restaurant_id
    );
    const sub_category_ids = sub_categories.map(sc => {
      return sc.id!;
    });
    await models.availableAfterMainCategory(sub_category_ids, end_date_time);
    return sendSuccess(res, 200, {id: maincategory.id});
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function deleteMainCategory(req: Request, res: Response) {
  try {
    const validation = Joi.id_num.validate(req.params.id);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);

    const validated_req = validation.value;

    const maincategory = await models.readMainCategory(validated_req);

    if (
      !maincategory ||
      maincategory.restaurant_id !== req.user.data.restaurant_id
    )
      return sendError(res, 404, 'Main-Category Not Found');

    validatePosPartnerAccess(maincategory.pos_partner);

    const sub_categories = await readSubCategories(
      validated_req,
      maincategory.restaurant_id
    );

    if (sub_categories.length > 0) {
      const sub_category = sub_categories.map(sub_categorys => {
        return {
          id: sub_categorys.id!,
          name: sub_categorys.name!,
          main_category_id: sub_categorys.main_category_id!,
        };
      });

      return sendError(res, 400, [
        {
          code: 1093,
          message: `Main Category Containes ${sub_category.length} Sub Categories`,
          data: {sub_category: sub_category},
        },
      ]);
    }

    await models.deleteMainCategory(validated_req);

    return sendSuccess(res, 200, maincategory);
  } catch (error) {
    return handleErrors(res, error);
  }
}

//Admin
export async function admin_createMainCategory(req: Request, res: Response) {
  try {
    const validation = models.verify_create_main_category.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = validation.value;

    const restaurant = await readRestaurantBasicPosById(
      validated_req.restaurant_id
    );
    if (!restaurant) {
      return sendError(res, 404, [
        {message: 'Restaurant Not Found', code: 1093},
      ]);
    }
    validatePosPartnerAccess(restaurant.pos_partner);

    if (await models.CheckDuplicateName(validated_req))
      return sendError(res, 400, 'Duplicate Main Category Name');

    const maincategory = await models.createMainCategory(validated_req);
    return sendSuccess(res, 201, maincategory);
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function admin_readMainCategories(req: Request, res: Response) {
  try {
    if (!req.query.restaurant_id)
      return sendError(res, 400, 'restaurant_id required');
    const readMainCategories = await models.readMainCategories(
      req.query.restaurant_id as string
    );

    for (let i = 0; i < readMainCategories.length; i++) {
      if (readMainCategories[i].name === 'NOTA') {
        readMainCategories[i].name = await Globals.NOTA_MC_DISPLAY_NAME.get();
        break;
      } else {
        continue;
      }
    }

    return sendSuccess(res, 200, readMainCategories);
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function admin_updateMainCategory(req: Request, res: Response) {
  try {
    req.body.id = req.params.id;

    const validation = models.verify_update_main_category.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);

    const validated_req = validation.value;

    const trx = await getTransaction();
    try {
      const maincategory = await models.readMainCategoryForUpdate(
        trx,
        validated_req.id
      );
      if (!maincategory) {
        logger.debug('maincategory', maincategory);
        logger.debug('validated_req', validated_req);
        throw new ResponseError(404, 'Main Category Not Found');
      }
      validatePosPartnerAccess(maincategory.pos_partner);
      validated_req.restaurant_id = maincategory.restaurant_id;
      if (await models.CheckDuplicateName(validated_req))
        throw new ResponseError(400, 'Duplicate Main Category Name');
      const updatedmaincategory = await models.updateMainCategory(
        validated_req,
        trx
      );
      await trx.commit();
      return sendSuccess(res, 200, updatedmaincategory);
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function admin_availableAfterMainCategory(
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

    const maincategory = await models.readMainCategory(setVal.value.id);
    if (!maincategory) return sendError(res, 404, 'Main-Category Not Found');
    validatePosPartnerAccess(maincategory.pos_partner);
    const sub_categories = await readSubCategories(
      setVal.value.id,
      maincategory.restaurant_id!
    );
    const sub_category_ids = sub_categories.map(sc => {
      return sc.id!;
    });
    await models.availableAfterMainCategory(sub_category_ids, end_date_time);
    return sendSuccess(res, 200, {id: maincategory.id});
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function admin_deleteMainCategory(req: Request, res: Response) {
  try {
    const validation = Joi.id_num.validate(req.params.id);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);

    const validated_req = validation.value;

    const maincategory = await models.readMainCategory(validated_req);
    if (!maincategory) return sendError(res, 404, 'Main-Category  Not Found');

    validatePosPartnerAccess(maincategory.pos_partner);

    const sub_categories = await readSubCategories(
      validated_req,
      maincategory.restaurant_id
    );

    if (sub_categories.length > 0) {
      const sub_category = sub_categories.map(sub_categorys => {
        return {
          id: sub_categorys.id!,
          name: sub_categorys.name!,
          main_category_id: sub_categorys.main_category_id!,
        };
      });

      return sendError(res, 400, [
        {
          code: 1093,
          message: `Main Category Containes ${sub_category.length} Sub Categories`,
          data: {sub_category: sub_category},
        },
      ]);
    }

    await models.deleteMainCategory(validated_req);

    return sendSuccess(res, 200, maincategory);
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function setMainCategorySequence(req: Request, res: Response) {
  await setItemMenuSequence(req, res, 'main_category');
}
