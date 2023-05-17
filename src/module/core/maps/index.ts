import express from 'express';
import * as controller from './controller';

const internal_routes = express.Router();
const user_routes = express.Router();
const admin_routes = express.Router();

internal_routes.get('/route', controller.getRoute);
user_routes.get('/route', controller.getRoute);
admin_routes.get('/route', controller.getRoute);

admin_routes.get('/matrix', controller.getMatrix);
internal_routes.get('/matrix', controller.getMatrix);

export default {admin_routes, user_routes, internal_routes};

/** GET - OSRM ROUTE
 * @openapi
 *"/core/maps/route":
 *  get:
 *    description: "Get OSRM Route"
 *    tags:
 *    - Maps
 *    security:
 *    - bearerAuth: []
 *    summary: "User Auth"
 *    parameters:
 *      - in: query
 *        name: origin
 *        required: true
 *        example: 12.968272199085886,77.57547275015348
 *        description: Origin latitude,longitude
 *      - in: query
 *        name: destination
 *        required: true
 *        example: 12.96408786159165,77.59388466409717
 *        description: Destination latitude,longitude
 *    responses:
 *      '200':
 *        description: "Successful"
 *      '500':
 *        description: Internal Server Error
 */

/** GET - OSRM ROUTE
 * @openapi
 *"/internal/maps/route":
 *  get:
 *    description: "Get OSRM Route"
 *    tags:
 *    - Maps
 *    summary: "Internal"
 *    parameters:
 *      - in: query
 *        name: origin
 *        required: true
 *        example: 12.968272199085886,77.57547275015348
 *        description: Origin latitude,longitude
 *      - in: query
 *        name: destination
 *        required: true
 *        example: 12.96408786159165,77.59388466409717
 *        description: Destination latitude,longitude
 *    responses:
 *      '200':
 *        description: "Successful"
 *      '500':
 *        description: Internal Server Error
 */

/** GET - OSRM ROUTE
 * @openapi
 *"/core/admin/maps/route":
 *  get:
 *    description: "Get OSRM Route"
 *    tags:
 *    - Maps
 *    security:
 *    - bearerAuthAdmin: []
 *    summary: "Admin Auth"
 *    parameters:
 *      - in: query
 *        name: origin
 *        required: true
 *        example: 12.968272199085886,77.57547275015348
 *        description: Origin latitude,longitude
 *      - in: query
 *        name: destination
 *        required: true
 *        example: 12.96408786159165,77.59388466409717
 *        description: Destination latitude,longitude
 *    responses:
 *      '200':
 *        description: "Successful"
 *      '500':
 *        description: Internal Server Error
 */

/** GET - OSRM ROUTE
 * @openapi
 *"/core/admin/maps/matrix":
 *  get:
 *    description: "Get OSRM matrix"
 *    tags:
 *    - Maps
 *    security:
 *    - bearerAuthAdmin: []
 *    summary: "Admin Auth"
 *    parameters:
 *      - in: query
 *        name: coordinates
 *        required: true
 *        example: 12.968272199085886,77.57547275015348;12.968272199085886,77.57547275015348
 *        description: coordinates=latitude,longitude;latitude,longitude;
 *      - in: query
 *        name: origins
 *        required: true
 *        example: 0;1;2
 *        description: origins=1;2;3 or all
 *      - in: query
 *        name: destinations
 *        required: true
 *        example: 3;4;5
 *        description: destinations=3;4;5 or all
 *    responses:
 *      '200':
 *        description: "Successful"
 *      '500':
 *        description: Internal Server Error
 */

/** GET - OSRM ROUTE
 * @openapi
 *"/internal/maps/matrix":
 *  get:
 *    description: "Get OSRM matrix"
 *    tags:
 *    - Maps
 *    parameters:
 *      - in: query
 *        name: coordinates
 *        required: true
 *        example: 12.968272199085886,77.57547275015348;12.968272199085886,77.57547275015348
 *        description: coordinates=latitude,longitude;latitude,longitude;
 *      - in: query
 *        name: origins
 *        required: true
 *        example: 0;1;2
 *        description: origins=1;2;3 or all
 *      - in: query
 *        name: destinations
 *        required: true
 *        example: 3;4;5
 *        description: destinations=3;4;5 or all
 *    responses:
 *      '200':
 *        description: "Successful"
 *      '500':
 *        description: Internal Server Error
 */
