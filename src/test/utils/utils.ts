import * as secretStore from '../../utilities/secret/secret_store';
import jwt from 'jsonwebtoken';
import {
  CreateTableCommand,
  DeleteTableCommand,
  ListTablesCommand,
} from '@aws-sdk/client-dynamodb';
import {dynamoClient} from '../../utilities/dynamodb_manager';
import {connectdb, getTransaction, stopDB} from '../../data/knex';
import logger from '../../utilities/logger/winston_logger';
import {DB} from '../../data/knex';
import fs from 'fs';
import {updateOrder} from '../../module/food/order/models';
import {DeliveryStatus, OrderStatus} from '../../module/food/order/enums';
import {IOrder} from '../../module/food/order/types';
import {
  closeRedisConnection,
  flushRedisDatabase,
} from '../../utilities/cache_manager';

const knex = require('knex')({
  client: 'pg',
  connection: {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    charset: 'utf8',
  },
});

/**
 * use this function to generate fake user tokens
 */
export function signToken(entity: {}) {
  return jwt.sign(entity, secretStore.getSecret('JWT_ACCESS_PRIVATE_KEY'), {
    algorithm: 'RS256',
  });
}
export function expireToken(entity: {}) {
  return jwt.sign(entity, secretStore.getSecret('JWT_ACCESS_PRIVATE_KEY'), {
    algorithm: 'RS256',
    expiresIn: '1ms',
  });
}
async function tableExists(tableName: string) {
  const response = await dynamoClient.send(new ListTablesCommand({}));
  if (response.TableNames?.find((name: string) => name === tableName)) {
    return true;
  } else {
    return false;
  }
}

/**
 * Create dynamo tables in localstack-dynamodb. call this function in jest-beforeAll()
 */
export async function createTableDynamoDB(tableName: string) {
  const params = {
    AttributeDefinitions: [
      {
        AttributeName: 'PK',
        AttributeType: 'S',
      },
      {
        AttributeName: 'SK',
        AttributeType: 'S',
      },
    ],
    KeySchema: [
      {
        AttributeName: 'PK',
        KeyType: 'HASH',
      },
      {
        AttributeName: 'SK',
        KeyType: 'RANGE',
      },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
    TableName: tableName,
  };
  try {
    if (await tableExists(tableName)) {
      logger.debug('table already exists');
      return true;
    }
    const data = await dynamoClient.send(new CreateTableCommand(params));
    logger.info(`Dynamodb Table ${tableName} Created, Response: ${data}`);
    return data;
  } catch (error) {
    logger.info(
      `Error raised while creating table in dynamoDB error: ${error}`
    );
    throw error;
  }
}

export async function dropTableDynamoDB(table_name: string) {
  try {
    const data = await dynamoClient.send(
      new DeleteTableCommand({
        TableName: table_name,
      })
    );
    logger.debug('table deleted successfully', data);
  } catch (error) {
    logger.error('can not delete dynamodb table', error);
    throw error;
  }
}

export async function createEmptyTestDatabase() {
  try {
    await connectdb();
    logger.info(
      '-- Test Database already exists, Dropping current DB and creating new instance ---'
    );
    await knex.raw(
      `DROP DATABASE ${process.env.DB_DATABASE || 'core_test_db'}  WITH (FORCE)`
    );
    await knex.raw(
      `CREATE DATABASE ${process.env.DB_DATABASE || 'core_test_db'}`
    );
    await connectdb();
  } catch (error) {
    logger.info('-- Test Database does not exits, creating new database --');
    await knex.raw(
      `CREATE DATABASE ${process.env.DB_DATABASE || 'core_test_db'}`
    );
    await connectdb();
  }
}
export async function closeTestDBConnection() {
  await knex.destroy();
}

export async function dropTestDatabase() {
  await knex.raw(
    `DROP DATABASE ${process.env.DB_DATABASE || 'core_test_db'}  WITH (FORCE)`
  );
}

/**
 * Provide the sql file name and call this function in jest-beforeAll() to setup database
 */
export async function loadMockSeedData(sqlDumpName: string) {
  await DB.write.raw(
    fs.readFileSync(`src/test/seed/${sqlDumpName}.sql`).toString()
  );
  logger.info('~~~~MOCK DATA READY~~~~');
}

export async function loadMockSeedDataFromPath(path: string) {
  await DB.write.raw(fs.readFileSync(path).toString());
  logger.info('~~~~MOCK DATA READY~~~~');
}

export async function markOrderAsCompleted(order_id: number): Promise<IOrder> {
  const trx = await getTransaction();
  const updated_order = await updateOrder(trx, {
    id: order_id,
    order_status: OrderStatus.COMPLETED,
    delivery_status: DeliveryStatus.DELIVERED,
    vendor_accepted_time: new Date(),
    order_pickedup_time: new Date(),
    order_delivered_at: new Date(),
    delivery_details: {
      rider_id: '2598256',
      rider_name: 'Akram Pasha',
      order_status: 'DELIVERED',
      delivery_order_id: 'RES_' + 20739924,
      delivery_time: new Date(),
      rider_contact: '7483349925',
      rider_latitude: '12.896',
      client_order_id: '611',
      rider_longitude: '77.611',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
  });
  await trx.commit();
  return updated_order;
}

export async function testCasesClosingTasks() {
  //redis
  await flushRedisDatabase();
  await closeRedisConnection();

  //postgres
  await stopDB();
  await dropTestDatabase();
  await closeTestDBConnection();

  //jest
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}
