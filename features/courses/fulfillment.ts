import type Stripe from "stripe";

import { prisma } from "@/lib/prisma";

export async function fulfillCheckoutSession(
  session: Stripe.Checkout.Session
) {
  if (session.payment_status !== "paid") return null;

  const userId = session.metadata?.userId;
  const courseId = session.metadata?.courseId;

  if (!userId || !courseId) {
    throw new Error(`Checkout session ${session.id} has invalid metadata`);
  }

  await prisma.purchase.upsert({
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

  return { userId, courseId };
}
