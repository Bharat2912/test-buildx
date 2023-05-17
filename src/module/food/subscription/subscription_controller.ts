import {Request, Response} from 'express';
import handleErrors from '../../../utilities/controllers/handle_errors';
import {
  sendError,
  sendSuccess,
} from '../../../utilities/controllers/handle_response';
import {
  cancel_subscription_details,
  create_subscription_as_admin_details,
  create_subscription_as_vendor_details,
  filter_subscriptions_as_admin,
  filter_subscriptions_as_vendor,
  filter_subscription_payment_as_admin,
  filter_subscription_payment_as_vendor,
  manual_subscription_activation_as_admin_details,
  retry_subscription_payment_details,
} from './validation';
import {
  ICancelSubscription,
  ICreateSubscription,
  IFilterSubscription,
  IFilterSubscriptionPaymentAsAdmin,
} from './types';
import {
  cancelRestaurantSubscription,
  createNewSubscription,
  manuallyActivateSubscription,
  retryLastFailedSubscriptionPayment,
} from './service';
import {readRestaurantById} from '../restaurant/models';
import {
  filterSubscription,
  filterSubscriptionPayment,
  readRestaurantActiveSubscription,
} from './model';
import {SubscriptionCancelledBy} from './enum';
import logger from '../../../utilities/logger/winston_logger';
import moment from 'moment';
import {getTransaction} from '../../../data/knex';

export async function createSubscriptionAsAdmin(req: Request, res: Response) {
  try {
    const validation = create_subscription_as_admin_details.validate(req.body);
    if (validation.error) {
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 100,
        },
      ]);
    }
    const validated_req = validation.value as ICreateSubscription;
    const restaurant = await readRestaurantById(validated_req.restaurant_id!);
    if (!restaurant) {
      return sendError(res, 400, [
        {
          message: 'Invalid restaurant Id',
          code: 2009,
        },
      ]);
    }
    const trx = await getTransaction();
    try {
      const subscription = await createNewSubscription(trx, validated_req);
      await trx.commit();
      return sendSuccess(res, 200, {subscription});
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    return handleErrors(res, error, 'FAILED WHILE CREATING NEW SUBSCRIPTION');
  }
}

export async function filterSubscriptionAsAdmin(req: Request, res: Response) {
  try {
    const validation = filter_subscriptions_as_admin.validate(req.body);
    if (validation.error) {
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 100,
        },
      ]);
    }
    const validated_req = validation.value as IFilterSubscription;
    const result = await filterSubscription(validated_req);
    return sendSuccess(res, 200, result);
  } catch (error) {
    return handleErrors(
      res,
      error,
      'FAILED WHILE FILTERING SUBSCRIPTIONS AS ADMIN'
    );
  }
}

export async function filterSubscriptionAsVendor(req: Request, res: Response) {
  try {
    const validation = filter_subscriptions_as_vendor.validate(req.body);
    if (validation.error) {
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 100,
        },
      ]);
    }
    const validated_req = validation.value as IFilterSubscription;
    if (validation.value.filter) {
      validation.value.filter.restaurant_id = req.user.data.restaurant_id;
    } else {
      validation.value.filter = {
        restaurant_id: req.user.data.restaurant_id,
      };
    }
    const result = await filterSubscription(validated_req);
    return sendSuccess(res, 200, result);
  } catch (error) {
    return handleErrors(
      res,
      error,
      'FAILED WHILE FILTERING SUBSCRIPTIONS AS VENDOR'
    );
  }
}

export async function cancelSubscriptionAsAdmin(req: Request, res: Response) {
  try {
    const validation = cancel_subscription_details.validate({
      subscription_id: req.params.subscription_id,
      cancellation_reason: req.body.cancellation_reason,
    });
    if (validation.error) {
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 100,
        },
      ]);
    }
    validation.value.cancelled_by = SubscriptionCancelledBy.ADMIN;
    validation.value.cancellation_user_id = req.user.id;
    const validated_req = validation.value as ICancelSubscription;

    const subscription = await cancelRestaurantSubscription(validated_req);
    return sendSuccess(res, 200, {
      subscription,
    });
  } catch (error) {
    return handleErrors(res, error, 'FAILED TO CANCEL SUBSCRIPTION AS ADMIN');
  }
}

export async function createSubscriptionAsVendor(req: Request, res: Response) {
  try {
    const validation = create_subscription_as_vendor_details.validate(req.body);
    if (validation.error) {
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 100,
        },
      ]);
    }
    validation.value.restaurant_id = req.user.data.restaurant_id;
    const validated_req = validation.value as ICreateSubscription;
    const trx = await getTransaction();
    try {
      const subscription = await createNewSubscription(trx, validated_req);
      await trx.commit();
      return sendSuccess(res, 200, {subscription});
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    return handleErrors(
      res,
      error,
      'FAILED TO CREATE NEW SUBSCRIPTION AS VENDOR'
    );
  }
}

export async function getSubscriptionAsVendor(req: Request, res: Response) {
  try {
    const subscription = await readRestaurantActiveSubscription(
      req.user.data.restaurant_id
    );
    if (!subscription) {
      return sendError(res, 400, [
        {message: 'restaurant does not have any active subscription', code: 0},
      ]);
    }
    return sendSuccess(res, 200, {subscription});
  } catch (error) {
    return handleErrors(
      res,
      error,
      'FAILED WHILE READING RESTAURANT ACTIVE SUBSCRIPTION'
    );
  }
}

export async function cancelSubscriptionAsVendor(req: Request, res: Response) {
  try {
    const validation = cancel_subscription_details.validate({
      subscription_id: req.params.subscription_id,
      cancellation_reason: req.body.cancellation_reason,
    });
    if (validation.error) {
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 100,
        },
      ]);
    }
    validation.value.cancelled_by = SubscriptionCancelledBy.VENDOR;
    validation.value.cancellation_user_id = req.user.id;
    const validated_req = validation.value as ICancelSubscription;
    logger.debug('cancelling food subscription', validated_req);
    const subscription = await cancelRestaurantSubscription(validated_req);
    return sendSuccess(res, 200, {
      subscription,
    });
  } catch (error) {
    return handleErrors(res, error, 'FAILED TO CANCEL SUBSCRIPTION AS VENDOR');
  }
}

export async function filterSubscriptionPaymentAsAdmin(
  req: Request,
  res: Response
) {
  try {
    const validation = filter_subscription_payment_as_admin.validate(req.body);
    if (validation.error) {
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 100,
        },
      ]);
    }
    const validated_req = validation.value as IFilterSubscriptionPaymentAsAdmin;
    const result = await filterSubscriptionPayment(validated_req);
    return sendSuccess(res, 200, result);
  } catch (error) {
    return handleErrors(
      res,
      error,
      'FAILED TO FILTER SUBSCRIPTION PAYMENTS AS ADMIN'
    );
  }
}

export async function filterSubscriptionPaymentAsVendor(
  req: Request,
  res: Response
) {
  try {
    const validation = filter_subscription_payment_as_vendor.validate(req.body);
    if (validation.error) {
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 100,
        },
      ]);
    }
    if (validation.value.filter) {
      validation.value.filter.restaurant_id = req.user.data.restaurant_id;
    } else {
      validation.value.filter = {
        restaurant_id: req.user.data.restaurant_id,
      };
    }
    const validated_req = validation.value;
    const result = await filterSubscriptionPayment(validated_req);
    return sendSuccess(res, 200, result);
  } catch (error) {
    return handleErrors(
      res,
      error,
      'FAILED TO FILTER SUBSCRIPTION PAYMENTS AS VENDOR'
    );
  }
}

export async function retrySubscriptionPaymentAsVendor(
  req: Request,
  res: Response
) {
  try {
    const validation = retry_subscription_payment_details.validate({
      subscription_id: req.params.subscription_id,
      next_payment_on: req.body.next_payment_on,
    });
    if (validation.error) {
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 100,
        },
      ]);
    }
    const {subscription_id, next_payment_on} = validation.value as {
      subscription_id: string;
      next_payment_on: number;
    };
    let next_payment_on_date;
    if (next_payment_on) {
      next_payment_on_date = moment.unix(next_payment_on).toDate();
    }
    const subscription = await retryLastFailedSubscriptionPayment(
      subscription_id,
      next_payment_on_date
    );
    return sendSuccess(res, 200, {subscription});
  } catch (error) {
    return handleErrors(
      res,
      error,
      'FAILED TO RETRY SUBSCRIPTION PAYMENT AS VENDOR'
    );
  }
}

export async function retrySubscriptionPaymentAsAdmin(
  req: Request,
  res: Response
) {
  try {
    const validation = retry_subscription_payment_details.validate({
      subscription_id: req.params.subscription_id,
      next_payment_on: req.body.next_payment_on,
    });
    if (validation.error) {
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 100,
        },
      ]);
    }
    const {subscription_id, next_payment_on} = validation.value as {
      subscription_id: string;
      next_payment_on: number;
    };
    let next_payment_on_date;
    if (next_payment_on) {
      next_payment_on_date = moment.unix(next_payment_on).toDate();
    }
    const subscription = await retryLastFailedSubscriptionPayment(
      subscription_id,
      next_payment_on_date
    );
    return sendSuccess(res, 200, {subscription});
  } catch (error) {
    return handleErrors(
      res,
      error,
      'FAILED TO RETRY SUBSCRIPTION PAYMENT AS ADMIN'
    );
  }
}

export async function manualSubscriptionActivation(
  req: Request,
  res: Response
) {
  try {
    const validation = manual_subscription_activation_as_admin_details.validate(
      {
        subscription_id: req.params.subscription_id,
        next_payment_on: req.body.next_payment_on,
      }
    );
    if (validation.error) {
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 100,
        },
      ]);
    }
    const {subscription_id, next_payment_on} = validation.value as {
      subscription_id: string;
      next_payment_on: number;
    };

    let next_payment_on_date;
    if (next_payment_on) {
      next_payment_on_date = moment.unix(next_payment_on).toDate();
    }
    const result = await manuallyActivateSubscription(
      subscription_id,
      next_payment_on_date
    );
    return sendSuccess(res, 200, result);
  } catch (error) {
    return handleErrors(
      res,
      error,
      'FAILED TO MANUALLY ACTIVATE SUBSCRIPTION AS ADMIN'
    );
  }
}
