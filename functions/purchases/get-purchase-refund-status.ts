import type {
  PurchaseRefundStatus,
  PurchaseRefundStatusInput,
} from "@/types/purchase";

export function getPurchaseRefundStatus({
  amountRefunded,
  refundedAt,
  withdrawalRequestedAt,
}: PurchaseRefundStatusInput): PurchaseRefundStatus {
  if (refundedAt) return "refunded";
  if (withdrawalRequestedAt) return "withdrawalRequested";
  if (amountRefunded > 0) return "partiallyRefunded";
  return "paid";
}
