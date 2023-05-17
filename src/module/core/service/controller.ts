import {Request, Response} from 'express';
import handleErrors from '../../../utilities/controllers/handle_errors';
import * as models from './models';
import {
  saveS3File,
  generateDownloadURLs,
  generateDownloadURL,
} from '../../../utilities/s3_manager';
import {
  sendError,
  sendSuccess,
} from '../../../utilities/controllers/handle_response';
import Globals from '../../../utilities/global_var/globals';

export async function readServiceById(req: Request, res: Response) {
  try {
    const validation = models.id.validate(req.params.id);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = validation.value;
    const service = await models.readServiceById(validated_req);
    if (!service) return sendError(res, 404, 'Service not found');
    return sendSuccess(res, 200, await generateDownloadURL(service));
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function getServices(req: Request, res: Response) {
  try {
    const services = await models.getServices();
    const support = {
      phone: await Globals.SUPPORT_CONTACT.get(),
    };
    const result = {
      support: support,
      services: await generateDownloadURLs(services),
    };
    return sendSuccess(res, 200, result);
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function updateService(req: Request, res: Response) {
  try {
    const validationParam = models.id.validate(req.params.id);
    if (validationParam.error)
      return sendError(res, 400, validationParam.error.details[0].message);
    req.body.id = validationParam.value;

    const validation = models.verify_update_service.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    const validated_req = validation.value;
    const service = await models.readServiceById(validated_req.id);
    if (!service) return sendError(res, 404, 'Service not found');
    if (validated_req.image_name) {
      const file_result = await saveS3File(
        true,
        {
          path: 'services/images/',
          name: validated_req.image_name,
        },
        {
          path: service.image_path,
          bucket: service.image_bucket,
        }
      );
      validated_req.image_path = (file_result?.path || '') + file_result?.name;
      validated_req.image_bucket = file_result?.bucket;
      delete validated_req.image_name;
    }
    const updatedService = await models.updateService(validated_req);
    return sendSuccess(res, 200, updatedService);
  } catch (error) {
    return handleErrors(res, error);
  }
}
