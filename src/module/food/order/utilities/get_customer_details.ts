import axios from 'axios';
import logger from '../../../../utilities/logger/winston_logger';
import ResponseError from '../../../../utilities/response_error';

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
/**
 * Utility to get customer details from user api
 * @param customer_id - customer/user id
 * @param authorizationToken - customer/user auth token
 */
export async function getCustomerDetails(
  customer_id: string,
  authorizationToken: string
): Promise<ICustomer> {
  const customer_details = await axios
    .get(`${process.env.USER_API_URL}/user/customer/${customer_id}`, {
      headers: {
        authorization: authorizationToken!,
      },
    })
    .then(response => {
      return response.data.result as ICustomer;
    })
    .catch(error => {
      logger.error('Failed while fetching user details: ', error);
      throw new ResponseError(500, 'Internal Server Errror');
    });

  return customer_details;
}
