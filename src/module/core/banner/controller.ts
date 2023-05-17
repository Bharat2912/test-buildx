import {Request, Response} from 'express';
import handleErrors from '../../../utilities/controllers/handle_errors';
import * as models from './models';
import logger from '../../../utilities/logger/winston_logger';
import {saveS3File, generateDownloadURLs} from '../../../utilities/s3_manager';
import {
  sendError,
  sendSuccess,
} from '../../../utilities/controllers/handle_response';

// 1
export async function createBanner(req: Request, res: Response) {
  try {
    const validation = models.schema_create_banner.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);

    const validated_req = validation.value;

    if (validated_req.image_name) {
      const file_result = await saveS3File(true, {
        path: 'banner/images/',
        name: validated_req.image_name,
      });
      validated_req.image_path = (file_result?.path || '') + file_result?.name;
      validated_req.image_bucket = file_result?.bucket;
      delete validated_req.image_name;
    }

    const banner = await models.createBanner(validated_req);

    return sendSuccess(res, 200, banner);
  } catch (error) {
    return handleErrors(res, error);
  }
}

// 2
export async function updateBanner(req: Request, res: Response) {
  try {
    const validationParam = models.id.validate(req.params.id);
    if (validationParam.error)
      return sendError(res, 400, validationParam.error.details[0].message);
    req.body.id = validationParam.value;

    const validation = models.schema_update_banner.validate(req.body);
    if (validation.error)
      return sendError(res, 404, validation.error.details[0].message);

    const validated_req = validation.value;

    const banner = await models.readBannerById(validated_req.id);
    if (!banner) return sendError(res, 404, 'Banner not found');
    logger.debug('banner', banner);
    if (validated_req.image_name) {
      const file_result = await saveS3File(
        true,
        {
          path: 'banner/images/',
          name: validated_req.image_name,
        },
        {
          path: banner.image_path,
          bucket: banner.image_bucket,
        }
      );
      validated_req.image_path = (file_result?.path || '') + file_result?.name;
      validated_req.image_bucket = file_result?.bucket;
      delete validated_req.image_name;
    }
    const updatebanner = await models.updateBanner(validated_req);

    logger.debug('updatedBanner', updatebanner);
    return sendSuccess(res, 200, {id: updatebanner.id});
  } catch (error) {
    return handleErrors(res, error);
  }
}

// 3
export async function deleteBannerById(req: Request, res: Response) {
  try {
    const validation = models.id.validate(req.params.id);
    if (validation.error)
      return sendError(res, 404, validation.error.details[0].message);

    const validated_req = validation.value;
    logger.debug('Delete', validated_req);
    const banner = await models.readBannerById(validated_req);
    if (!banner) return sendError(res, 404, 'Banner  Not Found');
    else {
      await models.deleteBannerById(validated_req);
    }
    //const deletebanner = await models.deleteBannerById(validated_req);

    return sendSuccess(res, 200, {id: validated_req});
  } catch (error) {
    return handleErrors(res, error);
  }
}

// 4
export async function readBannerById(req: Request, res: Response) {
  try {
    const validation = models.id.validate(req.params.id);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);

    const validated_req = validation.value;

    const banner = await models.readBannerById(validated_req);

    if (!banner) return sendError(res, 400, 'Banner  Not Found');

    return sendSuccess(res, 200, await generateDownloadURLs([banner]));
  } catch (error) {
    return handleErrors(res, error);
  }
}

// 5
export async function readAllBanner(req: Request, res: Response) {
  try {
    const banner = await models.readAllBanner();
    return sendSuccess(res, 200, await generateDownloadURLs(banner));
  } catch (error) {
    return handleErrors(res, error);
  }
}

// 6
export async function readAllActiveBanner(req: Request, res: Response) {
  try {
    const banner = await models.readAllActiveBanner();
    logger.debug('', banner);
    return sendSuccess(res, 200, await generateDownloadURLs(banner));
  } catch (error) {
    return handleErrors(res, error);
  }
}
