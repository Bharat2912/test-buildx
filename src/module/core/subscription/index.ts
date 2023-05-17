import express from 'express';
import * as controller from './controllers';
const internal_routes = express.Router();

internal_routes.post('/create_plan', controller.createPlan);
internal_routes.post('/create_subscription', controller.createSubscription);
internal_routes.post(
  '/cancel_subscription/:external_subscription_id',
  controller.cancelSubscription
);
internal_routes.get('/:external_subscription_id', controller.getSubscription);

internal_routes.get(
  '/:external_subscription_id/payments',
  controller.getSubscriptionPayments
);
internal_routes.get(
  '/:external_subscription_id/payment/:external_payment_id',
  controller.getSubscriptionSinglePayment
);

internal_routes.post(
  '/:external_subscription_id/retry_payment',
  controller.retrySubscriptionPayment
);

internal_routes.post(
  '/:external_subscription_id/activate',
  controller.manualSubscriptionActivation
);

export default {internal_routes};
