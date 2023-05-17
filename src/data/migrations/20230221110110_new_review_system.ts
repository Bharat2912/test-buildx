import {Knex} from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`

  ALTER TABLE RESTAURANT
  ADD COLUMN like_count bigint NOT NULL DEFAULT 0,
  ADD COLUMN dislike_count bigint NOT NULL DEFAULT 0,
  DROP COLUMN rating,
  DROP COLUMN all_time_rating_order_count;

  ALTER TABLE public.ORDER
  ADD COLUMN vote_type numeric NOT NULL DEFAULT 0 CHECK (vote_type IN (1, -1, 0)),
  DROP COLUMN order_rating;

  `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`

  ALTER TABLE RESTAURANT
  DROP COLUMN like_count,
  DROP COLUMN dislike_count,
  ADD COLUMN rating float4 NULL,
  ADD COLUMN all_time_rating_order_count int8 NULL DEFAULT 0;

  ALTER TABLE public.ORDER
  DROP COLUMN vote_type,
  ADD COLUMN order_rating numeric NULL;

  `);
}
