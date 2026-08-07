"use server";

import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  CHECKOUT_CONSENT_FIELDS,
  CHECKOUT_LEGAL_METADATA,
  LEGAL_DOCUMENT_VERSION,
} from "@/constants/legal";
import { ACTIVE_PURCHASE_FILTER } from "@/constants/purchases";
import { checkoutConsentSchema } from "@/features/courses/checkout-schema";
import { getPublishedCourse } from "@/functions/courses/get-published-course";
import { getLocalizedPath } from "@/functions/i18n/get-localized-path";
import { getCheckoutCustomerParams } from "@/functions/stripe/get-checkout-customer-params";
import { getAppUrl } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { getStripe } from "@/lib/stripe";
import type { FormState } from "@/types/forms";

export async function createCheckoutSession(
  courseId: string,
  _previousState: FormState,
  formData: FormData
): Promise<FormState> {
  const safeCourseId = z.string().min(1).max(128).parse(courseId);
  const [locale, session, t] = await Promise.all([
    getLocale(),
    requireAuth(),
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

  const appUrl = getAppUrl();
  const consentedAt = new Date();
  const legalMetadata = {
    [CHECKOUT_LEGAL_METADATA.version]: LEGAL_DOCUMENT_VERSION,
    [CHECKOUT_LEGAL_METADATA.locale]: locale,
    [CHECKOUT_LEGAL_METADATA.consentedAt]: consentedAt.toISOString(),
    [CHECKOUT_LEGAL_METADATA.terms]: "true",
    [CHECKOUT_LEGAL_METADATA.immediateAccess]: "true",
    [CHECKOUT_LEGAL_METADATA.withdrawalWaiver]: "true",
  };
  const checkoutMetadata = {
    userId,
    courseId: course.id,
    amountTotal: String(course.price),
    ...legalMetadata,
  };
  let checkoutSession;

  try {
    checkoutSession = await getStripe().checkout.sessions.create(
      {
        mode: "payment",
        locale,
        client_reference_id: userId,
        ...getCheckoutCustomerParams(user),
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: course.title,
                description: course.description?.slice(0, 500) || undefined,
              },
              unit_amount: course.price,
            },
            quantity: 1,
          },
        ],
        success_url: `${appUrl}/${locale}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/${locale}/checkout/cancel`,
        metadata: checkoutMetadata,
        payment_intent_data: {
          metadata: checkoutMetadata,
        },
      },
      {
        idempotencyKey: `checkout:${userId}:${course.id}:${consentedAt.getTime()}`,
      }
    );
  } catch (error) {
    console.error("[stripe] Checkout session creation failed", {
      userId,
      courseId: course.id,
      error,
    });
    return { error: t("checkoutUnavailable") };
  }

  if (!checkoutSession.url) {
    return { error: t("checkoutUnavailable") };
  }

  redirect(checkoutSession.url);
}
