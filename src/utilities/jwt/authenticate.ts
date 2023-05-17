import jwt from 'jsonwebtoken';
import {Request, Response, NextFunction} from 'express';
import * as secretStore from '../secret/secret_store';
import logger from '../logger/winston_logger';
import {sendError} from '../controllers/handle_response';
import {getAdminDetailAuth} from '../user_api';
import crypto from 'crypto';
import {isEmpty, sendEmail} from './../../utilities/utilFuncs';
import Globals from '../global_var/globals';
import {Service} from '../../enum';
import {readRestaurantChildren} from '../../module/food/restaurant/models';
interface user {
  id: string;
  user_type: string;
  role: Array<string>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    export interface Request {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data?: any;
      user: user;
      baseUrl: string;
    }
  }
}

async function authenticate_jwt(
  req: Request,
  res: Response
): Promise<user | undefined> {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  let result: user | undefined;
  if (!token) {
    sendError(res, 401, 'Authorization Error');
  } else {
    const promis = new Promise(resolve => {
      jwt.verify(
        token,
        secretStore.getSecret('JWT_ACCESS_PUBLIC_KEY'),
        (err, user) => {
          if (err) {
            if (err.name === 'JsonWebTokenError') {
              logger.info('Got Error In Verification of jwt Token', err);
            }
            sendError(res, 401, 'Authorization Error');
          } else {
            if (!user) {
              sendError(res, 403, 'Forbidden');
            } else {
              resolve(user);
            }
          }
        }
      );
    });
    result = (await promis) as user;
  }
  return result;
}

async function authenticate_user_type(
  req: Request,
  res: Response,
  user_type: string
): Promise<Request | undefined> {
  const user = await authenticate_jwt(req, res);
  if (user) {
    if (user.user_type !== user_type) {
      sendError(res, 403, 'forbidden');
    } else {
      req.user = user;
      return req;
    }
  }
  return undefined;
}

export async function authenticate_user(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = await authenticate_jwt(req, res);
  if (user) {
    req.user = user;
    next();
  }
}

export async function authenticate_admin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const rq = await authenticate_user_type(req, res, 'admin');
  const token = req.headers['authorization'];
  if (rq && token) {
    req = rq;
    try {
      const admin = await getAdminDetailAuth(token);
      if (admin && admin.role) {
        req.user.role = admin.role;
        req.user.data = {
          full_name: admin.full_name,
        };
        logger.info('ADMIN_REQUEST', {
          admin: req.user,
          api_url: req.originalUrl,
          method: req.method,
          request_query: req.query,
          request_param: req.params,
          request_body: req.body,
        });
        next();
      } else {
        sendError(res, 500, 'Server Error');
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error?.response?.status === 401) {
        sendError(res, 401, 'Authorization Error');
      } else {
        sendError(res, 500, 'Server Error');
      }
    }
  }
}

export async function authenticate_partner(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const rq = await authenticate_user_type(req, res, 'partner');
  if (rq) {
    req = rq;
    next();
  }
}
export async function authenticate_vendor(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const rq = await authenticate_user_type(req, res, 'vendor');
  if (rq) {
    req = rq;
    if (req.user.data.type !== 'restaurant') {
      return sendError(res, 403, 'forbidden');
    }
    if (!req.user.data.outlet_id) {
      return sendError(res, 403, 'forbidden');
    }
    if (isEmpty(req.user.data.force_reset_password)) {
      return sendError(res, 403, 'forbidden');
    }
    if (req.user.data.force_reset_password) {
      return sendError(res, 403, 'Please reset your password.');
    }
    req.user.data.restaurant_id = req.user.data.outlet_id;
    const child_restaurants = await readRestaurantChildren(
      req.user.data.restaurant_id
    );
    if (child_restaurants && child_restaurants.length) {
      if (req.headers['child_outlet_id']) {
        const child_restaurant_id = req.headers['child_outlet_id'];
        const child_restaurant = child_restaurants.find(res => {
          return res.id === child_restaurant_id;
        });
        if (child_restaurant) {
          req.user.data.restaurant_id = child_restaurant_id;
        } else return sendError(res, 400, 'invalid child restaurant');
      } else {
        req.user.data.child_restaurant_ids = child_restaurants.map(
          rest => rest.id
        );
        req.user.data.child_restaurant_ids.push(req.user.data.restaurant_id);
      }
    }
    return next();
  }
}

export async function authenticate_customer(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const rq = await authenticate_user_type(req, res, 'customer');
  if (rq) {
    req = rq;
    next();
  }
}

export async function optional_authenticate_customer(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.headers['authorization']) {
    const rq = await authenticate_user_type(req, res, 'customer');
    if (rq) {
      req = rq;
      next();
    }
  } else {
    next();
  }
}

export function authenticate_admin_serviceability(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  if (user.user_type === 'admin') {
    if (user.role.includes('superadmin')) {
      next();
      return;
    }
    if (user.role.includes('serviceability')) {
      next();
      return;
    }
  }
  sendError(res, 403, 'Authorization Error');
}

/**
 * authenticate_shadowfax makes sure that only shadowfax system can use core-api callbacks
 * SHADOWFAX_CALLBACK_TOKEN will be used by shadowfax system
 */
export function authenticate_shadowfax(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (process.env.LOCAL_RUN === 'true') {
    next();
    return;
  }
  if (token === secretStore.getSecret('SHADOWFAX_CALLBACK_TOKEN')) {
    next();
  } else {
    logger.error(`INVALID SHADOWFAX_CALLBACK_TOKEN RECIVED TOKEN: ${token}`);
    sendError(res, 401, 'Authorization Error');
  }
}
export function authenticate_rider(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (process.env.LOCAL_RUN === 'true') {
    next();
    return;
  }
  if (token === secretStore.getSecret('RIDER_APP_CALLBACK_TOKEN')) {
    next();
  } else {
    logger.error(`INVALID RIDER_CALLBACK_TOKEN RECIVED TOKEN: ${token}`);
    sendError(res, 401, 'Authorization');
  }
}
export function verifyCashfreeSignature(postData: {[key: string]: string}) {
  const clientsecret = secretStore.getSecret('CASHFREE_PAYOUT_CLIENT_SECRET');
  let payload = '';
  const {signature, ...rest} = postData;
  Object.keys(rest)
    .sort()
    .forEach((key: string) => {
      payload += rest[key];
    });
  const generatedSignature = crypto
    .createHmac('sha256', clientsecret)
    .update(payload)
    .digest('base64');
  // console.log('signature', signature);
  // console.log('encrypt payload', payload);
  // console.log('clientsecret', clientsecret);
  // console.log('generatedSignature', generatedSignature);
  // console.log('result ', signature === generatedSignature);
  if (signature === generatedSignature) {
    return true;
  } else {
    return false;
  }
}
export function authenticateCashFreePayoutCallbacks(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (verifyCashfreeSignature(req.body)) {
    next();
  } else {
    sendError(res, 403, 'Authorization Error');
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function verify(ts: any, rawBody: any) {
  const secretKey = secretStore.getSecret('CASHFREE_CLIENT_SECRET');
  const generated_signature = crypto
    .createHmac('sha256', secretKey)
    .update(ts + rawBody)
    .digest('base64');
  logger.debug('generated signature', generated_signature);
  return generated_signature;
}
export function authenticateCashFreePaymentgatewayCallbacks(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  req: any,
  res: Response,
  next: NextFunction
) {
  logger.debug(
    'raw request body received from cashfree payment gateway callback',
    req.rawBody
  );
  const ts = req.headers['x-webhook-timestamp'];
  const signature = req.headers['x-webhook-signature'];
  if (!ts || !signature) {
    logger.error(
      'cashfree refund callback signature not verified. timestamp or signature is not present in req header'
    );
    sendError(res, 403, 'Authorization Error');
  }
  logger.debug('timestamp from callback headers', ts);

  // const currTs = Math.floor(new Date().getTime() / 1000);
  // if (currTs - ts > 30000) {
  //   res.send('Failed');
  // }

  const generated_signature = verify(ts, req.rawBody);
  logger.debug('signature', signature);
  logger.debug('generated signature', generated_signature);
  if (signature === generated_signature) {
    logger.debug('cashfree payment gateway callback signature verified');
    next();
  } else {
    logger.error('cashfree payment gateway callback signature not verified');
    sendError(res, 403, 'Authorization Error');
  }
}

export function authenticateCashFreeSubscriptionCallbacks(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  req: any,
  res: Response,
  next: NextFunction
) {
  let payload = '';
  const {signature, ...rest} = req.body;

  Object.keys(rest)
    .sort()
    .forEach((key: string) => {
      payload += key + rest[key];
    });

  const generatedSignature = crypto
    .createHmac('sha256', secretStore.getSecret('CASHFREE_CLIENT_SECRET'))
    .update(payload)
    .digest('base64');

  logger.debug('signature', signature);
  logger.debug('generatedSignature', generatedSignature);
  if (signature === generatedSignature) {
    next();
  } else {
    logger.error('failed to verify cashfree subscription callback signature');
    sendError(res, 403, 'Authorization Error');
  }
}

export async function authenticate_petpooja(
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.debug('PETPOOJA_REQUEST_HEADER', req.headers);
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  logger.debug('petpooja request token', token);
  if (process.env.LOCAL_RUN === 'true') {
    next();
    return;
  }
  if (token === secretStore.getSecret('PETPOOJA_CALLBACK_TOKEN')) {
    next();
  } else {
    logger.error(`INVALID PETPOOJA_CALLBACK_TOKEN RECEIVED TOKEN: ${token}`);
    await sendEmail(
      'AdminAlertEmailTemplate',
      await Globals.BACKEND_TEAM_EMAIL.get(),
      {
        subject: 'Petpooja auth failed',
        application_name: Service.FOOD_API,
        error_details: `INVALID PETPOOJA_CALLBACK_TOKEN RECEIVED TOKEN: ${token}`,
        priority: 'high',
        time: new Date().toDateString(),
        meta_details: {
          request_headers: req.headers,
        },
      }
    );
    next();
    // sendError(res, 401, 'Authorization Error');
  }
}
