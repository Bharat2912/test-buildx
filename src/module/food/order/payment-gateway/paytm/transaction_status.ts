import {generateChecksum} from './checksum';
import * as secretStore from '../../../../../utilities/secret/secret_store';
import {doRequest} from './helper';
import logger from '../../../../../utilities/logger/winston_logger';
import {ITransactionStatus} from '../../types';
import ResponseError from '../../../../../utilities/response_error';
import {
  paytm_statusAPI_pending_response,
  paytm_statusAPI_success_response,
} from '../../validations';
import {sendEmail} from '../../../../../utilities/utilFuncs';
import Globals from '../../../../../utilities/global_var/globals';
/**
 * getTransactionStatus utility internally calls paytm status api which returns the transaction status
 * @head channelId ,signature
 * @body  mid ,orderId
 */
export async function getTransactionStatus(data: ITransactionStatus) {
  const checksum = await generateChecksum(data);
  const paytmParams = {
    head: {
      channelId: secretStore.getSecret('PAYTM_CHANNEL_ID'),
      signature: checksum,
    },
    body: data,
  };

  const post_data = JSON.stringify(paytmParams);
  // eslint-disable-next-line
  const response: any = await doRequest(
    {
      hostname: secretStore.getSecret('PAYTM_HOSTNAME'),
      port: 443,
      path: '/v3/order/status',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': post_data.length,
      },
    },
    post_data,
    'ORDER FAILED WHILE CALLING PAYTM TransactionStatus API: '
  );
  logger.info(
    `PAYTM TransactionStatus API RESPONSE FOR ORDER ID ${
      data.orderId
    }: ${JSON.stringify(response)}`
  );
  //check paytm repsonse
  if (response && response.body) {
    if (
      response.body.resultInfo.resultCode === '01' &&
      response.body.resultInfo.resultStatus === 'TXN_SUCCESS'
    ) {
      //using joi validation to validate paytm response
      const validation = paytm_statusAPI_success_response.validate(
        response.body
      );
      if (validation.error) {
        logger.error(
          `GOT INVALID RESPONSE FROM PAYTM TRANSACTION STATUS API : ${JSON.stringify(
            response
          )}` + validation.error
        );

        //send email to super admin about payment gateway response change
        await sendEmail(
          'AdminAlertEmailTemplate',
          await Globals.SUPER_ADMIN_EMAIL.get(),
          {
            subject: 'ALERT PAYTM TRANSACTION STATUS API RESPONSE CHANGED',
            application_name: 'core-api',
            error_details: validation.error,
            priority: 'high',
            time: new Date().toDateString(),
            meta_details: JSON.stringify({response: response, data: data}),
          }
        );

        throw new ResponseError(500, 'Internal Server Error');
      }
    } else if (
      response.body.resultInfo.resultCode === '402' &&
      response.body.resultInfo.resultStatus === 'PENDING'
    ) {
      //using joi validation to validate paytm response
      const validation = paytm_statusAPI_pending_response.validate(
        response.body
      );
      if (validation.error) {
        logger.error(
          `GOT INVALID RESPONSE FROM PAYTM TRANSACTION STATUS API : ${JSON.stringify(
            response
          )}` + validation.error
        );

        //send email to super admin about payment gateway response change
        await sendEmail(
          'AdminAlertEmailTemplate',
          await Globals.SUPER_ADMIN_EMAIL.get(),
          {
            subject: 'ALERT PAYTM TRANSACTION STATUS API RESPONSE CHANGED',
            application_name: 'core-api',
            error_details: validation.error,
            priority: 'high',
            time: new Date().toDateString(),
            meta_details: JSON.stringify({response: response, data: data}),
          }
        );
        throw new ResponseError(500, 'Internal Server Error');
      }

      throw new ResponseError(400, 'TRANSACTION_PENDING');
    } else if (
      response.body.resultInfo.resultCode === '9999' &&
      response.body.resultInfo.resultStatus === 'TXN_FAILURE'
    ) {
      //send email to super admin about payment gateway error
      await sendEmail(
        'AdminAlertEmailTemplate',
        await Globals.SUPER_ADMIN_EMAIL.get(),
        {
          subject:
            'ALERT PAYTM TRANSACTION STATUS API FAILED| PAYTM GATEWAY ERROR',
          application_name: 'core-api',
          error_details: 'TXN_FAILURE',
          priority: 'high',
          time: new Date().toDateString(),
          meta_details: JSON.stringify({response: response, data: data}),
        }
      );

      throw new ResponseError(500, 'Internal Server Error');
    } else {
      throw new ResponseError(400, [
        {
          message: 'TRANSACTION_FAILED',
          code: 0,
        },
      ]);
    }
  } else {
    //send email to super admin about payment gateway response change
    await sendEmail(
      'AdminAlertEmailTemplate',
      await Globals.SUPER_ADMIN_EMAIL.get(),
      {
        subject: 'ALERT PAYTM TRANSACTION STATUS API RESPONSE CHANGED',
        application_name: 'core-api',
        error_details: 'TXN_FAILURE',
        priority: 'high',
        time: new Date().toDateString(),
        meta_details: JSON.stringify({response: response, data: data}),
      }
    );

    logger.error(`INVALID PAYTM TRANSACTION STATUS API RESPONSE: ${response}`);
    throw new ResponseError(500, 'Internal Server Error');
  }
  logger.info('', {payment_details: response.body});

  return response.body;
}
