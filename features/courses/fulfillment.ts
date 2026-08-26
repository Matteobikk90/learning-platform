import "server-only";

import type Stripe from "stripe";

import {
  CHECKOUT_ATTEMPT_METADATA_KEY,
  FULFILLABLE_CHECKOUT_ATTEMPT_STATUSES,
} from "@/constants/checkout";
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
  const checkoutAttemptId =
    session.metadata?.[CHECKOUT_ATTEMPT_METADATA_KEY] ?? null;
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
    const [user, course, checkoutAttempt] = await Promise.all([
      transaction.user.findUnique({
        where: { id: userId },
        select: { id: true, stripeCustomerId: true },
      }),
      transaction.course.findUnique({
        where: { id: courseId },
        select: { id: true },
      }),
      checkoutAttemptId
        ? transaction.checkoutAttempt.findUnique({
            where: { id: checkoutAttemptId },
            select: {
              amountTotal: true,
              checkoutLocale: true,
              consentedAt: true,
              courseId: true,
              currency: true,
              legalTermsVersion: true,
              status: true,
              stripeCustomerId: true,
              stripeCheckoutSessionId: true,
              userId: true,
            },
          })
        : null,
    ]);

    if (!user || !course) {
      throw new Error(`Checkout session ${session.id} references missing data`);
    }

    if (
      checkoutAttemptId &&
      (!checkoutAttempt ||
        !checkoutConsent ||
        checkoutAttempt.userId !== userId ||
        checkoutAttempt.courseId !== courseId ||
        checkoutAttempt.amountTotal !== session.amount_total ||
        checkoutAttempt.currency !== session.currency ||
        checkoutAttempt.checkoutLocale !== checkoutConsent.checkoutLocale ||
        checkoutAttempt.legalTermsVersion !==
          checkoutConsent.legalTermsVersion ||
        checkoutAttempt.consentedAt.getTime() !==
          checkoutConsent.consentedAt.getTime() ||
        (checkoutAttempt.stripeCustomerId !== null &&
          checkoutAttempt.stripeCustomerId !== stripeCustomerId) ||
        (checkoutAttempt.stripeCheckoutSessionId !== null &&
          checkoutAttempt.stripeCheckoutSessionId !== session.id) ||
        !FULFILLABLE_CHECKOUT_ATTEMPT_STATUSES.has(checkoutAttempt.status) ||
        !Number.isSafeInteger(session.expires_at) ||
        session.expires_at <= 0)
    ) {
      throw new Error(
        `Checkout session ${session.id} has an invalid checkout attempt`
      );
    }

    if (
      !checkoutAttemptId &&
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

    const purchase = await transaction.purchase.upsert({
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

    if (checkoutAttemptId) {
      const completedAttempt = await transaction.checkoutAttempt.updateMany({
        where: {
          id: checkoutAttemptId,
          OR: [
            { stripeCheckoutSessionId: null },
            { stripeCheckoutSessionId: session.id },
          ],
        },
        data: {
          activeKey: null,
          status: "COMPLETED",
          stripeCheckoutSessionId: session.id,
          stripeCheckoutUrl: null,
          stripeExpiresAt: new Date(session.expires_at * 1000),
        },
      });

      if (completedAttempt.count !== 1) {
        throw new Error(
          `Checkout session ${session.id} could not complete its attempt`
        );
      }
    }

    return purchase;
  });

  return {
    purchaseId: purchase.id,
    userId,
    courseId,
    isActive: purchase.refundedAt === null,
  };
}
