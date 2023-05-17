import {Knex} from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`

  ALTER TABLE restaurant
  ADD COLUMN pos_id varchar(255) NULL,
  ADD COLUMN pos_partner varchar(255) NULL,
  ADD COLUMN packing_charge_fixed_percent varchar(255) NULL default 'fixed',
  ADD COLUMN taxes_applicable_on_packing bool NOT NULL DEFAULT false,
  ADD COLUMN packing_sgst_utgst numeric(10, 4) NOT NULL DEFAULT 0.0000,
  ADD COLUMN packing_cgst numeric(10, 4) NOT NULL DEFAULT 0.0000,
  ADD COLUMN packing_igst numeric(10, 4) NOT NULL DEFAULT 0.0000;

  ALTER TABLE main_category
  ADD COLUMN pos_id varchar(255) NULL,
  ADD COLUMN pos_partner varchar(255) NULL;

  ALTER TABLE sub_category
  ADD COLUMN pos_id varchar(255) NULL,
  ADD COLUMN pos_partner varchar(255) NULL;

  ALTER TABLE menu_item
  ADD COLUMN pos_id varchar(255) NULL,
  ADD COLUMN tax_applied_on varchar(255) NULL DEFAULT 'core',
  ADD COLUMN pos_partner varchar(255) NULL;

  ALTER TABLE addon
  ADD COLUMN pos_id varchar(255) NULL,
  ADD COLUMN next_available_after timestamptz NULL,
  ADD COLUMN pos_partner varchar(255) NULL;

  ALTER TABLE addon_group
  ADD COLUMN pos_id varchar(255) NULL,
  ADD COLUMN pos_partner varchar(255) NULL;

  ALTER TABLE item_variant
  ADD COLUMN pos_id varchar(255) NULL,
  ADD COLUMN pos_variant_item_id varchar(255) NULL,
  ADD COLUMN next_available_after timestamptz NULL,
  ADD COLUMN pos_partner varchar(255) NULL;

  ALTER TABLE item_variant_group
  ADD COLUMN pos_id varchar(255) NULL,
  ADD COLUMN pos_partner varchar(255) NULL;

  ALTER TABLE "order"
  ADD COLUMN pos_id varchar(255) NULL,
  ADD COLUMN pos_partner varchar(255) NULL;

  ALTER TABLE "order_item"
  ADD COLUMN sequence numeric NULL DEFAULT '0',
  ADD COLUMN pos_id varchar(255) NULL;

  ALTER TABLE "order_variant"
  ADD COLUMN pos_variant_id varchar(255) NULL,
  ADD COLUMN pos_variant_item_id varchar(255) NULL,
  ADD COLUMN pos_variant_group_id varchar(255) NULL;

  ALTER TABLE "order_addon"
  ADD COLUMN pos_addon_id varchar(255) NULL,
  ADD COLUMN pos_addon_group_id varchar(255) NULL;

  CREATE TABLE petpooja_restaurant (
    id varchar(255) NOT NULL,
    pos_restaurant_id varchar(255) NULL,
    pos_id varchar(255) NULL,
    pos_status varchar(255) NOT NULL DEFAULT 'init',
    details jsonb NULL,
    initiated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    onboarded_at timestamptz NULL,
    menu_last_updated_at timestamptz NULL,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT petpooja_restaurant_pkey PRIMARY KEY (id),
    CONSTRAINT petpooja_restaurant_id_foreign FOREIGN KEY (id) REFERENCES restaurant(id)
  );

  CREATE TABLE petpooja_tax
  (
      restaurant_id varchar(255) NOT NULL,
      taxid character varying(255) NOT NULL,
      taxname character varying(255),
      tax character varying(255),
      taxtype character varying(255),
      tax_ordertype character varying(255),
      tax_coreortotal character varying(255),
      tax_taxtype character varying(255),
      rank character varying(255),
      consider_in_core_amount character varying(255),
      description text,
      active boolean,
      PRIMARY KEY (taxid,restaurant_id)
  );

  CREATE TABLE petpooja_item_tax(
    restaurant_id varchar(255) NOT NULL,
    item_pos_id varchar(255) NOT NULL,
    tax_pos_id varchar(255) NULL,
    CONSTRAINT petpooja_item_tax_restaurant_id_foreign FOREIGN KEY (restaurant_id) REFERENCES restaurant(id)
  );

  `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`

  ALTER TABLE restaurant
  DROP COLUMN pos_id,
  DROP COLUMN pos_partner,
  DROP COLUMN packing_charge_fixed_percent,
  DROP COLUMN taxes_applicable_on_packing,
  DROP COLUMN packing_sgst_utgst,
  DROP COLUMN packing_cgst,
  DROP COLUMN packing_igst;


  ALTER TABLE main_category
  DROP COLUMN pos_id,
  DROP COLUMN pos_partner;

  ALTER TABLE sub_category
  DROP COLUMN pos_id,
  DROP COLUMN pos_partner;

  ALTER TABLE menu_item
  DROP COLUMN pos_id,
  DROP COLUMN pos_partner,
  DROP COLUMN tax_applied_on;

  ALTER TABLE addon
  DROP COLUMN pos_id,
  DROP COLUMN next_available_after,
  DROP COLUMN pos_partner;

  ALTER TABLE addon_group
  DROP COLUMN pos_id,
  DROP COLUMN pos_partner;

  ALTER TABLE item_variant
  DROP COLUMN pos_id,
  DROP COLUMN pos_variant_item_id,
  DROP COLUMN next_available_after,
  DROP COLUMN pos_partner;

  ALTER TABLE item_variant_group
  DROP COLUMN pos_id,
  DROP COLUMN pos_partner;

  ALTER TABLE "order"
  DROP COLUMN pos_id,
  DROP COLUMN pos_partner;

  ALTER TABLE "order_item"
  DROP COLUMN sequence,
  DROP COLUMN pos_id;

  ALTER TABLE "order_variant"
  DROP COLUMN pos_variant_id,
  DROP COLUMN pos_variant_item_id,
  DROP COLUMN pos_variant_group_id;

  ALTER TABLE "order_addon"
  DROP COLUMN pos_addon_id,
  DROP COLUMN pos_addon_group_id;

  DROP TABLE petpooja_restaurant;
  DROP TABLE petpooja_tax;
  DROP TABLE petpooja_item_tax;
    `);
}
