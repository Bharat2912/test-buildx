import moment, {Moment} from 'moment';
import {getMapMatrix} from '../../../internal/map';
import {ICoordinate} from '../../../types';
import {isEmpty, roundUp} from '../../../utilities/utilFuncs';
import {
  getRestaurantSlots,
  IHolidaySlot,
  IRestaurant,
  IRestaurant_Basic,
  IRestaurant_Slot,
  readRestaurantWithTimeSlotsAndHolidaySlot,
  returnHolidaySlots,
  SchedulingType,
} from './models';
import {
  ValidImageFileExtension,
  ValidDOCFileExtension,
  ValidFileType,
} from './enums';
import ResponseError from '../../../utilities/response_error';
import Globals from '../../../utilities/global_var/globals';
import {
  all_scheduling_type_slot_names,
  custom_scheduling_type_slot_names,
  weekdays_and_weekends_scheduling_type_slot_names,
} from './constants';
import redis_client from '../../../utilities/cache_manager';
import {
  IRestaurantAvailability,
  IRestaurantDeliveryDetails,
  IRestaurantGetDeliveryDetails,
} from './types';
import logger from '../../../utilities/logger/winston_logger';
import {isPointInPolygon} from '../../../utilities/utilFuncs';
import {readPolygonById} from '../../core/polygon/models';
import {esIndexData} from '../../../utilities/es_manager';
import {readCusineByIds} from '../cuisine/models';
import {readCityById} from '../../core/city/models';
import {ICoupon, ICouponText, IRestaurantMaxDiscount} from '../coupons/types';

export async function isRestaurantSubscriptionActive(
  restaturant: IRestaurant_Basic
): Promise<boolean> {
  if (
    isEmpty(restaturant.subscription_id) ||
    isEmpty(restaturant.subscription_end_time) ||
    isEmpty(restaturant.subscription_grace_period_remaining_orders) ||
    isEmpty(restaturant.subscription_remaining_orders)
  ) {
    return false;
  } else {
    const CURRENT_TIMESTAMP = new Date();
    if (
      restaturant.subscription_end_time! > CURRENT_TIMESTAMP &&
      restaturant.subscription_remaining_orders! > 0
    ) {
      return true;
    } else if (
      restaturant.subscription_end_time! < CURRENT_TIMESTAMP &&
      restaturant.subscription_grace_period_remaining_orders! > 0 &&
      moment(restaturant.subscription_end_time)
        .add(
          await Globals.SUBSCRIPTION_END_TIME_GRACE_PERIOD_IN_DAYS.get(),
          'days'
        )
        .toDate() > CURRENT_TIMESTAMP
    ) {
      return true;
    } else {
      return false;
    }
  }
}

// export async function calculateRestaurantsTravelTimeAndDistance(
//   restaurants: IRestaurant[],
//   customer_coordinates: ICoordinate
// ): Promise<IRestaurant[]> {
//   let coordinates = '';
//   const origins: number[] = [];
//   const destinations: number[] = [];
//   for (let i = 0; i < restaurants.length; i++) {
//     coordinates += `${restaurants[i]!.long},${restaurants[i]!.lat};`;
//     origins.push(i);
//   }
//   coordinates += `${customer_coordinates.longitude},${customer_coordinates.latitude}`;

//   destinations.push(origins.length);

//   //Distance Time Map Matrix
//   const coordinates_with_distance_time = await getMapMatrix(
//     coordinates,
//     origins.join(',').replaceAll(',', ';'),
//     destinations.join(',').replaceAll(',', ';')
//   );

//   for (let i = 0; i < restaurants.length; i++) {
//     if (
//       !isEmpty(coordinates_with_distance_time.durations[i][0]) &&
//       !isEmpty(coordinates_with_distance_time.distances[i][0])
//     ) {
//       const calculated_delivery_time_in_seconds = roundUp(
//         coordinates_with_distance_time.durations[i][0] +
//           restaurants[i].default_preparation_time! * 60,
//         0
//       );

//       restaurants[i].delivery_time_in_seconds =
//         calculated_delivery_time_in_seconds;

//       restaurants[i].delivery_distance_in_meters = roundUp(
//         coordinates_with_distance_time.distances[i][0],
//         0
//       );

//       restaurants[i].delivery_time_string =
//         roundUp(
//           moment
//             .duration(calculated_delivery_time_in_seconds, 'seconds')
//             .asMinutes(),
//           0
//         ) + ' mins';

//       restaurants[i].delivery_distance_string =
//         roundUp(coordinates_with_distance_time.distances[i][0] / 1000, 1) +
//         ' Km';
//     }
//   }

//   return restaurants;
// }

export async function calculateRestaurantsTravelTimeAndDistance(
  restaurants: IRestaurantGetDeliveryDetails[],
  customer_coordinates: ICoordinate
): Promise<IRestaurantDeliveryDetails[]> {
  logger.debug('calculating restaurants travel and distance', {
    restaurants,
    customer_coordinates,
  });
  let coordinates = '';
  const origins: number[] = [];
  const destinations: number[] = [];
  for (let i = 0; i < restaurants.length; i++) {
    coordinates += `${restaurants[i]!.coordinates.longitude},${
      restaurants[i]!.coordinates.latitude
    };`;
    origins.push(i);
  }
  coordinates += `${customer_coordinates.longitude},${customer_coordinates.latitude}`;

  destinations.push(origins.length);

  //Distance Time Map Matrix
  const coordinates_with_distance_time = await getMapMatrix(
    coordinates,
    origins.join(',').replaceAll(',', ';'),
    destinations.join(',').replaceAll(',', ';')
  );

  const restaurants_with_delivery_details: IRestaurantDeliveryDetails[] = [];
  for (let i = 0; i < restaurants.length; i++) {
    if (
      !isEmpty(coordinates_with_distance_time.durations[i][0]) &&
      !isEmpty(coordinates_with_distance_time.distances[i][0])
    ) {
      const calculated_delivery_time_in_seconds = roundUp(
        coordinates_with_distance_time.durations[i][0] +
          restaurants[i].default_preparation_time * 60,
        0
      );

      restaurants_with_delivery_details.push({
        id: restaurants[i].id,
        delivery_time_in_seconds: calculated_delivery_time_in_seconds,
        delivery_distance_in_meters: roundUp(
          coordinates_with_distance_time.distances[i][0],
          0
        ),
        delivery_time_string:
          roundUp(
            moment
              .duration(calculated_delivery_time_in_seconds, 'seconds')
              .asMinutes(),
            0
          ) + ' mins',
        delivery_distance_string:
          roundUp(coordinates_with_distance_time.distances[i][0] / 1000, 1) +
          ' Km',
      });
    }
  }
  logger.debug(
    'restaurants with delivery details',
    restaurants_with_delivery_details
  );
  return restaurants_with_delivery_details;
}

// export async function calculateRestaurantsTravelTimeAndDistance(
//   restaurants: IRestaurant[],
//   customer_coordinates: ICoordinate
// ): Promise<IRestaurant[]> {
//   let coordinates = '';
//   const origins: number[] = [];
//   const destinations: number[] = [];
//   for (let i = 0; i < restaurants.length; i++) {
//     coordinates += `${restaurants[i]!.long},${restaurants[i]!.lat};`;
//     origins.push(i);
//   }
//   coordinates += `${customer_coordinates.longitude},${customer_coordinates.latitude}`;

//   destinations.push(origins.length);

//   //Distance Time Map Matrix
//   const coordinates_with_distance_time = await getMapMatrix(
//     coordinates,
//     origins.join(',').replaceAll(',', ';'),
//     destinations.join(',').replaceAll(',', ';')
//   );

//   for (let i = 0; i < restaurants.length; i++) {
//     if (
//       !isEmpty(coordinates_with_distance_time.durations[i][0]) &&
//       !isEmpty(coordinates_with_distance_time.distances[i][0])
//     ) {
//       const calculated_delivery_time_in_seconds = roundUp(
//         coordinates_with_distance_time.durations[i][0] +
//           restaurants[i].default_preparation_time! * 60,
//         0
//       );

//       restaurants[i].delivery_time_in_seconds =
//         calculated_delivery_time_in_seconds;

//       restaurants[i].delivery_distance_in_meters = roundUp(
//         coordinates_with_distance_time.distances[i][0],
//         0
//       );

//       restaurants[i].delivery_time_string =
//         roundUp(
//           moment
//             .duration(calculated_delivery_time_in_seconds, 'seconds')
//             .asMinutes(),
//           0
//         ) + ' mins';

//       restaurants[i].delivery_distance_string =
//         roundUp(coordinates_with_distance_time.distances[i][0] / 1000, 1) +
//         ' Km';

//       restaurants[i].delivery_time = roundUp(
//         calculated_delivery_time_in_seconds / 60,
//         0
//       );
//       logger.debug(
//         'Calculating restaurant delivery time for ' + restaurants[i].name,
//         {
//           restaurant_id: restaurants[i].id,
//           restaurant_latitude: restaurants[i].lat,
//           restaurant_longitude: restaurants[i].long,
//           customer_latitude: customer_coordinates.latitude,
//           customer_longitude: customer_coordinates.longitude,
//           osrm_distance: coordinates_with_distance_time.distances[i][0],
//           osrm_duration: coordinates_with_distance_time.durations[i][0],
//           default_preparation_time: restaurants[i].default_preparation_time,
//           distance_text: restaurants[i].delivery_distance_string,
//           delivery_time: restaurants[i].delivery_time,
//         }
//       );
//     }
//   }

//   return restaurants;
// }

export function generateDocumentType(
  file_name: string
): ValidFileType | undefined {
  const file_extension: string = file_name.substring(
    file_name.lastIndexOf('.') + 1
  );
  if (
    (Object.values(ValidImageFileExtension) as string[]).includes(
      file_extension
    )
  ) {
    return ValidFileType.IMAGE;
  } else if (
    (Object.values(ValidDOCFileExtension) as string[]).includes(file_extension)
  ) {
    return ValidFileType.DOCUMENT;
  } else {
    throw new ResponseError(
      400,
      `Invalid File Type Uploaded, Valid Types : [ ${Object.values(
        ValidImageFileExtension
      )},${Object.values(ValidDOCFileExtension)} ]`
    );
  }
}

export function validateImageType(
  file_name: string
): ValidFileType.IMAGE | undefined {
  const file_extension: string = file_name.substring(
    file_name.lastIndexOf('.') + 1
  );
  if (
    (Object.values(ValidImageFileExtension) as string[]).includes(
      file_extension
    )
  ) {
    return ValidFileType.IMAGE;
  } else {
    throw new ResponseError(
      400,
      `Invalid File Type Uploaded, Valid Types : [ ${Object.values(
        ValidImageFileExtension
      )} ]`
    );
  }
}

export function groupSlotIntervalsBySlotType(slots: IRestaurant_Slot[]): {
  slot_name: string;
  slots: {start_time: string; end_time: string}[];
}[] {
  const slot_map = new Map();
  slots.forEach(slot => {
    const slot_intervals = slot_map.get(slot.slot_name);
    if (slot_intervals) {
      slot_intervals.push({
        start_time: slot.start_time,
        end_time: slot.end_time,
      });
      slot_map.set(slot.slot_name, slot_intervals);
    } else {
      slot_map.set(slot.slot_name, [
        {
          start_time: slot.start_time,
          end_time: slot.end_time,
        },
      ]);
    }
  });
  return Array.from(slot_map).map(([key, value]) => ({
    slot_name: key,
    slots: value,
  }));
}

export function validateSlots(
  scheduling_type: SchedulingType,
  slot_schedule: IRestaurant_Slot[]
) {
  /**
   *
   * schedule type                         slot_names                      max number of slots
      all                                [ all ]                              1 x  3  = 3
      weekdays_and_weekends              [weekdays,weekends]                  2 x 3 = 6
      custom                             [mon,tue,..sun]                      7 x 3 = 21
  */
  const grouped_slot_schedule = groupSlotIntervalsBySlotType(slot_schedule);
  grouped_slot_schedule.forEach(slot => {
    if (
      (scheduling_type === SchedulingType.ALL &&
        all_scheduling_type_slot_names.indexOf(slot.slot_name) === -1) ||
      (scheduling_type === SchedulingType.WEEKDAYS_AND_WEEKENDS &&
        weekdays_and_weekends_scheduling_type_slot_names.indexOf(
          slot.slot_name
        ) === -1) ||
      (scheduling_type === SchedulingType.CUSTOM &&
        custom_scheduling_type_slot_names.indexOf(slot.slot_name) === -1)
    ) {
      throw new ResponseError(
        400,
        `Incorrect slots name ${slot.slot_name} for schedule_type ${scheduling_type}`
      );
    }

    if (slot.slots.length > 3) {
      throw new ResponseError(
        400,
        `Maximum 3 slots can be created for ${slot.slot_name}`
      );
    }
  });

  return grouped_slot_schedule;
}

export async function upsertRestaurantAvailabilityInCache(
  restaurant_id: string,
  availability: IRestaurantAvailability
) {
  if (availability.closing_at) {
    await redis_client.ZADD('UPDATE_RESTAURANT_AVAILABILITY_TIME', {
      score: moment(availability.closing_at).unix(),
      value: restaurant_id,
    });
  } else if (availability.next_opens_at) {
    await redis_client.ZADD('UPDATE_RESTAURANT_AVAILABILITY_TIME', {
      score: moment(availability.next_opens_at).unix(),
      value: restaurant_id,
    });
  } else {
    throw 'restaurant availability closing_at/next_opens_at timing not available';
  }

  await redis_client.set(
    `restaurant:${restaurant_id}:availability`,
    JSON.stringify(availability)
  );
}

export async function getRestaurantsAvailabilityFromCache(
  restaturant_ids: string[]
): Promise<(IRestaurantAvailability | null)[]> {
  const keys: string[] = [];
  restaturant_ids.forEach(id => keys.push(`restaurant:${id}:availability`));
  if (keys.length === 0) return [];
  const availabilities_raw = await redis_client.MGET(keys);

  return availabilities_raw.map(a => (a ? JSON.parse(a) : null));
}

export async function deleteRestaurantAvailabilityFromCache(
  restaurant_id: string
) {
  await redis_client.del(`restaurant:${restaurant_id}:availability`);
  await redis_client.ZREM('UPDATE_RESTAURANT_AVAILABILITY_TIME', restaurant_id);
  logger.debug('Removed restaurant availability from cache', {restaurant_id});
}

export async function recalculateAndSaveRestaurantsAvailabilityInCache() {
  const current_epoch = moment().unix();

  const restaurant_ids = await redis_client.ZRANGEBYSCORE(
    'UPDATE_RESTAURANT_AVAILABILITY_TIME',
    0,
    current_epoch
  );
  logger.debug('Updating restaurant ids availability', restaurant_ids);

  const {
    // total_pages,
    restaurants,
  } = await readRestaurantWithTimeSlotsAndHolidaySlot(restaurant_ids);

  for (let i = 0; i < restaurants.length; i++) {
    const availability = calculateRestaurantAvailability(
      restaurants[i].time_slot,
      restaurants[i].holiday_slot
    );
    logger.debug('restaurant availability calculated', {
      id: restaurants[i].id,
      availability,
      time_slot: restaurants[i].time_slot,
      holiday_slot: restaurants[i].holiday_slot,
    });
    await upsertRestaurantAvailabilityInCache(restaurants[i].id, availability);
  }

  // const upcoming_restaurant_for_update = (
  //   await redis_client.ZRANGEBYSCORE_WITHSCORES(
  //     'UPDATE_RESTAURANT_AVAILABILITY_TIME',
  //     current_epoch,
  //     moment().add(2, 'days').unix(),
  //     {
  //       LIMIT: {
  //         offset: 0,
  //         count: 1,
  //       },
  //     }
  //   )
  // )[0];
  // logger.debug(
  //   'upcoming restaurant for update',
  //   upcoming_restaurant_for_update
  // );
  // logger.debug(
  //   'upcoming_restaurant_for_update.score',
  //   upcoming_restaurant_for_update.score
  // );
  // logger.debug('current_epoch', current_epoch);

  // const interval = upcoming_restaurant_for_update.score - current_epoch;
  // if (interval) {
  //   return interval;
  // } else {
  //   return 600; //10 mins
  // }
}

export async function calculateAndSaveAllRestaurantsAvailabilityInCache() {
  const {
    // total_pages,
    restaurants,
  } = await readRestaurantWithTimeSlotsAndHolidaySlot();
  logger.debug('resaturants fetched to calculate availability', {restaurants});
  for (let i = 0; i < restaurants.length; i++) {
    const availability = calculateRestaurantAvailability(
      restaurants[i].time_slot,
      restaurants[i].holiday_slot
    );
    logger.debug('restaurant availability calculated', {
      id: restaurants[i].id,
      availability,
      time_slot: restaurants[i].time_slot,
      holiday_slot: restaurants[i].holiday_slot,
    });
    await upsertRestaurantAvailabilityInCache(restaurants[i].id, availability);
  }
}

function getNextSlotsOfDay(refMoment: Moment, slots: IRestaurant_Slot[]) {
  let endTime = moment(
    refMoment.format('YYYY-MM-DD') + ' 00:00',
    'YYYY-MM-DD HH:mm'
  );
  let startTime = moment(
    refMoment.format('YYYY-MM-DD') + ' 23:59',
    'YYYY-MM-DD HH:mm'
  );
  // logger.debug('Searching On', refMoment.format('DD-MM HH:mm'));
  // logger.debug('Searching startTime', startTime.format('DD-MM HH:mm'));
  // logger.debug('Searching endTime', endTime.format('DD-MM HH:mm'));

  const weekDay = refMoment.format('ddd').toLowerCase();
  const filterArr: string[] = [weekDay, 'all'];
  if (['mon', 'tue', 'wed', 'thu', 'fri'].includes(weekDay))
    filterArr.push('weekdays');
  if (['sat', 'sun'].includes(weekDay)) filterArr.push('weekends');

  let found = false;
  slots.map(slot => {
    if (filterArr.includes(slot.slot_name!)) {
      const stTime = moment(
        refMoment.format('YYYY-MM-DD') +
          ' ' +
          ('0000' + slot.start_time).slice(-4) +
          ' +0530',
        'YYYY-MM-DD kkmm Z'
      );
      const enTime = moment(
        refMoment.format('YYYY-MM-DD') +
          ' ' +
          ('0000' + slot.end_time).slice(-4) +
          ' +0530',
        'YYYY-MM-DD kkmm Z'
      );
      // logger.debug('matched week day', slot);
      // logger.debug('enTime > refMoment', enTime > refMoment);
      // logger.debug('stTime < startTime', stTime < startTime);
      if (stTime < startTime && enTime > refMoment) {
        startTime = stTime;
        endTime = enTime;
        found = true;
        // logger.debug('found slot');
      }
    }
  });
  if (!found) return null;

  // logger.debug('open time', startTime.format('DD-MM kkmm'));
  // logger.debug('close time', endTime.format('DD-MM kkmm'));
  return {
    start: startTime,
    end: endTime,
  };
}
export function calculateRestaurantAvailability(
  time_slot: IRestaurant_Slot[],
  holiday_slot?: IHolidaySlot
): IRestaurantAvailability {
  logger.debug('restaurant time and holiday slot', {time_slot, holiday_slot});
  if (!time_slot || time_slot.length === 0) {
    throw 'Restaurant time slot not found';
  }

  let reference_time = new Date();

  const availability: IRestaurantAvailability = {
    is_holiday: false,
    is_open: true,
  };

  //holiday slot
  if (
    holiday_slot &&
    holiday_slot.open_after &&
    holiday_slot.open_after > reference_time
  ) {
    reference_time = holiday_slot.open_after;
    availability.is_holiday = true;
    availability.is_open = false;
    availability.next_opens_at = reference_time;

    if (holiday_slot.created_by) {
      if (holiday_slot.created_by.toUpperCase().startsWith('ADMIN_')) {
        availability.created_by = 'admin';
        availability.created_by_id = holiday_slot.created_by.replace(
          'ADMIN_',
          ''
        );
      }
      if (holiday_slot.created_by.toUpperCase().startsWith('VENDOR_')) {
        availability.created_by = 'vendor';
        availability.created_by_id = holiday_slot.created_by.replace(
          'VENDOR_',
          ''
        );
      }
    }
  }

  //time slot
  // Restaurant have slots

  // check for the next available slot
  let reference_moment = moment(reference_time);

  let next_time_slot = getNextSlotsOfDay(reference_moment, time_slot);
  if (!next_time_slot) {
    //next slot available on the next day
    reference_moment = moment(
      reference_moment.format('YYYY-MM-DD') + ' 00:00',
      'YYYY-MM-DD HH:mm'
    );
    for (let day_counter = 1; day_counter < 8; day_counter++) {
      const date = reference_moment.add(1, 'day');
      next_time_slot = getNextSlotsOfDay(date, time_slot);
      if (next_time_slot) day_counter = 10;
    }
  }

  //next slot available on the same day
  if (next_time_slot) {
    if (availability.is_holiday) {
      availability.is_open = false;
      if (next_time_slot.start > moment(reference_time)) {
        availability.next_opens_at = next_time_slot.start.toDate();
      }
    } else if (next_time_slot.start <= moment()) {
      // if no holiday slot found
      availability.is_open = true;
      availability.closing_at = next_time_slot.end.toDate();
    } else {
      // if holiday slot found
      availability.is_open = false;
      availability.next_opens_at = next_time_slot.start.toDate();
    }
  }

  return availability;
}

export async function calculateRestaurantsAvailabilityFromDB(
  restaurants: IRestaurant[]
): Promise<IRestaurant[]> {
  const restaurant_ids = restaurants.map(item => {
    return item.id;
  });
  const all_holiday_slots = await returnHolidaySlots(restaurant_ids);
  const all_restaurant_slots = await getRestaurantSlots(restaurant_ids);
  for (let i = 0; i < restaurants.length; i++) {
    const time_slot = all_restaurant_slots.filter(rest => {
      return rest.restaurant_id === restaurants[i].id;
    });

    const holiday_slot = all_holiday_slots.filter(rest => {
      return rest.restaurant_id === restaurants[i].id;
    })[0];

    const availability = calculateRestaurantAvailability(
      time_slot,
      holiday_slot
    );

    restaurants[i].time_slot = time_slot;
    restaurants[i].availability = availability;

    await upsertRestaurantAvailabilityInCache(restaurants[i].id, availability);
  }
  return restaurants;
}

export async function setRestaurantAvailability(
  restaurants: IRestaurant[]
): Promise<IRestaurant[]> {
  const restaurant_ids = restaurants.map(r => r.id);

  const availabilities = await getRestaurantsAvailabilityFromCache(
    restaurant_ids
  );

  const restaurants_without_calculated_availabilities = [];

  for (let i = 0; i < restaurants.length; i++) {
    if (!availabilities[i]) {
      logger.debug(
        `restaurant ${restaurants[i].id} re-calculating availability`
      );
      restaurants_without_calculated_availabilities.push(restaurants[i]);
    } else {
      logger.debug(
        `restaurant ${restaurants[i].id} availability already exists`
      );
      restaurants[i].availability = availabilities[i]!;
    }
  }

  await calculateRestaurantsAvailabilityFromDB(
    restaurants_without_calculated_availabilities
  );

  return restaurants;
}

export async function isLatAndLongServiceableInCityArea(
  city_id: string,
  area_id: string,
  lat: number,
  long: number
): Promise<boolean> {
  const city = await readCityById(city_id);
  if (!city) {
    logger.error('City not found by city id', city_id);
    throw new ResponseError(400, [
      {
        message: 'Invalid city id',
        code: 0,
      },
    ]);
  }
  const polygon = await readPolygonById(area_id);
  const polygon_lat_longs: {lat: number; long: number}[] = [];
  if (!polygon || !polygon.coordinates) {
    logger.error('Polygon not found by polygon id', area_id);
    throw new ResponseError(400, [
      {
        message: 'Invalid polygon id',
        code: 0,
      },
    ]);
  }

  if (polygon.city_id !== city_id) {
    throw new ResponseError(400, [
      {
        message: 'Selected area does not come under selected city',
        code: 0,
      },
    ]);
  }
  for (let i = 0; i < polygon.coordinates.length; i++) {
    const coordinate = polygon.coordinates[i];
    if (coordinate.length === 2) {
      polygon_lat_longs.push({
        lat: coordinate[0],
        long: coordinate[1],
      });
    }
  }
  try {
    const serviceable = isPointInPolygon(polygon_lat_longs, {lat, long});
    if (serviceable) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    logger.error('failed on verifing point inside polygon', error);
    return false;
  }
}

export async function putRestaurantElasticSearchDocument(
  restaurant: IRestaurant
) {
  const cuisines = await readCusineByIds(restaurant.cuisine_ids!);
  logger.debug('cuisines', cuisines);
  const cuisine_names = cuisines.map(cuisine => {
    return cuisine.name;
  });
  await esIndexData({
    event: 'RESTAURANT',
    action: 'PUT',
    data: {
      id: restaurant.id,
      name: restaurant.name!,
      cuisine_ids: restaurant.cuisine_ids!,
      cuisine_names: cuisine_names,
      default_preparation_time: restaurant.default_preparation_time!,
      coordinates: {
        lat: restaurant.lat!,
        lon: restaurant.long!,
      },
    },
  });
}

export async function setCouponText(
  coupons: ICoupon[],
  discount?: IRestaurantMaxDiscount
): Promise<ICouponText[]> {
  const result: ICouponText[] = [];
  const coupon_display_image = await Globals.COUPON_DISPLAY_IMAGE.get();
  if (discount) {
    let text2 = '20% off on ';
    if (discount.discount_level === 'restaturant') text2 = text2 + 'all items';
    else if (discount.discount_level === 'main_category')
      text2 = text2 + 'selected categories';
    else text2 = text2 + 'selected items';
    result.push({
      type: 'discount',
      image_url: coupon_display_image,
      title: `Flat ${discount.max_discount}%`,
      text1: 'FLAT DISCOUNT',
      text2,
    });
  }
  coupons.map(cpn => {
    result.push({
      type: 'coupon',
      image_url: coupon_display_image,
      title: cpn.header,
      text1: 'Use ' + cpn.code,
      text2: cpn.description,
    });
  });
  return result;
}
