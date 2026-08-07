import "server-only";

import { syncRefund } from "@/features/courses/refund-sync";
import { getStripePaymentIntentId } from "@/functions/stripe/get-stripe-payment-intent-id";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export async function initiateWithdrawalRefund(purchaseId: string) {
  const purchase = await prisma.purchase.findUnique({
    where: { id: purchaseId },
    select: {
      id: true,
      userId: true,
      courseId: true,
      refundedAt: true,
      withdrawalRequestedAt: true,
      stripeCheckoutSessionId: true,
      stripePaymentIntentId: true,
    },
  });

  if (!purchase || !purchase.withdrawalRequestedAt) {
    throw new Error(`Purchase ${purchaseId} has no withdrawal request`);
  }

  if (purchase.refundedAt) return null;

  let paymentIntentId = purchase.stripePaymentIntentId;

  if (!paymentIntentId && purchase.stripeCheckoutSessionId) {
    const checkoutSession = await getStripe().checkout.sessions.retrieve(
      purchase.stripeCheckoutSessionId
    );

    if (
      checkoutSession.metadata?.userId !== purchase.userId ||
      checkoutSession.metadata?.courseId !== purchase.courseId
    ) {
      throw new Error(`Purchase ${purchaseId} has inconsistent Stripe metadata`);
    }

    paymentIntentId = getStripePaymentIntentId(checkoutSession.payment_intent);

    if (paymentIntentId) {
      await prisma.purchase.updateMany({
        where: { id: purchase.id, stripePaymentIntentId: null },
        data: { stripePaymentIntentId: paymentIntentId },
      });
    }
  }

  if (!paymentIntentId) {
    throw new Error(`Purchase ${purchaseId} has no Stripe payment intent`);
  }

  const refund = await getStripe().refunds.create(
    {
      payment_intent: paymentIntentId,
      reason: "requested_by_customer",
      metadata: {
        purchaseId: purchase.id,
        source: "online_withdrawal",
      },
    },
    { idempotencyKey: `online-withdrawal-${purchase.id}` }
  );

  if (refund.status === "succeeded") {
    await syncRefund(refund, new Date());
  }

  return refund;
}
