import {createClient} from 'redis';
import logger from './logger/winston_logger';

const redis_client = createClient({
  url: `redis://${process.env.REDIS_URL}:${process.env.REDIS_PORT}/${process.env.REDIS_DB_NUM}`,
  //    redis[s]://[[username][:password]@][host][:port][/db-number]
});
class CacheStore {
  static cache = redis_client;
  static ttl: number;
  static connected = false;
}
async function redis_reconnect() {
  if (!CacheStore.connected) {
    await redis_client.connect();
    if (!CacheStore.connected) {
      throw 'Redis down';
    }
  }
}
export async function initCache(ttl?: number) {
  logger.info('Redis init');
  if (!ttl) {
    CacheStore.ttl = 180;
  } else {
    CacheStore.ttl = ttl;
  }
  try {
    redis_client.on('connect', () => {
      logger.debug('Redis connecting..');
    });
    redis_client.on('ready', () => {
      if (!CacheStore.connected) {
        logger.info('Redis ready');
        CacheStore.connected = true;
      }
    });
    redis_client.on('end', () => {
      if (CacheStore.connected) {
        logger.info('Redis closed');
        CacheStore.connected = false;
      }
    });
    redis_client.on('error', () => {
      if (CacheStore.connected) {
        CacheStore.connected = false;
        redis_client.disconnect();
      } else throw 'Redis disconnected';
    });
    redis_client.on('reconnecting', () => {
      if (CacheStore.connected) {
        logger.debug('Redis reconnecting..');
        CacheStore.connected = false;
      }
    });
    await redis_client.connect();
    try {
      const date = new Date().toTimeString();
      await set('test', date);
      const result = await get('test');
      if (result === date) {
        logger.info('Redis init success');
      }
      logger.debug('', result);
    } catch (error) {
      logger.error('Redis init error!!', error);
    }
  } catch (error) {
    logger.error('Redis connection error', error);
  }
}
export async function get(key: string) {
  await redis_reconnect();
  const value = await redis_client.get(key);
  if (value) {
    logger.debug(`Reading ${key} from cache`, value);
    const result = JSON.parse(value);
    return result;
  }
  return null;
}
export async function del(key: string) {
  await redis_reconnect();
  const value = await redis_client.del(key);
  return value;
}
export async function set(
  key: string,
  value: number | string | object,
  ttl?: number
) {
  await redis_reconnect();
  logger.debug(`Saving ${key} in cache`, JSON.stringify(value));
  if (ttl) {
    await redis_client.set(key, JSON.stringify(value), {
      EX: ttl,
    });
  } else {
    await redis_client.set(key, JSON.stringify(value));
  }
  return true;
}

export async function closeRedisConnection() {
  await redis_client.quit();
  logger.info('Redis Connection is Closed');
}

export async function flushRedisDatabase() {
  await redis_client.FLUSHDB();
  logger.info('Redis Database Flushed');
}

export default redis_client;
