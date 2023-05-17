class Table {
  static readonly TableName = 'menu_item';
  static readonly ColumnNames = {
    id: 'id',
    restaurant_id: 'restaurant_id',
    name: 'name',
    description: 'description',
    sub_category_id: 'sub_category_id',
    price: 'price',
    veg_egg_non: 'veg_egg_non',
    packing_charges: 'packing_charges',
    is_spicy: 'is_spicy',
    serves_how_many: 'serves_how_many',
    service_charges: 'service_charges',
    item_sgst_utgst: 'item_sgst_utgst',
    item_cgst: 'item_cgst',
    item_igst: 'item_igst',
    item_inclusive: 'item_inclusive',
    disable: 'disable',
    external_id: 'external_id',
    allow_long_distance: 'allow_long_distance',
    image: 'image',
    created_at: 'created_at',
    updated_at: 'updated_at',
    is_deleted: 'is_deleted',
    pos_id: 'pos_id',
    pos_partner: 'pos_partner',
    sequence: 'sequence',
  };
}

export default Table;
