import type Stripe from "stripe";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { initiateWithdrawalRefund } from "@/features/purchases/initiate-withdrawal-refund";

const purchase = vi.hoisted(() => ({
  findUnique: vi.fn(),
  updateMany: vi.fn(),
}));
const stripe = vi.hoisted(() => ({
  checkout: { sessions: { retrieve: vi.fn() } },
  refunds: { create: vi.fn() },
}));
const syncRefund = vi.hoisted(() => vi.fn());

vi.mock("@/lib/prisma", () => ({ prisma: { purchase } }));
vi.mock("@/lib/stripe", () => ({ getStripe: () => stripe }));
vi.mock("@/features/courses/refund-sync", () => ({ syncRefund }));

const storedPurchase = {
  id: "purchase_1",
  userId: "user_1",
  courseId: "course_1",
  refundedAt: null,
  withdrawalRequestedAt: new Date("2026-08-07T10:00:00.000Z"),
  stripeCheckoutSessionId: "cs_test_123",
  stripePaymentIntentId: "pi_123",
};
const refund = {
  id: "re_123",
  status: "succeeded",
} as Stripe.Refund;

beforeEach(() => {
  vi.clearAllMocks();
  purchase.findUnique.mockResolvedValue(storedPurchase);
  purchase.updateMany.mockResolvedValue({ count: 1 });
  stripe.refunds.create.mockResolvedValue(refund);
  syncRefund.mockResolvedValue({});
});

describe("initiateWithdrawalRefund", () => {
  it("creates one idempotent refund and synchronizes successful access revocation", async () => {
    await expect(initiateWithdrawalRefund("purchase_1")).resolves.toBe(refund);

    expect(stripe.refunds.create).toHaveBeenCalledWith(
      {
        payment_intent: "pi_123",
        reason: "requested_by_customer",
        metadata: {
          purchaseId: "purchase_1",
          source: "online_withdrawal",
        },
      },
      { idempotencyKey: "online-withdrawal-purchase_1" }
    );
    expect(syncRefund).toHaveBeenCalledWith(refund, expect.any(Date));
  });

  it("retrieves and backfills the payment intent for legacy purchases", async () => {
    purchase.findUnique.mockResolvedValue({
      ...storedPurchase,
      stripePaymentIntentId: null,
    });
    stripe.checkout.sessions.retrieve.mockResolvedValue({
      metadata: { userId: "user_1", courseId: "course_1" },
      payment_intent: "pi_legacy",
    });

    await initiateWithdrawalRefund("purchase_1");

    expect(purchase.updateMany).toHaveBeenCalledWith({
      where: { id: "purchase_1", stripePaymentIntentId: null },
      data: { stripePaymentIntentId: "pi_legacy" },
    });
    expect(stripe.refunds.create).toHaveBeenCalledWith(
      expect.objectContaining({ payment_intent: "pi_legacy" }),
      expect.any(Object)
    );
  });

  it("rejects a Stripe session that points to another contract", async () => {
    purchase.findUnique.mockResolvedValue({
      ...storedPurchase,
      stripePaymentIntentId: null,
    });
    stripe.checkout.sessions.retrieve.mockResolvedValue({
      metadata: { userId: "user_other", courseId: "course_1" },
      payment_intent: "pi_other",
    });

    await expect(initiateWithdrawalRefund("purchase_1")).rejects.toThrow(
      /inconsistent Stripe metadata/
    );
    expect(stripe.refunds.create).not.toHaveBeenCalled();
  });

  it("does nothing after a completed refund", async () => {
    purchase.findUnique.mockResolvedValue({
      ...storedPurchase,
      refundedAt: new Date(),
    });

    await expect(initiateWithdrawalRefund("purchase_1")).resolves.toBeNull();
    expect(stripe.refunds.create).not.toHaveBeenCalled();
  });
});
