import {v4 as uuidv4} from 'uuid';
import constants from './constants';
import Joi from 'joi';
import {DB} from '../../../data/knex';
import logger from '../../../utilities/logger/winston_logger';
import ResponseError from '../../../utilities/response_error';

export interface Language {
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

export const verify_create_language = Joi.object({
  name: Joi.string().min(1).max(70).required(),
  status: Joi.valid('active', 'inactive'),
});

export const verify_update_language = Joi.object({
  id: Joi.string()
    .guid({version: ['uuidv4', 'uuidv5']})
    .required(),
  name: Joi.string().min(1).max(70),
  status: Joi.valid('active', 'inactive'),
});

export function createLanguage(language: Language): Promise<Language> {
  logger.debug('creating language', language);
  language.id = uuidv4();
  logger.debug('creating');
  return DB.write(constants.TableName)
    .insert(language)
    .returning('*')
    .then((language: Language[]) => {
      logger.debug('created language successfully', language[0]);
      return language[0];
    })
    .catch((error: {code: string}) => {
      logger.debug('', error);
      if (error.code === '23505') {
        throw new ResponseError(400, language.name + ' already exists.');
      }
      logger.error('GOT ERROR WHILE CREATING LANGUAGE', error);
      throw error;
    });
}

export function updateLanguage(language: Language): Promise<Language> {
  logger.debug('updating language', language);
  language.updated_at = new Date();
  logger.debug('updating');
  return DB.write(constants.TableName)
    .update(language)
    .returning('*')
    .where({id: language.id})
    .then((language: Language[]) => {
      logger.debug('updated language successfully', language[0]);
      return language[0];
    })
    .catch((error: {code: string}) => {
      if (error.code === '23505') {
        throw new ResponseError(400, language.name + ' already exists.');
      }
      logger.error('GOT ERROR WHILE UPDATING LANGUAGE', error);
      throw error;
    });
}

export function deleteLanguageById(id: string): Promise<Language> {
  logger.debug('deleting language', id);
  const language = <Language>{
    id: id,
    is_deleted: true,
  };
  return DB.write(constants.TableName)
    .update(language)
    .where({is_deleted: false, id: id})
    .returning('*')
    .then((language: Language[]) => {
      logger.debug('successfully deleted language', language[0]);
      return language[0];
    })
    .catch((error: Error) => {
      logger.error('GOT ERROR WHILE DELETING LANGUAGE', error);
      throw error;
    });
}

export function readLanguageById(id: string): Promise<Language> {
  logger.debug('reading language by id', id);
  return DB.read(constants.TableName)
    .where({is_deleted: false, id: id})
    .select([
      constants.ColumnNames.id,
      constants.ColumnNames.name,
      constants.ColumnNames.status,
    ])
    .then((language: Language[]) => {
      logger.debug('successfully fetched language by id', language[0]);
      return language[0];
    })
    .catch((error: Error) => {
      logger.error('GOT ERROR WHILE FETCHING LANGUAGE BY ID', error);
      throw error;
    });
}

export function readAllLanguage(): Promise<Language[]> {
  logger.debug('reading all languages');
  logger.debug(constants.TableName);
  return DB.read(constants.TableName)
    .where({is_deleted: false})
    .select([
      constants.ColumnNames.id,
      constants.ColumnNames.name,
      constants.ColumnNames.status,
    ])
    .then((language: Language[]) => {
      logger.debug('fetched all languages successfully', language);
      return language;
    })
    .catch((error: Error) => {
      logger.error('GOT ERROR WHILE READING ALL LANGUAGE', error);
      throw error;
    });
}

export function readActiveLanguage(): Promise<Language[]> {
  logger.debug('Language', constants.StatusNames.active);
  return DB.read(constants.TableName)
    .where({is_deleted: false, status: constants.StatusNames.active})
    .select([constants.ColumnNames.id, constants.ColumnNames.name])
    .then((language: Language[]) => {
      logger.debug('fetched active language successfully', language);
      return language;
    })
    .catch((error: Error) => {
      logger.error('GOT ERROR WHILE FETCHING ACTIVE LANGUAGE', error);
      throw error;
    });
}
