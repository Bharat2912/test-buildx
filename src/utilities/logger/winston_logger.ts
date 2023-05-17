/* eslint-disable @typescript-eslint/no-explicit-any */
import winston, {format} from 'winston';
const ecsFormat = require('@elastic/ecs-winston-format');

const myFormat = format.printf(msg => {
  const {level, message, label, timestamp, metadata} = msg;
  let result = `${timestamp} [${label}][${level}]`;
  const payload = metadata;
  result += ' @@: ' + payload.logged_at;
  result += '\t>> ' + message;
  if (payload.data) {
    if (typeof payload.data === 'object') {
      result +=
        '\n' + (payload.data.stack || JSON.stringify(payload.data, null, 4));
    } else {
      result += ' : ' + payload.data;
    }
  }
  return result;
});

const mylevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
  silly: 5,
};

let mylogger = winston.createLogger({
  format: ecsFormat(),
  transports: [
    new winston.transports.Console({
      level: process.env.LOG_LEVEL,
      handleExceptions: true,
    }),
  ],
});

if (process.env.LOCAL_RUN) {
  mylogger = winston.createLogger({
    levels: mylevels,
    format: format.combine(
      // winston.format.colorize(),
      format.metadata(),
      format.timestamp(),
      format.label({label: process.env.APP_NAME}),
      myFormat
    ),

    transports: [
      new winston.transports.Console({
        level: process.env.LOG_LEVEL,
        handleExceptions: true,
      }),
    ],
    exitOnError: false,
  });
}

function getlogged_line() {
  try {
    let logged_line = new Error().stack?.split('\n')[3];
    if (logged_line) {
      logged_line = logged_line
        .replace('    at', '')
        .replace('(', '')
        .replace(')', '');
      logged_line = logged_line.split(' ')[2] || logged_line.split(' ')[1];
      return logged_line;
    }
  } catch (error) {
    //todo
  }
  return '';
}
function jsonify(data: any) {
  if (typeof data === 'number') {
    if (data % 1 === 0) {
      data = {message_int: data};
    } else {
      data = {message_float: data};
    }
  } else if (typeof data === 'string') {
    data = {message_string: data};
  } else if (typeof data === 'boolean') {
    data = {message_bool: data};
  } else if (typeof data === 'bigint') {
    data = {message_bint: data};
  }
  return data;
}
class logger {
  static error(message: string, data?: any) {
    data = jsonify(data);
    mylogger.error(message, {logged_at: getlogged_line(), data});
  }
  static warn(message: string, data?: any) {
    data = jsonify(data);
    mylogger.warn(message, {logged_at: getlogged_line(), data});
  }
  static info(message: string, data?: any) {
    data = jsonify(data);
    mylogger.info(message, {logged_at: getlogged_line(), data});
  }
  static http(message: string, data?: any) {
    data = jsonify(data);
    mylogger.http(message, {logged_at: 'express_http', data});
  }
  static debug(message: string, data?: any) {
    data = jsonify(data);
    mylogger.debug(message, {logged_at: getlogged_line(), data});
  }
  static silly(message: string, data?: any) {
    data = jsonify(data);
    mylogger.silly(message, {logged_at: getlogged_line(), data});
  }
}
// logger.silly('bigint', 12456465431564654);
// logger.silly('float', 1.12);
// logger.silly('string', 'saljhasfjhsf');
// logger.silly('bool', true);
// logger.silly('object', {foo: 'bar'});
// logger.silly('undefined');

// logger.silly('object', {foo: 'bar'});
// logger.silly('object', {amount: 100});
// logger.silly('object', {
//   payout: {
//     id: '123',
//     data: 'xyz',
//   },
// });
export default logger;
