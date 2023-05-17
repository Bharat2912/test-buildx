import express from 'express';
import * as controller from './controller';

const vendor_routes = express.Router();
const admin_routes = express.Router();

admin_routes.post('/:id/retry', controller.retryPayout);
admin_routes.post('/:id/stopRetry', controller.stopRetryPayout);
admin_routes.post('/:id/markComplete', controller.markCompletePayout);
admin_routes.post('/filter', controller.filterPayout);

vendor_routes.post('/filter', controller.vendor_filterPayout);
vendor_routes.post('/summary', controller.vendor_summaryPayout);
vendor_routes.get('/:id', controller.vendor_payoutDetails);

export default {vendor_routes, admin_routes};

/** POST ADMIN
 * @openapi
 *paths:
 *  "/food/admin/payout/{id}/retry":
 *    post:
 *      tags:
 *      - Payout
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      description: "__"
 *      parameters:
 *      - in: path
 *        name: id
 *        type: string
 *        example: uuid
 *      responses:
 *        '201':
 *          description: Created Successfully
 *        '400':
 *          description: Validation Error
 *        '500':
 *          description: Internal Server Error
 */

/** POST ADMIN
 * @openapi
 *paths:
 *  "/food/admin/payout/{id}/stopRetry":
 *    post:
 *      tags:
 *      - Payout
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      description: "__"
 *      parameters:
 *      - in: path
 *        name: id
 *        type: string
 *        example: uuid
 *      responses:
 *        '201':
 *          description: Created Successfully
 *        '400':
 *          description: Validation Error
 *        '500':
 *          description: Internal Server Error
 */

/** POST ADMIN
 * @openapi
 *paths:
 *  "/food/admin/payout/{id}/markComplete":
 *    post:
 *      tags:
 *      - Payout
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      description: "__"
 *      parameters:
 *      - in: path
 *        name: id
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
 *              properties:
 *                transaction_details:
 *                  type: object
 *                  properties:
 *                    transaction_id:
 *                      type: string
 *                      example: 123123ddfe
 *                payout_completed_time:
 *                  type: string
 *                  format: date
 *                  example: 2022-07-12T05:54:40.687Z
 *      responses:
 *        '201':
 *          description: Created Successfully
 *        '400':
 *          description: Validation Error
 *        '500':
 *          description: Internal Server Error
 */

/** POST ADMIN
 * @openapi
 *paths:
 *  "/food/admin/payout/filter":
 *    post:
 *      tags:
 *      - Payout
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      description: filter payouts
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            description: Document
 *            schema:
 *              type: object
 *              properties:
 *                search_text:
 *                  type: string
 *                  example: "0a530eff-ff04-4e56-8569-04c6ceeb7f49"
 *                restaurant_ids:
 *                  type: string
 *                  example: ["uuid"]
 *                filter:
 *                  type: object
 *                  properties:
 *                    status:
 *                      type: string
 *                      example: ["INIT",  "FAILED",  "COMPLETE",  "PENDING",  "REJECTED",  "REVERSED"]
 *                    start_date:
 *                      type: string
 *                      format: date
 *                      example: 2022-07-12T05:54:40.687Z
 *                    end_date:
 *                      type: string
 *                      format: date
 *                      example: 2022-07-12T05:54:40.687Z
 *                    amount_gt:
 *                      type: number
 *                      example: 100
 *                    amount_lt:
 *                      type: number
 *                      example: 5000
 *                    retry:
 *                      type: boolean
 *                      example: true
 *                    completed_by_admin:
 *                      type: boolean
 *                      example: false
 *                sort_by:
 *                  type: object
 *                  properties:
 *                    column:
 *                      type: string
 *                      enum: [
 *                        "created_at"
 *                      ]
 *                      example: created_at
 *                    direction:
 *                      type: string
 *                      enum: [
 *                        "asc",
 *                        "desc"
 *                      ]
 *                      example: asc
 *                pagination:
 *                  type: object
 *                  properties:
 *                    page_index:
 *                      type: number
 *                      example: 0
 *                    page_size:
 *                      type: number
 *                      example: 10
 *      responses:
 *        '201':
 *          description: Created Successfully
 *        '400':
 *          description: Validation Error
 *        '500':
 *          description: Internal Server Error
 */

/** POST VENDOR
 * @openapi
 *paths:
 *  "/food/vendor/payout/filter":
 *    post:
 *      tags:
 *      - Payout
 *      security:
 *      - bearerAuthVendor: []
 *      summary: "Vendor Auth"
 *      description: filter payouts
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            description: Document
 *            schema:
 *              type: object
 *              properties:
 *                search_text:
 *                  type: string
 *                  example: "0a530eff-ff04-4e56-8569-04c6ceeb7f49"
 *                filter:
 *                  type: object
 *                  properties:
 *                    status:
 *                      type: string
 *                      example: ["INIT",  "FAILED",  "COMPLETE",  "PENDING",  "REJECTED",  "REVERSED"]
 *                    start_date:
 *                      type: string
 *                      format: date
 *                      example: 2022-07-12T05:54:40.687Z
 *                    end_date:
 *                      type: string
 *                      format: date
 *                      example: 2022-07-12T05:54:40.687Z
 *                    amount_gt:
 *                      type: number
 *                      example: 100
 *                    amount_lt:
 *                      type: number
 *                      example: 5000
 *                    retry:
 *                      type: boolean
 *                      example: true
 *                    completed_by_admin:
 *                      type: boolean
 *                      example: false
 *                sort_by:
 *                  type: object
 *                  properties:
 *                    column:
 *                      type: string
 *                      enum: [
 *                        "created_at"
 *                      ]
 *                      example: created_at
 *                    direction:
 *                      type: string
 *                      enum: [
 *                        "asc",
 *                        "desc"
 *                      ]
 *                      example: asc
 *                pagination:
 *                  type: object
 *                  properties:
 *                    page_index:
 *                      type: number
 *                      example: 0
 *                    page_size:
 *                      type: number
 *                      example: 10
 *      responses:
 *        '201':
 *          description: Created Successfully
 *        '400':
 *          description: Validation Error
 *        '500':
 *          description: Internal Server Error
 */

/** POST VENDOR
 * @openapi
 *paths:
 *  "/food/vendor/payout/summary":
 *    post:
 *      tags:
 *      - Payout
 *      security:
 *      - bearerAuthVendor: []
 *      summary: "Vendor Auth"
 *      description: filter payouts
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            description: Document
 *            schema:
 *              type: object
 *              properties:
 *                duration:
 *                  type: string
 *                  example: today | week | month | year
 *                  enum: [
 *                    "today",
 *                    "week",
 *                    "month",
 *                    "year"
 *                  ]
 *                start_date:
 *                  type: string
 *                  format: date
 *                  example: 2022-06-12T05:54:40.687Z
 *                end_date:
 *                  type: string
 *                  format: date
 *                  example: 2022-07-12T05:54:40.687Z
 *      responses:
 *        '201':
 *          description: Created Successfully
 *        '400':
 *          description: Validation Error
 *        '500':
 *          description: Internal Server Error
 */

/** GET VENDOR
 * @openapi
 *paths:
 *  "/food/vendor/payout/{id}":
 *    get:
 *      tags:
 *      - Payout
 *      security:
 *      - bearerAuthVendor: []
 *      summary: "Vendor Auth"
 *      description: filter payouts
 *      parameters:
 *      - in: path
 *        name: id
 *        type: string
 *        example: uuid
 *      responses:
 *        '201':
 *          description: Created Successfully
 *        '400':
 *          description: Validation Error
 *        '500':
 *          description: Internal Server Error
 */
