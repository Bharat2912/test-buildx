import {dynamoDocClient} from '../../../utilities/dynamodb_manager';
import logger from '../../../utilities/logger/winston_logger';
import constants from './constants';
import Joi from 'joi';
import {ICartResponse, IGetCart} from './types';
import {v4 as uuidv4} from 'uuid';
import {GetCommand, PutCommand} from '@aws-sdk/lib-dynamodb';
import {joi_restaurant_id} from '../../../utilities/joi_common';

//dynamoDB functions

export async function getCartByUserID(cart: IGetCart) {
  try {
    const response = await dynamoDocClient.send(
      new GetCommand({
        Key: {
          PK: `#${constants.UserType}#${cart.customer_id}`,
          SK: constants.ColumnNames.Sk,
        },
        TableName: constants.TableName,
      })
    );
    if (response.$metadata.httpStatusCode === 200) {
      if (response.Item?.CART_DATA) {
        return response.Item.CART_DATA;
      } else return {};
    } else throw new Error('error fetching cart for user:' + cart.customer_id);
  } catch (error) {
    logger.error(
      `FAILED WHILE FETCHING USER CART FROM DYNAMODB ERROR: ${error}`
    );
    throw error;
  }
}

export async function putCartByUserId(
  customer_id: string,
  cart: ICartResponse
) {
  try {
    if (Object.keys(cart).length > 0) cart.cart_id = uuidv4();
    const response = await dynamoDocClient.send(
      new PutCommand({
        TableName: constants.TableName,
        Item: {
          PK: `#${constants.UserType}#${customer_id}`,
          SK: constants.ColumnNames.Sk,
          CART_DATA: cart,
        },
      })
    );

    if (response.$metadata.httpStatusCode === 200) return cart;
    else throw new Error('error updating cart for user:' + cart);
  } catch (error) {
    logger.error(`FAILED WHILE UPDATING USER CART IN DYNAMODB ERROR: ${error}`);
    throw error;
  }
}

//Joi validations

export const id = Joi.string()
  .guid({version: ['uuidv4', 'uuidv5']})
  .required();

const addon = Joi.number().required();

const addon_group = Joi.object({
  addon_group_id: Joi.number().required(),
  addons: Joi.array().items(addon).required(),
});

const variant_group = Joi.object({
  variant_group_id: Joi.number().required(),
  variant_id: Joi.number().required(),
});

const menuItems = Joi.object({
  quantity: Joi.number().min(1).integer().required(),
  menu_item_id: Joi.number().required(),
  variant_groups: Joi.array().items(variant_group),
  addon_groups: Joi.array().items(addon_group),
});

export const put_cart = Joi.object({
  action: Joi.string().min(2).max(10).required(),
  customer_id: id,
  customer_device_id: Joi.string().min(16).max(50),
  customer_address_id: Joi.string()
    .guid({version: ['uuidv4', 'uuidv5']})
    .allow(''),
  restaurant_id: joi_restaurant_id,
  any_special_request: Joi.string().max(255).allow(''),
  coupon_code: Joi.string().allow(''),
  coupon_id: Joi.number(),
  menu_items: Joi.array().items(menuItems),
});
