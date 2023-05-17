import request from 'supertest';
import {createTestServer} from '../utils/init';
import {Application} from 'express';
import {
  signToken,
  loadMockSeedData,
  testCasesClosingTasks,
} from '../utils/utils';
import {DB} from '../../data/knex';
import logger from '../../utilities/logger/winston_logger';

let server: Application;
let vendor_token: string;

beforeAll(async () => {
  server = await createTestServer();

  await loadMockSeedData('restaurant');
  await loadMockSeedData('time_slot');
  await loadMockSeedData('subscription');
  await loadMockSeedData('restaurant_menu');
  await loadMockSeedData('active_orders');
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
});
afterAll(async () => {
  await testCasesClosingTasks();
});
describe('Active Orders Orders', () => {
  test('order_status : placed | delivery_status: accepted | order_acceptance_status : accepted', async () => {
    const order = await DB.read('order').where({id: 1001});
    expect(order[0].id).toBe(1001);
    expect(order[0].order_status).toBe('placed');
    expect(order[0].delivery_status).toBe('accepted');
    expect(order[0].order_acceptance_status).toBe('accepted');
    expect(order[0].cancelled_by).toBeNull();
    const response = await request(server)
      .post('/food/vendor/report/restaurant/sales')
      .set('Authorization', `Bearer ${vendor_token}`)
      .send({
        duration: 'custom_range',
        start_epoch: 1665480600,
        end_epoch: 1665484200,
      });

    expect(response.body.result.duration_wise_order_sales.length).not.toEqual(
      0
    );
    expect(
      response.body.result.duration_wise_order_sales[0].total_orders_count
    ).toEqual(1);
    expect(
      response.body.result.duration_wise_order_sales[0].vendor_sales_amount
    ).toEqual(415);
    expect(
      response.body.result.duration_wise_order_sales[0].average_orders_rating
    ).toEqual(0); //! BACKWARD_COMPATIBLE
    expect(
      response.body.result.duration_wise_order_sales[0].orders_with_likes
    ).toEqual(0);
    expect(
      response.body.result.duration_wise_order_sales[0].orders_with_dislikes
    ).toEqual(0);
    expect(
      response.body.result.duration_wise_order_sales[0]
        .orders_cancelled_by_customer_count
    ).toEqual(0);
    expect(
      response.body.result.duration_wise_order_sales[0]
        .orders_cancelled_by_vendor_count
    ).toEqual(0);
    expect(
      response.body.result.duration_wise_order_sales[0]
        .orders_cancelled_by_delivery_partner_count
    ).toEqual(0);
    expect(response.body.result.total_vendor_sales_amount).toEqual(415);
  });
  test('order_status : placed | delivery_status: allocated | order_acceptance_status : accepted', async () => {
    const order = await DB.read('order').where({id: 1002});
    expect(order[0].id).toBe(1002);
    expect(order[0].order_status).toBe('placed');
    expect(order[0].delivery_status).toBe('allocated');
    expect(order[0].order_acceptance_status).toBe('accepted');
    expect(order[0].cancelled_by).toBeNull();
    const response = await request(server)
      .post('/food/vendor/report/restaurant/sales')
      .set('Authorization', `Bearer ${vendor_token}`)
      .send({
        duration: 'custom_range',
        start_epoch: 1665567000,
        end_epoch: 1665570600,
      });
    expect(response.body.result.duration_wise_order_sales.length).not.toEqual(
      0
    );
    expect(
      response.body.result.duration_wise_order_sales[0].total_orders_count
    ).toEqual(1);
    expect(
      response.body.result.duration_wise_order_sales[0].vendor_sales_amount
    ).toEqual(628);
    expect(
      response.body.result.duration_wise_order_sales[0].average_orders_rating
    ).toEqual(0); //! BACKWARD_COMPATIBLE
    expect(
      response.body.result.duration_wise_order_sales[0].orders_with_likes
    ).toEqual(0);
    expect(
      response.body.result.duration_wise_order_sales[0].orders_with_dislikes
    ).toEqual(0);
    expect(
      response.body.result.duration_wise_order_sales[0]
        .orders_cancelled_by_customer_count
    ).toEqual(0);
    expect(
      response.body.result.duration_wise_order_sales[0]
        .orders_cancelled_by_vendor_count
    ).toEqual(0);
    expect(
      response.body.result.duration_wise_order_sales[0]
        .orders_cancelled_by_delivery_partner_count
    ).toEqual(0);
    expect(response.body.result.total_vendor_sales_amount).toEqual(628);
  });
  test('Vendor Preparing Food | order_status : placed | delivery_status: arrived | order_acceptance_status : accepted', async () => {
    const order = await DB.read('order').where({id: 1003});
    expect(order[0].id).toBe(1003);
    expect(order[0].order_status).toBe('placed');
    expect(order[0].delivery_status).toBe('arrived');
    expect(order[0].order_acceptance_status).toBe('accepted');
    expect(order[0].vendor_ready_marked_time).toBeNull();
    expect(order[0].cancelled_by).toBeNull();
    const response = await request(server)
      .post('/food/vendor/report/restaurant/sales')
      .set('Authorization', `Bearer ${vendor_token}`)
      .send({
        duration: 'custom_range',
        start_epoch: 1665653400,
        end_epoch: 1665657000,
      });

    expect(response.body.result.duration_wise_order_sales.length).not.toEqual(
      0
    );
    expect(
      response.body.result.duration_wise_order_sales[0].total_orders_count
    ).toEqual(1);
    expect(
      response.body.result.duration_wise_order_sales[0].vendor_sales_amount
    ).toEqual(378);
    expect(
      response.body.result.duration_wise_order_sales[0].average_orders_rating
    ).toEqual(0); //! BACKWARD_COMPATIBLE
    expect(
      response.body.result.duration_wise_order_sales[0].orders_with_likes
    ).toEqual(0);
    expect(
      response.body.result.duration_wise_order_sales[0].orders_with_dislikes
    ).toEqual(0);
    expect(
      response.body.result.duration_wise_order_sales[0]
        .orders_cancelled_by_customer_count
    ).toEqual(0);
    expect(
      response.body.result.duration_wise_order_sales[0]
        .orders_cancelled_by_vendor_count
    ).toEqual(0);
    expect(
      response.body.result.duration_wise_order_sales[0]
        .orders_cancelled_by_delivery_partner_count
    ).toEqual(0);
    expect(response.body.result.total_vendor_sales_amount).toEqual(378);
  });
  test('Vendor Prepared Food | order_status : placed | delivery_status: arrived | order_acceptance_status : accepted', async () => {
    const order = await DB.read('order').where({id: 1004});
    expect(order[0].id).toBe(1004);
    expect(order[0].order_status).toBe('placed');
    expect(order[0].delivery_status).toBe('arrived');
    expect(order[0].order_acceptance_status).toBe('accepted');
    expect(order[0].vendor_ready_marked_time).not.toBeNull();
    expect(order[0].cancelled_by).toBeNull();
    const response = await request(server)
      .post('/food/vendor/report/restaurant/sales')
      .set('Authorization', `Bearer ${vendor_token}`)
      .send({
        duration: 'custom_range',
        start_epoch: 1665739800,
        end_epoch: 1665743400,
      });

    expect(response.body.result.duration_wise_order_sales.length).not.toEqual(
      0
    );
    expect(
      response.body.result.duration_wise_order_sales[0].total_orders_count
    ).toEqual(1);
    expect(
      response.body.result.duration_wise_order_sales[0].vendor_sales_amount
    ).toEqual(428);
    expect(
      response.body.result.duration_wise_order_sales[0].average_orders_rating
    ).toEqual(0);
    expect(
      response.body.result.duration_wise_order_sales[0].average_orders_rating
    ).toEqual(0); //! BACKWARD_COMPATIBLE
    expect(
      response.body.result.duration_wise_order_sales[0].orders_with_dislikes
    ).toEqual(0);
    expect(
      response.body.result.duration_wise_order_sales[0]
        .orders_cancelled_by_customer_count
    ).toEqual(0);
    expect(
      response.body.result.duration_wise_order_sales[0]
        .orders_cancelled_by_vendor_count
    ).toEqual(0);
    expect(
      response.body.result.duration_wise_order_sales[0]
        .orders_cancelled_by_delivery_partner_count
    ).toEqual(0);
    expect(response.body.result.total_vendor_sales_amount).toEqual(428);
  });
  test('Dispatched Order | order_status : placed | delivery_status: dispatched | order_acceptance_status : accepted', async () => {
    const order = await DB.read('order').where({id: 1005});
    expect(order[0].id).toBe(1005);
    expect(order[0].order_status).toBe('placed');
    expect(order[0].delivery_status).toBe('dispatched');
    expect(order[0].order_acceptance_status).toBe('accepted');
    expect(order[0].vendor_ready_marked_time).not.toBeNull();
    expect(order[0].cancelled_by).toBeNull();
    const response = await request(server)
      .post('/food/vendor/report/restaurant/sales')
      .set('Authorization', `Bearer ${vendor_token}`)
      .send({
        duration: 'custom_range',
        start_epoch: 1665826200,
        end_epoch: 1665829800,
      });

    expect(response.body.result.duration_wise_order_sales.length).not.toEqual(
      0
    );
    expect(
      response.body.result.duration_wise_order_sales[0].total_orders_count
    ).toEqual(1);
    expect(
      response.body.result.duration_wise_order_sales[0].vendor_sales_amount
    ).toEqual(728);
    expect(
      response.body.result.duration_wise_order_sales[0].average_orders_rating
    ).toEqual(0); //! BACKWARD_COMPATIBLE
    expect(
      response.body.result.duration_wise_order_sales[0].orders_with_likes
    ).toEqual(0);
    expect(
      response.body.result.duration_wise_order_sales[0].orders_with_dislikes
    ).toEqual(0);
    expect(
      response.body.result.duration_wise_order_sales[0]
        .orders_cancelled_by_customer_count
    ).toEqual(0);
    expect(
      response.body.result.duration_wise_order_sales[0]
        .orders_cancelled_by_vendor_count
    ).toEqual(0);
    expect(
      response.body.result.duration_wise_order_sales[0]
        .orders_cancelled_by_delivery_partner_count
    ).toEqual(0);
    expect(response.body.result.total_vendor_sales_amount).toEqual(728);
  });
  test('Arrived Order | order_status : placed | delivery_status: arrived_customer_doorstep | order_acceptance_status : accepted', async () => {
    const order = await DB.read('order').where({id: 1006});
    expect(order[0].id).toBe(1006);
    expect(order[0].order_status).toBe('placed');
    expect(order[0].delivery_status).toBe('arrived_customer_doorstep');
    expect(order[0].order_acceptance_status).toBe('accepted');
    expect(order[0].vendor_ready_marked_time).not.toBeNull();
    expect(order[0].cancelled_by).toBeNull();
    const response = await request(server)
      .post('/food/vendor/report/restaurant/sales')
      .set('Authorization', `Bearer ${vendor_token}`)
      .send({
        duration: 'custom_range',
        start_epoch: 1665912600,
        end_epoch: 1665916200,
      });

    expect(response.body.result.duration_wise_order_sales.length).not.toEqual(
      0
    );
    expect(
      response.body.result.duration_wise_order_sales[0].total_orders_count
    ).toEqual(1);
    expect(
      response.body.result.duration_wise_order_sales[0].vendor_sales_amount
    ).toEqual(778);
    expect(
      response.body.result.duration_wise_order_sales[0].average_orders_rating
    ).toEqual(0); //! BACKWARD_COMPATIBLE
    expect(
      response.body.result.duration_wise_order_sales[0].orders_with_likes
    ).toEqual(0);
    expect(
      response.body.result.duration_wise_order_sales[0].orders_with_dislikes
    ).toEqual(0);
    expect(
      response.body.result.duration_wise_order_sales[0]
        .orders_cancelled_by_customer_count
    ).toEqual(0);
    expect(
      response.body.result.duration_wise_order_sales[0]
        .orders_cancelled_by_vendor_count
    ).toEqual(0);
    expect(
      response.body.result.duration_wise_order_sales[0]
        .orders_cancelled_by_delivery_partner_count
    ).toEqual(0);
    expect(response.body.result.total_vendor_sales_amount).toEqual(778);
  });
});
