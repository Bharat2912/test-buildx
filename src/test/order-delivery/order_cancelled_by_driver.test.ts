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
} from '../utils/mock_services';
import logger from '../../utilities/logger/winston_logger';
import {DB} from '../../data/knex';
import {RefundGateway, RefundStatus} from '../../module/core/payment/enum';
import {processOrderRefundDetails} from '../../module/food/order/service';
import {ICartResponse} from '../../module/food/cart/types';

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
 * Customer Add Items In Cart.
 * Order Is Created
 * Payment Is Completed
 * Order Rejected By Delivery Partner
 * Refund Amount Given To Customer
 */

describe('Order Cancelled By Customer Within 30 Seconds Need To Send Refund', () => {
  let OrderId: number;
  let Payment_Id: string;
  let delivery_order_id: string;
  let Order_Details: ICartResponse;
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
      Order_Details = response.body.result;
      expect(Order_Details.pod_allowed).toEqual(false);
      expect(Order_Details.pod_not_allowed_reason).toEqual(
        'POD NOT AVAILABLE AT DELIVERY SERVICE'
      );
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
    test('Once The Payment Is Done PaymentStatus Will Be COMPLETED', async () => {
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
      ).toBe('completed');
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
    });
    test('Database Check For Payment Is Successful Or Not', async () => {
      const read_order_payment_status = await DB.read('payment').where({
        order_id: OrderId,
      });
      logger.debug('read_order_payment_status', read_order_payment_status);
      expect(read_order_payment_status[0].order_id).toBe(OrderId);
      expect(read_order_payment_status[0].payment_status).toBe('completed');
    });
  });
  describe('Vendor Accept Order But Delivery Person Reject Order', () => {
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
          preparation_time: 10,
        });
      expect(orderAccept.body.status).toBe(true);
      expect(orderAccept.statusCode).toBe(200);
      expect(orderAccept.body.result.id).toBe(OrderId);
      expect(orderAccept.body.result.order_status).toBe('placed');
      expect(orderAccept.body.result.order_acceptance_status).toBe('accepted');
      expect(orderAccept.body.result.delivery_status).toBe('accepted');
      delivery_order_id = orderAccept.body.result.delivery_order_id;
    });
    test('Driver Cancelled Order with Reasone', async () => {
      mockgetAdminDetails();
      const mock_send_sqs_message = mockSendSQSMessage();
      const current_time = new Date().toISOString();
      const response = await request(server)
        .post('/core/callback/shadowfax/order_status')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${shadowfax_token}`)
        .send({
          cancel_time: current_time,
          rider_name: 'Speedyy',
          sfx_order_id: delivery_order_id,
          client_order_id: 'RES_' + OrderId,
          order_status: 'CANCELLED',
          rider_contact: '+91123456789',
          rider_latitude: 12.937814,
          rider_longitude: 77.61458,
          reason: 'Delivery Distance Is To Far',
        });
      expect(response.status).toBe(200);
      expect(response.text).toBe('OK');
      expect(mock_send_sqs_message).toHaveBeenCalledWith(
        '',
        expect.objectContaining({
          action: 4,
          data: [
            {
              action: 'ORDER_CANCELLED',
              data: {
                payload: expect.objectContaining({
                  cancellation_details: {
                    cancellation_reason: 'Delivery Distance Is To Far',
                  },
                  cancelled_by: 'Delivery Executive',
                  delivery_status: 'cancelled',
                  order_id: 1,
                  order_status: 'cancelled',
                  rider_contact: '+91123456789',
                  rider_image_url: undefined,
                  rider_latitude: 12.937814,
                  rider_longitude: 77.61458,
                  rider_name: 'Speedyy',
                }),
                to_room_ids: [
                  '33c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
                  'b0909e52-a731-4665-a791-ee6479008805',
                ],
              },
              event: 'WS',
            },
            {
              action: 'SINGLE',
              data: {
                templateData: expect.objectContaining({
                  delivery_status: 'cancelled',
                  order_id: 1,
                  order_status: 'cancelled',
                  rider_contact: '+91123456789',
                  rider_image_url: undefined,
                  rider_latitude: 12.937814,
                  rider_longitude: 77.61458,
                  rider_name: 'Speedyy',
                }),
                templateID: 'ORDER_CANCELLED_TEMPLATE',
                userID: '33c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
                userType: 'customer',
              },
              event: 'PUSH_NOTIFICATIONS',
            },
            {
              action: 'BULK',
              data: {
                templateData: expect.objectContaining({
                  delivery_status: 'cancelled',
                  order_id: 1,
                  order_status: 'cancelled',
                  rider_contact: '+91123456789',
                  rider_image_url: undefined,
                  rider_latitude: 12.937814,
                  rider_longitude: 77.61458,
                  rider_name: 'Speedyy',
                }),
                templateID: 'ORDER_CANCELLED_TEMPLATE',
                userID: ['33c6fdbc-8df6-4541-9d3f-f9e5ba4c0242'],
                userType: 'vendor',
              },
              event: 'PUSH_NOTIFICATIONS',
            },
            {
              action: 'TOPIC',
              data: {
                templateData: expect.objectContaining({
                  delivery_status: 'cancelled',
                  order_id: 1,
                  order_status: 'cancelled',
                  pickup_eta: NaN,
                  rider_contact: '+91123456789',
                  rider_image_url: undefined,
                  rider_latitude: 12.937814,
                  rider_longitude: 77.61458,
                  rider_name: 'Speedyy',
                }),
                templateID: 'ADMIN_ORDER_CANCELLED_TEMPLATE',
                topics: ['ops_manager'],
                userType: 'admin',
              },
              event: 'PUSH_NOTIFICATIONS',
            },
          ],
          event: 'CHANNELS',
        })
      );
    });
    test('ADMIN | To Check Order Details | Order Status Must Be Placed And Order Acceptence Status Must be accepted', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .get(`/food/admin/order/${OrderId}`)
        .set('Authorization', `Bearer ${admin_token}`);
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.result.records[0].order_id).toBe(OrderId);
      expect(response.body.result.records[0].order_status).toBe('cancelled');
      expect(
        response.body.result.records[0].payment_details[0].payment_status
      ).toBe('completed');
      expect(response.body.result.records[0].order_acceptance_status).toBe(
        'accepted'
      );
      expect(response.body.result.records[0].delivery_status).toBe('cancelled');
      expect(
        response.body.result.records[0].delivery_details.delivery_status
      ).toBe('cancelled');
      expect(
        response.body.result.records[0].delivery_details.cancel_reason_text
      ).toBe('Delivery Distance Is To Far');
      expect(response.body.result.records[0].cancellation_time).not.toBe(null);
      expect(response.body.result.records[0].delivery_order_id).not.toBe(null);
      expect(response.body.result.records[0].order_status_code).toBe(112);
    });
    test('CUSTOMER | Check for Order Status | Order Status Must Be Placed And  Order Acceptence Status Must be accepted ', async () => {
      const response = await request(server)
        .get(`/food/order/${OrderId}`)
        .set('Authorization', `Bearer ${customer_token}`);
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.result.records[0].order_id).toBe(OrderId);
      expect(response.body.result.records[0].order_status).toBe('cancelled');
      expect(
        response.body.result.records[0].payment_details[0].payment_status
      ).toBe('completed');
      expect(response.body.result.records[0].order_acceptance_status).toBe(
        'accepted'
      );
      expect(response.body.result.records[0].delivery_status).toBe('cancelled');
      expect(
        response.body.result.records[0].delivery_details.delivery_status
      ).toBe('cancelled');
      expect(
        response.body.result.records[0].delivery_details.cancel_reason_text
      ).toBe('Delivery Distance Is To Far');
      expect(response.body.result.records[0].cancellation_time).not.toBe(null);
      expect(response.body.result.records[0].order_status_code).toBe(112);
    });
    test('VENDOR | Check For Order Status | Order Acceptence Status Must Be Accepted', async () => {
      const response = await request(server)
        .get(`/food/order/${OrderId}`)
        .set('Authorization', `Bearer ${customer_token}`);
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.result.records[0].order_id).toBe(OrderId);
      expect(response.body.result.records[0].order_status).toBe('cancelled');
      expect(
        response.body.result.records[0].payment_details[0].payment_status
      ).toBe('completed');
      expect(response.body.result.records[0].order_acceptance_status).toBe(
        'accepted'
      );
      expect(response.body.result.records[0].delivery_status).toBe('cancelled');
      expect(
        response.body.result.records[0].delivery_details.delivery_status
      ).toBe('cancelled');
      expect(
        response.body.result.records[0].delivery_details.cancel_reason_text
      ).toBe('Delivery Distance Is To Far');
      expect(response.body.result.records[0].cancellation_time).not.toBe(null);
      expect(response.body.result.records[0].order_status_code).toBe(112);
    });
    test('Database Check For Order Details | Order WAs Accepted By Vendor But Rejected By Driver', async () => {
      const read_order_details = await DB.read('order').where({
        id: OrderId,
      });
      const read_payment_details = await DB.read('payment').where({
        order_id: OrderId,
      });
      expect(read_order_details[0].id).toBe(OrderId);
      expect(read_order_details[0].order_acceptance_status).toBe('accepted');
      expect(read_order_details[0].delivery_status).toBe('cancelled');
      expect(read_order_details[0].delivery_details.cancel_reason_text).toBe(
        'Delivery Distance Is To Far'
      );
      expect(read_order_details[0].delivery_details.delivery_status).toBe(
        'cancelled'
      );
      expect(read_order_details[0].cancellation_time).not.toBe(null);
      expect(read_order_details[0].order_status).toBe('cancelled');
      expect(read_payment_details[0].payment_status).toBe('completed');
    });
  });
  describe('Refund Given to Customer', () => {
    test('Mocked Cashfree Function For Successful Refund', async () => {
      mockSendSQSMessage();
      //Send refund details to worker function
      await processOrderRefundDetails({
        refund_id: '121',
        order_id: OrderId as number,
        payment_id: 'f8b94d1b-2a61-449c-aef5-470a2cc39843',
        customer_id: 'b06ffcb4-4782-41ce-8d10-43a7ce86cbfa',
        created_at: new Date(),
        processed_at: new Date(),
        refund_status: RefundStatus.SUCCESS,
        status_description: 'Refund processed successfully',
        refund_gateway: RefundGateway.CASHFREE,
        refund_charges: 0,
        refund_amount: 100,
      });
    });
    test('ADMIN | To Check Order Details | Order Delivery Status Must Be Cancelled', async () => {
      mockgetAdminDetails();
      const response = await request(server)
        .get(`/food/admin/order/${OrderId}`)
        .set('Authorization', `Bearer ${admin_token}`);
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.result.records[0].order_id).toBe(OrderId);
      expect(response.body.result.records[0].order_status).toBe('cancelled');
      expect(response.body.result.records[0].order_acceptance_status).toBe(
        'accepted'
      );
      expect(response.body.result.records[0].delivery_status).toBe('cancelled');
      expect(response.body.result.records[0].cancelled_by).toBe(
        'delivery_service'
      );
      expect(
        response.body.result.records[0].delivery_details.cancel_reason_text
      ).toBe('Delivery Distance Is To Far');
      expect(response.body.result.records[0].refund_status).toBe('success');
      expect(response.body.result.records[0].cancellation_time).not.toBe(null);
      expect(response.body.result.records[0].delivery_order_id).not.toBe(null);
    });
    test('CUSTOMER | Check for Order Status | Order Status Must Be Cancelled With Cancellation Reasone', async () => {
      const response = await request(server)
        .get(`/food/order/${OrderId}`)
        .set('Authorization', `Bearer ${customer_token}`);
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.result.records[0].order_id).toBe(OrderId);
      expect(response.body.result.records[0].order_status).toBe('cancelled');
      expect(response.body.result.records[0].order_acceptance_status).toBe(
        'accepted'
      );
      expect(response.body.result.records[0].delivery_status).toBe('cancelled');
      expect(response.body.result.records[0].cancelled_by).toBe(
        'delivery_service'
      );
      expect(
        response.body.result.records[0].delivery_details.cancel_reason_text
      ).toStrictEqual('Delivery Distance Is To Far');
      expect(response.body.result.records[0].cancellation_time).not.toBe(null);
      expect(response.body.result.records[0].delivery_order_id).not.toBe(null);
      expect(response.body.result.records[0].refund_status).toBe('success');
      expect(
        response.body.result.records[0].additional_details.refund_details
          .order_id
      ).toBe(OrderId);
    });
    test('Vendor | Check for Order Status | Order Status Must Be Cancelled With Cancellation Reasone And Refund Status Must Be Pending', async () => {
      const response = await request(server)
        .get(`/food/vendor/order/${OrderId}`)
        .set('Authorization', `Bearer ${vendor_token}`);
      expect(response.body.status).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.body.result.records[0].order_id).toBe(OrderId);
      expect(response.body.result.records[0].order_status).toBe('cancelled');
      expect(response.body.result.records[0].order_acceptance_status).toBe(
        'accepted'
      );
      expect(response.body.result.records[0].delivery_status).toBe('cancelled');
      expect(response.body.result.records[0].cancelled_by).toBe(
        'delivery_service'
      );
      expect(
        response.body.result.records[0].delivery_details.cancel_reason_text
      ).toStrictEqual('Delivery Distance Is To Far');
      expect(response.body.result.records[0].cancellation_time).not.toBe(null);
      expect(response.body.result.records[0].vendor_accepted_time).not.toBe(
        null
      );
      expect(response.body.result.records[0].delivery_order_id).not.toBe(null);
    });
    test('Database Check For Order Details |  Order Status Must Be Cancelled', async () => {
      const read_order_details = await DB.read('order').where({
        id: OrderId,
      });
      const read_payment_details = await DB.read('payment').where({
        order_id: OrderId,
      });
      // Order Status has to Be Cancelled And Order Cancelled By Has To Be Vendor with Id And Cancellation Resasone.
      expect(read_order_details[0].id).toBe(OrderId);
      expect(read_order_details[0].delivery_status).toBe('cancelled');
      expect(read_order_details[0].delivery_details.delivery_status).toBe(
        'cancelled'
      );
      expect(read_order_details[0].order_status).toBe('cancelled');
      expect(read_order_details[0].order_acceptance_status).toBe('accepted');
      expect(read_order_details[0].cancelled_by).toBe('delivery_service');
      expect(
        read_order_details[0].delivery_details.cancel_reason_text
      ).toStrictEqual('Delivery Distance Is To Far');
      expect(read_order_details[0].cancellation_time).not.toBe(null);
      // Since Order Is Cancelled delivery Order Id Has To Be Null.
      expect(read_order_details[0].cancellation_time).not.toBe(null);
      expect(read_order_details[0].delivery_order_id).not.toBe(null);
      expect(read_payment_details[0].payment_status).toBe('completed');
      // Customer Should Get Refund
      expect(read_order_details[0].refund_status).toBe('success');
      expect(
        read_order_details[0].additional_details?.refund_details?.refund_status
      ).toBe('success');
    });
  });
});
