import {IPetPoojaPushMenu} from '../../module/food/petpooja/types';
import {
  PetPoojaPackagingApplicableOn,
  PetPoojaPackagingChargeType,
} from '../../module/food/petpooja/enum';
/**
 * Restaurants: 1
 * Main Categpries: 1
 * Sub Categories: 3
 * Menu Items: 3
 * Addon Groups: 4
 * Adoons: 10
 * Variant Groups: 1
 * Variants: 2
 */

export const PETPOOJA_TEST_MENU: IPetPoojaPushMenu = {
  success: '1',
  message: 'Menu items are successfully listed.',
  restaurants: [
    {
      restaurantid: '4335',
      active: '1',
      details: {
        menusharingcode: 'ps82kz7f',
        currency_html: '&#8377;',
        country: 'India',
        images: [],
        restaurantname: 'Speedyy',
        address: 'Mumbai, India',
        contact: '1234567890',
        latitude: '1',
        longitude: '1',
        landmark: '',
        city: 'Mumbai',
        state: 'Maharashtra',
        minimumorderamount: '0',
        minimumdeliverytime: '30 Minutes',
        deliverycharge: '0',
        deliveryhoursfrom1: '',
        deliveryhoursto1: '',
        deliveryhoursfrom2: '',
        deliveryhoursto2: '',
        sc_applicable_on: '',
        sc_type: '',
        sc_calculate_on: '',
        sc_value: '',
        tax_on_sc: '',
        calculatetaxonpacking: 0,
        calculatetaxondelivery: 0,
        dc_taxes_id: '',
        pc_taxes_id: '',
        packaging_applicable_on: PetPoojaPackagingApplicableOn.NONE,
        packaging_charge: '',
        packaging_charge_type: PetPoojaPackagingChargeType.EMPTY_STRING,
      },
    },
  ],
  ordertypes: [
    {
      ordertypeid: 1,
      ordertype: 'Delivery',
    },
    {
      ordertypeid: 2,
      ordertype: 'PickUp',
    },
    {
      ordertypeid: 3,
      ordertype: 'DineIn',
    },
  ],
  categories: [
    {
      categoryid: '72541',
      active: '1',
      categoryrank: '1',
      parent_category_id: '0',
      categoryname: 'Pizza',
      categorytimings: '',
      category_image_url: '',
    },
    {
      categoryid: '72560',
      active: '1',
      categoryrank: '1',
      parent_category_id: '1',
      categoryname: 'Tandoori Starters',
      categorytimings: '',
      category_image_url: '',
    },
    {
      categoryid: '72544',
      active: '1',
      categoryrank: '1',
      parent_category_id: '1',
      categoryname: 'Panner Starters',
      categorytimings: '',
      category_image_url: '',
    },
  ],
  parentcategories: [
    {
      name: 'Starters',
      rank: '1',
      image_url: '',
      status: '1',
      id: '1',
    },
  ],
  items: [
    {
      itemid: '10464639',
      itemallowvariation: '0',
      itemrank: '1',
      item_categoryid: '72544',
      item_ordertype: '1,2,3',
      item_packingcharges: '0',
      itemallowaddon: '0',
      itemaddonbasedon: '0',
      item_favorite: '0',
      ignore_taxes: '0',
      ignore_discounts: '0',
      in_stock: '1',
      cuisine: [],
      variation_groupname: '',
      variation: [],
      addon: [],
      itemname: 'Pudina Chaap',
      item_attributeid: '1',
      itemdescription: '',
      minimumpreparationtime: '',
      price: '375.00',
      active: '1',
      item_image_url: '',
      item_tax: '1983,1984',
    },
    {
      itemid: '10464922',
      itemallowvariation: '0',
      itemrank: '1',
      item_categoryid: '72560',
      item_ordertype: '',
      item_packingcharges: '0',
      itemallowaddon: '1',
      itemaddonbasedon: '0',
      item_favorite: '0',
      ignore_taxes: '0',
      ignore_discounts: '0',
      in_stock: '2',
      cuisine: [],
      variation_groupname: '',
      variation: [],
      addon: [
        {
          addon_group_id: '8382',
          addon_item_selection_min: '0',
          addon_item_selection_max: '4',
        },
        {
          addon_group_id: '8383',
          addon_item_selection_min: '0',
          addon_item_selection_max: '2',
        },
        {
          addon_group_id: '8385',
          addon_item_selection_min: '0',
          addon_item_selection_max: '1',
        },
        {
          addon_group_id: '8384',
          addon_item_selection_min: '0',
          addon_item_selection_max: '1',
        },
      ],
      itemname: 'Afghani Chaap',
      item_attributeid: '1',
      itemdescription: '',
      minimumpreparationtime: '',
      price: '355.00',
      active: '1',
      item_image_url:
        'https://online-logo.thumb_2022_06_13_13_52_58_Afghani_Chaap.jpg',
      item_tax: '1983,1984',
    },
    {
      itemid: '10464621',
      itemallowvariation: '1',
      itemrank: '1',
      item_categoryid: '72541',
      item_ordertype: '2,3',
      item_packingcharges: '0',
      itemallowaddon: '0',
      itemaddonbasedon: '0',
      item_favorite: '0',
      ignore_taxes: '0',
      ignore_discounts: '0',
      in_stock: '2',
      cuisine: [],
      variation_groupname: 'Size',
      variation: [
        {
          id: '10464958',
          variationid: '7218',
          name: '8 Inch',
          groupname: 'Size',
          price: '290.00',
          active: '1',
          item_packingcharges: '0',
          variationrank: '1',
          addon: [],
          variationallowaddon: '0',
        },
        {
          id: '10464959',
          variationid: '7219',
          name: '12 Inch',
          groupname: 'Size',
          price: '505.00',
          active: '1',
          item_packingcharges: '0',
          variationrank: '2',
          addon: [],
          variationallowaddon: '1',
        },
      ],
      addon: [],
      itemname: 'Arrosteo Bells Pizza',
      item_attributeid: '1',
      itemdescription: '',
      minimumpreparationtime: '',
      price: '0',
      active: '1',
      item_image_url: '',
      item_tax: '1983,1984',
    },
  ],
  // variations: [
  //   {
  //     variationid: '7218',
  //     name: '8 Inch',
  //     groupname: 'Size',
  //     status: '1',
  //   },
  //   {
  //     variationid: '7219',
  //     name: '12 Inch',
  //     groupname: 'Size',
  //     status: '1',
  //   },
  // ],
  addongroups: [
    {
      addongroupid: '8382',
      addongroup_rank: '1',
      active: '1',
      addongroupitems: [
        {
          addonitemid: '28411',
          addonitem_name: 'Coffee',
          addonitem_price: '63.75',
          active: '1',
          attributes: '1',
          addonitem_rank: '2',
        },
        {
          addonitemid: '28413',
          addonitem_name: 'Salt Fresh Lime Soda',
          addonitem_price: '68',
          active: '1',
          attributes: '1',
          addonitem_rank: '3',
        },
        {
          addonitemid: '28415',
          addonitem_name: 'Sweet Fresh Lime Soda',
          addonitem_price: '68',
          active: '1',
          attributes: '1',
          addonitem_rank: '4',
        },
        {
          addonitemid: '28417',
          addonitem_name: 'Virgin Mojito',
          addonitem_price: '110.5',
          active: '1',
          attributes: '1',
          addonitem_rank: '5',
        },
      ],
      addongroup_name: 'Beverages',
    },
    {
      addongroupid: '8383',
      addongroup_rank: '2',
      active: '1',
      addongroupitems: [
        {
          addonitemid: '28419',
          addonitem_name: 'Manchow Soup',
          addonitem_price: '106.25',
          active: '1',
          attributes: '1',
          addonitem_rank: '1',
        },
        {
          addonitemid: '28421',
          addonitem_name: 'Hot And Sour Soup',
          addonitem_price: '106.25',
          active: '1',
          attributes: '1',
          addonitem_rank: '2',
        },
      ],
      addongroup_name: 'Sides',
    },
    {
      addongroupid: '8384',
      addongroup_rank: '3',
      active: '1',
      addongroupitems: [
        {
          addonitemid: '28471',
          addonitem_name: 'Paneer Achari Tikka',
          addonitem_price: '284.75',
          active: '1',
          attributes: '1',
          addonitem_rank: '1',
        },
        {
          addonitemid: '28473',
          addonitem_name: 'Paneer Tikka',
          addonitem_price: '284.75',
          active: '1',
          attributes: '1',
          addonitem_rank: '2',
        },
        {
          addonitemid: '28475',
          addonitem_name: 'Aloo Stuffed',
          addonitem_price: '272',
          active: '1',
          attributes: '1',
          addonitem_rank: '3',
        },
      ],
      addongroup_name: 'Starters Add Ons',
    },
    {
      addongroupid: '8385',
      addongroup_rank: '4',
      active: '1',
      addongroupitems: [
        {
          addonitemid: '28451',
          addonitem_name: 'Cheesy Loaded Fries',
          addonitem_price: '170',
          active: '1',
          attributes: '1',
          addonitem_rank: '1',
        },
      ],
      addongroup_name: 'Addons Starters',
    },
  ],
  attributes: [
    {
      attributeid: '1',
      attribute: 'veg',
      active: '1',
    },
  ],
  discounts: [],
  taxes: [
    {
      taxid: '1984',
      taxname: 'CGST',
      tax: '2.5',
      taxtype: '1',
      tax_ordertype: '1,2,3',
      active: '1',
      tax_coreortotal: '2',
      tax_taxtype: '1',
      rank: '1',
      consider_in_core_amount: '0',
      description: '',
    },
    {
      taxid: '1983',
      taxname: 'SGST',
      tax: '2.5',
      taxtype: '1',
      tax_ordertype: '1,2,3',
      active: '1',
      tax_coreortotal: '2',
      tax_taxtype: '1',
      rank: '2',
      consider_in_core_amount: '0',
      description: '',
    },
  ],
  serverdatetime: '2023-02-03 18:15:09',
  db_version: '1.0',
  application_version: '4.0',
  http_code: 200,
  //error: '',
};

/**
 * Restaurants: 1
 * Main Categpries: 0
 * Sub Categories: 1
 * Menu Items: 1
 * Addon Groups: 2
 * Adoons: 6
 * Variant Groups: 0
 * Variants: 0
 */
export const PETPOOJA_ADDON_TEST_MENU = {
  success: '1',
  restaurants: [
    {
      restaurantid: '4335',
      active: '1',
      details: {
        menusharingcode: 'ps82kz7f',
        currency_html: '&#8377;',
        country: 'India',
        images: [],
        restaurantname: 'Speedyy',
        address: 'Mumbai, India',
        contact: '1234567890',
        latitude: '1',
        longitude: '1',
        landmark: '',
        city: 'Mumbai',
        state: 'Maharashtra',
        minimumorderamount: '0',
        minimumdeliverytime: '30 Minutes',
        deliverycharge: '0',
        deliveryhoursfrom1: '',
        deliveryhoursto1: '',
        deliveryhoursfrom2: '',
        deliveryhoursto2: '',
        calculatetaxonpacking: 0,
        calculatetaxondelivery: 0,
        dc_taxes_id: '',
        pc_taxes_id: '',
        packaging_applicable_on: 'NONE',
        packaging_charge: '',
        packaging_charge_type: 'NONE',
      },
    },
  ],
  ordertypes: [
    {
      ordertypeid: 1,
      ordertype: 'Delivery',
    },
    {
      ordertypeid: 2,
      ordertype: 'PickUp',
    },
    {
      ordertypeid: 3,
      ordertype: 'DineIn',
    },
  ],
  categories: [
    {
      categoryid: '500773',
      active: '1',
      categoryrank: '16',
      parent_category_id: '0',
      categoryname: 'Pizzaandsides',
      categorytimings: '',
      category_image_url: '',
    },
  ],
  parentcategories: [],
  items: [
    {
      itemid: '118829149',
      itemallowvariation: '0',
      itemrank: '52',
      item_categoryid: '500773',
      item_ordertype: '1,2,3',
      item_packingcharges: '',
      itemallowaddon: '1',
      itemaddonbasedon: '0',
      item_favorite: '0',
      ignore_taxes: '0',
      ignore_discounts: '0',
      in_stock: '2',
      cuisine: ['Italian', 'Mexican'],
      variation_groupname: '',
      variation: [],
      addon: [
        {
          addon_group_id: '135699',
          addon_item_selection_min: '0',
          addon_item_selection_max: '1',
        },
        {
          addon_group_id: '135707',
          addon_item_selection_min: '0',
          addon_item_selection_max: '4',
        },
      ],
      itemname: 'Veg Loaded Pizza',
      item_attributeid: '1',
      itemdescription: '',
      minimumpreparationtime: '',
      price: '100',
      active: '1',
      item_image_url: '',
      item_tax: '11213,20375',
      nutrition: {
        additiveMap: {
          Polyols: {
            amount: 1,
            unit: 'g',
          },
        },
        allergens: [
          {
            allergen: 'gluten',
            allergenDesc: 'gluten',
          },
        ],
        foodAmount: {
          amount: 1,
          unit: 'g',
        },
        calories: {
          amount: 1,
          unit: 'kcal',
        },
        protien: {
          amount: 1,
          unit: 'g',
        },
        minerals: [
          {
            name: 'a',
            amount: 1,
            unit: 'g',
          },
        ],
        sodium: {
          amount: 1,
          unit: 'mg',
        },
        carbohydrate: {
          amount: 1,
          unit: 'g',
        },
        totalSugar: {
          amount: 1,
          unit: 'g',
        },
        addedSugar: {
          amount: 1,
          unit: 'g',
        },
        totalFat: {
          amount: 1,
          unit: 'g',
        },
        saturatedFat: {
          amount: 1,
          unit: 'g',
        },
        transFat: {
          amount: 1,
          unit: 'g',
        },
        cholesterol: {
          amount: 1,
          unit: 'g',
        },
        vitamins: [
          {
            name: 'a',
            amount: 1,
            unit: 'g',
          },
        ],
        additionalInfo: {
          info: 'info',
          remark: 'remark',
        },
        fiber: {
          amount: 1,
          unit: 'g',
        },
        servingInfo: '1to2people',
      },
    },
  ],
  variations: [],
  addongroups: [
    {
      addongroupid: '135699',
      addongroup_rank: '3',
      active: '1',
      addongroupitems: [
        {
          addonitemid: '1150783',
          addonitem_name: 'Mojito',
          addonitem_price: '0',
          active: '1',
          attributes: '1',
          addonitem_rank: '1',
        },
        {
          addonitemid: '1150784',
          addonitem_name: 'Hazelnut Mocha',
          addonitem_price: '10',
          active: '1',
          attributes: '1',
          addonitem_rank: '1',
        },
      ],
      addongroup_name: 'Add Beverage',
    },
    {
      addongroupid: '135707',
      addongroup_rank: '15',
      active: '1',
      addongroupitems: [
        {
          addonitemid: '1150810',
          addonitem_name: 'Egg',
          addonitem_price: '20',
          active: '1',
          attributes: '24',
          addonitem_rank: '1',
        },
        {
          addonitemid: '1150811',
          addonitem_name: 'Jalapenos',
          addonitem_price: '20',
          active: '1',
          attributes: '1',
          addonitem_rank: '1',
        },
        {
          addonitemid: '1150812',
          addonitem_name: 'Onion Rings',
          addonitem_price: '20',
          active: '1',
          attributes: '1',
          addonitem_rank: '1',
        },
        {
          addonitemid: '1150813',
          addonitem_name: 'Cheese',
          addonitem_price: '10',
          active: '1',
          attributes: '1',
          addonitem_rank: '1',
        },
      ],
      addongroup_name: 'Extra Toppings',
    },
  ],
  attributes: [
    {
      attributeid: '1',
      attribute: 'veg',
      active: '1',
    },
  ],
  discounts: [],
  taxes: [
    {
      taxid: '1984',
      taxname: 'CGST',
      tax: '2.5',
      taxtype: '1',
      tax_ordertype: '1,2,3',
      active: '1',
      tax_coreortotal: '2',
      tax_taxtype: '1',
      rank: '1',
      consider_in_core_amount: '0',
      description: '',
    },
    {
      taxid: '1983',
      taxname: 'SGST',
      tax: '2.5',
      taxtype: '1',
      tax_ordertype: '1,2,3',
      active: '1',
      tax_coreortotal: '2',
      tax_taxtype: '1',
      rank: '2',
      consider_in_core_amount: '0',
      description: '',
    },
  ],
  serverdatetime: '2023-02-03 18:15:09',
  db_version: '1.0',
  application_version: '4.0',
  http_code: 200,
  error: '',
};
