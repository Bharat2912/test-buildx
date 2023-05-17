export class CouponTable {
  static readonly TableName = 'coupon';
  static readonly ColumnNames = {
    id: 'id',
    code: 'code',
    header: 'header',
    description: 'description',
    terms_and_conditions: 'terms_and_conditions',
    type: 'type',
    discount_percentage: 'discount_percentage',
    discount_amount_rupees: 'discount_amount_rupees',
    start_time: 'start_time',
    end_time: 'end_time',
    level: 'level',
    max_use_count: 'max_use_count',
    coupon_use_interval_minutes: 'coupon_use_interval_minutes',
    min_order_value_rupees: 'min_order_value_rupees',
    max_discount_rupees: 'max_discount_rupees',
    discount_share_percent: 'vendor_discount_share',
    discount_sponsered_by: 'discount_sponsered_by',
    created_by: 'created_by',
    created_by_user_id: 'created_by_user_id',
    is_deleted: 'is_deleted',
    created_at: 'created_at',
    updated_at: 'updated_at',
  };
}
export class CouponVendorTable {
  static readonly TableName = 'coupon_vendor';
  static readonly ColumnNames = {
    id: 'id',
    coupon_id: 'coupon_id',
    start_time: 'start_time',
    end_time: 'end_time',
    restaurant_id: 'restaurant_id',
    mapped_by: 'mapped_by',
    mapped_by_user_id: 'mapped_by_user_id',
    is_deleted: 'is_deleted',
    created_at: 'created_at',
    updated_at: 'updated_at',
    sequence: 'sequence',
  };
}

export class CouponCustomerTable {
  static readonly TableName = 'coupon_customer';
  static readonly ColumnNames = {
    id: 'id',
    customer_id: 'customer_id',
    coupon_id: 'coupon_id',
    last_time_used: 'last_time_used',
    coupon_use_count: 'coupon_use_count',
    created_at: 'created_at',
    updated_at: 'updated_at',
  };
}
