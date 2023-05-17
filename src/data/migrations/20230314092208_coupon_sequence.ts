import {Knex} from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw('ALTER TABLE COUPON_VENDOR ADD COLUMN SEQUENCE int4 NULL;');
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw('ALTER TABLE COUPON_VENDOR DROP COLUMN SEQUENCE;');
}
