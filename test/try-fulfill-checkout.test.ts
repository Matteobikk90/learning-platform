import type Stripe from "stripe";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { tryFulfillCheckoutSession } from "@/features/courses/try-fulfill-checkout";

const fulfillCheckoutSession = vi.hoisted(() => vi.fn());

vi.mock("@/features/courses/fulfillment", () => ({
  fulfillCheckoutSession,
}));

function makeSession() {
  return { id: "cs_test_123" } as Stripe.Checkout.Session;
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("tryFulfillCheckoutSession", () => {
  it("returns the completed fulfillment", async () => {
    const fulfillment = { userId: "user_1", courseId: "course_1" };
    fulfillCheckoutSession.mockResolvedValue(fulfillment);

    await expect(tryFulfillCheckoutSession(makeSession())).resolves.toEqual(
      fulfillment
    );
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
});
