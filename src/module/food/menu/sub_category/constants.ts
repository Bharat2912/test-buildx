class Table {
  static readonly TableName = 'sub_category';
  static readonly ColumnNames = {
    id: 'id',
    name: 'name',
    main_category_id: 'main_category_id',
    created_at: 'created_at',
    updated_at: 'updated_at',
    is_deleted: 'is_deleted',
    pos_id: 'pos_id',
    pos_partner: 'pos_partner',
  };
}

export default Table;
