import { describe, expect, it } from "vitest";

import { checkoutConsentSchema } from "@/features/courses/checkout-schema";
import { getCheckoutConsent } from "@/functions/checkout/get-checkout-consent";

const completeMetadata = {
  legalTermsVersion: "2026-08-07-draft.1",
  checkoutLocale: "it",
  legalConsentAt: "2026-08-07T10:15:30.000Z",
  termsAccepted: "true",
  immediateAccessConsent: "true",
  withdrawalWaiverAcknowledged: "true",
};

describe("checkout legal consent", () => {
  it("requires every checkout confirmation separately", () => {
    expect(
      checkoutConsentSchema.safeParse({
        termsAccepted: "on",
        immediateAccessConsent: "on",
        withdrawalWaiverAcknowledged: null,
      }).success
    ).toBe(false);
  });

  it("accepts a complete versioned Stripe record", () => {
    expect(getCheckoutConsent(completeMetadata)).toEqual({
      checkoutLocale: "it",
      consentedAt: new Date("2026-08-07T10:15:30.000Z"),
      legalTermsVersion: "2026-08-07-draft.1",
    });
  });

  it("keeps legacy sessions valid when no legal metadata exists", () => {
    expect(getCheckoutConsent({ userId: "user_1" })).toBeNull();
  });

  it.each([
    { ...completeMetadata, checkoutLocale: "fr" },
    { ...completeMetadata, termsAccepted: "false" },
    { ...completeMetadata, legalConsentAt: "not-a-date" },
    { legalTermsVersion: completeMetadata.legalTermsVersion },
  ])("rejects incomplete or altered evidence", (metadata) => {
    expect(() => getCheckoutConsent(metadata)).toThrow(/invalid legal consent/);
  });
});
