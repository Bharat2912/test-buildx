import express from 'express';
import * as controller from './controller';

const internal_routes = express.Router();

internal_routes.post(
  '/create_beneficicary',
  controller.createBeneficiaryForPayout
);

internal_routes.post('/request_transfer', controller.requestPayoutTransfer);

internal_routes.post(
  '/transfer_details/:transfer_id',
  controller.getTransferDetails
);

internal_routes.get('/account_balance', controller.getPayoutAccountBalance);

export default {internal_routes};

/**
 * @openapi
 *paths:
 *  "/internal/payout/create_beneficicary":
 *    post:
 *      description: "create_beneficicary"
 *      tags:
 *      - internal
 *      summary: "Open"
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            description: Confirm Payment
 *            schema:
 *              type: object
 *              example:
 *                {
 *                }
 *      responses:
 *        '200':
 *          description: " order placed "
 *        '400':
 *          description: " Bad Request "
 */
