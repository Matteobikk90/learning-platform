import { describe, expect, it } from "vitest";

import { getWithdrawalDeadline } from "@/functions/purchases/get-withdrawal-deadline";
import { getWithdrawalStatus } from "@/functions/purchases/get-withdrawal-status";

const purchasedAt = new Date("2026-08-01T10:00:00.000Z");
const basePurchase = {
  createdAt: purchasedAt,
  refundedAt: null,
  withdrawalRequestedAt: null,
  withdrawalWaiverAcknowledgedAt: null,
};

describe("withdrawal status", () => {
  it("calculates the 14-day deadline", () => {
    expect(getWithdrawalDeadline(purchasedAt)).toEqual(
      new Date("2026-08-15T10:00:00.000Z")
    );
  });

  it("keeps a non-waived purchase available through its deadline", () => {
    expect(
      getWithdrawalStatus(
        basePurchase,
        new Date("2026-08-15T10:00:00.000Z")
      )
    ).toBe("available");
  });

  it("expires a non-waived purchase after the deadline", () => {
    expect(
      getWithdrawalStatus(
        basePurchase,
        new Date("2026-08-15T10:00:00.001Z")
      )
    ).toBe("expired");
  });

  it("prioritizes refund and request states over waiver", () => {
    const waiver = new Date("2026-08-01T09:55:00.000Z");

    expect(
      getWithdrawalStatus({
        ...basePurchase,
        withdrawalWaiverAcknowledgedAt: waiver,
      })
    ).toBe("waived");
    expect(
      getWithdrawalStatus({
        ...basePurchase,
        withdrawalRequestedAt: new Date(),
        withdrawalWaiverAcknowledgedAt: waiver,
      })
    ).toBe("requested");
    expect(
      getWithdrawalStatus({
        ...basePurchase,
        refundedAt: new Date(),
        withdrawalRequestedAt: new Date(),
      })
    ).toBe("refunded");
  });
});
