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
describe('Cancelled Orders', () => {
  describe('Cancelled By Cusomer', () => {
    test('order_status : cancelled | delivery_status: cancelled | order_acceptance_status : accepted', async () => {
      const order = await DB.read('order').where({id: 1007});
      expect(order[0].id).toBe(1007);
      expect(order[0].order_status).toBe('cancelled');
      expect(order[0].delivery_status).toBe('cancelled');
      expect(order[0].order_acceptance_status).toBe('accepted');
      expect(order[0].cancelled_by).toBe('customer');
      const response = await request(server)
        .post('/food/vendor/report/restaurant/sales')
        .set('Authorization', `Bearer ${vendor_token}`)
        .send({
          duration: 'custom_range',
          start_epoch: 1665999000,
          end_epoch: 1666002600,
        });

      expect(response.body.result.duration_wise_order_sales.length).not.toEqual(
        0
      );
      expect(
        response.body.result.duration_wise_order_sales[0].total_orders_count
      ).toEqual(1);
      expect(
        response.body.result.duration_wise_order_sales[0].vendor_sales_amount
      ).toEqual(578);
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
      expect(response.body.result.total_vendor_sales_amount).toEqual(578);
    });
    test('order_status : cancelled | delivery_status: failed_to_cancel | order_acceptance_status : accepted', async () => {
      const order = await DB.read('order').where({id: 1008});
      expect(order[0].id).toBe(1008);
      expect(order[0].order_status).toBe('cancelled');
      expect(order[0].delivery_status).toBe('failed_to_cancel');
      expect(order[0].order_acceptance_status).toBe('accepted');
      expect(order[0].cancelled_by).toBe('customer');
      const response = await request(server)
        .post('/food/vendor/report/restaurant/sales')
        .set('Authorization', `Bearer ${vendor_token}`)
        .send({
          duration: 'custom_range',
          start_epoch: 1666085400,
          end_epoch: 1666089000,
        });

      expect(response.body.result.duration_wise_order_sales.length).not.toEqual(
        0
      );
      expect(
        response.body.result.duration_wise_order_sales[0].total_orders_count
      ).toEqual(1);
      expect(
        response.body.result.duration_wise_order_sales[0].vendor_sales_amount
      ).toEqual(278);
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
      expect(response.body.result.total_vendor_sales_amount).toEqual(278);
    });
  });
  describe('Cancelled By Admin', () => {
    test('order_status : cancelled | delivery_status: cancelled | order_acceptance_status : accepted', async () => {
      const order = await DB.read('order').where({id: 1009});
      expect(order[0].id).toBe(1009);
      expect(order[0].order_status).toBe('cancelled');
      expect(order[0].delivery_status).toBe('cancelled');
      expect(order[0].order_acceptance_status).toBe('accepted');
      expect(order[0].cancelled_by).toBe('admin');
      const response = await request(server)
        .post('/food/vendor/report/restaurant/sales')
        .set('Authorization', `Bearer ${vendor_token}`)
        .send({
          duration: 'custom_range',
          start_epoch: 1666171800,
          end_epoch: 1666175400,
        });

      expect(response.body.result.duration_wise_order_sales.length).not.toEqual(
        0
      );
      expect(
        response.body.result.duration_wise_order_sales[0].total_orders_count
      ).toEqual(1);
      expect(
        response.body.result.duration_wise_order_sales[0].vendor_sales_amount
      ).toEqual(78);
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
      expect(response.body.result.total_vendor_sales_amount).toEqual(78);
    });
  });
  describe('Cancelled By Delivery Partner', () => {
    test('order_status : cancelled | delivery_status: cancelled | order_acceptance_status : accepted', async () => {
      const order = await DB.read('order').where({id: 1010});
      expect(order[0].id).toBe(1010);
      expect(order[0].order_status).toBe('cancelled');
      expect(order[0].delivery_status).toBe('cancelled');
      expect(order[0].order_acceptance_status).toBe('accepted');
      expect(order[0].cancelled_by).toBe('delivery_service');
      const response = await request(server)
        .post('/food/vendor/report/restaurant/sales')
        .set('Authorization', `Bearer ${vendor_token}`)
        .send({
          duration: 'custom_range',
          start_epoch: 1666258200,
          end_epoch: 1666261800,
        });

      expect(response.body.result.duration_wise_order_sales.length).not.toEqual(
        0
      );
      expect(
        response.body.result.duration_wise_order_sales[0].total_orders_count
      ).toEqual(1);
      expect(
        response.body.result.duration_wise_order_sales[0].vendor_sales_amount
      ).toEqual(158);
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
      expect(response.body.result.total_vendor_sales_amount).toEqual(158);
    });
  });
});
