/* eslint-disable @typescript-eslint/no-explicit-any */
import request from 'supertest';
import {createTestServer} from './utils/init';
import {Application} from 'express';
import {
  cartResponse,
  menuItemWithNoVariantsAddons,
} from './utils/mock_responses';
import {
  mockCartServiceabilityWithValidResponse,
  mockGetCustomerDetails,
  mockGetRestaurantVendors,
  mockCashfreeTrascationSuccessfullResponse,
  mockPostServiceableAddress,
  mockSendSQSMessage,
  mockGetTransactionToken,
} from './utils/mock_services';
import {
  createTableDynamoDB,
  signToken,
  loadMockSeedData,
  dropTableDynamoDB,
  testCasesClosingTasks,
} from './utils/utils';
import {DB} from '../data/knex';
import logger from '../utilities/logger/winston_logger';
import {ICartResponse} from '../module/food/cart/types';
jest.mock('axios');

let server: Application;
let customer_token: string;

beforeAll(async () => {
  server = await createTestServer();

  await createTableDynamoDB('user');
  await loadMockSeedData('restaurant');
  await loadMockSeedData('time_slot');
  await loadMockSeedData('restaurant_menu');
  await loadMockSeedData('subscription');
  await loadMockSeedData('cart');
  logger.info('Jest DataBase Connection Created');
  customer_token = signToken({
    id: '33c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
    user_type: 'customer',
  });
});

afterAll(async () => {
  await testCasesClosingTasks();
  await dropTableDynamoDB('user');
});

let Order_Details: ICartResponse;

describe('Cart APIs Testing', () => {
  describe('Auth Token validation', () => {
    test('unauthorized 401 status code if user token not provided', async () => {
      const response = await request(server).get('/food/cart');
      expect(response.statusCode).toBe(401);
    });

    test('unauthorized 401 status code if user token not provided', async () => {
      const response = await request(server).put('/food/cart').send({});
      expect(response.statusCode).toBe(401);
    });
  });

  describe('If cart is empty then GET /food/cart will return empty i.e {}', () => {
    test('updating empty cart', async () => {
      const response = await request(server)
        .put('/food/cart')
        .set('Authorization', `Bearer ${customer_token}`)
        .send({
          action: 'UPDATE',
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.result).toStrictEqual({});
    });

    test('get user cart empty', async () => {
      const response = await request(server)
        .get('/food/cart')
        .set('Authorization', `Bearer ${customer_token}`);
      expect(response.statusCode).toBe(200);
      expect(response.body.result).toStrictEqual({});
    });
  });

  describe('Update cart with valid data and GET /food/cart will return updated data', () => {
    test('put user cart with valid request body', async () => {
      mockCartServiceabilityWithValidResponse();
      const response = await request(server)
        .put('/food/cart')
        .set('Authorization', `Bearer ${customer_token}`)
        .send({
          action: 'UPDATE',
          customer_device_id: '12412423432424413213123',
          customer_address_id: 'bd7e895f-0f7d-4dbe-9408-285abf5986ce',
          restaurant_id: 'b0909e52-a731-4665-a791-ee6479008805',
          menu_items: [
            {
              quantity: 1,
              menu_item_id: 11101,
              variant_groups: [
                {
                  variant_group_id: 98,
                  variant_id: 998,
                },
                {
                  variant_group_id: 99,
                  variant_id: 999,
                },
              ],
              addon_groups: [
                {
                  addon_group_id: 77,
                  addons: [7767, 7768],
                },
              ],
            },
          ],
          any_special_request: 'Dont ring door bell',
        });
      expect(response.statusCode).toBe(200);
      expect(response.body.result).not.toEqual({});
      delete response.body.result.restaurant_details.availability.closing_at;
      delete response.body.result.last_updated_at;
      expect(response.body.result).toMatchObject(cartResponse);
      expect(response.body.result.cart_status).not.toBe(false);
    });

    test('get user cart', async () => {
      mockCartServiceabilityWithValidResponse();
      const response = await request(server)
        .get('/food/cart')
        .set('Authorization', `Bearer ${customer_token}`);
      expect(response.statusCode).toBe(200);
      expect(response.body.result).not.toEqual({});
      expect(response.body.result).toMatchObject(cartResponse);
    });
  });

  describe('PUT /food/cart validation checks', () => {
    test('throw invalid action if provided invalid action name', async () => {
      const response = await request(server)
        .put('/food/cart')
        .set('Authorization', `Bearer ${customer_token}`)
        .send({
          action: 'invalid',
          customer_device_id: '12412423432424413213123',
          customer_address_id: 'bd7e895f-0f7d-4dbe-9408-285abf5986ce',
          restaurant_id: 'b0909e52-a731-4665-a791-ee6479008805',
          menu_items: [
            {
              quantity: 1,
              menu_item_id: 11101,
              variant_groups: [
                {
                  variant_group_id: 123,
                  variant_id: 998,
                },
                {
                  variant_group_id: 99,
                  variant_id: 999,
                },
              ],
            },
          ],
        });
      expect(response.statusCode).toBe(400);
      expect(response.body.errors).toStrictEqual([
        {message: 'invalid_cart_action', code: 1028},
      ]);
    });

    describe('Menu Item checks', () => {
      test('updating cart with menu item which has no variants and addons', async () => {
        mockCartServiceabilityWithValidResponse();
        const response = await request(server)
          .put('/food/cart')
          .set('Authorization', `Bearer ${customer_token}`)
          .send({
            action: 'UPDATE',
            restaurant_id: 'b0909e52-a731-4665-a791-ee6479008805',
            customer_address_id: 'bd7e895f-0f7d-4dbe-9408-285abf5986ce',
            menu_items: [
              {
                quantity: 1,
                menu_item_id: 11102,
                variant_groups: [],
                addon_groups: [],
              },
            ],
          });
        expect(response.statusCode).toBe(200);
        expect(response.body.result).not.toEqual({});
        delete response.body.result.restaurant_details.availability.closing_at;
        delete response.body.result.last_updated_at;
        expect(response.body.result).toMatchObject(
          menuItemWithNoVariantsAddons
        );
        expect(response.body.result.cart_status).not.toBe(false);
      });
    });

    describe('Variants Checks', () => {
      test('Trying to update menu item with missing variants throws error', async () => {
        const response = await request(server)
          .put('/food/cart')
          .set('Authorization', `Bearer ${customer_token}`)
          .send({
            action: 'UPDATE',
            customer_device_id: '12412423432424413213123',
            customer_address_id: 'bd7e895f-0f7d-4dbe-9408-285abf5986ce',
            restaurant_id: 'b0909e52-a731-4665-a791-ee6479008805',
            menu_items: [
              {
                quantity: 1,
                menu_item_id: 11101,
                variant_groups: [
                  {
                    variant_group_id: 98,
                    variant_id: 998,
                  },
                ],
              },
            ],
          });
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toStrictEqual([
          {
            message: 'Please select all variants for Veg Burger',
            code: 1008,
          },
        ]);
      });

      test('Invalid variant group id throws error', async () => {
        const response = await request(server)
          .put('/food/cart')
          .set('Authorization', `Bearer ${customer_token}`)
          .send({
            action: 'UPDATE',
            customer_device_id: '12412423432424413213123',
            customer_address_id: 'bd7e895f-0f7d-4dbe-9408-285abf5986ce',
            restaurant_id: 'b0909e52-a731-4665-a791-ee6479008805',
            menu_items: [
              {
                quantity: 1,
                menu_item_id: 11101,
                variant_groups: [
                  {
                    variant_group_id: 123,
                    variant_id: 998,
                  },
                  {
                    variant_group_id: 99,
                    variant_id: 999,
                  },
                ],
              },
            ],
          });
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toStrictEqual([
          {message: 'invalid_variant_group_id_123', code: 1013},
        ]);
      });

      test('Invalid variant id throws error', async () => {
        const response = await request(server)
          .put('/food/cart')
          .set('Authorization', `Bearer ${customer_token}`)
          .send({
            action: 'UPDATE',
            customer_device_id: '12412423432424413213123',
            customer_address_id: 'bd7e895f-0f7d-4dbe-9408-285abf5986ce',
            restaurant_id: 'b0909e52-a731-4665-a791-ee6479008805',
            menu_items: [
              {
                quantity: 1,
                menu_item_id: 11101,
                variant_groups: [
                  {
                    variant_group_id: 98,
                    variant_id: 123,
                  },
                  {
                    variant_group_id: 99,
                    variant_id: 999,
                  },
                ],
              },
            ],
          });
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toStrictEqual([
          {
            message: 'invalid_variant_id_123_of_group_id_98',
            code: 1012,
          },
        ]);
      });
    });

    describe('Addons Checks', () => {
      test('Invalid addon group id throws error', async () => {
        const response = await request(server)
          .put('/food/cart')
          .set('Authorization', `Bearer ${customer_token}`)
          .send({
            action: 'UPDATE',
            restaurant_id: 'b0909e52-a731-4665-a791-ee6479008805',
            menu_items: [
              {
                quantity: 1,
                menu_item_id: 11101,
                variant_groups: [
                  {
                    variant_group_id: 98,
                    variant_id: 998,
                  },
                  {
                    variant_group_id: 99,
                    variant_id: 999,
                  },
                ],
                addon_groups: [
                  {
                    addon_group_id: 123,
                    addons: [7767],
                  },
                ],
              },
            ],
          });
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toStrictEqual([
          {message: 'addon_group_id_123_is_invalid', code: 1024},
        ]);
      });

      test('Invalid addon id throws error', async () => {
        const response = await request(server)
          .put('/food/cart')
          .set('Authorization', `Bearer ${customer_token}`)
          .send({
            action: 'UPDATE',
            restaurant_id: 'b0909e52-a731-4665-a791-ee6479008805',
            menu_items: [
              {
                quantity: 1,
                menu_item_id: 11101,
                variant_groups: [
                  {
                    variant_group_id: 98,
                    variant_id: 998,
                  },
                  {
                    variant_group_id: 99,
                    variant_id: 999,
                  },
                ],
                addon_groups: [
                  {
                    addon_group_id: 77,
                    addons: [7767, 312],
                  },
                ],
              },
            ],
          });

        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toStrictEqual([
          {
            message: 'addon_group_id_77_contains_invalid_addon_id_312',
            code: 1021,
          },
        ]);
      });

      test('If addons are more than addons max limit then throw error', async () => {
        const response = await request(server)
          .put('/food/cart')
          .set('Authorization', `Bearer ${customer_token}`)
          .send({
            action: 'UPDATE',
            restaurant_id: 'b0909e52-a731-4665-a791-ee6479008805',
            menu_items: [
              {
                quantity: 1,
                menu_item_id: 11101,
                variant_groups: [
                  {
                    variant_group_id: 98,
                    variant_id: 998,
                  },
                  {
                    variant_group_id: 99,
                    variant_id: 999,
                  },
                ],
                addon_groups: [
                  {
                    addon_group_id: 77,
                    addons: [7767, 7768, 7769, 7770],
                  },
                ],
              },
            ],
          });
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toStrictEqual([
          {
            message: 'addon group name limit can not exceed 3',
            code: 1023,
          },
        ]);
      });

      test('If addons are less than addons min limit then throw error', async () => {
        const response = await request(server)
          .put('/food/cart')
          .set('Authorization', `Bearer ${customer_token}`)
          .send({
            action: 'UPDATE',
            restaurant_id: 'b0909e52-a731-4665-a791-ee6479008805',
            menu_items: [
              {
                quantity: 1,
                menu_item_id: 11101,
                variant_groups: [
                  {
                    variant_group_id: 98,
                    variant_id: 998,
                  },
                  {
                    variant_group_id: 99,
                    variant_id: 999,
                  },
                ],
                addon_groups: [
                  {
                    addon_group_id: 77,
                    addons: [7767],
                  },
                ],
              },
            ],
          });
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toStrictEqual([
          {
            message: 'minimum 2 addons of addon group name should be selected',
            code: 1022,
          },
        ]);
      });
    });

    describe('Subscription check', () => {
      test('throw cart meta error if subscription of restaurant is not active', async () => {
        mockCartServiceabilityWithValidResponse();
        const response = await request(server)
          .put('/food/cart')
          .set('Authorization', `Bearer ${customer_token}`)
          .send({
            action: 'UPDATE',
            restaurant_id: '609a460e-6316-417e-9e87-836bfbcded0f',
            customer_address_id: 'bd7e895f-0f7d-4dbe-9408-285abf5986ce',
            menu_items: [
              {
                quantity: 1,
                menu_item_id: 13101,
                variant_groups: [],
                addon_groups: [],
              },
            ],
          });
        expect(response.body.result.cart_status).toBe(false);
        expect(response.body.result.cart_meta_errors).toStrictEqual([
          {code: 2011, message: 'restaurant is not active'},
        ]);
      });
    });

    describe('Total menu items in cart is greater than 100', () => {
      test('throw cart meta error if total order item count is greater than 100', async () => {
        mockCartServiceabilityWithValidResponse();
        const response = await request(server)
          .put('/food/cart')
          .set('Authorization', `Bearer ${customer_token}`)
          .send({
            action: 'UPDATE',
            restaurant_id: 'b0909e52-a731-4665-a791-ee6479008805',
            customer_address_id: 'bd7e895f-0f7d-4dbe-9408-285abf5986ce',
            menu_items: [
              {
                quantity: 50,
                menu_item_id: 11102,
                variant_groups: [],
                addon_groups: [],
              },
              {
                quantity: 51,
                menu_item_id: 11101,
                variant_groups: [
                  {
                    variant_group_id: 98,
                    variant_id: 998,
                  },
                  {
                    variant_group_id: 99,
                    variant_id: 999,
                  },
                ],
                addon_groups: [
                  {
                    addon_group_id: 77,
                    addons: [7767, 7768],
                  },
                ],
              },
            ],
          });
        expect(response.body.status).toBe(true);
        expect(response.body.statusCode).toBe(200);
        expect(response.body.result.cart_meta_errors).toStrictEqual([
          {
            message:
              'Requested quantity is higher than the maximum allowed quantity of 100',
            code: 2018,
          },
        ]);
      });
    });

    describe('Zero Items in cart', () => {
      test('create empty cart if menu_items key is empty array | place order | throw error', async () => {
        /*EMPTY CART*/
        mockCartServiceabilityWithValidResponse();
        const create_empty_cart = await request(server)
          .put('/food/cart')
          .set('Authorization', `Bearer ${customer_token}`)
          .send({
            action: 'UPDATE',
            restaurant_id: 'b0909e52-a731-4665-a791-ee6479008805',
            customer_address_id: 'bd7e895f-0f7d-4dbe-9408-285abf5986ce',
            menu_items: [],
          });
        expect(create_empty_cart.body.status).toBe(true);
        expect(create_empty_cart.body.statusCode).toBe(200);
        expect(create_empty_cart.body.result).toStrictEqual({});
        /*PLACE ORDER WITH EMPTY CART*/
        const place_order = await request(server)
          .post('/food/order/place_order')
          .set('Authorization', `Bearer ${customer_token}`)
          .send({is_pod: true});

        expect(place_order.body.status).toBe(false);
        expect(place_order.body.statusCode).toBe(400);
        expect(place_order.body.errors).toStrictEqual([
          {
            message: 'failed to place order cart is empty',
            code: 1045,
          },
        ]);
      });
    });
  });
});

const customerId = '33c6fdbc-8df6-4541-9d3f-f9e5ba4c0242';

describe('Scenerios', () => {
  describe('If customer applies an expired coupon it should throw error{cart_meta_errors} | ', () => {
    test('Adding items in Cart with Expired-Coupon', async () => {
      mockCartServiceabilityWithValidResponse();
      const response = await request(server)
        .put('/food/cart')
        .set('Authorization', `Bearer ${customer_token}`)
        .send({
          action: 'UPDATE',
          customer_device_id: '12412423432424413213123',
          customer_address_id: 'bd7e895f-0f7d-4dbe-9408-285abf5986ce',
          restaurant_id: 'b0909e52-a731-4665-a791-ee6479008805',
          menu_items: [
            {
              quantity: 1,
              menu_item_id: 11101,
              variant_groups: [
                {
                  variant_group_id: 98,
                  variant_id: 998,
                },
                {
                  variant_group_id: 99,
                  variant_id: 999,
                },
              ],
              addon_groups: [
                {
                  addon_group_id: 77,
                  addons: [7767, 7768],
                },
              ],
            },
          ],
          any_special_request: 'Dont ring door bell',
          coupon_code: 'EXPIRED-COUPON',
        });
      expect(response.statusCode).toBe(200);
      expect(response.body.result).not.toEqual({});
      expect(response.body.result.cart_meta_errors).toStrictEqual([
        {message: 'invalid_coupon', code: 1052},
      ]);
    });
  });
  describe('Check discount value of coupon and check if that discount is being applied on cart items or not', () => {
    test('Applying valid Items with Valid Coupon', async () => {
      mockCartServiceabilityWithValidResponse();
      const response = await request(server)
        .put('/food/cart')
        .set('Authorization', `Bearer ${customer_token}`)
        .send({
          action: 'UPDATE',
          customer_device_id: '12412423432424413213123',
          customer_address_id: 'bd7e895f-0f7d-4dbe-9408-285abf5986ce',
          restaurant_id: 'b0909e52-a731-4665-a791-ee6479008805',
          menu_items: [
            {
              quantity: 1,
              menu_item_id: 11101,
              variant_groups: [
                {
                  variant_group_id: 98,
                  variant_id: 998,
                },
                {
                  variant_group_id: 99,
                  variant_id: 999,
                },
              ],
              addon_groups: [
                {
                  addon_group_id: 77,
                  addons: [7767, 7768],
                },
              ],
            },
          ],
          any_special_request: 'Dont ring door bell',
          coupon_code: '20%OFF-COUPON',
        });
      expect(response.statusCode).toBe(200);
      expect(response.body.result).not.toEqual({});
      expect(response.body.result.cart_status).not.toBe(false);
      //coupon is created Speedyy Admin so cost bearer will be speedyy.
      expect(
        response.body.result.invoice_breakout.coupon_details
          .discount_share_percentage_vendor
      ).toBe(0);
      expect(
        response.body.result.invoice_breakout.coupon_details
          .discount_share_percentage_speedyy
      ).toBe(100);
      expect(response.body.result.invoice_breakout.total_food_cost);

      const total_food_cost =
        response.body.result.invoice_breakout.total_food_cost;
      const coupon_discount_amount =
        response.body.result.invoice_breakout.coupon_details
          .discount_amount_applied;
      const coupon_discount_percentage =
        response.body.result.invoice_breakout.coupon_details
          .discount_percentage;
      const total_tax = response.body.result.invoice_breakout.total_tax;
      const packing_charges =
        response.body.result.invoice_breakout.total_packing_charges;
      const food_cost_before_coupon =
        total_food_cost + total_tax + packing_charges;

      const food_cost_after_coupon =
        (food_cost_before_coupon / 100) * coupon_discount_percentage;

      expect(Math.floor(food_cost_after_coupon)).toBe(
        Math.floor(coupon_discount_amount)
      );
    });
  });
  describe('In cart try to add a Restaurant 1 coupon for Restaurant 2 menu items, it should throw error', () => {
    test('Customer is Applying Coupon of Subway in Burger king Restaurant |  Need to Throw Error of Coupon is not Applicable to this restaurant', async () => {
      mockCartServiceabilityWithValidResponse();
      const response = await request(server)
        .put('/food/cart')
        .set('Authorization', `Bearer ${customer_token}`)
        .send({
          action: 'UPDATE',
          customer_device_id: '12412423432424413213123',
          customer_address_id: 'bd7e895f-0f7d-4dbe-9408-285abf5986ce',
          restaurant_id: 'b0909e52-a731-4665-a791-ee6479008805',
          menu_items: [
            {
              quantity: 1,
              menu_item_id: 11101,
              variant_groups: [
                {
                  variant_group_id: 98,
                  variant_id: 998,
                },
                {
                  variant_group_id: 99,
                  variant_id: 999,
                },
              ],
              addon_groups: [
                {
                  addon_group_id: 77,
                  addons: [7767, 7768],
                },
              ],
            },
          ],
          any_special_request: 'Dont ring door bell',
          coupon_code: 'RES-LEVEL-COUPON',
        });
      expect(response.statusCode).toBe(200);
      expect(response.body.result).not.toEqual({});
      expect(response.body.result.cart_meta_errors).toStrictEqual([
        {message: 'coupon_not_applicable_to_this_restaurant', code: 1072},
      ]);
    });
  });
  describe('While applying coupons check if cart items fulfil all coupon criteria like minimum order value', () => {
    test('Current order value is 50 rs && Apllying Coupon whose minimum order value is 100rs. | Coupon_Discount_Applied to be 0. ', async () => {
      mockCartServiceabilityWithValidResponse();
      const response = await request(server)
        .put('/food/cart')
        .set('Authorization', `Bearer ${customer_token}`)
        .send({
          action: 'UPDATE',
          customer_device_id: '12412423432424413213123',
          customer_address_id: 'bd7e895f-0f7d-4dbe-9408-285abf5986ce',
          restaurant_id: 'b0909e52-a731-4665-a791-ee6479008805',
          menu_items: [
            {
              quantity: 1,
              menu_item_id: 11101,
              variant_groups: [
                {
                  variant_group_id: 98,
                  variant_id: 998,
                },
                {
                  variant_group_id: 99,
                  variant_id: 999,
                },
              ],
            },
          ],
          any_special_request: 'Dont ring door bell',
          coupon_code: '20 RUPEES OFF',
        });
      expect(response.statusCode).toBe(200);
      expect(response.body.result).not.toEqual({});
      expect(response.body.result.cart_status).toBe(false);
      expect(response.body.result.cart_meta_errors).toStrictEqual([
        {
          message: 'Item total value must be atleast 500 to apply coupon',
          code: 1075,
        },
      ]);
    });
  });
  describe('If a coupon can be used once then try to re apply same coupon in customer cart and it should throw error', () => {
    // let OrderId: string;
    let Payment_Id: string;
    let total_customer_payable: number;
    test('Applying valid Items with Valid Coupon | Coupon_used_times = 0', async () => {
      mockCartServiceabilityWithValidResponse();
      const response = await request(server)
        .put('/food/cart')
        .set('Authorization', `Bearer ${customer_token}`)
        .send({
          action: 'UPDATE',
          customer_device_id: '12412423432424413213123',
          customer_address_id: 'bd7e895f-0f7d-4dbe-9408-285abf5986ce',
          restaurant_id: 'b0909e52-a731-4665-a791-ee6479008805',
          menu_items: [
            {
              quantity: 1,
              menu_item_id: 11101,
              variant_groups: [
                {
                  variant_group_id: 98,
                  variant_id: 998,
                },
                {
                  variant_group_id: 99,
                  variant_id: 999,
                },
              ],
              addon_groups: [
                {
                  addon_group_id: 77,
                  addons: [7767, 7768],
                },
              ],
            },
          ],
          any_special_request: 'Dont ring door bell',
          coupon_code: '20%OFF-COUPON',
        });
      expect(response.statusCode).toBe(200);
      expect(response.body.result).not.toEqual({});
      expect(response.body.result.cart_status).not.toBe(false);
    });
    test('Place Order', async () => {
      mockPostServiceableAddress();
      mockGetCustomerDetails();
      mockGetTransactionToken();
      const placeOrderResponse = await request(server)
        .post('/food/order/place_order')
        .set('Authorization', `Bearer ${customer_token}`);
      expect(placeOrderResponse.statusCode).toBe(200);
      // OrderId = placeOrderResponse.body.result.order_id;
      Payment_Id = placeOrderResponse.body.result.payment_details.id;
      total_customer_payable =
        placeOrderResponse.body.result.invoice_breakout.total_customer_payable;
    });
    test('Confirm Payment', async () => {
      mockCashfreeTrascationSuccessfullResponse(
        Payment_Id,
        total_customer_payable
      );
      mockGetRestaurantVendors();
      mockSendSQSMessage();
      const paymentResponse = await request(server)
        .post(`/food/order/confirm_payment/${Payment_Id}`)
        .set('Authorization', `Bearer ${customer_token}`);
      expect(paymentResponse.statusCode).toBe(200);
      expect(paymentResponse.body.status).toBe(true);
      expect(paymentResponse.body.result).toMatchObject({
        message: 'TRANSACTION_COMPLETED',
      });
    });
    test('Again Applying Same Coupon | Coupon_used_times = 1 | Nedd to throw Error.', async () => {
      mockCartServiceabilityWithValidResponse();
      const response = await request(server)
        .put('/food/cart')
        .set('Authorization', `Bearer ${customer_token}`)
        .send({
          action: 'UPDATE',
          customer_device_id: '12412423432424413213123',
          customer_address_id: 'bd7e895f-0f7d-4dbe-9408-285abf5986ce',
          restaurant_id: 'b0909e52-a731-4665-a791-ee6479008805',
          menu_items: [
            {
              quantity: 1,
              menu_item_id: 11101,
              variant_groups: [
                {
                  variant_group_id: 98,
                  variant_id: 998,
                },
                {
                  variant_group_id: 99,
                  variant_id: 999,
                },
              ],
              addon_groups: [
                {
                  addon_group_id: 77,
                  addons: [7767, 7768],
                },
              ],
            },
          ],
          any_special_request: 'Dont ring door bell',
          coupon_code: '20%OFF-COUPON',
        });
      expect(response.statusCode).toBe(200);
      expect(response.body.result).not.toEqual({});
      expect(response.body.result.cart_meta_errors).toStrictEqual([
        {message: 'coupon_max_use_count_limit_exceeded', code: 1073},
      ]);
    });
  });
  describe('applied coupon before interval - it should throw error | after interval it should be applicable | Also check if coupon_customer table has updated coupon use count for that specific user.', () => {
    describe('Coupon using on first time', () => {
      // let OrderId: string;
      let Payment_Id: string;
      test('Applying valid Items with Valid Coupon | Coupon_used_times_times = 0', async () => {
        mockCartServiceabilityWithValidResponse();
        const response = await request(server)
          .put('/food/cart')
          .set('Authorization', `Bearer ${customer_token}`)
          .send({
            action: 'UPDATE',
            customer_device_id: '12412423432424413213123',
            customer_address_id: 'bd7e895f-0f7d-4dbe-9408-285abf5986ce',
            restaurant_id: 'b0909e52-a731-4665-a791-ee6479008805',
            menu_items: [
              {
                quantity: 1,
                menu_item_id: 11101,
                variant_groups: [
                  {
                    variant_group_id: 98,
                    variant_id: 998,
                  },
                  {
                    variant_group_id: 99,
                    variant_id: 999,
                  },
                ],
                addon_groups: [
                  {
                    addon_group_id: 77,
                    addons: [7767, 7768],
                  },
                ],
              },
            ],
            any_special_request: 'Dont ring door bell',
            coupon_code: '1-Min-Interval-Coupon',
          });
        expect(response.statusCode).toBe(200);
        expect(response.body.result).not.toEqual({});
        expect(response.body.result.cart_status).not.toBe(false);
        Order_Details = response.body.result;
      });
      test('Place Order', async () => {
        mockPostServiceableAddress();
        mockGetCustomerDetails();
        mockGetTransactionToken();
        const placeOrderResponse = await request(server)
          .post('/food/order/place_order')
          .set('Authorization', `Bearer ${customer_token}`);
        expect(placeOrderResponse.statusCode).toBe(200);
        // OrderId = placeOrderResponse.body.result.order_id;
        Payment_Id = placeOrderResponse.body.result.payment_details.id;
      });
      test('Confirm Payment', async () => {
        mockCashfreeTrascationSuccessfullResponse(
          Payment_Id,
          Order_Details?.invoice_breakout?.total_customer_payable as number
        );
        mockGetRestaurantVendors();
        mockSendSQSMessage();
        const paymentResponse: any = await request(server)
          .post(`/food/order/confirm_payment/${Payment_Id}`)
          .set('Authorization', `Bearer ${customer_token}`);
        expect(paymentResponse.body.status).toBe(true);
        expect(paymentResponse.statusCode).toBe(200);
        expect(paymentResponse.body.result).toMatchObject({
          message: 'TRANSACTION_COMPLETED',
        });
      });
      test('Running SQL Query to Check Coupon_customer Updated coupon Count', async () => {
        const sqlQuery = await DB.read('coupon_customer').where({
          customer_id: customerId,
          coupon_id: 2255,
        });
        expect(sqlQuery[0].coupon_use_count).toEqual(1);
      });
    });
    describe('Coupon using on second time within time interval | need to throw error', () => {
      test('Applying valid Items with Valid Coupon | Coupon_used_times_times = 1 | Need to throw Error | Cannot Proceed to Payment ', async () => {
        mockCartServiceabilityWithValidResponse();
        const response = await request(server)
          .put('/food/cart')
          .set('Authorization', `Bearer ${customer_token}`)
          .send({
            action: 'UPDATE',
            customer_device_id: '12412423432424413213123',
            customer_address_id: 'bd7e895f-0f7d-4dbe-9408-285abf5986ce',
            restaurant_id: 'b0909e52-a731-4665-a791-ee6479008805',
            menu_items: [
              {
                quantity: 1,
                menu_item_id: 11101,
                variant_groups: [
                  {
                    variant_group_id: 98,
                    variant_id: 998,
                  },
                  {
                    variant_group_id: 99,
                    variant_id: 999,
                  },
                ],
                addon_groups: [
                  {
                    addon_group_id: 77,
                    addons: [7767, 7768],
                  },
                ],
              },
            ],
            any_special_request: 'Dont ring door bell',
            coupon_code: '1-Min-Interval-Coupon',
          });
        expect(response.statusCode).toBe(200);
        expect(response.body.result).not.toEqual({});
        expect(response.body.result.cart_meta_errors).toStrictEqual([
          {message: 'coupon_can_be_used_after_1_mins', code: 1074},
        ]);
      });
      test('Place Order On Invalid Cart | Need to throw error.', async () => {
        mockPostServiceableAddress();
        mockGetCustomerDetails();
        mockGetTransactionToken();
        const placeOrderResponse = await request(server)
          .post('/food/order/place_order')
          .set('Authorization', `Bearer ${customer_token}`);
        expect(placeOrderResponse.statusCode).toBe(400);
        expect(placeOrderResponse.body.errors).toStrictEqual([
          {message: 'failed to place order cart is empty', code: 1045},
        ]);
      });
      test('Running SQL Query to Update Last Order Time', async () => {
        const start_time = new Date();
        start_time.setMinutes(start_time.getMinutes() - 25);

        const new_updated_at = new Date(start_time).toISOString();

        const coupon_table = await DB.read('coupon_customer').where({
          coupon_id: 2255,
        });
        logger.debug(
          'Coupon last_time_used before Update',
          JSON.stringify(coupon_table)
        );

        //SQL Query to Update last_time_used time for coupon_customer table.
        const coupon_Query = await DB.write('coupon_customer')
          .where({
            coupon_id: 2255,
          })
          .update({last_time_used: new_updated_at, updated_at: new_updated_at});
        logger.debug('Updated coupon_customer', JSON.stringify(coupon_Query));

        const coupon_table_updated = await DB.read('coupon_customer').where({
          coupon_id: 2255,
        });
        logger.debug(
          'Coupon last_time_used after Update',
          JSON.stringify(coupon_table_updated)
        );
      });
    });
    describe('Coupon using after interval', () => {
      // let OrderId: string;
      let Payment_Id: string;
      //let Transaction_token: string;

      test('Applying valid Items with Valid Coupon | Coupon_used_times_times = 1', async () => {
        mockCartServiceabilityWithValidResponse();
        const response = await request(server)
          .put('/food/cart')
          .set('Authorization', `Bearer ${customer_token}`)
          .send({
            action: 'UPDATE',
            customer_device_id: '12412423432424413213123',
            customer_address_id: 'bd7e895f-0f7d-4dbe-9408-285abf5986ce',
            restaurant_id: 'b0909e52-a731-4665-a791-ee6479008805',
            menu_items: [
              {
                quantity: 1,
                menu_item_id: 11101,
                variant_groups: [
                  {
                    variant_group_id: 98,
                    variant_id: 998,
                  },
                  {
                    variant_group_id: 99,
                    variant_id: 999,
                  },
                ],
                addon_groups: [
                  {
                    addon_group_id: 77,
                    addons: [7767, 7768],
                  },
                ],
              },
            ],
            any_special_request: 'Dont ring door bell',
            coupon_code: '1-Min-Interval-Coupon',
          });
        expect(response.statusCode).toBe(200);
        expect(response.body.result).not.toEqual({});
        expect(response.body.result.cart_status).not.toBe(false);
        Order_Details = response.body.result;
      });
      test('Place Order', async () => {
        mockPostServiceableAddress();
        mockGetCustomerDetails();
        mockGetTransactionToken();
        const placeOrderResponse = await request(server)
          .post('/food/order/place_order')
          .set('Authorization', `Bearer ${customer_token}`);
        expect(placeOrderResponse.statusCode).toBe(200);
        // OrderId = placeOrderResponse.body.result.order_id;
        Payment_Id = placeOrderResponse.body.result.payment_details.id;
        //Transaction_token = placeOrderResponse.body.result.transaction_token;
      });
      test('Confirm Payment', async () => {
        mockCashfreeTrascationSuccessfullResponse(
          Payment_Id,
          Order_Details?.invoice_breakout?.total_customer_payable as number
        );
        mockGetRestaurantVendors();
        mockSendSQSMessage();
        const paymentResponse = await request(server)
          .post(`/food/order/confirm_payment/${Payment_Id}`)
          .set('Authorization', `Bearer ${customer_token}`);
        expect(paymentResponse.body.status).toBe(true);
        expect(paymentResponse.statusCode).toBe(200);
        expect(paymentResponse.body.result).toMatchObject({
          message: 'TRANSACTION_COMPLETED',
        });
      });
      test('Running SQL Query to Check Coupon_customer Updated coupon Count', async () => {
        const sqlQuery = await DB.read('coupon_customer').where({
          customer_id: customerId,
          coupon_id: 2255,
        });
        logger.debug(JSON.stringify(sqlQuery));
        expect(sqlQuery[0].coupon_use_count).toEqual(2);
      });
    });
  });
  describe('Check for Maximum amount applied on Coupon', () => {
    test('Applying valid Items with Valid Coupon | Check max_discount_rupees should not exceed then defined amount', async () => {
      mockCartServiceabilityWithValidResponse();
      const response = await request(server)
        .put('/food/cart')
        .set('Authorization', `Bearer ${customer_token}`)
        .send({
          action: 'UPDATE',
          customer_device_id: '12412423432424413213123',
          customer_address_id: 'bd7e895f-0f7d-4dbe-9408-285abf5986ce',
          restaurant_id: 'b0909e52-a731-4665-a791-ee6479008805',
          menu_items: [
            {
              quantity: 1,
              menu_item_id: 11101,
              variant_groups: [
                {
                  variant_group_id: 98,
                  variant_id: 998,
                },
                {
                  variant_group_id: 99,
                  variant_id: 999,
                },
              ],
              addon_groups: [
                {
                  addon_group_id: 77,
                  addons: [7767, 7768],
                },
              ],
            },
          ],
          any_special_request: 'Dont ring door bell',
          coupon_code: '20 RUPEESOFF',
        });
      expect(response.statusCode).toBe(200);
      expect(response.body.result).not.toEqual({});
      expect(response.body.result.cart_status).not.toBe(false);
      expect(
        response.body.result.invoice_breakout.coupon_details.max_discount_rupees
      ).toEqual(
        response.body.result.invoice_breakout.coupon_details
          .discount_amount_applied
      );
    });
  });
});
