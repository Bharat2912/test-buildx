class Table {
  static readonly TableName = 'payout_account';
  static readonly ColumnNames = {
    id: 'id',
    restaurant_id: 'restaurant_id',
    created_vendor_id: 'created_vendor_id',
    name: 'name',
    bank_name: 'bank_name',
    ifsc_code: 'ifsc_code',
    bank_account_number: 'bank_account_number',
    ifsc_verified: 'ifsc_verified',
    acc_verified: 'acc_verified',
    beneficiary_details: 'beneficiary_details',
    is_primary: 'is_primary',
    status: 'status',
    is_deleted: 'is_deleted',
    created_at: 'created_at',
    updated_at: 'updated_at',
  };
}
export default Table;
