import 'source-map-support/register';
import dotenv from 'dotenv';
dotenv.config({
  path:
    process.env.NODE_ENV === 'test' ? `.env.${process.env.NODE_ENV}` : '.env',
});
import * as secretStore from './utilities/secret/secret_store';
import {connectdb, stopDB} from './data/knex';
import logger from './utilities/logger/winston_logger';
import {sendEmail} from './utilities/utilFuncs';
import {initSQS} from './utilities/sqs_manager';
import {Service} from './enum';
import {
  confirmPendingPayout,
  processPayouts,
} from './module/food/payout/cron_service';
import {
  notifySubscribersAboutSubscriptionEndDate,
  updateStaleRestaurantSubscription,
  verifySubscriptionNextPayment,
} from './module/food/subscription/cron_service';
import * as cache from './utilities/cache_manager';
import Globals from './utilities/global_var/globals';

/**
 * Cron to process payouts
 * Cron accepts argument to perform specific task
 * ie:
 *   to perform payout processing
 *     prod command > node build/cron --process_payout
 *     dev command > npm run start-cron -- --process_payout
 *   to perform payout verification / status Update
 *     prod command > node build/cron --verify_payout
 *     dev command > npm run start-cron -- --verify_payout
 *
 * To add new args add into "args" array and case in cron_task
 */
async function app() {
  const args = [
    'process_payout',
    'verify_payout',
    'notify_subscribers',
    'sync_stale_subscriptions',
    'verify_subscription_payments',
  ];
  logger.info('Executing @ ' + new Date());

  let cron_task = '';
  process.argv.forEach((val, index) => {
    if (val.toLocaleLowerCase().startsWith('--')) {
      val = val.substring(2);
      logger.info(index + ': ' + val);
      if (args.includes(val)) {
        cron_task = val;
      }
    }
  });

  await secretStore.syncSecrets();
  await cache.initCache();
  await connectdb();
  await Globals.syncAll();
  await initSQS();

  try {
    if (cron_task === 'process_payout') {
      logger.info('running process_payout cron task');
      //!
      await processPayouts();
      //!
    } else if (cron_task === 'verify_payout') {
      logger.info('running verify_payout cron task');
      //!
      await confirmPendingPayout();
      //!
    } else if (cron_task === 'notify_subscribers') {
      logger.info('running notify_subscribers cron task');
      //!
      await notifySubscribersAboutSubscriptionEndDate();
      //!
    } else if (cron_task === 'sync_stale_subscriptions') {
      logger.info('running sync_stale_subscriptions cron task');
      //!
      await updateStaleRestaurantSubscription();
      //!
    } else if (cron_task === 'verify_subscription_payments') {
      logger.info('running verify_subscription_payments cron task');
      //!
      await verifySubscriptionNextPayment();
      //!
    } else {
      logger.info(`
      Nothing to do:
      Use Agruments:
        1) process_payout :: To Process new payout
        2) verify_payout :: To update pending payout status
        3) notify_subscribers :: To notify subscribers about subscription end date
        4) sync_stale_subscriptions :: To update stale subscriptions order consumption limit
      `);
    }
  } catch (error) {
    logger.error('Food Cron Error:', error);
    await sendEmail(
      'AdminAlertEmailTemplate',
      await Globals.BACKEND_TEAM_EMAIL.get(),
      {
        subject: `Food cron failed for task ${cron_task}`,
        application_name: Service.FOOD_CRON,
        error_details: error,
        priority: 'high',
        time: new Date().toDateString(),
        meta_details: {},
      }
    );
  }

  await stopDB();
  await cache.closeRedisConnection();
}
app();
