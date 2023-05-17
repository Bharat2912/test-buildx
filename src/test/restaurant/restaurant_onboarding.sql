INSERT INTO PUBLIC.restaurant
VALUES(
    '7c756246-8a52-4f96-8ec2-99df8745e85f',
    'f1a41fd3-c764-43f7-a43d-e4087b6bf90e',
    'draft restaurant',
    NULL,
    NULL,
	'draft',
    '2023-01-19 15:58:52.119785+05:30',
    '2023-01-19 15:58:52.119785+05:30',
    false,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
	NULL,
	NULL,
    false,
    NULL,
    false,
    NULL,
    false,
    10,
    0,
    NULL,
    NULL,
    NULL
);

INSERT INTO PUBLIC.restaurant_fssai(
    id,
    fssai_has_certificate,
    fssai_cert_verified
)VALUES(
    '7c756246-8a52-4f96-8ec2-99df8745e85f',
    false,
    false
);

INSERT INTO PUBLIC.restaurant_gst_bank(
    id,
    pan_number_verified,
    has_gstin,
    ifsc_verified

)VALUES(
    '7c756246-8a52-4f96-8ec2-99df8745e85f',
    false,
	false,
    false
);

INSERT INTO PUBLIC.restaurant_onboarding(
    id,
    tnc_accepted,
    owner_is_manager,
    postal_code_verified,
    document_sign_number_verified,
    owner_contact_number_verified,
    owner_email_verified

)VALUES(
    '7c756246-8a52-4f96-8ec2-99df8745e85f',
    false,
    true,
    false,
    false,
    false,
    false
);
