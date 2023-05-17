import {getTransaction} from '../../../../data/knex';
import {ISubscriptionAndSubscriptionPayment} from '../../../../utilities/sqs_manager';
import {SubscriptionPaymentStatus} from '../enum';
import {
  insertSubscriptionPayment,
  readPlan,
  readSubscription,
  readSubscriptionPaymentByExternalPaymentId,
  updateSubscriptionPayment,
} from '../model';
import {sendEmail} from '../../../../utilities/utilFuncs';
import logger from '../../../../utilities/logger/winston_logger';
import moment from 'moment';
import {ISubscriptionPayment} from '../types';

export async function processSubscriptionPaymentDeclined(
  data: ISubscriptionAndSubscriptionPayment
) {
  const trx = await getTransaction();
  try {
    const internal_subscription = await readSubscription(data.subscription.id);
    if (!internal_subscription) {
      if (process.env.NODE_ENV === 'PROD') {
        throw 'subscription not found in internal database';
      }
      logger.error('subscription not found in internal database');
      await trx.rollback();
      return;
    }
    logger.debug('internal subscription', internal_subscription);

    const existing_internal_subscription_payment =
      await readSubscriptionPaymentByExternalPaymentId(
        internal_subscription.id!,
        data.subscription_payment.external_payment_id
      );
    logger.debug(
      'existing internal subscription payment',
      existing_internal_subscription_payment
    );
    const email_template_data: {
      subscription_id: string;
      subscription_payment_id?: number;
      failure_reason: string;
    } = {
      subscription_id: internal_subscription.id!,
      failure_reason: data.subscription_payment.failure_reason,
    };
    if (existing_internal_subscription_payment) {
      const internal_subscription_payment_updates: ISubscriptionPayment = {
        currency: data.subscription_payment.currency,
        amount: data.subscription_payment.amount,
        retry_attempts: data.subscription_payment.retry_attempts,
        failure_reason: data.subscription_payment.failure_reason,
        additional_details: {
          remarks: data.subscription_payment.remarks,
        },
      };
      if (data.subscription_payment.scheduled_on) {
        internal_subscription_payment_updates.scheduled_on = moment(
          data.subscription_payment.scheduled_on
        ).toDate();
      }
      const updated_internal_subscription_payment =
        await updateSubscriptionPayment(
          trx,
          existing_internal_subscription_payment.id!,
          internal_subscription_payment_updates
        );
      email_template_data.subscription_payment_id =
        updated_internal_subscription_payment.id;
      logger.debug(
        'updated internal subscription payment',
        updated_internal_subscription_payment
      );
    } else {
      const plan = await readPlan(internal_subscription.plan_id!);
      if (!plan) {
        throw 'plan not found while processing subscription payment';
      }
      logger.debug('plan', plan);

      const create_internal_subscription_payment: ISubscriptionPayment = {
        subscription_id: internal_subscription.id,
        external_payment_id: data.subscription_payment.external_payment_id,
        no_of_grace_period_orders_allotted: plan.no_of_grace_period_orders,
        no_of_orders_bought: plan.no_of_orders,
        status: SubscriptionPaymentStatus.FAILED,
        cycle: data.subscription_payment.cycle,
        currency: data.subscription_payment.currency,
        amount: data.subscription_payment.amount,
        retry_attempts: data.subscription_payment.retry_attempts,
        additional_details: {
          remarks: data.subscription_payment.remarks,
        },
        failure_reason: data.subscription_payment.failure_reason,
      };
      if (data.subscription_payment.scheduled_on) {
        create_internal_subscription_payment.scheduled_on = moment(
          data.subscription_payment.scheduled_on
        ).toDate();
      }

      const created_internal_subscription_payment =
        await insertSubscriptionPayment(
          trx,
          create_internal_subscription_payment
        );
      email_template_data.subscription_payment_id =
        created_internal_subscription_payment.id;
      logger.debug(
        'created internal subscription payment',
        created_internal_subscription_payment
      );
    }
    await trx.commit();
    await sendEmail(
      'AdminAlertEmailTemplate',
      internal_subscription.customer_email!,
      {
        subject: 'Subscription Payment Failed',
        ...email_template_data,
      }
    );
  } catch (error) {
    await trx.rollback();
    throw error;
  }
}
