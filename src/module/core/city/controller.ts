import {Request, Response} from 'express';
import handleErrors from '../../../utilities/controllers/handle_errors';
import * as models from './models';
import logger from '../../../utilities/logger/winston_logger';
import {
  sendError,
  sendSuccess,
} from '../../../utilities/controllers/handle_response';

export async function createCity(req: Request, res: Response) {
  try {
    const validation = models.verify_create_city.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = validation.value;
    const city = await models.createCity(validated_req);
    return sendSuccess(res, 201, {id: city.id});
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function updateCity(req: Request, res: Response) {
  try {
    const validationParam = models.id.validate(req.params.id);
    if (validationParam.error)
      return sendError(res, 400, validationParam.error.details[0].message);
    req.body.id = validationParam.value;
    const validation = models.verify_update_city.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);

    const validated_req = validation.value;

    const city = await models.readCityById(validated_req.id);
    if (!city) return sendError(res, 404, 'City  Not Found');

    const updatedCity = await models.updateCity(validated_req);

    logger.debug('updatedCity', updatedCity);
    return sendSuccess(res, 200, {id: updatedCity.id});
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function deleteCityById(req: Request, res: Response) {
  try {
    const validation = models.id.validate(req.params.id);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);

    const validated_req = validation.value;

    const city = await models.readCityById(validated_req);

    if (!city) return sendError(res, 404, 'City Not Found');

    await models.deleteCityById(validated_req);
    return sendSuccess(res, 200, {id: city.id});
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function readCityById(req: Request, res: Response) {
  try {
    const validation = models.id.validate(req.params.id);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);

    const validated_req = validation.value;

    const city = await models.readCityById(validated_req);
    if (!city) return sendError(res, 404, 'City  Not Found');
    return sendSuccess(res, 200, city);
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function readAllCity(req: Request, res: Response) {
  try {
    const city = await models.readAllCity();
    return sendSuccess(res, 200, city);
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function readActiveCity(req: Request, res: Response) {
  try {
    const city = await models.readActiveCity();
    return sendSuccess(res, 200, city);
  } catch (error) {
    return handleErrors(res, error);
  }
}
