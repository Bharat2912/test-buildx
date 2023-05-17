import logger from './logger/winston_logger';
import {
  SQSClient,
  SendMessageCommand,
  GetQueueUrlCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  SendMessageCommandInput,
} from '@aws-sdk/client-sqs';
import {MenuItemSNSMessage, RestaurantSNSMessage} from './sns_manager';
import {RefundGateway} from '../module/core/payment/enum';
import {
  IDeliveryOrderStatusCBRequest,
  IDeliveryRiderStatusCBRequest,
} from '../module/core/callback/delivery/types';
import {PayoutStatus} from '../module/core/payout/enum';
import {AdminRole, UserType, Service} from '../enum';
import {IFormattedPaymentCallbackResponse} from '../module/core/payment/cashfree/types';
import {IPaymentGroups, IPaymentMethods} from '../module/food/order/types';
import {ExternalPaymentEvent} from '../module/food/order/enums';
import {
  ISubscription,
  ISubscriptionAuthorization,
  ISubscriptionPayment,
} from '../module/core/subscription/types';
import {ICashFreeSubscriptionNewPaymentDetails} from '../module/core/subscription/cashfree/callback_types';

export const SQS_URL = {
  SERVICEABILITY: '',
  CORE_WORKER: '',
  USER_WORKER: '',
  ELASTIC_SEARCH_WORKER: '',
  GROCERY_WORKER: '',
  PHARMACY_WORKER: '',
  RIDER_WORKER: '',
  PICKUP_DROP_WORKER: '',
  NOTIFICATIONS: '',
};

export interface SQSOutgoingMessageOrder {
  event: 'ORDER';
  action: 'UPDATE_REFUND_DETAILS' | 'UPDATE_PAYMENT_DETAILS';
  data: IUpdateOrderRefundDetails['data'] | IFormattedPaymentCallbackResponse;
}
export interface IUpdateOrderRefundDetails {
  event: 'ORDER';
  action: 'UPDATE_REFUND_DETAILS';
  data: {
    refund_id: string;
    order_id: number;
    payment_id: string;
    customer_id: string;
    created_at: Date;
    processed_at?: Date;
    refund_status: string;
    status_description: string;
    refund_gateway: RefundGateway;
    refund_charges: number;
    refund_amount: number;
  };
}

export interface IUpdateOrderPaymentDetails {
  event: 'ORDER';
  action: 'UPDATE_PAYMENT_DETAILS';
  data: {
    data: {
      payment_details: {
        transaction_id: string;
        transaction_amount: number;
        transaction_time: Date;
        payment_currency: string;
        external_payment_id: string;
        payment_status: string;
        payment_message: string;
        bank_reference: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        auth_id: any;
        payment_method_details: IPaymentMethods;
        payment_method: string;
        payment_group: IPaymentGroups;
      };
      customer_details: {
        customer_name: string;
        customer_id: string;
        customer_email: string;
        customer_phone: string;
      };
      error_details?: {
        error_code: string;
        error_description: string;
        error_reason: string;
        error_source: string;
      };
      payment_gateway_details?: {
        gateway_name: string;
        gateway_order_id: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        gateway_payment_id: any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        gateway_status_code: any;
      };
    };
    event_time: string;
    type: ExternalPaymentEvent;
  };
}

export interface SQSIncommingMessageRefund {
  event: 'REFUND';
  action: 'CREATE';
  data: {
    service: string;
    payment_id: string;
    order_id: number;
    customer_id: string;
    refund_gateway: RefundGateway;
    refund_charges: number;
    refund_amount: number;
    refund_currency: string;
    refund_note: string;
    is_pod: boolean;
  };
}
export interface ISubscriptionAuthStatus {
  subscription: ISubscription;
  subscription_authorization_details: ISubscriptionAuthorization;
}

export interface ISubscriptionStatus {
  subscription: ISubscription;
}

export interface ISubscriptionAndSubscriptionPayment {
  subscription: ISubscription;
  subscription_payment: ISubscriptionPayment;
}
export interface IRecalculateTrendingRestaurantsAction {
  event: 'TRENDING_RESTAURANTS';
  action: 'RECALCULATE';
  data: {
    city_id: string;
  };
}

export interface IVerifySubscriptionNewPayment {
  callback_data: ICashFreeSubscriptionNewPaymentDetails;
  subscription: ISubscription;
  attempt: number;
}
export interface ISubscriptionActions {
  event: 'SUBSCRIPTION';
  action:
    | 'SUBSCRIPTION_STATUS_CHANGE'
    | 'SUBSCRIPTION_PAYMENT_DECLINED'
    | 'SUBSCRIPTION_NEW_PAYMENT'
    | 'VERIFY_SUBSCRIPTION_NEW_PAYMENT'
    | 'SUBSCRIPTION_AUTH_STATUS';
  data:
    | ISubscriptionAuthStatus
    | ISubscriptionStatus
    | ISubscriptionAndSubscriptionPayment
    | IVerifySubscriptionNewPayment;
}

export interface SQSIncommingMessageNewOrder {
  event: 'NEW_ORDER';
  action: 'DELAYED_NOTIFICATION';
  data: {
    order_id: number;
    attempt: number;
  };
}
export interface SQSIncommingMessageGeohash {
  event: 'RESTAURANT' | 'POLYGON' | 'NEW_ORDER';
  action: 'GEOHASH' | 'DELAYED';
  data: {
    id: string;
    status?: 'success' | 'failed' | 'geohashFailed' | 'active';
  };
}
export interface ISQSPayout {
  event: 'PAYOUT';
  action: 'UPDATE';
  data: {
    transfer_id: string;
    payout_status: PayoutStatus;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    additional_details: any;
    payout_completed_time?: Date;
  };
}

export type SQSIncommingMessage =
  | SQSIncommingMessageGeohash
  | SQSIncommingMessageNewOrder
  | ISQSPayout
  | SQSIncommingMessageRefund
  | IUpdateOrderPaymentDetails
  | IUpdateOrderRefundDetails
  | ISubscriptionActions
  | IRecalculateTrendingRestaurantsAction;

export interface RestaurantSQSMessage {
  event: 'RESTAURANT';
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  data: {
    id: string;
    coordinate?: number[];
  };
}

export interface PolygonSQSMessage {
  event: 'POLYGON';
  action: 'CREATE' | 'DELETE';
  data: {
    id: string;
    coordinates?: number[][];
  };
}

export interface VendorSQSMessage {
  event: 'VENDOR';
  action: 'LOGIN';
  data: {
    outlet_id: string;
    outlet_name: string;
    type: 'restaurant';
    vendor_details: {
      role: string;
      email: string;
      phone: string;
      name: string;
    };
  };
}

export interface IRestaurantRejection {
  event: 'EMAIL';
  action: 'SINGLE';
  data: object;
}
export interface IWebSocketSQSMessage {
  event: 'WS';
  action:
    | 'MESSAGE'
    | 'ORDER_PLACED'
    | 'VENDOR_ORDER_ACCEPTED'
    | 'VENDOR_ORDER_REJECTED'
    | 'VENDOR_ORDER_READY'
    | 'DELIVERY_ORDER_STATUS'
    | 'DELIVERY_RIDER_STATUS'
    | 'ORDER_CANCELLED';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

export interface IEmailSQSMessage {
  event: 'EMAIL';
  action: 'SINGLE';
  data: object;
}
export interface IPushNotificationData {
  templateID: string;
  templateData: object;
  userType: UserType;
}
export interface IPushNotificationToUserData extends IPushNotificationData {
  userID: string;
}
export interface IPushNotificationToUsersData extends IPushNotificationData {
  userID: string[];
}
export interface ITopicPushNotificationData extends IPushNotificationData {
  topics: AdminRole[];
  userType: UserType.ADMIN;
}
export interface IFCMSQSMessage {
  event: 'PUSH_NOTIFICATIONS';
  retry_count?: number;
}
export interface ITopicFCMSQSMessage extends IFCMSQSMessage {
  action: 'TOPIC';
  data: ITopicPushNotificationData;
}
export interface IUserFCMSQSMessage extends IFCMSQSMessage {
  action: 'SINGLE';
  data: IPushNotificationToUserData;
}
export interface IUsersFCMSQSMessage extends IFCMSQSMessage {
  action: 'BULK';
  data: IPushNotificationToUsersData;
}

export type IPushNotificationsSQSMessage =
  | ITopicFCMSQSMessage
  | IUserFCMSQSMessage
  | IUsersFCMSQSMessage;

export interface IChannelNotificationMessage {
  event: 'CHANNELS';
  action: number;
  data: (
    | IWebSocketSQSMessage
    | IPushNotificationsSQSMessage
    | IEmailSQSMessage
  )[];
}

export interface ISQSMessage_SMS {
  event: 'SMS';
  action: 'SINGLE';
  data: {
    receiverNumber: string;
    data: object;
    templateName: string;
  };
}
export interface ISQSMessage_OrderStatus {
  event: 'DELIVERY';
  action: 'ORDER_STATUS_UPDATE';
  data: IDeliveryOrderStatusCBRequest;
}
export interface ISQSMessage_RiderStatus {
  event: 'DELIVERY';
  action: 'RIDER_STATUS_UPDATE';
  data: IDeliveryRiderStatusCBRequest;
}

export type SQSMessage =
  | ISQSMessage_RiderStatus
  | ISQSMessage_OrderStatus
  | SQSOutgoingMessageOrder
  | SQSIncommingMessage
  | RestaurantSQSMessage
  | PolygonSQSMessage
  | VendorSQSMessage
  | RestaurantSNSMessage
  | MenuItemSNSMessage
  | IRestaurantRejection
  | IWebSocketSQSMessage
  | IPushNotificationsSQSMessage
  | IChannelNotificationMessage
  | ISQSMessage_SMS
  | ISQSPayout;

//additional common properties
export type SQSMessageWithAdditionalProperties = SQSMessage & {
  service_name: Service.FOOD_API;
};

let sqsClient = new SQSClient({
  region: process.env.AWS_REGION,
});
if (process.env.LOCAL_RUN) {
  sqsClient = new SQSClient({
    region: process.env.AWS_REGION,
    endpoint: process.env.LOCALSTACK_DYNAMODB_ENDPOINT,
  });
}
async function getQueueURL(queueName?: string) {
  try {
    const command = new GetQueueUrlCommand({
      QueueName: queueName,
    });
    const response = await sqsClient.send(command);
    if (response.QueueUrl) {
      logger.info('SQS Url fetched');
      return response.QueueUrl;
    } else {
      throw 'SQS URL Error';
    }
  } catch (error) {
    logger.error(`Get AWS SQS Queue URL Error, queue name: ${queueName}`);
    throw error;
  }
}

export async function initSQS() {
  SQS_URL.GROCERY_WORKER = await getQueueURL(
    process.env.GROCERY_WORKER_SQS_NAME
  );
  SQS_URL.PHARMACY_WORKER = await getQueueURL(
    process.env.PHARMACY_WORKER_SQS_NAME
  );
  SQS_URL.RIDER_WORKER = await getQueueURL(process.env.RIDER_WORKER_SQS_NAME);
  SQS_URL.CORE_WORKER = await getQueueURL(process.env.CORE_WORKER_SQS_NAME);
  SQS_URL.USER_WORKER = await getQueueURL(process.env.USER_WORKER_SQS_NAME);
  SQS_URL.ELASTIC_SEARCH_WORKER = await getQueueURL(
    process.env.ELASTIC_SEARCH_WORKER_SQS_NAME
  );
  SQS_URL.NOTIFICATIONS = await getQueueURL(process.env.NOTIFICATION_SQS_NAME);
  SQS_URL.PICKUP_DROP_WORKER = await getQueueURL(
    process.env.PICKUP_DROP_WORKER_SQS_NAME
  );
}

export async function sendSQSMessage(
  sqsUrl: string,
  msg: SQSMessage,
  delaySeconds?: number
) {
  const message = msg as SQSMessageWithAdditionalProperties;
  try {
    message.service_name = Service.FOOD_API;
    const SendSqsMsgObject: SendMessageCommandInput = {
      QueueUrl: sqsUrl,
      MessageBody: '',
      MessageAttributes: {
        env: {
          StringValue: process.env.NODE_ENV,
          DataType: 'String',
        },
      },
    };
    logger.debug('event initiated :- ', message.event);
    if (delaySeconds && delaySeconds > 2) {
      delaySeconds = Math.floor(delaySeconds);
      logger.debug(
        `SQS_MESSAGE_DELAY: ${delaySeconds} ON_EVENT:${message.event}`
      );
      SendSqsMsgObject.DelaySeconds = delaySeconds;
    }
    SendSqsMsgObject.MessageBody = JSON.stringify(message);
    const command = new SendMessageCommand(SendSqsMsgObject);
    const response = await sqsClient.send(command);
    return response;
  } catch (error) {
    logger.debug('Sqs send Error!! ', message);
    logger.error('Sqs send Error!! ', error);
    throw 'Sqs send Error!! ';
  }
}

export async function readSQSMessage(sqsUrl: string) {
  try {
    const readSqsMsgObject = {
      QueueUrl: sqsUrl,
      MaxNumberOfMessages: +(process.env.SQS_READ_MSG_COUNT || 10),
      WaitTimeSeconds: +(process.env.SQS_WAIT_TIME_IN_SECONDS || 20),
    };
    const command = new ReceiveMessageCommand(readSqsMsgObject);
    const response = await sqsClient.send(command);
    return response.Messages;
  } catch (error) {
    logger.error('Sqs read Error', error);
    throw 'Sqs read Error!! ';
  }
}

export async function deleteSQSMessage(sqsUrl: string, receiptHandle: string) {
  try {
    const deleteSqsMsgObject = {
      QueueUrl: sqsUrl,
      ReceiptHandle: receiptHandle,
    };
    const command = new DeleteMessageCommand(deleteSqsMsgObject);
    const response = await sqsClient.send(command);
    logger.debug('Deleted SQS Message');
    return response;
  } catch (error) {
    logger.error('Sqs delete Error!! ', error);
    throw 'Sqs delete Error!! ';
  }
}

// export interface SQSMessagex {
//   event: 'RESTAURANT' | 'POLYGON' | 'VENDOR';
//   action: 'CREATE' | 'UPDATE' | 'DELETE' | 'GEOHASH' | 'LOGIN';
//   data: {
//     id: string;
//     coordinates?: number[][];
//     coordinate?: string | number[];
//     status?: 'success' | 'failed' | 'geohashFailed' | 'active';
//     name: string;
//   };
// }
// "x": {
//   "$metadata": {
//     "httpStatusCode": 200,
//     "requestId": "",
//     "attempts": 1,
//     "totalRetryDelay": 0
//   },
//   "Messages": [
//     {
//       "MessageId": "",
//       "ReceiptHandle": "",
//       "MD5OfBody": "",
//       "Body": "{\"event\":\"POLYGON\",\"action\":\"CREATE\",\"data\":{\"id\":\"0a\",\"coordinates\":[]}}"
//        MD5OfMessageAttributes: '',
//        MessageAttributes: {env: {StringValue: 'asdf', DataType: 'String'}}
//     }
//   ]
// }
