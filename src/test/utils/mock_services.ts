import axios from 'axios';
const mock_axios_function = axios as jest.Mocked<typeof axios>;
import * as s3manager from '../../utilities/s3_manager';
import * as sqs_manager from '../../utilities/sqs_manager';
import * as internal_delivery from '../../internal/delivery';
import * as es_manager from '../../utilities/es_manager';
import {
  delivery_address,
  speedyy_rider_serviceable_delivery_address,
} from './mock_responses';
import * as cartServiceabilityUtility from '../../module/food/cart/utilities/serviceability';
import * as menuItemModel from '../../module/food/menu/models';
import * as GetCustomerDetailsModule from '../../module/food/order/utilities/get_customer_details';
import * as UserApiModule from '../../utilities/user_api';
import * as payment from '../../internal/payment';
import * as PostServiceableAddressModule from '../../module/food/cart/utilities/serviceability';
import * as Cashfree from '../../internal/payment';
import * as Service from '../../module/food/order/service';
//import * as GetTransactionStatusModule from '../../internal/payment';
import {delivery_order_successfull_response} from '../order-delivery/mock_responce';
import * as CreateCashfreeBeneficicaryModule from '../../module/core/payout/cashfree/models';
import * as DeliveryInternalApis from '../../../src/internal/delivery';
import * as utilFunction from '../../../src/utilities/utilFuncs';
import {DeliveryService} from '../../enum';
import * as MapApiModule from '../../../src/internal/map';

/**
 * Mocked Axios Api functions of other servies i.e user-api,serviceability. In Promise.resolve provide the mocked
 * Api response depending upon your test case
 */

/**
 * To mock a internal function use the following syntax
 * eg of module
 * import * as module from '../../src/module/food/path';
 *
 * const mock_function = jest.spyOn(module, 'name_of_function_to_mock_in_that_module');
 *  mock_function.mockReturnValue('mocked return value')
 *
 *
 * Add the following line in end of test case
 * funcAspy.mockRestore(); //add this line to remove mock for other test cases
 *
 */
// export function mockGetCustomerAddress() {
//   mockedAxios.get.mockResolvedValueOnce(
//     new Promise(resolve => {
//       resolve({
//         data: {
//           result: getUserAddressResponse,
//         },
//       });
//     })
//   );
// }

// export function mockPostServiceableAddress() {
//   mockedAxios.post.mockResolvedValueOnce(
//     new Promise(resolve => {
//       resolve({
//         data: {
//           address: postServiceabilityResponse,
//         },
//       });
//     })
//   );
// }

export function mockgetAdminDetails() {
  mock_axios_function.get.mockResolvedValue(
    new Promise(resolve => {
      resolve({
        data: {
          result: {
            id: '64bfafb6-c273-4b64-a0fc-ca981f5819eb',
            user_name: 'superadminn',
            force_change_password: true,
            full_name: 'Super Admin',
            email: null,
            phone: null,
            role: ['superadmin'],
            created_at: '2022-04-06T14:04:08.752Z',
            updated_at: '2022-04-06T14:04:08.752Z',
            is_deleted: false,
          },
        },
      });
    })
  );
  return mock_axios_function.get;
}

export function mockgetAdminDetailsById() {
  mock_axios_function.post.mockResolvedValue(
    new Promise(resolve => {
      resolve({
        data: {
          result: {
            id: '64bfafb6-c273-4b64-a0fc-ca981f5819eb',
            user_name: 'superadminn',
            force_change_password: true,
            full_name: 'Super Admin',
            email: null,
            phone: null,
            role: ['superadmin'],
            created_at: '2022-04-06T14:04:08.752Z',
            updated_at: '2022-04-06T14:04:08.752Z',
            is_deleted: false,
          },
        },
      });
    })
  );
  return mock_axios_function.post;
}

export function mockCancelDeliverySuccess() {
  const mock_function = jest.spyOn(DeliveryInternalApis, 'cancelDelivery');
  mock_function.mockReturnValue(
    new Promise(resolve => {
      resolve({
        cancelled: true,
      });
    })
  );
  return mock_function;
}

export async function mockputMenuItemSQS() {
  const mock_function = jest.spyOn(menuItemModel, 'putMenuItemSQS');
  mock_function.mockReturnValue(
    new Promise(resolve => {
      resolve();
    })
  );
}

export async function mockdeleteMenuItemSQS() {
  const mock_function = jest.spyOn(menuItemModel, 'deleteMenuItemSQS');
  mock_function.mockReturnValue(
    new Promise(resolve => {
      resolve();
    })
  );
}
/**
 * Entier cart serviceability utility is mocked. And the mocked function returns valid cart response from utility
 */
export function mockCartServiceabilityWithValidResponse() {
  const mock_function = jest.spyOn(
    cartServiceabilityUtility,
    'addressServiceability'
  );
  mock_function.mockReturnValue(
    new Promise(resolve => {
      if (process.env.DELIVERY_SERVICE === 'speedyy-rider') {
        resolve({
          customer_addresses: [speedyy_rider_serviceable_delivery_address],
          delivery_address: speedyy_rider_serviceable_delivery_address,
        });
      } else {
        resolve({
          customer_addresses: [delivery_address],
          delivery_address: delivery_address,
        });
      }
    })
  );
  return mock_function;
}

/**
 * mocked function to return invalid cart response from serviceability utility of cart
 */
export function mockCartServiceabilityWithInValidResponse() {
  const mock_function = jest.spyOn(
    cartServiceabilityUtility,
    'addressServiceability'
  );
  delivery_address.delivery_details = {
    message: 'Order in non-serviceable area',
  };
  mock_function.mockReturnValue(
    new Promise(resolve => {
      resolve({
        customer_addresses: [delivery_address],
        delivery_address: null,
        serviceability_validation_errors: [
          {message: 'delivery location not selected', code: 1027},
        ],
      });
    })
  );
  return mock_function;
}

export function mockSendSQSMessage() {
  const mock_s3_function = jest.spyOn(sqs_manager, 'sendSQSMessage');
  mock_s3_function.mockReturnValue(
    new Promise(resolve => {
      resolve({$metadata: {}});
    })
  );
  return mock_s3_function;
}
export function mockUpdateOrderStatusInRider() {
  const mock_s3_function = jest.spyOn(internal_delivery, 'updateOrderStatus');
  mock_s3_function.mockReturnValue(
    new Promise(resolve => {
      resolve({$metadata: {}});
    })
  );
  return mock_s3_function;
}
export function mockSendEmail() {
  const mock_s3_function = jest.spyOn(utilFunction, 'sendEmail');
  mock_s3_function.mockReturnValue(
    new Promise(resolve => {
      resolve({$metadata: {}});
    })
  );
  return mock_s3_function;
}

export function mockGetCustomerDetails() {
  const mock_function = jest.spyOn(
    GetCustomerDetailsModule,
    'getCustomerDetails'
  );
  mock_function.mockReturnValue(
    new Promise(resolve => {
      resolve({
        id: '33c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
        full_name: 'Mohit Gupta',
        phone: '+918591114112',
        email: 'mohit.g@speedyy.com',
        status: 'created',
        role: ['customer'],
        created_at: new Date('2022-01-28T12:01:54.817Z'),
        updated_at: new Date('2022-03-20T13:15:58.239Z'),
        is_deleted: false,
        alternate_phone: '+919819999999',
        image_url:
          'https://d21xv3zrufffpj.cloudfront.net/customer/images/4e17e93c-5069-4a96-92da-ccebf9f0ece2.jpg?Expires=1653375382&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9kMjF4djN6cnVmZmZwai5jbG91ZGZyb250Lm5ldC9jdXN0b21lci9pbWFnZXMvNGUxN2U5M2MtNTA2OS00YTk2LTkyZGEtY2NlYmY5ZjBlY2UyLmpwZyIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTY1MzM3NTM4Mn19fV19&Signature=cNSxrVlBwFWUkkPTa1FHFy6O2RsxT3u840aG3k~JJ7LBT6U6Uq-wMLjoVHygg4I8jl~1M36iMfbjvTzCLtugD97AEM-PfH9I4ZcRUY6chHo-vE~jZm-6RIMLOXNi3iLfvIB7fykzBH9a9Nagk3waHnqF1XcJTsD4Z0VQ4CNO75U-FZCLYzMWChcYk9c89SanyXZji0DpKpIZwUWXZBSslHpr1bNtA8Y0BC8n-S1kvsjqZqqWsK1vc0SQUbZTw7BQ1Gd5ahlFB-EGwLjudsllXiN6-azKGMAzh79bTz6Y2rvUGCU-mfD04V~RmdHfN4~0YEAWBL1iaLqkQ6qcESt~EQ__&Key-Pair-Id=K3IM9B4KXYUUT3',
      });
    })
  );
  return mock_function;
}

export function mockgenerateDownloadFileURL() {
  const mock_s3_function = jest.spyOn(s3manager, 'generateDownloadFileURL');
  mock_s3_function.mockReturnValue(
    new Promise(resolve => {
      resolve({
        name: '0028fb89-2503-4bf6-8d6d-3ec80b85d9ce.jpg',
        url: 'https://d21xv3zrufffpj.cloudfront.net/restaurant/menu_document/0028fb89-2503-4bf6-8d6d-3ec80b85d9ce.jpg?Expires=1654830677&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9kMjF4djN6cnVmZmZwai5jbG91ZGZyb250Lm5ldC9yZXN0YXVyYW50L3BhY2tpbmdfY2hhcmdlX3R5cGUvMGY4YjUyZGQtZDdkMi00OGY3LWI2YTYtMTc4MGNkNWI5MTEzLmpwZyIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTY1NDgzMDY3N319fV19&Signature=WEYo4B1gGOWU6z6FW93o0K2VSFscfF27~V7vgla~M3rFxVJJOXoSpnq-3-sVTV0Hh-0EkHpYoUVuZUtV39D6aRKmTH4JgUFXKBYzCB5~aNLSZslbagJKkPgrh1hynQgGHKhltQIaJWMTD5UhvvPWAcW9tnEDKt2dhKEAP5Uf~hW6a9XVtCFGBUsfeOqc~vK58~oKk8Q15jnJb5jZs6I~7oQhtrv7gR6rIfrqRnQdICi90vHlZpngK0FlqsFutXnjeMtz6GsoT5IwmwjujkaFJB~KX3IwPxFVXdfnGPgCY6mN2gM4wM8tCkB5BpQNXvDJ5nXuiZQIoKtpGR-uniCdmw__&Key-Pair-Id=K3IM9B4KXYUUT3',
      });
    })
  );
  mock_s3_function.mockReturnValue(
    new Promise(resolve => {
      resolve({
        name: '088066b3-c5c3-4e49-9d75-068346b5d094.jpg',
        url: 'https://d21xv3zrufffpj.cloudfront.net/restaurant/image/088066b3-c5c3-4e49-9d75-068346b5d094.jpg?Expires=1654830677&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9kMjF4djN6cnVmZmZwai5jbG91ZGZyb250Lm5ldC9yZXN0YXVyYW50L3BhY2tpbmdfY2hhcmdlX3R5cGUvMGY4YjUyZGQtZDdkMi00OGY3LWI2YTYtMTc4MGNkNWI5MTEzLmpwZyIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTY1NDgzMDY3N319fV19&Signature=WEYo4B1gGOWU6z6FW93o0K2VSFscfF27~V7vgla~M3rFxVJJOXoSpnq-3-sVTV0Hh-0EkHpYoUVuZUtV39D6aRKmTH4JgUFXKBYzCB5~aNLSZslbagJKkPgrh1hynQgGHKhltQIaJWMTD5UhvvPWAcW9tnEDKt2dhKEAP5Uf~hW6a9XVtCFGBUsfeOqc~vK58~oKk8Q15jnJb5jZs6I~7oQhtrv7gR6rIfrqRnQdICi90vHlZpngK0FlqsFutXnjeMtz6GsoT5IwmwjujkaFJB~KX3IwPxFVXdfnGPgCY6mN2gM4wM8tCkB5BpQNXvDJ5nXuiZQIoKtpGR-uniCdmw__&Key-Pair-Id=K3IM9B4KXYUUT3',
      });
    })
  );
  mock_s3_function.mockReturnValue(
    new Promise(resolve => {
      resolve({
        name: '4d8f9e53-1356-48cf-a1dd-b919b4e704fe.jpg',
        url: 'https://d21xv3zrufffpj.cloudfront.net/restaurant/kyc_document/4d8f9e53-1356-48cf-a1dd-b919b4e704fe.jpg?Expires=1654830677&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9kMjF4djN6cnVmZmZwai5jbG91ZGZyb250Lm5ldC9yZXN0YXVyYW50L3BhY2tpbmdfY2hhcmdlX3R5cGUvMGY4YjUyZGQtZDdkMi00OGY3LWI2YTYtMTc4MGNkNWI5MTEzLmpwZyIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTY1NDgzMDY3N319fV19&Signature=WEYo4B1gGOWU6z6FW93o0K2VSFscfF27~V7vgla~M3rFxVJJOXoSpnq-3-sVTV0Hh-0EkHpYoUVuZUtV39D6aRKmTH4JgUFXKBYzCB5~aNLSZslbagJKkPgrh1hynQgGHKhltQIaJWMTD5UhvvPWAcW9tnEDKt2dhKEAP5Uf~hW6a9XVtCFGBUsfeOqc~vK58~oKk8Q15jnJb5jZs6I~7oQhtrv7gR6rIfrqRnQdICi90vHlZpngK0FlqsFutXnjeMtz6GsoT5IwmwjujkaFJB~KX3IwPxFVXdfnGPgCY6mN2gM4wM8tCkB5BpQNXvDJ5nXuiZQIoKtpGR-uniCdmw__&Key-Pair-Id=K3IM9B4KXYUUT3',
      });
    })
  );
  mock_s3_function.mockReturnValue(
    new Promise(resolve => {
      resolve({
        name: '4d345f25-4b49-47e2-9921-5f4b6782c384.jpg',
        url: 'https://d21xv3zrufffpj.cloudfront.net/restaurant/bank_document/4d345f25-4b49-47e2-9921-5f4b6782c384.jpg?Expires=1654830677&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9kMjF4djN6cnVmZmZwai5jbG91ZGZyb250Lm5ldC9yZXN0YXVyYW50L3BhY2tpbmdfY2hhcmdlX3R5cGUvMGY4YjUyZGQtZDdkMi00OGY3LWI2YTYtMTc4MGNkNWI5MTEzLmpwZyIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTY1NDgzMDY3N319fV19&Signature=WEYo4B1gGOWU6z6FW93o0K2VSFscfF27~V7vgla~M3rFxVJJOXoSpnq-3-sVTV0Hh-0EkHpYoUVuZUtV39D6aRKmTH4JgUFXKBYzCB5~aNLSZslbagJKkPgrh1hynQgGHKhltQIaJWMTD5UhvvPWAcW9tnEDKt2dhKEAP5Uf~hW6a9XVtCFGBUsfeOqc~vK58~oKk8Q15jnJb5jZs6I~7oQhtrv7gR6rIfrqRnQdICi90vHlZpngK0FlqsFutXnjeMtz6GsoT5IwmwjujkaFJB~KX3IwPxFVXdfnGPgCY6mN2gM4wM8tCkB5BpQNXvDJ5nXuiZQIoKtpGR-uniCdmw__&Key-Pair-Id=K3IM9B4KXYUUT3',
      });
    })
  );
  mock_s3_function.mockReturnValue(
    new Promise(resolve => {
      resolve({
        name: '4ce154f4-a551-4635-ac7a-d4fa1ad92fd6.jpg',
        url: 'https://d21xv3zrufffpj.cloudfront.net/restaurant/gstin_document/4ce154f4-a551-4635-ac7a-d4fa1ad92fd6.jpg?Expires=1654830677&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9kMjF4djN6cnVmZmZwai5jbG91ZGZyb250Lm5ldC9yZXN0YXVyYW50L3BhY2tpbmdfY2hhcmdlX3R5cGUvMGY4YjUyZGQtZDdkMi00OGY3LWI2YTYtMTc4MGNkNWI5MTEzLmpwZyIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTY1NDgzMDY3N319fV19&Signature=WEYo4B1gGOWU6z6FW93o0K2VSFscfF27~V7vgla~M3rFxVJJOXoSpnq-3-sVTV0Hh-0EkHpYoUVuZUtV39D6aRKmTH4JgUFXKBYzCB5~aNLSZslbagJKkPgrh1hynQgGHKhltQIaJWMTD5UhvvPWAcW9tnEDKt2dhKEAP5Uf~hW6a9XVtCFGBUsfeOqc~vK58~oKk8Q15jnJb5jZs6I~7oQhtrv7gR6rIfrqRnQdICi90vHlZpngK0FlqsFutXnjeMtz6GsoT5IwmwjujkaFJB~KX3IwPxFVXdfnGPgCY6mN2gM4wM8tCkB5BpQNXvDJ5nXuiZQIoKtpGR-uniCdmw__&Key-Pair-Id=K3IM9B4KXYUUT3',
      });
    })
  );
  mock_s3_function.mockReturnValue(
    new Promise(resolve => {
      resolve({
        name: '4ccce9ab-8d93-463e-8004-1b1971010a4c.jpg',
        url: 'https://d21xv3zrufffpj.cloudfront.net/restaurant/pan_document/4ccce9ab-8d93-463e-8004-1b1971010a4c.jpg?Expires=1654830677&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9kMjF4djN6cnVmZmZwai5jbG91ZGZyb250Lm5ldC9yZXN0YXVyYW50L3BhY2tpbmdfY2hhcmdlX3R5cGUvMGY4YjUyZGQtZDdkMi00OGY3LWI2YTYtMTc4MGNkNWI5MTEzLmpwZyIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTY1NDgzMDY3N319fV19&Signature=WEYo4B1gGOWU6z6FW93o0K2VSFscfF27~V7vgla~M3rFxVJJOXoSpnq-3-sVTV0Hh-0EkHpYoUVuZUtV39D6aRKmTH4JgUFXKBYzCB5~aNLSZslbagJKkPgrh1hynQgGHKhltQIaJWMTD5UhvvPWAcW9tnEDKt2dhKEAP5Uf~hW6a9XVtCFGBUsfeOqc~vK58~oKk8Q15jnJb5jZs6I~7oQhtrv7gR6rIfrqRnQdICi90vHlZpngK0FlqsFutXnjeMtz6GsoT5IwmwjujkaFJB~KX3IwPxFVXdfnGPgCY6mN2gM4wM8tCkB5BpQNXvDJ5nXuiZQIoKtpGR-uniCdmw__&Key-Pair-Id=K3IM9B4KXYUUT3',
      });
    })
  );
  mock_s3_function.mockReturnValue(
    new Promise(resolve => {
      resolve({
        name: '3c103eab-f93f-4bac-af92-00de744ff0a2.jpg',
        url: 'https://d21xv3zrufffpj.cloudfront.net/restaurant/fssai_cert_document/3c103eab-f93f-4bac-af92-00de744ff0a2.jpg?Expires=1654830677&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9kMjF4djN6cnVmZmZwai5jbG91ZGZyb250Lm5ldC9yZXN0YXVyYW50L3BhY2tpbmdfY2hhcmdlX3R5cGUvMGY4YjUyZGQtZDdkMi00OGY3LWI2YTYtMTc4MGNkNWI5MTEzLmpwZyIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTY1NDgzMDY3N319fV19&Signature=WEYo4B1gGOWU6z6FW93o0K2VSFscfF27~V7vgla~M3rFxVJJOXoSpnq-3-sVTV0Hh-0EkHpYoUVuZUtV39D6aRKmTH4JgUFXKBYzCB5~aNLSZslbagJKkPgrh1hynQgGHKhltQIaJWMTD5UhvvPWAcW9tnEDKt2dhKEAP5Uf~hW6a9XVtCFGBUsfeOqc~vK58~oKk8Q15jnJb5jZs6I~7oQhtrv7gR6rIfrqRnQdICi90vHlZpngK0FlqsFutXnjeMtz6GsoT5IwmwjujkaFJB~KX3IwPxFVXdfnGPgCY6mN2gM4wM8tCkB5BpQNXvDJ5nXuiZQIoKtpGR-uniCdmw__&Key-Pair-Id=K3IM9B4KXYUUT3',
      });
    })
  );
  mock_s3_function.mockReturnValue(
    new Promise(resolve => {
      resolve({
        name: '2bdbb716-04b6-4cef-9488-9b79893fb8ac.jpg',
        url: 'https://d21xv3zrufffpj.cloudfront.net/restaurant/fssai_ack_document/2bdbb716-04b6-4cef-9488-9b79893fb8ac.jpg?Expires=1654830677&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9kMjF4djN6cnVmZmZwai5jbG91ZGZyb250Lm5ldC9yZXN0YXVyYW50L3BhY2tpbmdfY2hhcmdlX3R5cGUvMGY4YjUyZGQtZDdkMi00OGY3LWI2YTYtMTc4MGNkNWI5MTEzLmpwZyIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTY1NDgzMDY3N319fV19&Signature=WEYo4B1gGOWU6z6FW93o0K2VSFscfF27~V7vgla~M3rFxVJJOXoSpnq-3-sVTV0Hh-0EkHpYoUVuZUtV39D6aRKmTH4JgUFXKBYzCB5~aNLSZslbagJKkPgrh1hynQgGHKhltQIaJWMTD5UhvvPWAcW9tnEDKt2dhKEAP5Uf~hW6a9XVtCFGBUsfeOqc~vK58~oKk8Q15jnJb5jZs6I~7oQhtrv7gR6rIfrqRnQdICi90vHlZpngK0FlqsFutXnjeMtz6GsoT5IwmwjujkaFJB~KX3IwPxFVXdfnGPgCY6mN2gM4wM8tCkB5BpQNXvDJ5nXuiZQIoKtpGR-uniCdmw__&Key-Pair-Id=K3IM9B4KXYUUT3',
      });
    })
  );
  mock_s3_function.mockReturnValue(
    new Promise(resolve => {
      resolve({
        name: '0f8b52dd-d7d2-48f7-b6a6-1780cd5b9113.jpg',
        url: 'https://d21xv3zrufffpj.cloudfront.net/restaurant/packing_charge_type/0f8b52dd-d7d2-48f7-b6a6-1780cd5b9113.jpg?Expires=1654830677&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9kMjF4djN6cnVmZmZwai5jbG91ZGZyb250Lm5ldC9yZXN0YXVyYW50L3BhY2tpbmdfY2hhcmdlX3R5cGUvMGY4YjUyZGQtZDdkMi00OGY3LWI2YTYtMTc4MGNkNWI5MTEzLmpwZyIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTY1NDgzMDY3N319fV19&Signature=WEYo4B1gGOWU6z6FW93o0K2VSFscfF27~V7vgla~M3rFxVJJOXoSpnq-3-sVTV0Hh-0EkHpYoUVuZUtV39D6aRKmTH4JgUFXKBYzCB5~aNLSZslbagJKkPgrh1hynQgGHKhltQIaJWMTD5UhvvPWAcW9tnEDKt2dhKEAP5Uf~hW6a9XVtCFGBUsfeOqc~vK58~oKk8Q15jnJb5jZs6I~7oQhtrv7gR6rIfrqRnQdICi90vHlZpngK0FlqsFutXnjeMtz6GsoT5IwmwjujkaFJB~KX3IwPxFVXdfnGPgCY6mN2gM4wM8tCkB5BpQNXvDJ5nXuiZQIoKtpGR-uniCdmw__&Key-Pair-Id=K3IM9B4KXYUUT3',
      });
    })
  );
  return mock_s3_function;
}

export function mockEsIndexData() {
  const mock_es_function = jest.spyOn(es_manager, 'esIndexData');
  mock_es_function.mockReturnValue(
    new Promise(resolve => {
      resolve();
    })
  );
  return mock_es_function;
}
export function mocksaveS3Files() {
  const mock_s3_function = jest.spyOn(s3manager, 'saveS3Files');
  mock_s3_function.mockReturnValue(
    new Promise(resolve => {
      resolve([
        {
          name: '0028fb89-2503-4bf6-8d6d-3ec80b85d9ce.jpg',
          bucket: 'speedyy-image-upload',
          path: 'restaurant/menu_document/',
        },
      ]);
    })
  );
}
export function mocksaveS3MP3Files() {
  const mock_s3_function = jest.spyOn(s3manager, 'saveS3Files');
  mock_s3_function.mockReturnValue(
    new Promise(resolve => {
      resolve([
        {
          name: '0028fb89-2503-4bf6-8d6d-3ec80b85d9ce.mp3',
          bucket: 'speedyy-image-upload',
          path: 'restaurant/menu_document/',
        },
      ]);
    })
  );
}
export function mockGetRestaurantVendors() {
  const mock_function = jest.spyOn(UserApiModule, 'getRestaurantVendors');
  mock_function.mockReturnValue(
    new Promise(resolve => {
      resolve([
        {
          id: '33c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
          name: 'Mohit Gupta',
          phone: '+918591114112',
          email: 'mohit.g@speedyy.com',
          role: 'owner',
        },
      ]);
    })
  );
  return mock_function;
}
export function mockgetAdminDetailsByIds() {
  const mock_function = jest.spyOn(UserApiModule, 'getAdminDetailsByIds');
  mock_function.mockReturnValue(
    new Promise(resolve => {
      resolve([
        {
          id: '64bfafb6-c273-4b64-a0fc-ca981f5819eb',
          user_name: 'TestAdmin',
          full_name: 'Admin full name',
        },
      ]);
    })
  );
}

export function mockgetVendorDetailsByIds() {
  const mock_function = jest.spyOn(UserApiModule, 'getVendorDetailsByIds');
  mock_function.mockReturnValue(
    new Promise(resolve => {
      resolve([
        {
          id: '64bfafb6-c273-4b64-a0fc-ca981f5819eb',
          name: 'testVendor',
          role: 'manager',
        },
      ]);
    })
  );
}

export function mockGetTransactionToken() {
  const mock_function = jest.spyOn(payment, 'getTransactionToken');
  mock_function.mockReturnValue(
    new Promise(resolve => {
      resolve({
        transaction_token: 'caaea734a6f74e0d8812ca89d6868f401653376383820',
        payment_gateway: 'CASHFREE',
      });
    })
  );
  return mock_function;
}
export function mocksaveS3File() {
  const mock_s3_function = jest.spyOn(s3manager, 'saveS3File');

  mock_s3_function.mockReturnValue(
    new Promise(resolve => {
      resolve({
        name: '088066b3-c5c3-4e49-9d75-068346b5d094.jpg',
        bucket: 'restaurant/image/',
        path: 'restaurant/image/',
      });
    })
  );
  mock_s3_function.mockReturnValue(
    new Promise(resolve => {
      resolve({
        name: '4d8f9e53-1356-48cf-a1dd-b919b4e704fe.jpg',
        bucket: 'restaurant/kyc_document/',
        path: 'restaurant/kyc_document/',
      });
    })
  );
  mock_s3_function.mockReturnValue(
    new Promise(resolve => {
      resolve({
        name: '4d345f25-4b49-47e2-9921-5f4b6782c384.jpg',
        bucket: 'restaurant/bank_document/',
        path: 'restaurant/bank_document/',
      });
    })
  );
  mock_s3_function.mockReturnValue(
    new Promise(resolve => {
      resolve({
        name: '4ce154f4-a551-4635-ac7a-d4fa1ad92fd6.jpg',
        bucket: 'restaurant/gstin_document/',
        path: 'restaurant/gstin_document/',
      });
    })
  );
  mock_s3_function.mockReturnValue(
    new Promise(resolve => {
      resolve({
        name: '4ccce9ab-8d93-463e-8004-1b1971010a4c.jpg',
        bucket: 'restaurant/pan_document/',
        path: 'restaurant/pan_document/',
      });
    })
  );
  mock_s3_function.mockReturnValue(
    new Promise(resolve => {
      resolve({
        name: '3c103eab-f93f-4bac-af92-00de744ff0a2.jpg',
        bucket: 'restaurant/fssai_cert_document/',
        path: 'restaurant/fssai_cert_document/',
      });
    })
  );
  mock_s3_function.mockReturnValue(
    new Promise(resolve => {
      resolve({
        name: '2bdbb716-04b6-4cef-9488-9b79893fb8ac.jpg',
        bucket: 'restaurant/fssai_ack_document/',
        path: 'restaurant/fssai_ack_document/',
      });
    })
  );
  mock_s3_function.mockReturnValue(
    new Promise(resolve => {
      resolve({
        name: '0f8b52dd-d7d2-48f7-b6a6-1780cd5b9113.jpg',
        bucket: 'restaurant/packing_charge_type/',
        path: 'restaurant/packing_charge_type/',
      });
    })
  );

  return mock_s3_function;
}

// export function mockGetTransactionStatusSuccessfullResponse() {
//   const mock_function = jest.spyOn(
//     GetTransactionStatusModule,
//     'getTransactionStatus'
//   );
//   mock_function.mockReturnValue(
//     new Promise(resolve => {
//       resolve({
//         resultInfo: {
//           resultStatus: 'TXN_SUCCESS',
//           resultCode: '01',
//           resultMsg: 'Txn Success',
//         },
//         txnId: '20220518111212800110168531851371782',
//         bankTxnId: '187357186285',
//         orderId: 'faca09fb-d45e-4544-bdbb-f4e2294f02aa',
//         txnAmount: '1.00',
//         txnType: 'SALE',
//         gatewayName: 'WALLET',
//         bankName: 'WALLET',
//         mid: 'YyJEcx35272540373314',
//         paymentMode: 'PPI',
//         refundAmt: '0.00',
//         txnDate: '2022-05-18 15:28:37.0',
//       });
//     })
//   );
// }

export function mockCashfreeTrascationSuccessfullResponse(
  payment_id: string,
  order_amount: number
) {
  const mock_function = jest.spyOn(Cashfree, 'getTransactionStatus');
  mock_function.mockReturnValue(
    new Promise(resolve => {
      resolve({
        status: 'success',
        transaction_id: payment_id,
        payment_method: 'card',
        transaction_time: new Date(),
        transaction_amount: order_amount,
        payment_currency: 'INR',
        payment_message: '',
        external_payment_id: '',
        transaction_details: {
          external_payment_id: 885651374,
          transaction_id: payment_id,
          auth_id: '',
          authorization: null,
          bank_reference: '153036',
          entity: 'payment',
          is_captured: true,
          order_amount: order_amount,
          payment_amount: order_amount,
          payment_completion_time: new Date('2022-10-06T21:04:26+05:30'),
          payment_currency: 'INR',
          payment_group: 'credit_card',
          payment_message: 'Transaction Successful',
          payment_method: 'card',
          payment_status: 'SUCCESS',
          payment_time: new Date('2022-10-06T21:04:18+05:30'),
          payment_method_details: {
            card: {
              channel: 'link',
              card_number: 'XXXXXXXXXXXX1111',
              card_network: 'visa',
              card_type: 'credit_card',
              card_country: 'IN',
              card_bank_name: 'Others',
              card_display: '',
            },
          },
        },
      });
    })
  );
  return mock_function;
}

export function mockPostServiceableAddress() {
  const mock_function = jest.spyOn(
    PostServiceableAddressModule,
    'addressServiceability'
  );
  mock_function.mockReturnValue(
    new Promise(resolve => {
      if (process.env.DELIVERY_SERVICE === 'speedyy-rider') {
        resolve({
          customer_addresses: [speedyy_rider_serviceable_delivery_address],
          delivery_address: speedyy_rider_serviceable_delivery_address,
        });
      } else {
        resolve({
          customer_addresses: [delivery_address],
          delivery_address: delivery_address,
        });
      }
    })
  );
  return mock_function;
}

export function mockPlaceDeliveryOrder() {
  const mock_function = jest.spyOn(Service, 'placeDeliveryOrder');
  mock_function.mockReturnValue(
    new Promise(resolve => {
      resolve(delivery_order_successfull_response);
    })
  );
  return mock_function;
}

// export async function testmock() {
//   return {data: 'This is return from code'};
// }

// export function dummyMock() {
//   const mock_function = jest.spyOn(Order, 'testmock');
//   mock_function.mockReturnValue(
//     new Promise(resolve => {
//       resolve({
//         data: 'This Message is From Mock',
//       });
//     })
//   );
// }
export function mockCreateCashfreeBeneficicary() {
  const mock_function = jest.spyOn(
    CreateCashfreeBeneficicaryModule,
    'createCashfreeBeneficicary'
  );
  mock_function.mockReturnValue(
    new Promise(resolve => {
      resolve({
        status: 'SUCCESS',
        subCode: '200',
        message: 'Beneficiary added successfully',
      });
    })
  );
}

export function mockGetS3TempUploadSignedUrl() {
  const mockedFunction = jest.spyOn(s3manager, 'getS3TempUploadSignedUrl');
  mockedFunction.mockReturnValue(
    new Promise(resolve => {
      resolve(
        'http://speedyy-dev-temp.localhost:4566/cb714137-3ff6-4a7a-b17b-75dcad7203c9.jpg'
      );
    })
  );
  return mockedFunction;
}
export function mockAddressDeliverabilityCheck() {
  const mock_function = jest.spyOn(DeliveryInternalApis, 'deliverabilityCheck');
  mock_function.mockReturnValue(
    new Promise(resolve => {
      resolve({
        deliverable: true,
        delivery_cost: 58,
        drop_eta: 10,
        pickup_eta: 10,
        delivery_service: (process.env.DELIVERY_SERVICE ||
          DeliveryService.SHADOWFAX) as DeliveryService,
      });
    })
  );
  return mock_function;
}
export function mockGetCustomerDetailsWithFilterSuccess() {
  const mock_function = jest.spyOn(
    UserApiModule,
    'getCustomerDetailsWithFilter'
  );
  mock_function.mockReturnValue(
    new Promise(resolve => {
      resolve([
        {
          id: '33c6fdbc-8df6-4541-9d3f-f9e5ba4c0242',
          full_name: 'Mohit Gupta',
          phone: '+918591114112',
          email: 'mohit.g@speedyy.com',
          status: 'created',
          role: ['customer'],
          created_at: new Date('2022-01-28T12:01:54.817Z'),
          updated_at: new Date('2022-03-20T13:15:58.239Z'),
          is_deleted: false,
          alternate_phone: '+919819999999',
          image_url: '',
        },
      ]);
    })
  );
  return mock_function;
}
export function mockGetCustomerDetailsWithFilterFail() {
  const mock_function = jest.spyOn(
    UserApiModule,
    'getCustomerDetailsWithFilter'
  );
  mock_function.mockReturnValue(
    new Promise(resolve => {
      resolve([]);
    })
  );
  return mock_function;
}

export function mockgetMapMatrix() {
  const mock_function = jest.spyOn(MapApiModule, 'getMapMatrix');
  mock_function.mockReturnValue(
    new Promise(resolve => {
      resolve({
        distances: [[0]],
        durations: [[0]],
        destinations: [
          {
            hint: 'FSoegL0LO4GQAAAAPwAAAAAAAAAAAAAAGytyQgAbz0EAAAAAAAAAAJAAAAA_AAAAAAAAAAAAAAAaAAAALw2gBPUTxgBsDaAEshTGAAAA_xHVkHCy',
            distance: 21.930406,
            name: 'Maya Bazaar',
            location: [77.597999, 12.981237],
          },
        ],
        sources: [
          {
            hint: 'FSoegL0LO4GQAAAAPwAAAAAAAAAAAAAAGytyQgAbz0EAAAAAAAAAAJAAAAA_AAAAAAAAAAAAAAAaAAAALw2gBPUTxgBsDaAEshTGAAAA_xHVkHCy',
            distance: 21.930406,
            name: 'Maya Bazaar',
            location: [77.597999, 12.981237],
          },
        ],
      });
    })
  );
  return mock_function;
}

export function mocksaveS3MP3File() {
  const mock_s3_function = jest.spyOn(s3manager, 'saveS3File');
  mock_s3_function.mockReturnValue(
    new Promise(resolve => {
      resolve({
        name: '088066b3-c5c3-4e49-9d75-068346b5d094.mp3',
        bucket: 'restaurant/image/',
        path: 'restaurant/image/',
      });
    })
  );
}
