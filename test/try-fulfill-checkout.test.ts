import type Stripe from "stripe";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { tryFulfillCheckoutSession } from "@/features/courses/try-fulfill-checkout";

const fulfillCheckoutSession = vi.hoisted(() => vi.fn());
const markCheckoutAttemptProcessing = vi.hoisted(() => vi.fn());
const sendPurchaseConfirmation = vi.hoisted(() => vi.fn());

vi.mock("@/features/courses/checkout-attempt-events", () => ({
  markCheckoutAttemptProcessing,
}));
vi.mock("@/features/courses/fulfillment", () => ({
  fulfillCheckoutSession,
}));
vi.mock("@/features/purchases/send-purchase-confirmation", () => ({
  sendPurchaseConfirmation,
}));

function makeSession() {
  return { id: "cs_test_123" } as Stripe.Checkout.Session;
}

beforeEach(() => {
  vi.clearAllMocks();
  markCheckoutAttemptProcessing.mockResolvedValue(true);
  sendPurchaseConfirmation.mockResolvedValue(true);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("tryFulfillCheckoutSession", () => {
  it("returns the completed fulfillment", async () => {
    const fulfillment = {
      purchaseId: "purchase_1",
      userId: "user_1",
      courseId: "course_1",
      isActive: true,
    };
    fulfillCheckoutSession.mockResolvedValue(fulfillment);

    await expect(tryFulfillCheckoutSession(makeSession())).resolves.toEqual(
      fulfillment
    );
    expect(sendPurchaseConfirmation).toHaveBeenCalledWith("purchase_1");
  });

  it("keeps the landing page available when fulfillment temporarily fails", async () => {
    const error = new Error("Database unavailable");
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    fulfillCheckoutSession.mockRejectedValue(error);

    await expect(tryFulfillCheckoutSession(makeSession())).resolves.toBeNull();
    expect(consoleError).toHaveBeenCalledWith(
      "[stripe] Checkout landing fulfillment failed",
      { sessionId: "cs_test_123", error }
    );
  });

  it("keeps a completed purchase available when only its email is delayed", async () => {
    const fulfillment = {
      purchaseId: "purchase_1",
      userId: "user_1",
      courseId: "course_1",
      isActive: true,
    };
    const error = new Error("Email provider unavailable");
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    fulfillCheckoutSession.mockResolvedValue(fulfillment);
    sendPurchaseConfirmation.mockRejectedValue(error);

    await expect(tryFulfillCheckoutSession(makeSession())).resolves.toEqual(
      fulfillment
    );
    expect(consoleError).toHaveBeenCalledWith(
      "[email] Purchase confirmation failed",
      { purchaseId: "purchase_1", error }
    );
  });

  it("does not send a new confirmation for a refunded checkout replay", async () => {
    const fulfillment = {
      purchaseId: "purchase_1",
      userId: "user_1",
      courseId: "course_1",
      isActive: false,
    };
    fulfillCheckoutSession.mockResolvedValue(fulfillment);

    await expect(tryFulfillCheckoutSession(makeSession())).resolves.toEqual(
      fulfillment
    );
    expect(sendPurchaseConfirmation).not.toHaveBeenCalled();
  });

  it("keeps an asynchronous payment in the same checkout cycle", async () => {
    const session = {
      id: "cs_test_123",
      mode: "payment",
      payment_status: "unpaid",
      status: "complete",
    } as Stripe.Checkout.Session;
    fulfillCheckoutSession.mockResolvedValue(null);

    await expect(tryFulfillCheckoutSession(session)).resolves.toBeNull();
    expect(markCheckoutAttemptProcessing).toHaveBeenCalledWith(session);
  });
});
