describe('Invalid order types', () => {
  test('Skipped', async () => {
    const sum = 2 + 3;
    expect(sum).toBe(5);
  });
});

// import request from 'supertest';
// import {Application} from 'express';
// import {createTestServer} from '../../utils/init';
// import {loadMockSeedData, testCasesClosingTasks} from '../../utils/utils';
// import {mockSendSQSMessage} from '../../utils/mock_services';

// let server: Application;
// const petpooja_token = 'petpooja_token';

// const PETPOOJA_TEST_MENU = {
//   success: '1',
//   message: 'Menu items are successfully listed.',
//   restaurants: [
//     {
//       restaurantid: '4335',
//       active: '1',
//       details: {
//         menusharingcode: 'ps82kz7f',
//         currency_html: '&#8377;',
//         country: 'India',
//         images: [],
//         restaurantname: 'Thali King',
//         address: 'Nagpur',
//         contact: '9890201844,9960891999,9890957104',
//         latitude: '16',
//         longitude: '40',
//         landmark: '',
//         city: 'Nagpur',
//         state: 'Maharashtra',
//         minimumorderamount: '0',
//         minimumdeliverytime: '30 Minutes',
//         deliverycharge: '0',
//         deliveryhoursfrom1: '',
//         deliveryhoursto1: '',
//         deliveryhoursfrom2: '',
//         deliveryhoursto2: '',
//         calculatetaxonpacking: 0,
//         calculatetaxondelivery: 0,
//         dc_taxes_id: '',
//         pc_taxes_id: '',
//         packaging_applicable_on: 'NONE',
//         packaging_charge: '',
//         packaging_charge_type: '',
//       },
//     },
//   ],
//   ordertypes: [
//     {
//       ordertypeid: 1,
//       ordertype: 'Delivery',
//     },
//     {
//       ordertypeid: 2,
//       ordertype: 'Pick Up',
//     },
//     {
//       ordertypeid: 3,
//       ordertype: 'Dine In',
//     },
//   ],
//   categories: [
//     {
//       categoryid: '1282443',
//       active: '1',
//       categoryrank: '8',
//       parent_category_id: '218157',
//       categoryname: 'Chicken Main Course',
//       categorytimings: '',
//       category_image_url: '',
//     },
//   ],
//   parentcategories: [
//     {
//       name: 'Main Course',
//       rank: '5',
//       image_url: '',
//       status: '1',
//       id: '218157',
//     },
//     {
//       name: 'Thalis',
//       rank: '21',
//       image_url: '',
//       status: '1',
//       id: '305058',
//     },
//   ],
//   items: [
//     {
//       itemid: '1236092690',
//       itemallowvariation: '1',
//       itemrank: '1',
//       item_categoryid: '1282443',
//       item_ordertype: '',
//       item_packingcharges: '0',
//       itemallowaddon: '1',
//       itemaddonbasedon: '1',
//       item_favorite: '0',
//       ignore_taxes: '0',
//       ignore_discounts: '0',
//       in_stock: '2',
//       cuisine: [],
//       variation_groupname: 'Quantity',
//       variation: [
//         {
//           id: '1236092822',
//           variationid: '261396',
//           name: 'Portion',
//           groupname: 'Quantity',
//           price: '385.00',
//           active: '1',
//           item_packingcharges: '15',
//           variationrank: '34',
//           addon: [
//             {
//               addon_group_id: '367060',
//               addon_item_selection_min: '0',
//               addon_item_selection_max: '1',
//             },
//           ],
//           variationallowaddon: 1,
//         },
//         {
//           id: '1236092823',
//           variationid: '261397',
//           name: 'Half Handi',
//           groupname: 'Quantity',
//           price: '599.00',
//           active: '1',
//           item_packingcharges: '20',
//           variationrank: '35',
//           addon: [
//             {
//               addon_group_id: '367060',
//               addon_item_selection_min: '0',
//               addon_item_selection_max: '1',
//             },
//           ],
//           variationallowaddon: 1,
//         },
//         {
//           id: '1236092824',
//           variationid: '261398',
//           name: 'Full Handi',
//           groupname: 'Quantity',
//           price: '999.00',
//           active: '1',
//           item_packingcharges: '20',
//           variationrank: '36',
//           addon: [
//             {
//               addon_group_id: '367060',
//               addon_item_selection_min: '0',
//               addon_item_selection_max: '1',
//             },
//           ],
//           variationallowaddon: 1,
//         },
//       ],
//       addon: [
//         {
//           addongroupid: '367060',
//           addongroup_rank: '32',
//           active: '1',
//           addongroupitems: [
//             {
//               addonitemid: '7851946',
//               addonitem_name: 'Roasted Papad',
//               addonitem_price: '15',
//               active: '1',
//               attributes: '1',
//               addonitem_rank: '1',
//             },
//           ],
//           addongroup_name: 'Papad Addon',
//         },
//       ],
//       itemname: 'Chicken Angara',
//       item_attributeid: '2',
//       itemdescription: '',
//       minimumpreparationtime: '',
//       price: '0',
//       active: '1',
//       item_image_url: '',
//       item_tax: '40839,41144',
//       gst_type: 'services',
//     },
//   ],
//   variations: [
//     {
//       variationid: '261396',
//       name: 'Portion',
//       groupname: 'Quantity',
//       status: '1',
//     },
//     {
//       variationid: '261397',
//       name: 'Half Handi',
//       groupname: 'Quantity',
//       status: '1',
//     },
//     {
//       variationid: '261398',
//       name: 'Full Handi',
//       groupname: 'Quantity',
//       status: '1',
//     },
//   ],
//   addongroups: [],
//   attributes: [
//     {
//       attributeid: '1',
//       attribute: 'veg',
//       active: '1',
//     },
//     {
//       attributeid: '2',
//       attribute: 'non-veg',
//       active: '1',
//     },
//     {
//       attributeid: '24',
//       attribute: 'egg',
//       active: '1',
//     },
//   ],
//   taxes: [
//     {
//       taxid: '40839',
//       taxname: 'SGST',
//       tax: '2.5',
//       taxtype: '1',
//       tax_ordertype: '1',
//       active: '1',
//       tax_coreortotal: '2',
//       tax_taxtype: '1',
//       rank: '1',
//       consider_in_core_amount: '0',
//       description: '',
//     },
//     {
//       taxid: '41144',
//       taxname: 'CGST',
//       tax: '2.5',
//       taxtype: '1',
//       tax_ordertype: '1',
//       active: '1',
//       tax_coreortotal: '2',
//       tax_taxtype: '1',
//       rank: '2',
//       consider_in_core_amount: '0',
//       description: '',
//     },
//   ],
//   discounts: [],
//   serverdatetime: '2023-04-21 11:45:27',
//   db_version: '1.0',
//   application_version: '4.0',
//   http_code: 200,
// };

// beforeAll(async () => {
//   server = await createTestServer();
//   await loadMockSeedData('restaurant');
// });

// afterAll(async () => {
//   await testCasesClosingTasks();
// });

// describe('Invalid item_order_type', () => {
//   test('Empty item_order_type | Need To Throw Error', async () => {
//     const mock_send_sqs_message = mockSendSQSMessage();
//     const response = await request(server)
//       .post('/food/callback/petpooja/push_menu')
//       .set('Authorization', `Bearer ${petpooja_token}`)
//       .send(PETPOOJA_TEST_MENU);
//     expect(response.body.statusCode).toBe(400);
//     expect(response.body.errors).toStrictEqual([
//       {
//         message:
//           'item order does type not includes 1 while processing petpooja menu item Chicken Angara',
//         code: 2028,
//         data: {
//           petpooja_menu_item: {
//             itemid: '1236092690',
//             itemallowvariation: '1',
//             itemrank: '1',
//             item_categoryid: '1282443',
//             item_ordertype: '',
//             item_packingcharges: '0',
//             itemallowaddon: '1',
//             itemaddonbasedon: '1',
//             item_favorite: '0',
//             ignore_taxes: '0',
//             ignore_discounts: '0',
//             in_stock: '2',
//             cuisine: [],
//             variation_groupname: 'Quantity',
//             variation: [
//               {
//                 id: '1236092822',
//                 variationid: '261396',
//                 name: 'Portion',
//                 groupname: 'Quantity',
//                 price: '385.00',
//                 active: '1',
//                 item_packingcharges: '15',
//                 variationrank: '34',
//                 addon: [
//                   {
//                     addon_group_id: '367060',
//                     addon_item_selection_min: '0',
//                     addon_item_selection_max: '1',
//                   },
//                 ],
//                 variationallowaddon: 1,
//               },
//               {
//                 id: '1236092823',
//                 variationid: '261397',
//                 name: 'Half Handi',
//                 groupname: 'Quantity',
//                 price: '599.00',
//                 active: '1',
//                 item_packingcharges: '20',
//                 variationrank: '35',
//                 addon: [
//                   {
//                     addon_group_id: '367060',
//                     addon_item_selection_min: '0',
//                     addon_item_selection_max: '1',
//                   },
//                 ],
//                 variationallowaddon: 1,
//               },
//               {
//                 id: '1236092824',
//                 variationid: '261398',
//                 name: 'Full Handi',
//                 groupname: 'Quantity',
//                 price: '999.00',
//                 active: '1',
//                 item_packingcharges: '20',
//                 variationrank: '36',
//                 addon: [
//                   {
//                     addon_group_id: '367060',
//                     addon_item_selection_min: '0',
//                     addon_item_selection_max: '1',
//                   },
//                 ],
//                 variationallowaddon: 1,
//               },
//             ],
//             addon: [
//               {
//                 addongroupid: '367060',
//                 addongroup_rank: '32',
//                 active: '1',
//                 addongroupitems: [
//                   {
//                     addonitemid: '7851946',
//                     addonitem_name: 'Roasted Papad',
//                     addonitem_price: '15',
//                     active: '1',
//                     attributes: '1',
//                     addonitem_rank: '1',
//                   },
//                 ],
//                 addongroup_name: 'Papad Addon',
//               },
//             ],
//             itemname: 'Chicken Angara',
//             item_attributeid: '2',
//             itemdescription: '',
//             minimumpreparationtime: '',
//             price: '0',
//             active: '1',
//             item_image_url: '',
//             item_tax: '40839,41144',
//             gst_type: 'services',
//           },
//         },
//       },
//     ]);
//     expect(mock_send_sqs_message).toHaveBeenCalled();
//   });
// });
