import {v4 as uuidv4} from 'uuid';
import constants from './constants';
import Joi from 'joi';
import {DB} from '../../../data/knex';
import {databaseResponseTimeHistogram} from '../../../utilities/metrics/prometheus';
import ResponseError from '../../../utilities/response_error';
import logger from '../../../utilities/logger/winston_logger';
import * as joi from '../../../utilities/joi_common';
import {FileObject} from '../../../utilities/s3_manager';
export interface ICuisine {
  id: string;
  name: string;
  status: string;
  created_at: Date;
  updated_at: Date;
  is_deleted: boolean;
  image?: FileObject | null;
}

// Schema/Model for What Data need to to create cuisine.
export const verify_create_cuisine = Joi.object({
  name: Joi.string().trim().min(1).max(70).required(),
  status: Joi.string().trim().min(1).max(70).required(),
  image: joi.verify_file,
});

// Schema/Model for Update cuisine.
export const verify_update_cuisine = Joi.object({
  id: Joi.string()
    .guid({version: ['uuidv4', 'uuidv5']})
    .required(),
  name: Joi.string().trim().min(1).max(70).required(),
  status: Joi.string().trim().min(1).max(70).required(),
  image: joi.verify_file,
});

// 1:- Create cuisine Method
/**
 * It creates a new cuisine in the database.
 * @param {Cuisine} cuisine - Cuisine
 * @returns A Cuisine object.
 */
export function createCuisine(cuisine: ICuisine) {
  const metricsLabels = {
    operation: 'createCuisine',
  };
  const timer = databaseResponseTimeHistogram.startTimer();
  cuisine.id = uuidv4();
  logger.debug('creating cuisine', cuisine);
  return DB.write(constants.TableName)
    .insert(cuisine)
    .returning('*')
    .then((cuisine: ICuisine[]) => {
      timer({...metricsLabels, success: 'true'});
      logger.debug('successfully created cuisine', cuisine[0]);
      return cuisine[0];
    })
    .catch((error: {code: string}) => {
      timer({...metricsLabels, success: 'false'});
      if (error.code === '23505') {
        throw new ResponseError(400, cuisine.name + ' already exists.');
      }
      logger.error('ERROR GENRATED WHILE CREATING MAIN CATEGORY', error);
      throw error;
    });
}

// 2:- Update cuisine Method
/**
 * Update a cuisine
 * @param {Cuisine} cuisine - Cuisine
 * @returns A Cuisine object.
 */
export function updateCusine(cuisine: ICuisine) {
  const metricsLabels = {
    operation: 'updateCuisine',
  };
  const timer = databaseResponseTimeHistogram.startTimer();
  cuisine.updated_at = new Date();
  logger.debug('updating cuisine', cuisine);
  return DB.write(constants.TableName)
    .update(cuisine)
    .returning('*')
    .where({id: cuisine.id})
    .then((cuisine: ICuisine[]) => {
      timer({...metricsLabels, success: 'true'});
      logger.debug('successfully updated cuisine', cuisine[0]);
      return cuisine[0];
    })
    .catch((error: {code: string}) => {
      timer({...metricsLabels, success: 'false'});
      if (error.code === '23505') {
        throw new ResponseError(400, cuisine.name + ' already Exist.');
      }
      logger.error('ERROR GENRATED WHILE UPDATING CUISINE', error);
      throw error;
    });
}

// 3:- Delete cuisine Method
/**
 * It deletes a cuisine from the database.
 * @param {string} id - string
 * @returns A Cuisine object.
 */
export function deleteCusineById(id: string) {
  const metricsLabels = {
    operation: 'deleteCuisineById',
  };
  const timer = databaseResponseTimeHistogram.startTimer();
  logger.debug('deletin cuisine by id', id);
  const cuisine = <ICuisine>{
    id: id,
    is_deleted: true,
  };
  return DB.write(constants.TableName)
    .update(cuisine)
    .where({is_deleted: false, id: id})
    .returning('*')

    .then((cuisine: ICuisine[]) => {
      timer({...metricsLabels, success: 'true'});
      logger.debug('successfully deleted cuisine by id', cuisine[0]);
      return cuisine[0];
    })
    .catch((error: Error) => {
      timer({...metricsLabels, success: 'false'});
      logger.debug('ERROR GENRATED WHILE UPDATING CUISINE', error);
      throw error;
    });
}

// 4:- Read cuisine By Id
export const id = Joi.string()
  .guid({version: ['uuidv4', 'uuidv5']})
  .required();
/**
 * Read a cuisine by id from the database
 * @param {string} id - string
 * @returns An array of Cuisine objects.
 */
export function readCusineById(id: string) {
  const metricsLabels = {
    operation: 'readCuisineById',
  };
  const timer = databaseResponseTimeHistogram.startTimer();
  logger.debug('reading cuisine by id', id);
  return DB.read(constants.TableName)
    .where({is_deleted: false, id: id})
    .select([
      constants.ColumnNames.id,
      constants.ColumnNames.name,
      constants.ColumnNames.status,
      constants.ColumnNames.image,
    ])
    .then((cuisine: ICuisine[]) => {
      timer({...metricsLabels, success: 'true'});
      logger.debug('successfully fetched cuisine by id', cuisine);
      return cuisine;
    })
    .catch((error: Error) => {
      timer({...metricsLabels, success: 'false'});
      logger.debug('ERROR GENRATED WHILE FETCHING CUISINE BY ID', error);
      throw error;
    });
}

export async function readActiveCusineByIds(ids: string[]) {
  logger.debug('reading cuisine by ids', ids);
  try {
    const cuisine = await DB.read(constants.TableName)
      .where({is_deleted: false, status: constants.StatusNames.active})
      .whereIn(constants.ColumnNames.id, ids)
      .select([
        constants.ColumnNames.id,
        constants.ColumnNames.name,
        constants.ColumnNames.image,
      ]);
    logger.debug('successfully fetched cuisine by ids', cuisine);
    return cuisine;
  } catch (error) {
    logger.debug('ERROR GENRATED WHILE FETCHING CUISINE BY IDS', error);
    throw error;
  }
}

// 4:- Read cuisine By Id
export function readCusineByIds(ids: string[]) {
  logger.debug('reading cuisine by ids', ids);
  return DB.read(constants.TableName)
    .where({is_deleted: false})
    .whereIn(constants.ColumnNames.id, ids)
    .select([
      constants.ColumnNames.id,
      constants.ColumnNames.name,
      constants.ColumnNames.status,
    ])
    .then((cuisine: ICuisine[]) => {
      logger.debug('successfully fetched cuisine by ids', cuisine);
      return cuisine;
    })
    .catch((error: Error) => {
      logger.debug('ERROR GENRATED WHILE FETCHING CUISINE BY IDS', error);
      throw error;
    });
}

// 5:- Read All cuisine
/**
 * Read all the cuisines from the database
 * @returns An array of Cuisine objects.
 */
export function readAllCusine() {
  const metricsLabels = {
    operation: 'readAllCuisine',
  };
  const timer = databaseResponseTimeHistogram.startTimer();
  logger.debug('reading all cuisine');
  return DB.read(constants.TableName)
    .where({is_deleted: false})
    .select([
      constants.ColumnNames.id,
      constants.ColumnNames.name,
      constants.ColumnNames.status,
      constants.ColumnNames.image,
    ])
    .then((cuisine: ICuisine[]) => {
      timer({...metricsLabels, success: 'true'});
      logger.debug('successfully fetched all cuisine', cuisine);
      return cuisine;
    })
    .catch((error: Error) => {
      timer({...metricsLabels, success: 'false'});
      logger.debug('ERROR GENRATED WHILE FETCHING ALL CUISINE', error);
      throw error;
    });
}

// 6:- GET STATUS Of Cuisine
/**
 * Read the status of all active cuisines from the database
 * @returns An array of objects, each object representing a cuisine.
 */
export async function readActiveCuisines() {
  logger.debug('reading status of cuisine');
  try {
    const cuisine = await DB.read(constants.TableName)
      .where({is_deleted: false, status: constants.StatusNames.active})
      .select([
        constants.ColumnNames.id,
        constants.ColumnNames.name,
        constants.ColumnNames.status,
        constants.ColumnNames.image,
      ]);
    logger.debug('successfully fetched all cuisine by status', cuisine);
    return cuisine;
  } catch (error) {
    logger.debug('ERROR GENRATED WHILE FETCHING ALL CUISINE BY STATUS', error);
    throw error;
  }
}
