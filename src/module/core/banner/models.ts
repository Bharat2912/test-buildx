import {v4 as uuidv4} from 'uuid';
import constants from './constants';
import Joi from 'joi';
import {DB} from '../../../data/knex';
import logger from '../../../utilities/logger/winston_logger';

const cols = constants.ColumnNames;

export interface Banner {
  id: string;
  title: string;
  image_bucket?: string;
  image_path?: string;
  banner_link: string;
  link_type: string;
  sequence: string;
  status: string;
  created_at: Date;
  updated_at: Date;
  is_deleted: boolean;
}

export const id = Joi.string()
  .guid({version: ['uuidv4', 'uuidv5']})
  .required();

// CREATE SCHEMA Banner
export const schema_create_banner = Joi.object({
  title: Joi.string().min(1).max(70).required(),
  image_name: Joi.string().min(1).max(70),
  status: Joi.string().min(1).max(70).required(),
});

// CREATE Banner
export function createBanner(banner: Banner): Promise<Banner> {
  logger.debug('creating banner', banner);
  banner.id = uuidv4();
  logger.debug('creating');
  return DB.write(constants.TableName)
    .insert(banner)
    .returning('*')
    .then((banner: Banner[]) => {
      logger.debug('banner created successfully', banner[0]);
      return banner[0];
    })
    .catch((error: Error) => {
      logger.error('GOT ERROR WHILE CREATING BANNER', error);
      throw error;
    });
}

// UPDATE SCHEMA Banner
export const schema_update_banner = Joi.object({
  id: Joi.string()
    .guid({version: ['uuidv4', 'uuidv5']})
    .required(),
  title: Joi.string().min(1).max(70).required(),
  image_name: Joi.string().min(1).max(70),
  status: Joi.string().min(1).max(70).required(),
});

// UPDATE Banner
export function updateBanner(banner: Banner): Promise<Banner> {
  logger.debug('updating banner', banner);
  banner.updated_at = new Date();
  return DB.write(constants.TableName)
    .update(banner)
    .returning('*')
    .where({id: banner.id})
    .then((banner: Banner[]) => {
      logger.debug('updated banner successfully', banner[0]);
      return banner[0];
    })
    .catch((error: Error) => {
      logger.error('GOT ERROR WHILE UPDATING BANNER', error);
      throw error;
    });
}

// DELETE Banner By Id
export function deleteBannerById(id: string): Promise<Banner> {
  logger.debug('deleting banner by id', id);
  const banner = <Banner>{
    id: id,
    is_deleted: true,
  };
  return DB.write(constants.TableName)
    .update(banner)
    .where({is_deleted: false, id: banner.id})
    .returning('*')
    .then((banner: Banner[]) => {
      logger.debug('deleted banner successfully', banner[0]);
      return banner[0];
    })
    .catch((error: Error) => {
      logger.error('GOT ERROR WHILE DELETING BANNER', error);
      throw error;
    });
}

// READ Banner By Id
export function readBannerById(id: string): Promise<Banner> {
  logger.debug('reading banner by id', id);
  return DB.read(constants.TableName)
    .where({is_deleted: false, id: id})
    .select([
      cols.id,
      cols.title,
      cols.image_bucket,
      cols.image_path,
      cols.sequence,
      cols.status,
    ])
    .then((banner: Banner[]) => {
      logger.debug('fetched banner by id successfully', banner[0]);
      return banner[0];
    })
    .catch((error: Error) => {
      logger.error('GOT ERROR WHILE FETCHING BANNER BY ID', error);
      throw error;
    });
}

// READ ALL Banner By
export function readAllBanner(): Promise<Banner[]> {
  logger.debug('reading all banner');
  return DB.read(constants.TableName)
    .where({is_deleted: false})
    .select([
      cols.id,
      cols.title,
      cols.image_bucket,
      cols.image_path,
      cols.sequence,
      cols.status,
    ])
    .then((banner: Banner[]) => {
      logger.debug('successfully fetched all banner', banner);
      return banner;
    })
    .catch((error: Error) => {
      logger.error('GOT ERROR WHILE FETCHING ALL BANNER', error);
      throw error;
    });
}

// READ All Active  Banner
export function readAllActiveBanner(): Promise<Banner[]> {
  logger.debug('reading all active banner', constants.StatusNames.active);
  return DB.read(constants.TableName)
    .where({is_deleted: false, status: constants.StatusNames.active})
    .select([
      cols.id,
      cols.title,
      cols.image_bucket,
      cols.image_path,
      cols.sequence,
      cols.status,
    ])
    .then((banner: Banner[]) => {
      logger.debug('successfully fetched all active banner', banner);
      return banner;
    })
    .catch((error: Error) => {
      logger.error('GOT ERROR WHILE FETCHING ALL ACTIVE BANNER', error);
      throw error;
    });
}
