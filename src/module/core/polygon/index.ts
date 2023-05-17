import express from 'express';
import * as controller from './controller';

const admin_routes = express.Router();
const partner_routes = express.Router();
const internal_routes = express.Router();

partner_routes.get('/', controller.readPolygonByCity);

admin_routes.post('/', controller.createPolygon);
admin_routes.post('/filter', controller.readPolygonsByCityIds);
admin_routes.get('/:id', controller.readPolygonById);
admin_routes.delete('/:id', controller.deletePolygonById);
admin_routes.get('/', controller.readAllPolygons);

internal_routes.get('/:id', controller.readPolygonById);
internal_routes.get('/', controller.readAllPolygons);

export default {admin_routes, partner_routes, internal_routes};

/**
 * @openapi
 *"/core/partner/polygon":
 *  get:
 *    description: "Get Polygon By Id"
 *    parameters:
 *    - in: query
 *      name: city_id
 *      description: Get Polygones by city id
 *      required: true
 *      schema:
 *        type: string
 *    tags:
 *    - Polygon
 *    security:
 *    - bearerAuthPartner: []
 *    summary: Partner Auth
 *    responses:
 *      '200':
 *        description: Got polygon list
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/**
 * @openapi
 *"/core/admin/polygon/filter":
 *  post:
 *    description: "Get Polygon By City Ids"
 *    tags:
 *    - Polygon
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
 *           type: object
 *           properties:
 *              filter:
 *                type: object
 *                example: {
 *                  city_ids: ["f0c8c345-89c2-4d03-93c9-64805964c363","f0c8c345-89c2-4d03-93c9-64805964c363"]
 *                         }
 *      required: true
 *    responses:
 *      '200':
 *        description: Got Polygon list
 *        schema:
 *          type: object
 *      '401':
 *        description: Unauthorized
 *      '403':
 *        description: " Input Data Validation Error "
 *      '500':
 *        description: Internal Server Error
 */

/**
 * @openapi
 *"/core/admin/polygon":
 *  get:
 *    description: "Get list of all polygon"
 *    tags:
 *    - Polygon
 *    security:
 *    - bearerAuthAdmin: []
 *    summary: "Admin Auth"
 *    responses:
 *      '200':
 *        description: Got polygon list
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/**
 * @openapi
 *"/core/admin/polygon":
 *  post:
 *    description: "Create New Polygon"
 *    tags:
 *    - Polygon
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
 *              name:
 *                type: string
 *                example: Navi Mumbai
 *              city_id:
 *                type: string
 *                example: 542dfa07-21d6-41f2-ad5f-548cc7a020b6
 *              coordinates:
 *                type: array
 *                items:
 *                  type: array
 *                  items:
 *                    type: number
 *                  example: [0.123456789,9.87654321]
 *      required: true
 *    responses:
 *      '200':
 *        description: Successfully Created Polygon
 *        schema:
 *          type: object
 *      '401':
 *        description: Unauthorized
 *      '403':
 *        description: " Input Data Validation Error "
 *      '500':
 *        description: Internal Server Error
 */

/**
 * @openapi
 *"/core/admin/polygon/{id}":
 *  get:
 *    description: "Get Polygon By Id"
 *    parameters:
 *    - in: path
 *      name: id
 *      description: get polygon
 *      required: true
 *      schema:
 *        type: string
 *    tags:
 *    - Polygon
 *    security:
 *    - bearerAuthAdmin: []
 *    summary: "Admin Auth"
 *    responses:
 *      '200':
 *        description: Got polygon list
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/**
 * @openapi
 *"/core/admin/polygon/{id}":
 *  delete:
 *    description: "Delete Polygon By Id"
 *    parameters:
 *    - in: path
 *      name: id
 *      description: delete polygon
 *      required: true
 *      schema:
 *        type: string
 *    tags:
 *    - Polygon
 *    security:
 *    - bearerAuthAdmin: []
 *    summary: "Admin Auth"
 *    responses:
 *      '200':
 *        description: Got polygon list
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */
