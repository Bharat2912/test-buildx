import {DeliveryService} from '../../../enum';
import {IError} from '../../../types';
import {ICouponMappingCustomer} from '../coupons/types';
import {IAddon} from '../menu/addon/models';
import {IItem_AddonGroup} from '../menu/item_addon_group/models';
import {IMenuItem} from '../menu/models';
import {IVariant} from '../menu/variant/models';
import {IVariantGroup} from '../menu/variant_group/models';
import {ICouponDetailCost, IInvoiceBreakout} from '../order/invoice';
import {IRestaurant} from '../restaurant/models';

export interface IGetCart {
  customer_id: string;
}
export interface ICusomerDeliverableAddress extends ICustomerAddress {
  delivery_details: IDeliverabilityResponse;
  customer_name?: string;
  phone?: string;
  email?: string;
  alternate_phone?: string;
}

export interface IDeliverabilityResponse {
  delivery_service?: DeliveryService;
  pickup_eta?: number;
  drop_eta?: number;
  deliverable?: boolean;
  delivery_cost?: number;
  reason?: string;
  message?: string;
  pod_allowed?: boolean;
  pod_not_allowed_reason?: string;
}
export interface ICustomerDetails {
  customer_id?: string;
  customer_device_id?: string;
  customer_address_id?: string;
  customer_addresses?: ICusomerDeliverableAddress[];
  delivery_address?: ICusomerDeliverableAddress;
}

export interface IRestaurantDetails {
  restaurant_id?: string;
  restaurant_name?: string;
  restaurant_status?: string;
  like_count?: number;
  like_count_label?: string;
  is_open?: boolean;
  next_opens_at?: number;
  latitude?: number;
  longitude?: number;
  default_preparation_time?: number;
}

export interface ICartResponse {
  cart_id?: string;
  cart_status?: boolean;

  cart_meta_errors?: IError[];
  customer_details?: ICustomerDetails;

  any_special_request?: string;
  last_updated_at?: string;

  restaurant_details?: IRestaurantDetails;

  menu_items?: ICartMenuITem[];
  menu_items_available?: boolean;

  delivery_time?: number;
  invoice_breakout?: IInvoiceBreakout;
  coupon_code?: string;
  coupon_id?: number;
  coupoun_valid?: boolean;
  delivery_service?: DeliveryService;
  is_pod?: boolean;
  pod_allowed?: boolean;
  pod_not_allowed_reason?: string;

  cancellation_policy?: {
    terms_conditions: string;
    note: string;
  };
}

export interface IPutCart {
  customer_id: string;
  customer_device_id?: string;
  customer_address_id?: string;
  action: string;
  restaurant_id?: string;
  menu_items?: IPutCartMenuItem[];
  any_special_request?: string;
  coupon_code?: string;
  coupon_id?: number;
  authorizationToken?: string;
}

export interface ICartAddon extends IAddon {
  addon_id?: number;
  addon_name?: string;
  is_selected?: boolean;
  pos_addon_id?: string;
  pos_addon_group_id?: string;
}

export interface ICartVariant extends IVariant {
  variant_id?: number;
  variant_name?: string;
  pos_variant_id?: string | null;
  pos_variant_group_id?: string | null;
  is_selected?: boolean;
}

export interface ICartMenuITem extends IMenuItem {
  menu_item_id: number;
  menu_item_name: string;
  variant_groups?: ICartVariantGroup[];
  addon_groups?: ICartAddonGroup[];
  variants_total_cost_without_tax: number;
  variants_instock: boolean;
  variants_count: number;
  quantity: number;
  addons_total_cost_without_tax: number;
  addons_total_tax: number;
  addons_instock: boolean;
  addons_count: number;
  total_tax: number;
  total_cost_without_tax: number;
  sequence: number;
  display_price: number;
  menu_item_discount_rate: number;
  sub_category_discount_rate: number;
  main_category_discount_rate: number;
}

export interface IPutCartMenuItem {
  quantity: number;
  menu_item_id: number;
  variant_groups?: IMenuItemVariantGroup[];
  addon_groups?: IMenuItemAddonGroup[];
}
export interface IMenuItemVariantGroup {
  variant_group_id: number;
  variant_id: number;
}
export interface IMenuItemAddonGroup {
  addon_group_id: number;
  addons: number[];
}

export interface ICartAddonGroup extends IItem_AddonGroup {
  addon_group_name: string;
  is_selected?: boolean;
  addons: ICartAddon[];
}

export interface ICartVariantGroup extends IVariantGroup {
  variant_group_id: number;
  variant_group_name: string;
  is_selected?: boolean;
  variants: ICartVariant[];
}

export interface ICustomerAddress {
  id: string;
  phone?: string;
  customer_id: string;
  name: string;
  house_flat_block_no: string;
  apartment_road_area: string;
  pincode: string;
  directions?: string;
  landmark?: string;
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  country: string;
  created_at?: string;
  updated_at?: string;
  is_deleted?: boolean;
  deliverable?: boolean;
}

export interface IAddressServiceabilityResponse {
  customer_addresses: ICustomerAddress[] | null;
  delivery_address: ICusomerDeliverableAddress | null;
  serviceability_validation_errors?: IError[];
}

export interface ICouponValidationResponse {
  coupon_details: ICouponMappingCustomer | null;
  coupon_detail_cost: ICouponDetailCost | null;
  coupon_validation_errors?: IError[];
}

export interface IRestaurantValidationResponse {
  restaurant: IRestaurant;
  restaurant_validation_errors?: IError[];
}

export interface ILatAndLong {
  latitude: number;
  longitude: number;
}
