import {Request, Response} from 'express';
import handleErrors from '../../../utilities/controllers/handle_errors';
import * as models from './models';
import logger from '../../../utilities/logger/winston_logger';
import {
  sendError,
  sendSuccess,
} from '../../../utilities/controllers/handle_response';
import Joi from 'joi';

export async function verifyPostalCode(req: Request, res: Response) {
  try {
    const validation = Joi.string().required().validate(req.params.postal_code);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = validation.value;

    logger.debug('POSTAL CODE Validation Data', validated_req);
    const result = await models.verifyPostalCode(validated_req);

    return sendSuccess(res, 200, result);
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function verifyFssai(req: Request, res: Response) {
  try {
    const validation = Joi.string().required().validate(req.params.fssai);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = validation.value;

    logger.debug('FSSAI Validation Data', validated_req);
    const result = await models.verifyFssai(validated_req);

    return sendSuccess(res, 200, result);
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function verifyPanNumber(req: Request, res: Response) {
  try {
    const validation = Joi.string().required().validate(req.params.pan_number);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = validation.value;

    logger.debug('PAN NUMBER Validation Data', validated_req);
    const result = await models.verifyPanNumber(validated_req);

    return sendSuccess(res, 200, result);
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function verifyGstinNumber(req: Request, res: Response) {
  try {
    const validation = Joi.string()
      .required()
      .validate(req.params.gstin_number);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = validation.value;

    logger.debug('GSTIN Validation Data', validated_req);
    const result = await models.verifyGstinNumber(validated_req);

    return sendSuccess(res, 200, result);
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function verifyIfscCode(req: Request, res: Response) {
  try {
    const validation = Joi.string().required().validate(req.params.ifsc_code);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = validation.value;

    logger.debug('IFSC Validation Data', validated_req);
    const result = await models.verifyIfscCode(validated_req);
    return sendSuccess(res, 200, result);
  } catch (error) {
    return handleErrors(res, error);
  }
}
