import {Knex} from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE restaurant ADD COLUMN speedyy_account_manager_id varchar(255) NULL;
    ALTER TABLE restaurant RENAME COLUMN poc_contact_number TO poc_number;

  `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
  ALTER TABLE restaurant DROP COLUMN speedyy_account_manager_id;
  ALTER TABLE restaurant RENAME COLUMN poc_number TO poc_contact_number;
  `);
}
