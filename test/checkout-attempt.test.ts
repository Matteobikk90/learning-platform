import { Prisma, type CheckoutAttempt } from "@prisma/client";
import Stripe from "stripe";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  closeCheckoutAttempt,
  markCheckoutAttemptProcessing,
} from "@/features/courses/checkout-attempt-events";
import { openCheckoutAttempt } from "@/features/courses/open-checkout-attempt";
import { claimCheckoutAttempt } from "@/functions/checkout/claim-checkout-attempt";
import type { CheckoutAttemptInput } from "@/types/checkout";

const checkoutAttempt = vi.hoisted(() => ({
  create: vi.fn(),
  findUnique: vi.fn(),
  updateMany: vi.fn(),
}));
const purchase = vi.hoisted(() => ({ findFirst: vi.fn() }));
const user = vi.hoisted(() => ({ updateMany: vi.fn() }));
const stripeCreate = vi.hoisted(() => vi.fn());
const stripeRetrieve = vi.hoisted(() => vi.fn());

vi.mock("@/lib/prisma", () => ({
  prisma: { checkoutAttempt, purchase, user },
}));
vi.mock("@/lib/stripe", () => ({
  getStripe: () => ({
    checkout: {
      sessions: { create: stripeCreate, retrieve: stripeRetrieve },
    },
  }),
}));

const now = new Date("2026-08-26T09:00:00.000Z");
const expiresAt = new Date("2026-08-26T10:00:00.000Z");
const input: CheckoutAttemptInput = {
  amountTotal: 4999,
  cancelUrl: "https://courses.example.it/it/checkout/cancel",
  checkoutLocale: "it",
  consentedAt: now,
  courseDescription: "Descrizione",
  courseId: "course_1",
  courseTitle: "Corso 1",
  customerEmail: "student@example.it",
  legalTermsVersion: "2026-08-07-draft.1",
  stripeCustomerId: null,
  successUrl:
    "https://courses.example.it/it/checkout/success?session_id={CHECKOUT_SESSION_ID}",
  userId: "user_1",
};

function makeAttempt(
  overrides: Partial<CheckoutAttempt> = {}
): CheckoutAttempt {
  return {
    id: "attempt_1",
    activeKey: "checkout:user_1:course_1",
    status: "CREATING",
    userId: "user_1",
    courseId: "course_1",
    amountTotal: 4999,
    currency: "eur",
    checkoutLocale: "it",
    legalTermsVersion: "2026-08-07-draft.1",
    consentedAt: now,
    courseTitle: "Corso 1",
    courseDescription: "Descrizione",
    successUrl: input.successUrl,
    cancelUrl: input.cancelUrl,
    customerEmail: "student@example.it",
    stripeCustomerId: null,
    stripeCheckoutSessionId: null,
    stripeCheckoutUrl: null,
    stripeExpiresAt: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function makeSession(
  overrides: Partial<Stripe.Checkout.Session> = {}
) {
  return {
    id: "cs_test_attempt_1",
    url: "https://checkout.stripe.com/session_1",
    mode: "payment",
    status: "open",
    payment_status: "unpaid",
    expires_at: Math.floor(expiresAt.getTime() / 1000),
    metadata: {
      checkoutAttemptId: "attempt_1",
      courseId: "course_1",
      userId: "user_1",
    },
    ...overrides,
  } as unknown as Stripe.Checkout.Session;
}

beforeEach(() => {
  vi.clearAllMocks();
  checkoutAttempt.create.mockResolvedValue(makeAttempt());
  checkoutAttempt.findUnique.mockResolvedValue(null);
  checkoutAttempt.updateMany.mockResolvedValue({ count: 1 });
  purchase.findFirst.mockResolvedValue(null);
  user.updateMany.mockResolvedValue({ count: 1 });
  stripeCreate.mockResolvedValue(makeSession());
  stripeRetrieve.mockResolvedValue(makeSession());
});

describe("claimCheckoutAttempt", () => {
  it("creates the active attempt before contacting Stripe", async () => {
    await expect(claimCheckoutAttempt(input)).resolves.toEqual({
      attempt: makeAttempt(),
      kind: "attempt",
    });

    expect(checkoutAttempt.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        activeKey: "checkout:user_1:course_1",
        amountTotal: 4999,
      }),
    });
  });

  it("reuses the winning attempt after a concurrent unique conflict", async () => {
    const uniqueError = new Prisma.PrismaClientKnownRequestError("unique", {
      code: "P2002",
      clientVersion: "7.8.0",
    });
    checkoutAttempt.create.mockRejectedValue(uniqueError);
    checkoutAttempt.findUnique.mockResolvedValue(makeAttempt());

    await expect(claimCheckoutAttempt(input)).resolves.toEqual({
      attempt: makeAttempt(),
      kind: "attempt",
    });
    expect(checkoutAttempt.findUnique).toHaveBeenCalledWith({
      where: { activeKey: "checkout:user_1:course_1" },
    });
  });

  it("cancels the claim if fulfillment recorded an active purchase", async () => {
    purchase.findFirst.mockResolvedValue({ id: "purchase_1" });

    await expect(claimCheckoutAttempt(input)).resolves.toEqual({
      kind: "owned",
    });
    expect(checkoutAttempt.updateMany).toHaveBeenCalledWith({
      where: {
        activeKey: "checkout:user_1:course_1",
        id: "attempt_1",
      },
      data: { activeKey: null, status: "CANCELLED" },
    });
  });

  it("keeps the claim until Stripe confirms that the session closed", async () => {
    const uniqueError = new Prisma.PrismaClientKnownRequestError("unique", {
      code: "P2002",
      clientVersion: "7.8.0",
    });
    const expiredAttempt = makeAttempt({
      id: "attempt_old",
      status: "OPEN",
      stripeExpiresAt: new Date("2026-08-26T08:59:59.000Z"),
    });
    checkoutAttempt.create.mockRejectedValue(uniqueError);
    checkoutAttempt.findUnique.mockResolvedValue(expiredAttempt);

    await expect(claimCheckoutAttempt(input)).resolves.toEqual({
      attempt: expiredAttempt,
      kind: "attempt",
    });
    expect(checkoutAttempt.updateMany).not.toHaveBeenCalled();
  });
});

describe("openCheckoutAttempt", () => {
  it("uses the same Stripe operation for concurrent retries", async () => {
    const attempt = makeAttempt();

    const [firstUrl, secondUrl] = await Promise.all([
      openCheckoutAttempt(attempt, now),
      openCheckoutAttempt(attempt, now),
    ]);

    expect(firstUrl).toBe("https://checkout.stripe.com/session_1");
    expect(secondUrl).toBe(firstUrl);
    expect(stripeCreate).toHaveBeenCalledTimes(2);
    expect(stripeCreate.mock.calls[0]).toEqual(stripeCreate.mock.calls[1]);
    expect(stripeCreate.mock.calls[0]?.[1]).toEqual({
      idempotencyKey: "checkout-attempt:attempt_1",
    });
    expect(stripeCreate.mock.calls[0]?.[0]).not.toHaveProperty("expires_at");
  });

  it("reuses an open Stripe URL without another API call", async () => {
    const attempt = makeAttempt({
      status: "OPEN",
      stripeCheckoutSessionId: "cs_test_attempt_1",
      stripeCheckoutUrl: "https://checkout.stripe.com/existing",
      stripeExpiresAt: expiresAt,
    });

    await expect(openCheckoutAttempt(attempt, now)).resolves.toBe(
      "https://checkout.stripe.com/existing"
    );
    expect(stripeCreate).not.toHaveBeenCalled();
  });

  it("does not expose a session after losing the database transition", async () => {
    checkoutAttempt.updateMany.mockResolvedValue({ count: 0 });

    await expect(openCheckoutAttempt(makeAttempt(), now)).rejects.toThrow(
      /changed while opening/
    );
  });

  it("closes a stale creating attempt before the idempotency window ends", async () => {
    const staleAttempt = makeAttempt({
      createdAt: new Date("2026-08-25T09:59:59.000Z"),
    });

    await expect(openCheckoutAttempt(staleAttempt, now)).rejects.toThrow(
      /can no longer be retried/
    );
    expect(stripeCreate).not.toHaveBeenCalled();
    expect(checkoutAttempt.updateMany).toHaveBeenCalledWith({
      where: {
        activeKey: "checkout:user_1:course_1",
        id: "attempt_1",
        status: "CREATING",
        stripeCheckoutSessionId: null,
      },
      data: { activeKey: null, status: "FAILED" },
    });
  });

  it("releases an attempt after Stripe rejects it definitively", async () => {
    stripeCreate.mockRejectedValue(
      new Stripe.errors.StripeInvalidRequestError({
        code: "resource_missing",
        message: "No such customer",
        param: "customer",
        type: "invalid_request_error",
      })
    );

    await expect(
      openCheckoutAttempt(
        makeAttempt({ stripeCustomerId: "cus_deleted" }),
        now
      )
    ).rejects.toThrow(/No such customer/);
    expect(checkoutAttempt.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { activeKey: null, status: "FAILED" },
      })
    );
    expect(user.updateMany).toHaveBeenCalledWith({
      where: {
        id: "user_1",
        stripeCustomerId: "cus_deleted",
      },
      data: { stripeCustomerId: null },
    });
  });

  it("reconciles an expired open session before releasing its claim", async () => {
    stripeRetrieve.mockResolvedValue(makeSession({ status: "expired" }));
    const attempt = makeAttempt({
      status: "OPEN",
      stripeCheckoutSessionId: "cs_test_attempt_1",
      stripeCheckoutUrl: "https://checkout.stripe.com/expired",
      stripeExpiresAt: new Date("2026-08-26T08:59:59.000Z"),
    });

    await expect(openCheckoutAttempt(attempt, now)).rejects.toThrow(/expired/);
    expect(stripeRetrieve).toHaveBeenCalledWith("cs_test_attempt_1");
    expect(checkoutAttempt.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          activeKey: null,
          status: "EXPIRED",
        }),
      })
    );
  });

  it("routes a completed reconciled session to local fulfillment", async () => {
    stripeRetrieve.mockResolvedValue(makeSession({ status: "complete" }));
    const attempt = makeAttempt({
      status: "OPEN",
      stripeCheckoutSessionId: "cs_test_attempt_1",
      stripeCheckoutUrl: "https://checkout.stripe.com/complete",
      stripeExpiresAt: new Date("2026-08-26T08:59:59.000Z"),
    });

    await expect(openCheckoutAttempt(attempt, now)).resolves.toBe(
      "https://courses.example.it/it/checkout/success?session_id=cs_test_attempt_1"
    );
  });

  it("sends a processing payment back to the local success page", async () => {
    const attempt = makeAttempt({
      status: "PROCESSING",
      stripeCheckoutSessionId: "cs_test_attempt_1",
    });

    await expect(openCheckoutAttempt(attempt, now)).resolves.toBe(
      "https://courses.example.it/it/checkout/success?session_id=cs_test_attempt_1"
    );
    expect(stripeCreate).not.toHaveBeenCalled();
  });
});

describe("checkout attempt events", () => {
  it("keeps delayed payments active while Stripe processes them", async () => {
    await expect(markCheckoutAttemptProcessing(makeSession())).resolves.toBe(
      true
    );

    expect(checkoutAttempt.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "PROCESSING" }),
      })
    );
  });

  it.each(["EXPIRED", "FAILED"] as const)(
    "releases a %s attempt",
    async (status) => {
      await expect(closeCheckoutAttempt(makeSession(), status)).resolves.toBe(
        true
      );
      expect(checkoutAttempt.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ activeKey: null, status }),
        })
      );
    }
  );

  it("accepts a matching terminal replay without rewriting it", async () => {
    checkoutAttempt.updateMany.mockResolvedValue({ count: 0 });
    checkoutAttempt.findUnique.mockResolvedValue({
      courseId: "course_1",
      status: "COMPLETED",
      stripeCheckoutSessionId: "cs_test_attempt_1",
      userId: "user_1",
    });

    await expect(
      closeCheckoutAttempt(makeSession(), "EXPIRED")
    ).resolves.toBe(true);
  });

  it("rejects an unmatched transition so Stripe can retry it", async () => {
    checkoutAttempt.updateMany.mockResolvedValue({ count: 0 });
    checkoutAttempt.findUnique.mockResolvedValue(null);

    await expect(markCheckoutAttemptProcessing(makeSession())).rejects.toThrow(
      /invalid attempt transition/
    );
  });
});
