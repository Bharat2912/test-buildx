import {Knex} from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE payment

    ADD COLUMN session_id varchar(255) NULL,

    ALTER COLUMN transaction_token DROP NOT NULL,

    ADD CONSTRAINT check_transaction_token_session_id_null
    CHECK
    (
      (transaction_token IS NOT NULL AND session_id IS NULL)
      OR
      (session_id IS NOT NULL AND transaction_token IS NULL)
      OR
      (is_pod = true AND transaction_token IS NULL AND session_id IS NULL)
    );

  `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
  ALTER TABLE payment

  DROP CONSTRAINT check_transaction_token_session_id_null,

  ALTER COLUMN transaction_token SET NOT NULL,

  DROP COLUMN session_id;

  `);
}
