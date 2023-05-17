import {Knex} from 'knex';
import {DB} from '../../../data/knex';
import logger from '../../../utilities/logger/winston_logger';
import {ADMIN_APPROVAL_DETAILS_SQL_QUERY, ApprovalTable} from './constants';
import {OrderByColumn, SortOrder} from './enums';
import {IAdminFilterApprovals, IApproval} from './types';

export async function bulkInsertApproval(
  trx: Knex.Transaction,
  insert_rows: IApproval[]
): Promise<IApproval[]> {
  logger.debug('bulk insert approval', insert_rows);
  return await DB.write(ApprovalTable.TableName)
    .insert(insert_rows)
    .returning('*')
    .transacting(trx)
    .then((insert_rows: IApproval[]) => {
      logger.debug('successfully bulk inserted approval', insert_rows);
      return insert_rows;
    })
    .catch((error: Error) => {
      logger.error('GOT ERROR WHILE INSERTING DATA IN APPROVAL TABLE', error);
      throw error;
    });
}

export async function bulkUpdateApproval(
  approval_ids: number[],
  update_records: IApproval,
  trx?: Knex.Transaction
): Promise<{
  total_records_affected: number;
  records: IApproval[];
}> {
  logger.debug('bulk updating approval', {approval_ids, update_records});
  const query = DB.write(ApprovalTable.TableName)
    .update(update_records)
    .returning('*')
    .whereIn('id', approval_ids);
  if (trx) {
    query.transacting(trx);
  }
  return await query
    .then((updated_approvals: IApproval[]) => {
      logger.debug('successfully bulk updated approvals', {
        total_records_affected: updated_approvals.length,
        records: updated_approvals,
      });
      return {
        total_records_affected: updated_approvals.length,
        records: updated_approvals,
      };
    })
    .catch((error: Error) => {
      logger.error(
        'ERROR WHILE UPDATING APPROVAL DETAILS IN APPROVAL TABLE',
        error
      );
      throw error;
    });
}

export async function readApprovalsWithFilter(
  params: IAdminFilterApprovals
): Promise<{
  total_records: number;
  total_pages: number;
  records: IApproval[];
}> {
  logger.debug('request for read approvals with filter', params);
  const {search_text, filter, pagination, sort} = params;

  let DBQuery = DB.read.fromRaw(ADMIN_APPROVAL_DETAILS_SQL_QUERY);

  if (filter) {
    if (filter.duration) {
      DBQuery = DBQuery.whereRaw(
        `created_at between to_timestamp(${filter.duration.start_date}) and to_timestamp(${filter.duration.end_date})`
      );
    }

    if (filter.action) {
      DBQuery = DBQuery.whereIn('action', filter.action);
    }

    if (filter.restaurant_id) {
      DBQuery = DBQuery.whereIn('restaurant_id', filter.restaurant_id);
    }

    if (filter.entity_id) {
      DBQuery = DBQuery.whereIn('entity_id', filter.entity_id);
    }

    if (filter.entity_type) {
      DBQuery = DBQuery.whereIn('entity_type', filter.entity_type);
    }

    if (filter.status) {
      DBQuery = DBQuery.whereIn('status', filter.status);
    }

    if (filter.change_requested_by) {
      DBQuery = DBQuery.whereIn(
        'change_requested_by',
        filter.change_requested_by
      );
    }

    if (filter.approved_by) {
      DBQuery = DBQuery.whereIn('approved_by', filter.approved_by);
    }
  }

  if (search_text) {
    DBQuery = DBQuery.whereRaw(
      `id::character varying(20) LIKE '${search_text.split("'").join("''")}%'`
    );
  }

  const total_records = await DBQuery.clone().count('*');

  let page_size;
  let page_index;
  if (pagination) {
    page_size = pagination.page_size;
    page_index = pagination.page_index;
  } else {
    page_size = 10;
    page_index = 0;
  }
  const offset = page_index * page_size;
  DBQuery = DBQuery.offset(offset).limit(page_size);
  const total_pages = Math.ceil(total_records[0].count / page_size);

  if (sort) {
    DBQuery = DBQuery.orderBy(sort);
  } else {
    DBQuery = DBQuery.orderBy(OrderByColumn.CREATED_AT, SortOrder.DESCENDING);
  }

  const records = await DBQuery.clone().select('*');

  logger.debug(
    'reading admin approvals with filter sql query',
    DBQuery.toSQL().toNative()
  );
  logger.debug('response of approvals with filter', {
    total_records: total_records[0].count,
    total_pages,
    records,
  });

  return {
    total_records: total_records[0].count,
    total_pages,
    records,
  };
}
