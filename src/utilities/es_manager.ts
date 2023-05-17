/* eslint-disable @typescript-eslint/no-explicit-any */
import {Client} from '@elastic/elasticsearch';
import {
  MappingTypeMapping,
  QueryDslQueryContainer,
} from '@elastic/elasticsearch/lib/api/types';
import {processSQSMessageData} from '../es_models';
import logger from './logger/winston_logger';
import {sendSNSMessage, SNSMessage, SNS_URL} from './sns_manager';
import * as secretStore from './secret/secret_store';
import {IPagination} from '../module/food/restaurant/models';

// https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping-types.html
interface Document {
  id: string | number;
  [key: string]: any;
}
let client: Client;
export async function initElastic() {
  if (process.env.LOCAL_RUN || process.env.NODE_ENV === 'test') {
    client = new Client({
      node: process.env.ELASTIC_HOST,
    });
  } else {
    const config = {
      node:
        secretStore.getSecret('ELASTIC_HOST') +
        ':' +
        secretStore.getSecret('ELASTIC_PORT'),
      auth: {
        username: secretStore.getSecret('ELASTIC_USERNAME') || '',
        password: secretStore.getSecret('ELASTIC_PASSWORD') || '',
      },
    };
    client = new Client(config);
  }
}

export async function refreshIndex(index: string) {
  await client.indices.refresh({index});
}

export async function put_bulk(index: string, documents: Document[]) {
  const body = documents.flatMap(doc => [
    {index: {_index: index, _id: doc.id}},
    doc,
  ]);
  const result = await client.bulk({refresh: true, body});
  return result;
}

export async function put(index: string, id: string, document: any) {
  const result = await client.index({
    index,
    id,
    document,
  });
  return result;
}

export async function remove(index: string, id: string) {
  await client.delete({index, id});
}

export async function clearIndex(index: string) {
  try {
    await client.indices.delete({
      index: index,
    });
  } catch (error) {
    if (JSON.stringify(error).includes('index_not_found_exception')) {
      logger.debug('Index Not Found');
    } else {
      logger.error('Error Index Delete', error);
      throw 'Error Index Delete';
    }
  }
}

export async function createIndex(
  indexName: string,
  mapping: MappingTypeMapping
) {
  try {
    logger.debug('creating Index', indexName);
    if (process.env.LOCAL_RUN) await clearIndex(indexName);
    await client.indices.create({
      index: indexName,
      body: {
        mappings: mapping,
      },
    });
    logger.debug('Created Index');
  } catch (error) {
    logger.error('Error Index Create', error);
    throw 'Error Index Create';
  }
}
export async function remove_bulk(index: string, ids: string[]) {
  await client.deleteByQuery({
    index: index,
    body: {
      query: {
        bool: {
          must: [
            {
              ids: {
                values: ids,
              },
            },
          ],
        },
      },
    },
  });
}

export async function query<T>(
  index: string,
  query: QueryDslQueryContainer,
  pagination?: IPagination
): Promise<T[]> {
  if (!pagination) {
    pagination = {
      page_index: 0,
      page_size: 300,
    };
  }
  const Basequery = {
    index,
    size: pagination.page_size,
    from: pagination.page_size * pagination.page_index,
    query,
  };
  logger.debug('ES Query search', Basequery);

  const response = await client.search<T>(Basequery);
  const result: T[] = [];
  response.hits.hits.forEach(h => {
    if (h._source) {
      result.push(h._source);
    }
  });
  return result;
}

export async function esIndexData(message: SNSMessage) {
  try {
    logger.debug('logging', message);
    if (process.env.LOCAL_RUN) {
      processSQSMessageData(message);
    } else {
      await sendSNSMessage(SNS_URL.ELASTIC_SEARCH_WORKER, message);
    }
  } catch (error) {
    logger.error('Queue message put error', error);
    throw 'Queue message put error';
  }
}

export async function checkESIndexExists(index: string) {
  return await client.indices.exists({
    index,
  });
}
