export enum Service {
  CORE_API = 'core',
  FOOD_API = 'food',
  GROCERY_API = 'grocery',
  PHARMACY_API = 'pharmacy',
  RIDER_API = 'rider',
  PICKUP_DROP_API = 'pnd',
  FOOD_CRON = 'food-cron',
}

export enum ServiceTag {
  CORE_SERVICE_TAG = 'COR',
  FOOD_SERVICE_TAG = 'RES',
  GROCERY_SERVICE_TAG = 'GRO',
  PHARMACY_SERVICE_TAG = 'PHR',
  RIDER_SERVICE_TAG = 'RDR',
  PICKUP_DROP_SERVICE_TAG = 'PND',
}

export enum OrderByColumn {
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
}

export enum SortOrder {
  ASCENDING = 'asc',
  DESCENDING = 'desc',
}

export enum DeliveryService {
  SHADOWFAX = 'shadowfax',
  SPEEDYY_RIDER = 'speedyy-rider',
}
export enum UserType {
  CUSTOMER = 'customer',
  VENDOR = 'vendor',
  ADMIN = 'admin',
  RIDER = 'rider',
}

export enum AdminRole {
  SUPERADMIN = 'superadmin',
  ADMIN = 'admin',
  SERVICEABILITY = 'serviceability',
  CATALOG = 'catalog',
  OPS_MANAGER = 'ops_manager',
  ONEVIEW = 'oneview',
  FLEET_MANAGER = 'fleet_manager',
  ADMIN_VENDOR_VERIFICATION = 'admin_vendor_verification',
}
