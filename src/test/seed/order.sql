

---mock order record for mock payment table records reference
INSERT INTO PUBLIC.order (
	restaurant_id
	,customer_id
	,customer_device_id
	,customer_address
	,order_delivered_at
	,delivery_status
	,delivery_details
	,delivery_charges
	,delivery_tip
	,order_status
	,order_acceptance_status
	,total_customer_payable
	,total_tax
	,packing_charges
	,offer_discount
	,coupon_id
	,any_special_request
	,cancelled_by
	,cancellation_details
	,cancellation_time
	,cancellation_user_id
	,created_at
	,updated_at
    ,delivery_order_id
    ,pickup_eta
    ,drop_eta
    ,order_placed_time
    ,vendor_accepted_time
    ,accepted_vendor_id
    ,preparation_time
    ,vendor_ready_marked_time
    ,payout_transaction_id
    ,transaction_charges
    ,vendor_payout_amount
    ,invoice_breakout
    ,stop_payment
    ,order_pickedup_time
	,comments
	,reviewed_at
	,refund_status
    ,additional_details
    ,delivery_service
    ,vote_type
    ,pos_id
	,pos_partner
	)
VALUES (
	'b0909e52-a731-4665-a791-ee6479008805'
	,'17586cf0-75ac-4c92-a14d-3dfe174fe081'
	,'12412423432424413213123'
	,'{"apartment_road_area": "apartment_road_area.","city": "Mumbai","country": "India","created_at": "2022-02-24T06:25:22.096Z","customer_id": "33c6fdbc-8df6-4541-9d3f-f9e5ba4c0242","directions": "ABC","house_flat_block_no": "HouseNumber,Wing,Block Number,","id": "bd7e895f-0f7d-4dbe-9408-285abf5986ce","is_serviceable": true,"latitude": "1.098889","longitude": "2.0089002","name": "Mohit","pincode": "0","state": "Maharashtra","updated_at": "2022-02-24T06:25:22.096Z"}'
	,'2022-07-28 17:08:35.85+05:30'
	,'delivered'
	,'{"returns": {},"drop_eta": null,"rider_id": 2052,"pickup_eta": null,"rider_name": "Aastha Jain","return_skus": [],"order_status": "DELIVERED","sfx_order_id": 20727614,"delivery_time": "2022-07-28T09:18:56.000000Z","rider_contact": "8750879029","drop_image_url": null,"rider_latitude": 35.568624,"client_order_id": "373","rider_longitude": 77.84621}'
	,0.00
	,0.00
	,'completed'
	,'accepted'
	,238.22
	,0.12
	,0.00
	,NULL
	,NULL
	,'Dont ring door bell'
	,NULL
	,NULL
	,NULL
	,NULL
	,'2022-05-12T14:27:22.518718+00:00'
	,'2022-05-12T14:27:22.518718+00:00'
	,NULL
	,NULL
	,NULL
	,NULL
	,NULL
	,NULL
	,NULL
	,NULL
	,'a6531e46-c3d0-42e7-bb79-7a93e71638a5'  --payout_transaction_id
	,NULL
	,NULL
	,NULL
	,false
	,NULL
	,NULL
	,NULL
	,NULL
	,NULL
	,'shadowfax'
	,0
	,NULL
	,NULL
);


INSERT INTO PUBLIC.order_item (
	menu_item_id,
    order_id,
    quantity,
    restaurant_id,
    name,
    description,
    sub_category_id,
    price,
    veg_egg_non,
    packing_charges,
    is_spicy,
    serves_how_many,
    service_charges,
    item_sgst_utgst,
    item_cgst,
    item_igst,
    item_inclusive,
    external_id,
    allow_long_distance,
    image
	)
VALUES (
	11101
	,1
	,1
	,'b0909e52-a731-4665-a791-ee6479008805'
	,'menu item order name'
	,'desc'
	,111
	,100
	,'veg'
	,1
	,true
	,1
	,0
	,0
	,0
	,0
	,true
	,'989'
	,true
	,'{}'
	);

INSERT INTO PUBLIC.order_variant(
	order_id,
    order_item_id,
    variant_group_id,
    variant_group_name,
    variant_id,
    variant_name,
    is_default,
    serves_how_many,
    price,
    veg_egg_non,
    created_at,
    updated_at
	)
VALUES (
	1,
	1,
	98,
	'variant group name',
	998,
	'variant name',
	true,
	1,
	10,
	'veg',
	'2022-04-27T04:54:01.883+00:00',
	'2022-04-27T04:54:01.883+00:00'
	);

INSERT INTO PUBLIC.order_addon(
 	order_id,
    order_item_id,
    addon_name,
    addon_id,
    addon_group_name,
    addon_group_id,
    sequence,
    price,
    veg_egg_non,
    sgst_rate,
    cgst_rate,
    igst_rate,
    gst_inclusive,
    external_id,
    created_at,
    updated_at
)
VALUES(
	1,
	1,
	'addon name',
	7767,
	'addon group name',
	77,
	1,
	10,
	'veg',
	0,
	0,
	0,
	false,
	'123',
	'2022-04-27T04:54:01.883+00:00',
	'2022-04-27T04:54:01.883+00:00'
);

-- compeleted payment mock record for payment table
INSERT INTO PUBLIC.payment (
	id,
	 order_id
	,customer_id
	,transaction_id
	,transaction_token
	,payment_status
	,payment_method
	,payment_gateway
	,additional_details
	,amount_paid_by_customer
	,created_at
	,updated_at
	,transaction_time
	)
VALUES (
	'99c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
	1
	,'33c6fdbc-8df6-4541-9d3f-f9e5ba4c0242'
	,'20220518111212800110168531851371782'
	,'55938d4f422145838c626d26428896d21652365642957'
	,'completed'
	,'PPI'
	,'WALLET'
	,'{"txnDate": "2022-05-18 15:28:37.0", "txnType": "SALE", "bankName": "WALLET", "bankTxnId": "187357186285", "refundAmt": "0.00", "resultInfo": {"resultMsg": "Txn Success", "resultCode": "01", "resultStatus": "TXN_SUCCESS"}}'
	,1.00
	,'2022-05-12T14:27:22.518718+00:00'
	,'2022-05-12T14:27:22.518718+00:00',
	'2022-05-12T14:27:22.518718+00:00'
);



-- pending payment mock record for payment table
INSERT INTO PUBLIC.payment (
	id,
	order_id
	,customer_id
	,transaction_id
	,transaction_token
	,payment_status
	,payment_method
	,payment_gateway
	,additional_details
	,amount_paid_by_customer
	,created_at
	,updated_at
	)
VALUES (
	'98c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
	1
	,'33c6fdbc-8df6-4541-9d3f-f9e5ba4c0242'
	,NULL
	,'105088c5839945c2a70a6449dbfb1a671653052103420'
	,'pending'
	,NULL
	,NULL
	,NULL
	,NULL
	,'2022-05-20T13:08:22.993086+00:00'
	,'2022-05-20T13:08:22.993086+00:00'
	);


-- failed payment mock record for payment table

INSERT INTO PUBLIC.payment (
	id,
	order_id
	,customer_id
	,transaction_id
	,transaction_token
	,payment_status
	,payment_method
	,payment_gateway
	,additional_details
	,amount_paid_by_customer
	,created_at
	,updated_at
	)
VALUES (
	'97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
	1,
	'33c6fdbc-8df6-4541-9d3f-f9e5ba4c0242'
	,NULL
	,'105088c5839945c2a70a6449dbfb1a671653052103420'
	,'failed'
	,NULL
	,NULL
	,NULL
	,NULL
	,'2022-05-20T13:08:22.993086+00:00'
	,'2022-05-20T13:08:22.993086+00:00'
);

INSERT INTO public.coupon (
    id,
    code,
    header,
    description,
    terms_and_conditions,
    type,
    discount_percentage,
    discount_amount_rupees,
    start_time,
    end_time,
    level,
    max_use_count,
    coupon_use_interval_minutes,
    min_order_value_rupees,
    max_discount_rupees,
    discount_share_percent,
    discount_sponsered_by,
    created_by,
    created_by_user_id,
    is_deleted,
    created_at,
    updated_at
    )
    VALUES (
        2255,
        '1-Min-Interval-Coupon',
        'Get 20% Cashback',
        'All new user can get 20% cashback on thier first order',
        'Terms & Conditions Apply 1. Applicable only for order above 100rs',
        'upto',
        20.00,
        NULL,
        '2022-07-01 11:31:08+05:30',
        '2040-07-07 12:31:08+05:30',
        'global',
        2,
        1,
        100.00,
        50.00,
        0.00,
        NULL,
        'admin',
        '64bfafb6-c273-4b64-a0fc-ca981f5819eb',
        false,
        '2022-07-06 10:41:06.284438+05:30',
        '2022-07-06 10:41:06.284438+05:30'
    );
