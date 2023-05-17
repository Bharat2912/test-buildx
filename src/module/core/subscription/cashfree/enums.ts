// CashFreePlanIntervalType  === PlanIntervalType
// export enum CashFreePlanIntervalType {
//   DAY = 'day',
//   WEEK = 'week',
//   MONTH = 'month',
//   YEAR = 'year',
// }

export enum CashFreePlanType {
  PERIODIC = 'PERIODIC',
  ON_DEMAND = 'ON_DEMAND',
}

export enum CashFreeSubscriptionStatus {
  INITIALIZED = 'INITIALIZED',
  BANK_APPROVAL_PENDING = 'BANK_APPROVAL_PENDING',
  ACTIVE = 'ACTIVE',
  ON_HOLD = 'ON_HOLD',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export enum CashFreeSubscriptionAuthStatus {
  FAILED = 'FAILED',
}

export enum CashFreeSubscriptionPaymentStatus {
  SUCCESS = 'SUCCESS',
  PENDING = 'PENDING',
  FAILED = 'FAILED',
  INITIALIZED = 'INITIALIZED',
}

export enum CashFreeNotificationChannels {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
}

export enum CashFreeSubscriptionEvents {
  SUBSCRIPTION_STATUS_CHANGE = 'SUBSCRIPTION_STATUS_CHANGE',
  SUBSCRIPTION_PAYMENT_DECLINED = 'SUBSCRIPTION_PAYMENT_DECLINED',
  SUBSCRIPTION_NEW_PAYMENT = 'SUBSCRIPTION_NEW_PAYMENT',
  SUBSCRIPTION_AUTH_STATUS = 'SUBSCRIPTION_AUTH_STATUS',
}
