import type Stripe from "stripe";

export function getStripeCustomerId(
  customer: Stripe.Checkout.Session["customer"]
) {
  if (!customer) return null;
  return typeof customer === "string" ? customer : customer.id;
}
