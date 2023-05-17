import ResponseError from '../../../utilities/response_error';
import {CartActions} from './enums';
import {
  IAddressServiceabilityResponse,
  ICouponValidationResponse,
  ICartResponse,
  ICustomerDetails,
  IPutCart,
  IRestaurantValidationResponse,
} from './types';
import {validateRestaurant} from './utilities/restaurant/restaurant_validation';
import logger from '../../../utilities/logger/winston_logger';
import {addressServiceability} from './utilities/serviceability';
import {validateMenuItems} from './utilities/restaurant/menu_items_validation';
import {IError} from '../../../types';
import {Invoice} from '../order/invoice';
import {validateSelectedCoupon} from './utilities/coupon';
import Globals from '../../../utilities/global_var/globals';
import {humanizeNumber} from '../../../utilities/utilFuncs';

export async function validateCart(
  validated_req: IPutCart,
  authorizationToken: string | undefined,
  is_pod?: boolean
) {
  if (validated_req.action === CartActions.UPDATE) {
    if (
      validated_req.menu_items &&
      validated_req.menu_items.length > 0 &&
      !validated_req.restaurant_id
    ) {
      logger.error(
        'CART_VALIDATION_FAILED: can_not_update_cart_without_restaurant_id'
      );
      throw new ResponseError(400, [
        {
          message: 'can_not_update_cart_without_restaurant_id',
          code: 1001,
        },
      ]);
    }
    if (
      validated_req.restaurant_id &&
      validated_req.menu_items &&
      validated_req.menu_items.length > 0
    ) {
      let cart_status = true;
      //error and code are optional parameters which will only come if error comes in cart
      const cart_meta_errors: IError[] = [];

      const validatedRestaurant: IRestaurantValidationResponse =
        await validateRestaurant(validated_req.restaurant_id);

      const validatedMenuItems = await validateMenuItems(
        validatedRestaurant.restaurant,
        validated_req.menu_items
      );
      const invoice = new Invoice(
        validatedMenuItems.menu_items,
        validatedRestaurant.restaurant,
        is_pod || false
      );
      // invoice.setCoupon();
      const coupon: ICouponValidationResponse = await validateSelectedCoupon(
        validated_req.customer_id,
        validated_req.restaurant_id,
        invoice.breakout.total_customer_payable!,
        validated_req.coupon_id,
        validated_req.coupon_code
      );

      const addressServiceabilityResponse: IAddressServiceabilityResponse =
        await addressServiceability(
          validatedRestaurant.restaurant,
          authorizationToken!,
          invoice.breakout.total_customer_payable!,
          validated_req.customer_address_id
        );

      //from addressServiceabilityResponse we get dilvery details like delivery charges
      //if delivery is possible and delivery charges exist then we need to update the cart bill
      const delivery_cost =
        addressServiceabilityResponse.delivery_address?.delivery_details
          ?.delivery_cost;

      //get error from util modules and add those errors to cart errors
      if (validatedRestaurant.restaurant_validation_errors) {
        cart_meta_errors.push(
          ...validatedRestaurant.restaurant_validation_errors
        );
        cart_status = false;
      }
      if (!validatedMenuItems.menu_items_available) {
        cart_meta_errors.push({
          message: 'cart_items_are_currently_unavailable',
          code: 1030,
          data: validatedMenuItems.unavailableMenuItems,
        });
        cart_status = false;
      }
      const max_allow_cart_quantity =
        await Globals.CART_MAX_TOTAL_QUANTITY.get();
      if (validatedMenuItems.menu_items_count > max_allow_cart_quantity) {
        cart_meta_errors.push({
          message: `Requested quantity is higher than the maximum allowed quantity of ${max_allow_cart_quantity}`,
          code: 2018,
        });
        cart_status = false;
      }
      if (coupon.coupon_validation_errors) {
        cart_meta_errors.push(...coupon.coupon_validation_errors);
        cart_status = false;
      } else {
        if (coupon.coupon_detail_cost) {
          invoice.setCoupon(coupon.coupon_detail_cost);
        }
      }
      if (addressServiceabilityResponse.serviceability_validation_errors) {
        cart_meta_errors.push(
          ...addressServiceabilityResponse.serviceability_validation_errors
        );
        cart_status = false;
      } else {
        invoice.setDeliveryCost(delivery_cost || 0);
      }

      const customer_details: ICustomerDetails = {
        ...JSON.parse(
          JSON.stringify({
            customer_id: validated_req.customer_id,
            customer_device_id: validated_req.customer_device_id,
            customer_address_id: validated_req.customer_address_id,
          })
        ),
        customer_addresses: addressServiceabilityResponse.customer_addresses,
        delivery_address: addressServiceabilityResponse.delivery_address,
      };

      const restaurant_details = {
        restaurant_id: validatedRestaurant.restaurant.id,
        restaurant_name: validatedRestaurant.restaurant.name,
        restaurant_status: validatedRestaurant.restaurant.status,
        like_count: validatedRestaurant.restaurant.like_count,
        like_count_label: humanizeNumber(
          validatedRestaurant.restaurant.like_count
        ),
        rating: 0, //! BACKWARD_COMPATIBLE
        availability: validatedRestaurant.restaurant.availability,
        latitude: validatedRestaurant.restaurant.lat,
        longitude: validatedRestaurant.restaurant.long,
        default_preparation_time:
          validatedRestaurant.restaurant.default_preparation_time,
      };

      let delivery_time =
        validatedRestaurant.restaurant.default_preparation_time!;
      if (
        addressServiceabilityResponse.delivery_address?.delivery_details
          .drop_eta
      ) {
        delivery_time +=
          addressServiceabilityResponse.delivery_address?.delivery_details
            .drop_eta;
      }
      logger.debug(
        'Calculating Cart delivery time for ' +
          validatedRestaurant.restaurant.name,
        {
          customer_id: validated_req.customer_id,
          restaurant_id: validated_req.restaurant_id,
          restaurant_latitude: validatedRestaurant.restaurant.lat,
          restaurant_longitude: validatedRestaurant.restaurant.long,
          customer_latitude:
            addressServiceabilityResponse.delivery_address?.latitude,
          customer_longitude:
            addressServiceabilityResponse.delivery_address?.longitude,
          rider_duration:
            addressServiceabilityResponse.delivery_address?.delivery_details
              .drop_eta,
          delivery_service:
            addressServiceabilityResponse.delivery_address?.delivery_details
              .delivery_service,
          default_preparation_time:
            validatedRestaurant.restaurant.default_preparation_time,
        }
      );
      //  check for POD Allowed
      let pod_allowed = true;
      let pod_not_allowed_reason: undefined | string = undefined;
      if (
        !addressServiceabilityResponse.delivery_address?.delivery_details
          .pod_allowed
      ) {
        pod_allowed = false;
        pod_not_allowed_reason =
          addressServiceabilityResponse.delivery_address?.delivery_details
            .pod_not_allowed_reason || 'POD NOT AVAILABLE AT DELIVERY SERVICE';
      }
      const pod_max_amount = +(process.env.ORDER_POD_MAX_AMOUNT || 500);
      if (invoice.breakout.total_customer_payable > pod_max_amount) {
        pod_allowed = false;
        pod_not_allowed_reason = `COD not available for order value greater than ${pod_max_amount}.`;
      }
      const populated_cart: ICartResponse = {
        cart_status: cart_status,
        last_updated_at: new Date().toISOString(),
        any_special_request: validated_req.any_special_request,
        coupon_code: coupon.coupon_details?.code,
        coupon_id: coupon?.coupon_details?.id,
        customer_details,
        ...validatedMenuItems,
        delivery_time,
        restaurant_details,
        invoice_breakout: invoice.breakout,
        delivery_service:
          addressServiceabilityResponse.delivery_address?.delivery_details
            .delivery_service,
        pod_allowed,
        pod_not_allowed_reason,
        cancellation_policy: await Globals.CUSTOMER_CANCELLATION_POLICY.get(),
      };
      return {populated_cart, cart_meta_errors};
    } else {
      const populated_cart: ICartResponse = {};
      return {populated_cart};
    }
  } else {
    logger.error('CART_VALIDATION_FAILED: invalid_cart_action');
    throw new ResponseError(400, [
      {
        message: 'invalid_cart_action',
        code: 1028,
      },
    ]);
  }
}
