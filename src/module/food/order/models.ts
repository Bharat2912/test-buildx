import logger from '../../../utilities/logger/winston_logger';
import {Knex} from 'knex';
import {DB} from '../../../data/knex';
import {
  IOrder,
  IOrderAddon,
  IOrderItem,
  IOrderVariant,
  IPayment,
  IOrderDetails,
  IAdminFilterOrders,
  ICustomerFilterOrders,
  IVendorFilterOrders,
  IVendorOrderDetails,
  CancellationReason,
  IPaymentOrderDetails,
} from './types';
import {
  OrderAddonTable,
  OrderItemTable,
  OrderTable,
  OrderVariantTable,
  PaymentTable,
  CancellationReasonTable,
} from './constants';
import {OrderByColumn, OrderStatus, PaymentStatus, SortOrder} from './enums';
import {IReviewFilter} from '../restaurant/types';
import Globals from '../../../utilities/global_var/globals';
import {isEmpty} from '../../../utilities/utilFuncs';

export async function bulkInsertPayment(
  trx: Knex.Transaction,
  insertRows: IPayment[]
): Promise<IPayment> {
  logger.debug('bulk inserting payment', insertRows);
  return DB.write(PaymentTable.TableName)
    .insert(insertRows)
    .returning('*')
    .transacting(trx)
    .then((payment: IPayment[]) => {
      logger.debug('successfully bulk inserted payment records', payment[0]);
      return payment[0];
    })
    .catch((error: Error) => {
      logger.error(`GOT ERROR WHILE INSERTING DATA IN PAYMENT TABLE: ${error}`);
      throw error;
    });
}

export async function bulkInsertOrder(
  trx: Knex.Transaction,
  insertRows: IOrder[]
): Promise<IOrder> {
  logger.debug('bulk inserting order', insertRows);
  return DB.write(OrderTable.TableName)
    .insert(insertRows)
    .returning('*')
    .transacting(trx)
    .then((order: IOrder[]) => {
      logger.debug('successfully bulk inserted order', order[0]);
      return order[0];
    })
    .catch((error: Error) => {
      logger.error(`GOT ERROR WHILE INSERTING DATA IN ORDER TABLE: ${error}`);
      throw error;
    });
}

export async function bulkInsertOrderItem(
  trx: Knex.Transaction,
  insertRows: IOrderItem[]
): Promise<IOrderItem[]> {
  logger.debug('bulk inserting order item', insertRows);
  return DB.write(OrderItemTable.TableName)
    .insert(insertRows)
    .returning('*')
    .transacting(trx)
    .then((order_item: IOrderItem[]) => {
      logger.debug('successfully bulk inserted order item', order_item);
      return order_item;
    })
    .catch((error: Error) => {
      logger.error(
        `GOT ERROR WHILE INSERTING DATA IN ORDER ITEMS TABLE: ${error}`
      );
      throw error;
    });
}

export async function bulkInsertOrderVariant(
  trx: Knex.Transaction,
  insertRows: IOrderVariant[]
): Promise<IOrderVariant[]> {
  logger.debug('bulk inserting order variant', insertRows);
  return DB.write(OrderVariantTable.TableName)
    .insert(insertRows)
    .returning('*')
    .transacting(trx)
    .then((addon: IOrderVariant[]) => {
      logger.debug('successfully bulk inserted order variant', addon);
      return addon;
    })
    .catch((error: Error) => {
      logger.error(
        `GOT ERROR WHILE INSERTING DATA IN ORDER VARIANTS TABLE: ${error}`
      );
      throw error;
    });
}

export async function bulkInsertOrderAddon(
  trx: Knex.Transaction,
  insertRows: IOrderAddon[]
): Promise<IOrderAddon[]> {
  logger.debug('bulk inserting order addon', insertRows);
  return DB.write(OrderAddonTable.TableName)
    .insert(insertRows)
    .returning('*')
    .transacting(trx)
    .then((addon: IOrderAddon[]) => {
      logger.debug('successfully bulk inserted order addon', addon);
      return addon;
    })
    .catch((error: Error) => {
      logger.error(
        `GOT ERROR WHILE INSERTING DATA IN ORDER ADDONS TABLE: ${error}`
      );
      throw error;
    });
}

export function updateOrder(
  trx: Knex.Transaction,
  updatedOrder: IOrder
): Promise<IOrder> {
  logger.debug('updating order', updatedOrder.id);
  updatedOrder.updated_at = new Date();
  return DB.write(OrderTable.TableName)
    .update(updatedOrder)
    .returning('*')
    .where({id: updatedOrder.id})
    .transacting(trx)
    .then((order: IOrder[]) => {
      logger.debug('successfully updated order');
      return order[0];
    })
    .catch((error: Error) => {
      logger.error(`GOT ERROR WHILE UPDATING DATA IN ORDER TABLE: ${error}`);
      throw error;
    });
}

export function updatePaymentById(
  trx: Knex.Transaction,
  updateRows: IPayment
): Promise<IPayment> {
  logger.debug('updating payment by id', updateRows);
  updateRows.updated_at = new Date();
  return DB.write(PaymentTable.TableName)
    .update(updateRows)
    .returning('*')
    .where({id: updateRows.id})
    .transacting(trx)
    .then((payment: IPayment[]) => {
      logger.debug('successfully updated payment by id', payment[0]);
      return payment[0];
    })
    .catch((error: Error) => {
      logger.error(`GOT ERROR WHILE UPDATING DATA IN PAYMENT TABLE: ${error}`);
      throw error;
    });
}

export function updateOrderPayments(
  trx: Knex.Transaction,
  order_id: string,
  updateRows: IPayment
): Promise<IPayment> {
  logger.debug('updating order payments', {order_id, updateRows});
  updateRows.updated_at = new Date();
  return DB.write(PaymentTable.TableName)
    .update(updateRows)
    .returning('*')
    .where({order_id: order_id})
    .transacting(trx)
    .then((payment: IPayment[]) => {
      logger.debug('successfully updated order payment', payment[0]);
      return payment[0];
    })
    .catch((error: Error) => {
      logger.error(`GOT ERROR WHILE UPDATING DATA IN PAYMENT TABLE: ${error}`);
      throw error;
    });
}

export function getPaymentDetails(
  payment_id: string,
  customer_id: string
): Promise<IPayment> {
  logger.debug('reading payment details', {payment_id, customer_id});
  return DB.read
    .select('*')
    .from(PaymentTable.TableName)
    .where({id: payment_id, customer_id: customer_id})
    .then((payment: IPayment[]) => {
      logger.debug('successfully fetched payment details', payment[0]);
      return payment[0];
    })
    .catch((error: Error) => {
      logger.error(
        `GOT ERROR WHILE FETCHING DATA FROM PAYMENT TABLE FOR PAYMENT ID: ${payment_id} | ERROR: ${error}`
      );
      throw error;
    });
}

export function getOrderTableDetails(
  order_id: string,
  customer_id: string
): Promise<IOrder> {
  logger.debug('reading order table details', {order_id, customer_id});
  return DB.read
    .select('*')
    .from(OrderTable.TableName)
    .where({id: order_id, customer_id: customer_id})

    .then((order: IOrder[]) => {
      logger.debug('successfully fetched order table details', order[0]);
      return order[0];
    })
    .catch((error: Error) => {
      logger.error(`GOT ERROR WHILE INSERTING DATA IN ORDER TABLE: ${error}`);
      throw error;
    });
}

export async function getPaymentOrderTableDetailsForUpdate(
  trx: Knex.Transaction,
  payment_id: string,
  customer_id: string
): Promise<IPaymentOrderDetails> {
  return DB.write
    .select([
      'p.id',
      'p.order_id',
      'p.customer_id',
      'p.transaction_id',
      'p.transaction_token',
      'p.session_id',
      'p.payment_status',
      'p.payment_method',
      'p.payment_gateway',
      'p.additional_details',
      'p.amount_paid_by_customer',
      'p.transaction_time',
      'p.is_pod',
      'p.created_at',
      'p.updated_at',
      'o.total_customer_payable',
      'o.coupon_id',
      'o.invoice_breakout',
      'o.order_status',
      'o.order_placed_time',
    ])
    .from('payment as p')
    .join('order as o', 'o.id', 'p.order_id')
    .where('p.id', payment_id)
    .andWhere('p.customer_id', customer_id)
    .forUpdate()
    .transacting(trx)
    .then((payment: IPaymentOrderDetails[]) => {
      return payment[0];
    })
    .catch((error: Error) => {
      logger.error(
        `GOT ERROR WHILE FETCHING DATA FROM PAYMENT TABLE AND ORDER TABLE: ${error}`
      );
      throw error;
    });
}

async function createCustomerOrderDetailsSqlQuery() {
  //! BACKWARD_COMPATIBLE order_rating
  const vendor_accept_start_duration =
    (await Globals.ORDER_CANCELLATION_DURATION_IN_SECONDS.get()) +
    (await Globals.ORDER_CANCELLATION_DELAY_IN_SECONDS.get());
  const vendor_accept_end_duration =
    (await Globals.ORDER_CANCELLATION_DURATION_IN_SECONDS.get()) +
    (await Globals.ORDER_ACCEPT_DURATION_IN_SECONDS.get());
  const hide_pending_orders_duration_in_mins =
    await Globals.HIDE_PENDING_ORDERS_DURATION_IN_MINS.get();

  return `(
    SELECT o.id AS order_id
    ,o.restaurant_id AS restaurant_id
    ,o.customer_id AS customer_id
    ,o.customer_device_id AS customer_device_id
    ,o.customer_address AS customer_address
    ,o.order_delivered_at AS order_delivered_at
    ,o.delivery_status AS delivery_status
    ,o.delivery_charges AS delivery_charges
    ,o.delivery_tip AS delivery_tip
    ,o.order_status AS order_status
    ,o.order_acceptance_status AS order_acceptance_status
    ,o.total_customer_payable AS total_customer_payable
    ,o.total_tax AS total_tax
    ,o.packing_charges AS packing_charges
    ,o.offer_discount AS offer_discount
    ,o.vote_type AS vote_type
    ,0 AS order_rating
    ,o.any_special_request AS any_special_request
    ,o.cancelled_by AS cancelled_by
    ,o.cancellation_details AS cancellation_details
    ,o.cancellation_time AS cancellation_time
    ,o.vendor_ready_marked_time AS vendor_ready_marked_time
    ,o.created_at AS created_at
    ,o.updated_at AS updated_at
    ,o.delivery_order_id AS delivery_order_id
    ,o.pickup_eta AS pickup_eta
    ,o.drop_eta AS drop_eta
    ,o.preparation_time AS preparation_time
    ,o.invoice_breakout as invoice_breakout
    ,o.vendor_accepted_time AS vendor_accepted_time
    ,o.delivery_details AS delivery_details
    ,o.coupon_id AS coupon_id
    ,o.order_placed_time as order_placed_time
    ,o.order_placed_time + ${vendor_accept_start_duration} * interval '1 second' as vendor_accepted_start_time
    ,o.order_placed_time + ${vendor_accept_end_duration} * interval '1 second' as vendor_accepted_end_time
    ,o.order_pickedup_time as order_pickedup_time
    ,o.comments as comments
    ,o.reviewed_at as reviewed_at
    ,o.refund_status as refund_status
    ,o.additional_details as additional_details
    ,o.delivery_service as delivery_service
    ,o.pos_id as pos_id
    ,o.pos_partner as pos_partner
    ,(
      select COALESCE(manager_contact_number, owner_contact_number)
      from restaurant_onboarding
      where restaurant_onboarding.id = o.restaurant_id
    )as restaurant_contact_number
    ,(
      SELECT row_to_json(c)
      FROM (
        SELECT
        c.id as id,
        c.code as code,
        c.header as header,
        c.description as description,
        c.terms_and_conditions as terms_and_conditions,
        c.type as type,
        c.discount_percentage as discount_percentage,
        c.discount_amount_rupees as discount_amount_rupees,
        c.start_time as start_time,
        c.end_time as end_time,
        c.level as level,
        c.max_use_count as max_use_count,
        c.coupon_use_interval_minutes as coupon_use_interval_minutes,
        c.min_order_value_rupees as min_order_value_rupees,
        c.max_discount_rupees as max_discount_rupees,
        c.discount_share_percent as discount_share_percent,
        c.discount_sponsered_by as discount_sponsered_by,
        c.created_by as created_by,
        c.created_by_user_id as created_by_user_id,
        c.is_deleted as is_deleted,
        c.created_at as created_at,
        c.updated_at as updated_at
        FROM coupon AS c
        WHERE c.id = o.coupon_id
        ) AS c
      ) AS coupon_details
    ,(
      SELECT to_json(array_agg(row_to_json(pd)))
      FROM (
        SELECT
           py.id AS payment_id
          ,py.order_id AS payment_order_id
          ,py.customer_id AS customer_id
          ,py.transaction_id AS transaction_id
          ,py.transaction_token AS transaction_token
          ,py.session_id AS session_id
          ,py.payment_status AS payment_status
          ,py.payment_method AS payment_method
          ,py.payment_gateway AS payment_gateway
          ,py.additional_details AS additional_details
          ,py.amount_paid_by_customer AS amount_paid_by_customer
          ,py.transaction_time AS transaction_time
          ,py.is_pod
          ,py.created_at AS created_at
          ,py.updated_at AS updated_at
        FROM payment AS py
        WHERE py.order_id = o.id
        ORDER BY created_at desc
        ) AS pd
      ) AS payment_details
    ,(
      SELECT to_json(array_agg(row_to_json(oi)))
      FROM (
        SELECT oi.id AS order_item_id
          ,oi.menu_item_id as menu_item_id
          ,oi.order_id AS order_id
          ,oi.quantity AS quantity
          ,oi.restaurant_id AS restaurant_id
          ,oi.NAME AS "name"
          ,oi.description AS description
          ,oi.sub_category_id AS sub_category_id
          ,oi.price AS price
          ,oi.display_price AS display_price
          ,oi.veg_egg_non AS veg_egg_non
          ,oi.packing_charges AS packing_charges
          ,oi.is_spicy AS is_spicy
          ,oi.serves_how_many AS serves_how_many
          ,oi.service_charges AS service_charges
          ,oi.item_sgst_utgst AS item_sgst_utgst
          ,oi.item_cgst AS item_cgst
          ,oi.item_igst AS item_igst
          ,oi.item_inclusive AS item_inclusive
          ,oi.external_id AS external_id
          ,oi.allow_long_distance AS allow_long_distance
          ,oi.IMAGE AS IMAGE
          ,oi.pos_id AS pos_id
          ,(
            SELECT to_json(array_agg(row_to_json(ov)))
            FROM (
              SELECT
                 ov.id AS order_variant_id
                ,ov.variant_group_id AS variant_group_id
                ,ov.variant_group_name AS variant_group_name
                ,ov.variant_id AS variant_id
                ,ov.variant_name AS variant_name
                ,ov.is_default AS is_default
                ,ov.serves_how_many AS serves_how_many
                ,ov.price AS price
                ,ov.display_price AS display_price
                ,ov.veg_egg_non AS veg_egg_non
                ,ov.pos_variant_id AS pos_variant_id
                ,ov.pos_variant_item_id AS pos_variant_item_id
                ,ov.pos_variant_group_id AS pos_variant_group_id
              FROM order_variant AS ov
              WHERE ov.order_id = o.id
                AND ov.order_item_id = oi.id
              ) AS ov
            ) AS order_variants
          ,(
            SELECT to_json(array_agg(row_to_json(oa)))
            FROM (
              SELECT
                 oa.id AS order_addon_id
                ,oa.addon_name AS addon_name
                ,oa.addon_id AS addon_id
                ,oa.addon_group_name AS addon_group_name
                ,oa.addon_group_id AS addon_group_id
                ,oa.sequence AS "sequence"
                ,oa.price AS price
                ,oa.display_price AS display_price
                ,oa.veg_egg_non AS veg_egg_non
                ,oa.sgst_rate AS sgst_rate
                ,oa.cgst_rate AS cgst_rate
                ,oa.igst_rate AS igst_rate
                ,oa.gst_inclusive AS gst_inclusive
                ,oa.external_id AS external_id
                ,oa.pos_addon_id AS pos_addon_id
                ,oa.pos_addon_group_id AS pos_addon_group_id
              FROM order_addon AS oa
              WHERE oa.order_id = o.id and
              oa.order_item_id = oi.id
              ) AS oa
            ) AS order_addons
        FROM order_item AS oi
        WHERE oi.order_id = o.id
        ) AS oi
      ) AS order_items
      ,(
        SELECT to_json(r)
        FROM (
          SELECT
            rs.name as restaurant_name,
            rs.image as image,
            rs.lat as latitude,
            rs.long as longitude,
            rs.pos_id as pos_id,
            rs.pos_partner as pos_partner,
            rs.pos_name as pos_name,
			      (SELECT COALESCE(
      			rs.poc_number, ro.manager_contact_number, ro.owner_contact_number
            )as contact_number),
            rs.parent_id,
            rs.parent_or_child,
            rs.like_count as like_count
          FROM restaurant AS rs
          LEFT JOIN restaurant_onboarding ro ON ro.id = o.restaurant_id
          WHERE rs.id = o.restaurant_id
          ) AS r
        ) AS restaurant_details
  FROM "order" AS o
  WHERE
  CASE
    WHEN order_status = 'pending' THEN
    created_at + interval '${hide_pending_orders_duration_in_mins} minutes' > current_timestamp
    ELSE
      TRUE
  END
  ) AS a
  `;
}

async function createAdminOrderDetailsSqlQuery(payment_ids?: string[]) {
  //! BACKWARD_COMPATIBLE order_rating,poc_contact_number
  const vendor_accept_start_duration =
    (await Globals.ORDER_CANCELLATION_DURATION_IN_SECONDS.get()) +
    (await Globals.ORDER_CANCELLATION_DELAY_IN_SECONDS.get());
  const vendor_accept_end_duration =
    (await Globals.ORDER_CANCELLATION_DURATION_IN_SECONDS.get()) +
    (await Globals.ORDER_ACCEPT_DURATION_IN_SECONDS.get());
  return `(
    SELECT o.id AS order_id
    ,o.restaurant_id AS restaurant_id
    ,o.customer_id AS customer_id
    ,o.customer_device_id AS customer_device_id
    ,o.customer_address AS customer_address
    ,o.order_delivered_at AS order_delivered_at
    ,o.delivery_status AS delivery_status
    ,o.delivery_charges AS delivery_charges
    ,o.delivery_tip AS delivery_tip
    ,o.order_status AS order_status
    ,o.order_acceptance_status AS order_acceptance_status
    ,o.total_customer_payable AS total_customer_payable
    ,o.total_tax AS total_tax
    ,o.packing_charges AS packing_charges
    ,o.offer_discount AS offer_discount
    ,o.coupon_id AS coupon_id
    ,o.vote_type AS vote_type
    ,0 AS order_rating
    ,o.any_special_request AS any_special_request
    ,o.cancelled_by AS cancelled_by
    ,o.cancellation_user_id AS cancellation_user_id
    ,o.cancellation_details AS cancellation_details
    ,o.cancellation_time AS cancellation_time
    ,o.vendor_ready_marked_time AS vendor_ready_marked_time
    ,o.created_at AS created_at
    ,o.updated_at AS updated_at
    ,o.delivery_order_id AS delivery_order_id
    ,o.pickup_eta AS pickup_eta
    ,o.drop_eta AS drop_eta
    ,o.vendor_accepted_time AS vendor_accepted_time
    ,o.delivery_details AS delivery_details
    ,o.delivery_service AS delivery_service
    ,o.preparation_time AS preparation_time
    ,o.order_placed_time as order_placed_time
    ,o.order_placed_time + ${vendor_accept_start_duration} * interval '1 second' as vendor_accepted_start_time
    ,o.order_placed_time + ${vendor_accept_end_duration} * interval '1 second' as vendor_accepted_end_time
    ,o.order_pickedup_time as order_pickedup_time
    ,o.vendor_payout_amount
    ,o.invoice_breakout as invoice_breakout
    ,o.comments as comments
    ,o.reviewed_at as reviewed_at
    ,o.refund_status as refund_status
    ,o.additional_details as additional_details
    ,o.payout_transaction_id as payout_transaction_id
    ,o.pos_id as pos_id
    ,o.pos_partner as pos_partner
    ,o.created_at as order_created_at
    ,(
      SELECT row_to_json(c)
      FROM (
        SELECT
        c.id as id,
        c.code as code,
        c.header as header,
        c.description as description,
        c.terms_and_conditions as terms_and_conditions,
        c.type as type,
        c.discount_percentage as discount_percentage,
        c.discount_amount_rupees as discount_amount_rupees,
        c.start_time as start_time,
        c.end_time as end_time,
        c.level as level,
        c.max_use_count as max_use_count,
        c.coupon_use_interval_minutes as coupon_use_interval_minutes,
        c.min_order_value_rupees as min_order_value_rupees,
        c.max_discount_rupees as max_discount_rupees,
        c.discount_share_percent as discount_share_percent,
        c.discount_sponsered_by as discount_sponsered_by,
        c.created_by as created_by,
        c.created_by_user_id as created_by_user_id,
        c.is_deleted as is_deleted,
        c.created_at as created_at,
        c.updated_at as updated_at
        FROM coupon AS c
        WHERE c.id = o.coupon_id
        ) AS c
      ) AS coupon_details
    ,(
      SELECT to_json(array_agg(row_to_json(pd)))
      FROM (
        SELECT py.id AS payment_id
          ,py.order_id AS order_id
          ,py.order_id AS payment_order_id
          ,py.customer_id AS customer_id
          ,py.transaction_id AS transaction_id
          ,py.transaction_token AS transaction_token
          ,py.session_id AS session_id
          ,py.payment_status AS payment_status
          ,py.payment_method AS payment_method
          ,py.payment_gateway AS payment_gateway
          ,py.additional_details AS additional_details
          ,py.amount_paid_by_customer AS amount_paid_by_customer
          ,py.transaction_time AS transaction_time
          ,py.created_at AS created_at
          ,py.updated_at AS updated_at
          ,py.is_pod
      FROM payment AS py
        WHERE py.order_id = o.id
        ${payment_ids ? `AND py.id IN ('${payment_ids.join("','")}')` : ''}
        ORDER BY created_at desc
        ) AS pd
      ) AS payment_details
    ,(
      SELECT to_json(array_agg(row_to_json(oi)))
      FROM (
        SELECT oi.id AS order_item_id
          ,oi.sequence as sequence
          ,oi.menu_item_id as menu_item_id
          ,oi.order_id AS order_id
          ,oi.quantity AS quantity
          ,oi.restaurant_id AS restaurant_id
          ,oi.NAME AS "name"
          ,oi.description AS description
          ,oi.sub_category_id AS sub_category_id
          ,oi.price AS price
          ,oi.veg_egg_non AS veg_egg_non
          ,oi.packing_charges AS packing_charges
          ,oi.is_spicy AS is_spicy
          ,oi.serves_how_many AS serves_how_many
          ,oi.service_charges AS service_charges
          ,oi.item_sgst_utgst AS item_sgst_utgst
          ,oi.item_cgst AS item_cgst
          ,oi.item_igst AS item_igst
          ,oi.item_inclusive AS item_inclusive
          ,oi.external_id AS external_id
          ,oi.allow_long_distance AS allow_long_distance
          ,oi.IMAGE AS IMAGE
          ,oi.pos_id AS pos_id
          ,(
            SELECT to_json(array_agg(row_to_json(ov)))
            FROM (
              SELECT
                 ov.id AS order_variant_id
                ,ov.variant_group_id AS variant_group_id
                ,ov.variant_group_name AS variant_group_name
                ,ov.variant_id AS variant_id
                ,ov.variant_name AS variant_name
                ,ov.is_default AS is_default
                ,ov.serves_how_many AS serves_how_many
                ,ov.price AS price
                ,ov.veg_egg_non AS veg_egg_non
                ,ov.created_at AS created_at
                ,ov.updated_at AS updated_at
                ,ov.pos_variant_id AS pos_variant_id
                ,ov.pos_variant_item_id AS pos_variant_item_id
                ,ov.pos_variant_group_id AS pos_variant_group_id
              FROM order_variant AS ov
              WHERE ov.order_id = o.id
                AND ov.order_item_id = oi.id
              ) AS ov
            ) AS order_variants
          ,(
            SELECT to_json(array_agg(row_to_json(oa)))
            FROM (
              SELECT
                 oa.id AS order_addon_id
                ,oa.addon_name AS addon_name
                ,oa.addon_id AS addon_id
                ,oa.addon_group_name AS addon_group_name
                ,oa.addon_group_id AS addon_group_id
                ,oa.sequence AS "sequence"
                ,oa.price AS price
                ,oa.veg_egg_non AS veg_egg_non
                ,oa.sgst_rate AS sgst_rate
                ,oa.cgst_rate AS cgst_rate
                ,oa.igst_rate AS igst_rate
                ,oa.gst_inclusive AS gst_inclusive
                ,oa.external_id AS external_id
                ,oa.created_at AS created_at
                ,oa.updated_at AS updated_at
                ,oa.pos_addon_id AS pos_addon_id
                ,oa.pos_addon_group_id AS pos_addon_group_id
              FROM order_addon AS oa
              WHERE oa.order_id = o.id
              and oa.order_item_id = oi.id
              ) AS oa
            ) AS order_addons
        FROM order_item AS oi
        WHERE oi.order_id = o.id
        ) AS oi
      ) AS order_items
      ,(
        SELECT to_json(r)
        FROM (
          SELECT
            rs.name as restaurant_name,
            rs.branch_name as branch_name,
            rs.image as image,
            rs.lat as latitude,
            rs.long as longitude,
            rs.pos_id as pos_id,
            rs.pos_partner as pos_partner,
            rs.pos_name as pos_name,
            rs.default_preparation_time,
            rs.poc_number as poc_contact_number,
            rs.poc_number as poc_number,
            ro.manager_contact_number,
            ro.owner_contact_number,
            ro.location,
            rs.parent_id,
            rs.parent_or_child,
            rs.like_count as like_count
          FROM restaurant AS rs
          LEFT OUTER JOIN restaurant_onboarding as ro on ro.id = rs.id
          WHERE rs.id = o.restaurant_id
          ) AS r
        ) AS restaurant_details
  FROM "order" AS o
  ) AS a
  `;
}

async function createVendorOrderDetailsSqlQuery() {
  //! BACKWARD_COMPATIBLE order_rating
  const vendor_accept_start_duration =
    (await Globals.ORDER_CANCELLATION_DURATION_IN_SECONDS.get()) +
    (await Globals.ORDER_CANCELLATION_DELAY_IN_SECONDS.get());
  const vendor_accept_end_duration =
    (await Globals.ORDER_CANCELLATION_DURATION_IN_SECONDS.get()) +
    (await Globals.ORDER_ACCEPT_DURATION_IN_SECONDS.get());
  return `(
    SELECT o.id AS order_id
    ,o.restaurant_id AS restaurant_id
    ,o.customer_id AS customer_id
    ,o.customer_device_id AS customer_device_id
    ,o.customer_address AS customer_address
    ,o.order_delivered_at AS order_delivered_at
    ,o.delivery_status AS delivery_status
    ,o.delivery_charges AS delivery_charges
    ,o.delivery_tip AS delivery_tip
    ,o.order_status AS order_status
    ,o.order_acceptance_status AS order_acceptance_status
    ,o.total_customer_payable AS total_customer_payable
    ,o.total_tax AS total_tax
    ,o.packing_charges AS packing_charges
    ,o.offer_discount AS offer_discount
    ,o.coupon_id AS coupon_id
    ,o.vote_type AS vote_type
    ,0 AS order_rating
    ,o.any_special_request AS any_special_request
    ,o.cancelled_by AS cancelled_by
    ,o.cancellation_details AS cancellation_details
    ,o.cancellation_time AS cancellation_time
    ,o.vendor_ready_marked_time AS vendor_ready_marked_time
    ,o.created_at AS created_at
    ,o.updated_at AS updated_at
    ,o.delivery_order_id AS delivery_order_id
    ,o.pickup_eta AS pickup_eta
    ,o.drop_eta AS drop_eta
    ,o.preparation_time AS preparation_time
    ,o.invoice_breakout as invoice_breakout
    ,py.payment_status AS payment_status
    ,py.is_pod AS is_pod
    ,py.id AS payment_id
    ,py.transaction_time AS transaction_time
    ,o.vendor_accepted_time AS vendor_accepted_time
    ,o.delivery_details AS delivery_details
    ,o.order_placed_time as order_placed_time
    ,o.order_placed_time + ${vendor_accept_start_duration} * interval '1 second' as vendor_accepted_start_time
    ,o.order_placed_time + ${vendor_accept_end_duration} * interval '1 second' as vendor_accepted_end_time
    ,o.order_pickedup_time as order_pickedup_time
    ,o.comments as comments
    ,o.reviewed_at as reviewed_at
    ,o.additional_details as additional_details
    ,o.delivery_service as delivery_service
    ,o.pos_id as pos_id
    ,o.pos_partner as pos_partner
    ,(
      SELECT count(oc.id)
      FROM "order" AS oc
      where
        oc.customer_id = o.customer_id
        and oc.restaurant_id = o.restaurant_id
        and oc.created_at <= o.created_at
        and oc.order_status in ('placed','cancelled','completed')
    ) AS customer_order_count
    ,(
      SELECT to_json(array_agg(row_to_json(oi)))
      FROM (
        SELECT oi.id AS order_item_id
          ,oi.menu_item_id as menu_item_id
          ,oi.order_id AS order_id
          ,oi.quantity AS quantity
          ,oi.restaurant_id AS restaurant_id
          ,oi.NAME AS "name"
          ,oi.description AS description
          ,oi.sub_category_id AS sub_category_id
          ,oi.price AS price
          ,oi.veg_egg_non AS veg_egg_non
          ,oi.packing_charges AS packing_charges
          ,oi.is_spicy AS is_spicy
          ,oi.serves_how_many AS serves_how_many
          ,oi.service_charges AS service_charges
          ,oi.item_sgst_utgst AS item_sgst_utgst
          ,oi.item_cgst AS item_cgst
          ,oi.item_igst AS item_igst
          ,oi.item_inclusive AS item_inclusive
          ,oi.external_id AS external_id
          ,oi.allow_long_distance AS allow_long_distance
          ,oi.IMAGE AS IMAGE
          ,oi.pos_id AS pos_id
          ,(
            SELECT to_json(array_agg(row_to_json(ov)))
            FROM (
              SELECT
                 ov.id AS order_variant_id
                ,ov.order_id AS order_id
                ,ov.order_item_id AS order_item_id
                ,ov.variant_group_id AS variant_group_id
                ,ov.variant_group_name AS variant_group_name
                ,ov.variant_id AS variant_id
                ,ov.variant_name AS variant_name
                ,ov.is_default AS is_default
                ,ov.serves_how_many AS serves_how_many
                ,ov.price AS price
                ,ov.veg_egg_non AS veg_egg_non
                ,ov.created_at AS created_at
                ,ov.updated_at AS updated_at
                ,ov.pos_variant_id AS pos_variant_id
                ,ov.pos_variant_item_id AS pos_variant_item_id
                ,ov.pos_variant_group_id AS pos_variant_group_id
              FROM order_variant AS ov
              WHERE ov.order_id = o.id
                AND ov.order_item_id = oi.id
              ) AS ov
            ) AS order_variants
          ,(
            SELECT to_json(array_agg(row_to_json(oa)))
            FROM (
              SELECT
                 oa.id AS order_addon_id
                ,oa.order_id AS order_id
                ,oa.order_item_id AS order_item_id
                ,oa.addon_name AS addon_name
                ,oa.addon_id AS addon_id
                ,oa.addon_group_name AS addon_group_name
                ,oa.addon_group_id AS addon_group_id
                ,oa.sequence AS "sequence"
                ,oa.price AS price
                ,oa.veg_egg_non AS veg_egg_non
                ,oa.sgst_rate AS sgst_rate
                ,oa.cgst_rate AS cgst_rate
                ,oa.igst_rate AS igst_rate
                ,oa.gst_inclusive AS gst_inclusive
                ,oa.external_id AS external_id
                ,oa.created_at AS created_at
                ,oa.updated_at AS updated_at
                ,oa.pos_addon_id AS pos_addon_id
                ,oa.pos_addon_group_id AS pos_addon_group_id
              FROM order_addon AS oa
              WHERE oa.order_id = o.id
              and oa.order_item_id = oi.id
              ) AS oa
            ) AS order_addons
        FROM order_item AS oi
        WHERE oi.order_id = o.id
        ) AS oi
      ) AS order_items
      ,(
        SELECT to_json(r)
        FROM (
          SELECT
            rs.name as restaurant_name,
            rs.image as image,
            rs.lat as latitude,
            rs.long as longitude,
            rs.pos_id as pos_id,
            rs.pos_partner as pos_partner,
            rs.pos_name as pos_name,
            rs.like_count as like_count,
            rs.parent_id,
            rs.parent_or_child
          FROM restaurant AS rs
          WHERE rs.id = o.restaurant_id
          ) AS r
        ) AS restaurant_details
  FROM "order" AS o
  INNER JOIN payment as py
  on o.id = py.order_id
  ) AS a
  `;
}

export async function readOneViewOrder(
  order_id?: number,
  customer_contact?: string
): Promise<IOrderDetails> {
  logger.debug('reading oneview order search_key::', {
    customer_contact,
    order_id,
  });
  let DBQuery = DB.read
    .select('*')
    .fromRaw(await createAdminOrderDetailsSqlQuery());
  if (order_id) {
    DBQuery = DBQuery.where('order_id', order_id);
  } else {
    DBQuery = DBQuery.whereRaw("customer_address ->> 'phone' like ? ", [
      '%' + customer_contact + '%',
    ]);
  }
  return DBQuery.limit(1)
    .orderBy('order_created_at', 'desc')
    .then((order_details: IOrderDetails[]) => {
      logger.debug('successfully fetched oneview order', order_details.length);
      if (order_details[0])
        logger.debug(
          'successfully fetched oneview order',
          order_details[0].customer_address
        );
      return order_details[0];
    })
    .catch((error: Error) => {
      throw error;
    });
}

export async function readOrdersAsAdmin(
  order_ids: number[]
): Promise<IOrderDetails[]> {
  logger.debug('reading order as admin', order_ids);
  return DB.read
    .select('*')
    .fromRaw(await createAdminOrderDetailsSqlQuery())
    .whereIn('order_id', order_ids)
    .then((order_details: IOrderDetails[]) => {
      logger.debug('successfully fetched order as admin', order_details.length);
      return order_details;
    })
    .catch((error: Error) => {
      throw error;
    });
}
export async function readOrdersAsAdminForUpdate(
  trx: Knex.Transaction,
  order_ids: number[]
): Promise<IOrderDetails[]> {
  logger.debug('reading order as admin for update', order_ids);
  return DB.write
    .select('*')
    .fromRaw(await createAdminOrderDetailsSqlQuery())
    .whereIn('order_id', order_ids)
    .forUpdate()
    .transacting(trx)
    .then((order_details: IOrderDetails[]) => {
      logger.debug(
        'successfully fetched order as admin for updated',
        order_details
      );
      return order_details;
    })
    .catch((error: Error) => {
      throw error;
    });
}

export async function readCustomerOrders(
  order_ids: number[],
  customer_id: string
) {
  logger.debug('reading customer order', {order_ids, customer_id});
  return DB.read
    .select('*')
    .fromRaw(await createCustomerOrderDetailsSqlQuery())
    .whereIn('order_id', order_ids)
    .where('customer_id', customer_id)
    .then((order_details: IOrderDetails[]) => {
      logger.debug('successfully fetched customer orders', order_details);
      return order_details;
    })
    .catch((error: Error) => {
      throw error;
    });
}

export async function readCustomerOrdersForUpdate(
  trx: Knex.Transaction,
  order_ids: number[],
  customer_id: string
) {
  logger.debug('reading customer order for update', {order_ids, customer_id});
  return DB.write
    .select('*')
    .fromRaw(await createCustomerOrderDetailsSqlQuery())
    .whereIn('order_id', order_ids)
    .where('customer_id', customer_id)
    .forUpdate()
    .transacting(trx)
    .then((order_details: IOrderDetails[]) => {
      logger.debug('successfully fetched customer orders', order_details);
      return order_details;
    })
    .catch((error: Error) => {
      throw error;
    });
}

export async function readVendorOrders(
  order_ids: number[],
  restaurant_id: string,
  child_restaurant_ids?: string[]
): Promise<IVendorOrderDetails[]> {
  logger.debug('reading vendor orders', {order_ids, restaurant_id});
  let DBQuery = DB.read
    .select('*')
    .fromRaw(await createVendorOrderDetailsSqlQuery())
    .whereIn('order_id', order_ids)
    .where(qry => {
      qry
        .where('payment_status', PaymentStatus.COMPLETED)
        .orWhere('is_pod', true);
    });
  if (child_restaurant_ids && child_restaurant_ids.length)
    DBQuery = DBQuery.whereIn('restaurant_id', child_restaurant_ids);
  else DBQuery = DBQuery.where('restaurant_id', restaurant_id);

  return DBQuery.then((order_details: IVendorOrderDetails[]) => {
    logger.debug('successfully fetched vendor orders', order_details);
    return order_details;
  }).catch((error: Error) => {
    throw error;
  });
}

export async function readVendorOrdersForUpdate(
  trx: Knex.Transaction,
  order_ids: number[],
  restaurant_id: string,
  child_restaurant_ids?: string[]
): Promise<IVendorOrderDetails[]> {
  logger.debug('reading vendor order for update', {order_ids, restaurant_id});
  let DBQuery = DB.write
    .select('*')
    .fromRaw(await createVendorOrderDetailsSqlQuery())
    .whereIn('order_id', order_ids)

    .where(qry => {
      qry
        .where('payment_status', PaymentStatus.COMPLETED)
        .orWhere('is_pod', true);
    });

  if (child_restaurant_ids && child_restaurant_ids.length)
    DBQuery = DBQuery.whereIn('restaurant_id', child_restaurant_ids);
  else DBQuery = DBQuery.where('restaurant_id', restaurant_id);

  DBQuery = DBQuery.forUpdate().transacting(trx);

  return DBQuery.then((order_details: IVendorOrderDetails[]) => {
    logger.debug('successfully fetched vendor order for update', order_details);
    return order_details;
  }).catch((error: Error) => {
    throw error;
  });
}

export async function readAdminOrdersWithFilter(
  params: IAdminFilterOrders
): Promise<{
  total_records: number;
  total_pages: number;
  records: IOrderDetails[];
}> {
  const {search_text, filter, pagination, sort} = params;
  let DBQuery = DB.read.fromRaw(
    await createAdminOrderDetailsSqlQuery(filter?.payment_id)
  );

  if (filter) {
    if (filter.duration) {
      DBQuery = DBQuery.whereRaw(
        `created_at between to_timestamp(${filter.duration.start_date}) and to_timestamp(${filter.duration.end_date})`
      );
    }

    if (filter.restaurant_id) {
      DBQuery = DBQuery.where('restaurant_id', filter.restaurant_id);
    }

    if (filter.customer_id) {
      DBQuery = DBQuery.whereIn('customer_id', filter.customer_id);
    }

    if (filter.order_status) {
      DBQuery = DBQuery.whereIn('order_status', filter.order_status);
    }

    if (filter.delivery_status) {
      DBQuery = DBQuery.whereIn('delivery_status', filter.delivery_status);
    }

    if (filter.order_acceptance_status) {
      DBQuery = DBQuery.whereIn(
        'order_acceptance_status',
        filter.order_acceptance_status
      );
    }

    if (filter.cancelled_by) {
      DBQuery = DBQuery.whereIn('cancelled_by', filter.cancelled_by);
    }

    if (filter.refund_status) {
      DBQuery = DBQuery.whereIn('refund_status', filter.refund_status);
    }
    if (filter.payout_transaction_id) {
      DBQuery = DBQuery.whereIn(
        'payout_transaction_id',
        filter.payout_transaction_id
      );
    }
    if (filter.payment_id) {
      DBQuery = DBQuery.whereRaw('payment_details IS NOT NULL');
    }
  }

  if (search_text) {
    DBQuery = DBQuery.whereRaw(
      `order_id::character varying(20) LIKE '${search_text
        .split("'")
        .join("''")}%'`
    );
  }

  const total_records = await DBQuery.clone().count('*');

  let page_size;
  let page_index;
  if (pagination) {
    page_size = pagination.page_size;
    page_index = pagination.page_index;
  } else {
    page_size = 10;
    page_index = 0;
  }
  const offset = page_index * page_size;
  DBQuery = DBQuery.offset(offset).limit(page_size);
  const total_pages = Math.ceil(total_records[0].count / page_size);

  if (sort) {
    DBQuery = DBQuery.orderBy(sort);
  } else {
    DBQuery = DBQuery.orderBy(OrderByColumn.CREATED_AT, SortOrder.DESCENDING);
  }

  const records = await DBQuery.clone().select('*');

  logger.debug(
    'read_admin_orders_with_filter_SQL_QUERY',
    DBQuery.toSQL().toNative()
  );

  return {
    total_records: total_records[0].count,
    total_pages,
    records,
  };
}

export async function readCustomerOrdersWithFilter(
  params: ICustomerFilterOrders
): Promise<{
  total_records: number;
  total_pages: number;
  records: IOrderDetails[];
}> {
  logger.debug('request for customer orders with filter', params);
  const {filter, pagination, sort} = params;

  let DBQuery = DB.read.fromRaw(await createCustomerOrderDetailsSqlQuery());

  if (filter) {
    if (filter.duration) {
      DBQuery = DBQuery.whereRaw(
        `created_at between to_timestamp(${filter.duration.start_date}) and to_timestamp(${filter.duration.end_date})`
      );
    }

    if (filter.customer_id) {
      DBQuery = DBQuery.where('customer_id', filter.customer_id);
    }

    if (filter.order_status) {
      DBQuery = DBQuery.whereIn('order_status', filter.order_status);
    }
  }

  const total_records = await DBQuery.clone().count('*');

  let page_size;
  let page_index;
  if (pagination) {
    page_size = pagination.page_size;
    page_index = pagination.page_index;
  } else {
    page_size = 10;
    page_index = 0;
  }
  const offset = page_index * page_size;
  DBQuery = DBQuery.offset(offset).limit(page_size);
  const total_pages = Math.ceil(total_records[0].count / page_size);

  if (sort) {
    DBQuery = DBQuery.orderBy(sort);
  } else {
    DBQuery = DBQuery.orderBy(OrderByColumn.CREATED_AT, SortOrder.DESCENDING);
  }

  const records = await DBQuery.clone().select('*');
  logger.debug(
    'read_customer_orders_with_filter_SQL_QUERY',
    DBQuery.toSQL().toNative()
  );
  logger.debug('response of customer orders with filter', {
    total_records: total_records[0].count,
    total_pages,
    records,
  });
  return {
    total_records: total_records[0].count,
    total_pages,
    records,
  };
}

export async function readVendorOrdersWithFilter(
  params: IVendorFilterOrders
): Promise<{
  total_records: number;
  total_pages: number;
  records: IVendorOrderDetails[];
}> {
  logger.debug('request for read vendor order with filter', params);
  const {search_text, filter, pagination, sort} = params;

  let DBQuery = DB.read.fromRaw(await createVendorOrderDetailsSqlQuery());

  DBQuery = DBQuery.where(qry => {
    qry
      .where('payment_status', PaymentStatus.COMPLETED)
      .orWhere('is_pod', true);
  });
  DBQuery = DBQuery.where(
    DB.read.raw(
      `order_placed_time < CURRENT_TIMESTAMP - interval '${await Globals.ORDER_CANCELLATION_DURATION_IN_SECONDS.get()} second'`
    )
  );
  if (filter) {
    if (filter.duration) {
      DBQuery = DBQuery.whereRaw(
        `created_at between to_timestamp(${filter.duration.start_date}) and to_timestamp(${filter.duration.end_date})`
      );
    }

    if (filter.restaurant_id) {
      DBQuery = DBQuery.where('restaurant_id', filter.restaurant_id);
    }
    if (filter.child_restaurant_ids && filter.child_restaurant_ids.length) {
      DBQuery = DBQuery.whereIn('restaurant_id', filter.child_restaurant_ids);
    }

    if (filter.order_status) {
      DBQuery = DBQuery.whereIn('order_status', filter.order_status);
    }

    if (filter.order_acceptance_status) {
      DBQuery = DBQuery.whereIn(
        'order_acceptance_status',
        filter.order_acceptance_status
      );
    }

    if (filter.delivery_status) {
      DBQuery = DBQuery.whereIn('delivery_status', filter.delivery_status);
    }

    if (filter.cancelled_by) {
      DBQuery = DBQuery.whereIn('cancelled_by', filter.cancelled_by);
    }
  }

  if (search_text) {
    DBQuery = DBQuery.whereRaw(
      `order_id::character varying(20) LIKE '${search_text
        .split("'")
        .join("''")}%'`
    );
  }

  const total_records = await DBQuery.clone().count('*');

  let page_size;
  let page_index;
  if (pagination) {
    page_size = pagination.page_size;
    page_index = pagination.page_index;
  } else {
    page_size = 10;
    page_index = 0;
  }
  const offset = page_index * page_size;
  DBQuery = DBQuery.offset(offset).limit(page_size);
  const total_pages = Math.ceil(total_records[0].count / page_size);

  if (sort) {
    DBQuery = DBQuery.orderBy(sort);
  } else {
    DBQuery = DBQuery.orderBy(OrderByColumn.CREATED_AT, SortOrder.DESCENDING);
  }

  const records: IVendorOrderDetails[] = await DBQuery.clone().select('*');
  // records.map(rec => {
  //   delete rec.invoice_breakout?.description;
  // });
  logger.debug(
    'read_vendor_orders_with_filter_SQL_QUERY',
    DBQuery.toSQL().toNative()
  );
  logger.debug('response of read vendor order with filter', {
    total_records: total_records[0].count,
    total_pages,
    records,
  });
  return {
    total_records: total_records[0].count,
    total_pages,
    records,
  };
}

export async function filterReview(
  restaurant_ids: string[],
  data: IReviewFilter
) {
  let DBQuery = DB.read
    .from(OrderTable.TableName)
    .whereIn('restaurant_id', restaurant_ids);
  if (data.filter && !isEmpty(data.filter.vote_type)) {
    DBQuery = DBQuery.where('vote_type', data.filter.vote_type);
  } else {
    DBQuery = DBQuery.whereIn('vote_type', [1, -1]); //by default get all positive and negative votes
  }

  const total_records: number = (await DBQuery.clone().count('*'))[0].count;
  let total_pages = total_records;

  if (data.pagination) {
    data.pagination.page_size = data.pagination.page_size || 10;
    data.pagination.page_index = data.pagination.page_index || 0;
    const offset = data.pagination.page_index * data.pagination.page_size;
    DBQuery = DBQuery.offset(offset).limit(data.pagination.page_size);
    total_pages = Math.ceil(total_records / data.pagination.page_size);
  }

  if (data.sort) {
    DBQuery = DBQuery.orderBy(data.sort);
  } else {
    DBQuery = DBQuery.orderBy(OrderByColumn.CREATED_AT, SortOrder.DESCENDING);
  }

  const result: {
    id: IOrder['id'];
    vote_type: IOrder['vote_type'];
    customer_address: IOrder['customer_address'];
    comments: IOrder['comments'];
    reviewed_at: IOrder['reviewed_at'];
    order_placed_time: IOrder['order_placed_time'];
  }[] = await DBQuery.clone().select([
    'id',
    'vote_type',
    'customer_address',
    'comments',
    'reviewed_at',
    'order_placed_time',
  ]);

  const reviews: {
    id: IOrder['id'];
    customer_name: string;
    vote_type: IOrder['vote_type'];
    order_rating: IOrder['order_rating']; //! BACKWARD_COMPATIBLE
    comments: IOrder['comments'];
    reviewed_at: IOrder['reviewed_at'];
    order_placed_time: IOrder['order_placed_time'];
  }[] = [];
  result.forEach(order => {
    reviews.push({
      id: order.id,
      customer_name: order.customer_address!.customer_name!,
      comments: order.comments,
      reviewed_at: order.reviewed_at,
      order_placed_time: order.order_placed_time,
      vote_type: order.vote_type,
      order_rating: 0, //! BACKWARD_COMPATIBLE
    });
  });
  return {
    total_records,
    total_pages,
    records: reviews,
  };
}

export async function getUpcomingPayoutOrders(
  start_timestamp: Date,
  end_timestamp: Date,
  restaurant_id: string
): Promise<IOrderDetails[]> {
  const DBQuery = DB.read
    .select('*')
    .from('order')
    .where('order_placed_time', '<', end_timestamp)
    .where('order_placed_time', '>=', start_timestamp)
    .whereRaw(
      `
    (restaurant_id = '${restaurant_id}' and
    stop_payment = 'false' and
    payout_transaction_id is null)
    and
    (
      (order_status = '${OrderStatus.COMPLETED}') or (order_status = '${OrderStatus.CANCELLED}')
    )
    `
    )
    .orderBy('order_placed_time', 'asc');

  logger.debug(
    'getUpcomingPayoutOrders SQL Query>>>',
    DBQuery.toSQL().toNative()
  );
  return DBQuery.then((orders: IOrderDetails[]) => {
    logger.debug('getUpcomingPayoutOrders DB Result', orders);
    return orders;
  }).catch((error: Error) => {
    throw error;
  });
}

export async function getPayoutOrders(
  payout_id: string
): Promise<IOrderDetails[]> {
  const DBQuery = DB.read.select('*').from('order').where({
    payout_transaction_id: payout_id,
  });

  logger.debug('getPayoutOrders >>>', DBQuery.toSQL().toNative());
  return DBQuery.then((orders: IOrderDetails[]) => {
    // logger.debug('getPayoutOrders DB Result', orders);
    return orders;
  }).catch((error: Error) => {
    throw error;
  });
}

export function updateOrderPayoutId(
  trx: Knex.Transaction,
  ids: number[],
  payout_id: string
): Promise<IOrder[]> {
  logger.debug('updating order payout', {ids, payout_id});
  const DBQuery = DB.write(OrderTable.TableName)
    .update({
      payout_transaction_id: payout_id,
    })
    .returning('*')
    .whereIn('id', ids)
    .transacting(trx);
  return DBQuery.then((order: IOrder[]) => {
    logger.debug('successfully updated order payout id', order);
    return order;
  }).catch((error: Error) => {
    logger.error(`GOT ERROR WHILE UPDATING DATA IN ORDER TABLE: ${error}`);
    throw error;
  });
}

// Cancellation-Reason
export function createCancellationReason(
  cancellation_reason_details: CancellationReason
): Promise<CancellationReason> {
  logger.debug('Creating Cancellation Reason');
  return DB.write(CancellationReasonTable.TableName)
    .insert(cancellation_reason_details)
    .returning('*')
    .then((cancellation_reason_details: CancellationReason[]) => {
      logger.debug(
        'Successfully Created Cancellation Reason',
        cancellation_reason_details
      );
      return cancellation_reason_details[0];
    })
    .catch((error: Error) => {
      logger.error(
        'Error Recived While Creating Cancellation Reason Details',
        error
      );
      throw error;
    });
}

export function updateCancellationReason(
  cancellation_reason_details: CancellationReason
): Promise<CancellationReason> {
  cancellation_reason_details.updated_at = new Date();
  logger.debug('Updating Cancellation Reason');
  return DB.write(CancellationReasonTable.TableName)
    .update(cancellation_reason_details)
    .returning('*')
    .where({id: cancellation_reason_details.id})
    .then((cancellation_reason_details: CancellationReason[]) => {
      logger.debug(
        'Updated Successfully Cancellation Reason',
        cancellation_reason_details
      );
      return cancellation_reason_details[0];
    })
    .catch((error: Error) => {
      logger.error('Error Recived While Updating Cancellation Reason', error);
      throw error;
    });
}

export function readAllCancellationReason(): Promise<CancellationReason[]> {
  logger.debug('Reading All Cancellation Reason');
  return DB.read(CancellationReasonTable.TableName)
    .where({is_deleted: false})
    .select([
      CancellationReasonTable.ColumnNames.id,
      CancellationReasonTable.ColumnNames.user_type,
      CancellationReasonTable.ColumnNames.cancellation_reason,
    ])
    .then((cancellation_reason_details: CancellationReason[]) => {
      logger.debug(
        'Successful Returned Cancellation Reason',
        cancellation_reason_details
      );
      return cancellation_reason_details;
    })
    .catch((error: Error) => {
      logger.error(
        'Error Recived While REading All Cancellation Reason As Admin',
        error
      );
      throw error;
    });
}

export function readCancellationReasonWithUserType(
  user_type: string
): Promise<CancellationReason[]> {
  logger.debug('Reading Cancellation Reason With User Type');
  return DB.read(CancellationReasonTable.TableName)
    .where({is_deleted: false, user_type: user_type})
    .select([
      CancellationReasonTable.ColumnNames.id,
      CancellationReasonTable.ColumnNames.user_type,
      CancellationReasonTable.ColumnNames.cancellation_reason,
    ])
    .then((reason: CancellationReason[]) => {
      logger.debug(
        'Successfully Read Cancellation Reason With User_Type',
        reason
      );
      return reason;
    })
    .catch((error: Error) => {
      logger.error(
        'Error Recived While Reading Cancellation Reason  With User Type',
        error
      );
      throw error;
    });
}

export function readCancellationReasonById(
  id: number
): Promise<CancellationReason> {
  logger.debug('Reading Cancellation Reason By ID');
  return DB.read(CancellationReasonTable.TableName)
    .where({is_deleted: false, id: id})
    .select([
      CancellationReasonTable.ColumnNames.id,
      CancellationReasonTable.ColumnNames.user_type,
      CancellationReasonTable.ColumnNames.cancellation_reason,
    ])
    .then((reason: CancellationReason[]) => {
      logger.debug('Successfully Read Cancellation Reason By ID ', reason[0]);
      return reason[0];
    })
    .catch((error: Error) => {
      logger.error(
        'Error Recived While Reading Cancellation Reason By ID ',
        error
      );
      throw error;
    });
}

export function deleteCancellationReasonById(
  id: number
): Promise<CancellationReason> {
  const reason = <CancellationReason>{
    id: id,
    is_deleted: true,
  };
  logger.debug('Deleting Cancellation Reason By ID');
  return DB.write(CancellationReasonTable.TableName)
    .update(reason)
    .where({is_deleted: false, id: id})
    .returning('*')
    .then((reason: CancellationReason[]) => {
      logger.debug('Successfully deleted Cancellation Reason', reason[0]);
      return reason[0];
    })
    .catch((error: Error) => {
      logger.error(
        'Error Recived While Deleting Cancellation Reason Details',
        error
      );
      throw error;
    });
}
