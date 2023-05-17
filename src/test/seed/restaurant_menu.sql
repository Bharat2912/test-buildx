INSERT INTO PUBLIC.main_category (
	id
	,NAME
	,restaurant_id
	,pos_id
	,pos_partner
	,created_at
	,updated_at
	,is_deleted
	)
VALUES (
	100
	,'main category name'
	,'b0909e52-a731-4665-a791-ee6479008805'
	,null
	,null
	,'2022-04-27 10:24:01.881+05:30'
	,'2022-04-27 10:24:01.881+05:30'
	,false
),
(
	200
	,'main category name 2'
	,'b0909e52-a731-4665-a791-ee6479008805'
	,null
	,null
	,'2022-04-27 10:24:01.881+05:30'
	,'2022-04-27 10:24:01.881+05:30'
	,false
);

INSERT INTO PUBLIC.sub_category (
	id
	,NAME
	,main_category_id
	,pos_id
	,pos_partner
	,created_at
	,updated_at
	,is_deleted
	)
VALUES (
	111
	,'sub category name'
	,100
	,null
	,null
	,'2022-04-27 10:24:01.882+05:30'
	,'2022-04-27 10:24:01.882+05:30'
	,false
),(
	112
	,'sub category name 2'
	,200
	,null
	,null
	,'2022-04-27 10:24:01.882+05:30'
	,'2022-04-27 10:24:01.882+05:30'
	,false
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
	,pos_id
	,pos_partner
	,created_at
	,updated_at
	,is_deleted
	,next_available_after
	)
VALUES (
	11101
	,'b0909e52-a731-4665-a791-ee6479008805'
	,'Veg Burger'
	,'description'
	,111
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
	,null
	,null
	,'2022-04-27 10:24:01.883+05:30'
	,'2022-04-27 10:24:01.883+05:30'
	,false
	,'2022-04-27 10:24:01.883+05:30'
),
/*===========================
CHANGE SUB CATEGORY MENU ITEM
==============================*/
(
	11102
	,'b0909e52-a731-4665-a791-ee6479008805'
	,'menu item name 2'
	,'description'
	,111
	,120
	,'veg'
	,12
	,true
	,1
	,12
	,0
	,0
	,0
	,true
	,false
	,'123'
	,true
	,'{}'
	,null
	,null
	,'2022-04-27 10:24:01.883+05:30'
	,'2022-04-27 10:24:01.883+05:30'
	,false
	,'2022-04-27 10:24:01.883+05:30'
),
/*===========================
CREATE NEW SUB CATEGORY MENU ITEM
==============================*/
(
	11103
	,'b0909e52-a731-4665-a791-ee6479008805'
	,'menu item name 3'
	,'description'
	,112
	,120
	,'veg'
	,12
	,true
	,1
	,12
	,0
	,0
	,0
	,true
	,false
	,'123'
	,true
	,'{}'
	,null
	,null
	,'2022-04-27 10:24:01.883+05:30'
	,'2022-04-27 10:24:01.883+05:30'
	,false
	,'2022-04-27 10:24:01.883+05:30'
),
(
	11104
	,'b0909e52-a731-4665-a791-ee6479008805'
	,'menu item name 4'
	,'description'
	,112
	,120
	,'veg'
	,12
	,true
	,1
	,12
	,0
	,0
	,0
	,true
	,false
	,'123'
	,true
	,'{}'
	,null
	,null
	,'2022-04-27 10:24:01.883+05:30'
	,'2022-04-27 10:24:01.883+05:30'
	,false
	,'2022-04-27 10:24:01.883+05:30'
);

INSERT INTO PUBLIC.addon_group (
	id
	,NAME
	,restaurant_id
	,pos_id
	,pos_partner
	,created_at
	,updated_at
	,is_deleted
	)
VALUES (
	77
	,'addon group name'
	,'b0909e52-a731-4665-a791-ee6479008805'
	,null
	,null
	,'2022-04-27 10:24:01.887+05:30'
	,'2022-04-27 10:24:01.887+05:30'
	,false
);
INSERT INTO PUBLIC.addon (
	id
	,NAME
	,addon_group_id
	,sequence
	,price
	,veg_egg_non
	,in_stock
	,sgst_rate
	,cgst_rate
	,igst_rate
	,gst_inclusive
	,external_id
	,STATUS
	,pos_id
	,pos_partner
	,created_at
	,updated_at
	,is_deleted
	)
VALUES (
	7767
	,'addon name 1'
	,77
	,1
	,12.00
	,'veg'
	,true
	,0.0000
	,0.0000
	,0.0000
	,true
	,'76777'
	,'active'
	,null
	,null
	,'2022-04-27 10:24:01.888+05:30'
	,'2022-04-27 10:24:01.888+05:30'
	,false
);
INSERT INTO PUBLIC.addon (
	id
	,NAME
	,addon_group_id
	,sequence
	,price
	,veg_egg_non
	,in_stock
	,sgst_rate
	,cgst_rate
	,igst_rate
	,gst_inclusive
	,external_id
	,STATUS
	,pos_id
	,pos_partner
	,created_at
	,updated_at
	,is_deleted
	)
VALUES (
	7768
	,'addon name 2'
	,77
	,1
	,10.00
	,'veg'
	,true
	,0.0000
	,0.0000
	,0.0000
	,true
	,'76778'
	,'active'
	,null
	,null
	,'2022-04-27 10:24:01.888+05:30'
	,'2022-04-27 10:24:01.888+05:30'
	,false
);
INSERT INTO PUBLIC.addon (
	id
	,NAME
	,addon_group_id
	,sequence
	,price
	,veg_egg_non
	,in_stock
	,sgst_rate
	,cgst_rate
	,igst_rate
	,gst_inclusive
	,external_id
	,STATUS
	,pos_id
	,pos_partner
	,created_at
	,updated_at
	,is_deleted
	)
VALUES (
	7769
	,'addon name 3'
	,77
	,1
	,10.00
	,'veg'
	,true
	,0.0000
	,0.0000
	,0.0000
	,true
	,'76779'
	,'active'
	,null
	,null
	,'2022-04-27 10:24:01.888+05:30'
	,'2022-04-27 10:24:01.888+05:30'
	,false
);



INSERT INTO PUBLIC.item_addon (
	menu_item_id
	,addon_id
	)
VALUES (
	11101
	,7767
);
INSERT INTO PUBLIC.item_addon (
	menu_item_id
	,addon_id
	)
VALUES (
	11101
	,7768
);
INSERT INTO PUBLIC.item_addon (
	menu_item_id
	,addon_id
	)
VALUES (
	11101
	,7769
);
/*MENU ADDON GROUP*/
INSERT INTO PUBLIC.item_addon_group (
	menu_item_id
	,addon_group_id
	,max_limit
	,min_limit
	,free_limit
	,sequence
	,created_at
	,updated_at
	)
VALUES (
	11101
	,77
	,3
	,2
	,1
	,1
	,'2022-04-27 10:24:01.916+05:30'
	,'2022-04-27 10:24:01.916+05:30'
);
INSERT INTO PUBLIC.item_variant_group (
	id
	,menu_item_id
	,NAME
	,created_at
	,updated_at
	,is_deleted
	)
VALUES (
	98
	,11101
	,'menu item 1 variant 1'
	,'2022-04-27 10:24:01.885+05:30'
	,'2022-04-27 10:24:01.885+05:30'
	,false
);
INSERT INTO PUBLIC.item_variant_group (
	id
	,menu_item_id
	,NAME
	,created_at
	,updated_at
	,is_deleted
	)
VALUES (
	99
	,11101
	,'menu item 1 variant 2'
	,'2022-04-27 10:24:01.885+05:30'
	,'2022-04-27 10:24:01.885+05:30'
	,false
);
INSERT INTO PUBLIC.item_variant (
	id
	,variant_group_id
	,NAME
	,is_default
	,serves_how_many
	,price
	,in_stock
	,veg_egg_non
	,pos_id
	,pos_partner
	,created_at
	,updated_at
	,is_deleted
	)
VALUES (
	998
	,98
	,'variant group 1 variant name'
	,true
	,1
	,10.00
	,true
	,'veg'
	,null
	,null
	,'2022-04-27 10:24:01.886+05:30'
	,'2022-04-27 10:24:01.886+05:30'
	,false
);
INSERT INTO PUBLIC.item_variant (
	id
	,variant_group_id
	,NAME
	,is_default
	,serves_how_many
	,price
	,in_stock
	,veg_egg_non
	,pos_id
	,pos_partner
	,created_at
	,updated_at
	,is_deleted
	)
VALUES (
	999
	,99
	,'variant group 1 variant name'
	,true
	,1
	,10.00
	,true
	,'veg'
	,null
	,null
	,'2022-04-27 10:24:01.886+05:30'
	,'2022-04-27 10:24:01.886+05:30'
	,false
);

INSERT INTO PUBLIC.main_category (
	id
	,NAME
	,restaurant_id
	,pos_id
	,pos_partner
	,created_at
	,updated_at
	,is_deleted
	)
VALUES (
	21
	,'main category name'
	,'97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242'
	,'0001'
	,'petpooja'
	,'2022-04-27 10:24:01.881+05:30'
	,'2022-04-27 10:24:01.881+05:30'
	,false
);

INSERT INTO PUBLIC.sub_category (
	id
	,NAME
	,main_category_id
	,pos_id
	,pos_partner
	,created_at
	,updated_at
	,is_deleted
	)
VALUES (
	211
	,'sub category name'
	,21
	,'0002'
	,'petpooja'
	,'2022-04-27 10:24:01.882+05:30'
	,'2022-04-27 10:24:01.882+05:30'
	,false
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
	,pos_id
	,pos_partner
	,created_at
	,updated_at
	,is_deleted
	,next_available_after
	)
VALUES (
	12101
	,'97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242'
	,'menu item name'
	,'description'
	,211
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
	,'0003'
	,'petpooja'
	,'2022-04-27 10:24:01.883+05:30'
	,'2022-04-27 10:24:01.883+05:30'
	,false
	,'2022-04-27 10:24:01.883+05:30'
);

INSERT INTO PUBLIC.addon_group (
	id
	,NAME
	,restaurant_id
	,pos_id
	,pos_partner
	,created_at
	,updated_at
	,is_deleted
	)
VALUES (
	12102
	,'Petpooja addon group'
	,'97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242'
	,'0004'
	,'petpooja'
	,'2022-04-27 10:24:01.887+05:30'
	,'2022-04-27 10:24:01.887+05:30'
	,false
);


INSERT INTO PUBLIC.addon (
	id
	,NAME
	,addon_group_id
	,sequence
	,price
	,veg_egg_non
	,in_stock
	,sgst_rate
	,cgst_rate
	,igst_rate
	,gst_inclusive
	,external_id
	,STATUS
	,pos_id
	,pos_partner
	,created_at
	,updated_at
	,is_deleted
	)
VALUES (
	12103
	,'Petpooja addon'
	,12102
	,1
	,12.00
	,'veg'
	,true
	,0.0000
	,0.0000
	,0.0000
	,true
	,'76777'
	,'active'
	,'0005'
	,'petpooja'
	,'2022-04-27 10:24:01.888+05:30'
	,'2022-04-27 10:24:01.888+05:30'
	,false
);


INSERT INTO PUBLIC.main_category (
	id
	,NAME
	,restaurant_id
	,pos_id
	,pos_partner
	,created_at
	,updated_at
	,is_deleted
	)
VALUES (
	31
	,'main category name'
	,'609a460e-6316-417e-9e87-836bfbcded0f'
	,'3001'
	,'petpooja'
	,'2022-04-27 10:24:01.881+05:30'
	,'2022-04-27 10:24:01.881+05:30'
	,false
);

INSERT INTO PUBLIC.sub_category (
	id
	,NAME
	,main_category_id
	,pos_id
	,pos_partner
	,created_at
	,updated_at
	,is_deleted
	)
VALUES (
	311
	,'sub category name'
	,31
	,'3002'
	,'petpooja'
	,'2022-04-27 10:24:01.882+05:30'
	,'2022-04-27 10:24:01.882+05:30'
	,false
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
	,pos_id
	,pos_partner
	,created_at
	,updated_at
	,is_deleted
	,next_available_after
	)
VALUES (
	13101
	,'609a460e-6316-417e-9e87-836bfbcded0f'
	,'menu item name'
	,'description'
	,311
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
	,'3003'
	,'petpooja'
	,'2022-04-27 10:24:01.883+05:30'
	,'2022-04-27 10:24:01.883+05:30'
	,false
	,'2022-04-27 10:24:01.883+05:30'
);
