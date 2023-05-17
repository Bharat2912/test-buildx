/* eslint-disable @typescript-eslint/no-explicit-any */
import https from 'https';
import logger from '../../../../../utilities/logger/winston_logger';
import ResponseError from '../../../../../utilities/response_error';

/**
 * doRequest promisefy https request module
 */
export function doRequest(options: any, data: any, message: string) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res: any) => {
      res.setEncoding('utf8');
      let responseBody = '';

      res.on('data', (chunk: any) => {
        responseBody += chunk;
      });

      res.on('end', () => {
        resolve(JSON.parse(responseBody));
      });
    });
    req.on('error', (err: any) => {
      reject(err);
      logger.error(message, err);
      throw new ResponseError(500, 'Something went wrong');
    });

    req.write(data);
    req.end();
  });
}
