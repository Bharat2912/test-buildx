import express from 'express';
import * as controller from './controller';

const petpooja_routes = express.Router();
const admin_routes = express.Router();

petpooja_routes.post('/push_menu', controller.pushPetPoojaMenu);
petpooja_routes.post('/get_store_status', controller.getRestaurantStatus);
petpooja_routes.post('/update_store_status', controller.updateRestaurantStatus);
petpooja_routes.post('/item_in_stock', controller.itemAddonInStock);
petpooja_routes.post('/item_out_of_stock', controller.itemAddonOutStock);
petpooja_routes.post('/update_order', controller.update_order);

admin_routes.get('/onboard/:restaurant_id', controller.getOnboardRestaurant);
admin_routes.post('/initiate/:restaurant_id', controller.initOnboardRestaurant);
admin_routes.put('/onboard/:restaurant_id', controller.updateOnboardRestaurant);
admin_routes.post('/onboard/:restaurant_id', controller.onboardRestaurant);
admin_routes.get('/fetch_menu/:restaurant_id', controller.fetchPetpoojaMenu);
admin_routes.post('/detach/:restaurant_id', controller.detachRestaurant);

export default {petpooja_routes, admin_routes};

/**
 * @openapi
 *paths:
 *  "/food/admin/petpooja/onboard/{restaurant_id}":
 *    get:
 *      description: "Get Onboarding details of Restaurant on petpooja"
 *      tags:
 *      - PetPooja
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      parameters:
 *       - in: path
 *         name: restaurant_id
 *         description: restaurant_id id
 *         type: string
 *         example: "78c17283-457d-4cb0-a117-192dba41e88e"
 *      responses:
 *        '200':
 *          description: "Successful Response"
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
 *  "/food/admin/petpooja/initiate/{restaurant_id}":
 *    post:
 *      description: "Initiate Onboard Restaurant on petpooja"
 *      tags:
 *      - PetPooja
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      parameters:
 *       - in: path
 *         name: restaurant_id
 *         description: restaurant_id id
 *         type: string
 *         example: "78c17283-457d-4cb0-a117-192dba41e88e"
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            description: Send post Data
 *            schema:
 *              type: object
 *            examples:
 *              Example-1:
 *                summry: Example-1
 *                value:
 *                  {
 *                      "pos_restaurant_id": "4332",
 *                  }
 *      responses:
 *        '200':
 *          description: "Successful Response"
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
 *  "/food/admin/petpooja/onboard/{restaurant_id}":
 *    put:
 *      description: "Update Onboard Restaurant on petpooja"
 *      tags:
 *      - PetPooja
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      parameters:
 *       - in: path
 *         name: restaurant_id
 *         description: restaurant_id id
 *         type: string
 *         example: "78c17283-457d-4cb0-a117-192dba41e88e"
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            description: Send post Data
 *            schema:
 *              type: object
 *            examples:
 *              Example-1:
 *                summry: Example-1
 *                value:
 *                  {
 *                      "pos_id": "pos_ididid",
 *                      "pos_status": "init",
 *                      "pos_restaurant_id": "pos_restaurant_id",
 *                      "details": {}
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
 *  "/food/admin/petpooja/onboard/{restaurant_id}":
 *    post:
 *      description: "Onboard Restaurant on petpooja"
 *      tags:
 *      - PetPooja
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      parameters:
 *       - in: path
 *         name: restaurant_id
 *         description: restaurant_id id
 *         type: string
 *         example: "78c17283-457d-4cb0-a117-192dba41e88e"
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            description: Send post Data
 *            schema:
 *              type: object
 *            examples:
 *              Example-1:
 *                summry: Example-1
 *                value:
 *                  {
 *                  }
 *      responses:
 *        '200':
 *          description: "Successful Response"
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
 *  "/food/admin/petpooja/detach/{restaurant_id}":
 *    post:
 *      description: "Detach Restaurant From petpooja"
 *      tags:
 *      - PetPooja
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      parameters:
 *       - in: path
 *         name: restaurant_id
 *         description: restaurant_id id
 *         type: string
 *         example: "78c17283-457d-4cb0-a117-192dba41e88e"
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            description: Send post Data
 *            schema:
 *              type: object
 *            examples:
 *              Example-1:
 *                summry: Example-1
 *                value:
 *                  {
 *                  }
 *      responses:
 *        '200':
 *          description: "Successful Response"
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
 *  "/food/admin/petpooja/fetch_menu/{restaurant_id}":
 *    get:
 *      description: "Fetch and sync menu from petpooja into speedyy"
 *      tags:
 *      - PetPooja
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      parameters:
 *       - in: path
 *         name: restaurant_id
 *         description: restaurant_id id
 *         type: string
 *         example: "78c17283-457d-4cb0-a117-192dba41e88e"
 *      responses:
 *        '200':
 *          description: "Successful Response"
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
 *  "/food/callback/petpooja/push_menu":
 *    post:
 *      description: " push menu "
 *      tags:
 *      - PetPooja
 *      security:
 *      - bearerAuthUser: []
 *      summary: "Petpooja Auth"
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            description: Customer Auth
 *            schema:
 *              type: object
 *      responses:
 *        '200':
 *          description: "Successful Response"
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
 *  "/food/callback/petpooja/get_store_status":
 *    post:
 *      description: " UpdateStore Status"
 *      tags:
 *      - PetPooja
 *      security:
 *      - bearerAuthUser: []
 *      summary: "Petpooja Auth"
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            description: Customer Auth
 *            schema:
 *              type: object
 *      responses:
 *        '200':
 *          description: "Successful Response"
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
 *  "/food/callback/petpooja/update_store_status":
 *    post:
 *      description: " UpdateStore Status"
 *      tags:
 *      - PetPooja
 *      security:
 *      - bearerAuthUser: []
 *      summary: "Petpooja Auth"
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            description: Customer Auth
 *            schema:
 *              type: object
 *      responses:
 *        '200':
 *          description: "Successful Response"
 *        '400':
 *          description: " Bad Request "
 *        '401':
 *          description: " Unauthorized "
 *        '500':
 *          description: " Internal Server Error "
 */
