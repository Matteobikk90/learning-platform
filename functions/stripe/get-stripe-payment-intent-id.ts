import type Stripe from "stripe";

export function getStripePaymentIntentId(
  paymentIntent: string | Stripe.PaymentIntent | null
) {
  if (!paymentIntent) return null;
  return typeof paymentIntent === "string" ? paymentIntent : paymentIntent.id;
}
