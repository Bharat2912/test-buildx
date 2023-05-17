// ICfCbPo => Interface Cashfree Callback Payout
export interface ICfCbPo_REJECTED {
  event: 'TRANSFER_REJECTED';
  transferId: string;
  referenceId: string;
  reason: string;
  signature: string;
}
export interface ICfCbPo_ACKNOWLEDGED {
  event: 'TRANSFER_ACKNOWLEDGED';
  transferId: string;
  referenceId: string;
  acknowledged: string;
  signature: string;
}
export interface ICfCbPo_REVERSED {
  event: 'TRANSFER_REVERSED';
  transferId: string;
  referenceId: string;
  eventTime: string;
  reason: string;
  signature: string;
}
export interface ICfCbPo_FAILED {
  event: 'TRANSFER_FAILED';
  transferId: string;
  referenceId: string;
  reason: string;
  signature: string;
}
export interface ICfCbPo_SUCCESS {
  event: 'TRANSFER_SUCCESS';
  transferId: string;
  referenceId: string;
  acknowledged: string;
  eventTime: string;
  utr: string;
  signature: string;
}

export interface ICfCbPo_ALERT {
  event: 'LOW_BALANCE_ALERT';
  currentBalance: string;
  alertTime: string;
  signature: string;
}
export interface ICfCbPo_CONFIRMATION {
  event: 'CREDIT_CONFIRMATION';
  ledgerBalance: string;
  amount: string;
  utr: string;
  signature: string;
}
export interface ICfCbPo_INCIDENT {
  event: 'BENEFICIARY_INCIDENT';
  beneEntity: string;
  id: string;
  mode: string;
  startedAt: string;
  status: string;
  isScheduled: string;
  severity: string;
  entityName: string;
  entityCode: string;
  resolvedAt: string;
}
export type ICfCbPo_TRANSFER =
  | ICfCbPo_REJECTED
  | ICfCbPo_ACKNOWLEDGED
  | ICfCbPo_REVERSED
  | ICfCbPo_FAILED
  | ICfCbPo_SUCCESS;
export type ICfCbPo_Request =
  | ICfCbPo_TRANSFER
  | ICfCbPo_ALERT
  | ICfCbPo_INCIDENT
  | ICfCbPo_CONFIRMATION;
