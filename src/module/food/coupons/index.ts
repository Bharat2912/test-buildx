import express from 'express';
import * as controller from './controller';

const admin_routes = express.Router();
const vendor_routes = express.Router();
const customer_routes = express.Router();

admin_routes.post('/filter', controller.filterCouponsAsAdmin);
admin_routes.post('/restaurant/filter', controller.filterCouponVendorAsAdmin);
admin_routes.post('/', controller.createCouponAsAdmin);
admin_routes.post('/restaurant/optin', controller.restaurantOptinAsAdmin);
admin_routes.post('/restaurant/optout', controller.restaurantOptoutAsAdmin);
admin_routes.get('/:coupon_id', controller.getCouponDetailsAsAdmin);
admin_routes.get(
  '/customer/:customer_id',
  controller.getCouponsUsedByCustomerAsAdmin
);
admin_routes.get(
  '/restaurant/:restaurant_id',
  controller.getCouponsUsedByRestaurantAsAdmin
);

vendor_routes.post('/', controller.createCouponAsVendor);
vendor_routes.get('/all', controller.getCoupons);
vendor_routes.post('/filter', controller.filterCouponsAsVendor);
vendor_routes.post('/restaurant/optin', controller.restaurantOptinAsVendor);
vendor_routes.post('/restaurant/optout', controller.restaurantOptoutAsVendor);
vendor_routes.post('/restaurant/filter', controller.filterCouponVendorAsVendor);
vendor_routes.get(
  '/available_for_optin',
  controller.getAllCouponsAvailableForOptinForRestaurantAsVendor
);
vendor_routes.get('/restaurant', controller.getCouponsUsedByRestaurantAsVendor);
vendor_routes.put(
  '/restaurant/sequence',
  controller.updateCouponVendorSequenceAsVendor
);

customer_routes.get('/:restaurant_id', controller.getAllCouponsForCustomer);
customer_routes.post('/validate', controller.validateCustomerSelectedCoupon);

export default {admin_routes, vendor_routes, customer_routes};

// --- ADMIN APIS ---

/** POST - CREATE COUPON AS ADMIN
 * @openapi
 *"/food/admin/coupon":
 *  post:
 *    description: "create new coupon"
 *    tags:
 *    - Coupon
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
 *            properties:
 *              code:
 *                type: string
 *                example: SPEEDYY20
 *              header:
 *                type: string
 *                example: Get 20% Cashback
 *              description:
 *                type: string
 *                example: All new user can get 20% cashback on thier first order
 *              terms_and_conditions:
 *                type: string
 *                example: Terms & Conditions Apply 1. Applicable only for order above 100rs
 *              type:
 *                type: string
 *                example: upto
 *              discount_percentage:
 *                type: number
 *                example: 20
 *              start_time:
 *                type: number
 *                example: 1656054691
 *              end_time:
 *                type: number
 *                example: 1656400291
 *              level:
 *                type: string
 *                example: global
 *              max_use_count:
 *                type: number
 *                example: 1
 *              min_order_value_rupees:
 *                type: number
 *                example: 100
 *              max_discount_rupees:
 *                type: number
 *                example: 20
 *              discount_share_percent:
 *                type: number
 *                example: 20
 *      required: true
 *    responses:
 *      '200':
 *        description: " Successfully created coupons "
 *      '400':
 *        description: " Bad Request "
 *      '401':
 *        description: " Unauthorized "
 *      '403':
 *        description: " Input Data Validation Error "
 *      '500':
 *        description: " Internal Server Error "
 */

/** POST - FILTER COUPONS AS ADMIN
 * @openapi
 *"/food/admin/coupon/filter":
 *  post:
 *    description: "Get filtered Coupons as admin"
 *    tags:
 *    - Coupon
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
 *            properties:
 *              search_text:
 *                type: string
 *                example: "1"
 *              filter:
 *                type: object
 *                example: {
 *                  restaurant_id: "f0c8c345-89c2-4d03-93c9-64805964c363",
 *                  type: "upto",
 *                  level: "restaurant",
 *                  max_use_count: 1,
 *                  discount_sponsered_by: "restaurant",
 *                  created_by: "vendor",
 *                  duration: {
 *                            start_date: 1656413597,
 *                            end_date: 1656413609
 *                            }
 *                         }
 *              pagination:
 *                  type: object
 *                  example: {
 *                            page_index: 1,
 *                            page_size: 5
 *                            }
 *      required: true
 *    responses:
 *      '200':
 *        description: " Successfully filtered coupons "
 *      '400':
 *        description: " Bad Request "
 *      '401':
 *        description: " Unauthorized "
 *      '403':
 *        description: " Input Data Validation Error "
 *      '500':
 *        description: " Internal Server Error "
 */

/** POST - OPTIN COUPON AS ADMIN
 * @openapi
 *"/food/admin/coupon/restaurant/optin":
 *  post:
 *    description: "optin restaurant to a particular coupon as admin"
 *    tags:
 *    - Coupon
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
 *            properties:
 *              coupon_id:
 *                type: number
 *                example: 2
 *              restaurant_ids:
 *                type: array
 *                example: [aed62a02-15f7-408f-953d-fbd6db0dbf57]
 *              mapping_duration:
 *                type: object
 *                properties:
 *                  start_time:
 *                    type: number
 *                    example: 1656328066
 *                  end_time:
 *                    type: number
 *                    example: 1656331666
 *      required: true
 *    responses:
 *      '200':
 *        description: " Successfully mapped coupon with restaurant "
 *      '400':
 *        description: " Bad Request "
 *      '401':
 *        description: " Unauthorized "
 *      '403':
 *        description: " Input Data Validation Error "
 *      '500':
 *        description: " Internal Server Error "
 */

/** POST - OPTOUT COUPON AS ADMIN
 * @openapi
 *"/food/admin/coupon/restaurant/optout":
 *  post:
 *    description: "optout restaurant to a particular coupon as admin"
 *    tags:
 *    - Coupon
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
 *            properties:
 *              coupon_mapping_ids:
 *                type: array
 *                example: [1,2,3]
 *      required: true
 *    responses:
 *      '200':
 *        description: " Successfully removed coupon and restaurant mapping"
 *      '400':
 *        description: " Bad Request "
 *      '401':
 *        description: " Unauthorized "
 *      '403':
 *        description: " Input Data Validation Error "
 *      '500':
 *        description: " Internal Server Error "
 */

/** POST - FILTER COUPONS AS ADMIN
 * @openapi
 *"/food/admin/coupon/restaurant/filter":
 *  post:
 *    description: "filter Coupon vendor mapping as admin"
 *    tags:
 *    - Coupon
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
 *            properties:
 *              search_text:
 *                type: string
 *                example: "1"
 *              filter:
 *                type: object
 *                example: {
 *                  coupon_id: "2",
 *                  restaurant_id: "aed62a02-15f7-408f-953d-fbd6db0dbf57",
 *                  mapped_by: "vendor",
 *                  timeline: ["expired","active","upcoming"],
 *                  duration: {
 *                            start_date: 1656413597,
 *                            end_date: 1656413609
 *                            }
 *                         }
 *              pagination:
 *                  type: object
 *                  example: {
 *                            page_index: 1,
 *                            page_size: 5
 *                            }
 *      required: true
 *    responses:
 *      '200':
 *        description: " Successfully filtered coupons "
 *      '400':
 *        description: " Bad Request "
 *      '401':
 *        description: " Unauthorized "
 *      '403':
 *        description: " Input Data Validation Error "
 *      '500':
 *        description: " Internal Server Error "
 */

/** GET - GET COUPON DETAILS AS ADMIN
 * @openapi
 *"/food/admin/coupon/{coupon_id}":
 *  get:
 *    description: "get coupon details as admin by coupon id"
 *    tags:
 *    - Coupon
 *    security:
 *    - bearerAuthAdmin: []
 *    summary: "Admin Auth"
 *    parameters:
 *    - in: path
 *      name: coupon_id
 *      description: Get Coupon
 *      required: true
 *      schema:
 *        type: string
 *    responses:
 *      '200':
 *        description: " Successfully fetched coupon details"
 *      '400':
 *        description: " Bad Request "
 *      '401':
 *        description: " Unauthorized "
 *      '403':
 *        description: " Input Data Validation Error "
 *      '500':
 *        description: " Internal Server Error "
 */

/** GET - GET ALL COUPONS USED BY A SPECIFIC RESTAURANT
 * @openapi
 *"/food/admin/coupon/restaurant/{restaurant_id}":
 *  get:
 *    description: "get coupon details used by a restaurant as admin by restaurant id"
 *    tags:
 *    - Coupon
 *    security:
 *    - bearerAuthAdmin: []
 *    parameters:
 *    - in: path
 *      name: restaurant_id
 *      description: restaurant_id id
 *      type: string
 *      example: aed62a02-15f7-408f-953d-fbd6db0dbf57
 *    summary: "Admin Auth"
 *    responses:
 *      '200':
 *        description: " Successfully fetched coupon details"
 *      '400':
 *        description: " Bad Request "
 *      '401':
 *        description: " Unauthorized "
 *      '403':
 *        description: " Input Data Validation Error "
 *      '500':
 *        description: " Internal Server Error "
 */

// --- VENDOR APIS ---

/** GET - GET ALL COUPONS USED BY A SPECIFIC RESTAURANT
 * @openapi
 *"/food/vendor/coupon/restaurant":
 *  get:
 *    description: "get active coupon details and active mapping details for vendor restaurant"
 *    tags:
 *    - Coupon
 *    security:
 *    - bearerAuthVendor: []
 *    summary: "Vendor Auth"
 *    responses:
 *      '200':
 *        description: " Successfully fetched coupon details"
 *      '400':
 *        description: " Bad Request "
 *      '401':
 *        description: " Unauthorized "
 *      '403':
 *        description: " Input Data Validation Error "
 *      '500':
 *        description: " Internal Server Error "
 */

/** GET - GET ALL COUPONS USED BY A SPECIFIC RESTAURANT
 * @openapi
 *"/food/vendor/coupon/all":
 *  get:
 *    description: "get active coupon details and active mapping details for vendor restaurant"
 *    tags:
 *    - Coupon
 *    security:
 *    - bearerAuthVendor: []
 *    summary: "Vendor Auth"
 *    responses:
 *      '200':
 *        description: " Successfully fetched coupon details"
 *      '400':
 *        description: " Bad Request "
 *      '401':
 *        description: " Unauthorized "
 *      '403':
 *        description: " Input Data Validation Error "
 *      '500':
 *        description: " Internal Server Error "
 */

/** POST - CREATE COUPON AS VENDOR
 * @openapi
 *"/food/vendor/coupon":
 *  post:
 *    description: "create coupon as vendor"
 *    tags:
 *    - Coupon
 *    security:
 *    - bearerAuthVendor: []
 *    summary: "Vendor Auth"
 *    requestBody:
 *      content:
 *        application/json:
 *          name: body
 *          in: body
 *          description: Send post Data
 *          schema:
 *            type: object
 *            properties:
 *              code:
 *                type: string
 *                example: SPEEDYY20
 *              header:
 *                type: string
 *                example: Get 20% Cashback
 *              description:
 *                type: string
 *                example: All new user can get 20% cashback on thier first order
 *              terms_and_conditions:
 *                type: string
 *                example: Terms & Conditions Apply 1. Applicable only for order above 100rs
 *              type:
 *                type: string
 *                example: upto
 *              discount_percentage:
 *                type: number
 *                example: 20
 *              start_time:
 *                type: number
 *                example: 1656054691
 *              end_time:
 *                type: number
 *                example: 1656400291
 *              max_use_count:
 *                type: number
 *                example: 1
 *              min_order_value_rupees:
 *                type: number
 *                example: 100
 *              max_discount_rupees:
 *                type: number
 *                example: 20
 *      required: true
 *    responses:
 *      '200':
 *        description: " Successfully created coupon"
 *      '400':
 *        description: " Bad Request "
 *      '401':
 *        description: " Unauthorized "
 *      '403':
 *        description: " Input Data Validation Error "
 *      '500':
 *        description: " Internal Server Error "
 */

/** POST - FILTER VENDOR COUPONS AS VENDOR
 * @openapi
 *"/food/vendor/coupon/filter":
 *  post:
 *    description: "filter vendor coupons as vendor"
 *    tags:
 *    - Coupon
 *    security:
 *    - bearerAuthVendor: []
 *    summary: "Vendor Auth"
 *    requestBody:
 *      content:
 *        application/json:
 *          name: body
 *          in: body
 *          description: Send post Data
 *          schema:
 *            type: object
 *            properties:
 *              search_text:
 *                type: string
 *                example: "1"
 *              filter:
 *                type: object
 *                example: {
 *                  type: "upto",
 *                  max_use_count: 1,
 *                  duration: {
 *                            start_date: 1656413597,
 *                            end_date: 1656413609
 *                            }
 *                         }
 *              pagination:
 *                  type: object
 *                  example: {
 *                            page_index: 1,
 *                            page_size: 5
 *                            }
 *      required: true
 *    responses:
 *      '200':
 *        description: " Successfully fetched records"
 *      '400':
 *        description: " Bad Request "
 *      '401':
 *        description: " Unauthorized "
 *      '403':
 *        description: " Input Data Validation Error "
 *      '500':
 *        description: " Internal Server Error "
 */

/** POST - FILTER VENDOR COUPONS AS VENDOR
 * @openapi
 *"/food/vendor/coupon/restaurant/filter":
 *  post:
 *    description: "filter vendor coupons mapping as vendor"
 *    tags:
 *    - Coupon
 *    security:
 *    - bearerAuthVendor: []
 *    summary: "Vendor Auth"
 *    requestBody:
 *      content:
 *        application/json:
 *          name: body
 *          in: body
 *          description: Send post Data
 *          schema:
 *            type: object
 *            properties:
 *              search_text:
 *                type: string
 *                example: "1"
 *              filter:
 *                type: object
 *                example: {
 *                  coupon_id: "2",
 *                  duration: {
 *                            start_date: 1656413597,
 *                            end_date: 1656413609
 *                            }
 *                         }
 *              pagination:
 *                  type: object
 *                  example: {
 *                            page_index: 1,
 *                            page_size: 5
 *                            }
 *      required: true
 *    responses:
 *      '200':
 *        description: " Successfully fetched records"
 *      '400':
 *        description: " Bad Request "
 *      '401':
 *        description: " Unauthorized "
 *      '403':
 *        description: " Input Data Validation Error "
 *      '500':
 *        description: " Internal Server Error "
 */

/** POST - OPTIN COUPON AS VENDOR
 * @openapi
 *"/food/vendor/coupon/restaurant/optin":
 *  post:
 *    description: "optin restaurant to a particular coupon as vendor"
 *    tags:
 *    - Coupon
 *    security:
 *    - bearerAuthVendor: []
 *    summary: "Vendor Auth"
 *    requestBody:
 *      content:
 *        application/json:
 *          name: body
 *          in: body
 *          description: Send post Data
 *          schema:
 *            type: object
 *            properties:
 *              coupon_id:
 *                type: number
 *                example: 2
 *              mapping_duration:
 *                type: object
 *                properties:
 *                  start_time:
 *                    type: number
 *                    example: 1656328066
 *                  end_time:
 *                    type: number
 *                    example: 1656331666
 *      required: true
 *    responses:
 *      '200':
 *        description: " Successfully mapped coupon with restaurant "
 *      '400':
 *        description: " Bad Request "
 *      '401':
 *        description: " Unauthorized "
 *      '403':
 *        description: " Input Data Validation Error "
 *      '500':
 *        description: " Internal Server Error "
 */

/** POST - OPTOUT COUPON AS VENDOR
 * @openapi
 *"/food/vendor/coupon/restaurant/optout":
 *  post:
 *    description: "optout restaurant to a particular coupon as vendor"
 *    tags:
 *    - Coupon
 *    security:
 *    - bearerAuthVendor: []
 *    summary: "Vendor Auth"
 *    requestBody:
 *      content:
 *        application/json:
 *          name: body
 *          in: body
 *          description: Send post Data
 *          schema:
 *            type: object
 *            properties:
 *              coupon_mapping_ids:
 *                type: array
 *                example: [1,2,3]
 *      required: true
 *    responses:
 *      '200':
 *        description: " Successfully removed coupon and restaurant mapping"
 *      '400':
 *        description: " Bad Request "
 *      '401':
 *        description: " Unauthorized "
 *      '403':
 *        description: " Input Data Validation Error "
 *      '500':
 *        description: " Internal Server Error "
 */

/** PUT - UPDATE COUPON VENDOR SEQUENCE AS VENDOR
 * @openapi
 *"/food/vendor/coupon/restaurant/sequence":
 *  put:
 *    description: "update coupon vendor sequence"
 *    tags:
 *    - Coupon
 *    security:
 *    - bearerAuthVendor: []
 *    summary: "Vendor Auth"
 *    requestBody:
 *      content:
 *        application/json:
 *          name: body
 *          in: body
 *          description: Send post Data
 *          schema:
 *            type: object
 *            properties:
 *              coupon_mappings:
 *                type: array
 *                example: [{id: 20,sequence: 1}]
 *      required: true
 *    responses:
 *      '200':
 *        description: " Successfully updated coupon vendor sequence"
 *      '400':
 *        description: " Bad Request "
 *      '401':
 *        description: " Unauthorized "
 *      '403':
 *        description: " Input Data Validation Error "
 *      '500':
 *        description: " Internal Server Error "
 */

/** GET - GET ALL COUPONS IN WHICH VENDOR CAN OPTIN
 * @openapi
 *"/food/vendor/coupon/available_for_optin":
 *  get:
 *    description: "get all coupons in which vendor can optin"
 *    tags:
 *    - Coupon
 *    security:
 *    - bearerAuthVendor: []
 *    summary: "Vendor Auth"
 *    responses:
 *      '200':
 *        description: " Successfully fetched coupon details"
 *      '400':
 *        description: " Bad Request "
 *      '401':
 *        description: " Unauthorized "
 *      '403':
 *        description: " Input Data Validation Error "
 *      '500':
 *        description: " Internal Server Error "
 */

// -- USER APIS --

/** GET - GET ALL COUPONS AVAILABLE FOR USER CART
 * @openapi
 *"/food/coupon/{restaurant_id}":
 *  get:
 *    description: "get all coupons which are applicable for a user in cart"
 *    tags:
 *    - Coupon
 *    security:
 *    - bearerAuthCustomer: []
 *    parameters:
 *    - in: path
 *      name: restaurant_id
 *      description: restaurant_id id
 *      type: string
 *      example: aed62a02-15f7-408f-953d-fbd6db0dbf57
 *    summary: "Customer Auth"
 *    responses:
 *      '200':
 *        description: " Successfully fetched coupon details"
 *      '400':
 *        description: " Bad Request "
 *      '401':
 *        description: " Unauthorized "
 *      '403':
 *        description: " Input Data Validation Error "
 *      '500':
 *        description: " Internal Server Error "
 */

/** GET - GET ALL COUPONS USED BY A SPECIFIC USER
 * @openapi
 *"/food/admin/coupon/customer/{customer_id}":
 *  get:
 *    description: "get coupon details used by a customer as admin by customer id"
 *    tags:
 *    - Coupon
 *    security:
 *    - bearerAuthAdmin: []
 *    summary: "Admin Auth"
 *    parameters:
 *    - in: path
 *      name: customer_id
 *      description: Get Coupon
 *      required: true
 *      schema:
 *        type: string
 *    responses:
 *      '200':
 *        description: " Successfully fetched coupon details"
 *      '400':
 *        description: " Bad Request "
 *      '401':
 *        description: " Unauthorized "
 *      '403':
 *        description: " Input Data Validation Error "
 *      '500':
 *        description: " Internal Server Error "
 */

/** POST - VALIDATE COUPON
 * @openapi
 *"/food/coupon/validate":
 *  post:
 *    description: "validate if coupon is applicable or not"
 *    tags:
 *    - Coupon
 *    security:
 *    - bearerAuthCustomer: []
 *    summary: "Customer Auth"
 *    requestBody:
 *      content:
 *        application/json:
 *          name: body
 *          in: body
 *          description: Send post Data
 *          schema:
 *            type: object
 *            properties:
 *              restaurant_id:
 *                type: string
 *                example: "aed62a02-15f7-408f-953d-fbd6db0dbf57"
 *              total_food_and_taxes:
 *                type: number
 *                example: 200
 *              coupon_id:
 *                type: number
 *                example: 2
 *              coupon_code:
 *                type: string
 *                example: "SPEEDYY20"
 *      required: true
 *    responses:
 *      '200':
 *        description: " Successfully validated and fetched coupon details"
 *      '400':
 *        description: " Bad Request "
 *      '401':
 *        description: " Unauthorized "
 *      '403':
 *        description: " Input Data Validation Error "
 *      '500':
 *        description: " Internal Server Error "
 */
