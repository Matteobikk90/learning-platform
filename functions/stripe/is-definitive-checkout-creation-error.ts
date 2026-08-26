import "server-only";

import Stripe from "stripe";

export function isMissingStripeCustomerError(error: unknown) {
  return (
    error instanceof Stripe.errors.StripeInvalidRequestError &&
    error.code === "resource_missing" &&
    error.param === "customer"
  );
}

export function isDefinitiveCheckoutCreationError(error: unknown) {
  return (
    error instanceof Stripe.errors.StripeInvalidRequestError ||
    error instanceof Stripe.errors.StripeAuthenticationError ||
    error instanceof Stripe.errors.StripePermissionError
  );
}
