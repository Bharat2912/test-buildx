import {IOrder, IOrderDetails} from './types';
import {
  TDocumentDefinitions,
  ContentTable,
  TableCell,
  Content,
  TableCellProperties,
} from 'pdfmake/interfaces';
import {IRestaurant} from '../restaurant/models';
import moment from 'moment';
import {ToWords} from 'to-words';
import {getFileFromS3} from '../../../utilities/s3_manager';
import logger from '../../../utilities/logger/winston_logger';
import {IAddonGroupCost} from './invoice';

async function buildTableBody(order: IOrder) {
  const body: TableCell[][] = [];
  const table_headers = [
    'Particulars',
    'Gross value',
    'Discount',
    'Net value',
    'CGST\n(Rate)',
    'CGST\n(INR)',
    'SGST\n(Rate)',
    'SGST\n(INR)',
    'Total',
  ];
  body.push(
    table_headers.map(table_header => ({text: table_header, bold: true}))
  );
  let total_food_item_cost = 0;
  let total_food_discount_amount = 0;
  let total_item_cgst_amount = 0;
  let total_item_sgst_amount = 0;
  let master_total = 0;
  order?.invoice_breakout?.menu_items.forEach(menu_item => {
    const table_rows: Content & TableCellProperties = [];
    table_headers.forEach(header => {
      if (header === 'Particulars') {
        const addon_groups: IAddonGroupCost[] = menu_item['addon_groups'];
        const concated_addons_variants: string = [
          ...menu_item['variants'].map(({variant_name}) => variant_name),
          ...addon_groups.reduce(
            (concated_array: string[], addon_group: IAddonGroupCost) => {
              return [
                ...concated_array,
                ...addon_group.addons.map(({addon_name}) => addon_name),
              ];
            },
            []
          ),
        ].join(',');
        table_rows.push(
          ` ${menu_item['item_quantity']} x ${menu_item['item_name']}\n${concated_addons_variants}`
        );
      } else if (header === 'Gross value') {
        total_food_item_cost += menu_item['total_individual_food_item_cost'];
        table_rows.push(
          `${menu_item['total_individual_food_item_cost'].toFixed(2)}`
        );
      } else if (header === 'Discount') {
        total_food_discount_amount += menu_item['discount_amount'];
        table_rows.push(`${menu_item['discount_amount'].toFixed(2)}`);
      } else if (header === 'Net value') {
        const net_value =
          menu_item['total_individual_food_item_cost'] -
          menu_item['discount_amount'];
        table_rows.push(`${net_value.toFixed(2)}`);
      } else if (header === 'CGST\n(Rate)') {
        table_rows.push(`${menu_item['item_cgst'].toFixed(2)}`);
      } else if (header === 'CGST\n(INR)') {
        total_item_cgst_amount += menu_item['item_cgst_amount'];
        table_rows.push(`${menu_item['item_cgst_amount'].toFixed(2)}`);
      } else if (header === 'SGST\n(Rate)') {
        table_rows.push(`${menu_item['item_sgst'].toFixed(2)}`);
      } else if (header === 'SGST\n(INR)') {
        total_item_sgst_amount += menu_item['item_sgst_amount'];
        table_rows.push(`${menu_item['item_sgst_amount'].toFixed(2)}`);
      } else if (header === 'Total') {
        const total =
          menu_item['total_individual_food_item_cost'] +
          menu_item['total_individual_food_item_tax'] -
          menu_item['discount_amount'];
        master_total += total;
        table_rows.push(`${total.toFixed(2)}`);
      }
    });
    body.push(table_rows);
  });
  body.push([
    {text: 'Item(s) Total', bold: true},
    `${total_food_item_cost.toFixed(2)}`,
    `${total_food_discount_amount.toFixed(2)}`,
    `${(total_food_item_cost - total_food_discount_amount).toFixed(2)}`,
    '',
    `${total_item_cgst_amount.toFixed(2)}`,
    '',
    `${total_item_sgst_amount.toFixed(2)}`,
    `${master_total.toFixed(2)}`,
  ]);
  const total_packing_charges_with_tax =
    Number(order.invoice_breakout?.total_packing_charges) +
    Number(order.invoice_breakout?.packing_charge_cgst) +
    Number(order.invoice_breakout?.packing_charge_sgst);
  body.push([
    {text: 'Packaging\ncharges', bold: true},
    `${order.invoice_breakout?.total_packing_charges.toFixed(2)}`,
    '0.00',
    `${order.invoice_breakout?.total_packing_charges.toFixed(2)}`,
    `${order.invoice_breakout?.packing_cgst.toFixed(2)}`,
    `${order.invoice_breakout?.packing_charge_cgst.toFixed(2)}`,
    `${order.invoice_breakout?.packing_sgst.toFixed(2)}`,
    `${order.invoice_breakout?.packing_charge_sgst.toFixed(2)}`,
    `${total_packing_charges_with_tax.toFixed(2)}`,
  ]);
  master_total += order.invoice_breakout?.total_packing_charges ?? 0;
  total_food_item_cost += order.invoice_breakout?.total_packing_charges ?? 0;
  body.push([
    {text: 'Total', bold: true},
    `${total_food_item_cost.toFixed(2)}`,
    `${total_food_discount_amount.toFixed(2)}`,
    `${(total_food_item_cost - total_food_discount_amount).toFixed(2)}`,
    '',
    `${total_item_cgst_amount.toFixed(2)}`,
    '',
    `${total_item_sgst_amount.toFixed(2)}`,
    `${master_total.toFixed(2)}`,
  ]);
  return {master_total, body};
}

async function generateTableFormate(
  order: IOrderDetails
): Promise<{content_table: ContentTable; master_total: number}> {
  const {master_total, body} = await buildTableBody(order);
  return {
    content_table: {
      table: {
        headerRows: 1,
        body: body,
      },
    },
    master_total,
  };
}

export async function generatePdfDocument(
  order: IOrderDetails,
  restaurant: IRestaurant
): Promise<TDocumentDefinitions> {
  logger.debug('Generating invoice formate');
  const {content_table, master_total} = await generateTableFormate(order);
  const toWords = new ToWords();
  const words = toWords.convert(master_total, {
    currency: true,
    ignoreDecimal: false,
  });
  const signature = await getFileFromS3(false, {
    path: 'static_images/',
    name: 'authorised_signatory.png',
  });
  const logo = await getFileFromS3(true, {
    path: 'static_images/',
    name: 'speedyy_logo.png',
  });
  return {
    footer: (currentPage, pageCount) => {
      if (currentPage === pageCount)
        return {
          margin: [0, 10, 0, 10], // [left, top, right, bottom]
          relativePosition: {x: 0, y: 0},
          stack: [
            {
              text: 'For TECHSHACK PRIVATE LIMITED',
              bold: true,
              margin: [40, 0, 0, 15],
            },
            {
              columns: [
                {
                  stack: [
                    {
                      text: 'Speedyy PAN : AAICT8297P',
                      bold: false,
                      alignment: 'left',
                      margin: [40, 0, 0, 3],
                    },
                    {
                      text: 'Speedyy CIN : U74900MH2021PTC366653',
                      bold: false,
                      alignment: 'left',
                      margin: [40, 0, 0, 3],
                    },
                    {
                      text: ' Speedyy GST : 27AAICT8297P1Z5',
                      bold: false,
                      alignment: 'left',
                      margin: [40, 0, 0, 3],
                    },
                    {
                      text: 'Speedyy FSSAI No. : 11523998000334',
                      bold: false,
                      alignment: 'left',
                      margin: [40, 0, 0, 3],
                    },
                  ],
                },
                {
                  stack: [
                    {
                      image: 'data:image/png;base64,' + signature,
                      width: 60,
                      alignment: 'right',
                      margin: [0, 0, 30, 0],
                      // height: 80,
                    },
                    {
                      text: 'Authorised Signatory',
                      alignment: 'right',
                      margin: [0, 0, 30, 0],
                    },
                  ],
                },
              ],
            },
          ],
        };
      return '';
    },
    content: [
      {
        image: 'data:image/png;base64,' + logo,
        alignment: 'left',
        width: 100,
        margin: [40, 10, 0, 0],
      },
      {
        alignment: 'center',
        text: 'Tax Invoice',
        margin: [0, 35, 0, 0], // margin: [left, top, right, bottom]
        bold: true,
      },
      {
        alignment: 'center',
        text: 'ORIGINAL For Recipient',
        margin: [0, 2, 0, 2],
      },
      {
        alignment: 'left',
        text: 'Tax Invoice on behalf of -',
        margin: [0, 5, 0, 2],
        bold: true,
      },
      {
        columns: [
          {
            text: 'Legal Entity Name : ',
            bold: true,
            alignment: 'left',
            width: 'auto',
            margin: [0, 5, 0, 2],
          },
          {
            width: '*',
            text: `${order.restaurant_details?.restaurant_name}`,
            margin: [3, 5, 0, 2],
          },
        ],
      },
      [
        {
          columns: [
            {
              text: 'Restaurant Name : ',
              bold: true,
              alignment: 'left',
              width: 'auto',
              margin: [0, 0, 0, 2],
            },
            {
              width: '*',
              text: `${order.restaurant_details?.restaurant_name}`,
              margin: [3, 0, 0, 2],
            },
          ],
        },
        {
          columns: [
            {
              text: 'Restaurant Address :  ',
              bold: true,
              alignment: 'left',
              width: 'auto',
              margin: [0, 0, 0, 2],
            },
            {
              width: '*',
              text: `${restaurant.city}, ${restaurant.state}`,
              margin: [3, 0, 0, 2],
            },
          ],
        },
        {
          columns: [
            {
              text: 'Restaurant GSTIN :  ',
              bold: true,
              alignment: 'left',
              width: 'auto',
              margin: [0, 0, 0, 2],
            },
            {
              width: '*',
              text: `${restaurant.has_gstin ? restaurant.gstin_number : 'N/A'}`,
              margin: [3, 0, 0, 2],
            },
          ],
        },
        {
          columns: [
            {
              text: 'Restaurant FSSAI : ',
              bold: true,
              alignment: 'left',
              width: 'auto',
              margin: [0, 0, 0, 2],
            },
            {
              width: '*',
              text: `${
                restaurant.fssai_has_certificate
                  ? restaurant.fssai_cert_number
                  : restaurant.fssai_ack_number
              }`,
              margin: [3, 0, 0, 2],
            },
          ],
        },
        {
          columns: [
            {
              text: 'Invoice No. : ',
              bold: true,
              alignment: 'left',
              width: 'auto',
              margin: [0, 0, 0, 2],
            },
            {
              width: '*',
              text: `RES_${order.order_id}`,
              margin: [3, 0, 0, 2],
            },
          ],
        },
        {
          columns: [
            {
              text: 'Invoice Date : ',
              bold: true,
              alignment: 'left',
              width: 'auto',
              margin: [0, 0, 0, 2],
            },
            {
              width: '*',
              text: `${moment(order.order_placed_time).format('DD-MM-YYYY')}`,
              margin: [3, 0, 0, 2],
            },
          ],
        },
        {
          columns: [
            {
              text: 'Customer Name : ',
              bold: true,
              alignment: 'left',
              width: 'auto',
              margin: [0, 5, 0, 2],
            },
            {
              width: '*',
              text: `${order.customer_address?.customer_name}`,
              margin: [3, 5, 0, 2],
            },
          ],
        },
        {
          columns: [
            {
              text: 'Delivery Address : ',
              bold: true,
              alignment: 'left',
              width: 'auto',
              margin: [0, 0, 0, 2],
            },
            {
              width: '*',
              text: `${order.customer_address?.house_flat_block_no}, ${order.customer_address?.apartment_road_area}`,
              margin: [3, 0, 0, 2],
            },
          ],
        },
        {
          columns: [
            {
              text: 'State name & Place of Supply: ',
              bold: true,
              alignment: 'left',
              width: 'auto',
              margin: [0, 0, 0, 2],
            },
            {
              width: '*',
              text: `${order.customer_address?.city}, ${order.customer_address?.state}`,
              margin: [3, 0, 0, 2],
            },
          ],
        },
        {
          columns: [
            {
              text: 'HSN Code : ',
              bold: true,
              alignment: 'left',
              width: 'auto',
              margin: [0, 5, 0, 0],
            },
            {
              width: '*',
              text: '996331',
              margin: [3, 5, 0, 0],
            },
          ],
        },
        {
          columns: [
            {
              text: 'Service Description :  ',
              bold: true,
              alignment: 'left',
              width: 'auto',
              margin: [0, 0, 0, 2],
            },
            {
              width: '*',
              text: 'Restaurant Service',
              margin: [3, 0, 0, 2],
            },
          ],
        },
      ],
      content_table,
      {
        columns: [
          {
            text: 'Amount: \n(in words)',
            bold: true,
            alignment: 'left',
            width: 'auto',
            margin: [0, 5, 0, 2],
          },
          {
            width: '*',
            text: words,
            alignment: 'left',
            margin: [0, 5, 0, 2],
          },
        ],
        columnGap: 0,
      },
      {
        text: `Amount INR ${master_total.toFixed(
          2
        )} settled through digital mode/payment received upon delivery against Order ID: ${
          order.order_id
        }`,
        alignment: 'left',
        margin: [0, 5, 0, 2],
      },
      {
        text: 'Supply attracts reverse charge : No',
        alignment: 'left',
        margin: [0, 0, 0, 2],
      },
    ],
    pageSize: 'A4',
    pageOrientation: 'portrait',
    pageMargins: [40, 60, 40, 120],
    defaultStyle: {
      font: 'Helvetica',
    },
  };
}
