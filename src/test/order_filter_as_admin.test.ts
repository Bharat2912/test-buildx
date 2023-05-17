import request from 'supertest';
import {createTestServer} from './utils/init';
import {Application} from 'express';
import {
  loadMockSeedData,
  signToken,
  testCasesClosingTasks,
} from './utils/utils';
import {
  mockgenerateDownloadFileURL,
  mockgetAdminDetails,
  mockGetCustomerDetailsWithFilterSuccess,
  mockGetCustomerDetailsWithFilterFail,
} from './utils/mock_services';

jest.mock('axios');

let server: Application;
let admin_token: string;

beforeAll(async () => {
  server = await createTestServer();

  await loadMockSeedData('restaurant');
  await loadMockSeedData('time_slot');
  await loadMockSeedData('subscription');
  await loadMockSeedData('restaurant_menu');
  await loadMockSeedData('completed_orders');
  admin_token = signToken({
    id: '64bfafb6-c273-4b64-a0fc-ca981f5819eb',
    user_type: 'admin',
  });
});

afterAll(async () => {
  await testCasesClosingTasks();
});

describe('FILTER ORDERS AS ADMIN', () => {
  describe('Using Order Status', () => {
    test('Sending Empty Order Status Body | Need to Throw  Error', async () => {
      const mock_get_admin_details = await mockgetAdminDetails();
      const order_details = await request(server)
        .post('/food/admin/order/filter')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          filter: {
            delivery_status: [' '],
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
      expect(order_details.statusCode).toBe(400);
      expect(order_details.body.status).toBe(false);
      expect(order_details.body.errors).toStrictEqual([
        {
          message:
            '"filter.delivery_status[0]" must be one of [pending, accepted, rejected, allocated, arrived, dispatched, arrived_customer_doorstep, delivered, cancelled, cancelled_by_customer, returned_to_seller]',
          code: 1000,
        },
      ]);
      expect(mock_get_admin_details).toHaveBeenCalled();
    });
    test('Get Details Of Completed Order', async () => {
      const mock_get_admin_details = await mockgetAdminDetails();
      const mock_filter_customer =
        await mockGetCustomerDetailsWithFilterSuccess();
      const mock_generate_url = await mockgenerateDownloadFileURL();

      const order_details = await request(server)
        .post('/food/admin/order/filter')
        .set('Authorization', `Bearer ${admin_token}`)
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
      expect(order_details.statusCode).toBe(200);
      expect(order_details.body.status).toBe(true);
      expect(order_details.body.result.total_records).toEqual(1);
      expect(mock_get_admin_details).toHaveBeenCalled();
      expect(mock_filter_customer).toHaveBeenCalled();
      expect(mock_generate_url).toHaveBeenCalled();
    });
    test('Invalid order status', async () => {
      const mock_get_admin_details = await mockgetAdminDetails();
      const order_details = await request(server)
        .post('/food/admin/order/filter')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          filter: {
            order_status: ['delivered'],
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
      expect(order_details.statusCode).toBe(400);
      expect(order_details.body.status).toBe(false);
      expect(order_details.body.errors).toStrictEqual([
        {
          message:
            '"filter.order_status[0]" must be one of [placed, cancelled, completed, pending]',
          code: 1000,
        },
      ]);
      expect(mock_get_admin_details).toHaveBeenCalled();
    });
  });
  describe('With Payment Ids', () => {
    test('Empty array | Need To throw error', async () => {
      const get_admin_details = mockgetAdminDetails();
      const response = await request(server)
        .post('/food/admin/order/filter')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          filter: {
            payment_id: [''],
          },
        });
      expect(response.body.statusCode).toBe(400);
      expect(response.body.status).toBe(false);
      expect(response.body.errors).toStrictEqual([
        {
          message: '"filter.payment_id[0]" is not allowed to be empty',
          code: 1000,
        },
      ]);
      expect(get_admin_details).toHaveBeenCalled();
    });
    test('Wrong payment ID | total_records : 0', async () => {
      const get_admin_details = mockgetAdminDetails();
      const response = await request(server)
        .post('/food/admin/order/filter')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          filter: {
            payment_id: ['RES_33c6fdbc-8df6-4541-9d3f-f9e5ba4c0242'],
          },
        });
      expect(response.body.statusCode).toBe(200);
      expect(response.body.status).toBe(true);
      expect(response.body.result.total_records).toEqual(0);
      expect(get_admin_details).toHaveBeenCalled();
    });
    test('Get order | total_records : 1', async () => {
      const get_admin_details = mockgetAdminDetails();
      const mock_filter_customer = mockGetCustomerDetailsWithFilterSuccess();
      const mock_get_download_url = mockgenerateDownloadFileURL();
      const response = await request(server)
        .post('/food/admin/order/filter')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          filter: {
            payment_id: ['RES_99c6fdbc-8df6-4541-9d3f-f9e5ba4c0242'],
          },
        });
      expect(response.body.statusCode).toBe(200);
      expect(response.body.status).toBe(true);
      expect(response.body.result.total_records).toEqual(1);
      expect(mock_filter_customer).toHaveBeenCalled();
      expect(mock_get_download_url).toHaveBeenCalled();
      expect(get_admin_details).toHaveBeenCalled();
    });
  });
  describe('With customer Ids', () => {
    test('Empty array | Need To throw error', async () => {
      const get_admin_details = mockgetAdminDetails();
      const response = await request(server)
        .post('/food/admin/order/filter')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          filter: {
            customer_id: [''],
          },
        });
      expect(response.body.statusCode).toBe(400);
      expect(response.body.status).toBe(false);
      expect(response.body.errors).toStrictEqual([
        {
          message: '"filter.customer_id[0]" is not allowed to be empty',
          code: 1000,
        },
      ]);
      expect(get_admin_details).toHaveBeenCalled();
    });
    test('Get order | total_records : 1', async () => {
      const get_admin_details = mockgetAdminDetails();
      const mock_filter_customer = mockGetCustomerDetailsWithFilterSuccess();
      const mock_get_download_url = mockgenerateDownloadFileURL();
      const response = await request(server)
        .post('/food/admin/order/filter')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          filter: {
            customer_id: ['33c6fdbc-8df6-4541-9d3f-f9e5ba4c0242'],
          },
        });
      expect(response.body.statusCode).toBe(200);
      expect(response.body.status).toBe(true);
      expect(response.body.result.total_records).toEqual(1);
      expect(mock_filter_customer).toHaveBeenCalled();
      expect(mock_get_download_url).toHaveBeenCalled();
      expect(get_admin_details).toHaveBeenCalled();
    });
    test('Wrong customer_id | total_records : 0', async () => {
      const get_admin_details = mockgetAdminDetails();
      const mock_filter_customer = mockGetCustomerDetailsWithFilterFail();
      const response = await request(server)
        .post('/food/admin/order/filter')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          filter: {
            customer_id: ['7377c3ac-bf96-46a6-9089-46ed357d8119'],
          },
        });
      expect(response.body.statusCode).toBe(200);
      expect(response.body.status).toBe(true);
      expect(response.body.result.total_records).toEqual(0);
      expect(mock_filter_customer).toHaveBeenCalled();
      expect(get_admin_details).toHaveBeenCalled();
    });
  });
  describe('With customer email and phone', () => {
    test('Get order', async () => {
      const get_admin_details = mockgetAdminDetails();
      const mock_filter_customer = mockGetCustomerDetailsWithFilterSuccess();
      const mock_get_download_url = mockgenerateDownloadFileURL();
      const response = await request(server)
        .post('/food/admin/order/filter')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          filter: {
            customer_email: ['mohit.g@speedyy.com'],
            customer_phone: ['+918591114112'],
          },
        });
      expect(response.body.statusCode).toBe(200);
      expect(response.body.status).toBe(true);
      expect(response.body.result.total_records).toEqual(1);
      expect(mock_filter_customer).toHaveBeenCalled();
      expect(mock_get_download_url).toHaveBeenCalled();
      expect(get_admin_details).toHaveBeenCalled();
    });
  });
  describe('Restaurant Id', () => {
    test('Get order | total_records : 1', async () => {
      const get_admin_details = mockgetAdminDetails();
      const mock_filter_customer = mockGetCustomerDetailsWithFilterSuccess();
      const mock_get_download_url = mockgenerateDownloadFileURL();
      const response = await request(server)
        .post('/food/admin/order/filter')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          filter: {
            restaurant_id: 'b0909e52-a731-4665-a791-ee6479008805',
          },
        });
      expect(response.body.statusCode).toBe(200);
      expect(response.body.status).toBe(true);
      expect(response.body.result.total_records).toEqual(1);
      expect(mock_filter_customer).toHaveBeenCalled();
      expect(mock_get_download_url).toHaveBeenCalled();
      expect(get_admin_details).toHaveBeenCalled();
    });
    test('Wrong Restaurant ID | total_records : 0', async () => {
      const get_admin_details = mockgetAdminDetails();
      const response = await request(server)
        .post('/food/admin/order/filter')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          filter: {
            restaurant_id: 'a0909e52-a731-4665-a791-ee6479008806',
          },
        });
      expect(response.body.statusCode).toBe(200);
      expect(response.body.status).toBe(true);
      expect(response.body.result.total_records).toEqual(0);
      expect(get_admin_details).toHaveBeenCalled();
    });
  });
  describe('Cancelled_by', () => {
    test('Cancelled_by : admin | Cancelled_by : delivery_partner | total_records : 0', async () => {
      const get_admin_details = mockgetAdminDetails();
      const response = await request(server)
        .post('/food/admin/order/filter')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          filter: {
            cancelled_by: ['admin', 'delivery_service'],
          },
        });
      expect(response.body.statusCode).toBe(200);
      expect(response.body.status).toBe(true);
      expect(response.body.result.total_records).toEqual(0);
      expect(get_admin_details).toHaveBeenCalled();
    });
    test('add invalid Cancelled_by  | Need to throw error', async () => {
      const get_admin_details = mockgetAdminDetails();
      const response = await request(server)
        .post('/food/admin/order/filter')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          filter: {
            cancelled_by: ['admin', 'speedyy'],
          },
        });
      expect(response.body.statusCode).toBe(400);
      expect(response.body.status).toBe(false);
      expect(response.body.errors).toStrictEqual([
        {
          message:
            '"filter.cancelled_by[1]" must be one of [delivery_service, admin, customer, vendor]',
          code: 1000,
        },
      ]);
      expect(get_admin_details).toHaveBeenCalled();
    });
  });
  describe('Order Filter CSV', () => {
    test('in_csv is false | Need to return Json response', async () => {
      const mock_generate_url = await mockgenerateDownloadFileURL();
      const order_details = await request(server)
        .post('/food/admin/order/filter')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          filter: {
            order_status: ['completed'],
            in_csv: false,
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
      expect(order_details.statusCode).toBe(200);
      expect(order_details.body.status).toBe(true);
      expect(order_details.body.result.total_records).toEqual(1);
      expect(order_details.body.result.records[0].order_id).toEqual(1000);
      expect(mock_generate_url).toHaveBeenCalled();
    });
    test('in_csv is true | Need to return csv file', async () => {
      const order_details = await request(server)
        .post('/food/admin/order/filter')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          filter: {
            order_status: ['completed'],
            in_csv: true,
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
      expect(order_details.statusCode).toBe(200);
      const csv_value = order_details.body.toString();
      // expect(csv_value).toBe(
      //   'Order Id,Restaurant Id,Restaurant Name,Order Status,Customer Name,Customer Address,Payment Id,Payment Method,Payment Status,Payment Gateway,Payment Transaction Id,Payment Transaction Time,Amount Paid By Customer,Rider Id,Rider Name,Rider Phone Number,Menu Item Name,Quantity,Addon Name,Total Item Cost,Packaging Charges,Delivery Charges (Inclusive Of Taxes),GST (Item + Packaging),Transaction Charges,Coupon Code,Offer Discount,Vendor Payout Amount,Total Customer Payable,Placed At,Vendor Accepted Time,Accpeted End Time,Marked Ready At,Picked Up At,Delivered At,Vendor Order Status,Delivery Status,Order Status,Refund Status,Cancelled By,Cancellation Reason,Cancellation Time,Customer Refund Amount,Customer Refund Note,Vendor Refund Amount,Vendor Refund Note,Rider Refund Amount,Rider Refund Note\n"1000","b0909e52-a731-4665-a791-ee6479008805","Burger King","completed","Ankita Thakkar","Ankita Thakkar, ankita.t@speedyy.com, +918758668003, Mumbai, Maharashtra, India, mumbai, 102","RES_99c6fdbc-8df6-4541-9d3f-f9e5ba4c0242","PPI","completed","WALLET","20220518111212800110168531851371782","13-05-2022 1:27:22 AM AM","1","","Amit Kumar","","","","","","","","","","N/A","N/A",,"390.19","10-10-2022 8:35:05 PM PM","10-10-2022 8:37:10 PM PM","10-10-2022 8:47:05 PM PM","10-10-2022 8:50:26 PM PM","10-10-2022 8:52:26 PM PM","11-10-2022 8:25:17 PM PM","accepted","delivered","completed","N/A","N/A","","N/A","N/A","N/A","N/A","N/A","N/A","N/A"'
      // );
    });
  });
});
