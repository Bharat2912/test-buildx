class Table {
  static readonly TableName = 'service_master';
  static readonly ColumnNames = {
    id: 'id',
    name: 'name',
    image_path: 'image_path',
    sequence: 'sequence',
    image_bucket: 'image_bucket',
    status: 'status',
    created_at: 'created_at',
    updated_at: 'updated_at',
    is_deleted: 'is_deleted',
  };
  static readonly StatusNames = {
    created: 'created',
    active: 'active',
  };
}
export type StatusType = 'created' | 'active';
export default Table;
