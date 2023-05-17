import express from 'express';
import * as controller from './controller';

const admin_routes = express.Router();
const vendor_routes = express.Router();
// const customer_routes = express.Router();
const open_routes = express.Router();

admin_routes.get('/:key', controller.readGlobalVarById);
admin_routes.put('/:key', controller.updateGlobalVar);
admin_routes.get('/', controller.readAllGlobalVar);

vendor_routes.get('/', controller.readAllVendorGlobalVar);
open_routes.get('/', controller.readAllCustomerGlobalVar);

export default {admin_routes, vendor_routes, open_routes};

/** GET   All - :ID - ADMIN
 * @openapi
 *"/food/admin/globalVar":
 *  get:
 *    description: "Get global_var By Id"
 *    tags:
 *    - GlobalVar
 *    security:
 *    - bearerAuthAdmin: []
 *    summary: "Admin Auth"
 *    responses:
 *      '200':
 *        description: Successfully Got global_var
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/** GET    - :ID - ADMIN
 * @openapi
 *"/food/admin/globalVar/{key}":
 *  get:
 *    description: "Get global_var By Id"
 *    tags:
 *    - GlobalVar
 *    security:
 *    - bearerAuthAdmin: []
 *    summary: "Admin Auth"
 *    parameters:
 *    - in: path
 *      name: key
 *      description: Get GlobalVar
 *      required: true
 *      schema:
 *        type: string
 *    responses:
 *      '200':
 *        description: Successfully Got global_var
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/** PUT    - :ID ADMIN
 * @openapi
 *"/food/admin/globalVar/{key}":
 *  put:
 *    description: " Updating GlobalVar "
 *    tags:
 *    - GlobalVar
 *    security:
 *    - bearerAuthAdmin: []
 *    summary: "Admin Auth"
 *    parameters:
 *    - in: path
 *      name: key
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
 *              value:
 *                type: string
 *                example: 1
 *              description:
 *                type: string
 *                example: description
 *              access_roles:
 *                type: array
 *                example: ["vendor"]
 *      required: true
 *    responses:
 *      '200':
 *        description: Updated GlobalVar list
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/** GET   All - :ID - vendor
 * @openapi
 *"/food/vendor/globalVar":
 *  get:
 *    description: "Get global_var By Id"
 *    tags:
 *    - GlobalVar
 *    security:
 *    - bearerAuthVendor: []
 *    summary: "Vendor Auth"
 *    responses:
 *      '200':
 *        description: Successfully Got global_var
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/** GET   All - :ID - customer
 * @openapi
 *"/food/globalVar":
 *  get:
 *    description: "Get global_var By Id"
 *    tags:
 *    - GlobalVar
 *    responses:
 *      '200':
 *        description: Successfully Got global_var
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */
