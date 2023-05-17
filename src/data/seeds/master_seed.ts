import {Knex} from 'knex';

export async function seed(knex: Knex): Promise<void> {
  if (process.env.NODE_ENV === 'DEV') {
    return knex.raw(`
    INSERT INTO service_master (id, name, image_bucket, image_path, sequence, status, created_at, updated_at, is_deleted) VALUES
    ('022a8c79-f3fd-4c94-add0-83f5c1c34ccc', 'Paan Shop', 'speedyy-dev-core-api-public', 'services/images/pan.jpeg', 8, 'created', '2022-08-01 06:19:27.335941+00', '2022-08-02 09:43:22.473+00', true),
    ('3e8cfa3a-b877-40a7-adde-1758bda4fe2c', 'Food', 'speedyy-dev-core-api-public', 'services/images/food.png', 1, 'created', '2022-08-01 06:19:27.228382+00', '2022-08-05 09:52:36.126+00', false),
    ('769954d5-4d33-4993-a0bd-9ef7e8ff1aa8', 'Grocery', 'speedyy-dev-core-api-public', 'services/images/grocery.png', 2, 'created', '2022-08-01 06:19:27.23663+00', '2022-08-05 10:00:08.506+00', false),
    ('727d9a44-917b-4e62-9773-044dbdcf6277', 'Pharma', 'speedyy-dev-core-api-public', 'services/images/pharma.png', 3, 'created', '2022-08-01 06:19:27.241284+00', '2022-08-05 10:01:05.255+00', false),
    ('4526beac-35e2-4374-8c77-34ab6b1540d2', 'Urban Services', 'speedyy-dev-core-api-public', 'services/images/urban.jpeg', 4, 'created', '2022-08-01 06:19:27.311286+00', '2022-08-05 10:01:51.348+00', false),
    ('ce847ccb-6b0d-48e5-be41-94674f5d3950', 'Laundry', 'speedyy-dev-core-api-public', 'services/images/laundry.png', 5, 'created', '2022-08-01 06:19:27.317757+00', '2022-08-05 10:02:41.244+00', false),
    ('3e776932-8a78-4ec7-9944-723a340af8e8', 'Local Transport', 'speedyy-dev-core-api-public', 'services/images/local_transport.png', 6, 'created', '2022-08-01 06:19:27.324575+00', '2022-08-05 10:03:32.913+00', true),
    ('9d9ba418-11e0-4e89-9bb5-a9bf76039dca', 'Hotal', 'speedyy-dev-core-api-public', 'services/images/hotel.png', 7, 'created', '2022-08-01 06:19:27.329926+00', '2022-08-05 10:04:16.218+00', true),
    ('01718c1c-3534-427c-9dd9-326f3b2b78b8', 'Lifestyle', 'speedyy-dev-core-api-public', 'services/images/lifestyle.jpeg', 9, 'created', '2022-08-01 06:19:27.341407+00', '2022-08-05 10:05:14.328+00', true),
    ('4cbcd72f-1dbb-45b8-8caf-84a5dfa7d230', 'Electronics', 'speedyy-dev-core-api-public', 'services/images/electronics.jpg', 10, 'created', '2022-08-01 06:19:27.346559+00', '2022-08-05 10:06:03.187+00', false),
    ('07d7e601-cc62-4a87-bbbf-43eaff504ff8', 'Pick & Drop', 'speedyy-dev-core-api-public', 'services/images/pickndrop.jpg', 11, 'created', '2022-08-01 06:19:27.352674+00', '2022-08-05 10:06:58.537+00', false),
    ('998032b0-b7d6-4e14-ba44-f1a6664b8144', 'Flower Shop', 'speedyy-dev-core-api-public', 'services/images/flower.jpeg', 12, 'created', '2022-08-01 06:19:27.35734+00', '2022-08-05 10:07:49.939+00', false),
    ('72a55057-f7a5-4621-9ebf-e9a59a0c8d56', 'Car Servicing', 'speedyy-dev-core-api-public', 'services/images/car_services.jpg', 13, 'created', '2023-02-22 06:19:27.35734+00', '2023-02-22 10:07:49.939+00', false),
    ('2d83e32d-ebd1-46a3-a9af-6a88b6c08d6f', 'Tea & Coffee', 'speedyy-dev-core-api-public', 'services/images/tickets_and_passes.jpg', 14, 'created', '2023-02-22 06:19:27.35734+00', '2023-02-22 10:07:49.939+00', false),
    ('a5b5f5fc-7535-4818-9c9a-86f36f7c1d0c', 'Bakery', 'speedyy-dev-core-api-public', 'services/images/bakery.jpg', 15, 'created', '2023-02-22 06:19:27.35734+00', '2023-02-22 10:07:49.939+00', false),
    ('3e3353a2-2a8b-4c2f-9f02-eeb33e8d1351', 'Auto', 'speedyy-dev-core-api-public', 'services/images/auto.jpg', 16, 'created', '2023-02-22 06:19:27.35734+00', '2023-02-22 10:07:49.939+00', false),
    ('7e5553d3-6c64-4e48-9a08-749ed2ee6341', 'Tickets and Passes', 'speedyy-dev-core-api-public', 'services/images/tickets_and_passes.jpg', 6, 'created', '2023-02-22 06:19:27.35734+00', '2023-02-22 10:07:49.939+00', false),
    ('3b17528c-727d-4a08-b8a2-79bcf1b8452d', 'Cosmetics', 'speedyy-dev-core-api-public', 'services/images/cosmetics.jpeg', 7, 'created', '2023-02-22 06:19:27.35734+00', '2023-02-22 10:07:49.939+00', false),
    ('8bfae6e7-6b9d-4559-b8c1-6a7c919e2a14', 'Pet Products', 'speedyy-dev-core-api-public', 'services/images/pet_products.jpeg', 8, 'created', '2023-02-22 06:19:27.35734+00', '2023-02-22 10:07:49.939+00', false),
    ('c8a8fc60-4529-4b0c-b522-8f1ed6fb70a6', 'Taxi', 'speedyy-dev-core-api-public', 'services/images/cab.jpeg', 9, 'created', '2023-02-22 06:19:27.35734+00', '2023-02-22 10:07:49.939+00', false)
    ON CONFLICT(id) DO NOTHING;

    INSERT INTO city_master (id, name, status, created_at, updated_at, is_deleted) VALUES
    ('d9981105-c095-4cbd-bbe4-812bb67fd2f9', 'Bangalore', 'active', '2022-08-01 12:38:24.347408+00', '2022-08-01 12:38:51.242+00', false),
    ('e5a27628-ab83-43ea-9431-2c9983bc371c', 'Ahmedabad', 'inactive', '2022-08-01 12:39:15.563022+00', '2022-08-04 06:12:23.946+00', false),
    ('1fad4cc1-f763-4234-aaa8-703ebe16c869', 'Delhi', 'inactive', '2022-08-01 12:39:21.405934+00', '2022-08-04 06:12:27.369+00', false),
    ('0299e2e2-ab86-4570-9dff-996e52fef626', 'Mumbai', 'active', '2022-08-01 12:38:13.195372+00', '2022-09-09 12:22:44.07+00', false),
    ('934b34b7-6730-41bb-aa65-78d108a4869c', 'Nagpur', 'active', '2023-01-10 11:46:10.100361+00', '2023-01-10 11:46:10.100361+00', false)
    ON CONFLICT DO nothing;

    INSERT INTO cuisine_master (id, name, status, created_at, updated_at, is_deleted) VALUES
    ('b974a69f-689d-4d6c-b80d-fbee144a1184', 'Mughlai', 'active', '2022-08-01 12:31:39.66402+00', '2022-08-01 12:31:39.66402+00', false),
    ('284e2189-9029-42b2-a606-bb18b4d8acde', 'Chinese', 'active', '2022-08-01 12:31:49.185297+00', '2022-08-01 12:31:49.185297+00', false),
    ('4d16acdc-17cc-4561-9811-7ea73c87cb2d', 'North-Indian', 'active', '2022-08-01 12:32:01.616849+00', '2022-08-01 12:32:01.616849+00', false),
    ('8ca9345f-82f4-445e-ac0d-e32587f9f19a', 'South-Indian', 'active', '2022-08-01 12:32:11.998857+00', '2022-08-01 12:32:11.998857+00', false),
    ('b3bf8095-b0b8-43b2-9361-dd2cbdd35a7a', 'Fast-Food', 'active', '2022-08-01 13:04:53.777795+00', '2022-08-01 13:04:53.777795+00', false),
    ('5f4537f4-5b29-44b4-8fa0-95b58cc66869', 'Italian', 'active', '2023-01-11 06:51:31.096857+00', '2023-01-11 06:51:31.096857+00', false)
    ON CONFLICT DO NOTHING;

    INSERT INTO cancellation_reason (id, user_type, cancellation_reason, is_deleted, created_at, updated_at) VALUES
    (1, 'admin', 'Restaurant Is Not Accepting Order', false, '2023-01-09 06:55:18.447293+00', '2023-01-09 06:55:18.447293+00'),
    (2, 'customer', 'Placed Wrong Order', false, '2023-01-09 06:55:31.016446+00', '2023-01-09 06:55:31.016446+00'),
    (3, 'vendor', 'Rider still not arrived', false, '2023-01-09 06:55:46.597487+00', '2023-01-09 06:55:46.597487+00')
    ON CONFLICT(id) DO NOTHING;

    INSERT INTO language_master (id, name, status, created_at, updated_at, is_deleted) VALUES
    ('ea89297c-50c8-4876-84aa-18fda7a92676', 'English', 'active', '2022-08-01 12:40:07.86929+00', '2022-08-01 12:40:07.86929+00', false)
    ON CONFLICT DO NOTHING;
  `);
  } else if (process.env.NODE_ENV === 'STAGING') {
    return knex.raw(`
        INSERT INTO service_master (id, name, image_bucket, image_path, sequence, status, created_at, updated_at, is_deleted) VALUES
        ('022a8c79-f3fd-4c94-add0-83f5c1c34ccc', 'Paan Shop', 'speedyy-staging-core-api-public', 'services/images/pan.jpeg', 8, 'created', '2022-08-01 06:19:27.335941+00', '2022-08-02 09:43:22.473+00', true),
        ('3e8cfa3a-b877-40a7-adde-1758bda4fe2c', 'Food', 'speedyy-staging-core-api-public', 'services/images/food.png', 1, 'created', '2022-08-01 06:19:27.228382+00', '2022-08-05 09:52:36.126+00', false),
        ('769954d5-4d33-4993-a0bd-9ef7e8ff1aa8', 'Grocery', 'speedyy-staging-core-api-public', 'services/images/grocery.png', 2, 'created', '2022-08-01 06:19:27.23663+00', '2022-08-05 10:00:08.506+00', false),
        ('727d9a44-917b-4e62-9773-044dbdcf6277', 'Pharma', 'speedyy-staging-core-api-public', 'services/images/pharma.png', 3, 'created', '2022-08-01 06:19:27.241284+00', '2022-08-05 10:01:05.255+00', false),
        ('4526beac-35e2-4374-8c77-34ab6b1540d2', 'Urban Services', 'speedyy-staging-core-api-public', 'services/images/urban.jpeg', 4, 'created', '2022-08-01 06:19:27.311286+00', '2022-08-05 10:01:51.348+00', false),
        ('ce847ccb-6b0d-48e5-be41-94674f5d3950', 'Laundry', 'speedyy-staging-core-api-public', 'services/images/laundry.png', 5, 'created', '2022-08-01 06:19:27.317757+00', '2022-08-05 10:02:41.244+00', false),
        ('3e776932-8a78-4ec7-9944-723a340af8e8', 'Local Transport', 'speedyy-staging-core-api-public', 'services/images/local_transport.png', 6, 'created', '2022-08-01 06:19:27.324575+00', '2022-08-05 10:03:32.913+00', true),
        ('9d9ba418-11e0-4e89-9bb5-a9bf76039dca', 'Hotal', 'speedyy-staging-core-api-public', 'services/images/hotel.png', 7, 'created', '2022-08-01 06:19:27.329926+00', '2022-08-05 10:04:16.218+00', true),
        ('01718c1c-3534-427c-9dd9-326f3b2b78b8', 'Lifestyle', 'speedyy-staging-core-api-public', 'services/images/lifestyle.jpeg', 9, 'created', '2022-08-01 06:19:27.341407+00', '2022-08-05 10:05:14.328+00', true),
        ('4cbcd72f-1dbb-45b8-8caf-84a5dfa7d230', 'Electronics', 'speedyy-staging-core-api-public', 'services/images/electronics.jpg', 10, 'created', '2022-08-01 06:19:27.346559+00', '2022-08-05 10:06:03.187+00', false),
        ('07d7e601-cc62-4a87-bbbf-43eaff504ff8', 'Pick & Drop', 'speedyy-staging-core-api-public', 'services/images/pickndrop.jpg', 11, 'created', '2022-08-01 06:19:27.352674+00', '2022-08-05 10:06:58.537+00', false),
        ('998032b0-b7d6-4e14-ba44-f1a6664b8144', 'Flower Shop', 'speedyy-staging-core-api-public', 'services/images/flower.jpeg', 12, 'created', '2022-08-01 06:19:27.35734+00', '2022-08-05 10:07:49.939+00', false),
        ('72a55057-f7a5-4621-9ebf-e9a59a0c8d56', 'Car Servicing', 'speedyy-staging-core-api-public', 'services/images/car_services.jpg', 13, 'created', '2023-02-22 06:19:27.35734+00', '2023-02-22 10:07:49.939+00', false),
        ('2d83e32d-ebd1-46a3-a9af-6a88b6c08d6f', 'Tea & Coffee', 'speedyy-staging-core-api-public', 'services/images/tea_and_coffee.jpg', 14, 'created', '2023-02-22 06:19:27.35734+00', '2023-02-22 10:07:49.939+00', false),
        ('a5b5f5fc-7535-4818-9c9a-86f36f7c1d0c', 'Bakery', 'speedyy-staging-core-api-public', 'services/images/bakery.jpg', 15, 'created', '2023-02-22 06:19:27.35734+00', '2023-02-22 10:07:49.939+00', false),
        ('3e3353a2-2a8b-4c2f-9f02-eeb33e8d1351', 'Auto', 'speedyy-staging-core-api-public', 'services/images/auto.jpg', 16, 'created', '2023-02-22 06:19:27.35734+00', '2023-02-22 10:07:49.939+00', false),
        ('7e5553d3-6c64-4e48-9a08-749ed2ee6341', 'Tickets and Passes', 'speedyy-staging-core-api-public', 'services/images/tickets_and_passes.jpg', 6, 'created', '2023-02-22 06:19:27.35734+00', '2023-02-22 10:07:49.939+00', false),
        ('3b17528c-727d-4a08-b8a2-79bcf1b8452d', 'Cosmetics', 'speedyy-staging-core-api-public', 'services/images/cosmetics.jpg', 7, 'created', '2023-02-22 06:19:27.35734+00', '2023-02-22 10:07:49.939+00', false),
        ('8bfae6e7-6b9d-4559-b8c1-6a7c919e2a14', 'Pet Products', 'speedyy-staging-core-api-public', 'services/images/pet_products.jpg', 8, 'created', '2023-02-22 06:19:27.35734+00', '2023-02-22 10:07:49.939+00', false),
        ('c8a8fc60-4529-4b0c-b522-8f1ed6fb70a6', 'Taxi', 'speedyy-staging-core-api-public', 'services/images/cab.jpg', 9, 'created', '2023-02-22 06:19:27.35734+00', '2023-02-22 10:07:49.939+00', false)
        ON CONFLICT(id) DO NOTHING;

        INSERT INTO city_master (id, name, status, created_at, updated_at, is_deleted) VALUES
        ('d9981105-c095-4cbd-bbe4-812bb67fd2f9', 'Bangalore', 'active', '2022-08-01 12:38:24.347408+00', '2022-08-01 12:38:51.242+00', false),
        ('e5a27628-ab83-43ea-9431-2c9983bc371c', 'Ahmedabad', 'inactive', '2022-08-01 12:39:15.563022+00', '2022-08-04 06:12:23.946+00', false),
        ('1fad4cc1-f763-4234-aaa8-703ebe16c869', 'Delhi', 'inactive', '2022-08-01 12:39:21.405934+00', '2022-08-04 06:12:27.369+00', false),
        ('0299e2e2-ab86-4570-9dff-996e52fef626', 'Mumbai', 'active', '2022-08-01 12:38:13.195372+00', '2022-09-09 12:22:44.07+00', false),
        ('934b34b7-6730-41bb-aa65-78d108a4869c', 'Nagpur', 'active', '2023-01-10 11:46:10.100361+00', '2023-01-10 11:46:10.100361+00', false)
        ON CONFLICT DO nothing;

        INSERT INTO cuisine_master (id, name, status, created_at, updated_at, is_deleted) VALUES
        ('b974a69f-689d-4d6c-b80d-fbee144a1184', 'Mughlai', 'active', '2022-08-01 12:31:39.66402+00', '2022-08-01 12:31:39.66402+00', false),
        ('284e2189-9029-42b2-a606-bb18b4d8acde', 'Chinese', 'active', '2022-08-01 12:31:49.185297+00', '2022-08-01 12:31:49.185297+00', false),
        ('4d16acdc-17cc-4561-9811-7ea73c87cb2d', 'North-Indian', 'active', '2022-08-01 12:32:01.616849+00', '2022-08-01 12:32:01.616849+00', false),
        ('8ca9345f-82f4-445e-ac0d-e32587f9f19a', 'South-Indian', 'active', '2022-08-01 12:32:11.998857+00', '2022-08-01 12:32:11.998857+00', false),
        ('b3bf8095-b0b8-43b2-9361-dd2cbdd35a7a', 'Fast-Food', 'active', '2022-08-01 13:04:53.777795+00', '2022-08-01 13:04:53.777795+00', false),
        ('5f4537f4-5b29-44b4-8fa0-95b58cc66869', 'Italian', 'active', '2023-01-11 06:51:31.096857+00', '2023-01-11 06:51:31.096857+00', false)
        ON CONFLICT DO NOTHING;

        INSERT INTO cancellation_reason (id, user_type, cancellation_reason, is_deleted, created_at, updated_at) VALUES
        (1, 'admin', 'Restaurant Is Not Accepting Order', false, '2023-01-09 06:55:18.447293+00', '2023-01-09 06:55:18.447293+00'),
        (2, 'customer', 'Placed Wrong Order', false, '2023-01-09 06:55:31.016446+00', '2023-01-09 06:55:31.016446+00'),
        (3, 'vendor', 'Rider still not arrived', false, '2023-01-09 06:55:46.597487+00', '2023-01-09 06:55:46.597487+00')
        ON CONFLICT(id) DO NOTHING;

        INSERT INTO language_master (id, name, status, created_at, updated_at, is_deleted) VALUES
        ('ea89297c-50c8-4876-84aa-18fda7a92676', 'English', 'active', '2022-08-01 12:40:07.86929+00', '2022-08-01 12:40:07.86929+00', false)
        ON CONFLICT DO NOTHING;
      `);
  } else if (process.env.NODE_ENV === 'PROD') {
    return knex.raw(`
        INSERT INTO service_master (id, name, image_bucket, image_path, sequence, status, created_at, updated_at, is_deleted) VALUES
        ('022a8c79-f3fd-4c94-add0-83f5c1c34ccc', 'Paan Shop', 'speedyy-prod-core-api-public', 'services/images/e87e60ef-ca0b-4364-a967-8b869c10d253.jpg', 8, 'created', '2022-08-01 06:19:27.335941+00', '2022-08-02 09:43:22.473+00', true),
        ('3e8cfa3a-b877-40a7-adde-1758bda4fe2c', 'Food', 'speedyy-prod-core-api-public', 'services/images/f52a9fbf-0c4e-4dcc-b3eb-e29276b1c539.png', 1, 'created', '2022-08-01 06:19:27.228382+00', '2022-08-05 09:52:36.126+00', false),
        ('769954d5-4d33-4993-a0bd-9ef7e8ff1aa8', 'Grocery', 'speedyy-prod-core-api-public', 'services/images/9e066f05-e417-4e52-82ed-d204d8f0546c.png', 2, 'created', '2022-08-01 06:19:27.23663+00', '2022-08-05 10:00:08.506+00', false),
        ('727d9a44-917b-4e62-9773-044dbdcf6277', 'Pharma', 'speedyy-prod-core-api-public', 'services/images/b751d004-79dc-44ba-8c62-f1b81b2d1da4.png', 3, 'created', '2022-08-01 06:19:27.241284+00', '2022-08-05 10:01:05.255+00', false),
        ('4526beac-35e2-4374-8c77-34ab6b1540d2', 'Urban Services', 'speedyy-prod-core-api-public', 'services/images/45ae1361-e2df-49c1-be74-62089e3305d1.png', 4, 'created', '2022-08-01 06:19:27.311286+00', '2022-08-05 10:01:51.348+00', false),
        ('ce847ccb-6b0d-48e5-be41-94674f5d3950', 'Laundry', 'speedyy-prod-core-api-public', 'services/images/2831575f-ad1c-46ca-8787-565017b4551c.png', 5, 'created', '2022-08-01 06:19:27.317757+00', '2022-08-05 10:02:41.244+00', false),
        ('3e776932-8a78-4ec7-9944-723a340af8e8', 'Local Transport', 'speedyy-prod-core-api-public', 'services/images/aa1b38c1-9efa-497a-8f18-17aff0675e3e.png', 6, 'created', '2022-08-01 06:19:27.324575+00', '2022-08-05 10:03:32.913+00', true),
        ('9d9ba418-11e0-4e89-9bb5-a9bf76039dca', 'Hotal', 'speedyy-prod-core-api-public', 'services/images/ef01a6d1-fe57-4cb0-91a7-168b88d54b03.png', 7, 'created', '2022-08-01 06:19:27.329926+00', '2022-08-05 10:04:16.218+00', true),
        ('01718c1c-3534-427c-9dd9-326f3b2b78b8', 'Lifestyle', 'speedyy-prod-core-api-public', 'services/images/6992a58f-7e79-48fa-82d2-0ef372a8f66c.png', 9, 'created', '2022-08-01 06:19:27.341407+00', '2022-08-05 10:05:14.328+00', true),
        ('4cbcd72f-1dbb-45b8-8caf-84a5dfa7d230', 'Electronics', 'speedyy-prod-core-api-public', 'services/images/electronics.jpg', 10, 'created', '2022-08-01 06:19:27.346559+00', '2022-08-05 10:06:03.187+00', false),
        ('07d7e601-cc62-4a87-bbbf-43eaff504ff8', 'Pick & Drop', 'speedyy-prod-core-api-public', 'services/images/pickndrop.jpg', 11, 'created', '2022-08-01 06:19:27.352674+00', '2022-08-05 10:06:58.537+00', false),
        ('998032b0-b7d6-4e14-ba44-f1a6664b8144', 'Flower Shop', 'speedyy-prod-core-api-public', 'services/images/275c7e85-c313-4e23-9e8f-c6decb9d9357.png', 12, 'created', '2022-08-01 06:19:27.35734+00', '2022-08-05 10:07:49.939+00', false),
        ('72a55057-f7a5-4621-9ebf-e9a59a0c8d56', 'Car Servicing', 'speedyy-prod-core-api-public', 'services/images/car_services.jpg', 13, 'created', '2023-02-22 06:19:27.35734+00', '2023-02-22 10:07:49.939+00', false),
        ('2d83e32d-ebd1-46a3-a9af-6a88b6c08d6f', 'Tea & Coffee', 'speedyy-prod-core-api-public', 'services/images/tea_and_coffee.jpg', 14, 'created', '2023-02-22 06:19:27.35734+00', '2023-02-22 10:07:49.939+00', false),
        ('a5b5f5fc-7535-4818-9c9a-86f36f7c1d0c', 'Bakery', 'speedyy-prod-core-api-public', 'services/images/bakery.jpg', 15, 'created', '2023-02-22 06:19:27.35734+00', '2023-02-22 10:07:49.939+00', false),
        ('3e3353a2-2a8b-4c2f-9f02-eeb33e8d1351', 'Auto', 'speedyy-prod-core-api-public', 'services/images/auto.jpg', 16, 'created', '2023-02-22 06:19:27.35734+00', '2023-02-22 10:07:49.939+00', false),
        ('7e5553d3-6c64-4e48-9a08-749ed2ee6341', 'Tickets and Passes', 'speedyy-prod-core-api-public', 'services/images/tickets_and_passes.jpg', 6, 'created', '2023-02-22 06:19:27.35734+00', '2023-02-22 10:07:49.939+00', false),
        ('3b17528c-727d-4a08-b8a2-79bcf1b8452d', 'Cosmetics', 'speedyy-prod-core-api-public', 'services/images/cosmetics.jpg', 7, 'created', '2023-02-22 06:19:27.35734+00', '2023-02-22 10:07:49.939+00', false),
        ('8bfae6e7-6b9d-4559-b8c1-6a7c919e2a14', 'Pet Products', 'speedyy-prod-core-api-public', 'services/images/pet_products.jpg', 8, 'created', '2023-02-22 06:19:27.35734+00', '2023-02-22 10:07:49.939+00', false),
        ('c8a8fc60-4529-4b0c-b522-8f1ed6fb70a6', 'Taxi', 'speedyy-prod-core-api-public', 'services/images/cab.jpg', 9, 'created', '2023-02-22 06:19:27.35734+00', '2023-02-22 10:07:49.939+00', false)
        ON CONFLICT(id) DO NOTHING;

        INSERT INTO city_master (id, name, status, created_at, updated_at, is_deleted) VALUES
        ('d9981105-c095-4cbd-bbe4-812bb67fd2f9', 'Bangalore', 'active', '2022-08-01 12:38:24.347408+00', '2022-08-01 12:38:51.242+00', false),
        ('e5a27628-ab83-43ea-9431-2c9983bc371c', 'Ahmedabad', 'inactive', '2022-08-01 12:39:15.563022+00', '2022-08-04 06:12:23.946+00', false),
        ('1fad4cc1-f763-4234-aaa8-703ebe16c869', 'Delhi', 'inactive', '2022-08-01 12:39:21.405934+00', '2022-08-04 06:12:27.369+00', false),
        ('0299e2e2-ab86-4570-9dff-996e52fef626', 'Mumbai', 'active', '2022-08-01 12:38:13.195372+00', '2022-09-09 12:22:44.07+00', false),
        ('934b34b7-6730-41bb-aa65-78d108a4869c', 'Nagpur', 'active', '2023-01-10 11:46:10.100361+00', '2023-01-10 11:46:10.100361+00', false)
        ON CONFLICT DO NOTHING;

        INSERT INTO cuisine_master (id, name, status, created_at, updated_at, is_deleted) VALUES
        ('b974a69f-689d-4d6c-b80d-fbee144a1184', 'Mughlai', 'active', '2022-08-01 12:31:39.66402+00', '2022-08-01 12:31:39.66402+00', false),
        ('284e2189-9029-42b2-a606-bb18b4d8acde', 'Chinese', 'active', '2022-08-01 12:31:49.185297+00', '2022-08-01 12:31:49.185297+00', false),
        ('4d16acdc-17cc-4561-9811-7ea73c87cb2d', 'North-Indian', 'active', '2022-08-01 12:32:01.616849+00', '2022-08-01 12:32:01.616849+00', false),
        ('8ca9345f-82f4-445e-ac0d-e32587f9f19a', 'South-Indian', 'active', '2022-08-01 12:32:11.998857+00', '2022-08-01 12:32:11.998857+00', false),
        ('b3bf8095-b0b8-43b2-9361-dd2cbdd35a7a', 'Fast-Food', 'active', '2022-08-01 13:04:53.777795+00', '2022-08-01 13:04:53.777795+00', false),
        ('5f4537f4-5b29-44b4-8fa0-95b58cc66869', 'Italian', 'active', '2023-01-11 06:51:31.096857+00', '2023-01-11 06:51:31.096857+00', false)
        ON CONFLICT DO NOTHING;

        INSERT INTO cancellation_reason (id, user_type, cancellation_reason, is_deleted, created_at, updated_at) VALUES
        (1, 'admin', 'Restaurant Is Not Accepting Order', false, '2023-01-09 06:55:18.447293+00', '2023-01-09 06:55:18.447293+00'),
        (2, 'customer', 'Placed Wrong Order', false, '2023-01-09 06:55:31.016446+00', '2023-01-09 06:55:31.016446+00'),
        (3, 'vendor', 'Rider still not arrived', false, '2023-01-09 06:55:46.597487+00', '2023-01-09 06:55:46.597487+00')
        ON CONFLICT(id) DO NOTHING;

        INSERT INTO language_master (id, name, status, created_at, updated_at, is_deleted) VALUES
        ('ea89297c-50c8-4876-84aa-18fda7a92676', 'English', 'active', '2022-08-01 12:40:07.86929+00', '2022-08-01 12:40:07.86929+00', false)
        ON CONFLICT DO NOTHING;
    `);
  }
}

// -- cancellation_reason
// -- city_master
// -- cuisine_master
// -- language_master
// -- service_master
