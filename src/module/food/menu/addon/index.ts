import express from 'express';
import * as controller from './controller';

const vendor_routes = express.Router();
const admin_routes = express.Router();

admin_routes.post('/', controller.admin_createAddon);
admin_routes.get('/', controller.admin_readAddons);
admin_routes.put('/:id', controller.admin_updateAddon);
admin_routes.post('/:id/in_stock', controller.admin_inStockAddon);
admin_routes.delete('/:id', controller.admin_deleteAddon);

vendor_routes.post('/', controller.createAddon);
vendor_routes.get('/', controller.readAddons);
vendor_routes.put('/:id', controller.updateAddon);
vendor_routes.post('/:id/in_stock', controller.inStockAddon);
vendor_routes.delete('/:id', controller.deleteAddon);

export default {vendor_routes, admin_routes};

/** GET ADMIN
 * @openapi
 *paths:
 *  "/food/admin/menu/addon":
 *    get:
 *      tags:
 *      - Menu >> Addon
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      description: Get All Addons of addon group
 *      parameters:
 *      - in: query
 *        name: addon_group_id
 *        type: number
 *        example: 19
 *      responses:
 *        '200':
 *          description: get successful
 *        '400':
 *          description: Validation Error
 *        '500':
 *          description: Internal Server Error
 */

/** POST ADMIN
 * @openapi
 *paths:
 *  "/food/admin/menu/addon":
 *    post:
 *      tags:
 *      - Menu >> Addon
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      description: Create Addon
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            description: Document
 *            schema:
 *              type: object
 *              properties:
 *                addon_group_id:
 *                  type: number
 *                  example: 19
 *                name:
 *                  type: string
 *                  example: Chilli
 *                sequence:
 *                  type: number
 *                  example: 91
 *                price:
 *                  type: number
 *                  example: 12.50
 *                veg_egg_non:
 *                  type: string
 *                  example: veg
 *                sgst_rate:
 *                  type: number
 *                  example: 12.50
 *                cgst_rate:
 *                  type: number
 *                  example: 12.50
 *                igst_rate:
 *                  type: number
 *                  example: 12.50
 *                gst_inclusive:
 *                  type: boolean
 *                  example: true
 *                external_id:
 *                  type: string
 *                  example: ght-128978912bkj129
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

/** PUT ADMIN
 * @openapi
 *paths:
 *  "/food/admin/menu/addon/{id}":
 *    put:
 *      tags:
 *      - Menu >> Addon
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      description: Update Addon
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
 *                addon_group_id:
 *                  type: number
 *                  example: 19
 *                name:
 *                  type: string
 *                  example: Tomato Sause
 *                sequence:
 *                  type: number
 *                  example: 91
 *                price:
 *                  type: number
 *                  example: 12.50
 *                veg_egg_non:
 *                  type: string
 *                  example: veg
 *                sgst_rate:
 *                  type: number
 *                  example: 12.50
 *                cgst_rate:
 *                  type: number
 *                  example: 12.50
 *                igst_rate:
 *                  type: number
 *                  example: 12.50
 *                gst_inclusive:
 *                  type: boolean
 *                  example: true
 *                external_id:
 *                  type: string
 *                  example: Burger
 *                in_stock:
 *                  type: boolean
 *                  example: false
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
 *  "/food/admin/menu/addon/{id}/in_stock":
 *    post:
 *      tags:
 *      - Menu >> Addon
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      description: Addon In Stock
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
 *  "/food/admin/menu/addon/{id}":
 *    delete:
 *      tags:
 *      - Menu >> Addon
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      parameters:
 *      - in: path
 *        name: id
 *        type: number
 *        example: 19
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
 *  "/food/vendor/menu/addon":
 *    get:
 *      tags:
 *      - Menu >> Addon
 *      security:
 *      - bearerAuthVendor: []
 *      summary: "Vendor Auth"
 *      description: Get All Addons of addon group
 *      parameters:
 *      - in: query
 *        name: addon_group_id
 *        type: number
 *        example: 19
 *      responses:
 *        '200':
 *          description: get successful
 *        '400':
 *          description: Validation Error
 *        '500':
 *          description: Internal Server Error
 */

/** POST
 * @openapi
 *paths:
 *  "/food/vendor/menu/addon":
 *    post:
 *      tags:
 *      - Menu >> Addon
 *      security:
 *      - bearerAuthVendor: []
 *      summary: "Vendor Auth"
 *      description: Create Addon
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            description: Document
 *            schema:
 *              type: object
 *              properties:
 *                addon_group_id:
 *                  type: number
 *                  example: 19
 *                name:
 *                  type: string
 *                  example: Chilli
 *                sequence:
 *                  type: number
 *                  example: 91
 *                price:
 *                  type: number
 *                  example: 12.50
 *                veg_egg_non:
 *                  type: string
 *                  example: veg
 *                sgst_rate:
 *                  type: number
 *                  example: 12.50
 *                cgst_rate:
 *                  type: number
 *                  example: 12.50
 *                igst_rate:
 *                  type: number
 *                  example: 12.50
 *                gst_inclusive:
 *                  type: boolean
 *                  example: true
 *                external_id:
 *                  type: string
 *                  example: ght-128978912bkj129
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
 *  "/food/vendor/menu/addon/{id}":
 *    put:
 *      tags:
 *      - Menu >> Addon
 *      security:
 *      - bearerAuthVendor: []
 *      summary: "Vendor Auth"
 *      description: Update Addon
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
 *                addon_group_id:
 *                  type: number
 *                  example: 19
 *                name:
 *                  type: string
 *                  example: Tomato Sause
 *                sequence:
 *                  type: number
 *                  example: 91
 *                price:
 *                  type: number
 *                  example: 12.50
 *                veg_egg_non:
 *                  type: string
 *                  example: veg
 *                sgst_rate:
 *                  type: number
 *                  example: 12.50
 *                cgst_rate:
 *                  type: number
 *                  example: 12.50
 *                igst_rate:
 *                  type: number
 *                  example: 12.50
 *                gst_inclusive:
 *                  type: boolean
 *                  example: true
 *                external_id:
 *                  type: string
 *                  example: Burger
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
 *  "/food/vendor/menu/addon/{id}/in_stock":
 *    post:
 *      tags:
 *      - Menu >> Addon
 *      security:
 *      - bearerAuthVendor: []
 *      summary: "Vendor Auth"
 *      description: Addon In Stock
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
 *  "/food/vendor/menu/addon/{id}":
 *    delete:
 *      tags:
 *      - Menu >> Addon
 *      security:
 *      - bearerAuthVendor: []
 *      summary: "Vendor Auth"
 *      parameters:
 *      - in: path
 *        name: id
 *        type: number
 *        example: 19
 *      responses:
 *        '201':
 *          description: Deleted Successfully
 *        '400':
 *          description: Validation Error
 *        '500':
 *          description: Internal Server Error
 */
