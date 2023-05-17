import 'source-map-support/register';
import dotenv from 'dotenv';
dotenv.config();
import {connectdb} from './data/knex';
import * as secretStore from './utilities/secret/secret_store';
import logger from './utilities/logger/winston_logger';
import * as cache from './utilities/cache_manager';
import Globals from './utilities/global_var/globals';
import {wait_for} from './utilities/utilFuncs';
import {
  calculateAndSaveAllRestaurantsAvailabilityInCache,
  recalculateAndSaveRestaurantsAvailabilityInCache,
} from './module/food/restaurant/service';

async function app() {
  await secretStore.syncSecrets();
  await cache.initCache();
  await connectdb();
  await Globals.syncAll();
  logger.debug('restaurant slot worker inital setup completed');
  await calculateAndSaveAllRestaurantsAvailabilityInCache();
  logger.debug(
    'restaurant slot worker has calculated and saved availability of all restaurants in redis'
  );
  const interval = await Globals.RESTAURANT_SLOT_WORKER_INTERVAL.get();
  logger.debug('restaurant slot worker interval', interval);
  for (;;) {
    await recalculateAndSaveRestaurantsAvailabilityInCache();
    await wait_for(interval);
  }
}
app();
