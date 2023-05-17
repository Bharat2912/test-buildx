import express from 'express';
import * as controller from './controller';

const vendor_routes = express.Router();
const admin_routes = express.Router();

admin_routes.put('/sequence/:parent_id', controller.setMainCategorySequence);
admin_routes.post('/', controller.admin_createMainCategory);
admin_routes.get('/', controller.admin_readMainCategories);
admin_routes.put('/:id', controller.admin_updateMainCategory);
admin_routes.post(
  '/:id/createHolidaySlot',
  controller.admin_availableAfterMainCategory
);
admin_routes.delete('/:id', controller.admin_deleteMainCategory);

vendor_routes.put('/sequence', controller.setMainCategorySequence);
vendor_routes.post('/', controller.createMainCategory);
vendor_routes.get('/', controller.readMainCategories);
vendor_routes.put('/:id', controller.updateMainCategory);
vendor_routes.post(
  '/:id/createHolidaySlot',
  controller.availableAfterMainCategory
);
vendor_routes.delete('/:id', controller.deleteMainCategory);

export default {vendor_routes, admin_routes};

/** PUT SET SUB CATEGORY SEQUENCE ADMIN
 * @openapi
 *paths:
 *  "/food/admin/menu/main_category/sequence/{parent_id}":
 *    put:
 *      tags:
 *      - Menu >> Main Category
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      description: Set sequence
 *      parameters:
 *      - in: path
 *        name: parent_id
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
 *                sorted_ids:
 *                  type: array
 *                  items:
 *                    type: number
 *                  example: [1,2,3,4,5]
 *      responses:
 *        '201':
 *          description: Successfully
 *        '400':
 *          description: Validation Error
 *        '500':
 *          description: Internal Server Error
 */

/** PUT SET SUB CATEGORY SEQUENCE VENDOR
 * @openapi
 *paths:
 *  "/food/vendor/menu/main_category/sequence":
 *    put:
 *      tags:
 *      - Menu >> Main Category
 *      security:
 *      - bearerAuthVendor: []
 *      summary: "Vendor Auth"
 *      description: Set sequence
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            description: Document
 *            schema:
 *              type: object
 *              properties:
 *                sorted_ids:
 *                  type: array
 *                  items:
 *                    type: number
 *                  example: [1,2,3,4,5]
 *      responses:
 *        '201':
 *          description: Successfully
 *        '400':
 *          description: Validation Error
 *        '500':
 *          description: Internal Server Error
 */

/** GET ADMIN
 * @openapi
 *paths:
 *  "/food/admin/menu/main_category":
 *    get:
 *      tags:
 *      - Menu >> Main Category
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      description: Get All Addon groups of vendors restaurant
 *      parameters:
 *      - in: query
 *        name: restaurant_id
 *        type: number
 *        example: 19
 *        description: Read all Main Category
 *      responses:
 *        '200':
 *          description: Get Successfully
 *        '500':
 *          description: Internal Server Error
 */

/** POST ADMIN
 * @openapi
 *paths:
 *  "/food/admin/menu/main_category":
 *    post:
 *      tags:
 *      - Menu >> Main Category
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      description: Create Main Category
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
 *                  example: Gujrati Thali
 *                restaurant_id:
 *                  type: string
 *                  example: 120800912-1238789123-12jhgj-scdu
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
 *  "/food/admin/menu/main_category/{id}":
 *    put:
 *      tags:
 *      - Menu >> Main Category
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      parameters:
 *      - in: path
 *        name: id
 *        type: number
 *        example: 19
 *        description: Update Main Category
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
 *                  example: South Indian
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
 *  "/food/admin/menu/main_category/{id}/createHolidaySlot":
 *    post:
 *      tags:
 *      - Menu >> Main Category
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      description: Available After Main Category
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
 *                end_epoch:
 *                  type: number
 *                  example: 1234567890
 *      responses:
 *        '201':
 *          description: set Successfully
 *        '400':
 *          description: Validation Error
 *        '500':
 *          description: Internal Server Error
 */

/** DELETE ADMIN
 * @openapi
 *paths:
 *  "/food/admin/menu/main_category/{id}":
 *    delete:
 *      tags:
 *      - Menu >> Main Category
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      parameters:
 *      - in: path
 *        name: id
 *        type: number
 *        example: 19
 *        description: Update Main Category
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
 *  "/food/vendor/menu/main_category":
 *    get:
 *      tags:
 *      - Menu >> Main Category
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
 *  "/food/vendor/menu/main_category":
 *    post:
 *      tags:
 *      - Menu >> Main Category
 *      security:
 *      - bearerAuthVendor: []
 *      summary: "Vendor Auth"
 *      description: Create Main Category
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
 *                  example: Gujrati Thali
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
 *  "/food/vendor/menu/main_category/{id}":
 *    put:
 *      tags:
 *      - Menu >> Main Category
 *      security:
 *      - bearerAuthVendor: []
 *      summary: "Vendor Auth"
 *      parameters:
 *      - in: path
 *        name: id
 *        type: number
 *        example: 19
 *        description: Update Main Category
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
 *                  example: South Indian
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
 *  "/food/vendor/menu/main_category/{id}/createHolidaySlot":
 *    post:
 *      tags:
 *      - Menu >> Main Category
 *      security:
 *      - bearerAuthVendor: []
 *      summary: "Vendor Auth"
 *      description: Available After Main Category
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
 *                end_epoch:
 *                  type: number
 *                  example: 1234567890
 *      responses:
 *        '201':
 *          description: set Successfully
 *        '400':
 *          description: Validation Error
 *        '500':
 *          description: Internal Server Error
 */

/** DELETE
 * @openapi
 *paths:
 *  "/food/vendor/menu/main_category/{id}":
 *    delete:
 *      tags:
 *      - Menu >> Main Category
 *      security:
 *      - bearerAuthVendor: []
 *      summary: "Vendor Auth"
 *      parameters:
 *      - in: path
 *        name: id
 *        type: number
 *        example: 19
 *        description: Update Main Category
 *      responses:
 *        '201':
 *          description: Deleted Successfully
 *        '400':
 *          description: Validation Error
 *        '500':
 *          description: Internal Server Error
 */
