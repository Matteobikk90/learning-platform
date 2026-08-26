import { beforeEach, describe, expect, it, vi } from "vitest";

import { createCheckoutSession } from "@/features/courses/checkout";

const requireLearner = vi.hoisted(() => vi.fn());
const claimCheckoutAttempt = vi.hoisted(() => vi.fn());
const openCheckoutAttempt = vi.hoisted(() => vi.fn());
const user = vi.hoisted(() => ({ findUnique: vi.fn() }));
const purchase = vi.hoisted(() => ({ findFirst: vi.fn() }));

vi.mock("@/lib/session", () => ({ requireLearner }));
vi.mock("@/functions/checkout/claim-checkout-attempt", () => ({
  claimCheckoutAttempt,
}));
vi.mock("@/features/courses/open-checkout-attempt", () => ({
  openCheckoutAttempt,
}));
vi.mock("@/lib/prisma", () => ({ prisma: { purchase, user } }));
vi.mock("@/functions/courses/get-published-course", () => ({
  getPublishedCourse: vi.fn(),
}));
vi.mock("@/lib/request-app-url", () => ({
  getRequestAppUrl: vi.fn(),
}));
vi.mock("next-intl/server", () => ({
  getLocale: () => Promise.resolve("it"),
  getTranslations: () => Promise.resolve((key: string) => key),
}));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("admin checkout", () => {
  it("stops before creating a checkout attempt", async () => {
    requireLearner.mockRejectedValue(new Error("Admin redirected"));

    await expect(
      createCheckoutSession("course_1", { error: null }, new FormData())
    ).rejects.toThrow("Admin redirected");

    expect(user.findUnique).not.toHaveBeenCalled();
    expect(purchase.findFirst).not.toHaveBeenCalled();
    expect(claimCheckoutAttempt).not.toHaveBeenCalled();
    expect(openCheckoutAttempt).not.toHaveBeenCalled();
  });
});
