import express, {Request, Response, NextFunction} from 'express';
import * as controller from './controller';
import * as models from './models';
import {sendError} from '../../../utilities/controllers/handle_response';
import logger from '../../../utilities/logger/winston_logger';
import handleErrors from '../../../utilities/controllers/handle_errors';
import {joi_restaurant_id} from '../../../utilities/joi_common';

async function validate_Restaurant_Owner(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.user;
    const restaurant_id = req.params.id || user.data.restaurant_id;
    logger.debug('restaurant', restaurant_id);
    if (!restaurant_id) {
      next();
      return;
    }
    const validation = joi_restaurant_id.validate(restaurant_id);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const restaurant = await models.readRestaurantById(validation.value);
    if (!restaurant) return sendError(res, 404, 'Restaurant not found');
    req.data = {restaurant};
    if (user.user_type === 'partner' && user.id !== restaurant.partner_id) {
      logger.error('Partner not authorised for restaurant');
      return sendError(res, 404, 'forbidden');
    }
    next();
    return;
  } catch (error) {
    return handleErrors(res, error);
  }
}

const customer_routes = express.Router();
const admin_routes = express.Router();
const partner_routes = express.Router();
const vendor_routes = express.Router();

admin_routes.get(
  '/:id/vendor_login_details',
  controller.getRestaurantVendorsDetails
);
admin_routes.get('/:id/slot', validate_Restaurant_Owner, controller.getSlots);
admin_routes.put('/:id/slot', validate_Restaurant_Owner, controller.updateSlot);
admin_routes.post('/review/filter', controller.admin_reviewFilter);
admin_routes.post(
  '/:id/approval/admin',
  validate_Restaurant_Owner,
  controller.adminApproval
);
admin_routes.post(
  '/:id/approval/catalog',
  validate_Restaurant_Owner,
  controller.catalogApproval
);
admin_routes.put(
  '/:id/disable',
  validate_Restaurant_Owner,
  controller.disableRestaurant
);
admin_routes.get(
  '/:id',
  validate_Restaurant_Owner,
  controller.readRestaurantById
);
admin_routes.get(
  '/:id/holidaySlot',
  validate_Restaurant_Owner,
  controller.getRestaurantHolidaySlot
);

admin_routes.put('/parent/:id', controller.setRestaurantParent); // set parent
admin_routes.delete('/parent/:id', controller.deleteRestaurantParent); // set parent
// admin_routes.delete('/parent/:id', controller.updateRestaurantAsAdmin); // delete parent
admin_routes.get('/child/:id', controller.getRestaurantChildren); //Remove
admin_routes.get('/parent/:id', controller.getRestaurantParent); //Remove

admin_routes.post('/test', controller.readAllRestaurants);
admin_routes.get('/', controller.readAllRestaurants);
admin_routes.post('/filter', controller.readAllFilterRestaurants);
admin_routes.post('/:id/createHolidaySlot', controller.createHolidaySlotAdmin);
admin_routes.delete('/:id/holidaySlot', controller.removeHolidaySlot);

admin_routes.put('/:id', controller.updateRestaurantAsAdmin);

partner_routes.post(
  '/:id/sendOtp/documentSignature',
  validate_Restaurant_Owner,
  controller.sendOtpDocumentSignature
);
partner_routes.post(
  '/:id/verifyOtp/documentSignature',
  validate_Restaurant_Owner,
  controller.verifyOtpDocumentSignature
);

partner_routes.post(
  '/:id/sendOtp/ownerContact',
  validate_Restaurant_Owner,
  controller.sendOtpOwnerContact
);
partner_routes.post(
  '/:id/verifyOtp/ownerContact',
  validate_Restaurant_Owner,
  controller.verifyOtpOwnerContact
);
partner_routes.post(
  '/:id/sendOtp/ownerEmail',
  validate_Restaurant_Owner,
  controller.sendOtpOwnerEmail
);
partner_routes.post(
  '/:id/verifyOtp/ownerEmail',
  validate_Restaurant_Owner,
  controller.verifyOtpOwnerEmail
);
partner_routes.post(
  '/:id/verifyPostalCode',
  validate_Restaurant_Owner,
  controller.verifyPostalCode
);
partner_routes.post(
  '/:id/verifyPanNumber',
  validate_Restaurant_Owner,
  controller.verifyPanNumber
);
partner_routes.post(
  '/:id/verifyGstinNumber',
  validate_Restaurant_Owner,
  controller.verifyGstinNumber
);
partner_routes.post(
  '/:id/verifyIfscCode',
  validate_Restaurant_Owner,
  controller.verifyIfscCode
);
partner_routes.post(
  '/:id/verifyFssaiCertificate',
  validate_Restaurant_Owner,
  controller.verifyFssaiCertificate
);
partner_routes.post(
  '/:id/submit',
  validate_Restaurant_Owner,
  controller.submitRestaurant
);
partner_routes.get(
  '/:id',
  validate_Restaurant_Owner,
  controller.readRestaurantById
);
partner_routes.put(
  '/:id',
  validate_Restaurant_Owner,
  controller.updateRestaurantDraft
);
partner_routes.delete(
  '/:id',
  validate_Restaurant_Owner,
  controller.deleteRestaurantById
);
partner_routes.post('/', controller.createRestaurant);
partner_routes.get('/', controller.readRestaurantByPartnerId);

vendor_routes.get(
  '/child',
  validate_Restaurant_Owner,
  controller.getRestaurantChildren
);
vendor_routes.get(
  '/parent',
  validate_Restaurant_Owner,
  controller.getRestaurantParent
);
vendor_routes.get('/slot', validate_Restaurant_Owner, controller.getSlots);
vendor_routes.put('/slot', validate_Restaurant_Owner, controller.updateSlot);
vendor_routes.post(
  '/review/filter',
  validate_Restaurant_Owner,
  controller.reviewFilter
);
vendor_routes.post('/createHolidaySlot', controller.createHolidaySlot);
vendor_routes.delete('/holidaySlot', controller.removeHolidaySlot);
vendor_routes.get('/', controller.readRestaurantByVendorId);
vendor_routes.put('/', controller.updateRestaurant);

customer_routes.post('/filter', controller.filterRestaurants);
customer_routes.post(
  '/serviceable',
  controller.checkCartRestaurantServiceability
);
// customer_routes.get('/', controller.getRestaurant);

export default {customer_routes, admin_routes, partner_routes, vendor_routes};

/**
 * @openapix
 *"/food/restaurant":
 *  get:
 *    description: "Get All avtive restaurants"
 *    tags:
 *    - Restaurant
 *    security:
 *    - bearerAuthCustomer: []
 *    summary: "Customer Auth"
 *    parameters:
 *    - in: query
 *      name: lat
 *      description: Lattitude of user Geo Location
 *      type: number
 *      example: 1.098889
 *    - in: query
 *      name: long
 *      description: Longitude of user Geo Location
 *      type: number
 *      example: 2.0089002
 *    responses:
 *      '200':
 *        description: Got restaurant list
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/**
 * @openapi
 *"/food/restaurant/filter":
 *  post:
 *    description: "Filter Restaurants"
 *    tags:
 *    - Restaurant
 *    requestBody:
 *      content:
 *        application/json:
 *          name: body
 *          in: body
 *          description: Send post Data
 *          schema:
 *            type: object
 *            required:
 *              - coordinates
 *              - pagination
 *            properties:
 *              filter:
 *                type: object
 *                properties:
 *                  sort_by:
 *                    type: string
 *                    enum: [
 *                      "orders_count",
 *                      "rating",
 *                      "delivery_time"
 *                    ]
 *                    example: orders_count
 *                  sort_direction:
 *                    type: string
 *                    enum: [
 *                      "asc",
 *                      "desc"
 *                    ]
 *                    example: asc
 *                  cuisine_ids:
 *                    type: array
 *                    items:
 *                      type: string
 *                    example: ["1340fdd1-e593-42af-b765-1badf590de16"]
 *                  cost_lt:
 *                    type: number
 *                    example: 1000
 *                  cost_gt:
 *                    type: number
 *                    example: 100
 *              coordinates:
 *                type: object
 *                required:
 *                  - lat
 *                  - long
 *                properties:
 *                  lat:
 *                    type: number
 *                    example: 19.138731
 *                  long:
 *                    type: number
 *                    example: 72.96697
 *              pagination:
 *                type: object
 *                properties:
 *                  page_index:
 *                    type: number
 *                    example: 0
 *                  page_size:
 *                    type: number
 *                    example: 10
 *      required: true
 *    responses:
 *      '200':
 *        description: Got restaurant list
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/**
 * @openapi
 *"/food/restaurant/serviceable":
 *  post:
 *    description: "Check if restaurant and user address is serviceable or not"
 *    tags:
 *    - Restaurant
 *    requestBody:
 *      content:
 *        application/json:
 *          name: body
 *          in: body
 *          description: Send post Data
 *          schema:
 *            type: object
 *            properties:
 *              restaurant_id:
 *                type: string
 *                example: "0e753dab-d0dc-4206-b785-4e6c7d77394a"
 *              customer_coordinates:
 *                type: object
 *                example: {
 *                          "latitude" : 19.123456,
 *                          "longitude": 72.823456
 *                         }
 *      required: true
 *    responses:
 *      '200':
 *        description: Restaurant Serviceable
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/**
 * @openapi
 *"/food/partner/restaurant":
 *  get:
 *    description: "Get All Restaurant Partner"
 *    tags:
 *    - Restaurant
 *    security:
 *    - bearerAuthPartner: []
 *    summary: "Partner Auth"
 *    responses:
 *      '200':
 *        description: Got restaurant list
 *      '400':
 *        description: Input Data Validation Error
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/**
 * @openapi
 *"/food/partner/restaurant":
 *  post:
 *    description: "Create New Restaurant"
 *    tags:
 *    - Restaurant
 *    security:
 *    - bearerAuthPartner: []
 *    summary: "Partner Auth"
 *    requestBody:
 *      content:
 *        application/json:
 *          name: body
 *          in: body
 *          description: Send post Data
 *          schema:
 *            type: object
 *            properties:
 *              name:
 *                type: string
 *                example: Food
 *      required: true
 *    responses:
 *      '201':
 *        description: Successfully Created restaurant
 *      '400':
 *        description: Input Data Validation Error
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/**
 * @openapi
 *"/food/partner/restaurant/{id}":
 *  get:
 *    description: "Get Restaurant by id"
 *    tags:
 *    - Restaurant
 *    security:
 *    - bearerAuthPartner: []
 *    summary: "Partner Auth"
 *    parameters:
 *    - in: path
 *      name: id
 *      description: Restaurant ID
 *      required: true
 *      schema:
 *        type: string
 *    responses:
 *      '200':
 *        description: Got Partner Restaurant list
 *      '400':
 *        description: Input Data Validation Error
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/**
 * @openapi
 *"/food/partner/restaurant/{id}":
 *  put:
 *    description: "Update Restaurant Data in draft or submit for approval"
 *    tags:
 *    - Restaurant
 *    security:
 *    - bearerAuthPartner: []
 *    summary: "Partner Auth"
 *    parameters:
 *    - in: path
 *      name: id
 *      description: Restaurant ID
 *      required: true
 *      schema:
 *        type: string
 *    requestBody:
 *      content:
 *        application/json:
 *          name: body
 *          in: body
 *          description: Send post Data
 *          schema:
 *            type: object
 *            properties:
 *              status:
 *                type: string
 *                enum: [
 *                  "approvalPending",
 *                  "draft"
 *                ]
 *                example: draft
 *              name:
 *                type: string
 *                example: Food
 *              branch_name:
 *                type: string
 *                example: Food Mumbai
 *              lat:
 *                type: number
 *                example: 1.098889
 *                description: lattitude of restaurant location
 *              long:
 *                type: number
 *                example: 2.0089002
 *                description: longitude of restaurant location
 *              image:
 *                type: object
 *                properties:
 *                  name:
 *                    type: string
 *                    example: "25887d2c-4dc4-42a1-9e3d-62a6f0c33cae.jpg"
 *                    description: Restaurant image name
 *              images:
 *                type: array
 *                example: ["25887d2c-4dc4-42a1-9e3d-62a6f0c33cae.jpg"]
 *                description: Restaurant images name
 *              draft_section:
 *                type: string
 *                example: "basic / contact / fssai / bank"
 *                description: the current section of onboarding
 *              city_id:
 *                type: string
 *                example: "25887d2c-4dc4-42a1-9e3d-62a6f0c33cae"
 *                description: City id of restaurant
 *              area_id:
 *                type: string
 *                example: "25887d2c-4dc4-42a1-9e3d-62a6f0c33cae"
 *                description: Area/polygon id of restaurant
 *              tnc_accepted:
 *                type: boolean
 *                example: "true"
 *                description: Boolean value for tnc accepted
 *              user_profile:
 *                type: string
 *                example: "owner / manager"
 *                description: The current user is owner or manager
 *              owner_name:
 *                type: string
 *                example: Amitabh Bachchan
 *                description: Name of owner
 *              owner_contact_number:
 *                type: string
 *                example: "+919089890998"
 *                description: Contact Number of Owner
 *              owner_email:
 *                type: string
 *                example: "amitabh@bachchan.com"
 *                description: Email address of owner
 *              owner_is_manager:
 *                type: boolean
 *                example: "true"
 *                description: Is the owner and manager are same
 *              manager_name:
 *                type: string
 *                example: Jaya Bachchan
 *                description: Name of manager
 *              manager_contact_number:
 *                type: string
 *                example: "+919089890998"
 *                description: Contact Number of Manager
 *              manager_email:
 *                type: string
 *                example: "jaya@bachchan.com"
 *                description: Email address of manager
 *              invoice_email:
 *                type: string
 *                example: "invoice@bachchan.com"
 *                description: Email address of to send invoice
 *              location:
 *                type: string
 *                example: "13/67 G.B. road mumbai"
 *                description: Location text of restaturant from google map
 *              postal_code:
 *                type: string
 *                example: "401234"
 *                description: Postal code of restaurant
 *              state:
 *                type: string
 *                example: "Maharashtra"
 *                description: State of restaurant
 *              read_mou:
 *                type: boolean
 *                example: "true"
 *                description: Has Read Mou documents
 *              document_sign_number:
 *                type: string
 *                example: "+919089890998"
 *                description: MObile number to sign document via OTP
 *              is_pure_veg:
 *                type: boolean
 *                example: "true"
 *                description: Is Restaurant Pure veg
 *              allow_long_distance:
 *                type: boolean
 *                example: "true"
 *                description: Is Long distance is allowed
 *              cuisine_ids:
 *                type: array
 *                items:
 *                  type: string
 *                example: "[]"
 *                description: List of cuisine Ids
 *              cost_of_two:
 *                type: number
 *                example: 100.00
 *                description: Restaurant economical category
 *              menu_documents:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    name:
 *                      type: string
 *                      example: "25887d2c-4dc4-42a1-9e3d-62a6f0c33cae.jpg"
 *                      description: Menu Document
 *              scheduling_type:
 *                type: string
 *                example: "all / weekdays_and_weekends / custom"
 *                description: File Type of uploaded menu
 *              slot_schedule:
 *                type: array
 *                items:
 *                 type: object
 *                 properties:
 *                    slot_name:
 *                       type: string
 *                       example: "all"
 *                    start_time:
 *                       type: string
 *                       example: "0001"
 *                    end_time:
 *                       type: string
 *                       example: "0001"
 *
 *              packing_charge_type:
 *                type: string
 *                example: "none / item / order"
 *                description: The mode in which restaurant charges to customers
 *              packing_charge_order:
 *                type: object
 *                properties:
 *                  packing_charge:
 *                      type: number
 *                      example: 2.50
 *                      description: Packing charge
 *                  packing_image:
 *                    type: object
 *                    properties:
 *                      name:
 *                        type: string
 *                        example: "25887d2c-4dc4-42a1-9e3d-62a6f0c33cae.jpg"
 *                        description: Packing material image name
 *              custom_packing_charge_item:
 *                type: boolean
 *                example: "true"
 *              packing_charge_item:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    item_name:
 *                      type: string
 *                      example: Paneer Tikka
 *                      description: Name of Dish
 *                    item_price:
 *                      type: number
 *                      example: 120.00
 *                      description: Dish price
 *                    packing_charge:
 *                      type: number
 *                      example: 2.50
 *                      description: Packing charge
 *                    packing_image:
 *                      type: object
 *                      properties:
 *                        name:
 *                          type: string
 *                          example: "25887d2c-4dc4-42a1-9e3d-62a6f0c33cae.jpg"
 *                          description: Packing material image name
 *              fssai_has_certificate:
 *                type: boolean
 *                example: true
 *                description: Vendor has fssai certificate
 *              fssai_application_date:
 *                type: string
 *                format: date
 *                example: "2018-03-20"
 *                description: Applied date
 *              fssai_ack_number:
 *                type: string
 *                example: ASX12456BCGF
 *                description: Fssai ack Number
 *              fssai_ack_document:
 *                type: object
 *                properties:
 *                  name:
 *                    type: string
 *                    example: "25887d2c-4dc4-42a1-9e3d-62a6f0c33cae.jpg"
 *                    description: Acknoledgement file name
 *              fssai_expiry_date:
 *                type: string
 *                format: date
 *                example: "2018-03-20"
 *                description: expiry date
 *              fssai_cert_number:
 *                type: string
 *                example: ASX12456BCGF
 *                description: Fssai reg Number
 *              fssai_cert_document:
 *                type: object
 *                properties:
 *                  name:
 *                    type: string
 *                    example: "25887d2c-4dc4-42a1-9e3d-62a6f0c33cae.jpg"
 *                    description: Acknoledgement file name
 *              fssai_firm_name:
 *                type: string
 *                example: agarwa sweets
 *                description: Firm Name
 *              fssai_firm_address:
 *                type: string
 *                example: "unknown"
 *                description: firm address
 *              gst_category:
 *                type: string
 *                example: "restaurant / non-restaurant / hybrid"
 *                description: Gst Category
 *              pan_number:
 *                type: string
 *                example: ASX12456BCGF
 *                description: Pan Number
 *              pan_owner_name:
 *                type: string
 *                example: amitabh
 *                description: Pan card holder's name
 *              pan_document:
 *                type: object
 *                properties:
 *                  name:
 *                    type: string
 *                    example: "25887d2c-4dc4-42a1-9e3d-62a6f0c33cae.jpg"
 *                    description: Pan doc file name
 *              has_gstin:
 *                type: boolean
 *                example: true
 *                description: Has Gstin Number
 *              gstin_number:
 *                type: string
 *                example: ASX12456BCGF
 *                description: GSTIN  Number
 *              gstin_document:
 *                type: object
 *                properties:
 *                  name:
 *                    type: string
 *                    example: "25887d2c-4dc4-42a1-9e3d-62a6f0c33cae.jpg"
 *                    description: GST file name
 *              business_name:
 *                type: string
 *                example: Agarwal sweets
 *                description: Name of business
 *              business_address:
 *                type: string
 *                example: "unknown"
 *                description: Address of business
 *              bank_account_number:
 *                type: string
 *                example: 12897312098120
 *                description: Bank Acc  Number
 *              ifsc_code:
 *                type: string
 *                example: ICIC000101
 *                description: Bank IFSC Code
 *              bank_document:
 *                type: object
 *                properties:
 *                  name:
 *                    type: string
 *                    example: "25887d2c-4dc4-42a1-9e3d-62a6f0c33cae.jpg"
 *                    description: Bank Doc file name
 *              kyc_document:
 *                type: object
 *                properties:
 *                  name:
 *                    type: string
 *                    example: "25887d2c-4dc4-42a1-9e3d-62a6f0c33cae.jpg"
 *                    description: KYC file name
 *              default_preparation_time:
 *                type: number
 *                example: 20
 *      required: true
 *    responses:
 *      '200':
 *        description: Restaurant Updated
 *      '400':
 *        description: Input Data Validation Error
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/**
 * @openapi
 *"/food/admin/restaurant/parent/{id}":
 *  put:
 *    description: "Set Restaurant Parent"
 *    tags:
 *    - Restaurant
 *    security:
 *    - bearerAuthAdmin: []
 *    summary: "Admin Auth"
 *    parameters:
 *    - in: path
 *      name: id
 *      description: Restaurant ID
 *      required: true
 *      schema:
 *        type: string
 *    requestBody:
 *      content:
 *        application/json:
 *          name: body
 *          in: body
 *          description: Send post Data
 *          schema:
 *            type: object
 *            properties:
 *              parent_restaurant_id:
 *                type: string
 *                example: "111111"
 *      required: true
 *    responses:
 *      '200':
 *        description: Restaurant Updated
 *      '400':
 *        description: Input Data Validation Error
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/**
 * @openapi
 *"/food/admin/restaurant/parent/{id}":
 *  delete:
 *    description: "delete parent restaurant"
 *    tags:
 *    - Restaurant
 *    security:
 *    - bearerAuthAdmin: []
 *    summary: "Admin Auth"
 *    parameters:
 *    - in: path
 *      name: id
 *      description: Child Restaurant ID
 *      required: true
 *      schema:
 *        type: string
 *    responses:
 *      '200':
 *        description: Restaurant Updated
 *      '400':
 *        description: Input Data Validation Error
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/**
 * @openapi
 *"/food/admin/restaurant/child/{id}":
 *  get:
 *    description: "Get child restaurant"
 *    tags:
 *    - Restaurant
 *    security:
 *    - bearerAuthAdmin: []
 *    summary: "Admin Auth"
 *    parameters:
 *    - in: path
 *      name: id
 *      description: Restaurant ID
 *      required: true
 *      schema:
 *        type: string
 *    responses:
 *      '200':
 *        description: Restaurant Updated
 *      '400':
 *        description: Input Data Validation Error
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/**
 * @openapi
 *"/food/admin/restaurant/parent/{id}":
 *  get:
 *    description: "Get child restaurant"
 *    tags:
 *    - Restaurant
 *    security:
 *    - bearerAuthAdmin: []
 *    summary: "Admin Auth"
 *    parameters:
 *    - in: path
 *      name: id
 *      description: Restaurant ID
 *      required: true
 *      schema:
 *        type: string
 *    responses:
 *      '200':
 *        description: Restaurant Updated
 *      '400':
 *        description: Input Data Validation Error
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/**
 * @openapi
 *"/food/admin/restaurant/{id}/slot":
 *  get:
 *    description: "Get Restaurant slots"
 *    tags:
 *    - Restaurant
 *    security:
 *    - bearerAuthAdmin: []
 *    summary: "Admin Auth"
 *    parameters:
 *    - in: path
 *      name: id
 *      description: Restaurant ID
 *      required: true
 *      schema:
 *        type: string
 *    responses:
 *      '200':
 *        description: Restaurant Updated
 *      '400':
 *        description: Input Data Validation Error
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/**
 * @openapi
 *"/food/admin/restaurant/{id}/vendor_login_details":
 *  get:
 *    description: "Get Restaurant slots"
 *    tags:
 *    - Restaurant
 *    security:
 *    - bearerAuthAdmin: []
 *    summary: "Admin Auth"
 *    parameters:
 *    - in: path
 *      name: id
 *      description: Restaurant ID
 *      required: true
 *      schema:
 *        type: string
 *    responses:
 *      '200':
 *        description: Restaurant Updated
 *      '400':
 *        description: Input Data Validation Error
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/**
 * @openapi
 *"/food/admin/restaurant/{id}":
 *  put:
 *    description: "update restaurant"
 *    tags:
 *    - Restaurant
 *    security:
 *    - bearerAuthAdmin: []
 *    summary: "Admin Auth"
 *    parameters:
 *    - in: path
 *      name: id
 *      description: Restaurant ID
 *      required: true
 *    requestBody:
 *      content:
 *        application/json:
 *          name: body
 *          in: body
 *          description: Send post Data
 *          schema:
 *            type: object
 *            properties:
 *              default_preparation_time:
 *                type: number
 *                example: 20
 *              free_delivery:
 *                type: boolean
 *                example: false
 *              name:
 *                type: string
 *                example: "restaurant name"
 *              branch_name:
 *                type: string
 *                example: "restaurant branch name"
 *              poc_number:
 *                type: string
 *                example: "+919819999999"
 *              speedyy_account_manager_id:
 *                type: string
 *                example: "88201b8a-ed11-4646-ba25-22651ac2b462"
 *              image:
 *                type: object
 *                properties:
 *                  name:
 *                    type: string
 *                    example: "25887d2c-4dc4-42a1-9e3d-62a6f0c33cae.jpg"
 *                    description: Restaurant image name
 *              images:
 *                type: array
 *                example: [{"name": "25887d2c-4dc4-42a1-9e3d-62a6f0c33cae.jpg"}]
 *              city_id:
 *                type: string
 *                example: "1554df25-69c8-4b25-bac7-f845804d3d33"
 *              area_id:
 *                type: string
 *                example: "045f7913-23e6-4e50-b453-8f59fa8bddec"
 *              lat:
 *                type: number
 *                example: 1.0212
 *              long:
 *                type: number
 *                example: 1.1212
 *              location:
 *                type: string
 *                example: "address"
 *              postal_code:
 *                type: string
 *                example: "address"
 *              state:
 *                type: string
 *                example: "address"
 *              delivery_charge_paid_by:
 *                type: string
 *                example: "customer | restaurant | speedyy"
 *    responses:
 *      '200':
 *        description: restaurant updated
 *      '400':
 *        description: Bad Request
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/**
 * @openapi
 *"/food/admin/restaurant/{id}/slot":
 *  put:
 *    description: "Update Restaurant slots"
 *    tags:
 *    - Restaurant
 *    security:
 *    - bearerAuthAdmin: []
 *    summary: "Admin Auth"
 *    parameters:
 *    - in: path
 *      name: id
 *      description: Restaurant ID
 *      required: true
 *      schema:
 *        type: string
 *    requestBody:
 *      content:
 *        application/json:
 *          name: body
 *          in: body
 *          description: Send post Data
 *          schema:
 *            type: object
 *            properties:
 *              scheduling_type:
 *                type: string
 *                example: "all / weekdays_and_weekends / custom"
 *                description: File Type of uploaded menu
 *              slot_schedule:
 *                type: array
 *                items:
 *                 type: object
 *                 properties:
 *                    slot_name:
 *                       type: string
 *                       example: "all"
 *                    start_time:
 *                       type: string
 *                       example: "0001"
 *                    end_time:
 *                       type: string
 *                       example: "0001"
 *      required: true
 *    responses:
 *      '200':
 *        description: Restaurant Updated
 *      '400':
 *        description: Input Data Validation Error
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/**
 * @openapi
 *"/food/partner/restaurant/{id}":
 *  delete:
 *    description: "delete restaurant by id"
 *    tags:
 *    - Restaurant
 *    security:
 *    - bearerAuthPartner: []
 *    summary: "Partner Auth"
 *    parameters:
 *    - in: path
 *      name: id
 *      description: Restaurant ID
 *      required: true
 *      schema:
 *        type: string
 *    responses:
 *      '200':
 *        description: Restaurant Deleted
 *      '400':
 *        description: Input Data Validation Error
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/**
 * @openapi
 *"/food/vendor/restaurant/createHolidaySlot":
 *  post:
 *    description: "Create holiday slot"
 *    tags:
 *    - Restaurant
 *    security:
 *    - bearerAuthVendor: []
 *    summary: "Vendor Auth"
 *    requestBody:
 *      content:
 *        application/json:
 *          name: body
 *          in: body
 *          description: Send post Data
 *          schema:
 *            type: object
 *            properties:
 *              end_epoch:
 *                type: number
 *                example: 1234567890
 *    responses:
 *      '200':
 *        description: Slot created
 *      '400':
 *        description: Bad Request
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/**
 * @openapi
 *"/food/vendor/restaurant/holidaySlot":
 *  delete:
 *    description: "Remove holiday slot"
 *    tags:
 *    - Restaurant
 *    security:
 *    - bearerAuthVendor: []
 *    summary: "Vendor Auth"
 *    responses:
 *      '200':
 *        description: Slot created
 *      '400':
 *        description: Bad Request
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/**
 * @openapi
 *"/food/vendor/restaurant":
 *  put:
 *    description: "update restaurant"
 *    tags:
 *    - Restaurant
 *    security:
 *    - bearerAuthVendor: []
 *    summary: "Vendor Auth"
 *    requestBody:
 *      content:
 *        application/json:
 *          name: body
 *          in: body
 *          description: Send post Data
 *          schema:
 *            type: object
 *            properties:
 *              free_delivery:
 *                type: boolean
 *                example: false
 *              default_preparation_time:
 *                type: number
 *                example: 20
 *              image:
 *                type: object
 *                properties:
 *                  name:
 *                    type: string
 *                    example: "25887d2c-4dc4-42a1-9e3d-62a6f0c33cae.jpg"
 *                    description: Restaurant image name
 *              images:
 *                type: array
 *                example: [{"name": "25887d2c-4dc4-42a1-9e3d-62a6f0c33cae.jpg"}]
 *    responses:
 *      '200':
 *        description: Slot created
 *      '400':
 *        description: Bad Request
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/**
 * @openapi
 *"/food/admin/restaurant/{id}/createHolidaySlot":
 *  post:
 *    description: "Create holiday slot"
 *    tags:
 *    - Restaurant
 *    security:
 *    - bearerAuthAdmin: []
 *    summary: "Admin Auth"
 *    parameters:
 *    - in: path
 *      name: id
 *      description: Restaurant ID
 *      required: true
 *      schema:
 *        type: string
 *    requestBody:
 *      content:
 *        application/json:
 *          name: body
 *          in: body
 *          description: Send post Data
 *          schema:
 *            type: object
 *            properties:
 *              end_epoch:
 *                type: number
 *                example: 1234567890
 *    responses:
 *      '200':
 *        description: Slot created
 *      '400':
 *        description: Bad Request
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/**
 * @openapi
 *"/food/admin/restaurant/{id}/holidaySlot":
 *  delete:
 *    description: "Remove holiday slot"
 *    tags:
 *    - Restaurant
 *    security:
 *    - bearerAuthAdmin: []
 *    summary: "Admin Auth"
 *    parameters:
 *    - in: path
 *      name: id
 *      description: Restaurant ID
 *      required: true
 *      schema:
 *        type: string
 *    responses:
 *      '200':
 *        description: Slot created
 *      '400':
 *        description: Bad Request
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/** POST ADMIN
 * @openapi
 *paths:
 *  "/food/admin/restaurant/review/filter":
 *    post:
 *      tags:
 *      - Restaurant
 *      security:
 *      - bearerAuthAdmin: []
 *      summary: "Admin Auth"
 *      description: filter restaurant
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            description: Document
 *            schema:
 *              type: object
 *              properties:
 *                restaurant_ids:
 *                  type: string
 *                  example: ["uuid"]
 *                filter:
 *                  type: object
 *                  properties:
 *                    vote_type:
 *                      type: number
 *                      example: 1
 *                    rating:
 *                      type: number
 *                      example: 3
 *                    rating_gt:
 *                      type: number
 *                      example: 1
 *                    rating_lt:
 *                      type: number
 *                      example: 4
 *                pagination:
 *                  type: object
 *                  properties:
 *                    page_index:
 *                      type: number
 *                      example: 0
 *                    page_size:
 *                      type: number
 *                      example: 10
 *                sort:
 *                  type: array
 *                  example: [{
 *                           column: "created_at",
 *                           order: "asc"
 *                           }]
 *      responses:
 *        '201':
 *          description: Created Successfully
 *        '400':
 *          description: Validation Error
 *        '500':
 *          description: Internal Server Error
 */

/**
 * @openapi
 *"/food/vendor/restaurant/child":
 *  get:
 *    description: "Get child restaurant"
 *    tags:
 *    - Restaurant
 *    security:
 *    - bearerAuthVendor: []
 *    summary: "Vendor Auth"
 *    responses:
 *      '200':
 *        description: Restaurant Updated
 *      '400':
 *        description: Input Data Validation Error
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/**
 * @openapi
 *"/food/vendor/restaurant/parent":
 *  get:
 *    description: "Get child restaurant"
 *    tags:
 *    - Restaurant
 *    security:
 *    - bearerAuthVendor: []
 *    summary: "Vendor Auth"
 *    responses:
 *      '200':
 *        description: Restaurant Updated
 *      '400':
 *        description: Input Data Validation Error
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/** POST VENDOR
 * @openapi
 *paths:
 *  "/food/vendor/restaurant/review/filter":
 *    post:
 *      tags:
 *      - Restaurant
 *      security:
 *      - bearerAuthVendor: []
 *      summary: "Vendor Auth"
 *      description: filter restaurant
 *      requestBody:
 *        content:
 *          application/json:
 *            name: body
 *            in: body
 *            description: Document
 *            schema:
 *              type: object
 *              properties:
 *                filter:
 *                  type: object
 *                  properties:
 *                    vote_type:
 *                      type: number
 *                      example: 1
 *                    rating:
 *                      type: number
 *                      example: 3
 *                    rating_gt:
 *                      type: number
 *                      example: 1
 *                    rating_lt:
 *                      type: number
 *                      example: 4
 *                pagination:
 *                  type: object
 *                  properties:
 *                    page_index:
 *                      type: number
 *                      example: 0
 *                    page_size:
 *                      type: number
 *                      example: 10
 *                sort:
 *                  type: array
 *                  example: [{
 *                           column: "created_at",
 *                           order: "asc"
 *                           }]
 *      responses:
 *        '201':
 *          description: Created Successfully
 *        '400':
 *          description: Validation Error
 *        '500':
 *          description: Internal Server Error
 */

/**
 * @openapi
 *"/food/vendor/restaurant":
 *  get:
 *    description: "Get Vendor Restaurant Details"
 *    tags:
 *    - Restaurant
 *    security:
 *    - bearerAuthVendor: []
 *    summary: "Vendor Auth"
 *    parameters:
 *    - name: child_outlet_id
 *      in: header
 *      description: Child Restaurant Setting
 *      type: string
 *    responses:
 *      '200':
 *        description: Got restaurant list
 *      '400':
 *        description: Input Data Validation Error
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/** PUT - VENDOR - SLOT
 * @openapi
 *"/food/vendor/restaurant/slot":
 *  put:
 *    description: "Update Restaurant slots"
 *    tags:
 *    - Restaurant
 *    security:
 *    - bearerAuthVendor: []
 *    summary: "Vendor Auth"
 *    requestBody:
 *      content:
 *        application/json:
 *          name: body
 *          in: body
 *          description: Send post Data
 *          schema:
 *            type: object
 *            properties:
 *              scheduling_type:
 *                type: string
 *                example: "all / weekdays_and_weekends / custom"
 *                description: File Type of uploaded menu
 *              slot_schedule:
 *                type: array
 *                items:
 *                 type: object
 *                 properties:
 *                    slot_name:
 *                       type: string
 *                       example: "all"
 *                    start_time:
 *                       type: string
 *                       example: "0001"
 *                    end_time:
 *                       type: string
 *                       example: "0001"
 *      required: true
 *    responses:
 *      '200':
 *        description: Restaurant Updated
 *      '400':
 *        description: Input Data Validation Error
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/**
 * @openapi
 *"/food/vendor/restaurant/slot":
 *  get:
 *    description: "Get Restaurant slots"
 *    tags:
 *    - Restaurant
 *    security:
 *    - bearerAuthVendor: []
 *    summary: "Vendor Auth"
 *    responses:
 *      '200':
 *        description: Restaurant Slots Fetched
 *      '400':
 *        description: Input Data Validation Error
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/**
 * @openapi
 *"/food/partner/restaurant/{id}/submit":
 *  post:
 *    description: "Submit restaurant data for approval"
 *    tags:
 *    - Restaurant
 *    security:
 *    - bearerAuthPartner: []
 *    summary: "Partner Auth"
 *    parameters:
 *    - in: path
 *      name: id
 *      description: Restaurant ID
 *      required: true
 *      schema:
 *        type: string
 *    responses:
 *      '200':
 *        description: Got Partner Restaurant list
 *      '400':
 *        description: Input Data Validation Error
 *      '401':
 *        description: Not Authorized
 *      '500':
 *        description: Internal Server Error
 */

/**
 * @openapi
 *"/food/partner/restaurant/{id}/sendOtp/documentSignature":
 *  post:
 *    description: "Send Business Otp"
 *    tags:
 *    - Restaurant
 *    security:
 *    - bearerAuthPartner: []
 *    summary: "Partner Auth"
 *    parameters:
 *    - in: path
 *      name: id
 *      description: Restaurant ID
 *      required: true
 *      schema:
 *        type: string
 *    requestBody:
 *      content:
 *        application/json:
 *          name: body
 *          in: body
 *          description: Send post Data
 *          schema:
 *            type: object
 *            properties:
 *              phone:
 *                type: string
 *                example: 9879879879
 *      required: true
 *    responses:
 *      '200':
 *        description: Got Partner Restaurant list
 *      '400':
 *        description: Input Data Validation Error
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/**
 * @openapi
 *"/food/partner/restaurant/{id}/verifyOtp/documentSignature":
 *  post:
 *    description: "Send Business Otp"
 *    tags:
 *    - Restaurant
 *    security:
 *    - bearerAuthPartner: []
 *    summary: "Partner Auth"
 *    parameters:
 *    - in: path
 *      name: id
 *      description: Restaurant ID
 *      required: true
 *      schema:
 *        type: string
 *    requestBody:
 *      content:
 *        application/json:
 *          name: body
 *          in: body
 *          description: Send post Data
 *          schema:
 *            type: object
 *            properties:
 *              phone:
 *                type: string
 *                example: 9879879879
 *              otp:
 *                type: string
 *                example: 0000
 *      required: true
 *    responses:
 *      '200':
 *        description: Got Partner Restaurant list
 *      '400':
 *        description: Input Data Validation Error
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/**
 * @openapi
 *"/food/partner/restaurant/{id}/sendOtp/ownerContact":
 *  post:
 *    description: "Send ownerContact Otp"
 *    tags:
 *    - Restaurant
 *    security:
 *    - bearerAuthPartner: []
 *    summary: "Partner Auth"
 *    parameters:
 *    - in: path
 *      name: id
 *      description: Restaurant ID
 *      required: true
 *      schema:
 *        type: string
 *    requestBody:
 *      content:
 *        application/json:
 *          name: body
 *          in: body
 *          description: Send post Data
 *          schema:
 *            type: object
 *            properties:
 *              phone:
 *                type: string
 *                example: 9879879879
 *      required: true
 *    responses:
 *      '200':
 *        description: Successful
 *      '400':
 *        description: Input Data Validation Error
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/**
 * @openapi
 *"/food/partner/restaurant/{id}/verifyOtp/ownerContact":
 *  post:
 *    description: "verify ownerContact Otp"
 *    tags:
 *    - Restaurant
 *    security:
 *    - bearerAuthPartner: []
 *    summary: "Partner Auth"
 *    parameters:
 *    - in: path
 *      name: id
 *      description: Restaurant ID
 *      required: true
 *      schema:
 *        type: string
 *    requestBody:
 *      content:
 *        application/json:
 *          name: body
 *          in: body
 *          description: Send post Data
 *          schema:
 *            type: object
 *            properties:
 *              phone:
 *                type: string
 *                example: 9879879879
 *              otp:
 *                type: string
 *                example: 0000
 *      required: true
 *    responses:
 *      '200':
 *        description: Successful
 *      '400':
 *        description: Input Data Validation Error
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/**
 * @openapi
 *"/food/partner/restaurant/{id}/sendOtp/ownerEmail":
 *  post:
 *    description: "Send ownerEmail Otp"
 *    tags:
 *    - Restaurant
 *    security:
 *    - bearerAuthPartner: []
 *    summary: "Partner Auth"
 *    parameters:
 *    - in: path
 *      name: id
 *      description: Restaurant ID
 *      required: true
 *      schema:
 *        type: string
 *    requestBody:
 *      content:
 *        application/json:
 *          name: body
 *          in: body
 *          description: Send post Data
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *                example: abc@xyz.com
 *      required: true
 *    responses:
 *      '200':
 *        description: Successful
 *      '400':
 *        description: Input Data Validation Error
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/**
 * @openapi
 *"/food/partner/restaurant/{id}/verifyOtp/ownerEmail":
 *  post:
 *    description: "verify ownerEmail Otp"
 *    tags:
 *    - Restaurant
 *    security:
 *    - bearerAuthPartner: []
 *    summary: "Partner Auth"
 *    parameters:
 *    - in: path
 *      name: id
 *      description: Restaurant ID
 *      required: true
 *      schema:
 *        type: string
 *    requestBody:
 *      content:
 *        application/json:
 *          name: body
 *          in: body
 *          description: Send post Data
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *                example: abc@xyz.com
 *              otp:
 *                type: string
 *                example: 0000
 *      required: true
 *    responses:
 *      '200':
 *        description: Successful
 *      '400':
 *        description: Input Data Validation Error
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/**
 * @openapi
 *"/food/partner/restaurant/{id}/verifyPostalCode":
 *  post:
 *    description: |
 *       ** please do not use this api **
 *    tags:
 *    - Restaurant
 *    security:
 *    - bearerAuthPartner: []
 *    summary: "Partner Auth"
 *    parameters:
 *    - in: path
 *      name: id
 *      description: Restaurant ID
 *      required: true
 *      schema:
 *        type: string
 *    requestBody:
 *      content:
 *        application/json:
 *          name: body
 *          in: body
 *          description: Send post Data
 *          schema:
 *            type: object
 *            properties:
 *              postal_code:
 *                type: string
 *                example: 123000
 *      required: true
 *    responses:
 *      '200':
 *        description: Got Partner Restaurant list
 *      '400':
 *        description: Input Data Validation Error
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/**
 * @openapi
 *"/food/partner/restaurant/{id}/verifyPanNumber":
 *  post:
 *    description: |
 *       ** please do not use this api **
 *    tags:
 *    - Restaurant
 *    security:
 *    - bearerAuthPartner: []
 *    summary: "Partner Auth"
 *    parameters:
 *    - in: path
 *      name: id
 *      description: Restaurant ID
 *      required: true
 *      schema:
 *        type: string
 *    requestBody:
 *      content:
 *        application/json:
 *          name: body
 *          in: body
 *          description: Send post Data
 *          schema:
 *            type: object
 *            properties:
 *              pan_number:
 *                type: string
 *                example: XYZ12345678
 *      required: true
 *    responses:
 *      '200':
 *        description: Got Partner Restaurant list
 *      '400':
 *        description: Input Data Validation Error
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/**
 * @openapi
 *"/food/partner/restaurant/{id}/verifyGstinNumber":
 *  post:
 *    description: |
 *       ** please do not use this api **
 *    tags:
 *    - Restaurant
 *    security:
 *    - bearerAuthPartner: []
 *    summary: "Partner Auth"
 *    parameters:
 *    - in: path
 *      name: id
 *      description: Restaurant ID
 *      required: true
 *      schema:
 *        type: string
 *    requestBody:
 *      content:
 *        application/json:
 *          name: body
 *          in: body
 *          description: Send post Data
 *          schema:
 *            type: object
 *            properties:
 *              gstin_number:
 *                type: string
 *                example: XYZ12345678
 *      required: true
 *    responses:
 *      '200':
 *        description: Got Partner Restaurant list
 *      '400':
 *        description: Input Data Validation Error
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/**
 * @openapi
 *"/food/partner/restaurant/{id}/verifyIfscCode":
 *  post:
 *    description: "verifyIfscCode"
 *    tags:
 *    - Restaurant
 *    security:
 *    - bearerAuthPartner: []
 *    summary: "Partner Auth"
 *    parameters:
 *    - in: path
 *      name: id
 *      description: Restaurant ID
 *      required: true
 *      schema:
 *        type: string
 *    requestBody:
 *      content:
 *        application/json:
 *          name: body
 *          in: body
 *          description: Send post Data
 *          schema:
 *            type: object
 *            properties:
 *              ifsc_code:
 *                type: string
 *                example: IFS1234567
 *      required: true
 *    responses:
 *      '200':
 *        description: Got Partner Restaurant list
 *      '400':
 *        description: Input Data Validation Error
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/**
 * @openapi
 *"/food/partner/restaurant/{id}/verifyFssaiCertificate":
 *  post:
 *    description: |
 *       ** please do not use this api **
 *    tags:
 *    - Restaurant
 *    security:
 *    - bearerAuthPartner: []
 *    summary: "Partner Auth"
 *    parameters:
 *    - in: path
 *      name: id
 *      description: Restaurant ID
 *      required: true
 *      schema:
 *        type: string
 *    requestBody:
 *      content:
 *        application/json:
 *          name: body
 *          in: body
 *          description: Send post Data
 *          schema:
 *            type: object
 *            properties:
 *              fssai_cert_number:
 *                type: string
 *                example: ABC1234567
 *                description: For testing it should start with "ABC"
 *      required: true
 *    responses:
 *      '200':
 *        description: Got Partner Restaurant list
 *      '400':
 *        description: Input Data Validation Error
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/**
 * @openapi
 *"/food/admin/restaurant":
 *  get:
 *    description: "Get list of all restaurant"
 *    tags:
 *    - Restaurant
 *    security:
 *    - bearerAuthAdmin: []
 *    summary: "Admin Auth"
 *    responses:
 *      '200':
 *        description: Got restaurant list
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/**
 * @openapi
 *"/food/admin/restaurant/filter":
 *  post:
 *    description: "Get list of all restaurant"
 *    tags:
 *    - Restaurant
 *    security:
 *    - bearerAuthAdmin: []
 *    requestBody:
 *      content:
 *        application/json:
 *          name: body
 *          in: body
 *          description: Send post Data
 *          schema:
 *            type: object
 *            example:
 *                  {
 *                   "filter": {
 *                     "status": [
 *                     ],
 *                     "area_id": [
 *                     ],
 *                     "city_id": [
 *                     ],
 *                     "city_name": "a",
 *                     "area_name": "a",
 *                     "allow_long_distance": true,
 *                     "hold_payout": false,
 *                     "is_pure_veg": true,
 *                     "speedyy_account_manager_id": "256cfc35-8729-4097-9104-05d26843de43"
 *                   },
 *                   "search_text": "a",
 *                   "pagination": {
 *                     "page_index": 0,
 *                     "page_size": 100
 *                   },
 *                  "sort": [{
 *                           "column": "created_at",
 *                           "order": "asc"
 *                           }]
 *                 }
 *    summary: "Admin Auth"
 *    responses:
 *      '200':
 *        description: Got restaurant list
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/**
 * @openapi
 *"/food/admin/restaurant/{id}":
 *  get:
 *    description: "Get Details of restaurant  by restaurant id"
 *    tags:
 *    - Restaurant
 *    security:
 *    - bearerAuthAdmin: []
 *    summary: "Admin Auth"
 *    parameters:
 *    - in: path
 *      name: id
 *      description: Restaurant ID
 *      required: true
 *      schema:
 *        type: string
 *    responses:
 *      '200':
 *        description: Got restaurant
 *      '400':
 *        description: Input Data Validation Error
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/**
 * @openapi
 *"/food/admin/restaurant/{id}/holidaySlot":
 *  get:
 *    description: "Get Holiday Slot of restaurant"
 *    tags:
 *    - Restaurant
 *    security:
 *    - bearerAuthAdmin: []
 *    summary: "Admin Auth"
 *    parameters:
 *    - in: path
 *      name: id
 *      description: Restaurant ID
 *      required: true
 *      schema:
 *        type: string
 *    responses:
 *      '200':
 *        description: Got restaurant
 *      '400':
 *        description: Input Data Validation Error
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/**
 * @openapi
 *"/food/admin/restaurant/{id}/approval/admin":
 *  post:
 *    description: "Approve or reject restaurant by admin with approval comments"
 *    tags:
 *    - Restaurant
 *    security:
 *    - bearerAuthAdmin: []
 *    summary: "Admin Auth"
 *    parameters:
 *    - in: path
 *      name: id
 *      description: Restaurant ID
 *      required: true
 *      schema:
 *        type: string
 *    requestBody:
 *      content:
 *        application/json:
 *          name: body
 *          in: body
 *          description: Send post Data
 *          schema:
 *            type: object
 *            properties:
 *              approved:
 *                type: boolean
 *                example: true
 *              status_comments:
 *                type: test
 *                example: All Looks Good
 *      required: true
 *    responses:
 *      '200':
 *        description: Restaurant Approved/Rejected
 *      '400':
 *        description: Input Data Validation Error
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/**
 * @openapi
 *"/food/admin/restaurant/{id}/approval/catalog":
 *  post:
 *    description: "Approve restaurant for catalog"
 *    tags:
 *    - Restaurant
 *    security:
 *    - bearerAuthAdmin: []
 *    summary: "Admin Auth"
 *    parameters:
 *    - in: path
 *      name: id
 *      description: Restaurant ID
 *      required: true
 *      schema:
 *        type: string
 *    responses:
 *      '200':
 *        description: Restaurant Catalog Done
 *      '400':
 *        description: Input Data Validation Error
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */

/**
 * @openapi
 *"/food/admin/restaurant/{id}/disable":
 *  put:
 *    description: "Approve restaurant for catalog"
 *    tags:
 *    - Restaurant
 *    security:
 *    - bearerAuthAdmin: []
 *    summary: "Admin Auth"
 *    parameters:
 *    - in: path
 *      name: id
 *      description: Restaurant ID
 *      required: true
 *      schema:
 *        type: string
 *    requestBody:
 *      content:
 *        application/json:
 *          name: body
 *          in: body
 *          description: Send post Data
 *          schema:
 *            type: object
 *            properties:
 *              disable:
 *                type: boolean
 *                example: true
 *              comments:
 *                type: string
 *                example: abusive
 *      required: true
 *    responses:
 *      '200':
 *        description: Restaurant Catalog Done
 *      '400':
 *        description: Input Data Validation Error
 *      '401':
 *        description: Unauthorized
 *      '500':
 *        description: Internal Server Error
 */
