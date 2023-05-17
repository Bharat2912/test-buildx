export class ApprovalTable {
  static readonly TableName = 'approval';
  static readonly ColumnNames = {
    id: 'id',
    action: 'action',
    restaurant_id: 'restaurant_id',
    entity_type: 'entity_type',
    entity_id: 'entity_id',
    previous_entity_details: 'previous_entity_details',
    requested_entity_changes: 'requested_entity_changes',
    status: 'status',
    status_comments: 'status_comments',
    change_requested_by: 'change_requested_by',
    approved_by: 'approved_by',
    additional_details: 'additional_details',
    created_at: 'created_at',
    updated_at: 'updated_at',
  };
}

export const ADMIN_APPROVAL_DETAILS_SQL_QUERY = `(
  SELECT
  ap.id as id,
  ap.action as action,
  ap.restaurant_id as restaurant_id,
  r.name as restaurant_name,
  ap.entity_type as entity_type,
  ap.entity_id as entity_id,
  ap.previous_entity_details as previous_entity_details,
  ap.requested_entity_changes as requested_entity_changes,
  ap.status as status,
  ap.status_comments as status_comments,
  ap.change_requested_by as change_requested_by,
  ap.approved_by as approved_by,
  ap.additional_details as additional_details,
  ap.created_at as created_at,
  ap.updated_at as updated_at
  FROM approval AS ap
  JOIN restaurant AS r ON ap.restaurant_id = r.id
) AS a
`;
