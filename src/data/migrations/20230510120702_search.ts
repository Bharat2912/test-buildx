import {Knex} from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`

  CREATE TABLE search_click (
    id bigserial NOT NULL,
    restaurant_id varchar(255) NOT NULL,
    customer_id varchar(255) NOT NULL,
    count SMALLINT NOT NULL DEFAULT 1,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT search_click_id PRIMARY KEY (id),
    CONSTRAINT search_click_restaurant_id_foreign FOREIGN KEY (restaurant_id) REFERENCES restaurant(id)
    );

  `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
  drop table if exists search_click;
  `);
}
