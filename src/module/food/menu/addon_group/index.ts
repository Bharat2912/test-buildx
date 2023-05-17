import express from 'express';
import * as controller from './controller';

const vendor_routes = express.Router();
const admin_routes = express.Router();

admin_routes.post('/', controller.admin_createAddonGroup);
admin_routes.get('/', controller.admin_readAddonGroups);
admin_routes.put('/:id', controller.admin_updateAddonGroup);
admin_routes.post('/:id/in_stock', controller.admin_inStockAddonGroup);
admin_routes.delete('/:id', controller.admin_deleteAddonGroup);

vendor_routes.post('/', controller.createAddonGroup);
vendor_routes.get('/', controller.readAddonGroups);
vendor_routes.put('/:id', controller.updateAddonGroup);
vendor_routes.post('/:id/in_stock', controller.inStockAddonGroup);
vendor_routes.delete('/:id', controller.deleteAddonGroup);

export default {vendor_routes, admin_routes};

/** GET ADMIN
 * @openapi
 *paths:
 *  "/food/admin/menu/addon_group":
 *    get:
 *      tags:
 *      - Menu >> Addon Group
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      description: Get All Addon groups of vendors restaurant
 *      parameters:
 *      - in: query
 *        name: restaurant_id
 *        type: number
 *        example: 19
 *        description: Read all addon group
 *      responses:
 *        '200':
 *          description: Get Successfully
 *        '500':
 *          description: Internal Server Error
 */

/** POST ADMIN
 * @openapi
 *paths:
 *  "/food/admin/menu/addon_group":
 *    post:
 *      tags:
 *      - Menu >> Addon Group
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      description: Create Addon Group
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            description: Document
 *            schema:
 *              type: object
 *              properties:
 *                restaurant_id:
 *                  type: string
 *                  example: 123213-dsfsf234234-sddsf-34qw
 *                name:
 *                  type: string
 *                  example: Drinks
 *      responses:
 *        '201':
 *          description: Created Successfully
 *        '400':
 *          description: Validation Error
 *        '500':
 *          description: Internal Server Error
 */

/** PUT ADMIN
 * @openapi
 *paths:
 *  "/food/admin/menu/addon_group/{id}":
 *    put:
 *      tags:
 *      - Menu >> Addon Group
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      parameters:
 *      - in: path
 *        name: id
 *        type: number
 *        example: 19
 *        description: Update Addon Group
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            description: Document
 *            schema:
 *              type: object
 *              properties:
 *                name:
 *                  type: string
 *                  example: Drinks
 *      responses:
 *        '201':
 *          description: Updated Successfully
 *        '400':
 *          description: Validation Error
 *        '500':
 *          description: Internal Server Error
 */

/** POST ADMIN
 * @openapi
 *paths:
 *  "/food/admin/menu/addon_group/{id}/in_stock":
 *    post:
 *      tags:
 *      - Menu >> Addon Group
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      description: in Stock Addon Group
 *      parameters:
 *      - in: path
 *        name: id
 *        type: number
 *        example: 19
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            description: Document
 *            schema:
 *              type: object
 *              properties:
 *                in_stock:
 *                  type: boolean
 *                  example: false
 *      responses:
 *        '201':
 *          description: Created Successfully
 *        '400':
 *          description: Validation Error
 *        '500':
 *          description: Internal Server Error
 */

/** DELETE ADMIN
 * @openapi
 *paths:
 *  "/food/admin/menu/addon_group/{id}":
 *    delete:
 *      tags:
 *      - Menu >> Addon Group
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      parameters:
 *      - in: path
 *        name: id
 *        type: number
 *        example: 19
 *        description: Update Addon Group
 *      responses:
 *        '201':
 *          description: Deleted Successfully
 *        '400':
 *          description: Validation Error
 *        '500':
 *          description: Internal Server Error
 */

/** GET
 * @openapi
 *paths:
 *  "/food/vendor/menu/addon_group":
 *    get:
 *      tags:
 *      - Menu >> Addon Group
 *      security:
 *      - bearerAuthVendor: []
 *      summary: "Vendor Auth"
 *      description: Get All Addon groups of vendors restaurant
 *      responses:
 *        '200':
 *          description: Get Successfully
 *        '500':
 *          description: Internal Server Error
 */

/** POST
 * @openapi
 *paths:
 *  "/food/vendor/menu/addon_group":
 *    post:
 *      tags:
 *      - Menu >> Addon Group
 *      security:
 *      - bearerAuthVendor: []
 *      summary: "Vendor Auth"
 *      description: Create Addon Group
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            description: Document
 *            schema:
 *              type: object
 *              properties:
 *                name:
 *                  type: string
 *                  example: Drinks
 *      responses:
 *        '201':
 *          description: Created Successfully
 *        '400':
 *          description: Validation Error
 *        '500':
 *          description: Internal Server Error
 */

/** PUT
 * @openapi
 *paths:
 *  "/food/vendor/menu/addon_group/{id}":
 *    put:
 *      tags:
 *      - Menu >> Addon Group
 *      security:
 *      - bearerAuthVendor: []
 *      summary: "Vendor Auth"
 *      parameters:
 *      - in: path
 *        name: id
 *        type: number
 *        example: 19
 *        description: Update Addon Group
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            description: Document
 *            schema:
 *              type: object
 *              properties:
 *                name:
 *                  type: string
 *                  example: Drinks
 *      responses:
 *        '201':
 *          description: Updated Successfully
 *        '400':
 *          description: Validation Error
 *        '500':
 *          description: Internal Server Error
 */

/** POST
 * @openapi
 *paths:
 *  "/food/vendor/menu/addon_group/{id}/in_stock":
 *    post:
 *      tags:
 *      - Menu >> Addon Group
 *      security:
 *      - bearerAuthVendor: []
 *      summary: "Vendor Auth"
 *      description: in Stock Addon Group
 *      parameters:
 *      - in: path
 *        name: id
 *        type: number
 *        example: 19
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            description: Document
 *            schema:
 *              type: object
 *              properties:
 *                in_stock:
 *                  type: boolean
 *                  example: false
 *      responses:
 *        '201':
 *          description: Created Successfully
 *        '400':
 *          description: Validation Error
 *        '500':
 *          description: Internal Server Error
 */

/** DELETE
 * @openapi
 *paths:
 *  "/food/vendor/menu/addon_group/{id}":
 *    delete:
 *      tags:
 *      - Menu >> Addon Group
 *      security:
 *      - bearerAuthVendor: []
 *      summary: "Vendor Auth"
 *      parameters:
 *      - in: path
 *        name: id
 *        type: number
 *        example: 19
 *        description: Update Addon Group
 *      responses:
 *        '201':
 *          description: Deleted Successfully
 *        '400':
 *          description: Validation Error
 *        '500':
 *          description: Internal Server Error
 */
