import {ifscBankname} from '../../../utilities/ifsc_bankname';

type VerifyResponse =
  | {
      valid: true;
    }
  | {
      valid: false;
      reason: string;
    };
export async function verifyPostalCode(
  postal: string
): Promise<VerifyResponse> {
  if (!postal || postal.length !== 6) {
    return {
      valid: false,
      reason: 'length not 6',
    };
  }
  return {valid: true};
}

export async function verifyFssai(fssai: string): Promise<VerifyResponse> {
  if (!fssai || fssai.length !== 14) {
    return {
      valid: false,
      reason: 'length not 14',
    };
  }
  return {valid: true};
}

export async function verifyPanNumber(pan: string): Promise<VerifyResponse> {
  if (!pan || pan.length !== 10) {
    return {
      valid: false,
      reason: 'length not 10',
    };
  }
  return {valid: true};
}

export async function verifyGstinNumber(
  gstin: string
): Promise<VerifyResponse> {
  if (!gstin || gstin.length !== 15) {
    return {
      valid: false,
      reason: 'length not 15',
    };
  }
  return {valid: true};
}

export async function verifyIfscCode(ifsc: string): Promise<VerifyResponse> {
  const bank_name = await ifscBankname(ifsc);
  if (!bank_name) {
    return {
      valid: false,
      reason: 'Not Valid',
    };
  }
  return {valid: true};
}
