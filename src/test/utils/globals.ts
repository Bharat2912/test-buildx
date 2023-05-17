import {Application} from 'express';
import {createTestServer} from './init';
import {signToken} from '../utils/utils';
let server: Application;
let admin_token: string;
let vendor_token: string;

export async function init_globals() {
  server = await createTestServer();
  vendor_token = signToken({
    id: 'cdf39e49-3b6b-4558-b08d-cb00b8ddb0a4',
    user_type: 'vendor',
    data: {
      type: 'restaurant',
      outlet_id: '77e53c1f-6e9e-4724-9ba7-92edc69cff6b',
      force_reset_password: false,
    },
  });
  admin_token = signToken({
    id: '64bfafb6-c273-4b64-a0fc-ca981f5819eb',
    user_type: 'admin',
  });
}
export const admin_id = '64bfafb6-c273-4b64-a0fc-ca981f5819eb';

export {server, admin_token, vendor_token};
