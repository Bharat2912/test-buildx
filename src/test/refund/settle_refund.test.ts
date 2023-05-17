import request from 'supertest';
import {Application} from 'express';
import {createTestServer} from '../utils/init';
import {
  createTableDynamoDB,
  dropTableDynamoDB,
  loadMockSeedData,
  signToken,
  testCasesClosingTasks,
} from '../utils/utils';
import logger from '../../utilities/logger/winston_logger';
import {
  mockCartServiceabilityWithValidResponse,
  mockCashfreeTrascationSuccessfullResponse,
  mockgetAdminDetails,
  mockGetCustomerDetails,
  mockGetRestaurantVendors,
  mockGetTransactionToken,
  mockPostServiceableAddress,
  mockSendSQSMessage,
} from '../utils/mock_services';
import {IOrderDetails} from '../../module/food/order/types';
import {DB} from '../../data/knex';
import {OrderTable} from '../../module/food/order/constants';
import moment from 'moment';
import {RefundStatus} from '../../module/core/payment/enum';
jest.mock('axios');

let server: Application;
let customer_token: string;
let admin_token: string;

beforeAll(async () => {
  server = await createTestServer();

  await createTableDynamoDB('user');
  await loadMockSeedData('restaurant');
  await loadMockSeedData('time_slot');
  await loadMockSeedData('subscription');
  await loadMockSeedData('coupon');
  await loadMockSeedData('restaurant_menu');
  customer_token = signToken({
    id: '33c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
    user_type: 'customer',
  });
  admin_token = signToken({
    id: '64bfafb6-c273-4b64-a0fc-ca981f5819eb',
    user_type: 'admin',
  });

  logger.debug('order refund test case initail setups completed');
});

afterAll(async () => {
  await testCasesClosingTasks();
  await dropTableDynamoDB('user');
});

describe('Refund Flow Testing SERVICE > CORE > SERVICE', () => {
  test('Successful Refund', async () => {
    /* =================================
                *CREATE CART
    ==================================== */

    mockCartServiceabilityWithValidResponse();
    const cart_response = await request(server)
      .put('/food/cart')
      .set('Authorization', `Bearer ${customer_token}`)
      .send({
        action: 'UPDATE',
        customer_device_id: '12412423432424413213123',
        customer_address_id: 'bd7e895f-0f7d-4dbe-9408-285abf5986ce',
        restaurant_id: 'b0909e52-a731-4665-a791-ee6479008805',
        menu_items: [
          {
            quantity: 1,
            menu_item_id: 11101,
            variant_groups: [
              {
                variant_group_id: 98,
                variant_id: 998,
              },
              {
                variant_group_id: 99,
                variant_id: 999,
              },
            ],
            addon_groups: [
              {
                addon_group_id: 77,
                addons: [7767, 7768],
              },
            ],
          },
        ],
        any_special_request: 'Dont ring door bell',
        coupon_code: '20%OFF-COUPON',
      });
    expect(cart_response.statusCode).toBe(200);
    expect(cart_response.body.result).not.toEqual({});

    /* =================================
                *PLACE ORDER
    ==================================== */

    mockPostServiceableAddress();
    mockGetCustomerDetails();
    mockGetTransactionToken();
    const place_order_response = await request(server)
      .post('/food/order/place_order')
      .set('Authorization', `Bearer ${customer_token}`);
    expect(place_order_response.statusCode).toBe(200);
    expect(place_order_response.body.result.order_acceptance_status).toBe(
      'pending'
    );
    expect(place_order_response.body.result.delivery_status).toBe('pending');
    expect(place_order_response.body.result.order_status).toBe('pending');
    expect(
      place_order_response.body.result.payment_details.payment_status
    ).toBe('pending');
    const order_id = place_order_response.body.result.order_id;
    const payment_id = place_order_response.body.result.payment_details.id;

    /* =================================
               *CONFIRM PAYMENT
    ==================================== */

    mockCashfreeTrascationSuccessfullResponse(
      order_id,
      place_order_response.body.result.invoice_breakout!.total_customer_payable
    );
    mockGetRestaurantVendors();
    const mock_sqs = mockSendSQSMessage();
    const confirm_payment_response = await request(server)
      .post(`/food/order/confirm_payment/${payment_id}`)
      .set('Authorization', `Bearer ${customer_token}`);
    expect(confirm_payment_response.body.status).toBe(true);
    expect(confirm_payment_response.statusCode).toBe(200);
    expect(confirm_payment_response.body.result).toMatchObject({
      message: 'TRANSACTION_COMPLETED',
    });
    expect(mock_sqs).toHaveBeenCalledTimes(1);

    /* =================================
               *GET ORDER DETAILS
    ==================================== */

    // ! refund_status will be "pending" because order is cancelled under free limit
    const mock_admin = mockgetAdminDetails();
    const order_response = await request(server)
      .get(`/food/admin/order/${order_id}`)
      .set('Authorization', `Bearer ${admin_token}`);
    expect(order_response.body.status).toBe(true);
    expect(order_response.statusCode).toBe(200);
    expect(
      order_response.body.result.records &&
        order_response.body.result.records[0].payment_details[0].payment_status
    ).toBe('completed');
    expect(
      order_response.body.result.records &&
        order_response.body.result.records[0].order_status
    ).toBe('placed');
    expect(order_response.body.result.records[0].order_status_code).toBe(102);
    expect(mock_admin).toHaveBeenCalledTimes(1);

    const order: IOrderDetails = order_response.body.result.records[0];

    /* =================================
      *ORDER CANCELLED UNDER 30 SECONDS
    ==================================== */

    await DB.write(OrderTable.TableName)
      .update({
        order_placed_time: moment(order.order_placed_time)
          .subtract(1, 'hour')
          .toDate(),
      })
      .returning('*')
      .where({id: order_id});

    const order_cancel_response = await request(server)
      .post(`/food/order/${order_id}/cancel`)
      .set('Authorization', `Bearer ${customer_token}`)
      .send({
        cancellation_reason: 'selected wrong delivery location',
      });
    expect(order_cancel_response.body.status).toBe(true);
    expect(order_cancel_response.statusCode).toBe(200);
    expect(order_cancel_response.body.result).toBe(
      'order cancelled successfully'
    );
    expect(mock_sqs).toHaveBeenCalledTimes(2);
    /**
     * total_customer_payable is more than max amount
     */

    const response_1 = await request(server)
      .post('/food/admin/order/1/settle_refund')
      .set('Authorization', `Bearer ${admin_token}`)
      .send({
        refund_settled_vendor_payout_amount: order.vendor_payout_amount,
        refund_settled_delivery_charges: order.delivery_charges,
        refund_settled_customer_amount: order.total_customer_payable! + 10,
        refund_settlement_note_to_delivery_partner: 'note',
        refund_settlement_note_to_vendor: 'note',
        refund_settlement_note_to_customer: 'note',
      });
    expect(mock_sqs).toHaveBeenCalledTimes(2);
    expect(mock_admin).toHaveBeenCalledTimes(2);
    expect(response_1.body.status).toBe(false);
    expect(response_1.statusCode).toBe(400);
    expect(response_1.body.errors).toStrictEqual([
      {
        // look into this
        message:
          'refund settled customer amount must be less than or equal to Rs.164.6',
        code: 0,
      },
    ]);

    /**
     * delivery_charges is more than max amount
     */

    const response_2 = await request(server)
      .post('/food/admin/order/1/settle_refund')
      .set('Authorization', `Bearer ${admin_token}`)
      .send({
        refund_settled_vendor_payout_amount: order.vendor_payout_amount,
        refund_settled_delivery_charges: order.delivery_charges! + 10,
        refund_settled_customer_amount: order.total_customer_payable,
        refund_settlement_note_to_delivery_partner: 'note',
        refund_settlement_note_to_vendor: 'note',
        refund_settlement_note_to_customer: 'note',
      });
    expect(mock_sqs).toHaveBeenCalledTimes(2);
    expect(mock_admin).toHaveBeenCalledTimes(3);
    expect(response_2.body.status).toBe(false);
    expect(response_2.statusCode).toBe(400);
    expect(response_2.body.errors).toStrictEqual([
      {
        message:
          'refund settled delivery charges must be less than or equal to Rs.59',
        code: 0,
      },
    ]);

    /**
     * vendor_payout_amount is more than max amount
     */

    const response_3 = await request(server)
      .post('/food/admin/order/1/settle_refund')
      .set('Authorization', `Bearer ${admin_token}`)
      .send({
        refund_settled_vendor_payout_amount: order.vendor_payout_amount! + 10,
        refund_settled_delivery_charges: order.delivery_charges,
        refund_settled_customer_amount: order.total_customer_payable,
        refund_settlement_note_to_delivery_partner: 'note',
        refund_settlement_note_to_vendor: 'note',
        refund_settlement_note_to_customer: 'note',
      });
    expect(mock_sqs).toHaveBeenCalledTimes(2);
    expect(mock_admin).toHaveBeenCalledTimes(4);
    expect(response_3.body.status).toBe(false);
    expect(response_3.statusCode).toBe(400);
    expect(response_3.body.errors).toStrictEqual([
      {
        // look into this
        message:
          'refund settled vendor payout amount must be less than or equal to Rs.127.06',
        code: 0,
      },
    ]);

    /**
     * settle_refund success when values dont excced max value
     */

    const response_4 = await request(server)
      .post('/food/admin/order/1/settle_refund')
      .set('Authorization', `Bearer ${admin_token}`)
      .send({
        refund_settled_vendor_payout_amount: order.vendor_payout_amount,
        refund_settled_delivery_charges: order.delivery_charges,
        refund_settled_customer_amount: order.total_customer_payable,
        refund_settlement_note_to_delivery_partner: 'note',
        refund_settlement_note_to_vendor: 'note',
        refund_settlement_note_to_customer: 'note',
      });
    expect(mock_sqs).toHaveBeenCalledTimes(3);
    expect(mock_admin).toHaveBeenCalledTimes(5);
    expect(response_4.body.status).toBe(true);
    expect(response_4.statusCode).toBe(200);
    expect(response_4.body.result.order_details.refund_status).toBe(
      RefundStatus.PENDING
    );
  });
});
