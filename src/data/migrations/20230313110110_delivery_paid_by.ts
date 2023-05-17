import {Knex} from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE RESTAURANT
    ADD COLUMN delivery_charge_paid_by VARCHAR NOT NULL DEFAULT 'customer';
  `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE RESTAURANT
    DROP COLUMN delivery_charge_paid_by;
  `);
}
