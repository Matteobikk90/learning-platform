import type Stripe from "stripe";

export function getStripeChargeId(charge: Stripe.Refund["charge"]) {
  if (!charge) return null;
  return typeof charge === "string" ? charge : charge.id;
}
