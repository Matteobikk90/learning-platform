import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { fulfillCheckoutSession } from "@/features/courses/fulfillment";
import { requireEnv } from "@/lib/env";
import { getStripe } from "@/lib/stripe";

const FULFILLMENT_EVENTS = new Set<Stripe.Event.Type>([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
]);

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      await request.text(),
      signature,
      requireEnv("STRIPE_WEBHOOK_SECRET")
    );
  } catch (error) {
    console.error("[stripe] Invalid webhook signature", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (FULFILLMENT_EVENTS.has(event.type)) {
    try {
      await fulfillCheckoutSession(event.data.object as Stripe.Checkout.Session);
    } catch (error) {
      console.error("[stripe] Checkout fulfillment failed", {
        eventId: event.id,
        error,
      });
      return NextResponse.json({ error: "Fulfillment failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
