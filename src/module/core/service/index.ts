import express from 'express';
import * as controller from './controller';

const customer_routes = express.Router();
const admin_routes = express.Router();

customer_routes.get('/', controller.getServices);

admin_routes.get('/:id', controller.readServiceById);
admin_routes.put('/:id', controller.updateService);
admin_routes.get('/', controller.getServices);

export default {customer_routes, admin_routes};

/**
 * @openapi
 *"/core/service":
 *  get:
 *    description: "Get list of all active services"
 *    tags:
 *    - Service
 *    responses:
 *      '200':
 *        description: Got active Service list
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: " Internal Server Error "
 */

/**
 * @openapi
 *"/core/admin/service":
 *  get:
 *    description: "Get list of all services"
 *    tags:
 *    - Service
 *    security:
 *    - bearerAuthAdmin: []
 *    summary: "Admin Auth"
 *    responses:
 *      '200':
 *        description: Got Service list
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: " Internal Server Error "
 */

/**
 * @openapi
 *"/core/admin/service/{id}":
 *  get:
 *    description: "Get service by id"
 *    tags:
 *    - Service
 *    security:
 *    - bearerAuthAdmin: []
 *    summary: "Admin Auth"
 *    parameters:
 *    - in: path
 *      name: id
 *      description: get_id
 *      required: true
 *      schema:
 *        type: string
 *    produces:
 *    - application/json
 *    responses:
 *      '200':
 *        description: Got Service list
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: " Internal Server Error "
 */

/**
 * @openapi
 *"/core/admin/service/{id}":
 *    put:
 *      tags:
 *      - Service
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      description: Updated Service details
 *      parameters:
 *      - in: path
 *        name: id
 *        description: get_id
 *        required: true
 *        schema:
 *          type: string
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            description: Service details
 *            schema:
 *              type: object
 *              properties:
 *                name:
 *                  type: string
 *                  example: Food
 *                image_name:
 *                  type: string
 *                  example: "25887d2c-4dc4-42a1-9e3d-62a6f0c33cae.jpg"
 *                  description: image path in s3 bucket
 *        required: true
 *      produces:
 *      - application/json
 *      responses:
 *        '200':
 *          description: " Email Id Updated Successfully"
 *        '403':
 *          description: " Validation Error "
 *        '409':
 *          description: " Phone already exists, Please login"
 *        '500':
 *          description: " Internal Server Error "
 */
