import {Request, Response} from 'express';
import handleErrors from '../../../utilities/controllers/handle_errors';
import {
  sendError,
  sendSuccess,
} from '../../../utilities/controllers/handle_response';
import logger from '../../../utilities/logger/winston_logger';
import {
  activateSubscriptionAtCashFree,
  cancelSubscriptionAtCashFree,
  createPlanAtCashFree,
  createSubscriptionAtCashFree,
  getSubscriptionDetailsFromCashFree,
  getSubscriptionPaymentsFromCashFree,
  getSubscriptionSinglePaymentFromCashFree,
  retrySubscriptionPaymentAtCashFree,
} from './cashfree/services';
import {
  IActivateSubscription,
  ICreatePlan,
  ICreateSubscription,
  IGetSubscriptionPayments,
  IGetSubscriptionSinglePayment,
  IRetrySubscriptionPayment,
} from './types';
import {
  external_subscription_id,
  plan_details,
  subscription_details,
  subscription_manual_activation_details,
  subscription_payments_details,
  subscription_retry_payments_details,
  subscription_single_payment_details,
} from './validations';

export async function createSubscription(req: Request, res: Response) {
  try {
    const validation = subscription_details.validate(req.body);
    if (validation.error) {
      return sendError(res, 400, validation.error.details[0].message);
    }
    const validated_req = validation.value as ICreateSubscription;
    const subscription = await createSubscriptionAtCashFree(validated_req);
    return sendSuccess(res, 200, {subscription});
  } catch (error) {
    return handleErrors(
      res,
      error,
      'FAILED WHILE CREATING SUBSCRIPTION AT EXTERNAL SERVICE'
    );
  }
}
export async function cancelSubscription(req: Request, res: Response) {
  try {
    const validation = external_subscription_id.validate(
      req.params.external_subscription_id
    );
    if (validation.error) {
      return sendError(res, 400, validation.error.details[0].message);
    }
    const validated_req = validation.value as string;
    logger.debug('cancelling subscription', validated_req);
    const subscription = await cancelSubscriptionAtCashFree(validated_req);
    return sendSuccess(
      res,
      200,
      {subscription},
      'Subscription cancelled successfully'
    );
  } catch (error) {
    return handleErrors(
      res,
      error,
      'FAILED TO CANCEL SUBSCRIPTION AT EXTERNAL SERVICE'
    );
  }
}
export async function createPlan(req: Request, res: Response) {
  try {
    const validation = plan_details.validate(req.body);
    if (validation.error) {
      return sendError(res, 400, validation.error.details[0].message);
    }
    const validated_req = validation.value as ICreatePlan;
    const plan = await createPlanAtCashFree(validated_req);
    return sendSuccess(res, 200, plan, 'Plan created successfully');
  } catch (error) {
    return handleErrors(
      res,
      error,
      'FAILED TO CREATE PLAN AT EXTERNAL SERVICE'
    );
  }
}

export async function getSubscription(req: Request, res: Response) {
  try {
    const validation = external_subscription_id.validate(
      req.params.external_subscription_id
    );
    if (validation.error) {
      return sendError(res, 400, validation.error.details[0].message);
    }
    const validated_req = validation.value as string;
    const subscription = await getSubscriptionDetailsFromCashFree(
      validated_req
    );
    return sendSuccess(res, 200, {subscription});
  } catch (error) {
    return handleErrors(
      res,
      error,
      'FAILED TO FETCH SUBSCRIPTION DETAILS FROM EXTERNAL SERVICE'
    );
  }
}

export async function getSubscriptionSinglePayment(
  req: Request,
  res: Response
) {
  try {
    const validation = subscription_single_payment_details.validate({
      external_subscription_id: req.params.external_subscription_id,
      external_payment_id: req.params.external_payment_id,
    });
    if (validation.error) {
      return sendError(res, 400, validation.error.details[0].message);
    }
    const validated_req = validation.value as IGetSubscriptionSinglePayment;
    const payments = await getSubscriptionSinglePaymentFromCashFree(
      validated_req
    );
    return sendSuccess(res, 200, {
      payments,
    });
  } catch (error) {
    return handleErrors(
      res,
      error,
      'FAILED TO FETCH SUBSCRIPTION PAYMENT DETAILS FROM EXTERNAL SERVICE'
    );
  }
}

export async function getSubscriptionPayments(req: Request, res: Response) {
  try {
    const validation = subscription_payments_details.validate({
      external_subscription_id: req.params.external_subscription_id,
      last_external_payment_id: req.query.last_external_payment_id,
      count: req.query.count,
    });
    if (validation.error) {
      return sendError(res, 400, validation.error.details[0].message);
    }
    const validated_req = validation.value as IGetSubscriptionPayments;
    const payments = await getSubscriptionPaymentsFromCashFree(validated_req);
    return sendSuccess(res, 200, {
      payments,
    });
  } catch (error) {
    return handleErrors(
      res,
      error,
      'FAILED TO FETCH SUBSCRIPTION PAYMENTS DETAILS FROM EXTERNAL SERVICE'
    );
  }
}

export async function retrySubscriptionPayment(req: Request, res: Response) {
  try {
    const validation = subscription_retry_payments_details.validate({
      external_subscription_id: req.params.external_subscription_id,
      next_payment_on: req.body.next_payment_on,
    });
    if (validation.error) {
      return sendError(res, 400, validation.error.details[0].message);
    }
    const validated_req = validation.value as IRetrySubscriptionPayment;
    const result = await retrySubscriptionPaymentAtCashFree(validated_req);
    return sendSuccess(res, 200, result);
  } catch (error) {
    return handleErrors(
      res,
      error,
      'FAILED TO RETRY SUBSCRIPTION PAYMENT AT EXTERNAL SERVICE'
    );
  }
}

export async function manualSubscriptionActivation(
  req: Request,
  res: Response
) {
  try {
    const validation = subscription_manual_activation_details.validate({
      external_subscription_id: req.params.external_subscription_id,
      next_payment_on: req.body.next_payment_on,
    });
    if (validation.error) {
      return sendError(res, 400, validation.error.details[0].message);
    }
    const validated_req = validation.value as IActivateSubscription;
    const subscription = await activateSubscriptionAtCashFree(validated_req);
    return sendSuccess(res, 200, {subscription});
  } catch (error) {
    return handleErrors(
      res,
      error,
      'FAILED TO ACTIVATE SUBSCRIPTION AT EXTERNAL SERVICE'
    );
  }
}
