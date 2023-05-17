import request from 'supertest';
import {Application} from 'express';
import {createTestServer} from '../utils/init';
import {
  createTableDynamoDB,
  loadMockSeedData,
  signToken,
  testCasesClosingTasks,
} from '../utils/utils';
import {
  mockCartServiceabilityWithValidResponse,
  mockCashfreeTrascationSuccessfullResponse,
  mockGetCustomerDetails,
  mockGetRestaurantVendors,
  mockGetTransactionToken,
  mockPlaceDeliveryOrder,
  mockPostServiceableAddress,
  mockSendSQSMessage,
} from '../utils/mock_services';
import {ICartResponse} from '../../module/food/cart/types';
import {mockSuccessfullOrderPlacedAtPetpooja} from '../petpooja/mock_services';
import {pp_restaurant_id} from '../petpooja/common';
import {notifyNewOrderToVendor} from '../../module/food/order/service';

jest.mock('axios');

let server: Application;
let vendor_token: string;
let customer_token: string;

beforeAll(async () => {
  server = await createTestServer();
  vendor_token = signToken({
    id: '33c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
    data: {
      type: 'restaurant',
      outlet_id: pp_restaurant_id,
      force_reset_password: false,
    },
    user_type: 'vendor',
  });
  customer_token = signToken({
    id: '33c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
    user_type: 'customer',
  });
  await createTableDynamoDB('user');
  await loadMockSeedData('restaurant');
  await loadMockSeedData('time_slot');
  await loadMockSeedData('restaurant_menu');
  await loadMockSeedData('subscription');
  await loadMockSeedData('coupon');
  await loadMockSeedData('global_var');
});

afterAll(async () => {
  await testCasesClosingTasks();
});

describe('Order', () => {
  let OrderId: string;
  let Payment_Id: string;
  let Order_Details: ICartResponse;
  test('Order Placed By Customer | Vendor Cannot Accept Order | Reject Order | Cancel Order', async () => {
    mockCartServiceabilityWithValidResponse();
    const valid_cart = await request(server)
      .put('/food/cart')
      .set('Authorization', `Bearer ${customer_token}`)
      .send({
        action: 'UPDATE',
        customer_device_id: '12412423432424413213123',
        customer_address_id: 'bd7e895f-0f7d-4dbe-9408-285abf5986ce',
        restaurant_id: pp_restaurant_id,
        menu_items: [
          {
            quantity: 1,
            menu_item_id: 12101,
          },
        ],
        any_special_request: 'Dont ring door bell',
      });
    expect(valid_cart.statusCode).toBe(200);
    expect(valid_cart.body.result).not.toEqual({});
    Order_Details = valid_cart.body.result;

    // Order Placed
    mockPostServiceableAddress();
    mockGetCustomerDetails();
    mockGetTransactionToken();
    const placeOrderResponse = await request(server)
      .post('/food/order/place_order')
      .set('Authorization', `Bearer ${customer_token}`);
    expect(placeOrderResponse.statusCode).toBe(200);
    OrderId = placeOrderResponse.body.result.order_id;
    Payment_Id = placeOrderResponse.body.result.payment_details.id;

    const new_order_id: number = placeOrderResponse.body.result.order_id;

    //Successful payament
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

    // Vednor Accepts Order
    mockCartServiceabilityWithValidResponse();
    mockGetRestaurantVendors();
    mockPlaceDeliveryOrder();
    mockSendSQSMessage();
    mockSuccessfullOrderPlacedAtPetpooja(pp_restaurant_id, OrderId);
    await notifyNewOrderToVendor(new_order_id, 0);
    const orderAccept = await request(server)
      .post(`/food/vendor/order/${OrderId}/accept`)
      .set('Authorization', `Bearer ${vendor_token}`)
      .send({
        accept: true,
        preparation_time: 10,
      });
    expect(orderAccept.body.status).toBe(false);
    expect(orderAccept.statusCode).toBe(400);
    expect(orderAccept.body.errors).toStrictEqual([
      {
        message:
          'restaurants registered with petpooja system can not take this action from speedyy apps',
        code: 2017,
      },
    ]);

    // Vednor Rejects Order
    mockCartServiceabilityWithValidResponse();
    mockGetRestaurantVendors();
    mockPlaceDeliveryOrder();
    mockSendSQSMessage();
    mockSuccessfullOrderPlacedAtPetpooja(pp_restaurant_id, OrderId);
    await notifyNewOrderToVendor(new_order_id, 0);
    const orderReject = await request(server)
      .post(`/food/vendor/order/${OrderId}/accept`)
      .set('Authorization', `Bearer ${vendor_token}`)
      .send({
        accept: false,
        reason: 'Staff not available',
      });
    expect(orderReject.body.status).toBe(false);
    expect(orderReject.statusCode).toBe(400);
    expect(orderReject.body.errors).toStrictEqual([
      {
        message:
          'restaurants registered with petpooja system can not take this action from speedyy apps',
        code: 2017,
      },
    ]);
  });
});
