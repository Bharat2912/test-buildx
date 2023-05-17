import express from 'express';
import * as plan_controller from './plan_controller';
import * as subscription_controller from './subscription_controller';

const admin_routes = express.Router();
const vendor_routes = express.Router();

//! PLAN

//* ADMIN ROUTES
admin_routes.post('/plan/filter', plan_controller.filterPlansAsAdmin);
admin_routes.post('/plan', plan_controller.createPlanAsAdmin);
admin_routes.put('/plan/:plan_id', plan_controller.updatePlanAsAdmin);

//* VENDOR ROUTES

vendor_routes.post('/plan/filter', plan_controller.filterPlansAsVendor);

//! PLAN

//! SUBSCRIPTION

//* ADMIN ROUTES
admin_routes.post('/', subscription_controller.createSubscriptionAsAdmin);
admin_routes.post('/filter', subscription_controller.filterSubscriptionAsAdmin);
admin_routes.post(
  '/:subscription_id/cancel',
  subscription_controller.cancelSubscriptionAsAdmin
);
admin_routes.post(
  '/:subscription_id/retry_payment',
  subscription_controller.retrySubscriptionPaymentAsAdmin
);
admin_routes.post(
  '/:subscription_id/activate',
  subscription_controller.manualSubscriptionActivation
);

//* VENDOR ROUTES
vendor_routes.post('/', subscription_controller.createSubscriptionAsVendor);
vendor_routes.get('/', subscription_controller.getSubscriptionAsVendor);
vendor_routes.post(
  '/filter',
  subscription_controller.filterSubscriptionAsVendor
);
vendor_routes.post(
  '/:subscription_id/cancel',
  subscription_controller.cancelSubscriptionAsVendor
);
vendor_routes.post(
  '/:subscription_id/retry_payment',
  subscription_controller.retrySubscriptionPaymentAsVendor
);
//! SUBSCRIPTION

//! SUBSCRIPTION PAYMENTS
admin_routes.post(
  '/payment/filter',
  subscription_controller.filterSubscriptionPaymentAsAdmin
);

vendor_routes.post(
  '/payment/filter',
  subscription_controller.filterSubscriptionPaymentAsVendor
);
//! SUBSCRIPTION PAYMENTS

export default {admin_routes, vendor_routes};

//! ----------- PLAN API'S DOC------------

/**
 * @openapi
 *paths:
 *  "/food/admin/subscription/plan":
 *    post:
 *      description: "create new plan"
 *      tags:
 *      - Subscription Plan
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            description: New plan details
 *            schema:
 *              type: object
 *              properties:
 *                name:
 *                  type: string
 *                  example: "Welcome To Speedyy"
 *                type:
 *                  type: string
 *                  example: "free"
 *                category:
 *                  type: string
 *                  example: "basic"
 *                amount:
 *                  type: number
 *                  example: 0
 *                max_cycles:
 *                  type: number
 *                  example: 200
 *                interval_type:
 *                  type: string
 *                  example: "day"
 *                description:
 *                  type: string
 *                  example: "description of plan"
 *                no_of_orders:
 *                  type: number
 *                  example: 300
 *                no_of_grace_period_orders:
 *                  type: number
 *                  example: 300
 *                terms_and_conditions:
 *                  type: string
 *                  example: "terms_and_conditions"
 *      responses:
 *        '200':
 *          description: " New plan created "
 *        '400':
 *          description: " Bad Request "
 *        '401':
 *          description: " Unauthorized "
 *        '500':
 *          description: " Internal Server Error "
 */

/** POST - ADMIN -  PLAN - FILTER
 * @openapi
 *paths:
 *  "/food/admin/subscription/plan/filter":
 *    post:
 *      description: "Get plans by applied filter"
 *      tags:
 *      - Subscription Plan
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            description: Admin Auth
 *            schema:
 *              type: object
 *              properties:
 *                search_text:
 *                  type: string
 *                  example: "welcome plan"
 *                filter:
 *                  type: object
 *                  example: {
 *                           type: ["free"],
 *                           category: ["basic"],
 *                           amount: 100,
 *                           max_cycles: 200,
 *                           interval_type: ["day"],
 *                           intervals: 0,
 *                           no_of_orders: 100,
 *                           active: true,
 *                           duration: {
 *                              start_date: 1653503400,
 *                              end_date: 1654713820
 *                                      }
 *                         }
 *                pagination:
 *                  type: object
 *                  example: {
 *                           page_index: 0,
 *                           page_size: 5
 *                           }
 *                sort:
 *                  type: array
 *                  example: [{
 *                           column: "created_at",
 *                           order: "asc"
 *                           }]
 *      responses:
 *        '200':
 *          description: " plans fetched "
 *        '400':
 *          description: " Bad Request "
 *        '401':
 *          description: " Unauthorized "
 *        '500':
 *          description: " Internal Server Error "
 */

/** POST - VENDOR -  PLAN - FILTER
 * @openapi
 *paths:
 *  "/food/vendor/subscription/plan/filter":
 *    post:
 *      description: "Get plans by applied filter"
 *      tags:
 *      - Subscription Plan
 *      security:
 *      - bearerAuthVendor: []
 *      summary: "Vendor Auth"
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            description: Vendor Auth
 *            schema:
 *              type: object
 *              properties:
 *                search_text:
 *                  type: string
 *                  example: "welcome plan"
 *                filter:
 *                  type: object
 *                  example: {
 *                           type: ["free"],
 *                           category: ["basic"],
 *                           amount: 100,
 *                           max_cycles: 200,
 *                           interval_type: ["day"],
 *                           intervals: 0,
 *                           no_of_orders: 100,
 *                           duration: {
 *                              start_date: 1653503400,
 *                              end_date: 1654713820
 *                                      }
 *                         }
 *                pagination:
 *                  type: object
 *                  example: {
 *                           page_index: 0,
 *                           page_size: 5
 *                           }
 *                sort:
 *                  type: array
 *                  example: [{
 *                           column: "created_at",
 *                           order: "asc"
 *                           }]
 *      responses:
 *        '200':
 *          description: " plans fetched "
 *        '400':
 *          description: " Bad Request "
 *        '401':
 *          description: " Unauthorized "
 *        '500':
 *          description: " Internal Server Error "
 */

/**
 * @openapi
 *paths:
 *  "/food/admin/subscription/plan/{plan_id}":
 *    put:
 *      description: "update plan details"
 *      tags:
 *      - Subscription Plan
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      parameters:
 *       - in: path
 *         name: plan_id
 *         description: plan_id
 *         type: string
 *         example: GRO_PLAN_1
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            description: New plan details
 *            schema:
 *              type: object
 *              properties:
 *                name:
 *                  type: string
 *                  example: "Welcome To Speedyy"
 *                description:
 *                  type: string
 *                  example: "This is plan description"
 *                category:
 *                  type: string
 *                  example: "basic"
 *                no_of_orders:
 *                  type: number
 *                  example: 300
 *                terms_and_conditions:
 *                  type: string
 *                  example: "updated terms_and_conditions"
 *                active:
 *                  type: boolean
 *                  example: true
 *      responses:
 *        '200':
 *          description: " plan updated "
 *        '400':
 *          description: " Bad Request "
 *        '401':
 *          description: " Unauthorized "
 *        '500':
 *          description: " Internal Server Error "
 */

//! ----------- PLAN API'S ------------

//! ----------- SUBSCRIPTION API'S -------------

//! admin apis

/**
 * @openapi
 *paths:
 *  "/food/admin/subscription":
 *    post:
 *      description: "create new subscription"
 *      tags:
 *      - Subscription
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            description: New subscription details
 *            schema:
 *              type: object
 *              properties:
 *                restaurant_id:
 *                  type: string
 *                  example: "RES_98"
 *                plan_id:
 *                  type: string
 *                  example: "0415a388-f5ac-4b2c-b31d-218b82a7c99e"
 *                customer_name:
 *                  type: string
 *                  example: "Amogh Chavan"
 *                customer_email:
 *                  type: string
 *                  example: "amogh.c@speedyy.com"
 *                customer_phone:
 *                  type: string
 *                  example: "9819997648"
 *      responses:
 *        '200':
 *          description: " New subscription created "
 *        '400':
 *          description: " Bad Request "
 *        '401':
 *          description: " Unauthorized "
 *        '500':
 *          description: " Internal Server Error "
 */

/**
 * @openapi
 *paths:
 *  "/food/admin/subscription/{subscription_id}/cancel":
 *    post:
 *      description: "cancel subscription as admin"
 *      tags:
 *      - Subscription
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      parameters:
 *       - in: path
 *         name: subscription_id
 *         description: subscription_id
 *         type: string
 *         example: "RES_b06ffcb4-4782-41ce-8d10-43a7ce86cbfa"
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            description: cancel subscription
 *            schema:
 *              type: object
 *              properties:
 *                cancellation_reason:
 *                  type: string
 *                  example: "cancellation_reason"
 *      responses:
 *        '200':
 *          description: " subscription cancelled "
 *        '400':
 *          description: " Bad Request "
 *        '401':
 *          description: " Unauthorized "
 *        '500':
 *          description: " Internal Server Error "
 */

/** POST - ADMIN -  SUBSCRIPTION - FILTER
 * @openapi
 *paths:
 *  "/food/admin/subscription/filter":
 *    post:
 *      description: "Get subscriptions by applied filter"
 *      tags:
 *      - Subscription
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            description: Admin Auth
 *            schema:
 *              type: object
 *              properties:
 *                search_text:
 *                  type: string
 *                  example: "amogh"
 *                filter:
 *                  type: object
 *                  example: {
 *                           subscription_id: "01c27c0d-8bd2-411d-9b2e-9fe93518e84e",
 *                           external_subscription_id: "sub1",
 *                           plan_id: "01f1db03-4460-44f3-83a7-9a2e31796360",
 *                           restaurant_id: "0415a388-f5ac-4b2c-b31d-218b82a7c99e",
 *                           status: ["active"],
 *                           include_grace_period_subscription: true,
 *                           mode: "NPCI_SBC",
 *                           authorization_status: ['pending'],
 *                           cancelled_by: ["vendor"],
 *                           partner: ["cashfree"],
 *                           next_payment_on: 1653503400,
 *                           duration: {
 *                              start_date: 1653503400,
 *                              end_date: 1654713820
 *                                      }
 *                         }
 *                pagination:
 *                  type: object
 *                  example: {
 *                           page_index: 0,
 *                           page_size: 5
 *                           }
 *                sort:
 *                  type: array
 *                  example: [{
 *                           column: "created_at",
 *                           order: "asc"
 *                           }]
 *      responses:
 *        '200':
 *          description: " subscriptions fetched "
 *        '400':
 *          description: " Bad Request "
 *        '401':
 *          description: " Unauthorized "
 *        '500':
 *          description: " Internal Server Error "
 */

/**
 * @openapi
 *paths:
 *  "/food/admin/subscription/{subscription_id}/retry_payment":
 *    post:
 *      description: "retry last failed subscription payment"
 *      tags:
 *      - Subscription
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      parameters:
 *       - in: path
 *         name: subscription_id
 *         description: subscription_id
 *         type: string
 *         example: "RES_b06ffcb4-4782-41ce-8d10-43a7ce86cbfa"
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            description: Retry payment details
 *            schema:
 *              type: object
 *              properties:
 *                next_payment_on:
 *                  type: number
 *                  example: 1669975426
 *      responses:
 *        '200':
 *          description: " Retry request successful "
 *        '400':
 *          description: " Bad Request "
 *        '401':
 *          description: " Unauthorized "
 *        '500':
 *          description: " Internal Server Error "
 */

/**
 * @openapi
 *paths:
 *  "/food/admin/subscription/{subscription_id}/activate":
 *    post:
 *      description: "manually activate a on hold subscription"
 *      tags:
 *      - Subscription
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      parameters:
 *       - in: path
 *         name: subscription_id
 *         description: subscription_id
 *         type: string
 *         example: "RES_b06ffcb4-4782-41ce-8d10-43a7ce86cbfa"
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            description: subscription activation details
 *            schema:
 *              type: object
 *              properties:
 *                next_payment_on:
 *                  type: number
 *                  example: 1669975426
 *      responses:
 *        '200':
 *          description: " Subscription activated successfully "
 *        '400':
 *          description: " Bad Request "
 *        '401':
 *          description: " Unauthorized "
 *        '500':
 *          description: " Internal Server Error "
 */

//! subscription vendor apis

/** POST - VENDOR -  SUBSCRIPTION - FILTER
 * @openapi
 *paths:
 *  "/food/vendor/subscription/filter":
 *    post:
 *      description: "Get subscriptions by applied filter"
 *      tags:
 *      - Subscription
 *      security:
 *      - bearerAuthVendor: []
 *      summary: "Vendor Auth"
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            description: Vendor Auth
 *            schema:
 *              type: object
 *              properties:
 *                filter:
 *                  type: object
 *                  example: {
 *                           subscription_id: "01c27c0d-8bd2-411d-9b2e-9fe93518e84e",
 *                           plan_id: "01f1db03-4460-44f3-83a7-9a2e31796360",
 *                           status: ["active"],
 *                           include_grace_period_subscription: true,
 *                           mode: "NPCI_SBC",
 *                           authorization_status: ['pending']
 *                         }
 *                pagination:
 *                  type: object
 *                  example: {
 *                           page_index: 0,
 *                           page_size: 5
 *                           }
 *                sort:
 *                  type: array
 *                  example: [{
 *                           column: "created_at",
 *                           order: "asc"
 *                           }]
 *      responses:
 *        '200':
 *          description: " subscriptions fetched "
 *        '400':
 *          description: " Bad Request "
 *        '401':
 *          description: " Unauthorized "
 *        '500':
 *          description: " Internal Server Error "
 */

/**
 * @openapi
 *paths:
 *  "/food/vendor/subscription":
 *    post:
 *      description: "create new subscription"
 *      tags:
 *      - Subscription
 *      security:
 *      - bearerAuthVendor: []
 *      summary: "Vendor Auth"
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            description: New subscription details
 *            schema:
 *              type: object
 *              properties:
 *                plan_id:
 *                  type: string
 *                  example: "0415a388-f5ac-4b2c-b31d-218b82a7c99e"
 *                customer_name:
 *                  type: string
 *                  example: "Amogh Chavan"
 *                customer_email:
 *                  type: string
 *                  example: "amogh.c@speedyy.com"
 *                customer_phone:
 *                  type: string
 *                  example: "9819997648"
 *      responses:
 *        '200':
 *          description: " New subscription created "
 *        '400':
 *          description: " Bad Request "
 *        '401':
 *          description: " Unauthorized "
 *        '500':
 *          description: " Internal Server Error "
 */

/**
 * @openapi
 *paths:
 *  "/food/vendor/subscription":
 *    get:
 *      description: " get restaurant active subscription details"
 *      tags:
 *      - Subscription
 *      security:
 *      - bearerAuthVendor: []
 *      summary: "Vendor Auth"
 *      responses:
 *        '200':
 *          description: "subscriptions details fetched "
 *        '400':
 *          description: " Bad Request "
 *        '401':
 *          description: " Unauthorized "
 *        '500':
 *          description: " Internal Server Error "
 */

/**
 * @openapi
 *paths:
 *  "/food/vendor/subscription/{subscription_id}/cancel":
 *    post:
 *      description: "cancel subscription as vendor"
 *      tags:
 *      - Subscription
 *      security:
 *      - bearerAuthVendor: []
 *      summary: "Vendor Auth"
 *      parameters:
 *       - in: path
 *         name: subscription_id
 *         description: subscription_id
 *         type: string
 *         example: "RES_b06ffcb4-4782-41ce-8d10-43a7ce86cbfa"
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            description: cancel subscription
 *            schema:
 *              type: object
 *              properties:
 *                cancellation_reason:
 *                  type: string
 *                  example: "cancellation_reason"
 *      responses:
 *        '200':
 *          description: " subscription cancelled "
 *        '400':
 *          description: " Bad Request "
 *        '401':
 *          description: " Unauthorized "
 *        '500':
 *          description: " Internal Server Error "
 */

/** POST - ADMIN -  SUBSCRIPTION PAYMENT - FILTER
 * @openapi
 *paths:
 *  "/food/admin/subscription/payment/filter":
 *    post:
 *      description: "Get subscription payments by applied filter"
 *      tags:
 *      - Subscription
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            description: Admin Auth
 *            schema:
 *              type: object
 *              properties:
 *                search_text:
 *                  type: string
 *                  example: "1"
 *                filter:
 *                  type: object
 *                  example: {
 *                           restaurant_id: "01f1db03-4460-44f3-83a7-9a2e31796360",
 *                           subscription_payment_id: 1,
 *                           subscription_id: "01f1db03-4460-44f3-83a7-9a2e31796360",
 *                           external_payment_id: "01f1db03-4460-44f3-83a7-9a2e31796360",
 *                           status: ["failed"],
 *                           no_of_grace_period_orders_allotted: 100,
 *                           no_of_orders_bought: 100,
 *                           no_of_orders_consumed: 100,
 *                           cycle: 1,
 *                           currency: "INR",
 *                           amount: 100,
 *                           retry_attempts: 1,
 *                           duration: {
 *                              start_date: 1653503400,
 *                              end_date: 1654713820
 *                                      }
 *                         }
 *                pagination:
 *                  type: object
 *                  example: {
 *                           page_index: 0,
 *                           page_size: 5
 *                           }
 *                sort:
 *                  type: array
 *                  example: [{
 *                           column: "created_at",
 *                           order: "asc"
 *                           }]
 *      responses:
 *        '200':
 *          description: " subscription payments fetched "
 *        '400':
 *          description: " Bad Request "
 *        '401':
 *          description: " Unauthorized "
 *        '500':
 *          description: " Internal Server Error "
 */

/** POST - VENDOR -  SUBSCRIPTION PAYMENT - FILTER
 * @openapi
 *paths:
 *  "/food/vendor/subscription/payment/filter":
 *    post:
 *      description: "Get subscription payments by applied filter"
 *      tags:
 *      - Subscription
 *      security:
 *      - bearerAuthVendor: []
 *      summary: "Vendor Auth"
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            description: Vendor Auth
 *            schema:
 *              type: object
 *              properties:
 *                search_text:
 *                  type: string
 *                  example: "1"
 *                filter:
 *                  type: object
 *                  example: {
 *                           subscription_payment_id: 1,
 *                           subscription_id: "01f1db03-4460-44f3-83a7-9a2e31796360",
 *                           status: ["failed"],
 *                           cycle: 1,
 *                           duration: {
 *                              start_date: 1653503400,
 *                              end_date: 1654713820
 *                                      }
 *                         }
 *                pagination:
 *                  type: object
 *                  example: {
 *                           page_index: 0,
 *                           page_size: 5
 *                           }
 *                sort:
 *                  type: array
 *                  example: [{
 *                           column: "created_at",
 *                           order: "asc"
 *                           }]
 *      responses:
 *        '200':
 *          description: " subscription payments fetched "
 *        '400':
 *          description: " Bad Request "
 *        '401':
 *          description: " Unauthorized "
 *        '500':
 *          description: " Internal Server Error "
 */

/**
 * @openapi
 *paths:
 *  "/food/vendor/subscription/{subscription_id}/retry_payment":
 *    post:
 *      description: "retry last failed subscription payment"
 *      tags:
 *      - Subscription
 *      security:
 *      - bearerAuthVendor: []
 *      summary: "Vendor Auth"
 *      parameters:
 *       - in: path
 *         name: subscription_id
 *         description: subscription_id
 *         type: string
 *         example: "RES_b06ffcb4-4782-41ce-8d10-43a7ce86cbfa"
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            description: Retry payment details
 *            schema:
 *              type: object
 *              properties:
 *                next_payment_on:
 *                  type: number
 *                  example: 1669975426
 *      responses:
 *        '200':
 *          description: " Retry request successful "
 *        '400':
 *          description: " Bad Request "
 *        '401':
 *          description: " Unauthorized "
 *        '500':
 *          description: " Internal Server Error "
 */
