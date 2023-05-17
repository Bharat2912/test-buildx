import {Request, Response} from 'express';
import {
  sendError,
  sendSuccess,
} from '../../../utilities/controllers/handle_response';
import {bulkUpdateApproval, readApprovalsWithFilter} from './model';
import {IAdminFilterApprovals, IReviewDetails} from './types';
import {admin_review_details, approval_admin_filter} from './validation';
import handleErrors from '../../../utilities/controllers/handle_errors';
import logger from '../../../utilities/logger/winston_logger';
import {getAdminDetailsByIds} from '../../../utilities/user_api';

export async function filterApprovalsAsAdmin(req: Request, res: Response) {
  try {
    const validation = approval_admin_filter.validate(req.body);
    if (validation.error) {
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 1000,
        },
      ]);
    }
    const validated_req = validation.value as IAdminFilterApprovals;
    const result = await readApprovalsWithFilter(validated_req);
    const token = req.headers.authorization!;

    const approval_hashmap = new Map();
    for (let i = 0; i < result.records.length; i++) {
      if (result.records[i].approved_by !== null) {
        approval_hashmap.set(result.records[i].approved_by, null);
      }
    }
    const admin_approval_ids: string[] = Array.from(approval_hashmap.keys());

    if (admin_approval_ids.length > 0) {
      const admin_approval_details = await getAdminDetailsByIds(
        token,
        admin_approval_ids
      );
      for (let i = 0; i < admin_approval_details.length; i++) {
        approval_hashmap.set(
          admin_approval_details[i].id,
          admin_approval_details[i].user_name
        );
      }
      for (let i = 0; i < result.records.length; i++) {
        result.records[i].approved_by_name = approval_hashmap.get(
          result.records[i].approved_by
        );
      }
    }

    return sendSuccess(res, 200, result);
  } catch (error) {
    logger.error('failed while filtering approval records as admin', error);
    return handleErrors(res, error);
  }
}

export async function reviewApprovalRequest(req: Request, res: Response) {
  try {
    req.params.approval_ids = req.params.approval_ids || '';
    const validation = admin_review_details.validate({
      approval_ids: req.params.approval_ids.split(','),
      status: req.body.status,
      status_comments: req.body.status_comments,
    });
    if (validation.error)
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 1000,
        },
      ]);
    const validated_req = validation.value as IReviewDetails;
    const result = await bulkUpdateApproval(validated_req.approval_ids, {
      status: validated_req.status,
      status_comments: validated_req.status_comments,
      approved_by: req.user.id,
    });
    return sendSuccess(res, 200, result);
  } catch (error) {
    logger.error('failed while reviewing approval request', error);
    return handleErrors(res, error);
  }
}
