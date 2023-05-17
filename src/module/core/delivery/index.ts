import express from 'express';
import * as controller from './controller';

const internal_routes = express.Router();
const admin_routes = express.Router();

internal_routes.post('/deliverabilityCheck', controller.deliverabilityCheck);
internal_routes.post('/placeOrder', controller.placeOrder);
internal_routes.post('/cancelDelivery', controller.cancelDelivery);
internal_routes.put('/status', controller.updateStatus);
admin_routes.post('/cancel', controller.cancelDelivery_admin);

export default {internal_routes, admin_routes};

/** POST - CANCEL DELIVERY ORDER
 * @openapi
 *paths:
 *  "/core/admin/delivery/cancel":
 *    post:
 *      tags:
 *      - Delivery
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      description: Cancel Delivery Order
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            description: Document
 *            schema:
 *              type: object
 *              properties:
 *                delivery_service:
 *                  type: string
 *                  example: "speedyy-rider"
 *                  description: "shadowfax | speedyy-rider"
 *                delivery_order_id:
 *                  type: string
 *                  example: 123456
 *                  description: Order id of delivery partner
 *                reason:
 *                  type: string
 *                  example: Exception
 *                  description: Reason text
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
