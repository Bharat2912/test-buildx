import express from 'express';
import * as controller from './controller';
import {authenticate_admin} from '../../../utilities/jwt/authenticate';

const admin_routes = express.Router();
const customer_routes = express.Router();

admin_routes.post('/', authenticate_admin, controller.createBanner);
admin_routes.put('/:id', authenticate_admin, controller.updateBanner);
admin_routes.delete('/:id', authenticate_admin, controller.deleteBannerById);
admin_routes.get('/:id', authenticate_admin, controller.readBannerById);
admin_routes.get('/', authenticate_admin, controller.readAllBanner);

customer_routes.get('/', controller.readAllActiveBanner);

export default {admin_routes, customer_routes};

/** GET  - ALL - BANNER
 * @openapi
 * "/core/banner":
 *  get:
 *    description: "Get list of all Active Banner"
 *    tags:
 *    - Banner
 *    responses:
 *      '200':
 *        description: Successfully Got All Banner
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: " Internal Server Error "
 */

/** POST - CREATE  BANNER
 * @openapi
 *paths:
 *  "/core/admin/banner":
 *    post:
 *      tags:
 *      - Banner
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      description: Create Banner
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            description: Banner
 *            schema:
 *              type: object
 *              properties:
 *                title:
 *                  type: string
 *                  example: "Give Title To The Image Name"
 *                  description:
 *                image_name:
 *                  type: string
 *                  example: "25887d2c-4dc4-42a1-9e3d-62a6f0c33cae.jpg"
 *                  description: image path in s3 bucket
 *                status:
 *                  type: string
 *                  example: " created / active / inactive"
 *        required: true
 *      produces:
 *      - application/json
 *      responses:
 *        '200':
 *          description: " Banner Is Created Successfully"
 *          schema:
 *            type: object
 *            properties:
 *              id:
 *                type: uuid
 *                example: 86a7013f-9ab1-4b2c-b82b-4e9757c80b67
 *        '403':
 *          description: " Validation Error "
 *        '409':
 *          description: " Phone already exists, Please login"
 *        '500':
 *          description: " Internal Server Error "
 */

/** PUT  - UPDATE  BANNER
 * @openapi
 *"/core/admin/banner/{id}":
 *    put:
 *      tags:
 *      - Banner
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      description: Updated Banner Details
 *      parameters:
 *       - in: path
 *         name: id
 *         description: id
 *         required: true
 *         schema:
 *           type: string
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            description: Banner Details
 *            schema:
 *              type: object
 *              properties:
 *                title:
 *                  type: string
 *                  example: "Give Title To The Image Name"
 *                image_name:
 *                  type: string
 *                  example: "25887d2c-4dc4-42a1-9e3d-62a6f0c33cae.jpg"
 *                  description: image path in s3 bucket
 *                status:
 *                  type: string
 *                  example: " created / active / inactive"
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

/** DELETE - :ID - BANNER
 * @openapi
 *"/core/admin/banner/{id}":
 *  delete:
 *    description: "Delete Banner By Id"
 *    security:
 *    - bearerAuthAdmin: []
 *    summary: "Admin Auth"
 *    tags:
 *    - Banner
 *    parameters:
 *    - in: path
 *      name: id
 *      required: true
 *      schema:
 *        type: string
 *    responses:
 *      '200':
 *        description: " Banner is Deleted "
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: " Internal Server Error "
 */

/** GET  - ALL - BANNER
 * @openapi
 * "/core/admin/banner":
 *  get:
 *    description: "Get list of all Banner"
 *    tags:
 *    - Banner
 *    security:
 *    - bearerAuthAdmin: []
 *    summary: "Admin Auth"
 *    responses:
 *      '200':
 *        description: Successfully Got All Banner
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: " Internal Server Error "
 */

/** GET  - :ID - ADMIN
 * @openapi
 *"/core/admin/banner/{id}":
 *  get:
 *    description: "Get banner By Id"
 *    tags:
 *    - Banner
 *    security:
 *    - bearerAuthAdmin: []
 *    summary: "Admin Auth"
 *    parameters:
 *    - in: path
 *      name: id
 *      description: Get Banner
 *      required: true
 *      schema:
 *        type: string
 *    produces:
 *    - application/json
 *    responses:
 *      '200':
 *        description: " Successfully Got Banner"
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: " Internal Server Error "
 */
