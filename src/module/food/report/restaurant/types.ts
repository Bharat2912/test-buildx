export interface IVendorSales {
  total_orders_count: number;
  vendor_sales_amount: number;
  orders_with_likes: number;
  orders_with_dislikes: number;
  average_orders_rating: number; //! BACKWARD_COMPATIBLE
  start_time: number;
  end_time: number;
  orders_cancelled_by_customer_count: number;
  orders_cancelled_by_vendor_count: number;
  orders_cancelled_by_delivery_partner_count: number;
}
export interface ICalculateVendorSales {
  sales_report_with_duration: IVendorSales[];
  total_vendor_sales_amount: number;
}
