import request from 'supertest';
import {createTestServer} from '../utils/init';
import {Application} from 'express';
import {
  loadMockSeedData,
  signToken,
  testCasesClosingTasks,
} from '../utils/utils';
import {DB} from '../../data/knex';
import {
  mockgetAdminDetails,
  mockGetRestaurantVendors,
  mockSendSQSMessage,
} from '../utils/mock_services';
import {IPayout} from '../../module/food/payout/types';
import {
  mockgetAccountBalance,
  mockgetPayoutTransferDetails,
  mockprocessPayoutTransfer,
} from './mock_service';
import {IOrder} from '../../module/food/order/types';
import {processPayouts} from '../../module/food/payout/cron_service';
jest.mock('axios');

let server: Application;
let admin_token: string;

beforeAll(async () => {
  server = await createTestServer();

  await loadMockSeedData('restaurant');
  await loadMockSeedData('coupon');
  await loadMockSeedData('payout_account');
  await loadMockSeedData('payout_order');
  admin_token = signToken({
    id: '64bfafb6-c273-4b64-a0fc-ca981f5819eb',
    user_type: 'admin',
  });
});

afterAll(async () => {
  await testCasesClosingTasks();
});

test.todo('How Check For Mocked Axios Function has been called');
let order_details: IOrder[];
let vendor_payout_amount_day_1: number;
let vendor_payout_amount_day_2: number;
let payout_details: IPayout[];
let vendor_payout_transaction_charges: number;
// Order ID   Order Status  delivery status  refund_status
//    1        completed       delivered         -
//    2        completed       delivered         -
//    3        cancelled       pending         SUCCESS
//    4        completed       delivered         -
//    5        cancelled       pending         PENDING
//    6        completed       delivered         -
//    7        cancelled       pending         PENDING
//    8        completed       delivered         -
//    9        completed       delivered         -
//    10       completed       delivered         -
//    11       completed       delivered         -
//    12       completed       delivered         -
//    13       cancelled       pending         PENDING
//

describe('Payout Testing', () => {
  // - On Day 1 Admin Cancelled The Order 5 & 7 Because Vendor Was Not Accepting Orders.
  // - Admin Initiated Refund For Order 5 only.
  // - On Day 1 Payout Payout Will be genrated For Only Order 1,2,3,4,5,6 Not For 7.Becasue Admin Has Not Given Refund Of Order 7.
  // - We Have Taken All Orders From Database And R| Admin Cancelled Order ID 5 and 7eading Details To Check Wheather Payout Amount Genrated Is Valid Or Not.
  describe('Day 1', () => {
    test('Admin Cancelling Order 5', async () => {
      mockgetAdminDetails();
      mockGetRestaurantVendors();
      const mock_sqs = mockSendSQSMessage();
      const response = await request(server)
        .post('/food/admin/order/5/cancel')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          cancellation_reason: 'restaurant was not accepting order',
        });
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.result).toBe('order cancelled successfully');
      expect(mock_sqs).toHaveBeenCalledTimes(1);
      // expect(mock_admin_details.request).toHaveBeenCalledWith(
      //   expect.objectContaining({
      //     // baseURL: process.env.USER_API_URL,
      //     method: 'get',
      //     url: `/internal/readAdminById/${admin_id}`,
      //   })
      // );
    });
    test('Admin Cancelling Order 7', async () => {
      mockgetAdminDetails();
      const mock_sqs = mockSendSQSMessage();
      mockGetRestaurantVendors();
      const response = await request(server)
        .post('/food/admin/order/7/cancel')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          cancellation_reason: 'selected wrong delivery location',
        });
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.result).toBe('order cancelled successfully');
      expect(mock_sqs).toHaveBeenCalledTimes(1);
    });
    test('ADMIN | To Check Refund Status Of Order 5 And 7 | refund_status = approval_pending', async () => {
      order_details = (
        await DB.read.raw('SELECT * FROM public.order WHERE id IN (5,7)')
      ).rows;
      expect(order_details[0].id).toBe(7);
      expect(order_details[0].refund_status).toBe('approval_pending');
      expect(order_details[1].id).toBe(5);
      expect(order_details[1].refund_status).toBe('approval_pending');
    });
    test('ADMIN | Initiate Refund Of Order 5', async () => {
      mockgetAdminDetails();
      const mock_sqs = mockSendSQSMessage();
      const response = await request(server)
        .post('/food/admin/order/5/settle_refund')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          refund_settled_vendor_payout_amount: -70,
          refund_settled_delivery_charges: 0,
          refund_settled_customer_amount: 105,
          refund_settlement_note_to_delivery_partner:
            'delivery partner not assigned',
          refund_settlement_note_to_vendor:
            'restaurant was not accepting order',
          refund_settlement_note_to_customer:
            'restaurant was not accepting order',
        });
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(mock_sqs).toHaveBeenCalledTimes(1);
    });
    test('Reading All Order', async () => {
      order_details = (
        await DB.read.raw('SELECT * FROM public.order WHERE id IN (1,2,4,5,6)')
      ).rows;

      vendor_payout_amount_day_1 = 0;
      for (let i = 0; i < order_details.length; i++) {
        if (
          order_details[i].order_status === 'cancelled' &&
          order_details[i].invoice_breakout?.refund_settlement_details &&
          order_details[i].payout_transaction_id === null
        ) {
          vendor_payout_amount_day_1 +=
            order_details[i].invoice_breakout!.refund_settlement_details!
              .refund_settled_vendor_payout_amount!;
        } else if (
          order_details[i].order_status === 'completed' &&
          order_details[i].delivery_status === 'delivered' &&
          order_details[i].order_acceptance_status === 'accepted'
        ) {
          vendor_payout_amount_day_1 += order_details[i].vendor_payout_amount!;
        }
      }
      // Calculating 1 Percent For Transaction Charges.
      vendor_payout_transaction_charges =
        (vendor_payout_amount_day_1 / 100) * 1;
    });
    test('Genrating Payout Of Day 1', async () => {
      const balance = mockgetAccountBalance();
      const payout_transfer_details = mockgetPayoutTransferDetails();
      const process_payout_transfer = mockprocessPayoutTransfer();
      await processPayouts();
      expect(balance).toHaveBeenCalled();
      expect(payout_transfer_details).toHaveBeenCalled();
      expect(process_payout_transfer).toHaveBeenCalled();
    });
    test('Reading Payout Of Day 1', async () => {
      payout_details = await DB.read('payout').where({
        restaurant_id: 'b0909e52-a731-4665-a791-ee6479008805',
      });
      expect(payout_details[0].status).toBe('COMPLETE');
      expect(payout_details[0].amount_paid_to_vendor).toBe(
        vendor_payout_amount_day_1 - vendor_payout_transaction_charges
      );
    });
  });

  // - On Day 2 Admin Initited Refund Of Order 7
  // - On Day 2 (Or At Midnight) Payout Cron Will Run And Will Read All Orders From Past Day (Day 1).
  // - It Will Take Payout Amount Per Bases on
  //       1. If order_status Is Completed Then It Will Read Amount From vendor_payout_amount.
  //       2. If Order_status Is Cancelled Then It Will Read Amount From refund_settlement_details.refund_settled_vendor_payout_amount.
  // - Based On This Conditions Vendor Payout Amount Of All Orders Will Be Calculated.
  // - On Day 2 Admin Initited Refund Of Order 13.
  // - Payout Report Payout Will Be Generated For Orders 8,9,10,11,12,13. Order 7 Is Not Inclued in Payout.
  // - Payout Amount Of Order 7 Won't Be Paid to Vendor Because Admin Has Refund Full Amount To Customer.

  describe('Day 2 ', () => {
    test('ADMIN | Initiate Refund Of Order 7', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .post('/food/admin/order/7/settle_refund')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          refund_settled_vendor_payout_amount: 0,
          refund_settled_delivery_charges: 0,
          refund_settled_customer_amount: 2420,
          refund_settlement_note_to_delivery_partner:
            'delivery partner not yet assigned',
          refund_settlement_note_to_vendor: 'restaurant not accepted order',
          refund_settlement_note_to_customer: 'restaurant not accepted order',
        });
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
    });
    test('Order 13 Cancelled By Admin', async () => {
      mockgetAdminDetails();
      mockGetRestaurantVendors();
      const response = await request(server)
        .post('/food/admin/order/13/cancel')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          cancellation_reason: 'Customer Cancelled order after 20 mins',
        });
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.result).toBe('order cancelled successfully');
    });
    test('ADMIN | To Check Refund Status Of Order | refund_status = approval_pending', async () => {
      order_details = await DB.read('order').where({id: 13});
      expect(order_details[0].id).toBe(13);
      expect(order_details[0].refund_status).toBe('approval_pending');
    });
    test('ADMIN | Initiate Refund Of Order 13', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .post('/food/admin/order/13/settle_refund')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          refund_settled_vendor_payout_amount: 2522,
          refund_settled_delivery_charges: 0,
          refund_settled_customer_amount: 0,
          refund_settlement_note_to_delivery_partner:
            'order was cancelled by customer',
          refund_settlement_note_to_vendor:
            'order was cancelled by customer after 20 mins',
          refund_settlement_note_to_customer:
            'order was cancelled outside of cancellation time limit',
        });
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
    });
    test('Reading All Order | 8,9,10,11,12,13', async () => {
      order_details = (
        await DB.read.raw(
          'SELECT * FROM public.order WHERE id IN (8,9,10,11,12,13)'
        )
      ).rows;
      vendor_payout_transaction_charges = 0;
      vendor_payout_amount_day_2 = 0;
      for (let i = 0; i < order_details.length; i++) {
        if (
          order_details[i].order_status === 'cancelled' &&
          order_details[i].invoice_breakout?.refund_settlement_details &&
          order_details[i].payout_transaction_id === null
        ) {
          vendor_payout_amount_day_2 +=
            order_details[i].invoice_breakout!.refund_settlement_details!
              .refund_settled_vendor_payout_amount!;
        } else if (
          order_details[i].order_status === 'completed' &&
          order_details[i].delivery_status === 'delivered' &&
          order_details[i].order_acceptance_status === 'accepted'
        ) {
          vendor_payout_amount_day_2 += order_details[i].vendor_payout_amount!;
        }
      }
      // Calculating 1 Percent For Transaction Charges.
      vendor_payout_transaction_charges =
        (vendor_payout_amount_day_2 / 100) * 1;
    });
    test('Genrating Payout Of Day 2', async () => {
      const balance = mockgetAccountBalance();
      const payout_transfer_details = mockgetPayoutTransferDetails();
      const process_payout_transfer = mockprocessPayoutTransfer();
      await processPayouts();
      expect(balance).toHaveBeenCalled();
      expect(payout_transfer_details).toHaveBeenCalled();
      expect(process_payout_transfer).toHaveBeenCalled();
    });
    test('Reading Payout', async () => {
      payout_details = await DB.read('payout').where({
        restaurant_id: 'b0909e52-a731-4665-a791-ee6479008805',
      });
      expect(payout_details[1].status).toBe('COMPLETE');
      expect(payout_details[1].amount_paid_to_vendor).toBe(
        vendor_payout_amount_day_2 - vendor_payout_transaction_charges
      );
    });
    test('FILTER Payout With Restaurant ID', async () => {
      const response = await request(server)
        .post('/food/admin/payout/filter')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          restaurant_ids: ['b0909e52-a731-4665-a791-ee6479008805'],
          filter: {
            status: ['COMPLETE'],
          },
          sort_by: {
            column: 'created_at',
            direction: 'asc',
          },
          pagination: {
            page_index: 0,
            page_size: 10,
          },
        });
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.result.total_records).toEqual(2);
    });
    test('Invalid search_text', async () => {
      const response = await request(server)
        .post('/food/admin/payout/filter')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          search_text: "1's",
          sort_by: {
            column: 'created_at',
            direction: 'asc',
          },
          pagination: {
            page_index: 0,
            page_size: 10,
          },
        });
      expect(response.body.status).toBe(true);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.result.total_records).toEqual(0);
      expect(response.body.message).toBe('Successful Response');
    });
  });
});

/**
 * Day 1 :-

Put 10 orders (diff amount) in hungery habibi DAY 1

Cancel order 3 from the customer under cancelation time day 1 (done)

Cancel 5 and 7 orders by admin after 3(free cancelation time) min → refund status  = approval pending (Done)

approve a refund of order 5 on day 1 only (Done)

Day 2 :-

Now look at the payout report on day 2

order 1,2,3,4,5,6 payout report on Day 2.

place order 11, 12, 13

cancel order 13 and settle it with refund customer 0 rider 0 and restaurant full amount

Now on day 2 settle order 7

Day 3 :-

payout report has order 7, 8, 9, 10, 11, 12, 13



Step 1 :- Approve refund of order 5 on Day 1.
Step 2 :- order 11, 12, 13 on Day 2.
Step 3 :- Cancel Order 13 and Give Full Refund Amount to Restaurant.
Step 4 :- Settle Refund of Order 7.
Step 5 :- Genrate Payout Report of restaurant and read orders 7,8,9,10,11,12,13.
*/
