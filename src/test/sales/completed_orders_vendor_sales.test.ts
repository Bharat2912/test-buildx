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
  await loadMockSeedData('completed_orders');
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
describe('Completed Order', () => {
  test('order_status : completed | delivery_status: delivered | order_acceptance_status : accepted', async () => {
    const order = await DB.read('order').where({id: 1000});
    expect(order[0].id).toBe(1000);
    expect(order[0].order_status).toBe('completed');
    expect(order[0].delivery_status).toBe('delivered');
    expect(order[0].order_acceptance_status).toBe('accepted');
    expect(order[0].vendor_ready_marked_time).not.toBeNull();
    expect(order[0].cancelled_by).toBeNull();
    const response = await request(server)
      .post('/food/vendor/report/restaurant/sales')
      .set('Authorization', `Bearer ${vendor_token}`)
      .send({
        duration: 'custom_range',
        start_epoch: 1665394200,
        end_epoch: 1665397800,
      });

    expect(response.body.result.duration_wise_order_sales.length).not.toEqual(
      0
    );
    expect(
      response.body.result.duration_wise_order_sales[0].total_orders_count
    ).toEqual(1);
    expect(
      response.body.result.duration_wise_order_sales[0].vendor_sales_amount
    ).toEqual(319);
    expect(
      response.body.result.duration_wise_order_sales[0].average_orders_rating
    ).toEqual(0); //! BACKWARD_COMPATIBLE
    expect(
      response.body.result.duration_wise_order_sales[0].orders_with_likes
    ).toEqual(1);
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
    expect(response.body.result.total_vendor_sales_amount).toEqual(319);
  });
});
