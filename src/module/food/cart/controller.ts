import {Request, Response} from 'express';
import handleErrors from '../../../utilities/controllers/handle_errors';
import {
  sendError,
  sendSuccess,
} from '../../../utilities/controllers/handle_response';
import {getCartByUserID, id, putCartByUserId, put_cart} from './models';
import {IPutCart} from './types';
import logger from '../../../utilities/logger/winston_logger';
import {validateCart} from './service';

export async function getCart(req: Request, res: Response) {
  try {
    const validation = id.validate(req.user.id);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = validation.value as string;
    //get cart from dynamoDB
    const dynamoDB_response = await getCartByUserID({
      customer_id: validated_req,
    });
    if (Object.keys(dynamoDB_response).length > 0) {
      const authorizationToken = req.headers['authorization'];
      const validation_response = await validateCart(
        dynamoDB_response,
        authorizationToken
      );
      if (
        !validation_response.populated_cart.cart_status &&
        validation_response.cart_meta_errors
      ) {
        validation_response.populated_cart.cart_meta_errors =
          validation_response.cart_meta_errors;
        return sendSuccess(res, 200, validation_response.populated_cart);
      } else {
        return sendSuccess(res, 200, validation_response.populated_cart);
      }
    } else {
      return sendSuccess(res, 200, {});
    }
  } catch (error) {
    logger.error('GET CART error', error);
    return handleErrors(res, error);
  }
}

export async function putCart(req: Request, res: Response) {
  try {
    const validation = put_cart.validate({
      action: req.body.action,
      customer_id: req.user.id,
      customer_device_id: req.body.customer_device_id,
      customer_address_id: req.body.customer_address_id,
      restaurant_id: req.body.restaurant_id,
      menu_items: req.body.menu_items,
      any_special_request: req.body.any_special_request,
      coupon_code: req.body.coupon_code,
      coupon_id: req.body.coupon_id,
    });

    if (validation.error)
      return sendError(res, 400, [
        {message: validation.error.details[0].message, code: 1000},
      ]);

    const validated_req = validation.value as IPutCart;
    const authorizationToken = req.headers['authorization'];
    const validation_response = await validateCart(
      validated_req,
      authorizationToken
    );
    //put cart into dynamoDB
    if (Object.keys(validation_response.populated_cart).length > 0) {
      if (
        !validation_response.populated_cart.cart_status &&
        validation_response.cart_meta_errors
      ) {
        validation_response.populated_cart.cart_meta_errors =
          validation_response.cart_meta_errors;
        //if cart has errors then simply return populated data and dont save data in dynamodb
        return sendSuccess(res, 200, validation_response.populated_cart);
      } else {
        const dynamoDB_response = await putCartByUserId(
          validated_req.customer_id,
          JSON.parse(JSON.stringify(validated_req))
        );
        logger.info('update cart dynamoDB response: ', dynamoDB_response);
      }
    } else {
      const dynamoDB_response = await putCartByUserId(
        validated_req.customer_id,
        {}
      );
      logger.info('update cart dynamoDB response: ', dynamoDB_response);
    }

    return sendSuccess(res, 200, validation_response.populated_cart);
  } catch (error) {
    logger.error('Error raised while updating cart: ', error);
    return handleErrors(res, error);
  }
}
