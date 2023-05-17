import dotenv from 'dotenv';
dotenv.config();
import {connectdb} from './data/knex';
import {
  deleteSQSMessage,
  initSQS,
  readSQSMessage,
  SQSMessage,
  SQS_URL,
} from './utilities/sqs_manager';
import * as secretStore from './utilities/secret/secret_store';
import logger from './utilities/logger/winston_logger';
import {Message} from '@aws-sdk/client-sqs';
import {processSQSMessageData} from './es_models';
import {initElastic} from './utilities/es_manager';
import * as cache from './utilities/cache_manager';
import Globals from './utilities/global_var/globals';

export async function processSqsMessage(message: Message) {
  try {
    if (message.Body && message.ReceiptHandle) {
      const msg = JSON.parse(JSON.parse(message.Body).Message) as SQSMessage;
      logger.debug('', msg);
      if (msg.event) {
        await processSQSMessageData(msg);
        await deleteSQSMessage(
          SQS_URL.ELASTIC_SEARCH_WORKER,
          message.ReceiptHandle
        );
      } else {
        logger.error('Event not found');
        throw 'Event not found';
      }
    } else {
      logger.error('Message Body Not Found');
      throw 'Message Body Not Found';
    }
  } catch (error) {
    logger.error('Message Processing Error', error);
    throw 'Message Processing Error';
  }
}
async function processMessages() {
  try {
    const messages = await readSQSMessage(SQS_URL.ELASTIC_SEARCH_WORKER);
    if (messages && messages.length) {
      logger.info('Message Found:', messages.length);
      const promArray: Promise<void>[] = [];
      for (let i = 0; i < messages.length; i++) {
        promArray.push(processSqsMessage(messages[i]));
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
  await initElastic();

  await processMessages();
  const intervalSeconds = +(process.env.WORKER_INTERVAL_IN_SECONDS || 10);
  setInterval(async () => {
    await processMessages();
  }, 1000 * intervalSeconds);
}
app();
