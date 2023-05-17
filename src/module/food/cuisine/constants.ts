// id , name, created at , Updated at ,is Deleted.

class Table {
  static readonly TableName = 'cuisine_master';
  static readonly ColumnNames = {
    id: 'id',
    name: 'name',
    status: 'status',
    created_at: 'created_at',
    updated_at: 'updated_at',
    is_deleted: 'is_deleted',
    image: 'image',
  };
  static readonly StatusNames = {
    created: 'created',
    active: 'active',
    in_active: 'in_active',
  };
}

export default Table;
