import {roundUp} from '../../../utilities/utilFuncs';
import {ICartMenuITem} from '../cart/types';
import {CouponLevel, CouponType} from '../coupons/enum';
import {IRestaurant} from '../restaurant/models';

const IAddonDesc = {
  desc: 'List of all Addons selected',
  addon_id: 'Addon Id from database',
  addon_name: 'Addon Name from database',
  addon_cgst: 'Addon CGST Tax Rate from database',
  addon_sgst: 'Addon SGST Tax Rate from database',
  addon_igst: 'Addon IGST Tax Rate from database',
  addon_price: 'Addon Price from database',
  addon_tax_amount: `Calculated Tax value from sum of taxes(IGST+CGST+SGST) and applied on addon_price
  >>> (addon_price / 100)*(addon_cgst+addon_sgst+addon_igst)`,
};
const IAddonGroupDesc = {
  addon_group_id: 'Addon Group Id from database',
  addon_group_name: 'Addon Group Name from database',
  addons: IAddonDesc,
  free_limit: '',
  total_addon_price: 'Sum Of all addon_price of from addons array',
  total_addon_tax_amount: 'Sum Of all addon_tax_amount of from addons array',
};
const IVariantDesc = {
  desc: 'List of all Variant group with choosed variants',
  variant_group_id: 'Variant Group Id from database',
  variant_group_name: 'Variant Group Name from database',
  variant_id: 'Variant Id from database',
  variant_name: 'Variant Name from database',
  variant_price: 'Variant Price from database',
};
const IMenuItemDesc = {
  item_id: 'Menu Itm Id from database',
  item_name: 'Menu Item Name from fatabase',
  item_quantity: 'Menu Item Quantity selected by customer',
  item_cgst: 'Menu Item CGST Tax Rate from database',
  item_sgst: 'Menu Item SGST Tax Rate from database',
  item_igst: 'Menu Item IGST Tax Rate from database',
  item_price: 'Menu Item Price from database',
  variants: IVariantDesc,
  total_variant_cost: 'Sum Of all variant_price of from variants array',
  addon_groups: IAddonGroupDesc,
  total_addon_group_price:
    '(Sum Of all total_addon_price of from addon_groups array) * item_quantity',
  total_addon_group_tax_amount:
    'Sum Of all total_addon_tax_amount of from addon_groups array',
  total_item_amount: `Calculated Value from adding all selected variants price on top of Menu Item Price
  >>> ((item_price + total_variant_cost) * item_quantity)`,
  item_tax_amount: `Calculated Value of tax applied on food amount if tax is not inclusive
  >>> ((total_item_amount / 100) * (item_cgst + item_sgst + item_igst))`,
  item_packing_charges: 'Packing charges of Menu Item if set by restaurant',
  total_individual_food_item_cost: ` Total Item Cost (including item cost with variant cost and addons cost)
  >>> total_item_amount + total_addon_group_price`,
  total_individual_food_item_tax: `Total Item Tax (including item tax with variant and addons tax)
  >>> item_tax_amount + total_addon_group_tax_amount`,
};
const ICouponDetailDesc = {
  coupon_id: 'Coupon Id from database',
  code: 'Coupon code from database',
  level: 'Coupon level from database',
  min_order_value_rupees: 'Coupon min_order_value_rupees from database',
  type: 'Coupon type from database',
  max_discount_rupees: 'Coupon max_discount_rupees from database',
  discount_percentage: 'Coupon discount_percentage from database',
  discount_amount_rupees: 'Coupon discount_amount_rupees from database',
  discount_share_percentage_vendor:
    'Coupon discount_share_percentage_vendor from database',
  discount_share_percentage_speedyy:
    'Coupon discount_share_percentage_speedyy from database',
  discount_amount_applied: `Applicable discount amount calculated based on Other values
  `,
  discount_share_amount_vendor: `The Amount Bared by vendor calculated percentage of discount_amount_applied
  >>>  (discount_amount_applied /100) * discount_share_percentage_vendor`,
  discount_share_amount_speedyy: `Calculated Rest of the discount amount bared by speedyy
  >>> discount_amount_applied - discount_share_amount_vendor`,
};
const IInvoiceBreakoutDesc = {
  menu_items: IMenuItemDesc,
  coupon_details: ICouponDetailDesc,
  payment_transaction_id:
    'Payment uuid when payment is made by customer and is verified',
  delivery_order_id: 'Delivery order id when order is placed',
  payout_transaction_id:
    'Payout transaction ID when order payout processing started',
  order_packing_charge: 'Packing Charges on full order if set by restaurant',
  total_food_cost: 'Sum of all total_item_amount + total_addon_group_price',
  total_tax:
    'Sum of item_tax_amount and total_addon_group_tax_amount in menu_items array',
  total_packing_charges:
    'Sum of all item_packing_charges from menu_items and order_packing_charge',
  delivery_charges:
    'By delivery partner based on >>> total_food_cost + total_tax + total_packing_charges - discount_amount_applied',
  transaction_charges_rate:
    'From .env: ' + (process.env.ORDER_TRANSACTION_CHARGES_RATE || 3) + '%',
  transaction_charges: `Calculated on
  >>> ((total_food_cost + total_taxes + total_packing_charges - discount_amount_applied + delivery_charges) / 100 ) * transaction_charges_rate`,
  total_customer_payable:
    'total_food_cost + total_taxes + total_packing_charges - discount_amount_applied + delivery_charges + transaction_charges',
  refundable_amount: 'total_food_cost + total_taxes - discount_amount_applied',
  vendor_payout_amount:
    'total_food_cost + total_taxes + total_packing_charges - discount_share_amount_vendor',
  version: '0.0.1',
};

interface IAddonCost {
  addon_id: number;
  addon_name: string;
  addon_cgst: number;
  addon_sgst: number;
  addon_igst: number;
  addon_price: number;
  addon_tax_amount: number; // (addon_price / 100)*(addon_cgst+addon_sgst+addon_igst)
}
interface IAddonGroupCost {
  addon_group_id: number;
  addon_group_name: string;
  addons: IAddonCost[];
  free_limit: number;
  total_addon_price: number; // Sum Of all (addon_price*addon_quantity) of item
  total_addon_tax_amount: number; // Sum Of all addon_tax_amount of item
}
interface IVariantCost {
  variant_group_id: number;
  variant_group_name: string;
  variant_id: number;
  variant_name: string;
  variant_price: number;
}
interface IMenuItemCost {
  sequence: number;
  item_id: number;
  item_name: string;
  item_quantity: number;
  item_cgst: number;
  item_sgst: number;
  item_igst: number;
  item_price: number;
  variants: IVariantCost[];
  total_variant_cost: number;
  total_item_amount: number;
  tax_applied_on?: 'core' | 'total';
  item_tax_amount: number; // (item_price / 100)*(item_cgst + item_sgst + item_igst)
  item_packing_charges: number;
  addon_groups: IAddonGroupCost[];
  total_addon_group_price: number; // Sum Of all (addon_price*addon_quantity) of item
  total_addon_group_tax_amount: number; // Sum Of all addon_tax_amount of item
  total_individual_food_item_cost: number;
  total_individual_food_item_tax: number;
}

export interface ICouponDetailCost {
  coupon_id: number;
  code: string;
  level: CouponLevel;

  min_order_value_rupees: number;

  type: CouponType;

  max_discount_rupees?: number;

  discount_percentage?: number;
  discount_amount_rupees?: number;

  discount_share_percentage_vendor?: number;
  discount_share_percentage_speedyy?: number;

  discount_amount_applied?: number;
  discount_share_amount_speedyy?: number;
  discount_share_amount_vendor?: number;
}

export interface IRefundSettlementDetails {
  refund_settled_vendor_payout_amount: number;
  refund_settled_delivery_charges: number;
  refund_settled_customer_amount: number;
  refund_settlement_note_to_delivery_partner: string;
  refund_settlement_note_to_vendor: string;
  refund_settlement_note_to_customer: string;
}

export interface IInvoiceBreakout {
  menu_items: IMenuItemCost[];
  coupon_details?: ICouponDetailCost;
  delivery_order_id?: string;
  payment_transaction_id?: string;
  payout_transaction_id?: string;
  packing_charge_fixed_percent?: 'fixed' | 'percent';
  order_packing_charge: number; //         As in Restaurant Table
  total_food_tax: number;
  total_food_cost: number; //              Sum of all (item_price*item_quantity), total_addon_price price
  total_packing_charges: number; //        Sum of all item_packing_charges and order_packing_charge
  total_tax: number; //                    Sum of item_tax_amount and total_addon_tax_amount
  delivery_charges: number; //         on  total_food_value + total_taxes + total_packing_charges - coupon_amount >>> by shadow fax based on
  transaction_charges_rate: number; //     .
  transaction_refund_charges_rate: number;
  transaction_charges: number; //      on  total_food_value + total_taxes + total_packing_charges - coupon_amount + delivery_charges >>> applied 2% (rate based on payment Method)
  transaction_refund_charges: number;
  total_customer_payable: number; //       total_food_value + total_taxes + total_packing_charges - coupon_amount + delivery_charges + transaction_charges
  // refundable_amount: number; //            total_food_value + total_taxes - coupon_amount
  vendor_payout_amount: number; //         total_food_value + total_taxes + total_packing_charges - coupon_value_vendor
  vendor_cancellation_charges: number;
  refund_settlement_details?: IRefundSettlementDetails;
  taxes_applicable_on_packing: boolean;
  packing_charge_tax: number;
  packing_charge_tax_rate: number;
  description?: {};
}

export class Invoice {
  breakout: IInvoiceBreakout = {
    menu_items: [],
    // delivery_order_id: string;
    // payment_transaction_id: string;
    // payout_transaction_id: string;
    packing_charge_fixed_percent: 'fixed',
    order_packing_charge: 0,
    total_food_cost: 0,
    total_packing_charges: 0,
    taxes_applicable_on_packing: false,
    packing_charge_tax: 0,
    packing_charge_tax_rate: 0,
    total_food_tax: 0,
    total_tax: 0,
    delivery_charges: 0,
    transaction_charges_rate: 0,
    transaction_refund_charges_rate: 0,
    transaction_charges: 0, //      on  total_food_value + total_taxes + total_packing_charges - coupon_amount + delivery_charges >>> applied 2% (rate based on payment Method)
    transaction_refund_charges: 0,
    total_customer_payable: 0, //       total_food_value + total_taxes + total_packing_charges - coupon_amount + delivery_charges + transaction_charges
    // refundable_amount: 0, //            total_food_value + total_taxes - coupon_amount
    vendor_payout_amount: 0, //         total_food_value + total_taxes + total_packing_charges - coupon_value_vendor
    vendor_cancellation_charges: 0,
    description: IInvoiceBreakoutDesc,
  };
  restaurant: IRestaurant | null = null;
  constructor(menuItemsData: ICartMenuITem[], restaurant: IRestaurant) {
    this.restaurant = restaurant;
    for (let mi_cntr = 0; mi_cntr < menuItemsData.length; mi_cntr++) {
      const menu_item = menuItemsData[mi_cntr];
      if (menu_item && menu_item.quantity > 0) {
        const menu_item_cost: IMenuItemCost = {
          sequence: menu_item.sequence,
          item_id: menu_item.menu_item_id!,
          item_name: menu_item.menu_item_name,
          item_quantity: menu_item.quantity,
          item_cgst: menu_item.item_cgst || 0,
          item_sgst: menu_item.item_sgst_utgst || 0,
          item_igst: menu_item.item_igst || 0,
          item_price: menu_item.price || 0,
          tax_applied_on: menu_item.tax_applied_on,
          total_item_amount: 0,
          item_tax_amount: 0,
          item_packing_charges: menu_item.packing_charges || 0,
          addon_groups: [],
          variants: [],
          total_variant_cost: 0,
          total_addon_group_price: 0,
          total_addon_group_tax_amount: 0,
          total_individual_food_item_cost: 0,
          total_individual_food_item_tax: 0,
        };
        const addon_groups = menu_item.addon_groups;
        if (addon_groups) {
          for (let ag_cntr = 0; ag_cntr < addon_groups.length; ag_cntr++) {
            const addon_group = addon_groups[ag_cntr];
            if (addon_group && addon_group.is_selected) {
              const addon_group_cost: IAddonGroupCost = {
                addon_group_id: addon_group.addon_group_id!,
                addon_group_name: addon_group.addon_group_name,
                addons: [],
                free_limit: addon_group.free_limit || -1,
                total_addon_price: 0,
                total_addon_tax_amount: 0,
              };
              const addons = addon_group.addons;
              addons.sort((a, b) => {
                return (a.price || 0) - (b.price || 0);
              });
              if (addons) {
                for (let ad_cntr = 0; ad_cntr < addons.length; ad_cntr++) {
                  const addon = addons[ad_cntr];
                  if (addon && addon.is_selected) {
                    const addon_cost: IAddonCost = {
                      addon_id: addon.addon_id!,
                      addon_name: addon.addon_name!,
                      addon_cgst: addon.cgst_rate || 0,
                      addon_sgst: addon.sgst_rate || 0,
                      addon_igst: addon.igst_rate || 0,
                      addon_price: addon.price || 0,
                      addon_tax_amount: 0,
                    };
                    const ad_tax_rate =
                      addon_cost.addon_cgst +
                      addon_cost.addon_igst +
                      addon_cost.addon_sgst;
                    if (
                      !addon.gst_inclusive &&
                      ad_tax_rate &&
                      addon_cost.addon_price > 0
                    ) {
                      addon_cost.addon_tax_amount =
                        (addon_cost.addon_price / 100) * ad_tax_rate;
                      addon_cost.addon_tax_amount = roundUp(
                        addon_cost.addon_tax_amount,
                        2
                      );
                    }
                    if (
                      addon_group_cost.free_limit < 0 ||
                      addon_group_cost.addons.length >=
                        addon_group_cost.free_limit
                    ) {
                      addon_group_cost.total_addon_price +=
                        addon_cost.addon_price;
                      addon_group_cost.total_addon_tax_amount +=
                        addon_cost.addon_tax_amount;
                    }
                    addon_group_cost.addons.push(addon_cost);
                  }
                }
                menu_item_cost.addon_groups.push(addon_group_cost);
              }
              menu_item_cost.total_addon_group_price +=
                addon_group_cost.total_addon_price;
              menu_item_cost.total_addon_group_tax_amount +=
                addon_group_cost.total_addon_tax_amount;
            }
          }
        }
        menu_item_cost.total_addon_group_price =
          menu_item_cost.total_addon_group_price * menu_item_cost.item_quantity;
        menu_item_cost.total_addon_group_tax_amount =
          menu_item_cost.total_addon_group_tax_amount *
          menu_item_cost.item_quantity;
        const variant_groups = menu_item.variant_groups;
        if (variant_groups) {
          for (let vg_cntr = 0; vg_cntr < variant_groups.length; vg_cntr++) {
            const variant_group = variant_groups[vg_cntr];
            if (variant_group && variant_group.is_selected) {
              const variants = variant_group.variants;
              if (variants) {
                for (let vr_cntr = 0; vr_cntr < variants.length; vr_cntr++) {
                  const variant = variants[vr_cntr];
                  if (variant && variant.is_selected) {
                    const variant_cost: IVariantCost = {
                      variant_group_id: variant_group.variant_group_id,
                      variant_group_name: variant_group.variant_group_name,
                      variant_id: variant.variant_id!,
                      variant_name: variant.variant_name!,
                      variant_price: variant.price || 0,
                    };
                    menu_item_cost.variants.push(variant_cost);
                    menu_item_cost.total_variant_cost +=
                      variant_cost.variant_price;
                  }
                }
              }
            }
          }
        }
        menu_item_cost.total_item_amount =
          (menu_item_cost.item_price + menu_item_cost.total_variant_cost) *
          menu_item_cost.item_quantity;

        if (restaurant.packing_charge_fixed_percent === 'percent') {
          menu_item_cost.item_packing_charges =
            ((menu_item_cost.total_addon_group_price +
              menu_item_cost.total_item_amount) /
              100) *
            menu_item_cost.item_packing_charges;
        }

        const mi_tax_rate =
          menu_item_cost.item_cgst +
          menu_item_cost.item_sgst +
          menu_item_cost.item_igst;
        if (
          !menu_item.item_inclusive &&
          mi_tax_rate &&
          menu_item_cost.total_item_amount > 0
        ) {
          if (menu_item_cost.tax_applied_on === 'total') {
            menu_item_cost.item_tax_amount =
              ((menu_item_cost.total_item_amount +
                menu_item_cost.item_packing_charges) /
                100) *
              mi_tax_rate;
          } else {
            menu_item_cost.item_tax_amount =
              (menu_item_cost.total_item_amount / 100) * mi_tax_rate;
          }
          menu_item_cost.item_tax_amount = roundUp(
            menu_item_cost.item_tax_amount,
            2
          );
        }
        menu_item_cost.total_individual_food_item_cost =
          menu_item_cost.total_item_amount +
          menu_item_cost.total_addon_group_price;
        menu_item_cost.total_individual_food_item_tax =
          menu_item_cost.item_tax_amount +
          menu_item_cost.total_addon_group_tax_amount;
        this.breakout.menu_items.push(menu_item_cost);

        if (restaurant.packing_charge_type === 'item')
          this.breakout.total_packing_charges +=
            menu_item_cost.item_packing_charges;

        this.breakout.total_food_cost +=
          menu_item_cost.total_addon_group_price +
          menu_item_cost.total_item_amount;

        this.breakout.total_food_tax +=
          menu_item_cost.item_tax_amount +
          menu_item_cost.total_addon_group_tax_amount;
      }
    }
    this.calculateTotals();
  }
  setCoupon(coupon_details: ICouponDetailCost) {
    coupon_details.max_discount_rupees =
      coupon_details.max_discount_rupees || 0;
    coupon_details.discount_percentage =
      coupon_details.discount_percentage || 0;
    coupon_details.discount_amount_rupees =
      coupon_details.discount_amount_rupees || 0;
    coupon_details.discount_share_percentage_speedyy =
      coupon_details.discount_share_percentage_speedyy || 0;
    coupon_details.discount_share_percentage_vendor =
      coupon_details.discount_share_percentage_vendor || 0;
    coupon_details.discount_amount_applied = 0;
    coupon_details.discount_share_amount_speedyy = 0;
    coupon_details.discount_share_amount_vendor = 0;

    const coupon_applicable_amount =
      this.breakout.total_food_cost +
      this.breakout.total_food_tax +
      this.breakout.total_packing_charges;

    if (coupon_applicable_amount >= coupon_details.min_order_value_rupees) {
      if (coupon_details.discount_percentage) {
        coupon_details.discount_amount_applied =
          (coupon_applicable_amount / 100) * coupon_details.discount_percentage;
      } else if (coupon_details.discount_amount_rupees) {
        coupon_details.discount_amount_applied =
          coupon_details.discount_amount_rupees;
      }

      coupon_details.discount_amount_applied = roundUp(
        coupon_details.discount_amount_applied,
        2
      );

      if (coupon_details.type === CouponType.UPTO) {
        if (
          coupon_details.discount_amount_applied >
          coupon_details.max_discount_rupees
        ) {
          coupon_details.discount_amount_applied =
            coupon_details.max_discount_rupees;
        }
      }

      if (coupon_details.discount_amount_applied > coupon_applicable_amount)
        coupon_details.discount_amount_applied = coupon_applicable_amount;

      if (coupon_details.discount_share_percentage_vendor) {
        coupon_details.discount_share_amount_vendor =
          (coupon_details.discount_amount_applied / 100) *
          coupon_details.discount_share_percentage_vendor;

        coupon_details.discount_share_amount_vendor = roundUp(
          coupon_details.discount_share_amount_vendor,
          2
        );
      }
      coupon_details.discount_share_amount_speedyy =
        coupon_details.discount_amount_applied -
        coupon_details.discount_share_amount_vendor;
    }
    this.breakout.coupon_details = coupon_details;
    this.calculateTotals();
  }
  setDeliveryCost(delivery_cost: number) {
    this.breakout.delivery_charges = delivery_cost;
    this.calculateTotals();
  }
  calculateTotals() {
    if (this.restaurant) {
      if (
        this.restaurant.packing_charge_type === 'order' &&
        this.restaurant.packing_charge_order &&
        this.restaurant.packing_charge_order.packing_charge
      ) {
        this.breakout.packing_charge_fixed_percent =
          this.restaurant.packing_charge_fixed_percent;
        if (this.restaurant.packing_charge_fixed_percent === 'percent') {
          this.breakout.order_packing_charge =
            ((this.breakout.total_food_cost + this.breakout.total_food_tax) /
              100) *
            this.restaurant.packing_charge_order.packing_charge;
          this.breakout.order_packing_charge = roundUp(
            this.breakout.order_packing_charge,
            2
          );
        } else {
          this.breakout.order_packing_charge =
            this.restaurant.packing_charge_order.packing_charge;
        }
      }
      if (this.restaurant.packing_charge_type === 'order')
        this.breakout.total_packing_charges =
          this.breakout.order_packing_charge;
      if (this.restaurant.packing_charge_type === 'none')
        this.breakout.total_packing_charges = 0;

      if (this.restaurant.taxes_applicable_on_packing) {
        this.breakout.taxes_applicable_on_packing = true;
        const pc_tax =
          (this.restaurant.packing_cgst || 0) +
          (this.restaurant.packing_sgst_utgst || 0) +
          (this.restaurant.packing_igst || 0);
        let packing_charge_tax =
          (this.breakout.total_packing_charges / 100) * pc_tax;
        packing_charge_tax = roundUp(packing_charge_tax, 2);

        this.breakout.packing_charge_tax = packing_charge_tax;
        this.breakout.packing_charge_tax_rate = pc_tax;
      }
    }
    this.breakout.total_tax =
      this.breakout.total_food_tax + this.breakout.packing_charge_tax;
    this.breakout.total_tax = roundUp(this.breakout.total_tax, 2);
    this.breakout.transaction_charges_rate = +(
      process.env.ORDER_TRANSACTION_CHARGES_RATE || 3
    );
    this.breakout.transaction_refund_charges_rate = +(
      process.env.ORDER_REFUND_TRANSACTION_CHARGES_RATE || 3
    );

    //      on  total_food_value + total_taxes + total_packing_charges - coupon_amount + delivery_charges >>> applied 2% (rate based on payment Method)
    this.breakout.transaction_charges = this.breakout.total_food_cost;
    this.breakout.transaction_charges += this.breakout.total_tax;
    this.breakout.transaction_charges += this.breakout.total_packing_charges;
    this.breakout.transaction_charges -=
      this.breakout.coupon_details?.discount_amount_applied || 0;
    this.breakout.transaction_charges += this.breakout.delivery_charges;
    this.breakout.transaction_charges =
      (this.breakout.transaction_charges / 100) *
      this.breakout.transaction_charges_rate;
    this.breakout.transaction_charges = roundUp(
      this.breakout.transaction_charges,
      2
    );

    //      on  total_food_value + total_taxes + total_packing_charges - coupon_amount + delivery_charges >>> applied 2% (rate based on payment Method)
    this.breakout.transaction_refund_charges = this.breakout.total_food_cost;
    this.breakout.transaction_refund_charges += this.breakout.total_tax;
    this.breakout.transaction_refund_charges +=
      this.breakout.total_packing_charges;
    this.breakout.transaction_refund_charges -=
      this.breakout.coupon_details?.discount_amount_applied || 0;
    this.breakout.transaction_refund_charges += this.breakout.delivery_charges;
    this.breakout.transaction_refund_charges =
      (this.breakout.transaction_refund_charges / 100) *
      this.breakout.transaction_refund_charges_rate;
    this.breakout.transaction_refund_charges = roundUp(
      this.breakout.transaction_refund_charges,
      2
    );

    //       total_food_value + total_taxes + total_packing_charges - coupon_amount + delivery_charges + transaction_charges
    this.breakout.total_customer_payable = this.breakout.total_food_cost;
    this.breakout.total_customer_payable += this.breakout.total_tax;
    this.breakout.total_customer_payable += this.breakout.total_packing_charges;
    this.breakout.total_customer_payable -=
      this.breakout.coupon_details?.discount_amount_applied || 0;
    this.breakout.total_customer_payable += this.breakout.delivery_charges;
    this.breakout.total_customer_payable += this.breakout.transaction_charges;

    //            total_food_value + total_taxes - coupon_amount
    // this.breakout.refundable_amount = this.breakout.total_food_cost;
    // this.breakout.refundable_amount += this.breakout.total_tax;
    // this.breakout.refundable_amount += this.breakout.total_packing_charges;
    // this.breakout.refundable_amount -=
    //   this.breakout.coupon_details?.discount_amount_applied || 0;
    // this.breakout.refundable_amount += this.breakout.delivery_charges;
    // this.breakout.refundable_amount += this.breakout.transaction_charges;

    //         total_food_value + total_taxes + total_packing_charges - coupon_value_vendor
    this.breakout.vendor_payout_amount = this.breakout.total_food_cost;
    // this.breakout.vendor_payout_amount += this.breakout.total_tax;
    this.breakout.vendor_payout_amount += this.breakout.total_packing_charges;
    this.breakout.vendor_payout_amount -=
      this.breakout.coupon_details?.discount_share_amount_vendor || 0;

    this.breakout.vendor_cancellation_charges = this.breakout.delivery_charges;
    this.breakout.vendor_cancellation_charges +=
      this.breakout.transaction_charges;
    this.breakout.vendor_cancellation_charges +=
      this.breakout.transaction_refund_charges;

    this.breakout.vendor_payout_amount = roundUp(
      this.breakout.vendor_payout_amount,
      2
    );

    this.breakout.total_customer_payable = roundUp(
      this.breakout.total_customer_payable,
      2
    );
  }
}
