import express from 'express';
import * as controller from './controller';

const internal_routes = express.Router();

internal_routes.post(
  '/transaction_token',
  controller.generatePaymentTransactionToken
);
internal_routes.post('/session_id', controller.generatePaymentSessionId);
internal_routes.post('/transaction_status', controller.confirmPayment);

export default {internal_routes};
