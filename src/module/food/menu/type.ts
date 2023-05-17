import {ICouponText} from '../coupons/types';
import {IAddon} from './addon/models';
import {IMainCategory} from './main_category/models';
import {IMenuItem} from './models';
import {ISubCategory} from './sub_category/models';
import {IVariant} from './variant/models';

export interface IRestaurantMenu {
  restaurant_id: string;
  city_id: string;
  discount_rate: number;
  offers: ICouponText[];
  main_category: {
    main_category_id: IMainCategory['id'];
    main_category_name: IMainCategory['name'];
    discount_rate: ISubCategory['discount_rate'];
    sub_category: {
      sub_category_id: ISubCategory['id'];
      sub_category_name: ISubCategory['name'];
      menu_item: {
        menu_item_id: number;
        menu_item_name: string;
        sub_category_id: number;
        description: string;
        price: number;
        veg_egg_non: string;
        packing_charges: number;
        is_spicy: boolean;
        serves_how_many: number;
        service_charges: number;
        item_sgst_utgst: number;
        item_cgst: number;
        item_igst: number;
        item_inclusive: boolean;
        disable: boolean;
        image: object;
        external_id: string;
        allow_long_distance: boolean;
        next_available_after: Date;
        variant_groups: {
          variant_group_id: number;
          variant_group_name: string;
          variants: IVariant[];
        }[];
        addon_groups: {
          addon_group_id: number;
          addon_group_name: string;
          addons: IAddon[];
        }[];
        discount_rate: IMenuItem['discount_rate'];
      }[];
      discount_rate: ISubCategory['discount_rate'];
    }[];
  }[];
}
