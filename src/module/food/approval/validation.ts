import Joi from 'joi';
import {joi_restaurant_id} from '../../../utilities/joi_common';
import {
  ApprovalAction,
  ApprovalEntityType,
  ApprovalStatus,
  SortOrder,
} from './enums';

const pagination = Joi.object({
  page_index: Joi.number().required().min(0).integer(),
  page_size: Joi.number().required().min(1).max(50).integer(),
});

const sort = Joi.object({
  column: Joi.string().required(),
  order: Joi.string()
    .valid(SortOrder.ASCENDING, SortOrder.DESCENDING)
    .required(),
});

export const approval_admin_filter = Joi.object({
  search_text: Joi.string(),
  filter: Joi.object({
    action: Joi.array().items(
      Joi.string().valid(
        ApprovalAction.CREATE,
        ApprovalAction.DELETE,
        ApprovalAction.UPDATE
      )
    ),
    restaurant_id: Joi.array().items(joi_restaurant_id),
    entity_id: Joi.array().items(Joi.number()),
    entity_type: Joi.array().items(
      Joi.string().valid(
        ApprovalEntityType.ADDON,
        ApprovalEntityType.ADDON_GROUP,
        ApprovalEntityType.MAIN_CATEGORY,
        ApprovalEntityType.MENU_ITEM,
        ApprovalEntityType.SUB_CATEGORY
      )
    ),
    status: Joi.array().items(
      Joi.string().valid(
        ApprovalStatus.REVIEWED,
        ApprovalStatus.PENDING,
        ApprovalStatus.REJECTED
      )
    ),
    change_requested_by: Joi.array().items(Joi.string()),
    approved_by: Joi.array().items(Joi.string()),
    duration: Joi.object({
      start_date: Joi.number().required(),
      end_date: Joi.number().required(),
    }),
  }),
  pagination: pagination,
  sort: Joi.array().items(sort),
});

export const admin_review_details = Joi.object({
  approval_ids: Joi.array().items(Joi.number()).min(1).max(100),
  status: Joi.string()
    .valid(
      ApprovalStatus.REVIEWED,
      ApprovalStatus.PENDING,
      ApprovalStatus.REJECTED
    )
    .required(),
  status_comments: Joi.string()
    .max(200)
    .when('status', {
      is: Joi.string().valid(ApprovalStatus.REJECTED),
      then: Joi.required(),
    }),
});
