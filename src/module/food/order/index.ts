import express from 'express';
import * as controller from './controller';

const customer_routes = express.Router();
const admin_routes = express.Router();
const vendor_routes = express.Router();

customer_routes.post('/place_order', controller.initPaymentPlaceOrder);

customer_routes.post('/v1.1/place_order', controller.initPaymentPlaceOrderV1_1);

customer_routes.post(
  '/confirm_payment/:payment_id',
  controller.postPaymentPlaceOrder
);
customer_routes.post('/filter', controller.filterOrdersAsCustomer);
customer_routes.get(
  '/cancellation_reason',
  controller.readCancellationReasonForCustomer
);
customer_routes.get(
  '/:order_id',
  controller.getCustomerOrderByOrderIdAsCustomer
);
customer_routes.post(
  '/:order_id/cancel',
  controller.cancelCustomerOrderByOrderId
);
customer_routes.post('/:order_id/review', controller.orderRating);

customer_routes.get(
  '/:order_id/invoice_pdf',
  controller.downloadCustomerOrderInvoicePdf
);
customer_routes.get(
  '/:order_id/order_summary_pdf',
  controller.downloadCustomerOrderSummaryPdf
);

admin_routes.post(
  '/cancellation_reason',
  controller.createCancellationReasonAsAdmin
);
admin_routes.get(
  '/cancellation_reason',
  controller.readCancellationReasonForAdmin
);
admin_routes.get(
  '/cancellation_reason/all',
  controller.readAllCancellationReasonAsAdmin
);
admin_routes.get(
  '/cancellation_reason/:id',
  controller.getCancellationReasonByIdAsAdmin
);
admin_routes.put(
  '/cancellation_reason/:id',
  controller.putCancellationReasonAsAdmin
);
admin_routes.delete(
  '/cancellation_reason/:id',
  controller.deleteCancellationReasonAsAdmin
);

admin_routes.get('/:order_id', controller.getOrderByOrderIdAsAdmin);
admin_routes.post('/filter', controller.filterOrdersAsAdmin);
admin_routes.get('/:search_key/oneview', controller.orderOneView);
admin_routes.post(
  '/:order_id/cancel',
  controller.cancelCustomerOrderByOrderIdAsAdmin
);
admin_routes.post('/:order_id/settle_refund', controller.settleRefundAsAdmin);
admin_routes.post('/:order_id/mark_for_refund', controller.markForRefund);

vendor_routes.get(
  '/cancellation_reason',
  controller.readCancellationReasonForVendor
);
vendor_routes.post('/:order_id/ready', controller.vendorOrderReady);
vendor_routes.post('/:order_id/accept', controller.vendorOrderAccept);
vendor_routes.post('/filter', controller.filterOrdersAsVendor);
vendor_routes.get('/:order_id', controller.getVendorOrderByOrderIdAsVendor);
vendor_routes.post(
  '/:order_id/cancel',
  controller.cancelCustomerOrderByOrderIdAsVendor
);

export default {
  customer_routes,
  vendor_routes,
  admin_routes,
};

/** POST - PLACE ORDER - CUSTOMER
 * @openapi
 *paths:
 *  "/food/order/place_order":
 *    post:
 *      description: " place order api "
 *      tags:
 *      - Order
 *      security:
 *      - bearerAuthCustomer: []
 *      summary: "Customer Auth"
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            description: Customer Auth
 *            schema:
 *              type: object
 *              properties:
 *                is_pod:
 *                  type: boolean
 *                  example: true
 *      responses:
 *        '200':
 *          description: " order placed "
 *        '400':
 *          description: " Bad Request "
 *        '401':
 *          description: " Unauthorized "
 *        '500':
 *          description: " Internal Server Error "
 */

/** POST - PLACE ORDER - CUSTOMER
 * @openapi
 *paths:
 *  "/food/order/v1.1/place_order":
 *    post:
 *      description: " place order api v1.1"
 *      tags:
 *      - Order
 *      security:
 *      - bearerAuthCustomer: []
 *      summary: "Customer Auth"
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            description: Customer Auth
 *            schema:
 *              type: object
 *              properties:
 *                is_pod:
 *                  type: boolean
 *                  example: true
 *      responses:
 *        '200':
 *          description: " order placed "
 *        '400':
 *          description: " Bad Request "
 *        '401':
 *          description: " Unauthorized "
 *        '500':
 *          description: " Internal Server Error "
 */

/** POST - CONFIRM PAYMENT - CUSTOMER
 * @openapi
 *paths:
 *  "/food/order/confirm_payment/{payment_id}":
 *    post:
 *      description: "confirm payment"
 *      tags:
 *      - Order
 *      security:
 *      - bearerAuthCustomer: []
 *      summary: "Customer Auth"
 *      parameters:
 *       - in: path
 *         name: payment_id
 *         description: payment id
 *         type: string
 *         example: "RES_78c17283-457d-4cb0-a117-192dba41e88e"
 *      responses:
 *        '200':
 *          description: " Payment confirmed "
 *        '400':
 *          description: " Bad Request "
 *        '401':
 *          description: " Unauthorized "
 *        '500':
 *          description: " Internal Server Error "
 */

/** POST - FILTER - CUSTOMER
 * @openapi
 *paths:
 *  "/food/order/filter":
 *    post:
 *      description: " get orders by applied filter"
 *      tags:
 *      - Order
 *      security:
 *      - bearerAuthCustomer: []
 *      summary: "Customer Auth"
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            description: Customer Auth
 *            schema:
 *              type: object
 *              properties:
 *                filter:
 *                  type: object
 *                  example: {
 *                           order_status: ["pending"],
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
 *          description: " order details fetched "
 *        '400':
 *          description: " Bad Request "
 *        '401':
 *          description: " Unauthorized "
 *        '500':
 *          description: " Internal Server Error "
 */

/** POST - CUSTOMER - CANCEL ORDER
 * @openapi
 *paths:
 *  "/food/order/{order_id}/cancel":
 *    post:
 *      description: " cancel order api "
 *      tags:
 *      - Order
 *      security:
 *      - bearerAuthCustomer: []
 *      summary: "Customer Auth"
 *      parameters:
 *       - in: path
 *         name: order_id
 *         description: order id
 *         type: number
 *         example: 1
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            description: Customer Auth
 *            schema:
 *              type: object
 *              example: {
 *                       cancellation_reason: "selected wrong delivery location",
 *                       }
 *      responses:
 *        '200':
 *          description: " order cancelled "
 *        '400':
 *          description: " Bad Request "
 *        '401':
 *          description: " Unauthorized "
 *        '500':
 *          description: " Internal Server Error "
 */

/** POST - ORDER - REVIEW
 * @openapi
 *paths:
 *  "/food/order/{order_id}/review":
 *    post:
 *      description: "Add order review with comments"
 *      tags:
 *      - Order
 *      security:
 *      - bearerAuthCustomer: []
 *      summary: "Customer Auth"
 *      parameters:
 *       - in: path
 *         name: order_id
 *         description: order id
 *         type: number
 *         example: 1
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            description: Customer Auth
 *            schema:
 *              type: object
 *              example: {
 *                       vote_type: 1,
 *                       comments: "Loved it"
 *                       }
 *      responses:
 *        '200':
 *          description: " order cancelled "
 *        '400':
 *          description: " Bad Request "
 *        '401':
 *          description: " Unauthorized "
 *        '500':
 *          description: " Internal Server Error "
 */

/** GET - ORDER DETAILS- :ID - CUSTOMER
 * @openapi
 *"/food/order/{order_id}":
 *  get:
 *    description: "Get Order details"
 *    tags:
 *    - Order
 *    security:
 *    - bearerAuthCustomer: []
 *    summary: "Customer Auth"
 *    parameters:
 *    - in: path
 *      name: order_id
 *      description: order id
 *      type: number
 *      example: 1
 *    responses:
 *      '200':
 *        description: " Successfully Got order details"
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: " Internal Server Error "
 */

/** GET - CUSTOMER - CANCELLATION REASON
 * @openapi
 *"/food/order/cancellation_reason":
 *  get:
 *    description: "Read All Reason"
 *    tags:
 *    - Order
 *    security:
 *    - bearerAuthCustomer: []
 *    summary: "Customer Auth"
 *    responses:
 *      '200':
 *        description: Successfully Recived Response For Customer
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/** POST - ADMIN - ORDER - CANCEL
 * @openapi
 *paths:
 *  "/food/admin/order/{order_id}/cancel":
 *    post:
 *      description: " cancel order api "
 *      tags:
 *      - Order
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      parameters:
 *       - in: path
 *         name: order_id
 *         description: order id
 *         type: number
 *         example: 1
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            description: Customer Auth
 *            schema:
 *              type: object
 *              example: {
 *                       cancellation_reason: "selected wrong delivery location",
 *                       }
 *      responses:
 *        '200':
 *          description: " order cancelled "
 *        '400':
 *          description: " Bad Request "
 *        '401':
 *          description: " Unauthorized "
 *        '500':
 *          description: " Internal Server Error "
 */

/** POST -ADMIN - SETTLE_REFUND
 * @openapi
 *paths:
 *  "/food/admin/order/{order_id}/settle_refund":
 *    post:
 *      description: " settle refund on a order api "
 *      tags:
 *      - Order
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      parameters:
 *       - in: path
 *         name: order_id
 *         description: order id
 *         type: number
 *         example: 1
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            schema:
 *              type: object
 *              example: {
 *                       refund_settled_vendor_payout_amount: 10,
 *                       refund_settled_delivery_charges: 60,
 *                       refund_settled_customer_amount: 105,
 *                       refund_settlement_note_to_delivery_partner: "order has not yet placed at delivery partner",
 *                       refund_settlement_note_to_vendor: "order has not yet accepted by vendor",
 *                       refund_settlement_note_to_customer : "customer selected wrong delivery location"
 *                       }
 *      responses:
 *        '200':
 *          description: " order refund settled "
 *        '400':
 *          description: " Bad Request "
 *        '401':
 *          description: " Unauthorized "
 *        '500':
 *          description: " Internal Server Error "
 */

/** POST -ADMIN - MARK_FOR_REFUND
 * @openapi
 *paths:
 *  "/food/admin/order/{order_id}/mark_for_refund":
 *    post:
 *      description: " Mark completed orders for refund "
 *      tags:
 *      - Order
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      parameters:
 *       - in: path
 *         name: order_id
 *         description: order id
 *         type: number
 *         example: 1
 *      responses:
 *        '200':
 *          description: " order marked for refund "
 *        '400':
 *          description: " Bad Request "
 *        '401':
 *          description: " Unauthorized "
 *        '500':
 *          description: " Internal Server Error "
 */

/** GET - ADMIN - ONEVIEW
 * @openapi
 *paths:
 *  "/food/admin/order/{search_key}/oneview":
 *    get:
 *      description: "order oneview api"
 *      tags:
 *      - Order
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      parameters:
 *       - in: path
 *         name: search_key
 *         description: order id
 *         type: number
 *         example: 1
 *      responses:
 *        '400':
 *          description: " Bad Request "
 *        '401':
 *          description: " Unauthorized "
 *        '500':
 *          description: " Internal Server Error "
 */

/** GET - ADMIN - ORDER DETAILS- :ID
 * @openapi
 *"/food/admin/order/{order_id}":
 *  get:
 *    description: "Get Order details"
 *    tags:
 *    - Order
 *    security:
 *    - bearerAuthAdmin: []
 *    summary: "Admin Auth"
 *    parameters:
 *    - in: path
 *      name: order_id
 *      description: order id
 *      type: number
 *      example: 1
 *    responses:
 *      '200':
 *        description: " Successfully Got order details"
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: " Internal Server Error "
 */

/** POST - ADMIN -  ORDER - FILTER
 * @openapi
 *paths:
 *  "/food/admin/order/filter":
 *    post:
 *      description: " get orders by applied filter"
 *      tags:
 *      - Order
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
 *                           restaurant_id: "f0c8c345-89c2-4d03-93c9-64805964c363",
 *                           customer_id: ["f0c8c345-89c2-4d03-93c9-64805964c464"],
 *                           order_status: ["pending"],
 *                           delivery_status: ["pending"],
 *                           order_acceptance_status: ["pending"],
 *                           refund_status: ["pending"],
 *                           payout_transaction_id: ["f0c8c345-89c2-4d03-93c9-64805964c363"],
 *                           payment_id: ["RES_c98c6a18-5853-48d9-9d30-795952199dc2"],
 *                           customer_email : ["ankita.t@speedyy.com"],
 *                           customer_phone : ["+919975543428"],
 *                           duration: {
 *                              start_date: 1653503400,
 *                              end_date: 1654713820
 *                                      },
 *                           cancelled_by: ["customer"],
 *                           in_csv: false
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
 *          description: " order details fetched "
 *        '400':
 *          description: " Bad Request "
 *        '401':
 *          description: " Unauthorized "
 *        '500':
 *          description: " Internal Server Error "
 */

/** POST - ADMIN - CANCELLATION REASON
 * @openapi
 *"/food/admin/order/cancellation_reason":
 *  post:
 *    description: "In user-type write to whom we want to show cancellation reason and then write cancellation reason"
 *    tags:
 *    - Order
 *    security:
 *    - bearerAuthAdmin: []
 *    summary: "Admin Auth"
 *    requestBody:
 *      content:
 *        application/json:
 *          name: body
 *          in: body
 *          description: Send post Data
 *          schema:
 *            type: object
 *          examples:
 *            admin:
 *              summry: admin
 *              value:
 *                {
 *                  user_type: "admin",
 *                  cancellation_reason: "Restaurant Not Accepting Order"
 *                }
 *            customer:
 *              summry: customer
 *              value:
 *                {
 *                  user_type: "customer",
 *                  cancellation_reason: "Placed Wrong Order"
 *                }
 *            vendor:
 *              summry: vendor
 *              value:
 *                {
 *                  user_type: "vendor",
 *                  cancellation_reason: "Items are Unavilable"
 *                }
 *    responses:
 *      '200':
 *        description: Successfully Created
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/** PUT - ADMIN - :ID - CANCELLATION REASON
 * @openapi
 *"/food/admin/order/cancellation_reason/{id}":
 *  put:
 *    description: "Select First Reason Is For whom And Then Write A Reason"
 *    tags:
 *    - Order
 *    security:
 *    - bearerAuthAdmin: []
 *    summary: "Admin Auth"
 *    parameters:
 *    - in: path
 *      name: id
 *      required: true
 *      schema:
 *        type: string
 *    requestBody:
 *      content:
 *        application/json:
 *          name: body
 *          in: body
 *          description: Send post Data
 *          schema:
 *            type: object
 *            properties:
 *              user_type:
 *                type: string
 *                example: "customer"
 *              cancellation_reason:
 *                type: string
 *                example: " "
 *      required: true
 *    produces:
 *      - application/json
 *    responses:
 *      '200':
 *        description: Successfully Created
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/** GET - ADMIN - CANCELLATION REASON
 * @openapi
 *"/food/admin/order/cancellation_reason":
 *  get:
 *    description: "Get Cancellation Reason Created For Admin"
 *    tags:
 *    - Order
 *    security:
 *    - bearerAuthAdmin: []
 *    summary: "Admin Auth"
 *    responses:
 *      '200':
 *        description: Successfully Recived Response For Admin
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: " Internal Server Error "
 */

/** GET - ADMIN - :ID - CANCELLATION REASON
 * @openapi
 *"/food/admin/order/cancellation_reason/{id}":
 *  get:
 *    description: "Read Reason By ID"
 *    tags:
 *    - Order
 *    security:
 *    - bearerAuthAdmin: []
 *    summary: "Admin Auth"
 *    parameters:
 *    - in: path
 *      name: id
 *      required: true
 *      schema:
 *        type: number
 *    produces:
 *      - application/json
 *    responses:
 *      '200':
 *        description: Successfully Created
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/** GET - ADMIN - ALL - CANCELLATION REASON
 * @openapi
 *"/food/admin/order/cancellation_reason/all":
 *  get:
 *    description: "Read All Cancellation Reason For All user-type"
 *    tags:
 *    - Order
 *    security:
 *    - bearerAuthAdmin: []
 *    summary: "Admin Auth"
 *    responses:
 *      '200':
 *        description: Successfully Received Response
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/** DELETE - ADMIN - :ID - CANCELLATION REASON
 * @openapi
 *"/food/admin/order/cancellation_reason/{id}":
 *  delete:
 *    description: "Delete Reason By Id"
 *    security:
 *    - bearerAuthAdmin: []
 *    summary: "Admin Auth"
 *    tags:
 *    - Order
 *    parameters:
 *    - in: path
 *      name: id
 *      required: true
 *      schema:
 *        type: string
 *    responses:
 *      '200':
 *        description: Reason is Deleted
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/** POST - VENDOR - ORDER- FILTER
 * @openapi
 *paths:
 *  "/food/vendor/order/filter":
 *    post:
 *      description: " get orders by applied filter"
 *      tags:
 *      - Order
 *      security:
 *      - bearerAuthVendor: []
 *      summary: "Vendor Auth"
 *      parameters:
 *      - name: child_outlet_id
 *        in: header
 *        description: Child Restaurant Setting
 *        type: string
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
 *                           order_status: ["cancelled"],
 *                           order_acceptance_status: ["pending"],
 *                           delivery_status: ["delivered"],
 *                           duration: {
 *                              start_date: 1653503400,
 *                              end_date: 1654713820
 *                                      },
 *                           cancelled_by: ["customer"]
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
 *          description: " order details fetched "
 *        '400':
 *          description: " Bad Request "
 *        '401':
 *          description: " Unauthorized "
 *        '500':
 *          description: " Internal Server Error "
 */

/** GET - VENDOR - ORDER DETAILS- :ID -
 * @openapi
 *"/food/vendor/order/{order_id}":
 *  get:
 *    description: "Get Order details"
 *    tags:
 *    - Order
 *    security:
 *    - bearerAuthVendor: []
 *    summary: "Vendor Auth"
 *    parameters:
 *    - in: path
 *      name: order_id
 *      description: order id
 *      type: number
 *      example: 1
 *    responses:
 *      '200':
 *        description: " Successfully Got order details"
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: " Internal Server Error "
 */

/** GET - VENDOR
 * @openapi
 *"/food/vendor/order/cancellation_reason":
 *  get:
 *    description: "Read All Reason"
 *    tags:
 *    - Order
 *    security:
 *    - bearerAuthVendor: []
 *    summary: "Vendor Auth"
 *    responses:
 *      '200':
 *        description: Successfully Recived Response For Vendor
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/** POST - VENDOR - ORDER ACCEPT
 * @openapi
 *paths:
 *  "/food/vendor/order/{order_id}/accept":
 *    post:
 *      description: " get orders by applied filter"
 *      tags:
 *      - Order
 *      security:
 *      - bearerAuthVendor: []
 *      summary: "Vendor Auth"
 *      parameters:
 *      - in: path
 *        name: order_id
 *        description: order id
 *        type: number
 *        example: 1
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            description: Customer Auth
 *            schema:
 *              type: object
 *              properties:
 *                accept:
 *                  type: boolean
 *                  example: true
 *                reason:
 *                  type: string
 *                  example: "Staff not available"
 *                preparation_time:
 *                  type: number
 *                  example: 10
 *      responses:
 *        '200':
 *          description: " order details fetched "
 *        '400':
 *          description: " Bad Request "
 *        '401':
 *          description: " Unauthorized "
 *        '500':
 *          description: " Internal Server Error "
 */

/** POST - VENDOR - ORDER READY
 * @openapi
 *paths:
 *  "/food/vendor/order/{order_id}/ready":
 *    post:
 *      description: " get orders by applied filter"
 *      tags:
 *      - Order
 *      security:
 *      - bearerAuthVendor: []
 *      summary: "Vendor Auth"
 *      parameters:
 *      - in: path
 *        name: order_id
 *        description: order id
 *        type: number
 *        example: 1
 *      responses:
 *        '200':
 *          description: " order details fetched "
 *        '400':
 *          description: " Bad Request "
 *        '401':
 *          description: " Unauthorized "
 *        '500':
 *          description: " Internal Server Error "
 */

/** POST - VENDOR - ORDER CANCEL
 * @openapi
 *paths:
 *  "/food/vendor/order/{order_id}/cancel":
 *    post:
 *      description: "vendor cancel order api "
 *      tags:
 *      - Order
 *      security:
 *      - bearerAuthVendor: []
 *      summary: "Vendor Auth"
 *      parameters:
 *       - in: path
 *         name: order_id
 *         description: order id
 *         type: number
 *         example: 1
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            description: Vendor Auth
 *            schema:
 *              type: object
 *              example: {
 *                       cancellation_reason: "food preparation items out of stock",
 *                       }
 *      responses:
 *        '200':
 *          description: " order cancelled "
 *        '400':
 *          description: " Bad Request "
 *        '401':
 *          description: " Unauthorized "
 *        '500':
 *          description: " Internal Server Error "
 */

/** GET - DOWNLOAD INVOICE PDF
 * @openapi
 *"/food/order/{order_id}/invoice_pdf":
 *  get:
 *    description: "Download invoice pdf"
 *    tags:
 *    - Order
 *    security:
 *    - bearerAuthCustomer: []
 *    summary: "Customer Auth"
 *    parameters:
 *       - in: path
 *         name: order_id
 *         description: order id
 *         type: number
 *         example: 1
 *    responses:
 *      '200':
 *        description: "pdf download url generated"
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/** GET - DOWNLOAD INVOICE PDF
 * @openapi
 *"/food/order/{order_id}/order_summary_pdf":
 *  get:
 *    description: "Download order summary pdf"
 *    tags:
 *    - Order
 *    security:
 *    - bearerAuthCustomer: []
 *    summary: "Customer Auth"
 *    parameters:
 *       - in: path
 *         name: order_id
 *         description: order id
 *         type: number
 *         example: 1
 *    responses:
 *      '200':
 *        description: "pdf download url generated"
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */
