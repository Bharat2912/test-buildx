/* restaurant with pos reference*/
INSERT INTO PUBLIC.restaurant(
  id, partner_id, NAME, lat, long, STATUS,
  created_at, updated_at, is_deleted,
  orders_count, like_count, dislike_count,delivery_time,
  images, city_id, area_id, packing_charge_type,
  packing_charge_item, packing_charge_order,
  cuisine_ids, is_pure_veg, cost_of_two,
  allow_long_distance, pos_id, pos_partner, pos_name,
  packing_charge_fixed_percent, default_preparation_time
)
VALUES
  (
    '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
    'cc37e5e6-0a0e-4e73-848c-aeed4ad2a695',
    'Tiger''s Cafe', 19.159007,72.8905879,
    'active', '2022-04-27 10:24:01.873499+05:30',
    '2022-04-27 10:24:01.873499+05:30',
    false, 100, 59, 41, 0,
    array['{"name": "25887d2c-4dc4-42a1-9e3d-62a6f0c33cae.jpg"}']::jsonb[],
    '25887d2c-4dc4-42a1-9e3d-62a6f0c33cae',
    '25887d2c-4dc4-42a1-9e3d-62a6f0c33cae',
    'none', '{"{\"item_name\": \"Paneer Tikka\", \"item_price\": 120, \"packing_image\": {\"name\": \"25887d2c-4dc4-42a1-9e3d-62a6f0c33cae.jpg\"}, \"packing_charge\": 2.5}"}',
    '{"packing_image": {"name": "25887d2c-4dc4-42a1-9e3d-62a6f0c33cae.jpg"}, "packing_charge": 2.5}',
    '{faad6b3e-f786-4325-9a64-ce0f4d240959}', true, 100, true, 'ps82kz7f',
    'petpooja', 'petpooja speedyy', 'percent' , 6
  );

INSERT INTO public.restaurant(
  id, partner_id, name,branch_name, lat, "long", status,
  created_at, updated_at, is_deleted,
  orders_count, like_count, dislike_count, delivery_time,
  image,images, city_id, area_id, packing_charge_type,
  packing_charge_order, is_pure_veg,
  cost_of_two, allow_long_distance,
  cuisine_ids, packing_charge_item, default_preparation_time,
  poc_number
)
VALUES
  (
    '77e53c1f-6e9e-4724-9ba7-92edc69cff6b',
    'f1a41fd3-c764-43f7-a43d-e4087b6bf90e',
    'BurgerKing', 'BurgerKing Mumbai(S)',19.159007,72.8905879,
    'active', '2022-03-02 14:23:19.30874+00',
    '2022-03-02 14:23:19.30874+00',
    false, 1000047, 1000000, 47, 0,
    '{"name": "restaurant_(9).jpg", "path": "restaurant/images/", "bucket": "speedyy-image-upload"}',
    array['{"name": "restaurant_(9).jpg", "path": "restaurant/images/", "bucket": "speedyy-image-upload"}']::jsonb[],
    '25887d2c-4dc4-42a1-9e3d-62a6f0c33cae',
    '25887d2c-4dc4-42a1-9e3d-62a6f0c33cae',
    'order', '{"packing_image": {"name": "f44c2688-cfb7-47a3-a299-95b39b26204b.png", "path": "restaurant/packing_charge_order_image/", "bucket": "speedyy-image-upload"}, "packing_charge": 2.5}',
    true, 693, false,
    '{bafad85e-3f7f-496f-9851-6070275609e9}',
    NULL, 23, '+919819999999'
  );
INSERT INTO PUBLIC.restaurant(
  id, partner_id, NAME,branch_name, lat, long, STATUS,
  created_at, updated_at, is_deleted,
  orders_count, like_count, dislike_count, delivery_time,
  image,images, city_id, area_id, packing_charge_type,
  packing_charge_item, packing_charge_order,
  cuisine_ids, is_pure_veg, cost_of_two,
  allow_long_distance, default_preparation_time,
  poc_number
)
VALUES
  (
    'b0909e52-a731-4665-a791-ee6479008805',
    'cc37e5e6-0a0e-4e73-848c-aeed4ad2a695',
    'Burger King', 'Burger King Mumbai',19.158673,72.8907059,
    'active', '2022-04-27 10:24:01.873499+05:30',
    '2022-04-27 10:24:01.873499+05:30',
    false, 100228, 100000, 0, 0,
    '{"name": "25887d2c-4dc4-42a1-9e3d-62a6f0c33cae.jpg"}',
    array['{"name": "25887d2c-4dc4-42a1-9e3d-62a6f0c33cae.jpg"}']::jsonb[],
    'd7aa9876-1ed0-4c47-831d-cf2e05d3fc91',
    '52c63582-2f9d-4249-964c-0d24c7725377',
    'none', '{"{\"item_name\": \"Paneer Tikka\", \"item_price\": 120, \"packing_image\": {\"name\": \"25887d2c-4dc4-42a1-9e3d-62a6f0c33cae.jpg\"}, \"packing_charge\": 2.5}"}',
    '{"packing_image": {"name": "25887d2c-4dc4-42a1-9e3d-62a6f0c33cae.jpg"}, "packing_charge": 2.5}',
    '{bafad85e-3f7f-496f-9851-6070275609e9}', true, 1500, true , 12,
     '+919819999998'
  );


INSERT INTO PUBLIC.restaurant(
  id, partner_id, NAME, lat, long, STATUS,
  created_at, updated_at, is_deleted,
  orders_count, like_count, dislike_count, delivery_time,
  images, city_id, area_id, packing_charge_type,
  packing_charge_item, packing_charge_order,
  cuisine_ids, is_pure_veg, cost_of_two,
  allow_long_distance, pos_id, pos_partner,
  packing_charge_fixed_percent, default_preparation_time
)
VALUES
  (
    '609a460e-6316-417e-9e87-836bfbcded0f',
    'cc37e5e6-0a0e-4e73-848c-aeed4ad2a695',
    'Spicy Street Restro', 19.15844, 72.89168,
    'active', '2022-04-27 10:24:01.873499+05:30',
    '2022-04-27 10:24:01.873499+05:30',
    false, 124, 24, 100, 0,
    array['{"name": "25887d2c-4dc4-42a1-9e3d-62a6f0c33cae.jpg"}']::jsonb[],
    '25887d2c-4dc4-42a1-9e3d-62a6f0c33cae',
    '25887d2c-4dc4-42a1-9e3d-62a6f0c33cae',
    'none', '{"{\"item_name\": \"Paneer Tikka\", \"item_price\": 120, \"packing_image\": {\"name\": \"25887d2c-4dc4-42a1-9e3d-62a6f0c33cae.jpg\"}, \"packing_charge\": 2.5}"}',
    '{"packing_image": {"name": "25887d2c-4dc4-42a1-9e3d-62a6f0c33cae.jpg"}, "packing_charge": 2.5}',
    '{acb0b0e4-dbcc-4688-8b1c-d79dfdabaf93, 1340fdd1-e593-42af-b765-1badf590de16}', true, 500, true, null,
    null, 'percent', 17
  );
