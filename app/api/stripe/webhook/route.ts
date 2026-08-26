import { NextResponse } from "next/server";
import type Stripe from "stripe";

import {
  closeCheckoutAttempt,
  markCheckoutAttemptProcessing,
} from "@/features/courses/checkout-attempt-events";
import { fulfillCheckoutSession } from "@/features/courses/fulfillment";
import {
  syncRefund,
  syncRefundedCharge,
} from "@/features/courses/refund-sync";
import { sendPurchaseConfirmation } from "@/features/purchases/send-purchase-confirmation";
import { sendWithdrawalAcknowledgement } from "@/features/purchases/send-withdrawal-acknowledgement";
import { requireEnv } from "@/lib/env";
import { getStripe } from "@/lib/stripe";

const FULFILLMENT_EVENTS = new Set<Stripe.Event.Type>([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
]);

const REFUND_EVENTS = new Set<Stripe.Event.Type>([
  "refund.created",
  "refund.updated",
]);

const CLOSED_CHECKOUT_ATTEMPT_EVENTS = new Map<
  Stripe.Event.Type,
  "EXPIRED" | "FAILED"
>([
  ["checkout.session.expired", "EXPIRED"],
  ["checkout.session.async_payment_failed", "FAILED"],
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
      const checkoutSession = event.data.object as Stripe.Checkout.Session;
      const fulfillment = await fulfillCheckoutSession(
        checkoutSession,
        new Date(event.created * 1000)
      );

      if (fulfillment?.isActive) {
        await sendPurchaseConfirmation(fulfillment.purchaseId);
      } else if (
        event.type === "checkout.session.completed" &&
        checkoutSession.payment_status !== "paid"
      ) {
        await markCheckoutAttemptProcessing(checkoutSession);
      }
    } catch (error) {
      console.error("[stripe] Checkout fulfillment failed", {
        eventId: event.id,
        error,
      });
      return NextResponse.json({ error: "Fulfillment failed" }, { status: 500 });
    }
  }

  const closedAttemptStatus = CLOSED_CHECKOUT_ATTEMPT_EVENTS.get(event.type);
  if (closedAttemptStatus) {
    try {
      await closeCheckoutAttempt(
        event.data.object as Stripe.Checkout.Session,
        closedAttemptStatus
      );
    } catch (error) {
      console.error("[stripe] Checkout attempt transition failed", {
        eventId: event.id,
        error,
      });
      return NextResponse.json(
        { error: "Checkout transition failed" },
        { status: 500 }
      );
    }
  }

  if (event.type === "charge.refunded") {
    try {
      const refundSync = await syncRefundedCharge(
        event.data.object as Stripe.Charge,
        new Date(event.created * 1000)
      );

      if (refundSync) {
        await sendWithdrawalAcknowledgement(refundSync.purchaseId);
      }
    } catch (error) {
      console.error("[stripe] Charge refund sync failed", {
        eventId: event.id,
        error,
      });
      return NextResponse.json({ error: "Refund sync failed" }, { status: 500 });
    }
  }

  if (REFUND_EVENTS.has(event.type)) {
    try {
      const refundSync = await syncRefund(
        event.data.object as Stripe.Refund,
        new Date(event.created * 1000)
      );

      if (refundSync) {
        await sendWithdrawalAcknowledgement(refundSync.purchaseId);
      }
    } catch (error) {
      console.error("[stripe] Refund sync failed", {
        eventId: event.id,
        error,
      });
      return NextResponse.json({ error: "Refund sync failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
