import Globals from '../../../utilities/global_var/globals';

class Table {
  static readonly TableName = 'restaurant';
  static readonly ColumnNames = {
    id: 'id',
    name: 'name',
    lat: 'lat',
    long: 'long',
    partner_id: 'partner_id',
    status: 'status',
    image: 'image',
    images: 'images',
    orders_count: 'orders_count',
    delivery_time: 'delivery_time',
    city_id: 'city_id',
    area_id: 'area_id',
    cuisine_ids: 'cuisine_ids',
    is_pure_veg: 'is_pure_veg',
    cost_of_two: 'cost_of_two',
    allow_long_distance: 'allow_long_distance',
    packing_charge_type: 'packing_charge_type',
    packing_charge_item: 'packing_charge_item',
    packing_charge_order: 'packing_charge_order',
    custom_packing_charge_item: 'custom_packing_charge_item',
    default_preparation_time: 'default_preparation_time',
    poc_number: 'poc_number',
    hold_payout: 'hold_payout',
    created_at: 'created_at',
    updated_at: 'updated_at',
    is_deleted: 'is_deleted',
    subscription_remaining_orders: 'subscription_remaining_orders',
    subscription_grace_period_remaining_orders:
      'subscription_grace_period_remaining_orders',
    subscription_end_time: 'subscription_end_time',
    subscription_id: 'subscription_id',
    pos_id: 'pos_id',
    pos_partner: 'pos_partner',
    packing_charge_fixed_percent: 'packing_charge_fixed_percent',
    taxes_applicable_on_packing: 'tax_applicable_on_packing',
    packing_sgst_utgst: 'packing_sgst_utgst',
    packing_cgst: 'packing_cgst',
    packing_igst: 'packing_igst',
    like_count: 'like_count',
    dislike_count: 'dislike_count',
    delivery_charge_paid_by: 'delivery_charge_paid_by',
    pos_name: 'pos_name',
    branch_name: 'branch_name',
    speedyy_account_manager_id: 'speedyy_account_manager_id',
    parent_id: 'parent_id',
    parent_or_child: 'parent_or_child',
    discount_rate: 'discount_rate',
    discount_updated_at: 'discount_updated_at',
    discount_updated_user_id: 'discount_updated_user_id',
    discount_updated_user_type: 'discount_updated_user_type',
  };
  static readonly StatusNames = {
    draft: 'draft',
    approvalPending: 'approvalPending',
    approvalRejected: 'approvalRejected',
    catalogPending: 'catalogPending',
    geohashPending: 'geohashPending',
    geohashFailed: 'geohashFailed',
    active: 'active',
    disable: 'disable',
  };
}
export class Onboarding_Table {
  static readonly TableName = 'restaurant_onboarding';
  static readonly ColumnNames = {
    id: 'id',
    draft_section: 'draft_section',
    preferred_language_ids: 'preferred_language_ids',
    tnc_accepted: 'tnc_accepted',
    user_profile: 'user_profile',
    owner_name: 'owner_name',
    owner_contact_number: 'owner_contact_number',
    owner_contact_number_verified: 'owner_contact_number_verified',
    owner_email: 'owner_email',
    owner_email_verified: 'owner_email_verified',
    owner_is_manager: 'owner_is_manager',
    manager_name: 'manager_name',
    manager_contact_number: 'manager_contact_number',
    manager_email: 'manager_email',
    invoice_email: 'invoice_email',
    location: 'location',
    postal_code: 'postal_code',
    postal_code_verified: 'postal_code_verified',
    state: 'state',
    read_mou: 'read_mou',
    document_sign_number: 'document_sign_number',
    document_sign_number_verified: 'document_sign_number_verified',
    menu_document_type: 'menu_document_type',
    menu_documents: 'menu_documents',
    scheduling_type: 'scheduling_type',
    approved_by: 'approved_by',
    status_comments: 'status_comments',
    catalog_approved_by: 'catalog_approved_by',
  };
}
export class FSSAI_Table {
  static readonly TableName = 'restaurant_fssai';
  static readonly ColumnNames = {
    id: 'id',
    fssai_has_certificate: 'fssai_has_certificate',

    fssai_application_date: 'fssai_application_date',
    fssai_ack_number: 'fssai_ack_number',
    fssai_ack_document_type: 'fssai_ack_document_type',
    fssai_ack_document: 'fssai_ack_document',

    fssai_expiry_date: 'fssai_expiry_date',
    fssai_cert_number: 'fssai_cert_number',
    fssai_cert_verified: 'fssai_cert_verified',
    fssai_cert_document_type: 'fssai_cert_document_type',
    fssai_cert_document: 'fssai_cert_document',

    fssai_firm_name: 'fssai_firm_name',
    fssai_firm_address: 'fssai_firm_address',
  };
}
export class GST_Bank_Table {
  static readonly TableName = 'restaurant_gst_bank';
  static readonly ColumnNames = {
    id: 'id',
    gst_category: 'gst_category',
    pan_number: 'pan_number',
    pan_number_verified: 'pan_number_verified',
    pan_owner_name: 'pan_owner_name',
    pan_document_type: 'pan_document_type',
    pan_document: 'pan_document',
    has_gstin: 'has_gstin',
    gstin_number: 'gstin_number',
    gstin_number_verified: 'gstin_number_verified',
    gstin_document_type: 'gstin_document_type',
    gstin_document: 'gstin_document',
    business_name: 'business_name',
    business_address: 'business_address',
    bank_account_number: 'bank_account_number',
    ifsc_code: 'ifsc_code',
    ifsc_verified: 'ifsc_verified',
    bank_document_type: 'bank_document_type',
    kyc_document_type: 'kyc_document_type',
    bank_document: 'bank_document',
    kyc_document: 'kyc_document',
  };
}
export class Slot {
  static readonly TableName = 'slot';
  static readonly ColumnNames = {
    id: 'id',
    restaurant_id: 'restaurant_id',
    slot_name: 'slot_name',
    start_time: 'start_time',
    end_time: 'end_time',
    created: 'created',
    status: 'status',
  };
}
export class Campaign {
  static readonly TableName = 'campaign';
  static readonly ColumnNames = {
    id: 'id',
    campaign_header: 'campaign_header',
    description: 'description',
    start_date: 'start_date',
    end_date: 'end_date',
    type: 'type',
    level: 'level',
    category_id: 'category_id',
    min_order_value: 'min_order_value',
    max_discount: 'max_discount',
    created_by_user_type: 'created_by_user_type',
    created_by: 'created_by',
    is_deleted: 'is_deleted',
    status: 'status',
  };
}
export class CouponVendor {
  static readonly TableName = 'coupon_vendor';
  static readonly ColumnNames = {
    id: 'id',
    coupon_code: 'coupon_code',
    campaign_id: 'campaign_id',
    created_by: 'created_by',
    start_date: 'start_date',
    end_date: 'end_date',
    is_deleted: 'is_deleted',
    restaurant_id: 'restaurant_id',
  };
}
export class HolidaySlot {
  static readonly TableName = 'holiday_slot';
  static readonly ColumnNames = {
    restaurant_id: 'restaurant_id',
    open_after: 'open_after',
    created_by: 'created_by',
    is_deleted: 'is_deleted',
  };
}
export type StatusType =
  | 'draft'
  | 'approvalPending'
  | 'approvalRejected'
  | 'catalogPending'
  | 'geohashPending'
  | 'geohashFailed'
  | 'active';
export default Table;

export const all_scheduling_type_slot_names = ['all'];
export const weekdays_and_weekends_scheduling_type_slot_names = [
  'weekdays',
  'weekends',
];
export const custom_scheduling_type_slot_names = [
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
  'sun',
];

export async function restaurantListingSqlQuery() {
  return `(
    SELECT
    r.id,
    r.name,
    r.branch_name,
    r.lat,
    r.long,
    r.partner_id,
    r.status,
    r.image,
    r.images,
    r.orders_count,
    r.like_count,
    r.delivery_time,
    r.city_id,
    r.area_id,
    r.cuisine_ids,
    r.is_pure_veg,
    r.cost_of_two,
    r.allow_long_distance,
    r.packing_charge_type,
    r.packing_charge_item,
    r.packing_charge_order,
    r.default_preparation_time,
    r.hold_payout,
    r.created_at,
    r.updated_at,
    r.is_deleted,
    r.discount_rate,
    r.delivery_charge_paid_by,
    (
      SELECT
        TO_JSON(
          ARRAY_AGG(
            ROW_TO_JSON(C)
          )
        )
      FROM
        (
          SELECT
            C.ID,
            C.CODE,
            C.HEADER,
            C.DESCRIPTION,
            C.TERMS_AND_CONDITIONS,
            C.TYPE,
            C.DISCOUNT_PERCENTAGE,
            C.DISCOUNT_AMOUNT_RUPEES,
            C.START_TIME,
            C.END_TIME,
            C.LEVEL,
            C.MAX_USE_COUNT,
            C.COUPON_USE_INTERVAL_MINUTES,
            C.MIN_ORDER_VALUE_RUPEES,
            C.MAX_DISCOUNT_RUPEES,
            C.DISCOUNT_SHARE_PERCENT,
            C.DISCOUNT_SPONSERED_BY,
            C.CREATED_BY,
            C.CREATED_BY_USER_ID,
            C.IS_DELETED,
            C.CREATED_AT,
            C.UPDATED_AT,
            CV.SEQUENCE
          FROM
            COUPON_VENDOR AS CV
            RIGHT JOIN COUPON AS C ON CV.COUPON_ID = C.ID
          WHERE
            C.IS_DELETED = FALSE
            AND C.START_TIME <= CURRENT_TIMESTAMP
            AND C.END_TIME > CURRENT_TIMESTAMP
            AND (
              C.LEVEL = 'global'
              OR (
                C.LEVEL = 'restaurant'
                AND CV.restaurant_id = r.id
                AND CV.IS_DELETED = FALSE
                AND CV.START_TIME <= CURRENT_TIMESTAMP
                AND CV.END_TIME > CURRENT_TIMESTAMP
              )
            )
            ORDER BY CV.SEQUENCE
        ) AS C
    ) AS COUPONS
    FROM restaurant AS r
    where (
      subscription_id is not null
      and subscription_end_time is not null
      and subscription_remaining_orders is not null
      and subscription_grace_period_remaining_orders is not null
    )
    and (
      (
        subscription_end_time > CURRENT_TIMESTAMP
        and subscription_remaining_orders > 0
      )
      or (
        subscription_end_time < CURRENT_TIMESTAMP
        and subscription_end_time + interval '${await Globals.SUBSCRIPTION_END_TIME_GRACE_PERIOD_IN_DAYS.get()}' day > CURRENT_TIMESTAMP
        and subscription_grace_period_remaining_orders > 0
      )
     )
    ) AS a`;
}

export function restaurantListingAsAdminSqlQuery() {
  //! BACKWARD COMPATIBLE poc_contact_number
  return `(
    SELECT
    r.id as id,
    r.status as status,
    r.area_id as area_id,
    r.city_id as city_id,
    r.is_pure_veg as is_pure_veg,
    r.allow_long_distance as allow_long_distance,
    r.hold_payout as hold_payout,
    r.name as name,
    r.branch_name as branch_name,
    r.image as image,
    r.images as images,
    r.partner_id as partner_id,
    r.custom_packing_charge_item,
    r.lat as lat,
    r.long as long,
    r.created_at as created_at,
    r.updated_at as updated_at,
    r.is_deleted as is_deleted,
    r.orders_count as orders_count,
    r.like_count as like_count,
    r.delivery_time as delivery_time,
    r.packing_charge_type as packing_charge_type,
    r.packing_charge_item as packing_charge_item,
    r.packing_charge_order as packing_charge_order,
    r.cuisine_ids as cuisine_ids,
    r.cost_of_two as cost_of_two,
    r.poc_number as poc_contact_number,
    r.poc_number as poc_number,
    r.default_preparation_time as default_preparation_time,
    r.subscription_remaining_orders as subscription_remaining_orders,
    r.subscription_grace_period_remaining_orders as subscription_grace_period_remaining_orders,
    r.subscription_end_time as subscription_end_time,
    r.subscription_id as subscription_id,
    r.pos_id as pos_id,
    r.pos_partner as pos_partner,
    r.pos_name as pos_name,
    r.speedyy_account_manager_id as speedyy_account_manager_id,
    (
      SELECT
        TO_JSON(
          ARRAY_AGG(
            ROW_TO_JSON(C)
          )
        )
      FROM
        (
          SELECT
            C.ID,
            C.CODE,
            C.HEADER,
            C.DESCRIPTION,
            C.TERMS_AND_CONDITIONS,
            C.TYPE,
            C.DISCOUNT_PERCENTAGE,
            C.DISCOUNT_AMOUNT_RUPEES,
            C.START_TIME,
            C.END_TIME,
            C.LEVEL,
            C.MAX_USE_COUNT,
            C.COUPON_USE_INTERVAL_MINUTES,
            C.MIN_ORDER_VALUE_RUPEES,
            C.MAX_DISCOUNT_RUPEES,
            C.DISCOUNT_SHARE_PERCENT,
            C.DISCOUNT_SPONSERED_BY,
            C.CREATED_BY,
            C.CREATED_BY_USER_ID,
            C.IS_DELETED,
            C.CREATED_AT,
            C.UPDATED_AT,
            CV.SEQUENCE
          FROM
            COUPON_VENDOR AS CV
            RIGHT JOIN COUPON AS C ON CV.COUPON_ID = C.ID
          WHERE
            C.IS_DELETED = FALSE
            AND C.START_TIME <= CURRENT_TIMESTAMP
            AND C.END_TIME > CURRENT_TIMESTAMP
            AND (
              C.LEVEL = 'global'
              OR (
                C.LEVEL = 'restaurant'
                AND CV.restaurant_id = r.id
                AND CV.IS_DELETED = FALSE
                AND CV.START_TIME <= CURRENT_TIMESTAMP
                AND CV.END_TIME > CURRENT_TIMESTAMP
              )
            )
            ORDER BY CV.SEQUENCE
        ) AS C
    ) AS COUPONS,

    city.name as city_name,
    area.name as area_name,

    ob.draft_section as draft_section,
    ob.preferred_language_ids as preferred_language_ids,
    ob.tnc_accepted as tnc_accepted,
    ob.user_profile as user_profile,
    ob.owner_name as owner_name,
    ob.owner_contact_number as owner_contact_number,
    ob.owner_email as owner_email,
    ob.owner_is_manager as owner_is_manager,
    ob.manager_name as manager_name,
    ob.manager_contact_number as manager_contact_number,
    ob.manager_email as manager_email,
    ob.invoice_email as invoice_email,
    ob.location as location,
    ob.postal_code as postal_code,
    ob.postal_code_verified as postal_code_verified,
    ob.state as state,
    ob.read_mou as read_mou,
    ob.document_sign_number as document_sign_number,
    ob.document_sign_number_verified as document_sign_number_verified,
    ob.menu_document_type as menu_document_type,
    ob.scheduling_type as scheduling_type,
    ob.approved_by as approved_by,
    ob.catalog_approved_by as catalog_approved_by,
    ob.status_comments as status_comments,
    ob.menu_documents as menu_documents,

    (
      SELECT to_json(array_agg(row_to_json(ts)))
      FROM (
        SELECT
        slot_name,
        restaurant_id,
        start_time,
        end_time
        FROM slot AS ts
        WHERE ts.restaurant_id = r.id
        ) AS ts
      ) AS time_slot

    FROM restaurant AS r
    LEFT JOIN restaurant_onboarding AS ob on ob.id = r.id
    LEFT JOIN city_master AS city on city.id = r.city_id
    LEFT JOIN polygon_master AS area on area.id = r.area_id
    ) AS a`;
}

export function restaurantCouponsSqlQuery() {
  //! BACKWARD COMPATIBLE poc_contact_number
  return `SELECT
    C.ID,
    C.CODE,
    C.HEADER,
    C.DESCRIPTION,
    C.TERMS_AND_CONDITIONS,
    C.TYPE,
    C.DISCOUNT_PERCENTAGE,
    C.DISCOUNT_AMOUNT_RUPEES,
    C.START_TIME,
    C.END_TIME,
    C.LEVEL,
    C.MAX_USE_COUNT,
    C.COUPON_USE_INTERVAL_MINUTES,
    C.MIN_ORDER_VALUE_RUPEES,
    C.MAX_DISCOUNT_RUPEES,
    C.DISCOUNT_SHARE_PERCENT,
    C.DISCOUNT_SPONSERED_BY,
    C.CREATED_BY,
    C.CREATED_BY_USER_ID,
    C.IS_DELETED,
    C.CREATED_AT,
    C.UPDATED_AT,
    CV.SEQUENCE
    FROM
    COUPON_VENDOR AS CV
    RIGHT JOIN COUPON AS C ON CV.COUPON_ID = C.ID
    WHERE
    C.IS_DELETED = FALSE
    AND C.START_TIME <= CURRENT_TIMESTAMP
    AND C.END_TIME > CURRENT_TIMESTAMP
    AND (
      C.LEVEL = 'global'
      OR (
        C.LEVEL = 'restaurant'
        AND CV.restaurant_id = ?
        AND CV.IS_DELETED = FALSE
        AND CV.START_TIME <= CURRENT_TIMESTAMP
        AND CV.END_TIME > CURRENT_TIMESTAMP
      )
    )
    ORDER BY CV.SEQUENCE`;
}
