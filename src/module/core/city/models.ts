import {v4 as uuidv4} from 'uuid';
import constants from './constants';
import Joi from 'joi';
import {DB} from '../../../data/knex';
import ResponseError from '../../../utilities/response_error';
import logger from '../../../utilities/logger/winston_logger';

export interface City {
  id: string;
  name: string;
  status: string;
  created_at: Date;
  updated_at: Date;
  is_deleted: boolean;
}

export const id = Joi.string()
  .guid({version: ['uuidv4', 'uuidv5']})
  .required();

export const verify_create_city = Joi.object({
  name: Joi.string().min(1).max(70).required(),
  status: Joi.string().valid('active', 'inactive'),
});

export const verify_update_city = Joi.object({
  id: Joi.string()
    .guid({version: ['uuidv4', 'uuidv5']})
    .required(),
  name: Joi.string().min(1).max(70),
  status: Joi.string().valid('active', 'inactive'),
});

export function createCity(city: City): Promise<City> {
  city.id = uuidv4();
  logger.debug('creating city', city);
  return DB.write(constants.TableName)
    .insert(city)
    .returning('*')
    .then((city: City[]) => {
      logger.debug('city created successfully', city[0]);
      return city[0];
    })
    .catch((error: {code: string}) => {
      if (error.code === '23505') {
        throw new ResponseError(400, city.name + ' already exists. ');
      }
      logger.error('GOT ERROR WHILE CREATING NEW CITY', error);
      throw error;
    });
}

export function updateCity(city: City): Promise<City> {
  city.updated_at = new Date();
  logger.debug('updating city', city);
  return DB.write(constants.TableName)
    .update(city)
    .returning('*')
    .where({id: city.id})
    .then((city: City[]) => {
      logger.debug('city updated successfully', city[0]);
      return city[0];
    })
    .catch((error: {code: string}) => {
      if (error.code === '23505') {
        throw new ResponseError(400, city.name + ' already exist');
      }
      logger.error('GOT ERROR WHILE UPDATING CITY', error);
      throw error;
    });
}

export function deleteCityById(id: string): Promise<City> {
  logger.debug('deleting city by id', id);
  const city = <City>{
    id: id,
    is_deleted: true,
  };
  return DB.write(constants.TableName)
    .update(city)
    .where({is_deleted: false, id: id})
    .returning('*')
    .then((city: City[]) => {
      logger.debug('city deleted successfully', city[0]);
      return city[0];
    })
    .catch((error: Error) => {
      logger.error('GOT ERROR WHILE DELETING CITY BY ID', error);
      throw error;
    });
}

export function readCityById(id: string): Promise<City> {
  logger.debug('reading city by id', id);
  return DB.read(constants.TableName)
    .where({is_deleted: false, id: id})
    .select([
      constants.ColumnNames.id,
      constants.ColumnNames.name,
      constants.ColumnNames.status,
    ])
    .then((city: City[]) => {
      logger.debug('fetched city by id successfully', city[0]);
      return city[0];
    })
    .catch((error: Error) => {
      logger.error('GOT ERROR WHILE FETCHING CITY BY ID', error);
      throw error;
    });
}

export function readAllCity(): Promise<City[]> {
  logger.debug('reading all city');
  return DB.read(constants.TableName)
    .where({is_deleted: false})
    .select([
      constants.ColumnNames.id,
      constants.ColumnNames.name,
      constants.ColumnNames.status,
    ])
    .then((city: City[]) => {
      logger.debug('fetched all city', city);
      return city;
    })
    .catch((error: Error) => {
      logger.error('GOT ERROR WHILE FETCHING ALL CITY', error);
      throw error;
    });
}

export function readActiveCity(): Promise<City[]> {
  logger.debug('reading active city', constants.StatusNames.active);
  return DB.read(constants.TableName)
    .where({is_deleted: false, status: constants.StatusNames.active})
    .select([constants.ColumnNames.id, constants.ColumnNames.name])
    .then((city: City[]) => {
      logger.debug('successfully read all active city', city);
      return city;
    })
    .catch((error: Error) => {
      logger.error('GOT ERROR WHILE READING ACTIVE CITY', error);
      throw error;
    });
}
