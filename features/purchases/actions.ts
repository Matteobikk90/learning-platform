"use server";

import { revalidatePath } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";

import { WITHDRAWAL_PERIOD_DAYS } from "@/constants/legal";
import { WITHDRAWAL_REQUEST_FIELDS } from "@/constants/profile";
import { initiateWithdrawalRefund } from "@/features/purchases/initiate-withdrawal-refund";
import { sendWithdrawalAcknowledgement } from "@/features/purchases/send-withdrawal-acknowledgement";
import { withdrawalRequestSchema } from "@/features/purchases/withdrawal-schema";
import { getLocalizedPath } from "@/functions/i18n/get-localized-path";
import { getWithdrawalStatus } from "@/functions/purchases/get-withdrawal-status";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import type { FormState } from "@/types/forms";

const WITHDRAWAL_PERIOD_MS =
  WITHDRAWAL_PERIOD_DAYS * 24 * 60 * 60 * 1000;

export async function requestWithdrawal(
  _previousState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await requireAuth();
  const [locale, t] = await Promise.all([
    getLocale(),
    getTranslations("Profile"),
  ]);
  const parsed = withdrawalRequestSchema.safeParse({
    purchaseId: formData.get(WITHDRAWAL_REQUEST_FIELDS.purchaseId),
    requesterName: formData.get(WITHDRAWAL_REQUEST_FIELDS.requesterName),
    withdrawalConfirmed: formData.get(WITHDRAWAL_REQUEST_FIELDS.confirmed),
  });

  if (!parsed.success) {
    return { error: t("withdrawalInvalidRequest") };
  }

  const purchase = await prisma.purchase.findFirst({
    where: { id: parsed.data.purchaseId, userId: session.user.id },
    select: {
      id: true,
      createdAt: true,
      refundedAt: true,
      withdrawalRequestedAt: true,
      withdrawalWaiverAcknowledgedAt: true,
    },
  });

  if (!purchase) {
    return { error: t("withdrawalPurchaseNotFound") };
  }

  const now = new Date();
  const status = getWithdrawalStatus(purchase, now);

  if (status !== "available" && status !== "requested") {
    return { error: t(`withdrawalUnavailable.${status}`) };
  }

  if (status === "available") {
    const result = await prisma.purchase.updateMany({
      where: {
        id: purchase.id,
        userId: session.user.id,
        createdAt: { gte: new Date(now.getTime() - WITHDRAWAL_PERIOD_MS) },
        refundedAt: null,
        withdrawalRequestedAt: null,
        withdrawalWaiverAcknowledgedAt: null,
      },
      data: {
        withdrawalRequestedAt: now,
        withdrawalRequesterName: parsed.data.requesterName,
        withdrawalRequesterEmail: session.user.email,
      },
    });

    if (result.count !== 1) {
      return { error: t("withdrawalStateChanged") };
    }
  }

  const [acknowledgement, refund] = await Promise.allSettled([
    sendWithdrawalAcknowledgement(purchase.id),
    initiateWithdrawalRefund(purchase.id),
  ]);

  if (acknowledgement.status === "rejected") {
    console.error("[email] Withdrawal acknowledgement failed", {
      purchaseId: purchase.id,
      error: acknowledgement.reason,
    });
  }

  if (refund.status === "rejected") {
    console.error("[stripe] Online withdrawal refund failed", {
      purchaseId: purchase.id,
      error: refund.reason,
    });
  }

  revalidatePath(getLocalizedPath(locale, "/profile"));
  revalidatePath(getLocalizedPath(locale, "/profile/purchases"));

  return {
    error: null,
    success:
      acknowledgement.status === "fulfilled" && refund.status === "fulfilled"
        ? t("withdrawalRequestSubmitted")
        : t("withdrawalRequestRecorded"),
  };
}
