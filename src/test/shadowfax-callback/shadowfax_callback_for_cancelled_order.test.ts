import request from 'supertest';
import {createTestServer} from '../utils/init';
import {Application} from 'express';
import {
  loadMockSeedData,
  signToken,
  createTableDynamoDB,
  dropTableDynamoDB,
  testCasesClosingTasks,
} from '../utils/utils';
import logger from '../../utilities/logger/winston_logger';
import {DB} from '../../data/knex';
import {valid_cart_request} from '../utils/mock_responses';
import {
  mockPostServiceableAddress,
  mockGetCustomerDetails,
  mockGetTransactionToken,
  mockSendSQSMessage,
  mockPlaceDeliveryOrder,
  mockCancelDeliverySuccess,
  mockCashfreeTrascationSuccessfullResponse,
  mockGetRestaurantVendors,
} from '../utils/mock_services';

jest.mock('axios');

let server: Application;
let customer_token: string;
let vendor_token: string;

beforeAll(async () => {
  server = await createTestServer();

  await createTableDynamoDB('user');
  await loadMockSeedData('restaurant');
  await loadMockSeedData('time_slot');
  await loadMockSeedData('subscription');
  await loadMockSeedData('restaurant_menu');
  logger.info('DataBase Connection Created For Testing');
  customer_token = signToken({
    id: '33c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
    user_type: 'customer',
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
describe('Shadowfax Callback Testing :-', () => {
  test('Create Cart | Place Order | Accept Order | Cancel Order By Customer | Recieved Shadowfax Allocated Callback | Need To Send AdminAlert Email ', async () => {
    /* =================================
                *CREATE CART
    ==================================== */
    const mock_post_serviceable_add = mockPostServiceableAddress();

    const put_cart_response = await request(server)
      .put('/food/cart')
      .set('Authorization', `Bearer ${customer_token}`)
      .send(valid_cart_request);
    expect(put_cart_response.statusCode).toBe(200);
    expect(mock_post_serviceable_add).toHaveBeenCalled();

    /* =================================
                *PLACE ORDER
    ==================================== */
    const mock_post_serviceable_address = mockPostServiceableAddress();
    const mock_get_customer_details = mockGetCustomerDetails();
    const mock_get_transaction_token = mockGetTransactionToken();

    const pending_order_response = await request(server)
      .post('/food/order/place_order')
      .set('Authorization', `Bearer ${customer_token}`);
    expect(pending_order_response.statusCode).toBe(200);
    expect(mock_post_serviceable_address).toHaveBeenCalled();
    expect(mock_get_customer_details).toHaveBeenCalled();
    expect(mock_get_transaction_token).toHaveBeenCalled();

    const order_id = pending_order_response.body.result.order_id;
    const payment_id = pending_order_response.body.result.payment_details.id;

    const pending_order_db_read = await DB.read('order').where({id: order_id});
    expect(pending_order_db_read[0].order_acceptance_status).toBe('pending');
    expect(pending_order_db_read[0].delivery_status).toBe('pending');
    expect(pending_order_db_read[0].order_status).toBe('pending');
    expect(pending_order_db_read[0].delivery_order_id).toBeNull();

    const pending_order_payment_db_read = await DB.read('payment').where({
      id: payment_id,
    });
    expect(pending_order_payment_db_read[0].payment_status).toBe('pending');

    /* =================================
              *CONFIRM PAYMENT
    ==================================== */
    const mock_send_sqs_message = mockSendSQSMessage();
    const mock_payment_gateway_success =
      mockCashfreeTrascationSuccessfullResponse(
        payment_id,
        pending_order_response.body.result.invoice_breakout!
          .total_customer_payable
      );

    const placed_order_response = await request(server)
      .post(`/food/order/confirm_payment/${payment_id}`)
      .set('Authorization', `Bearer ${customer_token}`);
    expect(placed_order_response.body.status).toBe(true);
    expect(placed_order_response.statusCode).toBe(200);
    expect(placed_order_response.body.result).toMatchObject({
      message: 'TRANSACTION_COMPLETED',
    });
    expect(mock_send_sqs_message).toHaveBeenCalled();
    expect(mock_payment_gateway_success).toHaveBeenCalled();

    const placed_order_db_read = await DB.read('order').where({id: order_id});
    expect(placed_order_db_read[0].order_acceptance_status).toBe('pending');
    expect(placed_order_db_read[0].delivery_status).toBe('pending');
    expect(placed_order_db_read[0].order_status).toBe('placed');
    expect(placed_order_db_read[0].delivery_order_id).toBeNull();

    const completed_payment_order_db_read = await DB.read('payment').where({
      id: payment_id,
    });
    expect(completed_payment_order_db_read[0].payment_status).toBe('completed');

    /* ========================================
        *ACCEPTED ORDER BY VENDOR AND DELIVERY PARTNER
    ============================================== */
    const mock_place_delivery_order = mockPlaceDeliveryOrder();
    const mock_send_sqs_msg = mockSendSQSMessage();

    const accepted_order_response = await request(server)
      .post(`/food/vendor/order/${order_id}/accept`)
      .set('Authorization', `Bearer ${vendor_token}`)
      .send({
        accept: true,
        preparation_time: 15,
      });
    expect(accepted_order_response.body.status).toBe(true);
    expect(accepted_order_response.statusCode).toBe(200);
    expect(accepted_order_response.body.result.id).toBe(order_id);
    expect(mock_place_delivery_order).toHaveBeenCalled();
    expect(mock_send_sqs_msg).toHaveBeenCalled();

    const accepted_order_db_read = await DB.read('order').where({id: order_id});
    expect(accepted_order_db_read[0].order_status).toBe('placed');
    expect(accepted_order_db_read[0].order_acceptance_status).toBe('accepted');
    expect(accepted_order_db_read[0].delivery_status).toBe('accepted');

    /* ====================================
            *CANCEL ORDER BY CUSTOMER
    ======================================== */
    const mock_cancel_delivery_success = mockCancelDeliverySuccess();
    mockGetRestaurantVendors();
    const cancelled_order_response = await request(server)
      .post(`/food/order/${order_id}/cancel`)
      .set('Authorization', `Bearer ${customer_token}`)
      .send({
        cancellation_reason: 'selected wrong delivery location',
      });
    expect(cancelled_order_response.body.status).toBe(true);
    expect(cancelled_order_response.statusCode).toBe(200);
    expect(cancelled_order_response.body.result).toBe(
      'order cancelled successfully'
    );
    expect(mock_cancel_delivery_success).toHaveBeenCalled();

    const cancelled_order_db_read = await DB.read('order').where({
      id: order_id,
    });
    expect(cancelled_order_db_read[0].order_status).toBe('cancelled');
    expect(cancelled_order_db_read[0].order_acceptance_status).toBe('accepted');
    expect(cancelled_order_db_read[0].delivery_status).toBe('cancelled');
    expect(cancelled_order_db_read[0].cancelled_by).toBe('customer');
    expect(cancelled_order_db_read[0].cancellation_details).toStrictEqual({
      cancellation_reason: 'selected wrong delivery location',
    });
    jest.clearAllMocks();

    /* ============================================
          *RECIEVED SFX CALLBACK ALLOCATED
      *SEND EMAIL FOR CANCELLED ORDER SFX CALLBACK
    ================================================ */
    const mock_send_sqs_email = mockSendSQSMessage();
    const current_time = new Date().toISOString();
    const allocated_sfx_callback_response = await request(server)
      .post('/core/callback/shadowfax/order_status')
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${process.env.SHADOWFAX_CALLBACK_TOKEN!}`)
      .send({
        allot_time: current_time,
        rider_name: 'Speedyy',
        sfx_order_id: accepted_order_response.body.result.delivery_order_id,
        client_order_id: 'RES_' + order_id,
        order_status: 'ALLOTTED',
        rider_contact: '+91123456789',
        rider_latitude: 12.937814,
        rider_longitude: 77.61458,
        rider_id: '12345',
        pickup_eta: 5,
        drop_eta: 20,
      });
    expect(allocated_sfx_callback_response.status).toBe(200);
    expect(allocated_sfx_callback_response.text).toBe('OK');
    expect(mock_send_sqs_email).toHaveBeenCalledTimes(1);
    expect(mock_send_sqs_email).toHaveBeenCalledWith('', {
      action: 'SINGLE',
      data: {
        reciverEmail: 'test@speedyy.com',
        templateData: {
          application_name: 'food',
          error_details:
            'received delivery order status callback for cancelled order for Food API',
          meta_details: {
            allot_time: current_time,
            client_order_id: '1',
            drop_eta: 20,
            pickup_eta: 5,
            rider_contact: '+91123456789',
            rider_latitude: 12.937814,
            rider_longitude: 77.61458,
            rider_name: 'Speedyy',
            delivery_order_id: '20733020',
            rider_id: '12345',
            delivery_status: 'allocated',
            rider_image_url: undefined,
          },
          priority: 'high',
          subject: 'Unexpected Error while processing delivery',
          time: new Date().toDateString(),
        },
        templateName: 'AdminAlertEmailTemplate',
      },
      event: 'EMAIL',
    });
    // Do Not Want Any Change In Database
    const cancelled_order_db_read_after_callback = await DB.read('order').where(
      {id: order_id}
    );
    expect(cancelled_order_db_read_after_callback[0].order_status).toBe(
      'cancelled'
    );
    expect(
      cancelled_order_db_read_after_callback[0].order_acceptance_status
    ).toBe('accepted');
    expect(cancelled_order_db_read_after_callback[0].delivery_status).toBe(
      'cancelled'
    );
    expect(cancelled_order_db_read_after_callback[0].cancelled_by).toBe(
      'customer'
    );
  });
});
