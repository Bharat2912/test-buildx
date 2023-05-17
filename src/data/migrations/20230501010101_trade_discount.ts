import {Knex} from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE restaurant
      ADD COLUMN discount_rate NUMERIC(10,2) NOT NULL DEFAULT '0',
      ADD COLUMN discount_updated_at timestamptz NULL,
      ADD COLUMN discount_updated_user_id varchar(255) NULL,
      ADD COLUMN discount_updated_user_type varchar(255) NULL;

    ALTER TABLE main_category
      ADD COLUMN discount_rate NUMERIC(10,2) NOT NULL DEFAULT '0',
      ADD COLUMN discount_updated_at timestamptz NULL,
      ADD COLUMN discount_updated_user_id varchar(255) NULL,
      ADD COLUMN discount_updated_user_type varchar(255) NULL;

    ALTER TABLE sub_category
      ADD COLUMN discount_rate NUMERIC(10,2) NOT NULL DEFAULT '0',
      ADD COLUMN discount_updated_at timestamptz NULL,
      ADD COLUMN discount_updated_user_id varchar(255) NULL,
      ADD COLUMN discount_updated_user_type varchar(255) NULL;

    ALTER TABLE menu_item
      ADD COLUMN discount_rate NUMERIC(10,2) NOT NULL DEFAULT '0',
      ADD COLUMN discount_updated_at timestamptz NULL,
      ADD COLUMN discount_updated_user_id varchar(255) NULL,
      ADD COLUMN discount_updated_user_type varchar(255) NULL;
  `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE restaurant DROP COLUMN discount_rate;
    ALTER TABLE restaurant DROP COLUMN discount_updated_at;
    ALTER TABLE restaurant DROP COLUMN discount_updated_user_id;
    ALTER TABLE restaurant DROP COLUMN discount_updated_user_type;

    ALTER TABLE main_category DROP COLUMN discount_rate;
    ALTER TABLE main_category DROP COLUMN discount_updated_at;
    ALTER TABLE main_category DROP COLUMN discount_updated_user_id;
    ALTER TABLE main_category DROP COLUMN discount_updated_user_type;

    ALTER TABLE sub_category DROP COLUMN discount_rate;
    ALTER TABLE sub_category DROP COLUMN discount_updated_at;
    ALTER TABLE sub_category DROP COLUMN discount_updated_user_id;
    ALTER TABLE sub_category DROP COLUMN discount_updated_user_type;

    ALTER TABLE menu_item DROP COLUMN discount_rate;
    ALTER TABLE menu_item DROP COLUMN discount_updated_at;
    ALTER TABLE menu_item DROP COLUMN discount_updated_user_id;
    ALTER TABLE menu_item DROP COLUMN discount_updated_user_type;
  `);
}
