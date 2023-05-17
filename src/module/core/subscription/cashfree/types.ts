import {PlanIntervalType} from '../enums';
import {
  CashFreeNotificationChannels,
  CashFreePlanType,
  CashFreeSubscriptionPaymentStatus,
  CashFreeSubscriptionStatus,
} from './enums';

export interface ICreateCashFreePlan {
  planId: string;
  planName: string;
  type: CashFreePlanType;
  maxCycles?: number;
  amount: number;
  maxAmount?: number;
  intervalType?: PlanIntervalType;
  intervals?: number;
  description?: string;
}

export interface ICreateCashFreePlanResponse {
  status: string;
  message: string;
}

export interface ICancelCashFreeSubscriptionResponse {
  status: string;
  message: string;
}

export interface ICreateCashFreeSubscription {
  subscriptionId: string;
  planId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  firstChargeDate: string;
  authAmount: number;
  expiresOn: string;
  returnUrl?: string;
  subscriptionNote?: string;
  notificationChannels?: CashFreeNotificationChannels[];
}

export interface ICreateCashFreeSubscriptionResponse {
  status: string;
  message: string;
  subReferenceId: number;
  authLink: string;
  subStatus: CashFreeSubscriptionStatus;
}

export interface ICashFreeSubscription {
  status: string;
  message: string;
  subscription: {
    subscriptionId: string;
    subReferenceId: number;
    planId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    mode: string;
    status: CashFreeSubscriptionStatus;
    firstChargeDate: string;
    addedOn: string;
    scheduledOn: string;
    currentCycle: number;
    authLink: string;
    bankAccountNumber: string;
    bankAccountHolder: string;
    umrn: string;
  };
}

export interface ICashFreeSubscriptionPayment {
  paymentId: number;
  referenceId?: number;
  cfOrderId?: number;
  orderId?: string;
  subReferenceId: number;
  currency: string;
  amount: number;
  cycle: number;
  status: CashFreeSubscriptionPaymentStatus;
  remarks: string;
  scheduledOn?: string;
  addedOn?: string;
  retryAttempts: number;
  failureReason: string;
}
export interface ICashFreeGetSubscriptionPaymentResponse {
  status: string;
  message: string;
  payment: ICashFreeSubscriptionPayment;
}

export interface ICashFreeGetSubscriptionPaymentsResponse {
  status: string;
  message: string;
  payments: ICashFreeSubscriptionPayment[];
}

export interface IActivateCashFreeSubscription {
  nextScheduledOn?: string; //"2021-12-17"
}

export interface IRetryPaymentCashFreeSubscription {
  nextScheduledOn?: string; //"2021-12-17"
}

export interface IRetryPaymentCashFreeSubscriptionResponse {
  status: string; //'OK'
  subStatus: CashFreeSubscriptionStatus.ON_HOLD;
  payment: {
    paymentId: number;
    amount: number;
    status: CashFreeSubscriptionPaymentStatus;
    addedOn: Date; //'2021-12-17 08:41:30'
    retryAttempts: number;
  };
}

export interface IActivateCashFreeSubscriptionResponse {
  status: string;
  subStatus: CashFreeSubscriptionStatus;
  subscriptionResponse: {
    subReferenceId: number;
    subscriptionId: string;
    planId: string;
    customerPhone: string;
    customerName: string;
    customerEmail: string;
    addedOn: string;
  };
}
