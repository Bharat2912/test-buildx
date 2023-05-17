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
  mockGetCustomerDetails,
  mockGetRestaurantVendors,
  mockGetTransactionToken,
  mockPostServiceableAddress,
  mockSendSQSMessage,
} from '../utils/mock_services';
import {RefundGateway, RefundStatus} from '../../module/core/payment/enum';
import {IOrderDetails} from '../../module/food/order/types';
import {processOrderRefundDetails} from '../../module/food/order/service';
import {v4 as uuidv4} from 'uuid';

jest.mock('axios');

//! How refund flow works
/**
 * 1.Each Service i.e(food,grocery,pnd,pharmacy) will raise a request to initated refund to a particular customer
 *   by sending a sqs message to Core API.
 * 2.Core API will process the worker initiate refund message and initiate acually refund on payment gateway
 *   side.
 * 3.Response of initate refund on payment gateway side which includes a refund id and refund charges & amount
 *   is returned back to service. Following details are also updated in refund master table
 * 4.Following service picks the refund initate details and updates the order table with following details
 * 5.After x time, Core API receives a callback from payment gateway with refund status of initated refund
 *   That details are updated in refund master table and it is forwarded to service
 * 6.Service again picks up the refund details and updates the order table with following details
 *
 */
//!

let server: Application;
let customer_token: string;

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
    mockSendSQSMessage();
    const confirm_payment_response = await request(server)
      .post(`/food/order/confirm_payment/${payment_id}`)
      .set('Authorization', `Bearer ${customer_token}`);
    expect(confirm_payment_response.body.status).toBe(true);
    expect(confirm_payment_response.statusCode).toBe(200);
    expect(confirm_payment_response.body.result).toMatchObject({
      message: 'TRANSACTION_COMPLETED',
    });

    /* =================================
      *ORDER CANCELLED UNDER 30 SECONDS
    ==================================== */

    mockSendSQSMessage();
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

    /* =================================
               *GET ORDER DETAILS
    ==================================== */

    // ! refund_status will be "pending" because order is cancelled under free limit

    const order_response = await request(server)
      .get(`/food/order/${order_id}`)
      .set('Authorization', `Bearer ${customer_token}`);
    expect(order_response.body.status).toBe(true);
    expect(order_response.statusCode).toBe(200);
    expect(
      order_response.body.result.records &&
        order_response.body.result.records[0].payment_details[0].payment_status
    ).toBe('completed');
    expect(
      order_response.body.result.records &&
        order_response.body.result.records[0].order_status
    ).toBe('cancelled');
    expect(
      order_response.body.result.records &&
        order_response.body.result.records[0].refund_status
    ).toBe('pending');
    expect(order_response.body.result.records[0].order_status_code).toBe(113);
    expect(
      order_response.body.result.records[0].additional_details.refund_details
    ).not.toBe(undefined);

    const order: IOrderDetails = order_response.body.result.records[0];
    const refund_id = uuidv4();
    const refund_created_on = new Date();
    /* ===============================================================
      *PROCESS INITIATE REFUND RESPONSE FROM CORE API IN FOOD WORKER
    ================================================================= */
    const initate_refund_details = {
      refund_id: refund_id,
      order_id: order.order_id,
      payment_id: payment_id,
      customer_id: order.customer_id!,
      refund_gateway: RefundGateway.CASHFREE,
      refund_amount: order.payment_details[0].amount_paid_by_customer!,
      refund_charges: 0,
      created_at: refund_created_on,
      refund_status: RefundStatus.PENDING,
      status_description: 'customer refund has been initiated',
    };
    mockSendSQSMessage();
    await processOrderRefundDetails(initate_refund_details);

    /* =============================
        *GET ORDER REFUND DETAILS
    ================================ */

    const order_response_with_init_refund = await request(server)
      .get(`/food/order/${order_id}`)
      .set('Authorization', `Bearer ${customer_token}`);
    expect(order_response_with_init_refund.body.status).toBe(true);
    expect(order_response_with_init_refund.statusCode).toBe(200);
    expect(
      order_response_with_init_refund.body.result.records &&
        order_response_with_init_refund.body.result.records[0].refund_status
    ).toBe('pending');
    expect(
      order_response_with_init_refund.body.result.records[0].order_status_code
    ).toBe(113);
    expect(
      order_response_with_init_refund.body.result.records[0].additional_details
        .refund_details
    ).toStrictEqual(JSON.parse(JSON.stringify(initate_refund_details)));

    /* ===============================================================
      *PROCESS SUCCESSFUL REFUND RESPONSE FROM CORE API IN FOOD WORKER
    ================================================================= */

    const successful_refund_details = {
      refund_id: refund_id,
      order_id: order.order_id,
      payment_id: payment_id,
      customer_id: order.customer_id!,
      refund_gateway: RefundGateway.CASHFREE,
      refund_amount: order.payment_details[0].amount_paid_by_customer!,
      refund_charges: 0,
      created_at: refund_created_on,
      processed_at: new Date(),
      refund_status: RefundStatus.SUCCESS,
      status_description: 'customer refund has been completed',
    };
    mockSendSQSMessage();
    await processOrderRefundDetails(successful_refund_details);

    /* =============================
        *GET ORDER REFUND DETAILS
    ================================ */

    const order_response_with_success_refund = await request(server)
      .get(`/food/order/${order_id}`)
      .set('Authorization', `Bearer ${customer_token}`);
    expect(order_response_with_success_refund.body.status).toBe(true);
    expect(order_response_with_success_refund.statusCode).toBe(200);
    expect(
      order_response_with_success_refund.body.result.records &&
        order_response_with_success_refund.body.result.records[0].refund_status
    ).toBe(RefundStatus.SUCCESS);
    expect(
      order_response_with_success_refund.body.result.records[0]
        .order_status_code
    ).toBe(113);
    expect(
      order_response_with_success_refund.body.result.records[0]
        .additional_details.refund_details
    ).toStrictEqual(JSON.parse(JSON.stringify(successful_refund_details)));

    /* =======================================================================================
             *REFUND INIT AND SUCCESS EVENTS ARE PROCESSED IN FOOD SERVICE
    =========================================================================================*/
  });
});
