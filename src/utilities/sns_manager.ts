import logger from './logger/winston_logger';
import {SNSClient, PublishCommand} from '@aws-sdk/client-sns';
import {IES_Restaurant} from '../module/food/restaurant/models';
import {IES_MenuItem} from '../module/food/menu/models';
const snsClient = new SNSClient({region: process.env.AWS_REGION});

export interface BULK_RestaurantSNSMessage {
  event: 'RESTAURANT';
  action: 'BULK_PUT';
  data: IES_Restaurant[];
}
export interface CU_RestaurantSNSMessage {
  event: 'RESTAURANT';
  action: 'PUT';
  data: IES_Restaurant;
}
export interface D_RestaurantSNSMessage {
  event: 'RESTAURANT';
  action: 'DELETE';
  data: {
    id: string;
  };
}
export interface BULK_CreateMenuItemSNSMessage {
  event: 'MENUITEM';
  action: 'BULK_PUT';
  data: {
    ids: number[];
  };
}
export interface BULK_DeleteMenuItemSNSMessage {
  event: 'MENUITEM';
  action: 'BULK_DELETE';
  data: {
    ids: number[];
  };
}
export interface CU_MenuItemSNSMessage {
  event: 'MENUITEM';
  action: 'PUT';
  data: IES_MenuItem;
}
export interface D_MenuItemSNSMessage {
  event: 'MENUITEM';
  action: 'DELETE';
  data: {
    id: number;
  };
}

export type MenuItemSNSMessage =
  | BULK_CreateMenuItemSNSMessage
  | BULK_DeleteMenuItemSNSMessage
  | D_MenuItemSNSMessage
  | CU_MenuItemSNSMessage;
export type RestaurantSNSMessage =
  | CU_RestaurantSNSMessage
  | D_RestaurantSNSMessage
  | BULK_RestaurantSNSMessage;
export type SNSMessage = RestaurantSNSMessage | MenuItemSNSMessage;

export const SNS_URL = {
  ELASTIC_SEARCH_WORKER: '',
};

export async function sendSNSMessage(sqsUrl: string, msg: SNSMessage) {
  try {
    const publishInput = {
      TargetArn: process.env.RESTAURANT_SNS_TOPIC_ARN,
      Message: JSON.stringify(msg),
    };
    const command = new PublishCommand(publishInput);
    const response = await snsClient.send(command);
    logger.debug('', response);
  } catch (error) {
    logger.error('SNS Error', error);
    throw 'SNS Error';
  }
}
