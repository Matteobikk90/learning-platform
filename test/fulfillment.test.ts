import type Stripe from "stripe";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { fulfillCheckoutSession } from "@/features/courses/fulfillment";

const tx = vi.hoisted(() => ({
  user: { findUnique: vi.fn() },
  course: { findUnique: vi.fn() },
  purchase: { upsert: vi.fn() },
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
    mode: "payment",
    payment_status: "paid",
    client_reference_id: "user_1",
    currency: "eur",
    amount_total: 4999,
    metadata: { userId: "user_1", courseId: "course_1", amountTotal: "4999" },
    ...overrides,
  } as Stripe.Checkout.Session;
}

beforeEach(() => {
  vi.clearAllMocks();
  tx.user.findUnique.mockResolvedValue({ id: "user_1" });
  tx.course.findUnique.mockResolvedValue({ id: "course_1" });
  tx.purchase.upsert.mockResolvedValue({});
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

    expect(result).toEqual({ userId: "user_1", courseId: "course_1" });
    expect(tx.purchase.upsert).toHaveBeenCalledWith({
      where: {
        userId_courseId: { userId: "user_1", courseId: "course_1" },
      },
      update: {
        stripeCheckoutSessionId: "cs_test_123",
        amountTotal: 4999,
        currency: "eur",
      },
      create: {
        userId: "user_1",
        courseId: "course_1",
        stripeCheckoutSessionId: "cs_test_123",
        amountTotal: 4999,
        currency: "eur",
      },
    });
  });

  it("accepts sessions created before amountTotal was added to metadata", async () => {
    const result = await fulfillCheckoutSession(
      makeSession({ metadata: { userId: "user_1", courseId: "course_1" } })
    );

    expect(result).toEqual({ userId: "user_1", courseId: "course_1" });
  });
});
