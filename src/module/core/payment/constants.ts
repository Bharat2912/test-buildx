export class RefundMasterTable {
  static readonly TableName = 'refund_master';
  static readonly ColumnNames = {
    id: 'id',
    service: 'service',
    payment_id: 'payment_id',
    order_id: 'order_id',
    is_pod: 'is_pod',
    customer_id: 'customer_id',
    refund_status: 'refund_status',
    status_description: 'status_description',
    refund_gateway: 'refund_gateway',
    refund_charges: 'refund_charges',
    refund_amount: 'refund_amount',
    refund_currency: 'refund_currency',
    refund_note: 'refund_note',
    additional_details: 'additional_details',
    processed_at: 'processed_at',
    created_at: 'created_at',
    updated_at: 'updated_at',
  };
}
export const REFUND_MASTER_DETAILS_SQL_QUERY = `(
  SELECT
  rm.id as id,
  rm.service as service,
  rm.payment_id as payment_id,
  rm.order_id as order_id,
  rm.customer_id as customer_id,
  rm.is_pod,
  rm.refund_status as refund_status,
  rm.status_description as status_description,
  rm.refund_gateway as refund_gateway,
  rm.refund_charges as refund_charges,
  rm.refund_amount as refund_amount,
  rm.refund_currency as refund_currency,
  rm.refund_note as refund_note,
  rm.additional_details as additional_details,
  rm.processed_at as processed_at,
  rm.created_at as created_at,
  rm.updated_at as updated_at
  FROM refund_master AS rm
) AS a
`;
