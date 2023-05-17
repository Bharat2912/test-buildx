import {v4 as uuidv4} from 'uuid';
import constants from './constants';
import cityConstants from '../city/constants';
import Joi from 'joi';
import {DB} from '../../../data/knex';
import logger from '../../../utilities/logger/winston_logger';

const cols = constants.ColumnNames;

export interface Polygon {
  id: string;
  name?: string;
  coordinates?: number[][];
  city_id?: string;
  status?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
}

export const id = Joi.string()
  .guid({version: ['uuidv4', 'uuidv5']})
  .required();

export const validate_city_id = Joi.object({
  city_ids: Joi.array().items(
    Joi.string().trim().messages({
      'string.empty': 'Please add city_id',
    })
  ),
});

export function readPolygonByCityId(city_id: string): Promise<Polygon[]> {
  logger.debug('reading polygon by city id', city_id);
  return DB.read(constants.TableName)
    .where({is_deleted: false, city_id: city_id})
    .select([cols.id, cols.name, cols.coordinates, cols.status])
    .then((polygon: Polygon[]) => {
      logger.debug('successfully fetched polygon by city id', polygon);
      return polygon;
    })
    .catch((error: Error) => {
      logger.error('FAILED TO FETCH POLYGON BY CITY ID', error);
      throw error;
    });
}

export function readPolygonByCityIds(city_ids: string[]): Promise<Polygon[]> {
  logger.debug('reading polygon by city ids', city_ids);
  return DB.read(constants.TableName)
    .where({is_deleted: false})
    .whereIn('city_id', city_ids)
    .select([cols.id, cols.name, cols.coordinates, cols.status])

    .then((polygon: Polygon[]) => {
      logger.debug('successfyly fetched polygon by city ids', polygon);
      return polygon;
    })
    .catch((error: Error) => {
      logger.error('ERROR GOT WHILE FETCHING POLYGON BY CITY IDS', error);
      throw error;
    });
}

export function readPolygonById(id: string): Promise<Polygon> {
  logger.debug('reading polygon by id', id);
  return DB.read(constants.TableName)
    .where({is_deleted: false, id: id})
    .select([cols.id, cols.name, cols.coordinates, cols.status, cols.city_id])
    .then((polygon: Polygon[]) => {
      logger.debug('successfully fetched polygon by id', polygon[0]);
      return polygon[0];
    })
    .catch((error: Error) => {
      logger.error('FAILED TO FETCH POLYGON BY ID', error);
      throw error;
    });
}
export function readAllPolygons(): Promise<Polygon[]> {
  logger.debug('reading all polygon');
  return DB.read(`${constants.TableName} as poly`)
    .select([
      `poly.${constants.ColumnNames.id}`,
      `poly.${constants.ColumnNames.name} as name`,
      `poly.${constants.ColumnNames.coordinates}`,
      `poly.${constants.ColumnNames.status}`,
      `poly.${constants.ColumnNames.city_id}`,
      `city.${cityConstants.ColumnNames.name} as city_name`,
    ])
    .join(
      `${cityConstants.TableName} AS city`,
      `city.${cityConstants.ColumnNames.id}`,
      `poly.${constants.ColumnNames.city_id}`
    )
    .where({[`poly.${constants.ColumnNames.is_deleted}`]: false})
    .then((polygon: Polygon[]) => {
      logger.debug('successfully fetched all polygon', polygon);
      return polygon;
    })
    .catch((error: Error) => {
      logger.error('FAILED TO FETCH ALL POLYGON', error);
      throw error;
    });
}

export const verify_create_polygon = Joi.object({
  name: Joi.string().min(1).max(70).required(),
  coordinates: Joi.array()
    .items(Joi.array().items(Joi.number().min(-180).max(180)).min(2).max(2))
    .min(3),
  city_id: Joi.string()
    .guid({version: ['uuidv4', 'uuidv5']})
    .required(),
});
export function createPolygon(polygon: Polygon): Promise<Polygon> {
  logger.debug('creating polygon', polygon);
  polygon.id = uuidv4();
  return DB.write(constants.TableName)
    .insert(polygon)
    .returning('*')
    .then((polygon: Polygon[]) => {
      logger.debug('polygon created successfully', polygon);
      return polygon[0];
    })
    .catch((error: Error) => {
      logger.error('ERROR GENRATED CREATING POLYGON', error);
      throw error;
    });
}
export function updatePolygonById(polygon: Polygon): Promise<Polygon> {
  logger.debug('updating polygon by id', polygon);
  polygon.updated_at = new Date();
  return DB.write(constants.TableName)
    .update(polygon)
    .where({is_deleted: false, id: polygon.id})
    .returning('*')
    .then((polygon: Polygon[]) => {
      logger.debug('successfully updated polygon by id', polygon);
      return polygon[0];
    })
    .catch((error: Error) => {
      logger.error('ERROR UPDATING POLYGON BY ID', error);
      throw error;
    });
}
export function deletePolygonById(id: string): Promise<Polygon> {
  logger.debug('deleting polygon by id', id);
  const polygon = <Polygon>{
    id: id,
    is_deleted: true,
  };
  return DB.write(constants.TableName)
    .update(polygon)
    .where({is_deleted: false, id: id})
    .returning('*')
    .then((polygon: Polygon[]) => {
      logger.debug('successfully deleted polygon by id', polygon[0]);
      return polygon[0];
    })
    .catch((error: Error) => {
      logger.error('ERROR GENRATED WHILE DELETING POLYGON', error);
      throw error;
    });
}
