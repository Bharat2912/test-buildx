import {Knex} from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
  ALTER TABLE cuisine_master ADD COLUMN image jsonb NULL;
  `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
  ALTER TABLE cuisine_master DROP COLUMN image;
  `);
}
