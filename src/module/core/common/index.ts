import express from 'express';
import * as controller from '../common/controller';

const user_routes = express.Router();
const admin_routes = express.Router();

user_routes.get('/getUploadURL/:file_extn', controller.getUploadURL);

export default {user_routes, admin_routes};

/**
 * @openapi
 *"/core/common/getUploadURL/{file_extn}":
 *  get:
 *    description: "Get pre Signed Url to upload file in S3"
 *    tags:
 *    - Presigned URL
 *    security:
 *    - bearerAuth: []
 *    summary: "User Auth"
 *    parameters:
 *    - in: path
 *      name: file_extn
 *      description: get Presigned upload url
 *      required: true
 *      schema:
 *        type: string
 *    responses:
 *      '200':
 *        description: Got url
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: " Internal Server Error "
 */
