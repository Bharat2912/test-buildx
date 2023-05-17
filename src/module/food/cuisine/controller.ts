import {Request, Response} from 'express';
import handleErrors from '../../../utilities/controllers/handle_errors';
import * as models from './models';
import {
  sendError,
  sendSuccess,
} from '../../../utilities/controllers/handle_response';
import constants from './constants';
import {saveS3File} from '../../../utilities/s3_manager';
import {setCuisineDownloadURL, setCuisinesDownloadURL} from './service';
// 1
/**
 * Create a new cuisine
 * @param {Request} req - Request
 * @param {Response} res - Response
 * @returns The id of the newly created cuisine.
 */
export async function createCuisine(req: Request, res: Response) {
  try {
    const validation = models.verify_create_cuisine.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);
    if (
      !(
        req.body.status === constants.StatusNames.active ||
        req.body.status === constants.StatusNames.in_active
      )
    ) {
      return sendError(
        res,
        400,
        'Cuisine cannot be created not in active/in_active state'
      );
    }
    const validated_req = validation.value;

    if (validated_req.image) {
      validated_req.image.path = 'cuisine/images/';
      validated_req.image = await saveS3File(true, validated_req.image);
    }

    const cuisine = await models.createCuisine(validated_req);

    return sendSuccess(res, 201, {id: cuisine.id});
  } catch (error) {
    return handleErrors(res, error);
  }
}

// 2
/**
 * Update a cuisine
 * @param {Request} req - Request
 * @param {Response} res - Response
 * @returns The id of the updated cuisine.
 */
export async function updateCuisine(req: Request, res: Response) {
  try {
    const validationParam = models.id.validate(req.params.id);
    if (validationParam.error)
      return sendError(res, 400, validationParam.error.details[0].message);
    if (
      !(
        req.body.status === constants.StatusNames.active ||
        req.body.status === constants.StatusNames.in_active
      )
    ) {
      return sendError(
        res,
        400,
        'Cuisine cannot be created not in active/in_active state'
      );
    }
    req.body.id = validationParam.value;
    const validation = models.verify_update_cuisine.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);

    const validated_req = validation.value;

    const cuisine = (await models.readCusineById(validated_req.id))[0];
    if (!cuisine) return sendError(res, 404, 'Cuisine  Not Found');

    if (validated_req.image) {
      validated_req.image.path = 'cuisine/images/';
      validated_req.image = await saveS3File(
        true,
        validated_req.image,
        cuisine.image
      );
    }

    const updatedCuisine = await models.updateCusine(validated_req);
    return sendSuccess(res, 200, {id: updatedCuisine.id});
  } catch (error) {
    return handleErrors(res, error);
  }
}

// 3
/**
 * It deletes a cuisine by id.
 * @param {Request} req - Request
 * @param {Response} res - Response
 * @returns The id of the deleted cuisine.
 */
export async function deleteCuisineById(req: Request, res: Response) {
  try {
    const validation = models.id.validate(req.params.id);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);

    const validated_req = validation.value;

    const cuisine = (await models.readCusineById(validated_req))[0];
    if (!cuisine) return sendError(res, 404, 'Cuisine  Not Found');
    else {
      await models.deleteCusineById(validated_req);
    }
    return sendSuccess(res, 200, {id: cuisine.id});
  } catch (error) {
    return handleErrors(res, error);
  }
}

// 4
/**
 * Read a cuisine by id
 * @param {Request} req - Request
 * @param {Response} res - Response
 * @returns A JSON object with the cuisine details.
 */
export async function readCuisineById(req: Request, res: Response) {
  try {
    const validation = models.id.validate(req.params.id);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);

    const validated_req = validation.value;

    const cuisine = await models.readCusineById(validated_req);
    if (!cuisine[0]) return sendError(res, 404, 'Cuisine  Not Found');

    await setCuisineDownloadURL(cuisine[0]);
    return sendSuccess(res, 200, cuisine);
  } catch (error) {
    return handleErrors(res, error);
  }
}

// 5
/**
 * Read all cuisine from the database
 * @param {Request} req - Request
 * @param {Response} res - Response
 * @returns An array of objects
 */
export async function readAllCuisine(req: Request, res: Response) {
  try {
    const cuisine = await models.readAllCusine();
    await setCuisinesDownloadURL(cuisine);
    return sendSuccess(res, 200, cuisine);
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function readCuisinesForCustomer(req: Request, res: Response) {
  try {
    const cuisine = await models.readActiveCuisines();
    await setCuisinesDownloadURL(cuisine);
    return sendSuccess(res, 200, cuisine);
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function readCuisinesForPartner(req: Request, res: Response) {
  try {
    const cuisine = await models.readActiveCuisines();
    await setCuisinesDownloadURL(cuisine);
    return sendSuccess(res, 200, cuisine);
  } catch (error) {
    return handleErrors(res, error);
  }
}
