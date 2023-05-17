import {roundUp} from '../../../utilities/utilFuncs';
import {
  ICartAddon,
  ICartAddonGroup,
  ICartMenuITem,
  ICartVariantGroup,
} from '../cart/types';
import {CouponLevel, CouponType} from '../coupons/enum';
import {IRestaurant} from '../restaurant/models';

const IAddonDesc = {
  addon_id: 'ID from DB',
  addon_name: 'Name from DB',
  addon_cgst: 'CGST tax % from DB',
  addon_sgst: 'SGST tax % from DB',
  addon_igst: 'IGST tax % from DB',
  addon_price: 'Price from DB',
  gst_inclusive: 'Price is included of GST Yes/No',
  addon_cgst_amount: 'CGST amount based on CGST %',
  addon_sgst_amount: 'CGST amount based on SGST %',
  addon_igst_amount: 'CGST amount based on IGST %',
  addon_tax_amount: 'Tax amount => (CGST+SGST+IGST) amount',
};
const IAddonGroupDesc = {
  addon_group_id: 'ID From DB',
  addon_group_name: 'Name from DB',
  addons: IAddonDesc,
  free_limit: 'Free limit from DB',
  total_addon_price: 'Sum of all addon_price from addons',
  total_addon_cgst_amount: 'Sum of all addon_cgst_amount from addons',
  total_addon_sgst_amount: 'Sum of all addon_sgst_amount from addons',
  total_addon_igst_amount: 'Sum of all addon_igst_amount from addons',
  total_addon_tax_amount: 'Tax amount => (CGST+SGST+IGST) amount',
};
const IVariantDesc = {
  variant_group_id: 'Group Id from DB',
  variant_group_name: 'Group Name from DB',
  variant_id: 'Id from DB',
  variant_name: 'Name from DB',
  variant_price: 'Price from DB',
};
const IMenuItemDesc = {
  sequence: 'Item sequence from DB',
  item_id: 'ID from DB',
  item_name: 'Name from DB',
  item_cgst: 'CGST tax % from DB',
  item_sgst: 'SGST tax % from DB',
  item_igst: 'IGST tax % from DB',
  item_price: 'Price from DB',
  gst_inclusive: 'Price is included of GST Yes/No',
  item_quantity: 'Quantity from DB',
  variants: IVariantDesc,
  total_variant_cost: 'Sum of all selected variant price',
  total_item_amount: '(item_price+total_variant_cost)* item_quantity',
  tax_applied_on: 'Value from db (Petpooja)',
  item_cgst_amount: 'CGST amount based on CGST %',
  item_sgst_amount: 'SGST amount based on CGST %',
  item_igst_amount: 'IGST amount based on CGST %',
  item_tax_amount: 'Tax amount => (CGST+SGST+IGST) amount',
  discount_amount: 'Discount Applied on total_item_amount',
  item_packing_charges: 'Charges from DB',
  addon_groups: IAddonGroupDesc,
  addon_group_price: 'Sum of all total_addon_price from addon_groups',
  total_addon_group_price:
    '(total_addon_price from addon_groups)*item_quantity',
  total_addon_group_cgst_amount:
    '(Sum of all total_addon_cgst_amount from addon_groups)*item_quantity',
  total_addon_group_sgst_amount:
    '(Sum of all total_addon_sgst_amount from addon_groups)*item_quantity',
  total_addon_group_igst_amount:
    '(Sum of all total_addon_igst_amount from addon_groups)*item_quantity',
  total_addon_group_tax_amount:
    'Addon group tax => total_addon_group (cgst+sgst+igst) amount',
  total_individual_food_item_cost: 'total_addon_group_price+total_item_amount',
  total_individual_food_item_cgst:
    'item_cgst_amount + total_addon_group_cgst_amount',
  total_individual_food_item_sgst:
    'item_sgst_amount + total_addon_group_sgst_amount',
  total_individual_food_item_igst:
    'item_igst_amount + total_addon_group_igst_amount',
  total_individual_food_item_tax:
    'Item+Addon tax => total_individual_food_item (cgst+sgst+igst)',
};
const ICouponDetailDesc = {
  coupon_id: 'ID from DB',
  code: 'Code from DB',
  level: 'Level from DB',
  min_order_value_rupees: 'min_order_value_rupees from DB',
  type: 'Coupon type from DB',
  max_discount_rupees: 'Coupon max_discount_rupees from DB',
  discount_percentage: 'Coupon discount_percentage from DB',
  discount_amount_rupees: 'Coupon discount_amount_rupees from DB',
  discount_share_percentage_vendor:
    'Coupon discount_share_percentage_vendor from DB',
  discount_share_percentage_speedyy:
    'Coupon discount_share_percentage_speedyy from DB',
  discount_amount_applied:
    'Applicable discount amount calculated based on Other values',
  discount_share_amount_vendor:
    'discount_share_percentage_vendor applied on discount_amount_applied',
  discount_share_amount_speedyy:
    'discount_amount_applied - discount_share_amount_vendor',
};
export const IInvoiceBreakoutDesc = {
  menu_items: IMenuItemDesc,
  coupon_details: ICouponDetailDesc,
  delivery_order_id: 'Delivery partner order id from DB',
  packing_charge_type: 'Packing charge type none | order | item from DB',
  packing_charge: 'Order level packing charge rate or amount from DB',
  taxes_applicable_on_packing:
    'flag for taxes shoud be applied on packing charge',
  packing_cgst: 'CGST % applied on packing charges from DB',
  packing_sgst: 'SGST % applied on packing charges from DB',
  packing_igst: 'IGST % applied on packing charges from DB',
  packing_charge_cgst: 'Calculated CGST amount from packing_cgst',
  packing_charge_sgst: 'Calculated SGST amount from packing_sgst',
  packing_charge_igst: 'Calculated IGST amount from packing_igst',
  packing_charge_tax:
    'Sum packing_charge_cgst+packing_charge_sgst+packing_charge_igst',
  payment_transaction_id: 'Trx id from payment gateway',
  payout_transaction_id: 'payout trx id when payout is generated',
  packing_charge_fixed_percent: 'Packing charge type fixed | percent from DB',
  order_packing_charge:
    'Calculated Order level packing charge if fixed packing_charge if % packing_charge applied on order value as rate',
  total_food_cgst: 'Sum of all item total_individual_food_item_cgst',
  total_food_sgst: 'Sum of all item total_individual_food_item_sgst',
  total_food_igst: 'Sum of all item total_individual_food_item_igst',
  total_food_tax: 'Sum (total_food_cgst+total_food_sgst+total_food_sgst)',
  total_food_cost: 'Sum of All item total_individual_food_item_cost',
  total_packing_charges:
    'Chargable packing charges packing_charge_type if None=>0 if order=>order_packing_charge if item=> Sum(item_packing_charges) ',
  total_cgst: 'Sum of total_food_cgst and packing_charge_cgst',
  total_sgst: 'Sum of total_food_sgst and packing_charge_sgst',
  total_igst: 'Sum of total_food_igst and packing_charge_igst',
  total_tax: 'Sum total_cgst+total_sgst+total_igst',
  delivery_charge_paid_by: ' value from DB => customer | restaurant | speedyy',
  delivery_charges:
    'Delivery charges provided by delivery partner + Delivery cgst,sgst,igst amount',
  delivery_cgst: 'Delivery charges CGST % from DB',
  delivery_sgst: 'Delivery charges SGST % from DB',
  delivery_igst: 'Delivery charges IGST % from DB',
  transaction_charges_rate: 'Transaction charges rate from env',
  transaction_refund_charges_rate: 'Transaction refund charges rate from env',
  transaction_charges:
    'Calculated charges by transaction_charges_rate applied on total_customer_payable',
  transaction_refund_charges:
    'Calculated charges by transaction_charges_rate applied on total_customer_payable',
  total_customer_payable:
    'Sum of total_food_cost +total_tax+ total_packing_charges -discount_amount_applied if(delivery_charge_paid_by = customer)+ delivery',
  vendor_payout_amount:
    'Sum of total_food_cost + total_packing_charges -discount_share_amount_vendor if(delivery_charge_paid_by = restaurant)- delivery',
  version: '0.0.2',
};

const IInvoiceBreakoutVersion = {
  version: '0.0.2',
};

interface IAddonCost {
  addon_id: number;
  addon_name: string;
  addon_cgst: number;
  addon_sgst: number;
  addon_igst: number;
  addon_price: number;
  addon_display_price: number;
  gst_inclusive: boolean;
  addon_cgst_amount: number;
  addon_sgst_amount: number;
  addon_igst_amount: number;
  addon_tax_amount: number;
}
export interface IAddonGroupCost {
  addon_group_id: number;
  addon_group_name: string;
  addons: IAddonCost[];
  free_limit: number;
  total_addon_price: number;
  total_addon_cgst_amount: number;
  total_addon_sgst_amount: number;
  total_addon_igst_amount: number;
  total_addon_tax_amount: number;
}
interface IVariantCost {
  variant_group_id: number;
  variant_group_name: string;
  variant_id: number;
  variant_name: string;
  variant_price: number;
  variant_display_price: number;
}
interface IMenuItemCost {
  sequence: number;
  item_id: number;
  item_name: string;
  item_quantity: number;
  gst_inclusive: boolean;
  item_cgst: number;
  item_sgst: number;
  item_igst: number;
  item_price: number;
  item_display_price: number;
  variants: IVariantCost[];
  total_variant_cost: number;
  total_item_amount: number;
  tax_applied_on?: 'core' | 'total';
  item_cgst_amount: number;
  item_sgst_amount: number;
  item_igst_amount: number;
  item_tax_amount: number;
  discount_amount: number;
  item_packing_charges: number;
  item_packing_rate: number;
  addon_groups: IAddonGroupCost[];
  addon_group_price: number;
  total_addon_group_price: number;
  total_addon_group_tax_amount: number;
  total_addon_group_cgst_amount: number;
  total_addon_group_sgst_amount: number;
  total_addon_group_igst_amount: number;
  total_individual_food_item_cost: number;
  total_individual_food_item_cgst: number;
  total_individual_food_item_sgst: number;
  total_individual_food_item_igst: number;
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
  refund_settled_by: string;
  refund_settled_admin_id?: string;
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
  is_pod: boolean;
  delivery_order_id?: string;
  packing_charge_type: 'none' | 'order' | 'item';
  packing_charge: number;
  packing_cgst: number;
  packing_sgst: number;
  packing_igst: number;

  packing_charge_cgst: number;
  packing_charge_sgst: number;
  packing_charge_igst: number;
  payment_transaction_id?: string;
  payout_transaction_id?: string;
  packing_charge_fixed_percent?: 'fixed' | 'percent';
  order_packing_charge: number; //         As in Restaurant Table
  total_food_cgst: number;
  total_food_sgst: number;
  total_food_igst: number;
  total_food_tax: number;
  total_food_cost: number; //              Sum of all (item_price*item_quantity), total_addon_price price
  total_packing_charges: number; //        Sum of all item_packing_charges and order_packing_charge

  total_cgst: number;
  total_sgst: number;
  total_igst: number;
  total_tax: number; //                    Sum of item_tax_amount and total_addon_tax_amount
  delivery_charge_paid_by: 'customer' | 'restaurant' | 'speedyy';
  delivery_charges: number; //         on  total_food_value + total_taxes + total_packing_charges - coupon_amount >>> by shadow fax based on
  delivery_cgst: number;
  delivery_sgst: number;
  delivery_igst: number;
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
  description?: {
    version?: string;
  };
}
export function getPercentAmount(base_amount: number, rate: number): number {
  const result = (base_amount / 100) * rate;
  return roundUp(result, 2);
}

export class Invoice {
  breakout: IInvoiceBreakout = {
    menu_items: [],
    // delivery_order_id: string;
    // payment_transaction_id: string;
    // payout_transaction_id: string;
    is_pod: false,
    packing_charge_fixed_percent: 'fixed',
    packing_charge_type: 'none',
    packing_charge: 0,
    packing_cgst: 0,
    packing_sgst: 0,
    packing_igst: 0,
    taxes_applicable_on_packing: false,
    order_packing_charge: 0,
    total_packing_charges: 0,
    packing_charge_cgst: 0,
    packing_charge_sgst: 0,
    packing_charge_igst: 0,
    packing_charge_tax: 0,

    total_food_cost: 0,
    total_food_tax: 0,
    total_food_cgst: 0,
    total_food_sgst: 0,
    total_food_igst: 0,

    total_cgst: 0,
    total_sgst: 0,
    total_igst: 0,
    total_tax: 0,
    delivery_charges: 0,
    delivery_charge_paid_by: 'customer',
    delivery_cgst: 0,
    delivery_sgst: 0,
    delivery_igst: 0,
    transaction_charges_rate: 0,
    transaction_refund_charges_rate: 0,
    transaction_charges: 0, //      on  total_food_value + total_taxes + total_packing_charges - coupon_amount + delivery_charges >>> applied 2% (rate based on payment Method)
    transaction_refund_charges: 0,
    total_customer_payable: 0, //       total_food_value + total_taxes + total_packing_charges - coupon_amount + delivery_charges + transaction_charges
    // refundable_amount: 0, //            total_food_value + total_taxes - coupon_amount
    vendor_payout_amount: 0, //         total_food_value + total_taxes + total_packing_charges - coupon_value_vendor
    vendor_cancellation_charges: 0,
    description: IInvoiceBreakoutVersion,
  };

  private calculateAddon(addon: ICartAddon): IAddonCost {
    const addon_cost: IAddonCost = {
      addon_id: addon.addon_id!,
      gst_inclusive:
        addon.gst_inclusive === undefined ? true : addon.gst_inclusive,
      addon_name: addon.addon_name!,
      addon_cgst: addon.cgst_rate || 0,
      addon_sgst: addon.sgst_rate || 0,
      addon_igst: addon.igst_rate || 0,
      addon_price: addon.price || 0,
      addon_display_price: addon.display_price || 0,
      addon_cgst_amount: 0,
      addon_sgst_amount: 0,
      addon_igst_amount: 0,
      addon_tax_amount: 0,
    };

    if (!addon.gst_inclusive && addon_cost.addon_price > 0) {
      addon_cost.addon_cgst_amount = getPercentAmount(
        addon_cost.addon_price,
        addon_cost.addon_cgst
      );
      addon_cost.addon_sgst_amount = getPercentAmount(
        addon_cost.addon_price,
        addon_cost.addon_sgst
      );
      addon_cost.addon_igst_amount = getPercentAmount(
        addon_cost.addon_price,
        addon_cost.addon_igst
      );

      addon_cost.addon_tax_amount =
        addon_cost.addon_cgst_amount +
        addon_cost.addon_sgst_amount +
        addon_cost.addon_igst_amount;
    }
    return addon_cost;
  }
  private calculateAddonGroup(addon_group: ICartAddonGroup): IAddonGroupCost {
    const addon_group_cost: IAddonGroupCost = {
      addon_group_id: addon_group.addon_group_id!,
      addon_group_name: addon_group.addon_group_name,
      addons: [],
      free_limit: addon_group.free_limit || -1,
      total_addon_price: 0,
      total_addon_tax_amount: 0,

      total_addon_cgst_amount: 0,
      total_addon_sgst_amount: 0,
      total_addon_igst_amount: 0,
    };
    const addons = addon_group.addons;
    addons.sort((a, b) => {
      return (a.price || 0) - (b.price || 0);
    });
    if (addons) {
      for (let ad_cntr = 0; ad_cntr < addons.length; ad_cntr++) {
        const addon = addons[ad_cntr];
        if (addon && addon.is_selected) {
          const addon_cost = this.calculateAddon(addon);
          if (
            addon_group_cost.free_limit < 0 ||
            addon_group_cost.addons.length >= addon_group_cost.free_limit
          ) {
            addon_group_cost.total_addon_price += addon_cost.addon_price;
            addon_group_cost.total_addon_cgst_amount +=
              addon_cost.addon_cgst_amount;
            addon_group_cost.total_addon_sgst_amount +=
              addon_cost.addon_sgst_amount;
            addon_group_cost.total_addon_igst_amount +=
              addon_cost.addon_igst_amount;
            addon_group_cost.total_addon_tax_amount +=
              addon_cost.addon_tax_amount;
          }
          addon_group_cost.addons.push(addon_cost);
        }
      }
    }
    return addon_group_cost;
  }
  private calculateAddonGroups(
    menu_item_cost: IMenuItemCost,
    addon_groups?: ICartAddonGroup[]
  ): IMenuItemCost {
    if (addon_groups) {
      for (let ag_cntr = 0; ag_cntr < addon_groups.length; ag_cntr++) {
        const addon_group = addon_groups[ag_cntr];
        if (addon_group && addon_group.is_selected) {
          const addon_group_cost = this.calculateAddonGroup(addon_group);
          menu_item_cost.addon_groups.push(addon_group_cost);
          menu_item_cost.addon_group_price +=
            addon_group_cost.total_addon_price;
          menu_item_cost.total_addon_group_cgst_amount +=
            addon_group_cost.total_addon_cgst_amount;
          menu_item_cost.total_addon_group_sgst_amount +=
            addon_group_cost.total_addon_sgst_amount;
          menu_item_cost.total_addon_group_igst_amount +=
            addon_group_cost.total_addon_igst_amount;
        }
      }
    }
    menu_item_cost.total_addon_group_tax_amount =
      menu_item_cost.total_addon_group_cgst_amount +
      menu_item_cost.total_addon_group_sgst_amount +
      menu_item_cost.total_addon_group_igst_amount;

    menu_item_cost.total_addon_group_price =
      menu_item_cost.addon_group_price * menu_item_cost.item_quantity;

    menu_item_cost.total_addon_group_cgst_amount =
      menu_item_cost.total_addon_group_cgst_amount *
      menu_item_cost.item_quantity;
    menu_item_cost.total_addon_group_sgst_amount =
      menu_item_cost.total_addon_group_sgst_amount *
      menu_item_cost.item_quantity;
    menu_item_cost.total_addon_group_igst_amount =
      menu_item_cost.total_addon_group_igst_amount *
      menu_item_cost.item_quantity;
    menu_item_cost.total_addon_group_tax_amount =
      menu_item_cost.total_addon_group_tax_amount *
      menu_item_cost.item_quantity;

    return menu_item_cost;
  }
  private calculateVariants(
    menu_item_cost: IMenuItemCost,
    variant_groups?: ICartVariantGroup[]
  ): IMenuItemCost {
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
                  variant_display_price: variant.display_price || 0,
                };
                menu_item_cost.variants.push(variant_cost);
                menu_item_cost.total_variant_cost += variant_cost.variant_price;
              }
            }
          }
        }
      }
    }
    return menu_item_cost;
  }
  private caculateMenuItems(menu_items: ICartMenuITem[]) {
    for (let mi_cntr = 0; mi_cntr < menu_items.length; mi_cntr++) {
      const menu_item = menu_items[mi_cntr];
      if (menu_item && menu_item.quantity > 0) {
        let menu_item_cost: IMenuItemCost = {
          sequence: menu_item.sequence,
          item_id: menu_item.menu_item_id!,
          item_name: menu_item.menu_item_name,
          item_quantity: menu_item.quantity,
          item_cgst: menu_item.item_cgst || 0,
          item_sgst: menu_item.item_sgst_utgst || 0,
          item_igst: menu_item.item_igst || 0,
          item_price: menu_item.price || 0,
          item_display_price: menu_item.display_price || 0,
          tax_applied_on: menu_item.tax_applied_on,
          total_item_amount: 0,

          gst_inclusive:
            menu_item.item_inclusive === undefined
              ? true
              : menu_item.item_inclusive,
          item_cgst_amount: 0,
          item_sgst_amount: 0,
          item_igst_amount: 0,
          item_tax_amount: 0,
          discount_amount: 0,
          item_packing_rate: menu_item.packing_charges || 0,
          item_packing_charges: 0,
          addon_groups: [],
          variants: [],
          total_variant_cost: 0,
          addon_group_price: 0,
          total_addon_group_price: 0,
          total_addon_group_cgst_amount: 0,
          total_addon_group_sgst_amount: 0,
          total_addon_group_igst_amount: 0,
          total_addon_group_tax_amount: 0,
          total_individual_food_item_cost: 0,
          total_individual_food_item_cgst: 0,
          total_individual_food_item_sgst: 0,
          total_individual_food_item_igst: 0,
          total_individual_food_item_tax: 0,
        };
        menu_item_cost = this.calculateAddonGroups(
          menu_item_cost,
          menu_item.addon_groups
        );

        menu_item_cost = this.calculateVariants(
          menu_item_cost,
          menu_item.variant_groups
        );
        menu_item_cost.total_item_amount =
          (menu_item_cost.item_price + menu_item_cost.total_variant_cost) *
          menu_item_cost.item_quantity;

        menu_item_cost.total_individual_food_item_cost =
          menu_item_cost.total_item_amount +
          menu_item_cost.total_addon_group_price;

        this.breakout.total_food_cost +=
          menu_item_cost.total_individual_food_item_cost;

        this.breakout.menu_items.push(menu_item_cost);
      }
    }
  }
  private calculatePacking() {
    this.breakout.total_packing_charges = 0;
    if (
      this.breakout.packing_charge_type === 'order' &&
      this.breakout.packing_charge
    ) {
      if (this.breakout.packing_charge_fixed_percent === 'percent') {
        this.breakout.order_packing_charge = getPercentAmount(
          this.breakout.total_food_cost,
          this.breakout.packing_charge
        );
      } else {
        this.breakout.order_packing_charge = this.breakout.packing_charge;
      }
      this.breakout.total_packing_charges = this.breakout.order_packing_charge;
    }
    if (this.breakout.packing_charge_type === 'item') {
      this.breakout.menu_items.map(menu_item_cost => {
        if (this.breakout.packing_charge_fixed_percent === 'percent') {
          menu_item_cost.item_packing_charges = getPercentAmount(
            menu_item_cost.total_individual_food_item_cost,
            menu_item_cost.item_packing_rate
          );
        } else {
          menu_item_cost.item_packing_charges =
            menu_item_cost.item_packing_rate * menu_item_cost.item_quantity;
        }

        this.breakout.total_packing_charges +=
          menu_item_cost.item_packing_charges;
      });
    }

    if (this.breakout.taxes_applicable_on_packing) {
      this.breakout.packing_charge_cgst = getPercentAmount(
        this.breakout.total_packing_charges,
        this.breakout.packing_cgst
      );

      this.breakout.packing_charge_sgst = getPercentAmount(
        this.breakout.total_packing_charges,
        this.breakout.packing_sgst
      );

      this.breakout.packing_charge_igst = getPercentAmount(
        this.breakout.total_packing_charges,
        this.breakout.packing_igst
      );
      this.breakout.packing_charge_tax =
        this.breakout.packing_charge_cgst +
        this.breakout.packing_charge_sgst +
        this.breakout.packing_charge_igst;
    }
  }
  private calculateTax() {
    this.breakout.total_food_tax = 0;
    this.breakout.total_food_cgst = 0;
    this.breakout.total_food_sgst = 0;
    this.breakout.total_food_igst = 0;
    this.breakout.menu_items.map(menu_item_cost => {
      if (
        !menu_item_cost.gst_inclusive &&
        menu_item_cost.total_item_amount > 0
      ) {
        if (this.breakout.coupon_details?.level === CouponLevel.RESTAURANT) {
          menu_item_cost.item_cgst_amount = getPercentAmount(
            menu_item_cost.total_item_amount - menu_item_cost.discount_amount,
            menu_item_cost.item_cgst
          );

          menu_item_cost.item_sgst_amount = getPercentAmount(
            menu_item_cost.total_item_amount - menu_item_cost.discount_amount,
            menu_item_cost.item_sgst
          );

          menu_item_cost.item_igst_amount = getPercentAmount(
            menu_item_cost.total_item_amount - menu_item_cost.discount_amount,
            menu_item_cost.item_igst
          );
        } else {
          menu_item_cost.item_cgst_amount = getPercentAmount(
            menu_item_cost.total_item_amount,
            menu_item_cost.item_cgst
          );

          menu_item_cost.item_sgst_amount = getPercentAmount(
            menu_item_cost.total_item_amount,
            menu_item_cost.item_sgst
          );

          menu_item_cost.item_igst_amount = getPercentAmount(
            menu_item_cost.total_item_amount,
            menu_item_cost.item_igst
          );
        }
      }
      menu_item_cost.item_tax_amount = roundUp(
        menu_item_cost.item_cgst_amount +
          menu_item_cost.item_sgst_amount +
          menu_item_cost.item_igst_amount,
        2
      );

      menu_item_cost.total_individual_food_item_cgst =
        menu_item_cost.item_cgst_amount +
        menu_item_cost.total_addon_group_cgst_amount;
      menu_item_cost.total_individual_food_item_sgst =
        menu_item_cost.item_sgst_amount +
        menu_item_cost.total_addon_group_sgst_amount;
      menu_item_cost.total_individual_food_item_igst =
        menu_item_cost.item_igst_amount +
        menu_item_cost.total_addon_group_igst_amount;

      menu_item_cost.total_individual_food_item_tax =
        menu_item_cost.total_individual_food_item_cgst +
        menu_item_cost.total_individual_food_item_sgst +
        menu_item_cost.total_individual_food_item_igst;

      this.breakout.total_food_cgst +=
        menu_item_cost.total_individual_food_item_cgst;
      this.breakout.total_food_sgst +=
        menu_item_cost.total_individual_food_item_sgst;
      this.breakout.total_food_igst +=
        menu_item_cost.total_individual_food_item_igst;
      this.breakout.total_food_tax +=
        menu_item_cost.total_individual_food_item_tax;
    });
  }
  constructor(
    menuItemsData: ICartMenuITem[],
    restaurant: IRestaurant,
    is_pod: boolean
  ) {
    this.breakout.packing_charge_fixed_percent =
      restaurant.packing_charge_fixed_percent;
    this.breakout.packing_charge_type =
      restaurant.packing_charge_type || 'none';
    this.breakout.packing_charge =
      restaurant.packing_charge_order?.packing_charge || 0;
    this.breakout.taxes_applicable_on_packing =
      restaurant.taxes_applicable_on_packing || false;
    this.breakout.packing_cgst = restaurant.packing_cgst || 0;
    this.breakout.packing_sgst = restaurant.packing_sgst_utgst || 0;
    this.breakout.packing_igst = restaurant.packing_igst || 0;
    this.breakout.is_pod = is_pod;
    this.breakout.delivery_charge_paid_by =
      restaurant.delivery_charge_paid_by || 'customer';
    // this.breakout.delivery_cgst = restaurant.delivery_cgst;
    // this.breakout.delivery_sgst = restaurant.delivery_sgst;
    // this.breakout.delivery_igst = restaurant.delivery_igst;
    this.caculateMenuItems(menuItemsData);
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
    coupon_details.discount_amount_applied = 0;

    if (
      this.breakout.total_food_cost >= coupon_details.min_order_value_rupees
    ) {
      if (coupon_details.discount_percentage) {
        let max_available_discount = getPercentAmount(
          this.breakout.total_food_cost,
          coupon_details.discount_percentage
        );

        if (
          coupon_details.type === CouponType.UPTO &&
          max_available_discount > coupon_details.max_discount_rupees
        ) {
          max_available_discount = coupon_details.max_discount_rupees;
        }
        if (max_available_discount > this.breakout.total_food_cost)
          max_available_discount = this.breakout.total_food_cost;

        this.breakout.menu_items.map(menu_item => {
          let item_discount_amount = getPercentAmount(
            menu_item.total_individual_food_item_cost,
            coupon_details.discount_percentage!
          );

          if (item_discount_amount > max_available_discount) {
            item_discount_amount = max_available_discount;
          }
          if (item_discount_amount > 0) {
            menu_item.discount_amount = item_discount_amount;
            coupon_details.discount_amount_applied! += item_discount_amount;
            max_available_discount -= item_discount_amount;
          }
        });
      } else if (coupon_details.discount_amount_rupees) {
        let max_available_discount = coupon_details.discount_amount_rupees;

        if (max_available_discount > this.breakout.total_food_cost)
          max_available_discount = this.breakout.total_food_cost;

        this.breakout.menu_items.map(menu_item => {
          let item_discount_amount = menu_item.total_individual_food_item_cost;

          if (item_discount_amount > max_available_discount) {
            item_discount_amount = max_available_discount;
          }
          if (item_discount_amount > 0) {
            menu_item.discount_amount = item_discount_amount;
            coupon_details.discount_amount_applied! += item_discount_amount;
            max_available_discount -= item_discount_amount;
          }
        });
      }

      if (coupon_details.discount_share_percentage_vendor) {
        coupon_details.discount_share_amount_vendor = getPercentAmount(
          coupon_details.discount_amount_applied,
          coupon_details.discount_share_percentage_vendor
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
    this.breakout.delivery_charges += getPercentAmount(
      delivery_cost,
      this.breakout.delivery_cgst
    );
    this.breakout.delivery_charges += getPercentAmount(
      delivery_cost,
      this.breakout.delivery_sgst
    );
    this.breakout.delivery_charges += getPercentAmount(
      delivery_cost,
      this.breakout.delivery_igst
    );
    this.calculateTotals();
  }
  calculateTotals() {
    this.calculatePacking();
    this.calculateTax();
    this.breakout.total_cgst =
      this.breakout.total_food_cgst + this.breakout.packing_charge_cgst;
    this.breakout.total_sgst =
      this.breakout.total_food_sgst + this.breakout.packing_charge_sgst;
    this.breakout.total_igst =
      this.breakout.total_food_igst + this.breakout.packing_charge_igst;
    this.breakout.total_tax =
      this.breakout.total_food_tax + this.breakout.packing_charge_tax;

    this.breakout.transaction_charges_rate = +(
      process.env.ORDER_TRANSACTION_CHARGES_RATE || 3
    );
    this.breakout.transaction_refund_charges_rate = +(
      process.env.ORDER_REFUND_TRANSACTION_CHARGES_RATE || 3
    );

    this.breakout.total_customer_payable = this.breakout.total_food_cost;
    this.breakout.total_customer_payable += this.breakout.total_tax;
    this.breakout.total_customer_payable += this.breakout.total_packing_charges;
    this.breakout.total_customer_payable -=
      this.breakout.coupon_details?.discount_amount_applied || 0;
    if (this.breakout.delivery_charge_paid_by === 'customer') {
      this.breakout.total_customer_payable += this.breakout.delivery_charges;
    }
    this.breakout.total_customer_payable = roundUp(
      this.breakout.total_customer_payable,
      2
    );

    if (!this.breakout.is_pod) {
      this.breakout.transaction_charges = getPercentAmount(
        this.breakout.total_customer_payable,
        this.breakout.transaction_charges_rate
      );
    } else {
      this.breakout.transaction_charges = 0;
    }

    this.breakout.vendor_payout_amount = this.breakout.total_food_cost;
    // this.breakout.vendor_payout_amount += this.breakout.total_tax;
    this.breakout.vendor_payout_amount += this.breakout.total_packing_charges;
    this.breakout.vendor_payout_amount -=
      this.breakout.coupon_details?.discount_share_amount_vendor || 0;
    this.breakout.vendor_payout_amount -=
      this.breakout.transaction_charges || 0;
    if (this.breakout.delivery_charge_paid_by === 'restaurant') {
      this.breakout.vendor_payout_amount -= this.breakout.delivery_charges;
    }
    this.breakout.vendor_payout_amount = roundUp(
      this.breakout.vendor_payout_amount,
      2
    );

    //
    //
    //
    //
    //
    //

    this.breakout.transaction_refund_charges = this.breakout.total_food_cost;
    this.breakout.transaction_refund_charges += this.breakout.total_tax;
    this.breakout.transaction_refund_charges +=
      this.breakout.total_packing_charges;
    this.breakout.transaction_refund_charges -=
      this.breakout.coupon_details?.discount_amount_applied || 0;
    this.breakout.transaction_refund_charges += this.breakout.delivery_charges;
    this.breakout.transaction_refund_charges = getPercentAmount(
      this.breakout.transaction_refund_charges,
      this.breakout.transaction_refund_charges_rate
    );

    this.breakout.vendor_cancellation_charges = this.breakout.delivery_charges;
    this.breakout.vendor_cancellation_charges +=
      this.breakout.transaction_charges;
    this.breakout.vendor_cancellation_charges +=
      this.breakout.transaction_refund_charges;

    this.breakout.vendor_cancellation_charges = roundUp(
      this.breakout.vendor_cancellation_charges,
      2
    );
  }
}
