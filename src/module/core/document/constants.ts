class Table {
  static readonly TableName = 'document_master';
  static readonly ColumnNames = {
    id: 'id',
    title: 'title',
    doc_file: 'doc_file',
    data: 'data',
    category: 'category',
    doc_type: 'doc_type',
    status: 'status',
    created_at: 'created_at',
    updated_at: 'updated_at',
    is_deleted: 'is_deleted',
  };
  static readonly categoryNames = {
    restaurant_mou: 'restaurant_mou',
  };
  static readonly doc_type = {
    image: 'image',
    pdf: 'pdf',
    html: 'html',
  };
  static readonly StatusNames = {
    active: 'active',
    inactive: 'inactive',
  };
}
export default Table;
