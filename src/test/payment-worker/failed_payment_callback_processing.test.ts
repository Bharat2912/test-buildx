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
import {
  mockCartServiceabilityWithValidResponse,
  mockGetCustomerDetails,
  mockGetRestaurantVendors,
  mockGetTransactionToken,
  mockPostServiceableAddress,
  mockSendSQSMessage,
} from '../utils/mock_services';
import {processOrderPaymentDetails} from '../../module/food/order/service';
import {ExternalPaymentEvent, OrderStatus} from '../../module/food/order/enums';
import {PaymentStatus} from '../../module/core/payment/enum';
import {successfull_cart_response} from '../utils/mock_responses';

jest.mock('axios');

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
});

afterAll(async () => {
  await testCasesClosingTasks();
  await dropTableDynamoDB('user');
});

describe('Testing failed payment callback worker processing', () => {
  const customer_id = '33c6fdbc-8df6-4541-9d3f-f9e5ba4c0242';
  test('Failed payment details should be processed and should not place order at vendor', async () => {
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
    expect(cart_response.body.result).toMatchObject(successfull_cart_response);

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

    /* ====================================================
               *CONFIRM PAYMENT BY PAYMENT CALLBACK
    ======================================================== */
    const vendor_place_order_sqs_call = mockSendSQSMessage();
    const mock_get_restaurant_vendor = mockGetRestaurantVendors();
    await processOrderPaymentDetails({
      data: {
        customer_details: {
          customer_email: 'customer@gmail.com',
          customer_id: customer_id,
          customer_name: 'Customer',
          customer_phone: '9666699999',
        },
        error_details: {
          error_code: 'TRANSACTION_DECLINED',
          error_description:
            'issuer bank or payment service provider declined the transaction',
          error_reason: 'auth_declined',
          error_source: 'customer',
        },
        payment_details: {
          auth_id: null,
          bank_reference: '214568722700',
          external_payment_id: '975677711',
          payment_currency: 'INR',
          payment_group: 'upi',
          payment_message: 'ZA::U19::Transaction fail',
          payment_method: 'upi',
          payment_method_details: {
            upi: {
              channel: '',
              upi_id: '9666699999@gpay',
            },
          },
          payment_status: 'FAILED',
          transaction_amount: 134.42,
          transaction_id: payment_id,
          transaction_time: new Date('2022-05-25T08:58:22.000Z'),
        },
      },
      event_time: '2022-05-25T14:28:38+05:30',
      type: ExternalPaymentEvent.PAYMENT_FAILED_WEBHOOK,
    });
    expect(vendor_place_order_sqs_call).toHaveBeenCalledTimes(0);
    expect(mock_get_restaurant_vendor).toHaveBeenCalledTimes(0);
    /* =================================
               *GET ORDER DETAILS
    ==================================== */

    const order_response = await request(server)
      .get(`/food/order/${order_id}`)
      .set('Authorization', `Bearer ${customer_token}`);
    expect(order_response.statusCode).toBe(200);
    expect(order_response.body.status).toBe(true);
    expect(
      order_response.body.result.records &&
        order_response.body.result.records[0].payment_details[0].payment_status
    ).toBe(PaymentStatus.PENDING);
    expect(
      order_response.body.result.records &&
        order_response.body.result.records[0].payment_details[0]
          .additional_details
    ).toStrictEqual({
      payment_attempt_details: [
        {
          auth_id: null,
          bank_reference: '214568722700',
          error_details: {
            error_code: 'TRANSACTION_DECLINED',
            error_description:
              'issuer bank or payment service provider declined the transaction',
            error_reason: 'auth_declined',
            error_source: 'customer',
          },
          external_payment_id: '975677711',
          external_payment_status: 'FAILED',
          payment_group: 'upi',
          payment_message: 'ZA::U19::Transaction fail',

          payment_method: {
            upi: {
              channel: '',
              upi_id: '9666699999@gpay',
            },
          },
          transaction_amount: 134.42,
          transaction_time: '2022-05-25T08:58:22.000Z',
        },
      ],
    });
    expect(
      order_response.body.result.records &&
        order_response.body.result.records[0].order_status
    ).toBe(OrderStatus.PENDING);
    expect(order_response.body.result.records[0].order_status_code).toBe(101);
    expect(order_response.body.result.records[0].order_status_label).toBe(
      'Order payment is pending'
    );
  });
});
