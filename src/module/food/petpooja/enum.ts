// accepted status 1,2,3 are all same according to petpooja

export enum PosOrderStatus {
  CANCELLED = '-1',
  ACCEPTED_STATUS_1 = '1',
  ACCEPTED_STATUS_2 = '2',
  ACCEPTED_STATUS_3 = '3',
  DISPATCH = '4',
  FOODREADY = '5',
  DELIVERED = '10',
}
export enum PosRiderStatus {
  ASSIGNED = 'rider-assigned',
  ARRIVED = 'rider-arrived',
  DISPATCHED = 'pickedup',
  DELIVERED = 'delivered',
}

export enum PosStatus {
  INIT = 'init',
  READY = 'ready',
  GOT_POS_ID = 'got_pos_id',
  ONBOARDED = 'onboarded',
  DETACHED = 'detached',
}

export enum PetPoojaPackagingApplicableOn {
  NONE = 'NONE',
  ITEM = 'ITEM',
  ORDER = 'ORDER',
}

export enum PetPoojaPackagingChargeType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
  EMPTY_STRING = '',
}
