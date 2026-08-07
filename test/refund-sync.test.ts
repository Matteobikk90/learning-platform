import type Stripe from "stripe";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  syncRefund,
  syncRefundedCharge,
} from "@/features/courses/refund-sync";

const purchase = vi.hoisted(() => ({
  findFirst: vi.fn(),
  findUnique: vi.fn(),
  updateMany: vi.fn(),
}));

const stripe = vi.hoisted(() => ({
  charges: { retrieve: vi.fn() },
  checkout: { sessions: { list: vi.fn() } },
}));

vi.mock("@/lib/prisma", () => ({ prisma: { purchase } }));
vi.mock("@/lib/stripe", () => ({ getStripe: () => stripe }));

const occurredAt = new Date("2026-08-07T09:00:00.000Z");
const storedPurchase = {
  id: "purchase_1",
  amountTotal: 4999,
  amountRefunded: 0,
  createdAt: new Date("2026-08-07T08:00:00.000Z"),
  currency: "eur",
  refundedAt: null,
  stripeCheckoutSessionId: "cs_test_123",
  stripePaymentIntentId: "pi_123",
};

function makeCharge(overrides: Partial<Stripe.Charge> = {}) {
  return {
    id: "ch_123",
    amount: 4999,
    amount_refunded: 1000,
    currency: "eur",
    payment_intent: "pi_123",
    refunded: false,
    ...overrides,
  } as Stripe.Charge;
}

function makeRefund(overrides: Partial<Stripe.Refund> = {}) {
  return {
    id: "re_123",
    charge: "ch_123",
    payment_intent: "pi_123",
    status: "succeeded",
    ...overrides,
  } as Stripe.Refund;
}

beforeEach(() => {
  vi.clearAllMocks();
  purchase.findFirst.mockResolvedValue(null);
  purchase.findUnique.mockResolvedValue(storedPurchase);
  purchase.updateMany.mockResolvedValue({ count: 1 });
  stripe.checkout.sessions.list.mockResolvedValue({ data: [] });
});

describe("syncRefundedCharge", () => {
  it("records a partial refund without revoking access", async () => {
    await expect(
      syncRefundedCharge(makeCharge(), occurredAt)
    ).resolves.toEqual({
      purchaseId: "purchase_1",
      fullyRefunded: false,
      updated: true,
    });

    expect(purchase.updateMany).toHaveBeenCalledWith({
      where: {
        id: "purchase_1",
        amountRefunded: { lte: 1000 },
        OR: [
          { stripePaymentIntentId: null },
          { stripePaymentIntentId: "pi_123" },
        ],
      },
      data: {
        stripePaymentIntentId: "pi_123",
        amountRefunded: 1000,
      },
    });
  });

  it("revokes access after a full refund", async () => {
    await syncRefundedCharge(
      makeCharge({ amount_refunded: 4999, refunded: true }),
      occurredAt
    );

    expect(purchase.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ refundedAt: occurredAt }),
      })
    );
  });

  it("rejects malformed charge data", async () => {
    await expect(
      syncRefundedCharge(makeCharge({ payment_intent: null }), occurredAt)
    ).rejects.toThrow(/invalid/);
    expect(purchase.updateMany).not.toHaveBeenCalled();
  });

  it("rejects a charge that does not match the stored purchase", async () => {
    await expect(
      syncRefundedCharge(makeCharge({ amount: 5999 }), occurredAt)
    ).rejects.toThrow(/does not match/);
    expect(purchase.updateMany).not.toHaveBeenCalled();
  });

  it("backfills the payment intent for a legacy purchase", async () => {
    purchase.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        ...storedPurchase,
        stripePaymentIntentId: null,
      });
    stripe.checkout.sessions.list.mockResolvedValue({
      data: [{ id: "cs_test_123", metadata: {} }],
    });

    await syncRefundedCharge(makeCharge(), occurredAt);

    expect(purchase.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ stripePaymentIntentId: "pi_123" }),
      })
    );
  });

  it("ignores a delayed refund from an older purchase attempt", async () => {
    purchase.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    purchase.findFirst.mockResolvedValue({
      ...storedPurchase,
      createdAt: new Date("2026-08-07T10:00:00.000Z"),
      stripeCheckoutSessionId: "cs_test_new",
      stripePaymentIntentId: "pi_new",
    });
    stripe.checkout.sessions.list.mockResolvedValue({
      data: [
        {
          created: 1_786_080_000,
          id: "cs_test_old",
          metadata: { userId: "user_1", courseId: "course_1" },
        },
      ],
    });

    await expect(
      syncRefundedCharge(makeCharge({ payment_intent: "pi_old" }), occurredAt)
    ).resolves.toBeNull();
    expect(purchase.updateMany).not.toHaveBeenCalled();
  });

  it("asks Stripe to retry when a newer purchase is not stored yet", async () => {
    purchase.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    purchase.findFirst.mockResolvedValue({
      ...storedPurchase,
      createdAt: new Date("2026-08-07T08:00:00.000Z"),
      stripeCheckoutSessionId: "cs_test_old",
      stripePaymentIntentId: "pi_old",
    });
    stripe.checkout.sessions.list.mockResolvedValue({
      data: [
        {
          created: 1_786_166_400,
          id: "cs_test_new",
          metadata: { userId: "user_1", courseId: "course_1" },
        },
      ],
    });

    await expect(
      syncRefundedCharge(makeCharge({ payment_intent: "pi_new" }), occurredAt)
    ).rejects.toThrow(/not ready/);
    expect(purchase.updateMany).not.toHaveBeenCalled();
  });
});

describe("syncRefund", () => {
  it("retrieves the canonical charge for a successful refund", async () => {
    const charge = makeCharge();
    stripe.charges.retrieve.mockResolvedValue(charge);

    await syncRefund(makeRefund(), occurredAt);

    expect(stripe.charges.retrieve).toHaveBeenCalledWith("ch_123");
    expect(purchase.updateMany).toHaveBeenCalledOnce();
  });

  it("waits for pending refunds to succeed", async () => {
    await expect(
      syncRefund(makeRefund({ status: "pending" }), occurredAt)
    ).resolves.toBeNull();
    expect(stripe.charges.retrieve).not.toHaveBeenCalled();
    expect(purchase.updateMany).not.toHaveBeenCalled();
  });
});
