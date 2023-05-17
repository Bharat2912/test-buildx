import request from 'supertest';
import {Application} from 'express';
import {createTestServer} from '../utils/init';
import {
  createTableDynamoDB,
  dropTableDynamoDB,
  loadMockSeedData,
  markOrderAsCompleted,
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
  mockPlaceDeliveryOrder,
  mockPostServiceableAddress,
  mockSendSQSMessage,
} from '../utils/mock_services';
import {RefundGateway, RefundStatus} from '../../module/core/payment/enum';
import {IOrderDetails} from '../../module/food/order/types';
import {processOrderRefundDetails} from '../../module/food/order/service';
import {v4 as uuidv4} from 'uuid';
import {OrderStatus, PaymentStatus} from '../../module/food/order/enums';
import {DB} from '../../data/knex';
import {
  mockgetAccountBalance,
  mockgetPayoutTransferDetails,
  mockprocessPayoutTransfer,
} from './mock_service';
import {processPayouts} from '../../module/food/payout/cron_service';
jest.mock('axios');

let server: Application;
let customer_token: string;
let vendor_token: string;
let admin_token: string;

beforeAll(async () => {
  server = await createTestServer();

  await createTableDynamoDB('user');
  await loadMockSeedData('restaurant');
  await loadMockSeedData('time_slot');
  await loadMockSeedData('subscription');
  await loadMockSeedData('coupon');
  await loadMockSeedData('restaurant_menu');
  await loadMockSeedData('payout_account');
  await loadMockSeedData('payout');
  await loadMockSeedData('order');
  customer_token = signToken({
    id: '33c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
    user_type: 'customer',
  });
  admin_token = signToken({
    id: '64bfafb6-c273-4b64-a0fc-ca981f5819eb',
    user_type: 'admin',
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
      *Vendor Received Order | Vendor Accepte The Order | And Add Preparation Time
    ==================================== */

    mockCartServiceabilityWithValidResponse();
    mockGetRestaurantVendors();
    mockPlaceDeliveryOrder();
    mockSendSQSMessage();
    const orderAccept = await request(server)
      .post(`/food/vendor/order/${order_id}/accept`)
      .set('Authorization', `Bearer ${vendor_token}`)
      .send({
        accept: true,
        preparation_time: 10,
      });
    expect(orderAccept.body.status).toBe(true);
    expect(orderAccept.statusCode).toBe(200);
    expect(orderAccept.body.result.id).toBe(order_id);
    expect(orderAccept.body.result.order_status).toBe('placed');
    expect(orderAccept.body.result.order_acceptance_status).toBe('accepted');
    expect(orderAccept.body.result.delivery_status).toBe('accepted');

    /*=============================================
                *MARK ORDER AS COMPLETED
    ===============================================*/
    await markOrderAsCompleted(order_id);
    /* =================================
               *GET ORDER DETAILS
    ==================================== */

    const order_response = await request(server)
      .get(`/food/order/${order_id}`)
      .set('Authorization', `Bearer ${customer_token}`);
    expect(order_response.body.status).toBe(true);
    expect(order_response.statusCode).toBe(200);
    expect(
      order_response.body.result.records &&
        order_response.body.result.records[0].payment_details[0].payment_status
    ).toBe(PaymentStatus.COMPLETED);
    expect(
      order_response.body.result.records &&
        order_response.body.result.records[0].order_status
    ).toBe(OrderStatus.COMPLETED);
    expect(
      order_response.body.result.records &&
        order_response.body.result.records[0].refund_status
    ).toBe(null);
    /*============================================
            *MARK COMPLETED ORDER FOR REUND
    ===============================================*/
    mockgetAdminDetails();
    const order_marked_for_refund = await request(server)
      .post(`/food/admin/order/${order_id}/mark_for_refund`)
      .set('Authorization', `Bearer ${admin_token}`);

    expect(order_marked_for_refund.body.status).toBe(true);
    expect(order_marked_for_refund.statusCode).toBe(200);
    expect(order_marked_for_refund.body.result.refund_status).toBe(
      RefundStatus.APPROVAL_PENDING
    );

    /*======================================
                *SETTLE REFUND
    ========================================*/

    mockgetAdminDetails();
    const init_refund_sqs_call = mockSendSQSMessage();
    const response = await request(server)
      .post(`/food/admin/order/${order_id}/settle_refund`)
      .set('Authorization', `Bearer ${admin_token}`)
      .send({
        refund_settled_vendor_payout_amount: 50,
        refund_settled_delivery_charges: 58,
        refund_settled_customer_amount:
          place_order_response.body.result.invoice_breakout!
            .total_customer_payable,
        refund_settlement_note_to_delivery_partner:
          'delivery partner completed order',
        refund_settlement_note_to_vendor: 'vendor food quality was bad',
        refund_settlement_note_to_customer:
          'customer will get full refund for raised issue',
      });

    expect(init_refund_sqs_call).toHaveBeenCalled();
    expect(response.body.status).toBe(true);
    expect(response.statusCode).toBe(200);
    expect(response.body.result.order_details.refund_status).toBe(
      RefundStatus.PENDING
    );

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
    ).toBe(110);
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
    ).toBe(110);
    expect(
      order_response_with_success_refund.body.result.records[0]
        .additional_details.refund_details
    ).toStrictEqual(JSON.parse(JSON.stringify(successful_refund_details)));

    const admin_reading_order_before_payout = await request(server)
      .get(`/food/admin/order/${order_id}`)
      .set('Authorization', `Bearer ${admin_token}`);
    expect(
      admin_reading_order_before_payout.body.result.records
        .payout_transaction_id
    ).toBe(undefined);
    /* =======================================================================================
             *GENRATING PAYOUT FOR VENDOR
    =========================================================================================*/
    const getbalance = mockgetAccountBalance();
    const payout_transfer_details = mockgetPayoutTransferDetails();
    const process_payout_transfer = mockprocessPayoutTransfer();
    await processPayouts();
    expect(getbalance).toHaveBeenCalled();
    expect(payout_transfer_details).toHaveBeenCalled();
    expect(process_payout_transfer).toHaveBeenCalled();

    /* =======================================================================================
             *READING PAYOUT FOR VENDOR
    =========================================================================================*/
    // actual order amount was 142 but due to customer complained vendor payout for this order will be 50rs only
    const admin_reading_order_after_payout = await request(server)
      .get(`/food/admin/order/${order_id}`)
      .set('Authorization', `Bearer ${admin_token}`);
    expect(
      admin_reading_order_after_payout.body.result.records.payout_transaction_id
    ).not.toBeNull();
    const payout_details = await DB.read('payout').where({
      restaurant_id: 'b0909e52-a731-4665-a791-ee6479008805',
    });
    expect(payout_details[1].status).toBe('COMPLETE');
    expect(payout_details[1].id).not.toBeNull();
    expect(payout_details[1].total_order_amount).toBe(50);

    /*==========================================================================
              MARKING FOR REFUND WHEN PAYOUT HAS ALREADY GIVEN
    ============================================================================*/
    mockgetAdminDetails();
    const order_marked_for_refund_after_payout = await request(server)
      .post('/food/admin/order/1/mark_for_refund')
      .set('Authorization', `Bearer ${admin_token}`);
    expect(order_marked_for_refund_after_payout.body.status).toBe(false);
    expect(order_marked_for_refund_after_payout.statusCode).toBe(400);
    expect(order_marked_for_refund_after_payout.body.errors).toStrictEqual([
      {
        message:
          'order can not be marked for refund because payout is genrated',
        code: 2027,
      },
    ]);
  });
});
