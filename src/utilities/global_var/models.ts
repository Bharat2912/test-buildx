import ResponseError from '../response_error';
import logger from '../logger/winston_logger';
import {DB} from '../../data/knex';
import {GlobalVar} from './types';
import {GlobalVarAccessRole} from './enums';

export async function updateGlobalVar(
  global_var: GlobalVar
): Promise<GlobalVar> {
  global_var.updated_at = new Date();
  logger.debug('updating global variable in table', global_var);

  try {
    const updated_global_var = await DB.write('global_var')
      .where({key: global_var.key})
      .update(global_var)
      .returning('*');
    return updated_global_var[0];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.code === '23505') {
      throw new ResponseError(400, global_var.key + ' already exist');
    }
    throw error;
  }
}

export async function readGlobalVarByKey(key: string): Promise<GlobalVar> {
  logger.debug('Reading global variable from table', key);
  const global_var = await DB.read('global_var').where({key: key}).select('*');
  return global_var[0];
}

export async function readAllGlobalVar(): Promise<GlobalVar[]> {
  const global_var = await DB.read('global_var').select('*');
  return global_var;
}

export async function readGlobalVarByAccessRole(
  access_roles: GlobalVarAccessRole[]
): Promise<GlobalVar[]> {
  const global_var = await DB.read('global_var')
    .select(['key', 'value', 'type', 'description'])
    .whereRaw(`'{${access_roles.join()}}' && (access_roles)`); //"access_roles" has at least one element in common with the access_roles array.
  return global_var;
}
