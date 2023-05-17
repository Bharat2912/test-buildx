import logger from '../../../utilities/logger/winston_logger';
import handleErrors from '../../../utilities/controllers/handle_errors';
import {
  sendError,
  sendSuccess,
} from '../../../utilities/controllers/handle_response';
import {Request, Response} from 'express';
import {roundUp} from '../../../utilities/utilFuncs';
import * as validate from './validations';
import {getOSRMroute, getOSRMtable} from './osrm/external';

export async function getRoute(req: Request, res: Response) {
  try {
    // http://localhost:8083/rider/osrm/route?origin=12.968272199085886,77.57547275015348&destination=12.96408786159165,77.59388466409717
    logger.debug('getOSRM Query', req.query);
    const validation = validate.gdm_location_joi.validate(req.query);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = validation.value;
    const orgn_latlng = validated_req.origin.split(',');
    const dest_latlng = validated_req.destination.split(',');
    const req_json = {
      start: {
        latitude: orgn_latlng[0],
        longitude: orgn_latlng[1],
      },
      end: {
        latitude: dest_latlng[0],
        longitude: dest_latlng[1],
      },
    };

    const validation_json = validate.location_joi.validate(req_json);
    if (validation_json.error)
      return sendError(res, 400, validation_json.error.details[0].message);
    const validated_req_json = validation_json.value;

    const osrm = await getOSRMroute(
      validated_req_json.start,
      validated_req_json.end
    );
    const distance_km = roundUp(osrm.routes[0].distance / 1000, 2);
    const duration_mins = roundUp(osrm.routes[0].duration / 60, 2);
    const result = {
      routes: [
        {
          legs: [
            {
              distance: {
                text: distance_km + ' km',
                value: osrm.routes[0].distance,
              },
              duration: {
                text: duration_mins + ' mins',
                value: osrm.routes[0].duration,
              },
              steps: [],
              traffic_speed_entry: [],
              via_waypoint: [],
            },
          ],
          overview_polyline: {
            points: osrm.routes[0].geometry,
          },
          warnings: [],
          waypoint_order: [],
        },
      ],
      status: 'OK',
    };
    // return res.status(200).send(result);
    return sendSuccess(res, 200, result);
  } catch (error) {
    return handleErrors(res, error, 'FAILED WHILE USING MAPS ROUTE API');
  }
}

export async function getMatrix(req: Request, res: Response) {
  try {
    const validation = validate.matrix_location_joi.validate(req.query);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = validation.value as {
      coordinates: string;
      origins: string;
      destinations: string;
    };
    logger.debug('Matrix api request', validated_req);
    const result = await getOSRMtable(
      validated_req.coordinates,
      validated_req.origins,
      validated_req.destinations
    );
    logger.debug('Matrix api result', result);
    return sendSuccess(res, 200, result);
  } catch (error) {
    return handleErrors(res, error, 'FAILED WHILE USING MAPS MATRIX API');
  }
}
