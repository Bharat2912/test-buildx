import axios from 'axios';
import logger from '../utilities/logger/winston_logger';

export async function getMapMatrix(
  coordinates: string,
  origins: string,
  destinations: string
): Promise<IMapMatrixResponse> {
  logger.debug('request for get map matrix', {
    coordinates,
    origins,
    destinations,
  });
  // if (process.env.LOCAL_RUN) {
  //   return {
  //     distances: [[1, 1]],
  //     durations: [[1, 1]],
  //     destinations: [
  //       {
  //         hint: '',
  //         distance: 0,
  //         name: '',
  //         location: [1, 1],
  //       },
  //     ],
  //     sources: [
  //       {
  //         hint: '',
  //         distance: 0,
  //         name: '',
  //         location: [1, 1],
  //       },
  //     ],
  //   };
  // }
  const result = await axios
    .get((process.env.CORE_API_URL || '') + '/internal/maps/matrix', {
      headers: {
        'Content-Type': 'application/json',
      },
      params: {
        coordinates,
        origins,
        destinations,
      },
    })
    .then(response => {
      logger.debug('successfully got map matrix', response.data.result);
      return response.data.result;
    })
    .catch(error => {
      if (error.response) {
        logger.error('INTERNAL MAPS MATRIX API FAILED', error.response.data);
      } else {
        logger.error('INTERNAL MAPS MATRIX API FAILED', error);
      }
      throw error;
    });
  return result;
}

export interface IMapMatrixResponse {
  distances: number[][];
  durations: number[][];
  destinations: {
    hint: string;
    distance: number;
    name: string;
    location: [number, number];
  }[];
  sources: {
    hint: string;
    distance: number;
    name: string;
    location: [number, number];
  }[];
}
