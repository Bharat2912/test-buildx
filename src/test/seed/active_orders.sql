/*===============================
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
(
	/*
	ONGOING ORDER
	VENDOR and DELIVERY_PARTNER ACCEPTED ORDER
	ON 2022-10-11 15:05:05.086+05:30
	*/
	1001
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
	,'accepted'
	,NULL
    ,58.00
    ,NULL
	,'placed'
	,'accepted'
	,487.19
	,112.50
	,2.50
    ,NULL
    ,NULL
	,0
	,'Dont ring door bell'
	,NULL
	,NULL
	,NULL
	,NULL
	,'2022-10-11 15:03:14.596861+05:30'
	,'2022-10-11 15:07:11.596861+05:30'
	,20734758
	,5
	,5
	,'2022-10-11 15:05:05.086+05:30'
	,'2022-10-11 15:07:11.8+05:30'
	,'bf9-a069-4c23-a5d4-68ef95dcb595'
	,20
	,NULL
	,NULL
	,14.19
	,415.00
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
	ONGOING ORDER
	DELIVERY PARTNER ALLOCATED ORDER
	VENDOR PREPARING ORDER
	ON 2022-10-12 15:05:05.086+05:30
	*/
	1002
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
	,'allocated'
	,'{
		"allot_time": "2022-10-12 15:10:17.000000Z",
		"rider_name": "Amit Kumar",
		"delivery_order_id": 20734758,
		"client_order_id": "1002",
		"order_status": "ALLOCATTED",
		"rider_contact": "9898989898",
		"rider_latitude": 12.343424,
		"rider_longitude": 77.987987987,
		"pickup_eta": 5,
		"drop_eta": 20
	}'
    ,58.00
    ,NULL
	,'placed'
	,'accepted'
	,700.19
	,112.50
	,2.50
    ,NULL
    ,NULL
	,0
	,'Dont ring door bell'
	,NULL
	,NULL
	,NULL
	,NULL
	,'2022-10-12 15:03:14.596861+05:30'
	,'2022-10-12 15:10:17.596861+05:30'
	,20734758
	,5
	,5
	,'2022-10-12 15:05:05.086+05:30'
	,'2022-10-12 15:07:11.8+05:30'
	,'bf9-a069-4c23-a5d4-68ef95dcb595'
	,20
	,NULL
	,NULL
	,14.19
	,628.00
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
	ONGOING ORDER
	DELIVERY PARTNER ARRIVED ORDER
	VENDOR PREPARING ORDER
	ON 2022-10-13 15:05:05.086+05:30
	*/
	1003
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
	,'arrived'
	,'{
		"arrival_time": "2022-10-13 15:10:11.000000Z",
  		"rider_name": "Amit Kumar",
  		"delivery_order_id": 20734758,
  		"client_order_id": "1003",
  		"order_status": "ARRIVED",
  		"rider_contact": "9898989898",
  		"rider_latitude": 12.343424,
  		"rider_longitude": 77.987987987,
  		"track_url": "http://api.shadowfax.in/track/",
  		"pickup_eta": 3,
  		"drop_eta": 18}'
    ,58.00
    ,NULL
	,'placed'
	,'accepted'
	,450.19
	,112.50
	,2.50
    ,NULL
    ,NULL
	,0
	,'Dont ring door bell'
	,NULL
	,NULL
	,NULL
	,NULL
	,'2022-10-13 15:03:14.596861+05:30'
	,'2022-10-13 15:07:11.596861+05:30'
	,20734758
	,5
	,5
	,'2022-10-13 15:05:05.086+05:30'
	,'2022-10-13 15:07:11.8+05:30'
	,'bf9-a069-4c23-a5d4-68ef95dcb595'
	,20
	,NULL
	,NULL
	,14.19
	,378.00
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
	ONGOING ORDER
	DELIVERY PARTNER ARRIVED ORDER
	VENDOR PREPARED ORDER
	ON 2022-10-14 15:05:05.086+05:30
	*/
	1004
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
	,'arrived'
	,'{
		"drop_eta": 15,
		"track_url": "http://api.shadowfax.in/track/",
		"pickup_eta": null,
		"rider_name": "Amit Kumar",
		"order_status": "ARRIVED",
		"delivery_order_id": 20734758,
		"arrival_time": "2017-11-14T15:10:17.000000Z",
		"rider_contact": "9898989898",
		"rider_latitude": 12.343424,
		"client_order_id": "1004",
		"rider_longitude": 77.987987987}'
    ,58.00
    ,NULL
	,'placed'
	,'accepted'
	,500.19
	,112.50
	,2.50
    ,NULL
    ,NULL
	,0
	,'Dont ring door bell'
	,NULL
	,NULL
	,NULL
	,NULL
	,'2022-10-14 15:03:14.596861+05:30'
	,'2022-10-14 15:07:11.596861+05:30'
	,20734758
	,5
	,5
	,'2022-10-14 15:05:05.086+05:30'
	,'2022-10-14 15:07:11.8+05:30'
	,'bf9-a069-4c23-a5d4-68ef95dcb595'
	,20
	,'2022-10-14 15:25:05.086+05:30'
	,NULL
	,14.19
	,428.00
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
	ONGOING DISPATCHED ORDER
	ON 2022-10-15 15:05:05.086+05:30
	*/
	1005
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
	,'dispatched'
	,'{
		"drop_eta": 15,
		"track_url": "http://api.shadowfax.in/track/",
		"pickup_eta": null,
		"rider_name": "Amit Kumar",
		"order_status": "DISPATCHED",
		"delivery_order_id": 20734758,
		"dispatch_time": "2022-10-15 15:25:05.000000Z",
		"rider_contact": "9898989898",
		"rider_latitude": 12.343424,
		"client_order_id": "1005",
		"rider_longitude": 77.987987987}'
    ,58.00
    ,NULL
	,'placed'
	,'accepted'
	,800.19
	,112.50
	,2.50
    ,NULL
    ,NULL
	,0
	,'Dont ring door bell'
	,NULL
	,NULL
	,NULL
	,NULL
	,'2022-10-15 15:03:14.596861+05:30'
	,'2022-10-15 15:07:11.596861+05:30'
	,20734758
	,5
	,5
	,'2022-10-15 15:05:05.086+05:30'
	,'2022-10-15 15:07:05.8+05:30'
	,'bf9-a069-4c23-a5d4-68ef95dcb595'
	,20
	,'2022-10-15 15:25:05.086+05:30'
	,NULL
	,14.19
	,728.00
	,NULL
	,false
	,'2022-10-15 15:27:05.086+05:30'
	,NULL
	,NULL
	,NULL
	,'shadowfax'
	,'{}'
),(
	/*
	ONGOING ARRIVED_CUSTOMER_DOORSTEP ORDER
	ON 2022-10-16 15:05:05.086+05:30
	*/
	1006
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
	,'arrived_customer_doorstep'
	,'{
		"drop_eta": 15,
		"track_url": "http://api.shadowfax.in/track/",
		"pickup_eta": null,
		"rider_name": "Amit Kumar",
		"order_status": "ARRIVED_CUSTOMER_DOORSTEP",
		"delivery_order_id": 20734758,
		"customer_doorstep_arrival_time": "2022-10-15 15:30:05.000000Z",
		"rider_contact": "9898989898",
		"rider_latitude": 12.343424,
		"client_order_id": "1006",
		"rider_longitude": 77.987987987}'
    ,58.00
    ,NULL
	,'placed'
	,'accepted'
	,850.19
	,112.50
	,2.50
    ,NULL
    ,NULL
	,0
	,'Dont ring door bell'
	,NULL
	,NULL
	,NULL
	,NULL
	,'2022-10-16 15:03:14.596861+05:30'
	,'2022-10-16 15:07:11.596861+05:30'
	,20734758
	,5
	,5
	,'2022-10-16 15:05:05.086+05:30'
	,'2022-10-16 15:07:05.8+05:30'
	,'bf9-a069-4c23-a5d4-68ef95dcb595'
	,20
	,'2022-10-16 15:25:05.086+05:30'
	,NULL
	,14.19
	,778.00
	,NULL
	,false
	,'2022-10-16 15:27:05.086+05:30'
	,NULL
	,NULL
	,NULL
	,'shadowfax'
	,'{}'
),(
	/* VENDOR NOT ACCEPTING ORDER
	   ON ON 2022-10-21 15:05:05.086+05:30
	*/
	1011
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
	,'placed'
	,'pending'
	,480.19
	,112.50
	,2.50
    ,NULL
    ,NULL
	,0
	,'Dont ring door bell'
	,NULL
	,NULL
	,NULL
	,NULL
	,'2022-10-21 15:03:14.596861+05:30'
	,'2022-10-21 15:07:11.596861+05:30'
	,20734758
	,5
	,5
	,'2022-10-21 15:05:05.086+05:30'
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
);
