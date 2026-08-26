import "server-only";

import type { CheckoutAttemptStatus } from "@prisma/client";
import type Stripe from "stripe";

import { CHECKOUT_ATTEMPT_METADATA_KEY } from "@/constants/checkout";
import { prisma } from "@/lib/prisma";
import type {
  CheckoutAttemptIdentity,
  CheckoutAttemptReference,
  TerminalCheckoutAttemptStatus,
} from "@/types/checkout";

const PROCESSING_REPLAY_STATUSES = new Set<CheckoutAttemptStatus>([
  "PROCESSING",
  "COMPLETED",
  "EXPIRED",
  "FAILED",
  "CANCELLED",
]);

const CLOSED_REPLAY_STATUSES = new Set<CheckoutAttemptStatus>([
  "COMPLETED",
  "EXPIRED",
  "FAILED",
  "CANCELLED",
]);

export async function failCheckoutAttemptCreation(
  attempt: CheckoutAttemptIdentity
) {
  if (!attempt.activeKey) return false;

  const result = await prisma.checkoutAttempt.updateMany({
    where: {
      activeKey: attempt.activeKey,
      id: attempt.id,
      status: "CREATING",
      stripeCheckoutSessionId: null,
    },
    data: { activeKey: null, status: "FAILED" },
  });

  return result.count === 1;
}

export async function markCheckoutAttemptProcessing(
  session: Stripe.Checkout.Session
) {
  const reference = getCheckoutAttemptReference(session);
  if (!reference) return false;

  const result = await prisma.checkoutAttempt.updateMany({
    where: {
      id: reference.attemptId,
      courseId: reference.courseId,
      userId: reference.userId,
      status: { in: ["CREATING", "OPEN", "PROCESSING"] },
      OR: [
        { stripeCheckoutSessionId: null },
        { stripeCheckoutSessionId: session.id },
      ],
    },
    data: {
      status: "PROCESSING",
      stripeCheckoutSessionId: session.id,
      ...(session.url ? { stripeCheckoutUrl: session.url } : {}),
      stripeExpiresAt: new Date(session.expires_at * 1000),
    },
  });

  if (result.count === 1) return true;

  return confirmCheckoutAttemptReplay(
    session,
    reference,
    PROCESSING_REPLAY_STATUSES
  );
}

export async function closeCheckoutAttempt(
  session: Stripe.Checkout.Session,
  status: TerminalCheckoutAttemptStatus
) {
  const reference = getCheckoutAttemptReference(session);
  if (!reference) return false;

  const result = await prisma.checkoutAttempt.updateMany({
    where: {
      id: reference.attemptId,
      courseId: reference.courseId,
      userId: reference.userId,
      status: { in: ["CREATING", "OPEN", "PROCESSING"] },
      OR: [
        { stripeCheckoutSessionId: null },
        { stripeCheckoutSessionId: session.id },
      ],
    },
    data: {
      activeKey: null,
      status,
      stripeCheckoutSessionId: session.id,
      stripeCheckoutUrl: null,
      stripeExpiresAt: new Date(session.expires_at * 1000),
    },
  });

  if (result.count === 1) return true;

  return confirmCheckoutAttemptReplay(
    session,
    reference,
    CLOSED_REPLAY_STATUSES
  );
}

async function confirmCheckoutAttemptReplay(
  session: Stripe.Checkout.Session,
  reference: CheckoutAttemptReference,
  allowedStatuses: ReadonlySet<CheckoutAttemptStatus>
) {
  const attempt = await prisma.checkoutAttempt.findUnique({
    where: { id: reference.attemptId },
    select: {
      courseId: true,
      status: true,
      stripeCheckoutSessionId: true,
      userId: true,
    },
  });

  if (
    !attempt ||
    attempt.courseId !== reference.courseId ||
    attempt.userId !== reference.userId ||
    (attempt.stripeCheckoutSessionId !== null &&
      attempt.stripeCheckoutSessionId !== session.id) ||
    !allowedStatuses.has(attempt.status)
  ) {
    throw new Error(
      `Checkout session ${session.id} has an invalid attempt transition`
    );
  }

  return true;
}

function getCheckoutAttemptReference(
  session: Stripe.Checkout.Session
): CheckoutAttemptReference | null {
  const attemptId = session.metadata?.[CHECKOUT_ATTEMPT_METADATA_KEY];
  if (!attemptId) return null;

  const courseId = session.metadata?.courseId;
  const userId = session.metadata?.userId;

  if (
    !courseId ||
    !userId ||
    !Number.isSafeInteger(session.expires_at) ||
    session.expires_at <= 0
  ) {
    throw new Error(`Checkout session ${session.id} has invalid attempt data`);
  }

  return { attemptId, courseId, userId };
}
