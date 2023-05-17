INSERT INTO public.payout_account (
	id,
	restaurant_id,
	created_vendor_id,
	bank_account_number,
	name,
	bank_name,
	ifsc_code,
	ifsc_verified,
	is_primary,
	status,
	is_deleted,
	beneficiary_details,
	created_at,
	updated_at
	)
	VALUES (
	'e652c702-e304-45d2-8230-939d1dda9611',
	'b0909e52-a731-4665-a791-ee6479008805',
	'33c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
	'12897312098120',
	'Default',
	'SBI',
	'SBIN0002651',
	true,
	true,
	'active',
	false,
	'{ "beneficiary_id": "00a54bbe_e316_4fdb_ba80_150cf5e89b4a"}',
	'2022-07-28 08:57:24.835648+00',
	'2022-07-28 08:57:24.835648+00'
);
