import {getTransaction} from '../../../data/knex';
import logger from '../../../utilities/logger/winston_logger';
import {updateOrderPayoutId} from '../../../module/food/order/models';
import {
  createPayout,
  filterPayouts,
  generateUpcomingPayout,
  getLastPayout,
  getPayoutRestaurants,
  processPayout,
  readPayoutsByStatus,
  updatePayoutStatus,
} from '../../../module/food/payout/models';
import {
  generateHtmlTableFromArray,
  sendEmail,
} from '../../../utilities/utilFuncs';
import {getDayStart} from '../../../utilities/date_time';
import moment from 'moment';
import {getPayoutAccountBalance} from '../../../internal/payout';
import {PayoutStatus} from '../../../module/food/payout/enums';
import {IPayout} from '../../../module/food/payout/types';
import {Service} from '../../../enum';
import Globals from '../../../utilities/global_var/globals';

/**
 * This Function will process all new payout for all eligible restaurants
 * payout will be done syncronusly for a restaurant
 * after processing payout is complete payout status will be verified from cash free
 * and db will be upadted with status.
 */
export async function processPayouts() {
  const payout_restaurants = await getPayoutRestaurants();
  const payout_generated_on = moment().format('dddd, MMMM Do YYYY, h:mm:ss a');

  for (let rest_cntr = 0; rest_cntr < payout_restaurants.length; rest_cntr++) {
    const payout_restaurant = payout_restaurants[rest_cntr];
    if (
      payout_restaurant.account &&
      payout_restaurant.account.beneficiary_details
    ) {
      const last_payout = await getLastPayout(payout_restaurant.id);
      let start_timestamp = getDayStart(payout_restaurant.created_at);
      if (last_payout) {
        start_timestamp = last_payout.end_time;
      }
      logger.debug('payout_restaurant.id', payout_restaurant.id);
      logger.debug('payout start_timestamp: ', start_timestamp);
      logger.debug(
        'PROCESS_PAYOUT_INTERVAL_BUFFER_IN_DAYS: ',
        process.env.PROCESS_PAYOUT_INTERVAL_BUFFER_IN_DAYS!
      );
      let end_timestamp = moment()
        .subtract(+process.env.PROCESS_PAYOUT_INTERVAL_BUFFER_IN_DAYS!, 'days')
        .toDate();
      if (end_timestamp < start_timestamp) {
        end_timestamp = moment().toDate();
      }
      logger.debug('payout end_timestamp', end_timestamp);
      const {payout, payout_orders} = await generateUpcomingPayout(
        payout_restaurant.id,
        start_timestamp,
        end_timestamp
      );

      if (payout.amount_paid_to_vendor > 0) {
        payout.payout_details = {
          restaurant: {
            id: payout_restaurant.id,
            name: payout_restaurant.name,
          },
          account: payout_restaurant.account,
        };
        const payout_order_ids: number[] = payout_orders.map(order => {
          return order.id!;
        });

        const trx = await getTransaction();
        await createPayout(trx, payout);
        await updateOrderPayoutId(trx, payout_order_ids, payout.id);
        await trx.commit();
      }
    } else {
      logger.debug('No beneficiary_details', payout_restaurant);
    }
  }
  const pending_payouts = await readPayoutsByStatus([
    PayoutStatus.INIT,
    PayoutStatus.FAILED,
  ]);
  const account_balance_response = await getPayoutAccountBalance();
  const balance = account_balance_response.account_balance;
  logger.info('got balance ', balance);
  let available_balance =
    balance - (await Globals.CASHFREE_PAYOUT_MIN_BALANCE.get());
  if (available_balance < 100) {
    logger.error('Out of cashfree available balance');
    await sendEmail(
      'AdminAlertEmailTemplate',
      await Globals.PAYOUT_REPORT_ADMIN_EMAIL.get(),
      {
        subject: 'Food payout cron failed ' + payout_generated_on,
        application_name: Service.FOOD_CRON,
        error_details: 'Payout Failed:  due to low balance in cashfree account',
        priority: 'high',
        time: moment().format('dddd, MMMM Do YYYY, h:mm:ss a'),
        meta_details: {'current balance': balance},
      }
    );
    throw 'Out of cashfree available balance';
  }
  const promArray: Promise<IPayout>[] = [];
  for (let i = 0; i < pending_payouts.length; i++) {
    const pending_payout = pending_payouts[i];
    if (pending_payout.amount_paid_to_vendor > available_balance) {
      logger.error(
        'payout failed due to low balance in payout account',
        pending_payout
      );
      await sendEmail(
        'AdminAlertEmailTemplate',
        await Globals.PAYOUT_REPORT_ADMIN_EMAIL.get(),
        {
          subject: 'Food Payout cron failed',
          application_name: Service.FOOD_CRON,
          error_details:
            'Payout Failed: Due to low balance in cashfree account',
          priority: 'high',
          time: moment().format('dddd, MMMM Do YYYY, h:mm:ss a'),
          meta_details: {
            'current balance': available_balance,
            'failed payout': pending_payout,
          },
        }
      );
    } else {
      // logger.debug('adding promis' + pending_payout.id, pending_payout);
      available_balance -= pending_payout.amount_paid_to_vendor;
      const promis = processPayout(pending_payout);
      promArray.push(promis);
    }
  }
  // eslint-disable-next-line node/no-unsupported-features/es-builtins
  const result = await Promise.allSettled(promArray);
  const payout_report: {
    status: string;
    payout_id: string;
    restaurant_id?: string;
    restaurant_name?: string;
    amount?: number;
    payout_interval?: string;
    last_payout_interval?: string;
  }[] = [];
  for (let i = 0; i < result.length; i++) {
    if (result[i].status === 'fulfilled') {
      const payout = (<PromiseFulfilledResult<IPayout>>result[i]).value;
      const filtered_paypouts = await filterPayouts([payout.restaurant_id], {
        filter: {
          end_date: payout.start_time,
        },
        sort_by: {
          column: 'created_at',
          direction: 'asc',
        },
      });
      let last_payout_interval;
      if (filtered_paypouts.total_records > 0) {
        last_payout_interval =
          moment(filtered_paypouts.payouts[0].start_time).format('MM/DD/YYYY') +
          '-' +
          moment(filtered_paypouts.payouts[0].end_time).format('MM/DD/YYYY');
      }
      payout_report.push({
        status: payout.status,
        restaurant_id: payout.restaurant_id,
        restaurant_name: payout.payout_details?.restaurant?.name,
        payout_id: payout.id,
        amount: payout.amount_paid_to_vendor,
        payout_interval:
          moment(payout.start_time).format('MM/DD/YYYY') +
          '-' +
          moment(payout.end_time).format('MM/DD/YYYY'),
        last_payout_interval: last_payout_interval,
      });
    }
    if (result[i].status === 'rejected') {
      const reason = (<PromiseRejectedResult>result[i]).reason;
      payout_report.push({
        status: 'Server Error',
        payout_id: reason,
      });
    }
  }
  const formatted_pyout_reports: object[] = [];
  payout_report.forEach(payout => {
    formatted_pyout_reports.push({
      'Payout ID': payout.payout_id,
      Status: payout.status,
      Amount: payout.amount,
      'Restaurant ID': payout.restaurant_id,
      'Restaurant Name': payout.restaurant_name,
      'Payout Interval': payout.payout_interval,
      'Last Payout Interval': payout.last_payout_interval,
    });
  });

  await sendEmail(
    'PayoutTemplate',
    await Globals.PAYOUT_REPORT_ADMIN_EMAIL.get(),
    {
      subject: 'Food payout report ' + payout_generated_on,
      date_and_time: payout_generated_on + '',
      table: generateHtmlTableFromArray(
        [
          'Payout ID',
          'Status',
          'Amount',
          'Restaurant ID',
          'Restaurant Name',
          'Payout Interval',
          'Last Payout Interval',
        ],
        formatted_pyout_reports
      ),
    }
  );
  logger.debug('payout_report', payout_report);
}

export async function confirmPendingPayout() {
  const pending_payouts = await readPayoutsByStatus([PayoutStatus.PENDING]);
  const promArray: Promise<IPayout>[] = [];
  for (let i = 0; i < pending_payouts.length; i++) {
    const pending_payout = pending_payouts[i];
    const promis = updatePayoutStatus(pending_payout);
    promArray.push(promis);
  }
  // eslint-disable-next-line node/no-unsupported-features/es-builtins
  const result = await Promise.allSettled(promArray);
  logger.debug('Pending Payout process result', result);
}
