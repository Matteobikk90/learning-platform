import { describe, expect, it } from "vitest";

import { getCheckoutCustomerParams } from "@/functions/stripe/get-checkout-customer-params";

describe("getCheckoutCustomerParams", () => {
  it("creates a Stripe customer and collects billing details on first purchase", () => {
    expect(
      getCheckoutCustomerParams({
        email: "student@example.com",
        stripeCustomerId: null,
      })
    ).toEqual({
      billing_address_collection: "required",
      customer_creation: "always",
      customer_email: "student@example.com",
    });
  });

  it("reuses a known Stripe customer and refreshes their billing details", () => {
    expect(
      getCheckoutCustomerParams({
        email: "student@example.com",
        stripeCustomerId: "cus_123",
      })
    ).toEqual({
      billing_address_collection: "required",
      customer: "cus_123",
      customer_update: {
        address: "auto",
        name: "auto",
      },
    });
  });
});
