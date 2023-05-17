import request from 'supertest';
import {Application} from 'express';
import {createTestServer} from '../utils/init';
import {
  createTableDynamoDB,
  dropTableDynamoDB,
  loadMockSeedData,
  testCasesClosingTasks,
} from '../utils/utils';
import logger from '../../utilities/logger/winston_logger';
import {mockSendSQSMessage} from '../utils/mock_services';
import {RefundGateway, RefundStatus} from '../../module/core/payment/enum';
import {v4 as uuidv4} from 'uuid';
import {processInitiateRefund} from '../../module/core/payment/service';
import {
  mock_getCashfreeRefund_successful_response,
  mock_initiateCashfreeRefund_successful_response,
} from './mocks';
import {DB} from '../../data/knex';
import {RefundMasterTable} from '../../module/core/payment/constants';
import {Service} from '../../enum';
import {IRefundMaster} from '../../module/core/payment/types';
import {
  CashFreeRefundEvents,
  CashfreeRefundStatus,
} from '../../module/core/payment/cashfree/enum';
jest.mock('axios');

//! How refund flow works
/**
 * 1.Each Service i.e(food,grocery,pnd,pharmacy) will raise a request to initated refund to a particular customer
 *   by sending a sqs message to Core API.
 * 2.Core API will process the worker initiate refund message and initiate acually refund on payment gateway
 *   side.
 * 3.Response of initate refund on payment gateway side which includes a refund id and refund charges & amount
 *   is returned back to service. Following details are also updated in refund master table
 * 4.Following service picks the refund initate details and updates the order table with following details
 * 5.After x time, Core API receives a callback from payment gateway with refund status of initated refund
 *   That details are updated in refund master table and it is forwarded to service
 * 6.Service again picks up the refund details and updates the order table with following details
 *
 */
//!

let server: Application;

beforeAll(async () => {
  server = await createTestServer();

  await createTableDynamoDB('user');
  await loadMockSeedData('restaurant');
  await loadMockSeedData('time_slot');
  await loadMockSeedData('subscription');
  await loadMockSeedData('coupon');
  await loadMockSeedData('restaurant_menu');
  logger.debug('order refund test case initail setups completed');
});

afterAll(async () => {
  await testCasesClosingTasks();
  await dropTableDynamoDB('user');
});

describe('Testing Initate Refund core worker processing and refund callback processing', () => {
  test('refund will be processed by worker and callback', async () => {
    /** ==========================================
     *      *INITIATE REFUND FROM CORE WORKER
     * ===========================================
     */

    const initate_refund_details = {
      service: Service.FOOD_API,
      payment_id: uuidv4(),
      order_id: 1,
      customer_id: uuidv4(),
      refund_gateway: RefundGateway.CASHFREE,
      refund_charges: 0,
      refund_amount: 123.21,
      refund_currency: 'INR',
      refund_note: 'customer cancelled order under 30 seconds',
      is_pod: false,
    };
    const mock_initiateCashfreeRefund_successful_response_fn_1 =
      mock_initiateCashfreeRefund_successful_response(
        initate_refund_details.payment_id,
        initate_refund_details.order_id + ''
      );
    const mockSendSQSMessage_fn_1 = mockSendSQSMessage();
    await processInitiateRefund({
      event: 'REFUND',
      action: 'CREATE',
      data: initate_refund_details,
    });

    expect(
      mock_initiateCashfreeRefund_successful_response_fn_1
    ).toHaveBeenCalled();
    expect(mockSendSQSMessage_fn_1).toHaveBeenCalled();

    /** ============================================================================
     *      *CHECK REFUND MASTER TABLE IF REFUND RECORD IS CREATED OR NOT
     * =============================================================================*/

    const refund_details: IRefundMaster = await DB.read
      .select('*')
      .from(RefundMasterTable.TableName)
      .where({
        service: initate_refund_details.service,
        order_id: initate_refund_details.order_id,
      })
      .then((refund_details: IRefundMaster[]) => {
        return refund_details[0];
      })
      .catch((error: Error) => {
        logger.error(
          'GOT ERROR WHILE FETCHING DATA FROM REFUND MASTER TABLE',
          error
        );
        throw error;
      });
    expect(refund_details).not.toBe(undefined);
    expect(refund_details.refund_status).toBe(RefundStatus.PENDING);

    /** ============================================================================
     *      *REFUND CALLBACK WILL PROCESS SUCCESSUL REFUND DETAILS
     * =============================================================================*/

    const mock_initiateCashfreeRefund_successful_response_fn_2 =
      mock_getCashfreeRefund_successful_response(
        refund_details.id!,
        refund_details.payment_id!
      );
    const mockSendSQSMessage_fn_2 = mockSendSQSMessage();
    const refund_callback_response = await request(server)
      .post('/core/callback/cashfree/refund')
      .set({
        'x-webhook-timestamp': '1617695238078',
        'x-webhook-signature': 'XbJMeMNHQABmefok4RtsUMIA0U7U7qtwxw6BELusSX4=',
      })
      .send({
        event_time: '2022-02-28T13:04:28+05:30',
        type: CashFreeRefundEvents.REFUND_STATUS_WEBHOOK,
        data: {
          refund: {
            cf_payment_id: 918812,
            cf_refund_id: 1553338,
            refund_id: refund_details.id,
            order_id: refund_details.payment_id,
            entity: 'refund',
            refund_amount: 100.81,
            refund_currency: 'INR',
            refund_note: 'Refund for order #123',
            refund_status: CashfreeRefundStatus.SUCCESS,
            refund_type: 'MERCHANT_PROCESSED',
            refund_splits: [],
            status_description: 'refund completed',
            refund_arn: 'RF12312',
            metadata: null,
            created_at: '2021-07-25T08:57:52+05:30',
            processed_at: '2021-07-25T12:57:52+05:30',
            refund_charge: 0,
            refund_mode: 'STANDARD',
          },
        },
      });
    expect(
      mock_initiateCashfreeRefund_successful_response_fn_2
    ).toHaveBeenCalled();
    expect(mockSendSQSMessage_fn_2).toHaveBeenCalled();
    expect(refund_callback_response.status).toBe(200);

    /** ============================================================================
     *      *CHECK REFUND MASTER TABLE IF REFUND IS SUCCESSFUL OR NOT
     * =============================================================================*/

    const refund_succ_details: IRefundMaster = await DB.read
      .select('*')
      .from(RefundMasterTable.TableName)
      .where({
        id: refund_details.id,
      })
      .then((refund_details: IRefundMaster[]) => {
        return refund_details[0];
      })
      .catch((error: Error) => {
        logger.error(
          'GOT ERROR WHILE FETCHING DATA FROM REFUND MASTER TABLE',
          error
        );
        throw error;
      });

    expect(refund_succ_details).not.toBe(undefined);
    expect(refund_succ_details.refund_status).toBe(RefundStatus.SUCCESS);
  });
});
