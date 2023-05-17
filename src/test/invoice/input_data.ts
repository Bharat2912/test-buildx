export const text_data_without_discount = [
  {
    desc: '(No Packing Charge + No Taxes On Menu Item + No Taxes on Addon)\n        1 Menu Item , 2 Variant (tax inclusive), 2 Addon (tax inclusive) free limit 1 \n        Menu Item cost = 100 \n        since free limit is 1 Out of two Addon Only least price addon will not be included in the total addon price = 12 \n        since two variants are selected total variants price = 20 \n        so Expect total food cost = 132 \n        transaction chargest (3%) on total food cost. so transaction charges = 3\n        total customer payable = 100 + 12 + 20 = 130\n       vendor payout amount = 132 - 3.96 = 128.04 \n\n',
    input: {
      restaurant: {
        packing_charge_type: 'none', // 'none' | 'item' | 'order'
        packing_charge_order: {
          packing_charge: 0,
        },
      },
      menu_items: [
        {
          menu_item_id: 11101,
          menu_item_name: 'menu item name',
          price: 100,
          packing_charges: 0,
          service_charges: 10,
          item_sgst_utgst: 9,
          item_cgst: 9,
          item_igst: 0,
          item_inclusive: true,
          variant_groups: [
            {
              //   variant_group_id: 98,
              //   variant_group_name: 'menu item 1 variant 1',
              variants: [
                {
                  variant_id: 998,
                  //   variant_group_id: 98,
                  //   variant_name: 'variant group 1 variant name',
                  price: 10,
                  is_selected: true,
                },
              ],
              is_selected: true,
            },
            {
              //   variant_group_id: 99,
              //   variant_group_name: 'menu item 1 variant 2',
              variants: [
                {
                  variant_id: 999,
                  //   variant_group_id: 99,
                  //   variant_name: 'variant group 1 variant name',
                  price: 10,
                  is_selected: true,
                },
              ],
              is_selected: true,
            },
          ],
          addon_groups: [
            {
              //   addon_group_id: 77,
              //   addon_group_name: 'addon group name',
              free_limit: 1,
              addons: [
                {
                  addon_id: 7767,
                  //   addon_name: 'addon name 1',
                  price: 12,
                  sgst_rate: 0,
                  cgst_rate: 0,
                  igst_rate: 0,
                  gst_inclusive: true,
                  is_selected: true,
                },
                {
                  addon_id: 7768,
                  //   addon_name: 'addon name 2',
                  price: 10,
                  sgst_rate: 0,
                  cgst_rate: 0,
                  igst_rate: 0,
                  gst_inclusive: true,
                  is_selected: true,
                },
                {
                  addon_id: 7769,
                  //   addon_name: 'addon name 3',
                  price: 10,
                  sgst_rate: 0,
                  cgst_rate: 0,
                  igst_rate: 0,
                  gst_inclusive: true,
                  is_selected: false,
                },
              ],
              is_selected: true,
            },
          ],
          quantity: 1,
        },
      ],
    },
    output: {
      menu_items: [
        {
          item_price: 100,
          total_item_amount: 120,
          item_tax_amount: 0,
          item_packing_charges: 0,
          addon_groups: [
            {
              addons: [
                {
                  addon_id: 7768,
                  addon_price: 10,
                  addon_tax_amount: 0,
                },
                {
                  addon_id: 7767,
                  addon_price: 12,
                  addon_tax_amount: 0,
                },
              ],
              total_addon_price: 12,
              total_addon_tax_amount: 0,
            },
          ],
          variants: [
            {
              variant_id: 998,
              variant_price: 10,
            },
            {
              variant_id: 999,
              variant_price: 10,
            },
          ],
          total_variant_cost: 20,
          total_addon_group_price: 12,
          total_addon_group_tax_amount: 0,
          total_individual_food_item_cost: 132,
          total_individual_food_item_tax: 0,
        },
      ],
      order_packing_charge: 0,
      total_food_cost: 132,
      total_packing_charges: 0,
      total_tax: 0,
      delivery_charges: 0,
      transaction_charges_rate: 3,
      transaction_refund_charges_rate: 3,
      transaction_charges: 3.96,
      transaction_refund_charges: 3.96,
      total_customer_payable: 132,
      vendor_payout_amount: 128.04,
      vendor_cancellation_charges: 7.92,
    },
  },

  {
    desc: 'Packing Charges Type : Order ( No Taxes On Menu Item + No Taxes on Addon)\n        1 Menu Item , 2 Variant (tax inclusive), 2 Addon (tax inclusive) free limit 1 \n        Menu Item cost = 100 \n        since free limit is 1 Out of two Addon Only least price addon will not be included in the total addon price = 12 \n        since two variants are selected total variants price = 20 \n        so Expect total food cost = 132 \n        order packing charges = 2.5\n        transaction chargest (3%) on total food cost. so transaction charges = 4.04     //( 132 + 2.5 )/ % 3 \n        total customer payable = 100 + 2.5 + 12 + 20 = 134.5       vendor payout amount = 134.5 - 4.04 = 130.46 \n\n',
    input: {
      restaurant: {
        packing_charge_type: 'order', // 'none' | 'item' | 'order'
        packing_charge_order: {
          packing_charge: 2.5,
        },
      },
      menu_items: [
        {
          menu_item_id: 11101,
          menu_item_name: 'menu item name',
          price: 100,
          packing_charges: 0,
          service_charges: 10,
          item_sgst_utgst: 9,
          item_cgst: 9,
          item_igst: 0,
          item_inclusive: true,
          variant_groups: [
            {
              //   variant_group_id: 98,
              //   variant_group_name: 'menu item 1 variant 1',
              variants: [
                {
                  variant_id: 998,
                  //   variant_group_id: 98,
                  //   variant_name: 'variant group 1 variant name',
                  price: 10,
                  is_selected: true,
                },
              ],
              is_selected: true,
            },
            {
              //   variant_group_id: 99,
              //   variant_group_name: 'menu item 1 variant 2',
              variants: [
                {
                  variant_id: 999,
                  //   variant_group_id: 99,
                  //   variant_name: 'variant group 1 variant name',
                  price: 10,
                  is_selected: true,
                },
              ],
              is_selected: true,
            },
          ],
          addon_groups: [
            {
              //   addon_group_id: 77,
              //   addon_group_name: 'addon group name',
              free_limit: 1,
              addons: [
                {
                  addon_id: 7767,
                  //   addon_name: 'addon name 1',
                  price: 12,
                  sgst_rate: 0,
                  cgst_rate: 0,
                  igst_rate: 0,
                  gst_inclusive: true,
                  is_selected: true,
                },
                {
                  addon_id: 7768,
                  //   addon_name: 'addon name 2',
                  price: 10,
                  sgst_rate: 0,
                  cgst_rate: 0,
                  igst_rate: 0,
                  gst_inclusive: true,
                  is_selected: true,
                },
                {
                  addon_id: 7769,
                  //   addon_name: 'addon name 3',
                  price: 10,
                  sgst_rate: 0,
                  cgst_rate: 0,
                  igst_rate: 0,
                  gst_inclusive: true,
                  is_selected: false,
                },
              ],
              is_selected: true,
            },
          ],
          quantity: 1,
        },
      ],
    },
    output: {
      menu_items: [
        {
          item_price: 100,
          total_item_amount: 120,
          item_tax_amount: 0,
          item_packing_charges: 0,
          addon_groups: [
            {
              addons: [
                {
                  addon_id: 7768,
                  addon_price: 10,
                  addon_tax_amount: 0,
                },
                {
                  addon_id: 7767,
                  addon_price: 12,
                  addon_tax_amount: 0,
                },
              ],
              total_addon_price: 12,
              total_addon_tax_amount: 0,
            },
          ],
          variants: [
            {
              variant_id: 998,
              variant_price: 10,
            },
            {
              variant_id: 999,
              variant_price: 10,
            },
          ],
          total_variant_cost: 20,
          total_addon_group_price: 12,
          total_addon_group_tax_amount: 0,
          total_individual_food_item_cost: 132,
          total_individual_food_item_tax: 0,
        },
      ],
      order_packing_charge: 2.5,
      total_food_cost: 132,
      total_packing_charges: 2.5,
      total_tax: 0,
      delivery_charges: 0,
      transaction_charges_rate: 3,
      transaction_refund_charges_rate: 3,
      transaction_charges: 4.04,
      transaction_refund_charges: 4.04,
      total_customer_payable: 134.5,
      vendor_payout_amount: 130.46,
      vendor_cancellation_charges: 8.08,
    },
  },

  {
    desc: 'Packing Charges Type : Order | Taxes On Addon | No Taxes On Menu Item, No Variants\n        1 Menu Item , 0 Variant , 2 Addon (tax exclusive), free limit 1 \n        Menu Item cost = 100 \n        since free limit is 1 Out of 3 Addon Only least price addon will not be included in the total addon price = 90 (50 + 40) \n        so Expect total food cost = 190 \n        taxes on addons 28 % on 50 and 28 % 40 = total addon tax = 25.2\n        order packing charges = 2.5\n        transaction chargest (3%) on total food cost. so transaction charges = 6.53     //( 215.2 + 2.5 )/ % 3 \n        total customer payable = 100 + 90 + 25.2 + 2.5 = 217.7      vendor payout amount =  224.23 - 6.53 = 217.6\n\n',
    input: {
      restaurant: {
        packing_charge_type: 'order', // 'none' | 'item' | 'order'
        packing_charge_order: {
          packing_charge: 2.5,
        },
      },
      menu_items: [
        {
          menu_item_id: 11101,
          menu_item_name: 'menu item name',
          price: 100,
          packing_charges: 0,
          service_charges: 10,
          item_sgst_utgst: 9,
          item_cgst: 9,
          item_igst: 0,
          item_inclusive: true,
          addon_groups: [
            {
              addon_group_id: 77,
              addon_group_name: 'addon group name',
              free_limit: 1,
              addons: [
                {
                  addon_id: 7767,
                  addon_name: 'addon-1',
                  price: 40,
                  sgst_rate: 14,
                  cgst_rate: 14,
                  igst_rate: 0,
                  gst_inclusive: false,
                  is_selected: true,
                },
                {
                  addon_id: 7768,
                  addon_name: 'addon-2',
                  price: 50,
                  sgst_rate: 14,
                  cgst_rate: 14,
                  igst_rate: 0,
                  gst_inclusive: false,
                  is_selected: true,
                },
                {
                  addon_id: 7769,
                  addon_name: 'addon-3',
                  price: 10,
                  sgst_rate: 14,
                  cgst_rate: 14,
                  igst_rate: 0,
                  gst_inclusive: false,
                  is_selected: true,
                },
              ],
              is_selected: true,
            },
          ],
          quantity: 1,
        },
      ],
    },
    output: {
      menu_items: [
        {
          item_price: 100,
          total_item_amount: 100,
          item_tax_amount: 0,
          item_packing_charges: 0,
          addon_groups: [
            {
              addons: [
                {
                  addon_id: 7769,
                  addon_price: 10,
                  addon_tax_amount: 2.8,
                },
                {
                  addon_id: 7767,
                  addon_price: 40,
                  addon_tax_amount: 11.2,
                },
                {
                  addon_id: 7768,
                  addon_price: 50,
                  addon_tax_amount: 14,
                },
              ],
              total_addon_price: 90,
              total_addon_tax_amount: 25.2,
            },
          ],
          variants: [],
          total_variant_cost: 0,
          total_addon_group_price: 90,
          total_addon_group_tax_amount: 25.2,
          total_individual_food_item_cost: 190,
          total_individual_food_item_tax: 25.2,
        },
      ],
      order_packing_charge: 2.5,
      total_food_cost: 190,
      total_packing_charges: 2.5,
      total_tax: 25.2,
      delivery_charges: 0,
      transaction_charges_rate: 3,
      transaction_refund_charges_rate: 3,
      transaction_charges: 6.53,
      transaction_refund_charges: 6.53,
      total_customer_payable: 217.7,
      vendor_payout_amount: 185.97,
      vendor_cancellation_charges: 13.06,
    },
  },

  {
    desc: 'Packing Charges Type : none | Taxes On Addon | No Taxes On Menu Item, No Variants\n        1 Menu Item , 0 Variant , 2 Addon (tax exclusive), free limit 1 \n        Menu Item cost = 100 \n        since free limit is 1 Out of 3 Addon Only least price addon will not be included in the total addon price = 90 (50 + 40) \n        so Expect total food cost = 190 \n        taxes on addons 28 % on 50 and 28 % 40 = total addon tax = 25.2\n        order packing charges = 2.5\n        transaction chargest (3%) on total food cost. so transaction charges = 6.53     //( 215.2 + 2.5 )/ % 3 \n        total customer payable = 100 + 90 + 25.2 = 215.2     vendor payout amount = 183.54   // 190 - 6.46 =\n\n',
    input: {
      restaurant: {
        packing_charge_type: 'none', // 'none' | 'item' | 'order'
        packing_charge_order: {
          packing_charge: 0,
        },
      },
      menu_items: [
        {
          menu_item_id: 11101,
          menu_item_name: 'menu item name',
          price: 100,
          packing_charges: 0,
          service_charges: 10,
          item_sgst_utgst: 9,
          item_cgst: 9,
          item_igst: 0,
          item_inclusive: true,
          addon_groups: [
            {
              addon_group_id: 77,
              addon_group_name: 'addon group name',
              free_limit: 1,
              addons: [
                {
                  addon_id: 7767,
                  addon_name: 'addon-1',
                  price: 40,
                  sgst_rate: 14,
                  cgst_rate: 14,
                  igst_rate: 0,
                  gst_inclusive: false,
                  is_selected: true,
                },
                {
                  addon_id: 7768,
                  addon_name: 'addon-2',
                  price: 50,
                  sgst_rate: 14,
                  cgst_rate: 14,
                  igst_rate: 0,
                  gst_inclusive: false,
                  is_selected: true,
                },
                {
                  addon_id: 7769,
                  addon_name: 'addon-3',
                  price: 10,
                  sgst_rate: 14,
                  cgst_rate: 14,
                  igst_rate: 0,
                  gst_inclusive: false,
                  is_selected: true,
                },
              ],
              is_selected: true,
            },
          ],
          quantity: 1,
        },
      ],
    },
    output: {
      menu_items: [
        {
          item_price: 100,
          total_item_amount: 100,
          item_tax_amount: 0,
          item_packing_charges: 0,
          addon_groups: [
            {
              addons: [
                {
                  addon_id: 7769,
                  addon_price: 10,
                  addon_tax_amount: 2.8,
                },
                {
                  addon_id: 7767,
                  addon_price: 40,
                  addon_tax_amount: 11.2,
                },
                {
                  addon_id: 7768,
                  addon_price: 50,
                  addon_tax_amount: 14,
                },
              ],
              total_addon_price: 90,
              total_addon_tax_amount: 25.2,
            },
          ],
          variants: [],
          total_variant_cost: 0,
          total_addon_group_price: 90,
          total_addon_group_tax_amount: 25.2,
          total_individual_food_item_cost: 190,
          total_individual_food_item_tax: 25.2,
        },
      ],
      order_packing_charge: 0,
      total_food_cost: 190,
      total_packing_charges: 0,
      total_tax: 25.2,
      delivery_charges: 0,
      transaction_charges_rate: 3,
      transaction_refund_charges_rate: 3,
      transaction_charges: 6.46,
      transaction_refund_charges: 6.46,
      total_customer_payable: 215.2,
      vendor_payout_amount: 183.54,
      vendor_cancellation_charges: 12.92,
    },
  },

  {
    desc: 'Test For Free Limit Upto 2\n        Packing Charges Type : Order | Taxes On Addon | No Taxes On Menu Item, No Variants\n        1 Menu Item , 0 Variant , 2 Addon (tax exclusive), free limit 2 \n        Menu Item cost = 100 \n        since free limit is 2. Out of 3 Addon Only highest price of addon will be included in the total addon price = 50 \n        so Expect total food cost = 150 \n        taxes on addons 28 % on 50 = total addon tax = 14\n        order packing charges = 0\n        transaction chargest (3%) on total food cost. so transaction charges = 4.92     //( 150 + 14)/ % 3 \n        total customer payable = 100 + 50 + 14 = 164      vendor payout amount = 145.08   //164 - 4.92\n\n',
    input: {
      restaurant: {
        packing_charge_type: 'none', // 'none' | 'item' | 'order'
        packing_charge_order: {
          packing_charge: 0,
        },
      },
      menu_items: [
        {
          menu_item_id: 11101,
          menu_item_name: 'menu item name',
          price: 100,
          packing_charges: 0,
          service_charges: 10,
          item_sgst_utgst: 9,
          item_cgst: 9,
          item_igst: 0,
          item_inclusive: true,
          addon_groups: [
            {
              addon_group_id: 77,
              addon_group_name: 'addon group name',
              free_limit: 2,
              addons: [
                {
                  addon_id: 7767,
                  addon_name: 'addon-1',
                  price: 40,
                  sgst_rate: 14,
                  cgst_rate: 14,
                  igst_rate: 0,
                  gst_inclusive: false,
                  is_selected: true,
                },
                {
                  addon_id: 7768,
                  addon_name: 'addon-2',
                  price: 50,
                  sgst_rate: 14,
                  cgst_rate: 14,
                  igst_rate: 0,
                  gst_inclusive: false,
                  is_selected: true,
                },
                {
                  addon_id: 7769,
                  addon_name: 'addon-3',
                  price: 10,
                  sgst_rate: 14,
                  cgst_rate: 14,
                  igst_rate: 0,
                  gst_inclusive: false,
                  is_selected: true,
                },
              ],
              is_selected: true,
            },
          ],
          quantity: 1,
        },
      ],
    },
    output: {
      menu_items: [
        {
          item_price: 100,
          total_item_amount: 100,
          item_tax_amount: 0,
          item_packing_charges: 0,
          addon_groups: [
            {
              addons: [
                {
                  addon_id: 7769,
                  addon_price: 10,
                  addon_tax_amount: 2.8,
                },
                {
                  addon_id: 7767,
                  addon_price: 40,
                  addon_tax_amount: 11.2,
                },
                {
                  addon_id: 7768,
                  addon_price: 50,
                  addon_tax_amount: 14,
                },
              ],
              total_addon_price: 50,
              total_addon_tax_amount: 14,
            },
          ],
          variants: [],
          total_variant_cost: 0,
          total_addon_group_price: 50,
          total_addon_group_tax_amount: 14,
          total_individual_food_item_cost: 150,
          total_individual_food_item_tax: 14,
        },
      ],
      order_packing_charge: 0,
      total_food_cost: 150,
      total_packing_charges: 0,
      total_tax: 14,
      delivery_charges: 0,
      transaction_charges_rate: 3,
      transaction_refund_charges_rate: 3,
      transaction_charges: 4.92,
      transaction_refund_charges: 4.92,
      total_customer_payable: 164,
      vendor_payout_amount: 145.08,
      vendor_cancellation_charges: 9.84,
    },
  },

  {
    desc: 'Packing Charges Type : none | Taxes On Addon | Taxes On Menu Item | No Variants\n        1 Menu Item (tax exclusive), 0 Variant , 2 Addon (tax exclusive), free limit 2 \n        Menu Item cost = 100 \n        Menu Item cost tax = 18   (18% of 100rs) \n         Menu Item with cost with tax = 118\n        since free limit is 2. Out of 3 Addon Only highest price of addon will be included in the total addon price = 50 \n        so Expect total food cost = 168 \n        Taxes on addons 28 % on 50 addon tax = 14\n        order packing charges = 0\n        transaction chargest (3%) on total food cost. so transaction charges = 5.46     //( 168 + 14)/ % 3 \n        total customer payable = 100 + 18 + 50 + 14  = 182      vendor payout amount = 144.54    // 182 - (35 + 5.46)\n\n',
    input: {
      restaurant: {
        packing_charge_type: 'none', // 'none' | 'item' | 'order'
        packing_charge_order: {
          packing_charge: 0,
        },
      },
      menu_items: [
        {
          menu_item_id: 11101,
          menu_item_name: 'menu item name',
          price: 100,
          packing_charges: 0,
          service_charges: 10,
          item_sgst_utgst: 9,
          item_cgst: 9,
          item_igst: 0,
          item_inclusive: false,
          addon_groups: [
            {
              addon_group_id: 77,
              addon_group_name: 'addon group name',
              free_limit: 2,
              addons: [
                {
                  addon_id: 7767,
                  addon_name: 'addon-1',
                  price: 40,
                  sgst_rate: 14,
                  cgst_rate: 14,
                  igst_rate: 0,
                  gst_inclusive: false,
                  is_selected: true,
                },
                {
                  addon_id: 7768,
                  addon_name: 'addon-2',
                  price: 50,
                  sgst_rate: 14,
                  cgst_rate: 14,
                  igst_rate: 0,
                  gst_inclusive: false,
                  is_selected: true,
                },
                {
                  addon_id: 7769,
                  addon_name: 'addon-3',
                  price: 10,
                  sgst_rate: 14,
                  cgst_rate: 14,
                  igst_rate: 0,
                  gst_inclusive: false,
                  is_selected: true,
                },
              ],
              is_selected: true,
            },
          ],
          quantity: 1,
        },
      ],
    },
    output: {
      menu_items: [
        {
          item_price: 100,
          total_item_amount: 100,
          item_tax_amount: 18,
          item_packing_charges: 0,
          addon_groups: [
            {
              addons: [
                {
                  addon_id: 7769,
                  addon_price: 10,
                  addon_tax_amount: 2.8,
                },
                {
                  addon_id: 7767,
                  addon_price: 40,
                  addon_tax_amount: 11.2,
                },
                {
                  addon_id: 7768,
                  addon_price: 50,
                  addon_tax_amount: 14,
                },
              ],
              total_addon_price: 50,
              total_addon_tax_amount: 14,
            },
          ],
          variants: [],
          total_variant_cost: 0,
          total_addon_group_price: 50,
          total_addon_group_tax_amount: 14,
          total_individual_food_item_cost: 150,
          total_individual_food_item_tax: 32, // 18 + 14
        },
      ],
      order_packing_charge: 0,
      total_food_cost: 150,
      total_packing_charges: 0,
      total_tax: 32,
      delivery_charges: 0,
      transaction_charges_rate: 3,
      transaction_refund_charges_rate: 3,
      transaction_charges: 5.46,
      transaction_refund_charges: 5.46,
      total_customer_payable: 182,
      vendor_payout_amount: 144.54,
      vendor_cancellation_charges: 10.92,
    },
  },

  {
    desc: 'Packing Charges Type : none | Taxes On Addon | Taxes On Menu Item | Taxes On Variants\n        1 Menu Item (tax exclusive), 2 Addon (tax exclusive), 2 Variant(tax exclusive), free limit 2 \n        Menu Item cost = 100 \n        Total variant cost( 10 + 30 ) = 40 \n        Menu Item cost with tax = 25.2  (18% of 140rs) \n        Food cost with Menu Item tax and variant tax (100 + 40 + 25.2)= 165.2   // 100 + 40 + 25.2 \n        since free limit is 2. Out of 3 Addon Only highest price of addon will be included in the total addon price = 50 \n        so Expect total food cost = 215.2(165.2 + 50)\n        Taxes on addons 28 % on 50 addon tax = 14\n        order packing charges = 0\n        transaction chargest (3%) on total food cost. so transaction charges = 6.87     //( 215.2 + 14)/ % 3 \n        total customer payable = 100 + 40 + 25.2 + 50 + 14 = 229.2       vendor payout amount = 183.12 //229.2 - (39.2 + 6.88)\n\n',
    input: {
      restaurant: {
        packing_charge_type: 'none', // 'none' | 'item' | 'order'
        packing_charge_order: {
          packing_charge: 0,
        },
      },
      menu_items: [
        {
          menu_item_id: 11101,
          menu_item_name: 'menu item name',
          price: 100,
          packing_charges: 0,
          service_charges: 10,
          item_sgst_utgst: 9,
          item_cgst: 9,
          item_igst: 0,
          item_inclusive: false,
          variant_groups: [
            {
              variants: [
                {
                  variant_id: 998,
                  price: 10,
                  is_selected: true,
                },
              ],
              is_selected: true,
            },
            {
              variants: [
                {
                  variant_id: 999,
                  price: 30,
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
              free_limit: 2,
              addons: [
                {
                  addon_id: 7767,
                  addon_name: 'addon-1',
                  price: 40,
                  sgst_rate: 14,
                  cgst_rate: 14,
                  igst_rate: 0,
                  gst_inclusive: false,
                  is_selected: true,
                },
                {
                  addon_id: 7768,
                  addon_name: 'addon-2',
                  price: 50,
                  sgst_rate: 14,
                  cgst_rate: 14,
                  igst_rate: 0,
                  gst_inclusive: false,
                  is_selected: true,
                },
                {
                  addon_id: 7769,
                  addon_name: 'addon-3',
                  price: 10,
                  sgst_rate: 14,
                  cgst_rate: 14,
                  igst_rate: 0,
                  gst_inclusive: false,
                  is_selected: true,
                },
              ],
              is_selected: true,
            },
          ],
          quantity: 1,
        },
      ],
    },
    output: {
      menu_items: [
        {
          item_price: 100,
          total_item_amount: 140,
          item_tax_amount: 25.2,
          item_packing_charges: 0,
          addon_groups: [
            {
              addons: [
                {
                  addon_id: 7769,
                  addon_price: 10,
                  addon_tax_amount: 2.8,
                },
                {
                  addon_id: 7767,
                  addon_price: 40,
                  addon_tax_amount: 11.2,
                },
                {
                  addon_id: 7768,
                  addon_price: 50,
                  addon_tax_amount: 14,
                },
              ],
              total_addon_price: 50,
              total_addon_tax_amount: 14,
            },
          ],
          variants: [
            {
              variant_id: 998,
              variant_price: 10,
            },
            {
              variant_id: 999,
              variant_price: 30,
            },
          ],
          total_variant_cost: 40,
          total_addon_group_price: 50,
          total_addon_group_tax_amount: 14,
          total_individual_food_item_cost: 190,
          total_individual_food_item_tax: 39.2, // 28.2 + 14
        },
      ],
      order_packing_charge: 0,
      total_food_cost: 190,
      total_packing_charges: 0,
      total_tax: 39.2,
      delivery_charges: 0,
      transaction_charges_rate: 3,
      transaction_refund_charges_rate: 3,
      transaction_charges: 6.88,
      transaction_refund_charges: 6.88,
      total_customer_payable: 229.2,
      vendor_payout_amount: 183.12,
      vendor_cancellation_charges: 13.76,
    },
  },

  {
    desc: 'Packing Charges Type : Order | Packing Charges Type : order | Taxes On Addon | Taxes On Menu Item | Taxes On Variants\n        1 Menu Item (tax exclusive), 2 Addon (tax exclusive), 2 Variant(tax exclusive), free limit 2 \n        Menu Item cost = 100 \n        Total variant cost( 10 + 30 ) = 40 \n        Menu Item cost with tax = 25.2  (18% of 140rs) \n        Food cost with Menu Item tax and variant tax (100 + 40 + 25.2)= 165.2   // 100 + 40 + 25.2 \n        since free limit is 2. Out of 3 Addon Only highest price of addon will be included in the total addon price = 50 \n        so Expect total food cost = 215.2(165.2 + 50)\n        Taxes on addons 28 % on 50 addon tax = 14\n        order packing charges = 5\n        transaction chargest (3%) on total food cost. so transaction charges = 7.03     //( 215.2 + 14)/ % 3 \n        total customer payable = 100 + 40 + 25.2 + 50 + 14 + 5 = 234.2\n        vendor payout amount = 190 - 7.03             // total food cost - transaction charges',
    input: {
      restaurant: {
        packing_charge_type: 'order',
        packing_charge_order: {
          packing_charge: 5,
        },
      },
      menu_items: [
        {
          menu_item_id: 11101,
          menu_item_name: 'menu item name',
          price: 100,
          packing_charges: 0,
          service_charges: 10,
          item_sgst_utgst: 9,
          item_cgst: 9,
          item_igst: 0,
          item_inclusive: false,
          variant_groups: [
            {
              variants: [
                {
                  variant_id: 998,
                  price: 10,
                  is_selected: true,
                },
              ],
              is_selected: true,
            },
            {
              variants: [
                {
                  variant_id: 999,
                  price: 30,
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
              free_limit: 2,
              addons: [
                {
                  addon_id: 7767,
                  addon_name: 'addon-1',
                  price: 40,
                  sgst_rate: 14,
                  cgst_rate: 14,
                  igst_rate: 0,
                  gst_inclusive: false,
                  is_selected: true,
                },
                {
                  addon_id: 7768,
                  addon_name: 'addon-2',
                  price: 50,
                  sgst_rate: 14,
                  cgst_rate: 14,
                  igst_rate: 0,
                  gst_inclusive: false,
                  is_selected: true,
                },
                {
                  addon_id: 7769,
                  addon_name: 'addon-3',
                  price: 10,
                  sgst_rate: 14,
                  cgst_rate: 14,
                  igst_rate: 0,
                  gst_inclusive: false,
                  is_selected: true,
                },
              ],
              is_selected: true,
            },
          ],
          quantity: 1,
        },
      ],
    },
    output: {
      menu_items: [
        {
          item_price: 100,
          total_item_amount: 140,
          item_tax_amount: 25.2,
          item_packing_charges: 0,
          addon_groups: [
            {
              addons: [
                {
                  addon_id: 7769,
                  addon_price: 10,
                  addon_tax_amount: 2.8,
                },
                {
                  addon_id: 7767,
                  addon_price: 40,
                  addon_tax_amount: 11.2,
                },
                {
                  addon_id: 7768,
                  addon_price: 50,
                  addon_tax_amount: 14,
                },
              ],
              total_addon_price: 50,
              total_addon_tax_amount: 14,
            },
          ],
          variants: [
            {
              variant_id: 998,
              variant_price: 10,
            },
            {
              variant_id: 999,
              variant_price: 30,
            },
          ],
          total_addon_group_price: 50,
          total_addon_group_tax_amount: 14,
          total_individual_food_item_cost: 190,
          total_individual_food_item_tax: 39.2, // 28.2 + 14
        },
      ],
      order_packing_charge: 5,
      total_food_cost: 190,
      total_packing_charges: 5,
      total_tax: 39.2,
      delivery_charges: 0,
      transaction_charges_rate: 3,
      transaction_refund_charges_rate: 3,
      transaction_charges: 7.03,
      transaction_refund_charges: 7.03,
      total_customer_payable: 234.2,
      vendor_payout_amount: 187.97,
      vendor_cancellation_charges: 14.06,
    },
  },

  {
    desc: 'Packing Charges Type : Order | Taxes on packing | Packing Charge Tax Type : percent | Packing Charges Type : order | Taxes On Addon | Taxes On Menu Item | Taxes On Variants\n        1 Menu Item (tax exclusive), 2 Addon (tax exclusive), 2 Variant(tax exclusive), free limit 2 \n        Menu Item cost = 100 \n        Total variant cost( 10 + 30 ) = 40 \n        Menu Item cost with tax = 25.2  (18% of 140rs) \n        Food cost with Menu Item tax and variant tax (100 + 40 + 25.2)= 165.2   // 100 + 40 + 25.2 \n        since free limit is 2. Out of 3 Addon Only highest price of addon will be included in the total addon price = 50 \n        so Expect total food cost = 215.2(165.2 + 50)\n        Taxes on addons 28 % on 50 addon tax = 14\n        order packing charges = 9.5\n        transaction chargest (3%) on total food cost. so transaction charges = 7.16     //( 224.7 + 14)/ % 3 \n        total customer payable = 100 + 40 + 25.2 + 50 + 14 + 9.5 = 238.7\n        vendor payout amount = 190 - 7.16             // total food cost - transaction charges',
    input: {
      restaurant: {
        packing_charge_type: 'order',
        packing_charge_order: {
          packing_charge: 5,
        },
        taxes_applicable_on_packing: true,
        packing_charge_fixed_percent: 'percent',
      },
      menu_items: [
        {
          menu_item_id: 11101,
          menu_item_name: 'menu item name',
          price: 100,
          packing_charges: 0,
          service_charges: 10,
          item_sgst_utgst: 9,
          item_cgst: 9,
          item_igst: 0,
          item_inclusive: false,
          variant_groups: [
            {
              variants: [
                {
                  variant_id: 998,
                  price: 10,
                  is_selected: true,
                },
              ],
              is_selected: true,
            },
            {
              variants: [
                {
                  variant_id: 999,
                  price: 30,
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
              free_limit: 2,
              addons: [
                {
                  addon_id: 7767,
                  addon_name: 'addon-1',
                  price: 40,
                  sgst_rate: 14,
                  cgst_rate: 14,
                  igst_rate: 0,
                  gst_inclusive: false,
                  is_selected: true,
                },
                {
                  addon_id: 7768,
                  addon_name: 'addon-2',
                  price: 50,
                  sgst_rate: 14,
                  cgst_rate: 14,
                  igst_rate: 0,
                  gst_inclusive: false,
                  is_selected: true,
                },
                {
                  addon_id: 7769,
                  addon_name: 'addon-3',
                  price: 10,
                  sgst_rate: 14,
                  cgst_rate: 14,
                  igst_rate: 0,
                  gst_inclusive: false,
                  is_selected: true,
                },
              ],
              is_selected: true,
            },
          ],
          quantity: 1,
        },
      ],
    },
    output: {
      menu_items: [
        {
          item_price: 100,
          total_item_amount: 140,
          item_tax_amount: 25.2,
          item_packing_charges: 0,
          addon_groups: [
            {
              addons: [
                {
                  addon_id: 7769,
                  addon_price: 10,
                  addon_tax_amount: 2.8,
                },
                {
                  addon_id: 7767,
                  addon_price: 40,
                  addon_tax_amount: 11.2,
                },
                {
                  addon_id: 7768,
                  addon_price: 50,
                  addon_tax_amount: 14,
                },
              ],
              total_addon_price: 50,
              total_addon_tax_amount: 14,
            },
          ],
          variants: [
            {
              variant_id: 998,
              variant_price: 10,
            },
            {
              variant_id: 999,
              variant_price: 30,
            },
          ],
          total_variant_cost: 40,
          total_addon_group_price: 50,
          total_addon_group_tax_amount: 14,
          total_individual_food_item_cost: 190,
          total_individual_food_item_tax: 39.2, // 28.2 + 14
        },
      ],
      order_packing_charge: 9.5,
      total_food_cost: 190,
      total_packing_charges: 9.5,
      total_tax: 39.2,
      delivery_charges: 0,
      transaction_charges_rate: 3,
      transaction_refund_charges_rate: 3,
      transaction_charges: 7.16,
      transaction_refund_charges: 7.16,
      total_customer_payable: 238.7,
      vendor_payout_amount: 192.34,
      vendor_cancellation_charges: 14.32,
    },
  },

  {
    desc: 'Packing Charges Type : item | Taxes on packing | Packing Charge Tax Type : percent | Packing Charges Type : order | Taxes On Addon | Taxes On Menu Item | Taxes On Variants\n        1 Menu Item (tax exclusive), 2 Addon (tax exclusive), 2 Variant(tax exclusive), free limit 2 \n        Menu Item cost = 100 \n        Total variant cost( 10 + 30 ) = 40 \n        Menu Item cost with tax = 25.2  (18% of 140rs) \n        Food cost with Menu Item tax and variant tax (100 + 40 + 25.2)= 165.2   // 100 + 40 + 25.2 \n        since free limit is 2. Out of 3 Addon Only highest price of addon will be included in the total addon price = 50 \n        so Expect total food cost = 215.2(165.2 + 50)\n        Taxes on addons 28 % on 50 addon tax = 14\n        order packing charges = 9.5\n        transaction chargest (3%) on total food cost. so transaction charges = 7.16     //( 224.7 + 14)/ % 3 \n        total customer payable = 100 + 40 + 25.2 + 50 + 14 + 9.5 = 238.7\n        vendor payout amount = 190 - 7.16             // total food cost - transaction charges',
    input: {
      restaurant: {
        packing_charge_type: 'item',
        taxes_applicable_on_packing: true,
        packing_charge_fixed_percent: 'percent',
      },
      menu_items: [
        {
          menu_item_id: 11101,
          menu_item_name: 'menu item name',
          price: 100,
          packing_charges: 5,
          service_charges: 10,
          item_sgst_utgst: 9,
          item_cgst: 9,
          item_igst: 0,
          item_inclusive: false,
          variant_groups: [
            {
              variants: [
                {
                  variant_id: 998,
                  price: 10,
                  is_selected: true,
                },
              ],
              is_selected: true,
            },
            {
              variants: [
                {
                  variant_id: 999,
                  price: 30,
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
              free_limit: 2,
              addons: [
                {
                  addon_id: 7767,
                  addon_name: 'addon-1',
                  price: 40,
                  sgst_rate: 14,
                  cgst_rate: 14,
                  igst_rate: 0,
                  gst_inclusive: false,
                  is_selected: true,
                },
                {
                  addon_id: 7768,
                  addon_name: 'addon-2',
                  price: 50,
                  sgst_rate: 14,
                  cgst_rate: 14,
                  igst_rate: 0,
                  gst_inclusive: false,
                  is_selected: true,
                },
                {
                  addon_id: 7769,
                  addon_name: 'addon-3',
                  price: 10,
                  sgst_rate: 14,
                  cgst_rate: 14,
                  igst_rate: 0,
                  gst_inclusive: false,
                  is_selected: true,
                },
              ],
              is_selected: true,
            },
          ],
          quantity: 1,
        },
      ],
    },
    output: {
      menu_items: [
        {
          item_price: 100,
          total_item_amount: 140,
          item_tax_amount: 25.2,
          item_packing_charges: 9.5,
          addon_groups: [
            {
              addons: [
                {
                  addon_id: 7769,
                  addon_price: 10,
                  addon_tax_amount: 2.8,
                },
                {
                  addon_id: 7767,
                  addon_price: 40,
                  addon_tax_amount: 11.2,
                },
                {
                  addon_id: 7768,
                  addon_price: 50,
                  addon_tax_amount: 14,
                },
              ],
              total_addon_price: 50,
              total_addon_tax_amount: 14,
            },
          ],
          variants: [
            {
              variant_id: 998,
              variant_price: 10,
            },
            {
              variant_id: 999,
              variant_price: 30,
            },
          ],
          total_variant_cost: 40,
          total_addon_group_price: 50,
          total_addon_group_tax_amount: 14,
          total_individual_food_item_cost: 190,
          total_individual_food_item_tax: 39.2, // 28.2 + 14
        },
      ],
      order_packing_charge: 0,
      total_food_cost: 190,
      total_packing_charges: 9.5,
      total_tax: 39.2,
      delivery_charges: 0,
      transaction_charges_rate: 3,
      transaction_refund_charges_rate: 3,
      transaction_charges: 7.16,
      transaction_refund_charges: 7.16,
      total_customer_payable: 238.7,
      vendor_payout_amount: 192.34,
      vendor_cancellation_charges: 14.32,
    },
  },

  {
    desc: 'Packing Charges Type : item | Taxes on packing | Packing Charge Tax Type : percent | Packing Charges Type : order | Taxes On Addon | Taxes On Menu Item | Taxes On Variants\n        1 Menu Item (tax exclusive), 2 Addon (tax exclusive), 2 Variant(tax exclusive), free limit 2 \n        Menu Item cost = 100 \n        Total variant cost( 10 + 30 ) = 40 \n        Menu Item cost with tax = 25.2  (18% of 140rs) \n        Food cost with Menu Item tax and variant tax (100 + 40 + 25.2)= 165.2   // 100 + 40 + 25.2 \n        since free limit is 2. Out of 3 Addon Only highest price of addon will be included in the total addon price = 50 \n        so Expect total food cost = 215.2(165.2 + 50)\n        Taxes on addons 28 % on 50 addon tax = 14\n        order packing charges = 9.5\n        transaction chargest (3%) on total food cost. so transaction charges = 7.16     //( 224.7 + 14)/ % 3 \n        total customer payable = 100 + 40 + 25.2 + 50 + 14 + 9.5 = 238.7\n        vendor payout amount = 190 - 7.16             // total food cost - transaction charges',
    input: {
      restaurant: {
        packing_charge_type: 'item',
        taxes_applicable_on_packing: true,
        packing_charge_fixed_percent: 'percent',
      },
      menu_items: [
        {
          menu_item_id: 11101,
          menu_item_name: 'menu item name',
          price: 100,
          packing_charges: 5,
          service_charges: 10,
          item_sgst_utgst: 9,
          item_cgst: 9,
          item_igst: 0,
          item_inclusive: false,
          variant_groups: [
            {
              variants: [
                {
                  variant_id: 998,
                  price: 10,
                  is_selected: true,
                },
              ],
              is_selected: true,
            },
            {
              variants: [
                {
                  variant_id: 999,
                  price: 30,
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
              free_limit: 2,
              addons: [
                {
                  addon_id: 7767,
                  addon_name: 'addon-1',
                  price: 40,
                  sgst_rate: 14,
                  cgst_rate: 14,
                  igst_rate: 0,
                  gst_inclusive: false,
                  is_selected: true,
                },
                {
                  addon_id: 7768,
                  addon_name: 'addon-2',
                  price: 50,
                  sgst_rate: 14,
                  cgst_rate: 14,
                  igst_rate: 0,
                  gst_inclusive: false,
                  is_selected: true,
                },
                {
                  addon_id: 7769,
                  addon_name: 'addon-3',
                  price: 10,
                  sgst_rate: 14,
                  cgst_rate: 14,
                  igst_rate: 0,
                  gst_inclusive: false,
                  is_selected: true,
                },
              ],
              is_selected: true,
            },
          ],
          quantity: 2,
        },
      ],
    },
    output: {
      menu_items: [
        {
          item_price: 100,
          total_item_amount: 280,
          item_tax_amount: 50.4,
          item_packing_charges: 19,
          addon_groups: [
            {
              addons: [
                {
                  addon_id: 7769,
                  addon_price: 10,
                  addon_tax_amount: 2.8,
                },
                {
                  addon_id: 7767,
                  addon_price: 40,
                  addon_tax_amount: 11.2,
                },
                {
                  addon_id: 7768,
                  addon_price: 50,
                  addon_tax_amount: 14,
                },
              ],
              total_addon_price: 50,
              total_addon_tax_amount: 14,
            },
          ],
          variants: [
            {
              variant_id: 998,
              variant_price: 10,
            },
            {
              variant_id: 999,
              variant_price: 30,
            },
          ],
          total_variant_cost: 40,
          total_addon_group_price: 100,
          total_addon_group_tax_amount: 28,
          total_individual_food_item_cost: 380,
          total_individual_food_item_tax: 78.4, // 28.2 + 14
        },
      ],
      order_packing_charge: 0,
      total_food_cost: 380,
      total_packing_charges: 19,
      total_tax: 78.4,
      delivery_charges: 0,
      transaction_charges_rate: 3,
      transaction_refund_charges_rate: 3,
      transaction_charges: 14.32,
      transaction_refund_charges: 14.32,
      total_customer_payable: 477.4,
      vendor_payout_amount: 384.68,
      vendor_cancellation_charges: 28.64,
    },
  },
  {
    desc: '',
    input: {
      restaurant: {
        packing_charge_type: 'item',
        taxes_applicable_on_packing: false,
        packing_charge_fixed_percent: 'fixed',
      },
      menu_items: [
        {
          menu_item_id: 1007,
          menu_item_name: 'Egg Biryani',
          price: 249,
          packing_charges: 10,
          service_charges: 5,
          item_sgst_utgst: 0,
          item_cgst: 0,
          item_igst: 0,
          item_inclusive: true,
          variant_groups: [
            {
              variants: [
                {
                  variant_id: 173,
                  variant_group_id: 98,
                  price: 10,
                  is_selected: true,
                },
              ],

              is_selected: true,
            },
          ],
          addon_groups: [],
          quantity: 4,
          total_tax: 0,
        },
      ],
    },
    output: {
      menu_items: [
        {
          item_price: 249,
          total_item_amount: 1036, // (item_price + total_variant_cost) * item_quantity;
          item_tax_amount: 0,
          item_packing_charges: 40, // packaging_charge on one_item * quantity
          variants: [
            {
              variant_id: 173,
              variant_price: 10,
            },
          ],
          total_variant_cost: 10, // sum of all variant_price
          total_addon_group_price: 0,
          total_addon_group_tax_amount: 0,
          total_individual_food_item_cost: 1036, // total_item_amount + total_addon_group_price
          total_individual_food_item_tax: 0,
        },
      ],
      order_packing_charge: 0,
      total_food_cost: 1036, // sum of all total_individual_food_item_cost
      total_packing_charges: 40, // sum of all item_packing_charges if item_packing_charges applied on item level
      total_tax: 0,
      delivery_charges: 0,
      transaction_charges_rate: 3,
      transaction_refund_charges_rate: 3,
      transaction_charges: 32.28,
      transaction_refund_charges: 32.28,
      total_customer_payable: 1076, // total_food_cost + total_packing_charges
      vendor_payout_amount: 1043.72, //
      vendor_cancellation_charges: 64.56,
    },
  },
];
export const test_data_with_discount = [
  {
    desc: '',
    input: {
      restaurant: {
        packing_charge_type: 'item',
        taxes_applicable_on_packing: false,
        packing_charge_fixed_percent: 'fixed',
      },
      menu_items: [
        {
          menu_item_id: 1007,
          menu_item_name: 'Egg Biryani',
          price: 249,
          packing_charges: 10,
          service_charges: 5,
          item_sgst_utgst: 0,
          item_cgst: 0,
          item_igst: 0,
          item_inclusive: true,
          variant_groups: [
            {
              variants: [
                {
                  variant_id: 173,
                  variant_group_id: 98,
                  price: 10,
                  is_selected: true,
                },
              ],

              is_selected: true,
            },
          ],
          addon_groups: [],
          quantity: 4,
          total_tax: 0,
        },
      ],
      coupon_details: {
        coupon_id: 31,
        type: 'flat',
        level: 'restaurant',
        min_order_value_rupees: 0,
        max_discount_rupees: null,
        discount_percentage: null,
        discount_amount_rupees: 50,
        discount_share_percentage_vendor: 100,
        discount_share_percentage_speedyy: 0,
      },
    },
    output: {
      menu_items: [
        {
          item_price: 249,
          total_item_amount: 1036, // (item_price + total_variant_cost) * item_quantity;
          item_tax_amount: 0,
          item_packing_charges: 40, // packaging_charge on one_item * quantity
          variants: [
            {
              variant_id: 173,
              variant_price: 10,
            },
          ],
          total_variant_cost: 10, // sum of all variant_price
          total_addon_group_price: 0,
          total_addon_group_tax_amount: 0,
          total_individual_food_item_cost: 1036, // total_item_amount + total_addon_group_price
          total_individual_food_item_tax: 0,
          discount_amount: 50,
        },
      ],
      order_packing_charge: 0,
      total_food_cost: 1036, // sum of all total_individual_food_item_cost
      total_packing_charges: 40, // sum of all item_packing_charges if item_packing_charges applied on item level
      total_tax: 0,
      delivery_charges: 0,
      transaction_charges_rate: 3,
      transaction_refund_charges_rate: 3,
      transaction_charges: 30.78,
      transaction_refund_charges: 30.78,
      total_customer_payable: 1026, // total_food_cost + total_packing_charges - discount
      vendor_cancellation_charges: 61.56,
      vendor_payout_amount: 995.22, // total_customer_payable - transaction_charges
      coupon_details: {
        coupon_id: 31,
        type: 'flat',
        level: 'restaurant',
        min_order_value_rupees: 0,
        max_discount_rupees: 0,
        discount_percentage: 0,
        discount_amount_rupees: 50,
        discount_share_percentage_vendor: 100,
        discount_share_percentage_speedyy: 0,
        discount_amount_applied: 50,
        discount_share_amount_speedyy: 0,
        discount_share_amount_vendor: 50,
      },
    },
  },
];
