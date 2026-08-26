"use server";

import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  CHECKOUT_CONSENT_FIELDS,
  LEGAL_DOCUMENT_VERSION,
} from "@/constants/legal";
import { CHECKOUT_SESSION_ID_PLACEHOLDER } from "@/constants/checkout";
import { ACTIVE_PURCHASE_FILTER } from "@/constants/purchases";
import { checkoutConsentSchema } from "@/features/courses/checkout-schema";
import { openCheckoutAttempt } from "@/features/courses/open-checkout-attempt";
import { claimCheckoutAttempt } from "@/functions/checkout/claim-checkout-attempt";
import { getPublishedCourse } from "@/functions/courses/get-published-course";
import { getLocalizedPath } from "@/functions/i18n/get-localized-path";
import { prisma } from "@/lib/prisma";
import { getRequestAppUrl } from "@/lib/request-app-url";
import { requireLearner } from "@/lib/session";
import type { CheckoutAttemptClaim } from "@/types/checkout";
import type { FormState } from "@/types/forms";

export async function createCheckoutSession(
  courseId: string,
  _previousState: FormState,
  formData: FormData
): Promise<FormState> {
  const safeCourseId = z.string().min(1).max(128).parse(courseId);
  const [locale, session, t] = await Promise.all([
    getLocale(),
    requireLearner(),
    getTranslations("Checkout"),
  ]);
  const userId = session.user.id;
  const consent = checkoutConsentSchema.safeParse({
    termsAccepted: formData.get(CHECKOUT_CONSENT_FIELDS.terms),
    immediateAccessConsent: formData.get(
      CHECKOUT_CONSENT_FIELDS.immediateAccess
    ),
    withdrawalWaiverAcknowledged: formData.get(
      CHECKOUT_CONSENT_FIELDS.withdrawalWaiver
    ),
  });

  if (!consent.success) {
    return { error: t("consentRequired") };
  }

  const [user, course, existingPurchase] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, stripeCustomerId: true },
    }),
    getPublishedCourse(safeCourseId),
    prisma.purchase.findFirst({
      where: {
        ...ACTIVE_PURCHASE_FILTER,
        userId,
        courseId: safeCourseId,
      },
      select: { id: true },
    }),
  ]);

  if (!user) redirect(getLocalizedPath(locale, "/login"));
  if (existingPurchase) {
    redirect(getLocalizedPath(locale, `/profile/courses/${safeCourseId}`));
  }
  if (!course) {
    redirect(`${getLocalizedPath(locale, "/")}#corsi`);
  }

  const appUrl = await getRequestAppUrl();
  const consentedAt = new Date();
  let claim: CheckoutAttemptClaim;

  try {
    claim = await claimCheckoutAttempt({
      amountTotal: course.price,
      cancelUrl: `${appUrl}/${locale}/checkout/cancel`,
      checkoutLocale: locale,
      consentedAt,
      courseDescription: course.description,
      courseId: course.id,
      courseTitle: course.title,
      customerEmail: user.email,
      legalTermsVersion: LEGAL_DOCUMENT_VERSION,
      stripeCustomerId: user.stripeCustomerId,
      successUrl: `${appUrl}/${locale}/checkout/success?session_id=${CHECKOUT_SESSION_ID_PLACEHOLDER}`,
      userId,
    });
  } catch (error) {
    console.error("[checkout] Checkout attempt creation failed", {
      userId,
      courseId: course.id,
      error,
    });
    return { error: t("checkoutUnavailable") };
  }

  if (claim.kind === "owned") {
    redirect(getLocalizedPath(locale, `/profile/courses/${safeCourseId}`));
  }

  let checkoutUrl: string;

  try {
    checkoutUrl = await openCheckoutAttempt(claim.attempt);
  } catch (error) {
    console.error("[stripe] Checkout session creation failed", {
      userId,
      courseId: course.id,
      attemptId: claim.attempt.id,
      error,
    });
    return { error: t("checkoutUnavailable") };
  }

  redirect(checkoutUrl);
}
