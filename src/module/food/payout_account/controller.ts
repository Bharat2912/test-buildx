import {Request, Response} from 'express';
import handleErrors from '../../../utilities/controllers/handle_errors';
import * as Joi from '../../../utilities/joi_common';
import * as models from './models';
import {
  sendError,
  sendSuccess,
} from '../../../utilities/controllers/handle_response';
import {createBeneficicary} from '../../core/payout/models';
import {readRestaurantById} from '../restaurant/models';
import logger from '../../../utilities/logger/winston_logger';
import {ifscBankname} from '../../../utilities/ifsc_bankname';

export async function createPayoutAccount(req: Request, res: Response) {
  try {
    const validation = models.verify_create_payout_account.validate(req.body);
    if (validation.error)
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 1000,
        },
      ]);
    const validated_req = <models.IPayoutAccount>validation.value;
    const bank_details = await ifscBankname(validated_req.ifsc_code);
    if (!bank_details) {
      return sendError(res, 400, [
        {
          message: 'bank name not found for ifsc',
          code: 1086,
        },
      ]);
    }
    //
    //** add check if vendor add same account twice need to throw error.
    /* read existing bank account deatils and compare the bank account number with validated_req if both are same then throw error */
    //

    const existing_payout_account =
      await models.readPayoutAccountByBankAccAndIfscNumber(
        req.user.data.restaurant_id,
        validated_req.bank_account_number,
        validated_req.ifsc_code
      );

    if (existing_payout_account) {
      return sendError(res, 400, [
        {
          message: 'This Bank account already exists',
          code: 1086,
        },
      ]);
    }

    validated_req.bank_name = bank_details.BANK; //'ICIC';
    validated_req.restaurant_id = req.user.data.restaurant_id;
    validated_req.created_vendor_id = req.user.id;
    validated_req.status = 'active';
    const payout_account = await models.createPayoutAccount(validated_req);
    return sendSuccess(res, 201, payout_account);
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function readPayoutAccounts(req: Request, res: Response) {
  try {
    const payout_accounts = await models.readPayoutAccounts(
      req.user.data.restaurant_id
    );
    if (!payout_accounts || !payout_accounts.length)
      return sendError(res, 404, [
        {
          message: 'payout account not found',
          code: 1085,
        },
      ]);
    return sendSuccess(res, 200, payout_accounts);
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function readPayoutAccount(req: Request, res: Response) {
  try {
    const validation = Joi.id.validate(req.params.id);
    if (validation.error)
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 1000,
        },
      ]);

    const validated_req = validation.value;

    const payout_account = await models.readPayoutAccount(validated_req);
    if (
      !payout_account ||
      payout_account.restaurant_id !== req.user.data.restaurant_id
    )
      return sendError(res, 404, [
        {
          message: 'payout account not found',
          code: 1085,
        },
      ]);
    return sendSuccess(res, 200, payout_account);
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function makePrimaryPayoutAccount(req: Request, res: Response) {
  try {
    const validation = Joi.id.validate(req.params.id);
    if (validation.error)
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 1000,
        },
      ]);

    const validated_req = validation.value;

    const payout_account = await models.readPayoutAccount(validated_req);
    if (
      !payout_account ||
      payout_account.restaurant_id !== req.user.data.restaurant_id
    )
      return sendError(res, 404, [
        {
          message: 'payout account not found',
          code: 1085,
        },
      ]);
    if (!payout_account.ifsc_verified) {
      return sendError(res, 400, [
        {
          message: 'ifsc not verified',
          code: 1087,
        },
      ]);
    }
    if (payout_account.is_primary) {
      return sendError(res, 400, [
        {
          message: 'payout account already primary',
          code: 1088,
        },
      ]);
    }
    if (!payout_account.beneficiary_details) {
      const restaurant_details = await readRestaurantById(
        payout_account.restaurant_id
      );
      try {
        const cfResponse = await createBeneficicary({
          name: restaurant_details.name!,
          email: restaurant_details.owner_email!,
          phone:
            restaurant_details.manager_contact_number ||
            restaurant_details.owner_contact_number!,
          address: restaurant_details.business_address || 'No Address',
          bank_account_number: payout_account.bank_account_number,
          bank_ifsc: payout_account.ifsc_code,
        });
        payout_account.beneficiary_details = {
          beneficiary_id: cfResponse.beneficiary_id,
        };
        await models.updatePayoutAccount(payout_account);
      } catch (error) {
        logger.error('beneficiary registration crashed', error);
        throw error;
      }
    }

    await models.makePrimaryPayoutAccount(payout_account);

    const payout_account_updated = await models.readPayoutAccount(
      payout_account.id
    );
    return sendSuccess(res, 200, payout_account_updated);
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function verifyIfscPayoutAccount(req: Request, res: Response) {
  try {
    const validation = Joi.id.validate(req.params.id);
    if (validation.error)
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 1000,
        },
      ]);
    const validated_req = validation.value;

    const payout_account = await models.readPayoutAccount(validated_req);
    if (
      !payout_account ||
      payout_account.restaurant_id !== req.user.data.restaurant_id
    )
      return sendError(res, 404, [
        {
          message: 'payout account not found',
          code: 1085,
        },
      ]);

    if (payout_account.ifsc_verified) {
      return sendError(res, 400, [
        {
          message: 'payout account ifsc already verified',
          code: 1089,
        },
      ]);
    }
    if (req.body.ifsc_code) {
      payout_account.ifsc_code = req.body.ifsc_code;
      const bank_name = await ifscBankname(req.body.ifsc_code);
      if (!bank_name) {
        return sendError(res, 400, [
          {
            message: 'bank name not found for ifsc',
            code: 1086,
          },
        ]);
      }
      payout_account.bank_name = bank_name.BANK;
    }
    //const verify_result = await ifscBankname(payout_account.ifsc_code);
    payout_account.ifsc_verified = true;
    await models.updatePayoutAccount(payout_account);
    // if (!verify_result.valid) {
    //   return sendError(res, 400, [
    //     {
    //       message: verify_result.reason,
    //       code: 1000,
    //     },
    //   ]);
    // }
    return sendSuccess(res, 200, payout_account);
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function deletePayoutAccount(req: Request, res: Response) {
  try {
    const validation = Joi.id.validate(req.params.id);
    if (validation.error)
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 1000,
        },
      ]);

    const validated_req = validation.value;

    const payout_account = await models.readPayoutAccount(validated_req!);
    if (
      !payout_account ||
      payout_account.restaurant_id !== req.user.data.restaurant_id
    )
      return sendError(res, 404, [
        {
          message: 'payout account not found',
          code: 1085,
        },
      ]);
    if (payout_account.is_primary) {
      return sendError(res, 400, [
        {
          message: 'primary payout account cannot verified',
          code: 1091,
        },
      ]);
    }
    await models.deletePayoutAccount(validated_req);

    return sendSuccess(res, 200, payout_account);
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function admin_readPayoutAccounts(req: Request, res: Response) {
  try {
    const validation = Joi.id.validate(req.query.restaurant_id);
    if (validation.error)
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 1000,
        },
      ]);

    const validated_req = validation.value;
    const payout_accounts = await models.readPayoutAccounts(validated_req);
    if (!payout_accounts || !payout_accounts.length)
      return sendError(res, 404, [
        {
          message: 'payout account not found',
          code: 1085,
        },
      ]);
    return sendSuccess(res, 200, payout_accounts);
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function admin_readPayoutAccount(req: Request, res: Response) {
  try {
    const validation = Joi.id.validate(req.params.id);
    if (validation.error)
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 1000,
        },
      ]);

    const validated_req = validation.value;

    const payout_account = await models.readPayoutAccount(validated_req);
    if (!payout_account)
      return sendError(res, 404, [
        {
          message: 'payout account not found',
          code: 1085,
        },
      ]);
    return sendSuccess(res, 200, payout_account);
  } catch (error) {
    return handleErrors(res, error);
  }
}
