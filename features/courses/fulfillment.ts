import "server-only";

import type Stripe from "stripe";

import { getStripeCustomerId } from "@/functions/stripe/get-stripe-customer-id";
import { prisma } from "@/lib/prisma";

export async function fulfillCheckoutSession(
  session: Stripe.Checkout.Session
) {
  if (session.payment_status !== "paid") return null;

  if (session.mode !== "payment") {
    throw new Error(`Checkout session ${session.id} is not a payment`);
  }

  const userId = session.metadata?.userId;
  const courseId = session.metadata?.courseId;
  const stripeCustomerId = getStripeCustomerId(session.customer);

  const expectedAmount = session.metadata?.amountTotal
    ? Number(session.metadata.amountTotal)
    : null;

  if (
    !userId ||
    !courseId ||
    session.client_reference_id !== userId ||
    session.currency !== "eur" ||
    !Number.isSafeInteger(session.amount_total) ||
    (session.amount_total ?? 0) <= 0 ||
    (expectedAmount !== null &&
      (!Number.isSafeInteger(expectedAmount) ||
        expectedAmount <= 0 ||
        session.amount_total !== expectedAmount))
  ) {
    throw new Error(`Checkout session ${session.id} has invalid metadata`);
  }

  await prisma.$transaction(async (transaction) => {
    const [user, course] = await Promise.all([
      transaction.user.findUnique({
        where: { id: userId },
        select: { id: true, stripeCustomerId: true },
      }),
      transaction.course.findUnique({
        where: { id: courseId },
        select: { id: true },
      }),
    ]);

    if (!user || !course) {
      throw new Error(`Checkout session ${session.id} references missing data`);
    }

    if (
      stripeCustomerId &&
      user.stripeCustomerId &&
      user.stripeCustomerId !== stripeCustomerId
    ) {
      throw new Error(`Checkout session ${session.id} has a customer mismatch`);
    }

    if (stripeCustomerId && !user.stripeCustomerId) {
      await transaction.user.update({
        where: { id: userId },
        data: { stripeCustomerId },
      });
    }

    await transaction.purchase.upsert({
      where: { userId_courseId: { userId, courseId } },
      update: {
        stripeCheckoutSessionId: session.id,
        amountTotal: session.amount_total,
        currency: session.currency,
      },
      create: {
        userId,
        courseId,
        stripeCheckoutSessionId: session.id,
        amountTotal: session.amount_total,
        currency: session.currency,
      },
    });
  });

  return { userId, courseId };
}
