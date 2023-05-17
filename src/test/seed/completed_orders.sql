/*======================
      SALES ORDERS
=======================*/
INSERT INTO PUBLIC.order (
	id,
	restaurant_id,
	customer_id,
	customer_device_id,
	customer_address,
	order_delivered_at,
	delivery_status,
	delivery_details,
	delivery_charges,
	delivery_tip,
	order_status,
	order_acceptance_status,
	total_customer_payable,
	total_tax,
	packing_charges,
	offer_discount, coupon_id,
	vote_type,
	any_special_request,
	cancelled_by,
	cancellation_details,
	cancellation_time,
	cancellation_user_id,
	created_at,
	updated_at,
	delivery_order_id,
	pickup_eta,
	drop_eta,
	order_placed_time,
	vendor_accepted_time,
	accepted_vendor_id,
	preparation_time,
	vendor_ready_marked_time,
	payout_transaction_id,
	transaction_charges,
	vendor_payout_amount,
	invoice_breakout,
	stop_payment,
	order_pickedup_time,
	comments,
	reviewed_at,
	refund_status,
	delivery_service,
	additional_details
)VALUES
(
	/*
	COMPLETED ORDER
	ON 2022-10-10 15:05:05.086+05:30
	*/
    1000
	,'b0909e52-a731-4665-a791-ee6479008805'
	,'33c6fdbc-8df6-4541-9d3f-f9e5ba4c0242'
	,'12412423432424413213123'
	,'{
		"id": "e2e960cc-7c92-4299-a8a8-9ef398dec296",
		"city": "Mumbai",
		"name": "Home",
		"email": "ankita.t@speedyy.com",
		"phone": "+918758668003",
		"state": "Maharashtra",
		"country": "India",
		"pincode": "400049",
		"latitude": "19.109046407463914",
		"longitude": "72.82666376980342",
		"created_at": "2022-10-03T14:05:01.227Z",
		"directions": "ABC",
		"updated_at": "2022-10-03T14:05:01.227Z",
		"customer_id": "7377c3ac-bf96-46a6-9089-46ed357d8119",
		"deliverable": true,
		"customer_name": "Ankita Thakkar",
		"alternate_phone": null,
		"delivery_details": {
			"drop_eta": 10,
			"pickup_eta": 10,
			"deliverable": true,
			"delivery_cost": 58
		},
		"apartment_road_area": "mumbai",
		"house_flat_block_no": "102"
	}'
	,'2022-10-11 14:55:17+05:30'
	,'delivered'
	,'{
		"rider_name": "Amit Kumar",
		"order_status": "DELIVERED",
	    "delivery_order_id": 20734758,
	    "delivery_time": "2022-10-09T15:35:17.000000Z",
	    "rider_contact": "9898989898",
	    "rider_latitude": 12.343424,
	    "client_order_id": "1000",
        "rider_longitude": 77.987987987
	}'
    ,58.00
    ,NULL
	,'completed'
	,'accepted'
	,390.19
	,112.50
	,2.50
    ,NULL
    ,NULL
	,1
	,'Dont ring door bell'
	,NULL
	,NULL
	,NULL
	,NULL
	,'2022-10-10 15:03:14.596861+05:30'
	,'2022-10-10 15:58:40.708+05:30'
	,20734758
	,5
	,5
	,'2022-10-10 15:05:05.086+05:30'
	,'2022-10-10 15:07:11.8+05:30'
	,'bf9-a069-4c23-a5d4-68ef95dcb595'
	,20
	,'2022-10-10 15:20:26.292+05:30'
	,NULL
	,14.19
	,318.55
	,NULL
	,false
	,'2022-10-10 15:22:26.292+05:30'
	,'Loved it'
	,'2022-10-10 15:58:40.708+05:30'
	,NULL
	,'shadowfax'
	,'{}'
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
	'RES_99c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
	1000
	,'33c6fdbc-8df6-4541-9d3f-f9e5ba4c0242'
	,'20220518111212800110168531851371782'
	,'55938d4f422145838c626d26428896d21652365642957'
	,'completed'
	,'PPI'
	,'WALLET'
	,'{
		"txnDate": "2022-05-18 15:28:37.0",
		"txnType": "SALE",
		"bankName": "WALLET",
		"bankTxnId": "187357186285",
		"refundAmt": "0.00",
		"resultInfo": {
			"resultMsg": "Txn Success",
			"resultCode": "01",
			"resultStatus": "TXN_SUCCESS"
		}
	}'
	,1.00
    ,'2022-05-12T14:27:22.518718+00:00'
	,'2022-05-12T14:27:22.518718+00:00'
	,'2022-05-12T14:27:22.518718+00:00'

);

INSERT INTO public.order_item
VALUES(
	1000
	,1
	,'b0909e52-a731-4665-a791-ee6479008805'
	,'Veg Burger'
	,NULL
	,111
	,381.00
	,'veg'
	,2.50
	,'false'
	,2
	,12.5000
	,12.5000
	,12.5000
	,12.5000
	,'false'
	,'xyz'
	,'false'
	,'{
        "name": "d3641f8c-9e52-4cf3-930a-7180826fd8b7.jpg",
        "path": "menu_item/images/",
        "bucket": "speedyy-dev-test-grocery-api-public"
    }'
	,'2022-07-28 15:33:06.113341+05:30'
	,'2022-07-28 15:33:06.113341+05:30'
	,11101
	,1
);
