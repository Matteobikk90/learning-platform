import "server-only";

import { DEFAULT_LOCALE } from "@/constants/i18n";
import { getPurchaseConfirmationEmail } from "@/functions/email/get-purchase-confirmation-email";
import { isSupportedLocale } from "@/functions/i18n/is-supported-locale";
import { getPurchaseLegalSnapshot } from "@/functions/legal/get-purchase-legal-snapshot";
import { getAppUrl, requireEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { getResend } from "@/lib/resend";

export async function sendPurchaseConfirmation(purchaseId: string) {
  const purchase = await prisma.purchase.findUnique({
    where: { id: purchaseId },
    select: {
      id: true,
      createdAt: true,
      amountTotal: true,
      currency: true,
      checkoutLocale: true,
      legalTermsVersion: true,
      termsAcceptedAt: true,
      immediateAccessConsentAt: true,
      withdrawalWaiverAcknowledgedAt: true,
      purchaseConfirmationSentAt: true,
      user: { select: { email: true } },
      course: { select: { title: true } },
    },
  });

  if (!purchase || purchase.purchaseConfirmationSentAt) return false;

  const storedLocale = purchase.checkoutLocale;
  const checkoutLocale =
    storedLocale && isSupportedLocale(storedLocale)
      ? storedLocale
      : DEFAULT_LOCALE;
  const message = getPurchaseConfirmationEmail({
    amountTotal: purchase.amountTotal,
    appUrl: getAppUrl(),
    checkoutLocale,
    courseTitle: purchase.course.title,
    currency: purchase.currency,
    immediateAccessConsentAt: purchase.immediateAccessConsentAt,
    legalSections: getPurchaseLegalSnapshot(checkoutLocale),
    legalTermsVersion: purchase.legalTermsVersion,
    purchaseId: purchase.id,
    purchasedAt: purchase.createdAt,
    termsAcceptedAt: purchase.termsAcceptedAt,
    withdrawalWaiverAcknowledgedAt:
      purchase.withdrawalWaiverAcknowledgedAt,
  });
  const { error } = await getResend().emails.send(
    {
      from: requireEnv("EMAIL_FROM"),
      to: purchase.user.email,
      ...message,
    },
    { idempotencyKey: `purchase-confirmation-${purchase.id}` }
  );

  if (error) {
    throw new Error(`Unable to send purchase confirmation: ${error.message}`);
  }

  await prisma.purchase.updateMany({
    where: { id: purchase.id, purchaseConfirmationSentAt: null },
    data: { purchaseConfirmationSentAt: new Date() },
  });

  return true;
}
