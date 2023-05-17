import {Request, Response} from 'express';
import handleErrors from '../../../utilities/controllers/handle_errors';
import * as models from './models';
import logger from '../../../utilities/logger/winston_logger';
import {
  sendError,
  sendSuccess,
} from '../../../utilities/controllers/handle_response';

export async function createLanguage(req: Request, res: Response) {
  try {
    const validation = models.verify_create_language.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = validation.value;
    const language = await models.createLanguage(validated_req);
    return sendSuccess(res, 201, {id: language.id});
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function updateLanguage(req: Request, res: Response) {
  try {
    const validationParam = models.id.validate(req.params.id);
    if (validationParam.error)
      return sendError(res, 400, validationParam.error.details[0].message);
    req.body.id = validationParam.value;
    const validation = models.verify_update_language.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);

    const validated_req = validation.value;

    const language = await models.readLanguageById(validated_req.id);
    if (!language) return sendError(res, 404, 'Language  Not Found');

    const updatedLanguage = await models.updateLanguage(validated_req);
    logger.debug('updatedLanguage', updatedLanguage);
    return sendSuccess(res, 200, {id: updatedLanguage.id});
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function deleteLanguageById(req: Request, res: Response) {
  try {
    const validation = models.id.validate(req.params.id);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);

    const validated_req = validation.value;

    const language = await models.readLanguageById(validated_req);
    if (!language) return sendError(res, 404, 'Language  Not Found');
    await models.deleteLanguageById(validated_req);
    return sendSuccess(res, 200, {id: language.id});
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function readLanguageById(req: Request, res: Response) {
  try {
    const validation = models.id.validate(req.params.id);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);

    const validated_req = validation.value;

    const language = await models.readLanguageById(validated_req);
    if (!language) return sendError(res, 404, 'Language  Not Found');
    return sendSuccess(res, 200, language);
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function readAllLanguage(req: Request, res: Response) {
  try {
    const language = await models.readAllLanguage();
    return sendSuccess(res, 200, language);
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function readActiveLanguage(req: Request, res: Response) {
  try {
    const language = await models.readActiveLanguage();
    return sendSuccess(res, 200, language);
  } catch (error) {
    return handleErrors(res, error);
  }
}
