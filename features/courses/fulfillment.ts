import "server-only";

import type Stripe from "stripe";

import { getCheckoutConsent } from "@/functions/checkout/get-checkout-consent";
import { getStripeCustomerId } from "@/functions/stripe/get-stripe-customer-id";
import { getStripePaymentIntentId } from "@/functions/stripe/get-stripe-payment-intent-id";
import { prisma } from "@/lib/prisma";

export async function fulfillCheckoutSession(
  session: Stripe.Checkout.Session,
  fulfilledAt = new Date(session.created * 1000)
) {
  if (session.payment_status !== "paid") return null;

  if (session.mode !== "payment") {
    throw new Error(`Checkout session ${session.id} is not a payment`);
  }

  const userId = session.metadata?.userId;
  const courseId = session.metadata?.courseId;
  const stripeCustomerId = getStripeCustomerId(session.customer);
  const stripePaymentIntentId = getStripePaymentIntentId(
    session.payment_intent
  );
  const checkoutConsent = getCheckoutConsent(session.metadata);

  const expectedAmount = session.metadata?.amountTotal
    ? Number(session.metadata.amountTotal)
    : null;
  const checkoutCreatedAt = new Date(session.created * 1000);

  if (
    !userId ||
    !courseId ||
    !stripePaymentIntentId ||
    !Number.isSafeInteger(session.created) ||
    session.created <= 0 ||
    Number.isNaN(fulfilledAt.getTime()) ||
    fulfilledAt < checkoutCreatedAt ||
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

  const purchase = await prisma.$transaction(async (transaction) => {
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

    const existingPurchase = await transaction.purchase.findUnique({
      where: { stripeCheckoutSessionId: session.id },
      select: { userId: true, courseId: true },
    });

    if (
      existingPurchase &&
      (existingPurchase.userId !== userId ||
        existingPurchase.courseId !== courseId)
    ) {
      throw new Error(`Checkout session ${session.id} has a purchase mismatch`);
    }

    const legalData = checkoutConsent
      ? {
          legalTermsVersion: checkoutConsent.legalTermsVersion,
          checkoutLocale: checkoutConsent.checkoutLocale,
          termsAcceptedAt: checkoutConsent.consentedAt,
          immediateAccessConsentAt: checkoutConsent.consentedAt,
          withdrawalWaiverAcknowledgedAt: checkoutConsent.consentedAt,
        }
      : {};

    return transaction.purchase.upsert({
      where: { stripeCheckoutSessionId: session.id },
      update: {
        stripePaymentIntentId,
        amountTotal: session.amount_total,
        currency: session.currency,
        ...legalData,
      },
      create: {
        createdAt: fulfilledAt,
        userId,
        courseId,
        stripeCheckoutSessionId: session.id,
        stripePaymentIntentId,
        amountTotal: session.amount_total,
        currency: session.currency,
        ...legalData,
      },
      select: { id: true, refundedAt: true },
    });
  });

  return {
    purchaseId: purchase.id,
    userId,
    courseId,
    isActive: purchase.refundedAt === null,
  };
}
