class Table {
  static readonly TableName = 'banner';
  static readonly ColumnNames = {
    id: 'id',
    title: 'title',
    image_bucket: 'image_bucket',
    image_path: 'image_path',
    banner_link: 'banner_link',
    link_type: 'link_type',
    sequence: 'sequence',
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
