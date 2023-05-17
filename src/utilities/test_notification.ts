import {Request, Response} from 'express';
import {sendError, sendSuccess} from './controllers/handle_response';
import handleErrors from './controllers/handle_errors';
import logger from './logger/winston_logger';
import {
  IPushNotificationsSQSMessage,
  sendSQSMessage,
  SQS_URL,
} from './sqs_manager';
import Joi from 'joi';
import {AdminRole, UserType} from '../enum';

export const verify_push_data = Joi.object({
  templet: Joi.string().min(5).required(),
  data: Joi.object().min(1).required(),
});
export const verify_role_push_data = Joi.object({
  templet: Joi.string().min(5).required(),
  data: Joi.object().min(1).required(),
  role: Joi.string()
    .valid(AdminRole.ADMIN, AdminRole.CATALOG, AdminRole.SERVICEABILITY)
    .required(),
});
export async function sendTestPushNotification(req: Request, res: Response) {
  try {
    const validation = verify_push_data.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = validation.value;

    // let userType = '';
    // if (req.user.user_type === 'customer') userType = 'customer';
    // else if (req.user.user_type === 'vendor') userType = 'vendor';
    // else {
    //   return sendError(res, 400, [
    //     {
    //       message: 'user must be vendor or customer',
    //       code: 1092,
    //     },
    //   ]);
    // }

    const push_msg: IPushNotificationsSQSMessage = {
      event: 'PUSH_NOTIFICATIONS',
      action: 'SINGLE',
      data: {
        templateID: validated_req.templet,
        templateData: validated_req.data,
        userID: req.user.id,
        userType: req.user.user_type as UserType,
      },
    };
    await sendSQSMessage(SQS_URL.NOTIFICATIONS, push_msg);
    return sendSuccess(res, 200, {success: true});
  } catch (error) {
    logger.error('FAILED WHILE FETCHING CUSTOMER ORDERS', error);
    return handleErrors(res, error);
  }
}

export async function sendTestRolePushNotification(
  req: Request,
  res: Response
) {
  try {
    const validation = verify_role_push_data.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = validation.value;

    await sendSQSMessage(SQS_URL.NOTIFICATIONS, {
      event: 'PUSH_NOTIFICATIONS',
      action: 'TOPIC',
      data: {
        templateID: validated_req.templet,
        templateData: validated_req.data,
        topics: [validated_req.role],
        userType: UserType.ADMIN,
      },
    });
    return sendSuccess(res, 200, {success: true});
  } catch (error) {
    logger.error('FAILED WHILE FETCHING CUSTOMER ORDERS', error);
    return handleErrors(res, error);
  }
}
