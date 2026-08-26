import "server-only";

import type { CheckoutAttempt } from "@prisma/client";

import {
  CHECKOUT_ATTEMPT_CREATION_RETRY_SECONDS,
  CHECKOUT_ATTEMPT_IDEMPOTENCY_PREFIX,
  CHECKOUT_SESSION_ID_PLACEHOLDER,
} from "@/constants/checkout";
import { failCheckoutAttemptCreation } from "@/features/courses/checkout-attempt-events";
import { getCheckoutSessionParams } from "@/functions/checkout/get-checkout-session-params";
import { reconcileOpenCheckoutAttempt } from "@/functions/checkout/reconcile-open-checkout-attempt";
import { clearStaleStripeCustomer } from "@/functions/stripe/clear-stale-stripe-customer";
import {
  isDefinitiveCheckoutCreationError,
  isMissingStripeCustomerError,
} from "@/functions/stripe/is-definitive-checkout-creation-error";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export async function openCheckoutAttempt(
  attempt: CheckoutAttempt,
  now = new Date()
) {
  if (attempt.status === "PROCESSING") {
    if (!attempt.stripeCheckoutSessionId) {
      throw new Error(`Checkout attempt ${attempt.id} has no Stripe session`);
    }

    return attempt.successUrl.replace(
      CHECKOUT_SESSION_ID_PLACEHOLDER,
      attempt.stripeCheckoutSessionId
    );
  }

  if (attempt.status === "OPEN") {
    if (
      attempt.stripeCheckoutUrl &&
      attempt.stripeExpiresAt &&
      attempt.stripeExpiresAt > now
    ) {
      return attempt.stripeCheckoutUrl;
    }

    return reconcileOpenCheckoutAttempt(attempt);
  }

  if (attempt.status !== "CREATING") {
    throw new Error(`Checkout attempt ${attempt.id} is not available`);
  }

  const creationDeadline = new Date(
    attempt.createdAt.getTime() +
      CHECKOUT_ATTEMPT_CREATION_RETRY_SECONDS * 1000
  );

  if (creationDeadline <= now) {
    await failCheckoutAttemptCreation(attempt);
    throw new Error(`Checkout attempt ${attempt.id} can no longer be retried`);
  }

  let checkoutSession;

  try {
    checkoutSession = await getStripe().checkout.sessions.create(
      getCheckoutSessionParams(attempt),
      {
        idempotencyKey: `${CHECKOUT_ATTEMPT_IDEMPOTENCY_PREFIX}:${attempt.id}`,
      }
    );
  } catch (error) {
    if (isDefinitiveCheckoutCreationError(error)) {
      const failedAttempt = await failCheckoutAttemptCreation(attempt);

      if (failedAttempt && isMissingStripeCustomerError(error)) {
        await clearStaleStripeCustomer(attempt);
      }
    }

    throw error;
  }

  if (!checkoutSession.url) {
    throw new Error(`Checkout session ${checkoutSession.id} has no URL`);
  }

  const storedSession = await prisma.checkoutAttempt.updateMany({
    where: {
      activeKey: attempt.activeKey,
      id: attempt.id,
      status: { in: ["CREATING", "OPEN"] },
      OR: [
        { stripeCheckoutSessionId: null },
        { stripeCheckoutSessionId: checkoutSession.id },
      ],
    },
    data: {
      status: "OPEN",
      stripeCheckoutSessionId: checkoutSession.id,
      stripeCheckoutUrl: checkoutSession.url,
      stripeExpiresAt: new Date(checkoutSession.expires_at * 1000),
    },
  });

  if (storedSession.count !== 1) {
    throw new Error(
      `Checkout attempt ${attempt.id} changed while opening its session`
    );
  }

  return checkoutSession.url;
}
