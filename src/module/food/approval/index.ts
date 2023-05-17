import express from 'express';
import * as controller from './controller';

const admin_routes = express.Router();
const vendor_routes = express.Router();

admin_routes.post('/filter', controller.filterApprovalsAsAdmin);
admin_routes.post('/review/:approval_ids', controller.reviewApprovalRequest);

export default {vendor_routes, admin_routes};

/**
 * @openapi
 *paths:
 *  "/food/admin/approval/filter":
 *    post:
 *      description: " get approvals by applied filter"
 *      tags:
 *      - Approval
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            description: Admin Auth
 *            schema:
 *              type: object
 *              properties:
 *                search_text:
 *                  type: string
 *                  example: "1"
 *                filter:
 *                  type: object
 *                  example: {
 *                           restaurant_id: ["f0c8c345-89c2-4d03-93c9-64805964c363"],
 *                           action: ["create"],
 *                           entity_id: [1],
 *                           entity_type: ["addon"],
 *                           status: ["pending"],
 *                           change_requested_by: ["f0c8c345-89c2-4d03-93c9-64805964c363"],
 *                           approved_by: ["f0c8c345-89c2-4d03-93c9-64805964c363"],
 *                           duration: {
 *                              start_date: 1653503400,
 *                              end_date: 1654713820
 *                                      }
 *                         }
 *                pagination:
 *                  type: object
 *                  example: {
 *                           page_index: 0,
 *                           page_size: 5
 *                           }
 *                sort:
 *                  type: array
 *                  example: [{
 *                           column: "created_at",
 *                           order: "asc"
 *                           }]
 *      responses:
 *        '200':
 *          description: " approval details fetched "
 *        '400':
 *          description: " Bad Request "
 *        '401':
 *          description: " Unauthorized "
 *        '500':
 *          description: " Internal Server Error "
 */

/**
 * @openapi
 *paths:
 *  "/food/admin/approval/review/{approval_ids}":
 *    post:
 *      description: " review approvals "
 *      tags:
 *      - Approval
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      parameters:
 *      - in: path
 *        name: approval_ids
 *        type: string
 *        example: 1,2
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            description: Admin Auth
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: string
 *                  example: "reviewed"
 *                status_comments:
 *                  type: string
 *                  example: "changes are valid"
 *      responses:
 *        '200':
 *          description: " reviewed "
 *        '400':
 *          description: " Bad Request "
 *        '401':
 *          description: " Unauthorized "
 *        '500':
 *          description: " Internal Server Error "
 */
