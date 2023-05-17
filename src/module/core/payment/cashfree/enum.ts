export enum CashFreeRefundEvents {
  REFUND_STATUS_WEBHOOK = 'REFUND_STATUS_WEBHOOK',
}

export enum CashfreeRefundStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  ONHOLD = 'ONHOLD',
  CANCELLED = 'CANCELLED',
}

export enum CashFreeOrderStatus {
  PAID = 'PAID',
  EXPIRED = 'EXPIRED',
  ACTIVE = 'ACTIVE',
}

export enum CashfreePaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  USER_DROPPED = 'USER_DROPPED',
}

export enum CashFreePaymentEvent {
  PAYMENT_SUCCESS_WEBHOOK = 'PAYMENT_SUCCESS_WEBHOOK',
  PAYMENT_USER_DROPPED_WEBHOOK = 'PAYMENT_USER_DROPPED_WEBHOOK',
  PAYMENT_FAILED_WEBHOOK = 'PAYMENT_FAILED_WEBHOOK',
}

export enum CashFreePaymentGroup {
  CREDIT_CARD = 'credit_card',
  NET_BANKING = 'net_banking',
  UPI = 'upi',
  WALLET = 'wallet',
}
