import {Request, Response} from 'express';
import handleErrors from '../../../utilities/controllers/handle_errors';
import {
  sendError,
  sendSuccess,
} from '../../../utilities/controllers/handle_response';
import {
  deleteAddonHolidaySlot,
  deleteItemHolidaySlot,
  deleteRestaurantMenu,
  getRestaurantServiceableStatus,
  setAddonHolidaySlot,
  setItemHolidaySlot,
  setRestaurantStatus,
  updateOrder,
  deleteRestaurantMenuPosDetails,
} from './service';
import * as validate from './validation';
import * as types from './types';
import {getTransaction} from '../../../data/knex';
import logger from '../../../utilities/logger/winston_logger';
import {
  deletePetpoojaItemTaxByRestaurantID,
  deletePetpoojaTaxByRestaurantID,
  insertRestaurantPetpooja,
  readRestaurantByPosId,
  readRestaurantPetpoojaOnboarding,
  updateRestaurantPetpooja,
} from './model';
import {populatePetPoojaMenu} from './populate_menu_service';
import {
  readRestaurantBasicById,
  readRestaurantById,
  readRestaurantDetailsByIds,
  updateRestaurantBasic,
} from '../restaurant/models';
import {PosPartner} from '../enum';
import {PosStatus} from './enum';
import {fetchRestaurantMenu} from './external_call';
import {sendEmail} from '../../../utilities/utilFuncs';
import Globals from '../../../utilities/global_var/globals';
import {Service} from '../../../enum';
import {v4 as uuidv4} from 'uuid';

export async function pushPetPoojaMenu(req: Request, res: Response) {
  const log_id = uuidv4();
  try {
    logger.debug(
      `PETPOOJA_PUSH_MENU_PAYLOAD_${log_id}`,
      JSON.stringify(req.body)
    );
    const restaurant = await readRestaurantByPosId(
      req.body.restaurants[0].details.menusharingcode
    );
    if (!restaurant) {
      return sendError(res, 400, [
        {
          message: 'restaurant not found',
          code: 0,
        },
      ]);
    }
    const result = await populatePetPoojaMenu(restaurant, req.body);

    logger.debug('PETPOOJA_PUSH_MENU_RESULT', result);
    return res.status(200).send({
      success: '1',
      message: 'Menu items are successfully listed.',
    });
  } catch (error) {
    await sendEmail(
      'AdminAlertEmailTemplate',
      await Globals.BACKEND_TEAM_EMAIL.get(),
      {
        subject: 'Petpooja push menu failed',
        application_name: Service.FOOD_API,
        error_details: error,
        priority: 'high',
        time: new Date().toDateString(),
        meta_details: {
          log_message: `PETPOOJA_PUSH_MENU_PAYLOAD_${log_id}`,
          log_level: 'debug',
        },
      }
    );
    return handleErrors(res, error, 'Error in push menu');
  }
}

export async function getRestaurantStatus(req: Request, res: Response) {
  try {
    logger.debug('PETPOOJA_GET_RESTAURANT_STATUS_PAYLOAD', req.body);
    const validation = validate.restaurant_get_status.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req =
      validation.value as types.IPetPoojaGetRestaurantStatusReq;
    const restaurant = await readRestaurantByPosId(validated_req.restID);
    if (!restaurant) {
      return res.status(404).send({
        http_code: 404,
        status: 'failed',
        message: 'Restaurant not found.',
      });
    }
    const status = await getRestaurantServiceableStatus(restaurant);
    const result: types.IPetPoojaGetRestaurantStatusRes = {
      http_code: 200,
      status: 'success',
      store_status: status ? '1' : '0',
      message: 'Store Delivery Status fetched successfully',
    };
    logger.debug('PETPOOJA_GET_RESTAURANT_STATUS_RESULT', result);
    return res.status(200).send(result);
  } catch (error) {
    await sendEmail(
      'AdminAlertEmailTemplate',
      await Globals.BACKEND_TEAM_EMAIL.get(),
      {
        subject: 'Petpooja get restaurant status failed',
        application_name: Service.FOOD_API,
        error_details: error,
        priority: 'high',
        time: new Date().toDateString(),
        meta_details: {request_body: req.body},
      }
    );
    return handleErrors(res, error, 'Error get restaurant status callback');
  }
}

export async function updateRestaurantStatus(req: Request, res: Response) {
  try {
    logger.debug('PETPOOJA_UPDATE_RESTAURANT_STATUS_PAYLOAD', req.body);
    const validation = validate.restaurant_set_status.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req =
      validation.value as types.IPetPoojaSetRestaurantStatusReq;
    const restaurant = await readRestaurantByPosId(validated_req.restID);
    if (!restaurant) {
      return res.status(404).send({
        http_code: 404,
        status: 'failed',
        message: 'Restaurant not found.',
      });
    }
    const trx = await getTransaction();
    try {
      await setRestaurantStatus(
        trx,
        restaurant,
        validated_req.store_status,
        validated_req.reason
      );
      await trx.commit();
      const result: types.IPetPoojaSetRestaurantStatusRes = {
        http_code: 200,
        status: 'success',
        message: 'Store Status updated successfully for store restID',
      };
      logger.debug('PETPOOJA_UPDATE_RESTAURANT_STATUS_RESULT', result);
      return res.status(200).send(result);
    } catch (error) {
      await trx.rollback();
      logger.error('Failed updating restaurant status', error);
      throw error;
    }
  } catch (error) {
    await sendEmail(
      'AdminAlertEmailTemplate',
      await Globals.BACKEND_TEAM_EMAIL.get(),
      {
        subject: 'Petpooja update restaurant status failed',
        application_name: Service.FOOD_API,
        error_details: error,
        priority: 'high',
        time: new Date().toDateString(),
        meta_details: {request_body: req.body},
      }
    );
    return handleErrors(res, error, 'Error update restaurant status callback');
  }
}

export async function itemAddonOutStock(req: Request, res: Response) {
  try {
    logger.debug('PETPOOJA_ITEM_ADDON_OUT_OF_STOCK_PAYLOAD', req.body);
    const validation = validate.item_addon_in_stock.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req =
      validation.value as types.IPetPoojaSetItemAddonOutStockReq;
    const restaurant = await readRestaurantByPosId(validated_req.restID);
    if (!restaurant) {
      return res.status(404).send({
        http_code: 404,
        status: 'failed',
        message: 'Restaurant not found.',
      });
    }
    const trx = await getTransaction();
    try {
      if (validated_req.type === 'item') {
        await setItemHolidaySlot(
          trx,
          restaurant.id,
          validated_req.itemID,
          new Date(validated_req.customTurnOnTime)
        );
      } else {
        await setAddonHolidaySlot(
          trx,
          restaurant.id,
          validated_req.itemID,
          new Date(validated_req.customTurnOnTime)
        );
      }
      await trx.commit();
      const result: types.IPetPoojaSetItemAddonStockRes = {
        http_code: 200,
        status: 'success',
        message: 'Stock status updated successfully',
      };
      logger.debug('PETPOOJA_ITEM_ADDON_OUT_OF_STOCK_RESULT', result);
      return res.status(200).send(result);
    } catch (error) {
      await trx.rollback();
      logger.error('Failed updating Item Addon status', error);
      throw error;
    }
  } catch (error) {
    await sendEmail(
      'AdminAlertEmailTemplate',
      await Globals.BACKEND_TEAM_EMAIL.get(),
      {
        subject: 'Petpooja update item out of stock failed',
        application_name: Service.FOOD_API,
        error_details: error,
        priority: 'high',
        time: new Date().toDateString(),
        meta_details: {request_body: req.body},
      }
    );
    return handleErrors(res, error, 'Error updating Item Addon status');
  }
}

export async function itemAddonInStock(req: Request, res: Response) {
  try {
    logger.debug('PETPOOJA_ITEM_ADDON_IN_STOCK_PAYLOAD', req.body);
    const validation = validate.item_addon_out_stock.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req =
      validation.value as types.IPetPoojaSetItemAddonInStockReq;
    const restaurant = await readRestaurantByPosId(validated_req.restID);
    if (!restaurant) {
      return res.status(404).send({
        http_code: 404,
        status: 'failed',
        message: 'Restaurant not found.',
      });
    }
    const trx = await getTransaction();
    try {
      if (validated_req.type === 'item') {
        await deleteItemHolidaySlot(trx, restaurant.id, validated_req.itemID);
      } else {
        await deleteAddonHolidaySlot(trx, restaurant.id, validated_req.itemID);
      }
      await trx.commit();
      const result: types.IPetPoojaSetItemAddonStockRes = {
        http_code: 200,
        status: 'success',
        message: 'Stock status updated successfully',
      };
      logger.debug('PETPOOJA_ITEM_ADDON_IN_STOCK_RESULT', result);
      return res.status(200).send(result);
    } catch (error) {
      await trx.rollback();
      logger.error('Failed updating Item Addon status', error);
      throw error;
    }
  } catch (error) {
    await sendEmail(
      'AdminAlertEmailTemplate',
      await Globals.BACKEND_TEAM_EMAIL.get(),
      {
        subject: 'Petpooja update item in stock failed',
        application_name: Service.FOOD_API,
        error_details: error,
        priority: 'high',
        time: new Date().toDateString(),
        meta_details: {request_body: req.body},
      }
    );
    return handleErrors(res, error, 'Error updating Item Addon status');
  }
}

export async function update_order(req: Request, res: Response) {
  try {
    logger.debug('PETPOOJA_UPDATE_ORDER_STATUS_PAYLOAD', req.body);
    const validation = validate.update_order.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = validation.value as types.IPetPoojaUpdateOrderReq;
    const restaurant = await readRestaurantByPosId(validated_req.restID);
    if (!restaurant) {
      return res.status(404).send({
        http_code: 404,
        status: 'failed',
        message: 'Restaurant not found.',
      });
    }
    const restaurant_details = await readRestaurantById(restaurant.id);
    const trx = await getTransaction();
    try {
      await updateOrder(trx, restaurant_details, validated_req);
      await trx.commit();
      const result: types.IPetPoojaUpdateOrderRes = {
        http_code: 200,
        status: 'success',
        message: 'Order updated successfully',
      };
      logger.debug('PETPOOJA_UPDATE_ORDER_STATUS_RESULT', result);
      return res.status(200).send(result);
    } catch (error) {
      await trx.rollback();
      logger.error('Failed updating order status', error);
      throw error;
    }
  } catch (error) {
    await sendEmail(
      'AdminAlertEmailTemplate',
      await Globals.BACKEND_TEAM_EMAIL.get(),
      {
        subject: 'Petpooja update order status failed',
        application_name: Service.FOOD_API,
        error_details: error,
        priority: 'high',
        time: new Date().toDateString(),
        meta_details: {request_body: req.body},
      }
    );
    return handleErrors(res, error, 'Error order status');
  }
}

export async function getOnboardRestaurant(req: Request, res: Response) {
  try {
    const restaurant_id = req.params.restaurant_id;

    const petpooja_restaurant = await readRestaurantPetpoojaOnboarding(
      restaurant_id
    );
    if (!petpooja_restaurant) {
      return sendSuccess(
        res,
        200,
        {},
        'Restaurant onboarding on petpooja not initiated'
      );
    }
    return sendSuccess(res, 200, petpooja_restaurant);
  } catch (error) {
    return handleErrors(res, error, 'Error updating Restaurant Petpooja');
  }
}

export async function initOnboardRestaurant(req: Request, res: Response) {
  try {
    req.body.id = req.params.restaurant_id;
    const validation = validate.init_onboard_restaurant.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = validation.value as types.IPetPoojaInitOnboardingReq;

    const restaurant = await readRestaurantBasicById(validated_req.id);
    if (!restaurant) {
      return sendError(res, 400, 'Restaurant Not Found');
    }
    if (
      restaurant.status === 'draft' ||
      restaurant.status === 'approvalPending' ||
      restaurant.status === 'approvalRejected'
    ) {
      return sendError(res, 400, 'Restaurant not approved by speedyy system');
    }
    const petpooja_restaurant = await readRestaurantPetpoojaOnboarding(
      validated_req.id
    );
    if (petpooja_restaurant) {
      return sendError(
        res,
        400,
        'Restaurant petpooja onboarding already initiated'
      );
    }
    try {
      const result = await insertRestaurantPetpooja({
        id: restaurant.id,
        pos_restaurant_id: validated_req.pos_restaurant_id,
      });
      return sendSuccess(res, 200, result);
    } catch (error) {
      logger.error('Failed initiating Restaurant Petpooja onboarding', error);
      throw 'Failed initiating Restaurant Petpooja onboarding';
    }
  } catch (error) {
    return handleErrors(res, error, 'Error initiating Restaurant Petpooja');
  }
}

export async function updateOnboardRestaurant(req: Request, res: Response) {
  try {
    req.body.id = req.params.restaurant_id;
    const validation = validate.update_onboard_restaurant.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = validation.value as types.IRestaurantPetpooja;

    const restaurant = await readRestaurantBasicById(validated_req.id);
    if (!restaurant) {
      return sendError(res, 400, 'Restaurant Not Found');
    }
    const petpooja_restaurant = await readRestaurantPetpoojaOnboarding(
      validated_req.id
    );
    if (!petpooja_restaurant) {
      return sendError(
        res,
        400,
        'Restaurant petpooja onboarding not initiated'
      );
    }
    if (petpooja_restaurant.pos_status === PosStatus.ONBOARDED) {
      return sendError(res, 400, 'Restaurant already onboarded on petpooja');
    }
    if (validated_req.pos_id) {
      const pos_restaurant = await readRestaurantByPosId(validated_req.pos_id);
      if (pos_restaurant) {
        return sendError(
          res,
          400,
          'Another restaurant already onboarded to:' +
            PosPartner.PETPOOJA +
            ' with pos id: ' +
            validated_req.pos_id
        );
      }
      petpooja_restaurant.pos_id = validated_req.pos_id;
    }
    if (validated_req.pos_status === PosStatus.READY) {
      if (!petpooja_restaurant.pos_id) {
        return sendError(res, 400, 'pos_id empty not allowed.');
      }
    }
    const trx = await getTransaction();
    try {
      const result = await updateRestaurantPetpooja(trx, validated_req);
      await trx.commit();
      return sendSuccess(res, 200, result);
    } catch (error) {
      await trx.rollback();
      logger.error('Failed updating updating Restaurant Petpooja', error);
      throw error;
    }
  } catch (error) {
    return handleErrors(res, error, 'Error updating Restaurant Petpooja');
  }
}

export async function onboardRestaurant(req: Request, res: Response) {
  try {
    req.body.id = req.params.restaurant_id;
    const validation = validate.onboard_restaurant.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = validation.value as types.IPetPoojaOnboardingReq;

    const restaurant = await readRestaurantBasicById(validated_req.id);
    if (!restaurant) {
      return sendError(res, 400, 'Restaurant Not Found');
    }
    const petpooja_restaurant = await readRestaurantPetpoojaOnboarding(
      validated_req.id
    );
    if (!petpooja_restaurant) {
      return sendError(
        res,
        400,
        'Restaurant petpooja onboarding not initiated'
      );
    }
    if (petpooja_restaurant.pos_status === PosStatus.ONBOARDED) {
      return sendError(res, 400, 'Restaurant already onboarded on petpooja');
    }
    if (petpooja_restaurant.pos_status !== PosStatus.READY) {
      return sendError(res, 400, 'Restaurant petpooja onboarding not Ready');
    }
    // await fetchRestaurantMenu(petpooja_restaurant.pos_id!);
    const trx = await getTransaction();
    try {
      await updateRestaurantBasic(trx, {
        id: restaurant.id,
        pos_id: petpooja_restaurant.pos_id,
        pos_partner: PosPartner.PETPOOJA,
      });
      await updateRestaurantPetpooja(trx, {
        id: restaurant.id,
        pos_status: PosStatus.ONBOARDED,
        onboarded_at: new Date(),
      });
      const result = await deleteRestaurantMenu(trx, restaurant.id);

      await trx.commit();
      return sendSuccess(
        res,
        200,
        {
          existing_menu_manipulation_details: result,
        },
        'Restaurant has been succesfully onboarded, Please Sync Menu.'
      );
    } catch (error) {
      await trx.rollback();
      logger.error('Failed Saving Restaurant POS ID', error);
      throw 'Failed Saving Restaurant POS ID';
    }
  } catch (error) {
    return handleErrors(res, error, 'Error onboarding Restaurant Petpooja');
  }
}

export async function detachRestaurant(req: Request, res: Response) {
  try {
    req.body.id = req.params.restaurant_id;
    const validation = validate.detach_restaurant.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = validation.value as types.IPetPoojaDetachReq;

    const restaurant = await readRestaurantBasicById(validated_req.id);
    if (!restaurant) {
      return sendError(res, 400, 'Restaurant Not Found');
    }
    const petpooja_restaurant = await readRestaurantPetpoojaOnboarding(
      validated_req.id
    );
    if (!petpooja_restaurant) {
      return sendError(
        res,
        400,
        'Restaurant petpooja onboarding not initiated'
      );
    }
    if (petpooja_restaurant.pos_status === PosStatus.DETACHED) {
      return sendError(
        res,
        400,
        'Restaurant is already detached from petpooja'
      );
    }

    const trx = await getTransaction();
    try {
      await updateRestaurantBasic(trx, {
        id: restaurant.id,
        pos_id: null,
        pos_partner: null,
        pos_name: null,
      });
      await updateRestaurantPetpooja(trx, {
        id: restaurant.id,
        pos_status: PosStatus.DETACHED,
      });
      if (petpooja_restaurant.pos_status !== PosStatus.ONBOARDED) {
        await trx.commit();
        return sendSuccess(
          res,
          200,
          {},
          'Restaurant has been successfully detached'
        );
      }
      await deletePetpoojaTaxByRestaurantID(trx, restaurant.id);
      await deletePetpoojaItemTaxByRestaurantID(trx, restaurant.id);
      await deleteRestaurantMenuPosDetails(trx, restaurant.id);
      await trx.commit();
      return sendSuccess(
        res,
        200,
        {},
        'Restaurant has been successfully detached'
      );
    } catch (error) {
      await trx.rollback();
      logger.error('Failed Saving Restaurant POS ID', error);
      throw 'Failed Saving Restaurant POS ID';
    }
  } catch (error) {
    return handleErrors(res, error, 'Error Detaching Restaurant Petpooja');
  }
}

export async function fetchPetpoojaMenu(req: Request, res: Response) {
  try {
    const restaurant_id = req.params.restaurant_id;

    const restaurant = (await readRestaurantDetailsByIds([restaurant_id]))[0];
    if (!restaurant) {
      return sendError(res, 400, 'Restaurant Not Found');
    }
    const petpooja_restaurant = await readRestaurantPetpoojaOnboarding(
      restaurant_id
    );
    if (
      !petpooja_restaurant ||
      petpooja_restaurant.pos_status !== PosStatus.ONBOARDED
    ) {
      return sendError(res, 400, 'Restaurant not Onboarded on petpooja');
    }
    const trx = await getTransaction();
    try {
      const menu = await fetchRestaurantMenu(restaurant.pos_id!);
      const result = await populatePetPoojaMenu(restaurant, menu);
      await trx.commit();
      return sendSuccess(res, 200, {
        restaurant: result.restaurant,
        main_categories: result.main_categories,
        sub_categories: result.sub_categories,
        addons: result.addons,
        addon_groups: result.addon_groups,
        menu_items: result.menu_items,
        variants: result.variants,
        variant_groups: result.variant_groups,
        item_addons: result.item_addons,
        item_addon_groups: result.item_addon_groups,
      });
    } catch (error) {
      await trx.rollback();
      logger.error('Failed fetching petpooja menu', error);
      throw 'Failed fetching petpooja menu';
    }
  } catch (error) {
    return handleErrors(res, error, 'Error onboarding Restaurant Petpooja');
  }
}
