/* eslint-disable @typescript-eslint/no-explicit-any */
import {sendSQSMessage, SQS_URL} from './sqs_manager';
import logger from './logger/winston_logger';
import {Service, ServiceTag} from '../enum';
import moment from 'moment';
export function compareArray(a1?: number[], a2?: number[]): boolean {
  if (!a1 && a2) {
    return false;
  }
  if (a1 && !a2) {
    return false;
  }
  if (!a1 && !a2) {
    return false;
  }
  if (a1 && a2) {
    const difference = a1
      .filter(x => !a2.includes(x))
      .concat(a2.filter(x => !a1.includes(x)));
    return difference.length === 0;
  }
  return false;
}

export function arrToCsvRow(dataArr: string[]) {
  dataArr = dataArr.map(item => {
    item = '"' + item.replace(/"/g, '""') + '"';
    return item;
  });
  return dataArr.join(',');
}

export const Weekdays = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export async function sendEmail(
  templateName: string,
  email: string,
  data: object
) {
  logger.info(`send email to ${email}`, data);
  return await sendSQSMessage(SQS_URL.NOTIFICATIONS, {
    event: 'EMAIL',
    action: 'SINGLE',
    data: {
      reciverEmail: email,
      templateName: templateName,
      templateData: data,
    },
  });
}

export function isPointInPolygon(
  polygon_points: {lat: number; long: number}[],
  point: {lat: number; long: number}
): boolean {
  if (polygon_points.length < 3) {
    throw 'Polygons points less then 3';
  }
  const x = point.lat;
  const y = point.long;
  let inside = false;
  const len = polygon_points.length;
  for (let i = 0, j = len - 1; i < len; j = i++) {
    const xi = polygon_points[i].lat;
    const yi = polygon_points[i].long;
    const xj = polygon_points[j].lat;
    const yj = polygon_points[j].long;
    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

const ValidPhoneRegex = new RegExp(
  '^\\+((?:9[679]|8[035789]|6[789]|5[90]|42|3[578]|2[1-689])|9[0-58]|8[1246]|6[0-6]|5[1-8]|4[013-9]|3[0-469]|2[70]|7|1)(?:\\W*\\d){0,13}\\d$'
);
export function isValidPhone(phone?: string, country_code?: string): boolean {
  if (!phone) return false;
  // if (!phone.startsWith('+')) phone = '+' + phone;
  if (!country_code) country_code = '+91';
  if (!country_code.startsWith('+')) country_code = '+' + country_code;
  if (!phone.startsWith(country_code)) return false;
  if (country_code === '+91' && phone.length !== 13) return false;
  if (isNaN(+phone)) return false;
  if (!ValidPhoneRegex.test(phone)) return false;
  logger.debug('Is Valid Number  ' + phone);
  return true;
}

export function roundUpAll(datainput: any) {
  let data = datainput;
  try {
    if (typeof data === 'string') {
      if (!isNaN(+data)) {
        data = roundUp(+data, 2);
      } else {
        try {
          data = roundUpAll(JSON.parse(data));
        } catch (e) {
          // console.log(e);
        }
      }
    } else if (typeof data === 'number') {
      data = roundUp(+data, 2);
    } else if (typeof data === 'object') {
      if (Object.prototype.toString.call(data) === '[object Array]') {
        data.map((item: any) => (item = roundUpAll(item)));
      } else {
        Object.keys(data).forEach(key => {
          data[key] = roundUpAll(data[key]);
        });
      }
    }
  } catch (error) {
    return datainput;
  }

  return data;
}

export function roundUp(value: number, places: number) {
  const multiplier = Math.pow(10, places);
  return Math.round(value * multiplier) / multiplier;
}

export function generateHtmlTableFromArray(columns: string[], rows: object[]) {
  let table_columns = '';
  for (let i = 0; i < columns.length; i++) {
    table_columns += `<th style='padding: 10px;'>${columns[i]}</th>`;
  }
  let table_rows = '';
  for (let i = 0; i < rows.length; i++) {
    let row = '';
    // eslint-disable-next-line node/no-unsupported-features/es-builtins
    const row_object: any = rows[i];
    for (let j = 0; j < columns.length; j++) {
      if (row_object[columns[j]]) {
        row += `<td style="padding: 10px;">${row_object[columns[j]]}</td>`;
      } else {
        row += '<td style="padding: 10px;">null</td>';
      }
    }
    table_rows += `<tr>${row}</tr>`;
  }

  const html_table = `
  <table border='1' style='padding: 5px;' width='100%'>
       <tr> ${table_columns} </tr>
       ${table_rows}
  </table>
   `;
  return html_table;
}

export function getServiceTag(service_name: Service) {
  if (service_name === Service.CORE_API) {
    return ServiceTag.CORE_SERVICE_TAG;
  } else if (service_name === Service.GROCERY_API) {
    return ServiceTag.GROCERY_SERVICE_TAG;
  } else if (service_name === Service.PHARMACY_API) {
    return ServiceTag.PHARMACY_SERVICE_TAG;
  } else if (service_name === Service.RIDER_API) {
    return ServiceTag.RIDER_SERVICE_TAG;
  } else if (service_name === Service.FOOD_API) {
    return ServiceTag.FOOD_SERVICE_TAG;
  } else if (service_name === Service.PICKUP_DROP_API) {
    return ServiceTag.PICKUP_DROP_SERVICE_TAG;
  } else {
    throw 'invalid service name';
  }
}

export function removeServiceTagFromIdentifier(id: string) {
  if (id.startsWith(ServiceTag.GROCERY_SERVICE_TAG + '_')) {
    id = id.replace(ServiceTag.GROCERY_SERVICE_TAG + '_', '');
  } else if (id.startsWith(ServiceTag.PHARMACY_SERVICE_TAG + '_')) {
    id = id.replace(ServiceTag.PHARMACY_SERVICE_TAG + '_', '');
  } else if (id.startsWith(ServiceTag.FOOD_SERVICE_TAG + '_')) {
    id = id.replace(ServiceTag.FOOD_SERVICE_TAG + '_', '');
  } else if (id.startsWith(ServiceTag.RIDER_SERVICE_TAG + '_')) {
    id = id.replace(ServiceTag.RIDER_SERVICE_TAG + '_', '');
  } else if (id.startsWith(ServiceTag.PICKUP_DROP_SERVICE_TAG + '_')) {
    id = id.replace(ServiceTag.PICKUP_DROP_SERVICE_TAG + '_', '');
  } else {
    throw 'invalid service tag';
  }
  return id;
}
export function getSQSFromServiceName(service_name: Service): string {
  let sqs_url: string;
  switch (service_name) {
    case Service.FOOD_API:
      sqs_url = SQS_URL.CORE_WORKER;
      break;
    case Service.CORE_API:
      sqs_url = SQS_URL.CORE_WORKER;
      break;
    case Service.GROCERY_API:
      sqs_url = SQS_URL.GROCERY_WORKER;
      break;
    case Service.PHARMACY_API:
      sqs_url = SQS_URL.PHARMACY_WORKER;
      break;
    case Service.RIDER_API:
      sqs_url = SQS_URL.RIDER_WORKER;
      break;
    case Service.PICKUP_DROP_API:
      sqs_url = SQS_URL.PICKUP_DROP_WORKER;
      break;
    default:
      throw 'invalid service name';
  }
  return sqs_url;
}

export function getSQSFromAppendingServiceTagInIndentifier(id: string) {
  if (id.startsWith(ServiceTag.GROCERY_SERVICE_TAG + '_')) {
    return SQS_URL.GROCERY_WORKER;
  } else if (id.startsWith(ServiceTag.PHARMACY_SERVICE_TAG + '_')) {
    return SQS_URL.PHARMACY_WORKER;
  } else if (id.startsWith(ServiceTag.FOOD_SERVICE_TAG + '_')) {
    return SQS_URL.CORE_WORKER;
  } else if (id.startsWith(ServiceTag.RIDER_SERVICE_TAG + '_')) {
    return SQS_URL.RIDER_WORKER;
  } else if (id.startsWith(ServiceTag.PICKUP_DROP_SERVICE_TAG + '_')) {
    return SQS_URL.PICKUP_DROP_WORKER;
  } else {
    throw 'invalid service tag';
  }
}
// eslint-disable-next-line node/no-unsupported-features/es-builtins
export function isEmpty(value: any) {
  return value === undefined || value === null || value === '';
}

export function getBackwardPercentAmount(value: number, percent: number) {
  return value / (1 + percent / 100);
}

export function removePhoneCode(phone?: string): string {
  if (phone) {
    if (phone.startsWith('+91')) {
      phone = phone.substring(3, phone.length);
    }
    if (phone.startsWith('91')) {
      phone = phone.substring(2, phone.length);
    }
    return phone;
  }
  return '';
}
export function addPhoneCode(code: string, phone?: string): string {
  if (phone) {
    if (!phone.startsWith(code)) {
      phone = code + phone;
    }
    return phone;
  }
  return '';
}
export function humanizeNumber(num?: number): string {
  // console.log(formatNum(54321));  // "54.3K"
  // console.log(formatNum(9876543));  // "9.9M"
  // console.log(formatNum(123456789));  // "123.5M"
  // console.log(formatNum(10000000000));  // "10.0B"
  // console.log(formatNum(1234567890123));  // "1.2T"

  if (num) {
    if (num < 1000) {
      return num.toString();
    } else if (num >= 1000 && num < 1000000) {
      return (num / 1000).toFixed(1).toString() + 'K';
    } else if (num >= 1000000 && num < 1000000000) {
      return (num / 1000000).toFixed(1).toString() + 'M';
    } else if (num >= 1000000000 && num < 1000000000000) {
      return (num / 1000000000).toFixed(1).toString() + 'B';
    } else {
      return (num / 1000000000000).toFixed(1).toString() + 'T';
    }
  } else {
    return '0';
  }
}

export async function wait_for(seconds: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, seconds * 1000);
  });
}
export function strToCsvRow(dataArr: (string | number)[]) {
  dataArr = dataArr.map(item => {
    if (item === null) {
      item = '';
    } else {
      item = '"' + item.toString().replace(/"/g, '""') + '"';
    }
    return item;
  });
  return dataArr.join(',');
}

export function convertToLocalTime(dateString: Date) {
  const date = moment(dateString);
  const localTime = date.local().format('MMMM Do YYYY, h:mm:ss a');
  return localTime;
}
