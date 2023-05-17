import {v4 as uuidv4} from 'uuid';
import constants from './constants';
import Joi from 'joi';
import {DB} from '../../../data/knex';
import logger from '../../../utilities/logger/winston_logger';
import {FileObject} from '../../../utilities/s3_manager';

const cols = constants.ColumnNames;

export interface IDocument {
  id: string;
  title: string;
  doc_file?: FileObject;
  data: string;
  category: string;
  doc_type: string;
  status: string;
  created_at: Date;
  updated_at: Date;
  is_deleted: boolean;
}

const joi_id = Joi.string().guid({version: ['uuidv4', 'uuidv5']});
export const verify_file_type = Joi.valid('image', 'document');
export const id = joi_id.required();
export const verify_file = Joi.object({
  name: Joi.string().min(1).max(70).required(),
});
export const verify_category = Joi.string()
  .valid('restaurant_mou', 'gst_declaration')
  .required();

export const schema_create_document = Joi.object({
  title: Joi.string().min(1).max(250),
  category: Joi.string().required(),
  doc_type: Joi.string().valid('image', 'pdf', 'html').required(),
  doc_file: verify_file.when('doc_type', {
    is: Joi.string().valid('image', 'pdf'),
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
  data: Joi.string().when('doc_type', {
    is: Joi.string().valid('html'),
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
  status: Joi.string().min(1).max(70),
});

export const schema_update_document = Joi.object({
  id: id,
  title: Joi.string().min(1).max(70),
  category: Joi.string(),
  doc_type: Joi.string().valid('image', 'pdf', 'html'),
  doc_file: verify_file.when('doc_type', {
    is: Joi.string().valid('image', 'pdf'),
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
  data: Joi.string().when('doc_type', {
    is: Joi.string().valid('html'),
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
  status: Joi.string().min(1).max(70),
});

export function createDocument(document: IDocument): Promise<IDocument> {
  logger.debug('creating document', document);
  document.id = uuidv4();
  return DB.write(constants.TableName)
    .insert(document)
    .returning('*')
    .then((document: IDocument[]) => {
      logger.debug('successfully created document', document[0]);
      return document[0];
    })
    .catch((error: Error) => {
      logger.error('GOT ERROR WHILE CREATING DOCUMENT', error);
      throw error;
    });
}

export function updateDocument(document: IDocument): Promise<IDocument> {
  logger.debug('updating document', document);
  document.updated_at = new Date();
  return DB.write(constants.TableName)
    .update(document)
    .returning('*')
    .where({id: document.id})
    .then((document: IDocument[]) => {
      logger.debug('successfully updated document', document[0]);
      return document[0];
    })
    .catch((error: Error) => {
      logger.error('GOT ERROR WHILE UPDATING DOCUMENT', error);
      throw error;
    });
}

export function deleteDocumentById(id: string): Promise<IDocument> {
  logger.debug('deleting document by id', id);
  const document = <IDocument>{
    id: id,
    is_deleted: true,
  };
  return DB.write(constants.TableName)
    .update(document)
    .where({is_deleted: false, id: document.id})
    .returning('*')
    .then((document: IDocument[]) => {
      logger.debug('successfully deleted document', document[0]);
      return document[0];
    })
    .catch((error: Error) => {
      logger.error('GOT ERROR WHILE CREATING DOCUMENT', error);
      throw error;
    });
}

export function readDocumentById(id: string): Promise<IDocument> {
  logger.debug('reading document by id', id);
  return DB.read(constants.TableName)
    .where({is_deleted: false, id: id})
    .select([
      cols.id,
      cols.title,
      cols.doc_file,
      cols.doc_type,
      cols.category,
      cols.data,
      cols.status,
    ])
    .then((document: IDocument[]) => {
      logger.debug('fetched document by id', document);
      return document[0];
    })
    .catch((error: Error) => {
      logger.error('GOT ERROR WHILE FETCHING DOCUMENT BY ID', error);
      throw error;
    });
}
export function readDocumentByCategory(category: string): Promise<IDocument> {
  logger.debug('reading document by category', category);
  return DB.read(constants.TableName)
    .where({is_deleted: false, category: category})
    .select([
      cols.id,
      cols.title,
      cols.doc_file,
      cols.doc_type,
      cols.category,
      cols.data,
      cols.status,
    ])
    .then((document: IDocument[]) => {
      logger.debug('successfully fetched document by category', document[0]);
      return document[0];
    })
    .catch((error: Error) => {
      logger.error('GOT ERROR WHILE CREATING DOCUMENT', error);
      throw error;
    });
}
export function readAllDocument(): Promise<IDocument[]> {
  logger.debug('reading all document');
  return DB.read(constants.TableName)
    .where({is_deleted: false})
    .select([
      cols.id,
      cols.title,
      cols.doc_file,
      cols.doc_type,
      cols.category,
      cols.data,
      cols.status,
    ])
    .then((document: IDocument[]) => {
      logger.debug('fetched all document successfully', document);
      return document;
    })
    .catch((error: Error) => {
      logger.error('GOT ERROR WHILE FETCHING ALL DOCUMENT', error);
      throw error;
    });
}

export function readAllActiveDocument(): Promise<IDocument[]> {
  logger.debug('reading all active document', constants.StatusNames.active);
  return DB.read(constants.TableName)
    .where({is_deleted: false, status: constants.StatusNames.active})
    .select([
      cols.id,
      cols.title,
      cols.doc_file,
      cols.doc_type,
      cols.category,
      cols.data,
    ])
    .then((document: IDocument[]) => {
      logger.debug('fetched  all active document successfully', document);
      return document;
    })
    .catch((error: Error) => {
      logger.error('GOT ERROR WHILE FETCHING ACTIVE DOCUMENT', error);
      throw error;
    });
}
