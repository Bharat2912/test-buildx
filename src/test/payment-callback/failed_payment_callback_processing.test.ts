import request from 'supertest';
import {Application} from 'express';
import {createTestServer} from '../utils/init';
import logger from '../../utilities/logger/winston_logger';
import {mockSendSQSMessage} from '../utils/mock_services';
import {testCasesClosingTasks} from '../utils/utils';

let server: Application;

beforeAll(async () => {
  server = await createTestServer();

  logger.debug('payment callback init setup completed');
});

afterAll(async () => {
  await testCasesClosingTasks();
});

describe('Test failed payment callback processing', () => {
  test('Payment webhook should successfully processed and redirected to service', async () => {
    const service_redirection_sqs_call = mockSendSQSMessage();
    const payment_callback_response = await request(server)
      .post('/core/callback/cashfree/payment')
      .set({
        'x-webhook-timestamp': '1617695238078',
        'x-webhook-signature': 'XbJMeMNHQABmefok4RtsUMIA0U7U7qtwxw6BELusSX4=',
      })
      .send({
        data: {
          order: {
            order_id: 'RES_f1c67dd6-c7cd-4431-ad58-c9bfaca2c8fd',
            order_amount: 134.42,
            order_currency: 'INR',
            order_tags: null,
          },
          payment: {
            cf_payment_id: 975677711,
            payment_status: 'FAILED',
            payment_amount: 134.42,
            payment_currency: 'INR',
            payment_message: 'ZA::U19::Transaction fail',
            payment_time: '2022-05-25T14:28:22+05:30',
            bank_reference: '214568722700',
            auth_id: null,
            payment_method: {
              upi: {
                channel: null,
                upi_id: '9666699999@gpay',
              },
            },
            payment_group: 'upi',
          },
          customer_details: {
            customer_name: 'Customer',
            customer_id: 'b06ffcb4-4782-41ce-8d10-43a7ce86cbfa',
            customer_email: 'customer@gmail.com',
            customer_phone: '9666699999',
          },
          error_details: {
            error_code: 'TRANSACTION_DECLINED',
            error_description:
              'issuer bank or payment service provider declined the transaction',
            error_reason: 'auth_declined',
            error_source: 'customer',
          },
        },
        event_time: '2022-05-25T14:28:38+05:30',
        type: 'PAYMENT_FAILED_WEBHOOK',
      });
    expect(service_redirection_sqs_call).toHaveBeenCalledWith('', {
      action: 'UPDATE_PAYMENT_DETAILS',
      data: {
        data: {
          customer_details: {
            customer_email: 'customer@gmail.com',
            customer_id: 'b06ffcb4-4782-41ce-8d10-43a7ce86cbfa',
            customer_name: 'Customer',
            customer_phone: '9666699999',
          },
          error_details: {
            error_code: 'TRANSACTION_DECLINED',
            error_description:
              'issuer bank or payment service provider declined the transaction',
            error_reason: 'auth_declined',
            error_source: 'customer',
          },
          payment_details: {
            auth_id: null,
            bank_reference: '214568722700',
            external_payment_id: '975677711',
            payment_currency: 'INR',
            payment_group: 'upi',
            payment_message: 'ZA::U19::Transaction fail',
            payment_method: 'upi',
            payment_method_details: {
              upi: {
                channel: null,
                upi_id: '9666699999@gpay',
              },
            },
            payment_status: 'FAILED',
            transaction_amount: 134.42,
            transaction_id: 'RES_f1c67dd6-c7cd-4431-ad58-c9bfaca2c8fd',
            transaction_time: expect.anything(),
          },
        },
        event_time: '2022-05-25T14:28:38+05:30',
        type: 'PAYMENT_FAILED_WEBHOOK',
      },
      event: 'ORDER',
    });
    expect(payment_callback_response.status).toBe(200);
  });
});
