import {SearchType} from './enum';

//!DEPRECATED
export interface ISearchRestaurant {
  searchText?: string;
  coordinates: {
    lat: number;
    long: number;
  };
  pagination?: {
    page_index: number;
    page_size: number;
  };
}

export interface ISearch {
  type: SearchType;
  search_text: string;
  coordinates: {
    lat: number;
    long: number;
  };
  pagination?: {
    page_index: number;
    page_size: number;
  };
}
