import { describe, expect, it } from "vitest";

import { getSafeAuthCallbackUrl } from "@/functions/auth/get-safe-auth-callback-url";

describe("getSafeAuthCallbackUrl", () => {
  it("preserves an internal localized purchase intent", () => {
    expect(
      getSafeAuthCallbackUrl(
        "it",
        "/it/checkout/course_1?source=home#summary"
      )
    ).toBe("/it/checkout/course_1?source=home#summary");
  });

  it("falls back to the profile without a callback", () => {
    expect(getSafeAuthCallbackUrl("en")).toBe("/en/profile");
  });

  it.each([
    "https://example.com/it/checkout/course_1",
    "//example.com/it/checkout/course_1",
    "/en/checkout/course_1",
    "not-a-route",
  ])("rejects an unsafe callback: %s", (callbackUrl) => {
    expect(getSafeAuthCallbackUrl("it", callbackUrl)).toBe("/it/profile");
  });
});
