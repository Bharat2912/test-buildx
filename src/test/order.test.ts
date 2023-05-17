import request from 'supertest';
import {createTestServer} from './utils/init';
import {Application} from 'express';
import {
  createTableDynamoDB,
  dropTableDynamoDB,
  loadMockSeedData,
  signToken,
  testCasesClosingTasks,
} from './utils/utils';
import {
  cartResponse,
  postPlaceOrderResponse,
  valid_cart_request,
} from './utils/mock_responses';
import {
  mockCashfreeTrascationSuccessfullResponse,
  mockgetAdminDetails,
  mockGetCustomerDetails,
  mockGetRestaurantVendors,
  mockGetTransactionToken,
  mockPostServiceableAddress,
  mockSendSQSMessage,
} from './utils/mock_services';
import {updateOrder, updatePaymentById} from '../module/food/order/models';
import {DB, getTransaction} from '../data/knex';
import {
  DeliveryStatus,
  OrderAcceptanceStatus,
  OrderStatus,
  PaymentStatus,
} from '../module/food/order/enums';

jest.mock('axios');

let server: Application;
let customer_token: string;
let admin_token: string;
let vendor_token: string;

beforeAll(async () => {
  server = await createTestServer();

  await createTableDynamoDB('user');
  await loadMockSeedData('restaurant');
  await loadMockSeedData('restaurant_menu');
  await loadMockSeedData('time_slot');
  await loadMockSeedData('subscription');
  //cart and order pre mock data is same
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
});

afterAll(async () => {
  await testCasesClosingTasks();
  await dropTableDynamoDB('user');
});

async function markOrderComplete(order_id: number, payment_id: string) {
  const trx = await getTransaction();

  await updateOrder(trx, {
    id: order_id,
    order_status: OrderStatus.COMPLETED,
    order_acceptance_status: OrderAcceptanceStatus.ACCEPTED,
    delivery_status: DeliveryStatus.DELIVERED,
    order_placed_time: new Date(),
    order_delivered_at: new Date(),
    order_pickedup_time: new Date(),
  });
  await updatePaymentById(trx, {
    id: payment_id,
    payment_status: PaymentStatus.COMPLETED,
    transaction_time: new Date(),
  });
  await trx.commit();
}

describe('ORDER TESTING', () => {
  // eslint-disable-next-line
  let place_order_response: any;
  //Before testing place order API we need to create a cart
  describe('CART - PLACE ORDER - CONFIRM PAYMENT', () => {
    test('CREATE USER CART API - PUT /food/cart', async () => {
      mockPostServiceableAddress();
      const cart_response = await request(server)
        .put('/food/cart')
        .set('Authorization', `Bearer ${customer_token}`)
        .send(valid_cart_request);
      expect(cart_response.statusCode).toBe(200);
      expect(cart_response.body.result).not.toEqual({});
      delete cart_response.body.result.restaurant_details.next_opens_at;
      delete cart_response.body.result.last_updated_at;
      expect(cart_response.body.result).toMatchObject(cartResponse);
    });

    test('PLACE ORDER - POST /food/order/place_order', async () => {
      mockPostServiceableAddress();
      mockGetCustomerDetails();
      mockGetTransactionToken();
      place_order_response = await request(server)
        .post('/food/order/place_order')
        .set('Authorization', `Bearer ${customer_token}`);
      expect(place_order_response.statusCode).toBe(200);
      postPlaceOrderResponse.order_id =
        place_order_response.body.result.order_id;
      postPlaceOrderResponse.order_created_at =
        place_order_response.body.result.order_created_at;
      postPlaceOrderResponse.payment_details.id =
        place_order_response.body.result.payment_details.id;
      expect(place_order_response.body.result).toMatchObject(
        postPlaceOrderResponse
      );
    });
    test('POST - CONFIRM PAYMENT API', async () => {
      //mockGetTransactionStatusSuccessfullResponse();
      const payment_id = place_order_response.body.result.payment_details.id;
      const order_id = place_order_response.body.result.order_id;
      mockCashfreeTrascationSuccessfullResponse(payment_id, order_id);
      mockGetRestaurantVendors();
      mockSendSQSMessage();
      // const start_time = Math.abs(
      //   new Date('2022-05-18 15:28:37.0').getTime() / 1000
      // );
      // const end_time =
      //   Math.abs(new Date('2022-05-18 15:28:37.0').getTime() / 1000) +
      //   +process.env.ORDER_CANCELLATION_DURATION!;
      // eslint-disable-next-line
      const paymentResponse: any = await request(server)
        .post(`/food/order/confirm_payment/${payment_id}`)
        .set('Authorization', `Bearer ${customer_token}`);
      expect(paymentResponse.statusCode).toBe(200);
      expect(paymentResponse.body.result).toMatchObject({
        message: 'TRANSACTION_COMPLETED',
      });

      //once payment is completed we will check if the details are inserted into database payment table
      // const databaseResponse = await getPaymentOrderTableDetails(
      //   placeOrderResponse.body.result.payment_details.id,
      //   placeOrderResponse.body.result.customer_details.customer_id
      // );
      // PaymentTableResponse.created_at = databaseResponse.created_at;
      // PaymentTableResponse.updated_at = databaseResponse.updated_at;
      // PaymentTableResponse.id =
      //   placeOrderResponse.body.result.payment_details.id;
      // PaymentTableResponse.order_id = placeOrderResponse.body.result.order_id;
      // PaymentTableResponse.transaction_time = databaseResponse.transaction_time;

      // expect(databaseResponse).toMatchObject(PaymentTableResponse);
    });
  });

  describe('PLACE ORDER FAILS WHEN CART IS INVALID', () => {
    test('PUT - INVALID USER CART API', async () => {
      mockPostServiceableAddress();
      const putCartResponse = await request(server)
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
              menu_item_id: 0,
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
                  addons: [7767],
                },
              ],
            },
          ],
          any_special_request: 'Dont ring door bell',
        });
      expect(putCartResponse.statusCode).toBe(400);
    });
  });

  describe('CONFIRM PAYMENT', () => {
    test('CONFIRM PAYMENT FAILED WHEN PAYMENT ID IS INVALID - POST /food/order/confirm_payment', async () => {
      const paymentResponse = await request(server)
        .post(
          '/food/order/confirm_payment/RES_11c6fdbc-8df6-4541-9d3f-f9e5ba4c0242'
        )
        .set('Authorization', `Bearer ${customer_token}`);
      expect(paymentResponse.statusCode).toBe(400);
      expect(paymentResponse.body.errors).toStrictEqual([
        {
          code: 1046,
          message: 'invalid payment id',
        },
      ]);
    });

    // test('CONFIRM PAYMENT FAILS AS IT IS ALREADY PAID', async () => {
    //   const paymentResponse = await request(server)
    //     .post('/food/order/confirm_payment')
    //     .set('Authorization', `Bearer ${customer_token}`)
    //     .send({
    //       order_id: placeOrderResponse.body.result.order_id,
    //       payment_id: placeOrderResponse.body.result.payment_details.id,
    //     });
    //   expect(paymentResponse.statusCode).toBe(400);
    // });
  });

  describe('CANCEL ORDER', () => {
    describe('AS CUSTOMER', () => {
      test('PUT - CREATE USER CART API', async () => {
        mockPostServiceableAddress();
        const putCartResponse = await request(server)
          .put('/food/cart')
          .set('Authorization', `Bearer ${customer_token}`)
          .send(valid_cart_request);
        expect(putCartResponse.statusCode).toBe(200);

        expect(putCartResponse.body.result).not.toEqual({});
        delete putCartResponse.body.result.restaurant_details.next_opens_at;
        delete putCartResponse.body.result.last_updated_at;
        expect(putCartResponse.body.result).toMatchObject(cartResponse);
      });
      // eslint-disable-next-line
      let placeOrderResponse: any;
      test('POST - PLACE ORDER API', async () => {
        mockPostServiceableAddress();
        mockGetCustomerDetails();
        mockGetTransactionToken();
        placeOrderResponse = await request(server)
          .post('/food/order/place_order')
          .set('Authorization', `Bearer ${customer_token}`);
        expect(placeOrderResponse.body.statusCode).toBe(200);
        postPlaceOrderResponse.order_id =
          placeOrderResponse.body.result.order_id;
        postPlaceOrderResponse.order_created_at =
          placeOrderResponse.body.result.order_created_at;
        postPlaceOrderResponse.payment_details.id =
          placeOrderResponse.body.result.payment_details.id;
        expect(placeOrderResponse.body.result).toMatchObject(
          postPlaceOrderResponse
        );
      });

      test('CUSTOMER CAN CANCEL ORDER BY ORDER ID', async () => {
        const trx = await getTransaction();
        mockSendSQSMessage();
        await updatePaymentById(trx, {
          id: placeOrderResponse.body.result.payment_details.id,
          payment_status: PaymentStatus.COMPLETED,
          transaction_time: new Date(),
        });
        await updateOrder(trx, {
          id: placeOrderResponse.body.result.order_id,
          order_placed_time: new Date(),
        });
        await trx.commit();
        const cancellationResponse = await request(server)
          .post(`/food/order/${placeOrderResponse.body.result.order_id}/cancel`)
          .set('Authorization', `Bearer ${customer_token}`);
        expect(cancellationResponse.body.statusCode).toBe(200);
        expect(cancellationResponse.body.result).toBe(
          'order cancelled successfully'
        );
      });

      test('CUSTOMER TRIES TO CANCEL ORDER WHICH IS ALREADY CANCELLED THROWS ERROR', async () => {
        const cancellationResponse = await request(server)
          .post(`/food/order/${placeOrderResponse.body.result.order_id}/cancel`)
          .set('Authorization', `Bearer ${customer_token}`);
        expect(cancellationResponse.body.statusCode).toBe(400);
        expect(cancellationResponse.body.errors).toStrictEqual([
          {message: 'order already cancelled', code: 1037},
        ]);
      });

      test('CUSTOMER TRIES TO CANCEL ORDER WHICH IS ALREADY COMPLETED THROWS ERROR', async () => {
        await markOrderComplete(
          placeOrderResponse.body.result.order_id,
          placeOrderResponse.body.result.payment_details.id
        );
        const cancellationResponse = await request(server)
          .post(`/food/order/${placeOrderResponse.body.result.order_id}/cancel`)
          .set('Authorization', `Bearer ${customer_token}`);
        expect(cancellationResponse.body.statusCode).toBe(400);
        expect(cancellationResponse.body.errors).toStrictEqual([
          {message: 'order already completed', code: 1038},
        ]);
      });

      test('CUSTOMER TRIES TO CANCEL ORDER BY INVALID ORDER ID THROWS ERROR', async () => {
        const cancellationResponse = await request(server)
          .post('/food/order/100/cancel')
          .set('Authorization', `Bearer ${customer_token}`);
        expect(cancellationResponse.body.statusCode).toBe(400);
        expect(cancellationResponse.body.errors).toStrictEqual([
          {message: 'invalid order id', code: 1036},
        ]);
      });

      // test('IF CUSTOMER TRIES TO CANCEL ORDER AFTER 35 SECONDS THEN THROW ERROR', async () => {
      //   const added_seconds = new Date();
      //   logger.debug('added_seconds', added_seconds);
      //   added_seconds.setMinutes(added_seconds.getMinutes() + 2);
      //   const trx = await getTransaction();
      //   await updateOrder(trx, {
      //     id: placeOrderResponse.body.result.order_id,
      //     order_status: OrderStatus.PENDING,
      //   });
      //   await updatePaymentById(trx, {
      //     id: placeOrderResponse.body.result.payment_details.id,
      //     payment_status: PaymentStatus.COMPLETED,
      //     transaction_time: added_seconds,
      //   });
      //   await trx.commit();
      //   const cancellationResponse = await request(server)
      //     .post(`/food/order/${placeOrderResponse.body.result.order_id}/cancel`)
      //     .set('Authorization', `Bearer ${customer_token}`);
      //   expect(cancellationResponse.body.statusCode).toBe(200);
      //   expect(cancellationResponse.body.status).toBe(true);
      //   expect(cancellationResponse.body.result).toBe(
      //     'order cancelled successfully'
      //   );
      // });
    });

    describe('AS ADMIN', () => {
      test('PUT - CREATE USER CART API', async () => {
        mockPostServiceableAddress();
        const putCartResponse = await request(server)
          .put('/food/cart')
          .set('Authorization', `Bearer ${customer_token}`)
          .send(valid_cart_request);
        expect(putCartResponse.statusCode).toBe(200);

        expect(putCartResponse.body.result).not.toEqual({});
        delete putCartResponse.body.result.restaurant_details.next_opens_at;
        delete putCartResponse.body.result.last_updated_at;
        expect(putCartResponse.body.result).toMatchObject(cartResponse);
      });
      // eslint-disable-next-line
      let placeOrderResponse: any;
      test('POST - PLACE ORDER API', async () => {
        mockPostServiceableAddress();
        mockGetCustomerDetails();
        mockGetTransactionToken();
        placeOrderResponse = await request(server)
          .post('/food/order/place_order')
          .set('Authorization', `Bearer ${customer_token}`);
        expect(placeOrderResponse.body.statusCode).toBe(200);
        postPlaceOrderResponse.order_id =
          placeOrderResponse.body.result.order_id;
        postPlaceOrderResponse.order_created_at =
          placeOrderResponse.body.result.order_created_at;
        postPlaceOrderResponse.payment_details.id =
          placeOrderResponse.body.result.payment_details.id;
        expect(placeOrderResponse.body.result).toMatchObject(
          postPlaceOrderResponse
        );
      });

      test('ADMIN CAN CANCEL ORDER BY ORDER ID', async () => {
        await mockgetAdminDetails();
        const cancellationResponse = await request(server)
          .post(
            `/food/admin/order/${placeOrderResponse.body.result.order_id}/cancel`
          )
          .set('Authorization', `Bearer ${admin_token}`)
          .send({
            cancellation_reason: 'admin cancellation reason',
          });
        expect(cancellationResponse.body.statusCode).toBe(200);
        expect(cancellationResponse.body.result).toBe(
          'order cancelled successfully'
        );
      });

      test('ADMIN TRIES TO CANCEL ORDER WHICH IS ALREADY CANCELLED THROWS ERROR', async () => {
        await mockgetAdminDetails();
        const cancellationResponse = await request(server)
          .post(
            `/food/admin/order/${placeOrderResponse.body.result.order_id}/cancel`
          )
          .set('Authorization', `Bearer ${admin_token}`)
          .send({
            cancellation_reason: 'admin cancellation reason',
          });
        expect(cancellationResponse.body.statusCode).toBe(400);
        expect(cancellationResponse.body.errors).toStrictEqual([
          {message: 'order already cancelled', code: 1037},
        ]);
      });

      // test('ADMIN TRIES TO CANCEL ORDER WHICH IS ALREADY COMPLETED THROWS ERROR', async () => {
      //   await mockgetAdminDetails();
      //   await markOrderComplete(
      //     placeOrderResponse.body.result.order_id,
      //     placeOrderResponse.body.result.payment_details.id
      //   );
      //   const cancellationResponse = await request(server)
      //     .post(
      //       `/food/admin/order/${placeOrderResponse.body.result.order_id}/cancel`
      //     )
      //     .set('Authorization', `Bearer ${admin_token}`)
      //     .send({
      //       cancellation_reason: 'admin cancellation reason',
      //     });
      //   expect(cancellationResponse.body.statusCode).toBe(400);
      //   expect(cancellationResponse.body.errors).toStrictEqual([
      //     {message: 'order already completed', code: 1038},
      //   ]);
      // });

      test('ADMIN TRIES TO CANCEL ORDER BY INVALID ORDER ID THROWS ERROR', async () => {
        await mockgetAdminDetails();
        const cancellationResponse = await request(server)
          .post('/food/admin/order/1231/cancel')
          .set('Authorization', `Bearer ${admin_token}`)
          .send({
            cancellation_reason: 'admin cancellation reason',
          });
        expect(cancellationResponse.body.statusCode).toBe(400);
        expect(cancellationResponse.body.errors).toStrictEqual([
          {message: 'invalid order id', code: 1036},
        ]);
      });

      test('ADMIN CAN CANCEL ORDER AT ANY TIME', async () => {
        mockgetAdminDetails();
        const trx = await getTransaction();
        await updateOrder(trx, {
          id: placeOrderResponse.body.result.order_id,
          created_at: new Date('2022-05-26 17:13:43.943174+05:30'),
          order_status: OrderStatus.PENDING,
          delivery_status: DeliveryStatus.PENDING,
        });
        await trx.commit();
        const cancellationResponse = await request(server)
          .post(
            `/food/admin/order/${placeOrderResponse.body.result.order_id}/cancel`
          )
          .set('Authorization', `Bearer ${admin_token}`)
          .send({
            cancellation_reason: 'admin cancellation reason',
          });
        expect(cancellationResponse.body.statusCode).toBe(200);
        expect(cancellationResponse.body.result).toBe(
          'order cancelled successfully'
        );
      });
    });
  });

  describe('FILTER', () => {
    describe('AS CUSTOMER', () => {
      test('Empty Filter Body | Need To All Order With Details', async () => {
        await mockgetAdminDetails();
        const orderDetails = await request(server)
          .post('/food/order/filter')
          .set('Authorization', `Bearer ${customer_token}`)
          .send({
            filter: {},
            pagination: {
              page_index: 0,
              page_size: 5,
            },
            sort: [
              {
                column: 'created_at',
                order: 'asc',
              },
            ],
          });
        expect(orderDetails.statusCode).toBe(200);
        expect(orderDetails.body.status).toBe(true);
        expect(orderDetails.body.result.records).not.toBe(null);
      });
      test('Get Order_status pending details', async () => {
        await mockgetAdminDetails();
        const orderDetails = await request(server)
          .post('/food/order/filter')
          .set('Authorization', `Bearer ${customer_token}`)
          .send({
            filter: {
              order_status: ['pending'],
            },
            pagination: {
              page_index: 0,
              page_size: 5,
            },
            sort: [
              {
                column: 'created_at',
                order: 'asc',
              },
            ],
          });
        expect(orderDetails.statusCode).toBe(200);
        expect(orderDetails.body.status).toBe(true);
        //expect(orderDetails.body.result.records[ ]).toBe();
      });
      test('Get Details Of Completed Order', async () => {
        await mockgetAdminDetails();
        const orderDetails = await request(server)
          .post('/food/order/filter')
          .set('Authorization', `Bearer ${customer_token}`)
          .send({
            filter: {
              order_status: ['completed'],
            },
            pagination: {
              page_index: 0,
              page_size: 5,
            },
            sort: [
              {
                column: 'created_at',
                order: 'asc',
              },
            ],
          });
        expect(orderDetails.statusCode).toBe(200);
        expect(orderDetails.body.status).toBe(true);
        expect(orderDetails.body.result.records[0].order_id).toBe(3);
        expect(orderDetails.body.result.records[0].order_status).toBe(
          'completed'
        );
      });
    });
    describe('AS VENDOR', () => {
      test('Sending Empty Order Status Body | Need to Throw  Error', async () => {
        const orderDetails = await request(server)
          .post('/food/vendor/order/filter')
          .set('Authorization', `Bearer ${vendor_token}`)
          .send({
            filter: {
              order_status: [' '],
            },
            pagination: {
              page_index: 0,
              page_size: 5,
            },
            sort: [
              {
                column: 'created_at',
                order: 'asc',
              },
            ],
          });
        expect(orderDetails.statusCode).toBe(400);
        expect(orderDetails.body.status).toBe(false);
        expect(orderDetails.body.errors).toStrictEqual([
          {
            message:
              '"filter.order_status[0]" must be one of [placed, cancelled, completed]',
            code: 1000,
          },
        ]);
      });
      test('Get Details Of Completed Order', async () => {
        const orderDetails = await request(server)
          .post('/food/vendor/order/filter')
          .set('Authorization', `Bearer ${vendor_token}`)
          .send({
            filter: {
              delivery_status: ['pending'],
            },
            pagination: {
              page_index: 0,
              page_size: 5,
            },
            sort: [
              {
                column: 'created_at',
                order: 'asc',
              },
            ],
          });
        expect(orderDetails.statusCode).toBe(200);
        expect(orderDetails.body.status).toBe(true);
      });
      test('Get Details to check Customer_order_count', async () => {
        await DB.write.raw(
          `update "order" set order_placed_time = order_placed_time - interval '160 second'
          where restaurant_id = 'b0909e52-a731-4665-a791-ee6479008805'
          and order_placed_time is not null
          `
        );
        const orderDetails = await request(server)
          .post('/food/vendor/order/filter')
          .set('Authorization', `Bearer ${vendor_token}`)
          .send({
            filter: {},
            pagination: {
              page_index: 0,
              page_size: 50,
            },
            sort: [
              {
                column: 'created_at',
                order: 'asc',
              },
            ],
          });
        expect(orderDetails.statusCode).toBe(200);
        expect(orderDetails.body.status).toBe(true);
        expect(orderDetails.body.result.records).toMatchObject([
          {
            order_id: 2,
            restaurant_id: 'b0909e52-a731-4665-a791-ee6479008805',
            customer_id: '33c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
            delivery_service: 'shadowfax',
            pos_id: null,
            pos_partner: null,
            customer_order_count: 2,
            order_status_title: 'Order Placed',
          },
          {
            order_id: 3,
            restaurant_id: 'b0909e52-a731-4665-a791-ee6479008805',
            customer_id: '33c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
            delivery_service: 'shadowfax',
            pos_id: null,
            pos_partner: null,
            customer_order_count: 3,
            order_status_title: 'Order Delivered',
          },
        ]);
      });
      test('Filter Order With Invalid Order_id as search_text', async () => {
        const orderDetails = await request(server)
          .post('/food/vendor/order/filter')
          .set('Authorization', `Bearer ${vendor_token}`)
          .send({
            search_text: "1's order",
            pagination: {
              page_index: 0,
              page_size: 5,
            },
            sort: [
              {
                column: 'created_at',
                order: 'asc',
              },
            ],
          });
        expect(orderDetails.body.statusCode).toBe(200);
        expect(orderDetails.body.status).toBe(true);
        expect(orderDetails.body.result.total_records).toEqual(0);
      });
    });
  });

  describe('GET ORDER DETAILS BY ID', () => {
    describe('AS ADMIN', () => {
      test('GET ORDER DEATILS OF EXISTING ORDER', async () => {
        await mockgetAdminDetails();
        const orderDetails = await request(server)
          .get('/food/admin/order/1')
          .set('Authorization', `Bearer ${admin_token}`);
        expect(orderDetails.statusCode).toBe(200);
        expect(orderDetails.body.result).not.toBe({});
      });

      test('GET ORDER DEATILS OF NON EXISTING ORDER THROWS ERROR', async () => {
        await mockgetAdminDetails();
        const orderDetails = await request(server)
          .get('/food/admin/order/999')
          .set('Authorization', `Bearer ${admin_token}`);
        expect(orderDetails.statusCode).toBe(400);
        expect(orderDetails.body.errors).toStrictEqual([
          {message: 'invalid order id', code: 1036},
        ]);
      });
    });
    describe('AS VENDOR', () => {
      test('GET ORDER DEATILS OF EXISTING ORDER', async () => {
        const orderDetails = await request(server)
          .get('/food/vendor/order/1')
          .set('Authorization', `Bearer ${vendor_token}`);
        expect(orderDetails.statusCode).toBe(200);
        expect(orderDetails.body.result).not.toBe({});
      });

      test('GET ORDER DEATILS OF NON EXISTING ORDER THROWS ERROR', async () => {
        const orderDetails = await request(server)
          .get('/food/vendor/order/999')
          .set('Authorization', `Bearer ${vendor_token}`);
        expect(orderDetails.statusCode).toBe(400);
        expect(orderDetails.body.errors).toStrictEqual([
          {message: 'invalid order id', code: 1036},
        ]);
      });
    });
  });
});
