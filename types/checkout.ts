import type { CheckoutAttempt, CheckoutAttemptStatus } from "@prisma/client";
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

export type CheckoutAttemptInput = {
  amountTotal: number;
  cancelUrl: string;
  checkoutLocale: Locale;
  consentedAt: Date;
  courseDescription: string | null;
  courseId: string;
  courseTitle: string;
  customerEmail: string;
  legalTermsVersion: string;
  stripeCustomerId: string | null;
  successUrl: string;
  userId: string;
};

export type CheckoutAttemptClaim =
  | { kind: "owned" }
  | { attempt: CheckoutAttempt; kind: "attempt" };

export type CheckoutAttemptIdentity = Pick<
  CheckoutAttempt,
  "activeKey" | "id"
>;

export type CheckoutAttemptCustomerReference = Pick<
  CheckoutAttempt,
  "stripeCustomerId" | "userId"
>;

export type CheckoutAttemptReference = {
  attemptId: string;
  courseId: string;
  userId: string;
};

export type TerminalCheckoutAttemptStatus = Extract<
  CheckoutAttemptStatus,
  "EXPIRED" | "FAILED"
>;
