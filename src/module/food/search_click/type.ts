export interface ISearchClick {
  id: number;
  restaurant_id: string;
  customer_id: string;
  count: number;
  created_at: Date;
}

export interface ICreateSearchClickRecord {
  restaurant_id: string;
  customer_id: string;
}

export interface ISaveSearchClickRecord {
  restaurant_id: string;
  customer_id: string;
  city_id: string;
}
