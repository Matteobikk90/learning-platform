"use server";

import { redirect } from "next/navigation";

import { getAppUrl } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { getStripe } from "@/lib/stripe";

export async function createCheckoutSession(courseId: string) {
  const session = await requireAuth();
  const userId = session.user.id;

  const [user, course, existingPurchase] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    }),
    prisma.course.findUnique({ where: { id: courseId } }),
    prisma.purchase.findUnique({
      where: { userId_courseId: { userId, courseId } },
      select: { id: true },
    }),
  ]);

  if (!user) redirect("/login");
  if (!course) throw new Error("Corso non trovato");
  if (existingPurchase) redirect(`/profile/courses/${course.id}`);

  const appUrl = getAppUrl();
  const checkoutSession = await getStripe().checkout.sessions.create({
    mode: "payment",
    locale: "it",
    client_reference_id: userId,
    customer_email: user.email,
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
    success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/checkout/cancel`,
    metadata: { userId, courseId: course.id },
  });

  if (!checkoutSession.url) {
    throw new Error("Stripe non ha restituito l’indirizzo del checkout");
  }

  redirect(checkoutSession.url);
}
