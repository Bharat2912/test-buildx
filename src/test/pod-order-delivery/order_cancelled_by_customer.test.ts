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
  mockgetAdminDetails,
  mockGetCustomerDetails,
  mockGetRestaurantVendors,
  mockGetTransactionToken,
  mockPostServiceableAddress,
  mockSendSQSMessage,
} from '../utils/mock_services';
import logger from '../../utilities/logger/winston_logger';
import {DB} from '../../data/knex';

jest.mock('axios');

let server: Application;
let customer_token: string;
let admin_token: string;

beforeAll(async () => {
  process.env.DELIVERY_SERVICE = 'speedyy-rider';
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
});

afterAll(async () => {
  await testCasesClosingTasks();
  await dropTableDynamoDB('user');

  process.env.DELIVERY_SERVICE = 'shadowfax';
});

/**
 * Customer Add Items In Cart.
 * Order Is Created
 * Payment Is Completed
 * Order Cancelled By Customer within 30 Seconds
 * Refund Amount Given To Customer
 */

describe('Order Cancelled By Customer Within 30 Seconds Need To Send Refund', () => {
  let OrderId: string;
  describe('Cart', () => {
    test('Customer Added Items In Cart', async () => {
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
        });
      expect(response.statusCode).toBe(200);
      expect(response.body.result).not.toEqual({});
      const Order_Details = response.body.result;
      expect(Order_Details.pod_allowed).toEqual(true);
    });
    test('After All Valid Items Cart Will Be Created ', async () => {
      mockPostServiceableAddress();
      mockGetCustomerDetails();
      mockGetTransactionToken();
      mockSendSQSMessage();
      const placeOrderResponse = await request(server)
        .post('/food/order/place_order')
        .set('Authorization', `Bearer ${customer_token}`)
        .send({
          is_pod: true,
        });
      expect(placeOrderResponse.statusCode).toBe(200);
      expect(placeOrderResponse.body.result.order_acceptance_status).toBe(
        'pending'
      );
      expect(placeOrderResponse.body.result.delivery_status).toBe('pending');
      expect(placeOrderResponse.body.result.order_status).toBe('pending');
      expect(
        placeOrderResponse.body.result.payment_details.payment_status
      ).toBe('pending');
      OrderId = placeOrderResponse.body.result.order_id;
    });
  });
  describe('Order Payment', () => {
    test('Once The Payment Is Done PaymentStatus Will Be COMPLETED', async () => {
      const orderResponse = await request(server)
        .get(`/food/order/${OrderId}`)
        .set('Authorization', `Bearer ${customer_token}`);
      expect(orderResponse.body.status).toBe(true);
      expect(orderResponse.statusCode).toBe(200);
      expect(
        orderResponse.body.result.records &&
          orderResponse.body.result.records[0].payment_details[0].payment_status
      ).toBe('pending');
      expect(
        orderResponse.body.result.records &&
          orderResponse.body.result.records[0].order_status
      ).toBe('placed');
    });
    test('Customer | Check Order Payment Status And Order Status', async () => {
      const response = await request(server)
        .get(`/food/order/${OrderId}`)
        .set('Authorization', `Bearer ${customer_token}`);
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.result.records[0].order_id).toBe(OrderId);
      expect(response.body.result.records[0].order_status).toBe('placed');
      expect(
        response.body.result.records[0].payment_details[0].payment_status
      ).toBe('pending');
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
      ).toBe('pending');
      expect(response.body.result.records[0].delivery_status).toBe('pending');
      expect(response.body.result.records[0].order_acceptance_status).toBe(
        'pending'
      );
    });
    test('Database Check For Payment Is Successful Or Not', async () => {
      const read_order_payment_status = await DB.read('payment').where({
        order_id: OrderId,
      });
      logger.debug('read_order_payment_status', read_order_payment_status);
      expect(read_order_payment_status[0].order_id).toBe(OrderId);
      expect(read_order_payment_status[0].payment_status).toBe('pending');
    });
  });
  describe('Order Cancelled By Customer Within 30 Seconds', () => {
    test('Customer | Cancel Order After Payment Within 30 Seconds', async () => {
      mockGetRestaurantVendors();
      const response = await request(server)
        .post(`/food/order/${OrderId}/cancel`)
        .set('Authorization', `Bearer ${customer_token}`)
        .send({
          cancellation_reason: 'selected wrong delivery location',
        });
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.result).toBe('order cancelled successfully');
    });
    test('ADMIN | To Check Order Details | Order Status Must Be Cancelled And Order Acceptence Status Must Be Rejected And Refund Status Must Be Pending', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .get(`/food/admin/order/${OrderId}`)
        .set('Authorization', `Bearer ${admin_token}`);
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.result.records[0].order_id).toBe(OrderId);
      expect(response.body.result.records[0].order_status).toBe('cancelled');
      expect(response.body.result.records[0].order_acceptance_status).toBe(
        'pending'
      );
      expect(response.body.result.records[0].delivery_status).toBe('pending');
      expect(response.body.result.records[0].cancelled_by).toBe('customer');
      expect(response.body.result.records[0].refund_status).toBe('success');
      expect(
        response.body.result.records[0].cancellation_details
      ).toStrictEqual({
        cancellation_reason: 'selected wrong delivery location',
      });
      expect(response.body.result.records[0].vendor_accepted_time).toBe(null);
      expect(response.body.result.records[0].cancellation_time).not.toBe(null);
      expect(response.body.result.records[0].cancellation_user_id).not.toBe(
        null
      );
      expect(response.body.result.records[0].delivery_order_id).toBe(null);
    });
    test('Customer | Check Order Refund Status And Order Status | Refund Status Must Be Successful And Order Status Must Be Cancelled', async () => {
      const response = await request(server)
        .get(`/food/order/${OrderId}`)
        .set('Authorization', `Bearer ${customer_token}`);
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.result.records[0].order_id).toBe(OrderId);
      expect(response.body.result.records[0].order_status).toBe('cancelled');
      expect(
        response.body.result.records[0].payment_details[0].payment_status
      ).toBe('pending');
      expect(response.body.result.records[0].refund_status).toBe('success');
    });
    test('Database Check For Order Details |  Order Status Must Be Cancelled And Refund Status Must Be Pending', async () => {
      const read_order_details = await DB.read('order').where({
        id: OrderId,
      });
      const read_payment_details = await DB.read('payment').where({
        order_id: OrderId,
      });
      // Order Status has to Be Cancelled And Order Cancelled By Has To Be Vendor with Id And Cancellation Resasone.
      expect(read_order_details[0].id).toBe(OrderId);
      expect(read_order_details[0].delivery_status).toBe('pending');
      expect(read_order_details[0].delivery_details).toMatchObject({
        delivery_service: 'shadowfax',
        delivery_status: 'pending',
        drop_eta: 35,
        eta_when_order_placed: {
          default_preparation_time: 12,
          rider_from_vendor_to_customer_eta: 35,
          rider_to_vendor_eta: 1,
        },
        pickup_eta: 1,
      });
      expect(read_order_details[0].order_status).toBe('cancelled');
      expect(read_order_details[0].order_acceptance_status).toBe('pending');
      expect(read_order_details[0].cancelled_by).toBe('customer');
      expect(read_order_details[0].refund_status).toBe('success');
      expect(read_payment_details[0].payment_status).toBe('pending');
    });
  });
});

describe('Order Cancelled By Customer after 30 Seconds Need To Send Refund', () => {
  let OrderId: string;
  describe('Cart', () => {
    test('Customer Added Items In Cart', async () => {
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
        });
      expect(response.statusCode).toBe(200);
      expect(response.body.result).not.toEqual({});
      const Order_Details = response.body.result;
      expect(Order_Details.pod_allowed).toEqual(true);
    });
    test('After All Valid Items Cart Will Be Created ', async () => {
      mockPostServiceableAddress();
      mockGetCustomerDetails();
      mockGetTransactionToken();
      mockSendSQSMessage();
      const placeOrderResponse = await request(server)
        .post('/food/order/place_order')
        .set('Authorization', `Bearer ${customer_token}`)
        .send({
          is_pod: true,
        });
      expect(placeOrderResponse.statusCode).toBe(200);
      expect(placeOrderResponse.body.result.order_acceptance_status).toBe(
        'pending'
      );
      expect(placeOrderResponse.body.result.delivery_status).toBe('pending');
      expect(placeOrderResponse.body.result.order_status).toBe('pending');
      expect(
        placeOrderResponse.body.result.payment_details.payment_status
      ).toBe('pending');
      OrderId = placeOrderResponse.body.result.order_id;
    });
  });
  describe('Order Payment', () => {
    test('Once The Payment Is Done PaymentStatus Will Be COMPLETED', async () => {
      const orderResponse = await request(server)
        .get(`/food/order/${OrderId}`)
        .set('Authorization', `Bearer ${customer_token}`);
      expect(orderResponse.body.status).toBe(true);
      expect(orderResponse.statusCode).toBe(200);
      expect(
        orderResponse.body.result.records &&
          orderResponse.body.result.records[0].payment_details[0].payment_status
      ).toBe('pending');
      expect(
        orderResponse.body.result.records &&
          orderResponse.body.result.records[0].order_status
      ).toBe('placed');
    });
    test('Customer | Check Order Payment Status And Order Status', async () => {
      const response = await request(server)
        .get(`/food/order/${OrderId}`)
        .set('Authorization', `Bearer ${customer_token}`);
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.result.records[0].order_id).toBe(OrderId);
      expect(response.body.result.records[0].order_status).toBe('placed');
      expect(
        response.body.result.records[0].payment_details[0].payment_status
      ).toBe('pending');
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
      ).toBe('pending');
      expect(response.body.result.records[0].delivery_status).toBe('pending');
      expect(response.body.result.records[0].order_acceptance_status).toBe(
        'pending'
      );
    });
    test('Database Check For Payment Is Successful Or Not', async () => {
      const read_order_payment_status = await DB.read('payment').where({
        order_id: OrderId,
      });
      logger.debug('read_order_payment_status', read_order_payment_status);
      expect(read_order_payment_status[0].order_id).toBe(OrderId);
      expect(read_order_payment_status[0].payment_status).toBe('pending');
    });
  });
  describe('Order Cancelled By Customer after 30 Seconds', () => {
    test('Customer | Cancel Order After Payment after 30 Seconds', async () => {
      await DB.write.raw(
        `update "order" set order_placed_time = order_placed_time - interval '160 second'
      where id = ${OrderId}`
      );
      mockGetRestaurantVendors();
      const response = await request(server)
        .post(`/food/order/${OrderId}/cancel`)
        .set('Authorization', `Bearer ${customer_token}`)
        .send({
          cancellation_reason: 'Restaurant not accepted order for too long',
        });
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.result).toBe('order cancelled successfully');
      const order = await DB.write.raw(
        `select * from "order" where id = ${OrderId}`
      );
      expect(order.rows[0].order_status).toBe('cancelled');
      expect(
        order.rows[0].invoice_breakout.refund_settlement_details
      ).toMatchObject({
        refund_settled_by: 'system',
        refund_settled_customer_amount: 0,
        refund_settled_delivery_charges: 0,
        refund_settlement_note_to_vendor:
          'Vendor payout will be not applicable on this order because vendor has not accepted the order yet',
        refund_settlement_note_to_customer:
          'Customer will not get any refund as this is a pay on delivery order',
        refund_settled_vendor_payout_amount: 0,
        refund_settlement_note_to_delivery_partner:
          'No delivery charges will be applicable since order has not yet been placed with the delivery partner',
      });
    });
    test('ADMIN | To Check Order Details | Order Status Must Be Cancelled And Order Acceptence Status Must Be Rejected And Refund Status Must Be Pending', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .get(`/food/admin/order/${OrderId}`)
        .set('Authorization', `Bearer ${admin_token}`);
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.result.records[0].order_id).toBe(OrderId);
      expect(response.body.result.records[0].order_status).toBe('cancelled');
      expect(response.body.result.records[0].order_acceptance_status).toBe(
        'pending'
      );
      expect(response.body.result.records[0].delivery_status).toBe('pending');
      expect(response.body.result.records[0].cancelled_by).toBe('customer');
      expect(response.body.result.records[0].refund_status).toBe('success');
      expect(
        response.body.result.records[0].cancellation_details
      ).toStrictEqual({
        cancellation_reason: 'Restaurant not accepted order for too long',
      });
      expect(response.body.result.records[0].vendor_accepted_time).toBe(null);
      expect(response.body.result.records[0].cancellation_time).not.toBe(null);
      expect(response.body.result.records[0].cancellation_user_id).not.toBe(
        null
      );
      expect(response.body.result.records[0].delivery_order_id).toBe(null);
    });
    test('Customer | Check Order Refund Status And Order Status | Refund Status Must Be Successful And Order Status Must Be Cancelled', async () => {
      const response = await request(server)
        .get(`/food/order/${OrderId}`)
        .set('Authorization', `Bearer ${customer_token}`);
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.result.records[0].order_id).toBe(OrderId);
      expect(response.body.result.records[0].order_status).toBe('cancelled');
      expect(
        response.body.result.records[0].payment_details[0].payment_status
      ).toBe('pending');
      expect(response.body.result.records[0].refund_status).toBe('success');
    });
    test('Database Check For Order Details |  Order Status Must Be Cancelled And Refund Status Must Be Pending', async () => {
      const read_order_details = await DB.read('order').where({
        id: OrderId,
      });
      const read_payment_details = await DB.read('payment').where({
        order_id: OrderId,
      });
      // Order Status has to Be Cancelled And Order Cancelled By Has To Be Vendor with Id And Cancellation Resasone.
      expect(read_order_details[0].id).toBe(OrderId);
      expect(read_order_details[0].delivery_status).toBe('pending');
      expect(read_order_details[0].delivery_details).toMatchObject({
        delivery_service: 'shadowfax',
        delivery_status: 'pending',
        drop_eta: 35,
        eta_when_order_placed: {
          default_preparation_time: 12,
          rider_from_vendor_to_customer_eta: 35,
          rider_to_vendor_eta: 1,
        },
        pickup_eta: 1,
      });
      expect(read_order_details[0].order_status).toBe('cancelled');
      expect(read_order_details[0].order_acceptance_status).toBe('pending');
      expect(read_order_details[0].cancelled_by).toBe('customer');
      expect(read_order_details[0].refund_status).toBe('success');
      expect(read_payment_details[0].payment_status).toBe('pending');
    });
  });
});
