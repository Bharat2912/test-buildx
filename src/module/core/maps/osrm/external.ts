import axios from 'axios';
import logger from '../../../../utilities/logger/winston_logger';
import ResponseError from '../../../../utilities/response_error';
import {ICoordinate} from '../types';

/**
 * distance: The distance of travel from the maneuver to the subsequent step, in float meters.
 * duration: The estimated travel time, in float number of seconds.
 */
export async function getOSRMtable(
  coordinates: string,
  sources: string,
  destinations: string
) {
  logger.debug('osrm matrix request', {coordinates, sources, destinations});
  const result = await axios({
    method: 'get',
    url: `${process.env.OSRM_HOST}/table/v1/driving/${coordinates}`,
    headers: {
      'Content-Type': 'application/json',
    },
    params: {
      sources,
      destinations,
      annotations: 'duration,distance',
    },
  }).catch(error => {
    if (error.response) {
      logger.error('FAILED response OSRM', error.response.data);
      throw new ResponseError(
        400,
        'OSRM TABLE Error:' + error.response.data.message
      );
    } else {
      logger.error('FAILED OSRM', error);
      throw new ResponseError(500, 'Internal Server Error');
    }
  });
  if (result.data.code !== 'Ok') {
    throw new ResponseError(400, 'OSRM TABLE Error:' + result.data.message);
  }

  return {
    distances: result.data.distances,
    durations: result.data.durations,
    destinations: result.data.destinations,
    sources: result.data.sources,
  };
}

export async function getOSRMroute(
  origin: ICoordinate,
  destination: ICoordinate
) {
  logger.debug('osrm get route request', {origin, destination});
  const url = `${process.env.OSRM_HOST}/route/v1/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=full`;
  logger.debug('OSRM URL', url);
  const result = await axios.get(url).catch(error => {
    if (error.response) {
      logger.error('FAILED response OSRM', error.response.data);
      throw new ResponseError(
        400,
        'Routing Error:' + error.response.data.message
      );
    } else {
      logger.error('FAILED OSRM', error);
      throw new ResponseError(500, 'Internal Server Error');
    }
  });
  if (result.data.code !== 'Ok') {
    throw new ResponseError(400, 'Routing Error:' + result.data.message);
  }
  return result.data;
}
