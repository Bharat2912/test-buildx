import {
  CouponCreatedBy,
  CouponLevel,
  CouponType,
  CouponVendorMappingTimeLine,
  DiscountSponseredBy,
} from './enum';

export interface ICoupon {
  id: number;
  code: string;
  header: string;
  description: string;
  terms_and_conditions: string;
  type: CouponType;
  discount_percentage: number;
  discount_amount_rupees: number;
  start_time: Date | number;
  end_time: Date | number;
  level: CouponLevel;
  max_use_count: number;
  coupon_use_interval_minutes: number;
  min_order_value_rupees: number;
  max_discount_rupees: number;
  discount_share_percent: number;
  discount_sponsered_by: string;
  created_by: CouponCreatedBy;
  created_by_user_id: string;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
  created_by_name?: string;
}

export interface ICouponText {
  type: string;
  image_url: string;
  title: string;
  text1: string;
  text2: string;
}
export interface IRestaurantMaxDiscount {
  max_restaurant_discount: number;
  max_main_category_discount: number;
  max_sub_category_discount: number;
  max_menu_item_discount: number;
  discount_level: string;
  max_discount: number;
}

export interface ICouponVendor {
  id?: number;
  coupon_id?: number;
  start_time?: Date;
  end_time?: Date;
  restaurant_id?: string;
  mapped_by?: string;
  mapped_by_user_id?: string;
  is_deleted?: boolean;
  created_at?: Date;
  updated_at?: Date;
  sequence?: number;
}

export interface ICouponCustomer {
  id?: number;
  customer_id?: string;
  coupon_id?: number;
  last_time_used?: Date;
  coupon_use_count?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface IRestaurantOptinDetailsAdmin {
  coupon_id: number;
  restaurant_ids: string[];
  mapping_duration: {
    start_time: number | Date;
    end_time: number | Date;
  };
}

export interface IRestaurantOptoutDetailsAdmin {
  coupon_mapping_ids: number[];
}

export interface IRestaurantOptoutDetailsVendor {
  coupon_mapping_ids: number[];
  restaurant_id: string;
}

export interface IRestaurantOptinDetailsVendor {
  coupon_id: number;
  restaurant_id: string;
  mapping_duration: {
    start_time?: number | Date;
    end_time?: number | Date;
  };
}

export interface ICouponVendorSequence {
  id: number;
  sequence: number;
}

export interface IValidateMappingDetails {
  coupon: ICoupon;
  restaurant_ids: string[];
  mapping_duration: {
    start_time?: number | Date;
    end_time?: number | Date;
  };
  mapped_by?: string;
  mapped_by_user_id?: string;
}

export interface IPagination {
  page_index: number;
  page_size: number;
}
export interface IFilterCouponByAdmin {
  search_text?: string;
  filter?: {
    restaurant_id?: string;
    vendor_ids?: string[];
    type?: CouponType;
    level?: CouponLevel;
    max_use_count?: number;
    discount_sponsered_by?: DiscountSponseredBy;
    created_by?: CouponCreatedBy;
    duration?: {
      start_date: number;
      end_date: number;
    };
  };
  pagination?: IPagination;
}

export interface IFilterCouponByVendor {
  search_text?: string;
  filter?: {
    vendor_ids?: string[];
    type?: CouponType;
    max_use_count?: number;
    duration?: {
      start_date: number;
      end_date: number;
    };
  };
  pagination?: IPagination;
}

export interface IFilterCouponVendorByAdmin {
  search_text?: string;
  filter?: {
    coupon_id?: number;
    restaurant_id?: string;
    mapped_by?: CouponCreatedBy;
    timeline?: CouponVendorMappingTimeLine[];
    duration?: {
      start_date: number;
      end_date: number;
    };
  };
  pagination?: IPagination;
}

export interface IFilterCouponVendorByVendor {
  search_text?: string;
  filter?: {
    coupon_id?: number;
    restaurant_id?: string;
    duration?: {
      start_date: number;
      end_date: number;
    };
  };
  pagination?: IPagination;
}

export interface ICouponAndMapping extends ICoupon {
  mapping_details: ICouponVendor[];
}

export interface ICouponVendorAndCoupon extends ICouponVendor {
  coupon_details: ICoupon;
}

export interface ICouponMappingCustomer extends ICoupon {
  mapping_details: ICouponVendor;
  coupon_customer_details: ICouponCustomer;
}

export interface IValidateCoupon {
  customer_id: string;
  restaurant_id: string;
  total_food_and_taxes: number;
  coupon_id?: number;
  coupon_code?: string;
}
