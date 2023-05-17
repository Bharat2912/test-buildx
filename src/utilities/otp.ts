/* eslint-disable @typescript-eslint/no-explicit-any */
import * as myCache from './cache_manager';
import {genRandomOTP} from './gen_random_otp';
import Globals from './global_var/globals';
import logger from './logger/winston_logger';
import ResponseError from './response_error';
import {sendSQSMessage, SQS_URL} from './sqs_manager';
import {isValidPhone} from './utilFuncs';

export interface ISMS_OTP {
  phone?: string;
  email?: string;
  otp?: string;
}
function getTimeString(seconds: number) {
  const expire_in_min = Math.floor(seconds / 60);
  const expire_in_sec = seconds % 60;
  let expire_in = '';
  if (expire_in_min > 0) {
    expire_in = expire_in_min + ' Minute';
    if (expire_in_min > 1) expire_in += 's';
    if (expire_in_sec > 0) expire_in += ' and ';
  }
  if (expire_in_sec > 0) {
    expire_in += expire_in_sec + ' Second';
    if (expire_in_sec > 1) expire_in += 's';
  }
  return expire_in || 'NA';
}
export async function sendOtp(
  type: string,
  data: ISMS_OTP,
  sendSmsFlag: boolean,
  sendEmailFlag: boolean
) {
  let otp;
  const optCache = await myCache.get(`${data.phone}-${type}`);
  logger.info('OTP', optCache);
  const ttl = await Globals.OTP_TTL_SECONDS.get();
  const expire_in = getTimeString(ttl);
  if (data.phone && sendSmsFlag) {
    if (!isValidPhone(data.phone)) {
      throw new ResponseError(400, 'Invalid phone number: ' + data.phone);
    }
    if (process.env.SEND_REAL_SMS === 'true') {
      data.otp = genRandomOTP(5);
      await myCache.set(`${data.phone}-${type}`, data, ttl);
      await sendSQSMessage(SQS_URL.NOTIFICATIONS, {
        event: 'SMS',
        action: 'SINGLE',
        data: {
          receiverNumber: data.phone,
          data: {
            otp: data.otp,
            expire_in: expire_in,
          },
          templateName: 'OTP',
        },
      });
      logger.info('sendSQSMessage:- SMS The otp :- ', data.otp);
    } else {
      otp = '00000';
      data.otp = otp;
      await myCache.set(`${data.phone}-${type}`, data, ttl);
      logger.info('The otp :-', data.otp);
    }
  } else {
    logger.info('OTP cannot Genrate for sendSmsFlag Because value is false');
  }
  if (data.email && sendEmailFlag) {
    if (process.env.SEND_REAL_EMAIL === 'true') {
      data.otp = genRandomOTP(5);
      await myCache.set(`${data.email}-${type}`, data, ttl);
      await sendSQSMessage(SQS_URL.NOTIFICATIONS, {
        event: 'EMAIL',
        action: 'SINGLE',
        data: {
          reciverEmail: data.email,
          templateName: 'SendOtpTemp',
          templateData: {
            otp: data.otp,
            expire_in: expire_in,
          },
        },
      });
      logger.info('sendSQSMessage:- EMAIL The otp :- ', data.otp);
    } else {
      otp = '00000';
      data.otp = otp;
      await myCache.set(`${data.email}-${type}`, data, ttl);
      logger.info('The otp :-', data.otp);
    }
  } else {
    logger.info('OTP cannot Genrate for sendEmailFlag Because value is false');
  }
  return otp;
}

export async function verifyOtp(type: string, phone: string, otp?: string) {
  const cacheValue = await myCache.get(`${phone}-${type}`);
  if (cacheValue) {
    if (otp === cacheValue.otp) {
      delete cacheValue.otp;
      myCache.del(`${phone}-${type}`);
      return cacheValue;
    } else {
      return false;
    }
  } else {
    return false;
  }
}
