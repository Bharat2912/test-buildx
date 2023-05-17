import request from 'supertest';
import {createTestServer} from '../utils/init';
import {Application} from 'express';
import {
  createTableDynamoDB,
  dropTableDynamoDB,
  loadMockSeedData,
  signToken,
  testCasesClosingTasks,
} from '../utils/utils';
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
  mockUpdateOrderStatusInRider,
} from '../utils/mock_services';
import logger from '../../utilities/logger/winston_logger';
import {DB} from '../../data/knex';
import {cart_api_response} from './mock_responce';
import {ICartResponse} from '../../module/food/cart/types';
import {roundUp} from '../../utilities/utilFuncs';

jest.mock('axios');

let server: Application;
let customer_token: string;
let admin_token: string;
let vendor_token: string;
let shadowfax_token: string;

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
  shadowfax_token = process.env.SHADOWFAX_CALLBACK_TOKEN || '';
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
  await dropTableDynamoDB('user');
});

/**
 * Test Case For Full Order Delivery.
 * Customer Add Items In Cart.
 * Order Is Created
 * Payment Is Completed
 * Vendor Accepted Order.
 * Delivery Person Pick Order.
 * Delivery Person Deliver The Order.
 */

describe('Full Order Flow Test Cases', () => {
  let OrderId: string;
  let Payment_Id: string;
  let delivery_order_id: string;
  let Order_Details: ICartResponse;
  describe('Cart', () => {
    test('Customer Added Items In Cart. With Coupon', async () => {
      mockCartServiceabilityWithValidResponse();
      const response = await request(server)
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
      expect(response.statusCode).toBe(200);
      expect(response.body.result).not.toEqual({});
      expect(response.body.result.restaurant_details.like_count_label).toBe(
        '100.0K'
      );
      expect(response.body.result.restaurant_details.like_count).toBe(100000);

      Order_Details = response.body.result;
      expect(response.body.result.invoice_breakout.delivery_charges).toEqual(
        cart_api_response.invoice_breakout.delivery_charges
      );

      expect(
        response.body.result.invoice_breakout.vendor_cancellation_charges
      ).toEqual(cart_api_response.invoice_breakout.vendor_cancellation_charges);

      const total_food_cost =
        response.body.result.invoice_breakout.total_food_cost;
      logger.debug('total_food_cost', total_food_cost);
      expect(total_food_cost).toEqual(
        cart_api_response.invoice_breakout.total_food_cost
      );

      const coupon_discount_amount =
        response.body.result.invoice_breakout.coupon_details
          .discount_amount_applied;
      logger.debug('coupon_discount_amount', coupon_discount_amount);
      expect(coupon_discount_amount).toEqual(
        cart_api_response.invoice_breakout.coupon_details
          .discount_amount_applied
      );

      const coupon_discount_percentage =
        response.body.result.invoice_breakout.coupon_details
          .discount_percentage;
      logger.debug('coupon_discount_percentage', coupon_discount_percentage);
      expect(coupon_discount_percentage).toEqual(
        cart_api_response.invoice_breakout.coupon_details.discount_percentage
      );

      const transaction_charges =
        response.body.result.invoice_breakout.transaction_charges;
      logger.debug('transaction_charges', transaction_charges);

      const food_cost_before_coupon = total_food_cost + transaction_charges;
      logger.debug('food_cost_before_coupon', food_cost_before_coupon);

      const food_cost_with_transsaction_charges_and_packing_charges =
        Order_Details.invoice_breakout!.total_food_cost +
        Order_Details.invoice_breakout!.transaction_charges +
        Order_Details.invoice_breakout!.total_packing_charges;

      expect(
        roundUp(food_cost_with_transsaction_charges_and_packing_charges, 0)
      ).toEqual(
        roundUp(
          cart_api_response.invoice_breakout.total_food_cost +
            cart_api_response.invoice_breakout.transaction_charges +
            cart_api_response.invoice_breakout.total_packing_charges,
          0
        )
      );

      const coupon_applied =
        (food_cost_before_coupon / 100) * coupon_discount_percentage;
      logger.debug('food_cost_after_coupon', coupon_applied);

      const food_cost_after_coupon = food_cost_before_coupon - coupon_applied;
      logger.debug('food_cost_after_coupon', food_cost_after_coupon);

      const delivery_charges =
        response.body.result.invoice_breakout.delivery_charges;
      logger.debug('delivery_charges', delivery_charges);

      const transaction_charges_rate =
        response.body.result.invoice_breakout.transaction_charges_rate;
      logger.debug('transaction_charges_rate', transaction_charges_rate);

      const total_customer_payable =
        response.body.result.invoice_breakout.total_customer_payable;
      logger.debug('total_customer_payable', total_customer_payable);

      const refundable_amount =
        response.body.result.invoice_breakout.refundable_amount;
      logger.debug('refundable_amount', refundable_amount);
    });

    test('After All Valid Items Cart Will Be Created ', async () => {
      mockPostServiceableAddress();
      mockGetCustomerDetails();
      mockGetTransactionToken();
      const placeOrderResponse = await request(server)
        .post('/food/order/place_order')
        .set('Authorization', `Bearer ${customer_token}`);
      expect(placeOrderResponse.statusCode).toBe(200);
      expect(placeOrderResponse.body.result.order_acceptance_status).toBe(
        'pending'
      );
      expect(placeOrderResponse.body.result.delivery_status).toBe('pending');
      expect(placeOrderResponse.body.result.order_status).toBe('pending');
      expect(
        placeOrderResponse.body.result.payment_details.payment_status
      ).toBe('pending');
      expect(
        placeOrderResponse.body.result.restaurant_details.like_count_label
      ).toBe('100.0K');
      expect(placeOrderResponse.body.result.restaurant_details.like_count).toBe(
        100000
      );

      OrderId = placeOrderResponse.body.result.order_id;
      Payment_Id = placeOrderResponse.body.result.payment_details.id;
    });
  });
  describe('Order Payment', () => {
    test('After Cart Created PaymentStatus Will Be PENDING | Payment Will Be Done By Customer', async () => {
      mockCashfreeTrascationSuccessfullResponse(
        Payment_Id,
        Order_Details.invoice_breakout!.total_customer_payable
      );
      mockGetRestaurantVendors();
      mockSendSQSMessage();
      const paymentResponse = await request(server)
        .post(`/food/order/confirm_payment/${Payment_Id}`)
        .set('Authorization', `Bearer ${customer_token}`);
      expect(paymentResponse.body.status).toBe(true);
      expect(paymentResponse.statusCode).toBe(200);
      expect(paymentResponse.body.result).toMatchObject({
        message: 'TRANSACTION_COMPLETED',
      });
    });
    test('Customer | Once The Payment Is Done PaymentStatus Will Be COMPLETED', async () => {
      const orderResponse = await request(server)
        .get(`/food/order/${OrderId}`)
        .set('Authorization', `Bearer ${customer_token}`);
      expect(orderResponse.body.status).toBe(true);
      expect(orderResponse.statusCode).toBe(200);
      expect(
        orderResponse.body.result.records &&
          orderResponse.body.result.records[0].payment_details[0].payment_status
      ).toBe('completed');
      expect(
        orderResponse.body.result.records &&
          orderResponse.body.result.records[0].order_status
      ).toBe('placed');
      expect(orderResponse.body.result.records[0].order_status_code).toBe(102);
      expect(
        orderResponse.body.result.records[0].restaurant_details.like_count_label
      ).toBe('100.0K');
      expect(
        orderResponse.body.result.records[0].restaurant_details.like_count
      ).toBe(100000);
    });
    test('ADMIN | To Check Order Details | Payment Status Must Be completed and Order Status Must Be Placed', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .get(`/food/admin/order/${OrderId}`)
        .set('Authorization', `Bearer ${admin_token}`);
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.result.records[0].order_id).toBe(OrderId);
      expect(response.body.result.records[0].order_status).toBe('placed');
      expect(
        response.body.result.records[0].payment_details[0].payment_status
      ).toBe('completed');
      expect(response.body.result.records[0].delivery_status).toBe('pending');
      expect(response.body.result.records[0].order_acceptance_status).toBe(
        'pending'
      );
      expect(response.body.result.records[0].order_status_code).toBe(102);
      expect(
        response.body.result.records[0].restaurant_details.like_count_label
      ).toBe('100.0K');
      expect(
        response.body.result.records[0].restaurant_details.like_count
      ).toBe(100000);
    });
    test('Database Check For Order Details', async () => {
      const read_order_details = await DB.read('order').where({
        id: OrderId,
      });
      const read_payment_details = await DB.read('payment').where({
        order_id: OrderId,
      });
      expect(read_payment_details[0].payment_status).toBe('completed');
      expect(read_order_details[0].id).toBe(OrderId);
      expect(read_order_details[0].delivery_status).toBe('pending');
      expect(read_order_details[0].order_status).toBe('placed');
      expect(read_order_details[0].order_acceptance_status).toBe('pending');
    });
  });
  describe('Vendor Recived Order', () => {
    test('Vendor Received Order | Vendor Accepte The Order | And Add Preparation Time', async () => {
      mockCartServiceabilityWithValidResponse();
      mockGetRestaurantVendors();
      mockPlaceDeliveryOrder();
      mockSendSQSMessage();
      const orderAccept = await request(server)
        .post(`/food/vendor/order/${OrderId}/accept`)
        .set('Authorization', `Bearer ${vendor_token}`)
        .send({
          accept: true,
          preparation_time: 10.5,
        });
      expect(orderAccept.body.status).toBe(true);
      expect(orderAccept.statusCode).toBe(200);
      expect(orderAccept.body.result.id).toBe(OrderId);
      expect(orderAccept.body.result.order_status).toBe('placed');
      expect(orderAccept.body.result.order_acceptance_status).toBe('accepted');
      expect(orderAccept.body.result.delivery_status).toBe('accepted');
      delivery_order_id = orderAccept.body.result.delivery_order_id;
    });
    // test('Driver Accepts Order', async () => {
    //   mockgetAdminDetails();
    //   mockSendSQSMessage();
    //   const current_time = new Date().toISOString();
    //   const response = await request(server)
    //     .post('/core/callback/shadowfax/order_status')
    //     .set('Content-Type', 'application/json')
    //     .set('Authorization', `Bearer ${shadowfax_token}`)
    //     .send({
    //       allot_time: current_time,
    //       rider_name: 'Speedyy',
    //       sfx_order_id: delivery_order_id,
    //       client_order_id: 'RES_' + OrderId,
    //       order_status: 'ACCEPTED',
    //       rider_contact: '+91123456789',
    //       rider_latitude: 12.937814,
    //       rider_longitude: 77.61458,
    //       pickup_eta: 5,
    //       drop_eta: 20,
    //     });
    //   expect(response.status).toBe(200);
    //   expect(response.text).toBe('OK');
    // });
    test('ADMIN | To Check Order Details | Order Status Must Be Placed And Order Acceptence Status Must be accepted', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .get(`/food/admin/order/${OrderId}`)
        .set('Authorization', `Bearer ${admin_token}`);
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.result.records[0].order_id).toBe(OrderId);
      expect(response.body.result.records[0].order_status).toBe('placed');
      expect(
        response.body.result.records[0].payment_details[0].payment_status
      ).toBe('completed');
      expect(response.body.result.records[0].delivery_status).toBe('accepted');
      expect(response.body.result.records[0].order_acceptance_status).toBe(
        'accepted'
      );
      expect(response.body.result.records[0].delivery_order_id).not.toBe(null);
      expect(response.body.result.records[0].order_status_code).toBe(103);
    });
    test('CUSTOMER | Check for Order Status | Order Status Must Be Placed And  Order Acceptence Status Must be accepted ', async () => {
      const response = await request(server)
        .get(`/food/order/${OrderId}`)
        .set('Authorization', `Bearer ${customer_token}`);
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.result.records[0].order_id).toBe(OrderId);
      expect(response.body.result.records[0].order_status).toBe('placed');
      expect(
        response.body.result.records[0].payment_details[0].payment_status
      ).toBe('completed');
      expect(response.body.result.records[0].order_acceptance_status).toBe(
        'accepted'
      );
      expect(response.body.result.records[0].delivery_status).toBe('accepted');
      expect(response.body.result.records[0].order_status_code).toBe(103);
      expect(response.body.result.records[0].restaurant_details).toStrictEqual({
        contact_number: '+919819999998',
        image: {name: null, url: null},
        latitude: 19.158672,
        like_count: 100000,
        like_count_label: '100.0K',
        longitude: 72.89071,
        pos_id: null,
        pos_name: null,
        pos_partner: null,
        restaurant_name: 'Burger King',
        parent_id: null,
        parent_or_child: null,
      });
    });
    test('VENDOR | Check For Order Status | Order Acceptence Status Must Be Accepted', async () => {
      const response = await request(server)
        .get(`/food/order/${OrderId}`)
        .set('Authorization', `Bearer ${customer_token}`);
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.result.records[0].order_id).toBe(OrderId);
      expect(response.body.result.records[0].order_status).toBe('placed');
      expect(
        response.body.result.records[0].payment_details[0].payment_status
      ).toBe('completed');
      expect(response.body.result.records[0].order_acceptance_status).toBe(
        'accepted'
      );
      expect(response.body.result.records[0].delivery_status).toBe('accepted');
      expect(response.body.result.records[0].order_status_code).toBe(103);
      expect(
        response.body.result.records[0].restaurant_details.like_count_label
      ).toBe('100.0K');
      expect(
        response.body.result.records[0].restaurant_details.like_count
      ).toBe(100000);
    });
    test('Database Check For Order Details', async () => {
      const read_order_details = await DB.read('order').where({
        id: OrderId,
      });
      const read_payment_details = await DB.read('payment').where({
        order_id: OrderId,
      });
      expect(read_order_details[0].id).toBe(OrderId);
      expect(read_order_details[0].delivery_status).toBe('accepted');
      expect(read_order_details[0].order_status).toBe('placed');
      expect(read_order_details[0].order_acceptance_status).toBe('accepted');
      expect(read_payment_details[0].payment_status).toBe('completed');
    });
  });
  describe('Driver Allotted For Order Delivery', () => {
    test('Driver Allotted For Order', async () => {
      mockgetAdminDetails();
      mockSendSQSMessage();
      const current_time = new Date().toISOString();
      const response = await request(server)
        .post('/core/callback/shadowfax/order_status')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${shadowfax_token}`)
        .send({
          allot_time: current_time,
          rider_name: 'Speedyy',
          sfx_order_id: delivery_order_id,
          client_order_id: 'RES_' + OrderId,
          order_status: 'ALLOTTED',
          rider_contact: '+91123456789',
          rider_latitude: 12.937814,
          rider_longitude: 77.61458,
          pickup_eta: 5,
          drop_eta: 20,
        });
      expect(response.status).toBe(200);
      expect(response.text).toBe('OK');
    });
    test('CUSTOMER | Check For Order Status | Delivery Status Must Be Driver Allocated At Restaurant And Order Status Placed', async () => {
      const response = await request(server)
        .get(`/food/order/${OrderId}`)
        .set('Authorization', `Bearer ${customer_token}`);
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.result.records[0].order_status).toBe('placed');
      expect(response.body.result.records[0].order_acceptance_status).toBe(
        'accepted'
      );
      expect(response.body.result.records[0].delivery_status).toBe('allocated');
    });
    test('ADMIN | To Check Order Details | Order Status Must Be Placed and Order Acceptence Status Must Be Accepted And Delivery Status Must Be Allocated', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .get(`/food/admin/order/${OrderId}`)
        .set('Authorization', `Bearer ${admin_token}`);
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.result.records[0].order_id).toBe(OrderId);
      expect(response.body.result.records[0].order_status).toBe('placed');
      expect(
        response.body.result.records[0].payment_details[0].payment_status
      ).toBe('completed');
      expect(response.body.result.records[0].delivery_status).toBe('allocated');
      expect(response.body.result.records[0].order_acceptance_status).toBe(
        'accepted'
      );
      expect(response.body.result.records[0].delivery_order_id).not.toBe(null);
      expect(response.body.result.records[0].order_status_code).toBe(105);
    });
    test('VENDOR | Check For Order Status | Order Acceptence Status Must Be Accepted', async () => {
      const response = await request(server)
        .get(`/food/order/${OrderId}`)
        .set('Authorization', `Bearer ${customer_token}`);
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.result.records[0].order_id).toBe(OrderId);
      expect(response.body.result.records[0].order_status).toBe('placed');
      expect(
        response.body.result.records[0].payment_details[0].payment_status
      ).toBe('completed');
      expect(response.body.result.records[0].order_acceptance_status).toBe(
        'accepted'
      );
      expect(response.body.result.records[0].delivery_status).toBe('allocated');
      expect(response.body.result.records[0].order_status_code).toBe(105);
    });
    test('Database Check For Order Details', async () => {
      const read_order_details = await DB.read('order').where({
        id: OrderId,
      });
      const read_payment_details = await DB.read('payment').where({
        order_id: OrderId,
      });
      expect(read_order_details[0].id).toBe(OrderId);
      expect(read_order_details[0].delivery_status).toBe('allocated');
      expect(read_order_details[0].delivery_details.delivery_status).toBe(
        'allocated'
      );
      expect(read_order_details[0].order_status).toBe('placed');
      expect(read_order_details[0].order_acceptance_status).toBe('accepted');
      expect(read_payment_details[0].payment_status).toBe('completed');
    });
  });
  describe('Vedor Mark Order As Ready And Driver Reched At Restaurant', () => {
    test('VENDOR | Mark Order As Ready', async () => {
      mockUpdateOrderStatusInRider();
      const orderAccept = await request(server)
        .post(`/food/vendor/order/${OrderId}/ready`)
        .set('Authorization', `Bearer ${vendor_token}`);
      expect(orderAccept.body.status).toBe(true);
      expect(orderAccept.statusCode).toBe(200);
      expect(orderAccept.body.result.id).toBe(OrderId);
      expect(orderAccept.body.result.order_status).toBe('placed');
      expect(orderAccept.body.result.order_acceptance_status).toBe('accepted');
      expect(orderAccept.body.result.delivery_status).toBe('allocated');
    });
    test('Driver Arrived At Restaurant | Mark Delivery Status As Arrived', async () => {
      mockgetAdminDetails();
      mockSendSQSMessage();
      const current_time = new Date().toISOString();
      const response = await request(server)
        .post('/core/callback/shadowfax/order_status')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${shadowfax_token}`)
        .send({
          allot_time: current_time,
          rider_name: 'Speedyy',
          sfx_order_id: delivery_order_id,
          client_order_id: 'RES_' + OrderId,
          order_status: 'ARRIVED',
          rider_contact: '+91123456789',
          rider_latitude: 12.937814,
          rider_longitude: 77.61458,
          pickup_eta: 5,
          drop_eta: 20,
        });
      expect(response.status).toBe(200);
      expect(response.text).toBe('OK');
    });
    test('CUSTOMER | Check for Order Status | Delivery Status Must Be Arrived At Restaurant', async () => {
      const response = await request(server)
        .get(`/food/order/${OrderId}`)
        .set('Authorization', `Bearer ${customer_token}`);
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.result.records[0].order_status).toBe('placed');
      expect(response.body.result.records[0].order_acceptance_status).toBe(
        'accepted'
      );
      expect(response.body.result.records[0].delivery_status).toBe('arrived');
    });
    test('ADMIN | To Check Order Details | Order Status Must Be Placed and Order Acceptence Status Must Be Accepted And Delivery Status Must Be Arrived', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .get(`/food/admin/order/${OrderId}`)
        .set('Authorization', `Bearer ${admin_token}`);
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.result.records[0].order_id).toBe(OrderId);
      expect(response.body.result.records[0].order_status).toBe('placed');
      expect(
        response.body.result.records[0].payment_details[0].payment_status
      ).toBe('completed');
      expect(response.body.result.records[0].order_acceptance_status).toBe(
        'accepted'
      );
      expect(response.body.result.records[0].delivery_status).toBe('arrived');
    });
    test('VENDOR | Check For Order Status | Order Acceptence Status Must Be Accepted And Delivery Status Must Be Arrived', async () => {
      const response = await request(server)
        .get(`/food/order/${OrderId}`)
        .set('Authorization', `Bearer ${customer_token}`);
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.result.records[0].order_id).toBe(OrderId);
      expect(response.body.result.records[0].order_status).toBe('placed');
      expect(
        response.body.result.records[0].payment_details[0].payment_status
      ).toBe('completed');
      expect(response.body.result.records[0].order_acceptance_status).toBe(
        'accepted'
      );
      expect(response.body.result.records[0].delivery_status).toBe('arrived');
      expect(response.body.result.records[0].order_status_code).toBe(108);
    });
    test('Database Check For Order Details', async () => {
      const read_order_details = await DB.read('order').where({
        id: OrderId,
      });
      const read_payment_details = await DB.read('payment').where({
        order_id: OrderId,
      });
      expect(read_order_details[0].id).toBe(OrderId);
      expect(read_order_details[0].delivery_status).toBe('arrived');
      expect(read_order_details[0].delivery_details.delivery_status).toBe(
        'arrived'
      );
      expect(read_order_details[0].order_status).toBe('placed');
      expect(read_order_details[0].order_acceptance_status).toBe('accepted');
      expect(read_payment_details[0].payment_status).toBe('completed');
    });
  });
  describe('Order Dispatch', () => {
    test('Driver Picked Order From Restaurant | Mark Delivery Status As Arrived', async () => {
      mockgetAdminDetails();
      mockSendSQSMessage();
      const current_time = new Date().toISOString();
      const response = await request(server)
        .post('/core/callback/shadowfax/order_status')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${shadowfax_token}`)
        .send({
          allot_time: current_time,
          rider_name: 'Speedyy',
          sfx_order_id: delivery_order_id,
          client_order_id: 'RES_' + OrderId,
          order_status: 'DISPATCHED',
          rider_contact: '+91123456789',
          rider_latitude: 12.937814,
          rider_longitude: 77.61458,
          pickup_eta: 5,
          drop_eta: 20,
        });
      expect(response.status).toBe(200);
      expect(response.text).toBe('OK');
    });
    test('CUSTOMER | Check for Order Status | Delivery Status Must Be Dispatch', async () => {
      const response = await request(server)
        .get(`/food/order/${OrderId}`)
        .set('Authorization', `Bearer ${customer_token}`);
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.result.records[0].order_status).toBe('placed');
      expect(response.body.result.records[0].order_acceptance_status).toBe(
        'accepted'
      );
      expect(response.body.result.records[0].delivery_status).toBe(
        'dispatched'
      );
    });
    test('ADMIN | To Check Order Details | Delivery Delivery Status Must Be Dispatch', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .get(`/food/admin/order/${OrderId}`)
        .set('Authorization', `Bearer ${admin_token}`);
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.result.records[0].order_id).toBe(OrderId);
      expect(response.body.result.records[0].order_status).toBe('placed');
      expect(
        response.body.result.records[0].payment_details[0].payment_status
      ).toBe('completed');
      expect(response.body.result.records[0].delivery_status).toBe(
        'dispatched'
      );
      expect(response.body.result.records[0].order_acceptance_status).toBe(
        'accepted'
      );
      expect(response.body.result.records[0].delivery_order_id).not.toBe(null);
    });
    test('VENDOR | Check For Order Status | Delivery Status Must Be Dispatch', async () => {
      const orderAccept = await request(server)
        .get(`/food/vendor/order/${OrderId}`)
        .set('Authorization', `Bearer ${vendor_token}`);
      expect(orderAccept.body.status).toBe(true);
      expect(orderAccept.statusCode).toBe(200);
      expect(orderAccept.body.result.records[0].order_id).toBe(OrderId);
      expect(orderAccept.body.result.records[0].order_status).toBe('placed');
      expect(orderAccept.body.result.records[0].order_acceptance_status).toBe(
        'accepted'
      );
      expect(orderAccept.body.result.records[0].delivery_status).toBe(
        'dispatched'
      );
    });
    test('Database Check For Order Details', async () => {
      const read_order_details = await DB.read('order').where({
        id: OrderId,
      });
      const read_payment_details = await DB.read('payment').where({
        order_id: OrderId,
      });
      expect(read_order_details[0].id).toBe(OrderId);
      expect(read_order_details[0].delivery_status).toBe('dispatched');
      expect(read_order_details[0].delivery_details.delivery_status).toBe(
        'dispatched'
      );
      expect(read_order_details[0].order_status).toBe('placed');
      expect(read_order_details[0].order_acceptance_status).toBe('accepted');
      expect(read_payment_details[0].payment_status).toBe('completed');
    });
  });
  describe('Order Arrived At Customer Doorstep', () => {
    test('Driver Arrived At Customer-Door-Step | Mark Delivery Status As ARRIVED_CUSTOMER_DOORSTEP', async () => {
      mockgetAdminDetails();
      mockSendSQSMessage();
      const current_time = new Date().toISOString();
      const response = await request(server)
        .post('/core/callback/shadowfax/order_status')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${shadowfax_token}`)
        .send({
          allot_time: current_time,
          rider_name: 'Speedyy',
          sfx_order_id: delivery_order_id,
          client_order_id: 'RES_' + OrderId,
          order_status: 'ARRIVED_CUSTOMER_DOORSTEP',
          rider_contact: '+91123456789',
          rider_latitude: 12.937814,
          rider_longitude: 77.61458,
          pickup_eta: 5,
          drop_eta: 20,
        });
      expect(response.status).toBe(200);
      expect(response.text).toBe('OK');
    });
    test('CUSTOMER | Check for Order Status | Delivery Status Must Be Arrived At Customer Doorstop', async () => {
      const response = await request(server)
        .get(`/food/order/${OrderId}`)
        .set('Authorization', `Bearer ${customer_token}`);
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.result.records[0].order_status).toBe('placed');
      expect(response.body.result.records[0].order_acceptance_status).toBe(
        'accepted'
      );
      expect(response.body.result.records[0].delivery_status).toBe(
        'arrived_customer_doorstep'
      );
    });
    test('ADMIN | To Check Order Details | Delivery Delivery Status Must Be Arrived At Customer Doorstop', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .get(`/food/admin/order/${OrderId}`)
        .set('Authorization', `Bearer ${admin_token}`);
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.result.records[0].order_id).toBe(OrderId);
      expect(response.body.result.records[0].order_status).toBe('placed');
      expect(
        response.body.result.records[0].payment_details[0].payment_status
      ).toBe('completed');
      expect(response.body.result.records[0].delivery_status).toBe(
        'arrived_customer_doorstep'
      );
      expect(response.body.result.records[0].order_acceptance_status).toBe(
        'accepted'
      );
      expect(response.body.result.records[0].delivery_order_id).not.toBe(null);
    });
    test('VENDOR | Check For Order Status | Delivery Status Must Be Arrived At Customer Doorstop', async () => {
      const orderAccept = await request(server)
        .get(`/food/vendor/order/${OrderId}`)
        .set('Authorization', `Bearer ${vendor_token}`);
      expect(orderAccept.body.status).toBe(true);
      expect(orderAccept.statusCode).toBe(200);
      expect(orderAccept.body.result.records[0].order_id).toBe(OrderId);
      expect(orderAccept.body.result.records[0].order_status).toBe('placed');
      expect(orderAccept.body.result.records[0].order_acceptance_status).toBe(
        'accepted'
      );
      expect(orderAccept.body.result.records[0].delivery_status).toBe(
        'arrived_customer_doorstep'
      );
    });
    test('Database Check For Order Details', async () => {
      const read_order_details = await DB.read('order').where({
        id: OrderId,
      });
      const read_payment_details = await DB.read('payment').where({
        order_id: OrderId,
      });
      expect(read_order_details[0].id).toBe(OrderId);
      expect(read_order_details[0].delivery_status).toBe(
        'arrived_customer_doorstep'
      );
      expect(read_order_details[0].delivery_details.delivery_status).toBe(
        'arrived_customer_doorstep'
      );
      expect(read_order_details[0].order_status).toBe('placed');
      expect(read_order_details[0].order_acceptance_status).toBe('accepted');
      expect(read_payment_details[0].payment_status).toBe('completed');
    });
  });
  describe('Order Deliverd', () => {
    test('Driver Has Deliverd Order | Mark Delivery Status As DELIVERED', async () => {
      mockgetAdminDetails();
      mockSendSQSMessage();
      const current_time = new Date().toISOString();
      const response = await request(server)
        .post('/core/callback/shadowfax/order_status')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${shadowfax_token}`)
        .send({
          allot_time: current_time,
          rider_name: 'Speedyy',
          sfx_order_id: delivery_order_id,
          client_order_id: 'RES_' + OrderId,
          order_status: 'DELIVERED',
          rider_contact: '+91123456789',
          rider_latitude: 12.937814,
          rider_longitude: 77.61458,
          pickup_eta: 5,
          drop_eta: 20,
        });
      expect(response.status).toBe(200);
      expect(response.text).toBe('OK');
    });
    test('CUSTOMER | Check for Order Status | Order Status Must Be COMPLETED And Delivery Status Must Be DELIVERED', async () => {
      const response = await request(server)
        .get(`/food/order/${OrderId}`)
        .set('Authorization', `Bearer ${customer_token}`);
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.result.records[0].order_status).toBe('completed');
      expect(response.body.result.records[0].order_acceptance_status).toBe(
        'accepted'
      );
      expect(response.body.result.records[0].delivery_status).toBe('delivered');
    });
    test('ADMIN | To Check Order Details | Order Status Must Be COMPLETED And Delivery Status Must Be DELIVERED', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .get(`/food/admin/order/${OrderId}`)
        .set('Authorization', `Bearer ${admin_token}`);
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.result.records[0].order_id).toBe(OrderId);
      expect(response.body.result.records[0].order_status).toBe('completed');
      expect(
        response.body.result.records[0].payment_details[0].payment_status
      ).toBe('completed');
      expect(response.body.result.records[0].delivery_status).toBe('delivered');
      expect(response.body.result.records[0].order_acceptance_status).toBe(
        'accepted'
      );
      expect(response.body.result.records[0].delivery_order_id).not.toBe(null);
    });
    test('VENDOR | Check For Order Status | Order Status Must Be COMPLETED And Delivery Status Must Be DELIVERED', async () => {
      const orderAccept = await request(server)
        .get(`/food/vendor/order/${OrderId}`)
        .set('Authorization', `Bearer ${vendor_token}`);
      expect(orderAccept.body.status).toBe(true);
      expect(orderAccept.statusCode).toBe(200);
      expect(orderAccept.body.result.records[0].order_id).toBe(OrderId);
      expect(orderAccept.body.result.records[0].order_status).toBe('completed');
      expect(orderAccept.body.result.records[0].order_acceptance_status).toBe(
        'accepted'
      );
      expect(orderAccept.body.result.records[0].delivery_status).toBe(
        'delivered'
      );
    });
    test('Database Check For Order Details', async () => {
      const read_order_details = await DB.read('order').where({
        id: OrderId,
      });
      const read_payment_details = await DB.read('payment').where({
        order_id: OrderId,
      });
      expect(read_order_details[0].id).toBe(OrderId);
      expect(read_order_details[0].delivery_status).toBe('delivered');
      expect(read_order_details[0].delivery_details.delivery_status).toBe(
        'delivered'
      );
      expect(read_order_details[0].order_status).toBe('completed');
      expect(read_order_details[0].order_acceptance_status).toBe('accepted');
      expect(read_payment_details[0].payment_status).toBe('completed');
    });
  });
});
