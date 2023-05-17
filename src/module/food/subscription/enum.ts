export enum PlanType {
  PERIODIC = 'periodic',
  FREE = 'free',
}

export enum PlanCategory {
  BASIC = 'basic',
  PREMIUM = 'premium',
  ADVANCE = 'advance',
}

export enum PlanIntervalType {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

export enum SubscriptionAuthStatus {
  AUTHORIZED = 'authorized',
  PENDING = 'pending',
  FAILED = 'failed',
}

export enum SubscriptionPartner {
  CASHFREE = 'cashfree',
}

export enum SubscriptionStatus {
  PENDING = 'pending',
  INITIALIZED = 'initialized',
  BANK_APPROVAL_PENDING = 'bank_approval_pending',
  ACTIVE = 'active',
  ON_HOLD = 'on_hold',
  CANCELLED = 'cancelled',
  FAILED_TO_CANCEL = 'failed_to_cancel',
  COMPLETED = 'completed',
}

export enum SubscriptionPaymentStatus {
  SUCCESS = 'success',
  PENDING = 'pending',
  FAILED = 'failed',
}

export enum SubscriptionCancelledBy {
  ADMIN = 'admin',
  VENDOR = 'vendor',
  PARTNER = 'partner',
  SYSTEM = 'system',
}
