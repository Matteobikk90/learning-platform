import type { PurchaseAmountInput } from "@/types/admin";

export function formatPurchaseAmount({
  amountTotal,
  currency,
  locale,
}: PurchaseAmountInput) {
  if (amountTotal === null || !currency || !Number.isSafeInteger(amountTotal)) {
    return "—";
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amountTotal / 100);
  } catch {
    return "—";
  }
}
