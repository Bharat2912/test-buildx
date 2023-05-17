class Table {
  static readonly TableName = 'main_category';
  static readonly ColumnNames = {
    id: 'id',
    restaurant_id: 'restaurant_id',
    name: 'name',
    created_at: 'created_at',
    updated_at: 'updated_at',
    is_deleted: 'is_deleted',
    pos_id: 'pos_id',
    pos_partner: 'pos_partner',
    sequence: 'sequence',
    discount_rate: 'discount_rate',
  };
}

export default Table;
