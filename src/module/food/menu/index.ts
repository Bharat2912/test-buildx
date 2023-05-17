import express from 'express';
import * as controller from './controller';
import * as controller_csv from './controller_csv';
import main_category_routes from './main_category';
import sub_category_routes from './sub_category';
import addon_group_routes from './addon_group';
import addon_routes from './addon';

import multer from 'multer';
const upload = multer({storage: multer.memoryStorage()});

const admin_routes = express.Router();
const vendor_routes = express.Router();
const customer_routes = express.Router();

admin_routes.put(
  '/menu_item/sequence/:parent_id',
  controller.setMenuItemSequence
);
admin_routes.put(
  '/item_variant_group/sequence/:parent_id',
  controller.setVariantGroupSequence
);
admin_routes.put(
  '/item_variant/sequence/:parent_id',
  controller.setItemVariantSequence
);
admin_routes.get('/csv/menu_item/sample', controller_csv.downloadMenuItem);
admin_routes.get(
  '/csv/menu_item/:restaurant_ids',
  controller_csv.downloadMenuItem
);
admin_routes.post('/csv/menu_item', controller_csv.s3uploadMenuItem);
admin_routes.post(
  '/csv/file/menu_item',
  upload.single('file'),
  controller_csv.uploadMenuItem
);

admin_routes.get(
  '/csv/menu_item_addon/sample',
  controller_csv.downloadMenuItemAddon
);
admin_routes.get(
  '/csv/menu_item_addon/:restaurant_id',
  controller_csv.downloadMenuItemAddon
);
admin_routes.post(
  '/csv/menu_item_addon',
  upload.single('file'),
  controller_csv.s3uploadMenuItemAddon
);

admin_routes.get(
  '/csv/item_addon_group/sample',
  controller_csv.downloadMenuItemAddonGroup
);
admin_routes.get(
  '/csv/item_addon_group/:restaurant_id',
  controller_csv.downloadMenuItemAddonGroup
);
admin_routes.post(
  '/csv/item_addon_group',
  upload.single('file'),
  controller_csv.s3uploadMenuItemAddonGroup
);

admin_routes.use('/main_category', main_category_routes.admin_routes);
admin_routes.use('/sub_category', sub_category_routes.admin_routes);
admin_routes.use('/addon_group', addon_group_routes.admin_routes);
admin_routes.use('/addon', addon_routes.admin_routes);

admin_routes.get('/discount/:restaurant_id', controller.getMenuDiscount);
admin_routes.put('/discount/:restaurant_id', controller.updateMenuDiscount);
admin_routes.get('/:restaurant_id', controller.admin_getMenuItems);
admin_routes.post('/menu_item/', controller.admin_createMenuItem);
admin_routes.get('/menu_item/:id', controller.admin_getMenuItem);
admin_routes.put('/menu_item/:id', controller.admin_updateMenuItem);
admin_routes.post(
  '/menu_item/:id/createHolidaySlot',
  controller.admin_setMenuItemAvailableAfter
);
admin_routes.delete('/menu_item/:id', controller.admin_deleteMenuItem);

vendor_routes.use('/main_category', main_category_routes.vendor_routes);
vendor_routes.use('/sub_category', sub_category_routes.vendor_routes);
vendor_routes.use('/addon_group', addon_group_routes.vendor_routes);
vendor_routes.use('/addon', addon_routes.vendor_routes);

vendor_routes.put(
  '/menu_item/sequence/:parent_id',
  controller.setMenuItemSequence
);
vendor_routes.put(
  '/item_variant_group/sequence/:parent_id',
  controller.setVariantGroupSequence
);
vendor_routes.put(
  '/item_variant/sequence/:parent_id',
  controller.setItemVariantSequence
);
vendor_routes.post('/menu_item/', controller.createMenuItem);
vendor_routes.get('/menu_item/:id', controller.getMenuItem);
vendor_routes.put('/menu_item/:id', controller.updateMenuItem);
vendor_routes.post(
  '/menu_item/:id/createHolidaySlot',
  controller.setMenuItemAvailableAfter
);
vendor_routes.delete('/menu_item/:id', controller.deleteMenuItem);

vendor_routes.get('/', controller.getMenuAsVendor);
customer_routes.get('/:restaurant_id', controller.getMenu);

export default {admin_routes, customer_routes, vendor_routes};

/** GET FETCH MENU DISCOUNT ADMIN
 * @openapi
 *paths:
 *  "/food/admin/menu/discount/{restaurant_id}":
 *    get:
 *      tags:
 *      - Menu
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      description: Set Discount
 *      parameters:
 *      - in: path
 *        name: restaurant_id
 *        type: string
 *        example: uuid
 *      responses:
 *        '201':
 *          description: Successfully
 *        '400':
 *          description: Validation Error
 *        '500':
 *          description: Internal Server Error
 */

/** PUT SET MENU DISCOUNT ADMIN
 * @openapi
 *paths:
 *  "/food/admin/menu/discount/{restaurant_id}":
 *    put:
 *      tags:
 *      - Menu
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      description: Set Discount
 *      parameters:
 *      - in: path
 *        name: restaurant_id
 *        type: string
 *        example: uuid
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            description: Document
 *            schema:
 *              type: object
 *              example:
 *                {
 *                  restaurant: {
 *                    restaurant_id: "1111-2222-3333-4444",
 *                    discount_rate: 1
 *                  },
 *                  main_categories: [
 *                    {
 *                      main_category_id: 1,
 *                      discount_rate: 2.5
 *                    },
 *                    {
 *                      main_category_id: 2,
 *                      discount_rate: 3
 *                    },
 *                    {
 *                      main_category_id: 3,
 *                      discount_rate: 5
 *                    }
 *                  ],
 *                  sub_categories: [
 *                    {
 *                      sub_category_id: 1,
 *                      discount_rate: 2.5
 *                    },
 *                    {
 *                      sub_category_id: 2,
 *                      discount_rate: 3
 *                    },
 *                    {
 *                      sub_category_id: 3,
 *                      discount_rate: 5
 *                    }
 *                  ],
 *                  menu_items: [
 *                    {
 *                      menu_item_id: 1,
 *                      discount_rate: 2.5
 *                    },
 *                    {
 *                      menu_item_id: 2,
 *                      discount_rate: 3
 *                    },
 *                    {
 *                      menu_item_id: 3,
 *                      discount_rate: 5
 *                    }
 *                  ]
 *                }
 *      responses:
 *        '201':
 *          description: Successfully
 *        '400':
 *          description: Validation Error
 *        '500':
 *          description: Internal Server Error
 */

/** PUT SET MENU ITEM SEQUENCE ADMIN
 * @openapi
 *paths:
 *  "/food/admin/menu/menu_item/sequence/{parent_id}":
 *    put:
 *      tags:
 *      - Menu >> Menu Item
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

/** PUT SET ITEM VARIANT GROUP SEQUENCE ADMIN
 * @openapi
 *paths:
 *  "/food/admin/menu/item_variant_group/sequence/{parent_id}":
 *    put:
 *      tags:
 *      - Menu >> Menu Item
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

/** PUT SET ITEM VARIANT SEQUENCE ADMIN
 * @openapi
 *paths:
 *  "/food/admin/menu/item_variant/sequence/{parent_id}":
 *    put:
 *      tags:
 *      - Menu >> Menu Item
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

/** PUT SET MENU ITEM SEQUENCE VENDOR
 * @openapi
 *paths:
 *  "/food/vendor/menu/menu_item/sequence/{parent_id}":
 *    put:
 *      tags:
 *      - Menu >> Menu Item
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

/** PUT SET ITEM VARIANT GROUP SEQUENCE VENDOR
 * @openapi
 *paths:
 *  "/food/vendor/menu/item_variant_group/sequence/{parent_id}":
 *    put:
 *      tags:
 *      - Menu >> Menu Item
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

/** PUT SET ITEM VARIANT SEQUENCE VENDOR
 * @openapi
 *paths:
 *  "/food/vendor/menu/item_variant/sequence/{parent_id}":
 *    put:
 *      tags:
 *      - Menu >> Menu Item
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

/** GET - DOWNLOAD MENU ITEM CSV
 * @openapi
 *"/food/admin/menu/csv/menu_item/sample":
 *  get:
 *    description: "Get All avtive restaurants"
 *    tags:
 *    - Menu >> CSV
 *    security:
 *    - bearerAuthAdmin: []
 *    summary: "Admin Auth"
 *    responses:
 *      '200':
 *         content:
 *           "text / plain":
 *              schema:
 *                type: string
 *                format: binary
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/** GET - DOWNLOAD MENU ITEM CSV
 * @openapi
 *"/food/admin/menu/csv/menu_item/{restaurant_ids}":
 *  get:
 *    description: "Get All avtive restaurants"
 *    tags:
 *    - Menu >> CSV
 *    security:
 *    - bearerAuthAdmin: []
 *    summary: "Admin Auth"
 *    parameters:
 *    - in: path
 *      name: restaurant_ids
 *      description: Restaurant Id to get menu
 *      type: string
 *      example: 58539c32-a431-4e66-b621-851911b696be
 *    responses:
 *      '200':
 *         content:
 *           "text / plain":
 *              schema:
 *                type: string
 *                format: binary
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/** POST - UPLOAD  MENU ITEM CSV
 * @openapi
 *paths:
 *  "/food/admin/menu/csv/file/menu_item":
 *    post:
 *      tags:
 *      - Menu >> CSV
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      description: Create Menu
 *      requestBody:
 *        content:
 *          multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 required: true
 *                 type: string
 *                 format: binary
 *               is_partial:
 *                 type: boolean
 *                 example: false
 *      responses:
 *        '201':
 *          description: Menu Is Created Successfully
 *        '400':
 *          description: Validation Error
 *        '500':
 *          description: Internal Server Error
 */

/** POST - UPLOAD  MENU ITEM CSV
 * @openapi
 *paths:
 *  "/food/admin/menu/csv/menu_item":
 *    post:
 *      tags:
 *      - Menu >> CSV
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      description: Create Menu
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            description: Csv File
 *            schema:
 *              type: object
 *              properties:
 *                csv_file_name:
 *                  type: string
 *                  example: "82afe749-8217-47e3-b3ed-67cd3dea27a3.csv"
 *                  description: Menu CSV file
 *                is_partial:
 *                  type: boolean
 *                  example: false
 *      responses:
 *        '201':
 *          description: Menu Is Created Successfully
 *        '400':
 *          description: Validation Error
 *        '500':
 *          description: Internal Server Error
 */

/** GET - DOWNLOAD ADDON ADDON GROUP CSV
 * @openapi
 *"/food/admin/menu/csv/menu_item_addon/sample":
 *  get:
 *    description: "Get All avtive restaurants"
 *    tags:
 *    - Menu >> CSV
 *    security:
 *    - bearerAuthAdmin: []
 *    summary: "Admin Auth"
 *    responses:
 *      '200':
 *         content:
 *           "text / plain":
 *              schema:
 *                type: string
 *                format: binary
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/** GET - DOWNLOAD ADDON ADDON GROUP CSV
 * @openapi
 *"/food/admin/menu/csv/menu_item_addon/{restaurant_id}":
 *  get:
 *    description: "Get All avtive restaurants"
 *    tags:
 *    - Menu >> CSV
 *    security:
 *    - bearerAuthAdmin: []
 *    summary: "Admin Auth"
 *    parameters:
 *    - in: path
 *      name: restaurant_id
 *      description: Restaurant Id to get menu
 *      type: string
 *      example: 3c44327c-ed51-4808-821f-28caeca7d682
 *    responses:
 *      '200':
 *         content:
 *           "text / plain":
 *              schema:
 *                type: string
 *                format: binary
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/** POST - UPLOAD ADDON ADDON GROUP CSV
 * @openapix
 *paths:
 *  "/food/admin/menu/csv/menu_item_addon":
 *    post:
 *      tags:
 *      - Menu >> CSV
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      description: Create Menu
 *      requestBody:
 *        content:
 *          multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 required: true
 *                 type: string
 *                 format: binary
 *      responses:
 *        '201':
 *          description: Menu Is Created Successfully
 *        '400':
 *          description: Validation Error
 *        '500':
 *          description: Internal Server Error
 */

/** POST - UPLOAD ADDON ADDON GROUP CSV
 * @openapi
 *paths:
 *  "/food/admin/menu/csv/menu_item_addon":
 *    post:
 *      tags:
 *      - Menu >> CSV
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      description: Create Menu
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            description: Csv File
 *            schema:
 *              type: object
 *              properties:
 *                csv_file_name:
 *                  type: string
 *                  example: "82afe749-8217-47e3-b3ed-67cd3dea27a3.csv"
 *                  description: Menu CSV file
 *      responses:
 *        '201':
 *          description: Menu Is Created Successfully
 *        '400':
 *          description: Validation Error
 *        '500':
 *          description: Internal Server Error
 */

/** GET - DOWNLOAD ITEM ADDON GROUP CSV
 * @openapi
 *"/food/admin/menu/csv/item_addon_group/sample":
 *  get:
 *    description: "Get All avtive restaurants"
 *    tags:
 *    - Menu >> CSV
 *    security:
 *    - bearerAuthAdmin: []
 *    summary: "Admin Auth"
 *    responses:
 *      '200':
 *         content:
 *           "text / plain":
 *              schema:
 *                type: string
 *                format: binary
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/** GET - DOWNLOAD ITEM ADDON GROUP CSV
 * @openapi
 *"/food/admin/menu/csv/item_addon_group/{restaurant_id}":
 *  get:
 *    description: "Get All avtive restaurants"
 *    tags:
 *    - Menu >> CSV
 *    security:
 *    - bearerAuthAdmin: []
 *    summary: "Admin Auth"
 *    parameters:
 *    - in: path
 *      name: restaurant_id
 *      description: Restaurant Id to get menu
 *      type: string
 *      example: 3c44327c-ed51-4808-821f-28caeca7d682
 *    responses:
 *      '200':
 *         content:
 *           "text / plain":
 *              schema:
 *                type: string
 *                format: binary
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/** POST - UPLOAD ITEM ADDON GROUP CSV
 * @openapix
 *paths:
 *  "/food/admin/menu/csv/item_addon_group":
 *    post:
 *      tags:
 *      - Menu >> CSV
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      description: Create Menu
 *      requestBody:
 *        content:
 *          multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 required: true
 *                 type: string
 *                 format: binary
 *      responses:
 *        '201':
 *          description: Menu Is Created Successfully
 *        '400':
 *          description: Validation Error
 *        '500':
 *          description: Internal Server Error
 */

/** POST - UPLOAD ITEM ADDON GROUP CSV
 * @openapi
 *paths:
 *  "/food/admin/menu/csv/item_addon_group":
 *    post:
 *      tags:
 *      - Menu >> CSV
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      description: Create Menu
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            description: Csv File
 *            schema:
 *              type: object
 *              properties:
 *                csv_file_name:
 *                  type: string
 *                  example: "82afe749-8217-47e3-b3ed-67cd3dea27a3.csv"
 *                  description: Menu CSV file
 *      responses:
 *        '201':
 *          description: Menu Is Created Successfully
 *        '400':
 *          description: Validation Error
 *        '500':
 *          description: Internal Server Error
 */

/** GET MENU ADMIN
 * @openapi
 *"/food/admin/menu/{restaurant_id}":
 *  get:
 *    description: "Get All avtive restaurants"
 *    tags:
 *    - Menu
 *    security:
 *    - bearerAuthAdmin: []
 *    summary: "Admin Auth"
 *    parameters:
 *    - in: path
 *      name: restaurant_id
 *      description: Restaurant Id to get menu
 *      type: string
 *      example: 3c44327c-ed51-4808-821f-28caeca7d682
 *    responses:
 *      '200':
 *        description: Got restaurant list
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/** GET MENU CUSTOMER
 * @openapi
 *"/food/menu/{restaurant_id}":
 *  get:
 *    description: "Get All avtive restaurants"
 *    tags:
 *    - Menu
 *    security:
 *    - bearerAuthCustomer: []
 *    summary: "Customer Auth"
 *    parameters:
 *    - in: path
 *      name: restaurant_id
 *      description: Restaurant Id to get menu
 *      type: string
 *      example: 3c44327c-ed51-4808-821f-28caeca7d682
 *    - in: query
 *      name: origin
 *      type: string
 *      required: false
 *      example: search
 *    responses:
 *      '200':
 *        description: Got restaurant list
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/** GET MENU VENDOR
 * @openapi
 *paths:
 *  "/food/vendor/menu":
 *    get:
 *      tags:
 *      - Menu
 *      security:
 *      - bearerAuthVendor: []
 *      summary: "Vendor Auth"
 *      description: Get All Main Category And Sub Category
 *      responses:
 *        '200':
 *          description: Get Successfully
 *        '500':
 *          description: Internal Server Error
 */

/** GET MENU ITEM ADMIN
 * @openapi
 *paths:
 *  "/food/admin/menu/menu_item/{id}":
 *    get:
 *      tags:
 *      - Menu >> Menu Item
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      description: Get Menu Item by id
 *      parameters:
 *      - in: path
 *        name: id
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

/** POST MENU ITEM ADMIN
 * @openapi
 *paths:
 *  "/food/admin/menu/menu_item":
 *    post:
 *      tags:
 *      - Menu >> Menu Item
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      description: Create Menu Item
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
 *                  example: 67ecbe07-4c33-4736-bab4-bcfd71ccdfb6
 *                sub_category_id:
 *                  type: number
 *                  example: 19
 *                name:
 *                  type: string
 *                  example: Chilli
 *                price:
 *                  type: number
 *                  example: 12.50
 *                veg_egg_non:
 *                  type: string
 *                  example: veg
 *                packing_charges:
 *                  type: number
 *                  example: 12.50
 *                is_spicy:
 *                  type: boolean
 *                  example: true
 *                serves_how_many:
 *                  type: number
 *                  example: 2
 *                service_charges:
 *                  type: number
 *                  example: 12.50
 *                item_sgst_utgst:
 *                  type: number
 *                  example: 12.50
 *                item_cgst:
 *                  type: number
 *                  example: 12.50
 *                item_igst:
 *                  type: number
 *                  example: 12.50
 *                item_inclusive:
 *                  type: boolean
 *                  example: true
 *                external_id:
 *                  type: string
 *                  example: ght-128978912bkj129
 *                allow_long_distance:
 *                  type: boolean
 *                  example: true
 *                image:
 *                  type: object
 *                  properties:
 *                    name:
 *                      type: string
 *                      example: "25887d2c-4dc4-42a1-9e3d-62a6f0c33cae.jpg"
 *                      description: Restaurant image name
 *                variant_groups:
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                      name:
 *                        type: string
 *                        example: South Indian
 *                      variants:
 *                        type: array
 *                        items:
 *                          type: object
 *                          properties:
 *                            name:
 *                              type: string
 *                              example: Thali
 *                            is_default:
 *                              type: boolean
 *                              example: true
 *                            in_stock:
 *                              type: boolean
 *                              example: true
 *                            price:
 *                              type: number
 *                              example: 12.50
 *                            veg_egg_non:
 *                              type: string
 *                              example: veg
 *                            serves_how_many:
 *                              type: number
 *                              example: 1
 *                addon_groups:
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                      id:
 *                        type: number
 *                        example: 1234
 *                      max_limit:
 *                        type: number
 *                        example: 5
 *                      min_limit:
 *                        type: number
 *                        example: -1
 *                      free_limit:
 *                        type: number
 *                        example: -1
 *                      sequence:
 *                        type: number
 *                        example: 90
 *                      addons:
 *                        type: array
 *                        items:
 *                          type: object
 *                          properties:
 *                            id:
 *                              type: number
 *                              example: 1234
 *      responses:
 *        '201':
 *          description: Created Successfully
 *        '400':
 *          description: Validation Error
 *        '500':
 *          description: Internal Server Error
 */

/** PUT MENU ITEM ADMIN
 * @openapi
 *paths:
 *  "/food/admin/menu/menu_item/{id}":
 *    put:
 *      tags:
 *      - Menu >> Menu Item
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      description: Update Menu Item
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
 *                restaurant_id:
 *                  type: string
 *                  example: 67ecbe07-4c33-4736-bab4-bcfd71ccdfb6
 *                sub_category_id:
 *                  type: number
 *                  example: 19
 *                name:
 *                  type: string
 *                  example: Chilli
 *                price:
 *                  type: number
 *                  example: 12.50
 *                veg_egg_non:
 *                  type: string
 *                  example: veg
 *                packing_charges:
 *                  type: number
 *                  example: 12.50
 *                is_spicy:
 *                  type: boolean
 *                  example: true
 *                serves_how_many:
 *                  type: number
 *                  example: 2
 *                service_charges:
 *                  type: number
 *                  example: 12.50
 *                item_sgst_utgst:
 *                  type: number
 *                  example: 12.50
 *                item_cgst:
 *                  type: number
 *                  example: 12.50
 *                item_igst:
 *                  type: number
 *                  example: 12.50
 *                item_inclusive:
 *                  type: boolean
 *                  example: true
 *                external_id:
 *                  type: string
 *                  example: ght-128978912bkj129
 *                allow_long_distance:
 *                  type: boolean
 *                  example: true
 *                image:
 *                  type: object
 *                  properties:
 *                    name:
 *                      type: string
 *                      example: "25887d2c-4dc4-42a1-9e3d-62a6f0c33cae.jpg"
 *                      description: Restaurant image name
 *                variant_groups:
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                      name:
 *                        type: string
 *                        example: South Indian
 *                      variants:
 *                        type: array
 *                        items:
 *                          type: object
 *                          properties:
 *                            name:
 *                              type: string
 *                              example: Thali
 *                            is_default:
 *                              type: boolean
 *                              example: true
 *                            in_stock:
 *                              type: boolean
 *                              example: true
 *                            price:
 *                              type: number
 *                              example: 12.50
 *                            veg_egg_non:
 *                              type: string
 *                              example: veg
 *                            serves_how_many:
 *                              type: number
 *                              example: 1
 *                addon_groups:
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                      id:
 *                        type: number
 *                        example: 1234
 *                      max_limit:
 *                        type: number
 *                        example: 5
 *                      min_limit:
 *                        type: number
 *                        example: -1
 *                      free_limit:
 *                        type: number
 *                        example: -1
 *                      sequence:
 *                        type: number
 *                        example: 90
 *                      addons:
 *                        type: array
 *                        items:
 *                          type: object
 *                          properties:
 *                            id:
 *                              type: number
 *                              example: 1234
 *      responses:
 *        '201':
 *          description: Updated Successfully
 *        '400':
 *          description: Validation Error
 *        '500':
 *          description: Internal Server Error
 */

/** POST HOLIDAY SLOT ADMIN
 * @openapi
 *paths:
 *  "/food/admin/menu/menu_item/{id}/createHolidaySlot":
 *    post:
 *      tags:
 *      - Menu >> Menu Item
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      description: Available after Menu Item
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
 *          description: Successfully
 *        '400':
 *          description: Validation Error
 *        '500':
 *          description: Internal Server Error
 */

/** DELETE MENU ITEM ADMIN
 * @openapi
 *paths:
 *  "/food/admin/menu/menu_item/{id}":
 *    delete:
 *      tags:
 *      - Menu >> Menu Item
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

/** GET MENU ITEM VENDOR
 * @openapi
 *paths:
 *  "/food/vendor/menu/menu_item/{id}":
 *    get:
 *      tags:
 *      - Menu >> Menu Item
 *      security:
 *      - bearerAuthVendor: []
 *      summary: "Vendor Auth"
 *      description: Get Menu Item by id
 *      parameters:
 *      - in: path
 *        name: id
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

/** POST MENU ITEM VENDOR
 * @openapi
 *paths:
 *  "/food/vendor/menu/menu_item":
 *    post:
 *      tags:
 *      - Menu >> Menu Item
 *      security:
 *      - bearerAuthVendor: []
 *      summary: "Vendor Auth"
 *      description: Create Menu Item
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            description: Document
 *            schema:
 *              type: object
 *              properties:
 *                sub_category_id:
 *                  type: number
 *                  example: 19
 *                name:
 *                  type: string
 *                  example: Chilli
 *                price:
 *                  type: number
 *                  example: 12.50
 *                veg_egg_non:
 *                  type: string
 *                  example: veg
 *                packing_charges:
 *                  type: number
 *                  example: 12.50
 *                is_spicy:
 *                  type: boolean
 *                  example: true
 *                serves_how_many:
 *                  type: number
 *                  example: 2
 *                service_charges:
 *                  type: number
 *                  example: 12.50
 *                item_sgst_utgst:
 *                  type: number
 *                  example: 12.50
 *                item_cgst:
 *                  type: number
 *                  example: 12.50
 *                item_igst:
 *                  type: number
 *                  example: 12.50
 *                item_inclusive:
 *                  type: boolean
 *                  example: true
 *                external_id:
 *                  type: string
 *                  example: ght-128978912bkj129
 *                allow_long_distance:
 *                  type: boolean
 *                  example: true
 *                image:
 *                  type: object
 *                  properties:
 *                    name:
 *                      type: string
 *                      example: "25887d2c-4dc4-42a1-9e3d-62a6f0c33cae.jpg"
 *                      description: Restaurant image name
 *                variant_groups:
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                      name:
 *                        type: string
 *                        example: South Indian
 *                      variants:
 *                        type: array
 *                        items:
 *                          type: object
 *                          properties:
 *                            name:
 *                              type: string
 *                              example: Thali
 *                            is_default:
 *                              type: boolean
 *                              example: true
 *                            in_stock:
 *                              type: boolean
 *                              example: true
 *                            price:
 *                              type: number
 *                              example: 12.50
 *                            veg_egg_non:
 *                              type: string
 *                              example: veg
 *                            serves_how_many:
 *                              type: number
 *                              example: 1
 *                addon_groups:
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                      id:
 *                        type: number
 *                        example: 1234
 *                      max_limit:
 *                        type: number
 *                        example: 5
 *                      min_limit:
 *                        type: number
 *                        example: -1
 *                      free_limit:
 *                        type: number
 *                        example: -1
 *                      sequence:
 *                        type: number
 *                        example: 90
 *                      addons:
 *                        type: array
 *                        items:
 *                          type: object
 *                          properties:
 *                            id:
 *                              type: number
 *                              example: 1234
 *      responses:
 *        '201':
 *          description: Created Successfully
 *        '400':
 *          description: Validation Error
 *        '500':
 *          description: Internal Server Error
 */

/** PUT MENU ITEM VENDOR
 * @openapi
 *paths:
 *  "/food/vendor/menu/menu_item/{id}":
 *    put:
 *      tags:
 *      - Menu >> Menu Item
 *      security:
 *      - bearerAuthVendor: []
 *      summary: "Vendor Auth"
 *      description: Update Menu Item
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
 *                sub_category_id:
 *                  type: number
 *                  example: 19
 *                name:
 *                  type: string
 *                  example: Chilli
 *                price:
 *                  type: number
 *                  example: 12.50
 *                veg_egg_non:
 *                  type: string
 *                  example: veg
 *                packing_charges:
 *                  type: number
 *                  example: 12.50
 *                is_spicy:
 *                  type: boolean
 *                  example: true
 *                serves_how_many:
 *                  type: number
 *                  example: 2
 *                service_charges:
 *                  type: number
 *                  example: 12.50
 *                item_sgst_utgst:
 *                  type: number
 *                  example: 12.50
 *                item_cgst:
 *                  type: number
 *                  example: 12.50
 *                item_igst:
 *                  type: number
 *                  example: 12.50
 *                item_inclusive:
 *                  type: boolean
 *                  example: true
 *                external_id:
 *                  type: string
 *                  example: ght-128978912bkj129
 *                allow_long_distance:
 *                  type: boolean
 *                  example: true
 *                image:
 *                  type: object
 *                  properties:
 *                    name:
 *                      type: string
 *                      example: "25887d2c-4dc4-42a1-9e3d-62a6f0c33cae.jpg"
 *                      description: Restaurant image name
 *                variant_groups:
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                      name:
 *                        type: string
 *                        example: South Indian
 *                      variants:
 *                        type: array
 *                        items:
 *                          type: object
 *                          properties:
 *                            name:
 *                              type: string
 *                              example: Thali
 *                            is_default:
 *                              type: boolean
 *                              example: true
 *                            in_stock:
 *                              type: boolean
 *                              example: true
 *                            price:
 *                              type: number
 *                              example: 12.50
 *                            veg_egg_non:
 *                              type: string
 *                              example: veg
 *                            serves_how_many:
 *                              type: number
 *                              example: 1
 *                addon_groups:
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                      id:
 *                        type: number
 *                        example: 1234
 *                      max_limit:
 *                        type: number
 *                        example: 5
 *                      min_limit:
 *                        type: number
 *                        example: -1
 *                      free_limit:
 *                        type: number
 *                        example: -1
 *                      sequence:
 *                        type: number
 *                        example: 90
 *                      addons:
 *                        type: array
 *                        items:
 *                          type: object
 *                          properties:
 *                            id:
 *                              type: number
 *                              example: 1234
 *      responses:
 *        '201':
 *          description: Updated Successfully
 *        '400':
 *          description: Validation Error
 *        '500':
 *          description: Internal Server Error
 */

/** POST HOLIDAY SLOT VENDOR
 * @openapi
 *paths:
 *  "/food/vendor/menu/menu_item/{id}/createHolidaySlot":
 *    post:
 *      tags:
 *      - Menu >> Menu Item
 *      security:
 *      - bearerAuthVendor: []
 *      summary: "Vendor Auth"
 *      description: Available after Menu Item
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
 *          description: Successfully
 *        '400':
 *          description: Validation Error
 *        '500':
 *          description: Internal Server Error
 */

/** DELETE MENU ITEM VENDOR
 * @openapi
 *paths:
 *  "/food/vendor/menu/menu_item/{id}":
 *    delete:
 *      tags:
 *      - Menu >> Menu Item
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

/** GET MENU CUSTOMER
 * @openapi
 *"/food/menu/{restaurant_id}":
 *  get:
 *    description: "Get All avtive restaurants"
 *    tags:
 *    - Menu
 *    parameters:
 *    - in: path
 *      name: restaurant_id
 *      description: Restaurant Id to get menu
 *      type: string
 *      example: 3c44327c-ed51-4808-821f-28caeca7d682
 *    responses:
 *      '200':
 *        description: Got restaurant list
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */
