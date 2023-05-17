import express from 'express';
import * as controller from './controller';
import {monitor} from '../../../utilities/metrics/prometheus';

const customer_routes = express.Router();
const admin_routes = express.Router();
const partner_routes = express.Router();

admin_routes.post('/', monitor('create_cuisine'), controller.createCuisine);
admin_routes.get('/:id', monitor('get_cuisine'), controller.readCuisineById);
admin_routes.put('/:id', monitor('put_cuisine'), controller.updateCuisine);
admin_routes.delete(
  '/:id',
  monitor('delete_cuisine'),
  controller.deleteCuisineById
);

customer_routes.get(
  '/',
  monitor('get_all_cuisines'),
  controller.readCuisinesForCustomer
);

partner_routes.get(
  '/',
  monitor('get_all_cuisines'),
  controller.readCuisinesForPartner
);

admin_routes.get('/', monitor('read_cuisine'), controller.readAllCuisine);

export default {customer_routes, admin_routes, partner_routes};

/** GET - ALL CUISINES
 * @openapi
 * "/food/cuisine":
 *  get:
 *    description: "Get list of all Cuisine"
 *    tags:
 *    - Cuisine
 *    responses:
 *      '200':
 *        description: Get All cuisine list
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/** GET - PARTNER
 * @openapi
 * "/food/partner/cuisine":
 *  get:
 *    description: "Get list of all Cuisine"
 *    tags:
 *    - Cuisine
 *    security:
 *    - bearerAuthPartner: []
 *    summary: "Partner Auth"
 *    responses:
 *      '200':
 *        description:  Get All cuisine list
 *      '401':
 *        description:  Unauthorized
 *      '500':
 *        description:  Internal Server Error
 */

/** GET - ALL CUISINES STATUS
 * @openapi
 * "/food/admin/cuisine":
 *  get:
 *    description: "Get status of all Cuisine"
 *    tags:
 *    - Cuisine
 *    security:
 *    - bearerAuthAdmin: []
 *    summary: "Admin Auth"
 *    responses:
 *      '200':
 *        description: " Get All cuisine Status "
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: " Internal Server Error "
 */

/** POST   - CREATE - ADMIN
 * @openapi
 *"/food/admin/cuisine":
 *  post:
 *    description: "Create New cuisine status can be active or in_active only."
 *    tags:
 *    - Cuisine
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
 *                example: Mughlai
 *              status:
 *                type: string
 *                example: active / in_active
 *              image:
 *                type: object
 *                example: { "name" : "25887d2c-4dc4-42a1-9e3d-62a6f0c33cae.jpg"}
 *      required: true
 *    responses:
 *      '200':
 *        description: Successfully Created cuisine
 *        schema:
 *          type: object
 *      '401':
 *        description: Unauthorized
 *      '403':
 *        description: " Input Data Validation Error "
 *      '500':
 *        description: " Internal Server Error "
 */

/** GET    - :ID - ADMIN
 * @openapi
 *"/food/admin/cuisine/{id}":
 *  get:
 *    description: "Get cuisine By Id"
 *    tags:
 *    - Cuisine
 *    security:
 *    - bearerAuthAdmin: []
 *    summary: "Admin Auth"
 *    parameters:
 *    - in: path
 *      name: id
 *      description: Get Cuisine
 *      required: true
 *      schema:
 *        type: string
 *    responses:
 *      '200':
 *        description: " Successfully Got cuisine"
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: " Internal Server Error "
 */

/** PUT    - :ID ADMIN
 * @openapi
 *"/food/admin/cuisine/{id}":
 *  put:
 *    description: " Updating Cuisine status can be active or in_active only."
 *    tags:
 *    - Cuisine
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
 *                example: Mughlai
 *              status:
 *                type: string
 *                example: active / in_active
 *              image:
 *                type: object
 *                example: { "name" : "25887d2c-4dc4-42a1-9e3d-62a6f0c33cae.jpg"}
 *      required: true
 *    responses:
 *      '200':
 *        description: Updated Cuisine list
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: " Internal Server Error "
 */

/** Delete - :ID - ADMIN
 * @openapi
 *"/food/admin/cuisine/{id}":
 *  delete:
 *    description: "Delete Cuisine By Id"
 *    security:
 *    - bearerAuthAdmin: []
 *    summary: "Admin Auth"
 *    tags:
 *    - Cuisine
 *    parameters:
 *    - in: path
 *      name: id
 *      required: true
 *      schema:
 *        type: string
 *    responses:
 *      '200':
 *        description: " Cuisine is Deleted "
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: " Internal Server Error "
 */
