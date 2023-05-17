import {Request, Response} from 'express';
import handleErrors from '../controllers/handle_errors';
import * as models from './models';
import logger from '../logger/winston_logger';
import {sendError, sendSuccess} from '../controllers/handle_response';
import {verify_update_global_var} from './validation';
import Joi from 'joi';
import Globals from './globals';
import {GlobalVarAccessRole} from './enums';
import {FileObject, saveS3File} from '../s3_manager';

export async function updateGlobalVar(req: Request, res: Response) {
  try {
    req.body.key = req.params.key;
    const validation = verify_update_global_var.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);

    const validated_req = validation.value;

    const global_var = await models.readGlobalVarByKey(validated_req.key);

    let expectedType;
    if (
      typeof validated_req.value === 'string' &&
      validated_req.value.match(/\.[0-9a-z]+$/i) &&
      !validated_req.value.includes('@')
    ) {
      expectedType = 'file';
    } else if (typeof validated_req.value === 'string') {
      expectedType = 'string';
    } else if (typeof validated_req.value === 'object') {
      if (Array.isArray(validated_req.value)) {
        validated_req.value = JSON.stringify(validated_req.value);
      }
      expectedType = 'json';
    } else if (typeof validated_req.value === 'number') {
      expectedType = 'number';
    } else {
      expectedType = typeof validated_req.value;
    }

    if (global_var.type !== expectedType) {
      return sendError(
        res,
        400,
        `Please use valid type.valid type is ${global_var.type}`
      );
    }

    if (!global_var) return sendError(res, 404, 'GlobalVar  Not Found');
    if (!global_var.editable)
      return sendError(res, 400, 'GlobalVar  Not Editable');

    if (validated_req.access_roles) {
      validated_req.access_roles.push(GlobalVarAccessRole.ADMIN);
    }

    if (global_var.type === 'file') {
      const new_file_object: FileObject = {name: validated_req.value};
      new_file_object!.path = 'global_var_files/';
      const result = await saveS3File(true, new_file_object, global_var.value);
      validated_req.value = result;
    }

    const updatedGlobalVar = await models.updateGlobalVar(validated_req);

    await Globals.sync(updatedGlobalVar);

    logger.debug('Global variable updated successfully', updatedGlobalVar);
    return sendSuccess(res, 200, updatedGlobalVar);
  } catch (error) {
    return handleErrors(
      res,
      error,
      'Error originated while updating global variable'
    );
  }
}

export async function readGlobalVarById(req: Request, res: Response) {
  try {
    const validation = Joi.string().min(5).max(70).validate(req.params.key);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);

    const validated_req = validation.value;
    const global_var = await models.readGlobalVarByKey(validated_req);
    if (!global_var) return sendError(res, 404, 'GlobalVar  Not Found');

    await Globals.setType(global_var);
    return sendSuccess(res, 200, global_var);
  } catch (error) {
    return handleErrors(
      res,
      error,
      'Error originated while reading global variable'
    );
  }
}

export async function readAllGlobalVar(req: Request, res: Response) {
  try {
    const global_vars = await models.readAllGlobalVar();

    await Promise.all(
      global_vars.map(async variable => {
        await Globals.setType(variable);
      })
    );

    return sendSuccess(res, 200, global_vars);
  } catch (error) {
    return handleErrors(
      res,
      error,
      'Error originated while reading all global variables'
    );
  }
}

export async function readAllVendorGlobalVar(req: Request, res: Response) {
  try {
    const global_vars = await models.readGlobalVarByAccessRole([
      GlobalVarAccessRole.VENDOR,
    ]);

    await Promise.all(
      global_vars.map(async variable => {
        await Globals.setType(variable);
      })
    );

    return sendSuccess(res, 200, global_vars);
  } catch (error) {
    return handleErrors(
      res,
      error,
      'Error originated while reading all global variables of vendor'
    );
  }
}

export async function readAllCustomerGlobalVar(req: Request, res: Response) {
  try {
    const global_vars = await models.readGlobalVarByAccessRole([
      GlobalVarAccessRole.CUSTOMER,
    ]);

    await Promise.all(
      global_vars.map(async variable => {
        await Globals.setType(variable);
      })
    );

    return sendSuccess(res, 200, global_vars);
  } catch (error) {
    return handleErrors(
      res,
      error,
      'Error originated while reading all global variables of customer'
    );
  }
}
