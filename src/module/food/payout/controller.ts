import {Request, Response} from 'express';
import handleErrors from '../../../utilities/controllers/handle_errors';
import * as models from './models';
import Joi from 'joi';
import * as joi from '../../../utilities/joi_common';
import {
  sendError,
  sendSuccess,
} from '../../../utilities/controllers/handle_response';
import logger from '../../../utilities/logger/winston_logger';
import {getPayoutOrders} from '../order/models';
import {readRestaurantById} from '../restaurant/models';
import {getDayStart, toIsoFormat} from '../../../utilities/date_time';
import {IPayout, IPayoutFilter} from './types';
import {
  verify_filter_payout,
  verify_mark_complete,
  verify_summary_payout,
} from './validations';
import {PayoutStatus} from './enums';
import {downloadPayoutCsvAsAdmin} from './service';

export async function retryPayout(req: Request, res: Response) {
  try {
    const validation = joi.id.validate(req.params.id);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);

    const validated_req = validation.value;

    const payout = await models.readPayout(validated_req);
    if (!payout) return sendError(res, 404, 'Payout Not Found');
    if (payout.status === PayoutStatus.COMPLETE) {
      return sendError(res, 400, 'Payout Complete');
    }
    if (payout.status === PayoutStatus.PENDING) {
      await models.updatePayoutStatus(payout);
    }
    if (
      payout.status === PayoutStatus.FAILED ||
      payout.status === PayoutStatus.INIT
    ) {
      await models.processPayout(payout);
    }
    logger.debug('Payout', payout);
    return sendSuccess(res, 200, payout);
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function stopRetryPayout(req: Request, res: Response) {
  try {
    const validation = joi.id.validate(req.params.id);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);

    const validated_req = validation.value;

    const payout = await models.readPayout(validated_req);
    if (!payout) return sendError(res, 404, 'Payout Not Found');
    if (payout.status === 'COMPLETE') {
      return sendError(res, 400, 'Payout Complete');
    }
    if (!payout.retry) {
      return sendError(res, 400, 'Payout retry already stopped');
    }

    await models.updatePayout(<IPayout>{
      id: req.params.id,
      retry: false,
    });
    return sendSuccess(res, 200, payout);
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function markCompletePayout(req: Request, res: Response) {
  try {
    const validation = verify_mark_complete.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = validation.value;

    const payout = await models.readPayout(req.params.id);
    if (!payout) return sendError(res, 404, 'Payout Not Found');
    if (payout.status === 'COMPLETE') {
      return sendError(res, 400, 'Payout Complete');
    }

    await models.updatePayout(<IPayout>{
      id: req.params.id,
      completed_marked_admin_id: req.user.id,
      status: 'COMPLETE',
      transaction_details: validated_req.transaction_details,
      payout_completed_time: validated_req.payout_completed_time,
    });
    logger.debug('beneficiary registration failed', payout);
    return sendSuccess(res, 200, payout);
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function filterPayout(req: Request, res: Response) {
  try {
    const validation_rest_ids = Joi.array()
      .items(Joi.string())
      .validate(req.body.restaurant_ids);
    delete req.body.restaurant_ids;
    if (validation_rest_ids.error)
      return sendError(res, 400, validation_rest_ids.error.details[0].message);
    const validated_rest_ids = <string[]>validation_rest_ids.value;

    const validation = verify_filter_payout.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = <IPayoutFilter>validation.value;
    if (validated_req.filter?.amount_gt && validated_req.filter?.amount_lt) {
      if (validated_req.filter.amount_gt > validated_req.filter.amount_lt) {
        return sendError(
          res,
          400,
          'minimum amount can not be greater than maximum amount'
        );
      }
    }
    if (validated_req.filter?.start_date && validated_req.filter?.end_date) {
      if (validated_req.filter.start_date > validated_req.filter.end_date) {
        return sendError(
          res,
          400,
          'start date can not be greater than end date'
        );
      }
    }

    const payouts = await models.filterPayouts(
      validated_rest_ids,
      validated_req
    );
    if (validated_req.filter?.in_csv === true) {
      const result = await downloadPayoutCsvAsAdmin(payouts.payouts);
      res.setHeader('Content-type', 'application/octet-stream');
      res.setHeader('Content-disposition', 'attachment; filename=payouts.csv');
      return res.send(result);
    } else {
      return sendSuccess(res, 200, payouts);
    }
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function vendor_filterPayout(req: Request, res: Response) {
  try {
    const validation = verify_filter_payout.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = <IPayoutFilter>validation.value;
    if (validated_req.filter?.amount_gt && validated_req.filter?.amount_lt) {
      if (validated_req.filter.amount_gt > validated_req.filter.amount_lt) {
        return sendError(
          res,
          400,
          'minimum amount can not be greater than maximum amount'
        );
      }
    }
    if (validated_req.filter?.start_date && validated_req.filter?.end_date) {
      if (validated_req.filter.start_date > validated_req.filter.end_date) {
        return sendError(
          res,
          400,
          'start date can not be greater than end date'
        );
      }
    }

    const payouts = await models.filterPayouts(
      [req.user.data.restaurant_id],
      validated_req
    );
    return sendSuccess(res, 200, payouts);
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function vendor_payoutDetails(req: Request, res: Response) {
  try {
    const payout = await models.readPayout(req.params.id);
    if (!payout || payout.restaurant_id !== req.user.data.restaurant_id) {
      return sendError(res, 404, 'Not Found');
    }
    const payout_orders = await getPayoutOrders(payout.id);
    if (!payout.payout_details) payout.payout_details = {};
    payout.payout_details!.orders = payout_orders;
    return sendSuccess(res, 200, payout);
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function vendor_summaryPayout(req: Request, res: Response) {
  try {
    const validation = verify_summary_payout.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = validation.value;

    let end_time: Date = new Date();
    let start_time: Date | undefined = undefined;
    if (validated_req.start_date)
      start_time = new Date(validated_req.start_date);
    if (validated_req.end_date) end_time = new Date(validated_req.end_date);

    if (!validated_req.duration) validated_req.duration = 'today';
    if (!start_time) {
      start_time = getDayStart();
      if (validated_req.duration === 'today') {
        // start_time.setDate(start_time.getDate());
      }
      if (validated_req.duration === 'week') {
        start_time.setDate(start_time.getDate() - 7);
      }
      if (validated_req.duration === 'month') {
        start_time.setMonth(start_time.getMonth() - 1);
      }
      if (validated_req.duration === 'year') {
        start_time.setFullYear(start_time.getFullYear() - 1);
      }
    }
    logger.debug('start_time', start_time);
    logger.debug('end_time', end_time);
    const filter_payouts = await models.filterPayouts(
      [req.user.data.restaurant_id],
      {
        filter: {
          start_date: start_time,
          end_date: end_time,
        },
      }
    );
    logger.debug('filter payouts', filter_payouts);
    let total_paid_amount = 0;
    if (filter_payouts && filter_payouts.payouts)
      filter_payouts.payouts.map(payout => {
        total_paid_amount += payout.amount_paid_to_vendor;
      });

    let last_payout_summry: {
      start_date: string;
      end_date: string;
      amount: number;
      status: string;
      payout_date?: Date;
    } | null = null;

    const last_payout = await models.getLastPayout(req.user.data.restaurant_id);
    logger.debug('last payout', last_payout);
    if (last_payout) {
      last_payout_summry = {
        start_date: toIsoFormat(last_payout.start_time),
        end_date: toIsoFormat(last_payout.end_time),
        amount: last_payout.amount_paid_to_vendor,
        status: last_payout.status,
        payout_date: last_payout.payout_completed_time,
      };
    }

    let upcomming_payout_summary: {
      start_date: string;
      end_date: string;
      amount: number;
      payout_date: string;
    } | null = null;
    const restaurant = await readRestaurantById(req.user.data.restaurant_id);
    if (!restaurant) {
      return sendError(res, 404, [
        {
          message: 'restaurant not found',
          code: 1093,
        },
      ]);
    }
    if (!restaurant.hold_payout) {
      const end_timestamp = getDayStart();
      end_timestamp.setDate(end_timestamp.getDate() + 1);
      let start_timestamp = restaurant.created_at!;
      if (last_payout) start_timestamp = last_payout.end_time;
      const upcomming_payout_result = await models.generateUpcomingPayout(
        req.user.data.restaurant_id,
        start_timestamp,
        end_timestamp
      );
      logger.debug('upcomming payout result', upcomming_payout_result);
      if (upcomming_payout_result.payout)
        upcomming_payout_summary = {
          start_date: toIsoFormat(start_timestamp),
          end_date: toIsoFormat(end_timestamp),
          amount: upcomming_payout_result.payout.amount_paid_to_vendor,
          payout_date: toIsoFormat(end_timestamp),
        };
    }
    return sendSuccess(res, 200, {
      hold_payout: restaurant.hold_payout,
      poc_contact_number: restaurant.poc_number, //! BACKWARD COMPATIBLE
      poc_number: restaurant.poc_number,
      history: {
        start_date: toIsoFormat(start_time),
        end_date: toIsoFormat(end_time),
        amount: total_paid_amount,
      },
      last_payout: last_payout_summry,
      upcomming_payout: upcomming_payout_summary,
    });
  } catch (error) {
    return handleErrors(res, error);
  }
}
