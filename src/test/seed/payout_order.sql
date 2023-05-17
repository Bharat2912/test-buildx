INSERT INTO PUBLIC.
ORDER (
		"id"
		,"restaurant_id"
		,"customer_id"
		,"customer_device_id"
		,"customer_address"
		,"order_delivered_at"
		,"delivery_status"
		,"delivery_details"
		,"delivery_charges"
		,"delivery_tip"
		,"order_status"
		,"order_acceptance_status"
		,"total_customer_payable"
		,"total_tax"
		,"packing_charges"
		,"offer_discount"
		,"coupon_id"
		,"vote_type"
		,"any_special_request"
		,"cancelled_by"
		,"cancellation_details"
		,"cancellation_time"
		,"cancellation_user_id"
		,"created_at"
		,"updated_at"
		,"delivery_order_id"
		,"pickup_eta"
		,"drop_eta"
		,"order_placed_time"
		,"vendor_accepted_time"
		,"accepted_vendor_id"
		,"preparation_time"
		,"vendor_ready_marked_time"
		,"payout_transaction_id"
		,"transaction_charges"
		,"vendor_payout_amount"
		,"invoice_breakout"
		,"stop_payment"
		,"order_pickedup_time"
		,"comments"
		,"reviewed_at"
		,"refund_status"
		,"additional_details"
		,"delivery_service"
		)
VALUES (
	1
	,'b0909e52-a731-4665-a791-ee6479008805'
	,'5c8d6737-93d7-4222-b2db-74abecf25359'
	,'63a6d3f340654aa3'
	,'{"id": "c7fc268b-b104-4866-83bc-ecf523c421ba", "city": "Mumbai Suburban", "name": "parle", "email": "kru@gmail.com", "phone": "+917208728111", "state": "Maharashtra", "country": "India", "pincode": "400057", "latitude": "19.104190315808342", "longitude": "72.8476233780384", "created_at": "2022-07-28T10:00:35.965Z", "directions": "parlr", "updated_at": "2022-07-28T10:00:35.965Z", "customer_id": "5c8d6737-93d7-4222-b2db-74abecf25359", "customer_name": "krutika", "is_serviceable": true, "alternate_phone": null, "delivery_details": {"serviceable": true, "delivery_cost": 30, "serviceability": true}, "apartment_road_area": "parle", "house_flat_block_no": "10"}'
	,'2022-07-28 13:51:52.289+00'
	,'delivered'
	,'{"returns": {}, "drop_eta": null, "rider_id": 2052, "pickup_eta": null, "rider_name": "Aastha Jain", "return_skus": [], "order_status": "DELIVERED", "delivery_time": "2022-07-28T11:21:00.000000Z", "rider_contact": "8750879029", "drop_image_url": null, "rider_latitude": 35.568624, "client_order_id": "383", "rider_longitude": 77.84621, "delivery_order_id": 20727635}'
	,30.00
	,NULL
	,'completed'
	,'accepted'
	,478.95
	,0.00
	,5.00
	,NULL
	,NULL
	,1
	,NULL
	,NULL
	,NULL
	,NULL
	,NULL
	,'2022-07-28 10:00:39.518329+00'
	,'2022-07-28 13:51:52.289+00'
	,'20727635'
	,12063
	,12095
	,'2022-07-28 10:00:50.12+00'
	,'2022-07-28 10:13:51.227+00'
	,'e5707be1-0a19-4134-b2dd-6556dcdde7b9'
	,5
	,NULL
	,NULL
	,13.95
	,435.00
	,
	'{"total_tax": 0, "menu_items": [{"variants": [{"variant_id": 3859, "variant_name": "Multigrain Bread", "variant_price": 10, "variant_group_id": 899, "variant_group_name": "Choice of Bread"}, {"variant_id": 3868, "variant_name": "Toasted With Mozzarella Cheese", "variant_price": 10, "variant_group_id": 900, "variant_group_name": "Choice of Preparation"}], "item_cgst": 12.5, "item_igst": 12.5, "item_name": "Chicken Slice,  Egg & Cheese Sub (30 Cm,  12 Inch)", "item_sgst": 12.5, "item_price": 381, "addon_groups": [{"addons": [{"addon_id": 1620, "addon_cgst": 0, "addon_igst": 0, "addon_name": "Aquavess Water Pet Bottle (500 ml)", "addon_sgst": 0, "addon_price": 29, "addon_tax_amount": 0}], "free_limit": -1, "addon_group_id": 288, "addon_group_name": "Choice of Drinks", "total_addon_price": 29, "total_addon_tax_amount": 0}], "item_quantity": 1, "item_tax_amount": 0, "total_item_amount": 401, "total_variant_cost": 20, "item_packing_charges": 2.5, "total_addon_group_price": 29, "total_addon_group_tax_amount": 0, "total_individual_food_item_tax": 0, "total_individual_food_item_cost": 430}], "description": {"version": "0.0.1", "total_tax": "Sum of item_tax_amount and total_addon_group_tax_amount in menu_items array", "menu_items": {"item_id": "Menu Itm Id from database", "variants": {"desc": "List of all Variant group with choosed variants", "variant_id": "Variant Id from database", "variant_name": "Variant Name from database", "variant_price": "Variant Price from database", "variant_group_id": "Variant Group Id from database", "variant_group_name": "Variant Group Name from database"}, "item_cgst": "Menu Item CGST Tax Rate from database", "item_igst": "Menu Item IGST Tax Rate from database", "item_name": "Menu Item Name from fatabase", "item_sgst": "Menu Item SGST Tax Rate from database", "item_price": "Menu Item Price from database", "addon_groups": {"addons": {"desc": "List of all Addons selected", "addon_id": "Addon Id from database", "addon_cgst": "Addon CGST Tax Rate from database", "addon_igst": "Addon IGST Tax Rate from database", "addon_name": "Addon Name from database", "addon_sgst": "Addon SGST Tax Rate from database", "addon_price": "Addon Price from database", "addon_tax_amount": "Calculated Tax value from sum of taxes(IGST+CGST+SGST) and applied on addon_price\n  >>> (addon_price / 100)*(addon_cgst+addon_sgst+addon_igst)"}, "free_limit": "", "addon_group_id": "Addon Group Id from database", "addon_group_name": "Addon Group Name from database", "total_addon_price": "Sum Of all addon_price of from addons array", "total_addon_tax_amount": "Sum Of all addon_tax_amount of from addons array"}, "item_quantity": "Menu Item Quantity selected by customer", "item_tax_amount": "Calculated Value of tax applied on food amount if tax is not inclusive\n  >>> ((total_item_amount / 100) * (item_cgst + item_sgst + item_igst))", "total_item_amount": "Calculated Value from adding all selected variants price on top of Menu Item Price\n  >>> ((item_price + total_variant_cost) * item_quantity)", "total_variant_cost": "Sum Of all variant_price of from variants array", "item_packing_charges": "Packing charges of Menu Item if set by restaurant", "total_addon_group_price": "Sum Of all total_addon_price of from addon_groups array", "total_addon_group_tax_amount": "Sum Of all total_addon_tax_amount of from addon_groups array", "total_individual_food_item_tax": "Total Item Tax (including item tax with variant and addons tax)\n  >>> item_tax_amount + total_addon_group_tax_amount", "total_individual_food_item_cost": " Total Item Cost (including item cost with variant cost and addons cost)\n  >>> total_addon_group_price + total_addon_group_price"}, "coupon_details": {"code": "Coupon code from database", "type": "Coupon type from database", "level": "Coupon level from database", "coupon_id": "Coupon Id from database", "discount_percentage": "Coupon discount_percentage from database", "max_discount_rupees": "Coupon max_discount_rupees from database", "discount_amount_rupees": "Coupon discount_amount_rupees from database", "min_order_value_rupees": "Coupon min_order_value_rupees from database", "discount_amount_applied": "Applicable discount amount calculated based on Other values\n  ", "discount_share_amount_vendor": "The Amount Bared by vendor calculated percentage of discount_amount_applied\n  >>>  (discount_amount_applied /100) * discount_share_percentage_vendor", "discount_share_amount_speedyy": "Calculated Rest of the discount amount bared by speedyy\n  >>> discount_amount_applied - discount_share_amount_vendor", "discount_share_percentage_vendor": "Coupon discount_share_percentage_vendor from database", "discount_share_percentage_speedyy": "Coupon discount_share_percentage_speedyy from database"}, "total_food_cost": "Sum of all total_item_amount + total_addon_group_price", "delivery_charges": "By shadow fax based on >>> total_food_cost + total_tax + total_packing_charges - discount_amount_applied", "delivery_order_id": "Shadowfax order id when order is placed", "refundable_amount": "total_food_cost + total_taxes - discount_amount_applied", "transaction_charges": "Calculated on\n  >>> ((total_food_cost + total_taxes + total_packing_charges - discount_amount_applied + delivery_charges) / 100 ) * transaction_charges_rate", "order_packing_charge": "Packing Charges on full order if set by restaurant", "vendor_payout_amount": "total_food_cost + total_taxes + total_packing_charges - discount_share_amount_vendor", "payout_transaction_id": "Payout transaction ID when order payout processing started", "total_packing_charges": "Sum of all item_packing_charges from menu_items and order_packing_charge", "payment_transaction_id": "Payment uuid when payment is made by customer and is verified", "total_customer_payable": "total_food_cost + total_taxes + total_packing_charges - discount_amount_applied + delivery_charges + transaction_charges", "transaction_charges_rate": "From .env: 3%"}, "total_food_cost": 430, "delivery_charges": 30, "delivery_order_id": 20727635, "refundable_amount": 430, "transaction_charges": 13.95, "order_packing_charge": 2.5, "vendor_payout_amount": 435, "total_packing_charges": 5, "payment_transaction_id": "2734068", "total_customer_payable": 478.95, "transaction_charges_rate": 3}'
	,'false'
	,'2022-07-28 10:34:34+00'
	,'good food'
	,NULL
	,NULL
	,NULL
	,'shadowfax'
	)
	,(
	2
	,'b0909e52-a731-4665-a791-ee6479008805'
	,'4b6cdf35-fc28-40b0-a08a-c8e0aa603985'
	,'12412423432424413213123'
	,'{"id": "aedb2abf-ebf8-4703-b7ca-21c2e54fffa7", "city": "Mumbai", "name": "AMOGH add1", "email": "amogh.c@speedyy.com", "phone": "+919819997648", "state": "Maharashtra", "country": "India", "pincode": "0", "latitude": "23.045715", "longitude": "72.530396", "created_at": "2022-07-29T04:22:49.912Z", "directions": "ABC", "updated_at": "2022-08-01T04:49:24.787Z", "customer_id": "4b6cdf35-fc28-40b0-a08a-c8e0aa603985", "customer_name": "Amogh Chavan", "is_serviceable": true, "alternate_phone": null, "delivery_details": {"serviceable": true, "delivery_cost": 30, "serviceability": true}, "apartment_road_area": "apartment_road_area.", "house_flat_block_no": "HouseNumber,Wing,Block Number,"}'
	,'2022-08-01 05:38:01+00'
	,'delivered'
	,'{"returns": {}, "drop_eta": null, "rider_id": 2052, "pickup_eta": null, "rider_name": "Aastha Jain", "return_skus": [], "order_status": "DELIVERED", "delivery_time": "2022-08-01T05:38:01.000000Z", "rider_contact": "8750879029", "drop_image_url": null, "rider_latitude": 35.568624, "client_order_id": "574", "rider_longitude": 77.84621, "delivery_order_id": 20727963}'
	,30.00
	,NULL
	,'completed'
	,'accepted'
	,108.15
	,0.00
	,5.00
	,NULL
	,NULL
	,0
	,NULL
	,NULL
	,NULL
	,NULL
	,NULL
	,'2022-08-01 05:26:50.636772+00'
	,'2022-08-01 05:38:01.728+00'
	,'20727963'
	,6814
	,6826
	,'2022-07-28 10:01:50.12+00'
	,'2022-08-01 05:31:04.611+00'
	,'633a7346-47f2-4df2-bb25-e9efeeb5ff07'
	,10
	,'2022-08-01 05:31:14.061+00'
	,NULL
	,3.15
	,75.00
	,
	'{"total_tax": 0, "menu_items": [{"variants": [], "item_cgst": 12.5, "item_igst": 12.5, "item_name": "India''s Magic Masala Chips", "item_sgst": 12.5, "item_price": 14, "addon_groups": [], "item_quantity": 5, "item_tax_amount": 0, "total_item_amount": 70, "total_variant_cost": 0, "item_packing_charges": 2.5, "total_addon_group_price": 0, "total_addon_group_tax_amount": 0, "total_individual_food_item_tax": 0, "total_individual_food_item_cost": 70}], "description": {"version": "0.0.1", "total_tax": "Sum of item_tax_amount and total_addon_group_tax_amount in menu_items array", "menu_items": {"item_id": "Menu Itm Id from database", "variants": {"desc": "List of all Variant group with choosed variants", "variant_id": "Variant Id from database", "variant_name": "Variant Name from database", "variant_price": "Variant Price from database", "variant_group_id": "Variant Group Id from database", "variant_group_name": "Variant Group Name from database"}, "item_cgst": "Menu Item CGST Tax Rate from database", "item_igst": "Menu Item IGST Tax Rate from database", "item_name": "Menu Item Name from fatabase", "item_sgst": "Menu Item SGST Tax Rate from database", "item_price": "Menu Item Price from database", "addon_groups": {"addons": {"desc": "List of all Addons selected", "addon_id": "Addon Id from database", "addon_cgst": "Addon CGST Tax Rate from database", "addon_igst": "Addon IGST Tax Rate from database", "addon_name": "Addon Name from database", "addon_sgst": "Addon SGST Tax Rate from database", "addon_price": "Addon Price from database", "addon_tax_amount": "Calculated Tax value from sum of taxes(IGST+CGST+SGST) and applied on addon_price\n  >>> (addon_price / 100)*(addon_cgst+addon_sgst+addon_igst)"}, "free_limit": "", "addon_group_id": "Addon Group Id from database", "addon_group_name": "Addon Group Name from database", "total_addon_price": "Sum Of all addon_price of from addons array", "total_addon_tax_amount": "Sum Of all addon_tax_amount of from addons array"}, "item_quantity": "Menu Item Quantity selected by customer", "item_tax_amount": "Calculated Value of tax applied on food amount if tax is not inclusive\n  >>> ((total_item_amount / 100) * (item_cgst + item_sgst + item_igst))", "total_item_amount": "Calculated Value from adding all selected variants price on top of Menu Item Price\n  >>> ((item_price + total_variant_cost) * item_quantity)", "total_variant_cost": "Sum Of all variant_price of from variants array", "item_packing_charges": "Packing charges of Menu Item if set by restaurant", "total_addon_group_price": "Sum Of all total_addon_price of from addon_groups array", "total_addon_group_tax_amount": "Sum Of all total_addon_tax_amount of from addon_groups array", "total_individual_food_item_tax": "Total Item Tax (including item tax with variant and addons tax)\n  >>> item_tax_amount + total_addon_group_tax_amount", "total_individual_food_item_cost": " Total Item Cost (including item cost with variant cost and addons cost)\n  >>> total_addon_group_price + total_addon_group_price"}, "coupon_details": {"code": "Coupon code from database", "type": "Coupon type from database", "level": "Coupon level from database", "coupon_id": "Coupon Id from database", "discount_percentage": "Coupon discount_percentage from database", "max_discount_rupees": "Coupon max_discount_rupees from database", "discount_amount_rupees": "Coupon discount_amount_rupees from database", "min_order_value_rupees": "Coupon min_order_value_rupees from database", "discount_amount_applied": "Applicable discount amount calculated based on Other values\n  ", "discount_share_amount_vendor": "The Amount Bared by vendor calculated percentage of discount_amount_applied\n  >>>  (discount_amount_applied /100) * discount_share_percentage_vendor", "discount_share_amount_speedyy": "Calculated Rest of the discount amount bared by speedyy\n  >>> discount_amount_applied - discount_share_amount_vendor", "discount_share_percentage_vendor": "Coupon discount_share_percentage_vendor from database", "discount_share_percentage_speedyy": "Coupon discount_share_percentage_speedyy from database"}, "total_food_cost": "Sum of all total_item_amount + total_addon_group_price", "delivery_charges": "By shadow fax based on >>> total_food_cost + total_tax + total_packing_charges - discount_amount_applied", "delivery_order_id": "Shadowfax order id when order is placed", "refundable_amount": "total_food_cost + total_taxes - discount_amount_applied", "transaction_charges": "Calculated on\n  >>> ((total_food_cost + total_taxes + total_packing_charges - discount_amount_applied + delivery_charges) / 100 ) * transaction_charges_rate", "order_packing_charge": "Packing Charges on full order if set by restaurant", "vendor_payout_amount": "total_food_cost + total_taxes + total_packing_charges - discount_share_amount_vendor", "payout_transaction_id": "Payout transaction ID when order payout processing started", "total_packing_charges": "Sum of all item_packing_charges from menu_items and order_packing_charge", "payment_transaction_id": "Payment uuid when payment is made by customer and is verified", "total_customer_payable": "total_food_cost + total_taxes + total_packing_charges - discount_amount_applied + delivery_charges + transaction_charges", "transaction_charges_rate": "From .env: 3%"}, "total_food_cost": 70, "delivery_charges": 30, "delivery_order_id": 20727963, "refundable_amount": 70, "transaction_charges": 3.15, "order_packing_charge": 2.5, "vendor_payout_amount": 75, "total_packing_charges": 5, "payment_transaction_id": "2745210", "total_customer_payable": 108.15, "transaction_charges_rate": 3}'
	,'false'
	,'2022-08-01 05:36:13+00'
	,NULL
	,NULL
	,NULL
	,NULL
	,'shadowfax'
	)
	,(
	3
	,'b0909e52-a731-4665-a791-ee6479008805'
	,'c450acac-2d56-40e9-80fa-ca72a099de91'
	,'3435A77D-C306-4E97-B6C7-10722A40908F'
	,'{"id": "1be81520-9e0f-4383-b9b7-976ecdf45d83", "city": "Bangalore Urban", "name": "home", "email": "ritu.t@speedyy.com", "phone": "+919752962802", "state": "Karnataka", "country": "India", "pincode": "560095", "latitude": "12.941173340380294", "longitude": "77.6213026419282", "created_at": "2022-07-28T12:19:29.734Z", "directions": "near db mall", "updated_at": "2022-08-09T12:05:06.995Z", "customer_id": "c450acac-2d56-40e9-80fa-ca72a099de91", "customer_name": "ritu tiwari", "is_serviceable": true, "alternate_phone": "9999999999", "delivery_details": {"serviceable": true, "delivery_cost": 30, "serviceability": true}, "apartment_road_area": "vip road", "house_flat_block_no": "111"}'
	,NULL
	,'pending'
	,NULL
	,30.00
	,NULL
	,'cancelled'
	,'pending'
	,751.90
	,0.00
	,0.00
	,NULL
	,NULL
	,0
	,''
	,'customer'
	,'{"cancellation_reason": "selected wrong delivery location"}'
	,'2022-07-28 10:02:50.12+00'
	,'c450acac-2d56-40e9-80fa-ca72a099de91'
	,'2022-07-28 10:02:50.12+00'
	,'2022-07-28 10:02:50.12+00'
	,NULL
	,NULL
	,NULL
	,'2022-07-28 10:02:50.12+00'
	,NULL
	,NULL
	,NULL
	,NULL
	,NULL
	,21.90
	,700.00
	,
	'{"total_tax": 0, "menu_items": [{"variants": [{"variant_id": 6142, "variant_name": "2 vadas", "variant_price": 50, "variant_group_id": 1498, "variant_group_name": "vada grp"}], "item_cgst": 5, "item_igst": 5, "item_name": "Idli Sambhar", "item_sgst": 5, "item_price": 50, "addon_groups": [], "item_quantity": 7, "item_tax_amount": 0, "total_item_amount": 700, "total_variant_cost": 50, "item_packing_charges": 0, "total_addon_group_price": 0, "total_addon_group_tax_amount": 0, "total_individual_food_item_tax": 0, "total_individual_food_item_cost": 700}], "description": {"version": "0.0.1", "total_tax": "Sum of item_tax_amount and total_addon_group_tax_amount in menu_items array", "menu_items": {"item_id": "Menu Itm Id from database", "variants": {"desc": "List of all Variant group with choosed variants", "variant_id": "Variant Id from database", "variant_name": "Variant Name from database", "variant_price": "Variant Price from database", "variant_group_id": "Variant Group Id from database", "variant_group_name": "Variant Group Name from database"}, "item_cgst": "Menu Item CGST Tax Rate from database", "item_igst": "Menu Item IGST Tax Rate from database", "item_name": "Menu Item Name from fatabase", "item_sgst": "Menu Item SGST Tax Rate from database", "item_price": "Menu Item Price from database", "addon_groups": {"addons": {"desc": "List of all Addons selected", "addon_id": "Addon Id from database", "addon_cgst": "Addon CGST Tax Rate from database", "addon_igst": "Addon IGST Tax Rate from database", "addon_name": "Addon Name from database", "addon_sgst": "Addon SGST Tax Rate from database", "addon_price": "Addon Price from database", "addon_tax_amount": "Calculated Tax value from sum of taxes(IGST+CGST+SGST) and applied on addon_price\n  >>> (addon_price / 100)*(addon_cgst+addon_sgst+addon_igst)"}, "free_limit": "", "addon_group_id": "Addon Group Id from database", "addon_group_name": "Addon Group Name from database", "total_addon_price": "Sum Of all addon_price of from addons array", "total_addon_tax_amount": "Sum Of all addon_tax_amount of from addons array"}, "item_quantity": "Menu Item Quantity selected by customer", "item_tax_amount": "Calculated Value of tax applied on food amount if tax is not inclusive\n  >>> ((total_item_amount / 100) * (item_cgst + item_sgst + item_igst))", "total_item_amount": "Calculated Value from adding all selected variants price on top of Menu Item Price\n  >>> ((item_price + total_variant_cost) * item_quantity)", "total_variant_cost": "Sum Of all variant_price of from variants array", "item_packing_charges": "Packing charges of Menu Item if set by restaurant", "total_addon_group_price": "(Sum Of all total_addon_price of from addon_groups array) * item_quantity", "total_addon_group_tax_amount": "Sum Of all total_addon_tax_amount of from addon_groups array", "total_individual_food_item_tax": "Total Item Tax (including item tax with variant and addons tax)\n  >>> item_tax_amount + total_addon_group_tax_amount", "total_individual_food_item_cost": " Total Item Cost (including item cost with variant cost and addons cost)\n  >>> total_item_amount + total_addon_group_price"}, "coupon_details": {"code": "Coupon code from database", "type": "Coupon type from database", "level": "Coupon level from database", "coupon_id": "Coupon Id from database", "discount_percentage": "Coupon discount_percentage from database", "max_discount_rupees": "Coupon max_discount_rupees from database", "discount_amount_rupees": "Coupon discount_amount_rupees from database", "min_order_value_rupees": "Coupon min_order_value_rupees from database", "discount_amount_applied": "Applicable discount amount calculated based on Other values\n  ", "discount_share_amount_vendor": "The Amount Bared by vendor calculated percentage of discount_amount_applied\n  >>>  (discount_amount_applied /100) * discount_share_percentage_vendor", "discount_share_amount_speedyy": "Calculated Rest of the discount amount bared by speedyy\n  >>> discount_amount_applied - discount_share_amount_vendor", "discount_share_percentage_vendor": "Coupon discount_share_percentage_vendor from database", "discount_share_percentage_speedyy": "Coupon discount_share_percentage_speedyy from database"}, "total_food_cost": "Sum of all total_item_amount + total_addon_group_price", "delivery_charges": "By shadow fax based on >>> total_food_cost + total_tax + total_packing_charges - discount_amount_applied", "delivery_order_id": "Shadowfax order id when order is placed", "refundable_amount": "total_food_cost + total_taxes - discount_amount_applied", "transaction_charges": "Calculated on\n  >>> ((total_food_cost + total_taxes + total_packing_charges - discount_amount_applied + delivery_charges) / 100 ) * transaction_charges_rate", "order_packing_charge": "Packing Charges on full order if set by restaurant", "vendor_payout_amount": "total_food_cost + total_taxes + total_packing_charges - discount_share_amount_vendor", "payout_transaction_id": "Payout transaction ID when order payout processing started", "total_packing_charges": "Sum of all item_packing_charges from menu_items and order_packing_charge", "payment_transaction_id": "Payment uuid when payment is made by customer and is verified", "total_customer_payable": "total_food_cost + total_taxes + total_packing_charges - discount_amount_applied + delivery_charges + transaction_charges", "transaction_charges_rate": "From .env: 3%"}, "total_food_cost": 700, "delivery_charges": 30, "refundable_amount": 700, "transaction_charges": 21.9, "order_packing_charge": 0, "vendor_payout_amount": 700, "total_packing_charges": 0, "payment_transaction_id": "2806176", "total_customer_payable": 751.9, "transaction_charges_rate": 3}'
	,'false'
	,NULL
	,NULL
	,NULL
	,NULL
	,NULL
	,'shadowfax'
	)
	,(
	4
	,'b0909e52-a731-4665-a791-ee6479008805'
	,'755920ef-2031-466e-8e43-1971184744b5'
	,'4342FDBE-867F-4312-9E82-33398EBF6823'
	,'{"id": "1e30c269-e2da-4139-96ad-fb1c1d3dda36", "city": "Mumbai", "name": "VP", "email": "test@test.com", "phone": "+918976799239", "state": "Maharashtra", "country": " India", "pincode": "123456", "latitude": "19.0967928", "longitude": "72.8516953", "created_at": "2022-07-28T10:27:31.941Z", "directions": "Walking", "updated_at": "2022-07-28T10:27:31.941Z", "customer_id": "755920ef-2031-466e-8e43-1971184744b5", "customer_name": "Nikhil Muskie", "is_serviceable": true, "alternate_phone": null, "delivery_details": {"serviceable": true, "delivery_cost": 30, "serviceability": true}, "apartment_road_area": "ABC TEST", "house_flat_block_no": "ABC, TEST"}'
	,'2022-07-28 11:44:06.232+00'
	,'delivered'
	,'{"returns": {}, "drop_eta": null, "rider_id": 2052, "pickup_eta": null, "rider_name": "Aastha Jain", "return_skus": [], "order_status": "DELIVERED", "delivery_time": "2022-07-28T11:43:29.000000Z", "rider_contact": "8750879029", "drop_image_url": null, "rider_latitude": 35.568624, "client_order_id": "390", "rider_longitude": 77.84621, "delivery_order_id": 20727648}'
	,30.00
	,NULL
	,'completed'
	,'accepted'
	,319.30
	,0.00
	,5.00
	,100.00
	,32
	,1
	,''
	,NULL
	,NULL
	,NULL
	,NULL
	,'2022-07-28 11:35:21.717751+00'
	,'2022-07-28 11:44:06.232+00'
	,'20727648'
	,12063
	,12095
	,'2022-07-28 10:03:50.12+00'
	,'2022-07-28 11:36:36.129+00'
	,'c308560c-9913-4736-bd4f-11bc3129b07a'
	,20
	,'2022-07-28 11:36:41.958+00'
	,NULL
	,9.30
	,380.00
	,
	'{"total_tax": 0, "menu_items": [{"variants": [], "item_cgst": 12.5, "item_igst": 12.5, "item_name": "Miz Veg Maggi", "item_sgst": 12.5, "item_price": 125, "addon_groups": [], "item_quantity": 3, "item_tax_amount": 0, "total_item_amount": 375, "total_variant_cost": 0, "item_packing_charges": 2.5, "total_addon_group_price": 0, "total_addon_group_tax_amount": 0, "total_individual_food_item_tax": 0, "total_individual_food_item_cost": 375}], "description": {"version": "0.0.1", "total_tax": "Sum of item_tax_amount and total_addon_group_tax_amount in menu_items array", "menu_items": {"item_id": "Menu Itm Id from database", "variants": {"desc": "List of all Variant group with choosed variants", "variant_id": "Variant Id from database", "variant_name": "Variant Name from database", "variant_price": "Variant Price from database", "variant_group_id": "Variant Group Id from database", "variant_group_name": "Variant Group Name from database"}, "item_cgst": "Menu Item CGST Tax Rate from database", "item_igst": "Menu Item IGST Tax Rate from database", "item_name": "Menu Item Name from fatabase", "item_sgst": "Menu Item SGST Tax Rate from database", "item_price": "Menu Item Price from database", "addon_groups": {"addons": {"desc": "List of all Addons selected", "addon_id": "Addon Id from database", "addon_cgst": "Addon CGST Tax Rate from database", "addon_igst": "Addon IGST Tax Rate from database", "addon_name": "Addon Name from database", "addon_sgst": "Addon SGST Tax Rate from database", "addon_price": "Addon Price from database", "addon_tax_amount": "Calculated Tax value from sum of taxes(IGST+CGST+SGST) and applied on addon_price\n  >>> (addon_price / 100)*(addon_cgst+addon_sgst+addon_igst)"}, "free_limit": "", "addon_group_id": "Addon Group Id from database", "addon_group_name": "Addon Group Name from database", "total_addon_price": "Sum Of all addon_price of from addons array", "total_addon_tax_amount": "Sum Of all addon_tax_amount of from addons array"}, "item_quantity": "Menu Item Quantity selected by customer", "item_tax_amount": "Calculated Value of tax applied on food amount if tax is not inclusive\n  >>> ((total_item_amount / 100) * (item_cgst + item_sgst + item_igst))", "total_item_amount": "Calculated Value from adding all selected variants price on top of Menu Item Price\n  >>> ((item_price + total_variant_cost) * item_quantity)", "total_variant_cost": "Sum Of all variant_price of from variants array", "item_packing_charges": "Packing charges of Menu Item if set by restaurant", "total_addon_group_price": "Sum Of all total_addon_price of from addon_groups array", "total_addon_group_tax_amount": "Sum Of all total_addon_tax_amount of from addon_groups array", "total_individual_food_item_tax": "Total Item Tax (including item tax with variant and addons tax)\n  >>> item_tax_amount + total_addon_group_tax_amount", "total_individual_food_item_cost": " Total Item Cost (including item cost with variant cost and addons cost)\n  >>> total_addon_group_price + total_addon_group_price"}, "coupon_details": {"code": "Coupon code from database", "type": "Coupon type from database", "level": "Coupon level from database", "coupon_id": "Coupon Id from database", "discount_percentage": "Coupon discount_percentage from database", "max_discount_rupees": "Coupon max_discount_rupees from database", "discount_amount_rupees": "Coupon discount_amount_rupees from database", "min_order_value_rupees": "Coupon min_order_value_rupees from database", "discount_amount_applied": "Applicable discount amount calculated based on Other values\n  ", "discount_share_amount_vendor": "The Amount Bared by vendor calculated percentage of discount_amount_applied\n  >>>  (discount_amount_applied /100) * discount_share_percentage_vendor", "discount_share_amount_speedyy": "Calculated Rest of the discount amount bared by speedyy\n  >>> discount_amount_applied - discount_share_amount_vendor", "discount_share_percentage_vendor": "Coupon discount_share_percentage_vendor from database", "discount_share_percentage_speedyy": "Coupon discount_share_percentage_speedyy from database"}, "total_food_cost": "Sum of all total_item_amount + total_addon_group_price", "delivery_charges": "By shadow fax based on >>> total_food_cost + total_tax + total_packing_charges - discount_amount_applied", "delivery_order_id": "Shadowfax order id when order is placed", "refundable_amount": "total_food_cost + total_taxes - discount_amount_applied", "transaction_charges": "Calculated on\n  >>> ((total_food_cost + total_taxes + total_packing_charges - discount_amount_applied + delivery_charges) / 100 ) * transaction_charges_rate", "order_packing_charge": "Packing Charges on full order if set by restaurant", "vendor_payout_amount": "total_food_cost + total_taxes + total_packing_charges - discount_share_amount_vendor", "payout_transaction_id": "Payout transaction ID when order payout processing started", "total_packing_charges": "Sum of all item_packing_charges from menu_items and order_packing_charge", "payment_transaction_id": "Payment uuid when payment is made by customer and is verified", "total_customer_payable": "total_food_cost + total_taxes + total_packing_charges - discount_amount_applied + delivery_charges + transaction_charges", "transaction_charges_rate": "From .env: 3%"}, "coupon_details": {"code": "NEW100", "type": "flat", "level": "global", "coupon_id": 32, "discount_percentage": 0, "max_discount_rupees": 0, "discount_amount_rupees": 100, "min_order_value_rupees": 300, "discount_amount_applied": 100, "discount_share_amount_vendor": 0, "discount_share_amount_speedyy": 100, "discount_share_percentage_vendor": 0, "discount_share_percentage_speedyy": 100}, "total_food_cost": 375, "delivery_charges": 30, "delivery_order_id": 20727648, "refundable_amount": 275, "transaction_charges": 9.3, "order_packing_charge": 2.5, "vendor_payout_amount": 380, "total_packing_charges": 5, "payment_transaction_id": "2734828", "total_customer_payable": 319.3, "transaction_charges_rate": 3}'
	,'false'
	,'2022-07-28 11:42:58+00'
	,'Loved it'
	,NULL
	,NULL
	,NULL
	,'shadowfax'
	)
	,(
	5
	,'b0909e52-a731-4665-a791-ee6479008805'
	,'4b6cdf35-fc28-40b0-a08a-c8e0aa603985'
	,'12412423432424413213123'
	,'{"id": "6defb680-b446-4060-9919-7fc559d6b969", "city": "Mumbai", "name": "Add 3", "email": "amogh.c@speedyy.com", "phone": "+919819997648", "state": "Maharashtra", "country": "India", "pincode": "012345", "latitude": "23.045715", "longitude": "72.530396", "created_at": "2022-07-28 10:04:50.12+00", "directions": "ABC", "updated_at": "2022-07-28 10:04:50.12+00", "customer_id": "4b6cdf35-fc28-40b0-a08a-c8e0aa603985", "customer_name": "Amogh Chavan", "is_serviceable": true, "alternate_phone": null, "delivery_details": {"serviceable": true, "delivery_cost": 30, "serviceability": true}, "apartment_road_area": "apartment_road_area.", "house_flat_block_no": "HouseNumber,Wing,Block Number,"}'
	,NULL
	,'pending'
	,NULL
	,30.00
	,NULL
	,'placed'
	,'accepted'
	,105.58
	,0.00
	,2.50
	,NULL
	,NULL
	,-1
	,NULL
	,NULL
	,NULL
	,NULL
	,NULL
	,'2022-07-28 10:04:50.12+00'
	,'2022-07-28 10:04:50.12+00'
	,'20729066'
	,5
	,5
	,'2022-07-28 10:04:50.12+00'
	,'2022-08-16 12:14:25.181+00'
	,'633a7346-47f2-4df2-bb25-e9efeeb5ff07'
	,10
	,NULL
	,NULL
	,3.08
	,72.50
	,
	'{"total_tax": 0, "menu_items": [{"variants": [], "item_cgst": 12.5, "item_igst": 12.5, "item_name": "India''s Magic Masala Chips", "item_sgst": 12.5, "item_price": 14, "addon_groups": [], "item_quantity": 5, "item_tax_amount": 0, "total_item_amount": 70, "total_variant_cost": 0, "item_packing_charges": 2.5, "total_addon_group_price": 0, "total_addon_group_tax_amount": 0, "total_individual_food_item_tax": 0, "total_individual_food_item_cost": 70}], "description": {"version": "0.0.1", "total_tax": "Sum of item_tax_amount and total_addon_group_tax_amount in menu_items array", "menu_items": {"item_id": "Menu Itm Id from database", "variants": {"desc": "List of all Variant group with choosed variants", "variant_id": "Variant Id from database", "variant_name": "Variant Name from database", "variant_price": "Variant Price from database", "variant_group_id": "Variant Group Id from database", "variant_group_name": "Variant Group Name from database"}, "item_cgst": "Menu Item CGST Tax Rate from database", "item_igst": "Menu Item IGST Tax Rate from database", "item_name": "Menu Item Name from fatabase", "item_sgst": "Menu Item SGST Tax Rate from database", "item_price": "Menu Item Price from database", "addon_groups": {"addons": {"desc": "List of all Addons selected", "addon_id": "Addon Id from database", "addon_cgst": "Addon CGST Tax Rate from database", "addon_igst": "Addon IGST Tax Rate from database", "addon_name": "Addon Name from database", "addon_sgst": "Addon SGST Tax Rate from database", "addon_price": "Addon Price from database", "addon_tax_amount": "Calculated Tax value from sum of taxes(IGST+CGST+SGST) and applied on addon_price\n  >>> (addon_price / 100)*(addon_cgst+addon_sgst+addon_igst)"}, "free_limit": "", "addon_group_id": "Addon Group Id from database", "addon_group_name": "Addon Group Name from database", "total_addon_price": "Sum Of all addon_price of from addons array", "total_addon_tax_amount": "Sum Of all addon_tax_amount of from addons array"}, "item_quantity": "Menu Item Quantity selected by customer", "item_tax_amount": "Calculated Value of tax applied on food amount if tax is not inclusive\n  >>> ((total_item_amount / 100) * (item_cgst + item_sgst + item_igst))", "total_item_amount": "Calculated Value from adding all selected variants price on top of Menu Item Price\n  >>> ((item_price + total_variant_cost) * item_quantity)", "total_variant_cost": "Sum Of all variant_price of from variants array", "item_packing_charges": "Packing charges of Menu Item if set by restaurant", "total_addon_group_price": "(Sum Of all total_addon_price of from addon_groups array) * item_quantity", "total_addon_group_tax_amount": "Sum Of all total_addon_tax_amount of from addon_groups array", "total_individual_food_item_tax": "Total Item Tax (including item tax with variant and addons tax)\n  >>> item_tax_amount + total_addon_group_tax_amount", "total_individual_food_item_cost": " Total Item Cost (including item cost with variant cost and addons cost)\n  >>> total_item_amount + total_addon_group_price"}, "coupon_details": {"code": "Coupon code from database", "type": "Coupon type from database", "level": "Coupon level from database", "coupon_id": "Coupon Id from database", "discount_percentage": "Coupon discount_percentage from database", "max_discount_rupees": "Coupon max_discount_rupees from database", "discount_amount_rupees": "Coupon discount_amount_rupees from database", "min_order_value_rupees": "Coupon min_order_value_rupees from database", "discount_amount_applied": "Applicable discount amount calculated based on Other values\n  ", "discount_share_amount_vendor": "The Amount Bared by vendor calculated percentage of discount_amount_applied\n  >>>  (discount_amount_applied /100) * discount_share_percentage_vendor", "discount_share_amount_speedyy": "Calculated Rest of the discount amount bared by speedyy\n  >>> discount_amount_applied - discount_share_amount_vendor", "discount_share_percentage_vendor": "Coupon discount_share_percentage_vendor from database", "discount_share_percentage_speedyy": "Coupon discount_share_percentage_speedyy from database"}, "total_food_cost": "Sum of all total_item_amount + total_addon_group_price", "delivery_charges": "By shadow fax based on >>> total_food_cost + total_tax + total_packing_charges - discount_amount_applied", "delivery_order_id": "Shadowfax order id when order is placed", "refundable_amount": "total_food_cost + total_taxes - discount_amount_applied", "transaction_charges": "Calculated on\n  >>> ((total_food_cost + total_taxes + total_packing_charges - discount_amount_applied + delivery_charges) / 100 ) * transaction_charges_rate", "order_packing_charge": "Packing Charges on full order if set by restaurant", "vendor_payout_amount": "total_food_cost + total_taxes + total_packing_charges - discount_share_amount_vendor", "payout_transaction_id": "Payout transaction ID when order payout processing started", "total_packing_charges": "Sum of all item_packing_charges from menu_items and order_packing_charge", "payment_transaction_id": "Payment uuid when payment is made by customer and is verified", "total_customer_payable": "total_food_cost + total_taxes + total_packing_charges - discount_amount_applied + delivery_charges + transaction_charges", "transaction_charges_rate": "From .env: 3%"}, "total_food_cost": 70, "delivery_charges": 30, "delivery_order_id": 20729066, "refundable_amount": 70, "transaction_charges": 3.08, "order_packing_charge": 2.5, "vendor_payout_amount": 72.5, "total_packing_charges": 2.5, "payment_transaction_id": "8975642", "total_customer_payable": 105.58, "transaction_charges_rate": 3}'
	,'false'
	,NULL
	,NULL
	,NULL
	,NULL
	,NULL
	,'shadowfax'
	)
	,(
	6
	,'b0909e52-a731-4665-a791-ee6479008805'
	,'4b6cdf35-fc28-40b0-a08a-c8e0aa603985'
	,'12412423432424413213123'
	,'{"id": "aedb2abf-ebf8-4703-b7ca-21c2e54fffa7", "city": "Mumbai", "name": "AMOGH add1", "email": "amogh.c@speedyy.com", "phone": "+919819997648", "state": "Maharashtra", "country": "India", "pincode": "0", "latitude": "23.045715", "longitude": "72.530396", "created_at": "2022-07-29T04:22:49.912Z", "directions": "ABC", "updated_at": "2022-08-01T04:49:24.787Z", "customer_id": "4b6cdf35-fc28-40b0-a08a-c8e0aa603985", "customer_name": "Amogh Chavan", "is_serviceable": true, "alternate_phone": null, "delivery_details": {"serviceable": true, "delivery_cost": 30, "serviceability": true}, "apartment_road_area": "apartment_road_area.", "house_flat_block_no": "HouseNumber,Wing,Block Number,"}'
	,'2022-08-01 05:38:01+00'
	,'delivered'
	,'{"returns": {}, "drop_eta": null, "rider_id": 2052, "pickup_eta": null, "rider_name": "Aastha Jain", "return_skus": [], "order_status": "DELIVERED", "delivery_time": "2022-08-01T05:38:01.000000Z", "rider_contact": "8750879029", "drop_image_url": null, "rider_latitude": 35.568624, "client_order_id": "574", "rider_longitude": 77.84621, "delivery_order_id": 20727963}'
	,30.00
	,NULL
	,'completed'
	,'accepted'
	,108.15
	,0.00
	,5.00
	,NULL
	,NULL
	,0
	,NULL
	,NULL
	,NULL
	,NULL
	,NULL
	,'2022-08-01 05:26:50.636772+00'
	,'2022-08-01 05:38:01.728+00'
	,'20727963'
	,6814
	,6826
	,'2022-07-28 10:05:50.12+00'
	,'2022-08-01 05:31:04.611+00'
	,'633a7346-47f2-4df2-bb25-e9efeeb5ff07'
	,10
	,'2022-08-01 05:31:14.061+00'
	,NULL
	,3.15
	,75.00
	,
	'{"total_tax": 0, "menu_items": [{"variants": [], "item_cgst": 12.5, "item_igst": 12.5, "item_name": "India''s Magic Masala Chips", "item_sgst": 12.5, "item_price": 14, "addon_groups": [], "item_quantity": 5, "item_tax_amount": 0, "total_item_amount": 70, "total_variant_cost": 0, "item_packing_charges": 2.5, "total_addon_group_price": 0, "total_addon_group_tax_amount": 0, "total_individual_food_item_tax": 0, "total_individual_food_item_cost": 70}], "description": {"version": "0.0.1", "total_tax": "Sum of item_tax_amount and total_addon_group_tax_amount in menu_items array", "menu_items": {"item_id": "Menu Itm Id from database", "variants": {"desc": "List of all Variant group with choosed variants", "variant_id": "Variant Id from database", "variant_name": "Variant Name from database", "variant_price": "Variant Price from database", "variant_group_id": "Variant Group Id from database", "variant_group_name": "Variant Group Name from database"}, "item_cgst": "Menu Item CGST Tax Rate from database", "item_igst": "Menu Item IGST Tax Rate from database", "item_name": "Menu Item Name from fatabase", "item_sgst": "Menu Item SGST Tax Rate from database", "item_price": "Menu Item Price from database", "addon_groups": {"addons": {"desc": "List of all Addons selected", "addon_id": "Addon Id from database", "addon_cgst": "Addon CGST Tax Rate from database", "addon_igst": "Addon IGST Tax Rate from database", "addon_name": "Addon Name from database", "addon_sgst": "Addon SGST Tax Rate from database", "addon_price": "Addon Price from database", "addon_tax_amount": "Calculated Tax value from sum of taxes(IGST+CGST+SGST) and applied on addon_price\n  >>> (addon_price / 100)*(addon_cgst+addon_sgst+addon_igst)"}, "free_limit": "", "addon_group_id": "Addon Group Id from database", "addon_group_name": "Addon Group Name from database", "total_addon_price": "Sum Of all addon_price of from addons array", "total_addon_tax_amount": "Sum Of all addon_tax_amount of from addons array"}, "item_quantity": "Menu Item Quantity selected by customer", "item_tax_amount": "Calculated Value of tax applied on food amount if tax is not inclusive\n  >>> ((total_item_amount / 100) * (item_cgst + item_sgst + item_igst))", "total_item_amount": "Calculated Value from adding all selected variants price on top of Menu Item Price\n  >>> ((item_price + total_variant_cost) * item_quantity)", "total_variant_cost": "Sum Of all variant_price of from variants array", "item_packing_charges": "Packing charges of Menu Item if set by restaurant", "total_addon_group_price": "Sum Of all total_addon_price of from addon_groups array", "total_addon_group_tax_amount": "Sum Of all total_addon_tax_amount of from addon_groups array", "total_individual_food_item_tax": "Total Item Tax (including item tax with variant and addons tax)\n  >>> item_tax_amount + total_addon_group_tax_amount", "total_individual_food_item_cost": " Total Item Cost (including item cost with variant cost and addons cost)\n  >>> total_addon_group_price + total_addon_group_price"}, "coupon_details": {"code": "Coupon code from database", "type": "Coupon type from database", "level": "Coupon level from database", "coupon_id": "Coupon Id from database", "discount_percentage": "Coupon discount_percentage from database", "max_discount_rupees": "Coupon max_discount_rupees from database", "discount_amount_rupees": "Coupon discount_amount_rupees from database", "min_order_value_rupees": "Coupon min_order_value_rupees from database", "discount_amount_applied": "Applicable discount amount calculated based on Other values\n  ", "discount_share_amount_vendor": "The Amount Bared by vendor calculated percentage of discount_amount_applied\n  >>>  (discount_amount_applied /100) * discount_share_percentage_vendor", "discount_share_amount_speedyy": "Calculated Rest of the discount amount bared by speedyy\n  >>> discount_amount_applied - discount_share_amount_vendor", "discount_share_percentage_vendor": "Coupon discount_share_percentage_vendor from database", "discount_share_percentage_speedyy": "Coupon discount_share_percentage_speedyy from database"}, "total_food_cost": "Sum of all total_item_amount + total_addon_group_price", "delivery_charges": "By shadow fax based on >>> total_food_cost + total_tax + total_packing_charges - discount_amount_applied", "delivery_order_id": "Shadowfax order id when order is placed", "refundable_amount": "total_food_cost + total_taxes - discount_amount_applied", "transaction_charges": "Calculated on\n  >>> ((total_food_cost + total_taxes + total_packing_charges - discount_amount_applied + delivery_charges) / 100 ) * transaction_charges_rate", "order_packing_charge": "Packing Charges on full order if set by restaurant", "vendor_payout_amount": "total_food_cost + total_taxes + total_packing_charges - discount_share_amount_vendor", "payout_transaction_id": "Payout transaction ID when order payout processing started", "total_packing_charges": "Sum of all item_packing_charges from menu_items and order_packing_charge", "payment_transaction_id": "Payment uuid when payment is made by customer and is verified", "total_customer_payable": "total_food_cost + total_taxes + total_packing_charges - discount_amount_applied + delivery_charges + transaction_charges", "transaction_charges_rate": "From .env: 3%"}, "total_food_cost": 70, "delivery_charges": 30, "delivery_order_id": 20727963, "refundable_amount": 70, "transaction_charges": 3.15, "order_packing_charge": 2.5, "vendor_payout_amount": 75, "total_packing_charges": 5, "payment_transaction_id": "2745210", "total_customer_payable": 108.15, "transaction_charges_rate": 3}'
	,'false'
	,'2022-08-01 05:36:13+00'
	,NULL
	,NULL
	,NULL
	,NULL
	,'shadowfax'
	)
	,(
	7
	,'b0909e52-a731-4665-a791-ee6479008805'
	,'6c31b2ca-08f7-4a9c-b59b-9c1fe1dc9734'
	,'61DF45BA-256B-414F-B3AD-D0CF91956966'
	,'{"id": "1ed97a67-3787-419b-8de2-582a6eae94e7", "city": "Bengaluru", "name": "KM", "email": "test@test.com", "phone": "+918976799239", "state": "Karnataka", "country": " India", "pincode": "123456", "latitude": "12.9411733", "longitude": "77.6213028", "created_at": "2022-08-16T10:22:24.836Z", "directions": "Bus", "updated_at": "2022-08-16T10:22:24.836Z", "customer_id": "6c31b2ca-08f7-4a9c-b59b-9c1fe1dc9734", "customer_name": "Nikhil Muskur", "is_serviceable": true, "alternate_phone": null, "delivery_details": {"serviceable": true, "delivery_cost": 30, "serviceability": true}, "apartment_road_area": "KM Area", "house_flat_block_no": "KM Road"}'
	,NULL
	,'pending'
	,NULL
	,30.00
	,NULL
	,'placed'
	,'accepted'
	,2526.07
	,0.00
	,2.50
	,100.00
	,32
	,-1
	,''
	,NULL
	,NULL
	,NULL
	,NULL
	,'2022-08-16 10:27:09.808503+00'
	,'2022-08-16 10:31:21.985+00'
	,'20729046'
	,5
	,5
	,'2022-07-28 10:06:50.502+00'
	,'2022-08-16 10:30:27.628+00'
	,'3a55364b-0410-4a89-8bb4-64118b749cc3'
	,25
	,'2022-08-16 10:31:21.985+00'
	,NULL
	,73.57
	,2522.50
	,
	'{"total_tax": 0, "menu_items": [{"variants": [], "item_cgst": 12.5, "item_igst": 12.5, "item_name": "Raita", "item_sgst": 12.5, "item_price": 55, "addon_groups": [], "item_quantity": 2, "item_tax_amount": 0, "total_item_amount": 110, "total_variant_cost": 0, "item_packing_charges": 2.5, "total_addon_group_price": 0, "total_addon_group_tax_amount": 0, "total_individual_food_item_tax": 0, "total_individual_food_item_cost": 110}, {"variants": [], "item_cgst": 12.5, "item_igst": 12.5, "item_name": "Donne Veg Biryani (Exclusive Packaging)", "item_sgst": 12.5, "item_price": 199, "addon_groups": [{"addons": [{"addon_id": 2075, "addon_cgst": 0, "addon_igst": 0, "addon_name": "Babycorn Pudina Dry", "addon_sgst": 0, "addon_price": 219, "addon_tax_amount": 0}, {"addon_id": 2076, "addon_cgst": 0, "addon_igst": 0, "addon_name": "Paneer Sholay Kebab", "addon_sgst": 0, "addon_price": 229, "addon_tax_amount": 0}, {"addon_id": 2077, "addon_cgst": 0, "addon_igst": 0, "addon_name": "Mushroom Ghee Roast", "addon_sgst": 0, "addon_price": 229, "addon_tax_amount": 0}], "free_limit": -1, "addon_group_id": 382, "addon_group_name": "Veg Starters", "total_addon_price": 677, "total_addon_tax_amount": 0}, {"addons": [{"addon_id": 2078, "addon_cgst": 0, "addon_igst": 0, "addon_name": "Gulab Jamoon (2Pcs)", "addon_sgst": 0, "addon_price": 50, "addon_tax_amount": 0}, {"addon_id": 2079, "addon_cgst": 0, "addon_igst": 0, "addon_name": "Rasmalai Cremeux", "addon_sgst": 0, "addon_price": 110, "addon_tax_amount": 0}, {"addon_id": 2080, "addon_cgst": 0, "addon_igst": 0, "addon_name": "Double Ka Meetha (3 Pcs )", "addon_sgst": 0, "addon_price": 79, "addon_tax_amount": 0}], "free_limit": -1, "addon_group_id": 383, "addon_group_name": "Desserts", "total_addon_price": 239, "total_addon_tax_amount": 0}, {"addons": [{"addon_id": 2081, "addon_cgst": 0, "addon_igst": 0, "addon_name": "Butter milk", "addon_sgst": 0, "addon_price": 40, "addon_tax_amount": 0}, {"addon_id": 2082, "addon_cgst": 0, "addon_igst": 0, "addon_name": "7 UP - 250 ML", "addon_sgst": 0, "addon_price": 25, "addon_tax_amount": 0}, {"addon_id": 2083, "addon_cgst": 0, "addon_igst": 0, "addon_name": "Pepsi- 250 ML", "addon_sgst": 0, "addon_price": 25, "addon_tax_amount": 0}], "free_limit": -1, "addon_group_id": 384, "addon_group_name": "Beverages", "total_addon_price": 90, "total_addon_tax_amount": 0}], "item_quantity": 2, "item_tax_amount": 0, "total_item_amount": 398, "total_variant_cost": 0, "item_packing_charges": 2.5, "total_addon_group_price": 2012, "total_addon_group_tax_amount": 0, "total_individual_food_item_tax": 0, "total_individual_food_item_cost": 2410}], "description": {"version": "0.0.1", "total_tax": "Sum of item_tax_amount and total_addon_group_tax_amount in menu_items array", "menu_items": {"item_id": "Menu Itm Id from database", "variants": {"desc": "List of all Variant group with choosed variants", "variant_id": "Variant Id from database", "variant_name": "Variant Name from database", "variant_price": "Variant Price from database", "variant_group_id": "Variant Group Id from database", "variant_group_name": "Variant Group Name from database"}, "item_cgst": "Menu Item CGST Tax Rate from database", "item_igst": "Menu Item IGST Tax Rate from database", "item_name": "Menu Item Name from fatabase", "item_sgst": "Menu Item SGST Tax Rate from database", "item_price": "Menu Item Price from database", "addon_groups": {"addons": {"desc": "List of all Addons selected", "addon_id": "Addon Id from database", "addon_cgst": "Addon CGST Tax Rate from database", "addon_igst": "Addon IGST Tax Rate from database", "addon_name": "Addon Name from database", "addon_sgst": "Addon SGST Tax Rate from database", "addon_price": "Addon Price from database", "addon_tax_amount": "Calculated Tax value from sum of taxes(IGST+CGST+SGST) and applied on addon_price\n  >>> (addon_price / 100)*(addon_cgst+addon_sgst+addon_igst)"}, "free_limit": "", "addon_group_id": "Addon Group Id from database", "addon_group_name": "Addon Group Name from database", "total_addon_price": "Sum Of all addon_price of from addons array", "total_addon_tax_amount": "Sum Of all addon_tax_amount of from addons array"}, "item_quantity": "Menu Item Quantity selected by customer", "item_tax_amount": "Calculated Value of tax applied on food amount if tax is not inclusive\n  >>> ((total_item_amount / 100) * (item_cgst + item_sgst + item_igst))", "total_item_amount": "Calculated Value from adding all selected variants price on top of Menu Item Price\n  >>> ((item_price + total_variant_cost) * item_quantity)", "total_variant_cost": "Sum Of all variant_price of from variants array", "item_packing_charges": "Packing charges of Menu Item if set by restaurant", "total_addon_group_price": "(Sum Of all total_addon_price of from addon_groups array) * item_quantity", "total_addon_group_tax_amount": "Sum Of all total_addon_tax_amount of from addon_groups array", "total_individual_food_item_tax": "Total Item Tax (including item tax with variant and addons tax)\n  >>> item_tax_amount + total_addon_group_tax_amount", "total_individual_food_item_cost": " Total Item Cost (including item cost with variant cost and addons cost)\n  >>> total_item_amount + total_addon_group_price"}, "coupon_details": {"code": "Coupon code from database", "type": "Coupon type from database", "level": "Coupon level from database", "coupon_id": "Coupon Id from database", "discount_percentage": "Coupon discount_percentage from database", "max_discount_rupees": "Coupon max_discount_rupees from database", "discount_amount_rupees": "Coupon discount_amount_rupees from database", "min_order_value_rupees": "Coupon min_order_value_rupees from database", "discount_amount_applied": "Applicable discount amount calculated based on Other values\n  ", "discount_share_amount_vendor": "The Amount Bared by vendor calculated percentage of discount_amount_applied\n  >>>  (discount_amount_applied /100) * discount_share_percentage_vendor", "discount_share_amount_speedyy": "Calculated Rest of the discount amount bared by speedyy\n  >>> discount_amount_applied - discount_share_amount_vendor", "discount_share_percentage_vendor": "Coupon discount_share_percentage_vendor from database", "discount_share_percentage_speedyy": "Coupon discount_share_percentage_speedyy from database"}, "total_food_cost": "Sum of all total_item_amount + total_addon_group_price", "delivery_charges": "By shadow fax based on >>> total_food_cost + total_tax + total_packing_charges - discount_amount_applied", "delivery_order_id": "Shadowfax order id when order is placed", "refundable_amount": "total_food_cost + total_taxes - discount_amount_applied", "transaction_charges": "Calculated on\n  >>> ((total_food_cost + total_taxes + total_packing_charges - discount_amount_applied + delivery_charges) / 100 ) * transaction_charges_rate", "order_packing_charge": "Packing Charges on full order if set by restaurant", "vendor_payout_amount": "total_food_cost + total_taxes + total_packing_charges - discount_share_amount_vendor", "payout_transaction_id": "Payout transaction ID when order payout processing started", "total_packing_charges": "Sum of all item_packing_charges from menu_items and order_packing_charge", "payment_transaction_id": "Payment uuid when payment is made by customer and is verified", "total_customer_payable": "total_food_cost + total_taxes + total_packing_charges - discount_amount_applied + delivery_charges + transaction_charges", "transaction_charges_rate": "From .env: 3%"}, "coupon_details": {"code": "NEW100", "type": "flat", "level": "global", "coupon_id": 32, "discount_percentage": 0, "max_discount_rupees": 0, "discount_amount_rupees": 100, "min_order_value_rupees": 300, "discount_amount_applied": 100, "discount_share_amount_vendor": 0, "discount_share_amount_speedyy": 100, "discount_share_percentage_vendor": 0, "discount_share_percentage_speedyy": 100}, "total_food_cost": 2520, "delivery_charges": 30, "delivery_order_id": 20729046, "refundable_amount": 2420, "transaction_charges": 73.57, "order_packing_charge": 2.5, "vendor_payout_amount": 2522.5, "total_packing_charges": 2.5, "payment_transaction_id": "2733598", "total_customer_payable": 2526.07, "transaction_charges_rate": 3}'
	,'false'
	,NULL
	,NULL
	,NULL
	,NULL
	,NULL
	,'shadowfax'
	)
	,(
	8
	,'b0909e52-a731-4665-a791-ee6479008805'
	,'755920ef-2031-466e-8e43-1971184744b5'
	,'4342FDBE-867F-4312-9E82-33398EBF6823'
	,'{"id": "1e30c269-e2da-4139-96ad-fb1c1d3dda36", "city": "Mumbai", "name": "VP", "email": "test@test.com", "phone": "+918976799239", "state": "Maharashtra", "country": " India", "pincode": "123456", "latitude": "19.0967928", "longitude": "72.8516953", "created_at": "2022-07-28T10:27:31.941Z", "directions": "Walking", "updated_at": "2022-07-28T10:27:31.941Z", "customer_id": "755920ef-2031-466e-8e43-1971184744b5", "customer_name": "Nikhil Muskie", "is_serviceable": true, "alternate_phone": null, "delivery_details": {"serviceable": true, "delivery_cost": 30, "serviceability": true}, "apartment_road_area": "ABC TEST", "house_flat_block_no": "ABC, TEST"}'
	,'2022-07-28 11:44:06.232+00'
	,'delivered'
	,'{"returns": {}, "drop_eta": null, "rider_id": 2052, "pickup_eta": null, "rider_name": "Aastha Jain", "return_skus": [], "order_status": "DELIVERED", "delivery_time": "2022-07-28T11:43:29.000000Z", "rider_contact": "8750879029", "drop_image_url": null, "rider_latitude": 35.568624, "client_order_id": "390", "rider_longitude": 77.84621, "delivery_order_id": 20727649}'
	,30.00
	,NULL
	,'completed'
	,'accepted'
	,319.30
	,0.00
	,5.00
	,100.00
	,32
	,1
	,''
	,NULL
	,NULL
	,NULL
	,NULL
	,'2022-07-28 11:35:21.717751+00'
	,'2022-07-28 11:44:06.232+00'
	,'20727648'
	,12063
	,12095
	,'2022-07-28 10:07:30.105+00'
	,'2022-07-28 11:36:36.129+00'
	,'c308560c-9913-4736-bd4f-11bc3129b07a'
	,20
	,'2022-07-28 11:36:41.958+00'
	,NULL
	,9.30
	,380.00
	,
	'{"total_tax": 0, "menu_items": [{"variants": [], "item_cgst": 12.5, "item_igst": 12.5, "item_name": "Miz Veg Maggi", "item_sgst": 12.5, "item_price": 125, "addon_groups": [], "item_quantity": 3, "item_tax_amount": 0, "total_item_amount": 375, "total_variant_cost": 0, "item_packing_charges": 2.5, "total_addon_group_price": 0, "total_addon_group_tax_amount": 0, "total_individual_food_item_tax": 0, "total_individual_food_item_cost": 375}], "description": {"version": "0.0.1", "total_tax": "Sum of item_tax_amount and total_addon_group_tax_amount in menu_items array", "menu_items": {"item_id": "Menu Itm Id from database", "variants": {"desc": "List of all Variant group with choosed variants", "variant_id": "Variant Id from database", "variant_name": "Variant Name from database", "variant_price": "Variant Price from database", "variant_group_id": "Variant Group Id from database", "variant_group_name": "Variant Group Name from database"}, "item_cgst": "Menu Item CGST Tax Rate from database", "item_igst": "Menu Item IGST Tax Rate from database", "item_name": "Menu Item Name from fatabase", "item_sgst": "Menu Item SGST Tax Rate from database", "item_price": "Menu Item Price from database", "addon_groups": {"addons": {"desc": "List of all Addons selected", "addon_id": "Addon Id from database", "addon_cgst": "Addon CGST Tax Rate from database", "addon_igst": "Addon IGST Tax Rate from database", "addon_name": "Addon Name from database", "addon_sgst": "Addon SGST Tax Rate from database", "addon_price": "Addon Price from database", "addon_tax_amount": "Calculated Tax value from sum of taxes(IGST+CGST+SGST) and applied on addon_price\n  >>> (addon_price / 100)*(addon_cgst+addon_sgst+addon_igst)"}, "free_limit": "", "addon_group_id": "Addon Group Id from database", "addon_group_name": "Addon Group Name from database", "total_addon_price": "Sum Of all addon_price of from addons array", "total_addon_tax_amount": "Sum Of all addon_tax_amount of from addons array"}, "item_quantity": "Menu Item Quantity selected by customer", "item_tax_amount": "Calculated Value of tax applied on food amount if tax is not inclusive\n  >>> ((total_item_amount / 100) * (item_cgst + item_sgst + item_igst))", "total_item_amount": "Calculated Value from adding all selected variants price on top of Menu Item Price\n  >>> ((item_price + total_variant_cost) * item_quantity)", "total_variant_cost": "Sum Of all variant_price of from variants array", "item_packing_charges": "Packing charges of Menu Item if set by restaurant", "total_addon_group_price": "Sum Of all total_addon_price of from addon_groups array", "total_addon_group_tax_amount": "Sum Of all total_addon_tax_amount of from addon_groups array", "total_individual_food_item_tax": "Total Item Tax (including item tax with variant and addons tax)\n  >>> item_tax_amount + total_addon_group_tax_amount", "total_individual_food_item_cost": " Total Item Cost (including item cost with variant cost and addons cost)\n  >>> total_addon_group_price + total_addon_group_price"}, "coupon_details": {"code": "Coupon code from database", "type": "Coupon type from database", "level": "Coupon level from database", "coupon_id": "Coupon Id from database", "discount_percentage": "Coupon discount_percentage from database", "max_discount_rupees": "Coupon max_discount_rupees from database", "discount_amount_rupees": "Coupon discount_amount_rupees from database", "min_order_value_rupees": "Coupon min_order_value_rupees from database", "discount_amount_applied": "Applicable discount amount calculated based on Other values\n  ", "discount_share_amount_vendor": "The Amount Bared by vendor calculated percentage of discount_amount_applied\n  >>>  (discount_amount_applied /100) * discount_share_percentage_vendor", "discount_share_amount_speedyy": "Calculated Rest of the discount amount bared by speedyy\n  >>> discount_amount_applied - discount_share_amount_vendor", "discount_share_percentage_vendor": "Coupon discount_share_percentage_vendor from database", "discount_share_percentage_speedyy": "Coupon discount_share_percentage_speedyy from database"}, "total_food_cost": "Sum of all total_item_amount + total_addon_group_price", "delivery_charges": "By shadow fax based on >>> total_food_cost + total_tax + total_packing_charges - discount_amount_applied", "delivery_order_id": "Shadowfax order id when order is placed", "refundable_amount": "total_food_cost + total_taxes - discount_amount_applied", "transaction_charges": "Calculated on\n  >>> ((total_food_cost + total_taxes + total_packing_charges - discount_amount_applied + delivery_charges) / 100 ) * transaction_charges_rate", "order_packing_charge": "Packing Charges on full order if set by restaurant", "vendor_payout_amount": "total_food_cost + total_taxes + total_packing_charges - discount_share_amount_vendor", "payout_transaction_id": "Payout transaction ID when order payout processing started", "total_packing_charges": "Sum of all item_packing_charges from menu_items and order_packing_charge", "payment_transaction_id": "Payment uuid when payment is made by customer and is verified", "total_customer_payable": "total_food_cost + total_taxes + total_packing_charges - discount_amount_applied + delivery_charges + transaction_charges", "transaction_charges_rate": "From .env: 3%"}, "coupon_details": {"code": "NEW100", "type": "flat", "level": "global", "coupon_id": 32, "discount_percentage": 0, "max_discount_rupees": 0, "discount_amount_rupees": 100, "min_order_value_rupees": 300, "discount_amount_applied": 100, "discount_share_amount_vendor": 0, "discount_share_amount_speedyy": 100, "discount_share_percentage_vendor": 0, "discount_share_percentage_speedyy": 100}, "total_food_cost": 375, "delivery_charges": 30, "delivery_order_id": 20727648, "refundable_amount": 275, "transaction_charges": 9.3, "order_packing_charge": 2.5, "vendor_payout_amount": 380, "total_packing_charges": 5, "payment_transaction_id": "2734828", "total_customer_payable": 319.3, "transaction_charges_rate": 3}'
	,'false'
	,'2022-07-28 11:42:58+00'
	,'Loved it'
	,NULL
	,NULL
	,NULL
	,'shadowfax'
	)
	,(
	9
	,'b0909e52-a731-4665-a791-ee6479008805'
	,'755920ef-2031-466e-8e43-1971184744b5'
	,'4342FDBE-867F-4312-9E82-33398EBF6823'
	,'{"id": "1e30c269-e2da-4139-96ad-fb1c1d3dda36", "city": "Mumbai", "name": "VP", "email": "test@test.com", "phone": "+918976799239", "state": "Maharashtra", "country": " India", "pincode": "123456", "latitude": "19.0967928", "longitude": "72.8516953", "created_at": "2022-07-28T10:27:31.941Z", "directions": "Walking", "updated_at": "2022-07-28T10:27:31.941Z", "customer_id": "755920ef-2031-466e-8e43-1971184744b5", "customer_name": "Nikhil Muskie", "is_serviceable": true, "alternate_phone": null, "delivery_details": {"serviceable": true, "delivery_cost": 30, "serviceability": true}, "apartment_road_area": "ABC TEST", "house_flat_block_no": "ABC, TEST"}'
	,'2022-07-28 11:44:06.232+00'
	,'delivered'
	,'{"returns": {}, "drop_eta": null, "rider_id": 2052, "pickup_eta": null, "rider_name": "Aastha Jain", "return_skus": [], "order_status": "DELIVERED", "delivery_time": "2022-07-28T11:43:29.000000Z", "rider_contact": "8750879029", "drop_image_url": null, "rider_latitude": 35.568624, "client_order_id": "390", "rider_longitude": 77.84621, "delivery_order_id": 20727649}'
	,30.00
	,NULL
	,'completed'
	,'accepted'
	,319.30
	,0.00
	,5.00
	,100.00
	,32
	,1
	,''
	,NULL
	,NULL
	,NULL
	,NULL
	,'2022-07-28 11:35:21.717751+00'
	,'2022-07-28 11:44:06.232+00'
	,'20727648'
	,12063
	,12095
	,'2022-07-28 10:08:30.105+00'
	,'2022-07-28 11:36:36.129+00'
	,'c308560c-9913-4736-bd4f-11bc3129b07a'
	,20
	,'2022-07-28 11:36:41.958+00'
	,NULL
	,9.30
	,380.00
	,
	'{"total_tax": 0, "menu_items": [{"variants": [], "item_cgst": 12.5, "item_igst": 12.5, "item_name": "Miz Veg Maggi", "item_sgst": 12.5, "item_price": 125, "addon_groups": [], "item_quantity": 3, "item_tax_amount": 0, "total_item_amount": 375, "total_variant_cost": 0, "item_packing_charges": 2.5, "total_addon_group_price": 0, "total_addon_group_tax_amount": 0, "total_individual_food_item_tax": 0, "total_individual_food_item_cost": 375}], "description": {"version": "0.0.1", "total_tax": "Sum of item_tax_amount and total_addon_group_tax_amount in menu_items array", "menu_items": {"item_id": "Menu Itm Id from database", "variants": {"desc": "List of all Variant group with choosed variants", "variant_id": "Variant Id from database", "variant_name": "Variant Name from database", "variant_price": "Variant Price from database", "variant_group_id": "Variant Group Id from database", "variant_group_name": "Variant Group Name from database"}, "item_cgst": "Menu Item CGST Tax Rate from database", "item_igst": "Menu Item IGST Tax Rate from database", "item_name": "Menu Item Name from fatabase", "item_sgst": "Menu Item SGST Tax Rate from database", "item_price": "Menu Item Price from database", "addon_groups": {"addons": {"desc": "List of all Addons selected", "addon_id": "Addon Id from database", "addon_cgst": "Addon CGST Tax Rate from database", "addon_igst": "Addon IGST Tax Rate from database", "addon_name": "Addon Name from database", "addon_sgst": "Addon SGST Tax Rate from database", "addon_price": "Addon Price from database", "addon_tax_amount": "Calculated Tax value from sum of taxes(IGST+CGST+SGST) and applied on addon_price\n  >>> (addon_price / 100)*(addon_cgst+addon_sgst+addon_igst)"}, "free_limit": "", "addon_group_id": "Addon Group Id from database", "addon_group_name": "Addon Group Name from database", "total_addon_price": "Sum Of all addon_price of from addons array", "total_addon_tax_amount": "Sum Of all addon_tax_amount of from addons array"}, "item_quantity": "Menu Item Quantity selected by customer", "item_tax_amount": "Calculated Value of tax applied on food amount if tax is not inclusive\n  >>> ((total_item_amount / 100) * (item_cgst + item_sgst + item_igst))", "total_item_amount": "Calculated Value from adding all selected variants price on top of Menu Item Price\n  >>> ((item_price + total_variant_cost) * item_quantity)", "total_variant_cost": "Sum Of all variant_price of from variants array", "item_packing_charges": "Packing charges of Menu Item if set by restaurant", "total_addon_group_price": "Sum Of all total_addon_price of from addon_groups array", "total_addon_group_tax_amount": "Sum Of all total_addon_tax_amount of from addon_groups array", "total_individual_food_item_tax": "Total Item Tax (including item tax with variant and addons tax)\n  >>> item_tax_amount + total_addon_group_tax_amount", "total_individual_food_item_cost": " Total Item Cost (including item cost with variant cost and addons cost)\n  >>> total_addon_group_price + total_addon_group_price"}, "coupon_details": {"code": "Coupon code from database", "type": "Coupon type from database", "level": "Coupon level from database", "coupon_id": "Coupon Id from database", "discount_percentage": "Coupon discount_percentage from database", "max_discount_rupees": "Coupon max_discount_rupees from database", "discount_amount_rupees": "Coupon discount_amount_rupees from database", "min_order_value_rupees": "Coupon min_order_value_rupees from database", "discount_amount_applied": "Applicable discount amount calculated based on Other values\n  ", "discount_share_amount_vendor": "The Amount Bared by vendor calculated percentage of discount_amount_applied\n  >>>  (discount_amount_applied /100) * discount_share_percentage_vendor", "discount_share_amount_speedyy": "Calculated Rest of the discount amount bared by speedyy\n  >>> discount_amount_applied - discount_share_amount_vendor", "discount_share_percentage_vendor": "Coupon discount_share_percentage_vendor from database", "discount_share_percentage_speedyy": "Coupon discount_share_percentage_speedyy from database"}, "total_food_cost": "Sum of all total_item_amount + total_addon_group_price", "delivery_charges": "By shadow fax based on >>> total_food_cost + total_tax + total_packing_charges - discount_amount_applied", "delivery_order_id": "Shadowfax order id when order is placed", "refundable_amount": "total_food_cost + total_taxes - discount_amount_applied", "transaction_charges": "Calculated on\n  >>> ((total_food_cost + total_taxes + total_packing_charges - discount_amount_applied + delivery_charges) / 100 ) * transaction_charges_rate", "order_packing_charge": "Packing Charges on full order if set by restaurant", "vendor_payout_amount": "total_food_cost + total_taxes + total_packing_charges - discount_share_amount_vendor", "payout_transaction_id": "Payout transaction ID when order payout processing started", "total_packing_charges": "Sum of all item_packing_charges from menu_items and order_packing_charge", "payment_transaction_id": "Payment uuid when payment is made by customer and is verified", "total_customer_payable": "total_food_cost + total_taxes + total_packing_charges - discount_amount_applied + delivery_charges + transaction_charges", "transaction_charges_rate": "From .env: 3%"}, "coupon_details": {"code": "NEW100", "type": "flat", "level": "global", "coupon_id": 32, "discount_percentage": 0, "max_discount_rupees": 0, "discount_amount_rupees": 100, "min_order_value_rupees": 300, "discount_amount_applied": 100, "discount_share_amount_vendor": 0, "discount_share_amount_speedyy": 100, "discount_share_percentage_vendor": 0, "discount_share_percentage_speedyy": 100}, "total_food_cost": 375, "delivery_charges": 30, "delivery_order_id": 20727648, "refundable_amount": 275, "transaction_charges": 9.3, "order_packing_charge": 2.5, "vendor_payout_amount": 380, "total_packing_charges": 5, "payment_transaction_id": "2734828", "total_customer_payable": 319.3, "transaction_charges_rate": 3}'
	,'false'
	,'2022-07-28 11:42:58+00'
	,'Loved it'
	,NULL
	,NULL
	,NULL
	,'shadowfax'
	)
	,(
	10
	,'b0909e52-a731-4665-a791-ee6479008805'
	,'4b6cdf35-fc28-40b0-a08a-c8e0aa603985'
	,'12412423432424413213123'
	,'{"id": "aedb2abf-ebf8-4703-b7ca-21c2e54fffa7", "city": "Mumbai", "name": "AMOGH add1", "email": "amogh.c@speedyy.com", "phone": "+919819997648", "state": "Maharashtra", "country": "India", "pincode": "0", "latitude": "23.045715", "longitude": "72.530396", "created_at": "2022-07-29T04:22:49.912Z", "directions": "ABC", "updated_at": "2022-08-01T04:49:24.787Z", "customer_id": "4b6cdf35-fc28-40b0-a08a-c8e0aa603985", "customer_name": "Amogh Chavan", "is_serviceable": true, "alternate_phone": null, "delivery_details": {"serviceable": true, "delivery_cost": 30, "serviceability": true}, "apartment_road_area": "apartment_road_area.", "house_flat_block_no": "HouseNumber,Wing,Block Number,"}'
	,'2022-08-01 05:38:01+00'
	,'delivered'
	,'{"returns": {}, "drop_eta": null, "rider_id": 2052, "pickup_eta": null, "rider_name": "Aastha Jain", "return_skus": [], "order_status": "DELIVERED", "delivery_time": "2022-08-01T05:38:01.000000Z", "rider_contact": "8750879029", "drop_image_url": null, "rider_latitude": 35.568624, "client_order_id": "574", "rider_longitude": 77.84621, "delivery_order_id": 20727963}'
	,30.00
	,NULL
	,'completed'
	,'accepted'
	,108.15
	,0.00
	,5.00
	,NULL
	,NULL
	,0
	,NULL
	,NULL
	,NULL
	,NULL
	,NULL
	,'2022-08-01 05:26:50.636772+00'
	,'2022-08-01 05:38:01.728+00'
	,'20727963'
	,6814
	,6826
	,'2022-07-28 10:09:50.892+00'
	,'2022-08-01 05:31:04.611+00'
	,'633a7346-47f2-4df2-bb25-e9efeeb5ff07'
	,10
	,'2022-08-01 05:31:14.061+00'
	,NULL
	,3.15
	,75.00
	,
	'{"total_tax": 0, "menu_items": [{"variants": [], "item_cgst": 12.5, "item_igst": 12.5, "item_name": "India''s Magic Masala Chips", "item_sgst": 12.5, "item_price": 14, "addon_groups": [], "item_quantity": 5, "item_tax_amount": 0, "total_item_amount": 70, "total_variant_cost": 0, "item_packing_charges": 2.5, "total_addon_group_price": 0, "total_addon_group_tax_amount": 0, "total_individual_food_item_tax": 0, "total_individual_food_item_cost": 70}], "description": {"version": "0.0.1", "total_tax": "Sum of item_tax_amount and total_addon_group_tax_amount in menu_items array", "menu_items": {"item_id": "Menu Itm Id from database", "variants": {"desc": "List of all Variant group with choosed variants", "variant_id": "Variant Id from database", "variant_name": "Variant Name from database", "variant_price": "Variant Price from database", "variant_group_id": "Variant Group Id from database", "variant_group_name": "Variant Group Name from database"}, "item_cgst": "Menu Item CGST Tax Rate from database", "item_igst": "Menu Item IGST Tax Rate from database", "item_name": "Menu Item Name from fatabase", "item_sgst": "Menu Item SGST Tax Rate from database", "item_price": "Menu Item Price from database", "addon_groups": {"addons": {"desc": "List of all Addons selected", "addon_id": "Addon Id from database", "addon_cgst": "Addon CGST Tax Rate from database", "addon_igst": "Addon IGST Tax Rate from database", "addon_name": "Addon Name from database", "addon_sgst": "Addon SGST Tax Rate from database", "addon_price": "Addon Price from database", "addon_tax_amount": "Calculated Tax value from sum of taxes(IGST+CGST+SGST) and applied on addon_price\n  >>> (addon_price / 100)*(addon_cgst+addon_sgst+addon_igst)"}, "free_limit": "", "addon_group_id": "Addon Group Id from database", "addon_group_name": "Addon Group Name from database", "total_addon_price": "Sum Of all addon_price of from addons array", "total_addon_tax_amount": "Sum Of all addon_tax_amount of from addons array"}, "item_quantity": "Menu Item Quantity selected by customer", "item_tax_amount": "Calculated Value of tax applied on food amount if tax is not inclusive\n  >>> ((total_item_amount / 100) * (item_cgst + item_sgst + item_igst))", "total_item_amount": "Calculated Value from adding all selected variants price on top of Menu Item Price\n  >>> ((item_price + total_variant_cost) * item_quantity)", "total_variant_cost": "Sum Of all variant_price of from variants array", "item_packing_charges": "Packing charges of Menu Item if set by restaurant", "total_addon_group_price": "Sum Of all total_addon_price of from addon_groups array", "total_addon_group_tax_amount": "Sum Of all total_addon_tax_amount of from addon_groups array", "total_individual_food_item_tax": "Total Item Tax (including item tax with variant and addons tax)\n  >>> item_tax_amount + total_addon_group_tax_amount", "total_individual_food_item_cost": " Total Item Cost (including item cost with variant cost and addons cost)\n  >>> total_addon_group_price + total_addon_group_price"}, "coupon_details": {"code": "Coupon code from database", "type": "Coupon type from database", "level": "Coupon level from database", "coupon_id": "Coupon Id from database", "discount_percentage": "Coupon discount_percentage from database", "max_discount_rupees": "Coupon max_discount_rupees from database", "discount_amount_rupees": "Coupon discount_amount_rupees from database", "min_order_value_rupees": "Coupon min_order_value_rupees from database", "discount_amount_applied": "Applicable discount amount calculated based on Other values\n  ", "discount_share_amount_vendor": "The Amount Bared by vendor calculated percentage of discount_amount_applied\n  >>>  (discount_amount_applied /100) * discount_share_percentage_vendor", "discount_share_amount_speedyy": "Calculated Rest of the discount amount bared by speedyy\n  >>> discount_amount_applied - discount_share_amount_vendor", "discount_share_percentage_vendor": "Coupon discount_share_percentage_vendor from database", "discount_share_percentage_speedyy": "Coupon discount_share_percentage_speedyy from database"}, "total_food_cost": "Sum of all total_item_amount + total_addon_group_price", "delivery_charges": "By shadow fax based on >>> total_food_cost + total_tax + total_packing_charges - discount_amount_applied", "delivery_order_id": "Shadowfax order id when order is placed", "refundable_amount": "total_food_cost + total_taxes - discount_amount_applied", "transaction_charges": "Calculated on\n  >>> ((total_food_cost + total_taxes + total_packing_charges - discount_amount_applied + delivery_charges) / 100 ) * transaction_charges_rate", "order_packing_charge": "Packing Charges on full order if set by restaurant", "vendor_payout_amount": "total_food_cost + total_taxes + total_packing_charges - discount_share_amount_vendor", "payout_transaction_id": "Payout transaction ID when order payout processing started", "total_packing_charges": "Sum of all item_packing_charges from menu_items and order_packing_charge", "payment_transaction_id": "Payment uuid when payment is made by customer and is verified", "total_customer_payable": "total_food_cost + total_taxes + total_packing_charges - discount_amount_applied + delivery_charges + transaction_charges", "transaction_charges_rate": "From .env: 3%"}, "total_food_cost": 70, "delivery_charges": 30, "delivery_order_id": 20727963, "refundable_amount": 70, "transaction_charges": 3.15, "order_packing_charge": 2.5, "vendor_payout_amount": 75, "total_packing_charges": 5, "payment_transaction_id": "2745210", "total_customer_payable": 108.15, "transaction_charges_rate": 3}'
	,'false'
	,'2022-08-01 05:36:13+00'
	,NULL
	,NULL
	,NULL
	,NULL
	,'shadowfax'
	)
	,(
	11
	,'b0909e52-a731-4665-a791-ee6479008805'
	,'631aca96-cf8b-4934-a1f5-4f34874139ba'
	,'8F2ADBC5-B692-4195-BC3D-EBB0C2ADE54B'
	,'{"id": "cfc629d7-8106-4d8f-b7f5-5c7c4eca1016", "city": "Mumbai", "name": "test", "email": "smita.j@speedyy.com", "phone": "+917387424351", "state": "Maharashtra", "country": " India", "pincode": "412109", "latitude": "19.0522115", "longitude": "72.900522", "created_at": "2022-07-28T11:48:37.066Z", "directions": "bus", "updated_at": "2022-08-03T07:36:38.050Z", "customer_id": "631aca96-cf8b-4934-a1f5-4f34874139ba", "customer_name": "smita", "is_serviceable": true, "alternate_phone": null, "delivery_details": {"serviceable": true, "delivery_cost": 30, "serviceability": true}, "apartment_road_area": "abcd", "house_flat_block_no": "abcd"}'
	,'2022-08-03 08:06:24+00'
	,'delivered'
	,'{"returns": {}, "drop_eta": null, "rider_id": 2052, "pickup_eta": null, "rider_name": "Aastha Jain", "return_skus": [], "order_status": "DELIVERED", "delivery_time": "2022-08-03T08:06:24.000000Z", "rider_contact": "8750879029", "drop_image_url": null, "rider_latitude": 35.568624, "client_order_id": "735", "rider_longitude": 77.84621, "delivery_order_id": 20728216}'
	,30.00
	,NULL
	,'completed'
	,'accepted'
	,271.92
	,0.00
	,5.00
	,NULL
	,NULL
	,0
	,''
	,NULL
	,NULL
	,NULL
	,NULL
	,'2022-08-03 07:36:41.535898+00'
	,'2022-08-03 08:06:24.838+00'
	,'20728216'
	,12063
	,12095
	,'2022-07-28 10:10:50.508+00'
	,'2022-08-03 07:39:38.985+00'
	,'06240ddd-98ec-49b8-b4e0-4d1774c51602'
	,15
	,'2022-08-03 08:04:00.789+00'
	,NULL
	,7.92
	,234.00
	,
	'{"total_tax": 0, "menu_items": [{"variants": [], "item_cgst": 12.5, "item_igst": 12.5, "item_name": "Soy Fed Chicken Schezwan Paratha", "item_sgst": 12.5, "item_price": 169, "addon_groups": [{"addons": [{"addon_id": 1791, "addon_cgst": 0, "addon_igst": 0, "addon_name": "Curd", "addon_sgst": 0, "addon_price": 25, "addon_tax_amount": 0}, {"addon_id": 1794, "addon_cgst": 0, "addon_igst": 0, "addon_name": "Chaas", "addon_sgst": 0, "addon_price": 35, "addon_tax_amount": 0}], "free_limit": -1, "addon_group_id": 327, "addon_group_name": "Add Ons", "total_addon_price": 60, "total_addon_tax_amount": 0}], "item_quantity": 1, "item_tax_amount": 0, "total_item_amount": 169, "total_variant_cost": 0, "item_packing_charges": 2.5, "total_addon_group_price": 60, "total_addon_group_tax_amount": 0, "total_individual_food_item_tax": 0, "total_individual_food_item_cost": 229}], "description": {"version": "0.0.1", "total_tax": "Sum of item_tax_amount and total_addon_group_tax_amount in menu_items array", "menu_items": {"item_id": "Menu Itm Id from database", "variants": {"desc": "List of all Variant group with choosed variants", "variant_id": "Variant Id from database", "variant_name": "Variant Name from database", "variant_price": "Variant Price from database", "variant_group_id": "Variant Group Id from database", "variant_group_name": "Variant Group Name from database"}, "item_cgst": "Menu Item CGST Tax Rate from database", "item_igst": "Menu Item IGST Tax Rate from database", "item_name": "Menu Item Name from fatabase", "item_sgst": "Menu Item SGST Tax Rate from database", "item_price": "Menu Item Price from database", "addon_groups": {"addons": {"desc": "List of all Addons selected", "addon_id": "Addon Id from database", "addon_cgst": "Addon CGST Tax Rate from database", "addon_igst": "Addon IGST Tax Rate from database", "addon_name": "Addon Name from database", "addon_sgst": "Addon SGST Tax Rate from database", "addon_price": "Addon Price from database", "addon_tax_amount": "Calculated Tax value from sum of taxes(IGST+CGST+SGST) and applied on addon_price\n  >>> (addon_price / 100)*(addon_cgst+addon_sgst+addon_igst)"}, "free_limit": "", "addon_group_id": "Addon Group Id from database", "addon_group_name": "Addon Group Name from database", "total_addon_price": "Sum Of all addon_price of from addons array", "total_addon_tax_amount": "Sum Of all addon_tax_amount of from addons array"}, "item_quantity": "Menu Item Quantity selected by customer", "item_tax_amount": "Calculated Value of tax applied on food amount if tax is not inclusive\n  >>> ((total_item_amount / 100) * (item_cgst + item_sgst + item_igst))", "total_item_amount": "Calculated Value from adding all selected variants price on top of Menu Item Price\n  >>> ((item_price + total_variant_cost) * item_quantity)", "total_variant_cost": "Sum Of all variant_price of from variants array", "item_packing_charges": "Packing charges of Menu Item if set by restaurant", "total_addon_group_price": "Sum Of all total_addon_price of from addon_groups array", "total_addon_group_tax_amount": "Sum Of all total_addon_tax_amount of from addon_groups array", "total_individual_food_item_tax": "Total Item Tax (including item tax with variant and addons tax)\n  >>> item_tax_amount + total_addon_group_tax_amount", "total_individual_food_item_cost": " Total Item Cost (including item cost with variant cost and addons cost)\n  >>> total_addon_group_price + total_addon_group_price"}, "coupon_details": {"code": "Coupon code from database", "type": "Coupon type from database", "level": "Coupon level from database", "coupon_id": "Coupon Id from database", "discount_percentage": "Coupon discount_percentage from database", "max_discount_rupees": "Coupon max_discount_rupees from database", "discount_amount_rupees": "Coupon discount_amount_rupees from database", "min_order_value_rupees": "Coupon min_order_value_rupees from database", "discount_amount_applied": "Applicable discount amount calculated based on Other values\n  ", "discount_share_amount_vendor": "The Amount Bared by vendor calculated percentage of discount_amount_applied\n  >>>  (discount_amount_applied /100) * discount_share_percentage_vendor", "discount_share_amount_speedyy": "Calculated Rest of the discount amount bared by speedyy\n  >>> discount_amount_applied - discount_share_amount_vendor", "discount_share_percentage_vendor": "Coupon discount_share_percentage_vendor from database", "discount_share_percentage_speedyy": "Coupon discount_share_percentage_speedyy from database"}, "total_food_cost": "Sum of all total_item_amount + total_addon_group_price", "delivery_charges": "By shadow fax based on >>> total_food_cost + total_tax + total_packing_charges - discount_amount_applied", "delivery_order_id": "Shadowfax order id when order is placed", "refundable_amount": "total_food_cost + total_taxes - discount_amount_applied", "transaction_charges": "Calculated on\n  >>> ((total_food_cost + total_taxes + total_packing_charges - discount_amount_applied + delivery_charges) / 100 ) * transaction_charges_rate", "order_packing_charge": "Packing Charges on full order if set by restaurant", "vendor_payout_amount": "total_food_cost + total_taxes + total_packing_charges - discount_share_amount_vendor", "payout_transaction_id": "Payout transaction ID when order payout processing started", "total_packing_charges": "Sum of all item_packing_charges from menu_items and order_packing_charge", "payment_transaction_id": "Payment uuid when payment is made by customer and is verified", "total_customer_payable": "total_food_cost + total_taxes + total_packing_charges - discount_amount_applied + delivery_charges + transaction_charges", "transaction_charges_rate": "From .env: 3%"}, "total_food_cost": 229, "delivery_charges": 30, "delivery_order_id": 20728216, "refundable_amount": 229, "transaction_charges": 7.92, "order_packing_charge": 2.5, "vendor_payout_amount": 234, "total_packing_charges": 5, "payment_transaction_id": "2756525", "total_customer_payable": 271.92, "transaction_charges_rate": 3}'
	,'false'
	,'2022-08-03 08:05:28+00'
	,NULL
	,NULL
	,NULL
	,NULL
	,'shadowfax'
	)
	,(
	12
	,'b0909e52-a731-4665-a791-ee6479008805'
	,'631aca96-cf8b-4934-a1f5-4f34874139ba'
	,'940646044ced6671'
	,'{"id": "040e9f9a-2a33-4dd6-8a06-94710d5a4c38", "city": "Mumbai Suburban", "name": "dhdhdd", "email": "smita.j@speedyy.com", "phone": "+917387424351", "state": "Maharashtra", "country": "India", "pincode": "400071", "latitude": "19.062344460623414", "longitude": "72.90178019553423", "created_at": "2022-08-01T05:18:38.131Z", "directions": "shddh", "updated_at": "2022-08-01T05:18:38.131Z", "customer_id": "631aca96-cf8b-4934-a1f5-4f34874139ba", "customer_name": "smita", "is_serviceable": true, "alternate_phone": null, "delivery_details": {"serviceable": true, "delivery_cost": 30, "serviceability": true}, "apartment_road_area": "dhdddh", "house_flat_block_no": "agssgs"}'
	,'2022-08-01 06:11:51+00'
	,'delivered'
	,'{"returns": {}, "drop_eta": null, "rider_id": 2052, "pickup_eta": null, "rider_name": "Aastha Jain", "return_skus": [], "order_status": "DELIVERED", "delivery_time": "2022-08-01T06:11:51.000000Z", "rider_contact": "8750879029", "drop_image_url": null, "rider_latitude": 35.568624, "client_order_id": "573", "rider_longitude": 77.84621, "delivery_order_id": 20727954}'
	,30.00
	,NULL
	,'completed'
	,'accepted'
	,235.87
	,0.00
	,5.00
	,NULL
	,NULL
	,1
	,NULL
	,NULL
	,NULL
	,NULL
	,NULL
	,'2022-08-01 05:18:43.788513+00'
	,'2022-08-04 11:43:50.765+00'
	,'20727954'
	,12063
	,12095
	,'2022-08-01 10:12:50.109+00'
	,'2022-08-01 05:21:20.519+00'
	,'06240ddd-98ec-49b8-b4e0-4d1774c51602'
	,15
	,'2022-08-01 05:22:18.222+00'
	,NULL
	,6.87
	,199.00
	,
	'{"total_tax": 0, "menu_items": [{"variants": [], "item_cgst": 12.5, "item_igst": 12.5, "item_name": "Soy Fed Chicken Schezwan Paratha", "item_sgst": 12.5, "item_price": 169, "addon_groups": [{"addons": [{"addon_id": 1791, "addon_cgst": 0, "addon_igst": 0, "addon_name": "Curd", "addon_sgst": 0, "addon_price": 25, "addon_tax_amount": 0}], "free_limit": -1, "addon_group_id": 327, "addon_group_name": "Add Ons", "total_addon_price": 25, "total_addon_tax_amount": 0}], "item_quantity": 1, "item_tax_amount": 0, "total_item_amount": 169, "total_variant_cost": 0, "item_packing_charges": 2.5, "total_addon_group_price": 25, "total_addon_group_tax_amount": 0, "total_individual_food_item_tax": 0, "total_individual_food_item_cost": 194}], "description": {"version": "0.0.1", "total_tax": "Sum of item_tax_amount and total_addon_group_tax_amount in menu_items array", "menu_items": {"item_id": "Menu Itm Id from database", "variants": {"desc": "List of all Variant group with choosed variants", "variant_id": "Variant Id from database", "variant_name": "Variant Name from database", "variant_price": "Variant Price from database", "variant_group_id": "Variant Group Id from database", "variant_group_name": "Variant Group Name from database"}, "item_cgst": "Menu Item CGST Tax Rate from database", "item_igst": "Menu Item IGST Tax Rate from database", "item_name": "Menu Item Name from fatabase", "item_sgst": "Menu Item SGST Tax Rate from database", "item_price": "Menu Item Price from database", "addon_groups": {"addons": {"desc": "List of all Addons selected", "addon_id": "Addon Id from database", "addon_cgst": "Addon CGST Tax Rate from database", "addon_igst": "Addon IGST Tax Rate from database", "addon_name": "Addon Name from database", "addon_sgst": "Addon SGST Tax Rate from database", "addon_price": "Addon Price from database", "addon_tax_amount": "Calculated Tax value from sum of taxes(IGST+CGST+SGST) and applied on addon_price\n  >>> (addon_price / 100)*(addon_cgst+addon_sgst+addon_igst)"}, "free_limit": "", "addon_group_id": "Addon Group Id from database", "addon_group_name": "Addon Group Name from database", "total_addon_price": "Sum Of all addon_price of from addons array", "total_addon_tax_amount": "Sum Of all addon_tax_amount of from addons array"}, "item_quantity": "Menu Item Quantity selected by customer", "item_tax_amount": "Calculated Value of tax applied on food amount if tax is not inclusive\n  >>> ((total_item_amount / 100) * (item_cgst + item_sgst + item_igst))", "total_item_amount": "Calculated Value from adding all selected variants price on top of Menu Item Price\n  >>> ((item_price + total_variant_cost) * item_quantity)", "total_variant_cost": "Sum Of all variant_price of from variants array", "item_packing_charges": "Packing charges of Menu Item if set by restaurant", "total_addon_group_price": "Sum Of all total_addon_price of from addon_groups array", "total_addon_group_tax_amount": "Sum Of all total_addon_tax_amount of from addon_groups array", "total_individual_food_item_tax": "Total Item Tax (including item tax with variant and addons tax)\n  >>> item_tax_amount + total_addon_group_tax_amount", "total_individual_food_item_cost": " Total Item Cost (including item cost with variant cost and addons cost)\n  >>> total_addon_group_price + total_addon_group_price"}, "coupon_details": {"code": "Coupon code from database", "type": "Coupon type from database", "level": "Coupon level from database", "coupon_id": "Coupon Id from database", "discount_percentage": "Coupon discount_percentage from database", "max_discount_rupees": "Coupon max_discount_rupees from database", "discount_amount_rupees": "Coupon discount_amount_rupees from database", "min_order_value_rupees": "Coupon min_order_value_rupees from database", "discount_amount_applied": "Applicable discount amount calculated based on Other values\n  ", "discount_share_amount_vendor": "The Amount Bared by vendor calculated percentage of discount_amount_applied\n  >>>  (discount_amount_applied /100) * discount_share_percentage_vendor", "discount_share_amount_speedyy": "Calculated Rest of the discount amount bared by speedyy\n  >>> discount_amount_applied - discount_share_amount_vendor", "discount_share_percentage_vendor": "Coupon discount_share_percentage_vendor from database", "discount_share_percentage_speedyy": "Coupon discount_share_percentage_speedyy from database"}, "total_food_cost": "Sum of all total_item_amount + total_addon_group_price", "delivery_charges": "By shadow fax based on >>> total_food_cost + total_tax + total_packing_charges - discount_amount_applied", "delivery_order_id": "Shadowfax order id when order is placed", "refundable_amount": "total_food_cost + total_taxes - discount_amount_applied", "transaction_charges": "Calculated on\n  >>> ((total_food_cost + total_taxes + total_packing_charges - discount_amount_applied + delivery_charges) / 100 ) * transaction_charges_rate", "order_packing_charge": "Packing Charges on full order if set by restaurant", "vendor_payout_amount": "total_food_cost + total_taxes + total_packing_charges - discount_share_amount_vendor", "payout_transaction_id": "Payout transaction ID when order payout processing started", "total_packing_charges": "Sum of all item_packing_charges from menu_items and order_packing_charge", "payment_transaction_id": "Payment uuid when payment is made by customer and is verified", "total_customer_payable": "total_food_cost + total_taxes + total_packing_charges - discount_amount_applied + delivery_charges + transaction_charges", "transaction_charges_rate": "From .env: 3%"}, "total_food_cost": 194, "delivery_charges": 30, "delivery_order_id": 20727954, "refundable_amount": 194, "transaction_charges": 6.87, "order_packing_charge": 2.5, "vendor_payout_amount": 199, "total_packing_charges": 5, "payment_transaction_id": "2745179", "total_customer_payable": 235.87, "transaction_charges_rate": 3}'
	,'false'
	,'2022-08-01 06:11:25+00'
	,'Test main best'
	,'2022-08-04 11:43:50.765+00'
	,NULL
	,NULL
	,'shadowfax'
	)
	,(13, 'b0909e52-a731-4665-a791-ee6479008805', '6c31b2ca-08f7-4a9c-b59b-9c1fe1dc9734', '61DF45BA-256B-414F-B3AD-D0CF91956966', '{"id": "1ed97a67-3787-419b-8de2-582a6eae94e7", "city": "Bengaluru", "name": "KM", "email": "test@test.com", "phone": "+918976799239", "state": "Karnataka", "country": " India", "pincode": "123456", "latitude": "12.9411733", "longitude": "77.6213028", "created_at": "2022-08-16T10:22:24.836Z", "directions": "Bus", "updated_at": "2022-08-16T10:22:24.836Z", "customer_id": "6c31b2ca-08f7-4a9c-b59b-9c1fe1dc9734", "customer_name": "Nikhil Muskur", "is_serviceable": true, "alternate_phone": null, "delivery_details": {"serviceable": true, "delivery_cost": 30, "serviceability": true}, "apartment_road_area": "KM Area", "house_flat_block_no": "KM Road"}', NULL, 'pending', NULL, 30.00, NULL, 'placed', 'accepted', 2526.07, 0.00, 2.50, 100.00, 32, 0, '', NULL, NULL, NULL, NULL, '2022-08-16 10:27:09.808503+00', '2022-08-16 10:31:21.985+00', '20729046', 5, 5, '2022-08-16 10:06:10.502+00', '2022-08-16 10:30:27.628+00', '3a55364b-0410-4a89-8bb4-64118b749cc3', 25, '2022-08-16 10:31:21.985+00', NULL, 73.57, 2522.50, '{"total_tax": 0, "menu_items": [{"variants": [], "item_cgst": 12.5, "item_igst": 12.5, "item_name": "Raita", "item_sgst": 12.5, "item_price": 55, "addon_groups": [], "item_quantity": 2, "item_tax_amount": 0, "total_item_amount": 110, "total_variant_cost": 0, "item_packing_charges": 2.5, "total_addon_group_price": 0, "total_addon_group_tax_amount": 0, "total_individual_food_item_tax": 0, "total_individual_food_item_cost": 110}, {"variants": [], "item_cgst": 12.5, "item_igst": 12.5, "item_name": "Donne Veg Biryani (Exclusive Packaging)", "item_sgst": 12.5, "item_price": 199, "addon_groups": [{"addons": [{"addon_id": 2075, "addon_cgst": 0, "addon_igst": 0, "addon_name": "Babycorn Pudina Dry", "addon_sgst": 0, "addon_price": 219, "addon_tax_amount": 0}, {"addon_id": 2076, "addon_cgst": 0, "addon_igst": 0, "addon_name": "Paneer Sholay Kebab", "addon_sgst": 0, "addon_price": 229, "addon_tax_amount": 0}, {"addon_id": 2077, "addon_cgst": 0, "addon_igst": 0, "addon_name": "Mushroom Ghee Roast", "addon_sgst": 0, "addon_price": 229, "addon_tax_amount": 0}], "free_limit": -1, "addon_group_id": 382, "addon_group_name": "Veg Starters", "total_addon_price": 677, "total_addon_tax_amount": 0}, {"addons": [{"addon_id": 2078, "addon_cgst": 0, "addon_igst": 0, "addon_name": "Gulab Jamoon (2Pcs)", "addon_sgst": 0, "addon_price": 50, "addon_tax_amount": 0}, {"addon_id": 2079, "addon_cgst": 0, "addon_igst": 0, "addon_name": "Rasmalai Cremeux", "addon_sgst": 0, "addon_price": 110, "addon_tax_amount": 0}, {"addon_id": 2080, "addon_cgst": 0, "addon_igst": 0, "addon_name": "Double Ka Meetha (3 Pcs )", "addon_sgst": 0, "addon_price": 79, "addon_tax_amount": 0}], "free_limit": -1, "addon_group_id": 383, "addon_group_name": "Desserts", "total_addon_price": 239, "total_addon_tax_amount": 0}, {"addons": [{"addon_id": 2081, "addon_cgst": 0, "addon_igst": 0, "addon_name": "Butter milk", "addon_sgst": 0, "addon_price": 40, "addon_tax_amount": 0}, {"addon_id": 2082, "addon_cgst": 0, "addon_igst": 0, "addon_name": "7 UP - 250 ML", "addon_sgst": 0, "addon_price": 25, "addon_tax_amount": 0}, {"addon_id": 2083, "addon_cgst": 0, "addon_igst": 0, "addon_name": "Pepsi- 250 ML", "addon_sgst": 0, "addon_price": 25, "addon_tax_amount": 0}], "free_limit": -1, "addon_group_id": 384, "addon_group_name": "Beverages", "total_addon_price": 90, "total_addon_tax_amount": 0}], "item_quantity": 2, "item_tax_amount": 0, "total_item_amount": 398, "total_variant_cost": 0, "item_packing_charges": 2.5, "total_addon_group_price": 2012, "total_addon_group_tax_amount": 0, "total_individual_food_item_tax": 0, "total_individual_food_item_cost": 2410}], "description": {"version": "0.0.1", "total_tax": "Sum of item_tax_amount and total_addon_group_tax_amount in menu_items array", "menu_items": {"item_id": "Menu Itm Id from database", "variants": {"desc": "List of all Variant group with choosed variants", "variant_id": "Variant Id from database", "variant_name": "Variant Name from database", "variant_price": "Variant Price from database", "variant_group_id": "Variant Group Id from database", "variant_group_name": "Variant Group Name from database"}, "item_cgst": "Menu Item CGST Tax Rate from database", "item_igst": "Menu Item IGST Tax Rate from database", "item_name": "Menu Item Name from fatabase", "item_sgst": "Menu Item SGST Tax Rate from database", "item_price": "Menu Item Price from database", "addon_groups": {"addons": {"desc": "List of all Addons selected", "addon_id": "Addon Id from database", "addon_cgst": "Addon CGST Tax Rate from database", "addon_igst": "Addon IGST Tax Rate from database", "addon_name": "Addon Name from database", "addon_sgst": "Addon SGST Tax Rate from database", "addon_price": "Addon Price from database", "addon_tax_amount": "Calculated Tax value from sum of taxes(IGST+CGST+SGST) and applied on addon_price\n  >>> (addon_price / 100)*(addon_cgst+addon_sgst+addon_igst)"}, "free_limit": "", "addon_group_id": "Addon Group Id from database", "addon_group_name": "Addon Group Name from database", "total_addon_price": "Sum Of all addon_price of from addons array", "total_addon_tax_amount": "Sum Of all addon_tax_amount of from addons array"}, "item_quantity": "Menu Item Quantity selected by customer", "item_tax_amount": "Calculated Value of tax applied on food amount if tax is not inclusive\n  >>> ((total_item_amount / 100) * (item_cgst + item_sgst + item_igst))", "total_item_amount": "Calculated Value from adding all selected variants price on top of Menu Item Price\n  >>> ((item_price + total_variant_cost) * item_quantity)", "total_variant_cost": "Sum Of all variant_price of from variants array", "item_packing_charges": "Packing charges of Menu Item if set by restaurant", "total_addon_group_price": "(Sum Of all total_addon_price of from addon_groups array) * item_quantity", "total_addon_group_tax_amount": "Sum Of all total_addon_tax_amount of from addon_groups array", "total_individual_food_item_tax": "Total Item Tax (including item tax with variant and addons tax)\n  >>> item_tax_amount + total_addon_group_tax_amount", "total_individual_food_item_cost": " Total Item Cost (including item cost with variant cost and addons cost)\n  >>> total_item_amount + total_addon_group_price"}, "coupon_details": {"code": "Coupon code from database", "type": "Coupon type from database", "level": "Coupon level from database", "coupon_id": "Coupon Id from database", "discount_percentage": "Coupon discount_percentage from database", "max_discount_rupees": "Coupon max_discount_rupees from database", "discount_amount_rupees": "Coupon discount_amount_rupees from database", "min_order_value_rupees": "Coupon min_order_value_rupees from database", "discount_amount_applied": "Applicable discount amount calculated based on Other values\n  ", "discount_share_amount_vendor": "The Amount Bared by vendor calculated percentage of discount_amount_applied\n  >>>  (discount_amount_applied /100) * discount_share_percentage_vendor", "discount_share_amount_speedyy": "Calculated Rest of the discount amount bared by speedyy\n  >>> discount_amount_applied - discount_share_amount_vendor", "discount_share_percentage_vendor": "Coupon discount_share_percentage_vendor from database", "discount_share_percentage_speedyy": "Coupon discount_share_percentage_speedyy from database"}, "total_food_cost": "Sum of all total_item_amount + total_addon_group_price", "delivery_charges": "By shadow fax based on >>> total_food_cost + total_tax + total_packing_charges - discount_amount_applied", "delivery_order_id": "Shadowfax order id when order is placed", "refundable_amount": "total_food_cost + total_taxes - discount_amount_applied", "transaction_charges": "Calculated on\n  >>> ((total_food_cost + total_taxes + total_packing_charges - discount_amount_applied + delivery_charges) / 100 ) * transaction_charges_rate", "order_packing_charge": "Packing Charges on full order if set by restaurant", "vendor_payout_amount": "total_food_cost + total_taxes + total_packing_charges - discount_share_amount_vendor", "payout_transaction_id": "Payout transaction ID when order payout processing started", "total_packing_charges": "Sum of all item_packing_charges from menu_items and order_packing_charge", "payment_transaction_id": "Payment uuid when payment is made by customer and is verified", "total_customer_payable": "total_food_cost + total_taxes + total_packing_charges - discount_amount_applied + delivery_charges + transaction_charges", "transaction_charges_rate": "From .env: 3%"}, "coupon_details": {"code": "NEW100", "type": "flat", "level": "global", "coupon_id": 32, "discount_percentage": 0, "max_discount_rupees": 0, "discount_amount_rupees": 100, "min_order_value_rupees": 300, "discount_amount_applied": 100, "discount_share_amount_vendor": 0, "discount_share_amount_speedyy": 100, "discount_share_percentage_vendor": 0, "discount_share_percentage_speedyy": 100}, "total_food_cost": 2520, "delivery_charges": 30, "delivery_order_id": 20729046, "refundable_amount": 2420, "transaction_charges": 73.57, "order_packing_charge": 2.5, "vendor_payout_amount": 2522.5, "total_packing_charges": 2.5, "payment_transaction_id": "2733598", "total_customer_payable": 2526.07, "transaction_charges_rate": 3}', 'false', NULL, NULL, NULL, NULL, NULL, 'shadowfax');


INSERT INTO public.payment (id, order_id, customer_id, transaction_id, transaction_token, payment_status, payment_method, payment_gateway, additional_details, amount_paid_by_customer, created_at, updated_at, transaction_time) VALUES
('814a6386-b4f9-48c1-0123-77835f34e9a8', 5, '4b6cdf35-fc28-40b0-a08a-c8e0aa603985', '8975642', 'QOX64xNltpuZEjCD2jeZ', 'completed', 'netbanking', 'CASHFREE', '{"entity": "order", "refunds": {"url": "https://sandbox.cashfree.com/pg/orders/814a6386-b4f9-48c1-8d7b-77835f34e9a8/refunds"}, "order_id": "5", "payments": {"url": "https://sandbox.cashfree.com/pg/orders/814a6386-b4f9-48c1-8d7b-77835f34e9a8/payments"}, "created_at": "2022-07-28T14:34:09+05:30", "order_meta": {"notify_url": null, "return_url": null, "payment_methods": null}, "order_note": null, "order_tags": null, "cf_order_id": 2733598, "order_token": "QOX64xNltpuZEjCD2jeZ", "settlements": {"url": "https://sandbox.cashfree.com/pg/orders/814a6386-b4f9-48c1-8d7b-77835f34e9a8/settlements"}, "order_amount": 106, "order_splits": [], "order_status": "PAID", "payment_link": "https://payments-test.cashfree.com/order/#QOX64xNltpuZEjCD2jeZ", "order_currency": "INR", "customer_details": {"customer_id": "4b6cdf35-fc28-40b0-a08a-c8e0aa603985", "customer_name": null, "customer_email": "Dinesh.j@speedyy.com", "customer_phone": "+919975543428"}, "order_expiry_time": "2022-08-27T14:34:09+05:30"}', 106, '2022-07-28 09:04:09.321065+00', '2022-07-28 09:04:24.441+00', '2022-07-28 09:04:23+00'),
('814a6386-b4f9-48c1-8d7b-77835f34e9a8', 7, '6c31b2ca-08f7-4a9c-b59b-9c1fe1dc9734', '2733598', 'QOX64xNltpuZEjCD2jeZ', 'completed', 'netbanking', 'CASHFREE', '{"entity": "order", "refunds": {"url": "https://sandbox.cashfree.com/pg/orders/814a6386-b4f9-48c1-8d7b-77835f34e9a8/refunds"}, "order_id": "7", "payments": {"url": "https://sandbox.cashfree.com/pg/orders/814a6386-b4f9-48c1-8d7b-77835f34e9a8/payments"}, "created_at": "2022-07-28T14:34:09+05:30", "order_meta": {"notify_url": null, "return_url": null, "payment_methods": null}, "order_note": null, "order_tags": null, "cf_order_id": 2733598, "order_token": "QOX64xNltpuZEjCD2jeZ", "settlements": {"url": "https://sandbox.cashfree.com/pg/orders/814a6386-b4f9-48c1-8d7b-77835f34e9a8/settlements"}, "order_amount": 2527, "order_splits": [], "order_status": "PAID", "payment_link": "https://payments-test.cashfree.com/order/#QOX64xNltpuZEjCD2jeZ", "order_currency": "INR", "customer_details": {"customer_id": "6c31b2ca-08f7-4a9c-b59b-9c1fe1dc9734", "customer_name": null, "customer_email": "Dinesh.j@speedyy.com", "customer_phone": "+919975543428"}, "order_expiry_time": "2022-08-27T14:34:09+05:30"}', 2527, '2022-07-28 09:04:09.321065+00', '2022-07-28 09:04:24.441+00', '2022-07-28 09:04:23+00'),
('814a6386-b4f9-48c1-12345-77835f34e9a8', 13, '6c31b2ca-08f7-4a9c-b59b-9c1fe1dc9734', '2733598', 'QOX64xNltpuZEjCD2jeZ', 'completed', 'netbanking', 'CASHFREE', '{"entity": "order", "refunds": {"url": "https://sandbox.cashfree.com/pg/orders/814a6386-b4f9-48c1-8d7b-77835f34e9a8/refunds"}, "order_id": "7", "payments": {"url": "https://sandbox.cashfree.com/pg/orders/814a6386-b4f9-48c1-8d7b-77835f34e9a8/payments"}, "created_at": "2022-07-28T14:34:09+05:30", "order_meta": {"notify_url": null, "return_url": null, "payment_methods": null}, "order_note": null, "order_tags": null, "cf_order_id": 2733598, "order_token": "QOX64xNltpuZEjCD2jeZ", "settlements": {"url": "https://sandbox.cashfree.com/pg/orders/814a6386-b4f9-48c1-8d7b-77835f34e9a8/settlements"}, "order_amount": 2527, "order_splits": [], "order_status": "PAID", "payment_link": "https://payments-test.cashfree.com/order/#QOX64xNltpuZEjCD2jeZ", "order_currency": "INR", "customer_details": {"customer_id": "6c31b2ca-08f7-4a9c-b59b-9c1fe1dc9734", "customer_name": null, "customer_email": "Dinesh.j@speedyy.com", "customer_phone": "+919975543428"}, "order_expiry_time": "2022-08-27T14:34:09+05:30"}', 2527, '2022-07-28 09:04:09.321065+00', '2022-07-28 09:04:24.441+00', '2022-07-28 09:04:23+00');
