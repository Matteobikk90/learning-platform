import "server-only";

import type Stripe from "stripe";

import { PURCHASE_REFUND_SELECT } from "@/constants/purchases";
import { getStripeChargeId } from "@/functions/stripe/get-stripe-charge-id";
import { getStripePaymentIntentId } from "@/functions/stripe/get-stripe-payment-intent-id";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

async function findPurchaseForPaymentIntent(paymentIntentId: string) {
  const purchase = await prisma.purchase.findUnique({
    where: { stripePaymentIntentId: paymentIntentId },
    select: PURCHASE_REFUND_SELECT,
  });

  if (purchase) return purchase;

  const sessions = await getStripe().checkout.sessions.list({
    payment_intent: paymentIntentId,
    limit: 1,
  });
  const checkoutSession = sessions.data[0];

  if (!checkoutSession) {
    throw new Error(`No checkout session found for ${paymentIntentId}`);
  }

  const purchaseBySession = await prisma.purchase.findUnique({
    where: { stripeCheckoutSessionId: checkoutSession.id },
    select: PURCHASE_REFUND_SELECT,
  });

  if (purchaseBySession) {
    if (
      purchaseBySession.stripePaymentIntentId &&
      purchaseBySession.stripePaymentIntentId !== paymentIntentId
    ) {
      throw new Error(
        `Purchase ${purchaseBySession.id} has an inconsistent payment intent`
      );
    }

    return purchaseBySession;
  }

  const userId = checkoutSession.metadata?.userId;
  const courseId = checkoutSession.metadata?.courseId;

  if (!userId || !courseId) {
    throw new Error(
      `Checkout session ${checkoutSession.id} has no purchase metadata`
    );
  }

  const currentPurchase = await prisma.purchase.findFirst({
    where: { userId, courseId },
    orderBy: { createdAt: "desc" },
    select: PURCHASE_REFUND_SELECT,
  });

  if (!currentPurchase) {
    throw new Error(
      `Purchase for checkout session ${checkoutSession.id} is not ready`
    );
  }

  const referencesAnotherPurchase =
    (currentPurchase.stripePaymentIntentId !== null &&
      currentPurchase.stripePaymentIntentId !== paymentIntentId) ||
    (currentPurchase.stripeCheckoutSessionId !== null &&
      currentPurchase.stripeCheckoutSessionId !== checkoutSession.id);

  if (!referencesAnotherPurchase) return currentPurchase;

  const checkoutCreatedAt = new Date(checkoutSession.created * 1000);

  if (
    Number.isNaN(checkoutCreatedAt.getTime()) ||
    currentPurchase.createdAt.getTime() <= checkoutCreatedAt.getTime()
  ) {
    throw new Error(
      `Purchase for checkout session ${checkoutSession.id} is not ready`
    );
  }

  return null;
}

export async function syncRefundedCharge(
  charge: Stripe.Charge,
  occurredAt: Date
) {
  const paymentIntentId = getStripePaymentIntentId(charge.payment_intent);

  if (
    !paymentIntentId ||
    !Number.isSafeInteger(charge.amount) ||
    charge.amount <= 0 ||
    !Number.isSafeInteger(charge.amount_refunded) ||
    charge.amount_refunded < 0 ||
    charge.amount_refunded > charge.amount ||
    Number.isNaN(occurredAt.getTime())
  ) {
    throw new Error(`Refunded charge ${charge.id} is invalid`);
  }

  const purchase = await findPurchaseForPaymentIntent(paymentIntentId);

  if (!purchase) return null;

  if (
    (purchase.amountTotal !== null && purchase.amountTotal !== charge.amount) ||
    (purchase.currency !== null && purchase.currency !== charge.currency)
  ) {
    throw new Error(`Refunded charge ${charge.id} does not match its purchase`);
  }

  const fullyRefunded =
    charge.refunded || charge.amount_refunded === charge.amount;
  const result = await prisma.purchase.updateMany({
    where: {
      id: purchase.id,
      amountRefunded: { lte: charge.amount_refunded },
      OR: [
        { stripePaymentIntentId: null },
        { stripePaymentIntentId: paymentIntentId },
      ],
    },
    data: {
      stripePaymentIntentId: paymentIntentId,
      amountRefunded: charge.amount_refunded,
      ...(fullyRefunded
        ? { refundedAt: purchase.refundedAt ?? occurredAt }
        : {}),
    },
  });

  return {
    purchaseId: purchase.id,
    fullyRefunded,
    updated: result.count > 0,
  };
}

export async function syncRefund(refund: Stripe.Refund, occurredAt: Date) {
  if (refund.status !== "succeeded") return null;

  const chargeId = getStripeChargeId(refund.charge);

  if (!chargeId) {
    throw new Error(`Refund ${refund.id} has no charge`);
  }

  const charge = await getStripe().charges.retrieve(chargeId);
  return syncRefundedCharge(charge, occurredAt);
}
