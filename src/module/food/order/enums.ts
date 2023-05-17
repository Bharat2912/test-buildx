export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum OrderAcceptanceStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  // READY = 'ready',
  // IGNORED = 'ignored',
}

export enum DeliveryStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  ALLOCATED = 'allocated',
  ARRIVED = 'arrived',
  DISPATCHED = 'dispatched',
  ARRIVED_CUSTOMER_DOORSTEP = 'arrived_customer_doorstep',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  FAILED_TO_CANCEL = 'failed_to_cancel',
  CANCELLED_BY_CUSTOMER = 'cancelled_by_customer',
  RETURNED_TO_SELLER = 'returned_to_seller',
}

export enum OrderStatus {
  PLACED = 'placed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  PENDING = 'pending',
}

export enum OrderByColumn {
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
  VENDOR_ACCEPTED_TIME = 'vendor_accepted_time',
}

export enum SortOrder {
  ASCENDING = 'asc',
  DESCENDING = 'desc',
}

export enum OrderCancelledBy {
  DELIVERY = 'delivery_service',
  ADMIN = 'admin',
  CUSTOMER = 'customer',
  VENDOR = 'vendor',
}

export enum OrderRefundStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  ONHOLD = 'onhold',
  CANCELLED = 'cancelled',
}

export enum ExternalPaymentStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  USER_DROPPED = 'USER_DROPPED',
}

export enum ExternalPaymentEvent {
  PAYMENT_SUCCESS_WEBHOOK = 'PAYMENT_SUCCESS_WEBHOOK',
  PAYMENT_USER_DROPPED_WEBHOOK = 'PAYMENT_USER_DROPPED_WEBHOOK',
  PAYMENT_FAILED_WEBHOOK = 'PAYMENT_FAILED_WEBHOOK',
}
