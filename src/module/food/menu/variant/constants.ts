class Table {
  static readonly TableName = 'item_variant';
  static readonly ColumnNames = {
    id: 'id',
    variant_group_id: 'variant_group_id',
    name: 'name',
    is_default: 'is_default',
    price: 'price',
    serves_how_many: 'serves_how_many',
    veg_egg_non: 'veg_egg_non',
    in_stock: 'in_stock',
    created_at: 'created_at',
    updated_at: 'updated_at',
    is_deleted: 'is_deleted',
    pos_id: 'pos_id',
    pos_variant_item_id: 'pos_variant_item_id',
    pos_partner: 'pos_partner',
  };
}
export default Table;
