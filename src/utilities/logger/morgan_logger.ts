import morgan from 'morgan';
import json from 'morgan-json';
import logger from './winston_logger';
import {Request} from 'express';

const format = json({
  from: ':remote-addr',
  method: ':method',
  url: ':url',
  status: ':status',
  contentLength: ':res[content-length]',
  responseTime: ':response-time',
  AmznTraceId: ':req[X-Amzn-Trace-Id]',
});
// HTTP logger middleware
const httpLogger = morgan(format, {
  skip: function (req: Request) {
    if (req.baseUrl === '/health') {
      return true;
    } else {
      return false;
    }
  },
  stream: {
    write: message => {
      logger.http('', JSON.parse(message));
    },
  },
});

export default httpLogger;
