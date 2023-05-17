export class PlanTable {
  static readonly TableName = 'plan';
  static readonly ColumnNames = {
    id: 'id',
    name: 'name',
    type: 'type',
    category: 'category',
    amount: 'amount',
    max_cycles: 'max_cycles',
    interval_type: 'interval_type',
    intervals: 'intervals',
    description: 'description',
    no_of_orders: 'no_of_orders',
    no_of_grace_period_orders: 'no_of_grace_period_orders',
    active: 'active',
    terms_and_conditions: 'terms_and_conditions',
    image: 'image',
    created_at: 'created_at',
    updated_at: 'updated_at',
  };
}

export class SubscriptionTable {
  static readonly TableName = 'subscription';
  static readonly ColumnNames = {
    id: 'id',
    external_subscription_id: 'external_subscription_id',
    restaurant_id: 'restaurant_id',
    plan_id: 'plan_id',
    status: 'status',
    mode: 'mode',
    authorization_status: 'auth_status',
    authorization_amount: 'auth_amount',
    authorization_details: 'authorization_details', //contains authorization_link
    cancelled_by: 'cancelled_by',
    cancellation_user_id: 'cancellation_user_id',
    cancellation_details: 'cancellation_details',
    partner: 'partner',
    description: 'description',
    customer_name: 'customer_name',
    customer_email: 'customer_email',
    customer_phone: 'customer_phone',
    start_time: 'start_time',
    end_time: 'end_time',
    current_cycle: 'current_cycle',
    next_payment_on: 'next_payment_on',
    additional_details: 'additional_details',
    created_at: 'created_at',
    updated_at: 'updated_at',
  };
}

export class SubscriptionPaymentTable {
  static readonly TableName = 'subscription_payment';
  static readonly ColumnNames = {
    id: 'id',
    subscription_id: 'subscription_id',
    external_payment_id: 'external_payment_id',
    status: 'status',
    no_of_grace_period_orders_allotted: 'no_of_grace_period_orders_allotted',
    no_of_orders_bought: 'no_of_orders_bought',
    no_of_orders_consumed: 'no_of_orders_consumed',
    cycle: 'cycle',
    currency: 'currency',
    amount: 'amount',
    retry_attempts: 'retry_attempts',
    failure_reason: 'failure_reason',
    scheduled_on: 'scheduled_on',
    transaction_time: 'transaction_time',
    additional_details: 'additional_details',
    created_at: 'created_at',
    updated_at: 'updated_at',
  };
}

export const READ_SUBSCRIPTION_AND_RES_SUBSCRIPTION_SQL_QUERY = `(
  SELECT
  s.id,
  s.external_subscription_id,
  s.restaurant_id,
  s.plan_id,
  s.status,
  s.mode,
  s.authorization_status,
  s.authorization_amount,
  s.authorization_details,
  s.cancelled_by,
  s.cancellation_user_id,
  s.cancellation_details,
  s.partner,
  s.description,
  s.customer_name,
  s.customer_email,
  s.customer_phone,
  s.start_time,
  s.end_time,
  s.current_cycle,
  s.next_payment_on,
  s.additional_details,
  s.created_at,
  s.updated_at,
  r.subscription_grace_period_remaining_orders,
  r.subscription_remaining_orders
  FROM public.subscription as s
  join public.restaurant as r on r.subscription_id = s.id
) as a`;

export const READ_STALE_SUBSCRIPTIONS_SQL_QUERY = `(
  SELECT
  r.subscription_grace_period_remaining_orders,
  r.subscription_remaining_orders,
  s.id,
  s.external_subscription_id,
  s.restaurant_id,
  s.plan_id,
  s.status,
  s.mode,
  s.authorization_status,
  s.authorization_amount,
  s.authorization_details,
  s.cancelled_by,
  s.cancellation_user_id,
  s.cancellation_details,
  s.partner,
  s.customer_name,
  s.customer_email,
  s.customer_phone,
  s.start_time,
  s.end_time,
  s.current_cycle,
  s.next_payment_on,
  sp.id as subscription_payment_id,
  sp.no_of_grace_period_orders_allotted,
  sp.no_of_orders_bought,
  sp.no_of_orders_consumed,
  sp.transaction_time,
  sp.cycle,
  p.type as plan_type
  FROM public.restaurant as r
  join public.subscription as s on r.subscription_id = s.id
  join public.plan as p on p.id = s.plan_id
  join public.subscription_payment as sp on
  (
    s.id = sp.subscription_id
    and
    (
      s.current_cycle = sp.cycle
      or
      sp.cycle is null
    )
  )
  where
  r.subscription_end_time < CURRENT_TIMESTAMP
)as a`;

export const SUBSCRIPTION_WITH_CURRENT_AND_NEXT_PAYMENT = `
(
SELECT
s.id,
s.external_subscription_id as external_subscription_id,
s.restaurant_id,
s.plan_id,
p.type as plan_type,
p.amount as plan_amount,
s.status as status,
s.mode,
s.authorization_status,
s.authorization_amount,
s.authorization_details,
s.cancelled_by,
s.cancellation_user_id,
s.cancellation_details,
s.partner,
s.description,
s.customer_name,
s.customer_email,
s.customer_phone,
s.start_time,
s.end_time,
s.current_cycle,
s.next_payment_on as next_payment_on,
s.additional_details,
s.created_at,
s.updated_at,
(
  SELECT row_to_json(spc)
  FROM (
    SELECT
    spc.id,
    spc.subscription_id,
    spc.external_payment_id,
    spc.status,
    spc.no_of_grace_period_orders_allotted,
    spc.no_of_orders_bought,
    spc.no_of_orders_consumed,
    spc.cycle,
    spc.currency,
    spc.amount,
    spc.retry_attempts,
    spc.failure_reason,
    spc.transaction_time,
    spc.scheduled_on,
    spc.additional_details,
    spc.created_at,
    spc.updated_at
    FROM subscription_payment AS spc
    WHERE
    spc.subscription_id = s.id
    and
    spc.cycle = s.current_cycle
    ) AS spc
  ) AS current_cycle_payment,
  (
    SELECT row_to_json(spn)
    FROM (
      SELECT
      spn.id,
      spn.subscription_id,
      spn.external_payment_id,
      spn.status,
      spn.no_of_grace_period_orders_allotted,
      spn.no_of_orders_bought,
      spn.no_of_orders_consumed,
      spn.cycle,
      spn.currency,
      spn.amount,
      spn.retry_attempts,
      spn.failure_reason,
      spn.transaction_time,
      spn.scheduled_on,
      spn.additional_details,
      spn.created_at,
      spn.updated_at
      FROM subscription_payment AS spn
      WHERE
      spn.subscription_id = s.id
      and
      spn.cycle = s.current_cycle + 1
      ) AS spn
    ) AS next_cycle_payment
FROM subscription as s
join public.plan as p on p.id = s.plan_id
) as a`;
