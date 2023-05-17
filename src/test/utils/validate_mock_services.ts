// import axios from 'axios';
// import {getUserAddressResponse} from './mock_responses';

/**
 * validate functions make sure that your test api, hits on the specified url only and paramerters passed to it
 * are correct.
 */

// export function validateMockPostServiceableAddress() {
//   expect(axios.post).toHaveBeenCalledWith(
//     process.env.SERVICEABILITY_API_URL + '/internal/serviceableAddress',
//     {
//       restaurant_cordinates: [1.098889, 2.0089002],
//       radius: process.env.SERVICEABILITY_DEFAULT_RADIUS
//         ? +process.env.SERVICEABILITY_DEFAULT_RADIUS
//         : 50000,
//       address: getUserAddressResponse,
//     }
//   );
// }

// export function validateMockGetCustomerAddress(token: string) {
//   expect(axios.get).toHaveBeenCalledWith(
//     process.env.USER_API_URL + '/user/customer/address',
//     {
//       headers: {authorization: 'Bearer ' + token},
//     }
//   );
// }
