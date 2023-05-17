import {v4 as uuidv4} from 'uuid';
import logger from '../../../utilities/logger/winston_logger';
import {
  createCashfreeBeneficicary,
  getCashfreeBeneficiary,
  ICFBeneficiaryRequest,
  saveCashfreeBeneficiary,
} from './cashfree/models';

export interface IBeneficiaryRequest {
  name: string;
  email: string;
  phone: string;
  address?: string;
  bank_account_number: string;
  bank_ifsc: string;
}
interface IBeneficiaryResponse {
  beneficiary_id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  beneficiary_details: any;
}
export async function createBeneficicary(
  beneficiary: IBeneficiaryRequest
): Promise<IBeneficiaryResponse> {
  logger.debug('creating beneficiary', beneficiary);
  const old_record = await getCashfreeBeneficiary(
    beneficiary.bank_ifsc,
    beneficiary.bank_account_number
  );
  if (old_record) {
    return {
      beneficiary_id: old_record.id,
      beneficiary_details: old_record.beneficiary_details,
    };
  }
  const beneficiary_id = uuidv4().split('-').join('_');
  const payload: ICFBeneficiaryRequest = {
    beneId: beneficiary_id,
    name: beneficiary.name,
    email: beneficiary.email,
    phone: beneficiary.phone,
    address1: beneficiary.address!,
    bankAccount: beneficiary.bank_account_number,
    ifsc: beneficiary.bank_ifsc,
  };
  await createCashfreeBeneficicary(payload);
  await saveCashfreeBeneficiary({
    id: beneficiary_id,
    ifsc_code: beneficiary.bank_ifsc,
    bank_account_number: beneficiary.bank_account_number,
    beneficiary_details: payload,
  });
  const result: IBeneficiaryResponse = {
    beneficiary_id: beneficiary_id,
    beneficiary_details: payload,
  };
  return result;
}
