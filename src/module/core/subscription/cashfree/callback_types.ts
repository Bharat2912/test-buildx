import {
  CashFreeSubscriptionAuthStatus,
  CashFreeSubscriptionStatus,
} from './enums';

export interface ICashFreeSubscriptionStatusChangeDetails {
  cf_event: string;
  cf_subReferenceId: number;
  cf_status: CashFreeSubscriptionStatus;
  cf_lastStatus: CashFreeSubscriptionStatus;
  cf_eventTime: string; //[format - yyyy-MM-dd HH:mm:ss]
  signature: string;
}

export interface ICashFreeSubscriptionNewPaymentDetails {
  cf_event: string;
  cf_subReferenceId: number;
  cf_eventTime: string; //[format - yyyy-MM-dd HH:mm:ss]
  cf_orderId: string;
  cf_paymentId: number;
  cf_amount: number;
  cf_referenceId: number;
  cf_retryAttempts: number;
  signature: string;
}

export interface ICashFreeSubscriptionPaymentDeclinedDetails {
  cf_event: string;
  cf_subReferenceId: number;
  cf_eventTime: string; //[format - yyyy-MM-dd HH:mm:ss]
  cf_paymentId: number;
  cf_amount: number;
  cf_retryAttempts: number;
  cf_reasons: string;
  signature: string;
}

export interface ICashFreeSubscriptionAuthStatusDetails {
  cf_event: string;
  cf_subReferenceId: number;
  cf_eventTime: string; // [format - yyyy-MM-dd HH:mm:ss]
  cf_subscriptionStatus: CashFreeSubscriptionStatus;
  cf_authStatus: CashFreeSubscriptionAuthStatus;
  cf_authTimestamp: string; // [format - yyyy-MM-dd HH:mm:ss]
  cf_authFailureReason: string;
  signature: string;
}
