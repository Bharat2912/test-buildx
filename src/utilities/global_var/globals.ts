import {ICartResponse} from '../../module/food/cart/types';
import * as cache from '../cache_manager';
import logger from '../logger/winston_logger';
import {FileObject, generateDownloadFileURL} from '../s3_manager';
import {isEmpty} from '../utilFuncs';
import {readAllGlobalVar} from './models';
import {GlobalVar} from './types';

export class Globals {
  static async syncAll(): Promise<void> {
    try {
      const global_vars = await readAllGlobalVar();

      for (let i = 0; i < global_vars.length; i++) {
        await this.sync(global_vars[i]);
      }
    } catch (error) {
      logger.error('Error originated while syncing global vars', error);
      throw error;
    }
  }
  static async sync(global_var: GlobalVar): Promise<void> {
    global_var = await this.setType(global_var);

    await cache.set(global_var.key, global_var.value);
  }

  static async setType(global_var: GlobalVar): Promise<GlobalVar> {
    if (isEmpty(global_var.value)) {
      throw `Default value not provided for global variable ${global_var.key}`;
    } else {
      if (global_var.type === 'number') {
        global_var.value = Number(global_var.value);
      } else if (global_var.type === 'string') {
        global_var.value = global_var.value + '';
      } else if (global_var.type === 'boolean') {
        global_var.value = global_var.value.toLowerCase() === 'true';
      } else if (global_var.type === 'json') {
        try {
          global_var.value = JSON.parse(global_var.value);
        } catch (error) {
          logger.error(
            `Error parsing JSON in Global_Var:${global_var.key}`,
            error
          );
        }
      } else if (global_var.type === 'file') {
        try {
          const value = JSON.parse(global_var.value);
          const file_object: FileObject = {
            name: value.name,
            path: value.path,
            bucket: value.bucket,
          };
          const result = await generateDownloadFileURL(file_object);
          global_var.value = result?.url;
        } catch (error) {
          logger.error(
            `Error parsing JSON in Global_Var:${global_var.key}`,
            error
          );
        }
      }
      return global_var;
    }
  }

  static OTP_TTL_SECONDS = {
    get: async (): Promise<number> => await cache.get('OTP_TTL_SECONDS'),
  };

  static SERVICEABILITY_RADIUS_IN_METRES = {
    get: async (): Promise<number> =>
      await cache.get('SERVICEABILITY_RADIUS_IN_METRES'),
  };
  static CASHFREE_PAYOUT_MIN_BALANCE = {
    get: async (): Promise<number> =>
      await cache.get('CASHFREE_PAYOUT_MIN_BALANCE'),
  };
  static PAYMENT_GATEWAY = {
    get: async (): Promise<string> => await cache.get('PAYMENT_GATEWAY'),
  };
  static DELIVERY_SERVICE = {
    get: async (): Promise<string> => await cache.get('DELIVERY_SERVICE'),
  };
  //* cart envs
  static CART_MAX_TOTAL_QUANTITY = {
    get: async (): Promise<number> =>
      await cache.get('CART_MAX_TOTAL_QUANTITY'),
  };

  //* order envs

  static ORDER_CANCELLATION_DURATION_IN_SECONDS = {
    get: async (): Promise<number> =>
      await cache.get('ORDER_CANCELLATION_DURATION_IN_SECONDS'),
  };
  static ORDER_CANCELLATION_DELAY_IN_SECONDS = {
    get: async (): Promise<number> =>
      await cache.get('ORDER_CANCELLATION_DELAY_IN_SECONDS'),
  };
  static ORDER_ACCEPT_DURATION_IN_SECONDS = {
    get: async (): Promise<number> =>
      await cache.get('ORDER_ACCEPT_DURATION_IN_SECONDS'),
  };
  static ORDER_REATTEMPT_DURATION_IN_SECONDS = {
    get: async (): Promise<number> =>
      await cache.get('ORDER_REATTEMPT_DURATION_IN_SECONDS'),
  };
  static ORDER_VENDOR_RETRY_ATTEMPTS = {
    get: async (): Promise<number> =>
      await cache.get('ORDER_VENDOR_RETRY_ATTEMPTS'),
  };

  static CUSTOMER_COST_FOR_TWO_OPTIONS = {
    get: async (): Promise<string> =>
      await cache.get('CUSTOMER_COST_FOR_TWO_OPTIONS'),
  };

  static ITEM_PACKAGING_CHARGES_SLAB = {
    get: async (): Promise<string> =>
      await cache.get('ITEM_PACKAGING_CHARGES_SLAB'),
  };

  //* email envs

  static SUPER_ADMIN_EMAIL = {
    get: async (): Promise<string> => await cache.get('SUPER_ADMIN_EMAIL'),
  };
  static CATALOG_TEAM_EMAIL = {
    get: async (): Promise<string> => await cache.get('CATALOG_TEAM_EMAIL'),
  };
  static BACKEND_TEAM_EMAIL = {
    get: async (): Promise<string> => await cache.get('BACKEND_TEAM_EMAIL'),
  };
  static ORDER_NOT_ACCEPT_ADMIN_EMAIL = {
    get: async (): Promise<string> =>
      await cache.get('ORDER_NOT_ACCEPT_ADMIN_EMAIL'),
  };
  static PAYOUT_REPORT_ADMIN_EMAIL = {
    get: async (): Promise<string> =>
      await cache.get('PAYOUT_REPORT_ADMIN_EMAIL'),
  };
  static SUPPORT_CONTACT = {
    get: async (): Promise<string> => await cache.get('SUPPORT_CONTACT'),
  };

  static SUPPORT_EMAIL = {
    get: async (): Promise<string> => await cache.get('SUPPORT_EMAIL'),
  };

  //* subscription envs

  static SUBSCRIPTION_AUTHORIZATION_AMOUNT_IN_RUPEES = {
    get: async (): Promise<number> =>
      await cache.get('SUBSCRIPTION_AUTHORIZATION_AMOUNT_IN_RUPEES'),
  };
  static SUBSCRIPTION_RETURN_URL = {
    get: async (): Promise<string> =>
      await cache.get('SUBSCRIPTION_RETURN_URL'),
  };
  static SUBSCRIPTION_EXPIRY_INTERVAL_IN_MONTHS = {
    get: async (): Promise<number> =>
      await cache.get('SUBSCRIPTION_EXPIRY_INTERVAL_IN_MONTHS'),
  };
  static SUBSCRIPTION_FIRST_PAYMENT_DATE_INTERVAL_IN_DAYS = {
    get: async (): Promise<number> =>
      await cache.get('SUBSCRIPTION_FIRST_PAYMENT_DATE_INTERVAL_IN_DAYS'),
  };
  static SUBSCRIPTION_END_TIME_GRACE_PERIOD_IN_DAYS = {
    get: async (): Promise<number> =>
      await cache.get('SUBSCRIPTION_END_TIME_GRACE_PERIOD_IN_DAYS'),
  };
  static SUBSCRIPTION_VERFIY_NEW_PAYMENT_AFTER_SECONDS = {
    get: async (): Promise<number> =>
      await cache.get('SUBSCRIPTION_VERFIY_NEW_PAYMENT_AFTER_SECONDS'),
  };
  static SUBSCRIPTION_VERFIY_NEW_PAYMENT_MAX_ATTEMPTS = {
    get: async (): Promise<number> =>
      await cache.get('SUBSCRIPTION_VERFIY_NEW_PAYMENT_MAX_ATTEMPTS'),
  };
  static NOTIFY_SUBSCRIBERS_BEFORE_DAYS = {
    get: async (): Promise<number> =>
      await cache.get('NOTIFY_SUBSCRIBERS_BEFORE_DAYS'),
  };

  static CUSTOMER_CANCELLATION_POLICY = {
    get: async (): Promise<ICartResponse['cancellation_policy']> =>
      await cache.get('CUSTOMER_CANCELLATION_POLICY'),
  };
  static VENDOR_CANCELLATION_POLICY = {
    get: async (): Promise<ICartResponse['cancellation_policy']> =>
      await cache.get('VENDOR_CANCELLATION_POLICY'),
  };

  static DUMMY_MENU_ITEM_IMAGE = {
    get: async (): Promise<string> => await cache.get('DUMMY_MENU_ITEM_IMAGE'),
  };

  static NOTA_MC_DISPLAY_NAME = {
    get: async (): Promise<string> => await cache.get('NOTA_MC_DISPLAY_NAME'),
  };

  static NOTA_VG_DISPLAY_NAME = {
    get: async (): Promise<string> => await cache.get('NOTA_VG_DISPLAY_NAME'),
  };

  // notification sound
  static ORDER_PLACED_NOTIFICATION_SOUND = {
    get: async (): Promise<string> =>
      await cache.get('ORDER_PLACED_NOTIFICATION_SOUND'),
  };

  static NEW_ORDER_NOTIFICATION_SOUND = {
    get: async (): Promise<string> =>
      await cache.get('NEW_ORDER_NOTIFICATION_SOUND'),
  };

  static VENDOR_ORDER_ACCEPT_NOTIFICATION_SOUND = {
    get: async (): Promise<string> =>
      await cache.get('VENDOR_ORDER_ACCEPT_NOTIFICATION_SOUND'),
  };

  static ORDER_COMPLETE_NOTIFICATION_SOUND = {
    get: async (): Promise<string> =>
      await cache.get('ORDER_COMPLETE_NOTIFICATION_SOUND'),
  };

  static VENDOR_ORDER_READY_NOTIFICATION_SOUND = {
    get: async (): Promise<string> =>
      await cache.get('VENDOR_ORDER_READY_NOTIFICATION_SOUND'),
  };

  static CUSTOMER_REFUND_INITIATED_NOTIFICATION_SOUND = {
    get: async (): Promise<string> =>
      await cache.get('CUSTOMER_REFUND_INITIATED_NOTIFICATION_SOUND'),
  };

  static COUPON_DISPLAY_IMAGE = {
    get: async (): Promise<string> => await cache.get('COUPON_DISPLAY_IMAGE'),
  };

  static CUSTOMER_REFUND_SUCCESSFUL_NOTIFICATION_SOUND = {
    get: async (): Promise<string> =>
      await cache.get('CUSTOMER_REFUND_SUCCESSFUL_NOTIFICATION_SOUND'),
  };

  static HIDE_PENDING_ORDERS_DURATION_IN_MINS = {
    get: async (): Promise<number> =>
      await cache.get('HIDE_PENDING_ORDERS_DURATION_IN_MINS'),
  };

  static DEFAULT_PAGE_SIZE_RESTAURANT = {
    get: async (): Promise<number> =>
      await cache.get('DEFAULT_PAGE_SIZE_RESTAURANT'),
  };

  static RESTAURANT_SLOT_WORKER_INTERVAL = {
    get: async (): Promise<number> =>
      await cache.get('RESTAURANT_SLOT_WORKER_INTERVAL'),
  };

  static REFUND_NOTE_FOR_CUSTOMER = {
    get: async (): Promise<string> =>
      await cache.get('REFUND_NOTE_FOR_CUSTOMER'),
  };

  static POPULAR_CUISINE_IDS = {
    get: async (): Promise<Array<string>> =>
      await cache.get('POPULAR_CUISINE_IDS'),
  };

  static CUISINE_DEFAULT_IMAGE = {
    get: async (): Promise<string> => await cache.get('CUISINE_DEFAULT_IMAGE'),
  };
  static NEAR_BY_LOCATION_RADIUS_IN_METRES = {
    get: async (): Promise<number> =>
      await cache.get('NEAR_BY_LOCATION_RADIUS_IN_METRES'),
  };

  static LOCATION_CHANGE_ALERT_MESSAGE = {
    get: async (): Promise<string> =>
      await cache.get('LOCATION_CHANGE_ALERT_MESSAGE'),
  };
}

export default Globals;
