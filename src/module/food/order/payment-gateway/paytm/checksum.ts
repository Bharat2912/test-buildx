const PaytmChecksum = require('paytmchecksum');
import * as secretStore from '../../../../../utilities/secret/secret_store';

/**
 * Generate checksum by parameters we have
 * Find your Merchant Key in your Paytm Dashboard at https://dashboard.paytm.com/next/apikeys
 */
export async function generateChecksum(body: object) {
  const paytmChecksum: string = await PaytmChecksum.generateSignature(
    JSON.stringify(body),
    secretStore.getSecret('PAYTM_MERCHANT_KEY')
  );
  return paytmChecksum;
}

/**
 * function validates checksum
 */
export async function validateChecksum(body: object, checksum: string) {
  return await PaytmChecksum.verifySignature(
    JSON.stringify(body),
    secretStore.getSecret('PAYTM_MERCHANT_KEY'),
    checksum
  );
}
