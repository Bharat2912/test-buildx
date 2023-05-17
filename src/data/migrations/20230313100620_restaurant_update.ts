import {Knex} from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE RESTAURANT
    ADD COLUMN pos_name varchar(255) NULL,
    ADD COLUMN branch_name varchar(255) NULL;
    `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE RESTAURANT
    DROP COLUMN pos_name,
    DROP COLUMN branch_name;
    `);
}
