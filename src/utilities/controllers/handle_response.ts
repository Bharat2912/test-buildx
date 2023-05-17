/* eslint-disable @typescript-eslint/no-explicit-any */
import {Response} from 'express';
import {IError, IResponseError} from '../../types';

export function sendSuccess(
  res: Response,
  status_code: number,
  data: any,
  message?: string
) {
  const sendData = {
    status: true,
    statusCode: status_code,
    message: message || 'Successful Response',
    result: data,
  };
  return res.status(sendData.statusCode).send(sendData);
}
export function sendError(
  res: Response,
  status_code: number,
  error_messages: string | IError[],
  data?: any
) {
  const sendData: IResponseError = {
    status: false,
    statusCode: status_code,
    errors: undefined,
    result: data || undefined,
  };

  if (typeof error_messages === 'string') {
    sendData.errors = [
      {
        message: error_messages,
        code: 0,
      },
    ];
  } else {
    sendData.errors = error_messages;
  }

  return res.status(sendData.statusCode).send(sendData);
}
