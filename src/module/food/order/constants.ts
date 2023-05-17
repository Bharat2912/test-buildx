export class OrderTable {
  static readonly TableName = 'order';
  static readonly ColumnNames = {
    id: 'id',
    restaurant_id: 'restaurant_id',
    customer_id: 'customer_id',
    customer_device_id: 'customer_device_id',
    customer_address: 'customer_address',
    delivery_time: 'delivery_time',
    delivery_status: 'delivery_status',
    delivery_charges: 'delivery_charges',
    delivery_tip: 'delivery_tip',
    order_status: 'order_status',
    order_acceptance_status: 'order_acceptance_status',
    total_customer_payable: 'total_customer_payable',
    total_tax: 'total_tax',
    packing_charges: 'packing_charges',
    offer_discount: 'offer_discount',
    coupon_id: 'coupon_id',
    vote_type: 'vote_type',
    any_special_request: 'any_special_request',
    cancelled_by: 'cancelled_by',
    cancellation_details: 'cancellation_details',
    cancellation_time: 'cancellation_time',
    cancellation_user_id: 'cancellation_user_id',
    created_at: 'created_at',
    updated_at: 'updated_at',
    delivery_order_id: 'delivery_order_id',
    pickup_eta: 'pickup_eta',
    drop_eta: 'drop_eta',
    order_placed_time: 'order_placed_time',
    vendor_accepted_time: 'vendor_accepted_time',
    accepted_vendor_id: 'accepted_vendor_id',
    preparation_time: 'preparation_time',
    vendor_ready_marked_time: 'vendor_ready_marked_time',
    payout_transaction_id: 'payout_transaction_id',
    transaction_charges: 'transaction_charges',
    // refundable_amount: 'refundable_amount',
    vendor_payout_amount: 'vendor_payout_amount',
    invoice_breakout: 'vendor_payout_amount',
    refund_status: 'refund_status',
    additional_details: 'additional_details',
    pos_id: 'pos_id',
    pos_partner: 'pos_partner',
  };
}

export class OrderItemTable {
  static readonly TableName = 'order_item';
  static readonly ColumnNames = {
    id: 'id',
    order_id: 'order_id',
    meni_item_id: 'menu_item_id',
    quantity: 'quantity',
    restaurant_id: 'restaurant_id',
    name: 'name',
    description: 'description',
    sub_category_id: 'sub_category_id',
    price: 'price',
    veg_egg_non: 'veg_egg_non',
    packing_charges: 'packing_charges',
    is_spicy: 'is_spicy',
    serves_how_many: 'serves_how_many',
    service_charges: 'service_charges',
    item_sgst_utgst: 'item_sgst_utgst',
    item_cgst: 'item_cgst',
    item_igst: 'item_igst',
    item_inclusive: 'item_inclusive',
    external_id: 'external_id',
    allow_long_distance: 'allow_long_distance',
    image: 'image',
    pos_id: 'pos_id',
  };
}

export class OrderVariantTable {
  static readonly TableName = 'order_variant';
  static readonly ColumnNames = {
    order_id: 'order_id',
    order_item_id: 'order_item_id',
    variant_group_id: 'variant_group_id',
    variant_group_name: 'variant_group_name',
    variant_id: 'variant_id',
    variant_name: 'variant_name',
    is_default: 'is_default',
    serves_how_many: 'serves_how_many',
    price: 'price',
    veg_egg_non: 'veg_egg_non',
    created_at: 'created_at',
    updated_at: 'updated_at',
    pos_variant_id: 'pos_variant_id',
    pos_variant_item_id: 'pos_variant_item_id',
    pos_variant_group_id: 'pos_variant_group_id',
  };
}

export class OrderAddonTable {
  static readonly TableName = 'order_addon';
  static readonly ColumnNames = {
    order_id: 'order_id',
    order_item_id: 'order_item_id',
    addon_name: 'addon_name',
    addon_id: 'addon_id',
    addon_group_name: 'addon_group_name',
    addon_group_id: 'addon_group_id',
    sequence: 'sequence',
    price: 'price',
    veg_egg_non: 'veg_egg_non',
    sgst_rate: 'sgst_rate',
    cgst_rate: 'cgst_rate',
    igst_rate: 'igst_rate',
    gst_inclusive: 'gst_inclusive',
    external_id: 'external_id',
    created_at: 'created_at',
    updated_at: 'updated_at',
    pos_addon_id: 'pos_addon_id',
    pos_addon_group_id: 'pos_addon_group_id',
  };
}

export class PaymentTable {
  static readonly TableName = 'payment';
  static readonly ColumnNames = {
    id: 'id',
    order_id: 'order_id',
    customer_id: 'customer_id',
    transaction_id: 'transaction_id',
    transaction_token: 'transaction_token',
    payment_status: 'payment_status',
    payment_method: 'payment_method',
    payment_gateway: 'payment_gateway',
    additional_details: 'additional_details',
    amount: 'amount', //  amount paid by customer
    created_at: 'created_at',
    updated_at: 'updated_at',
  };
}

export class CancellationReasonTable {
  static readonly TableName = 'cancellation_reason';
  static readonly ColumnNames = {
    id: 'id',
    user_type: 'user_type',
    cancellation_reason: 'cancellation_reason',
    created_at: 'created_at',
    updated_at: 'updated_at',
    is_deleted: 'is_deleted',
  };
}
