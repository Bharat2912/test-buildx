export enum RefundStatus {
  APPROVAL_PENDING = 'approval_pending',
  PENDING = 'pending',
  SUCCESS = 'success',
  ONHOLD = 'onhold',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum RefundGateway {
  CASHFREE = 'cashfree',
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUND = 'refund',
  FAILED = 'failed',
}
