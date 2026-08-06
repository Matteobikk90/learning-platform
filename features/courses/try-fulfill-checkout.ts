import "server-only";

import { fulfillCheckoutSession } from "@/features/courses/fulfillment";
import type Stripe from "stripe";

export async function tryFulfillCheckoutSession(
  session: Stripe.Checkout.Session
) {
  try {
    return await fulfillCheckoutSession(session);
  } catch (error) {
    console.error("[stripe] Checkout landing fulfillment failed", {
      sessionId: session.id,
      error,
    });
    return null;
  }
}
