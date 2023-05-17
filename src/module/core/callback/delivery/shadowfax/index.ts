import express from 'express';
import * as controller from './controller';

const shadowfax_routes = express.Router();
const admin_routes = express.Router();

shadowfax_routes.post('/order_status', controller.processOrderStatus);
shadowfax_routes.post(
  '/rider_location_update',
  controller.processRiderLocationUpdate
);

admin_routes.post('/startFakeOrder', controller.startFakeOrder);
admin_routes.get('/startFakeOrder/:id', controller.getFakeOrder);
admin_routes.get('/startFakeOrder', controller.getFakeOrder);
admin_routes.delete('/startFakeOrder/:id', controller.deleteFakeOrder);
admin_routes.delete('/startFakeOrder', controller.deleteFakeOrder);

export default {shadowfax_routes, admin_routes};

/**
 * @openapi
 *paths:
 *  "/core/callback/admin/shadowfax/startFakeOrder":
 *    post:
 *      description: " Start order fake callbacks "
 *      tags:
 *      - Testing/Development
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            description: Confirm Payment
 *            schema:
 *              type: object
 *              example:
 *                  {
 *                      "sfx_order_id": "178095321",
 *                      "order_id": "1",
 *                      "service": "food | grocery | pnd | pharmacy",
 *                      "rider_id": "2598256",
 *                      "rider_name": "Akram Pasha",
 *                      "rider_contact": "7483349925",
 *                      "track_url": "https://order-track.shadowfax.in/HvnKM",
 *                      "time_delay": 10,
 *                      "location_accuracy": 11,
 *                      "data": [
 *                          { "time_delay": 10, "order_status": "ALLOTTED", "rider_longitude": 77.625, "rider_latitude": 12.918, "drop_eta": 32, "pickup_eta": 13 },
 *                          { "time_delay": 59, "rider_longitude": 77.625, "rider_latitude": 12.918, "location_accuracy": "10.0", "drop_eta": 32, "pickup_eta": 13 },
 *                          { "time_delay": 61, "rider_longitude": 77.625, "rider_latitude": 12.918, "location_accuracy": "10.0", "drop_eta": 32, "pickup_eta": 13 },
 *                          { "time_delay": 61, "rider_longitude": 77.625, "rider_latitude": 12.918, "location_accuracy": "10.0", "drop_eta": 32, "pickup_eta": 13 },
 *                          { "time_delay": 61, "rider_longitude": 77.625, "rider_latitude": 12.918, "location_accuracy": "10.0", "drop_eta": 32, "pickup_eta": 13 },
 *                          { "time_delay": 61, "rider_longitude": 77.625, "rider_latitude": 12.918, "location_accuracy": "10.0", "drop_eta": 32, "pickup_eta": 12 },
 *                          { "time_delay": 61, "rider_longitude": 77.625, "rider_latitude": 12.918, "location_accuracy": "10.0", "drop_eta": 32, "pickup_eta": 12 },
 *                          { "time_delay": 61, "rider_longitude": 77.625, "rider_latitude": 12.918, "location_accuracy": "10.0", "drop_eta": 32, "pickup_eta": 12 },
 *                          { "time_delay": 61, "rider_longitude": 77.625, "rider_latitude": 12.918, "location_accuracy": "10.0", "drop_eta": 32, "pickup_eta": 12 },
 *                          { "time_delay": 61, "rider_longitude": 77.625, "rider_latitude": 12.918, "location_accuracy": "10.0", "drop_eta": 32, "pickup_eta": 12 },
 *                          { "time_delay": 61, "rider_longitude": 77.624, "rider_latitude": 12.918, "location_accuracy": "10.0", "drop_eta": 32, "pickup_eta": 12 },
 *                          { "time_delay": 61, "rider_longitude": 77.624, "rider_latitude": 12.918, "location_accuracy": "10.0", "drop_eta": 32, "pickup_eta": 12 },
 *                          { "time_delay": 61, "rider_longitude": 77.624, "rider_latitude": 12.918, "location_accuracy": "10.0", "drop_eta": 32, "pickup_eta": 12 },
 *                          { "time_delay": 61, "rider_longitude": 77.624, "rider_latitude": 12.918, "location_accuracy": "10.0", "drop_eta": 32, "pickup_eta": 12 },
 *                          { "time_delay": 61, "rider_longitude": 77.624, "rider_latitude": 12.918, "location_accuracy": "10.0", "drop_eta": 32, "pickup_eta": 12 },
 *                          { "time_delay": 61, "rider_longitude": 77.624, "rider_latitude": 12.917, "location_accuracy": "10.0", "drop_eta": 39, "pickup_eta": 20 },
 *                          { "time_delay": 61, "rider_longitude": 77.624, "rider_latitude": 12.918, "location_accuracy": "10.0", "drop_eta": 32, "pickup_eta": 12 },
 *                          { "time_delay": 61, "rider_longitude": 77.624, "rider_latitude": 12.917, "location_accuracy": "10.0", "drop_eta": 31, "pickup_eta": 12 },
 *                          { "time_delay": 61, "rider_longitude": 77.624, "rider_latitude": 12.917, "location_accuracy": "10.0", "drop_eta": 31, "pickup_eta": 12 },
 *                          { "time_delay": 61, "rider_longitude": 77.624, "rider_latitude": 12.917, "location_accuracy": "10.0", "drop_eta": 31, "pickup_eta": 12 },
 *                          { "time_delay": 61, "rider_longitude": 77.624, "rider_latitude": 12.917, "location_accuracy": "10.0", "drop_eta": 31, "pickup_eta": 12 },
 *                          { "time_delay": 61, "rider_longitude": 77.623, "rider_latitude": 12.917, "location_accuracy": "10.0", "drop_eta": 31, "pickup_eta": 11 },
 *                          { "time_delay": 61, "rider_longitude": 77.622, "rider_latitude": 12.917, "location_accuracy": "10.0", "drop_eta": 30, "pickup_eta": 11 },
 *                          { "time_delay": 61, "rider_longitude": 77.622, "rider_latitude": 12.917, "location_accuracy": "10.0", "drop_eta": 30, "pickup_eta": 11 },
 *                          { "time_delay": 61, "rider_longitude": 77.621, "rider_latitude": 12.917, "location_accuracy": "10.0", "drop_eta": 30, "pickup_eta": 10 },
 *                          { "time_delay": 61, "rider_longitude": 77.62, "rider_latitude": 12.916, "location_accuracy": "10.0", "drop_eta": 29, "pickup_eta": 10 },
 *                          { "time_delay": 61, "rider_longitude": 77.62, "rider_latitude": 12.916, "location_accuracy": "10.0", "drop_eta": 29, "pickup_eta": 9 },
 *                          { "time_delay": 61, "rider_longitude": 77.618, "rider_latitude": 12.916, "location_accuracy": "10.0", "drop_eta": 28, "pickup_eta": 8 },
 *                          { "time_delay": 61, "rider_longitude": 77.616, "rider_latitude": 12.916, "location_accuracy": "10.0", "drop_eta": 26, "pickup_eta": 7 },
 *                          { "time_delay": 61, "rider_longitude": 77.612, "rider_latitude": 12.916, "location_accuracy": "10.0", "drop_eta": 24, "pickup_eta": 5 },
 *                          { "time_delay": 62, "rider_longitude": 77.61, "rider_latitude": 12.915, "location_accuracy": "10.0", "drop_eta": 22, "pickup_eta": 3 },
 *                          { "time_delay": 61, "rider_longitude": 77.61, "rider_latitude": 12.914, "location_accuracy": "10.0", "drop_eta": 22, "pickup_eta": 3 },
 *                          { "time_delay": 61, "rider_longitude": 77.609, "rider_latitude": 12.914, "location_accuracy": "10.0", "drop_eta": 21, "pickup_eta": 2 },
 *                          { "time_delay": 61, "rider_longitude": 77.606, "rider_latitude": 12.914, "location_accuracy": "10.0", "drop_eta": 19, "pickup_eta": 0 },
 *                          { "time_delay": 52, "order_status": "ARRIVED", "rider_longitude": 77.625, "rider_latitude": 12.918, "drop_eta": 19, "pickup_eta": 13 },
 *                          { "time_delay": 4, "order_status": "DISPATCHED", "rider_longitude": 77.605, "rider_latitude": 12.914, "drop_eta": 19 },
 *                          { "time_delay": 4, "rider_longitude": 77.605, "rider_latitude": 12.914, "location_accuracy": "10.0", "drop_eta": 19 },
 *                          { "time_delay": 61, "rider_longitude": 77.605, "rider_latitude": 12.914, "location_accuracy": "10.0", "drop_eta": 19 },
 *                          { "time_delay": 61, "rider_longitude": 77.606, "rider_latitude": 12.912, "location_accuracy": "10.0", "drop_eta": 17 },
 *                          { "time_delay": 61, "rider_longitude": 77.607, "rider_latitude": 12.91, "location_accuracy": "10.0", "drop_eta": 16 },
 *                          { "time_delay": 61, "rider_longitude": 77.607, "rider_latitude": 12.907, "location_accuracy": "10.0", "drop_eta": 15 },
 *                          { "time_delay": 61, "rider_longitude": 77.607, "rider_latitude": 12.907, "location_accuracy": "10.0", "drop_eta": 15 },
 *                          { "time_delay": 61, "rider_longitude": 77.607, "rider_latitude": 12.907, "location_accuracy": "10.0", "drop_eta": 15 },
 *                          { "time_delay": 61, "rider_longitude": 77.609, "rider_latitude": 12.903, "location_accuracy": "10.0", "drop_eta": 7 },
 *                          { "time_delay": 61, "rider_longitude": 77.609, "rider_latitude": 12.903, "location_accuracy": "10.0", "drop_eta": 7 },
 *                          { "time_delay": 61, "rider_longitude": 77.609, "rider_latitude": 12.903, "location_accuracy": "10.0", "drop_eta": 7 },
 *                          { "time_delay": 61, "rider_longitude": 77.61, "rider_latitude": 12.898, "location_accuracy": "10.0", "drop_eta": 3 },
 *                          { "time_delay": 61, "rider_longitude": 77.61, "rider_latitude": 12.898, "location_accuracy": "10.0", "drop_eta": 3 },
 *                          { "time_delay": 31, "order_status": "ARRIVED_CUSTOMER_DOORSTEP", "rider_longitude": 77.611, "rider_latitude": 12.896, "drop_eta": 1 },
 *                          { "time_delay": 6, "order_status": "DELIVERED", "rider_longitude": 77.611, "rider_latitude": 12.896 }
 *                      ]
 *                  }
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

/**
 * @openapi
 *paths:
 *  "/core/callback/admin/shadowfax/startFakeOrder/{id}":
 *    get:
 *      description: " get fake callbacks "
 *      tags:
 *      - Testing/Development
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      parameters:
 *      - in: path
 *        name: id
 *        description: All / ID
 *        required: true
 *        example: All
 *        schema:
 *          type: string
 *      responses:
 *        '200':
 *          description: " order placed "
 */

/**
 * @openapi
 *paths:
 *  "/core/callback/admin/shadowfax/startFakeOrder/{id}":
 *    delete:
 *      description: " delete fake callbacks "
 *      tags:
 *      - Testing/Development
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      parameters:
 *      - in: path
 *        name: id
 *        description: All / ID
 *        required: true
 *        example: All
 *        schema:
 *          type: string
 *      responses:
 *        '200':
 *          description: " order placed "
 */

/**
 * @openapi
 *"/core/callback/shadowfax/order_status":
 *  post:
 *    description: "Sfx Callback"
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
 *                    "sfx_order_id": 20726168,
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
 *                    "sfx_order_id": 20726168,
 *                    "client_order_id": "1032",
 *                    "order_status":"ARRIVED",
 *                    "rider_contact": "9898989898",
 *                    "rider_latitude": 12.343424,
 *                    "rider_longitude": 77.987987987,
 *                    "track_url":"http://api.shadowfax.in/track/",
 *                    "pickup_eta": 3,
 *                    "drop_eta": 18
 *                }
 *            DISPATCHED:
 *              summry: DISPATCHED
 *              value:
 *                {
 *                    "dispatch_time":"2017-11-30T09:25:17.000000Z",
 *                    "rider_name":"Amit Kumar",
 *                    "sfx_order_id": 20726168,
 *                    "client_order_id": "1032",
 *                    "order_status":"DISPATCHED",
 *                    "rider_contact": "9898989898",
 *                    "rider_latitude": 12.343424,
 *                    "rider_longitude": 77.987987987,
 *                    "track_url":"http://api.shadowfax.in/track/",
 *                    "pickup_eta": null,
 *                    "drop_eta": 15
 *                }
 *            ARRIVED_CUSTOMER_DOORSTEP:
 *              summry: ARRIVED_CUSTOMER_DOORSTEP
 *              value:
 *                {
 *                    "customer_doorstep_arrival_time":"2017-11-30T09:25:17.000000Z",
 *                    "rider_name":"Amit Kumar",
 *                    "sfx_order_id": 20726168,
 *                    "client_order_id": "1032",
 *                    "order_status":"ARRIVED_CUSTOMER_DOORSTEP",
 *                    "rider_contact": "9898989898",
 *                    "rider_latitude": 12.343424,
 *                    "rider_longitude": 77.987987987,
 *                    "track_url":"http://api.shadowfax.in/track/",
 *                    "pickup_eta": null,
 *                    "drop_eta": 5
 *                }
 *            DELIVERED:
 *              summry: DELIVERED
 *              value:
 *                {
 *                    "delivery_time":"2017-11-30T09:25:17.000000Z",
 *                    "rider_name":"Amit Kumar",
 *                    "sfx_order_id": 20726168,
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
 *                    "sfx_order_id": 20726168,
 *                    "client_order_id": "1032",
 *                    "order_status":"CANCELLED",
 *                    "rider_contact": "9898989898",
 *                    "rider_latitude": 12.343424,
 *                    "rider_longitude": 77.987987987,
 *                    "track_url":"http://api.shadowfax.in/track/",
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
 *"/core/callback/shadowfax/rider_location_update":
 *  post:
 *    description: "Sfx Callback"
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
 *               "sfx_rider_id": 3419,
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
