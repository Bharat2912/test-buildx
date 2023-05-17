import axios from 'axios';
import logger from '../../../../utilities/logger/winston_logger';
import ResponseError from '../../../../utilities/response_error';
import {IRestaurant} from '../../restaurant/models';
import {
  ICusomerDeliverableAddress,
  ICustomerAddress,
  ILatAndLong,
} from '../types';
import {IError} from '../../../../types';
import {isPointWithinRadius} from 'geolib';
import {deliverabilityCheck} from '../../../../internal/delivery';
import {DeliveryService} from '../../../../enum';
import Globals from '../../../../utilities/global_var/globals';

export async function addressServiceability(
  restaurant: IRestaurant,
  authorizationToken: string,
  order_value: number,
  customer_address_id?: string
): Promise<
  | {
      customer_addresses: ICustomerAddress[] | null;
      delivery_address: ICusomerDeliverableAddress | null;
      serviceability_validation_errors: IError[];
    }
  | {
      customer_addresses: ICustomerAddress[];
      delivery_address: ICusomerDeliverableAddress;
    }
> {
  const serviceability_validation_errors: IError[] = [];

  //get customer address
  const customer_addresses: ICustomerAddress[] =
    await getCustomerAddressFromUserAPI(authorizationToken);
  if (customer_addresses.length === 0) {
    // throw new ResponseError(400, [
    //   {message: 'please select address', code: 1025},
    // ]);
    serviceability_validation_errors.push({
      message: 'please select address',
      code: 1025,
    });
    return {
      customer_addresses: null,
      delivery_address: null,
      serviceability_validation_errors,
    };
  }

  //get and check restaurant address
  if (!restaurant.lat || !restaurant.long) {
    logger.error(
      `CART_VALIDATION_FAILED: restaurant_address_not_found:${restaurant.id}`
    );
    throw new ResponseError(400, [
      {message: 'restaurant_address_not_found', code: 1004},
    ]);
  }

  //python serviceability api will return all customer address with aditional key is_serviceable
  // const python_serviceability_checked_addresses: {
  //   address: ICustomerAddress[];
  // } = await pythonServiceabilityCheck(
  //   restaurant.lat,
  //   restaurant.long,
  //   customer_addresses
  // );

  //get only is_serviceable = true customer addresses
  // const python_serviceable_addresses =
  //   python_serviceability_checked_addresses.address.filter(
  //     (address: ICustomerAddress) => address.is_serviceable
  //   );

  //internal serviceability check will return all customer address with aditional key is_serviceable
  const internal_serviceability_checked_addresses =
    await internalServiceabilityCheck(
      {
        latitude: restaurant.lat,
        longitude: restaurant.long,
      },
      JSON.parse(JSON.stringify(customer_addresses))
    );
  //get only is_serviceable = true customer addresses
  const internal_serviceable_addresses =
    internal_serviceability_checked_addresses.filter(
      customer_address => customer_address.deliverable
    );

  //checking all python serviceable addresses with delivery Service serviceability
  const deliverability_checked_addresses: ICusomerDeliverableAddress[] =
    await addressDeliverabilityCheck(
      restaurant.lat,
      restaurant.long,
      internal_serviceable_addresses,
      order_value + ''
    );
  const servicibility_failed_address = deliverability_checked_addresses.filter(
    (address: ICusomerDeliverableAddress) =>
      !address.delivery_details.deliverable &&
      address.delivery_details.reason === 'Location is non-deliverable'
  );
  logger.debug('SERVICEABILITY FAILED ADDRESSES', servicibility_failed_address);
  // if (servicibility_failed_address.length) {
  //   await sendEmail(
  //     'AdminAlertEmailTemplate',
  //     await Globals.SUPER_ADMIN_EMAIL.get(),
  //     {
  //       subject: 'SHADOWFAX SERVICEABILITY FAILED',
  //       application_name: 'core-api',
  //       error_details: {
  //         message: 'Location is non-deliverable',
  //       },
  //       priority: 'high',
  //       time: new Date().toDateString(),
  //       meta_details: servicibility_failed_address,
  //     }
  //   );
  // }
  // deliverability_checked_addresses[0].delivery_details
  //get only delivery serviceable addresses
  const serviceable_addresses = deliverability_checked_addresses.filter(
    (address: ICusomerDeliverableAddress) =>
      address.delivery_details.deliverable
  );
  // serviceable_addresses.map(address => {
  //   if (address.deliverable)
  //     address.delivery_details.drop_eta =
  //       (address.delivery_details.drop_eta || 0) +
  //       (restaurant.default_preparation_time || 0);
  // });

  //if customer addresses exist but cutsomer have not selected delivery address in cart
  if (!customer_address_id) {
    logger.error(
      'CART_VALIDATION_FAILED: customer_delivery_location_not_available_in_cart'
    );
    // throw new ResponseError(400, [
    //   {message: 'delivery location not selected', code: 1027},
    // ]);
    serviceability_validation_errors.push({
      message: 'delivery location not selected',
      code: 1027,
    });
    return {
      customer_addresses: serviceable_addresses,
      delivery_address: null,
      serviceability_validation_errors,
    };
  }

  //throw error if given dilvery address id is invalid
  if (
    customer_address_id &&
    !customer_addresses.find(
      (address: ICustomerAddress) => address.id === customer_address_id
    )
  ) {
    logger.error(
      'CART_VALIDATION_FAILED: customer_selected_delivery_address_is_invalid'
    );
    // throw new ResponseError(400, [
    //   {message: 'customer_selected_delivery_address_is_invalid', code: 1005},
    // ]);
    serviceability_validation_errors.push({
      message: 'customer_selected_delivery_address_is_invalid',
      code: 1005,
    });
    return {
      customer_addresses: serviceable_addresses,
      delivery_address: null,
      serviceability_validation_errors,
    };
  }

  //now serviceable addresses array contains list of address which passed python and delivery serviceability

  //get delivery address
  const delivery_address = deliverability_checked_addresses.find(
    (address: ICusomerDeliverableAddress) => address.id === customer_address_id
  );
  if (delivery_address && delivery_address.delivery_details.deliverable) {
    return {
      customer_addresses: serviceable_addresses,
      delivery_address: delivery_address,
    };
  } else {
    serviceability_validation_errors.push({
      message:
        delivery_address?.delivery_details.reason ||
        'Delivery location is too far from restaurant location',
      code: 1026,
    });
    return {
      customer_addresses: serviceable_addresses,
      delivery_address: null,
      serviceability_validation_errors: serviceability_validation_errors,
    };
  }
}

/**
 * gets customer address from USER API
 */
export async function getCustomerAddressFromUserAPI(
  authorizationToken: string
) {
  return await axios
    .get((process.env.USER_API_URL || '') + '/user/customer/address', {
      headers: {
        authorization: authorizationToken,
      },
    })
    .then(response => {
      return response.data.result;
    })
    .catch(error => {
      logger.error(
        'CART_VALIDATION_FAILED: USER API FAILED WHILE RETRIEVING CUSTOMER ADDRESSES | ERROR - ' +
          error
      );
      throw new ResponseError(500, 'Internal Server Error');
    });
}

/**
 * Python service that compares two points lat and long
 */
// export async function pythonServiceabilityCheck(
//   restaurant_lat: number,
//   restaurant_long: number,
//   customer_addresses: object[]
// ) {
//   return await axios
//     .post(process.env.SERVICEABILITY_API_URL + '/internal/serviceableAddress', {
//       restaurant_cordinates: [restaurant_lat, restaurant_long],
//       radius: process.env.SERVICEABILITY_DEFAULT_RADIUS
//         ? +process.env.SERVICEABILITY_DEFAULT_RADIUS
//         : 50000,
//       address: customer_addresses,
//     })
//     .then(response => {
//       return response.data;
//     })
//     .catch(error => {
//       logger.error(
//         'CART_VALIDATION_FAILED: failed calling serviceableAddress: ' + error
//       );
//       throw new ResponseError(500, 'Internal Server Error');
//     });
// }

/**
 * geolib npm lib that compares two points lat and long
 */

export async function internalServiceabilityCheck(
  restaurant_lat_long: ILatAndLong,
  customer_addresses: ICustomerAddress[]
) {
  const SERVICEABILITY_RADIUS_IN_METRES =
    await Globals.SERVICEABILITY_RADIUS_IN_METRES.get();
  customer_addresses.forEach(customer_address => {
    customer_address.deliverable = isPointWithinRadius(
      restaurant_lat_long,
      {
        latitude: +customer_address.latitude,
        longitude: +customer_address.longitude,
      },
      SERVICEABILITY_RADIUS_IN_METRES
    );

    logger.debug(
      'INTERNAL SERVICEABILITY RESPONSE FOR ADDRESS',
      `RESTAURANT LAT : ${restaurant_lat_long.latitude}
        RESTAURANT LONG: ${restaurant_lat_long.longitude}
        USER ADD LAT: ${+customer_address.latitude}
        USER ADD LONG: ${+customer_address.longitude},
        RESULT: ${customer_address.deliverable}
        `
    );
  });
  return customer_addresses;
}

export async function addressDeliverabilityCheck(
  pickup_latitude: number,
  pickup_longitude: number,
  customer_addresses: ICustomerAddress[],
  order_value: string
) {
  const promises = [];
  for (let i = 0; i < customer_addresses.length; i++) {
    promises.push(
      deliverabilityCheck({
        delivery_service:
          (await Globals.DELIVERY_SERVICE.get()) as DeliveryService,
        drop_latitude: customer_addresses[i].latitude,
        drop_longitude: customer_addresses[i].longitude,
        pickup_latitude: pickup_latitude,
        pickup_longitude: pickup_longitude,
        data: {
          stage_of_check: 'pre_order',
          order_value: +order_value,
        },
      })
        .then(response => {
          return {
            ...customer_addresses[i],
            delivery_details: response,
          };
        })
        .catch(error => {
          throw error;
        })
    );
  }
  return await Promise.all(promises);
}
