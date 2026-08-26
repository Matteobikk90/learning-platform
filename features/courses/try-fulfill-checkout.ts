import "server-only";

import { markCheckoutAttemptProcessing } from "@/features/courses/checkout-attempt-events";
import { fulfillCheckoutSession } from "@/features/courses/fulfillment";
import { sendPurchaseConfirmation } from "@/features/purchases/send-purchase-confirmation";
import type Stripe from "stripe";

export async function tryFulfillCheckoutSession(
  session: Stripe.Checkout.Session
) {
  try {
    const fulfillment = await fulfillCheckoutSession(session, new Date());

    if (!fulfillment) {
      if (
        session.mode === "payment" &&
        session.status === "complete" &&
        session.payment_status !== "paid"
      ) {
        await markCheckoutAttemptProcessing(session);
      }

      return null;
    }

    if (fulfillment.isActive) {
      try {
        await sendPurchaseConfirmation(fulfillment.purchaseId);
      } catch (error) {
        console.error("[email] Purchase confirmation failed", {
          purchaseId: fulfillment.purchaseId,
          error,
        });
      }
    }

    return fulfillment;
  } catch (error) {
    console.error("[stripe] Checkout landing fulfillment failed", {
      sessionId: session.id,
      error,
    });
    return null;
  }
}
