import "server-only";

import { fulfillCheckoutSession } from "@/features/courses/fulfillment";
import { sendPurchaseConfirmation } from "@/features/purchases/send-purchase-confirmation";
import type Stripe from "stripe";

export async function tryFulfillCheckoutSession(
  session: Stripe.Checkout.Session
) {
  try {
    const fulfillment = await fulfillCheckoutSession(session, new Date());

    if (!fulfillment) return null;

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
