import {
  ApprovalAction,
  ApprovalEntityType,
  ApprovalStatus,
  OrderByColumn,
  SortOrder,
} from './enums';

export interface IApproval {
  id?: number;
  action?: ApprovalAction;
  restaurant_id?: string;
  entity_type?: ApprovalEntityType;
  entity_id?: number;
  previous_entity_details?: object;
  requested_entity_changes?: object;
  status?: ApprovalStatus;
  status_comments?: string;
  change_requested_by?: string;
  approved_by?: string;
  approved_by_name?: string;
  additional_details?: object;
  created_at?: string | Date;
  updated_at?: string | Date;
}

export interface IMarkForApproval {
  approval_entities: IApproval[];
  // send_notification: boolean;
}

export interface IPagination {
  page_index: number;
  page_size: number;
}

export interface IOrderBy {
  column: OrderByColumn;
  order: SortOrder;
}
export interface IAdminFilterApprovals {
  search_text?: string;
  filter?: {
    action?: ApprovalAction[];
    restaurant_id?: string[];
    entity_id?: number[];
    entity_type?: ApprovalEntityType[];
    status?: ApprovalStatus[];
    change_requested_by?: string[];
    approved_by?: string[];
    duration?: {
      start_date: number;
      end_date: number;
    };
  };
  pagination?: IPagination;
  sort?: IOrderBy[];
}

export interface IReviewDetails {
  approval_ids: number[];
  status: ApprovalStatus;
  status_comments?: string;
}
