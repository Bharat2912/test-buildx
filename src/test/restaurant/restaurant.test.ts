import request from 'supertest';
import {createTestServer} from '../utils/init';
import {Application} from 'express';
import {
  mockgetAdminDetails,
  mocksaveS3Files,
  mocksaveS3File,
  mockgenerateDownloadFileURL,
  mockSendSQSMessage,
  mockEsIndexData,
  mockAddressDeliverabilityCheck,
  mocksaveS3MP3Files,
  mocksaveS3MP3File,
  mockCreateCashfreeBeneficicary,
} from '../utils/mock_services';
import {
  signToken,
  expireToken,
  loadMockSeedData,
  testCasesClosingTasks,
} from '../utils/utils';
import {sample_request} from './mock_request';

jest.mock('axios');

let server: Application;
let admin_token: string;
let partner_token: string;
let invalid_token: string;
let partner_expired_token: string;
let partner_two_token: string;
let vendor_token: string;
const admin_id = '64bfafb6-c273-4b64-a0fc-ca981f5819eb';
const updated_sample_request = {
  status: 'draft',
  name: 'Test restaurnat 2',
  lat: 1.098889,
  long: 2.0089002,
  image: {
    name: '088066b3-c5c3-4e49-9d75-068346b5d094.jpg',
  },
  images: [
    {
      name: '088066b3-c5c3-4e49-9d75-068346b5d094.jpg',
    },
  ],
  draft_section: 'basic / contact / fssai / bank',
  city_id: '51ad1f92-e54a-4f2a-8452-d68cdd7e3a7b',
  area_id: '20c37d26-bd71-4fe3-9365-16538f10fee8',
  //preferred_language_ids: ['77206d74-8f7c-45b6-af7a-fe8901eb65ac'],
  tnc_accepted: true,
  user_profile: 'owner',
  owner_name: 'Amitabh Bachchan',
  owner_contact_number: '+919089890998',
  owner_email: 'amitabh@bachchan.com',
  owner_is_manager: true,
  manager_name: 'Jaya Bachchan',
  manager_contact_number: '+919089890998',
  manager_email: 'jaya@bachchan.com',
  invoice_email: 'invoice@bachchan.com',
  location: '13/67 G.B. road mumbai',
  postal_code: '401234',
  state: 'Maharashtra',
  read_mou: true,
  document_sign_number: '+919089890998',
  is_pure_veg: true,
  allow_long_distance: true,
  cuisine_ids: ['bafad85e-3f7f-496f-9851-6070275609e9'],
  cost_of_two: 100,
  menu_documents: [
    {
      name: '0028fb89-2503-4bf6-8d6d-3ec80b85d9ce.jpg',
    },
  ],
  scheduling_type: 'all',
  slot_schedule: [
    {
      slot_name: 'all',
      start_time: '0001',
      end_time: '2359',
    },
  ],
  packing_charge_type: 'item',
  custom_packing_charge_item: true,
  packing_charge_item: [
    {
      item_name: 'Paneer Tikka',
      item_price: 120,
      packing_charge: 2.5,
      packing_image: {
        name: '0f8b52dd-d7d2-48f7-b6a6-1780cd5b9113.jpg',
      },
    },
  ],
  fssai_has_certificate: true,
  fssai_expiry_date: '2030-03-20',
  fssai_cert_number: 'ASX12456BCGF',
  fssai_cert_document: {
    name: '3c103eab-f93f-4bac-af92-00de744ff0a2.jpg',
  },
  fssai_firm_name: 'agarwa sweets',
  fssai_firm_address: 'unknown',
  gst_category: 'restaurant',
  pan_number: 'ASX12456BCGF',
  pan_owner_name: 'amitabh',
  pan_document: {
    name: '4ccce9ab-8d93-463e-8004-1b1971010a4c.jpg',
  },
  has_gstin: true,
  gstin_number: 'ASX12456BCGF',
  gstin_document: {
    name: '4ce154f4-a551-4635-ac7a-d4fa1ad92fd6.jpg',
  },
  business_name: 'Agarwal sweets',
  business_address: 'unknown',
  bank_account_number: '12897312098120',
  ifsc_code: 'ICIC000101',
  bank_document: {
    name: '4d345f25-4b49-47e2-9921-5f4b6782c384.jpg',
  },
  kyc_document: {
    name: '4d8f9e53-1356-48cf-a1dd-b919b4e704fe.jpg',
  },
};

beforeAll(async () => {
  server = await createTestServer();

  await loadMockSeedData('cuisine');
  await loadMockSeedData('language');
  await loadMockSeedData('city');
  await loadMockSeedData('polygon');
  await loadMockSeedData('restaurant');
  await loadMockSeedData('time_slot');
  await loadMockSeedData('subscription');
  partner_token = signToken({
    id: 'f1a41fd3-c764-43f7-a43d-e4087b6bf90e',
    user_type: 'partner',
  });
  partner_two_token = signToken({
    id: 'cdf39e49-3b6b-4558-b08d-cb00b8ddb0a4',
    user_type: 'partner',
  });
  admin_token = signToken({
    id: admin_id,
    user_type: 'admin',
  });
  invalid_token = signToken({
    id: '64bfafb6-0000-4b64-0000-ca981f5819eb',
    user_type: 'customer',
  });
  partner_expired_token = expireToken({
    id: '64bfafb6-1111-4b64-0000-ca981f5819eb',
    user_type: 'partner',
  });

  vendor_token = signToken({
    id: '33c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
    data: {
      type: 'restaurant',
      outlet_id: 'b0909e52-a731-4665-a791-ee6479008805',
      force_reset_password: false,
    },
    user_type: 'vendor',
  });
});

afterAll(async () => {
  await testCasesClosingTasks();
});

const approved_restaurnat_id = '77e53c1f-6e9e-4724-9ba7-92edc69cff6b';
const invalid_restaurnat_id = 'beefjenf-6e9e-4724-9ba7-92edc69cff6b';

describe('Restaurnat API Test cases', () => {
  let test_restaurnat_id: string;
  describe('Test case for POST Restaurnat ', () => {
    test('Applying Invalid Token', async () => {
      const response = await request(server)
        .post('/food/partner/restaurant')
        .set('Authorization', `Bearer ${invalid_token}`)
        .send({
          name: 'Food',
        });
      expect(response.statusCode).toBe(403);
      expect(response.body.errors).toStrictEqual([
        {message: 'forbidden', code: 0},
      ]);
    });
    test('Applying Expired Token Token', async () => {
      const response = await request(server)
        .post('/food/partner/restaurant')
        .set('Authorization', `Bearer ${partner_expired_token}`)
        .send({
          name: 'Food',
        });
      expect(response.statusCode).toBe(401);
      expect(response.body.errors).toStrictEqual([
        {message: 'Authorization Error', code: 0},
      ]);
    });
    // test('Should not accept special keywords', async () => {
    //   const response = await request(server)
    //     .post('/food/partner/restaurant')
    //     .set('Authorization', `Bearer ${partner_token}`)
    //     .send({
    //       name: 'ADC.//)({!!}',
    //     });
    //   expect(response.statusCode).toBe(400);
    //   expect(response.body.errors).toStrictEqual([
    //     {
    //       message:
    //         '"name" with value "ADC.//)({!!}" matches the inverted pattern: /[$()<>]/',
    //       code: 0,
    //     },
    //   ]);
    // });
    test('Should not accept Empty spaces', async () => {
      const response = await request(server)
        .post('/food/partner/restaurant')
        .set('Authorization', `Bearer ${partner_token}`)
        .send({
          name: ' ',
        });
      expect(response.statusCode).toBe(400);
      expect(response.body.errors).toStrictEqual([
        {message: '"name" is not allowed to be empty', code: 0},
      ]);
    });
    test('Combination of String and integer in Field of name', async () => {
      const response = await request(server)
        .post('/food/partner/restaurant')
        .set('Authorization', `Bearer ${partner_token}`)
        .send({
          name: 'one7one',
        });
      expect(response.statusCode).toBe(201);
      expect(response.body.status).toBe(true);
    });
    test('Applying valid Token | Valid Name', async () => {
      const response = await request(server)
        .post('/food/partner/restaurant')
        .set('Authorization', `Bearer ${partner_token}`)
        .send({
          name: 'Test restaurnat',
        });
      expect(response.statusCode).toBe(201);
      expect(response.body.status).toBe(true);
      test_restaurnat_id = response.body.result.id;
    });
  });
  describe('Test case for GET food/partner/restaurant & By ID', () => {
    // const valid_id = 'b4574e02-f133-4392-ade7-fb399d46eabb';
    const invalid_id = 'yuebfiao-2141-422f-9beb-b2e8e13ddabe';
    test('Get All Restaurants Created By Partner With Invalid Token : It Should Failed', async () => {
      const response = await request(server)
        .get('/food/partner/restaurant')
        .set('Authorization', `Bearer ${invalid_token}`);
      expect(response.statusCode).toStrictEqual(403);
      expect(response.body.errors).toStrictEqual([
        {message: 'forbidden', code: 0},
      ]);
    });
    test('Get Restaurants By valid ID', async () => {
      const response = await request(server)
        .get(`/food/partner/restaurant/${test_restaurnat_id}`)
        .set('Authorization', `Bearer ${partner_token}`);
      expect(response.statusCode).toStrictEqual(200);
      expect(response.body.result).not.toEqual({});
    });
    test('Get Restaurants By diffrent Partner |  It should throw error', async () => {
      const response = await request(server)
        .get(`/food/partner/restaurant/${test_restaurnat_id}`)
        .set('Authorization', `Bearer ${partner_two_token}`);
      expect(response.statusCode).toStrictEqual(404);
      expect(response.body.errors).toStrictEqual([
        {message: 'forbidden', code: 0},
      ]);
    });
    test('Get Restaurants Invalid ID', async () => {
      const response = await request(server)
        .get(`/food/partner/restaurant/${invalid_id}`)
        .set('Authorization', `Bearer ${partner_token}`);
      expect(response.statusCode).toStrictEqual(404);
      expect(response.body.errors).toStrictEqual([
        {message: 'Restaurant not found', code: 0},
      ]);
    });
  });
  describe('Test cases for PUT food/partner/restaurant', () => {
    test('Successful Request', async () => {
      mocksaveS3Files();
      mocksaveS3File();
      mockgenerateDownloadFileURL();
      const response = await request(server)
        .put(`/food/partner/restaurant/${test_restaurnat_id}`)
        .set('Authorization', `Bearer ${partner_token}`)
        .send(sample_request);
      expect(response.statusCode).toStrictEqual(200);
      expect(response.body.status).toBe(true);
    });
  });
  describe('Test cases for POST food/partner/restaurant/{id}/submit', () => {
    test('Applying Invalid Token', async () => {
      const response = await request(server)
        .post(`/food/partner/restaurant/${test_restaurnat_id}/submit`)
        .set('Authorization', `Bearer ${invalid_token}`);
      expect(response.statusCode).toStrictEqual(403);
      expect(response.body.errors).toStrictEqual([
        {
          message: 'forbidden',
          code: 0,
        },
      ]);
    });
    test('Applying Invalid Id', async () => {
      const response = await request(server)
        .post(`/food/partner/restaurant/${invalid_restaurnat_id}/submit`)
        .set('Authorization', `Bearer ${partner_token}`);
      expect(response.statusCode).toStrictEqual(404);
      expect(response.body.errors).toStrictEqual([
        {
          message: 'Restaurant not found',
          code: 0,
        },
      ]);
    });
    test('Applying valid Id', async () => {
      const response = await request(server)
        .post(`/food/partner/restaurant/${approved_restaurnat_id}/submit`)
        .set('Authorization', `Bearer ${partner_token}`);
      expect(response.statusCode).toStrictEqual(400);
      expect(response.body.errors).toStrictEqual([
        {
          message:
            'Restaurant Cannot be submitted "not in draft/rejected state"',
          code: 0,
        },
      ]);
    });
  });
  describe('Test cases for POST food/partner/restaurant/{id}/sendOtp/ownerContact', () => {
    test('Sending Otp to verify owner_contact_number', async () => {
      sample_request.owner_contact_number = '+919879870000';
      const response = await request(server)
        .post(
          `/food/partner/restaurant/${test_restaurnat_id}/sendOtp/ownerContact`
        )
        .set('Authorization', `Bearer ${partner_token}`)
        .send({
          phone: sample_request.owner_contact_number,
        });
      expect(response.statusCode).toStrictEqual(200);
    });

    test('Sending Otp to verify owner_email', async () => {
      sample_request.owner_email = 'abc@xyz.com';
      const response = await request(server)
        .post(
          `/food/partner/restaurant/${test_restaurnat_id}/sendOtp/ownerEmail`
        )
        .set('Authorization', `Bearer ${partner_token}`)
        .send({
          email: sample_request.owner_email,
        });
      expect(response.statusCode).toStrictEqual(200);
    });

    test('Verify Otp For owner_contact_number', async () => {
      const response = await request(server)
        .post(
          `/food/partner/restaurant/${test_restaurnat_id}/verifyOtp/ownerContact`
        )
        .set('Authorization', `Bearer ${partner_token}`)
        .send({
          phone: sample_request.owner_contact_number,
          otp: '00000',
        });
      expect(response.statusCode).toStrictEqual(200);
    });

    test('Verify Otp For owner_email', async () => {
      const response = await request(server)
        .post(
          `/food/partner/restaurant/${test_restaurnat_id}/verifyOtp/ownerEmail`
        )
        .set('Authorization', `Bearer ${partner_token}`)
        .send({
          email: sample_request.owner_email,
          otp: '00000',
        });
      expect(response.statusCode).toStrictEqual(200);
    });
  });

  describe('Test cases for POST food/partner/restaurant/{id}/verifyPostalCode', () => {
    test('Applying Invalid Token', async () => {
      sample_request.postal_code = '123000';
      const response = await request(server)
        .post(`/food/partner/restaurant/${test_restaurnat_id}/verifyPostalCode`)
        .set('Authorization', `Bearer ${invalid_token}`)
        .send({
          postal_code: sample_request.postal_code,
        });
      expect(response.statusCode).toStrictEqual(403);
      expect(response.body.errors).toStrictEqual([
        {message: 'forbidden', code: 0},
      ]);
    });
    test('Applying Invalid Restaurnat ID', async () => {
      sample_request.postal_code = '123000';
      const response = await request(server)
        .post(
          `/food/partner/restaurant/${invalid_restaurnat_id}/verifyPostalCode`
        )
        .set('Authorization', `Bearer ${partner_token}`)
        .send({
          postal_code: sample_request.postal_code,
        });
      expect(response.statusCode).toStrictEqual(404);
      expect(response.body.errors).toStrictEqual([
        {message: 'Restaurant not found', code: 0},
      ]);
    });
    test('Applying valid Restaurnat ID | Valid Postal Code.', async () => {
      sample_request.postal_code = '123000';
      const response = await request(server)
        .post(`/food/partner/restaurant/${test_restaurnat_id}/verifyPostalCode`)
        .set('Authorization', `Bearer ${partner_token}`)
        .send({
          postal_code: sample_request.postal_code,
        });
      expect(response.statusCode).toStrictEqual(200);
      expect(response.body.result.msg).toStrictEqual('verified');
    });
    test('Checking Submit Restaurnat API', async () => {
      const response = await request(server)
        .post(`/food/partner/restaurant/${test_restaurnat_id}/submit`)
        .set('Authorization', `Bearer ${partner_token}`);
      expect(response.statusCode).toStrictEqual(400);
      expect(response.body.errors).toStrictEqual([
        {message: '"document_sign_number_verified" must be [true]', code: 0},
      ]);
    });
  });
  describe('Test cases for POST food/partner/restaurant/{id}/sendOtp/documentSignature', () => {
    test('Applying Invalid Token', async () => {
      sample_request.document_sign_number = '9879879879';
      const response = await request(server)
        .post(
          `/food/partner/restaurant/${test_restaurnat_id}/sendOtp/documentSignature`
        )
        .set('Authorization', `Bearer ${invalid_token}`)
        .send({
          phone: sample_request.document_sign_number,
        });
      expect(response.statusCode).toStrictEqual(403);
      expect(response.body.errors).toStrictEqual([
        {message: 'forbidden', code: 0},
      ]);
    });
    test('Applying Invalid Restaurnat ID', async () => {
      sample_request.document_sign_number = '9879879879';
      const response = await request(server)
        .post(
          `/food/partner/restaurant/${invalid_restaurnat_id}/sendOtp/documentSignature`
        )
        .set('Authorization', `Bearer ${partner_token}`)
        .send({
          phone: sample_request.document_sign_number,
        });
      expect(response.statusCode).toStrictEqual(404);
      expect(response.body.errors).toStrictEqual([
        {message: 'Restaurant not found', code: 0},
      ]);
    });
    test('Applying valid Restaurnat ID', async () => {
      sample_request.document_sign_number = '+919879879879';
      const response = await request(server)
        .post(
          `/food/partner/restaurant/${test_restaurnat_id}/sendOtp/documentSignature`
        )
        .set('Authorization', `Bearer ${partner_token}`)
        .send({
          phone: sample_request.document_sign_number,
        });
      expect(response.statusCode).toStrictEqual(200);
      expect(response.body.result).toStrictEqual({msg: 'OTP sent'});
    });
  });
  describe('Test cases for POST food/partner/restaurant/{id}/verifyOtp/documentSignature', () => {
    test('Applying Invalid Token', async () => {
      sample_request.document_sign_number = '9879879879';
      const response = await request(server)
        .post(
          `/food/partner/restaurant/${test_restaurnat_id}/verifyOtp/documentSignature`
        )
        .set('Authorization', `Bearer ${invalid_token}`)
        .send({
          phone: sample_request.document_sign_number,
          otp: '00000',
        });
      expect(response.statusCode).toStrictEqual(403);
      expect(response.body.errors).toStrictEqual([
        {message: 'forbidden', code: 0},
      ]);
    });
    test('Applying Invalid Restaurnat ID', async () => {
      sample_request.document_sign_number = '9879879879';
      const response = await request(server)
        .post(
          `/food/partner/restaurant/${invalid_restaurnat_id}/verifyOtp/documentSignature`
        )
        .set('Authorization', `Bearer ${partner_token}`)
        .send({
          phone: sample_request.document_sign_number,
          otp: '00000',
        });
      expect(response.statusCode).toStrictEqual(404);
      expect(response.body.errors).toStrictEqual([
        {message: 'Restaurant not found', code: 0},
      ]);
    });
    test('Applying valid Restaurnat ID', async () => {
      sample_request.document_sign_number = '+919879879879';
      const response = await request(server)
        .post(
          `/food/partner/restaurant/${test_restaurnat_id}/verifyOtp/documentSignature`
        )
        .set('Authorization', `Bearer ${partner_token}`)
        .send({
          phone: sample_request.document_sign_number,
          otp: '00000',
        });
      expect(response.statusCode).toStrictEqual(200);
      expect(response.body.result).toStrictEqual({msg: 'otp validated'});
    });
    test('Checking Submit Restaurnat API', async () => {
      const response = await request(server)
        .post(`/food/partner/restaurant/${test_restaurnat_id}/submit`)
        .set('Authorization', `Bearer ${partner_token}`);
      expect(response.statusCode).toStrictEqual(400);
      expect(response.body.errors).toStrictEqual([
        {message: '"ifsc_verified" must be [true]', code: 0},
      ]);
    });
  });
  describe('Test cases for POST food/partner/restaurant/{id}/verifyGstinNumber', () => {
    test('Applying Invalid Token', async () => {
      sample_request.gstin_number = 'XYZ12345678';
      const response = await request(server)
        .post(
          `/food/partner/restaurant/${test_restaurnat_id}/verifyGstinNumber`
        )
        .set('Authorization', `Bearer ${invalid_token}`)
        .send({
          gstin_number: sample_request.gstin_number,
        });
      expect(response.statusCode).toStrictEqual(403);
      expect(response.body.errors).toStrictEqual([
        {message: 'forbidden', code: 0},
      ]);
    });
    test('Applying Invalid Restaurnat ID', async () => {
      sample_request.gstin_number = 'XYZ12345678';
      const response = await request(server)
        .post(
          `/food/partner/restaurant/${invalid_restaurnat_id}/verifyGstinNumber`
        )
        .set('Authorization', `Bearer ${partner_token}`)
        .send({
          gstin_number: sample_request.gstin_number,
        });
      expect(response.statusCode).toStrictEqual(404);
      expect(response.body.errors).toStrictEqual([
        {message: 'Restaurant not found', code: 0},
      ]);
    });
    test('Applying valid Restaurnat ID', async () => {
      sample_request.gstin_number = 'AWOPA1234567890';
      const response = await request(server)
        .post(
          `/food/partner/restaurant/${test_restaurnat_id}/verifyGstinNumber`
        )
        .set('Authorization', `Bearer ${partner_token}`)
        .send({
          gstin_number: sample_request.gstin_number,
        });
      expect(response.statusCode).toStrictEqual(200);
      expect(response.body.result.msg).toStrictEqual('verified');
    });
    test('Checking Submit Restaurnat API | It Need to throw Error Because lat & long are Out of Area.', async () => {
      const response = await request(server)
        .post(`/food/partner/restaurant/${test_restaurnat_id}/submit`)
        .set('Authorization', `Bearer ${partner_token}`);
      expect(response.statusCode).toStrictEqual(400);
      expect(response.body.errors).toStrictEqual([
        {message: '"ifsc_verified" must be [true]', code: 0},
      ]);
    });
  });
  describe('Test cases for POST food/partner/restaurant/{id}/verifyPanNumber', () => {
    test('Applying Invalid Token', async () => {
      sample_request.pan_number = 'XYZ12345678';
      const response = await request(server)
        .post(
          `/food/partner/restaurant/${test_restaurnat_id}/sendOtp/verifyPanNumber`
        )
        .set('Authorization', `Bearer ${invalid_token}`)
        .send({
          pan_number: sample_request.pan_number,
        });
      expect(response.statusCode).toStrictEqual(403);
      expect(response.body.errors).toStrictEqual([
        {message: 'forbidden', code: 0},
      ]);
    });
    test('Applying Invalid Restaurnat ID', async () => {
      sample_request.pan_number = 'XYZ12345678';
      const response = await request(server)
        .post(
          `/food/partner/restaurant/${invalid_restaurnat_id}/verifyPanNumber`
        )
        .set('Authorization', `Bearer ${partner_token}`)
        .send({
          pan_number: sample_request.pan_number,
        });
      expect(response.statusCode).toStrictEqual(404);
      expect(response.body.errors).toStrictEqual([
        {message: 'Restaurant not found', code: 0},
      ]);
    });
    test('Applying valid Restaurnat ID ', async () => {
      sample_request.pan_number = 'AWOPA12345';
      const response = await request(server)
        .post(`/food/partner/restaurant/${test_restaurnat_id}/verifyPanNumber`)
        .set('Authorization', `Bearer ${partner_token}`)
        .send({
          pan_number: sample_request.pan_number,
        });
      expect(response.statusCode).toStrictEqual(200);
      expect(response.body.result).toStrictEqual({msg: 'verified'});
    });
    test('Checking Submit Restaurnat API', async () => {
      const response = await request(server)
        .post(`/food/partner/restaurant/${test_restaurnat_id}/submit`)
        .set('Authorization', `Bearer ${partner_token}`);
      expect(response.statusCode).toStrictEqual(400);
      expect(response.body.errors).toStrictEqual([
        {message: '"ifsc_verified" must be [true]', code: 0},
      ]);
    });
  });
  describe('Test cases for POST food/partner/restaurant/{id}/verifyIfscCode', () => {
    test('Applying Invalid Token', async () => {
      sample_request.ifsc_code = 'IFS1234567';
      const response = await request(server)
        .post(`/food/partner/restaurant/${test_restaurnat_id}/verifyIfscCode`)
        .set('Authorization', `Bearer ${invalid_token}`)
        .send({
          ifsc_code: sample_request.ifsc_code,
        });
      expect(response.statusCode).toStrictEqual(403);
      expect(response.body.errors).toStrictEqual([
        {message: 'forbidden', code: 0},
      ]);
    });
    test('Applying Invalid Restaurnat ID', async () => {
      sample_request.ifsc_code = 'IFS1234567';
      const response = await request(server)
        .post(
          `/food/partner/restaurant/${invalid_restaurnat_id}/verifyIfscCode`
        )
        .set('Authorization', `Bearer ${partner_token}`)
        .send({
          ifsc_code: sample_request.ifsc_code,
        });
      expect(response.statusCode).toStrictEqual(404);
      expect(response.body.errors).toStrictEqual([
        {message: 'Restaurant not found', code: 0},
      ]);
    });
    test('Applying valid Restaurnat ID | Valid IFSC Code.', async () => {
      sample_request.ifsc_code = 'KARB0000001';
      const response = await request(server)
        .post(`/food/partner/restaurant/${test_restaurnat_id}/verifyIfscCode`)
        .set('Authorization', `Bearer ${partner_token}`)
        .send({
          ifsc_code: sample_request.ifsc_code,
        });
      expect(response.statusCode).toStrictEqual(200);
      expect(response.body.result.msg).toStrictEqual('verified');
    });
    // test('Checking Submit Restaurnat API', async () => {
    //   const response = await request(server)
    //     .post(`/food/partner/restaurant/${test_restaurnat_id}/submit`)
    //     .set('Authorization', `Bearer ${partner_token}`);
    //   expect(response.statusCode).toStrictEqual(400);
    //   expect(response.body.errors).toStrictEqual([
    //     {message: 'Location not serviceable.', code: 0},
    //   ]);
    // });
  });
  describe('Test cases for POST food/partner/restaurant/{id}/verifyFssaiCertificate', () => {
    test('Applying Invalid Token', async () => {
      sample_request.fssai_cert_number = 'ABC1234567';
      const response = await request(server)
        .post(
          `/food/partner/restaurant/${test_restaurnat_id}/verifyFssaiCertificate`
        )
        .set('Authorization', `Bearer ${invalid_token}`)
        .send({
          fssai_cert_number: sample_request.fssai_cert_number,
        });
      expect(response.statusCode).toStrictEqual(403);
      expect(response.body.errors).toStrictEqual([
        {message: 'forbidden', code: 0},
      ]);
    });
    test('Applying Invalid Restaurnat ID', async () => {
      sample_request.fssai_cert_number = 'ABC1234567';
      const response = await request(server)
        .post(
          `/food/partner/restaurant/${invalid_restaurnat_id}/verifyFssaiCertificate`
        )
        .set('Authorization', `Bearer ${partner_token}`)
        .send({
          fssai_cert_number: sample_request.fssai_cert_number,
        });
      expect(response.statusCode).toStrictEqual(404);
      expect(response.body.errors).toStrictEqual([
        {message: 'Restaurant not found', code: 0},
      ]);
    });
    test('Applying valid Restaurnat ID | Valid FSSAI Code.', async () => {
      sample_request.fssai_cert_number = 'FSSAI123456789';
      const response = await request(server)
        .post(
          `/food/partner/restaurant/${test_restaurnat_id}/verifyFssaiCertificate`
        )
        .set('Authorization', `Bearer ${partner_token}`)
        .send({
          fssai_cert_number: sample_request.fssai_cert_number,
        });
      expect(response.statusCode).toStrictEqual(200);
      expect(response.body.result).toStrictEqual({msg: 'verified'});
    });
    // test('Checking Submit Restaurnat API | It need to throw Error Becasue Lat & long are outside of Area.', async () => {
    //   const response = await request(server)
    //     .post(`/food/partner/restaurant/${test_restaurnat_id}/submit`)
    //     .set('Authorization', `Bearer ${partner_token}`);
    //   expect(response.statusCode).toStrictEqual(400);
    //   expect(response.body.errors).toStrictEqual([
    //     {message: 'Location not serviceable.', code: 0},
    //   ]);
    // });
    test('Adding Lat & long value Inside of area.', async () => {
      mocksaveS3Files();
      mocksaveS3File();
      mockgenerateDownloadFileURL();
      sample_request.city_id = 'd7aa9876-1ed0-4c47-831d-cf2e05d3fc91';
      sample_request.area_id = '52c63582-2f9d-4249-964c-0d24c7725377';
      sample_request.lat = 18.923073;
      sample_request.long = 72.833259;
      const response = await request(server)
        .put(`/food/partner/restaurant/${test_restaurnat_id}`)
        .set('Authorization', `Bearer ${partner_token}`)
        .send(sample_request);
      expect(response.statusCode).toStrictEqual(200);
    });
    test('Checking Submit Restaurnat API', async () => {
      const response = await request(server)
        .post(`/food/partner/restaurant/${test_restaurnat_id}/submit`)
        .set('Authorization', `Bearer ${partner_token}`);
      expect(response.statusCode).toStrictEqual(200);
      expect(response.body.result).not.toEqual({});
      expect(response.body.result.name).toBe('Restaurant name');
      expect(response.body.result.branch_name).toBe('Restaurant branch name');
    });
  });
  describe('Test cases for POST food/admin/restaurant/{id}/approval/admin', () => {
    test('Applying Invalid Token', async () => {
      mockgetAdminDetails();
      mockSendSQSMessage();
      const response = await request(server)
        .post(`/food/admin/restaurant/${test_restaurnat_id}/approval/admin`)
        .set('Authorization', `Bearer ${invalid_token}`)
        .send({
          approved: true,
          status_comments: 'All Looks Good',
        });
      expect(response.statusCode).toStrictEqual(403);
      expect(response.body.errors).toStrictEqual([
        {message: 'forbidden', code: 0},
      ]);
    });
    test('Applying Invalid Restaurnat ID', async () => {
      mockgetAdminDetails();
      mockSendSQSMessage();
      const response = await request(server)
        .post(`/food/admin/restaurant/${invalid_restaurnat_id}/approval/admin`)
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          approved: true,
          status_comments: 'All Looks Good',
        });
      expect(response.statusCode).toStrictEqual(404);
      expect(response.body.errors).toStrictEqual([
        {message: 'Restaurant not found', code: 0},
      ]);
    });
    test('Applying valid Restaurnat ID | Valid Token', async () => {
      mockgetAdminDetails();
      mockSendSQSMessage();
      mocksaveS3Files();
      mocksaveS3File();
      mockgenerateDownloadFileURL();
      const response = await request(server)
        .post(`/food/admin/restaurant/${test_restaurnat_id}/approval/admin`)
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          approved: true,
          status_comments: 'All Looks Good',
        });
      expect(response.statusCode).toStrictEqual(200);
      expect(response.body.message).toStrictEqual('Successful Response');
    });
  });
  describe('Test cases for POST food/admin/restaurant/{id}/approval/catalog', () => {
    test('Applying Invalid Token', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .post(`/food/admin/restaurant/${test_restaurnat_id}/approval/catalog`)
        .set('Authorization', `Bearer ${invalid_token}`);
      expect(response.statusCode).toStrictEqual(403);
      expect(response.body.errors).toStrictEqual([
        {message: 'forbidden', code: 0},
      ]);
    });
    test('Applying Invalid Restaurnat ID', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .post(
          `/food/admin/restaurant/${invalid_restaurnat_id}/approval/catalog`
        )
        .set('Authorization', `Bearer ${admin_token}`);
      expect(response.statusCode).toStrictEqual(404);
      expect(response.body.errors).toStrictEqual([
        {message: 'Restaurant not found', code: 0},
      ]);
    });
    test('Applying valid Restaurnat ID | Valid Token', async () => {
      mockgetAdminDetails();
      mockSendSQSMessage();
      mockEsIndexData();
      mocksaveS3Files();
      mocksaveS3File();
      mockgenerateDownloadFileURL();
      mockCreateCashfreeBeneficicary();
      const response = await request(server)
        .post(`/food/admin/restaurant/${test_restaurnat_id}/approval/catalog`)
        .set('Authorization', `Bearer ${admin_token}`);
      expect(response.statusCode).toStrictEqual(200);
      expect(response.body.message).toStrictEqual('Successful Response');
    });
  });
  describe('Test cases for POST food/restaurant/serviceable', () => {
    test('Applying Invalid restaurant ID | Need to throw error', async () => {
      const response = await request(server)
        .post('/food/restaurant/serviceable')
        .send({
          restaurant_id: invalid_restaurnat_id,
          customer_coordinates: {
            latitude: sample_request.lat,
            longitude: sample_request.long,
          },
        });
      expect(response.body.status).toBe(false);
      expect(response.body.statusCode).toBe(400);
      expect(response.body.errors).toStrictEqual([
        {message: 'restaurant_does_not_exists', code: 1002},
      ]);
    });
    test('By default approved restaurant will be disabled | Need to throw error', async () => {
      const response = await request(server)
        .post('/food/restaurant/serviceable')
        .send({
          restaurant_id: test_restaurnat_id,
          customer_coordinates: {
            latitude: 5.617014045322473,
            longitude: 6.3422468914941215,
          },
        });
      expect(response.body.status).toBe(false);
      expect(response.body.statusCode).toBe(400);
      expect(response.body.errors).toStrictEqual([
        {code: 1003, message: 'restaurant is not active'},
      ]);
    });
    test('Applying valid restaurant ID | far location | Need to throw error', async () => {
      mockgetAdminDetails();
      const active_response = await request(server)
        .put(`/food/admin/restaurant/${test_restaurnat_id}/disable`)
        .set('Authorization', `Bearer ${admin_token}`)
        .send({disable: false});
      expect(active_response.body.status).toBe(true);
      expect(active_response.body.statusCode).toBe(200);

      const far_location_response = await request(server)
        .post('/food/restaurant/serviceable')
        .send({
          restaurant_id: test_restaurnat_id,
          customer_coordinates: {
            latitude: 5.617014045322473,
            longitude: 6.3422468914941215,
          },
        });
      expect(far_location_response.body.status).toBe(true);
      expect(far_location_response.body.statusCode).toBe(200);
      expect(far_location_response.body.message).toBe('Successful Response');
      expect(far_location_response.body.result.address_serviceable).toBe(false);
      expect(far_location_response.body.result.message).toBe(
        'Delivery location is too far from restaurant location'
      );

      mockAddressDeliverabilityCheck();
      const nearby_location_response = await request(server)
        .post('/food/restaurant/serviceable')
        .send({
          restaurant_id: test_restaurnat_id,
          customer_coordinates: {
            latitude: sample_request.lat,
            longitude: sample_request.long,
          },
        });
      expect(nearby_location_response.body.status).toBe(true);
      expect(nearby_location_response.body.statusCode).toBe(200);
      expect(nearby_location_response.body.result.address_serviceable).toBe(
        true
      );
    });
  });
  describe('Test case for PUT food/admin/restaurant/{id}/disable | disable restaurant by admin', () => {
    test('Not Provide status | Need to throw error', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .put(`/food/admin/restaurant/${test_restaurnat_id}/disable`)
        .set('Authorization', `Bearer ${admin_token}`);
      expect(response.body.status).toBe(false);
      expect(response.body.statusCode).toBe(400);
      expect(response.body.errors).toStrictEqual([
        {message: 'Not Disable', code: 0},
      ]);
    });
    test('Not in disable | but try to active |  Need to throw error', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .put(`/food/admin/restaurant/${test_restaurnat_id}/disable`)
        .set('Authorization', `Bearer ${admin_token}`)
        .send({disable: false});
      expect(response.body.status).toBe(false);
      expect(response.body.statusCode).toBe(400);
      expect(response.body.errors).toStrictEqual([
        {message: 'Not Disable', code: 0},
      ]);
    });
    test('Provide status', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .put(`/food/admin/restaurant/${test_restaurnat_id}/disable`)
        .set('Authorization', `Bearer ${admin_token}`)
        .send({disable: true});
      expect(response.body.status).toBe(true);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.message).toBe('Successful Response');
      expect(response.body.result).toBe('Updated Successfully');
    });
    test('Already in disable |  Need to throw error', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .put(`/food/admin/restaurant/${test_restaurnat_id}/disable`)
        .set('Authorization', `Bearer ${admin_token}`)
        .send({disable: true});
      expect(response.body.status).toBe(false);
      expect(response.body.statusCode).toBe(400);
      expect(response.body.errors).toStrictEqual([
        {message: 'Not Active', code: 0},
      ]);
    });
    describe('Test cases for POST food/restaurant/serviceable | valid Req | Need to Throw error | restaurant disable by admin', () => {
      test('check servicibility', async () => {
        const response = await request(server)
          .post('/food/restaurant/serviceable')
          .send({
            restaurant_id: test_restaurnat_id,
            customer_coordinates: {
              latitude: sample_request.lat,
              longitude: sample_request.long,
            },
          });
        expect(response.body.status).toBe(false);
        expect(response.body.statusCode).toBe(400);
        expect(response.body.errors).toStrictEqual([
          {message: 'restaurant is not active', code: 1003},
        ]);
      });
    });
    test('active restaurant', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .put(`/food/admin/restaurant/${test_restaurnat_id}/disable`)
        .set('Authorization', `Bearer ${admin_token}`)
        .send({disable: false});
      expect(response.body.status).toBe(true);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.message).toBe('Successful Response');
      expect(response.body.result).toBe('Updated Successfully');
    });
  });
});

describe('restaurant does not required to verify Pan-Number,GSTIN-Number, FSSAI-Number, Postal-Code ', () => {
  let test_restaurnat_id: string;
  test('Creating Restaurant Name', async () => {
    const response = await request(server)
      .post('/food/partner/restaurant')
      .set('Authorization', `Bearer ${partner_token}`)
      .send({
        name: 'Test restaurnat 2',
      });
    expect(response.statusCode).toBe(201);
    expect(response.body.status).toBe(true);
    test_restaurnat_id = response.body.result.id;
  });
  test('Successful Request', async () => {
    mocksaveS3Files();
    mocksaveS3File();
    mockgenerateDownloadFileURL();
    const response = await request(server)
      .put(`/food/partner/restaurant/${test_restaurnat_id}`)
      .set('Authorization', `Bearer ${partner_token}`)
      .send(updated_sample_request);
    expect(response.statusCode).toStrictEqual(200);
    expect(response.body.status).toBe(true);
  });
});
describe('restaurant does not required fssai_ack_document_type, menu_document_type, fssai_cert_document_type, pan_document_type, gstin_document_type, bank_document_type, kyc_document_type  ', () => {
  let test_restaurnat_id: string;
  test('Creating Restaurant Name', async () => {
    const response = await request(server)
      .post('/food/partner/restaurant')
      .set('Authorization', `Bearer ${partner_token}`)
      .send({
        name: 'Test restaurnat 3',
      });
    expect(response.statusCode).toBe(201);
    expect(response.body.status).toBe(true);
    test_restaurnat_id = response.body.result.id;
  });
  test('Pass fssai_ack_document_type | Need to throw Error ', async () => {
    const response = await request(server)
      .put(`/food/partner/restaurant/${test_restaurnat_id}`)
      .set('Authorization', `Bearer ${partner_token}`)
      .send({
        status: 'draft',
        fssai_ack_document_type: 'image',
        fssai_ack_document: {
          name: '64bfafb6-0000-4b64-0000-ca981f5819eb.pdf',
        },
      });
    expect(response.body.statusCode).toBe(400);
    expect(response.body.status).toBe(false);
    expect(response.body.errors).toStrictEqual([
      {message: '"fssai_ack_document_type" is not allowed', code: 0},
    ]);
  });
  test('Pass menu_document_type | Need to throw Error ', async () => {
    const response = await request(server)
      .put(`/food/partner/restaurant/${test_restaurnat_id}`)
      .set('Authorization', `Bearer ${partner_token}`)
      .send({
        status: 'draft',
        menu_document_type: 'image',
        menu_documents: [
          {
            name: '64bfafb6-0000-4b64-0000-ca981f5819eb.pdf',
          },
        ],
      });
    expect(response.body.statusCode).toBe(400);
    expect(response.body.status).toBe(false);
    expect(response.body.errors).toStrictEqual([
      {message: '"menu_document_type" is not allowed', code: 0},
    ]);
  });
  test('Pass fssai_cert_document_type | Need to throw Error ', async () => {
    const response = await request(server)
      .put(`/food/partner/restaurant/${test_restaurnat_id}`)
      .set('Authorization', `Bearer ${partner_token}`)
      .send({
        status: 'draft',
        fssai_cert_document_type: 'image',
        fssai_cert_document: {
          name: '64bfafb6-0000-4b64-0000-ca981f5819eb.pdf',
        },
      });
    expect(response.body.statusCode).toBe(400);
    expect(response.body.status).toBe(false);
    expect(response.body.errors).toStrictEqual([
      {message: '"fssai_cert_document_type" is not allowed', code: 0},
    ]);
  });
  test('Pass pan_document_type | Need to throw Error ', async () => {
    const response = await request(server)
      .put(`/food/partner/restaurant/${test_restaurnat_id}`)
      .set('Authorization', `Bearer ${partner_token}`)
      .send({
        status: 'draft',
        pan_document_type: 'image',
        pan_document: {
          name: '64bfafb6-0000-4b64-0000-ca981f5819eb.pdf',
        },
      });
    expect(response.body.statusCode).toBe(400);
    expect(response.body.status).toBe(false);
    expect(response.body.errors).toStrictEqual([
      {message: '"pan_document_type" is not allowed', code: 0},
    ]);
  });
  test('Pass gstin_document_type | Need to throw Error ', async () => {
    const response = await request(server)
      .put(`/food/partner/restaurant/${test_restaurnat_id}`)
      .set('Authorization', `Bearer ${partner_token}`)
      .send({
        status: 'draft',
        gstin_document_type: 'image',
        gstin_document: {
          name: '64bfafb6-0000-4b64-0000-ca981f5819eb.pdf',
        },
      });
    expect(response.body.statusCode).toBe(400);
    expect(response.body.status).toBe(false);
    expect(response.body.errors).toStrictEqual([
      {message: '"gstin_document_type" is not allowed', code: 0},
    ]);
  });
  test('Pass bank_document_type | Need to throw Error ', async () => {
    const response = await request(server)
      .put(`/food/partner/restaurant/${test_restaurnat_id}`)
      .set('Authorization', `Bearer ${partner_token}`)
      .send({
        status: 'draft',
        bank_document_type: 'image',
        bank_document: {
          name: '64bfafb6-0000-4b64-0000-ca981f5819eb.pdf',
        },
      });
    expect(response.body.statusCode).toBe(400);
    expect(response.body.status).toBe(false);
    expect(response.body.errors).toStrictEqual([
      {message: '"bank_document_type" is not allowed', code: 0},
    ]);
  });
  test('Pass kyc_document_type | Need to throw Error ', async () => {
    const response = await request(server)
      .put(`/food/partner/restaurant/${test_restaurnat_id}`)
      .set('Authorization', `Bearer ${partner_token}`)
      .send({
        status: 'draft',
        kyc_document_type: 'image',
        kyc_document: {
          name: '64bfafb6-0000-4b64-0000-ca981f5819eb.pdf',
        },
      });
    expect(response.body.statusCode).toBe(400);
    expect(response.body.status).toBe(false);
    expect(response.body.errors).toStrictEqual([
      {message: '"kyc_document_type" is not allowed', code: 0},
    ]);
  });
});
describe(' Invalid File Uploaded  ', () => {
  let test_restaurnat_id: string;
  test('Creating Restaurant Name', async () => {
    const response = await request(server)
      .post('/food/partner/restaurant')
      .set('Authorization', `Bearer ${partner_token}`)
      .send({
        name: 'Test restaurnat 4',
      });
    expect(response.statusCode).toBe(201);
    expect(response.body.status).toBe(true);
    test_restaurnat_id = response.body.result.id;
  });
  test('Pass mp3 file uploaded | Need to throw Error ', async () => {
    mocksaveS3MP3Files();
    const response = await request(server)
      .put(`/food/partner/restaurant/${test_restaurnat_id}`)
      .set('Authorization', `Bearer ${partner_token}`)
      .send({
        status: 'draft',
        menu_documents: [
          {
            name: '64bfafb6-0000-4b64-0000-ca981f5819eb.jpg',
          },
          {
            name: '64bfafb6-0000-4b64-0000-ca981f5819eb.mp3',
          },
        ],
      });
    expect(response.body.errors).toStrictEqual([
      {
        message:
          'Invalid File Type Uploaded, Valid Types : [ png,jpeg,jpg,pdf,doc,docx,odt ]',
        code: 0,
      },
    ]);
    expect(response.body.statusCode).toBe(400);
    expect(response.body.status).toBe(false);
  });
  test('Pass mp3 file As restaurant images | Need to throw Error ', async () => {
    mocksaveS3MP3Files();
    const response = await request(server)
      .put(`/food/partner/restaurant/${test_restaurnat_id}`)
      .set('Authorization', `Bearer ${partner_token}`)
      .send({
        status: 'draft',
        images: [
          {
            name: '64bfafb6-0000-4b64-0000-ca981f5819eb.jpg',
          },
          {
            name: '64bfafb6-0000-4b64-0000-ca981f5819eb.mp3',
          },
        ],
      });
    expect(response.body.errors).toStrictEqual([
      {
        message: 'Invalid File Type Uploaded, Valid Types : [ png,jpeg,jpg ]',
        code: 0,
      },
    ]);
    expect(response.body.statusCode).toBe(400);
    expect(response.body.status).toBe(false);
  });
  test('Pass mp3 file As restaurant image | Need to throw Error ', async () => {
    mocksaveS3MP3File();
    const response = await request(server)
      .put(`/food/partner/restaurant/${test_restaurnat_id}`)
      .set('Authorization', `Bearer ${partner_token}`)
      .send({
        status: 'draft',
        image: {
          name: '64bfafb6-0000-4b64-0000-ca981f5819eb.mp3',
        },
      });
    expect(response.body.errors).toStrictEqual([
      {
        message: 'Invalid File Type Uploaded, Valid Types : [ png,jpeg,jpg ]',
        code: 0,
      },
    ]);
    expect(response.body.statusCode).toBe(400);
    expect(response.body.status).toBe(false);
  });
});

describe('Vendor Get Restaurant', () => {
  test('Vednor get restaurnat details', async () => {
    const response = await request(server)
      .get('/food/vendor/restaurant')
      .set('Authorization', `Bearer ${vendor_token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe(true);
    expect(response.body.result[0].like_count).toBe(100000);
    expect(response.body.result[0].dislike_count).toBe(0);
    expect(response.body.result[0].like_count_label).toBe('100.0K');
  });
});
