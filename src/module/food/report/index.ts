import express from 'express';
import * as controller from './controller';

const customer_routes = express.Router();
const admin_routes = express.Router();
const vendor_routes = express.Router();

admin_routes.post(
  '/restaurant/:restaurant_id/sales',
  controller.adminSalesReport
);
vendor_routes.post('/restaurant/sales', controller.vendorSalesReport);

export default {customer_routes, admin_routes, vendor_routes};

/**
 * @openapi
 *paths:
 *  "/food/admin/report/restaurant/{restaurant_id}/sales":
 *    post:
 *      description: "GET sales report"
 *      tags:
 *      - Report
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      parameters:
 *       - in: path
 *         name: restaurant_id
 *         description: restaurant id
 *         type: string
 *         example: uuid
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            description: Admin Auth
 *            schema:
 *              type: object
 *            examples:
 *              TODAY:
 *                summry: TODAY
 *                value:
 *                  {
 *                      "duration": "today"
 *                  }
 *              THIS_WEEK:
 *                summry: THIS_WEEK
 *                value:
 *                  {
 *                      "duration": "this_week"
 *                  }
 *              THIS_MONTH:
 *                summry: THIS_MONTH
 *                value:
 *                  {
 *                      "duration": "this_month"
 *                  }
 *              CUSTOM_RANGE:
 *                summry: CUSTOM_RANGE
 *                value:
 *                  {
 *                      "duration": "custom_range",
 *                      "start_epoch":1669795076,
 *                      "end_epoch":1669795096,
 *                  }
 *      responses:
 *        '200':
 *          description: " Get sales report "
 *        '401':
 *          description: " Unauthorized "
 *        '500':
 *          description: " Internal Server Error "
 */
/**
 * @openapi
 *paths:
 *  "/food/vendor/report/restaurant/sales":
 *    post:
 *      description: "GET sales report"
 *      tags:
 *      - Report
 *      security:
 *      - bearerAuthVendor: []
 *      summary: "Vendor Auth"
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            description: Vendor Auth
 *            schema:
 *              type: object
 *            examples:
 *              TODAY:
 *                summry: TODAY
 *                value:
 *                  {
 *                      "duration": "today"
 *                  }
 *              THIS_WEEK:
 *                summry: THIS_WEEK
 *                value:
 *                  {
 *                      "duration": "this_week"
 *                  }
 *              THIS_MONTH:
 *                summry: THIS_MONTH
 *                value:
 *                  {
 *                      "duration": "this_month"
 *                  }
 *              CUSTOM_RANGE:
 *                summry: CUSTOM_RANGE
 *                value:
 *                  {
 *                      "duration": "custom_range",
 *                      "start_epoch":1669795076,
 *                      "end_epoch":1669795096,
 *                  }
 *      responses:
 *        '200':
 *          description: " Get sales report "
 *        '401':
 *          description: " Unauthorized "
 *        '500':
 *          description: " Internal Server Error "
 */
