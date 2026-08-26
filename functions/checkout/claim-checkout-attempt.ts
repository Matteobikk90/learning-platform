import "server-only";

import { randomUUID } from "node:crypto";

import { Prisma } from "@prisma/client";

import {
  ACTIVE_CHECKOUT_ATTEMPT_STATUSES,
  CHECKOUT_CURRENCY,
} from "@/constants/checkout";
import { ACTIVE_PURCHASE_FILTER } from "@/constants/purchases";
import { prisma } from "@/lib/prisma";
import type {
  CheckoutAttemptClaim,
  CheckoutAttemptInput,
} from "@/types/checkout";

export async function claimCheckoutAttempt(
  input: CheckoutAttemptInput
): Promise<CheckoutAttemptClaim> {
  const activeKey = `checkout:${input.userId}:${input.courseId}`;

  while (true) {
    let attempt;

    try {
      attempt = await prisma.checkoutAttempt.create({
        data: {
          id: randomUUID(),
          activeKey,
          amountTotal: input.amountTotal,
          cancelUrl: input.cancelUrl,
          checkoutLocale: input.checkoutLocale,
          consentedAt: input.consentedAt,
          courseDescription: input.courseDescription,
          courseId: input.courseId,
          courseTitle: input.courseTitle,
          currency: CHECKOUT_CURRENCY,
          customerEmail: input.customerEmail,
          legalTermsVersion: input.legalTermsVersion,
          stripeCustomerId: input.stripeCustomerId,
          successUrl: input.successUrl,
          userId: input.userId,
        },
      });
    } catch (error) {
      if (!isUniqueConstraintError(error)) throw error;

      attempt = await prisma.checkoutAttempt.findUnique({
        where: { activeKey },
      });

      if (!attempt) continue;
    }

    const activePurchase = await prisma.purchase.findFirst({
      where: {
        ...ACTIVE_PURCHASE_FILTER,
        courseId: input.courseId,
        userId: input.userId,
      },
      select: { id: true },
    });

    if (activePurchase) {
      await prisma.checkoutAttempt.updateMany({
        where: { activeKey, id: attempt.id },
        data: { activeKey: null, status: "CANCELLED" },
      });

      return { kind: "owned" };
    }

    if (!ACTIVE_CHECKOUT_ATTEMPT_STATUSES.has(attempt.status)) {
      throw new Error(
        `Checkout attempt ${attempt.id} has an invalid active status`
      );
    }

    return { attempt, kind: "attempt" };
  }
}

function isUniqueConstraintError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}
