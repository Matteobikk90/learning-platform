import { getWithdrawalDeadline } from "@/functions/purchases/get-withdrawal-deadline";
import type {
  WithdrawalStatus,
  WithdrawalStatusInput,
} from "@/types/purchase";

export function getWithdrawalStatus(
  purchase: WithdrawalStatusInput,
  now = new Date()
): WithdrawalStatus {
  if (purchase.refundedAt) return "refunded";
  if (purchase.withdrawalRequestedAt) return "requested";
  if (purchase.withdrawalWaiverAcknowledgedAt) return "waived";

  return now <= getWithdrawalDeadline(purchase.createdAt)
    ? "available"
    : "expired";
}
