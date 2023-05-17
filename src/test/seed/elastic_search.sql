INSERT INTO public.plan(
    id,
    name,
    type,
    category,
    amount,
    interval_type,
    intervals,
    description,
    no_of_orders,
    no_of_grace_period_orders,
    active,
    terms_and_conditions,
    created_at,
    updated_at
)VALUES
  (
   'RES_549f2e33-1681-4f04-acbf-7ab537b95d9d',
   'Free Plan',
    'free',
    'basic',
    0.00,
    'year',
    0,
    'description of plan',
    100,
    50,
    'true',
    'terms_and_conditions',
    '2022-12-06 11:47:51.653538+05:30',
    '2022-12-06 11:47:51.653538+05:30'
);

INSERT INTO public.cuisine_master (
    id,
    name,
    status,
    created_at,
    updated_at,
    is_deleted
)VALUES (
    'b5af8efa-88f4-4993-aa34-eb149de8440b',
    'Punjabi',
    'active',
    '2022-02-17 11:38:59.842333+00',
    '2022-02-17 11:38:59.842333+00',
    false
);

INSERT INTO public.cuisine_master (
    id,
    name,
    status,
    created_at,
    updated_at,
    is_deleted
) VALUES (
    '171e0d02-eafc-413b-be7a-ffc28624880f',
    'South Indian',
    'active',
    '2022-02-17 11:38:59.842333+00',
    '2022-02-17 11:38:59.842333+00',
    false
);

INSERT INTO PUBLIC.restaurant (
	id
	,partner_id
	,NAME
	,lat
	,long
	,STATUS
	,created_at
	,updated_at
	,is_deleted
	,orders_count
	,like_count
	,delivery_time
	,image
	,images
	,city_id
	,area_id
	,packing_charge_type
	,packing_charge_item
	,packing_charge_order
	,cuisine_ids
	,is_pure_veg
	,cost_of_two
	,allow_long_distance
)VALUES (
	'b0909e52-a731-4665-a791-ee6479008805'
	,'cc37e5e6-0a0e-4e73-848c-aeed4ad2a695'
	,'Punjabi Restaurant'
	,72.34439
	,23.01191
	,'active'
	,'2022-04-27 10:24:01.873499+05:30'
	,'2022-04-27 10:24:01.873499+05:30'
	,false
	,0
	,0
	,0
	,'{"name": "25887d2c-4dc4-42a1-9e3d-62a6f0c33cae.jpg"}'
	,array['{"name": "25887d2c-4dc4-42a1-9e3d-62a6f0c33cae.jpg"}']::jsonb[]
	,'25887d2c-4dc4-42a1-9e3d-62a6f0c33cae'
	,'25887d2c-4dc4-42a1-9e3d-62a6f0c33cae'
	,'none'
	,'{"{\"item_name\": \"Paneer Tikka\", \"item_price\": 120, \"packing_image\": {\"name\": \"25887d2c-4dc4-42a1-9e3d-62a6f0c33cae.jpg\"}, \"packing_charge\": 2.5}"}'
	,'{"packing_image": {"name": "25887d2c-4dc4-42a1-9e3d-62a6f0c33cae.jpg"}, "packing_charge": 2.5}'
	,'{b5af8efa-88f4-4993-aa34-eb149de8440b}'
	,true
	,500
	,true
);

/*============ CREATE SUBSCRIPTION ===========*/
INSERT INTO public.subscription(
    id,
    restaurant_id,
    plan_id,
    status,
    description,
    customer_name,
    customer_email,
    customer_phone,
    start_time,
    end_time,
    created_at,
    updated_at
)VALUES(
   'RES_61cf2432-02f6-4953-9c8c-c77fed692f85',
    'b0909e52-a731-4665-a791-ee6479008805',
    'RES_549f2e33-1681-4f04-acbf-7ab537b95d9d',
    'active',
    'description',
    'jhon shen',
    'jhon@gmail.com',
    '+919819999999',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + interval '1' day,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

/*========= SET PUNJABI RESTAURANT SUBSCRIPTION ==========*/
UPDATE public.restaurant
SET
subscription_id = 'RES_61cf2432-02f6-4953-9c8c-c77fed692f85',
subscription_end_time = CURRENT_TIMESTAMP + interval '1' day,
subscription_grace_period_remaining_orders = 50,
subscription_remaining_orders = 100
WHERE id = 'b0909e52-a731-4665-a791-ee6479008805';


INSERT INTO PUBLIC.restaurant (
	id
	,partner_id
	,NAME
	,lat
	,long
	,STATUS
	,created_at
	,updated_at
	,is_deleted
	,orders_count
	,like_count
	,delivery_time
	,image
	,images
	,city_id
	,area_id
	,packing_charge_type
	,packing_charge_item
	,packing_charge_order
	,cuisine_ids
	,is_pure_veg
	,cost_of_two
	,allow_long_distance
)VALUES (
	'3e734502-c5f1-4f58-9231-6f5b58835d3e'
	,'cc37e5e6-0a0e-4e73-848c-aeed4ad2a695'
	,'Govindashram Restaurant'
	,19.210525
	,73.090418
	,'disable'
	,'2022-04-27 10:24:01.873499+05:30'
	,'2022-04-27 10:24:01.873499+05:30'
	,false
	,0
	,0
	,0
	,'{"name": "25887d2c-4dc4-42a1-9e3d-62a6f0c33cae.jpg"}'
	,array['{"name": "25887d2c-4dc4-42a1-9e3d-62a6f0c33cae.jpg"}']::jsonb[]
	,'25887d2c-4dc4-42a1-9e3d-62a6f0c33cae'
	,'25887d2c-4dc4-42a1-9e3d-62a6f0c33cae'
	,'none'
	,'{"{\"item_name\": \"Paneer Tikka\", \"item_price\": 120, \"packing_image\": {\"name\": \"25887d2c-4dc4-42a1-9e3d-62a6f0c33cae.jpg\"}, \"packing_charge\": 2.5}"}'
	,'{"packing_image": {"name": "25887d2c-4dc4-42a1-9e3d-62a6f0c33cae.jpg"}, "packing_charge": 2.5}'
	,'{b5af8efa-88f4-4993-aa34-eb149de8440b}'
	,true
	,500
	,true
);

/*============ CREATE SUBSCRIPTION ===========*/
INSERT INTO public.subscription(
    id,
    restaurant_id,
    plan_id,
    status,
    description,
    customer_name,
    customer_email,
    customer_phone,
    start_time,
    end_time,
    created_at,
    updated_at
)VALUES(
   'RES_77cf2432-02f6-4953-9c8c-c77fed692f85',
    '3e734502-c5f1-4f58-9231-6f5b58835d3e',
    'RES_549f2e33-1681-4f04-acbf-7ab537b95d9d',
    'active',
    'description',
    'jhon shen',
    'jhon@gmail.com',
    '+919819999999',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + interval '1' day,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

/*========= SET PUNJABI RESTAURANT SUBSCRIPTION ==========*/
UPDATE public.restaurant
SET
subscription_id = 'RES_77cf2432-02f6-4953-9c8c-c77fed692f85',
subscription_end_time = CURRENT_TIMESTAMP + interval '1' day,
subscription_grace_period_remaining_orders = 50,
subscription_remaining_orders = 100
WHERE id = '3e734502-c5f1-4f58-9231-6f5b58835d3e';

INSERT INTO PUBLIC.slot(
	id,
	restaurant_id,
	slot_name,
	start_time,
	end_time,
	status,
	created_at,
	updated_at
)VALUES(
	'44b1483f-bf76-4393-9424-5950d8a3c78d',
	'3e734502-c5f1-4f58-9231-6f5b58835d3e',
	'all',
	'2358',
	'2359',
	'created',
	'2022-07-28 13:57:37.95152+05:30',
	'2022-07-28 13:57:37.95152+05:30'
);

INSERT INTO public.restaurant(
    id,
    partner_id,
    name,
    lat,
    long,
    status,
    created_at,
    updated_at,
    is_deleted,
    orders_count,
    like_count,
    delivery_time,
	image,
    images,
    city_id,
    area_id,
    packing_charge_type,
    packing_charge_order,
    is_pure_veg,
    cost_of_two,
    allow_long_distance,
    cuisine_ids,
    packing_charge_item)
VALUES (
    '77e53c1f-6e9e-4724-9ba7-92edc69cff6b',
    'f1a41fd3-c764-43f7-a43d-e4087b6bf90e',
    'South Indian Restaurant',
	73.51133,
	18.31262,
    'active',
    '2022-03-02 14:23:19.30874+00',
    '2022-03-02 14:23:19.30874+00',
    false,
    4080,
    3,
    47,
	'{"name": "restaurant_(9).jpg", "path": "restaurant/images/", "bucket": "speedyy-image-upload"}',
    array['{"name": "restaurant_(9).jpg", "path": "restaurant/images/", "bucket": "speedyy-image-upload"}']::jsonb[],
    '25887d2c-4dc4-42a1-9e3d-62a6f0c33cae',
    '25887d2c-4dc4-42a1-9e3d-62a6f0c33cae',
    'order', '{"packing_image": {"name": "f44c2688-cfb7-47a3-a299-95b39b26204b.png", "path": "restaurant/packing_charge_order_image/", "bucket": "speedyy-image-upload"}, "packing_charge": 2.5}',
    true,
    650,
    false,
    '{171e0d02-eafc-413b-be7a-ffc28624880f}',
    NULL
);

/*============ CREATE SUBSCRIPTION ===========*/
INSERT INTO public.subscription(
    id,
    restaurant_id,
    plan_id,
    status,
    description,
    customer_name,
    customer_email,
    customer_phone,
    start_time,
    end_time,
    created_at,
    updated_at
)VALUES(
   'RES_bbd8a619-19d0-4d1d-b501-04d475300ac4',
    '77e53c1f-6e9e-4724-9ba7-92edc69cff6b',
    'RES_549f2e33-1681-4f04-acbf-7ab537b95d9d',
    'active',
    'description',
    'jhon shen',
    'jhon@gmail.com',
    '+919819999999',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + interval '1' day,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

/*========= SET SOUTH INDIAN RESTAUARANT SUBSCRIPTION ==========*/
UPDATE public.restaurant
SET
subscription_id = 'RES_bbd8a619-19d0-4d1d-b501-04d475300ac4',
subscription_end_time = CURRENT_TIMESTAMP + interval '1' day,
subscription_grace_period_remaining_orders = 50,
subscription_remaining_orders = 100
WHERE id = '77e53c1f-6e9e-4724-9ba7-92edc69cff6b';

/*========= APPROVAL PRENDING RESTAURANT ==========*/
INSERT INTO public.restaurant(
    id,
    partner_id,
    name,
    lat,
    long,
    status,
    created_at,
    updated_at,
    is_deleted,
    orders_count,
    like_count,
    delivery_time,
	image,
    images,
    city_id,
    area_id,
    packing_charge_type,
    packing_charge_order,
    is_pure_veg,
    cost_of_two,
    allow_long_distance,
    cuisine_ids,
    packing_charge_item)
VALUES (
    '8851b46b-eb01-4726-a843-4ab3e01a9df2',
    'f1a41fd3-c764-43f7-a43d-e4087b6bf90b',
    'catalog Pending',
	72.34439,
	23.01191,
    'catalogPending',
    '2022-03-02 14:23:19.30874+00',
    '2022-03-02 14:23:19.30874+00',
    false,
    4080,
    3,
    47,
	'{"name": "restaurant_(9).jpg", "path": "restaurant/images/", "bucket": "speedyy-image-upload"}',
    array['{"name": "restaurant_(9).jpg", "path": "restaurant/images/", "bucket": "speedyy-image-upload"}']::jsonb[],
    '25887d2c-4dc4-42a1-9e3d-62a6f0c33cae',
    '25887d2c-4dc4-42a1-9e3d-62a6f0c33cae',
    'order', '{"packing_image": {"name": "f44c2688-cfb7-47a3-a299-95b39b26204b.png", "path": "restaurant/packing_charge_order_image/", "bucket": "speedyy-image-upload"}, "packing_charge": 2.5}',
    true,
    650,
    false,
    '{171e0d02-eafc-413b-be7a-ffc28624880f}',
    NULL
);

/*======= PUNJABI RESTAURANT SLOT ==============*/
INSERT INTO PUBLIC.slot(
	id,
	restaurant_id,
	slot_name,
	start_time,
	end_time,
	status,
	created_at,
	updated_at
)VALUES(
	'01c27c0d-8bd2-411d-9b2e-9fe93518e84e',
	'b0909e52-a731-4665-a791-ee6479008805',
	'all',
	'0000',
	'2359',
	'created',
	'2022-07-28 13:57:37.95152+05:30',
	'2022-07-28 13:57:37.95152+05:30'
);

/*======== SOUTH INDIAN RESTAURANT SLOT ========*/
INSERT INTO PUBLIC.slot(
	id,
	restaurant_id,
	slot_name,
	start_time,
	end_time,
	status,
	created_at,
	updated_at
)VALUES(
	'04b1483f-bf76-4393-9424-5950d8a3c78d',
	'77e53c1f-6e9e-4724-9ba7-92edc69cff6b',
	'all',
	'2358',
	'2359',
	'created',
	'2022-07-28 13:57:37.95152+05:30',
	'2022-07-28 13:57:37.95152+05:30'
);

/*==== PUNJABI CATEGOTY =====*/
INSERT INTO PUBLIC.main_category(
	id,
	name,
	restaurant_id,
	created_at,
    updated_at,
    is_deleted
)VALUES(
	1000,
	'Punjabi Thali',
	'b0909e52-a731-4665-a791-ee6479008805',
	'2022-07-28 14:25:40.931991+05:30',
	'2022-07-28 14:25:40.931991+05:30',
	false
);

INSERT INTO PUBLIC.sub_category(
	id,
	name,
	main_category_id,
	created_at,
    updated_at,
    is_deleted
)VALUES(
	1100,
	'Punjabi dishes',
	1000,
	'2022-07-28 14:25:40.931991+05:30',
	'2022-07-28 14:25:40.931991+05:30',
	false
);

/*======= SOUTH INDIAN CATEGORY =======*/
INSERT INTO PUBLIC.main_category(
	id,
	name,
	restaurant_id,
	created_at,
    updated_at,
    is_deleted
)VALUES(
	1001,
	'South Indian Thali',
	'b0909e52-a731-4665-a791-ee6479008805',
	'2022-07-28 14:25:40.931991+05:30',
	'2022-07-28 14:25:40.931991+05:30',
	false
);

INSERT INTO PUBLIC.sub_category(
	id,
	name,
	main_category_id,
	created_at,
    updated_at,
    is_deleted
)VALUES(
	1101,
	'South Indian dishes',
	1001,
	'2022-07-28 14:25:40.931991+05:30',
	'2022-07-28 14:25:40.931991+05:30',
	false
);

/*========== MENU ITEMS FOR PUNJABI RESTAURANT  ========*/
INSERT INTO PUBLIC.menu_item (
	id
	,restaurant_id
	,NAME
	,description
	,sub_category_id
	,price
	,veg_egg_non
	,packing_charges
	,is_spicy
	,serves_how_many
	,service_charges
	,item_sgst_utgst
	,item_cgst
	,item_igst
	,item_inclusive
	,disable
	,external_id
	,allow_long_distance
	,IMAGE
	,created_at
	,updated_at
	,is_deleted
	,next_available_after
)VALUES (
	10000
	,'b0909e52-a731-4665-a791-ee6479008805'
	,'menu item punjabi name'
	,'description'
	,1100
	,100
	,'veg'
	,10
	,true
	,1
	,10
	,0
	,0
	,0
	,true
	,false
	,'123'
	,true
	,'{}'
	,'2022-04-27 10:24:01.883+05:30'
	,'2022-04-27 10:24:01.883+05:30'
	,false
	,'2022-04-27 10:24:01.883+05:30'
);

INSERT INTO PUBLIC.menu_item (
	id
	,restaurant_id
	,NAME
	,description
	,sub_category_id
	,price
	,veg_egg_non
	,packing_charges
	,is_spicy
	,serves_how_many
	,service_charges
	,item_sgst_utgst
	,item_cgst
	,item_igst
	,item_inclusive
	,disable
	,external_id
	,allow_long_distance
	,IMAGE
	,created_at
	,updated_at
	,is_deleted
	,next_available_after
)VALUES (
	10001
	,'b0909e52-a731-4665-a791-ee6479008805'
	,'menu item punjabi second name'
	,'description'
	,1100
	,100
	,'veg'
	,10
	,true
	,1
	,10
	,0
	,0
	,0
	,true
	,false
	,'123'
	,true
	,'{}'
	,'2022-04-27 10:24:01.883+05:30'
	,'2022-04-27 10:24:01.883+05:30'
	,false
	,'2022-04-27 10:24:01.883+05:30'
);

/*======== MENU ITEMS FOR SOUTH INDIAN RESTAURANT =====*/
INSERT INTO PUBLIC.menu_item (
	id
	,restaurant_id
	,NAME
	,description
	,sub_category_id
	,price
	,veg_egg_non
	,packing_charges
	,is_spicy
	,serves_how_many
	,service_charges
	,item_sgst_utgst
	,item_cgst
	,item_igst
	,item_inclusive
	,disable
	,external_id
	,allow_long_distance
	,IMAGE
	,created_at
	,updated_at
	,is_deleted
	,next_available_after
)VALUES (
	10002
	,'77e53c1f-6e9e-4724-9ba7-92edc69cff6b'
	,'menu item south indian name'
	,'description'
	,1101
	,100
	,'veg'
	,10
	,true
	,1
	,10
	,0
	,0
	,0
	,true
	,false
	,'123'
	,true
	,'{}'
	,'2022-04-27 10:24:01.883+05:30'
	,'2022-04-27 10:24:01.883+05:30'
	,false
	,'2022-04-27 10:24:01.883+05:30'
);

INSERT INTO PUBLIC.menu_item (
	id
	,restaurant_id
	,NAME
	,description
	,sub_category_id
	,price
	,veg_egg_non
	,packing_charges
	,is_spicy
	,serves_how_many
	,service_charges
	,item_sgst_utgst
	,item_cgst
	,item_igst
	,item_inclusive
	,disable
	,external_id
	,allow_long_distance
	,IMAGE
	,created_at
	,updated_at
	,is_deleted
	,next_available_after
)VALUES (
	10003
	,'77e53c1f-6e9e-4724-9ba7-92edc69cff6b'
	,'menu item punjabi second name'
	,'description'
	,1101
	,100
	,'veg'
	,10
	,true
	,1
	,10
	,0
	,0
	,0
	,true
	,false
	,'123'
	,true
	,'{}'
	,'2022-04-27 10:24:01.883+05:30'
	,'2022-04-27 10:24:01.883+05:30'
	,false
	,'2022-04-27 10:24:01.883+05:30'
);
