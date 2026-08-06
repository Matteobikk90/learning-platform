import { describe, expect, it } from "vitest";

import { normalizeCheckoutSessionId } from "@/functions/checkout/normalize-checkout-session-id";

describe("normalizeCheckoutSessionId", () => {
  it("accepts a well-formed checkout session ID", () => {
    const id = "cs_test_a1B2c3D4e5F6g7H8i9J0";

    expect(normalizeCheckoutSessionId(id)).toBe(id);
  });

  it("trims surrounding whitespace", () => {
    expect(normalizeCheckoutSessionId("  cs_test_a1B2c3D4  ")).toBe(
      "cs_test_a1B2c3D4"
    );
  });

  it("rejects repeated query parameters", () => {
    expect(
      normalizeCheckoutSessionId(["cs_test_a1B2c3D4", "cs_test_x9Y8z7W6"])
    ).toBeNull();
  });

  it("rejects missing values", () => {
    expect(normalizeCheckoutSessionId(undefined)).toBeNull();
    expect(normalizeCheckoutSessionId("")).toBeNull();
  });

  it("rejects values that are not checkout session IDs", () => {
    expect(normalizeCheckoutSessionId("garbage")).toBeNull();
    expect(normalizeCheckoutSessionId("pi_3Nc0000000000000")).toBeNull();
    expect(normalizeCheckoutSessionId("cs_test_abc/../def")).toBeNull();
    expect(normalizeCheckoutSessionId(`cs_${"a".repeat(300)}`)).toBeNull();
  });
});
