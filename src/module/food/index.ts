import express from 'express';
import * as controller from './controller';
import restaurant_routes from './restaurant';
import menu_routes from './menu';
import cart_routes from './cart';
import order_routes from './order';
import coupon_routes from './coupons';
import payout_account_routes from './payout_account';
import payout_routes from './payout';
import approval_routes from './approval';
import report_routes from './report';
import {
  authenticate_admin,
  authenticate_partner,
  authenticate_customer,
  authenticate_user,
  authenticate_vendor,
  optional_authenticate_customer,
} from '../../utilities/jwt/authenticate';
import cuisine_routes from './cuisine';
import subscription_routes from './subscription';
import {
  sendTestPushNotification,
  sendTestRolePushNotification,
} from '../../utilities/test_notification';
import global_var_routes from '../../utilities/global_var';
import callback_routes from './callback';
import petpooja_routes from './petpooja';

const routes = express.Router();

routes.use('/callback', callback_routes.callback_routes);
routes.use('/admin/petpooja', authenticate_admin, petpooja_routes.admin_routes);

routes.use(
  '/admin/globalVar',
  authenticate_admin,
  global_var_routes.admin_routes
);

routes.use(
  '/vendor/globalVar',
  authenticate_vendor,
  global_var_routes.vendor_routes
);

routes.use('/globalVar', global_var_routes.open_routes);

routes.use(
  '/admin/restaurant',
  authenticate_admin,
  restaurant_routes.admin_routes
);
routes.use(
  '/partner/restaurant',
  authenticate_partner,
  restaurant_routes.partner_routes
);
routes.use(
  '/vendor/restaurant',
  authenticate_vendor,
  restaurant_routes.vendor_routes
);
routes.use('/restaurant', restaurant_routes.customer_routes);
routes.use('/vendor/menu', authenticate_vendor, menu_routes.vendor_routes);
routes.use('/admin/menu', authenticate_admin, menu_routes.admin_routes);
routes.use(
  '/menu',
  optional_authenticate_customer,
  menu_routes.customer_routes
);
routes.use('/admin/cuisine', authenticate_admin, cuisine_routes.admin_routes);
routes.use(
  '/partner/cuisine',
  authenticate_partner,
  cuisine_routes.partner_routes
);
routes.use('/cuisine', cuisine_routes.customer_routes);

//!DEPRECATED
routes.post('/search', controller.searchFood);

routes.post('/v2/search', controller.searchFoodV2);

routes.get(
  '/pre_search',
  optional_authenticate_customer,
  controller.preSearchFood
);

routes.post('/init_es_index', authenticate_admin, controller.initEsIndex);
routes.put('/update_es_index', authenticate_admin, controller.putEsIndex);

routes.post('/test_push', authenticate_user, sendTestPushNotification);
routes.post('/testRolePush', authenticate_user, sendTestRolePushNotification);
routes.use('/cart', authenticate_customer, cart_routes.customer_routes);
routes.use('/cart', authenticate_admin, cart_routes.admin_routes);
routes.use('/cart', authenticate_vendor, cart_routes.vendor_routes);

routes.use('/order', authenticate_customer, order_routes.customer_routes);
routes.use('/vendor/order', authenticate_vendor, order_routes.vendor_routes);
routes.use('/admin/order', authenticate_admin, order_routes.admin_routes);

routes.use('/admin/coupon', authenticate_admin, coupon_routes.admin_routes);
routes.use('/vendor/coupon', authenticate_vendor, coupon_routes.vendor_routes);

routes.use(
  '/admin/payout_account',
  authenticate_admin,
  payout_account_routes.admin_routes
);
routes.use(
  '/vendor/payout_account',
  authenticate_vendor,
  payout_account_routes.vendor_routes
);
routes.use('/admin/payout', authenticate_admin, payout_routes.admin_routes);
routes.use('/vendor/payout', authenticate_vendor, payout_routes.vendor_routes);

routes.use('/coupon', authenticate_customer, coupon_routes.customer_routes);
routes.post('/ws_msg', authenticate_user, controller.ws_msg);

routes.use(
  '/admin/subscription',
  authenticate_admin,
  subscription_routes.admin_routes
);
routes.use(
  '/vendor/subscription',
  authenticate_vendor,
  subscription_routes.vendor_routes
);

routes.use('/admin/approval', authenticate_admin, approval_routes.admin_routes);

routes.use('/admin/report', authenticate_admin, report_routes.admin_routes);
routes.use('/vendor/report', authenticate_vendor, report_routes.vendor_routes);

export default routes;

/**
 * @openapi
 *"/food/init_es_index":
 *  post:
 *    description: "do initial indexing"
 *    tags:
 *    - Testing/Development
 *    security:
 *    - bearerAuthAdmin: []
 *    summary: "Admin Auth"
 *    responses:
 *      '200':
 *        description: Elastic search initial indexing completed
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/**
 * @openapi
 *"/food/update_es_index":
 *  put:
 *    description: "update elastic search index documents"
 *    tags:
 *    - Testing/Development
 *    security:
 *    - bearerAuthAdmin: []
 *    summary: "Admin Auth"
 *    responses:
 *      '200':
 *        description: Elastic search index documents updated
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/**
 * @openapi
 *"/food/test_push":
 *  post:
 *    description: "Test Push Notification"
 *    tags:
 *    - Testing/Development
 *    security:
 *    - bearerAuth: []
 *    summary: "User Auth"
 *    requestBody:
 *      content:
 *        application/json:
 *          name: body
 *          in: body
 *          description: Send post Data
 *          schema:
 *            type: object
 *            properties:
 *              templet:
 *                type: string
 *                example: DEFAULT_TEMPLATE
 *              data:
 *                type: object
 *                example: {
 *                  "foo": "bar"
 *                }
 *    responses:
 *      '200':
 *        description: Got restaurant list
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/**
 * @openapi
 *"/food/testRolePush":
 *  post:
 *    description: "Test Push Notification"
 *    tags:
 *    - Testing/Development
 *    security:
 *    - bearerAuth: []
 *    summary: "User Auth"
 *    requestBody:
 *      content:
 *        application/json:
 *          name: body
 *          in: body
 *          description: Send post Data
 *          schema:
 *            type: object
 *            properties:
 *              templet:
 *                type: string
 *                example: DEFAULT_TEMPLATE
 *              data:
 *                type: object
 *                example: {
 *                  "foo": "bar"
 *                }
 *              role:
 *                type: string
 *                example: 'admin'
 *    responses:
 *      '200':
 *        description: Got restaurant list
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/**
 * @openapi
 *"/food/ws_msg":
 *  post:
 *    description: "Web Socket Testing"
 *    tags:
 *    - Testing/Development
 *    security:
 *    - bearerAuth: []
 *    summary: "User Auth"
 *    requestBody:
 *      content:
 *        application/json:
 *          name: body
 *          in: body
 *          description: Send post Data
 *          schema:
 *            type: object
 *            required:
 *              - from_user_id
 *              - to_user_id
 *              - message
 *            properties:
 *              from_user_id:
 *                type: string
 *                example: user_1
 *              to_room_id:
 *                type: string
 *                example: user_2
 *              payload:
 *                type: string
 *                example: Hi from user 1
 *    responses:
 *      '200':
 *        description: Got restaurant list
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/**
 * @openapi
 *"/food/search":
 *  post:
 *    description: "Search in restaurant/Cuisine/"
 *    tags:
 *    - Restaurant
 *    requestBody:
 *      content:
 *        application/json:
 *          name: body
 *          in: body
 *          description: Send post Data
 *          schema:
 *            type: object
 *            required:
 *              - coordinates
 *              - pagination
 *            properties:
 *              searchText:
 *                type: string
 *                example: food
 *              coordinates:
 *                type: object
 *                required:
 *                  - lat
 *                  - long
 *                properties:
 *                  lat:
 *                    type: number
 *                    example: 19.138731
 *                  long:
 *                    type: number
 *                    example: 72.96697
 *              pagination:
 *                type: object
 *                properties:
 *                  page_index:
 *                    type: number
 *                    example: 0
 *                  page_size:
 *                    type: number
 *                    example: 10
 *      required: true
 *    responses:
 *      '200':
 *        description: Got restaurant list
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/**
 * @openapi
 *"/food/v2/search":
 *  post:
 *    description: "Search in restaurant, menu items and cuisines"
 *    tags:
 *    - Restaurant
 *    requestBody:
 *      content:
 *        application/json:
 *          name: body
 *          in: body
 *          description: Send post Data
 *          schema:
 *            type: object
 *            required:
 *              - coordinates
 *              - pagination
 *            properties:
 *              type:
 *                type: string
 *                example: menu_item_restaurant
 *              search_text:
 *                type: string
 *                example: food
 *              coordinates:
 *                type: object
 *                required:
 *                  - lat
 *                  - long
 *                properties:
 *                  lat:
 *                    type: number
 *                    example: 19.138731
 *                  long:
 *                    type: number
 *                    example: 72.96697
 *              pagination:
 *                type: object
 *                properties:
 *                  page_index:
 *                    type: number
 *                    example: 0
 *                  page_size:
 *                    type: number
 *                    example: 10
 *      required: true
 *    responses:
 *      '200':
 *        description: Got restaurant list
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/**
 * @openapi
 *"/food/pre_search":
 *  get:
 *    description: "Get pre search details"
 *    tags:
 *    - Restaurant
 *    security:
 *    - bearerAuthCustomer: []
 *    summary: "Customer Auth"
 *    parameters:
 *    - in: query
 *      name: lat
 *      type: number
 *      required: true
 *      example: 21.145800
 *    - in: query
 *      name: long
 *      type: number
 *      required: true
 *      example: 79.088154
 *    responses:
 *      '200':
 *        description: Got restaurant list
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */
