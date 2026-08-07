export type PurchaseRefundStatus =
  | "paid"
  | "partiallyRefunded"
  | "withdrawalRequested"
  | "refunded";

export type PurchaseRefundStatusInput = {
  amountRefunded: number;
  refundedAt: Date | null;
  withdrawalRequestedAt?: Date | null;
};

export type WithdrawalStatus =
  | "available"
  | "expired"
  | "requested"
  | "refunded"
  | "waived";

export type WithdrawalStatusInput = {
  createdAt: Date;
  refundedAt: Date | null;
  withdrawalRequestedAt: Date | null;
  withdrawalWaiverAcknowledgedAt: Date | null;
};

export type WithdrawalRequestFormProps = {
  email: string;
  name: string;
  purchaseId: string;
};
