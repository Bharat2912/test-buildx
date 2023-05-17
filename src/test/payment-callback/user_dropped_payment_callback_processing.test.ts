import request from 'supertest';
import {Application} from 'express';
import {createTestServer} from '../utils/init';
import logger from '../../utilities/logger/winston_logger';
import {mockSendSQSMessage} from '../utils/mock_services';
import {testCasesClosingTasks} from '../utils/utils';

let server: Application;

beforeAll(async () => {
  server = await createTestServer();
  //
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
            order_id: 'RES_743ea806-b47f-4a6d-8aa3-69a68a534b3a',
            order_amount: 134.42,
            order_currency: 'INR',
            order_tags: null,
          },
          payment: {
            cf_payment_id: 9756722609,
            payment_status: 'USER_DROPPED',
            payment_amount: 134.42,
            payment_currency: 'INR',
            payment_message:
              'User dropped and did not complete the two factor authentication',
            payment_time: '2022-05-25T14:25:34+05:30',
            bank_reference: '1803592531',
            auth_id: '2980',
            payment_method: {
              netbanking: {
                channel: null,
                netbanking_bank_code: '3044',
                netbanking_bank_name: 'State Bank Of India',
              },
            },
            payment_group: 'net_banking',
          },
          customer_details: {
            customer_email: 'customer@gmail.com',
            customer_id: 'b06ffcb4-4782-41ce-8d10-43a7ce86cbfa',
            customer_name: 'Customer',
            customer_phone: '9666699999',
          },
        },
        event_time: '2022-05-25T14:35:38+05:30',
        type: 'PAYMENT_USER_DROPPED_WEBHOOK',
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
          error_details: undefined,
          payment_details: {
            auth_id: '2980',
            bank_reference: '1803592531',
            external_payment_id: '9756722609',
            payment_currency: 'INR',
            payment_group: 'net_banking',
            payment_message:
              'User dropped and did not complete the two factor authentication',
            payment_method: 'netbanking',
            payment_method_details: {
              netbanking: {
                channel: null,

                netbanking_bank_code: '3044',
                netbanking_bank_name: 'State Bank Of India',
              },
            },
            payment_status: 'USER_DROPPED',
            transaction_amount: 134.42,
            transaction_id: 'RES_743ea806-b47f-4a6d-8aa3-69a68a534b3a',
            transaction_time: expect.anything(),
          },
        },
        event_time: '2022-05-25T14:35:38+05:30',
        type: 'PAYMENT_USER_DROPPED_WEBHOOK',
      },
      event: 'ORDER',
    });
    expect(payment_callback_response.status).toBe(200);
  });
});
