import {SortOrder} from '../../../enum';
import {ICoordinate} from '../../../types';
import {FileObject} from '../../../utilities/s3_manager';
import {OrderByColumn, RestaurantSortBy} from './enums';
import {IPagination} from './models';

export interface IOrderBy {
  column: OrderByColumn;
  order: SortOrder;
}
export interface IReviewFilter {
  filter?: {
    vote_type?: 1 | -1 | 0;
  };
  pagination?: IPagination;
  sort?: IOrderBy[];
}

export interface IReviewFilterAsAdmin {
  restaurant_ids: string[];
  filter?: {
    vote_type?: 1 | -1 | 0;
  };
  pagination?: IPagination;
  sort?: IOrderBy[];
}

export interface IFilterRestaurants {
  filter?: {
    sort_by?: RestaurantSortBy;
    sort_direction?: SortOrder;
    cuisine_ids?: string[];
    cost_lt?: number;
    cost_gt?: number;
  };
  coordinates: {
    lat: number;
    long: number;
  };
  pagination?: {
    page_index: number;
    page_size: number;
  };
}

export interface IUpdateRestaurantAsAdmin {
  id: string;
  name?: string;
  branch_name?: string;
  image?: FileObject;
  images?: FileObject[];
  default_preparation_time?: number;
  delivery_charge_paid_by?: 'customer' | 'restaurant' | 'speedyy';
  lat?: number;
  long?: number;
  area_id?: string;
  city_id?: string;
  location?: string;
  postal_code?: string;
  state?: string;
  poc_number: string;
  speedyy_account_manager_id: string;
}

export interface IRestaurantAvailability {
  is_holiday: boolean;
  is_open: boolean;
  closing_at?: Date;
  next_opens_at?: Date;
  created_by?: 'admin' | 'vendor';
  created_by_id?: string;
}

export interface IRestaurantDeliveryDetails {
  id: string;
  delivery_time_in_seconds: number;
  delivery_distance_in_meters: number;
  delivery_time_string: string;
  delivery_distance_string: string;
}

export interface IRestaurantGetDeliveryDetails {
  id: string;
  default_preparation_time: number;
  coordinates: ICoordinate;
}
