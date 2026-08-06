import { describe, expect, it } from "vitest";

import { formatPurchaseAmount } from "@/functions/admin/format-purchase-amount";

describe("formatPurchaseAmount", () => {
  it("formats cents using the stored currency", () => {
    const result = formatPurchaseAmount({
      amountTotal: 4999,
      currency: "eur",
      locale: "it",
    });

    expect(result).toContain("49,99");
    expect(result).toContain("€");
  });

  it.each([
    { amountTotal: null, currency: "eur" },
    { amountTotal: 4999, currency: null },
    { amountTotal: 49.99, currency: "eur" },
    { amountTotal: 4999, currency: "invalid" },
  ])("uses a placeholder for invalid transaction data", (input) => {
    expect(formatPurchaseAmount({ ...input, locale: "it" })).toBe("—");
  });
});
