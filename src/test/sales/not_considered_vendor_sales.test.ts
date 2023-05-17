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
  await loadMockSeedData('cancelled_orders');
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
describe('Not Consider Sales', () => {
  describe('Active Orders Orders', () => {
    test('Vendor Not Accepted Order | order_status : placed | delivery_status: pending | order_acceptance_status : pending', async () => {
      const order = await DB.read('order').where({id: 1011});
      expect(order[0].id).toBe(1011);
      expect(order[0].order_status).toBe('placed');
      expect(order[0].delivery_status).toBe('pending');
      expect(order[0].order_acceptance_status).toBe('pending');
      expect(order[0].cancelled_by).toBeNull();
      const response = await request(server)
        .post('/food/vendor/report/restaurant/sales')
        .set('Authorization', `Bearer ${vendor_token}`)
        .send({
          duration: 'custom_range',
          start_epoch: 1666344600,
          end_epoch: 1666348200,
        });

      expect(response.body.result.duration_wise_order_sales.length).not.toEqual(
        0
      );
      expect(
        response.body.result.duration_wise_order_sales[0].total_orders_count
      ).toEqual(1);
      expect(
        response.body.result.duration_wise_order_sales[0].vendor_sales_amount
      ).toEqual(0);
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
      expect(response.body.result.total_vendor_sales_amount).toEqual(0);
    });
  });
  describe('Cancelled By Vendor', () => {
    test('order_status : cancelled | delivery_status: cancelled | order_acceptance_status : accepted', async () => {
      const order = await DB.read('order').where({id: 1012});
      expect(order[0].id).toBe(1012);
      expect(order[0].order_status).toBe('cancelled');
      expect(order[0].delivery_status).toBe('cancelled');
      expect(order[0].order_acceptance_status).toBe('accepted');
      expect(order[0].cancelled_by).toBe('vendor');
      const response = await request(server)
        .post('/food/vendor/report/restaurant/sales')
        .set('Authorization', `Bearer ${vendor_token}`)
        .send({
          duration: 'custom_range',
          start_epoch: 1666431000,
          end_epoch: 1666434600,
        });

      expect(response.body.result.duration_wise_order_sales.length).not.toEqual(
        0
      );
      expect(
        response.body.result.duration_wise_order_sales[0].total_orders_count
      ).toEqual(1);
      expect(
        response.body.result.duration_wise_order_sales[0].vendor_sales_amount
      ).toEqual(0);
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
      ).toEqual(1);
      expect(
        response.body.result.duration_wise_order_sales[0]
          .orders_cancelled_by_delivery_partner_count
      ).toEqual(0);
      expect(response.body.result.total_vendor_sales_amount).toEqual(0);
    });
    test('Vendor Rejected Order | order_status : cancelled | delivery_status: pending | order_acceptance_status : rejected', async () => {
      const order = await DB.read('order').where({id: 1015});
      expect(order[0].id).toBe(1015);
      expect(order[0].order_status).toBe('cancelled');
      expect(order[0].delivery_status).toBe('pending');
      expect(order[0].order_acceptance_status).toBe('rejected');
      expect(order[0].cancelled_by).toBe('vendor');
      const response = await request(server)
        .post('/food/vendor/report/restaurant/sales')
        .set('Authorization', `Bearer ${vendor_token}`)
        .send({
          duration: 'custom_range',
          start_epoch: 1666690200,
          end_epoch: 1666693800,
        });

      expect(response.body.result.duration_wise_order_sales.length).not.toEqual(
        0
      );
      expect(
        response.body.result.duration_wise_order_sales[0].total_orders_count
      ).toEqual(1);
      expect(
        response.body.result.duration_wise_order_sales[0].vendor_sales_amount
      ).toEqual(0);
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
      ).toEqual(1);
      expect(
        response.body.result.duration_wise_order_sales[0]
          .orders_cancelled_by_delivery_partner_count
      ).toEqual(0);
      expect(response.body.result.total_vendor_sales_amount).toEqual(0);
    });
  });
  describe('Cancelled By Customer', () => {
    test('Vendor Not Accepted Order | order_status : cancelled | delivery_status: pending | order_acceptance_status : pending', async () => {
      const order = await DB.read('order').where({id: 1013});
      expect(order[0].id).toBe(1013);
      expect(order[0].order_status).toBe('cancelled');
      expect(order[0].delivery_status).toBe('pending');
      expect(order[0].order_acceptance_status).toBe('pending');
      expect(order[0].cancelled_by).toBe('customer');
      const response = await request(server)
        .post('/food/vendor/report/restaurant/sales')
        .set('Authorization', `Bearer ${vendor_token}`)
        .send({
          duration: 'custom_range',
          start_epoch: 1666517400,
          end_epoch: 1666521000,
        });

      expect(response.body.result.duration_wise_order_sales.length).not.toEqual(
        0
      );
      expect(
        response.body.result.duration_wise_order_sales[0].total_orders_count
      ).toEqual(1);
      expect(
        response.body.result.duration_wise_order_sales[0].vendor_sales_amount
      ).toEqual(0);
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
      ).toEqual(1);
      expect(
        response.body.result.duration_wise_order_sales[0]
          .orders_cancelled_by_vendor_count
      ).toEqual(0);
      expect(
        response.body.result.duration_wise_order_sales[0]
          .orders_cancelled_by_delivery_partner_count
      ).toEqual(0);
      expect(response.body.result.total_vendor_sales_amount).toEqual(0);
    });
  });
  describe('Cancelled By Admin', () => {
    test('Vendor Not Accepted Order | order_status : cancelled | delivery_status: pending | order_acceptance_status : pending', async () => {
      const order = await DB.read('order').where({id: 1014});
      expect(order[0].id).toBe(1014);
      expect(order[0].order_status).toBe('cancelled');
      expect(order[0].delivery_status).toBe('pending');
      expect(order[0].order_acceptance_status).toBe('pending');
      expect(order[0].cancelled_by).toBe('admin');
      const response = await request(server)
        .post('/food/vendor/report/restaurant/sales')
        .set('Authorization', `Bearer ${vendor_token}`)
        .send({
          duration: 'custom_range',
          start_epoch: 1666603800,
          end_epoch: 1666607400,
        });

      expect(response.body.result.duration_wise_order_sales.length).not.toEqual(
        0
      );
      expect(
        response.body.result.duration_wise_order_sales[0].total_orders_count
      ).toEqual(1);
      expect(
        response.body.result.duration_wise_order_sales[0].vendor_sales_amount
      ).toEqual(0);
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
      expect(response.body.result.total_vendor_sales_amount).toEqual(0);
    });
  });
  describe('Cancelled By Delivery Partner', () => {
    test('Rejected By Delivery Partner Order | order_status : cancelled | delivery_status: rejected | order_acceptance_status : accepted ', async () => {
      const order = await DB.read('order').where({id: 1016});
      expect(order[0].id).toBe(1016);
      expect(order[0].order_status).toBe('cancelled');
      expect(order[0].delivery_status).toBe('rejected');
      expect(order[0].order_acceptance_status).toBe('accepted');
      expect(order[0].cancelled_by).toBe('delivery_service');
      const response = await request(server)
        .post('/food/vendor/report/restaurant/sales')
        .set('Authorization', `Bearer ${vendor_token}`)
        .send({
          duration: 'custom_range',
          start_epoch: 1666776600,
          end_epoch: 1666780200,
        });

      expect(response.body.result.duration_wise_order_sales.length).not.toEqual(
        0
      );
      expect(
        response.body.result.duration_wise_order_sales[0].total_orders_count
      ).toEqual(1);
      expect(
        response.body.result.duration_wise_order_sales[0].vendor_sales_amount
      ).toEqual(0);
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
      ).toEqual(1);
      expect(response.body.result.total_vendor_sales_amount).toEqual(0);
    });
  });
});
