"use server";

import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getLocalizedPath } from "@/functions/i18n/get-localized-path";
import { getCheckoutCustomerParams } from "@/functions/stripe/get-checkout-customer-params";
import { getAppUrl } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { getStripe } from "@/lib/stripe";

export async function createCheckoutSession(courseId: string) {
  const safeCourseId = z.string().min(1).max(128).parse(courseId);
  const locale = await getLocale();
  const session = await requireAuth();
  const userId = session.user.id;

  const [user, course, existingPurchase] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, stripeCustomerId: true },
    }),
    prisma.course.findUnique({ where: { id: safeCourseId } }),
    prisma.purchase.findUnique({
      where: { userId_courseId: { userId, courseId: safeCourseId } },
      select: { id: true },
    }),
  ]);

  if (!user) redirect(getLocalizedPath(locale, "/login"));
  if (!course) throw new Error("Corso non trovato");
  if (existingPurchase) {
    redirect(getLocalizedPath(locale, `/profile/courses/${course.id}`));
  }

  const appUrl = getAppUrl();
  const checkoutSession = await getStripe().checkout.sessions.create(
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
      metadata: {
        userId,
        courseId: course.id,
        amountTotal: String(course.price),
      },
    },
    {
      idempotencyKey: `checkout:${userId}:${course.id}:${Math.floor(Date.now() / 60_000)}`,
    }
  );

  if (!checkoutSession.url) {
    throw new Error("Stripe non ha restituito l’indirizzo del checkout");
  }

  redirect(checkoutSession.url);
}
