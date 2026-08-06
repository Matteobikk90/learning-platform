import type Stripe from "stripe";

export type CheckoutProcessingProps = {
  sessionId: string;
};

export type CheckoutViewState = "ready" | "processing" | "notCompleted";

export type CheckoutViewStateInput = {
  isFulfilled: boolean;
  sessionStatus: Stripe.Checkout.Session["status"];
};
