import {Request, Response} from 'express';
import {v4 as uuidv4} from 'uuid';
import {getS3TempUploadSignedUrl} from '../../../utilities/s3_manager';
import handleErrors from '../../../utilities/controllers/handle_errors';
import {
  sendError,
  sendSuccess,
} from '../../../utilities/controllers/handle_response';

export async function getUploadURL(req: Request, res: Response) {
  try {
    if (!req.params.file_extn)
      return sendError(res, 400, 'File Extention not provided');
    let extn = req.params.file_extn;
    if (!extn.startsWith('.')) extn = '.' + extn;
    const file_name = uuidv4() + extn;
    const uploadUrl = await getS3TempUploadSignedUrl(file_name);
    return sendSuccess(res, 200, {
      file_name: file_name,
      uploadUrl,
    });
  } catch (error) {
    return handleErrors(res, error);
  }
}
