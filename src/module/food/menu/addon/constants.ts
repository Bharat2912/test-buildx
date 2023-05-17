class Table {
  static readonly TableName = 'addon';
  static readonly ColumnNames = {
    id: 'id',
    addon_group_id: 'addon_group_id',
    name: 'name',
    sequence: 'sequence',
    price: 'price',
    veg_egg_non: 'veg_egg_non',
    in_stock: 'in_stock',
    sgst_rate: 'sgst_rate',
    cgst_rate: 'cgst_rate',
    igst_rate: 'igst_rate',
    gst_inclusive: 'gst_inclusive',
    external_id: 'external_id',
    status: 'status',
    created_at: 'created_at',
    updated_at: 'updated_at',
    is_deleted: 'is_deleted',
    pos_id: 'pos_id',
    pos_partner: 'pos_partner',
    next_available_after: 'next_available_after',
  };
}
export default Table;
