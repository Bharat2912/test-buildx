import {
  PetPoojaPackagingApplicableOn,
  PetPoojaPackagingChargeType,
  PosOrderStatus,
  PosStatus,
} from './enum';

export interface IPetPoojaInitOnboardingReq {
  id: string;
  pos_restaurant_id: string;
}

export interface IPetPoojaOnboardingReq {
  id: string;
}
export interface IPetPoojaDetachReq {
  id: string;
}

export interface IRestaurantPetpooja {
  id: string;
  pos_restaurant_id?: string;
  pos_id?: string;
  pos_status?: PosStatus;
  details?: {};
  initiated_at?: Date;
  onboarded_at?: Date;
  menu_last_updated_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface IPetPoojaGetRestaurantStatusReq {
  restID: string;
}
export interface IPetPoojaGetRestaurantStatusRes {
  http_code: 200;
  status: 'success';
  store_status: '1' | '0';
  message: 'Store Delivery Status fetched successfully';
}
export interface IPetPoojaSetRestaurantStatusReq {
  restID: string;
  store_status: 1 | 0;
  reason: string;
}
export interface IPetPoojaSetRestaurantStatusRes {
  http_code: 200;
  status: 'success';
  message: 'Store Status updated successfully for store restID';
}
export interface IPetPoojaSetItemAddonInStockReq {
  restID: string;
  type: 'item' | 'addon'; // possible values item (OR) addon
  inStock: true;
  itemID: string[];
}
export interface IPetPoojaSetItemAddonOutStockReq {
  restID: string;
  type: 'item' | 'addon'; // possible values item (OR) addon
  inStock: false;
  itemID: string[];
  autoTurnOnTime: 'custom';
  customTurnOnTime: '2020-02-24 18:00';
}
export interface IPetPoojaSetItemAddonStockRes {
  http_code: 200;
  status: 'success';
  message: 'Stock status updated successfully';
}

export interface IPetPoojaUpdateOrderReq {
  restID: string;
  orderID: string;
  status: PosOrderStatus;
  cancel_reason: string;
  minimum_prep_time: number;
  // minimum_delivery_time: '';
  // rider_name: '';
  // rider_phone_number: '';
  // is_modified: 'No';
}
export interface IPetPoojaUpdateOrderRes {
  http_code: 200;
  status: 'success';
  message: 'Order updated successfully';
}

export interface IPetPoojaPushMenu {
  success: '1';
  restaurants: IPetPoojaRestaurant[];
  message: string;
  ordertypes: [
    {
      ordertypeid: 1;
      ordertype: 'Delivery';
    },
    {
      ordertypeid: 2;
      ordertype: 'PickUp';
    },
    {
      ordertypeid: 3;
      ordertype: 'DineIn';
    }
  ];
  categories: IPetPoojaCategory[];
  parentcategories: IPetpoojaParentCategory[];
  items: IPetPoojaMenuItem[];
  //!deprecated  variations: IPetPoojaVariation[];
  addongroups: IPetPoojaAddonGroup[];
  attributes: IPetPoojaAttribute[];
  discounts: IPetPoojaDiscount[];
  taxes: IPetPoojaTax[];
  serverdatetime: string; //'2022-01-1811:33:13';
  db_version: string; //'1.0';
  application_version: string; //'4.0';
  http_code: number; //200;
}

export interface IPetPoojaAttribute {
  attributeid: string;
  attribute: string;
  active: '1' | '0';
}
// [{
//   attributeid: '1';
//   attribute: 'veg';
//   active: '1' | '0';
// },
// {
//   attributeid: '2';
//   attribute: 'non-veg';
//   active: '1' | '0';
// },
// {
//   attributeid: '5';
//   attribute: 'other';
//   active: '1' | '0';
// },
// {
//   attributeid: '24';
//   attribute: 'egg';
//   active: '1' | '0';
// }]

export interface IPetPoojaRestaurant {
  restaurantid: string; //"xxxxx",
  active: string; //"1",
  details: {
    menusharingcode: string; //"xxxxxx",
    currency_html: string; //"₹",
    country: string; //"India",
    images: string[]; //[]
    restaurantname: string; //"Heaven",
    address: string; //"nearsargasan,sghighway,Gandhinagar",
    contact: string; //"9998696995",
    latitude: string; //"23.190394",
    longitude: string; //"72.610591",
    landmark: string; //"",
    city: string; //"Ahmedabad",
    state: string; //"Gujarat",
    minimumorderamount: string; //"0",
    minimumdeliverytime: string; //"60Minutes",
    deliverycharge: string; //"50",
    deliveryhoursfrom1: string; //"",
    deliveryhoursto1: string; //"",
    deliveryhoursfrom2: string; //"",
    deliveryhoursto2: string; //"",
    sc_applicable_on?: string; //"H,P,D",Service charge applicable on DineIn,Parcel & Home Delivery orders
    sc_type?: string; //"2",1-Fixed or 2-Percentage
    sc_calculate_on?: string; //Allowed values 1-CORE or 2-TOTAL
    sc_value?: string; //"5",
    tax_on_sc: string; //1 - Applicable, 0 - Not Applicable
    calculatetaxonpacking: 0 | 1;
    pc_taxes_id: string;
    calculatetaxondelivery: 0 | 1;
    dc_taxes_id: string; //"11213,20375",
    packaging_applicable_on: PetPoojaPackagingApplicableOn; //NONE, ITEM, ORDER
    packaging_charge: string; //"20",
    packaging_charge_type: PetPoojaPackagingChargeType; //PERCENTAGE, FIXED
  };
}

export interface IPetpoojaParentCategory {
  name: string;
  rank: string;
  image_url: string;
  status: string;
  id: string;
}

export interface IPetPoojaCategory {
  categoryid: string; //"500773",
  active: '1' | '0'; //"1",
  categoryrank: string; //"16",
  parent_category_id: string; //"0",
  categoryname: string; //"Pizzaandsides",
  categorytimings: string; //"",
  category_image_url: string; //""
}

export interface IPetPoojaMenuItem {
  itemid: string; //'118829149';
  itemallowvariation: '1' | '0'; //1 - Item with varaition , 0 - Item without variation
  itemrank: string; //'52';
  item_categoryid: string; //'500773';
  item_ordertype: string; //'1,2,3';
  item_packingcharges: string; // '';
  itemallowaddon: '1' | '0'; //1 - Item with addon , 0 - Item without addon
  itemaddonbasedon: '1' | '0'; //0 = Addon group applied on item, 1 = Addon group applied variation wise
  item_favorite: '1' | '0'; //'0';
  ignore_taxes: '1' | '0'; //'0';
  ignore_discounts: '1' | '0'; //'0';
  in_stock: string; //'2';
  cuisine: string[];
  variation_groupname: string; //'';
  variation: IPetPoojaVariation[];
  addon: IPetPoojaAddonGroupAssociation[];
  itemname: string; //'Veg Loaded Pizza';
  item_attributeid: string; //1- Veg, 2- Non-Veg, 5- Other, 24- Egg
  itemdescription: string; //'';
  minimumpreparationtime: string; //'';
  price: string; //'100';
  active: '1' | '0'; //'1';
  item_image_url: string; //'';
  item_tax: string; //'11213,20375';
  nutrition?: IPetPoojaNutrition | {};
}

export interface IPetPoojaNutrition {
  additiveMap?: {
    Polyols: IPetPoojaNutritionDetails;
  };
  allergens?: [
    {
      allergen: string; // 'gluten';
      allergenDesc: string; // 'gluten';
    }
  ];
  foodAmount?: IPetPoojaNutritionDetails;
  calories?: IPetPoojaNutritionDetails;
  protien?: IPetPoojaNutritionDetails;
  minerals?: IPetPoojaNutritionDetails[];
  sodium?: IPetPoojaNutritionDetails;
  carbohydrate?: IPetPoojaNutritionDetails;
  totalSugar?: IPetPoojaNutritionDetails;
  addedSugar?: IPetPoojaNutritionDetails;
  totalFat?: IPetPoojaNutritionDetails;
  saturatedFat?: IPetPoojaNutritionDetails;
  transFat?: IPetPoojaNutritionDetails;
  cholesterol: IPetPoojaNutritionDetails;
  vitamins?: IPetPoojaNutritionDetails[];
  additionalInfo?: {
    info: string; //'info';
    remark: string; //'remark';
  };
  fiber?: IPetPoojaNutritionDetails;
  servingInfo?: string; //'1to2people';
}

export interface IPetPoojaNutritionDetails {
  name?: string;
  amount: number; //1;
  unit: string; //'g';
}

export interface IPetPoojaTax {
  restaurant_id?: string;
  taxid: string; // '21866';
  taxname: 'CGST' | 'SGST';
  tax: string; // '9';
  taxtype: '1' | '2'; // 1= Percentage , 2 = Fixed
  tax_ordertype: string; //[1=Delivery,2=Pick Up,3=Dine In]
  active: '0' | '1'; // '1';
  tax_coreortotal: '1' | '2'; // 1 = Add on Total, 2 = Add on Core
  tax_taxtype: '1' | '2'; // 1 = forward tax, 2 = backward tax
  rank: string; // '5';
  description: string; // '';
  consider_in_core_amount: '0' | '1';
}
export interface IPetpoojaItemTax {
  restaurant_id?: string;
  item_pos_id: string;
  tax_pos_id: string;
}
export interface IPetPoojaItemTaxDetails
  extends IPetpoojaItemTax,
    IPetPoojaTax {}
export interface IPetPoojaDiscount {
  discountid: string; //'363';
  discountname: string; //'Introductory Off';
  discounttype: string; //'1';
  discount: string; //'10';
  discountordertype: string; //'1,2,3';
  discountapplicableon: string; //'Items';
  discountdays: string; //'All';
  active: string; //'1';
  discountontotal: string; //'0';
  discountstarts: string; //'';
  discountends: string; //'';
  discounttimefrom: string; //'';
  discounttimeto: string; //'';
  discountminamount: string; //'';
  discountmaxamount: string; //'';
  discounthascoupon: string; //'0';
  discountcategoryitemids: string; //'7765809,7765862,7765097,118807411';
  discountmaxlimit: string; //'';
}

export interface IPetPoojaAddon {
  addonitemid: string; //'1150810';
  addonitem_name: string; //'Egg';
  addonitem_price: string; //'20';
  active: '1' | '0'; //'1';
  attributes: string; //'24';
  addonitem_rank: string; //'1';
}

export interface IPetPoojaAddonGroup {
  addongroupid: string; //'135707';
  addongroup_rank: string; //'15';
  active: '1' | '0';
  addongroupitems: IPetPoojaAddon[];
  addongroup_name: string; //'Extra Toppings';
}
export interface IPetPoojaAddonGroupAssociation {
  addon_group_id: string; //'135699';
  addon_item_selection_min: string; //'0';
  addon_item_selection_max: string; //'1';
}
export interface IPetPoojaVariation {
  id: string;
  variationid: string; //'104220';
  name: string; //'Large';
  groupname: string; //'Quantity';
  price: string;
  active: '1' | '0';
  item_packingcharges: '0' | '1';
  variationrank: string;
  addon: IPetPoojaAddonGroupAssociation[];
  variationallowaddon: '0' | '1';
}

export interface IPetPoojaSaveOrder {
  orderinfo: {
    OrderInfo: {
      Restaurant: {
        details: {
          res_name?: string; //'Dynamite Lounge';
          address?: string; //'2nd Floor, Reliance Mall, Nr.Akshar Chowk';
          contact_information?: string; //'9427846660';
          restID: string; //'xxxxxx';
        };
      };
      Customer?: {
        details: {
          email?: string; //'xxx@yahoo.com';
          name?: string; //Advait';
          address?: string; //2, Amin Society, Naranpura';
          phone?: string; //9090909090';
          latitude?: string; //34.11752681212772';
          longitude?: string; //74.72949172653219';
        };
      };
      Order: {
        details: {
          orderID: string; //A-1';  //speedyy system id
          preorder_date: string; //'yyyy-mm-dd';
          preorder_time: string; //'HH:mm:ss';
          delivery_charges?: string; //'50';
          order_type: 'H' | 'P' | 'D'; //H = Home Delivery, P = Parcel,D = Dine In
          advanced_order?: 'Y' | 'N'; //N';
          payment_type: 'COD' | 'CARD' | 'CREDIT' | 'ONLINE' | 'OTHER'; //COD';
          table_no?: string; //';
          no_of_persons?: string; //0';
          discount_total?: string; //45';
          tax_total?: string; //65.52';
          discount_type?: 'F' | 'P' | ''; //F';
          total?: string; //560';
          description?: string; //Any special instructions provided for order
          created_on: string; //Order creation date/time. Format:yyyy-mm-dd H:i:s
          packing_charges?: string; //20';
          enable_delivery?: 0 | 1; //0 means Rider from thirdparty side will come and 1 means Rider from Restaurant
          min_prep_time?: number; //20;
          callback_url: string; //https.xyz.abc';
          service_charge: string; //0';
          sc_tax_amount: string; //0';
          dc_tax_amount: string; //2.5';          //dc delivery charge
          dc_gst_details: IPetPoojaGst[];
          pc_tax_amount: string; //1';
          pc_gst_details: IPetPoojaGst[];
        };
      };
      OrderItem: {
        details: IPetPoojaOrderItem[];
      };
      Tax: {
        details: IPetPoojaOrderTax[];
      };
      Discount: {
        details: IPetPoojaOrderDiscount[];
      };
    };
    udid?: string;
    device_type: 'Web' | 'Mobile'; //Web';
  };
}

export interface IPetPoojaOrderDiscount {
  id: string; //362';
  title: string; //Discount';
  type: 'F' | 'P';
  price: string; //45';
}

export interface IPetPoojaOrderTax {
  id: string; //21867';
  title: string; //SGST';
  type: 'P' | 'F'; //P';
  price: string; //9';
  tax: string; //25.11';
  restaurant_liable_amt: string; //25.11';
}

export interface IPetPoojaOrderItemTax {
  id: string; //11213';
  name: string; //CGST';
  amount: string; //2.75';
}

export interface IPetPoojaOrderItemAddon {
  id: string; //1150783';
  name: string; //Mojito';
  group_name: string; //Add Beverage';
  price: string; //0';
  group_id: string; //135699;
  quantity: string; //1';
}

export interface IPetPoojaOrderItem {
  id: string; //118829149';
  name: string; //Veg Loaded Pizza';
  gst_liability: 'vendor' | 'restaurant'; //vendor';
  item_tax: IPetPoojaOrderItemTax[];
  item_discount: string; //';
  price: string; //110.00';
  final_price: string; //110.00';
  quantity: string; //1';
  description: string; //';
  variation_name: string; //';
  variation_id: string; //';
  AddonItem: {
    details: IPetPoojaOrderItemAddon[];
  };
}

export interface IPetPoojaGst {
  gst_liable: 'vendor' | 'restaurant'; //vendor';
  amount: string; //1';
}

export interface IPetPoojaSaveOrderResponse {
  success: string; //'1';
  message: string; //'Your order is saved.';
  restID: string;
  clientOrderID: string; //'A-1';
  orderID: string; //'26';
}
