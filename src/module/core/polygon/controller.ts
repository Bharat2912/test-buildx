import {Request, Response} from 'express';
import handleErrors from '../../../utilities/controllers/handle_errors';
import * as models from './models';
import {
  sendError,
  sendSuccess,
} from '../../../utilities/controllers/handle_response';
import {readCityById} from '../city/models';

export async function readPolygonByCity(req: Request, res: Response) {
  try {
    const validation = models.id.validate(req.query.city_id);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = validation.value;
    const polygon = await models.readPolygonByCityId(validated_req);
    if (!polygon) return sendError(res, 404, 'polygon not found');
    return sendSuccess(res, 200, polygon);
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function readPolygonsByCityIds(req: Request, res: Response) {
  try {
    // if key city_ids is not in request then return all polygons
    if (!req.body.filter.city_ids) {
      const polygon = await models.readAllPolygons();
      return sendSuccess(res, 200, polygon);
    } else {
      // if there is city_id then validate city id.
      const validation = models.validate_city_id.validate(req.body.filter);
      if (validation.error)
        return sendError(res, 400, validation.error.details[0].message);
      const validated_req = validation.value;
      const polygon = await models.readPolygonByCityIds(validated_req.city_ids);
      return sendSuccess(res, 200, polygon);
    }
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function readPolygonById(req: Request, res: Response) {
  try {
    const validation = models.id.validate(req.params.id);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = validation.value;
    const polygon = await models.readPolygonById(validated_req);
    if (!polygon) return sendError(res, 404, 'polygon not found');
    return sendSuccess(res, 200, polygon);
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function readAllPolygons(req: Request, res: Response) {
  try {
    const polygons = await models.readAllPolygons();
    return sendSuccess(res, 200, polygons);
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function createPolygon(req: Request, res: Response) {
  try {
    const validation = models.verify_create_polygon.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = validation.value;
    const city = await readCityById(validated_req.city_id);
    if (!city) return sendError(res, 404, 'City  Not Found');
    // validated_req.status = 'geohashPending';
    validated_req.status = 'active';
    const polygon = await models.createPolygon(validated_req);
    // await sendSQSMessage(SQS_URL.SERVICEABILITY, {
    //   event: 'POLYGON',
    //   action: 'CREATE',
    //   data: {
    //     id: polygon.id,
    //     coordinates: polygon.coordinates,
    //   },
    // });
    return sendSuccess(res, 201, polygon);
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function deletePolygonById(req: Request, res: Response) {
  try {
    const validation = models.id.validate(req.params.id);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = validation.value;
    const polygon = await models.deletePolygonById(validated_req);
    if (!polygon) return sendError(res, 404, 'polygon not found');
    // await sendSQSMessage(SQS_URL.SERVICEABILITY, {
    //   event: 'POLYGON',
    //   action: 'DELETE',
    //   data: {
    //     id: polygon.id,
    //   },
    // });
    return sendSuccess(res, 200, polygon);
  } catch (error) {
    return handleErrors(res, error);
  }
}
