import express from 'express';
import * as controller from './controller';

const vendor_routes = express.Router();
const admin_routes = express.Router();

admin_routes.post('/', controller.admin_createSubcategory);
admin_routes.get('/', controller.admin_readSubCategories);
admin_routes.post(
  '/:id/createHolidaySlot',
  controller.admin_availableAfterSubCategory
);
admin_routes.put('/:id', controller.admin_updateSubCategory);
admin_routes.delete('/:id', controller.admin_deleteSubCategory);
admin_routes.put('/sequence/:parent_id', controller.setSubCategorySequence);

vendor_routes.put('/sequence/:parent_id', controller.setSubCategorySequence);
vendor_routes.post('/', controller.createSubcategory);
vendor_routes.get('/', controller.readSubCategories);
vendor_routes.post(
  '/:id/createHolidaySlot',
  controller.availableAfterSubCategory
);
vendor_routes.put('/:id', controller.updateSubCategory);
vendor_routes.delete('/:id', controller.deleteSubCategory);

export default {vendor_routes, admin_routes};

/** PUT SET SUB CATEGORY SEQUENCE ADMIN
 * @openapi
 *paths:
 *  "/food/admin/menu/sub_category/sequence/{parent_id}":
 *    put:
 *      tags:
 *      - Menu >> Sub Category
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
 *  "/food/vendor/menu/sub_category/sequence/{parent_id}":
 *    put:
 *      tags:
 *      - Menu >> Sub Category
 *      security:
 *      - bearerAuthVendor: []
 *      summary: "Vendor Auth"
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

/** GET ADMIN
 * @openapi
 *paths:
 *  "/food/admin/menu/sub_category":
 *    get:
 *      tags:
 *      - Menu >> Sub Category
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      description: Get All Sub Categories of main category
 *      parameters:
 *      - in: query
 *        name: main_category_id
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
 *  "/food/admin/menu/sub_category":
 *    post:
 *      tags:
 *      - Menu >> Sub Category
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      description: Create Sub Category
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            description: Document
 *            schema:
 *              type: object
 *              properties:
 *                main_category_id:
 *                  type: number
 *                  example: 19
 *                name:
 *                  type: string
 *                  example: Thali
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
 *  "/food/admin/menu/sub_category/{id}":
 *    put:
 *      tags:
 *      - Menu >> Sub Category
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      description: Update Sub Category
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
 *                main_category_id:
 *                  type: number
 *                  example: 19
 *                name:
 *                  type: string
 *                  example: Combo
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
 *  "/food/admin/menu/sub_category/{id}/createHolidaySlot":
 *    post:
 *      tags:
 *      - Menu >> Sub Category
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      description: Available After Sub Category
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
 *  "/food/admin/menu/sub_category/{id}":
 *    delete:
 *      tags:
 *      - Menu >> Sub Category
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
 *  "/food/vendor/menu/sub_category":
 *    get:
 *      tags:
 *      - Menu >> Sub Category
 *      security:
 *      - bearerAuthVendor: []
 *      summary: "Vendor Auth"
 *      description: Get All Sub Categories of main category
 *      parameters:
 *      - in: query
 *        name: main_category_id
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
 *  "/food/vendor/menu/sub_category":
 *    post:
 *      tags:
 *      - Menu >> Sub Category
 *      security:
 *      - bearerAuthVendor: []
 *      summary: "Vendor Auth"
 *      description: Create Sub Category
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            description: Document
 *            schema:
 *              type: object
 *              properties:
 *                main_category_id:
 *                  type: number
 *                  example: 19
 *                name:
 *                  type: string
 *                  example: Thali
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
 *  "/food/vendor/menu/sub_category/{id}":
 *    put:
 *      tags:
 *      - Menu >> Sub Category
 *      security:
 *      - bearerAuthVendor: []
 *      summary: "Vendor Auth"
 *      description: Update Sub Category
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
 *                main_category_id:
 *                  type: number
 *                  example: 19
 *                name:
 *                  type: string
 *                  example: Combo
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
 *  "/food/vendor/menu/sub_category/{id}/createHolidaySlot":
 *    post:
 *      tags:
 *      - Menu >> Sub Category
 *      security:
 *      - bearerAuthVendor: []
 *      summary: "Vendor Auth"
 *      description: Available After Sub Category
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
 *  "/food/vendor/menu/sub_category/{id}":
 *    delete:
 *      tags:
 *      - Menu >> Sub Category
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
