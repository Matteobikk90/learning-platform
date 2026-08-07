import { WITHDRAWAL_PERIOD_DAYS } from "@/constants/legal";

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

export function getWithdrawalDeadline(purchasedAt: Date) {
  return new Date(
    purchasedAt.getTime() + WITHDRAWAL_PERIOD_DAYS * DAY_IN_MILLISECONDS
  );
}
