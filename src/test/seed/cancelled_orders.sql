/* ==============================
            SALES ORDERS
=================================*/
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
/* ==============================
    CUSTOMER CANCELLED ORDERS
=================================*/
(
	/*
	DELIVERY PARTNER NOT ALLOCATED
	VENDOR PREPARING FOOD
	ON 2022-10-17 15:05:05.086+05:30
	*/
	1007
	,'b0909e52-a731-4665-a791-ee6479008805'
	,'7377c3ac-bf96-46a6-9089-46ed357d8119'
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
	"delivery_details":
	{"drop_eta": 10,
	"pickup_eta": 10,
	"deliverable": true,
	"delivery_cost": 58},
	"apartment_road_area": "mumbai",
	"house_flat_block_no": "102"}'
	,NULL
	,'cancelled'
	,NULL
    ,58.00
    ,NULL
	,'cancelled'
	,'accepted'
	,650.19
	,112.50
	,2.50
    ,NULL
    ,NULL
	,0
	,'Dont ring door bell'
	,'customer'
	,'{
		"cancellation_reason": "select wrong delivery address"
	}'
	,'2022-10-17 15:10:11.596861+05:30'
	,'7377c3ac-bf96-46a6-9089-46ed357d8119'
	,'2022-10-17 15:03:14.596861+05:30'
	,'2022-10-17 15:07:11.596861+05:30'
	,20734758
	,5
	,5
	,'2022-10-17 15:05:05.086+05:30'
	,'2022-10-17 15:07:05.8+05:30'
	,'bf9-a069-4c23-a5d4-68ef95dcb595'
	,20
	,NULL
	,NULL
	,14.19
	,578.00
	,NULL
	,false
	,NULL
	,NULL
	,NULL
	,NULL
	,'shadowfax'
	,'{}'
),(
	/*
	DELIVERY PARTNER FAIL TO CANCEL
	VENDOR PREPARING FOOD
	ON 2022-10-18 15:05:05.086+05:30
	*/
	1008
	,'b0909e52-a731-4665-a791-ee6479008805'
	,'7377c3ac-bf96-46a6-9089-46ed357d8119'
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
	"delivery_details":
	{"drop_eta": 10,
	"pickup_eta": 10,
	"deliverable": true,
	"delivery_cost": 58},
	"apartment_road_area": "mumbai",
	"house_flat_block_no": "102"}'
	,NULL
	,'failed_to_cancel'
	,NULL
    ,58.00
    ,NULL
	,'cancelled'
	,'accepted'
	,350.19
	,112.50
	,2.50
    ,NULL
    ,NULL
	,0
	,'Dont ring door bell'
	,'customer'
	,'{
		"cancellation_reason": "select wrong delivery address"
	}'
	,'2022-10-18 15:10:11.596861+05:30'
	,'7377c3ac-bf96-46a6-9089-46ed357d8119'
	,'2022-10-18 15:03:14.596861+05:30'
	,'2022-10-18 15:07:11.596861+05:30'
	,20734758
	,5
	,5
	,'2022-10-18 15:05:05.086+05:30'
	,'2022-10-18 15:07:05.8+05:30'
	,'bf9-a069-4c23-a5d4-68ef95dcb595'
	,20
	,NULL
	,NULL
	,14.19
	,278.00
	,NULL
	,false
	,NULL
	,NULL
	,NULL
	,NULL
	,'shadowfax'
	,'{}'
),
/* ==============================
     ADMIN CANCELLED ORDERS
=================================*/
(
	/*
	DELIVERY PARTNER ALLOCATED
	DELIVERY PARTNER NOT AVAILABLE
	VENDOR PREPARING FOOD
	ON 2022-10-19 15:05:05.086+05:30
	*/
	1009
	,'b0909e52-a731-4665-a791-ee6479008805'
	,'7377c3ac-bf96-46a6-9089-46ed357d8119'
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
	"delivery_details":
	{"drop_eta": 10,
	"pickup_eta": 10,
	"deliverable": true,
	"delivery_cost": 58},
	"apartment_road_area": "mumbai",
	"house_flat_block_no": "102"}'
	,NULL
	,'cancelled'
	,'{
		"allot_time": "2022-10-19 15:10:17.000000Z",
		"rider_name": "Amit Kumar",
		"delivery_order_id": 20734758,
		"client_order_id": "1009",
		"order_status": "ALLOCATTED",
		"rider_contact": "9898989898",
		"rider_latitude": 12.343424,
		"rider_longitude": 77.987987987,
		"pickup_eta": 5,
		"drop_eta": 20
	}'
    ,58.00
    ,NULL
	,'cancelled'
	,'accepted'
	,150.19
	,112.50
	,2.50
    ,NULL
    ,NULL
	,0
	,'Dont ring door bell'
	,'admin'
	,'{
		"cancellation_reason": "delivery partner not available"
	}'
	,'2022-10-19 15:10:11.596861+05:30'
	,'64bfafb6-c273-4b64-a0fc-ca981f5819eb'
	,'2022-10-19 15:03:14.596861+05:30'
	,'2022-10-19 15:07:11.596861+05:30'
	,20734758
	,5
	,5
	,'2022-10-19 15:05:05.086+05:30'
	,'2022-10-19 15:07:05.8+05:30'
	,'bf9-a069-4c23-a5d4-68ef95dcb595'
	,20
	,NULL
	,NULL
	,14.19
	,78.00
	,NULL
	,false
	,NULL
	,NULL
	,NULL
	,NULL
	,'shadowfax'
	,'{}'
),
/* ==============================
    DELIVERY PARTNER CANCELLED ORDERS
=================================*/
(
	/*
	  DELIVERY PARTNER ALLOCATED
	  VENDOR PREPARING FOOD
	  ON ON 2022-10-20 15:05:05.086+05:30
	*/
	1010
	,'b0909e52-a731-4665-a791-ee6479008805'
	,'7377c3ac-bf96-46a6-9089-46ed357d8119'
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
	"delivery_details":
	{"drop_eta": 10,
	"pickup_eta": 10,
	"deliverable": true,
	"delivery_cost": 58},
	"apartment_road_area": "mumbai",
	"house_flat_block_no": "102"}'
	,NULL
	,'cancelled'
	,NULL
    ,58.00
    ,NULL
	,'cancelled'
	,'accepted'
	,230.19
	,112.50
	,2.50
    ,NULL
    ,NULL
	,0
	,'Dont ring door bell'
	,'delivery_service'
	,'{
		"cancellation_reason": "Rider Not Available or is Late"
	}'
	,'2022-10-20 15:10:11.596861+05:30'
	,'1363bbf9-a069-4c23-a5d4-68ef95dcb595'
	,'2022-10-20 15:03:14.596861+05:30'
	,'2022-10-20 15:07:11.596861+05:30'
	,20734758
	,5
	,5
	,'2022-10-20 15:05:05.086+05:30'
	,'2022-10-20 15:07:05.8+05:30'
	,'bf9-a069-4c23-a5d4-68ef95dcb595'
	,20
	,NULL
	,NULL
	,14.19
	,158.00
	,NULL
	,false
	,NULL
	,NULL
	,NULL
	,NULL
	,'shadowfax'
	,'{}'
),
/* ==============================
    NOT CONSIDER SALES ORDERS
=================================*/
/*===============================
      VENDOR CANCELLED ORDERS
=================================*/
(
	/*
	   ON ON 2022-10-22 15:05:05.086+05:30
	*/
	1012
	,'b0909e52-a731-4665-a791-ee6479008805'
	,'7377c3ac-bf96-46a6-9089-46ed357d8119'
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
	"delivery_details":
	{"drop_eta": 10,
	"pickup_eta": 10,
	"deliverable": true,
	"delivery_cost": 58},
	"apartment_road_area": "mumbai",
	"house_flat_block_no": "102"}'
	,NULL
	,'cancelled'
	,NULL
    ,58.00
    ,NULL
	,'cancelled'
	,'accepted'
	,480.19
	,112.50
	,2.50
    ,NULL
    ,NULL
	,0
	,'Dont ring door bell'
	,'vendor'
	,'{
		"cancellation_reason": "Items out of stock"
	}'
	,'2022-10-22 15:10:11.596861+05:30'
	,'33c6fdbc-8df6-4541-9d3f-f9e5ba4c0242'
	,'2022-10-22 15:03:14.596861+05:30'
	,'2022-10-22 15:07:11.596861+05:30'
	,20734758
	,5
	,5
	,'2022-10-22 15:05:05.086+05:30'
	,'2022-10-22 15:07:05.8+05:30'
	,'bf9-a069-4c23-a5d4-68ef95dcb595'
	,20
	,NULL
	,NULL
	,14.19
	,408.00
	,NULL
	,false
	,NULL
	,NULL
	,NULL
	,NULL
	,'shadowfax'
	,'{}'
),
/*===============================
      CUSTOMER CANCELLED ORDERS
=================================*/
(
	/*
	   VENDOR NOT ACCEPTING ORDER
	   ON ON 2022-10-23 15:05:05.086+05:30
	*/
	1013
	,'b0909e52-a731-4665-a791-ee6479008805'
	,'7377c3ac-bf96-46a6-9089-46ed357d8119'
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
	"delivery_details":
	{"drop_eta": 10,
	"pickup_eta": 10,
	"deliverable": true,
	"delivery_cost": 58},
	"apartment_road_area": "mumbai",
	"house_flat_block_no": "102"}'
	,NULL
	,'pending'
	,NULL
    ,58.00
    ,NULL
	,'cancelled'
	,'pending'
	,480.19
	,112.50
	,2.50
    ,NULL
    ,NULL
	,0
	,'Dont ring door bell'
	,'customer'
	,'{
		"cancellation_reason": "vendor not accepting order"
	}'
	,'2022-10-23 15:10:11.596861+05:30'
	,'7377c3ac-bf96-46a6-9089-46ed357d8119'
	,'2022-10-23 15:03:14.596861+05:30'
	,'2022-10-23 15:10:11.596861+05:30'
	,20734758
	,5
	,5
	,'2022-10-23 15:05:05.086+05:30'
	,NULL
	,'bf9-a069-4c23-a5d4-68ef95dcb595'
	,20
	,NULL
	,NULL
	,14.19
	,408.00
	,NULL
	,false
	,NULL
	,NULL
	,NULL
	,NULL
	,'shadowfax'
	,'{}'
),
/*===============================
      ADMIN CANCELLED ORDERS
=================================*/
(
	/*
	   VENDOR NOT ACCEPTING ORDER
	   ON ON 2022-10-24 15:05:05.086+05:30
	*/
	1014
	,'b0909e52-a731-4665-a791-ee6479008805'
	,'7377c3ac-bf96-46a6-9089-46ed357d8119'
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
	"delivery_details":
	{"drop_eta": 10,
	"pickup_eta": 10,
	"deliverable": true,
	"delivery_cost": 58},
	"apartment_road_area": "mumbai",
	"house_flat_block_no": "102"}'
	,NULL
	,'pending'
	,NULL
    ,58.00
    ,NULL
	,'cancelled'
	,'pending'
	,480.19
	,112.50
	,2.50
    ,NULL
    ,NULL
	,0
	,'Dont ring door bell'
	,'admin'
	,'{
		"cancellation_reason": "vendor not accepting order"
	}'
	,'2022-10-24 15:10:11.596861+05:30'
	,'64bfafb6-c273-4b64-a0fc-ca981f5819eb'
	,'2022-10-24 15:03:14.596861+05:30'
	,'2022-10-24 15:10:11.596861+05:30'
	,20734758
	,5
	,5
	,'2022-10-24 15:05:05.086+05:30'
	,NULL
	,'bf9-a069-4c23-a5d4-68ef95dcb595'
	,20
	,NULL
	,NULL
	,14.19
	,408.00
	,NULL
	,false
	,NULL
	,NULL
	,NULL
	,NULL
	,'shadowfax'
	,'{}'
),
/*===============================
      VENDOR REJECTED ORDERS
=================================*/
(
	/*
	   ON ON 2022-10-25 15:05:05.086+05:30
	*/
	1015
	,'b0909e52-a731-4665-a791-ee6479008805'
	,'7377c3ac-bf96-46a6-9089-46ed357d8119'
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
	"delivery_details":
	{"drop_eta": 10,
	"pickup_eta": 10,
	"deliverable": true,
	"delivery_cost": 58},
	"apartment_road_area": "mumbai",
	"house_flat_block_no": "102"}'
	,NULL
	,'pending'
	,NULL
    ,58.00
    ,NULL
	,'cancelled'
	,'rejected'
	,480.19
	,112.50
	,2.50
    ,NULL
    ,NULL
	,0
	,'Dont ring door bell'
	,'vendor'
	,'{
		"cancellation_reason": "Items out of stock"
	}'
	,'2022-10-25 15:07:11.596861+05:30'
	,'33c6fdbc-8df6-4541-9d3f-f9e5ba4c0242'
	,'2022-10-25 15:03:14.596861+05:30'
	,'2022-10-25 15:07:11.596861+05:30'
	,20734758
	,5
	,5
	,'2022-10-25 15:05:05.086+05:30'
	,NULL
	,'bf9-a069-4c23-a5d4-68ef95dcb595'
	,20
	,NULL
	,NULL
	,14.19
	,408.00
	,NULL
	,false
	,NULL
	,NULL
	,NULL
	,NULL
	,'shadowfax'
	,'{}'
),
/*===============================
    DELIVERY PARTNER REJECTED ORDERS
=================================*/
(
	/*
	   ON ON 2022-10-26 15:05:05.086+05:30
	*/
	1016
	,'b0909e52-a731-4665-a791-ee6479008805'
	,'7377c3ac-bf96-46a6-9089-46ed357d8119'
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
	"delivery_details":
	{"drop_eta": 10,
	"pickup_eta": 10,
	"deliverable": true,
	"delivery_cost": 58},
	"apartment_road_area": "mumbai",
	"house_flat_block_no": "102"}'
	,NULL
	,'rejected'
	,NULL
    ,58.00
    ,NULL
	,'cancelled'
	,'accepted'
	,480.19
	,112.50
	,2.50
    ,NULL
    ,NULL
	,0
	,'Dont ring door bell'
	,'delivery_service'
	,'{
		"reason": "duplicate COID detected"
	}'
	,'2022-10-26 15:07:11.596861+05:30'
	,'1363bbf9-a069-4c23-a5d4-68ef95dcb595'
	,'2022-10-26 15:03:14.596861+05:30'
	,'2022-10-26 15:07:11.596861+05:30'
	,20734758
	,5
	,5
	,'2022-10-26 15:05:05.086+05:30'
	,'2022-10-26 15:07:11.596861+05:30'
	,'bf9-a069-4c23-a5d4-68ef95dcb595'
	,20
	,NULL
	,NULL
	,14.19
	,408.00
	,NULL
	,false
	,NULL
	,NULL
	,NULL
	,NULL
	,'shadowfax'
	,'{}'
);
