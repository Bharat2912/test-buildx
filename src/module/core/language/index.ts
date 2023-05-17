// import express from 'express';
// import * as controller from './controller';

// const admin_routes = express.Router();
// const partner_routes = express.Router();
// const internal_routes = express.Router();

// partner_routes.get('/', controller.readActiveLanguage);

// admin_routes.post('/', controller.createLanguage);
// admin_routes.get('/:id', controller.readLanguageById);
// admin_routes.put('/:id', controller.updateLanguage);
// admin_routes.delete('/:id', controller.deleteLanguageById);
// admin_routes.get('/', controller.readAllLanguage);

// internal_routes.get('/:id', controller.readLanguageById);
// internal_routes.get('/', controller.readAllLanguage);

// export default {admin_routes, partner_routes, internal_routes};

// /** GET - PARTNER
//  * @openapi
//  * "/core/partner/language":
//  *  get:
//  *    description: "Get list of active Language"
//  *    tags:
//  *    - Language
//  *    security:
//  *    - bearerAuthPartner: []
//  *    summary: Partner Auth
//  *    responses:
//  *      '200':
//  *        description:  Get All language list
//  *      '401':
//  *        description:  Unauthorized
//  *      '500':
//  *        description:  Internal Server Error
//  */

// /** GET - ALL
//  * @openapi
//  * "/core/admin/language":
//  *  get:
//  *    description: "Get all Language"
//  *    tags:
//  *    - Language
//  *    security:
//  *    - bearerAuthAdmin: []
//  *    summary: "Admin Auth"
//  *    responses:
//  *      '200':
//  *        description: Get All language Status
//  *      '401':
//  *        description: Unauthorized
//  *      '500':
//  *        description: Internal Server Error
//  */

// /** GET    - :ID - ADMIN
//  * @openapi
//  *"/core/admin/language/{id}":
//  *  get:
//  *    description: "Get Language By Id"
//  *    tags:
//  *    - Language
//  *    security:
//  *    - bearerAuthAdmin: []
//  *    summary: "Admin Auth"
//  *    parameters:
//  *    - in: path
//  *      name: id
//  *      description: Get Language
//  *      required: true
//  *      schema:
//  *        type: string
//  *    responses:
//  *      '200':
//  *        description: Successfully Got language
//  *      '401':
//  *        description: Unauthorized
//  *      '500':
//  *        description: Internal Server Error
//  */

// /** POST   - CREATE - ADMIN
//  * @openapi
//  *"/core/admin/language":
//  *  post:
//  *    description: "Create New Language"
//  *    tags:
//  *    - Language
//  *    security:
//  *    - bearerAuthAdmin: []
//  *    summary: "Admin Auth"
//  *    requestBody:
//  *      content:
//  *        application/json:
//  *          name: body
//  *          in: body
//  *          description: Send post Data
//  *          schema:
//  *            type: object
//  *            properties:
//  *              name:
//  *                type: string
//  *                example: Hindi
//  *              status:
//  *                type: string
//  *                example: active-inactive
//  *      required: true
//  *    responses:
//  *      '200':
//  *        description: Successfully Created language
//  *      '401':
//  *        description: Unauthorized
//  *      '403':
//  *        description: Input Data Validation Error
//  *      '500':
//  *        description: Internal Server Error
//  */

// /** PUT    - :ID ADMIN
//  * @openapi
//  *"/core/admin/language/{id}":
//  *  put:
//  *    description: " Updating Language "
//  *    tags:
//  *    - Language
//  *    security:
//  *    - bearerAuthAdmin: []
//  *    summary: "Admin Auth"
//  *    parameters:
//  *    - in: path
//  *      name: id
//  *      required: true
//  *      schema:
//  *        type: string
//  *    requestBody:
//  *      content:
//  *        application/json:
//  *          name: body
//  *          in: body
//  *          description: Send post Data
//  *          schema:
//  *            type: object
//  *            properties:
//  *              name:
//  *                type: string
//  *                example: English
//  *              status:
//  *                type: string
//  *                example: active-inactive
//  *      required: true
//  *    responses:
//  *      '200':
//  *        description: Updated Language list
//  *      '401':
//  *        description: Unauthorized
//  *      '500':
//  *        description: Internal Server Error
//  */

// /** Delete - :ID - ADMIN
//  * @openapi
//  *"/core/admin/language/{id}":
//  *  delete:
//  *    description: "Delete Language By Id"
//  *    security:
//  *    - bearerAuthAdmin: []
//  *    summary: "Admin Auth"
//  *    tags:
//  *    - Language
//  *    parameters:
//  *    - in: path
//  *      name: id
//  *      required: true
//  *      schema:
//  *        type: string
//  *    responses:
//  *      '200':
//  *        description: Language is Deleted
//  *      '401':
//  *        description: Unauthorized
//  *      '500':
//  *        description: Internal Server Error
//  */
