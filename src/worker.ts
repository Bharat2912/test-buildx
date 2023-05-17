import 'source-map-support/register';
import dotenv from 'dotenv';
dotenv.config();
import {connectdb, getTransaction} from './data/knex';
import {
  deleteSQSMessage,
  SQSIncommingMessage,
  initSQS,
  readSQSMessage,
  SQS_URL,
  SQSIncommingMessageNewOrder,
  SQSIncommingMessageGeohash,
  SQSIncommingMessageRefund,
  IUpdateOrderRefundDetails,
  IUpdateOrderPaymentDetails,
  ISubscriptionAuthStatus,
  ISubscriptionAndSubscriptionPayment,
  ISubscriptionStatus,
  IVerifySubscriptionNewPayment,
  IRecalculateTrendingRestaurantsAction,
} from './utilities/sqs_manager';
import * as secretStore from './utilities/secret/secret_store';
import logger from './utilities/logger/winston_logger';
import {Message} from '@aws-sdk/client-sqs';
import {
  readRestaurantById,
  IRestaurant,
  updateRestaurant,
} from './module/food/restaurant/models';
import {
  Polygon,
  readPolygonById,
  updatePolygonById,
} from './module/core/polygon/models';
import {
  notifyNewOrderToVendor,
  processOrderPaymentDetails,
  processOrderRefundDetails,
} from './module/food/order/service';
import {processPayoutUpdate} from './module/food/payout/service';
import {processInitiateRefund} from './module/core/payment/service';
import {processSubscriptionAuthStatus} from './module/food/subscription/worker_services/subscription_auth_failed';
import {sendEmail, wait_for} from './utilities/utilFuncs';
import {processSubscriptionStatusChange} from './module/food/subscription/worker_services/subscription_status_change';
import {processSubscriptionNewPayment} from './module/food/subscription/worker_services/subscription_new_payment';
import {processSubscriptionPaymentDeclined} from './module/food/subscription/worker_services/subscription_payment_declined';
import {subscriptionNewPayment} from './module/core/subscription/cashfree/callback_services';
import * as cache from './utilities/cache_manager';
import Globals from './utilities/global_var/globals';
import {recalculateTrendingRestaurantsForCity} from './module/food/search_click/service';

async function ProcessPolygonResult(polygon: Polygon) {
  logger.info('Updating Polygon', polygon);
  try {
    const poly = await readPolygonById(polygon.id);
    if (poly) {
      if (poly.status === 'geohashPending') {
        await updatePolygonById(polygon);
        logger.info('Updated Polygon', polygon.id);
      } else {
        throw 'Polygon state is not "geohashPending"';
      }
    } else {
      throw 'Polygon Not Found By Id';
    }
  } catch (error) {
    throw error as Error;
  }
}
async function ProcessRestaurantResult(restaurant: IRestaurant) {
  logger.info('Updating Restaurant', restaurant);
  try {
    const rest = await readRestaurantById(restaurant.id);
    if (rest && rest.name) {
      if (rest.status === 'geohashPending') {
        // await sendSQSMessage(SQS_URL.USER_WORKER, {
        //   event: 'VENDOR',
        //   action: 'LOGIN',
        //   data: {
        //     outlet_id: restaurant.id,
        //     outlet_name: rest.name,
        //   },
        // });
        const trx = await getTransaction();
        try {
          await updateRestaurant(trx, restaurant);
          await trx.commit();
        } catch (error) {
          logger.error('Failed Saving Restaurant', error);
          await trx.rollback();
          throw 'Failed Saving';
        }
        logger.info('Updated Restaurant', restaurant.id);
      } else {
        throw 'Restaurant state is not "geohashPending"';
      }
    } else {
      throw 'Restaurant Not Found By Id';
    }
  } catch (error) {
    throw error as Error;
  }
}
async function ProcessNewOrder(msg: SQSIncommingMessageNewOrder) {
  await notifyNewOrderToVendor(msg.data.order_id, msg.data.attempt);
}

async function ProcessMessage(message: Message) {
  try {
    if (message.Body && message.ReceiptHandle) {
      const msg = JSON.parse(message.Body) as SQSIncommingMessage;
      logger.debug('processing worker message', msg);
      if (msg.event) {
        if (msg.event === 'RESTAURANT') {
          const ghMsg = msg as SQSIncommingMessageGeohash;
          if (ghMsg.data.status === 'failed')
            ghMsg.data.status = 'geohashFailed';
          if (ghMsg.data.status === 'success') ghMsg.data.status = 'active';
          await ProcessRestaurantResult(ghMsg.data);
        } else if (msg.event === 'POLYGON') {
          const ghMsg = msg as SQSIncommingMessageGeohash;
          if (ghMsg.data.status === 'failed')
            ghMsg.data.status = 'geohashFailed';
          if (ghMsg.data.status === 'success') ghMsg.data.status = 'active';
          await ProcessPolygonResult(ghMsg.data);
        } else if (msg.event === 'NEW_ORDER') {
          await ProcessNewOrder(msg as SQSIncommingMessageNewOrder);
        } else if (msg.event === 'REFUND') {
          await processInitiateRefund(msg as SQSIncommingMessageRefund);
        } else if (msg.event === 'ORDER') {
          if (msg.action === 'UPDATE_REFUND_DETAILS') {
            await processOrderRefundDetails(
              msg.data as IUpdateOrderRefundDetails['data']
            );
          }
          if (msg.action === 'UPDATE_PAYMENT_DETAILS') {
            await processOrderPaymentDetails(
              msg.data as IUpdateOrderPaymentDetails['data']
            );
          }
        } else if (msg.event === 'PAYOUT' && msg.action === 'UPDATE') {
          await processPayoutUpdate(msg.data);
        } else if (
          msg.event === 'TRENDING_RESTAURANTS' &&
          msg.action === 'RECALCULATE'
        ) {
          const {city_id} =
            msg.data as IRecalculateTrendingRestaurantsAction['data'];
          await recalculateTrendingRestaurantsForCity(city_id);
        } else if (msg.event === 'SUBSCRIPTION') {
          if (msg.action === 'SUBSCRIPTION_AUTH_STATUS') {
            await processSubscriptionAuthStatus(
              msg.data as ISubscriptionAuthStatus
            );
          } else if (msg.action === 'SUBSCRIPTION_STATUS_CHANGE') {
            await processSubscriptionStatusChange(
              msg.data as ISubscriptionStatus
            );
          } else if (msg.action === 'VERIFY_SUBSCRIPTION_NEW_PAYMENT') {
            const {callback_data, subscription, attempt} =
              msg.data as IVerifySubscriptionNewPayment;
            await subscriptionNewPayment(callback_data, subscription, attempt);
          } else if (msg.action === 'SUBSCRIPTION_NEW_PAYMENT') {
            await processSubscriptionNewPayment(
              msg.data as ISubscriptionAndSubscriptionPayment
            );
          } else if (msg.action === 'SUBSCRIPTION_PAYMENT_DECLINED') {
            await processSubscriptionPaymentDeclined(
              msg.data as ISubscriptionAndSubscriptionPayment
            );
          } else {
            throw 'invalid subscription action';
          }
        } else {
          throw 'msg.event in core worker is invalid';
        }
        await deleteSQSMessage(SQS_URL.CORE_WORKER, message.ReceiptHandle);
      } else {
        throw 'Invalid Message Format';
      }
    } else {
      throw 'Message Body Not Found';
    }
  } catch (error) {
    await sendEmail(
      'AdminAlertEmailTemplate',
      await Globals.BACKEND_TEAM_EMAIL.get(),
      {
        subject: 'Fatal Exception in worker',
        application_name: 'core-worker',
        error_details: error,
        priority: 'high',
        time: new Date().toDateString(),
        meta_details:
          message.Body && message.ReceiptHandle ? JSON.parse(message.Body) : '',
      }
    );
    logger.error('Message Processing Error', error);
  }
}
async function ProcessMessages() {
  try {
    const messages = await readSQSMessage(SQS_URL.CORE_WORKER);
    if (messages && messages.length) {
      logger.info('Message Found:', messages.length);
      const promArray: Promise<void>[] = [];
      for (let i = 0; i < messages.length; i++) {
        promArray.push(ProcessMessage(messages[i]));
      }
      // eslint-disable-next-line node/no-unsupported-features/es-builtins
      await Promise.allSettled(promArray);
    } else {
      logger.info('No Msg from SQS');
    }
  } catch (error) {
    logger.error('Fetching Messages Error', error);
  }
}

async function app() {
  await secretStore.syncSecrets();
  await cache.initCache();
  await connectdb();
  await Globals.syncAll();
  await initSQS();

  // let sentResult = await sendSQSMessage(SQS_URL.CORE_WORKER, {
  //   event: 'RESTAURANT',
  //   action: 'GEOHASH',
  //   data: {
  //     id: '5d222e29-7032-4d77-a7a3-a188a37c6bf6',
  //     status: 'success',
  //   },
  // });
  // logger.debug('Sent Result ', sentResult);
  // sentResult = await sendSQSMessage(SQS_URL.CORE_WORKER, {
  //   event: 'RESTAURANT',
  //   action: 'GEOHASH',
  //   data: {
  //     id: '5ed46c54-8f35-4472-80ae-5808a4172add',
  //     status: 'success',
  //   },
  // });
  // logger.debug('Sent Result ', sentResult);

  await ProcessMessages();
  const intervalSeconds = +(process.env.WORKER_INTERVAL_IN_SECONDS || 10);
  logger.info('intervalSeconds', intervalSeconds);
  for (;;) {
    await ProcessMessages();
    await wait_for(intervalSeconds);
  }
}
app();
