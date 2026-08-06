import Stripe from "stripe";
import { describe, expect, it } from "vitest";

import { isStripeNotFoundError } from "@/functions/stripe/is-stripe-not-found-error";

describe("isStripeNotFoundError", () => {
  it("recognizes unknown resources by code", () => {
    const error = new Stripe.errors.StripeInvalidRequestError({
      type: "invalid_request_error",
      message: "No such checkout.session: 'cs_missing'",
      code: "resource_missing",
    });

    expect(isStripeNotFoundError(error)).toBe(true);
  });

  it("recognizes unknown resources by HTTP status", () => {
    const error = new Stripe.errors.StripeInvalidRequestError({
      type: "invalid_request_error",
      message: "Not found",
      statusCode: 404,
    });

    expect(isStripeNotFoundError(error)).toBe(true);
  });

  it("treats other invalid-request errors as transient", () => {
    const error = new Stripe.errors.StripeInvalidRequestError({
      type: "invalid_request_error",
      message: "Invalid parameter",
      code: "parameter_invalid_empty",
      statusCode: 400,
    });

    expect(isStripeNotFoundError(error)).toBe(false);
  });

  it("treats other Stripe errors and generic errors as transient", () => {
    const apiError = new Stripe.errors.StripeAPIError({
      type: "api_error",
      message: "Stripe is temporarily unavailable",
    });

    expect(isStripeNotFoundError(apiError)).toBe(false);
    expect(isStripeNotFoundError(new Error("network down"))).toBe(false);
    expect(isStripeNotFoundError(undefined)).toBe(false);
  });
});
