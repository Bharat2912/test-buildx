import constants, {StatusType} from './constants';
import Joi from 'joi';
import {DB} from '../../../data/knex';
import logger from '../../../utilities/logger/winston_logger';

const cols = constants.ColumnNames;
export interface Service {
  id: string;
  name: string;
  image_bucket?: string;
  image_path?: string;
  image_url?: string;
  sequence: number;
  status: StatusType;
  created_at: Date;
  updated_at: Date;
  is_deleted: boolean;
}

export const id = Joi.string()
  .guid({version: ['uuidv4', 'uuidv5']})
  .required();
export function readServiceById(id: string): Promise<Service> {
  logger.debug('reading service by id', id);
  return DB.read(constants.TableName)
    .where({is_deleted: false, id: id})
    .select([
      cols.id,
      cols.name,
      cols.image_bucket,
      cols.image_path,
      cols.sequence,
      cols.status,
    ])
    .then((service: Service[]) => {
      logger.debug('successfully fetched service by id', service[0]);
      return service[0];
    })
    .catch((error: Error) => {
      logger.error('ERROR GOT WHILE FETCHING SERVICE BY IDS', error);
      throw error;
    });
}

export function getServices(): Promise<Service[]> {
  logger.debug('get all services');
  return DB.read(constants.TableName)
    .where({is_deleted: false})
    .select([
      cols.id,
      cols.name,
      cols.image_bucket,
      cols.image_path,
      cols.sequence,
    ])
    .orderBy('sequence', 'asc')
    .then((service: Service[]) => {
      logger.debug('successfully returned all services', service);
      return service;
    })
    .catch((error: Error) => {
      logger.error('GOT ERROR WHILE READING ALL SERVICES', error);
      throw error;
    });
}

export const verify_update_service = Joi.object({
  id: Joi.string()
    .guid({version: ['uuidv4', 'uuidv5']})
    .required(),
  name: Joi.string().min(1).max(70),
  image_name: Joi.string().min(1).max(70),
  status: Joi.string(),
  sequence: Joi.number(),
});

export function updateService(service: Service): Promise<Service> {
  logger.debug('updating service', service);
  service.updated_at = new Date();
  return DB.write(constants.TableName)
    .update(service)
    .returning('*')
    .where({id: service.id})
    .then((service: Service[]) => {
      logger.debug('successsfully updated service', service[0]);
      return service[0];
    })
    .catch((error: Error) => {
      logger.error('ERROR GENRATED WHILE UPDATING SERVICE', error);
      throw error;
    });
}
