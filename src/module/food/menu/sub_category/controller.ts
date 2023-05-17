import {Request, Response} from 'express';
import handleErrors from '../../../../utilities/controllers/handle_errors';
import * as Joi from '../../../../utilities/joi_common';
import * as models from './models';
import {
  sendError,
  sendSuccess,
} from '../../../../utilities/controllers/handle_response';
import {readMainCategory} from '../main_category/models';
import {getTransaction} from '../../../../data/knex';
import {markForApproval} from '../../approval/service';
import {
  ApprovalAction,
  ApprovalEntityType,
  ApprovalStatus,
} from '../../approval/enums';
import logger from '../../../../utilities/logger/winston_logger';
import ResponseError from '../../../../utilities/response_error';
import {validatePosPartnerAccess} from '../../service';
import {readMenuItemsFromSubCategories} from './models';
import {setItemMenuSequence} from '../controller';

export async function createSubcategory(req: Request, res: Response) {
  try {
    const validation = models.create_sub_category.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = <models.ISubCategory>validation.value;
    const main_category = await readMainCategory(
      validated_req.main_category_id!
    );
    if (
      !main_category ||
      main_category.restaurant_id !== req.user.data.restaurant_id
    )
      return sendError(res, 404, 'Main Category Not Found');
    validatePosPartnerAccess(main_category.pos_partner);
    if (await models.CheckDuplicateName(validated_req))
      return sendError(res, 400, 'Duplicate Sub Category Name');

    const trx = await getTransaction();
    try {
      const subcategory = await models.createSubCategory(validated_req, trx);
      const subcategory_with_maincategory = {
        ...subcategory,
        main_category_name: main_category.name,
      };
      const approval_details = await markForApproval(trx, {
        approval_entities: [
          {
            action: ApprovalAction.CREATE,
            restaurant_id: req.user.data.restaurant_id,
            entity_type: ApprovalEntityType.SUB_CATEGORY,
            entity_id: subcategory.id!,
            requested_entity_changes: subcategory_with_maincategory,
            status: ApprovalStatus.PENDING,
            change_requested_by: req.user.id,
          },
        ],
      });
      logger.debug('sub category approval details', approval_details);
      await trx.commit();
      return sendSuccess(res, 201, subcategory_with_maincategory);
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function readSubCategories(req: Request, res: Response) {
  try {
    const validation = Joi.id_num.validate(req.query.main_category_id);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);

    const validated_req = validation.value;

    const subCategory = await models.readSubCategories(
      validated_req,
      req.user.data.restaurant_id
    );
    if (!subCategory || !subCategory.length)
      return sendError(res, 404, 'Sub-Category Not Found');
    return sendSuccess(res, 200, subCategory);
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function updateSubCategory(req: Request, res: Response) {
  try {
    const validation = models.update_sub_category.validate({
      id: req.params.id,
      name: req.body.name,
      main_category_id: req.body.main_category_id,
    });
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);

    const validated_req = <models.ISubCategory>validation.value;

    const trx = await getTransaction();
    try {
      const subcategory = await models.readSubCategoryForUpdate(
        trx,
        validated_req.id!,
        req.user.data.restaurant_id
      );
      if (
        !subcategory ||
        subcategory.restaurant_id !== req.user.data.restaurant_id
      )
        throw new ResponseError(404, 'Sub-Category Not Found');
      validatePosPartnerAccess(subcategory.pos_partner);

      const main_category = await readMainCategory(
        validated_req.main_category_id!
      );
      if (
        !main_category ||
        main_category.restaurant_id !== req.user.data.restaurant_id
      )
        throw new ResponseError(404, 'Main Category Not Found');

      if (await models.CheckDuplicateName(validated_req))
        throw new ResponseError(400, 'Duplicate Sub Category Name');

      const updatedsubcategory = await models.updateSubCategory(
        validated_req,
        trx
      );
      delete subcategory.restaurant_id;
      const updated_subcategory_with_maincategory = {
        ...updatedsubcategory,
        main_category_name: main_category.name,
      };
      const approval_details = await markForApproval(trx, {
        approval_entities: [
          {
            action: ApprovalAction.UPDATE,
            restaurant_id: req.user.data.restaurant_id,
            entity_type: ApprovalEntityType.SUB_CATEGORY,
            entity_id: updatedsubcategory.id!,
            previous_entity_details: subcategory,
            requested_entity_changes: updated_subcategory_with_maincategory,
            status: ApprovalStatus.PENDING,
            change_requested_by: req.user.id,
          },
        ],
      });
      logger.debug('sub category approval details', approval_details);
      await trx.commit();
      return sendSuccess(res, 200, updated_subcategory_with_maincategory);
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function availableAfterSubCategory(req: Request, res: Response) {
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
    const subcategory = await models.readSubCategory(
      setVal.value.id,
      req.user.data.restaurant_id
    );
    if (
      !subcategory ||
      subcategory.restaurant_id !== req.user.data.restaurant_id
    )
      return sendError(res, 404, 'Sub-Category Not Found');
    validatePosPartnerAccess(subcategory.pos_partner);
    await models.availableAfterSubCategory(setVal.value.id, end_date_time);
    return sendSuccess(res, 200, {id: subcategory.id});
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function deleteSubCategory(req: Request, res: Response) {
  try {
    const validation = Joi.id_num.validate(req.params.id);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);

    const validated_req = validation.value;

    const subcategory = await models.readSubCategory(
      validated_req,
      req.user.data.restaurant_id
    );
    if (
      !subcategory ||
      subcategory.restaurant_id !== req.user.data.restaurant_id
    )
      return sendError(res, 404, 'Sub-Category Not Found');

    validatePosPartnerAccess(subcategory.pos_partner);

    const menu_item = await readMenuItemsFromSubCategories(
      validated_req,
      subcategory.restaurant_id
    );

    if (menu_item.length > 0) {
      const existing_menu_items = menu_item.map(menu_items => {
        return {
          menu_item_id: menu_items.id!,
          menu_item_name: menu_items.name!,
          sub_category_id: menu_items.sub_category_id!,
        };
      });

      return sendError(res, 400, [
        {
          code: 1093,
          message: `Sub Category Containes ${existing_menu_items.length} Menu Items`,
          data: {menu_items: existing_menu_items},
        },
      ]);
    }

    await models.deleteSubCategory(validated_req);
    return sendSuccess(res, 200, {id: subcategory.id});
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function admin_createSubcategory(req: Request, res: Response) {
  try {
    const validation = models.create_sub_category.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = <models.ISubCategory>validation.value;
    const main_category = await readMainCategory(
      validated_req.main_category_id!
    );
    if (!main_category) return sendError(res, 404, 'Main Category Not Found');
    validatePosPartnerAccess(main_category.pos_partner);
    if (await models.CheckDuplicateName(validated_req))
      return sendError(res, 400, 'Duplicate Sub Category Name');
    const subcategory = await models.createSubCategory(validated_req);
    return sendSuccess(res, 201, {
      ...subcategory,
      main_category_name: main_category.name,
    });
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function admin_readSubCategories(req: Request, res: Response) {
  try {
    const validation = Joi.id_num.validate(req.query.main_category_id);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);

    const validated_req = validation.value;

    const subCategory = await models.readSubCategories(validated_req);
    if (!subCategory || !subCategory.length)
      return sendError(res, 404, 'Sub-Category Not Found');
    return sendSuccess(res, 200, subCategory);
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function admin_updateSubCategory(req: Request, res: Response) {
  try {
    const validation = models.update_sub_category.validate({
      id: req.params.id,
      name: req.body.name,
      main_category_id: req.body.main_category_id,
    });
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);

    const validated_req = <models.ISubCategory>validation.value;

    const trx = await getTransaction();
    try {
      const subcategory = await models.readSubCategoryForUpdate(
        trx,
        validated_req.id!
      );
      if (!subcategory) throw new ResponseError(404, 'Sub-Category Not Found');
      validatePosPartnerAccess(subcategory.pos_partner);
      const main_category = await readMainCategory(
        validated_req.main_category_id!
      );
      if (!main_category)
        throw new ResponseError(404, 'Main Category Not Found');

      if (await models.CheckDuplicateName(validated_req))
        throw new ResponseError(400, 'Duplicate Sub Category Name');

      const updatedsubcategory = await models.updateSubCategory(
        validated_req,
        trx
      );
      await trx.commit();
      return sendSuccess(res, 200, {
        ...updatedsubcategory,
        main_category_name: main_category.name,
      });
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function admin_availableAfterSubCategory(
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
    const subcategory = await models.readSubCategory(setVal.value.id);
    if (!subcategory) return sendError(res, 404, 'Sub-Category Not Found');
    validatePosPartnerAccess(subcategory.pos_partner);
    await models.availableAfterSubCategory(setVal.value.id, end_date_time);
    return sendSuccess(res, 200, {id: subcategory.id});
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function admin_deleteSubCategory(req: Request, res: Response) {
  try {
    const validation = Joi.id_num.validate(req.params.id);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);

    const validated_req = validation.value;

    const subcategory = await models.readSubCategory(validated_req);
    if (!subcategory) return sendError(res, 404, 'Sub-Category Not Found');

    validatePosPartnerAccess(subcategory.pos_partner);

    const menu_item = await readMenuItemsFromSubCategories(
      validated_req,
      subcategory.restaurant_id
    );
    if (menu_item.length > 0) {
      const existing_menu_items = menu_item.map(menu_items => {
        return {
          menu_item_id: menu_items.id!,
          menu_item_name: menu_items.name!,
          sub_category_id: menu_items.sub_category_id!,
        };
      });

      return sendError(res, 400, [
        {
          code: 1093,
          message: `Sub Category Containes ${existing_menu_items.length} Menu Items`,
          data: {menu_items: existing_menu_items},
        },
      ]);
    }

    await models.deleteSubCategory(validated_req);
    return sendSuccess(res, 200, {id: subcategory.id});
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function setSubCategorySequence(req: Request, res: Response) {
  await setItemMenuSequence(req, res, 'sub_category');
}
