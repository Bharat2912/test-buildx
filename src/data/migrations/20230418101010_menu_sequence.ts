import {Knex} from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE main_category ADD COLUMN sequence numeric NULL DEFAULT '0';
    ALTER TABLE sub_category ADD COLUMN sequence numeric NULL DEFAULT '0';
    ALTER TABLE menu_item ADD COLUMN sequence numeric NULL DEFAULT '0';
    ALTER TABLE item_variant_group ADD COLUMN sequence numeric NULL DEFAULT '0';
    ALTER TABLE item_variant ADD COLUMN sequence numeric NULL DEFAULT '0';
  `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
  ALTER TABLE main_category DROP COLUMN sequence;
  ALTER TABLE sub_category DROP COLUMN sequence;
  ALTER TABLE menu_item DROP COLUMN sequence;
  ALTER TABLE item_variant_group DROP COLUMN sequence;
  ALTER TABLE item_variant DROP COLUMN sequence;
  `);
}
