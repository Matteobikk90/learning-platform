import "server-only";

import type { CheckoutAttempt } from "@prisma/client";

import {
  CHECKOUT_ATTEMPT_METADATA_KEY,
  CHECKOUT_SESSION_ID_PLACEHOLDER,
} from "@/constants/checkout";
import { closeCheckoutAttempt } from "@/features/courses/checkout-attempt-events";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export async function reconcileOpenCheckoutAttempt(
  attempt: CheckoutAttempt
) {
  if (!attempt.stripeCheckoutSessionId) {
    throw new Error(`Checkout attempt ${attempt.id} has no Stripe session`);
  }

  const session = await getStripe().checkout.sessions.retrieve(
    attempt.stripeCheckoutSessionId
  );

  if (
    session.metadata?.[CHECKOUT_ATTEMPT_METADATA_KEY] !== attempt.id ||
    session.metadata?.courseId !== attempt.courseId ||
    session.metadata?.userId !== attempt.userId ||
    !Number.isSafeInteger(session.expires_at) ||
    session.expires_at <= 0
  ) {
    throw new Error(`Checkout session ${session.id} does not match its attempt`);
  }

  if (session.status === "complete") {
    return attempt.successUrl.replace(
      CHECKOUT_SESSION_ID_PLACEHOLDER,
      session.id
    );
  }

  if (session.status === "expired") {
    await closeCheckoutAttempt(session, "EXPIRED");
    throw new Error(`Checkout attempt ${attempt.id} has expired`);
  }

  if (session.status !== "open" || !session.url) {
    throw new Error(`Checkout session ${session.id} is not available`);
  }

  const refreshedAttempt = await prisma.checkoutAttempt.updateMany({
    where: {
      activeKey: attempt.activeKey,
      id: attempt.id,
      status: "OPEN",
      stripeCheckoutSessionId: session.id,
    },
    data: {
      stripeCheckoutUrl: session.url,
      stripeExpiresAt: new Date(session.expires_at * 1000),
    },
  });

  if (refreshedAttempt.count !== 1) {
    throw new Error(
      `Checkout attempt ${attempt.id} changed while reconciling its session`
    );
  }

  return session.url;
}
