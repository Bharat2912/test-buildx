import express from 'express';
import * as controller from './controller';

const admin_routes = express.Router();
const partner_routes = express.Router();
const internal_routes = express.Router();

partner_routes.get('/', controller.readActiveCity);

admin_routes.post('/', controller.createCity);
admin_routes.get('/:id', controller.readCityById);
admin_routes.put('/:id', controller.updateCity);
admin_routes.delete('/:id', controller.deleteCityById);
admin_routes.get('/', controller.readAllCity);

internal_routes.get('/:id', controller.readCityById);
internal_routes.get('/', controller.readAllCity);

export default {admin_routes, partner_routes, internal_routes};

/** GET - PARTNER
 * @openapi
 * "/core/partner/city":
 *  get:
 *    description: "Get list of active Cities"
 *    tags:
 *    - City
 *    security:
 *    - bearerAuthPartner: []
 *    summary: Partner Auth
 *    responses:
 *      '200':
 *        description:  Get All city list
 *      '401':
 *        description:  Unauthorized
 *      '500':
 *        description:  Internal Server Error
 */

/** GET - ALL Cities
 * @openapi
 * "/core/admin/city":
 *  get:
 *    description: "Get all City"
 *    tags:
 *    - City
 *    security:
 *    - bearerAuthAdmin: []
 *    summary: "Admin Auth"
 *    responses:
 *      '200':
 *        description: Get All city Status
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/** GET    - :ID - ADMIN
 * @openapi
 *"/core/admin/city/{id}":
 *  get:
 *    description: "Get city By Id"
 *    tags:
 *    - City
 *    security:
 *    - bearerAuthAdmin: []
 *    summary: "Admin Auth"
 *    parameters:
 *    - in: path
 *      name: id
 *      description: Get City
 *      required: true
 *      schema:
 *        type: string
 *    responses:
 *      '200':
 *        description: Successfully Got city
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/** POST   - CREATE - ADMIN
 * @openapi
 *"/core/admin/city":
 *  post:
 *    description: "Create New city"
 *    tags:
 *    - City
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
 *                example: Mumbai
 *              status:
 *                type: string
 *                example: active-inactive
 *      required: true
 *    responses:
 *      '200':
 *        description: Successfully Created city
 *      '401':
 *        description: Unauthorized
 *      '403':
 *        description: Input Data Validation Error
 *      '500':
 *        description: Internal Server Error
 */

/** PUT    - :ID ADMIN
 * @openapi
 *"/core/admin/city/{id}":
 *  put:
 *    description: " Updating City "
 *    tags:
 *    - City
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
 *              name:
 *                type: string
 *                example: Bangalore
 *              status:
 *                type: string
 *                example: active-inactive
 *      required: true
 *    responses:
 *      '200':
 *        description: Updated City list
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/** Delete - :ID - ADMIN
 * @openapi
 *"/core/admin/city/{id}":
 *  delete:
 *    description: "Delete City By Id"
 *    security:
 *    - bearerAuthAdmin: []
 *    summary: "Admin Auth"
 *    tags:
 *    - City
 *    parameters:
 *    - in: path
 *      name: id
 *      required: true
 *      schema:
 *        type: string
 *    responses:
 *      '200':
 *        description: City is Deleted
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */
