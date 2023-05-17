import logger from '../../../../../utilities/logger/winston_logger';
import ResponseError from '../../../../../utilities/response_error';
import {readRestaurantById} from '../../../restaurant/models';
import {setRestaurantAvailability} from '../../../restaurant/service';
import {IError} from '../../../../../types';
import {isRestaurantSubscriptionActive} from '../../../restaurant/service';

export async function validateRestaurant(restaurant_id: string) {
  const restaurant_validation_errors: IError[] = [];
  const restaurant = await readRestaurantById(restaurant_id);
  if (!restaurant) {
    //if restaurant does not exists then throw error
    logger.error('CART_VALIDATION_FAILED: restaurant_does_not_exists');
    throw new ResponseError(400, [
      {message: 'restaurant_does_not_exists', code: 1002},
    ]);
  }
  if (restaurant.status !== 'active') {
    //if selected restaurant is not approved then throw error
    logger.error('CART_VALIDATION_FAILED: restaurant_not_approved');
    throw new ResponseError(400, [
      {
        message: 'restaurant is not active',
        code: 1003,
      },
    ]);
  }
  if (!(await isRestaurantSubscriptionActive(restaurant))) {
    logger.error('CART_VALIDATION_FAILED: restaurant subscription is inactive');
    restaurant_validation_errors.push({
      message: 'restaurant is not active',
      code: 2011,
    });
  }

  await setRestaurantAvailability([restaurant]);

  if (restaurant.availability && !restaurant.availability.is_open) {
    logger.error(
      'CART_VALIDATION_FAILED: restaurant_selected_in_cart_is_closed'
    );
    // throw new ResponseError(400, [
    //   {message: 'restaurant_selected_in_cart_is_closed', code: 1029},
    // ]);
    restaurant_validation_errors.push({
      message: 'restaurant_selected_in_cart_is_closed',
      code: 1029,
    });
  }
  if (restaurant_validation_errors.length > 0) {
    return {
      restaurant,
      restaurant_validation_errors,
    };
  } else {
    return {restaurant};
  }
}
