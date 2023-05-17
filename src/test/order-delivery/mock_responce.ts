import {DeliveryService} from '../../enum';
import {IPlaceOrderSuccessResponse} from '../../internal/types';
import {CouponLevel, CouponType} from '../../module/food/coupons/enum';

export const cart_api_response = {
  cart_status: true,
  last_updated_at: '2022-09-30T05:42:55.341Z',
  any_special_request: 'Dont ring door bell',
  coupon_code: '20%OFF-COUPON',
  coupon_id: 20,
  customer_details: {
    customer_id: '33c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
    customer_device_id: '12412423432424413213123',
    customer_address_id: 'bd7e895f-0f7d-4dbe-9408-285abf5986ce',
    customer_addresses: [
      {
        apartment_road_area: 'apartment_road_area.',
        city: 'Mumbai',
        country: 'India',
        created_at: '2022-02-24T06:25:22.096Z',
        customer_id: '33c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
        directions: 'ABC',
        house_flat_block_no: 'HouseNumber,Wing,Block Number,',
        id: 'bd7e895f-0f7d-4dbe-9408-285abf5986ce',
        deliverable: true,
        latitude: '1.098889',
        longitude: '2.0089002',
        name: 'Mohit',
        pincode: '0',
        state: 'Maharashtra',
        updated_at: '2022-02-24T06:25:22.096Z',
        delivery_details: {
          pickup_eta: 1,
          drop_eta: 35,
          deliverable: true,
          delivery_cost: 59,
        },
      },
    ],
    delivery_address: {
      apartment_road_area: 'apartment_road_area.',
      city: 'Mumbai',
      country: 'India',
      created_at: '2022-02-24T06:25:22.096Z',
      customer_id: '33c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
      directions: 'ABC',
      house_flat_block_no: 'HouseNumber,Wing,Block Number,',
      id: 'bd7e895f-0f7d-4dbe-9408-285abf5986ce',
      deliverable: true,
      latitude: '1.098889',
      longitude: '2.0089002',
      name: 'Mohit',
      pincode: '0',
      state: 'Maharashtra',
      updated_at: '2022-02-24T06:25:22.096Z',
      delivery_details: {
        pickup_eta: 1,
        drop_eta: 35,
        deliverable: true,
        delivery_cost: 59,
      },
    },
  },
  menu_items_available: true,
  menu_items: [
    {
      menu_item_id: 11101,
      restaurant_id: 'b0909e52-a731-4665-a791-ee6479008805',
      menu_item_name: 'Veg Burger',
      sub_category_id: 11,
      description: 'description',
      price: 100,
      veg_egg_non: 'veg',
      packing_charges: 0,
      is_spicy: true,
      serves_how_many: 1,
      service_charges: 10,
      item_sgst_utgst: 0,
      item_cgst: 0,
      item_igst: 0,
      item_inclusive: true,
      disable: false,
      image: {},
      external_id: '123',
      allow_long_distance: true,
      next_available_after: new Date('2022-04-27T04:54:01.883Z'),
      is_deleted: false,
      variant_groups: [
        {
          variant_group_id: 98,
          variant_group_name: 'menu item 1 variant 1',
          variants: [
            {
              variant_id: 998,
              variant_group_id: 98,
              variant_name: 'variant group 1 variant name',
              is_default: true,
              price: 10,
              veg_egg_non: 'veg',
              in_stock: true,
              serves_how_many: 1,
              is_selected: true,
            },
          ],
          is_selected: true,
        },
        {
          variant_group_id: 99,
          variant_group_name: 'menu item 1 variant 2',
          variants: [
            {
              variant_id: 999,
              variant_group_id: 99,
              variant_name: 'variant group 1 variant name',
              is_default: true,
              price: 10,
              veg_egg_non: 'veg',
              in_stock: true,
              serves_how_many: 1,
              is_selected: true,
            },
          ],
          is_selected: true,
        },
      ],
      addon_groups: [
        {
          addon_group_id: 77,
          addon_group_name: 'addon group name',
          min_limit: 2,
          max_limit: 3,
          free_limit: 1,
          sequence: 1,
          addons: [
            {
              addon_id: 7767,
              addon_name: 'addon name 1',
              sequence: 1,
              price: 12,
              veg_egg_non: 'veg',
              in_stock: true,
              sgst_rate: 0,
              cgst_rate: 0,
              igst_rate: 0,
              gst_inclusive: true,
              external_id: '76777',
              is_selected: true,
            },
            {
              addon_id: 7768,
              addon_name: 'addon name 2',
              sequence: 1,
              price: 10,
              veg_egg_non: 'veg',
              in_stock: true,
              sgst_rate: 0,
              cgst_rate: 0,
              igst_rate: 0,
              gst_inclusive: true,
              external_id: '76778',
              is_selected: true,
            },
            {
              addon_id: 7769,
              addon_name: 'addon name 3',
              sequence: 1,
              price: 10,
              veg_egg_non: 'veg',
              in_stock: true,
              sgst_rate: 0,
              cgst_rate: 0,
              igst_rate: 0,
              gst_inclusive: true,
              external_id: '76779',
              is_selected: false,
            },
          ],
          is_selected: true,
        },
      ],
      menu_item_slots: null,
      quantity: 1,
      variants_total_cost_without_tax: 20,
      variants_instock: true,
      variants_count: 2,
      addons_total_cost_without_tax: 22,
      addons_total_tax: 0,
      addons_instock: true,
      addons_count: 2,
      total_tax: 0,
      total_cost_without_tax: 152,
      in_stock: true,
    },
  ],
  menu_items_count: 1,
  delivery_time: 35,
  restaurant_details: {
    restaurant_id: 'b0909e52-a731-4665-a791-ee6479008805',
    restaurant_name: 'Food',
    restaurant_status: 'active',
    like_count: 0,
    like_count_label: '0',
    rating: 0, //!BACKWARD_COMPATIBLE
    availability: {
      is_holiday: false,
      is_open: true,
    },
    latitude: 1.098889,
    longitude: 2.0089002,
  },
  invoice_breakout: {
    menu_items: [
      {
        item_name: 'Veg Burger',
        item_quantity: 1,
        item_cgst: 0,
        item_sgst: 0,
        item_igst: 0,
        item_price: 100,
        total_item_amount: 120,
        item_tax_amount: 0,
        item_packing_charges: 0,
        addon_groups: [
          {
            addon_group_id: 77,
            addon_group_name: 'addon group name',
            addons: [
              {
                addon_id: 7767,
                addon_name: 'addon name 1',
                addon_cgst: 0,
                addon_sgst: 0,
                addon_igst: 0,
                addon_price: 12,
                addon_tax_amount: 0,
              },
              {
                addon_id: 7768,
                addon_name: 'addon name 2',
                addon_cgst: 0,
                addon_sgst: 0,
                addon_igst: 0,
                addon_price: 10,
                addon_tax_amount: 0,
              },
            ],
            free_limit: 1,
            total_addon_price: 22,
            total_addon_tax_amount: 0,
          },
        ],
        variants: [
          {
            variant_group_id: 98,
            variant_group_name: 'menu item 1 variant 1',
            variant_id: 998,
            variant_name: 'variant group 1 variant name',
            variant_price: 10,
          },
          {
            variant_group_id: 99,
            variant_group_name: 'menu item 1 variant 2',
            variant_id: 999,
            variant_name: 'variant group 1 variant name',
            variant_price: 10,
          },
        ],
        total_variant_cost: 20,
        total_addon_group_price: 22,
        total_addon_group_tax_amount: 0,
        total_individual_food_item_cost: 142,
        total_individual_food_item_tax: 0,
      },
    ],
    order_packing_charge: 0,
    total_food_cost: 132,
    total_packing_charges: 0,
    total_tax: 0,
    delivery_charges: 59,
    transaction_charges_rate: 3,
    transaction_refund_charges_rate: 3,
    transaction_charges: 5.18,
    transaction_refund_charges: 5.18,
    total_customer_payable: 177.78,
    vendor_payout_amount: 132,
    vendor_cancellation_charges: 68.88,
    description: {
      menu_items: {
        item_id: 'Menu Itm Id from database',
        item_name: 'Menu Item Name from fatabase',
        item_quantity: 'Menu Item Quantity selected by customer',
        item_cgst: 'Menu Item CGST Tax Rate from database',
        item_sgst: 'Menu Item SGST Tax Rate from database',
        item_igst: 'Menu Item IGST Tax Rate from database',
        item_price: 'Menu Item Price from database',
        variants: {
          desc: 'List of all Variant group with choosed variants',
          variant_group_id: 'Variant Group Id from database',
          variant_group_name: 'Variant Group Name from database',
          variant_id: 'Variant Id from database',
          variant_name: 'Variant Name from database',
          variant_price: 'Variant Price from database',
        },
        total_variant_cost: 'Sum Of all variant_price of from variants array',
        addon_groups: {
          addon_group_id: 'Addon Group Id from database',
          addon_group_name: 'Addon Group Name from database',
          addons: {
            desc: 'List of all Addons selected',
            addon_id: 'Addon Id from database',
            addon_name: 'Addon Name from database',
            addon_cgst: 'Addon CGST Tax Rate from database',
            addon_sgst: 'Addon SGST Tax Rate from database',
            addon_igst: 'Addon IGST Tax Rate from database',
            addon_price: 'Addon Price from database',
            addon_tax_amount:
              'Calculated Tax value from sum of taxes(IGST+CGST+SGST) and applied on addon_price\n  >>> (addon_price / 100)*(addon_cgst+addon_sgst+addon_igst)',
          },
          free_limit: '',
          total_addon_price: 'Sum Of all addon_price of from addons array',
          total_addon_tax_amount:
            'Sum Of all addon_tax_amount of from addons array',
        },
        total_addon_group_price:
          '(Sum Of all total_addon_price of from addon_groups array) * item_quantity',
        total_addon_group_tax_amount:
          'Sum Of all total_addon_tax_amount of from addon_groups array',
        total_item_amount:
          'Calculated Value from adding all selected variants price on top of Menu Item Price\n  >>> ((item_price + total_variant_cost) * item_quantity)',
        item_tax_amount:
          'Calculated Value of tax applied on food amount if tax is not inclusive\n  >>> ((total_item_amount / 100) * (item_cgst + item_sgst + item_igst))',
        item_packing_charges:
          'Packing charges of Menu Item if set by restaurant',
        total_individual_food_item_cost:
          ' Total Item Cost (including item cost with variant cost and addons cost)\n  >>> total_item_amount + total_addon_group_price',
        total_individual_food_item_tax:
          'Total Item Tax (including item tax with variant and addons tax)\n  >>> item_tax_amount + total_addon_group_tax_amount',
      },
      coupon_details: {
        coupon_id: 'Coupon Id from database',
        code: 'Coupon code from database',
        level: 'Coupon level from database',
        min_order_value_rupees: 'Coupon min_order_value_rupees from database',
        type: 'Coupon type from database',
        max_discount_rupees: 'Coupon max_discount_rupees from database',
        discount_percentage: 'Coupon discount_percentage from database',
        discount_amount_rupees: 'Coupon discount_amount_rupees from database',
        discount_share_percentage_vendor:
          'Coupon discount_share_percentage_vendor from database',
        discount_share_percentage_speedyy:
          'Coupon discount_share_percentage_speedyy from database',
        discount_amount_applied:
          'Applicable discount amount calculated based on Other values\n  ',
        discount_share_amount_vendor:
          'The Amount Bared by vendor calculated percentage of discount_amount_applied\n  >>>  (discount_amount_applied /100) * discount_share_percentage_vendor',
        discount_share_amount_speedyy:
          'Calculated Rest of the discount amount bared by speedyy\n  >>> discount_amount_applied - discount_share_amount_vendor',
      },
      payment_transaction_id:
        'Payment uuid when payment is made by customer and is verified',
      delivery_order_id: 'Delivery order id when order is placed',
      payout_transaction_id:
        'Payout transaction ID when order payout processing started',
      order_packing_charge:
        'Packing Charges on full order if set by restaurant',
      total_food_cost: 'Sum of all total_item_amount + total_addon_group_price',
      total_tax:
        'Sum of item_tax_amount and total_addon_group_tax_amount in menu_items array',
      total_packing_charges:
        'Sum of all item_packing_charges from menu_items and order_packing_charge',
      delivery_charges:
        'By delivery partner based on >>> total_food_cost + total_tax + total_packing_charges - discount_amount_applied',
      transaction_charges_rate: 'From .env: 3%',
      transaction_charges:
        'Calculated on\n  >>> ((total_food_cost + total_taxes + total_packing_charges - discount_amount_applied + delivery_charges) / 100 ) * transaction_charges_rate',
      total_customer_payable:
        'total_food_cost + total_taxes + total_packing_charges - discount_amount_applied + delivery_charges + transaction_charges',
      refundable_amount:
        'total_food_cost + total_taxes - discount_amount_applied',
      vendor_payout_amount:
        'total_food_cost + total_taxes + total_packing_charges - discount_share_amount_vendor',
      version: '0.0.1',
    },
    coupon_details: {
      coupon_id: 20,
      code: '20%OFF-COUPON',
      type: CouponType.UPTO,
      level: CouponLevel.GLOBAL,
      min_order_value_rupees: 110,
      max_discount_rupees: 50,
      discount_percentage: 20,
      discount_amount_rupees: 0,
      discount_share_percentage_vendor: 0,
      discount_share_percentage_speedyy: 100,
      discount_amount_applied: 26.4,
      discount_share_amount_speedyy: 28.4,
      discount_share_amount_vendor: 0,
    },
  },
};

export const delivery_order_successfull_response: IPlaceOrderSuccessResponse = {
  status: 'success',
  order_id: '20733020',
  delivery_order_id: '20733020',
  delivery_cost: 59,
  pickup_eta: 5,
  drop_eta: 5,
  delivery_details: {
    track_url: 'https://exp.shadowfax.in/PaaYFT',
  },
  delivery_service: (process.env.DELIVERY_SERVICE ||
    DeliveryService.SHADOWFAX) as DeliveryService,
};
