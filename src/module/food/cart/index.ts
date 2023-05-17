import express from 'express';
import * as controller from './controller';

const customer_routes = express.Router();
const admin_routes = express.Router();
const vendor_routes = express.Router();

customer_routes.get('/', controller.getCart);
customer_routes.put('/', controller.putCart);

export default {customer_routes, admin_routes, vendor_routes};

/** FOOD- CART - GET - CUSTOMER
 * @openapi
 *paths:
 *  "/food/cart":
 *    get:
 *      tags:
 *      - Cart
 *      security:
 *      - bearerAuthCustomer: []
 *      summary: "Customer Auth"
 *      description: Get Cart details
 *      produces:
 *      - application/json
 *      responses:
 *        '200':
 *          description: " User Cart Details"
 *          schema:
 *            type: object
 *            properties:
 *              id:
 *                type: uuid
 *                example: 86a7013f-9ab1-4b2c-b82b-4e9757c80b67
 *        '400':
 *          description: " Bad Request "
 *        '401':
 *          description: Unauthorized
 *        '500':
 *          description: " Internal Server Error "
 *    put:
 *      description: " Updating user cart "
 *      tags:
 *      - Cart
 *      security:
 *      - bearerAuthCustomer: []
 *      summary: "Customer Auth"
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            description: Send post Data
 *            schema:
 *              type: object
 *              properties:
 *                action:
 *                  type: string
 *                  example: "UPDATE"
 *                customer_device_id:
 *                  type: string
 *                  example: "12412423432424413213123"
 *                customer_address_id:
 *                  type: string
 *                  example: "298ad2e1-0982-4c72-b9f3-7e83905376e1"
 *                restaurant_id:
 *                  type: string
 *                  example: "68f5dbbd-2141-422f-9beb-b2e8e13ddabe"
 *                menu_items:
 *                  type: object
 *                  example: [
 *                               {
 *                                    "quantity": 1,
 *                                     "menu_item_id": 80820710,
 *                                     "variant_groups": [
 *                                       {
 *                                        "variant_group_id": 1398,
 *                                         "variant_id": 6006
 *                                       },
 *                                       {
 *                                        "variant_group_id": 1399,
 *                                         "variant_id": 6011
 *                                       }
 *                                     ],
 *                                     "addon_groups": [
 *                                       {
 *                                         "addon_group_id": 79,
 *                                        "addons": [
 *                                         793
 *                                         ]
 *                                       }
 *                                     ]
 *                                }
 *                           ]
 *                any_special_request:
 *                  type: string
 *                  example: "Dont ring door bell"
 *                coupon_code:
 *                  type: string
 *                  example: "NEW20"
 *        required: true
 *      responses:
 *        '200':
 *          description: " Updated user cart "
 *        '400':
 *          description: " Bad Request "
 *        '401':
 *          description: Unauthorized
 *        '500':
 *          description: " Internal Server Error "
 */
