import express from 'express';
import * as controller from './controller';
import {
  authenticate_admin,
  authenticate_partner,
} from '../../../utilities/jwt/authenticate';

const admin_routes = express.Router();
const partner_routes = express.Router();

admin_routes.post('/', authenticate_admin, controller.createDocument);
admin_routes.put('/:id', authenticate_admin, controller.updateDocument);
admin_routes.delete('/:id', authenticate_admin, controller.deleteDocumentById);
admin_routes.get('/:id', authenticate_admin, controller.readDocumentById);
admin_routes.get('/', authenticate_admin, controller.readAllDocument);

partner_routes.get(
  '/',
  authenticate_partner,
  controller.readDocumentByCategory
);

export default {admin_routes, partner_routes};

/** GET  - ALL - Document
 * @openapi
 * "/core/partner/document":
 *  get:
 *    description: "Get list of all Active Document"
 *    tags:
 *    - Document
 *    parameters:
 *    - in: query
 *      name: category
 *      description: Category of document
 *      type: string
 *      example: restaurant_mou
 *    security:
 *    - bearerAuthPartner: []
 *    summary: Partner Auth
 *    responses:
 *      '200':
 *        description: Successfully Got All Document
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/** POST - CREATE  Document
 * @openapi
 *paths:
 *  "/core/admin/document":
 *    post:
 *      tags:
 *      - Document
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      description: Create Document
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            description: Document
 *            schema:
 *              type: object
 *              properties:
 *                title:
 *                  type: string
 *                  example: "Give text to diplay for document"
 *                  description:
 *                doc_type:
 *                  type: string
 *                  example: pdf
 *                  description: type of Document pdf / image / html
 *                doc_file:
 *                  type: object
 *                  properties:
 *                    name:
 *                      type: string
 *                      example: "25887d2c-4dc4-42a1-9e3d-62a6f0c33cae.jpg"
 *                      description: Restaurant image name
 *                data:
 *                  type: string
 *                  example: <html><h1>Hello</h1></html>
 *                  description: <html><h1>Hello</h1></html> or {title:"hello"}
 *                category:
 *                  type: string
 *                  example: restaurant_mou
 *                  description: "Place where document will be showd ie: restaurant_mou / tnc / privacy"
 *        required: true
 *      produces:
 *      - application/json
 *      responses:
 *        '201':
 *          description: Document Is Created Successfully
 *        '403':
 *          description: Validation Error
 *        '500':
 *          description: Internal Server Error
 */

/** PUT  - UPDATE  Document
 * @openapi
 *"/core/admin/document/{id}":
 *    put:
 *      tags:
 *      - Document
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      description: Updated Document Details
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
 *            description: Document Details
 *            schema:
 *              type: object
 *              properties:
 *                title:
 *                  type: string
 *                  example: "Give text to diplay for document"
 *                  description:
 *                doc_file:
 *                  type: object
 *                  properties:
 *                    name:
 *                      type: string
 *                      example: "25887d2c-4dc4-42a1-9e3d-62a6f0c33cae.jpg"
 *                      description: Restaurant image name
 *                doc_type:
 *                  type: string
 *                  example: pdf
 *                  description: type of Document pdf / image / html
 *                data:
 *                  type: string
 *                  example: <html><h1>Hello</h1></html>
 *                  description: <html><h1>Hello</h1></html> or {title:"hello"}
 *                category:
 *                  type: string
 *                  example: active / inactive
 *                  description: "Place where document will be showd ie: restaurant_mou / tnc / privacy"
 *        required: true
 *      produces:
 *      - application/json
 *      responses:
 *        '200':
 *          description: Updated Successfully
 *        '403':
 *          description: Validation Error
 *        '500':
 *          description: Internal Server Error
 */

/** DELETE - :ID - Document
 * @openapi
 *"/core/admin/document/{id}":
 *  delete:
 *    description: Delete Document By Id
 *    security:
 *    - bearerAuthAdmin: []
 *    summary: Admin Auth
 *    tags:
 *    - Document
 *    parameters:
 *    - in: path
 *      name: id
 *      required: true
 *      schema:
 *        type: string
 *    responses:
 *      '200':
 *        description: Document is Deleted
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/** GET  - ALL - Document
 * @openapi
 * "/core/admin/document":
 *  get:
 *    description: Get list of all Document
 *    tags:
 *    - Document
 *    security:
 *    - bearerAuthAdmin: []
 *    summary: Admin Auth
 *    responses:
 *      '200':
 *        description: Successfully Got All Documents
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/** GET  - ALL - Document
 * @openapi
 * "/core/admin/document":
 *  get:
 *    description: "Get Document By Category"
 *    tags:
 *    - Document
 *    parameters:
 *    - in: query
 *      name: category
 *      description: Category of document
 *      type: string
 *      example: restaurant_mou
 *    security:
 *    - bearerAuthAdmin: []
 *    summary: "Admin Auth"
 *    responses:
 *      '200':
 *        description: Successfully Got Document
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */
