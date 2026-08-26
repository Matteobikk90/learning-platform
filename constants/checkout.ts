import type { CheckoutAttemptStatus } from "@prisma/client";

export const CHECKOUT_SESSION_ID_PATTERN = /^cs_[A-Za-z0-9_]{6,240}$/;

export const CHECKOUT_ATTEMPT_IDEMPOTENCY_PREFIX = "checkout-attempt";
export const CHECKOUT_ATTEMPT_METADATA_KEY = "checkoutAttemptId";
export const CHECKOUT_ATTEMPT_CREATION_RETRY_SECONDS = 23 * 60 * 60;
export const CHECKOUT_CURRENCY = "eur";
export const CHECKOUT_SESSION_ID_PLACEHOLDER = "{CHECKOUT_SESSION_ID}";

export const ACTIVE_CHECKOUT_ATTEMPT_STATUSES =
  new Set<CheckoutAttemptStatus>(["CREATING", "OPEN", "PROCESSING"]);

export const FULFILLABLE_CHECKOUT_ATTEMPT_STATUSES =
  new Set<CheckoutAttemptStatus>([
    "CREATING",
    "OPEN",
    "PROCESSING",
    "COMPLETED",
    "EXPIRED",
    "FAILED",
    "CANCELLED",
  ]);
