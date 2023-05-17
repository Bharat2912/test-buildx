import {Knex} from 'knex';

export async function up(knex: Knex): Promise<void> {
  const sql = `
  CREATE SEQUENCE restaurant_id_seq
      INCREMENT BY 1
      MINVALUE 1
      MAXVALUE 9223372036854775807
      START 1000
      CACHE 1
      NO CYCLE;
    CREATE TABLE banner (
        id varchar(255) NOT NULL,
        title varchar(255) NULL,
        image_bucket varchar(255) NULL,
        image_path varchar(255) NULL,
        banner_link varchar(255) NULL,
        link_type varchar(255) NULL,
        "sequence" varchar(255) NULL,
        status varchar(255) NULL DEFAULT 'created'::character varying,
        created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        is_deleted bool NULL DEFAULT false,
        CONSTRAINT banner_pkey PRIMARY KEY (id)
    );

    CREATE TABLE cancellation_reason (
        id bigserial NOT NULL,
        user_type varchar(255) NOT NULL,
        cancellation_reason varchar(255) NOT NULL,
        is_deleted bool NULL DEFAULT false,
        created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT cancellation_reason_pkey PRIMARY KEY (id)
    );

    CREATE TABLE cashfree_beneficiary (
        id varchar(255) NOT NULL,
        bank_account_number varchar(255) NOT NULL,
        ifsc_code varchar(255) NOT NULL,
        beneficiary_details jsonb NULL,
        created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT cashfree_beneficiary_pkey PRIMARY KEY (id)
    );

    CREATE TABLE city_master (
        id varchar(255) NOT NULL,
        "name" varchar(255) NULL,
        status varchar(255) NULL DEFAULT 'active'::character varying,
        created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        is_deleted bool NULL DEFAULT false,
        CONSTRAINT city_master_name_unique UNIQUE (name),
        CONSTRAINT city_master_pkey PRIMARY KEY (id)
    );

    CREATE TABLE coupon (
        id bigserial NOT NULL,
        code varchar(255) NOT NULL,
        "header" varchar(255) NOT NULL,
        description varchar(255) NOT NULL,
        terms_and_conditions varchar(255) NOT NULL,
        "type" varchar(255) NOT NULL,
        discount_percentage numeric(10, 2) NULL,
        discount_amount_rupees numeric(10, 2) NULL,
        start_time timestamptz NOT NULL,
        end_time timestamptz NOT NULL,
        "level" varchar(255) NOT NULL,
        max_use_count int4 NOT NULL,
        coupon_use_interval_minutes int4 NULL,
        min_order_value_rupees numeric(10, 2) NOT NULL,
        max_discount_rupees numeric(10, 2) NULL,
        discount_share_percent numeric(10, 2) NOT NULL,
        discount_sponsered_by varchar(255) NULL,
        created_by varchar(255) NOT NULL,
        created_by_user_id varchar(255) NOT NULL,
        is_deleted bool NOT NULL DEFAULT false,
        created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT coupon_check CHECK ((((discount_percentage IS NOT NULL) AND (discount_amount_rupees IS NULL)) OR ((discount_percentage IS NULL) AND (discount_amount_rupees IS NOT NULL)))),
        CONSTRAINT coupon_check1 CHECK ((start_time <= end_time)),
        CONSTRAINT coupon_check2 CHECK ((((max_use_count = 1) AND (coupon_use_interval_minutes IS NULL)) OR ((max_use_count > 1) AND (coupon_use_interval_minutes > 0)))),
        CONSTRAINT coupon_check3 CHECK (((discount_percentage > (0)::numeric) AND (max_discount_rupees > (0)::numeric))),
        CONSTRAINT coupon_check4 CHECK ((((discount_share_percent = (0)::numeric) AND (discount_sponsered_by IS NULL)) OR ((discount_share_percent > (0)::numeric) AND (discount_sponsered_by IS NOT NULL)))),
        CONSTRAINT coupon_id PRIMARY KEY (id)
    );

    CREATE TABLE cuisine_master (
        id varchar(255) NOT NULL,
        "name" varchar(255) NULL,
        status varchar(255) NULL DEFAULT 'created'::character varying,
        created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        is_deleted bool NULL DEFAULT false,
        CONSTRAINT cuisine_master_name_unique UNIQUE (name),
        CONSTRAINT cuisine_master_pkey PRIMARY KEY (id)
    );

    CREATE TABLE document_master (
        id varchar(255) NOT NULL,
        title varchar(255) NULL,
        doc_file jsonb NULL,
        "data" varchar(255) NULL,
        category varchar(255) NULL,
        doc_type varchar(255) NULL,
        status varchar(255) NULL DEFAULT 'active'::character varying,
        created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        is_deleted bool NULL DEFAULT false,
        CONSTRAINT document_master_pkey PRIMARY KEY (id)
    );

    CREATE TABLE global_var (
        "key" varchar(255) NOT NULL,
        value text NULL,
        "type" varchar(255) NOT NULL,
        editable bool NOT NULL,
        description text NULL,
        updated_by varchar(255) NULL,
        created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        access_roles _text NOT NULL DEFAULT '{admin}'::text[],
        CONSTRAINT global_var_pkey PRIMARY KEY (key)
    );

    CREATE TABLE holiday_slot (
        restaurant_id varchar(255) NOT NULL,
        created_by varchar(255) NOT NULL,
        is_deleted bool NULL DEFAULT false,
        open_after timestamptz NULL
    );

    CREATE TABLE language_master (
        id varchar(255) NOT NULL,
        "name" varchar(255) NULL,
        status varchar(255) NULL DEFAULT 'active'::character varying,
        created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        is_deleted bool NULL DEFAULT false,
        CONSTRAINT language_master_name_unique UNIQUE (name),
        CONSTRAINT language_master_pkey PRIMARY KEY (id)
    );

    CREATE TABLE plan (
        id varchar(255) NOT NULL,
        "name" varchar(255) NOT NULL,
        "type" varchar(255) NOT NULL,
        category varchar(255) NOT NULL,
        amount numeric(10, 2) NOT NULL,
        max_cycles int8 NULL,
        interval_type varchar(255) NOT NULL,
        intervals int8 NULL,
        description varchar(255) NOT NULL,
        no_of_orders int8 NOT NULL,
        no_of_grace_period_orders int8 NOT NULL,
        active bool NOT NULL DEFAULT true,
        terms_and_conditions varchar(255) NOT NULL,
        image jsonb NULL,
        created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT plan_id PRIMARY KEY (id)
    );

    CREATE TABLE refund_master (
        id varchar(255) NOT NULL,
        service varchar(255) NOT NULL,
        payment_id varchar(255) NOT NULL,
        order_id int8 NOT NULL,
        customer_id varchar(255) NOT NULL,
        refund_status varchar(255) NOT NULL,
        status_description varchar(255) NULL,
        refund_gateway varchar(255) NOT NULL,
        refund_charges numeric(10, 2) NOT NULL,
        refund_amount numeric(10, 2) NOT NULL,
        refund_currency varchar(255) NOT NULL,
        refund_note varchar(255) NULL,
        additional_details jsonb NULL,
        processed_at timestamptz NULL,
        created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        is_pod bool NOT NULL DEFAULT false,
        CONSTRAINT refund_master_id PRIMARY KEY (id),
        CONSTRAINT refund_master_service_order_id_key UNIQUE (service, order_id)
    );

    CREATE TABLE service_master (
        id varchar(255) NOT NULL,
        "name" varchar(255) NULL,
        image_bucket varchar(255) NULL,
        image_path varchar(255) NULL,
        "sequence" int4 NULL DEFAULT 0,
        status varchar(255) NULL DEFAULT 'created'::character varying,
        created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        is_deleted bool NULL DEFAULT false,
        CONSTRAINT service_master_name_unique UNIQUE (name),
        CONSTRAINT service_master_pkey PRIMARY KEY (id)
    );

    CREATE TABLE slot (
        id varchar(255) NOT NULL,
        restaurant_id varchar(255) NULL,
        slot_name varchar(255) NULL,
        start_time varchar(255) NULL,
        end_time varchar(255) NULL,
        status varchar(255) NULL DEFAULT 'created'::character varying,
        created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT slot_pkey PRIMARY KEY (id)
    );

    CREATE TABLE coupon_customer (
        id bigserial NOT NULL,
        customer_id varchar(255) NOT NULL,
        coupon_id int8 NOT NULL,
        last_time_used timestamptz NOT NULL,
        coupon_use_count int4 NOT NULL,
        created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT coupon_customer_id PRIMARY KEY (id),
        CONSTRAINT coupon_customer_coupon_id_foreign FOREIGN KEY (coupon_id) REFERENCES coupon(id)
    );

    CREATE TABLE polygon_master (
        id varchar(255) NOT NULL,
        "name" varchar(255) NOT NULL,
        coordinates _jsonb NOT NULL,
        status varchar(255) NULL DEFAULT 'created'::character varying,
        created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        is_deleted bool NULL DEFAULT false,
        city_id varchar(255) NOT NULL,
        CONSTRAINT polygon_master_pkey PRIMARY KEY (id),
        CONSTRAINT polygon_master_city_id_foreign FOREIGN KEY (city_id) REFERENCES city_master(id)
    );

    CREATE TABLE addon (
        id bigserial NOT NULL,
        "name" varchar(255) NOT NULL,
        addon_group_id int8 NOT NULL,
        "sequence" int4 NOT NULL,
        price numeric(9, 2) NOT NULL,
        veg_egg_non varchar(255) NOT NULL,
        in_stock bool NOT NULL DEFAULT false,
        sgst_rate numeric(9, 4) NOT NULL,
        cgst_rate numeric(9, 4) NOT NULL,
        igst_rate numeric(9, 4) NOT NULL,
        gst_inclusive bool NOT NULL DEFAULT false,
        external_id varchar(255) NULL,
        status varchar(255) NOT NULL DEFAULT 'active'::character varying,
        created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        is_deleted bool NOT NULL DEFAULT false,
        CONSTRAINT addon_pkey PRIMARY KEY (id)
    );
    CREATE INDEX addon_addon_group_id_index ON addon USING btree (addon_group_id);

    CREATE TABLE addon_group (
        id bigserial NOT NULL,
        "name" varchar(255) NULL,
        restaurant_id varchar(255) NOT NULL,
        created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        is_deleted bool NULL DEFAULT false,
        CONSTRAINT addon_group_pkey PRIMARY KEY (id)
    );
    CREATE INDEX addon_group_restaurant_id_index ON addon_group USING btree (restaurant_id);

    CREATE TABLE approval (
        id bigserial NOT NULL,
        "action" varchar(255) NOT NULL,
        restaurant_id varchar(255) NOT NULL,
        entity_type varchar(255) NOT NULL,
        entity_id int8 NOT NULL,
        previous_entity_details jsonb NULL,
        requested_entity_changes jsonb NOT NULL,
        status varchar(255) NOT NULL,
        status_comments varchar(255) NULL,
        change_requested_by varchar(255) NOT NULL,
        approved_by varchar(255) NULL,
        additional_details jsonb NULL,
        created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT approval_id PRIMARY KEY (id)
    );

    CREATE TABLE coupon_vendor (
        id bigserial NOT NULL,
        coupon_id int8 NOT NULL,
        start_time timestamptz NOT NULL,
        end_time timestamptz NOT NULL,
        restaurant_id varchar(255) NOT NULL,
        mapped_by varchar(255) NOT NULL,
        mapped_by_user_id varchar(255) NOT NULL,
        is_deleted bool NOT NULL DEFAULT false,
        created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT coupon_vendor_check CHECK ((start_time <= end_time)),
        CONSTRAINT coupon_vendor_id PRIMARY KEY (id)
    );

    CREATE TABLE item_addon (
        menu_item_id int8 NOT NULL,
        addon_id int8 NOT NULL,
        CONSTRAINT menu_item_id_addon_id_unique UNIQUE (menu_item_id, addon_id)
    );
    CREATE INDEX item_addon_addon_id_index ON item_addon USING btree (addon_id);
    CREATE INDEX item_addon_menu_item_id_index ON item_addon USING btree (menu_item_id);

    CREATE TABLE item_addon_group (
        menu_item_id int8 NOT NULL,
        addon_group_id int8 NOT NULL,
        max_limit int4 NOT NULL,
        min_limit int4 NOT NULL,
        free_limit int4 NOT NULL,
        "sequence" int4 NOT NULL,
        created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT menu_item_id_addon_group_id_unique UNIQUE (menu_item_id, addon_group_id)
    );
    CREATE INDEX item_addon_group_addon_group_id_index ON item_addon_group USING btree (addon_group_id);
    CREATE INDEX item_addon_group_menu_item_id_index ON item_addon_group USING btree (menu_item_id);

    CREATE TABLE item_variant (
        id bigserial NOT NULL,
        variant_group_id int4 NOT NULL,
        "name" varchar(255) NULL,
        is_default bool NOT NULL DEFAULT false,
        serves_how_many int2 NOT NULL DEFAULT '1'::smallint,
        price numeric(10, 2) NOT NULL DEFAULT '0'::numeric,
        in_stock bool NOT NULL,
        veg_egg_non text NOT NULL,
        created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        is_deleted bool NULL DEFAULT false,
        CONSTRAINT item_variant_pkey PRIMARY KEY (id),
        CONSTRAINT item_variant_veg_egg_non_check CHECK ((veg_egg_non = ANY (ARRAY['veg'::text, 'egg'::text, 'non-veg'::text])))
    );
    CREATE INDEX item_variant_variant_group_id_index ON item_variant USING btree (variant_group_id);

    CREATE TABLE item_variant_group (
        id bigserial NOT NULL,
        menu_item_id int4 NOT NULL,
        "name" varchar(255) NOT NULL,
        created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        is_deleted bool NULL DEFAULT false,
        CONSTRAINT item_variant_group_pkey PRIMARY KEY (id)
    );
    CREATE INDEX item_variant_group_menu_item_id_index ON item_variant_group USING btree (menu_item_id);

    CREATE TABLE main_category (
        id bigserial NOT NULL,
        "name" varchar(255) NOT NULL,
        restaurant_id varchar(255) NOT NULL,
        created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        is_deleted bool NULL DEFAULT false,
        CONSTRAINT main_category_pkey PRIMARY KEY (id)
    );

    CREATE TABLE menu_item (
        id bigserial NOT NULL,
        restaurant_id varchar(255) NOT NULL,
        "name" varchar(255) NOT NULL,
        description text NULL,
        sub_category_id int4 NULL,
        price float4 NOT NULL,
        veg_egg_non text NOT NULL,
        packing_charges float4 NULL,
        is_spicy bool NOT NULL,
        serves_how_many int2 NOT NULL,
        service_charges float4 NOT NULL,
        item_sgst_utgst float4 NOT NULL,
        item_cgst float4 NOT NULL,
        item_igst float4 NOT NULL,
        item_inclusive bool NOT NULL,
        "disable" bool NOT NULL DEFAULT false,
        external_id varchar(255) NULL,
        allow_long_distance bool NOT NULL,
        image jsonb NULL,
        created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        is_deleted bool NULL DEFAULT false,
        next_available_after timestamptz NULL,
        CONSTRAINT menu_item_pkey PRIMARY KEY (id),
        CONSTRAINT menu_item_veg_egg_non_check CHECK ((veg_egg_non = ANY (ARRAY['veg'::text, 'egg'::text, 'non-veg'::text])))
    );
    CREATE INDEX menu_item_sub_category_id_index ON menu_item USING btree (sub_category_id);

    CREATE TABLE menu_item_slot (
        menu_item_id int8 NOT NULL,
        weekday varchar NOT NULL,
        slot_num int2 NOT NULL,
        open_time int4 NOT NULL,
        close_time int4 NOT NULL,
        created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT menu_item_slot_menu_item_id_weekday_slot_num PRIMARY KEY (menu_item_id, weekday, slot_num)
    );
    CREATE INDEX menu_item_slot_menu_item_id_index ON menu_item_slot USING btree (menu_item_id);

    CREATE TABLE "order" (
        id bigserial NOT NULL,
        restaurant_id varchar(255) NOT NULL,
        customer_id varchar(255) NOT NULL,
        customer_device_id varchar(255) NULL,
        customer_address jsonb NOT NULL,
        order_delivered_at timestamptz NULL,
        delivery_status varchar(255) NOT NULL,
        delivery_details jsonb NULL,
        delivery_charges numeric(10, 2) NOT NULL,
        delivery_tip numeric(10, 2) NULL,
        order_status varchar(255) NOT NULL,
        order_acceptance_status varchar(255) NOT NULL,
        total_customer_payable numeric(10, 2) NOT NULL,
        total_tax numeric(10, 2) NOT NULL,
        packing_charges numeric(10, 2) NULL,
        offer_discount numeric(10, 2) NULL,
        coupon_id int8 NULL,
        order_rating numeric NULL,
        any_special_request varchar(255) NULL,
        cancelled_by varchar(255) NULL,
        cancellation_details jsonb NULL,
        cancellation_time timestamptz NULL,
        cancellation_user_id varchar(255) NULL,
        created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        delivery_order_id varchar(255) NULL,
        pickup_eta int2 NULL,
        drop_eta int2 NULL,
        order_placed_time timestamptz NULL,
        vendor_accepted_time timestamptz NULL,
        accepted_vendor_id varchar(255) NULL,
        preparation_time int2 NULL,
        vendor_ready_marked_time timestamptz NULL,
        payout_transaction_id varchar(255) NULL,
        transaction_charges numeric(10, 2) NULL,
        vendor_payout_amount numeric(10, 2) NULL,
        invoice_breakout jsonb NULL,
        stop_payment bool NOT NULL DEFAULT false,
        order_pickedup_time timestamptz NULL,
        "comments" text NULL,
        reviewed_at timestamptz NULL,
        refund_status varchar(255) NULL,
        additional_details jsonb NULL,
        delivery_service varchar(255) NOT NULL,
        CONSTRAINT order_id PRIMARY KEY (id)
    );

    CREATE TABLE order_addon (
        order_id int8 NOT NULL,
        order_item_id int8 NOT NULL,
        addon_name varchar(255) NOT NULL,
        addon_id int8 NOT NULL,
        addon_group_name varchar(255) NOT NULL,
        addon_group_id int8 NOT NULL,
        "sequence" int4 NOT NULL,
        price numeric(10, 2) NOT NULL,
        veg_egg_non varchar(255) NOT NULL,
        sgst_rate numeric(10, 4) NOT NULL,
        cgst_rate numeric(10, 4) NOT NULL,
        igst_rate numeric(10, 4) NOT NULL,
        gst_inclusive bool NOT NULL DEFAULT false,
        external_id varchar(255) NULL,
        created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        id bigserial NOT NULL,
        CONSTRAINT order_addon_id PRIMARY KEY (id)
    );

    CREATE TABLE order_item (
        order_id int8 NOT NULL,
        quantity int4 NOT NULL,
        restaurant_id varchar(255) NOT NULL,
        "name" varchar(255) NOT NULL,
        description varchar NULL,
        sub_category_id int4 NULL,
        price numeric(10, 2) NOT NULL,
        veg_egg_non text NOT NULL,
        packing_charges numeric(10, 2) NULL,
        is_spicy bool NOT NULL,
        serves_how_many int2 NOT NULL,
        service_charges numeric(10, 4) NOT NULL,
        item_sgst_utgst numeric(10, 4) NOT NULL,
        item_cgst numeric(10, 4) NOT NULL,
        item_igst numeric(10, 4) NOT NULL,
        item_inclusive bool NOT NULL,
        external_id varchar(255) NULL,
        allow_long_distance bool NOT NULL,
        image jsonb NULL,
        created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        menu_item_id int8 NOT NULL,
        id bigserial NOT NULL,
        CONSTRAINT id PRIMARY KEY (id)
    );

    CREATE TABLE order_variant (
        order_id int8 NOT NULL,
        order_item_id int8 NOT NULL,
        variant_group_id int4 NOT NULL,
        variant_group_name varchar(255) NOT NULL,
        variant_id int8 NOT NULL,
        variant_name varchar(255) NULL,
        is_default bool NOT NULL DEFAULT false,
        serves_how_many int2 NOT NULL DEFAULT 1,
        price numeric(10, 2) NOT NULL DEFAULT 0,
        veg_egg_non text NOT NULL,
        created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        id bigserial NOT NULL,
        CONSTRAINT order_variant_id PRIMARY KEY (id)
    );

    CREATE TABLE payment (
        id varchar(255) NOT NULL,
        order_id int8 NOT NULL,
        customer_id varchar(255) NOT NULL,
        transaction_id varchar(255) NULL,
        transaction_token varchar(255) NOT NULL,
        payment_status varchar(255) NOT NULL,
        payment_method varchar(255) NULL,
        payment_gateway varchar(255) NULL,
        additional_details jsonb NULL,
        amount_paid_by_customer numeric(10, 2) NULL,
        created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        transaction_time timestamptz NULL,
        is_pod bool NOT NULL DEFAULT false,
        CONSTRAINT payment_id PRIMARY KEY (id)
    );

    CREATE TABLE payout (
        id varchar(255) NOT NULL,
        restaurant_id varchar(255) NOT NULL,
        start_time timestamptz NOT NULL,
        end_time timestamptz NOT NULL,
        total_order_amount numeric(10, 2) NOT NULL,
        transaction_charges numeric(10, 2) NOT NULL,
        amount_paid_to_vendor numeric(10, 2) NOT NULL,
        transaction_id varchar(255) NULL,
        transaction_details jsonb NULL,
        status varchar(255) NOT NULL,
        retry bool NOT NULL DEFAULT false,
        completed_marked_admin_id varchar(255) NULL,
        payout_gateway varchar(255) NOT NULL,
        payout_details jsonb NULL,
        payout_completed_time timestamptz NULL,
        is_deleted bool NOT NULL DEFAULT false,
        created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT payout_pkey PRIMARY KEY (id)
    );

    CREATE TABLE payout_account (
        id varchar(255) NOT NULL,
        restaurant_id varchar(255) NOT NULL,
        created_vendor_id varchar(255) NOT NULL,
        bank_account_number varchar(255) NOT NULL,
        "name" varchar(255) NOT NULL,
        bank_name varchar(255) NOT NULL,
        ifsc_code varchar(255) NOT NULL,
        ifsc_verified bool NOT NULL DEFAULT false,
        is_primary bool NOT NULL DEFAULT false,
        status varchar(255) NOT NULL,
        is_deleted bool NOT NULL DEFAULT false,
        beneficiary_details jsonb NULL,
        created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT payout_account_pkey PRIMARY KEY (id)
    );

    CREATE TABLE restaurant (
        id varchar(255) NOT NULL DEFAULT (('RES_'::text || nextval('restaurant_id_seq'::regclass))),
        partner_id varchar(255) NOT NULL,
        "name" varchar(255) NOT NULL,
        lat float4 NULL,
        long float4 NULL,
        status varchar(255) NULL DEFAULT 'draft'::character varying,
        created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        is_deleted bool NULL DEFAULT false,
        orders_count int4 NULL DEFAULT 0,
        rating float4 NULL,
        delivery_time int4 NULL,
        images _jsonb NULL,
        city_id varchar(255) NULL,
        area_id varchar(255) NULL,
        packing_charge_type varchar(255) NULL,
        packing_charge_item _jsonb NULL,
        packing_charge_order jsonb NULL,
        cuisine_ids _varchar NULL,
        is_pure_veg bool NULL DEFAULT false,
        cost_of_two float4 NULL,
        allow_long_distance bool NULL DEFAULT false,
        poc_contact_number varchar(25) NULL,
        hold_payout bool NOT NULL DEFAULT false,
        default_preparation_time int8 NOT NULL DEFAULT 10,
        all_time_rating_order_count int8 NULL DEFAULT 0,
        subscription_remaining_orders int8 NULL,
        subscription_grace_period_remaining_orders int8 NULL,
        subscription_end_time timestamptz NULL,
        subscription_id varchar(255) NULL,
        image jsonb NULL,
        custom_packing_charge_item bool NOT NULL DEFAULT false,
        CONSTRAINT restaurant_pkey PRIMARY KEY (id)
    );
    ALTER SEQUENCE restaurant_id_seq OWNED BY restaurant.id;

    CREATE TABLE restaurant_fssai (
        id varchar(255) NOT NULL,
        fssai_has_certificate bool NULL DEFAULT false,
        fssai_application_date date NULL,
        fssai_ack_number varchar(255) NULL,
        fssai_ack_document_type varchar(255) NULL,
        fssai_ack_document jsonb NULL,
        fssai_expiry_date date NULL,
        fssai_cert_number varchar(255) NULL,
        fssai_cert_verified bool NULL DEFAULT false,
        fssai_cert_document_type varchar(255) NULL,
        fssai_cert_document jsonb NULL,
        fssai_firm_name varchar(255) NULL,
        fssai_firm_address text NULL,
        CONSTRAINT restaurant_fssai_pkey PRIMARY KEY (id)
    );

    CREATE TABLE restaurant_gst_bank (
        id varchar(255) NOT NULL,
        gst_category varchar(255) NULL,
        pan_number varchar(255) NULL,
        pan_number_verified bool NULL DEFAULT false,
        pan_owner_name varchar(255) NULL,
        pan_document_type varchar(255) NULL,
        pan_document jsonb NULL,
        has_gstin bool NULL DEFAULT false,
        gstin_number varchar(255) NULL,
        gstin_document_type varchar(255) NULL,
        gstin_document jsonb NULL,
        business_name varchar(255) NULL,
        business_address varchar(255) NULL,
        bank_account_number varchar(255) NULL,
        ifsc_code varchar(255) NULL,
        ifsc_verified bool NULL DEFAULT false,
        bank_document_type varchar(255) NULL,
        kyc_document_type varchar(255) NULL,
        bank_document jsonb NULL,
        kyc_document jsonb NULL,
        gstin_number_verified bool NULL,
        CONSTRAINT restaurant_gst_bank_pkey PRIMARY KEY (id)
    );

    CREATE TABLE restaurant_onboarding (
        id varchar(255) NOT NULL,
        draft_section varchar(255) NULL,
        contact_number varchar(255) NULL,
        contact_number_verified bool NULL DEFAULT false,
        preferred_language_ids _varchar NULL,
        recieve_whatsapp_message bool NULL DEFAULT false,
        whatsapp_number varchar(255) NULL,
        tnc_accepted bool NULL DEFAULT false,
        user_profile varchar(255) NULL,
        owner_name varchar(255) NULL,
        owner_contact_number varchar(255) NULL,
        owner_email varchar(255) NULL,
        owner_is_manager bool NULL DEFAULT true,
        manager_name varchar(255) NULL,
        manager_contact_number varchar(255) NULL,
        manager_email varchar(255) NULL,
        invoice_email varchar(255) NULL,
        "location" varchar(255) NULL,
        postal_code varchar(255) NULL,
        postal_code_verified bool NULL DEFAULT false,
        state varchar(255) NULL,
        read_mou bool NULL DEFAULT false,
        document_sign_number varchar(255) NULL,
        document_sign_number_verified bool NULL DEFAULT false,
        menu_document_type varchar(255) NULL,
        scheduling_type varchar(255) NULL,
        approved_by varchar(255) NULL,
        catalog_approved_by varchar(255) NULL,
        status_comments varchar(255) NULL,
        menu_documents _jsonb NULL,
        owner_contact_number_verified bool NOT NULL DEFAULT false,
        owner_email_verified bool NOT NULL DEFAULT false,
        manager_contact_number_verified bool NOT NULL DEFAULT false,
        manager_email_verified bool NOT NULL DEFAULT false,
        invoice_email_verified bool NOT NULL DEFAULT false,
        CONSTRAINT restaurant_onboarding_pkey PRIMARY KEY (id)
    );

    CREATE TABLE sub_category (
        id bigserial NOT NULL,
        "name" varchar(255) NOT NULL,
        main_category_id int4 NOT NULL,
        created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        is_deleted bool NULL DEFAULT false,
        CONSTRAINT sub_category_pkey PRIMARY KEY (id)
    );

    CREATE TABLE "subscription" (
        id varchar(255) NOT NULL,
        external_subscription_id varchar(255) NULL,
        restaurant_id varchar(255) NOT NULL,
        plan_id varchar(255) NOT NULL,
        status varchar(255) NOT NULL,
        "mode" varchar(255) NULL,
        authorization_status varchar(255) NULL,
        authorization_amount numeric(10, 2) NULL,
        authorization_details jsonb NULL,
        cancelled_by varchar(255) NULL,
        cancellation_user_id varchar(255) NULL,
        cancellation_details jsonb NULL,
        partner varchar(255) NULL,
        description varchar(255) NULL,
        customer_name varchar(255) NOT NULL,
        customer_email varchar(255) NOT NULL,
        customer_phone varchar(255) NOT NULL,
        start_time timestamptz NULL,
        end_time timestamptz NULL,
        current_cycle int8 NULL,
        next_payment_on timestamptz NULL,
        additional_details jsonb NULL,
        created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT subscription_id PRIMARY KEY (id)
    );

    CREATE TABLE subscription_payment (
        id bigserial NOT NULL,
        subscription_id varchar(255) NOT NULL,
        external_payment_id varchar(255) NULL,
        status varchar(255) NOT NULL,
        no_of_grace_period_orders_allotted int8 NOT NULL,
        no_of_orders_bought int8 NOT NULL DEFAULT 0,
        no_of_orders_consumed int8 NULL,
        "cycle" int8 NULL,
        currency varchar(255) NULL,
        amount numeric(10, 2) NULL,
        retry_attempts int8 NULL,
        failure_reason varchar(255) NULL,
        additional_details jsonb NULL,
        scheduled_on timestamptz NULL,
        transaction_time timestamptz NULL,
        created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT subscription_payment_id PRIMARY KEY (id)
    );

    ALTER TABLE addon ADD CONSTRAINT addon_addon_group_id_foreign FOREIGN KEY (addon_group_id) REFERENCES addon_group(id);

    ALTER TABLE addon_group ADD CONSTRAINT addon_group_restaurant_id_foreign FOREIGN KEY (restaurant_id) REFERENCES restaurant(id);

    ALTER TABLE approval ADD CONSTRAINT approval_restaurant_id_foreign FOREIGN KEY (restaurant_id) REFERENCES restaurant(id);

    ALTER TABLE coupon_vendor ADD CONSTRAINT coupon_vendor_coupon_id_foreign FOREIGN KEY (coupon_id) REFERENCES coupon(id);
    ALTER TABLE coupon_vendor ADD CONSTRAINT coupon_vendor_restaurant_id_foreign FOREIGN KEY (restaurant_id) REFERENCES restaurant(id);

    ALTER TABLE item_addon ADD CONSTRAINT item_addon_addon_id_foreign FOREIGN KEY (addon_id) REFERENCES addon(id);
    ALTER TABLE item_addon ADD CONSTRAINT item_addon_menu_item_id_foreign FOREIGN KEY (menu_item_id) REFERENCES menu_item(id);

    ALTER TABLE item_addon_group ADD CONSTRAINT item_addon_group_addon_group_id_foreign FOREIGN KEY (addon_group_id) REFERENCES addon_group(id);
    ALTER TABLE item_addon_group ADD CONSTRAINT item_addon_group_menu_item_id_foreign FOREIGN KEY (menu_item_id) REFERENCES menu_item(id);

    ALTER TABLE item_variant ADD CONSTRAINT item_variant_variant_group_id_foreign FOREIGN KEY (variant_group_id) REFERENCES item_variant_group(id);

    ALTER TABLE item_variant_group ADD CONSTRAINT item_variant_group_menu_item_id_foreign FOREIGN KEY (menu_item_id) REFERENCES menu_item(id);

    ALTER TABLE main_category ADD CONSTRAINT main_category_restaurant_id_foreign FOREIGN KEY (restaurant_id) REFERENCES restaurant(id);

    ALTER TABLE menu_item ADD CONSTRAINT menu_item_restaurant_id_foreign FOREIGN KEY (restaurant_id) REFERENCES restaurant(id);
    ALTER TABLE menu_item ADD CONSTRAINT menu_item_sub_category_id_foreign FOREIGN KEY (sub_category_id) REFERENCES sub_category(id);

    ALTER TABLE menu_item_slot ADD CONSTRAINT menu_item_slot_menu_item_id FOREIGN KEY (menu_item_id) REFERENCES menu_item(id);

    ALTER TABLE "order" ADD CONSTRAINT order_coupon_id_foreign FOREIGN KEY (coupon_id) REFERENCES coupon(id);
    ALTER TABLE "order" ADD CONSTRAINT order_payout_id_forign FOREIGN KEY (payout_transaction_id) REFERENCES payout(id);
    ALTER TABLE "order" ADD CONSTRAINT order_restaurant_id_foreign FOREIGN KEY (restaurant_id) REFERENCES restaurant(id);

    ALTER TABLE order_addon ADD CONSTRAINT order_addon_addon_group_id_foreign FOREIGN KEY (addon_group_id) REFERENCES addon_group(id);
    ALTER TABLE order_addon ADD CONSTRAINT order_addon_addon_id_foreign FOREIGN KEY (addon_id) REFERENCES addon(id);
    ALTER TABLE order_addon ADD CONSTRAINT order_addon_order_item_id_foreign FOREIGN KEY (order_item_id) REFERENCES order_item(id);

    ALTER TABLE order_item ADD CONSTRAINT order_item_menu_item_id_foreign FOREIGN KEY (menu_item_id) REFERENCES menu_item(id);
    ALTER TABLE order_item ADD CONSTRAINT order_item_order_id_foreign FOREIGN KEY (order_id) REFERENCES "order"(id);
    ALTER TABLE order_item ADD CONSTRAINT order_item_restaurant_id_foreign FOREIGN KEY (restaurant_id) REFERENCES restaurant(id);
    ALTER TABLE order_item ADD CONSTRAINT order_item_sub_category_id_foreign FOREIGN KEY (sub_category_id) REFERENCES sub_category(id);

    ALTER TABLE order_variant ADD CONSTRAINT order_variant_order_item_id_foreign FOREIGN KEY (order_item_id) REFERENCES order_item(id);
    ALTER TABLE order_variant ADD CONSTRAINT order_variant_variant_group_id_foreign FOREIGN KEY (variant_group_id) REFERENCES item_variant_group(id);
    ALTER TABLE order_variant ADD CONSTRAINT order_variant_variant_id_foreign FOREIGN KEY (variant_id) REFERENCES item_variant(id);

    ALTER TABLE payment ADD CONSTRAINT payment_order_id_foreign FOREIGN KEY (order_id) REFERENCES "order"(id);

    ALTER TABLE payout ADD CONSTRAINT payout_restaurant_id_foreign FOREIGN KEY (restaurant_id) REFERENCES restaurant(id);

    ALTER TABLE payout_account ADD CONSTRAINT payout_account_restaurant_id_foreign FOREIGN KEY (restaurant_id) REFERENCES restaurant(id);

    ALTER TABLE restaurant ADD CONSTRAINT restaurant_subscription_id_foreign FOREIGN KEY (subscription_id) REFERENCES "subscription"(id);

    ALTER TABLE restaurant_fssai ADD CONSTRAINT restaurant_fssai_id_foreign FOREIGN KEY (id) REFERENCES restaurant(id);

    ALTER TABLE restaurant_gst_bank ADD CONSTRAINT restaurant_gst_bank_id_foreign FOREIGN KEY (id) REFERENCES restaurant(id);

    ALTER TABLE restaurant_onboarding ADD CONSTRAINT restaurant_onboarding_id_foreign FOREIGN KEY (id) REFERENCES restaurant(id);

    ALTER TABLE sub_category ADD CONSTRAINT sub_category_main_category_id_foreign FOREIGN KEY (main_category_id) REFERENCES main_category(id);

    ALTER TABLE "subscription" ADD CONSTRAINT subscription_plan_id_foreign FOREIGN KEY (plan_id) REFERENCES plan(id);
    ALTER TABLE "subscription" ADD CONSTRAINT subscription_restaurant_id_foreign FOREIGN KEY (restaurant_id) REFERENCES restaurant(id);

    ALTER TABLE subscription_payment ADD CONSTRAINT subscription_payment_subscription_id_foreign FOREIGN KEY (subscription_id) REFERENCES "subscription"(id);
 `;

  return knex.raw(sql);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`

    drop table if exists addon cascade;
    drop table if exists addon_group cascade;
    drop table if exists approval cascade;
    drop table if exists banner cascade;
    drop table if exists cancellation_reason cascade;
    drop table if exists cashfree_beneficiary cascade;
    drop table if exists city_master cascade;
    drop table if exists coupon cascade;
    drop table if exists coupon_customer cascade;
    drop table if exists coupon_vendor cascade;
    drop table if exists cuisine_master cascade;
    drop table if exists document_master cascade;
    drop table if exists global_var cascade;
    drop table if exists holiday_slot cascade;
    drop table if exists item_addon cascade;
    drop table if exists item_addon_group cascade;
    drop table if exists item_variant cascade;
    drop table if exists item_variant_group cascade;
    drop table if exists language_master cascade;
    drop table if exists main_category cascade;
    drop table if exists menu_item cascade;
    drop table if exists menu_item_slot cascade;
    drop table if exists "order" cascade;
    drop table if exists order_addon cascade;
    drop table if exists order_item cascade;
    drop table if exists order_variant cascade;
    drop table if exists payment cascade;
    drop table if exists payout cascade;
    drop table if exists payout_account cascade;
    drop table if exists plan cascade;
    drop table if exists polygon_master cascade;
    drop table if exists refund_master cascade;
    drop table if exists restaurant cascade;
    drop table if exists restaurant_fssai cascade;
    drop table if exists restaurant_gst_bank cascade;
    drop table if exists restaurant_onboarding cascade;
    drop table if exists service_master cascade;
    drop table if exists slot cascade;
    drop table if exists sub_category cascade;
    drop table if exists subscription cascade;
    drop table if exists subscription_payment cascade;
    drop table if exists knex_migrations cascade;
    drop table if exists knex_migrations_lock cascade;

  `);
}

// delete from item_addon_group cascade;
// delete from item_addon cascade;
// delete from order_addon cascade;
// delete from addon cascade;
// delete from addon_group cascade;
// delete from approval cascade;
// delete from banner cascade;
// delete from cancellation_reason cascade;
// delete from cashfree_beneficiary cascade;
// delete from polygon_master cascade;
// delete from city_master cascade;
// delete from coupon_customer cascade;
// delete from coupon_vendor cascade;
// delete from order_variant cascade;
// delete from order_item cascade;
// delete from payment cascade;
// delete from "order" cascade;
// delete from coupon cascade;
// delete from cuisine_master cascade;
// delete from document_master cascade;
// delete from global_var cascade;
// delete from holiday_slot cascade;
// delete from item_variant cascade;
// delete from item_variant_group cascade;
// delete from language_master cascade;
// delete from menu_item cascade;
// delete from sub_category cascade;
// delete from main_category cascade;
// delete from menu_item_slot cascade;
// delete from payout cascade;
// delete from payout_account cascade;
// delete from restaurant_fssai cascade;
// delete from restaurant_gst_bank cascade;
// delete from restaurant_onboarding cascade;
// UPDATE restaurant SET subscription_id = null;
// delete from subscription cascade;
// delete from restaurant cascade;
// delete from plan cascade;
// delete from refund_master cascade;
// delete from service_master cascade;
// delete from slot cascade;
// delete from subscription_payment cascade;
