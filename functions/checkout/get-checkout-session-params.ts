import type { CheckoutAttempt } from "@prisma/client";
import type Stripe from "stripe";

import { CHECKOUT_ATTEMPT_METADATA_KEY } from "@/constants/checkout";
import { CHECKOUT_LEGAL_METADATA } from "@/constants/legal";
import { isSupportedLocale } from "@/functions/i18n/is-supported-locale";
import { getCheckoutCustomerParams } from "@/functions/stripe/get-checkout-customer-params";

export function getCheckoutSessionParams(
  attempt: CheckoutAttempt
): Stripe.Checkout.SessionCreateParams {
  if (!isSupportedLocale(attempt.checkoutLocale)) {
    throw new Error(`Unsupported checkout locale: ${attempt.checkoutLocale}`);
  }

  const metadata = {
    [CHECKOUT_ATTEMPT_METADATA_KEY]: attempt.id,
    [CHECKOUT_LEGAL_METADATA.version]: attempt.legalTermsVersion,
    [CHECKOUT_LEGAL_METADATA.locale]: attempt.checkoutLocale,
    [CHECKOUT_LEGAL_METADATA.consentedAt]: attempt.consentedAt.toISOString(),
    [CHECKOUT_LEGAL_METADATA.terms]: "true",
    [CHECKOUT_LEGAL_METADATA.immediateAccess]: "true",
    [CHECKOUT_LEGAL_METADATA.withdrawalWaiver]: "true",
    amountTotal: String(attempt.amountTotal),
    courseId: attempt.courseId,
    userId: attempt.userId,
  };

  return {
    mode: "payment",
    locale: attempt.checkoutLocale,
    client_reference_id: attempt.userId,
    ...getCheckoutCustomerParams({
      email: attempt.customerEmail,
      stripeCustomerId: attempt.stripeCustomerId,
    }),
    line_items: [
      {
        price_data: {
          currency: attempt.currency,
          product_data: {
            name: attempt.courseTitle,
            description:
              attempt.courseDescription?.slice(0, 500) || undefined,
          },
          unit_amount: attempt.amountTotal,
        },
        quantity: 1,
      },
    ],
    success_url: attempt.successUrl,
    cancel_url: attempt.cancelUrl,
    metadata,
    payment_intent_data: { metadata },
  };
}
