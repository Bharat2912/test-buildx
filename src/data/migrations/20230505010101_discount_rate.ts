import {Knex} from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
  ALTER TABLE order_item ADD COLUMN display_price NUMERIC(10,2) NOT NULL DEFAULT '0';
  ALTER TABLE order_variant ADD COLUMN display_price NUMERIC(10,2) NOT NULL DEFAULT '0';
  ALTER TABLE order_addon ADD COLUMN display_price NUMERIC(10,2) NOT NULL DEFAULT '0';
  `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
  ALTER TABLE order_item DROP COLUMN display_price;
  ALTER TABLE order_variant DROP COLUMN display_price;
  ALTER TABLE order_addon DROP COLUMN display_price;
  `);
}
