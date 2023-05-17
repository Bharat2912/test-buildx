import {getTransaction} from '../../../../data/knex';
import {ISubscriptionAuthStatus} from '../../../../utilities/sqs_manager';
import {SubscriptionAuthStatus} from '../enum';
import {readSubscriptionForUpdate, updateSubscription} from '../model';
import {ISubscriptionAuthorizationDetails} from '../types';
import {sendEmail} from '../../../../utilities/utilFuncs';
import logger from '../../../../utilities/logger/winston_logger';

export async function processSubscriptionAuthStatus(
  data: ISubscriptionAuthStatus
) {
  const trx = await getTransaction();
  try {
    const internal_subscription = await readSubscriptionForUpdate(
      trx,
      data.subscription.id
    );
    if (!internal_subscription) {
      if (process.env.NODE_ENV === 'PROD') {
        throw 'subscription not found in internal database';
      }
      logger.error('subscription not found in internal database');
      await trx.rollback();
      return;
    }
    logger.debug('internal subscription', internal_subscription);
    const authorization_details_clone: ISubscriptionAuthorizationDetails =
      JSON.parse(JSON.stringify(internal_subscription.authorization_details));

    authorization_details_clone.authorization_failure_reason =
      data.subscription_authorization_details.authorization_failure_reason;
    authorization_details_clone.checkout_initiated_time =
      data.subscription_authorization_details.checkout_initiated_time + '';

    const updated_internal_subscription = await updateSubscription(
      trx,
      data.subscription.id,
      {
        authorization_status: SubscriptionAuthStatus.FAILED,
        authorization_details: authorization_details_clone,
      }
    );
    logger.debug(
      'updated internal subscription',
      updated_internal_subscription
    );

    await trx.commit();
    await sendEmail(
      'SubscriptionAuthorizationFailed',
      internal_subscription.customer_email!,
      {
        subject: 'Subscription Authorization Failed',
        subscription_id: internal_subscription.id,
        authorization_link:
          internal_subscription.authorization_details?.authorization_link,
        authorization_failure_reason:
          data.subscription_authorization_details.authorization_failure_reason,
        authorization_attempted_at:
          data.subscription_authorization_details.checkout_initiated_time,
      }
    );
  } catch (error) {
    await trx.rollback();
    throw error;
  }
}
