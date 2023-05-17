import {Knex} from 'knex';

export async function seed(knex: Knex): Promise<void> {
  if (process.env.NODE_ENV === 'DEV') {
    return knex.raw(`
      INSERT INTO "global_var" ("key","value","type","editable","description","updated_by","access_roles")
      VALUES
      ('OTP_TTL_SECONDS', '30', 'number', 'true', 'OTP Validity Duration', 'system','{"admin"}'),
      ('CART_MAX_TOTAL_QUANTITY', '100', 'number', 'true', 'Cart maximum allow quantity', 'system','{"admin"}'),
      ('SERVICEABILITY_RADIUS_IN_METRES', '5000', 'number', 'true', 'Restaurant serviceability radius in metres', 'system','{"admin"}'),
      ('CASHFREE_PAYOUT_MIN_BALANCE', '1000', 'number', 'true', 'Payout minimum required balance', 'system','{"admin"}'),
      ('PAYMENT_GATEWAY', 'CASHFREE', 'string', 'true', 'Payment gateway name', 'system','{"admin"}'),
      ('DELIVERY_SERVICE', 'speedyy-rider', 'string', 'true', 'Delivery service name', 'system','{"admin"}'),
      ('ORDER_CANCELLATION_DURATION_IN_SECONDS', '60', 'number', 'true', 'Order cancellation duration in seconds', 'system','{"admin"}'),
      ('ORDER_CANCELLATION_DELAY_IN_SECONDS', '5', 'number', 'true', 'Order cancellation delay in seconds', 'system','{"admin"}'),
      ('ORDER_ACCEPT_DURATION_IN_SECONDS', '600', 'number', 'true', 'Vendor Order acceptance duration in seconds', 'system','{"admin"}'),
      ('ORDER_REATTEMPT_DURATION_IN_SECONDS', '300', 'number', 'true', 'Vendor Order acceptance retry in seconds', 'system','{"admin"}'),
      ('ORDER_VENDOR_RETRY_ATTEMPTS', '3', 'number', 'true', 'Max Vendor Order acceptance notification retries', 'system','{"admin"}'),
      ('SUPER_ADMIN_EMAIL', 'operator@speedyy.com', 'string', 'true', 'super adming email id', 'system','{"admin"}'),
      ('CATALOG_TEAM_EMAIL', 'operator@speedyy.com', 'string', 'true', 'catalog team email id', 'system','{"admin"}'),
      ('BACKEND_TEAM_EMAIL', 'backend@speedyy.com', 'string', 'true', 'backend team email id', 'system','{"admin"}'),
      ('ORDER_NOT_ACCEPT_ADMIN_EMAIL', 'operator@speedyy.com', 'string', 'true', 'If vendor does not accept the order an email will be forwarded to this email', 'system','{"admin"}'),
      ('PAYOUT_REPORT_ADMIN_EMAIL', 'backend@speedyy.com', 'string', 'true', 'payout report will be forwarded to this email', 'system','{"admin"}'),
      ('SUPPORT_EMAIL', 'operator@speedyy.com', 'string', 'true', 'support email', 'system','{"admin","customer","vendor"}'),
      ('SUPPORT_CONTACT', '9876543210', 'string', 'true', 'support contact phone number', 'system','{"admin","customer","vendor"}'),
      ('SUPPORT_WHATSAPP', '9876543210', 'string', 'true', 'support whatsapp phone number', 'system','{"admin","customer","vendor"}'),
      ('ANDROID_ONLINE_PAYMENT_ENABLED', 'true', 'boolean', 'true', 'To enable online payment in android customer app', 'system','{"admin","customer","vendor"}'),
      ('IOS_ONLINE_PAYMENT_ENABLED', 'true', 'boolean', 'true', 'To enable online payment in ios customer app', 'system','{"admin","customer","vendor"}'),
      ('SUBSCRIPTION_AUTHORIZATION_AMOUNT_IN_RUPEES', '10', 'number', 'true', 'subscription emandate authorization cost', 'system','{"admin"}'),
      ('SUBSCRIPTION_RETURN_URL', 'https://vendor.dev.speedyy.com/login', 'string', 'true', 'when subscription emanded is created, user will be redirected to this url', 'system','{"admin"}'),
      ('SUBSCRIPTION_EXPIRY_INTERVAL_IN_MONTHS', '24', 'number', 'true', 'subscription will be expired after this given months', 'system','{"admin"}'),
      ('SUBSCRIPTION_FIRST_PAYMENT_DATE_INTERVAL_IN_DAYS', '2', 'number', 'true', 'subscription first payment will be deducted after given days', 'system','{"admin"}'),
      ('SUBSCRIPTION_END_TIME_GRACE_PERIOD_IN_DAYS', '2', 'number', 'true', 'subscription grace period in days', 'system','{"admin"}'),
      ('SUBSCRIPTION_VERFIY_NEW_PAYMENT_AFTER_SECONDS', '120', 'number', 'true', 'subscription payment will be reveryfied after given seconds', 'system','{"admin"}'),
      ('SUBSCRIPTION_VERFIY_NEW_PAYMENT_MAX_ATTEMPTS', '3', 'number', 'true', 'subscription reverify max attempts', 'system','{"admin"}'),
      ('NOTIFY_SUBSCRIBERS_BEFORE_DAYS', '7', 'number', 'true', 'notify subscribers before given days', 'system','{"admin"}'),
      ('CUSTOMER_CANCELLATION_POLICY', '{"terms_conditions":"https://www.speedyy.com/terms-conditions/","note":"If you cancel within 60 seconds of placing your order, a 100% refund will be issued. No refund for cancellation made after 60 seconds."}', 'json', 'true', 'cancellation policy details for customer', 'system','{"admin"}'),
      ('VENDOR_CANCELLATION_POLICY', '{"terms_conditions":"https://www.speedyy.com/terms-conditions/","note":"100% cancellation fee will be applicable if you cancel the order anytime after accepting the order"}', 'json', 'true', 'cancellation policy details for vendor', 'system','{"admin"}'),
      ('ORDER_PLACED_NOTIFICATION_SOUND', 'https://www.speedyy.com/terms-conditions/', 'file', 'true', 'order placed notification sound', 'system','{"admin","customer"}'),
      ('NEW_ORDER_NOTIFICATION_SOUND', 'https://www.speedyy.com/terms-conditions/', 'file', 'true', 'New order notification sound', 'system','{"admin","vendor"}'),
      ('VENDOR_ORDER_ACCEPT_NOTIFICATION_SOUND', 'https://www.speedyy.com/terms-conditions/', 'file', 'true', 'order accepted notification sound', 'system','{"admin","customer"}'),
      ('ORDER_COMPLETE_NOTIFICATION_SOUND', 'https://www.speedyy.com/terms-conditions/', 'file', 'true', 'order completed notification sound', 'system','{"admin","customer","vendor"}'),
      ('VENDOR_ORDER_READY_NOTIFICATION_SOUND', 'https://www.speedyy.com/terms-conditions/', 'file', 'true', 'order marked ready notification sound', 'system','{"admin","customer"}'),
      ('ORDER_CANCELLED_NOTIFICATION_SOUND', 'https://www.speedyy.com/terms-conditions/', 'file', 'true', 'order cancelled notification sound', 'system','{"admin","customer","vendor"}'),
      ('COUPON_DISPLAY_IMAGE', 'https://www.speedyy.com/terms-conditions/', 'file', 'true', 'order cancelled notification sound', 'system','{"admin","customer","vendor"}'),
      ('CUSTOMER_REFUND_INITIATED_NOTIFICATION_SOUND', 'https://www.speedyy.com/terms-conditions/', 'file', 'true', 'customer refund init notification sound', 'system','{"admin","customer"}'),
      ('CUSTOMER_REFUND_SUCCESSFUL_NOTIFICATION_SOUND', 'https://www.speedyy.com/terms-conditions/', 'file', 'true', 'customer refund success notification sound', 'system','{"admin","customer"}'),
      ('CUSTOMER_COST_FOR_TWO_OPTIONS','[{"cost_lt":2001,"cost_gt":1599,"text":"Rs 1600 to Rs 2000"},{"cost_gt":1199,"cost_lt":1601,"text":"Rs 1200 to Rs 1600"},{"cost_ls":1201,"cost_gt":0,"text":"Less than Rs 1200"}]','json', 'true', 'customer cost for two options in restaurant filter', 'system','{"admin","customer"}'),
      ('ITEM_PACKAGING_CHARGES_SLAB','[{"minPrice": 0, "maxPrice": 50, "maxCharges": 5},{"minPrice": 51, "maxPrice": 150, "maxCharges": 7 },{"minPrice": 151, "maxPrice": 300, "maxCharges": 10},{"minPrice": 301, "maxPrice": 500, "maxCharges": 15},{"minPrice": 501, "maxPrice": 10000, "maxCharges": 20 }]','json', 'true', 'item packaging slabs', 'system','{"admin","vendor"}'),
      ('TEST_FILE_UPLOAD', '{"name":"28a029bb-ebd0-4899-9291-6c16aa286d08.jpg","bucket":"speedyy-dev-core-api-public","path":"global_var_files/"}', 'file', 'true', 'notification sound test', 'system','{"admin","vendor", "customer"}'),
      ('DUMMY_MENU_ITEM_IMAGE', '{"name":"6fc40636-f034-4267-81c9-c2537923dc7f.jpg","bucket":"speedyy-dev-core-api-public","path":"global_var_files/"}', 'file', true, 'Dummy Menu Image', 'system', '{"admin","vendor","customer"}'),
      ('NOTA_MC_DISPLAY_NAME', 'Others', 'string', true, 'Nota main category display name', 'system', '{"admin","vendor","customer"}'),
      ('NOTA_VG_DISPLAY_NAME', 'Choice', 'string', true, 'Nota variant group display name', 'system', '{"admin","vendor","customer"}'),
      ('HIDE_PENDING_ORDERS_DURATION_IN_MINS', '120', 'number', true, 'Duration after which pending orders will be hidden', 'system', '{"admin","vendor","customer"}'),
      ('DEFAULT_PAGE_SIZE_RESTAURANT', '30', 'number', true, 'Default pagination size for restaurant filtering', 'system', '{"admin","customer"}'),
      ('RESTAURANT_SLOT_WORKER_INTERVAL', '60', 'number', true, 'restaurant slot worker will update restaurant slots after this interval', 'system', '{"admin"}'),
      ('REFUND_NOTE_FOR_CUSTOMER', 'Your refund should have reflected in your account by now. In case of any issues, please contact Speedy customer support.', 'string', true, 'refund note for customer', 'system', '{"admin","customer"}'),
      ('POPULAR_CUISINE_IDS','["11703ccf-e199-459f-a91d-3978fd0dabbf","d8eeffc2-3fe1-47cc-8f10-e76734bf5cf7","83859ff5-658d-46a3-a5e8-9ca338428b96"]','json', 'true', 'popular cuisines', 'system','{"admin","customer"}'),
      ('CUISINE_DEFAULT_IMAGE', '{"name":"6fc40636-f034-4267-81c9-c2537923dc7f.jpg","bucket":"speedyy-dev-core-api-public","path":"global_var_files/"}', 'file', true, 'Dummy Menu Image', 'system', '{"admin","vendor","customer"}'),
      ('NEAR_BY_LOCATION_RADIUS_IN_METRES', '1000', 'number', true, 'Radius to get near by customer saved locations', 'system', '{"admin","customer"}'),
      ('LOCATION_CHANGE_ALERT_MESSAGE', 'Hello! It looks like our location has changed since your last visit. Are you sure you want to place your order at this new location\\?', 'string', true, 'When customer location and selected loction is different then show this message', 'system', '{"admin","customer"}'),
      ('FREE_DELIVERY_LABEL_BACKGROUD_COLOR', '#FFFFFF', 'string', true, 'hex code', 'system', '{"admin","customer","vendor"}'),
      ('FREE_DELIVERY_LABEL_TEXT_COLOR', '#FFFFFF', 'string', true, 'hex code', 'system', '{"admin","customer","vendor"}'),
      ('RAITING_LABEL_BACKGROUD_COLOR', '#FFFFFF', 'string', true, 'hex code', 'system', '{"admin","customer","vendor"}'),
      ('RATING_LABEL_TEXT_COLOR', '#FFFFFF', 'string', true, 'hex code', 'system', '{"admin","customer","vendor"}')

      ON CONFLICT(KEY) DO UPDATE SET VALUE = COALESCE(GLOBAL_VAR.VALUE,EXCLUDED.VALUE);
    `);
  } else if (process.env.NODE_ENV === 'STAGING') {
    return knex.raw(`
    INSERT INTO "global_var" ("key","value","type","editable","description","updated_by","access_roles")
    VALUES
    ('OTP_TTL_SECONDS', '30', 'number', 'true', 'OTP Validity Duration', 'system','{"admin"}'),
    ('CART_MAX_TOTAL_QUANTITY', '100', 'number', 'true', 'Cart maximum allow quantity', 'system','{"admin"}'),
    ('SERVICEABILITY_RADIUS_IN_METRES', '5000', 'number', 'true', 'Restaurant serviceability radius in metres', 'system','{"admin"}'),
    ('CASHFREE_PAYOUT_MIN_BALANCE', '1000', 'number', 'true', 'Payout minimum required balance', 'system','{"admin"}'),
    ('PAYMENT_GATEWAY', 'CASHFREE', 'string', 'true', 'Payment gateway name', 'system','{"admin"}'),
    ('DELIVERY_SERVICE', 'speedyy-rider', 'string', 'true', 'Delivery service name', 'system','{"admin"}'),
    ('ORDER_CANCELLATION_DURATION_IN_SECONDS', '60', 'number', 'true', 'Order cancellation duration in seconds', 'system','{"admin"}'),
    ('ORDER_CANCELLATION_DELAY_IN_SECONDS', '5', 'number', 'true', 'Order cancellation delay in seconds', 'system','{"admin"}'),
    ('ORDER_ACCEPT_DURATION_IN_SECONDS', '600', 'number', 'true', 'Vendor Order acceptance duration in seconds', 'system','{"admin"}'),
    ('ORDER_REATTEMPT_DURATION_IN_SECONDS', '300', 'number', 'true', 'Vendor Order acceptance retry in seconds', 'system','{"admin"}'),
    ('ORDER_VENDOR_RETRY_ATTEMPTS', '3', 'number', 'true', 'Max Vendor Order acceptance notification retries', 'system','{"admin"}'),
    ('SUPER_ADMIN_EMAIL', 'operator@speedyy.com', 'string', 'true', 'super adming email id', 'system','{"admin"}'),
    ('CATALOG_TEAM_EMAIL', 'operator@speedyy.com', 'string', 'true', 'catalog team email id', 'system','{"admin"}'),
    ('BACKEND_TEAM_EMAIL', 'backend@speedyy.com', 'string', 'true', 'backend team email id', 'system','{"admin"}'),
    ('ORDER_NOT_ACCEPT_ADMIN_EMAIL', 'operator@speedyy.com', 'string', 'true', 'If vendor does not accept the order an email will be forwarded to this email', 'system','{"admin"}'),
    ('PAYOUT_REPORT_ADMIN_EMAIL', 'backend@speedyy.com', 'string', 'true', 'payout report will be forwarded to this email', 'system','{"admin"}'),
    ('SUPPORT_EMAIL', 'operator@speedyy.com', 'string', 'true', 'support email', 'system','{"admin","customer","vendor"}'),
    ('SUPPORT_CONTACT', '9876543210', 'string', 'true', 'support contact phone number', 'system','{"admin","customer","vendor"}'),
    ('SUPPORT_WHATSAPP', '9876543210', 'string', 'true', 'support whatsapp phone number', 'system','{"admin","customer","vendor"}'),
    ('ANDROID_ONLINE_PAYMENT_ENABLED', 'true', 'boolean', 'true', 'To enable online payment in android customer app', 'system','{"admin","customer","vendor"}'),
    ('IOS_ONLINE_PAYMENT_ENABLED', 'true', 'boolean', 'true', 'To enable online payment in ios customer app', 'system','{"admin","customer","vendor"}'),
    ('SUBSCRIPTION_AUTHORIZATION_AMOUNT_IN_RUPEES', '10', 'number', 'true', 'subscription emandate authorization cost', 'system','{"admin"}'),
    ('SUBSCRIPTION_RETURN_URL', 'https://vendor.dev.speedyy.com/login', 'string', 'true', 'when subscription emanded is created, user will be redirected to this url', 'system','{"admin"}'),
    ('SUBSCRIPTION_EXPIRY_INTERVAL_IN_MONTHS', '24', 'number', 'true', 'subscription will be expired after this given months', 'system','{"admin"}'),
    ('SUBSCRIPTION_FIRST_PAYMENT_DATE_INTERVAL_IN_DAYS', '2', 'number', 'true', 'subscription first payment will be deducted after given days', 'system','{"admin"}'),
    ('SUBSCRIPTION_END_TIME_GRACE_PERIOD_IN_DAYS', '2', 'number', 'true', 'subscription grace period in days', 'system','{"admin"}'),
    ('SUBSCRIPTION_VERFIY_NEW_PAYMENT_AFTER_SECONDS', '120', 'number', 'true', 'subscription payment will be reveryfied after given seconds', 'system','{"admin"}'),
    ('SUBSCRIPTION_VERFIY_NEW_PAYMENT_MAX_ATTEMPTS', '3', 'number', 'true', 'subscription reverify max attempts', 'system','{"admin"}'),
    ('NOTIFY_SUBSCRIBERS_BEFORE_DAYS', '7', 'number', 'true', 'notify subscribers before given days', 'system','{"admin"}'),
    ('CUSTOMER_CANCELLATION_POLICY', '{"terms_conditions":"https://www.speedyy.com/terms-conditions/","note":"If you cancel within 60 seconds of placing your order, a 100% refund will be issued. No refund for cancellation made after 60 seconds."}', 'json', 'true', 'cancellation policy details for customer', 'system','{"admin"}'),
    ('VENDOR_CANCELLATION_POLICY', '{"terms_conditions":"https://www.speedyy.com/terms-conditions/","note":"100% cancellation fee will be applicable if you cancel the order anytime after accepting the order"}', 'json', 'true', 'cancellation policy details for vendor', 'system','{"admin"}'),
    ('ORDER_PLACED_NOTIFICATION_SOUND', 'https://www.speedyy.com/terms-conditions/', 'file', 'true', 'order placed notification sound', 'system','{"admin","customer"}'),
    ('NEW_ORDER_NOTIFICATION_SOUND', 'https://www.speedyy.com/terms-conditions/', 'file', 'true', 'New order notification sound', 'system','{"admin","vendor"}'),
    ('VENDOR_ORDER_ACCEPT_NOTIFICATION_SOUND', 'https://www.speedyy.com/terms-conditions/', 'file', 'true', 'order accepted notification sound', 'system','{"admin","customer"}'),
    ('ORDER_COMPLETE_NOTIFICATION_SOUND', 'https://www.speedyy.com/terms-conditions/', 'file', 'true', 'order completed notification sound', 'system','{"admin","customer","vendor"}'),
    ('VENDOR_ORDER_READY_NOTIFICATION_SOUND', 'https://www.speedyy.com/terms-conditions/', 'file', 'true', 'order marked ready notification sound', 'system','{"admin","customer"}'),
    ('ORDER_CANCELLED_NOTIFICATION_SOUND', 'https://www.speedyy.com/terms-conditions/', 'file', 'true', 'order cancelled notification sound', 'system','{"admin","customer","vendor"}'),
    ('COUPON_DISPLAY_IMAGE', 'https://www.speedyy.com/terms-conditions/', 'file', 'true', 'order cancelled notification sound', 'system','{"admin","customer","vendor"}'),
    ('CUSTOMER_REFUND_INITIATED_NOTIFICATION_SOUND', 'https://www.speedyy.com/terms-conditions/', 'file', 'true', 'customer refund init notification sound', 'system','{"admin","customer"}'),
    ('CUSTOMER_REFUND_SUCCESSFUL_NOTIFICATION_SOUND', 'https://www.speedyy.com/terms-conditions/', 'file', 'true', 'customer refund success notification sound', 'system','{"admin","customer"}'),
    ('CUSTOMER_COST_FOR_TWO_OPTIONS','[{"cost_lt":2001,"cost_gt":1599,"text":"Rs 1600 to Rs 2000"},{"cost_gt":1199,"cost_lt":1601,"text":"Rs 1200 to Rs 1600"},{"cost_ls":1201,"cost_gt":0,"text":"Less than Rs 1200"}]','json', 'true', 'customer cost for two options in restaurant filter', 'system','{"admin","customer"}'),
    ('ITEM_PACKAGING_CHARGES_SLAB','[{"minPrice": 0, "maxPrice": 50, "maxCharges": 5},{"minPrice": 51, "maxPrice": 150, "maxCharges": 7 },{"minPrice": 151, "maxPrice": 300, "maxCharges": 10},{"minPrice": 301, "maxPrice": 500, "maxCharges": 15},{"minPrice": 501, "maxPrice": 10000, "maxCharges": 20 }]','json', 'true', 'item packaging slabs', 'system','{"admin","vendor"}'),
    ('TEST_FILE_UPLOAD', '{"name":"0c082c94-93ce-4e9b-8c1d-2943c252865d.jpg","bucket":"speedyy-staging-core-api-public","path":"global_var_files/"}', 'file', 'true', 'test file upload', 'system','{"admin","vendor", "customer"}'),
    ('DUMMY_MENU_ITEM_IMAGE', '{"name":"1fd3d239-628f-40e9-8c2d-2c270633f0a7.jpg","bucket":"speedyy-dev-core-api-public","path":"global_var_files/"}', 'file', true, 'Dummy Menu Image', 'system', '{"admin","vendor","customer"}'),
    ('NOTA_MC_DISPLAY_NAME', 'Others', 'string', true, 'Nota main category display name', 'system', '{"admin","vendor","customer"}'),
    ('NOTA_VG_DISPLAY_NAME', 'Choice', 'string', true, 'Nota variant group display name', 'system', '{"admin","vendor","customer"}'),
    ('HIDE_PENDING_ORDERS_DURATION_IN_MINS', '120', 'number', true, 'Duration after which pending orders will be hidden', 'system', '{"admin","vendor","customer"}'),
    ('DEFAULT_PAGE_SIZE_RESTAURANT', '30', 'number', true, 'Default pagination size for restaurant filtering', 'system', '{"admin","customer"}'),
    ('RESTAURANT_SLOT_WORKER_INTERVAL', '60', 'number', true, 'restaurant slot worker will update restaurant slots after this interval', 'system', '{"admin"}'),
    ('REFUND_NOTE_FOR_CUSTOMER', 'Your refund should have reflected in your account by now. In case of any issues, please contact Speedy customer support.', 'string', true, 'refund note for customer', 'system', '{"admin","customer"}'),
    ('POPULAR_CUISINE_IDS','["11703ccf-e199-459f-a91d-3978fd0dabbf","d8eeffc2-3fe1-47cc-8f10-e76734bf5cf7","83859ff5-658d-46a3-a5e8-9ca338428b96"]','json', 'true', 'popular cuisines', 'system','{"admin","customer"}'),
    ('CUISINE_DEFAULT_IMAGE', '{"name":"6fc40636-f034-4267-81c9-c2537923dc7f.jpg","bucket":"speedyy-dev-core-api-public","path":"global_var_files/"}', 'file', true, 'Dummy Menu Image', 'system', '{"admin","vendor","customer"}'),
    ('NEAR_BY_LOCATION_RADIUS_IN_METRES', '1000', 'number', true, 'Radius to get near by customer saved locations', 'system', '{"admin","customer"}'),
    ('LOCATION_CHANGE_ALERT_MESSAGE', 'Hello! It looks like our location has changed since your last visit. Are you sure you want to place your order at this new location\\?', 'string', true, 'When customer location and selected loction is different then show this message', 'system', '{"admin","customer"}'),
    ('FREE_DELIVERY_LABEL_BACKGROUD_COLOR', '#FFFFFF', 'string', true, 'hex code', 'system', '{"admin","customer","vendor"}'),
    ('FREE_DELIVERY_LABEL_TEXT_COLOR', '#FFFFFF', 'string', true, 'hex code', 'system', '{"admin","customer","vendor"}'),
    ('RAITING_LABEL_BACKGROUD_COLOR', '#FFFFFF', 'string', true, 'hex code', 'system', '{"admin","customer","vendor"}'),
    ('RATING_LABEL_TEXT_COLOR', '#FFFFFF', 'string', true, 'hex code', 'system', '{"admin","customer","vendor"}')

    ON CONFLICT(KEY) DO UPDATE SET VALUE = COALESCE(GLOBAL_VAR.VALUE,EXCLUDED.VALUE);
  `);
  } else if (process.env.NODE_ENV === 'PROD') {
    return knex.raw(`
      INSERT INTO "global_var" ("key","value","type","editable","description","updated_by","access_roles")
      VALUES
      ('OTP_TTL_SECONDS', '300', 'number', 'true', 'OTP Validity Duration', 'system','{"admin"}'),
      ('CART_MAX_TOTAL_QUANTITY', '200', 'number', 'true', 'Cart maximum allow quantity', 'system','{"admin"}'),
      ('SERVICEABILITY_RADIUS_IN_METRES', '5000', 'number', 'true', 'Restaurant serviceability radius in metres', 'system','{"admin"}'),
      ('CASHFREE_PAYOUT_MIN_BALANCE', '10', 'number', 'true', 'Payout minimum required balance', 'system','{"admin"}'),
      ('PAYMENT_GATEWAY', 'CASHFREE', 'string', 'true', 'Payment gateway name', 'system','{"admin"}'),
      ('DELIVERY_SERVICE', 'speedyy-rider', 'string', 'true', 'Delivery service name', 'system','{"admin"}'),
      ('ORDER_CANCELLATION_DURATION_IN_SECONDS', '60', 'number', 'true', 'Order cancellation duration in seconds', 'system','{"admin"}'),
      ('ORDER_CANCELLATION_DELAY_IN_SECONDS', '5', 'number', 'true', 'Order cancellation delay in seconds', 'system','{"admin"}'),
      ('ORDER_ACCEPT_DURATION_IN_SECONDS', '180', 'number', 'true', 'Vendor Order acceptance duration in seconds', 'system','{"admin"}'),
      ('ORDER_REATTEMPT_DURATION_IN_SECONDS', '300', 'number', 'true', 'Vendor Order acceptance retry in seconds', 'system','{"admin"}'),
      ('ORDER_VENDOR_RETRY_ATTEMPTS', '3', 'number', 'true', 'Max Vendor Order acceptance notification retries', 'system','{"admin"}'),
      ('SUPER_ADMIN_EMAIL', 'operator@speedyy.com', 'string', 'true', 'super adming email id', 'system','{"admin"}'),
      ('CATALOG_TEAM_EMAIL', 'operator@speedyy.com', 'string', 'true', 'catalog team email id', 'system','{"admin"}'),
      ('BACKEND_TEAM_EMAIL', 'backend@speedyy.com', 'string', 'true', 'backend team email id', 'system','{"admin"}'),
      ('ORDER_NOT_ACCEPT_ADMIN_EMAIL', 'operator@speedyy.com', 'string', 'true', 'If vendor does not accept the order an email will be forwarded to this email', 'system','{"admin"}'),
      ('PAYOUT_REPORT_ADMIN_EMAIL', 'operator@speedyy.com', 'string', 'true', 'payout report will be forwarded to this email', 'system','{"admin"}'),
      ('SUPPORT_EMAIL', 'operator@speedyy.com', 'string', 'true', 'support email', 'system','{"admin","customer","vendor"}'),
      ('SUPPORT_CONTACT', '9876543210', 'string', 'true', 'support contact phone number', 'system','{"admin","customer","vendor"}'),
      ('SUPPORT_WHATSAPP', '9876543210', 'string', 'true', 'support whatsapp phone number', 'system','{"admin","customer","vendor"}'),
      ('ANDROID_ONLINE_PAYMENT_ENABLED', 'true', 'boolean', 'true', 'To enable online payment in android customer app', 'system','{"admin","customer","vendor"}'),
      ('IOS_ONLINE_PAYMENT_ENABLED', 'true', 'boolean', 'true', 'To enable online payment in ios customer app', 'system','{"admin","customer","vendor"}'),
      ('SUBSCRIPTION_AUTHORIZATION_AMOUNT_IN_RUPEES', '1', 'number', 'true', 'subscription emandate authorization cost', 'system','{"admin"}'),
      ('SUBSCRIPTION_RETURN_URL', 'https://vendor.speedyy.com/login', 'string', 'true', 'when subscription emanded is created, user will be redirected to this url', 'system','{"admin"}'),
      ('SUBSCRIPTION_EXPIRY_INTERVAL_IN_MONTHS', '24', 'number', 'true', 'subscription will be expired after this given months', 'system','{"admin"}'),
      ('SUBSCRIPTION_FIRST_PAYMENT_DATE_INTERVAL_IN_DAYS', '2', 'number', 'true', 'subscription first payment will be deducted after given days', 'system','{"admin"}'),
      ('SUBSCRIPTION_END_TIME_GRACE_PERIOD_IN_DAYS', '2', 'number', 'true', 'subscription grace period in days', 'system','{"admin"}'),
      ('SUBSCRIPTION_VERFIY_NEW_PAYMENT_AFTER_SECONDS', '120', 'number', 'true', 'subscription payment will be reveryfied after given seconds', 'system','{"admin"}'),
      ('SUBSCRIPTION_VERFIY_NEW_PAYMENT_MAX_ATTEMPTS', '3', 'number', 'true', 'subscription reverify max attempts', 'system','{"admin"}'),
      ('NOTIFY_SUBSCRIBERS_BEFORE_DAYS', '7', 'number', 'true', 'notify subscribers before given days', 'system','{"admin"}'),
      ('CUSTOMER_CANCELLATION_POLICY', '{"terms_conditions":"https://www.speedyy.com/terms-conditions/","note":"If you cancel within 60 seconds of placing your order, a 100% refund will be issued. No refund for cancellation made after 60 seconds."}', 'json', 'true', 'cancellation policy details for customer', 'system','{"admin"}'),
      ('VENDOR_CANCELLATION_POLICY', '{"terms_conditions":"https://www.speedyy.com/terms-conditions/","note":"100% cancellation fee will be applicable if you cancel the order anytime after accepting the order"}', 'json', 'true', 'cancellation policy details for vendor', 'system','{"admin"}'),
      ('ORDER_PLACED_NOTIFICATION_SOUND', 'https://www.speedyy.com/terms-conditions/', 'file', 'true', 'order placed notification sound', 'system','{"admin","customer"}'),
      ('NEW_ORDER_NOTIFICATION_SOUND', 'https://www.speedyy.com/terms-conditions/', 'file', 'true', 'New order notification sound', 'system','{"admin","vendor"}'),
      ('VENDOR_ORDER_ACCEPT_NOTIFICATION_SOUND', 'https://www.speedyy.com/terms-conditions/', 'file', 'true', 'order accepted notification sound', 'system','{"admin","customer"}'),
      ('ORDER_COMPLETE_NOTIFICATION_SOUND', 'https://www.speedyy.com/terms-conditions/', 'file', 'true', 'order completed notification sound', 'system','{"admin","customer","vendor"}'),
      ('VENDOR_ORDER_READY_NOTIFICATION_SOUND', 'https://www.speedyy.com/terms-conditions/', 'file', 'true', 'order marked ready notification sound', 'system','{"admin","customer"}'),
      ('ORDER_CANCELLED_NOTIFICATION_SOUND', 'https://www.speedyy.com/terms-conditions/', 'file', 'true', 'order cancelled notification sound', 'system','{"admin","customer","vendor"}'),
      ('COUPON_DISPLAY_IMAGE', 'https://www.speedyy.com/terms-conditions/', 'file', 'true', 'order cancelled notification sound', 'system','{"admin","customer","vendor"}'),
      ('CUSTOMER_REFUND_INITIATED_NOTIFICATION_SOUND', 'https://www.speedyy.com/terms-conditions/', 'file', 'true', 'customer refund init notification sound', 'system','{"admin","customer"}'),
      ('CUSTOMER_REFUND_SUCCESSFUL_NOTIFICATION_SOUND', 'https://www.speedyy.com/terms-conditions/', 'file', 'true', 'customer refund success notification sound', 'system','{"admin","customer"}'),
      ('CUSTOMER_COST_FOR_TWO_OPTIONS','[{"cost_lt":2001,"cost_gt":1599,"text":"Rs 1600 to Rs 2000"},{"cost_gt":1199,"cost_lt":1601,"text":"Rs 1200 to Rs 1600"},{"cost_ls":1201,"cost_gt":0,"text":"Less than Rs 1200"}]','json', 'true', 'customer cost for two options in restaurant filter', 'system','{"admin","customer"}'),
      ('ITEM_PACKAGING_CHARGES_SLAB','[{"minPrice": 0, "maxPrice": 50, "maxCharges": 5},{"minPrice": 51, "maxPrice": 150, "maxCharges": 7 },{"minPrice": 151, "maxPrice": 300, "maxCharges": 10},{"minPrice": 301, "maxPrice": 500, "maxCharges": 15},{"minPrice": 501, "maxPrice": 10000, "maxCharges": 20 }]','json', 'true', 'item packaging slabs', 'system','{"admin","vendor"}'),
      ('TEST_FILE_UPLOAD', '{"name":"63dd30e0-6fb6-4271-aaa9-ea66926c45fc.mp3","bucket":"speedyy-prod-core-api-public","path":"global_var_files/"}', 'file', 'true', 'notification sound test', 'system','{"admin","vendor", "customer"}'),
      ('DUMMY_MENU_ITEM_IMAGE', '{"name":"578cf43a-ce06-4ee1-8098-49972243b1eb.jpg","bucket":"speedyy-dev-core-api-public","path":"global_var_files/"}', 'file', true, 'Dummy Menu Image', 'system', '{"admin","vendor","customer"}'),
      ('NOTA_MC_DISPLAY_NAME', 'Others', 'string', true, 'Nota main category display name', 'system', '{"admin","vendor","customer"}'),
      ('NOTA_VG_DISPLAY_NAME', 'Choice', 'string', true, 'Nota variant group display name', 'system', '{"admin","vendor","customer"}'),
      ('HIDE_PENDING_ORDERS_DURATION_IN_MINS', '120', 'number', true, 'Duration after which pending orders will be hidden', 'system', '{"admin","vendor","customer"}'),
      ('DEFAULT_PAGE_SIZE_RESTAURANT', '30', 'number', true, 'Default pagination size for restaurant filtering', 'system', '{"admin","customer"}'),
      ('RESTAURANT_SLOT_WORKER_INTERVAL', '60', 'number', true, 'restaurant slot worker will update restaurant slots after this interval', 'system', '{"admin"}'),
      ('REFUND_NOTE_FOR_CUSTOMER', 'Your refund should have reflected in your account by now. In case of any issues, please contact Speedy customer support.', 'string', true, 'refund note for customer', 'system', '{"admin","customer"}'),
      ('POPULAR_CUISINE_IDS','["11703ccf-e199-459f-a91d-3978fd0dabbf","d8eeffc2-3fe1-47cc-8f10-e76734bf5cf7","83859ff5-658d-46a3-a5e8-9ca338428b96"]','json', 'true', 'popular cuisines', 'system','{"admin","customer"}'),
      ('CUISINE_DEFAULT_IMAGE', '{"name":"6fc40636-f034-4267-81c9-c2537923dc7f.jpg","bucket":"speedyy-dev-core-api-public","path":"global_var_files/"}', 'file', true, 'Dummy Menu Image', 'system', '{"admin","vendor","customer"}'),
      ('NEAR_BY_LOCATION_RADIUS_IN_METRES', '1000', 'number', true, 'Radius to get near by customer saved locations', 'system', '{"admin","customer"}'),
      ('LOCATION_CHANGE_ALERT_MESSAGE', 'Hello! It looks like our location has changed since your last visit. Are you sure you want to place your order at this new location\\?', 'string', true, 'When customer location and selected loction is different then show this message', 'system', '{"admin","customer"}'),
      ('FREE_DELIVERY_LABEL_BACKGROUD_COLOR', '#FFFFFF', 'string', true, 'hex code', 'system', '{"admin","customer","vendor"}'),
      ('FREE_DELIVERY_LABEL_TEXT_COLOR', '#FFFFFF', 'string', true, 'hex code', 'system', '{"admin","customer","vendor"}'),
      ('RAITING_LABEL_BACKGROUD_COLOR', '#FFFFFF', 'string', true, 'hex code', 'system', '{"admin","customer","vendor"}'),
      ('RATING_LABEL_TEXT_COLOR', '#FFFFFF', 'string', true, 'hex code', 'system', '{"admin","customer","vendor"}')

      ON CONFLICT(KEY) DO UPDATE SET VALUE = COALESCE(GLOBAL_VAR.VALUE,EXCLUDED.VALUE);
  `);
  }
}
