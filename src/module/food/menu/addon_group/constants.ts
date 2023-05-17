class Table {
  static readonly TableName = 'addon_group';
  static readonly ColumnNames = {
    id: 'id',
    restaurant_id: 'restaurant_id',
    name: 'name',
    created_at: 'created_at',
    updated_at: 'updated_at',
    is_deleted: 'is_deleted',
    pos_id: 'pos_id',
    pos_partner: 'pos_partner',
  };
}
export default Table;
