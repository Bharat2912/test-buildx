import logger from '../../../utilities/logger/winston_logger';
import {
  getCashfreeSessionId,
  getCashfreeTransactionToken,
} from './cashfree/payment';
import handleErrors from '../../../utilities/controllers/handle_errors';
import {
  sendError,
  sendSuccess,
} from '../../../utilities/controllers/handle_response';
import {Request, Response} from 'express';
import {
  validate_confirm_payment_details,
  validate_generate_payment_tranasaction_token_details,
} from './validations';
import {IConfirmPayment, IGeneratePaymentTransactionToken} from './types';
import {confirmPaymentAtCashfree} from './cashfree/service';

export async function generatePaymentTransactionToken(
  req: Request,
  res: Response
) {
  try {
    const validation =
      validate_generate_payment_tranasaction_token_details.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = validation.value as IGeneratePaymentTransactionToken;
    const transaction_token = await getCashfreeTransactionToken(
      validated_req.customer_details,
      validated_req.order_value,
      validated_req.order_payment_id
    );
    logger.debug('generating payment transaction token', {
      service_name: validated_req.service_name,
      transaction_token,
    });
    return sendSuccess(res, 200, {
      transaction_token,
    });
  } catch (error) {
    logger.error('error while generating payment transaction token', error);
    return handleErrors(res, error);
  }
}

export async function generatePaymentSessionId(req: Request, res: Response) {
  try {
    const validation =
      validate_generate_payment_tranasaction_token_details.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = validation.value as IGeneratePaymentTransactionToken;
    const session_id = await getCashfreeSessionId(
      validated_req.customer_details,
      validated_req.order_value,
      validated_req.order_payment_id
    );
    logger.debug('generating payment session id', {
      service_name: validated_req.service_name,
      session_id,
    });
    return sendSuccess(res, 200, {
      session_id,
    });
  } catch (error) {
    logger.error('error while generating payment session id', error);
    return handleErrors(res, error);
  }
}

export async function confirmPayment(req: Request, res: Response) {
  try {
    const validation = validate_confirm_payment_details.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = validation.value as IConfirmPayment;
    const confirm_payment_response = await confirmPaymentAtCashfree(
      validated_req.order_payment_id
    );
    logger.debug('confirm payment', {
      service_name: validated_req.service_name,
      confirm_payment_response,
    });
    return sendSuccess(res, 200, confirm_payment_response);
  } catch (error) {
    logger.error('error while confirming payment', error);
    return handleErrors(res, error);
  }
}
