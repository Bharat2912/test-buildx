import {Request, Response} from 'express';
import {sendError, sendSuccess} from './controllers/handle_response';
const ifscVerifier = require('ifsc');

export async function getIfscCodeBankname(req: Request, res: Response) {
  try {
    const ifsc = req.params.ifsc_code;
    const bankname = await ifscBankname(ifsc);
    return sendSuccess(res, 200, bankname);
  } catch (error) {
    return sendError(res, 500, 'IFSC Name fetching Error');
  }
}
interface IFSCSuccessResult {
  MICR: string;
  BRANCH: string;
  ADDRESS: string;
  STATE: string;
  CONTACT: string;
  UPI: boolean;
  RTGS: boolean;
  CITY: string;
  CENTRE: string;
  DISTRICT: string;
  NEFT: boolean;
  IMPS: boolean;
  SWIFT: {};
  ISO3166: string;
  BANK: string;
  BANKCODE: string;
  IFSC: string;
}
export async function ifscBankname(ifsc: string) {
  let bank_details = await ifscVerifier.validate(ifsc);
  if (bank_details === true) {
    await ifscVerifier.fetchDetails(ifsc).then((result: string[]) => {
      bank_details = result;
    });
  } else {
    return false;
  }
  return bank_details as IFSCSuccessResult;
}
// export default data;
