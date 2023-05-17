import {Request, Response} from 'express';
import handleErrors from '../../../utilities/controllers/handle_errors';
import * as models from './models';
import logger from '../../../utilities/logger/winston_logger';
import {
  generateDownloadFileURL,
  saveS3File,
} from '../../../utilities/s3_manager';
import {
  sendError,
  sendSuccess,
} from '../../../utilities/controllers/handle_response';

async function generateDownloadURLs(documents: models.IDocument[]) {
  for (let i = 0; i < documents.length; i++) {
    documents[i] = await generateDownloadURL(documents[i]);
  }
  return documents;
}
async function generateDownloadURL(document: models.IDocument) {
  document.doc_file = await generateDownloadFileURL(document.doc_file);
  return document;
}
export async function createDocument(req: Request, res: Response) {
  try {
    const validation = models.schema_create_document.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);

    const validated_req = validation.value;
    if (validated_req.doc_file) {
      validated_req.doc_file.path = 'document/image/';
      validated_req.doc_file = await saveS3File(false, validated_req.doc_file);
    }
    const document = await models.createDocument(validated_req);

    return sendSuccess(res, 201, {id: document.id});
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function updateDocument(req: Request, res: Response) {
  try {
    const validationParam = models.id.validate(req.params.id);
    if (validationParam.error)
      return sendError(res, 400, validationParam.error.details[0].message);
    req.body.id = validationParam.value;

    const validation = models.schema_update_document.validate(req.body);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);

    const validated_req = validation.value;

    const document = await models.readDocumentById(validated_req.id);
    if (!document) return sendError(res, 404, 'Document not found');
    logger.debug('document', document);
    validated_req.doc_file.path = 'document/image/';
    validated_req.doc_file = await saveS3File(
      false,
      validated_req.doc_file,
      document.doc_file
    );
    const updatedocument = await models.updateDocument(validated_req);

    logger.debug('updatedDocument', updatedocument);
    return sendSuccess(res, 200, {id: updatedocument.id});
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function deleteDocumentById(req: Request, res: Response) {
  try {
    const validation = models.id.validate(req.params.id);
    if (validation.error)
      return sendError(res, 404, validation.error.details[0].message);

    const validated_req = validation.value;
    logger.debug('Delete', validated_req);
    const document = await models.readDocumentById(validated_req);
    if (!document) return sendError(res, 404, 'Document  Not Found');
    else {
      await models.deleteDocumentById(validated_req);
    }

    return sendSuccess(res, 200, {id: validated_req});
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function readDocumentById(req: Request, res: Response) {
  try {
    const validation = models.id.validate(req.params.id);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);

    const validated_req = validation.value;

    const document = await models.readDocumentById(validated_req);

    if (!document) return sendError(res, 400, 'Document  Not Found');

    return sendSuccess(res, 200, await generateDownloadURL(document));
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function readAllDocument(req: Request, res: Response) {
  try {
    if (req.query.category) {
      const document = await models.readDocumentByCategory(
        req.query.category as string
      );
      if (!document) return sendError(res, 400, 'Document  Not Found');
      return sendSuccess(res, 200, await generateDownloadURL(document));
    }
    const documents = await models.readAllDocument();
    return sendSuccess(res, 200, await generateDownloadURLs(documents));
  } catch (error) {
    return handleErrors(res, error);
  }
}

export async function readAllActiveDocument(req: Request, res: Response) {
  try {
    const documents = await models.readAllActiveDocument();
    logger.debug('', documents);
    return sendSuccess(res, 200, await generateDownloadURLs(documents));
  } catch (error) {
    return handleErrors(res, error);
  }
}
export async function readDocumentByCategory(req: Request, res: Response) {
  try {
    const validation = models.verify_category.validate(req.query.category);
    if (validation.error)
      return sendError(res, 400, validation.error.details[0].message);

    const validated_req = validation.value;

    const document = await models.readDocumentByCategory(validated_req);

    if (!document) return sendError(res, 400, 'Document  Not Found');

    return sendSuccess(res, 200, await generateDownloadURL(document));
  } catch (error) {
    return handleErrors(res, error);
  }
}
