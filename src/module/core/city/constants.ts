class Table {
  static readonly TableName = 'city_master';
  static readonly ColumnNames = {
    id: 'id',
    name: 'name',
    status: 'status',
    created_at: 'created_at',
    updated_at: 'updated_at',
    is_deleted: 'is_deleted',
  };
  static readonly StatusNames = {
    active: 'active',
    inactive: 'inactive',
  };
}

export type StatusType = 'inactive' | 'active';
export default Table;
