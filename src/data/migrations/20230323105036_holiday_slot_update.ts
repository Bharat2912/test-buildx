import {Knex} from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(
    'ALTER TABLE HOLIDAY_SLOT ALTER COLUMN OPEN_AFTER SET NOT NULL'
  );
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw('ALTER TABLE HOLIDAY_SLOT ALTER COLUMN OPEN_AFTER SET NULL');
}
