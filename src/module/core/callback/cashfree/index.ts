import express from 'express';
import {
  authenticateCashFreePayoutCallbacks,
  authenticateCashFreePaymentgatewayCallbacks,
  authenticateCashFreeSubscriptionCallbacks,
} from '../../../../utilities/jwt/authenticate';
import * as controller from './controller';

const cashfree_routes = express.Router();

cashfree_routes.post(
  '/subscription',
  authenticateCashFreeSubscriptionCallbacks,
  controller.processSubscriptionEvents
);

cashfree_routes.post(
  '/payout',
  authenticateCashFreePayoutCallbacks,
  controller.processPayoutEvents
);
cashfree_routes.post(
  '/refund',
  authenticateCashFreePaymentgatewayCallbacks,
  controller.processRefundEvents
);
cashfree_routes.post(
  '/payment',
  authenticateCashFreePaymentgatewayCallbacks,
  controller.processPaymentEvents
);

export default {cashfree_routes};

/**
 * @openapi
 *"/core/callback/cashfree/payout":
 *  post:
 *    description: "Cashfree Payout Callback "
 *    tags:
 *    - Callback
 *    requestBody:
 *      content:
 *        application/json:
 *          name: body
 *          in: body
 *          description: Send post Data
 *          schema:
 *            type: object
 *          examples:
 *            TRANSFER_REJECTED:
 *              summry: TRANSFER_REJECTED
 *              value:
 *                {
 *                    "event" : "TRANSFER_REJECTED",
 *                    "transferId" : "TransferID1",
 *                    "referenceId" : "ReferenceID1",
 *                    "reason" : "ACCOUNT_FROZEN_OR_CLOSED",
 *                    "signature" : "signature"
 *                }
 *            TRANSFER_ACKNOWLEDGED:
 *              summry: TRANSFER_ACKNOWLEDGED
 *              value:
 *                {
 *                    "event" : "TRANSFER_ACKNOWLEDGED",
 *                    "transferId" : "TransferID1",
 *                    "referenceId" : "ReferenceID1",
 *                    "acknowledged" : "acknowledged1",
 *                    "signature" : "signature"
 *                }
 *            TRANSFER_REVERSED:
 *              summry: TRANSFER_REVERSED
 *              value:
 *                {
 *                    "event" : "TRANSFER_REVERSED",
 *                    "transferId" : "TransferID1",
 *                    "referenceId" : "ReferenceID1",
 *                    "reason" : "ACCOUNT_FROZEN_OR_CLOSED",
 *                    "signature" : "signature",
 *                    "eventTime": "2021-08-18T12:55:06+05:30"
 *                }
 *            TRANSFER_FAILED:
 *              summry: TRANSFER_FAILED
 *              value:
 *                {
 *                    "event" : "TRANSFER_FAILED",
 *                    "transferId" : "TransferID1",
 *                    "referenceId" : "ReferenceID1",
 *                    "reason" : "ACCOUNT_FROZEN_OR_CLOSED",
 *                    "signature" : "signature"
 *                }
 *            TRANSFER_SUCCESS:
 *              summry: TRANSFER_SUCCESS
 *              value:
 *                {
 *                    "event" : "TRANSFER_SUCCESS",
 *                    "transferId" : "TransferID1",
 *                    "referenceId" : "ReferenceID1",
 *                    "signature" : "signature",
 *                    "eventTime": "2021-08-18T12:55:06+05:30",
 *                    "acknowledged" : "acknowledged1"
 *                }
 *            LOW_BALANCE_ALERT:
 *              summry: LOW_BALANCE_ALERT
 *              value:
 *                {
 *                    "event" : "LOW_BALANCE_ALERT",
 *                    "currentBalance" : "10.00",
 *                    "alertTime" : "2021-08-18T12:55:06+05:30",
 *                    "signature" : "signature"
 *                }
 *            CREDIT_CONFIRMATION:
 *              summry: CREDIT_CONFIRMATION
 *              value:
 *                {
 *                    "event" : "CREDIT_CONFIRMATION",
 *                    "ledgerBalance" : "10.00",
 *                    "amount" : "10.00",
 *                    "utr" : "02344858392",
 *                    "signature" : "signature"
 *                }
 *            BENEFICIARY_INCIDENT:
 *              summry: BENEFICIARY_INCIDENT
 *              value:
 *                {
 *                    "event" : "BENEFICIARY_INCIDENT",
 *                    "beneEntity" : "BANK",
 *                    "id" : "JOHN18011",
 *                    "mode" : "IMPS",
 *                    "startedAt" : "2021-08-18T12:55:06+05:30",
 *                    "status" : "ACTIVE",
 *                    "isScheduled" : "true",
 *                    "severity" : "LOW",
 *                    "entityName" : "Bank_Name",
 *                    "entityCode" : "entityCode",
 *                    "resolvedAt" : "2021-08-18T12:55:06+05:30"
 *                }
 *    responses:
 *      '200':
 *        description: OK
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/**
 * @openapi
 *"/core/callback/cashfree/refund":
 *  post:
 *    description: "Cashfree Refund Callback"
 *    tags:
 *    - Callback
 *    parameters:
 *       - in: header
 *         name: x-webhook-timestamp
 *         description: x-webhook-timestamp to verify cashfree request
 *         type: string
 *       - in: header
 *         name: x-webhook-signature
 *         description: x-webhook-signature to verify cashfree request
 *         type: string
 *    requestBody:
 *      content:
 *        application/json:
 *          name: body
 *          in: body
 *          description: Send post Data
 *          schema:
 *            type: object
 *          example:
 *                {
 *                    "event_time" : "2022-02-28T13:04:28+05:30",
 *                    "type" : "REFUND_STATUS_WEBHOOK",
 *                    "data" : {
 *                                 "order" : {
 *                                               "order_id" : "sampleorder0413",                                                 "entity" : "Refund",
 *                                               "order_amount" : 2.00,
 *                                               "order_currency": "INR",
 *                                               "order_tags" : null
 *                                            },
 *                                 "payment" : {
 *                                                 "cf_payment_id" : 1107253,
 *                                                 "payment_status" : "SUCCESS",
 *                                                 "payment_amount" : 1.00,
 *                                                 "payment_currency" : "INR",
 *                                                 "payment_message" : "Transaction pending",
 *                                                 "payment_time" : "2021-10-07T19:42:40+05:30",
 *                                                 "bank_reference" : "1903772466",
 *                                                 "auth_id" : null,
 *                                                 "payment_method" : {
 *                                                                        "card" : {
 *                                                                                     "channel" : null,
 *                                                                                     "card_number" : "470613XXXXXX2123",
 *                                                                                     "card_network" : "visa",
 *                                                                                     "card_type" : "credit_card",
 *                                                                                     "card_country" : "IN",
 *                                                                                     "card_bank_name" : "TEST Bank"
 *                                                                                 }
 *                                                                    },
 *                                                "payment_group" : "credit_card"
 *                                             },
 *                                                "customer_details" : {
 *                                                                         "customer_name" : "Yogesh",
 *                                                                         "customer_id" : "12121212",
 *                                                                         "customer_email" : "yogesh.miglani@gmail.com",
 *                                                                         "customer_phone" : "9666699999"
 *                                                                     }
 *
 *                             }
 *                }
 *    responses:
 *      '200':
 *        description: OK
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */
/**
 * @openapi
 *"/core/callback/cashfree/payment":
 *  post:
 *    description: "Cashfree Payment Callback"
 *    tags:
 *    - Callback
 *    parameters:
 *       - in: header
 *         name: x-webhook-timestamp
 *         description: x-webhook-timestamp to verify cashfree request
 *         type: string
 *       - in: header
 *         name: x-webhook-signature
 *         description: x-webhook-signature to verify cashfree request
 *         type: string
 *    requestBody:
 *      content:
 *        application/json:
 *          name: body
 *          in: body
 *          description: Send post Data
 *          schema:
 *            type: object
 *          example:
 *                {
 *                    "event_time" : "2022-02-28T13:04:28+05:30",
 *                    "type" : "REFUND_STATUS_WEBHOOK",
 *                    "data" : {
 *                                 "refund" : {
 *                                                "cf_refund_id": 11325632,
 *                                                "cf_payment_id" : 789727431,
 *                                                "refund_id" : "refund_sampleorder0413",
 *                                                "order_id" : "sampleorder0413",
 *                                                "entity" : "Refund",
 *                                                "refund_amount" : 2.00,
 *                                                "refund_currency": "INR",
 *                                                "refund_note" : "Cancelled Order",
 *                                                "refund_status" : "SUCCESS",
 *                                                "refund_type" : "MERCHANT_INITIATED",
 *                                                "refund_splits" : [
 *                                                                    {
 *                                                                       "merchantVendorId" : "merchantVendorId123",
 *                                                                       "amount" :  5.15,
 *                                                                       "percentage" : 5.15
 *                                                                     }
 *                                                                   ],
 *                                                "status_description" : "SUCCESS",
 *                                                "refund_arn" : "205907014017",
 *                                                "metadata" : null,
 *                                                "created_at" : "2022-02-28T12:54:25+05:30",
 *                                                "processed_at" : "2022-02-28T13:04:27+05:30",
 *                                                "refund_charge" : 0,
 *                                                "refund_mode" : "STANDARD"
 *
 *                                            }
 *                             }
 *                }
 *    responses:
 *      '200':
 *        description: OK
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */
