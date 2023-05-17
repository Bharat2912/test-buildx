/* eslint-disable @typescript-eslint/no-explicit-any */
import {ICartMenuITem} from '../../module/food/cart/types';
import {ICouponDetailCost, Invoice} from '../../module/food/order/invoice';
import {IRestaurant} from '../../module/food/restaurant/models';
import {
  text_data_without_discount,
  test_data_with_discount,
} from './input_data';

describe('Invoice Test Cases :- ', () => {
  describe('Without Discount', () => {
    for (let i = 0; i < text_data_without_discount.length; i++) {
      test(
        'Test ' + i + ' Invoice With ' + text_data_without_discount[i].desc,
        async () => {
          const payload = text_data_without_discount[i];
          const menu_items = payload.input.menu_items as any as ICartMenuITem[];
          const restaurant = payload.input.restaurant as any as IRestaurant;

          const invoice = new Invoice(menu_items, restaurant, false);
          const invoice_breakout = invoice.breakout;
          delete invoice_breakout.description;
          expect(invoice_breakout).toMatchObject(payload.output);
        }
      );
    }
  });
  describe('With Discount', () => {
    for (let i = 0; i < test_data_with_discount.length; i++) {
      test(
        'Test ' + i + ' Invoice With ' + test_data_with_discount[i].desc,
        async () => {
          const payload = test_data_with_discount[i];
          const menu_items = payload.input.menu_items as any as ICartMenuITem[];
          const restaurant = payload.input.restaurant as any as IRestaurant;
          const coupon_detail_cost = payload.input
            .coupon_details as any as ICouponDetailCost;
          const invoice = new Invoice(menu_items, restaurant, false);
          invoice.setCoupon(coupon_detail_cost);
          const invoice_breakout = invoice.breakout;
          delete invoice_breakout.description;
          expect(invoice_breakout).toMatchObject(payload.output);
        }
      );
    }
  });
});
