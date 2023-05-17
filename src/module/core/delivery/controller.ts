import {Request, Response} from 'express';
import {
  sendError,
  sendSuccess,
} from '../../../utilities/controllers/handle_response';
import handleErrors from '../../../utilities/controllers/handle_errors';
import logger from '../../../utilities/logger/winston_logger';
import * as models from './external';
import {
  verify_cancel_delivery,
  verify_cancel_delivery_admin,
  verify_check_deliverability,
  verify_place_order,
  verify_update_order_status,
} from './validations';
import {
  IDeliverabilityCheckRequest,
  ICancelDeliveryRequest,
  IPlaceOrderRequest,
  IUpdateOrderStatusRequest,
} from './types';
import {DeliveryService} from '../../../enum';
import Globals from '../../../utilities/global_var/globals';

export async function deliverabilityCheck(req: Request, res: Response) {
  try {
    const validation = verify_check_deliverability.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = validation.value as IDeliverabilityCheckRequest;
    validated_req.delivery_service = (validated_req.delivery_service ||
      (await Globals.DELIVERY_SERVICE.get())) as DeliveryService;
    logger.debug('deliverability check', validated_req);
    const result = await models.deliverabilityCheck(validated_req);
    logger.debug('deliverability check result', result);
    return sendSuccess(res, 200, result);
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function placeOrder(req: Request, res: Response) {
  try {
    const validation = verify_place_order.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = validation.value as IPlaceOrderRequest;
    validated_req.delivery_service = (validated_req.delivery_service ||
      (await Globals.DELIVERY_SERVICE.get())) as DeliveryService;
    logger.debug('place order', validated_req);
    const result = await models.placeOrder(validated_req);
    if (result.status === 'success') {
      logger.debug('order successfully placed', result);
    } else {
      logger.error('order place failed', result);
    }
    return sendSuccess(res, 200, result);
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function cancelDelivery(req: Request, res: Response) {
  try {
    req.body.delivery_service = (req.body.delivery_service ||
      (await Globals.DELIVERY_SERVICE.get())) as DeliveryService;
    const validation = verify_cancel_delivery.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = validation.value as ICancelDeliveryRequest;

    logger.debug('Cancel Delivery Order Payload', validated_req);
    const result = await models.cancelOrder(validated_req);

    return sendSuccess(res, 200, result);
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function updateStatus(req: Request, res: Response) {
  try {
    req.body.delivery_service = (req.body.delivery_service ||
      (await Globals.DELIVERY_SERVICE.get())) as DeliveryService;
    const validation = verify_update_order_status.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = validation.value as IUpdateOrderStatusRequest;

    logger.debug('Update Order Status Payload', validated_req);
    const result = await models.updateOrderStatus(validated_req);
    logger.debug('response of updation of order status at rider', result);
    return sendSuccess(res, 200, result);
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function cancelDelivery_admin(req: Request, res: Response) {
  try {
    req.body.delivery_service = (req.body.delivery_service ||
      (await Globals.DELIVERY_SERVICE.get())) as DeliveryService;
    const validation = verify_cancel_delivery_admin.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = validation.value as ICancelDeliveryRequest;
    validated_req.user = 'Customer';
    logger.debug('Cancel Delivery Order Payload', validated_req);
    const result = await models.cancelOrder(validated_req);
    return sendSuccess(res, 200, result);
  } catch (error) {
    return handleErrors(res, error);
  }
}
