import {Knex} from 'knex';
import {DB} from '../../../data/knex';
import logger from '../../../utilities/logger/winston_logger';
import {RefundMasterTable, REFUND_MASTER_DETAILS_SQL_QUERY} from './constants';
import {
  IOrderBy,
  IPagination,
  IRefundMaster,
  IRefundMasterFilter,
  OrderByColumn,
  SortOrder,
} from './types';

export async function bulkInsertRefundMaster(
  insertRows: IRefundMaster[]
): Promise<IRefundMaster[]> {
  return await DB.write(RefundMasterTable.TableName)
    .insert(insertRows)
    .returning('*')

    .then((refund_details: IRefundMaster[]) => {
      return refund_details;
    })
    .catch((error: Error) => {
      logger.error(
        `GOT ERROR WHILE INSERTING DATA IN REFUND MASTER TABLE: ${error}`
      );
      throw error;
    });
}

export async function updateRefundMaster(
  trx: Knex.Transaction,
  refund_id: string,
  updateRows: IRefundMaster
): Promise<IRefundMaster> {
  updateRows.updated_at = new Date();
  return await DB.write(RefundMasterTable.TableName)
    .update(updateRows)
    .returning('*')
    .where({id: refund_id})
    .transacting(trx)
    .then((refund_details: IRefundMaster[]) => {
      return refund_details[0];
    })
    .catch((error: Error) => {
      logger.error(
        `GOT ERROR WHILE UPDATING DATA IN REFUND MASTER TABLE: ${error}`
      );
      throw error;
    });
}

export async function readRefundMasterForUpdate(
  trx: Knex.Transaction,
  refund_id: string
): Promise<IRefundMaster> {
  return await DB.write
    .select('*')
    .from(RefundMasterTable.TableName)
    .where({id: refund_id})
    .forUpdate()
    .transacting(trx)
    .then((refund_details: IRefundMaster[]) => {
      return refund_details[0];
    })
    .catch((error: Error) => {
      logger.error(
        'GOT ERROR WHILE FETCHING DATA FROM REFUND MASTER TABLE',
        error
      );
      throw error;
    });
}

export async function readRefundMasterWithFilter(
  filter?: IRefundMasterFilter,
  search_text?: string,
  pagination?: IPagination,
  sort?: IOrderBy[]
): Promise<{
  total_records: number;
  total_pages: number;
  records: IRefundMaster[];
}> {
  let DBQuery = DB.read.fromRaw(REFUND_MASTER_DETAILS_SQL_QUERY);

  if (filter) {
    if (filter.service_name) {
      DBQuery = DBQuery.whereIn('service', filter.service_name);
    }
    if (filter.order_id) {
      DBQuery = DBQuery.whereIn('order_id', filter.order_id);
    }
    if (filter.payment_id) {
      DBQuery = DBQuery.whereIn('payment_id', filter.payment_id);
    }
    if (filter.refund_status) {
      DBQuery = DBQuery.whereIn('refund_status', filter.refund_status);
    }
  }

  if (search_text) {
    DBQuery = DBQuery.whereRaw(
      `id::character varying(20) LIKE '${search_text}%'`
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

  logger.debug('reading refund master', DBQuery.toSQL().toNative());

  return {
    total_records: total_records[0].count,
    total_pages,
    records,
  };
}
