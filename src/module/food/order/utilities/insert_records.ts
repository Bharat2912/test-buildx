import {ICartResponse} from '../../cart/types';
import {DeliveryStatus, OrderStatus, OrderAcceptanceStatus} from '../enums';
import {IOrder, IOrderAddon, IOrderItem, IOrderVariant} from '../types';
import {
  bulkInsertOrderAddon,
  bulkInsertOrderItem,
  bulkInsertOrderVariant,
  bulkInsertOrder,
} from '../models';
import {Knex} from 'knex';
import {IDeliveryOrderStatusCBRequest} from '../../../core/callback/delivery/types';

/**
 * insert records in database tables = order, order_items, order_variants
 * , order_addons table,
 * @param trx - Knex transaction instance
 * @param validatedCart - data for all order tables

 */
export async function insertRecords(
  trx: Knex.Transaction,
  validatedCart: ICartResponse
) {
  const order_status = OrderStatus.PENDING;
  const order_acceptance_status = OrderAcceptanceStatus.PENDING;
  const delivery_status = DeliveryStatus.PENDING;
  let pickup_eta =
    validatedCart.customer_details!.delivery_address!.delivery_details
      .pickup_eta || 0;
  if (
    (validatedCart.customer_details!.delivery_address!.delivery_details
      .pickup_eta || 0) <
    (validatedCart.restaurant_details?.default_preparation_time || 0)
  ) {
    pickup_eta =
      validatedCart.restaurant_details?.default_preparation_time || 0;
  }
  const delivery_details = {} as IDeliveryOrderStatusCBRequest;

  delivery_details!.drop_eta =
    validatedCart.customer_details!.delivery_address!.delivery_details.drop_eta!;
  delivery_details!.pickup_eta =
    validatedCart.customer_details!.delivery_address!.delivery_details.pickup_eta!;
  delivery_details!.delivery_service = validatedCart.delivery_service;
  delivery_details!.delivery_status = DeliveryStatus.PENDING;
  delivery_details.eta_when_order_placed = {
    epoch: new Date().getTime(),
    default_preparation_time:
      validatedCart.restaurant_details?.default_preparation_time || 1,
    rider_to_vendor_eta:
      validatedCart.customer_details!.delivery_address!.delivery_details
        .pickup_eta!,
    rider_from_vendor_to_customer_eta:
      validatedCart.customer_details!.delivery_address!.delivery_details
        .drop_eta!,
  };
  //"order" table data ready for insertion
  const order: IOrder = {
    restaurant_id: validatedCart.restaurant_details!.restaurant_id!,
    customer_id: validatedCart.customer_details!.customer_id!,
    customer_device_id: validatedCart.customer_details!.customer_device_id!,
    customer_address: validatedCart.customer_details!.delivery_address,
    delivery_status,
    delivery_charges: validatedCart.invoice_breakout!.delivery_charges,
    // delivery_tip: validatedCart.invoice_breakout!.delivery_tip,
    order_status,
    order_acceptance_status,
    total_customer_payable:
      validatedCart.invoice_breakout!.total_customer_payable,
    total_tax: validatedCart.invoice_breakout!.total_tax,
    packing_charges: validatedCart.invoice_breakout!.total_packing_charges,
    offer_discount:
      validatedCart.invoice_breakout!.coupon_details?.discount_amount_applied,
    coupon_id: validatedCart.coupon_id,
    any_special_request: validatedCart.any_special_request,
    pickup_eta,
    drop_eta:
      validatedCart.customer_details!.delivery_address!.delivery_details
        .drop_eta,
    invoice_breakout: validatedCart.invoice_breakout,
    transaction_charges: validatedCart.invoice_breakout!.transaction_charges,
    // refundable_amount: validatedCart.invoice_breakout!.refundable_amount,
    vendor_payout_amount: validatedCart.invoice_breakout!.vendor_payout_amount,
    additional_details: {},
    delivery_details,
    delivery_service: validatedCart.delivery_service,
  };

  //insert all data using transaction
  const new_order: IOrder = await bulkInsertOrder(trx, [order]);

  //We can have multiple items, variants, addons in one order
  const order_items: IOrderItem[] = [];
  const order_variants: IOrderVariant[] = [];
  const order_addons: IOrderAddon[] = [];

  for (
    let item_index = 0;
    item_index < validatedCart.menu_items!.length;
    item_index++
  ) {
    const item = validatedCart.menu_items![item_index];

    //data for "order_items" table
    order_items.push({
      sequence: item.sequence,
      order_id: new_order.id!,
      menu_item_id: item.menu_item_id,
      quantity: item.quantity,
      restaurant_id: item.restaurant_id,
      name: item.menu_item_name,
      description: item.description,
      sub_category_id: item.sub_category_id,
      display_price: item.display_price,
      price: item.price,
      veg_egg_non: item.veg_egg_non,
      packing_charges: item.packing_charges,
      is_spicy: item.is_spicy,
      serves_how_many: item.serves_how_many,
      service_charges: item.service_charges,
      item_sgst_utgst: item.item_sgst_utgst,
      item_cgst: item.item_cgst,
      item_igst: item.item_igst,
      item_inclusive: item.item_inclusive,
      external_id: item.external_id,
      allow_long_distance: item.allow_long_distance,
      image: item.image,
      pos_id: item.pos_id,
    });

    const order_item = (
      await bulkInsertOrderItem(trx, [order_items[item_index]])
    )[0];

    if (item.variant_groups && item.variant_groups.length > 0) {
      for (
        let vg_index = 0;
        vg_index < item.variant_groups!.length;
        vg_index++
      ) {
        const variant_group = item.variant_groups[vg_index];
        for (
          let v_index = 0;
          v_index < variant_group.variants.length;
          v_index++
        ) {
          const variant = variant_group.variants[v_index];
          if (variant.is_selected) {
            //data for "order_variant" table
            order_variants.push({
              order_id: new_order.id!,
              order_item_id: order_item.id!,
              variant_group_id: variant_group.variant_group_id,
              variant_group_name: variant_group.variant_group_name,
              variant_id: variant.variant_id,
              variant_name: variant.variant_name,
              display_price: variant.display_price,
              is_default: variant.is_default,
              serves_how_many: variant.serves_how_many,
              price: variant.price,
              veg_egg_non: variant.veg_egg_non,
              pos_variant_group_id: variant_group.pos_id,
              pos_variant_id: variant.pos_id,
              pos_variant_item_id: variant.pos_variant_item_id,
            });
          }
        }
      }
    }

    if (item.addon_groups && item.addon_groups.length > 0) {
      for (let ag_index = 0; ag_index < item.addon_groups.length; ag_index++) {
        const addon_group = item.addon_groups[ag_index];
        if (addon_group.is_selected) {
          for (
            let a_index = 0;
            a_index < addon_group.addons.length;
            a_index++
          ) {
            const addon = addon_group.addons[a_index];
            if (addon.is_selected) {
              //data for "order_addon" table
              order_addons.push({
                order_id: new_order.id!,
                order_item_id: order_item.id!,
                addon_name: addon.addon_name,
                addon_id: addon.addon_id,
                addon_group_name: addon_group.addon_group_name,
                addon_group_id: addon_group.addon_group_id,
                sequence: addon.sequence,
                price: addon.price,
                display_price: addon.display_price,
                veg_egg_non: addon.veg_egg_non,
                sgst_rate: addon.sgst_rate,
                cgst_rate: addon.cgst_rate,
                igst_rate: addon.igst_rate,
                gst_inclusive: addon.gst_inclusive,
                external_id: addon.external_id,
                pos_addon_group_id: addon_group.pos_id,
                pos_addon_id: addon.pos_id,
              });
            }
          }
        }
      }
    }
  }

  //we need to check length because item can have zero variants
  if (order_variants.length > 0)
    await bulkInsertOrderVariant(trx, order_variants);
  //we need to check length of addons because they are optional
  if (order_addons.length > 0) await bulkInsertOrderAddon(trx, order_addons);

  //return data which is necessary for response
  return new_order;
}
