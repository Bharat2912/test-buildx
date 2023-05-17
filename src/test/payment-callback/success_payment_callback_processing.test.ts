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

describe('Test success payment callback processing', () => {
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
            cf_payment_id: 975677712,
            payment_status: 'SUCCESS',
            payment_amount: 134.42,
            payment_currency: 'INR',
            payment_message: 'Transaction success',
            payment_time: '2021-10-07T19:42:40+05:30',
            bank_reference: '1903772466',
            auth_id: null,
            payment_method: {
              card: {
                channel: null,
                card_number: '470613XXXXXX2123',
                card_network: 'visa',
                card_type: 'credit_card',
                card_country: 'IN',
                card_bank_name: 'TEST Bank 32',
              },
            },
            payment_group: 'credit_card',
          },
          customer_details: {
            customer_name: 'Customer',
            customer_id: 'b06ffcb4-4782-41ce-8d10-43a7ce86cbfa',
            customer_email: 'customer@gmail.com',
            customer_phone: '9666699999',
          },
        },
        event_time: '2021-10-07T19:42:44+05:30',
        type: 'PAYMENT_SUCCESS_WEBHOOK',
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
            auth_id: null,
            bank_reference: '1903772466',
            external_payment_id: '975677712',
            payment_currency: 'INR',
            payment_group: 'credit_card',
            payment_message: 'Transaction success',
            payment_method: 'card',
            payment_method_details: {
              card: {
                card_bank_name: 'TEST Bank 32',
                card_country: 'IN',
                card_network: 'visa',
                card_number: '470613XXXXXX2123',
                card_type: 'credit_card',
                channel: null,
              },
            },
            payment_status: 'SUCCESS',
            transaction_amount: 134.42,
            transaction_id: 'RES_f1c67dd6-c7cd-4431-ad58-c9bfaca2c8fd',
            transaction_time: expect.anything(),
          },
        },
        event_time: '2021-10-07T19:42:44+05:30',
        type: 'PAYMENT_SUCCESS_WEBHOOK',
      },
      event: 'ORDER',
    });
    expect(payment_callback_response.status).toBe(200);
  });
});
