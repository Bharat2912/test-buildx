/* eslint-disable @typescript-eslint/no-explicit-any */
import request from 'supertest';
import {createTestServer} from './utils/init';
import {Application} from 'express';
import {
  signToken,
  loadMockSeedData,
  testCasesClosingTasks,
} from './utils/utils';
import logger from '../utilities/logger/winston_logger';
import {
  mockgetAdminDetails,
  mockCreateCashfreeBeneficicary,
} from './utils/mock_services';

jest.mock('axios');

let server: Application;
let vendor_token: string;
let admin_token: string;
const vendor_outlet_id = 'b0909e52-a731-4665-a791-ee6479008805';
let payout_account_id: string;
const non_existing_payout_acc_id = '3c44327c-ed51-4808-821f-28caeca7d682';
const invalid_account_details = {
  name: 'Invalid Account',
  ifsc_code: 'BOTM0XEEMRA',
  bank_account_number: '125425154251',
};
const valid_account_details = {
  name: 'My Saving',
  ifsc_code: 'KKBK0000261',
  bank_account_number: '125425154251',
};
beforeAll(async () => {
  server = await createTestServer();

  await loadMockSeedData('restaurant');
  logger.info('Jest DataBase Connection Created');
  vendor_token = signToken({
    id: '33c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
    data: {
      type: 'restaurant',
      outlet_id: vendor_outlet_id,
      force_reset_password: false,
    },
    user_type: 'vendor',
  });
  admin_token = signToken({
    id: '64bfafb6-c273-4b64-a0fc-ca981f5819eb',
    user_type: 'admin',
  });
});

afterAll(async () => {
  await testCasesClosingTasks();
});

describe('PAYOUT_ACCOUNT TESTING', () => {
  describe('Vendor', () => {
    test('READ PAYOUT NOT HAVE ANY EXISTING ACCOUNT | Need to throw error', async () => {
      const getPayoutAccByIDResponse = await request(server)
        .get('/food/vendor/payout_account/')
        .set('Authorization', `Bearer ${vendor_token}`)
        .send();
      expect(getPayoutAccByIDResponse.body.status).toBe(false);
      expect(getPayoutAccByIDResponse.body.statusCode).toBe(404);
      expect(getPayoutAccByIDResponse.body.errors).toStrictEqual([
        {
          message: 'payout account not found',
          code: 1085,
        },
      ]);
    });
    test('CREATE PAYOUT ACCOUNT | Token not Provided | Need to throw error', async () => {
      const postPayoutAccountResponse = await request(server)
        .post('/food/vendor/payout_account')
        .send(valid_account_details);
      expect(postPayoutAccountResponse.body.status).toBe(false);
      expect(postPayoutAccountResponse.body.statusCode).toBe(401);
      expect(postPayoutAccountResponse.body.errors).toStrictEqual([
        {code: 0, message: 'Authorization Error'},
      ]);
    });
    test('CREATE PAYOUT ACCOUNT | Empty  name | Need to throw error', async () => {
      const postPayoutAccountResponse = await request(server)
        .post('/food/vendor/payout_account')
        .set('Authorization', `Bearer ${vendor_token}`)
        .send({
          name: '',
          ifsc_code: 'KKBK0000261',
          bank_account_number: '125425154251',
        });
      expect(postPayoutAccountResponse.body.status).toBe(false);
      expect(postPayoutAccountResponse.body.statusCode).toBe(400);
      expect(postPayoutAccountResponse.body.errors).toStrictEqual([
        {message: '"name" is not allowed to be empty', code: 1000},
      ]);
    });
    test('CREATE PAYOUT ACCOUNT | Empty  ifsc code | Need to throw error', async () => {
      const postPayoutAccountResponse = await request(server)
        .post('/food/vendor/payout_account')
        .set('Authorization', `Bearer ${vendor_token}`)
        .send({
          name: 'My Saving',
          ifsc_code: '',
          bank_account_number: '125425154251',
        });
      expect(postPayoutAccountResponse.body.status).toBe(false);
      expect(postPayoutAccountResponse.body.statusCode).toBe(400);
      expect(postPayoutAccountResponse.body.errors).toStrictEqual([
        {code: 1000, message: '"ifsc_code" is not allowed to be empty'},
      ]);
    });
    test('CREATE PAYOUT ACCOUNT | Invalid IFSC | Need to throw error', async () => {
      const postPayoutAccountResponse = await request(server)
        .post('/food/vendor/payout_account')
        .set('Authorization', `Bearer ${vendor_token}`)
        .send(invalid_account_details);
      expect(postPayoutAccountResponse.body.statusCode).toBe(400);
      expect(postPayoutAccountResponse.body.status).toBe(false);
      expect(postPayoutAccountResponse.body.errors).toStrictEqual([
        {message: 'bank name not found for ifsc', code: 1086},
      ]);
    });
    test('CREATE PAYOUT ACCOUNT | Empty  bank account number | Need to throw error', async () => {
      const postPayoutAccountResponse = await request(server)
        .post('/food/vendor/payout_account')
        .set('Authorization', `Bearer ${vendor_token}`)
        .send({
          name: 'My Saving',
          ifsc_code: 'KKBK0000261',
          bank_account_number: '',
        });
      expect(postPayoutAccountResponse.body.status).toBe(false);
      expect(postPayoutAccountResponse.body.statusCode).toBe(400);
      expect(postPayoutAccountResponse.body.errors).toStrictEqual([
        {
          message: '"bank_account_number" is not allowed to be empty',
          code: 1000,
        },
      ]);
    });
    test('CREATE PAYOUT ACCOUNT | valid IFSC', async () => {
      const postPayoutAccountResponse = await request(server)
        .post('/food/vendor/payout_account')
        .set('Authorization', `Bearer ${vendor_token}`)
        .send(valid_account_details);
      expect(postPayoutAccountResponse.body.status).toBe(true);
      expect(postPayoutAccountResponse.body.statusCode).toBe(201);
      expect(postPayoutAccountResponse.body.result.restaurant_id).toBe(
        vendor_outlet_id
      );
      expect(postPayoutAccountResponse.body.result.bank_account_number).toBe(
        valid_account_details.bank_account_number
      );
      expect(postPayoutAccountResponse.body.result.name).toBe(
        valid_account_details.name
      );
      expect(postPayoutAccountResponse.body.result.ifsc_code).toBe(
        valid_account_details.ifsc_code
      );
      payout_account_id = postPayoutAccountResponse.body.result.id;
    });
    test('READ PAYOUT EXISTING ACCOUNT BY ID |  Token not Provided | Need to throw error', async () => {
      const getPayoutAccByIDResponse = await request(server)
        .get(`/food/vendor/payout_account/${payout_account_id}`)
        .send();
      expect(getPayoutAccByIDResponse.body.status).toBe(false);
      expect(getPayoutAccByIDResponse.body.statusCode).toBe(401);
      expect(getPayoutAccByIDResponse.body.errors).toStrictEqual([
        {code: 0, message: 'Authorization Error'},
      ]);
    });
    test('READ PAYOUT NON EXISTING ACCOUNT BY ID | Need to throw error', async () => {
      const getPayoutAccByIDResponse = await request(server)
        .get(`/food/vendor/payout_account/${non_existing_payout_acc_id}`)
        .set('Authorization', `Bearer ${vendor_token}`)
        .send();
      expect(getPayoutAccByIDResponse.body.status).toBe(false);
      expect(getPayoutAccByIDResponse.body.statusCode).toBe(404);
      expect(getPayoutAccByIDResponse.body.errors).toStrictEqual([
        {
          message: 'payout account not found',
          code: 1085,
        },
      ]);
    });
    test('READ PAYOUT EXISTING ACCOUNT BY ID', async () => {
      const getPayoutAccByIDResponse = await request(server)
        .get(`/food/vendor/payout_account/${payout_account_id}`)
        .set('Authorization', `Bearer ${vendor_token}`)
        .send();
      expect(getPayoutAccByIDResponse.body.status).toBe(true);
      expect(getPayoutAccByIDResponse.body.statusCode).toBe(200);
      expect(getPayoutAccByIDResponse.body.message).toBe('Successful Response');
      expect(getPayoutAccByIDResponse.body.result.id).toBe(payout_account_id);
      expect(getPayoutAccByIDResponse.body.result.restaurant_id).toBe(
        vendor_outlet_id
      );
      expect(getPayoutAccByIDResponse.body.result.bank_account_number).toBe(
        valid_account_details.bank_account_number
      );
      expect(getPayoutAccByIDResponse.body.result.name).toBe(
        valid_account_details.name
      );
      expect(getPayoutAccByIDResponse.body.result.ifsc_code).toBe(
        valid_account_details.ifsc_code
      );
    });
    test('READ PAYOUT EXISTING ACCOUNT', async () => {
      const getPayoutAccByIDResponse = await request(server)
        .get('/food/vendor/payout_account/')
        .set('Authorization', `Bearer ${vendor_token}`)
        .send();
      expect(getPayoutAccByIDResponse.body.status).toBe(true);
      expect(getPayoutAccByIDResponse.body.statusCode).toBe(200);
      expect(getPayoutAccByIDResponse.body.message).toBe('Successful Response');
      expect(getPayoutAccByIDResponse.body.result[0].id).toBe(
        payout_account_id
      );
      expect(getPayoutAccByIDResponse.body.result[0].restaurant_id).toBe(
        vendor_outlet_id
      );
      expect(getPayoutAccByIDResponse.body.result[0].bank_account_number).toBe(
        valid_account_details.bank_account_number
      );
      expect(getPayoutAccByIDResponse.body.result[0].name).toBe(
        valid_account_details.name
      );
      expect(getPayoutAccByIDResponse.body.result[0].ifsc_code).toBe(
        valid_account_details.ifsc_code
      );
    });
    test('MAKE PRIMARY | EXISTING ACCOUNT | Not Verified', async () => {
      mockCreateCashfreeBeneficicary();
      const makePrimaryPayoutAccResponse = await request(server)
        .put(`/food/vendor/payout_account/${payout_account_id}/makePrimary`)
        .set('Authorization', `Bearer ${vendor_token}`)
        .send();
      expect(makePrimaryPayoutAccResponse.body.status).toBe(false);
      expect(makePrimaryPayoutAccResponse.body.statusCode).toBe(400);
      expect(makePrimaryPayoutAccResponse.body.errors).toStrictEqual([
        {
          message: 'ifsc not verified',
          code: 1087,
        },
      ]);
    });
    test('VERIFY IFSC OF EXISTING ACCOUNT | Token not Provided | Need to throw error', async () => {
      const verifyPayoutAccResponse = await request(server)
        .get(`/food/vendor/payout_account/${payout_account_id}/verifyIfsc`)
        .send();
      expect(verifyPayoutAccResponse.body.status).toBe(false);
      expect(verifyPayoutAccResponse.body.statusCode).toBe(401);
      expect(verifyPayoutAccResponse.body.errors).toStrictEqual([
        {code: 0, message: 'Authorization Error'},
      ]);
    });
    test('VERIFY IFSC OF EXISTING ACCOUNT | Invalid ID | Need to throw error', async () => {
      const verifyPayoutAccResponse = await request(server)
        .put(
          `/food/vendor/payout_account/${non_existing_payout_acc_id}/verifyIfsc`
        )
        .set('Authorization', `Bearer ${vendor_token}`)
        .send();
      expect(verifyPayoutAccResponse.body.status).toBe(false);
      expect(verifyPayoutAccResponse.body.statusCode).toBe(404);
      expect(verifyPayoutAccResponse.body.errors).toStrictEqual([
        {
          message: 'payout account not found',
          code: 1085,
        },
      ]);
    });
    test('VERIFY IFSC OF EXISTING ACCOUNT', async () => {
      const verifyPayoutAccResponse = await request(server)
        .put(`/food/vendor/payout_account/${payout_account_id}/verifyIfsc`)
        .set('Authorization', `Bearer ${vendor_token}`)
        .send();
      expect(verifyPayoutAccResponse.body.status).toBe(true);
      expect(verifyPayoutAccResponse.body.statusCode).toBe(200);
      expect(verifyPayoutAccResponse.body.message).toBe('Successful Response');
      expect(verifyPayoutAccResponse.body.result.id).toBe(payout_account_id);
      expect(verifyPayoutAccResponse.body.result.restaurant_id).toBe(
        vendor_outlet_id
      );
      expect(verifyPayoutAccResponse.body.result.bank_account_number).toBe(
        valid_account_details.bank_account_number
      );
      expect(verifyPayoutAccResponse.body.result.name).toBe(
        valid_account_details.name
      );
      expect(verifyPayoutAccResponse.body.result.ifsc_code).toBe(
        valid_account_details.ifsc_code
      );
      expect(verifyPayoutAccResponse.body.result.ifsc_verified).toBe(true);
      expect(verifyPayoutAccResponse.body.result.is_primary).toBe(false);
      expect(verifyPayoutAccResponse.body.result.beneficiary_details).toBe(
        null
      );
    });
    test('VERIFY IFSC ALREADY VERIFIED EXISTING ACCOUNT | Need to throw error', async () => {
      const verifyPayoutAccResponse = await request(server)
        .put(`/food/vendor/payout_account/${payout_account_id}/verifyIfsc`)
        .set('Authorization', `Bearer ${vendor_token}`)
        .send();
      expect(verifyPayoutAccResponse.body.status).toBe(false);
      expect(verifyPayoutAccResponse.body.statusCode).toBe(400);
      expect(verifyPayoutAccResponse.body.errors).toStrictEqual([
        {
          message: 'payout account ifsc already verified',
          code: 1089,
        },
      ]);
    });
    test('MAKE PRIMARY | EXISTING ACCOUNT | Token not Provided | Need to throw error', async () => {
      const makePrimaryPayoutAccResponse = await request(server)
        .put(`/food/vendor/payout_account/${payout_account_id}/makePrimary`)
        .send();
      expect(makePrimaryPayoutAccResponse.body.status).toBe(false);
      expect(makePrimaryPayoutAccResponse.body.statusCode).toBe(401);
      expect(makePrimaryPayoutAccResponse.body.errors).toStrictEqual([
        {code: 0, message: 'Authorization Error'},
      ]);
    });
    test('MAKE PRIMARY | EXISTING ACCOUNT | Invalid ID | Need to throw error', async () => {
      const makePrimaryPayoutAccResponse = await request(server)
        .put(
          `/food/vendor/payout_account/${non_existing_payout_acc_id}/makePrimary`
        )
        .set('Authorization', `Bearer ${vendor_token}`)
        .send();
      expect(makePrimaryPayoutAccResponse.body.status).toBe(false);
      expect(makePrimaryPayoutAccResponse.body.statusCode).toBe(404);
      expect(makePrimaryPayoutAccResponse.body.errors).toStrictEqual([
        {
          message: 'payout account not found',
          code: 1085,
        },
      ]);
    });
    test('MAKE PRIMARY | EXISTING ACCOUNT | Invalid ID | Need to throw error', async () => {
      mockCreateCashfreeBeneficicary();
      const makePrimaryPayoutAccResponse = await request(server)
        .put(`/food/vendor/payout_account/${payout_account_id}/makePrimary`)
        .set('Authorization', `Bearer ${vendor_token}`)
        .send();
      expect(makePrimaryPayoutAccResponse.body.status).toBe(true);
      expect(makePrimaryPayoutAccResponse.body.statusCode).toBe(200);
      expect(makePrimaryPayoutAccResponse.body.message).toBe(
        'Successful Response'
      );
      expect(makePrimaryPayoutAccResponse.body.result.id).toBe(
        payout_account_id
      );
      expect(makePrimaryPayoutAccResponse.body.result.restaurant_id).toBe(
        vendor_outlet_id
      );
      expect(makePrimaryPayoutAccResponse.body.result.bank_account_number).toBe(
        valid_account_details.bank_account_number
      );
      expect(makePrimaryPayoutAccResponse.body.result.name).toBe(
        valid_account_details.name
      );
      expect(makePrimaryPayoutAccResponse.body.result.ifsc_code).toBe(
        valid_account_details.ifsc_code
      );
      expect(makePrimaryPayoutAccResponse.body.result.ifsc_verified).toBe(true);
      expect(makePrimaryPayoutAccResponse.body.result.is_primary).toBe(true);
      expect(
        makePrimaryPayoutAccResponse.body.result.beneficiary_details
      ).not.toBe(null);
    });
    test('MAKE PRIMARY | ALREADY PRIMARY EXISTING ACCOUNT | | Need to throw error', async () => {
      mockCreateCashfreeBeneficicary();
      const makePrimaryPayoutAccResponse = await request(server)
        .put(`/food/vendor/payout_account/${payout_account_id}/makePrimary`)
        .set('Authorization', `Bearer ${vendor_token}`)
        .send();
      expect(makePrimaryPayoutAccResponse.body.status).toBe(false);
      expect(makePrimaryPayoutAccResponse.body.statusCode).toBe(400);
      expect(makePrimaryPayoutAccResponse.body.errors).toStrictEqual([
        {
          message: 'payout account already primary',
          code: 1088,
        },
      ]);
    });
  });
  describe('Admin', () => {
    beforeEach(async () => {
      mockgetAdminDetails();
    });
    test('READ PAYOUT EXISTING ACCOUNT BY ID |  Token not Provided | Need to throw error', async () => {
      const getPayoutAccByIDResponse = await request(server)
        .get(`/food/admin/payout_account/${payout_account_id}`)
        .send();
      expect(getPayoutAccByIDResponse.body.status).toBe(false);
      expect(getPayoutAccByIDResponse.body.statusCode).toBe(401);
      expect(getPayoutAccByIDResponse.body.errors).toStrictEqual([
        {code: 0, message: 'Authorization Error'},
      ]);
    });
    test('READ PAYOUT NON EXISTING ACCOUNT BY ID | Need to throw error', async () => {
      const getPayoutAccByIDResponse = await request(server)
        .get(`/food/admin/payout_account/${non_existing_payout_acc_id}`)
        .set('Authorization', `Bearer ${admin_token}`)
        .send();
      expect(getPayoutAccByIDResponse.body.status).toBe(false);
      expect(getPayoutAccByIDResponse.body.statusCode).toBe(404);
      expect(getPayoutAccByIDResponse.body.errors).toStrictEqual([
        {
          message: 'payout account not found',
          code: 1085,
        },
      ]);
    });
    test('READ PAYOUT EXISTING ACCOUNT BY ID', async () => {
      const getPayoutAccByIDResponse = await request(server)
        .get(`/food/admin/payout_account/${payout_account_id}`)
        .set('Authorization', `Bearer ${admin_token}`)
        .send();
      expect(getPayoutAccByIDResponse.body.status).toBe(true);
      expect(getPayoutAccByIDResponse.body.statusCode).toBe(200);
      expect(getPayoutAccByIDResponse.body.message).toBe('Successful Response');
      expect(getPayoutAccByIDResponse.body.result.id).toBe(payout_account_id);
      expect(getPayoutAccByIDResponse.body.result.restaurant_id).toBe(
        vendor_outlet_id
      );
      expect(getPayoutAccByIDResponse.body.result.bank_account_number).toBe(
        valid_account_details.bank_account_number
      );
      expect(getPayoutAccByIDResponse.body.result.name).toBe(
        valid_account_details.name
      );
      expect(getPayoutAccByIDResponse.body.result.ifsc_code).toBe(
        valid_account_details.ifsc_code
      );
    });
    test('READ PAYOUT EXISTING ACCOUNT | Not Provide token | Need to throw error', async () => {
      const getPayoutAccByIDResponse = await request(server)
        .get('/food/admin/payout_account/')
        .send();
      expect(getPayoutAccByIDResponse.body.status).toBe(false);
      expect(getPayoutAccByIDResponse.body.statusCode).toBe(401);
      expect(getPayoutAccByIDResponse.body.errors).toStrictEqual([
        {code: 0, message: 'Authorization Error'},
      ]);
    });
    test('READ PAYOUT EXISTING ACCOUNT', async () => {
      const getPayoutAccByIDResponse = await request(server)
        .get('/food/admin/payout_account/')
        .set('Authorization', `Bearer ${admin_token}`)
        .query({restaurant_id: vendor_outlet_id})
        .send();
      expect(getPayoutAccByIDResponse.body.status).toBe(true);
      expect(getPayoutAccByIDResponse.body.statusCode).toBe(200);
      expect(getPayoutAccByIDResponse.body.message).toBe('Successful Response');
      expect(getPayoutAccByIDResponse.body.result[0].id).toBe(
        payout_account_id
      );
      expect(getPayoutAccByIDResponse.body.result[0].restaurant_id).toBe(
        vendor_outlet_id
      );
      expect(getPayoutAccByIDResponse.body.result[0].bank_account_number).toBe(
        valid_account_details.bank_account_number
      );
      expect(getPayoutAccByIDResponse.body.result[0].name).toBe(
        valid_account_details.name
      );
      expect(getPayoutAccByIDResponse.body.result[0].ifsc_code).toBe(
        valid_account_details.ifsc_code
      );
    });
  });
});
