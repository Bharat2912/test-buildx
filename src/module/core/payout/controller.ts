import {Request, Response} from 'express';
import handleErrors from '../../../utilities/controllers/handle_errors';
import * as models from './models';
import logger from '../../../utilities/logger/winston_logger';
import {
  sendError,
  sendSuccess,
} from '../../../utilities/controllers/handle_response';
import {
  validate_beneficicary_details,
  validate_request_payout_transfer_details,
  validate_transfer_id,
} from './validation';
import {
  getCashfreeBalance,
  getCashfreePayout,
  processCashfreePayout,
} from './cashfree/models';
import {CashFreePayoutStatus} from './cashfree/enum';
import {PayoutStatus} from './enum';
import {
  IPayoutGetTransferDetails,
  IPayoutTransferDetails,
  IProcessPayoutTransfer,
} from './types';
import {getServiceTag} from '../../../utilities/utilFuncs';

export async function createBeneficiaryForPayout(req: Request, res: Response) {
  try {
    const validation = validate_beneficicary_details.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = validation.value as models.IBeneficiaryRequest;
    const create_beneficiary_response = await models.createBeneficicary(
      validated_req
    );
    logger.debug('beneficiary created', create_beneficiary_response);
    return sendSuccess(res, 200, create_beneficiary_response);
  } catch (error) {
    logger.error('error while creating beneficiary for payout', error);
    return handleErrors(res, error);
  }
}

export async function requestPayoutTransfer(req: Request, res: Response) {
  try {
    const validation = validate_request_payout_transfer_details.validate(
      req.body
    );
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = validation.value as IProcessPayoutTransfer;
    logger.debug('creating payout transfer', validated_req);
    const service_tag = getServiceTag(validated_req.service);
    const service_tag_transfer_id =
      service_tag + '_' + validated_req.transferId;
    validated_req.transferId = service_tag_transfer_id;
    const payout_transfer_response = await processCashfreePayout({
      beneId: validated_req.beneId,
      amount: validated_req.amount,
      transferId: validated_req.transferId,
    });
    const response: IPayoutTransferDetails = {};
    response.additional_details = payout_transfer_response;

    if (payout_transfer_response.status === CashFreePayoutStatus.SUCCESS) {
      if (payout_transfer_response.subCode === '200') {
        response.payout_status = PayoutStatus.COMPLETE;
      } else {
        response.payout_status = PayoutStatus.PENDING;
      }
    } else if (
      payout_transfer_response.status === CashFreePayoutStatus.PENDING
    ) {
      response.payout_status = PayoutStatus.PENDING;
    } else if (payout_transfer_response.status === CashFreePayoutStatus.ERROR) {
      response.payout_status = PayoutStatus.FAILED;
    } else {
      throw 'invalid payout transfer status';
    }
    logger.debug('process payout transfer response', response);
    return sendSuccess(res, 200, response);
  } catch (error) {
    logger.error('error while request payout transfer', error);
    return handleErrors(res, error);
  }
}

export async function getTransferDetails(req: Request, res: Response) {
  try {
    const validation = validate_transfer_id.validate({
      transfer_id: req.params.transfer_id,
      service: req.body.service,
    });
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = validation.value as IPayoutGetTransferDetails;
    logger.debug('fetching payout tansfer details', validated_req);
    const service_tag = getServiceTag(validated_req.service);
    const service_tag_transfer_id =
      service_tag + '_' + validated_req.transfer_id;
    const payout_transfer_response = await getCashfreePayout(
      service_tag_transfer_id
    );
    const response: IPayoutTransferDetails = {};
    response.additional_details = payout_transfer_response;
    if (payout_transfer_response.status === CashFreePayoutStatus.SUCCESS) {
      if (
        payout_transfer_response.data.transfer.status ===
          CashFreePayoutStatus.SUCCESS ||
        payout_transfer_response.data.transfer.status ===
          CashFreePayoutStatus.RECEIVED
      ) {
        response.payout_status = PayoutStatus.COMPLETE;
        response.payout_completed_time = new Date();
      } else if (
        payout_transfer_response.data.transfer.status ===
        CashFreePayoutStatus.PENDING
      ) {
        response.payout_status = PayoutStatus.PENDING;
      } else if (
        payout_transfer_response.data.transfer.status ===
        CashFreePayoutStatus.FAILED
      ) {
        response.payout_status = PayoutStatus.FAILED;
      } else if (
        payout_transfer_response.data.transfer.status ===
        CashFreePayoutStatus.REJECTED
      ) {
        response.payout_status = PayoutStatus.REJECTED;
      } else if (
        payout_transfer_response.data.transfer.status ===
        CashFreePayoutStatus.REVERSED
      ) {
        response.payout_status = PayoutStatus.REVERSED;
      } else {
        response.payout_status = PayoutStatus.FAILED;
      }
    } else {
      response.payout_status = PayoutStatus.FAILED;
    }
    logger.debug('payout tansfer details response', response);
    return sendSuccess(res, 200, response);
  } catch (error) {
    logger.error('error while request payout transfer', error);
    return handleErrors(res, error);
  }
}

export async function getPayoutAccountBalance(req: Request, res: Response) {
  try {
    const balance = await getCashfreeBalance();
    logger.debug(`payout account balance at ${new Date()} is ${balance}`);
    return sendSuccess(res, 200, {
      account_balance: balance,
    });
  } catch (error) {
    logger.error('error while fetching payout account balance', error);
    return handleErrors(res, error);
  }
}
