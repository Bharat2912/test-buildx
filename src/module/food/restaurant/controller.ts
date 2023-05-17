import {Request, Response} from 'express';
import handleErrors from '../../../utilities/controllers/handle_errors';
import * as models from './models';
import {sendSQSMessage, SQS_URL} from '../../../utilities/sqs_manager';
import logger from '../../../utilities/logger/winston_logger';
import constants from './constants';
import {
  generateDownloadFileURL,
  saveS3File,
  saveS3Files,
} from '../../../utilities/s3_manager';
import ResponseError from '../../../utilities/response_error';
import {
  sendError,
  sendSuccess,
} from '../../../utilities/controllers/handle_response';
import {ISMS_OTP, sendOtp, verifyOtp} from '../../../utilities/otp';
import {esIndexData} from '../../../utilities/es_manager';
import {validateRestaurant} from '../cart/utilities/restaurant/restaurant_validation';
import {humanizeNumber, isEmpty} from '../../../utilities/utilFuncs';
import {
  addressDeliverabilityCheck,
  internalServiceabilityCheck,
} from '../cart/utilities/serviceability';
import {
  ICusomerDeliverableAddress,
  ICustomerAddress,
  IRestaurantValidationResponse,
} from '../cart/types';
import * as verify from '../../core/verify/models';
import {
  verify_review_filter_as_admin,
  verify_review_filter_as_vendor,
  verify_update_restaurant_as_admin,
} from '../restaurant/validations';
import Joi from 'joi';
import {getTransaction} from '../../../data/knex';
import {
  IFilterRestaurants,
  IRestaurantGetDeliveryDetails,
  IReviewFilter,
  IReviewFilterAsAdmin,
  IUpdateRestaurantAsAdmin,
} from '../restaurant/types';
import {filterReview} from '../order/models';
import {RestaurantSortBy} from './enums';
import {
  calculateRestaurantAvailability,
  calculateRestaurantsTravelTimeAndDistance,
  generateDocumentType,
  upsertRestaurantAvailabilityInCache,
  isLatAndLongServiceableInCityArea,
  putRestaurantElasticSearchDocument,
  validateImageType,
  validateSlots,
  deleteRestaurantAvailabilityFromCache,
  setRestaurantAvailability,
} from './service';
import {
  getAdminDetailsById,
  getAdminDetailsByIds,
  getRestaurantVendors,
} from '../../../utilities/user_api';
import Globals from '../../../utilities/global_var/globals';
import {joi_restaurant_id} from '../../../utilities/joi_common';
import {createRestaurantPayoutAccount} from '../payout_account/service';
import {createNewSubscription} from '../subscription/service';
import {getRestaurantSlots} from './models';
import {getElasticSearchServiceableRestaurant} from './es_models';
import {SortOrder} from '../../../enum';

// export async function getServiceableRestaurant(
//   lat: number,
//   long: number,
//   distance?: number
// ): Promise<string[]> {
//   const data = {
//     coordinate: [lat, long],
//     radius: distance || process.env.SERVICEABILITY_DEFAULT_RADIUS,
//   };
//   logger.debug(
//     'url',
//     process.env.SERVICEABILITY_API_URL + '/internal/getRestaurants'
//   );
//   logger.debug('data', data);
//   const restIds = await axios
//     .post(
//       process.env.SERVICEABILITY_API_URL + '/internal/getRestaurants',
//       data,
//       {timeout: 5000}
//     )
//     .then(response => {
//       logger.debug(
//         'servicability worker: Restaurants Ids:',
//         response.data.restaurant_ids
//       );
//       return response.data.restaurant_ids;
//     })
//     .catch(async error => {
//       logger.error(error);
//       return await models.es_getServiceableRestaurant(lat, long, distance);
//       // return await models.getServiceableRestaurant(lat, long, distance);
//       // throw new ResponseError(500, 'Server Error');
//     });
//   return restIds;
// }
export async function createHolidaySlot(req: Request, res: Response) {
  try {
    const validation = models.verify_validateHolidaySlot.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = validation.value;
    logger.debug('Restaurant ID', req.user.data.restaurant_id);
    logger.debug('End Epoch', validated_req.end_epoch);
    const open_after = new Date(0);
    open_after.setUTCSeconds(validation.value.end_epoch);
    if (open_after < new Date()) {
      return sendError(res, 400, [
        {
          message: 'end time is before current date',
          code: 1094,
        },
      ]);
    }

    const restaurant = await models.readRestaurantById(
      req.user.data.restaurant_id
    );
    if (!restaurant) {
      return sendError(res, 404, [
        {
          message: 'restaurant not found',
          code: 1093,
        },
      ]);
    }

    await setRestaurantAvailability([restaurant]);

    if (
      restaurant.availability?.is_holiday &&
      restaurant.availability?.created_by === 'admin'
    ) {
      return sendError(res, 400, [
        {
          message: 'in holiday by admin',
          code: 1095,
        },
      ]);
    }

    const holiday_data = <models.IHolidaySlot>{
      created_by: 'VENDOR_' + req.user.id,
      restaurant_id: req.user.data.restaurant_id,
      open_after: open_after,
    };
    const trx = await getTransaction();
    try {
      const holiday_slot = await models.createHolidaySlot(trx, holiday_data);
      const time_slot = await getRestaurantSlots([req.user.data.restaurant_id]);
      if (time_slot && holiday_slot) {
        const availability = calculateRestaurantAvailability(
          time_slot,
          holiday_slot
        );
        await upsertRestaurantAvailabilityInCache(
          req.user.data.restaurant_id,
          availability
        );
      }
      await trx.commit();
    } catch (error) {
      await trx.rollback();
      logger.error('Failed saving holiday Slot', error);
      throw error;
    }
    return sendSuccess(res, 200, {...holiday_data});
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function removeHolidaySlot(req: Request, res: Response) {
  try {
    let restaurant_id = req.params.id;
    if (req.user.data && req.user.data.restaurant_id)
      restaurant_id = req.user.data.restaurant_id;
    if (!restaurant_id) return sendError(res, 400, 'Restaurant ID required');
    logger.debug('Restaurant ID', restaurant_id);

    const restaurant = await models.readRestaurantById(restaurant_id);
    if (!restaurant) {
      return sendError(res, 404, [
        {
          message: 'restaurant not found',
          code: 1093,
        },
      ]);
    }

    await setRestaurantAvailability([restaurant]);

    if (!restaurant.availability?.is_holiday) {
      return sendError(res, 400, [
        {
          message: 'not in holiday',
          code: 1096,
        },
      ]);
    }
    if (
      req.user.user_type !== 'admin' &&
      restaurant.availability?.created_by === 'admin'
    ) {
      return sendError(res, 400, [
        {
          message: 'in holiday by admin',
          code: 1095,
        },
      ]);
    }

    const trx = await getTransaction();
    try {
      await models.deleteHolidaySlot(trx, restaurant_id);
      const time_slot = await getRestaurantSlots([restaurant.id]);
      const availability = calculateRestaurantAvailability(time_slot);

      await upsertRestaurantAvailabilityInCache(restaurant_id, availability);
      await trx.commit();
    } catch (error) {
      await trx.rollback();
      logger.error('Failed saving holiday Slot', error);
      throw error;
    }
    return sendSuccess(res, 200, 'removed from holiday slot');
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function createHolidaySlotAdmin(req: Request, res: Response) {
  try {
    req.body.restaurant_id = req.params.id;
    const validation = models.verify_validateHolidaySlotAdmin.validate(
      req.body
    );
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = validation.value;
    logger.debug('Restaurant ID', validated_req.restaurant_id);
    logger.debug('End Epoch', validated_req.end_epoch);
    const open_after = new Date(0);
    open_after.setUTCSeconds(validation.value.end_epoch);
    if (open_after < new Date()) {
      return sendError(res, 400, [
        {
          message: 'end time is before current date',
          code: 1094,
        },
      ]);
    }

    const restaurant = await models.readRestaurantById(
      validated_req.restaurant_id
    );
    if (!restaurant) {
      return sendError(res, 404, [
        {
          message: 'restaurant not found',
          code: 1093,
        },
      ]);
    }

    await setRestaurantAvailability([restaurant]);

    const holiday_data = <models.IHolidaySlot>{
      created_by: 'ADMIN_' + req.user.id,
      restaurant_id: validated_req.restaurant_id,
      open_after: open_after,
    };

    const trx = await getTransaction();
    try {
      const holiday_slot = await models.createHolidaySlot(trx, holiday_data);
      const time_slot = await getRestaurantSlots([validated_req.restaurant_id]);
      if (time_slot && holiday_slot) {
        const availability = calculateRestaurantAvailability(
          time_slot,
          holiday_slot
        );
        await upsertRestaurantAvailabilityInCache(
          validated_req.restaurant_id,
          availability
        );
      }
      await trx.commit();
    } catch (error) {
      await trx.rollback();
      logger.error('Failed saving holiday Slot', error);
      throw error;
    }
    return sendSuccess(res, 200, {...holiday_data});
  } catch (error) {
    return handleErrors(res, error);
  }
}

// async function test() {
//   const rest_id = '1234';

// Current slot without holiday
// const time_slot = [
//   {
//     slot_name: 'fri',
//     restaurant_id: rest_id,
//     start_time: '0001',
//     end_time: '2359',
//   },
// ];
// const rest_holiday_slot = null;

// // Current slot with holiday
// const time_slot = [
//   {
//     slot_name: 'fri',
//     restaurant_id: rest_id,
//     start_time: '0001',
//     end_time: '2359',
//   },
// ];
// const rest_holiday_slot = {
//   restaurant_id: rest_id,
//   created_by: '',
//   open_after: moment().add(10, 'minute').toDate(),
// };

// // Next slot after holiday slot
// const time_slot = [
//   {
//     slot_name: 'fri',
//     restaurant_id: rest_id,
//     start_time: '1710',
//     end_time: '2359',
//   },
// ];
// const rest_holiday_slot = {
//   restaurant_id: rest_id,
//   created_by: '',
//   open_after: moment().add(10, 'minute').toDate(),
// };

// // Next slot but not holiday
// const time_slot = [
//   {
//     restaurant_id: rest_id,
//     slot_name: 'fri',
//     start_time: '2000',
//     end_time: '2100',
//   },
//   {
//     restaurant_id: rest_id,
//     slot_name: 'fri',
//     start_time: '2310',
//     end_time: '2359',
//   },
// ];
// const rest_holiday_slot = {
//   restaurant_id: rest_id,
//   created_by: '',
//   open_after: moment().add(-10, 'minute').toDate(),
// };

// Next after one slot with holiday
// const time_slot = [
//   {
//     restaurant_id: rest_id,
//     slot_name: 'mon',
//     start_time: '2000',
//     end_time: '2100',
//   },
//   {
//     restaurant_id: rest_id,
//     slot_name: 'tue',
//     start_time: '2310',
//     end_time: '2359',
//   },
//   {
//     restaurant_id: rest_id,
//     slot_name: 'weekends',
//     start_time: '1000',
//     end_time: '1100',
//   },
// ];
// const rest_holiday_slot = {
//   restaurant_id: rest_id,
//   created_by: '',
//   open_after: moment('1-06 1210', 'DD-MM kkmm').toDate(),
// };

// Next after one slot with holiday
//   const time_slot = [
//     {
//       restaurant_id: rest_id,
//       slot_name: 'tue',
//       start_time: '2310',
//       end_time: '2359',
//     },
//     {
//       restaurant_id: rest_id,
//       slot_name: 'weekends',
//       start_time: '1000',
//       end_time: '1100',
//     },
//   ];
//   const rest_holiday_slot = null;

//   const restaurant = {
//     id: rest_id,
//     time_slot,
//   };

//   const res = getRestaurantSlots(restaurant, rest_holiday_slot);
//   logger.debug('\n\nis_open', res?.availability?.is_open);
//   logger.debug('is_holiday', res?.availability?.is_holiday);
//   if (res?.availability?.next_opens_at)
//     logger.debug(
//       'next_opens_at',
//       moment(res?.availability?.next_opens_at).format(' (ddd) DD-MM kkmm')
//     );
//   if (res?.availability?.closing_at)
//     logger.debug(
//       'closing_at',
//       moment(res?.availability?.closing_at).format(' (ddd) DD-MM kkmm')
//     );
// }
// test();

// export async function getRestaurantSlots(
//   restaurants: models.IRestaurant[]
// ): Promise<models.IRestaurant[]> {
//   const restaurant_ids = restaurants.map(rest => {
//     return rest.id;
//   });
//   const restaurant_slots = await models.getRestaurantSlots(restaurant_ids);
//   logger.debug('RESTAURANTS WITH SLOTS:', restaurant_slots);
//   const current_day = moment().format('ddd').toLowerCase();
//   const current_hour = moment().format('kkmm');
//   const included_restaurants: string[] = [];
//   const result: models.IRestaurant[] = [];
//   const epoch = new Date();
//   /*
// check if restaurant ids in requests matched with any restaurant that's coming from the slot table
// */
//   for (let k = 0; k < restaurant_ids.length; k++) {
//     for (let i = 0; i < restaurant_slots.length; i++) {
//       const restaurant_holiday = (
//         await models.returnHolidaySlots([restaurant_slots[i].restaurant_id])
//       )[0];

//       if (restaurant_holiday) {
//         if (restaurant_holiday.open_after < epoch) {
//           result.push({
//             id: restaurant_ids[k],
//             availability: {
//               is_open: false,
//               next_opens_at: epoch,
//             },
//           });
//           included_restaurants.push(restaurant_slots[i].restaurant_id);
//           continue;
//         }
//       }
//       if (current_day === restaurant_slots[i].slot_name) {
//         if (included_restaurants.includes(restaurant_ids[k])) {
//           continue;
//         }
//         if (restaurant_ids[k] === restaurant_slots[i].restaurant_id) {
//           // const startTime = moment(current_hour, 'kkmm');
//           logger.debug('START_HOUR', restaurant_slots[i].start_time);
//           logger.debug('CLOSE_HOUR', restaurant_slots[i].end_time);
//           logger.debug('CURRENT_HOUR', current_hour);
//           if (
//             parseInt(current_hour) >=
//               parseInt(restaurant_slots[i].start_time) &&
//             parseInt(current_hour) <= parseInt(restaurant_slots[i].end_time)
//           ) {
//             // const end = moment(restaurant_slots[i].end_time, 'kkmm');
//             // const duration = moment.duration(end.diff(startTime));
//             // const hours = duration.asHours();
//             // epoch = epoch + 60 * hours;

//             included_restaurants.push(restaurant_slots[i].restaurant_id);
//             result.push({
//               id: restaurant_ids[k],
//               availability: {
//                 is_open: true,
//                 closes_in: epoch,
//               },
//             });
//           } else {
//             // const end = moment(restaurant_slots[i].start_time, 'kkmm');
//             // const duration = moment.duration(end.diff(startTime));
//             // const hours = duration.asHours();
//             // epoch = epoch + 60 * hours;

//             result.push({
//               id: restaurant_ids[k],
//               availability: {
//                 is_open: false,
//                 next_opens_at: epoch,
//               },
//             });
//             included_restaurants.push(restaurant_slots[i].restaurant_id);
//           }
//         }
//       }
//     }
//   }
//   return result;
// }

export async function generateDownloadURLs(restaurants: models.IRestaurant[]) {
  for (let i = 0; i < restaurants.length; i++) {
    restaurants[i] = await generateDownloadURL(restaurants[i]);
  }
  return restaurants;
}

async function generateDownloadURL(restaurant: models.IRestaurant) {
  if (restaurant.image) {
    restaurant.image = await generateDownloadFileURL(restaurant.image);
  }
  if (restaurant.images) {
    for (let i = 0; i < restaurant.images.length; i++) {
      restaurant.images[i] = await generateDownloadFileURL(
        restaurant.images[i]
      );
    }
  }
  if (restaurant.packing_charge_item) {
    const items =
      restaurant.packing_charge_item as models.IPackingDetailsItem[];
    for (let i = 0; i < items.length; i++) {
      items[i].packing_image = await generateDownloadFileURL(
        items[i].packing_image
      );
    }
    restaurant.packing_charge_item = items;
  }

  if (restaurant.packing_charge_order) {
    const item = restaurant.packing_charge_order as models.IPackingDetailsOrder;
    item.packing_image = await generateDownloadFileURL(item.packing_image);
    restaurant.packing_charge_order = item;
  }

  if (restaurant.fssai_ack_document)
    restaurant.fssai_ack_document = await generateDownloadFileURL(
      restaurant.fssai_ack_document
    );
  if (restaurant.fssai_cert_document)
    restaurant.fssai_cert_document = await generateDownloadFileURL(
      restaurant.fssai_cert_document
    );
  if (restaurant.pan_document)
    restaurant.pan_document = await generateDownloadFileURL(
      restaurant.pan_document
    );
  if (restaurant.gstin_document)
    restaurant.gstin_document = await generateDownloadFileURL(
      restaurant.gstin_document
    );
  if (restaurant.bank_document)
    restaurant.bank_document = await generateDownloadFileURL(
      restaurant.bank_document
    );
  if (restaurant.kyc_document)
    restaurant.kyc_document = await generateDownloadFileURL(
      restaurant.kyc_document
    );
  if (restaurant && restaurant.menu_documents) {
    for (let i = 0; i < restaurant.menu_documents.length; i++) {
      restaurant.menu_documents[i] = await generateDownloadFileURL(
        restaurant.menu_documents[i]
      );
    }
  }
  return restaurant;
}

async function updateFiles(
  newRestaurant: models.IRestaurant,
  oldRestaurant: models.IRestaurant
) {
  if (
    newRestaurant.packing_charge_type === 'item' &&
    newRestaurant.packing_charge_item
  ) {
    for (let i = 0; i < newRestaurant.packing_charge_item.length; i++) {
      const fo = newRestaurant.packing_charge_item[i];
      const old = oldRestaurant.packing_charge_item?.filter(item => {
        return item.packing_image?.name === fo.packing_image?.name;
      })[0];
      if (fo.packing_image) {
        fo.packing_image.path = 'restaurant/packing_charge_item_image/';
        fo.packing_image = await saveS3File(
          false,
          fo.packing_image,
          old?.packing_image
        );
      }
      newRestaurant.packing_charge_item[i] = fo;
    }
  }
  if (
    newRestaurant.packing_charge_type === 'order' &&
    newRestaurant.packing_charge_order
  ) {
    if (newRestaurant.packing_charge_order.packing_image) {
      newRestaurant.packing_charge_order.packing_image.path =
        'restaurant/packing_charge_order_image/';
      newRestaurant.packing_charge_order.packing_image = await saveS3File(
        false,
        newRestaurant.packing_charge_order.packing_image,
        oldRestaurant?.packing_charge_order?.packing_image
      );
    }
  }
  if (newRestaurant.fssai_ack_document) {
    if (
      newRestaurant.fssai_ack_document &&
      newRestaurant.fssai_ack_document.name
    ) {
      newRestaurant.fssai_ack_document_type = generateDocumentType(
        newRestaurant.fssai_ack_document.name
      );
    }
    newRestaurant.fssai_ack_document.path = 'restaurant/fssai_ack_document/';
    newRestaurant.fssai_ack_document = await saveS3File(
      false,
      newRestaurant.fssai_ack_document,
      oldRestaurant?.fssai_ack_document
    );
  }
  if (newRestaurant.fssai_cert_document) {
    if (
      newRestaurant.fssai_cert_document &&
      newRestaurant.fssai_cert_document.name
    ) {
      newRestaurant.fssai_cert_document_type = generateDocumentType(
        newRestaurant.fssai_cert_document.name
      );
    }
    newRestaurant.fssai_cert_document.path = 'restaurant/fssai_cert_document/';
    newRestaurant.fssai_cert_document = await saveS3File(
      false,
      newRestaurant.fssai_cert_document,
      oldRestaurant?.fssai_cert_document
    );
  }
  if (newRestaurant.pan_document) {
    if (newRestaurant.pan_document && newRestaurant.pan_document.name) {
      newRestaurant.pan_document_type = generateDocumentType(
        newRestaurant.pan_document.name
      );
    }
    newRestaurant.pan_document.path = 'restaurant/pan_document/';
    newRestaurant.pan_document = await saveS3File(
      false,
      newRestaurant.pan_document,
      oldRestaurant?.pan_document
    );
  }
  if (newRestaurant.gstin_document) {
    if (newRestaurant.gstin_document && newRestaurant.gstin_document.name) {
      newRestaurant.gstin_document_type = generateDocumentType(
        newRestaurant.gstin_document.name
      );
    }
    newRestaurant.gstin_document.path = 'restaurant/gstin_document/';
    newRestaurant.gstin_document = await saveS3File(
      false,
      newRestaurant.gstin_document,
      oldRestaurant?.gstin_document
    );
  }
  if (newRestaurant.bank_document) {
    if (newRestaurant.bank_document && newRestaurant.bank_document.name) {
      newRestaurant.bank_document_type = generateDocumentType(
        newRestaurant.bank_document.name
      );
    }
    newRestaurant.bank_document.path = 'restaurant/bank_document/';
    newRestaurant.bank_document = await saveS3File(
      false,
      newRestaurant.bank_document,
      oldRestaurant?.bank_document
    );
  }
  if (newRestaurant.kyc_document) {
    if (newRestaurant.kyc_document && newRestaurant.kyc_document.name) {
      newRestaurant.kyc_document_type = generateDocumentType(
        newRestaurant.kyc_document.name
      );
    }
    newRestaurant.kyc_document.path = 'restaurant/kyc_document/';
    newRestaurant.kyc_document = await saveS3File(
      false,
      newRestaurant.kyc_document,
      oldRestaurant?.kyc_document
    );
  }
  if (newRestaurant.image) {
    if (newRestaurant.image && newRestaurant.image.name) {
      validateImageType(newRestaurant.image.name);
    }
    newRestaurant.image.path = 'restaurant/images/';
    newRestaurant.image = await saveS3File(
      true,
      newRestaurant.image,
      oldRestaurant?.image
    );
  }
  if (newRestaurant.images) {
    if (newRestaurant.images && newRestaurant.images.length) {
      for (let i = 0; i < newRestaurant.images.length; i++) {
        if (
          !isEmpty(newRestaurant.images[i]) &&
          !isEmpty(newRestaurant.images[i].name)
        ) {
          validateImageType(newRestaurant.images[i].name!);
        }
      }
    }
    newRestaurant.images.forEach(image => (image.path = 'restaurant/images/'));
    newRestaurant.images = await saveS3Files(
      true,
      newRestaurant.images,
      oldRestaurant?.images
    );
  }
  if (newRestaurant.menu_documents) {
    if (newRestaurant.menu_documents && newRestaurant.menu_documents.length) {
      for (let i = 0; i < newRestaurant.menu_documents.length; i++) {
        if (
          !isEmpty(newRestaurant.menu_documents[i]) &&
          !isEmpty(newRestaurant.menu_documents[i].name)
        ) {
          newRestaurant.menu_document_type = generateDocumentType(
            newRestaurant.menu_documents[i].name!
          );
        }
      }
    }
    newRestaurant.menu_documents = newRestaurant.menu_documents.map(item => {
      item.path = 'restaurant/menu_document/';
      return item;
    });
    newRestaurant.menu_documents = await saveS3Files(
      false,
      newRestaurant.menu_documents,
      oldRestaurant?.menu_documents
    );
  }
  return newRestaurant;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function remove_undefined(obj: any) {
  for (const [key] of Object.entries(obj)) {
    if (obj[key] === undefined || obj[key] === null) delete obj[key];
  }
  return obj;
}
async function validateApproval(restaurant: models.IRestaurant) {
  logger.debug('Validating Data for Submitting');

  restaurant = remove_undefined(restaurant) as models.IRestaurant;
  delete restaurant.partner_id;
  delete restaurant.created_at;
  delete restaurant.updated_at;
  delete restaurant.is_deleted;
  delete restaurant.draft_section;
  delete restaurant.approved_by;
  delete restaurant.status_comments;
  delete restaurant.city;
  delete restaurant.area_name;
  delete restaurant.hold_payout;
  delete restaurant.default_preparation_time;
  delete restaurant.preferred_language_ids;
  delete restaurant.like_count;
  delete restaurant.dislike_count;
  delete restaurant.delivery_charge_paid_by;
  delete restaurant.discount_rate;
  delete restaurant.discount_updated_at;
  delete restaurant.discount_updated_user_id;
  delete restaurant.discount_updated_user_type;

  const validateSubmitRequest =
    models.verify_submit_restaurant.validate(restaurant);
  if (validateSubmitRequest.error)
    throw new ResponseError(
      400,
      validateSubmitRequest.error.details[0].message
    );

  if (!restaurant.lat) {
    throw new ResponseError(400, 'Draft Not Complete ');
  }
  if (!restaurant.long) {
    throw new ResponseError(400, 'Draft Not Complete');
  }
  if (!restaurant.owner_is_manager && restaurant.user_profile === 'manager') {
    if (!restaurant.owner_name) {
      throw new ResponseError(400, '"owner_name" is required ');
    }
    if (!restaurant.owner_contact_number) {
      throw new ResponseError(400, '"owner_contact_number" is required ');
    }
    if (!restaurant.owner_contact_number_verified) {
      throw new ResponseError(
        400,
        '"owner_contact_number_verified" is required '
      );
    }
    if (!restaurant.owner_email) {
      throw new ResponseError(400, '"owner_email" is required ');
    }
    if (!restaurant.owner_email_verified) {
      throw new ResponseError(400, '"owner_email_verified" is required ');
    }
  }
  if (!restaurant.owner_is_manager && restaurant.user_profile === 'owner') {
    if (!restaurant.manager_name) {
      throw new ResponseError(400, '"manager_name" is required ');
    }
    if (!restaurant.manager_contact_number) {
      throw new ResponseError(400, '"manager_contact_number" is required ');
    }
    if (!restaurant.manager_email) {
      throw new ResponseError(400, '"manager_email" is required ');
    }
  }
  if (
    restaurant.lat &&
    restaurant.long &&
    restaurant.area_id &&
    restaurant.city_id
  ) {
    const serviceable = await isLatAndLongServiceableInCityArea(
      restaurant.city_id,
      restaurant.area_id,
      +restaurant.lat,
      +restaurant.long
    );
    if (!serviceable) {
      throw new ResponseError(400, 'Location not serviceable.');
    }
  } else {
    throw new ResponseError(400, 'Unable to check serviceablity');
  }
}

export async function sendOtpDocumentSignature(req: Request, res: Response) {
  try {
    const restaurant = req.data.restaurant as models.IRestaurant;
    req.body.id = restaurant.id;

    const validation = models.verify_sendOtp.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = validation.value as ISMS_OTP;
    await sendOtp(
      `${req.body.id}-documentSignature`,
      validated_req,
      true,
      false
    );
    if (validated_req.phone !== restaurant.document_sign_number) {
      const saveData = {
        id: restaurant.id,
        document_sign_number: validated_req.phone,
        document_sign_number_verified: false,
      };
      const trx = await getTransaction();
      try {
        await models.updateRestaurantOnboarding(trx, saveData);
        await trx.commit();
      } catch (error) {
        await trx.rollback();
        logger.error('Failed Saving', error);
        throw 'Failed Saving';
      }
    }
    logger.debug('OTP sent');
    return sendSuccess(res, 200, {msg: 'OTP sent'});
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function verifyOtpDocumentSignature(req: Request, res: Response) {
  try {
    const restaurant = req.data.restaurant as models.IRestaurant;
    req.body.id = restaurant.id;

    const validation = models.verify_velidateOtp.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = validation.value;
    const cacheValue = await verifyOtp(
      `${req.body.id}-documentSignature`,
      validated_req.phone,
      validated_req.otp
    );
    if (!cacheValue) {
      return (
        sendError(res, 400, 'Invalid OTP'),
        logger.error('Otp Validation failed')
      );
    }
    const saveData = {
      id: validated_req.id,
      document_sign_number: validated_req.phone,
      document_sign_number_verified: true,
    };

    const trx = await getTransaction();
    try {
      await models.updateRestaurantOnboarding(trx, saveData);
      await trx.commit();
    } catch (error) {
      await trx.rollback();
      logger.error('Failed Saving', error);
      throw 'Failed Saving';
    }
    return sendSuccess(res, 200, {
      msg: 'otp validated',
    });
  } catch (error) {
    logger.error('No Data found. Please register');
    return handleErrors(res, error);
  }
}

export async function sendOtpOwnerContact(req: Request, res: Response) {
  try {
    const restaurant = req.data.restaurant as models.IRestaurant;
    req.body.id = restaurant.id;

    const validation = models.verify_sendOtp.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = validation.value as ISMS_OTP;
    await sendOtp(`${req.body.id}-ownerContact`, validated_req, true, false);
    if (validated_req.phone !== restaurant.owner_contact_number) {
      const saveData = {
        id: restaurant.id,
        owner_contact_number: validated_req.phone,
        owner_contact_number_verified: false,
      };
      const trx = await getTransaction();
      try {
        await models.updateRestaurantOnboarding(trx, saveData);
        await trx.commit();
      } catch (error) {
        await trx.rollback();
        logger.error('Failed Saving', error);
        throw 'Failed Saving';
      }
    }
    logger.debug('OTP sent');
    return sendSuccess(res, 200, {msg: 'OTP sent'});
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function verifyOtpOwnerContact(req: Request, res: Response) {
  try {
    const restaurant = req.data.restaurant as models.IRestaurant;
    req.body.id = restaurant.id;

    const validation = models.verify_velidateOtp.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = validation.value;
    const cacheValue = await verifyOtp(
      `${req.body.id}-ownerContact`,
      validated_req.phone,
      validated_req.otp
    );
    if (!cacheValue) {
      return (
        sendError(res, 400, 'Invalid OTP'),
        logger.error('Otp Validation failed')
      );
    }
    const saveData: models.IRestaurant = {
      id: validated_req.id,
      owner_contact_number: validated_req.phone,
      owner_contact_number_verified: true,
    };

    const trx = await getTransaction();
    try {
      await models.updateRestaurantOnboarding(trx, saveData);
      await trx.commit();
    } catch (error) {
      await trx.rollback();
      logger.error('Failed Saving', error);
      throw 'Failed Saving';
    }
    return sendSuccess(res, 200, {
      msg: 'otp validated',
    });
  } catch (error) {
    logger.error('No Data found. Please register');
    return handleErrors(res, error);
  }
}

export async function sendOtpOwnerEmail(req: Request, res: Response) {
  try {
    const restaurant = req.data.restaurant as models.IRestaurant;
    req.body.id = restaurant.id;

    const validation = models.verify_sendOtp_email.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = validation.value as ISMS_OTP;
    await sendOtp(`${req.body.id}-ownerEmail`, validated_req, false, true);
    if (validated_req.email !== restaurant.owner_email) {
      const saveData = {
        id: restaurant.id,
        owner_email: validated_req.email,
        owner_email_verified: false,
      };
      const trx = await getTransaction();
      try {
        await models.updateRestaurantOnboarding(trx, saveData);
        await trx.commit();
      } catch (error) {
        await trx.rollback();
        logger.error('Failed Saving', error);
        throw 'Failed Saving';
      }
    }
    logger.debug('OTP sent');
    return sendSuccess(res, 200, {msg: 'OTP sent'});
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function verifyOtpOwnerEmail(req: Request, res: Response) {
  try {
    const restaurant = req.data.restaurant as models.IRestaurant;
    req.body.id = restaurant.id;

    const validation = models.verify_velidateOtp_email.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = validation.value;
    const cacheValue = await verifyOtp(
      `${req.body.id}-ownerEmail`,
      validated_req.email,
      validated_req.otp
    );
    if (!cacheValue) {
      return (
        sendError(res, 400, 'Invalid OTP'),
        logger.error('Otp Validation failed')
      );
    }
    const saveData: models.IRestaurant = {
      id: validated_req.id,
      owner_email: validated_req.email,
      owner_email_verified: true,
    };

    const trx = await getTransaction();
    try {
      await models.updateRestaurantOnboarding(trx, saveData);
      await trx.commit();
    } catch (error) {
      await trx.rollback();
      logger.error('Failed Saving', error);
      throw 'Failed Saving';
    }
    return sendSuccess(res, 200, {
      msg: 'otp validated',
    });
  } catch (error) {
    logger.error('No Data found. Please register');
    return handleErrors(res, error);
  }
}

export async function verifyPostalCode(req: Request, res: Response) {
  try {
    const restaurant = req.data.restaurant as models.IRestaurant;
    req.body.id = restaurant.id;

    if (
      !(
        restaurant.status === constants.StatusNames.draft ||
        restaurant.status === constants.StatusNames.approvalRejected
      )
    ) {
      return sendError(
        res,
        400,
        'Restaurant Cannot be updated "not in draft/rejected state"'
      );
    }
    // const validation = models.verify_velidateOtp.validate(req.body);
    // if (validation.error)
    //   return sendError(res, 400, validation.error.details[0].message);
    const validated_req = req.body;

    const saveData = {
      id: validated_req.id,
      postal_code: validated_req.postal_code,
      postal_code_verified: true,
    };
    // if key postal_code is not provided then throw an error
    if (!validated_req.postal_code) {
      return sendError(res, 400, 'postal code code is required');
    }

    const trx = await getTransaction();
    try {
      const verify_result = await verify.verifyPostalCode(
        validated_req.postal_code
      );
      if (!verify_result.valid) {
        saveData.postal_code_verified = false;
        await models.updateRestaurantOnboarding(trx, saveData);
        await trx.commit();
        return sendError(
          res,
          400,
          `verification Failed (${validated_req.postal_code} ${verify_result.reason}`
        );
      }

      await models.updateRestaurantOnboarding(trx, saveData);
      await trx.commit();
      return sendSuccess(res, 200, {
        msg: 'verified',
      });
    } catch (error) {
      await trx.rollback();
      logger.error('Failed Saving', error);
      throw 'Failed Saving';
    }
  } catch (error) {
    logger.error('No Data found. Please register');
    return handleErrors(res, error);
  }
}

export async function verifyFssaiCertificate(req: Request, res: Response) {
  try {
    const restaurant = req.data.restaurant as models.IRestaurant;
    req.body.id = restaurant.id;

    if (
      !(
        restaurant.status === constants.StatusNames.draft ||
        restaurant.status === constants.StatusNames.approvalRejected
      )
    ) {
      return sendError(
        res,
        400,
        'Restaurant Cannot be updated "not in draft/rejected state"'
      );
    }
    // const validation = models.verify_velidateOtp.validate(req.body);
    // if (validation.error)
    //   return sendError(res, 400, validation.error.details[0].message);
    const validated_req = req.body;

    const saveData = {
      id: validated_req.id,
      fssai_cert_number: validated_req.fssai_cert_number,
      fssai_cert_verified: true,
    };

    // if key fssai_cert_number is not provided then throw an error
    if (!validated_req.fssai_cert_number) {
      return sendError(res, 400, 'fssai cert number is required');
    }

    const trx = await getTransaction();
    try {
      const verify_result = await verify.verifyFssai(
        validated_req.fssai_cert_number
      );
      if (!verify_result.valid) {
        saveData.fssai_cert_verified = false;
        await models.updateRestaurantFSSAI(trx, saveData);
        await trx.commit();
        return sendError(
          res,
          400,
          `verification Failed (${validated_req.fssai_cert_number} ${verify_result.reason})`
        );
      }

      await models.updateRestaurantFSSAI(trx, saveData);
      await trx.commit();
      return sendSuccess(res, 200, {
        msg: 'verified',
      });
    } catch (error) {
      await trx.rollback();
      logger.error('Failed Saving', error);
      throw 'Failed Saving';
    }
  } catch (error) {
    logger.error('No Data found. Please register');
    return handleErrors(res, error);
  }
}

export async function verifyPanNumber(req: Request, res: Response) {
  try {
    const restaurant = req.data.restaurant as models.IRestaurant;
    req.body.id = restaurant.id;

    if (
      !(
        restaurant.status === constants.StatusNames.draft ||
        restaurant.status === constants.StatusNames.approvalRejected
      )
    ) {
      return sendError(
        res,
        400,
        'Restaurant Cannot be updated "not in draft/rejected state"'
      );
    }
    // const validation = models.verify_velidateOtp.validate(req.body);
    // if (validation.error)
    //   return sendError(res, 400, validation.error.details[0].message);
    const validated_req = req.body;

    const saveData = {
      id: validated_req.id,
      pan_number: validated_req.pan_number,
      pan_number_verified: true,
    };
    // if key pan_number is not provided then throw an error
    if (!validated_req.pan_number) {
      return sendError(res, 400, 'pan number code is required');
    }

    const trx = await getTransaction();
    try {
      const verify_result = await verify.verifyPanNumber(
        validated_req.pan_number
      );
      if (!verify_result.valid) {
        saveData.pan_number_verified = false;
        await models.updateRestaurantGstBank(trx, saveData);
        await trx.commit();
        return sendError(
          res,
          400,
          `verification Failed (${validated_req.pan_number} ${verify_result.reason})`
        );
      }

      await models.updateRestaurantGstBank(trx, saveData);
      await trx.commit();
      return sendSuccess(res, 200, {
        msg: 'verified',
      });
    } catch (error) {
      await trx.rollback();
      logger.error('Failed Saving', error);
      throw 'Failed Saving';
    }
  } catch (error) {
    logger.error('No Data found. Please register');
    return handleErrors(res, error);
  }
}

export async function verifyGstinNumber(req: Request, res: Response) {
  try {
    const restaurant = req.data.restaurant as models.IRestaurant;
    req.body.id = restaurant.id;

    if (
      !(
        restaurant.status === constants.StatusNames.draft ||
        restaurant.status === constants.StatusNames.approvalRejected
      )
    ) {
      return sendError(
        res,
        400,
        'Restaurant Cannot be updated "not in draft/rejected state"'
      );
    }
    // const validation = models.verify_velidateOtp.validate(req.body);
    // if (validation.error)
    //   return sendError(res, 400, validation.error.details[0].message);
    const validated_req = req.body;

    const saveData = {
      id: validated_req.id,
      gstin_number: validated_req.gstin_number,
      gstin_number_verified: true,
    };

    // if key gstin_number is not provided then throw an error
    if (!validated_req.gstin_number) {
      return sendError(res, 400, 'gstin number is required');
    }

    const trx = await getTransaction();
    try {
      const verify_result = await verify.verifyGstinNumber(
        validated_req.gstin_number
      );
      if (!verify_result.valid) {
        saveData.gstin_number_verified = false;
        await models.updateRestaurantGstBank(trx, saveData);
        await trx.commit();
        return sendError(
          res,
          400,
          `verification Failed (${validated_req.gstin_number} ${verify_result.reason})`
        );
      }

      await models.updateRestaurantGstBank(trx, saveData);
      await trx.commit();
      return sendSuccess(res, 200, {
        msg: 'verified',
      });
    } catch (error) {
      await trx.rollback();
      logger.error('Failed Saving', error);
      throw 'Failed Saving';
    }
  } catch (error) {
    logger.error('No Data found. Please register');
    return handleErrors(res, error);
  }
}

export async function verifyIfscCode(req: Request, res: Response) {
  try {
    const restaurant = req.data.restaurant as models.IRestaurant;
    req.body.id = restaurant.id;

    if (
      !(
        restaurant.status === constants.StatusNames.draft ||
        restaurant.status === constants.StatusNames.approvalRejected
      )
    ) {
      return sendError(
        res,
        400,
        'Restaurant Cannot be updated "not in draft/rejected state"'
      );
    }
    // const validation = models.verify_velidateOtp.validate(req.body);
    // if (validation.error)
    //   return sendError(res, 400, validation.error.details[0].message);
    const validated_req = req.body;

    const saveData = {
      id: validated_req.id,
      ifsc_code: validated_req.ifsc_code,
      ifsc_verified: true,
    };

    // if in request key ifsc_code is not present then throw error.
    if (!validated_req.ifsc_code) {
      return sendError(res, 400, 'ifsc code is required');
    }

    const trx = await getTransaction();
    try {
      const verify_result = await verify.verifyIfscCode(
        validated_req.ifsc_code
      );
      if (!verify_result.valid) {
        saveData.ifsc_verified = false;
        await models.updateRestaurantGstBank(trx, saveData);
        await trx.commit();
        return sendError(
          res,
          400,
          `verification Failed for ${validated_req.ifsc_code} ${verify_result.reason}`
        );
      }

      await models.updateRestaurantGstBank(trx, saveData);
      await trx.commit();
      return sendSuccess(res, 200, {
        msg: 'verified',
      });
    } catch (error) {
      await trx.rollback();
      logger.error('Failed Saving', error);
      throw 'Failed Saving';
    }
  } catch (error) {
    logger.error('No Data found. Please register');
    return handleErrors(res, error);
  }
}

export async function readAllRestaurants(req: Request, res: Response) {
  try {
    const restaurants = await models.readAllRestaurants(
      req.body.status,
      req.body.city_id
    );
    return sendSuccess(res, 200, await generateDownloadURLs(restaurants));
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function readAllFilterRestaurants(req: Request, res: Response) {
  try {
    const validation = models.verify_filter_restaurant.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);

    const validated_req = validation.value;

    const {restaurants, total_pages, total_records} =
      await models.filterRestaurantsAsAdmin(
        validated_req.search_text,
        validated_req.filter,
        validated_req.pagination,
        validated_req.sort
      );

    validated_req.authorizationToken = req.headers.authorization;

    const admin_ids: string[] = [];
    const token = validated_req.authorizationToken;

    restaurants.forEach((restaurant: models.IRestaurant) => {
      if (restaurant.approved_by) {
        admin_ids.push(restaurant.approved_by);
      }
      if (restaurant.catalog_approved_by) {
        admin_ids.push(restaurant.catalog_approved_by);
      }
      if (restaurant.speedyy_account_manager_id) {
        admin_ids.push(restaurant.speedyy_account_manager_id);
      }
    });

    const admins = await getAdminDetailsByIds(
      token,
      Array.from(new Set(admin_ids))
    );
    for (let j = 0; j < restaurants.length; j++) {
      for (let i = 0; i < admins.length; i++) {
        if (restaurants[j].approved_by === admins[i].id) {
          restaurants[j].approved_by_name = admins[i].full_name;
        }
        if (restaurants[j].catalog_approved_by === admins[i].id) {
          restaurants[j].catalog_approved_by_name = admins[i].full_name;
        }
        if (restaurants[j].speedyy_account_manager_id === admins[i].id) {
          restaurants[j].speedyy_account_manager_name = admins[i].full_name;
        }
      }
    }

    await generateDownloadURLs(restaurants);

    await setRestaurantAvailability(restaurants);

    return sendSuccess(res, 200, {
      total_records: total_records,
      total_pages: total_pages,
      restaurants: restaurants,
    });
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function readRestaurantById(req: Request, res: Response) {
  try {
    const restaurant = req.data.restaurant as models.IRestaurant;
    const rest = await generateDownloadURL(restaurant);
    const slots = await models.getRestaurantSlots([rest.id]);
    rest.time_slot = slots;
    return sendSuccess(res, 200, rest);
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function readRestaurantByPartnerId(req: Request, res: Response) {
  try {
    const user = req.user;

    logger.debug('', user);
    const restaurants = await models.readRestaurantByPartnerId(user.id);
    return sendSuccess(res, 200, await generateDownloadURLs(restaurants));
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function readRestaurantByVendorId(req: Request, res: Response) {
  try {
    const user = req.user;

    logger.debug('', user);
    const restaurant = await models.readRestaurantById(user.data.restaurant_id);
    if (!restaurant) {
      return sendError(res, 404, 'Restaurant not found');
    }
    restaurant.like_count_label = humanizeNumber(restaurant.like_count);

    await setRestaurantAvailability([restaurant]);
    return sendSuccess(res, 200, await generateDownloadURLs([restaurant]));
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function updateRestaurantAsAdmin(req: Request, res: Response) {
  try {
    const validation = verify_update_restaurant_as_admin.validate({
      id: req.params.id,
      ...req.body,
    });
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);

    if (validation.value.free_delivery !== undefined) {
      if (validation.value.free_delivery === true) {
        validation.value.delivery_charge_paid_by = 'restaurant';
      }
      if (validation.value.free_delivery === false) {
        validation.value.delivery_charge_paid_by = 'customer';
      }
      delete validation.value.free_delivery;
    }
    const validated_req = validation.value as IUpdateRestaurantAsAdmin;

    const restaurant = await models.readRestaurantById(validated_req.id);
    if (!restaurant) {
      return sendError(res, 404, 'Restaurant not found');
    }

    if (
      validated_req.lat ||
      validated_req.long ||
      validated_req.area_id ||
      validated_req.city_id
    ) {
      validated_req.city_id = validated_req.city_id || restaurant.city_id;
      validated_req.area_id = validated_req.area_id || restaurant.area_id;
      validated_req.lat = validated_req.lat || restaurant.lat;
      validated_req.long = validated_req.long || restaurant.long;
      if (
        validated_req.lat &&
        validated_req.long &&
        validated_req.area_id &&
        validated_req.city_id
      ) {
        const serviceable = await isLatAndLongServiceableInCityArea(
          validated_req.city_id,
          validated_req.area_id,
          validated_req.lat,
          validated_req.long
        );
        if (!serviceable) {
          return sendError(res, 400, 'Restaurant Location not serviceable.');
        }
      }
    }

    if (validated_req.postal_code) {
      const verify_result = await verify.verifyPostalCode(
        validated_req.postal_code
      );
      if (!verify_result.valid) {
        return sendError(res, 400, 'Invalid postal code');
      }
    }

    if (validated_req.speedyy_account_manager_id) {
      const admin = await getAdminDetailsById(
        validated_req.speedyy_account_manager_id
      );
      if (!admin) {
        return sendError(res, 400, 'Invalid speedyy account manager Id');
      }
    }

    let updated_restaurant: models.IRestaurant;
    const trx = await getTransaction();
    try {
      updated_restaurant = await updateFiles(validated_req, restaurant);
      updated_restaurant = await models.updateRestaurant(
        trx,
        updated_restaurant
      );
      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }
    updated_restaurant = await generateDownloadURL(updated_restaurant);
    await putRestaurantElasticSearchDocument(updated_restaurant);
    return sendSuccess(res, 200, updated_restaurant);
  } catch (error) {
    return handleErrors(res, error, 'ERROR WHILE UPDATING RESTAURANT AS ADMIN');
  }
}

export async function updateRestaurant(req: Request, res: Response) {
  try {
    const user = req.user;
    req.body.id = user.data.restaurant_id;
    const validation = models.verify_updateRestaurant.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    if (validation.value.free_delivery !== undefined) {
      if (validation.value.free_delivery === true) {
        validation.value.delivery_charge_paid_by = 'restaurant';
      }
      if (validation.value.free_delivery === false) {
        validation.value.delivery_charge_paid_by = 'customer';
      }
      delete validation.value.free_delivery;
    }
    const validated_req = validation.value as models.IRestaurant_Basic;

    const restaurant = await models.readRestaurantById(user.data.restaurant_id);
    if (!restaurant) {
      return sendError(res, 404, 'Restaurant not found');
    }
    const restaurantInput = await updateFiles(validated_req, restaurant);
    const trx = await getTransaction();
    let updatedRestaurant: models.IRestaurant;
    try {
      updatedRestaurant = await models.updateRestaurantBasic(
        trx,
        restaurantInput
      );
      await trx.commit();
    } catch (error) {
      await trx.rollback();
      logger.error('Failed Saving', error);
      throw 'Failed Saving';
    }
    const updates = await generateDownloadURL(updatedRestaurant);
    return sendSuccess(res, 200, updates);
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function filterRestaurants(req: Request, res: Response) {
  try {
    logger.debug('Filtering restaurants');

    const validation = models.filterRestaurant.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = validation.value as IFilterRestaurants;

    if (!validated_req.filter) {
      validated_req.filter = {
        sort_by: RestaurantSortBy.DISTANCE,
        sort_direction: SortOrder.ASCENDING,
      };
    } else if (!validated_req.filter.sort_by) {
      validated_req.filter.sort_by = RestaurantSortBy.DISTANCE;
      validated_req.filter.sort_direction = SortOrder.ASCENDING;
    }

    //Elastic search
    const elastic_serviceable_restaurants =
      await getElasticSearchServiceableRestaurant(
        validated_req.coordinates.lat,
        validated_req.coordinates.long,
        await Globals.SERVICEABILITY_RADIUS_IN_METRES.get()
      );

    if (
      !elastic_serviceable_restaurants ||
      elastic_serviceable_restaurants.length === 0
    ) {
      return sendSuccess(res, 200, {
        total_pages: 0,
        restaurants: [],
      });
    }
    logger.debug(
      'elastic serviceable restaurants',
      elastic_serviceable_restaurants
    );

    const es_restaurant_ids: string[] = [];
    const get_delivery_details: IRestaurantGetDeliveryDetails[] = [];

    elastic_serviceable_restaurants.forEach(er => {
      es_restaurant_ids.push(er.id);
      get_delivery_details.push({
        id: er.id,
        default_preparation_time: er.default_preparation_time || 15,
        coordinates: {
          latitude: er.coordinates.lat!,
          longitude: er.coordinates.lon!,
        },
      });
    });

    const restaurants_delivery =
      await calculateRestaurantsTravelTimeAndDistance(get_delivery_details, {
        latitude: validated_req.coordinates.lat,
        longitude: validated_req.coordinates.long,
      });
    logger.debug(
      'restaurants updated with distance and time',
      restaurants_delivery
    );

    //Restaurant Slot
    const restaurants_availability_delivery = await setRestaurantAvailability(
      restaurants_delivery
    );

    if (
      validated_req.filter &&
      validated_req.filter.sort_by === RestaurantSortBy.DELIVERY_TIME
    ) {
      restaurants_availability_delivery.sort(
        (restaurant_a, restaurant_b) =>
          restaurant_a.delivery_time_in_seconds! -
          restaurant_b.delivery_time_in_seconds!
      );
    }
    if (
      validated_req.filter &&
      validated_req.filter.sort_by === RestaurantSortBy.DISTANCE
    ) {
      restaurants_availability_delivery.sort(
        (restaurant_a, restaurant_b) =>
          restaurant_a.delivery_distance_in_meters! -
          restaurant_b.delivery_distance_in_meters!
      );
    }

    const open_restaurant_ids: string[] = [];
    const closed_restaurant_ids: string[] = [];

    restaurants_availability_delivery.forEach(r => {
      if (r.availability?.is_open) {
        open_restaurant_ids.push(r.id);
      } else {
        closed_restaurant_ids.push(r.id);
      }
    });

    //Restaurant Table
    const {total_pages, restaurants} = await models.filterRestaurants(
      open_restaurant_ids,
      closed_restaurant_ids,
      validated_req.filter,
      validated_req.pagination
    );
    if (restaurants.length === 0) {
      return sendSuccess(res, 200, {
        total_pages: 0,
        restaurants: [],
      });
    }

    //Download Url
    await generateDownloadURLs(restaurants);

    //Update Dynamic values
    restaurants.forEach(r => {
      const result = restaurants_availability_delivery.find(
        rad => rad.id === r.id
      );
      if (result) {
        r.availability = result.availability;
        r.delivery_time_in_seconds = result.delivery_time_in_seconds;
        r.delivery_time_string = result.delivery_time_string;
        r.delivery_distance_in_meters = result.delivery_distance_in_meters;
        r.delivery_distance_string = result.delivery_distance_string;
      }
      r.like_count_label = humanizeNumber(r.like_count);
    });

    logger.info('Filtered restaurants', restaurants);

    return sendSuccess(res, 200, {
      total_pages,
      restaurants,
    });
  } catch (error) {
    return handleErrors(res, error);
  }
}
/**
 * Check if new address selected from cart page is serviceable with selected restaurant or not
 */
export async function checkCartRestaurantServiceability(
  req: Request,
  res: Response
) {
  try {
    const validation = models.verify_cart_restaurant_serviceable.validate({
      restaurant_id: req.body.restaurant_id,
      customer_coordinates: req.body.customer_coordinates,
    });
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = validation.value as {
      restaurant_id: string;
      customer_coordinates: ICustomerAddress;
    };
    const validatedRestaurant: IRestaurantValidationResponse =
      await validateRestaurant(validated_req.restaurant_id);

    if (validatedRestaurant.restaurant_validation_errors) {
      return sendError(
        res,
        400,
        validatedRestaurant.restaurant_validation_errors
      );
    }

    if (
      !validatedRestaurant.restaurant.lat ||
      !validatedRestaurant.restaurant.long
    ) {
      logger.error(
        `lat and log not found for restaurant_id:${validatedRestaurant.restaurant.id}`
      );
      return sendError(res, 400, 'invalid restaurant address');
    }

    const internal_serviceability_checked_addresses =
      await internalServiceabilityCheck(
        {
          latitude: validatedRestaurant.restaurant.lat,
          longitude: validatedRestaurant.restaurant.long,
        },
        [validated_req.customer_coordinates]
      );

    if (!internal_serviceability_checked_addresses[0].deliverable) {
      return sendSuccess(res, 200, {
        address_serviceable: false,
        message: 'Delivery location is too far from restaurant location',
      });
    }

    const deliverability_checked_addresses: ICusomerDeliverableAddress[] =
      await addressDeliverabilityCheck(
        validatedRestaurant.restaurant.lat,
        validatedRestaurant.restaurant.long,
        [validated_req.customer_coordinates],
        '0'
      );

    if (!deliverability_checked_addresses[0].delivery_details.deliverable) {
      return sendSuccess(res, 200, {
        address_serviceable: false,
        message: deliverability_checked_addresses[0].delivery_details.reason,
      });
    }

    return sendSuccess(res, 200, {address_serviceable: true});
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function createRestaurant(req: Request, res: Response) {
  try {
    const validation = models.verify_create_restaurant.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = validation.value;
    const user = req.user;

    const restaurant = await models.createRestaurant(validated_req, user.id);
    return sendSuccess(res, 201, {id: restaurant.id});
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function updateRestaurantDraft(req: Request, res: Response) {
  try {
    logger.debug('restaurant Update Draft >> req-body', req.body);
    const restaurant = req.data.restaurant as models.IRestaurant;
    req.body.id = restaurant.id;
    const validation = models.verify_update_restaurant.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);

    const validated_req = validation.value;
    if (
      (validated_req.scheduling_type && !validated_req.slot_schedule) ||
      (!validated_req.scheduling_type && validated_req.slot_schedule)
    ) {
      return sendError(res, 400, [
        {
          message:
            'scheduling_type and slot_schedule are both required fields while creating restaurant slots',
          code: 0,
        },
      ]);
    }

    if (
      !(
        restaurant.status === constants.StatusNames.draft ||
        restaurant.status === constants.StatusNames.approvalRejected
      )
    ) {
      return sendError(
        res,
        400,
        'Restaurant Cannot be updated "not in draft/rejected state"'
      );
    }
    if (validated_req.cuisine_ids) {
      const invalidCuisine_ids = await models.getInvalidCuisineIds(
        validated_req.cuisine_ids
      );
      if (invalidCuisine_ids && invalidCuisine_ids.length > 0) {
        return sendError(
          res,
          400,
          'Invalid Cuisine Ids: ' + invalidCuisine_ids
        );
      }
    }

    if (
      validated_req.owner_contact_number &&
      validated_req.owner_contact_number !== restaurant.owner_contact_number
    ) {
      validated_req.owner_contact_number_verified = false;
    }

    if (
      validated_req.owner_email &&
      validated_req.owner_email !== restaurant.owner_email
    ) {
      validated_req.owner_email_verified = false;
    }

    if (
      validated_req.document_sign_number &&
      validated_req.document_sign_number !== restaurant.document_sign_number
    ) {
      validated_req.document_sign_number_verified = false;
    }

    if (
      validated_req.postal_code &&
      validated_req.postal_code !== restaurant.postal_code
    ) {
      validated_req.postal_code_verified = false;
    }

    if (
      validated_req.fssai_cert_number &&
      validated_req.fssai_cert_number !== restaurant.fssai_cert_number
    ) {
      validated_req.fssai_cert_verified = false;
    }

    if (
      validated_req.pan_number &&
      validated_req.pan_number !== restaurant.pan_number
    ) {
      validated_req.pan_number_verified = false;
    }

    if (
      validated_req.ifsc_code &&
      validated_req.ifsc_code !== restaurant.ifsc_code
    ) {
      validated_req.ifsc_verified = false;
    }

    if (
      validated_req.packing_charge_type !== undefined &&
      validated_req.packing_charge_type !== 'order'
    ) {
      validated_req.packing_charge_order = null;
    }
    if (
      validated_req.packing_charge_type !== undefined &&
      validated_req.packing_charge_type !== 'item'
    ) {
      validated_req.packing_charge_item = null;
    }
    if (
      validated_req.custom_packing_charge_item !== undefined &&
      validated_req.custom_packing_charge_item === false
    ) {
      validated_req.packing_charge_item = null;
    }
    if (
      validated_req.fssai_has_certificate !== undefined &&
      validated_req.fssai_has_certificate === true
    ) {
      validated_req.fssai_application_date = null;
      validated_req.fssai_ack_number = null;
      validated_req.fssai_ack_document_type = null;
      validated_req.fssai_ack_document = null;
    }
    if (
      validated_req.fssai_has_certificate !== undefined &&
      validated_req.fssai_has_certificate === false
    ) {
      validated_req.fssai_expiry_date = null;
      validated_req.fssai_cert_number = null;
      validated_req.fssai_cert_verified = null;
      validated_req.fssai_cert_document_type = null;
      validated_req.fssai_cert_document = null;
    }

    if (
      validated_req.has_gstin !== undefined &&
      validated_req.has_gstin === true
    ) {
      validated_req.business_name = null;
      validated_req.business_address = null;
    }
    if (
      validated_req.has_gstin !== undefined &&
      validated_req.has_gstin === false
    ) {
      validated_req.gstin_number = null;
      validated_req.gstin_number_verified = null;
      validated_req.gstin_document_type = null;
      validated_req.gstin_document = null;
    }

    if (
      validated_req.lat ||
      validated_req.long ||
      validated_req.area_id ||
      validated_req.city_id
    ) {
      validated_req.city_id = validated_req.city_id || restaurant.city_id;
      validated_req.area_id = validated_req.area_id || restaurant.area_id;
      validated_req.lat = validated_req.lat || restaurant.lat;
      validated_req.long = validated_req.long || restaurant.long;
      if (
        validated_req.lat &&
        validated_req.long &&
        validated_req.area_id &&
        validated_req.city_id
      ) {
        const serviceable = await isLatAndLongServiceableInCityArea(
          validated_req.city_id,
          validated_req.area_id,
          +validated_req.lat,
          +validated_req.long
        );
        if (!serviceable) {
          throw new ResponseError(400, 'Location not serviceable.');
        }
      }
    }
    const restaurantInput = await updateFiles(validated_req, restaurant);
    logger.debug('All restaurant files updated successfully', restaurantInput);
    const trx = await getTransaction();
    let updatedRestaurant: models.IRestaurant;
    try {
      if (validated_req.scheduling_type && validated_req.slot_schedule) {
        logger.debug('checking restaurant slots');
        validateSlots(
          validated_req.scheduling_type,
          validated_req.slot_schedule
        );
        logger.debug('restaurant slots validated');
        await models.createSlot(trx, req.body.id, validated_req.slot_schedule);
        logger.debug('restaurant slots created in database');
      }
      logger.debug('updating restaurant', restaurantInput);
      updatedRestaurant = await models.updateRestaurant(trx, restaurantInput);
      await trx.commit();
      logger.debug('restaurant updated successfully');
    } catch (error) {
      await trx.rollback();
      logger.error('Failed Saving', error);
      throw error;
    }
    logger.debug('generating restaurant files download url', updatedRestaurant);
    const updates = await generateDownloadURL(updatedRestaurant);
    logger.debug('restaurant files download url generated successfully');
    return sendSuccess(res, 200, updates);
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function updateSlot(req: Request, res: Response) {
  try {
    logger.debug('restaurant Update Draft >> req-body', req.body);
    const restaurant = req.data.restaurant as models.IRestaurant;

    const validation = models.verify_update_slot.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);

    const validated_req = validation.value;
    validateSlots(validated_req.scheduling_type, validated_req.slot_schedule);
    const trx = await getTransaction();
    try {
      const slot_schedule = await models.createSlot(
        trx,
        restaurant.id,
        validated_req.slot_schedule
      );
      await models.updateRestaurant(trx, {
        id: restaurant.id,
        scheduling_type: validated_req.scheduling_type,
      });
      const holdiay_slot = (
        await models.returnHolidaySlots([restaurant.id])
      )[0];
      const availability = calculateRestaurantAvailability(
        slot_schedule,
        holdiay_slot
      );
      await upsertRestaurantAvailabilityInCache(restaurant.id, availability);
      await trx.commit();
      return sendSuccess(res, 200, {
        scheduling_type: validated_req.scheduling_type,
        slot_schedule: slot_schedule.map(s => ({
          start_time: s.start_time,
          end_time: s.end_time,
          slot_name: s.slot_name,
        })),
      });
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function getSlots(req: Request, res: Response) {
  try {
    const slots = await models.getRestaurantSlots([req.data.restaurant.id]);
    const slot_schedule: {
      slot_name: string;
      start_time: string;
      end_time: string;
    }[] = [];
    slots.forEach(slot => {
      slot_schedule.push({
        slot_name: slot.slot_name!,
        start_time: slot.start_time,
        end_time: slot.end_time,
      });
    });
    return sendSuccess(res, 200, {
      scheduling_type: req.data.restaurant.scheduling_type,
      slot_schedule,
    });
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function disableRestaurant(req: Request, res: Response) {
  try {
    const restaurant = req.data.restaurant as models.IRestaurant;

    const validation = Joi.boolean().validate(req.body.disable);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);

    const disable = validation.value;
    let status = '';
    if (disable) {
      if (restaurant.status !== 'active') {
        return sendError(res, 400, 'Not Active');
      } else {
        status = 'disable';
      }
    } else {
      if (restaurant.status !== 'disable') {
        return sendError(res, 400, 'Not Disable');
      } else {
        status = 'active';
      }
    }

    const trx = await getTransaction();
    try {
      await models.updateRestaurantBasic(trx, {
        id: restaurant.id,
        status,
      });
      await trx.commit();
    } catch (error) {
      await trx.rollback();
      return handleErrors(res, error);
    }

    return sendSuccess(res, 200, 'Updated Successfully');
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function deleteRestaurantById(req: Request, res: Response) {
  try {
    const restaurant = req.data.restaurant as models.IRestaurant;
    if (
      restaurant.status === constants.StatusNames.draft ||
      restaurant.status === constants.StatusNames.approvalRejected
    ) {
      await models.deleteRestaurantById(restaurant.id);
    } else {
      return sendError(
        res,
        400,
        'Restaurant cannot be deleted "not in draft or rejected"'
      );
    }
    // await sendSQSMessage(SQS_URL.SERVICEABILITY, {
    //   event: 'RESTAURANT',
    //   action: 'DELETE',
    //   data: {
    //     id: restaurant.id,
    //   },
    // });
    await esIndexData({
      event: 'RESTAURANT',
      action: 'DELETE',
      data: {
        id: restaurant.id,
      },
    });

    await deleteRestaurantAvailabilityFromCache(restaurant.id);

    return sendSuccess(res, 200, {id: restaurant.id});
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function submitRestaurant(req: Request, res: Response) {
  try {
    const restaurant = req.data.restaurant as models.IRestaurant;
    if (
      !(
        restaurant.status === constants.StatusNames.draft ||
        restaurant.status === constants.StatusNames.approvalRejected
      )
    ) {
      return sendError(
        res,
        400,
        'Restaurant Cannot be submitted "not in draft/rejected state"'
      );
    }
    await validateApproval(restaurant);
    const saveData = {
      id: restaurant.id,
      status: constants.StatusNames.approvalPending,
    };

    let updatedRestaurant: models.IRestaurant;
    const trx = await getTransaction();
    try {
      updatedRestaurant = await models.updateRestaurant(trx, saveData);
      await trx.commit();
    } catch (error) {
      await trx.rollback();
      logger.error('Failed Saving', error);
      throw error;
    }
    logger.debug('updatedRestaurant', updatedRestaurant);
    return sendSuccess(res, 200, await generateDownloadURL(updatedRestaurant));
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function adminApproval(req: Request, res: Response) {
  try {
    const restaurant = req.data.restaurant as models.IRestaurant;
    req.body.id = restaurant.id;
    const validation = models.verify_admin_approval.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = validation.value;

    if (restaurant.status !== constants.StatusNames.approvalPending) {
      return sendError(
        res,
        400,
        'Restaurant Cannot approved "not in admin approval pending state"'
      );
    }
    if (validated_req.approved) {
      restaurant.status = constants.StatusNames.catalogPending;
      await sendSQSMessage(SQS_URL.NOTIFICATIONS, {
        event: 'EMAIL',
        action: 'SINGLE',
        data: {
          reciverEmail: await Globals.CATALOG_TEAM_EMAIL.get(),
          templateName: 'RestaurantApprovalEmailTemplate',
          templateData: {
            subject: `Start Catalog Process For Restaurant : ${restaurant.name}`,
            restaurant_id: restaurant.id,
            restaurant_name: restaurant.name,
            admin_id: req.user.id,
            admin_full_name: req.user.data.full_name,
          },
        },
      });
    } else restaurant.status = constants.StatusNames.approvalRejected;
    restaurant.approved_by = req.user.id;
    restaurant.status_comments = validated_req.status_comments;

    let updatedRestaurant: models.IRestaurant;
    const trx = await getTransaction();
    try {
      updatedRestaurant = await models.updateRestaurant(trx, restaurant);
      await trx.commit();
    } catch (error) {
      await trx.rollback();
      logger.error('Failed Saving', error);
      throw 'Failed Saving';
    }
    if (restaurant.status === 'approvalRejected') {
      await sendSQSMessage(SQS_URL.NOTIFICATIONS, {
        event: 'EMAIL',
        action: 'SINGLE',
        data: {
          reciverEmail: updatedRestaurant.owner_email,
          templateName: 'RestaurantRejectionEmailTemplate',
          templateData: {
            subject: 'Your restaurant has been rejected',
            restaurantName: updatedRestaurant.name,
            status: 'rejected',
            reason: validated_req.status_comments,
            partnerName: updatedRestaurant.owner_name,
          },
        },
      });
    }

    logger.debug('updatedRestaurant', updatedRestaurant);
    return sendSuccess(res, 200, {
      id: updatedRestaurant.id,
      status: updatedRestaurant.status,
    });
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function catalogApproval(req: Request, res: Response) {
  try {
    const restaurant = req.data.restaurant as models.IRestaurant;

    if (restaurant.status !== constants.StatusNames.catalogPending) {
      return sendError(
        res,
        400,
        'Restaurant Cannot approved "not in catalog peding state"'
      );
    }

    if (isEmpty(restaurant.lat) || isEmpty(restaurant.long)) {
      return sendError(res, 400, 'Please add restaurant lat and long');
    }

    restaurant.status = constants.StatusNames.disable;
    restaurant.catalog_approved_by = req.user.id;

    //restaurant vendor login creation
    let vendor_details;
    if (restaurant.owner_email) {
      vendor_details = {
        role: 'owner',
        email: restaurant.owner_email!,
        phone: restaurant.owner_contact_number!,
        name: restaurant.owner_name!,
      };
    } else {
      vendor_details = {
        role: 'manager',
        email: restaurant.manager_email!,
        phone: restaurant.manager_contact_number!,
        name: restaurant.manager_name!,
      };
    }
    //

    let updatedRestaurant: models.IRestaurant;
    const trx = await getTransaction();
    try {
      //create payout account
      await createRestaurantPayoutAccount(trx, restaurant);
      //---------

      //subscription
      const auto_subscription_plan_id = process.env.AUTO_SUBSCRIPTION_PLAN_ID;
      if (auto_subscription_plan_id) {
        await createNewSubscription(trx, {
          restaurant_id: restaurant.id,
          plan_id: auto_subscription_plan_id,
          customer_name: vendor_details.name,
          customer_email: vendor_details.email,
          customer_phone: vendor_details.phone,
        });
      } else {
        logger.debug('auto subscription plan id env not configured');
      }
      //---------

      updatedRestaurant = await models.updateRestaurant(trx, restaurant);
      const time_slot = await getRestaurantSlots([restaurant.id]);
      const availability = calculateRestaurantAvailability(time_slot);
      await upsertRestaurantAvailabilityInCache(restaurant.id, availability);
      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }

    //restaurant vendor login creation
    await sendSQSMessage(SQS_URL.USER_WORKER, {
      event: 'VENDOR',
      action: 'LOGIN',
      data: {
        outlet_id: restaurant.id,
        outlet_name: restaurant.name!,
        type: 'restaurant',
        vendor_details: vendor_details,
      },
    });
    //---------

    //elastic search restaurant document
    if (restaurant.cuisine_ids) {
      await putRestaurantElasticSearchDocument(restaurant);
    }
    //---------

    logger.debug('updatedRestaurant', updatedRestaurant);
    return sendSuccess(res, 200, {
      id: updatedRestaurant.id,
      status: updatedRestaurant.status,
    });
  } catch (error) {
    return handleErrors(res, error, 'FAILED WHILE CATALOG APPROVAL');
  }
}

export async function reviewFilter(req: Request, res: Response) {
  try {
    const restaurant = req.data.restaurant as models.IRestaurant;

    const validation = verify_review_filter_as_vendor.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = <IReviewFilter>validation.value;

    const review_retult = await filterReview(
      [req.user.data.restaurant_id],
      validated_req
    );
    return sendSuccess(res, 200, {
      like_count: restaurant.like_count,
      dislike_count: restaurant.dislike_count,
      like_count_label: humanizeNumber(restaurant.like_count),
      dislike_count_label: humanizeNumber(restaurant.dislike_count),
      restaurant_rating: 0, //!BACKWARD_COMPATIBLE
      ...review_retult,
    });
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function admin_reviewFilter(req: Request, res: Response) {
  try {
    const validation = verify_review_filter_as_admin.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);

    const validated_req = <IReviewFilterAsAdmin>validation.value;

    const review_retult = await filterReview(validated_req.restaurant_ids, {
      filter: validated_req.filter,
      pagination: validated_req.pagination,
      sort: validated_req.sort,
    });
    return sendSuccess(res, 200, review_retult);
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function getRestaurantHolidaySlot(req: Request, res: Response) {
  try {
    const restaurant = (
      await setRestaurantAvailability([{id: req.params.id}])
    )[0];
    return sendSuccess(res, 200, restaurant.availability);
    // const result = (await models.returnHolidaySlots([req.params.id]))[0];
    // if (!result || !result.open_after || result.open_after <= new Date())
    //   return sendError(res, 404, 'No Holiday Slot');
    // return sendSuccess(res, 200, result);
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function getRestaurantVendorsDetails(req: Request, res: Response) {
  try {
    const validation = joi_restaurant_id.validate(req.params.id);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);

    const restaurant = await models.readRestaurantById(validation.value);

    if (!restaurant) {
      return sendError(res, 400, [
        {
          message: 'restaurant not found',
          code: 1093,
        },
      ]);
    }

    const restaurant_details = await getRestaurantVendors(validation.value);
    const updated_restaurant_details = restaurant_details.map(obj => {
      return {
        name: obj.name,
        login_id: obj.login_id,
        type: obj.type,
        email: obj.email,
        phone: obj.phone,
        outlet_id: obj.outlet_id,
        role: obj.role,
        active: obj.active,
      };
    });

    return sendSuccess(res, 200, updated_restaurant_details);
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function setRestaurantParent(req: Request, res: Response) {
  try {
    const child_validation = joi_restaurant_id.validate(req.params.id);
    if (child_validation.error)
      return sendError(res, 400, child_validation.error.details[0].message);

    const parent_validation = joi_restaurant_id.validate(
      req.body.parent_restaurant_id
    );
    if (parent_validation.error)
      return sendError(res, 400, parent_validation.error.details[0].message);

    if (child_validation.value === parent_validation.value) {
      return sendError(res, 400, [
        {
          message: 'Parent child id is same',
          code: 1093,
        },
      ]);
    }

    const child_restaurant = await models.readRestaurantById(
      child_validation.value
    );

    if (!child_restaurant) {
      return sendError(res, 400, [
        {
          message: 'Child restaurant not found',
          code: 1093,
        },
      ]);
    }
    if (child_restaurant.parent_or_child === 'parent') {
      return sendError(res, 400, [
        {
          message: 'Parent restaurant cannot be child',
          code: 1093,
        },
      ]);
    }
    const parent_restaurant = await models.readRestaurantById(
      parent_validation.value
    );

    if (!parent_restaurant) {
      return sendError(res, 400, [
        {
          message: 'Parent restaurant not found',
          code: 1093,
        },
      ]);
    }
    if (parent_restaurant.parent_id) {
      return sendError(res, 400, [
        {
          message: 'Parent is already a child',
          code: 1093,
        },
      ]);
    }
    if (child_restaurant.parent_id) {
      if (child_restaurant.parent_id === parent_restaurant.id) {
        return sendError(res, 400, [
          {
            message: 'Restaurant already mapped to same parent',
            code: 1093,
          },
        ]);
      } else {
        return sendError(res, 400, [
          {
            message: 'Restaurant mapped with another parent',
            code: 1093,
          },
        ]);
      }
    }

    const trx = await getTransaction();
    try {
      await models.updateRestaurantBasic(trx, {
        id: child_restaurant.id,
        parent_id: parent_restaurant.id,
        parent_or_child: 'child',
      });
      await models.updateRestaurantBasic(trx, {
        id: parent_restaurant.id,
        parent_or_child: 'parent',
      });
      await trx.commit();
    } catch (error) {
      await trx.rollback();
      return handleErrors(res, error);
    }

    return sendSuccess(res, 200, 'updated');
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function deleteRestaurantParent(req: Request, res: Response) {
  try {
    const child_validation = joi_restaurant_id.validate(req.params.id);
    if (child_validation.error)
      return sendError(res, 400, child_validation.error.details[0].message);

    const child_restaurant = await models.readRestaurantById(
      child_validation.value
    );

    if (!child_restaurant) {
      return sendError(res, 400, [
        {
          message: 'Child restaurant not found',
          code: 1093,
        },
      ]);
    }
    if (child_restaurant.parent_or_child !== 'child') {
      return sendError(res, 400, [
        {
          message: 'Restaurant is not child',
          code: 1093,
        },
      ]);
    }

    const trx = await getTransaction();
    try {
      const restaurant_children = await models.readRestaurantChildren(
        child_restaurant.parent_id!
      );
      if (restaurant_children) {
        if (
          restaurant_children.length === 1 &&
          restaurant_children[0].id === child_restaurant.id
        ) {
          await models.updateRestaurantBasic(trx, {
            id: child_restaurant.parent_id!,
            parent_or_child: null,
          });
        }
      }
      await models.updateRestaurantBasic(trx, {
        id: child_restaurant.id,
        parent_id: null,
        parent_or_child: null,
      });
      await trx.commit();
    } catch (error) {
      await trx.rollback();
      return handleErrors(res, error);
    }

    return sendSuccess(res, 200, 'updated');
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function getRestaurantChildren(req: Request, res: Response) {
  try {
    const parent_validation = joi_restaurant_id.validate(
      req.params.id || req.user.data.restaurant_id
    );
    if (parent_validation.error)
      return sendError(res, 400, parent_validation.error.details[0].message);

    const restaurant_children = await models.readRestaurantChildren(
      parent_validation.value
    );
    await setRestaurantAvailability(restaurant_children);
    return sendSuccess(
      res,
      200,
      await generateDownloadURLs(restaurant_children)
    );
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function getRestaurantParent(req: Request, res: Response) {
  try {
    const child_validation = joi_restaurant_id.validate(
      req.params.id || req.user.data.restaurant_id
    );
    if (child_validation.error)
      return sendError(res, 400, child_validation.error.details[0].message);
    const child_restaurant = await models.readRestaurantBasicById(
      child_validation.value
    );
    if (!child_restaurant) {
      return sendError(res, 400, [
        {
          message: 'Restaurant not found',
          code: 1093,
        },
      ]);
    }
    if (!child_restaurant.parent_id) {
      return sendError(res, 400, [
        {
          message: 'Restaurant is not child',
          code: 1093,
        },
      ]);
    }
    const parent_restaurant = await models.readRestaurantById(
      child_restaurant.parent_id
    );
    return sendSuccess(res, 200, parent_restaurant);
  } catch (error) {
    return handleErrors(res, error);
  }
}
