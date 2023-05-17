import moment from 'moment';
import {saveOrderAtPetPooja} from './external_call';
import {
  IPetPoojaOrderItem,
  IPetPoojaOrderItemAddon,
  IPetPoojaSaveOrder,
  IPetPoojaItemTaxDetails,
  IPetPoojaOrderTax,
  IPetPoojaOrderDiscount,
} from './types';
import {IOrderDetails} from '../order/types';
import {getPetpoojaTaxDetailsByItemIds} from './model';
import {removePhoneCode, roundUp} from '../../../utilities/utilFuncs';
import logger from '../../../utilities/logger/winston_logger';
function noZeroString(input?: number): string {
  if (!input) return '';
  input = roundUp(input, 2);
  if (input !== 0) return input + '';
  return '';
}
export async function placeOrderAtPetPooja(order: IOrderDetails) {
  logger.debug('placing order at petpooja', order);
  if (!process.env.PETPOOJA_ORDER_STATUS_API_URL) {
    throw 'PETPOOJA_ORDER_STATUS_API_URL not available';
  }
  const petpooja_order_items: IPetPoojaOrderItem[] = [];
  const tax_details: IPetPoojaOrderTax[] = [];
  const item_pos_ids = order.order_items.map(item => item.pos_id!);
  const petpooja_item_taxes: IPetPoojaItemTaxDetails[] = [];
  if (item_pos_ids.length) {
    petpooja_item_taxes.push(
      ...(await getPetpoojaTaxDetailsByItemIds(item_pos_ids))
    );
  }
  for (let i = 0; i < order.order_items.length; i++) {
    const addon_items: IPetPoojaOrderItemAddon[] = [];

    const order_item_cost = order.invoice_breakout?.menu_items.find(
      item => item.sequence === order.order_items[i].sequence
    );

    const order_addons = order.order_items[i].order_addons;
    if (order_addons && order_addons.length > 0) {
      order_addons.forEach(addon => {
        addon_items.push({
          id: addon.pos_addon_id + '',
          name: addon.addon_name + '',
          group_name: addon.addon_group_name!,
          group_id: addon.pos_addon_group_id!,
          price: addon.price!.toString(),
          quantity: '1',
        });
      });
    }

    //item
    const petpooja_order_item: IPetPoojaOrderItem = {
      id: order.order_items[i].pos_id!,
      name: order.order_items[i].name!,
      quantity: order.order_items[i].quantity + '',
      description: order.order_items[i].description!,
      variation_id: '',
      variation_name: '',
      AddonItem: {
        details: addon_items,
      },
      gst_liability: 'vendor',
      item_discount: noZeroString(
        order_item_cost!.discount_amount / order_item_cost!.item_quantity!
      ),
      price:
        order_item_cost!.addon_group_price +
        order_item_cost!.item_price +
        order_item_cost!.total_variant_cost +
        '',
      final_price:
        order_item_cost!.addon_group_price +
        order_item_cost!.item_price +
        order_item_cost!.total_variant_cost -
        order_item_cost!.discount_amount +
        '',
      item_tax: [],
    };

    const item_taxes = petpooja_item_taxes.filter(
      tax => tax.item_pos_id === order.order_items[i].pos_id
    );
    item_taxes.map(tax => {
      if (tax.taxname === 'SGST' && +tax.tax === order_item_cost?.item_sgst) {
        petpooja_order_item.item_tax.push({
          id: tax.taxid,
          name: tax.taxname,
          amount: order_item_cost!.total_individual_food_item_sgst + '',
        });
        const tax_detail = tax_details.find(td => td.id === tax.taxid);
        if (tax_detail) {
          tax_detail.tax =
            +tax_detail.tax +
            order_item_cost!.total_individual_food_item_sgst +
            '';
        } else {
          tax_details.push({
            id: tax.taxid,
            title: tax.taxname,
            type: tax.taxtype === '1' ? 'P' : 'F',
            price: tax.tax,
            tax: order_item_cost!.total_individual_food_item_sgst + '',
            restaurant_liable_amt: '',
          });
        }
      }
      if (tax.taxname === 'CGST' && +tax.tax === order_item_cost?.item_cgst) {
        petpooja_order_item.item_tax.push({
          id: tax.taxid,
          name: tax.taxname,
          amount: order_item_cost!.total_individual_food_item_cgst + '',
        });
        const tax_detail = tax_details.find(td => td.id === tax.taxid);
        if (tax_detail) {
          tax_detail.tax =
            +tax_detail.tax +
            order_item_cost!.total_individual_food_item_cgst +
            '';
        } else {
          tax_details.push({
            id: tax.taxid,
            title: tax.taxname,
            type: tax.taxtype === '1' ? 'P' : 'F',
            price: tax.tax,
            tax: order_item_cost!.total_individual_food_item_cgst + '',
            restaurant_liable_amt: '',
          });
        }
      }
    });
    const order_variants = order.order_items[i].order_variants;
    if (order_variants && order_variants.length) {
      const variant = order_variants[0];
      if (variant) {
        petpooja_order_item.id = variant.pos_variant_item_id || '';
        petpooja_order_item.variation_id = variant.pos_variant_id + '';
        petpooja_order_item.variation_name = variant.variant_name || '';
      }
    }

    //finally push item
    petpooja_order_items.push(petpooja_order_item);
  }

  if (order.invoice_breakout!.packing_charge_sgst) {
    const found_packing_sgst = petpooja_item_taxes.find(
      tax =>
        tax.taxname === 'SGST' &&
        +tax.tax === order.invoice_breakout?.packing_sgst
    );
    if (found_packing_sgst) {
      const tax_detail = tax_details.find(
        td => td.id === found_packing_sgst.taxid
      );
      if (tax_detail) {
        tax_detail.tax =
          +tax_detail.tax + order.invoice_breakout!.packing_charge_sgst + '';
      } else {
        tax_details.push({
          id: found_packing_sgst.taxid,
          title: found_packing_sgst.taxname,
          type: found_packing_sgst.taxtype === '1' ? 'P' : 'F',
          price: order.invoice_breakout?.packing_sgst + '',
          tax: order.invoice_breakout?.packing_charge_sgst + '',
          restaurant_liable_amt: '',
        });
      }
    } else {
      tax_details.push({
        id: '',
        title: 'SGST',
        type: 'P',
        price: order.invoice_breakout?.packing_sgst + '',
        tax: order.invoice_breakout?.packing_charge_sgst + '',
        restaurant_liable_amt: '',
      });
    }
  }

  if (order.invoice_breakout!.packing_charge_cgst) {
    const found_packing_cgst = petpooja_item_taxes.find(
      tax =>
        tax.taxname === 'CGST' &&
        +tax.tax === order.invoice_breakout?.packing_cgst
    );
    if (found_packing_cgst) {
      const tax_detail = tax_details.find(
        td => td.id === found_packing_cgst.taxid
      );
      if (tax_detail) {
        tax_detail.tax =
          +tax_detail.tax + order.invoice_breakout!.packing_charge_cgst + '';
      } else {
        tax_details.push({
          id: found_packing_cgst.taxid,
          title: found_packing_cgst.taxname,
          type: found_packing_cgst.taxtype === '1' ? 'P' : 'F',
          price: order.invoice_breakout?.packing_cgst + '',
          tax: order.invoice_breakout?.packing_charge_cgst + '',
          restaurant_liable_amt: '',
        });
      }
    } else {
      tax_details.push({
        id: '',
        title: 'cgst',
        type: 'P',
        price: order.invoice_breakout?.packing_cgst + '',
        tax: order.invoice_breakout?.packing_charge_cgst + '',
        restaurant_liable_amt: '',
      });
    }
  }

  // const tax_pos_ids = petpooja_item_taxes.map(tax => tax.taxid);
  // const petpooja_taxes: IPetPoojaTax[] = [];
  // if (tax_pos_ids.length) {
  //   petpooja_taxes.push(...(await getPetpoojaTaxByIds(tax_pos_ids)));
  // }
  // petpooja_taxes.map(tax => {
  //   let type: 'F' | 'P' = 'F';
  //   if (tax.taxtype === '1') type = 'P';
  //   if (tax.taxname === 'SGST') {
  //     tax_details.push({
  //       id: tax.taxid,
  //       title: tax.taxname,
  //       type,
  //       price: tax.tax,
  //       tax: order.invoice_breakout?.total_cgst + '',
  //       restaurant_liable_amt: '',
  //     });
  //   }
  //   if (tax.taxname === 'CGST') {
  //     tax_details.push({
  //       id: tax.taxid,
  //       title: tax.taxname,
  //       type,
  //       price: tax.tax,
  //       tax: order.invoice_breakout?.total_sgst + '',
  //       restaurant_liable_amt: '',
  //     });
  //   }
  // });
  const discounts: IPetPoojaOrderDiscount[] = [];
  if (order.invoice_breakout?.coupon_details) {
    discounts.push({
      id: order.invoice_breakout?.coupon_details.coupon_id + '',
      title: order.invoice_breakout?.coupon_details.code,
      type: order.invoice_breakout?.coupon_details.discount_percentage
        ? 'P'
        : 'F',
      price:
        order.invoice_breakout?.coupon_details.discount_amount_applied + '',
    });
  }
  const request: IPetPoojaSaveOrder = {
    orderinfo: {
      OrderInfo: {
        Restaurant: {
          details: {
            res_name: order.restaurant_details?.pos_name,
            restID: order.restaurant_details!.pos_id!,
            address: order.restaurant_details?.location,
            contact_information: removePhoneCode(
              order.restaurant_details?.poc_number
            ),
          },
        },
        Customer: {
          details: {
            name: order.customer_address?.customer_name,
            email: order.customer_address?.email,
            address:
              order.customer_address?.house_flat_block_no +
              ' ' +
              order.customer_address?.apartment_road_area +
              ' ' +
              order.customer_address?.landmark +
              ' ' +
              order.customer_address?.city,
            phone: removePhoneCode(order.customer_address?.phone),
            latitude: order.customer_address?.latitude + '',
            longitude: order.customer_address?.longitude + '',
          },
        },
        Order: {
          details: {
            orderID: order.order_id!.toString(),
            preorder_date: moment(order.created_at).format('YYYY-MM-DD'),
            preorder_time: moment(order.created_at).format('HH:mm:ss'),
            service_charge: '',
            sc_tax_amount: '',
            delivery_charges: noZeroString(
              order.invoice_breakout?.delivery_charges
            ),
            dc_tax_amount: '',
            dc_gst_details: [
              {
                gst_liable: 'vendor', //speedyy is vendor in this case
                amount: '',
              },
              {
                gst_liable: 'restaurant',
                amount: '',
              },
            ],
            packing_charges: noZeroString(
              order.invoice_breakout?.total_packing_charges
            ),
            pc_tax_amount: noZeroString(
              order.invoice_breakout?.packing_charge_tax
            ),
            pc_gst_details: [
              {
                gst_liable: 'vendor', //speedyy is vendor in this case
                amount: '' + order.invoice_breakout?.packing_charge_tax || '',
              },
              {
                gst_liable: 'restaurant',
                amount: '',
              },
            ],
            order_type: 'H', // H = Home Delivery
            advanced_order: 'N',
            payment_type: order.payment_details[0].is_pod ? 'COD' : 'ONLINE',
            table_no: '',
            no_of_persons: '',
            discount_total: noZeroString(
              order.invoice_breakout?.coupon_details?.discount_amount_applied
            ),
            discount_type: '',
            tax_total: '' + order.invoice_breakout?.total_tax || '',
            total: order.invoice_breakout!.total_customer_payable + '',
            description: order.any_special_request,
            created_on: moment(order.created_at).format('YYYY-MM-DD HH:mm:ss'), //Order creation date/time. Format:yyyy-mm-dd HH:mm:ss
            enable_delivery: 0, //0 means Rider from thirdparty side will come and 1 means Rider from Restaurant
            min_prep_time: order.restaurant_details?.default_preparation_time,
            callback_url: process.env.PETPOOJA_ORDER_STATUS_API_URL, //https.xyz.abc';
          },
        },
        OrderItem: {
          details: petpooja_order_items,
        },
        Tax: {
          details: tax_details,
        },
        Discount: {
          details: [], //discounts,
        },
      },
      device_type: 'Mobile',
    },
  };

  // console.log(JSON.stringify(request, null, 4));
  // if (process) throw 'error @@@@@@@@@@@@@@@@@@@@';
  logger.debug('order placed request petpooja', request);
  const result = await saveOrderAtPetPooja(request);
  logger.debug('succesfully placed order at petpooja', result);
  return {
    pos_id: result.orderID,
  };
}
