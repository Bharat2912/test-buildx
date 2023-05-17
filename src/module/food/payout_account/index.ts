import express from 'express';
import * as controller from './controller';

const vendor_routes = express.Router();
const admin_routes = express.Router();

vendor_routes.put('/:id/verifyIfsc', controller.verifyIfscPayoutAccount);
vendor_routes.put('/:id/makePrimary', controller.makePrimaryPayoutAccount);
vendor_routes.get('/:id', controller.readPayoutAccount);
vendor_routes.delete('/:id', controller.deletePayoutAccount);
vendor_routes.post('/', controller.createPayoutAccount);
vendor_routes.get('/', controller.readPayoutAccounts);

admin_routes.get('/:id', controller.admin_readPayoutAccount);
admin_routes.get('/', controller.admin_readPayoutAccounts);
export default {vendor_routes, admin_routes};

/** GET ADMIN
 * @openapi
 *paths:
 *  "/food/admin/payout_account/{id}":
 *    get:
 *      tags:
 *      - PayoutAccount
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      description: Get All PayoutAccounts of payout_account group
 *      parameters:
 *      - in: path
 *        name: id
 *        type: string
 *        example: uuid
 *      responses:
 *        '200':
 *          description: get successful
 *        '400':
 *          description: Validation Error
 *        '500':
 *          description: Internal Server Error
 */

/** GET ADMIN
 * @openapi
 *paths:
 *  "/food/admin/payout_account":
 *    get:
 *      tags:
 *      - PayoutAccount
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      description: Get All PayoutAccounts of payout_account group
 *      parameters:
 *      - in: query
 *        name: restaurant_id
 *        type: string
 *        example: uuid
 *      responses:
 *        '200':
 *          description: get successful
 *        '400':
 *          description: Validation Error
 *        '500':
 *          description: Internal Server Error
 */

/** GET VENDOR
 * @openapi
 *paths:
 *  "/food/vendor/payout_account":
 *    get:
 *      tags:
 *      - PayoutAccount
 *      security:
 *      - bearerAuthVendor: []
 *      summary: "Vendor Auth"
 *      description: Get All PayoutAccounts of payout_account group
 *      responses:
 *        '200':
 *          description: get successful
 *        '400':
 *          description: Validation Error
 *        '500':
 *          description: Internal Server Error
 */

/** GET VENDOR
 * @openapi
 *paths:
 *  "/food/vendor/payout_account/{id}":
 *    get:
 *      tags:
 *      - PayoutAccount
 *      security:
 *      - bearerAuthVendor: []
 *      summary: "Vendor Auth"
 *      description: Get All PayoutAccounts of payout_account group
 *      parameters:
 *      - in: path
 *        name: id
 *        type: string
 *        example: uuid
 *      responses:
 *        '200':
 *          description: get successful
 *        '400':
 *          description: Validation Error
 *        '500':
 *          description: Internal Server Error
 */

/** POST VENDOR
 * @openapi
 *paths:
 *  "/food/vendor/payout_account":
 *    post:
 *      tags:
 *      - PayoutAccount
 *      security:
 *      - bearerAuthVendor: []
 *      summary: "Vendor Auth"
 *      description: Create PayoutAccount
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
 *                  example: My Saving
 *                ifsc_code:
 *                  type: string
 *                  example: ICIC0123456
 *                bank_account_number:
 *                  type: string
 *                  example: 125425154251
 *      responses:
 *        '201':
 *          description: Created Successfully
 *        '400':
 *          description: Validation Error
 *        '500':
 *          description: Internal Server Error
 */

/** PUT VENDOR
 * @openapi
 *paths:
 *  "/food/vendor/payout_account/{id}/verifyIfsc":
 *    put:
 *      tags:
 *      - PayoutAccount
 *      security:
 *      - bearerAuthVendor: []
 *      summary: "Vendor Auth"
 *      description: Update PayoutAccount
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
 *                ifsc_code:
 *                  type: string
 *                  example: ICICI01234
 *      responses:
 *        '201':
 *          description: Updated Successfully
 *        '400':
 *          description: Validation Error
 *        '500':
 *          description: Internal Server Error
 */

/** PUT VENDOR
 * @openapi
 *paths:
 *  "/food/vendor/payout_account/{id}/makePrimary":
 *    put:
 *      tags:
 *      - PayoutAccount
 *      security:
 *      - bearerAuthVendor: []
 *      summary: "Vendor Auth"
 *      description: Update PayoutAccount
 *      parameters:
 *      - in: path
 *        name: id
 *        type: string
 *        example: uuid
 *      responses:
 *        '201':
 *          description: Updated Successfully
 *        '400':
 *          description: Validation Error
 *        '500':
 *          description: Internal Server Error
 */

/** DELETE VENDOR
 * @openapi
 *paths:
 *  "/food/vendor/payout_account/{id}":
 *    delete:
 *      tags:
 *      - PayoutAccount
 *      security:
 *      - bearerAuthVendor: []
 *      summary: "Vendor Auth"
 *      parameters:
 *      - in: path
 *        name: id
 *        type: string
 *        example: uuid
 *      responses:
 *        '201':
 *          description: Deleted Successfully
 *        '400':
 *          description: Validation Error
 *        '500':
 *          description: Internal Server Error
 */
