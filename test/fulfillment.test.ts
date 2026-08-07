import type Stripe from "stripe";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { fulfillCheckoutSession } from "@/features/courses/fulfillment";

const tx = vi.hoisted(() => ({
  user: { findUnique: vi.fn(), update: vi.fn() },
  course: { findUnique: vi.fn() },
  purchase: { findUnique: vi.fn(), upsert: vi.fn() },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: (callback: (transaction: typeof tx) => Promise<unknown>) =>
      callback(tx),
  },
}));

function makeSession(
  overrides: Partial<Stripe.Checkout.Session> = {}
): Stripe.Checkout.Session {
  return {
    id: "cs_test_123",
    created: 1_800_000_000,
    mode: "payment",
    payment_status: "paid",
    client_reference_id: "user_1",
    currency: "eur",
    amount_total: 4999,
    customer: "cus_123",
    payment_intent: "pi_123",
    metadata: { userId: "user_1", courseId: "course_1", amountTotal: "4999" },
    ...overrides,
  } as Stripe.Checkout.Session;
}

beforeEach(() => {
  vi.clearAllMocks();
  tx.user.findUnique.mockResolvedValue({
    id: "user_1",
    stripeCustomerId: null,
  });
  tx.user.update.mockResolvedValue({});
  tx.course.findUnique.mockResolvedValue({ id: "course_1" });
  tx.purchase.findUnique.mockResolvedValue(null);
  tx.purchase.upsert.mockResolvedValue({
    id: "purchase_1",
    refundedAt: null,
  });
});

describe("fulfillCheckoutSession", () => {
  it("ignores sessions that are not paid yet", async () => {
    const result = await fulfillCheckoutSession(
      makeSession({ payment_status: "unpaid" })
    );

    expect(result).toBeNull();
    expect(tx.purchase.upsert).not.toHaveBeenCalled();
  });

  it("rejects non-payment sessions", async () => {
    await expect(
      fulfillCheckoutSession(makeSession({ mode: "subscription" }))
    ).rejects.toThrow(/not a payment/);
  });

  it.each([
    ["missing userId", { metadata: { courseId: "course_1" } }],
    ["missing courseId", { metadata: { userId: "user_1" } }],
    ["missing payment intent", { payment_intent: null }],
    ["invalid creation time", { created: 0 }],
    ["client_reference_id mismatch", { client_reference_id: "someone-else" }],
    ["wrong currency", { currency: "usd" }],
    ["null amount", { amount_total: null }],
    ["zero amount", { amount_total: 0, metadata: { userId: "user_1", courseId: "course_1", amountTotal: "0" } }],
    ["amount different from checkout metadata", { amount_total: 100 }],
    ["non-integer expected amount", { metadata: { userId: "user_1", courseId: "course_1", amountTotal: "49.99" } }],
  ] as const)("rejects a session with %s", async (_label, overrides) => {
    await expect(
      fulfillCheckoutSession(
        makeSession(overrides as Partial<Stripe.Checkout.Session>)
      )
    ).rejects.toThrow(/invalid metadata/);
    expect(tx.purchase.upsert).not.toHaveBeenCalled();
  });

  it("rejects sessions referencing a deleted user or course", async () => {
    tx.user.findUnique.mockResolvedValue(null);

    await expect(fulfillCheckoutSession(makeSession())).rejects.toThrow(
      /missing data/
    );
    expect(tx.purchase.upsert).not.toHaveBeenCalled();
  });

  it("records the purchase idempotently for a valid session", async () => {
    const result = await fulfillCheckoutSession(makeSession());

    expect(result).toEqual({
      purchaseId: "purchase_1",
      userId: "user_1",
      courseId: "course_1",
      isActive: true,
    });
    expect(tx.purchase.upsert).toHaveBeenCalledWith({
      where: {
        stripeCheckoutSessionId: "cs_test_123",
      },
      update: {
        stripePaymentIntentId: "pi_123",
        amountTotal: 4999,
        currency: "eur",
      },
      create: {
        createdAt: new Date(1_800_000_000 * 1000),
        userId: "user_1",
        courseId: "course_1",
        stripeCheckoutSessionId: "cs_test_123",
        stripePaymentIntentId: "pi_123",
        amountTotal: 4999,
        currency: "eur",
      },
      select: { id: true, refundedAt: true },
    });
    expect(tx.purchase.findUnique).toHaveBeenCalledWith({
      where: { stripeCheckoutSessionId: "cs_test_123" },
      select: { userId: true, courseId: true },
    });
    expect(tx.user.update).toHaveBeenCalledWith({
      where: { id: "user_1" },
      data: { stripeCustomerId: "cus_123" },
    });
  });

  it("keeps the existing matching Stripe customer", async () => {
    tx.user.findUnique.mockResolvedValue({
      id: "user_1",
      stripeCustomerId: "cus_123",
    });

    await fulfillCheckoutSession(makeSession());

    expect(tx.user.update).not.toHaveBeenCalled();
    expect(tx.purchase.upsert).toHaveBeenCalledOnce();
  });

  it("rejects a Stripe customer belonging to a different account", async () => {
    tx.user.findUnique.mockResolvedValue({
      id: "user_1",
      stripeCustomerId: "cus_other",
    });

    await expect(fulfillCheckoutSession(makeSession())).rejects.toThrow(
      /customer mismatch/
    );
    expect(tx.purchase.upsert).not.toHaveBeenCalled();
  });

  it("rejects a checkout session already assigned to another purchase", async () => {
    tx.purchase.findUnique.mockResolvedValue({
      userId: "user_other",
      courseId: "course_1",
    });

    await expect(fulfillCheckoutSession(makeSession())).rejects.toThrow(
      /purchase mismatch/
    );
    expect(tx.purchase.upsert).not.toHaveBeenCalled();
  });

  it("continues to accept legacy sessions without a Stripe customer", async () => {
    await fulfillCheckoutSession(makeSession({ customer: null }));

    expect(tx.user.update).not.toHaveBeenCalled();
    expect(tx.purchase.upsert).toHaveBeenCalledOnce();
  });

  it("accepts sessions created before amountTotal was added to metadata", async () => {
    const result = await fulfillCheckoutSession(
      makeSession({ metadata: { userId: "user_1", courseId: "course_1" } })
    );

    expect(result).toEqual({
      purchaseId: "purchase_1",
      userId: "user_1",
      courseId: "course_1",
      isActive: true,
    });
  });

  it("stores the versioned legal consent carried by Stripe", async () => {
    const consentedAt = "2026-08-07T10:15:30.000Z";

    await fulfillCheckoutSession(
      makeSession({
        metadata: {
          userId: "user_1",
          courseId: "course_1",
          amountTotal: "4999",
          legalTermsVersion: "2026-08-07-draft.1",
          checkoutLocale: "it",
          legalConsentAt: consentedAt,
          termsAccepted: "true",
          immediateAccessConsent: "true",
          withdrawalWaiverAcknowledged: "true",
        },
      })
    );

    const legalData = {
      legalTermsVersion: "2026-08-07-draft.1",
      checkoutLocale: "it",
      termsAcceptedAt: new Date(consentedAt),
      immediateAccessConsentAt: new Date(consentedAt),
      withdrawalWaiverAcknowledgedAt: new Date(consentedAt),
    };
    expect(tx.purchase.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining(legalData),
        create: expect.objectContaining(legalData),
      })
    );
  });

  it("never resets refund state when Stripe replays checkout completion", async () => {
    await fulfillCheckoutSession(makeSession());

    const update = tx.purchase.upsert.mock.calls[0]?.[0]?.update;

    expect(update).not.toHaveProperty("amountRefunded");
    expect(update).not.toHaveProperty("createdAt");
    expect(update).not.toHaveProperty("refundedAt");
  });

  it("reports a replayed refunded purchase as inactive", async () => {
    tx.purchase.upsert.mockResolvedValue({
      id: "purchase_1",
      refundedAt: new Date("2026-08-08T10:00:00.000Z"),
    });

    await expect(fulfillCheckoutSession(makeSession())).resolves.toEqual({
      purchaseId: "purchase_1",
      userId: "user_1",
      courseId: "course_1",
      isActive: false,
    });
  });

  it("rejects incomplete legal metadata instead of recording weak evidence", async () => {
    await expect(
      fulfillCheckoutSession(
        makeSession({
          metadata: {
            userId: "user_1",
            courseId: "course_1",
            legalTermsVersion: "2026-08-07-draft.1",
          },
        })
      )
    ).rejects.toThrow(/invalid legal consent metadata/);
    expect(tx.purchase.upsert).not.toHaveBeenCalled();
  });
});
