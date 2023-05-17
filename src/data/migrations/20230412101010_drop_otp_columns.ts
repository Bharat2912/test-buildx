import {Knex} from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE restaurant_onboarding
    DROP COLUMN contact_number,
    DROP COLUMN contact_number_verified,
    DROP COLUMN recieve_whatsapp_message,
    DROP COLUMN whatsapp_number,
    DROP COLUMN manager_contact_number_verified,
    DROP COLUMN manager_email_verified,
    DROP COLUMN invoice_email_verified
  `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
  ALTER TABLE restaurant_onboarding
    ADD COLUMN contact_number varchar(255) NULL,
    ADD COLUMN contact_number_verified bool NULL DEFAULT false,
    ADD COLUMN recieve_whatsapp_message bool NULL DEFAULT false,
    ADD COLUMN whatsapp_number varchar(255) NULL,
    ADD COLUMN manager_contact_number_verified bool NOT NULL DEFAULT false,
    ADD COLUMN manager_email_verified bool NOT NULL DEFAULT false,
    ADD COLUMN invoice_email_verified bool NOT NULL DEFAULT false
  `);
}
