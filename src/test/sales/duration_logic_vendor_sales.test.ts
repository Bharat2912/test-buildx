import request from 'supertest';
import {createTestServer} from '../utils/init';
import {Application} from 'express';
import {
  signToken,
  loadMockSeedData,
  createTableDynamoDB,
  dropTableDynamoDB,
  testCasesClosingTasks,
} from '../utils/utils';
import {DB} from '../../data/knex';
import {
  mockPostServiceableAddress,
  mockGetCustomerDetails,
  mockGetTransactionToken,
  mockCashfreeTrascationSuccessfullResponse,
  mockSendSQSMessage,
  mockPlaceDeliveryOrder,
} from '../utils/mock_services';
import {valid_cart_request} from '../utils/mock_responses';
import moment from 'moment';
import logger from '../../utilities/logger/winston_logger';

let server: Application;
let vendor_token: string;
let customer_token: string;

beforeAll(async () => {
  server = await createTestServer();

  await createTableDynamoDB('user');
  await loadMockSeedData('restaurant');
  await loadMockSeedData('time_slot');
  await loadMockSeedData('subscription');
  await loadMockSeedData('restaurant_menu');
  logger.info('DataBase Connection Created For Testing');

  vendor_token = signToken({
    id: '33c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
    data: {
      type: 'restaurant',
      outlet_id: 'b0909e52-a731-4665-a791-ee6479008805',
      force_reset_password: false,
    },
    user_type: 'vendor',
  });
  customer_token = signToken({
    id: '33c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
    user_type: 'customer',
  });
});
afterAll(async () => {
  await testCasesClosingTasks();
  await dropTableDynamoDB('user');
});
describe('Sales Test Cases :- ', () => {
  describe('Sales Count Duration Testing | Order Created Just Minutes Ago', () => {
    test('Creating Order ID 2 | order_status : placed | delivery_status : accepted | order_acceptance_status : accepted', async () => {
      /* =================================
                 *CREATE CART
        ==================================== */
      const mock_post_serviceable_address = mockPostServiceableAddress();
      const put_cart_response = await request(server)
        .put('/food/cart')
        .set('Authorization', `Bearer ${customer_token}`)
        .send(valid_cart_request);
      expect(put_cart_response.statusCode).toBe(200);
      expect(mock_post_serviceable_address).toHaveBeenCalled();

      /* =================================
                  *PLACE ORDER
        ==================================== */
      const mock_post_serviceable_add = mockPostServiceableAddress();
      const mock_get_customer_details = mockGetCustomerDetails();
      const mock_get_transaction_token = mockGetTransactionToken();
      const placed_order_response = await request(server)
        .post('/food/order/place_order')
        .set('Authorization', `Bearer ${customer_token}`);
      expect(placed_order_response.body.statusCode).toBe(200);
      const first_order_id = placed_order_response.body.result.order_id;
      const first_payment_id =
        placed_order_response.body.result.payment_details.id;
      expect(mock_post_serviceable_add).toHaveBeenCalled();
      expect(mock_get_customer_details).toHaveBeenCalled();
      expect(mock_get_transaction_token).toHaveBeenCalled();

      /* =================================
                  *CONFIRM PAYMENT
        ==================================== */
      const mock_cashfree_transation_success =
        mockCashfreeTrascationSuccessfullResponse(
          first_payment_id,
          placed_order_response.body.result.invoice_breakout!
            .total_customer_payable
        );
      const mock_send_sqs_messae = mockSendSQSMessage();
      const payment_completed_order_response = await request(server)
        .post(`/food/order/confirm_payment/${first_payment_id}`)
        .set('Authorization', `Bearer ${customer_token}`);
      expect(payment_completed_order_response.statusCode).toBe(200);
      expect(mock_cashfree_transation_success).toHaveBeenCalled();
      expect(mock_send_sqs_messae);

      /* =================================
                *VENDOR ACCEPT ORDER
              *DELIVERY PARTNER ACCEPT ORDER
        ==================================== */
      const mock_place_delivery_order = mockPlaceDeliveryOrder();
      const mock_send_sqs_msg = mockSendSQSMessage();
      const accepted_order_response = await request(server)
        .post(`/food/vendor/order/${first_order_id}/accept`)
        .set('Authorization', `Bearer ${vendor_token}`)
        .send({
          accept: true,
          preparation_time: 15,
        });
      expect(accepted_order_response.body.statusCode).toBe(200);
      const order = await DB.read('order').where({id: first_order_id});
      expect(order[0].id).toBe(first_order_id);
      expect(order[0].order_status).toBe('placed');
      expect(order[0].delivery_status).toBe('accepted');
      expect(order[0].order_acceptance_status).toBe('accepted');
      expect(order[0].cancelled_by).toBeNull();
      expect(mock_place_delivery_order).toHaveBeenCalled();
      expect(mock_send_sqs_msg).toHaveBeenCalled();

      /* ======================================
          *CONSIDER ORDER IN LAST HOUR SALES REPORT
        ========================================= */
      const last_hour_sales = await request(server)
        .post('/food/vendor/report/restaurant/sales')
        .set('Authorization', `Bearer ${vendor_token}`)
        .send({
          duration: 'custom_range',
          start_epoch: moment().subtract({hour: 1}).unix(),
          end_epoch: moment().add({minutes: 30}).unix(),
        });
      expect(
        last_hour_sales.body.result.duration_wise_order_sales.length
      ).not.toEqual(0);
      expect(
        last_hour_sales.body.result.duration_wise_order_sales[0]
          .total_orders_count
      ).toEqual(1);
      expect(
        last_hour_sales.body.result.duration_wise_order_sales[0]
          .vendor_sales_amount
        // look into this
      ).toEqual(126);
      expect(
        last_hour_sales.body.result.duration_wise_order_sales[0]
          .average_orders_rating
      ).toEqual(0); //! BACKWARD_COMPATIBLE
      expect(
        last_hour_sales.body.result.duration_wise_order_sales[0]
          .orders_with_likes
      ).toEqual(0);
      expect(
        last_hour_sales.body.result.duration_wise_order_sales[0]
          .orders_with_dislikes
      ).toEqual(0);
      expect(
        last_hour_sales.body.result.duration_wise_order_sales[0]
          .orders_cancelled_by_customer_count
      ).toEqual(0);
      expect(
        last_hour_sales.body.result.duration_wise_order_sales[0]
          .orders_cancelled_by_vendor_count
      ).toEqual(0);
      expect(
        last_hour_sales.body.result.duration_wise_order_sales[0]
          .orders_cancelled_by_delivery_partner_count
      ).toEqual(0);
      expect(last_hour_sales.body.result.total_vendor_sales_amount).toEqual(
        // look into this
        126
      );

      /* ======================================
              * CONSIDER ORDER IN TODAY SALES
            ========================================= */
      const today_sales = await request(server)
        .post('/food/vendor/report/restaurant/sales')
        .set('Authorization', `Bearer ${vendor_token}`)
        .send({
          duration: 'today',
        });
      expect(
        today_sales.body.result.duration_wise_order_sales.length
      ).not.toEqual(0);
      expect(
        today_sales.body.result.duration_wise_order_sales[0].total_orders_count
      ).toEqual(1);
      expect(
        today_sales.body.result.duration_wise_order_sales[0].vendor_sales_amount
        // look into this
      ).toEqual(126);
      expect(
        today_sales.body.result.duration_wise_order_sales[0]
          .average_orders_rating
      ).toEqual(0); //! BACKWARD_COMPATIBLE
      expect(
        today_sales.body.result.duration_wise_order_sales[0].orders_with_likes
      ).toEqual(0);
      expect(
        today_sales.body.result.duration_wise_order_sales[0]
          .orders_with_dislikes
      ).toEqual(0);
      expect(
        today_sales.body.result.duration_wise_order_sales[0]
          .orders_cancelled_by_customer_count
      ).toEqual(0);
      expect(
        today_sales.body.result.duration_wise_order_sales[0]
          .orders_cancelled_by_vendor_count
      ).toEqual(0);
      expect(
        today_sales.body.result.duration_wise_order_sales[0]
          .orders_cancelled_by_delivery_partner_count
      ).toEqual(0);
      expect(today_sales.body.result.total_vendor_sales_amount)
        // look into this
        .toEqual(126);
      /* =================================
                *CREATING ORDER ID 3
                *ORDER_STATUS : PLACED
                *DELIVERY_STATUS : PENDING
                *ORDER_ACCEPTANCE_STATUS : PENDING
          ======================================= */
      /* =================================
                      *CREATE CART
          ==================================== */
      const mock_post_serviceable = mockPostServiceableAddress();
      const put_cart_not_sale_order_response = await request(server)
        .put('/food/cart')
        .set('Authorization', `Bearer ${customer_token}`)
        .send(valid_cart_request);
      expect(put_cart_not_sale_order_response.statusCode).toBe(200);
      expect(mock_post_serviceable).toHaveBeenCalled();
      /* =================================
                      *PLACE ORDER
            ==================================== */
      const mock_post_address_serviceable_check = mockPostServiceableAddress();
      const mock_get_cust_details = mockGetCustomerDetails();
      const mock_get_trans_token = mockGetTransactionToken();
      const place_order_response = await request(server)
        .post('/food/order/place_order')
        .set('Authorization', `Bearer ${customer_token}`);
      expect(place_order_response.body.statusCode).toBe(200);
      expect(mock_post_address_serviceable_check).toHaveBeenCalled();
      expect(mock_get_cust_details).toHaveBeenCalled();
      expect(mock_get_trans_token).toHaveBeenCalled();

      // const order_id = place_order_response.body.result.order_id;
      const payment_id = place_order_response.body.result.payment_details.id;
      /* =================================
                      *CONFIRM PAYMENT
            ==================================== */
      const mock_cashfree_trans_success =
        mockCashfreeTrascationSuccessfullResponse(
          payment_id,
          place_order_response.body.result.invoice_breakout!
            .total_customer_payable
        );
      const mock_sqs_message = mockSendSQSMessage();
      const paymentResponse = await request(server)
        .post(`/food/order/confirm_payment/${payment_id}`)
        .set('Authorization', `Bearer ${customer_token}`);
      expect(paymentResponse.statusCode).toBe(200);
      expect(mock_cashfree_trans_success).toHaveBeenCalled();
      expect(mock_sqs_message).toHaveBeenCalled();

      const current_weekday = moment().isoWeekday() - 1;
      /*=============================
            *CALCULATING LAST WEEK SALES
            *COUNT ONLY ORDER ID 2
          ===========================*/
      const week_sales = await request(server)
        .post('/food/vendor/report/restaurant/sales')
        .set('Authorization', `Bearer ${vendor_token}`)
        .send({
          duration: 'this_week',
        });
      expect(
        week_sales.body.result.duration_wise_order_sales.length
      ).not.toEqual(0);
      expect(
        week_sales.body.result.duration_wise_order_sales[current_weekday]
          .total_orders_count
      ).toEqual(2);
      expect(
        week_sales.body.result.duration_wise_order_sales[current_weekday]
          .vendor_sales_amount
        // look into this
      ).toEqual(126);
      expect(
        week_sales.body.result.duration_wise_order_sales[0]
          .average_orders_rating
      ).toEqual(0); //! BACKWARD_COMPATIBLE
      expect(
        week_sales.body.result.duration_wise_order_sales[0].orders_with_likes
      ).toEqual(0);
      expect(
        week_sales.body.result.duration_wise_order_sales[0].orders_with_dislikes
      ).toEqual(0);
      expect(
        week_sales.body.result.duration_wise_order_sales[current_weekday]
          .orders_cancelled_by_customer_count
      ).toEqual(0);
      expect(
        week_sales.body.result.duration_wise_order_sales[current_weekday]
          .orders_cancelled_by_vendor_count
      ).toEqual(0);
      expect(
        week_sales.body.result.duration_wise_order_sales[current_weekday]
          .orders_cancelled_by_delivery_partner_count
      ).toEqual(0);
      // look into this
      expect(week_sales.body.result.total_vendor_sales_amount).toEqual(126);
      const current_week_no_with_fraction = new Date().getDate() / 7;
      const current_week_no =
        current_week_no_with_fraction >
        Math.trunc(current_week_no_with_fraction)
          ? Math.trunc(current_week_no_with_fraction) + 1
          : current_week_no_with_fraction;

      /*==================================
            *CALCULATING LAST MONTHLY SALES
            *COUNT ONLY ORDER ID 2
          =====================================*/
      const monthly_sales = await request(server)
        .post('/food/vendor/report/restaurant/sales')
        .set('Authorization', `Bearer ${vendor_token}`)
        .send({
          duration: 'this_month',
        });
      expect(
        monthly_sales.body.result.duration_wise_order_sales.length
      ).not.toEqual(0);
      expect(
        monthly_sales.body.result.duration_wise_order_sales[current_week_no - 1]
          .total_orders_count
      ).toEqual(2);
      expect(
        monthly_sales.body.result.duration_wise_order_sales[current_week_no - 1]
          .vendor_sales_amount
        // look into this
      ).toEqual(126);
      expect(
        monthly_sales.body.result.duration_wise_order_sales[current_week_no - 1]
          .average_orders_rating
      ).toEqual(0); //! BACKWARD_COMPATIBLE
      expect(
        monthly_sales.body.result.duration_wise_order_sales[0].orders_with_likes
      ).toEqual(0);
      expect(
        monthly_sales.body.result.duration_wise_order_sales[0]
          .orders_with_dislikes
      ).toEqual(0);
      expect(
        monthly_sales.body.result.duration_wise_order_sales[current_week_no - 1]
          .orders_cancelled_by_customer_count
      ).toEqual(0);
      expect(
        monthly_sales.body.result.duration_wise_order_sales[current_week_no - 1]
          .orders_cancelled_by_vendor_count
      ).toEqual(0);
      expect(
        monthly_sales.body.result.duration_wise_order_sales[current_week_no - 1]
          .orders_cancelled_by_delivery_partner_count
      ).toEqual(0);
      // look into this
      expect(monthly_sales.body.result.total_vendor_sales_amount).toEqual(126);
    });
  });
});
