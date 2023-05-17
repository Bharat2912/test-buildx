import {Knex} from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE restaurant
    ADD COLUMN parent_id varchar(255) NULL,
    ADD COLUMN parent_or_child varchar(255) NULL;
  `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE restaurant DROP COLUMN parent_id;
    ALTER TABLE restaurant DROP COLUMN parent_or_child;
  `);
}
