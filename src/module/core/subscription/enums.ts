export enum PlanIntervalType {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

export enum SubscriptionStatus {
  INITIALIZED = 'initialized',
  BANK_APPROVAL_PENDING = 'bank_approval_pending',
  ACTIVE = 'active',
  ON_HOLD = 'on_hold',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export enum SubscriptionPaymentStatus {
  SUCCESS = 'success',
  PENDING = 'pending',
  FAILED = 'failed',
}

export enum SubscriptionAuthStatus {
  COMPLETED = 'completed',
  PENDING = 'pending',
  FAILED = 'failed',
}
