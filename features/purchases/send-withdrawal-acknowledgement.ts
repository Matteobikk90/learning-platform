import "server-only";

import { DEFAULT_LOCALE } from "@/constants/i18n";
import { getWithdrawalAcknowledgementEmail } from "@/functions/email/get-withdrawal-acknowledgement-email";
import { isSupportedLocale } from "@/functions/i18n/is-supported-locale";
import { getAppUrl, requireEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { getResend } from "@/lib/resend";

export async function sendWithdrawalAcknowledgement(purchaseId: string) {
  const purchase = await prisma.purchase.findUnique({
    where: { id: purchaseId },
    select: {
      id: true,
      checkoutLocale: true,
      withdrawalRequestedAt: true,
      withdrawalRequesterName: true,
      withdrawalRequesterEmail: true,
      withdrawalAcknowledgementSentAt: true,
      course: { select: { title: true } },
    },
  });

  if (!purchase || purchase.withdrawalAcknowledgementSentAt) return false;

  if (!purchase.withdrawalRequestedAt) return false;

  if (
    !purchase.withdrawalRequesterName ||
    !purchase.withdrawalRequesterEmail
  ) {
    throw new Error(`Purchase ${purchaseId} has no withdrawal declaration`);
  }

  const storedLocale = purchase.checkoutLocale;
  const checkoutLocale =
    storedLocale && isSupportedLocale(storedLocale)
      ? storedLocale
      : DEFAULT_LOCALE;
  const message = getWithdrawalAcknowledgementEmail({
    appUrl: getAppUrl(),
    checkoutLocale,
    courseTitle: purchase.course.title,
    purchaseId: purchase.id,
    requestedAt: purchase.withdrawalRequestedAt,
    requesterName: purchase.withdrawalRequesterName,
  });
  const { error } = await getResend().emails.send(
    {
      from: requireEnv("EMAIL_FROM"),
      to: purchase.withdrawalRequesterEmail,
      ...message,
    },
    { idempotencyKey: `withdrawal-acknowledgement-${purchase.id}` }
  );

  if (error) {
    throw new Error(
      `Unable to send withdrawal acknowledgement: ${error.message}`
    );
  }

  await prisma.purchase.updateMany({
    where: { id: purchase.id, withdrawalAcknowledgementSentAt: null },
    data: { withdrawalAcknowledgementSentAt: new Date() },
  });

  return true;
}
