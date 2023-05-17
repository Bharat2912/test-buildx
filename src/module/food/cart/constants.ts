class DynamoDBUserTable {
  static readonly TableName = 'user';
  static readonly ColumnNames = {
    Sk: '#CART#FOOD',
    CART_DATA: 'CART_DATA',
  };
  static readonly UserType = 'customer';
}

export default DynamoDBUserTable;
