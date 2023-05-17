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
)
VALUES
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
)
VALUES
  (
   'RES_cad8a619-19d0-4d1d-b501-04d475300aa3',
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
INSERT INTO public.subscription_payment(
    subscription_id,
    status,
    no_of_grace_period_orders_allotted,
    no_of_orders_bought,
    created_at,
    updated_at
)
VALUES
  (
    'RES_cad8a619-19d0-4d1d-b501-04d475300aa3',
    'success',
    50,
    100,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  );

UPDATE public.restaurant
SET
subscription_id = 'RES_cad8a619-19d0-4d1d-b501-04d475300aa3',
subscription_end_time = CURRENT_TIMESTAMP + interval '1' day,
subscription_grace_period_remaining_orders = 50,
subscription_remaining_orders = 100
WHERE id = '77e53c1f-6e9e-4724-9ba7-92edc69cff6b';


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
)
VALUES
  (
   'RES_bbd8a619-19d0-4d1d-b501-04d475300ac4',
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
INSERT INTO public.subscription_payment(
    subscription_id,
    status,
    no_of_grace_period_orders_allotted,
    no_of_orders_bought,
    created_at,
    updated_at
)
VALUES
  (
    'RES_bbd8a619-19d0-4d1d-b501-04d475300ac4',
    'success',
    50,
    100,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  );

UPDATE public.restaurant
SET
subscription_id = 'RES_bbd8a619-19d0-4d1d-b501-04d475300ac4',
subscription_end_time = CURRENT_TIMESTAMP + interval '1' day,
subscription_grace_period_remaining_orders = 50,
subscription_remaining_orders = 100
WHERE id = 'b0909e52-a731-4665-a791-ee6479008805';


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
)
VALUES
  (
   'RES_9998a619-19d0-4d1d-b501-04d475300aa3',
    '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
    'RES_549f2e33-1681-4f04-acbf-7ab537b95d9d',
    'active',
    'description',
    'Jay',
    'jay.b@speedyy.com',
    '+919819999999',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + interval '1' day,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  );
INSERT INTO public.subscription_payment(
    subscription_id,
    status,
    no_of_grace_period_orders_allotted,
    no_of_orders_bought,
    created_at,
    updated_at
)
VALUES
  (
    'RES_9998a619-19d0-4d1d-b501-04d475300aa3',
    'success',
    50,
    100,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  );

UPDATE public.restaurant
SET
subscription_id = 'RES_9998a619-19d0-4d1d-b501-04d475300aa3',
subscription_end_time = CURRENT_TIMESTAMP + interval '1' day,
subscription_grace_period_remaining_orders = 50,
subscription_remaining_orders = 100
WHERE id = '97c6fdbc-8df6-4541-9d3f-f9e5ba4c0242';
