import type Stripe from "stripe";

import type { FormAction } from "@/types/forms";
import type { Locale } from "@/types/i18n";

export type CheckoutProcessingProps = {
  sessionId: string;
};

export type CheckoutViewState =
  | "ready"
  | "processing"
  | "notCompleted"
  | "refunded";

export type CheckoutViewStateInput = {
  isFulfilled: boolean;
  isRefunded?: boolean;
  sessionStatus: Stripe.Checkout.Session["status"];
};

export type CheckoutConsent = {
  checkoutLocale: Locale;
  consentedAt: Date;
  legalTermsVersion: string;
};

export type CheckoutConsentFormProps = {
  action: FormAction;
};
