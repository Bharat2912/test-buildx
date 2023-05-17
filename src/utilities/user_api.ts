import axios from 'axios';
import logger from './logger/winston_logger';
import ResponseError from './response_error';

export interface Vendor {
  phone?: string;
  email?: string;
  id: string;
  name?: string;
  restaurant_id?: string;
  login_id?: string;
  password?: string;
  type?: string[];
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
  hash?: string;
  owner_id?: string;
  old_password?: string;
  otp?: string;
  role: string;
  active?: boolean;
  outlet_id?: string;
}
export interface ICustomer {
  id: string;
  full_name: string;
  phone: string;
  alternate_phone?: string;
  email: string;
  status?: string;
  role?: string | Array<string>;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
  image_bucket?: string;
  image_path?: string;
  image_url?: string;
}

export async function getVendorDetailsByIds(
  vendor_ids: string[]
): Promise<Vendor[]> {
  const vendors = await axios
    .post(`${process.env.USER_API_URL || ''}/internal/vendor_details/filter`, {
      ids: vendor_ids,
    })
    .then(response => {
      return response.data.result;
    })
    .catch(error => {
      logger.error('ERROR_WHILE_FETCHING_VENDOR_DETAILS', error);
      throw 'ERROR_WHILE_FETCHING_VENDOR_DETAILS';
    });
  return vendors;
}

export interface ICustomerFilter {
  filter: {
    id?: string[];
    email?: string[];
    phone?: string[];
  };
}
export async function getRestaurantVendors(
  restaurant_id: string
): Promise<Vendor[]> {
  const vendors = await axios
    .get(
      (process.env.USER_API_URL || '') +
        '/internal/outlet_vendors/' +
        restaurant_id
    )
    .then(response => {
      return response.data.result;
    })
    .catch(error => {
      logger.error('ERROR_WHILE_FETCHING_RESTAURANT_VENDORS', error);
      throw 'ERROR_WHILE_FETCHING_RESTAURANT_VENDORS';
    });
  return vendors;
}

export async function getVendorDetailsById(vendor_id: string): Promise<Vendor> {
  const vendors = await axios
    .get(
      (process.env.USER_API_URL || '') + '/internal/vendor_details/' + vendor_id
    )
    .then(response => {
      return response.data.result;
    })
    .catch(error => {
      logger.error('ERROR_WHILE_FETCHING_VENDOR_DETAILS', error);
      throw 'ERROR_WHILE_FETCHING_VENDOR_DETAILS';
    });
  return vendors;
}

export async function getAdminDetailAuth(token: string) {
  const result = await axios
    .get((process.env.USER_API_URL || '') + '/internal/getAdminDetails', {
      headers: {authorization: token},
    })
    .then(response => {
      return response.data.result;
    })
    .catch(error => {
      logger.error('GET ADMIN DETAILS BY TOKEN USER API ERROR:', error);
      throw error;
    });
  return result;
}

export async function getAdminDetailsById(admin_id: string): Promise<{
  id: string;
  user_name: string;
}> {
  const admin = await axios
    .get(`${process.env.USER_API_URL}/internal/readAdminById/${admin_id}`)
    .then(response => {
      return response.data.result;
    })
    .catch(error => {
      logger.error('ERROR IN INTERNAL GET ADMIN DETAILS', error.response.data);
      if (error.response.data.errors[0].code === 1001) {
        return;
      } else {
        throw new ResponseError(500, 'Internal Server Error');
      }
    });
  return admin;
}

// /**
//  * It takes in a token and an array of admin ids and returns an array of admin details
//  * @param {string | undefined} token - The token of the admin who is making the request.
//  * @param {string[]} admin_ids - The admin_ids is an array of admin ids.
//  * @returns An array of admin objects
//  */
// export async function getAdminsDetailsByIds(
//   token: string | undefined,
//   admin_ids: string[]
// ) {
//   if (token) {
//     const admin = await axios
//       .post(process.env.USER_API_URL + '/internal/readAdminById', admin_ids, {
//         headers: {authorization: token},
//       })
//       .then(response => {
//         return response.data.result;
//       })
//       .catch(error => {
//         logger.error('ERROR:', error);
//         throw new ResponseError(500, 'Internal Server Error');
//       });
//     return admin;
//   } else {
//     throw new ResponseError(401, 'Unauthorized access');
//   }
// }

export async function getCustomerDetailsWithFilter(
  params: ICustomerFilter
): Promise<ICustomer[]> {
  const customers = await axios
    .post<{result: ICustomer[]}>(
      process.env.USER_API_URL + '/internal/customer/filter',
      {
        ...params,
      }
    )
    .then(response => {
      return response.data.result;
    })
    .catch(error => {
      if (error.response) {
        logger.error(
          'FETCH CUSTOMER DETAILS WITH FILTER FAILED',
          error.response.data
        );
      } else {
        logger.error('FETCH CUSTOMER DETAILS WITH FILTER FAILED', error);
      }
      throw error;
    });
  return customers;
}
export async function getAdminDetailsByIds(
  token: string,
  ids: string[]
): Promise<
  {
    id: string;
    user_name: string;
    full_name: string;
  }[]
> {
  logger.debug('reading admin details by ids', ids);
  const admin = await axios
    .post(
      `${process.env.USER_API_URL}/internal/admin/filter`,
      {ids},
      {
        headers: {authorization: token},
      }
    )
    .then(response => {
      logger.debug(
        'successfully fetched admin details by ids',
        response.data.result
      );
      return response.data.result;
    })
    .catch(error => {
      logger.error('ERROR_WHILE_FETCHING_ADMIN_BY_IDS', error);
      throw 'ERROR_WHILE_FETCHING_ADMIN_BY_IDS';
    });
  return admin;
}
