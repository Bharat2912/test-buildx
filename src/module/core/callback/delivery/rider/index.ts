import express from 'express';
import * as controller from './controller';

const rider_routes = express.Router();

rider_routes.post('/order_status', controller.processOrderStatus);
rider_routes.post(
  '/rider_location_update',
  controller.processRiderLocationUpdate
);

export default {rider_routes};

/**
 * @openapi
 *"/core/callback/rider/order_status":
 *  post:
 *    description: "Rider Callback"
 *    tags:
 *    - Callback
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
 *          examples:
 *            ALLOTTED:
 *              summry: ALLOTTED
 *              value:
 *                {
 *                    "allot_time": "2017-11-30T09:25:17.000000Z",
 *                    "rider_name": "Amit Kumar",
 *                    "order_id": 20726168,
 *                    "client_order_id": "1032",
 *                    "order_status": "ALLOTTED",
 *                    "rider_contact": "9898989898",
 *                    "rider_latitude": 12.343424,
 *                    "rider_longitude": 77.987987987,
 *                    "pickup_eta": 5,
 *                    "drop_eta": 20
 *                }
 *            ARRIVED:
 *              summry: ARRIVED
 *              value:
 *                {
 *                    "arrival_time":"2017-11-30T09:25:17.000000Z",
 *                    "rider_name":"Amit Kumar",
 *                    "order_id": 20726168,
 *                    "client_order_id": "1032",
 *                    "order_status":"ARRIVED",
 *                    "rider_contact": "9898989898",
 *                    "rider_latitude": 12.343424,
 *                    "rider_longitude": 77.987987987,
 *                    "pickup_eta": 3,
 *                    "drop_eta": 18
 *                }
 *            DISPATCHED:
 *              summry: DISPATCHED
 *              value:
 *                {
 *                    "dispatch_time":"2017-11-30T09:25:17.000000Z",
 *                    "rider_name":"Amit Kumar",
 *                    "order_id": 20726168,
 *                    "client_order_id": "1032",
 *                    "order_status":"DISPATCHED",
 *                    "rider_contact": "9898989898",
 *                    "rider_latitude": 12.343424,
 *                    "rider_longitude": 77.987987987,
 *                    "pickup_eta": null,
 *                    "drop_eta": 15
 *                }
 *            ARRIVED_CUSTOMER_DOORSTEP:
 *              summry: ARRIVED_CUSTOMER_DOORSTEP
 *              value:
 *                {
 *                    "customer_doorstep_arrival_time":"2017-11-30T09:25:17.000000Z",
 *                    "rider_name":"Amit Kumar",
 *                    "order_id": 20726168,
 *                    "client_order_id": "1032",
 *                    "order_status":"ARRIVED_CUSTOMER_DOORSTEP",
 *                    "rider_contact": "9898989898",
 *                    "rider_latitude": 12.343424,
 *                    "rider_longitude": 77.987987987,
 *                    "pickup_eta": null,
 *                    "drop_eta": 5
 *                }
 *            DELIVERED:
 *              summry: DELIVERED
 *              value:
 *                {
 *                    "delivery_time":"2017-11-30T09:25:17.000000Z",
 *                    "rider_name":"Amit Kumar",
 *                    "order_id": 20726168,
 *                    "client_order_id": "1032",
 *                    "order_status":"DELIVERED",
 *                    "rider_contact": "9898989898",
 *                    "rider_latitude": 12.343424,
 *                    "rider_longitude": 77.987987987,
 *                    "return_skus": [
 *                        {"quantity_returned" : 2,
 *                        "reason" : "Damaged product",
 *                        "skuId" : "1234",
 *                        "actual_quantity": 4
 *                        }
 *                    ],
 *                    "pickup_eta": null,
 *                    "drop_eta": null,
 *                    "drop_image_url": "some_url"
 *                }
 *            CANCELLED:
 *              summry: CANCELLED
 *              value:
 *                {
 *                    "cancel_time":"2017-11-30T09:25:17.000000Z",
 *                    "rider_name":"Amit Kumar",
 *                    "order_id": 20726168,
 *                    "client_order_id": "1032",
 *                    "order_status":"CANCELLED",
 *                    "rider_contact": "9898989898",
 *                    "rider_latitude": 12.343424,
 *                    "rider_longitude": 77.987987987,
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
 *"/core/callback/rider/rider_location_update":
 *  post:
 *    description: "Rider Callback"
 *    tags:
 *    - Callback
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
 *          example:
 *           {
 *               "order_id" : "8145671314",
 *               "rider_name" : "Amit Kumar",
 *               "rider_longitude" : 77.66824096441269,
 *               "time" : "2017-11-30T09:25:17.000000Z",
 *               "rider_latitude" : 12.991595437657885,
 *               "rider_id": 3419,
 *               "location_accuracy" : 31.0,
 *               "pickup_eta" : 3,
 *               "drop_eta" : 18,
 *           }
 *    responses:
 *      '200':
 *        description: OK
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */
