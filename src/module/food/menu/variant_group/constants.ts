class Table {
  static readonly TableName = 'item_variant_group';
  static readonly ColumnNames = {
    id: 'id',
    menu_item_id: 'menu_item_id',
    name: 'name',
    // status: 'status',
    created_at: 'created_at',
    updated_at: 'updated_at',
    is_deleted: 'is_deleted',
    pos_id: 'pos_id',
    pos_partner: 'pos_partner',
  };
  // static readonly StatusNames = {
  //   active: 'active',
  // };
}
export default Table;
