import { describe, expect, it } from "vitest";

import { getPurchaseRefundStatus } from "@/functions/purchases/get-purchase-refund-status";

describe("getPurchaseRefundStatus", () => {
  it("marks an untouched payment as paid", () => {
    expect(
      getPurchaseRefundStatus({ amountRefunded: 0, refundedAt: null })
    ).toBe("paid");
  });

  it("keeps partial refunds distinct from full refunds", () => {
    expect(
      getPurchaseRefundStatus({ amountRefunded: 1000, refundedAt: null })
    ).toBe("partiallyRefunded");
  });

  it("uses the revocation timestamp as the full refund authority", () => {
    expect(
      getPurchaseRefundStatus({
        amountRefunded: 4999,
        refundedAt: new Date("2026-08-07T09:00:00.000Z"),
      })
    ).toBe("refunded");
  });

  it("surfaces a pending withdrawal before a partial refund", () => {
    expect(
      getPurchaseRefundStatus({
        amountRefunded: 1000,
        refundedAt: null,
        withdrawalRequestedAt: new Date("2026-08-07T09:00:00.000Z"),
      })
    ).toBe("withdrawalRequested");
  });
});
