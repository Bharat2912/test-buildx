class Table {
  static readonly TableName = 'polygon_master';
  static readonly ColumnNames = {
    id: 'id',
    name: 'name',
    coordinates: 'coordinates',
    city_id: 'city_id',
    status: 'status',
    created_at: 'created_at',
    updated_at: 'updated_at',
    is_deleted: 'is_deleted',
  };
  static readonly StatusNames = {
    created: 'created',
    geohashPending: 'geohashPending',
    geohashFailed: 'geohashFailed',
    active: 'active',
  };
}
export type StatusType =
  | 'created'
  | 'geohashPending'
  | 'geohashFailed'
  | 'active';
export default Table;
