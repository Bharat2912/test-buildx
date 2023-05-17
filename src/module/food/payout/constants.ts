export const PAYOUT_WITH_ORDERS_QUERY = ` (
    SELECT
    p.id,
    p.restaurant_id,
    p.start_time,
    p.end_time,
    p.total_order_amount,
    p.transaction_charges,
    p.amount_paid_to_vendor,
    p.transaction_id,
    p.transaction_details,
    p.status,
    p.retry,
    p.completed_marked_admin_id,
    p.payout_gateway,
    p.payout_details,
    p.payout_completed_time,
    p.is_deleted,
    p.created_at,
    p.updated_at,
      (
        SELECT to_json(array_agg(row_to_json(o)))
        FROM (
        SELECT
         o.id AS order_id
        ,o.restaurant_id
        ,o.customer_id
        ,o.customer_device_id
        ,o.customer_address
        ,o.order_delivered_at
        ,o.delivery_status
        ,o.delivery_charges
        ,o.delivery_tip
        ,o.order_status
        ,o.order_acceptance_status
        ,o.total_customer_payable
        ,o.total_tax
        ,o.packing_charges
        ,o.offer_discount
        ,o.coupon_id
        ,o.vote_type
        ,0 as order_rating
        ,o.any_special_request
        ,o.cancelled_by
        ,o.cancellation_user_id
        ,o.cancellation_details
        ,o.cancellation_time
        ,o.vendor_ready_marked_time
        ,o.created_at
        ,o.updated_at
        ,o.delivery_order_id
        ,o.pickup_eta
        ,o.drop_eta
        ,o.vendor_accepted_time
        ,o.delivery_details
        ,o.preparation_time
        ,o.order_placed_time
        ,o.order_pickedup_time
        ,o.invoice_breakout
        ,o.comments
        ,o.reviewed_at
        ,o.refund_status
        ,o.additional_details
        ,o.payout_transaction_id
        FROM public.order AS o
        WHERE o.payout_transaction_id = p.id
        ) AS o
      ) AS payout_orders
  FROM "payout" AS p
  WHERE p.is_deleted = false
  ORDER BY p.created_at asc
  ) as a`; //! BACKWARD_COMPATIBLE order_rating
