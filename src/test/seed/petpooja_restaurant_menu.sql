INSERT INTO PUBLIC.petpooja_restaurant (
	id
    ,pos_restaurant_id
	,pos_id
    ,pos_status
    ,details
    ,initiated_at
    ,onboarded_at
    ,menu_last_updated_at
	,created_at
	,updated_at
	)
VALUES (
    '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242'
    ,'4332'
    ,'ps82kz7f'
    ,'onboarded'
    ,'{}'
    ,'2023-02-20 18:42:46.679109+05:30'
    ,'2023-02-24 16:51:12.039+05:30'
    ,'2023-02-20 18:42:46.679109+05:30'
    ,'2023-02-24 16:51:12.039+05:30'
	,'2023-02-24 16:51:12.039+05:30'
);

INSERT INTO PUBLIC.petpooja_tax
VALUES(
    '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242'
    ,'1983'
    ,'SGST'
    ,'2.5'
    ,'1'
    ,'1,2,3'
    ,'2'
    ,'1'
    ,'2'
    ,'0'
    ,''
    ,true
),(
    '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242'
    ,'1984'
    ,'CGST'
    ,'2.5'
    ,'1'
    ,'1,2,3'
    ,'2'
    ,'1'
    ,'1'
    ,'0'
    ,''
    ,true
);

INSERT INTO PUBLIC.main_category (
	id
	,NAME
	,restaurant_id
	,created_at
	,updated_at
	,is_deleted
    ,pos_id
    ,pos_partner
	)
VALUES (
	1269
    ,'NOTA'
    ,'97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242'
    ,'2023-02-23 18:55:49.572997+05:30'
    ,'2023-02-23 18:55:49.572997+05:30'
    ,false
    ,'1'
    ,'petpooja'
);

INSERT INTO PUBLIC.sub_category (
	id
	,NAME
	,main_category_id
	,created_at
	,updated_at
	,is_deleted
    ,pos_id
    ,pos_partner
	)
VALUES (
	1347
    ,'Pizza'
    ,1269
    ,'2023-02-23 18:55:49.572997+05:30'
    ,'2023-02-23 18:55:49.572997+05:30'
    ,false
    ,'72541'
    ,'petpooja'
),(
    1348
    ,'Tandoori Starters'
    ,1269
    ,'2023-02-23 18:55:49.572997+05:30'
    ,'2023-02-23 18:55:49.572997+05:30'
    ,false
    ,'72560'
    ,'petpooja'
),(
    1349
    ,'Panner Starters'
    ,1269
    ,'2023-02-23 18:55:49.572997+05:30'
    ,'2023-02-23 18:55:49.572997+05:30'
    ,false
    ,'72544'
    ,'petpooja'
);

INSERT INTO PUBLIC.menu_item(
    id,
    restaurant_id,
    name,
    sub_category_id,
    price, veg_egg_non,
    packing_charges,
    is_spicy,
    serves_how_many,
    service_charges,
    item_sgst_utgst,
    item_cgst,
    item_igst,
    item_inclusive,
    disable,
    allow_long_distance,
    image,
    created_at,
    updated_at,
    is_deleted,
    pos_id,
    tax_applied_on,
    pos_partner
)VALUES(
    14337
    ,'97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242'
    ,'Arrosteo Bells Pizza'
    ,1347
    ,0
    ,'veg'
    ,0
    ,false
    ,1
    ,0
    ,2.5
    ,2.5
    ,0
    ,false
    ,false
    ,true
    ,'{"url": ""}'
    ,'2023-02-24 18:28:47.677201+05:30'
    ,'2023-02-24 18:28:47.677201+05:30'
    ,false
    ,'10464621'
    ,'core'
    ,'petpooja'
),(
    14336
    ,'97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242'
    ,'Afghani Chaap'
    ,1348
    ,355
    ,'veg'
    ,0
    ,false
    ,1
    ,0
    ,2.5
    ,2.5
    ,0
    ,false
    ,false
    ,true
    ,'{"url": ""}'
    ,'2023-02-24 18:28:47.677201+05:30'
    ,'2023-02-24 18:28:47.677201+05:30'
    ,false
    ,'10464922'
    ,'core'
    ,'petpooja'
),(
    14335
    ,'97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242'
    ,'Pudina Chaap'
    ,1349
    ,375
    ,'veg'
    ,0
    ,false
    ,1
    ,0
    ,2.5
    ,2.5
    ,0
    ,false
    ,false
    ,true
    ,'{"url": ""}'
    ,'2023-02-24 18:28:47.677201+05:30'
    ,'2023-02-24 18:28:47.677201+05:30'
    ,false
    ,'10464639'
    ,'core'
    ,'petpooja'
);

INSERT INTO PUBLIC.item_variant_group
VALUES(
    2002
    ,14337
    ,'Size'
    ,'2023-02-24 22:43:24.507521+05:30'
    ,'2023-02-24 22:43:24.507521+05:30'
    ,false
    ,'Size_10464621'
    ,'petpooja'
);

INSERT INTO PUBLIC.item_variant
VALUES(
    8258
    ,2002
    ,'8 Inch'
    ,true
    ,1
    ,290.00
    ,true
    ,'veg'
    ,'2023-02-24 22:43:24.507521+05:30'
    ,'2023-02-24 22:43:24.507521+05:30'
    ,false
    ,'7218'
    ,'10464958'
    ,NULL
    ,'petpooja'
),(
    8259
    ,2002
    ,'12 Inch'
    ,false
    ,1
    ,505.00
    ,true
    ,'veg'
    ,'2023-02-24 22:43:24.507521+05:30'
    ,'2023-02-24 22:43:24.507521+05:30'
    ,false
    ,'7219'
    ,'10464959'
    ,NULL
    ,'petpooja'
);

INSERT INTO PUBLIC.addon_group
VALUES(
    513
    ,'Beverages'
    ,'97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242'
    ,'2023-02-24 22:43:24.507521+05:30'
    ,'2023-02-24 22:43:24.507521+05:30'
    ,false
    ,'8382'
    ,'petpooja'
),(
    514
    ,'Sides'
    ,'97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242'
    ,'2023-02-24 22:43:24.507521+05:30'
    ,'2023-02-24 22:43:24.507521+05:30'
    ,false
    ,'8383'
    ,'petpooja'
),(
    515
    ,'Starters Add Ons'
    ,'97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242'
    ,'2023-02-24 22:43:24.507521+05:30'
    ,'2023-02-24 22:43:24.507521+05:30'
    ,false
    ,'8384'
    ,'petpooja'
),(
    516
    ,'Addons Starters'
    ,'97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242'
    ,'2023-02-24 22:43:24.507521+05:30'
    ,'2023-02-24 22:43:24.507521+05:30'
    ,false
    ,'8385'
    ,'petpooja'
);

INSERT INTO PUBLIC.addon
VALUES(
    2464
    ,'Coffee'
    ,513
    ,2
    ,63.75
    ,'veg'
    ,true
    ,0.0000
    ,0.0000
    ,0.0000
    ,true
    ,NULL
    ,'active'
    ,'2023-02-24 22:43:24.507521+05:30'
    ,'2023-02-24 22:43:24.507521+05:30'
    ,false
    ,'28411'
    ,NULL
    ,'petpooja'
),(
    2465
    ,'Salt Fresh Lime Soda'
    ,513
    ,3
    ,68.00
    ,'veg'
    ,true
    ,0.0000
    ,0.0000
    ,0.0000
    ,true
    ,NULL
    ,'active'
    ,'2023-02-24 22:43:24.507521+05:30'
    ,'2023-02-24 22:43:24.507521+05:30'
    ,false
    ,'28413'
    ,NULL
    ,'petpooja'
),(
    2466
    ,'Sweet Fresh Lime Soda'
    ,513
    ,4
    ,68.00
    ,'veg'
    ,true
    ,0.0000
    ,0.0000
    ,0.0000
    ,true
    ,NULL
    ,'active'
    ,'2023-02-24 22:43:24.507521+05:30'
    ,'2023-02-24 22:43:24.507521+05:30'
    ,false
    ,'28415'
    ,NULL
    ,'petpooja'
),(
    2467
    ,'Virgin Mojito'
    ,513
    ,5
    ,110.50
    ,'veg'
    ,true
    ,0.0000
    ,0.0000
    ,0.0000
    ,true
    ,NULL
    ,'active'
    ,'2023-02-24 22:43:24.507521+05:30'
    ,'2023-02-24 22:43:24.507521+05:30'
    ,false
    ,'28417'
    ,NULL
    ,'petpooja'
),(
    2468
    ,'Manchow Soup'
    ,514
    ,1
    ,106.25
    ,'veg'
    ,true
    ,0.0000
    ,0.0000
    ,0.0000
    ,true
    ,NULL
    ,'active'
    ,'2023-02-24 22:43:24.507521+05:30'
    ,'2023-02-24 22:43:24.507521+05:30'
    ,false
    ,'28419'
    ,NULL
    ,'petpooja'
),(
    2469
    ,'Hot And Sour Soup'
    ,514
    ,2
    ,106.25
    ,'veg'
    ,true
    ,0.0000
    ,0.0000
    ,0.0000
    ,true
    ,NULL
    ,'active'
    ,'2023-02-24 22:43:24.507521+05:30'
    ,'2023-02-24 22:43:24.507521+05:30'
    ,false
    ,'28421'
    ,NULL
    ,'petpooja'
),(
    2470
    ,'Paneer Achari Tikka'
    ,515
    ,1
    ,284.75
    ,'veg'
    ,true
    ,0.0000
    ,0.0000
    ,0.0000
    ,true
    ,NULL
    ,'active'
    ,'2023-02-24 22:43:24.507521+05:30'
    ,'2023-02-24 22:43:24.507521+05:30'
    ,false
    ,'28471'
    ,NULL
    ,'petpooja'
),(
    2471
    ,'Paneer Tikka'
    ,515
    ,2
    ,284.75
    ,'veg'
    ,true
    ,0.0000
    ,0.0000
    ,0.0000
    ,true
    ,NULL
    ,'active'
    ,'2023-02-24 22:43:24.507521+05:30'
    ,'2023-02-24 22:43:24.507521+05:30'
    ,false
    ,'28473'
    ,NULL
    ,'petpooja'
),(
    2472
    ,'Aloo Stuffed'
    ,515
    ,3
    ,272.00
    ,'veg'
    ,true
    ,0.0000
    ,0.0000
    ,0.0000
    ,true
    ,NULL
    ,'active'
    ,'2023-02-24 22:43:24.507521+05:30'
    ,'2023-02-24 22:43:24.507521+05:30'
    ,false
    ,'28475'
    ,NULL
    ,'petpooja'
),(
    2473
    ,'Cheesy Loaded Fries'
    ,516
    ,1
    ,170.00
    ,'veg'
    ,true
    ,0.0000
    ,0.0000
    ,0.0000
    ,true
    ,NULL
    ,'active'
    ,'2023-02-24 22:43:24.507521+05:30'
    ,'2023-02-24 22:43:24.507521+05:30'
    ,false
    ,'28451'
    ,NULL
    ,'petpooja'
);

INSERT INTO PUBLIC.item_addon_group
VALUES(
    14336
    ,513
    ,4
    ,0
    ,-1
    ,1
    ,'2023-02-24 22:43:24.507521+05:30'
    ,'2023-02-24 22:43:24.507521+05:30'
),(
    14336
    ,514
    ,2
    ,0
    ,-1
    ,1
    ,'2023-02-24 22:43:24.507521+05:30'
    ,'2023-02-24 22:43:24.507521+05:30'
),(
    14336
    ,516
    ,1
    ,0
    ,-1
    ,1
    ,'2023-02-24 22:43:24.507521+05:30'
    ,'2023-02-24 22:43:24.507521+05:30'
),(
    14336
    ,515
    ,1
    ,0
    ,-1
    ,1
    ,'2023-02-24 22:43:24.507521+05:30'
    ,'2023-02-24 22:43:24.507521+05:30'
);

INSERT INTO PUBLIC.item_addon
VALUES(
    14336
    ,2464
),(
    14336
    ,2465
),(
    14336
    ,2466
),(
    14336
    ,2467
),(
    14336
    ,2468
),(
    14336
    ,2469
),(
    14336
    ,2470
),(
    14336
    ,2471
),(
    14336
    ,2472
),(
    14336
    ,2473
);

INSERT INTO PUBLIC.petpooja_item_tax
VALUES(
    '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242'
    ,'10464639'
    ,'1983'
),(
    '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242'
    ,'10464639'
    ,'1984'
),(
    '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242'
    ,'10464922'
    ,'1983'
),(
    '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242'
    ,'10464922'
    ,'1984'
),(
    '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242'
    ,'10464621'
    ,'1983'
),(
    '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242'
    ,'10464621'
    ,'1984'
);
