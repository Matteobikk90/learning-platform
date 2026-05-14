"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { stripe } from "@/lib/stripe";
import { redirect } from "next/navigation";

export async function createCheckoutSession(courseId: string) {
  const session = await requireAuth();

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email!,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
  });

  if (!course) {
    throw new Error("Course not found");
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: user.email,
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: course.title,
            description: course.description ?? undefined,
          },
          unit_amount: course.price,
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/profile`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/`,
    metadata: {
      userId: user.id,
      courseId: course.id,
    },
  });

  if (!checkoutSession.url) {
    throw new Error("Checkout session URL not created");
  }

  redirect(checkoutSession.url);
}
