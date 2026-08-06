import { notFound, redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";

import { SubmitButton } from "@/components/submit-button";
import { createCheckoutSession } from "@/features/courses/checkout";
import { getLocalizedPath } from "@/functions/i18n/get-localized-path";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { getAppSession } from "@/lib/session";
import type { CheckoutCourseRouteProps } from "@/types/routes";

export default async function CourseCheckoutPage({
  params,
}: CheckoutCourseRouteProps) {
  const [{ courseId }, locale, session, t] = await Promise.all([
    params,
    getLocale(),
    getAppSession(),
    getTranslations("Checkout"),
  ]);
  const callbackUrl = getLocalizedPath(locale, `/checkout/${courseId}`);

  if (!session?.user.id) {
    const loginUrl = getLocalizedPath(locale, "/login");
    redirect(`${loginUrl}?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  const [course, existingPurchase] = await Promise.all([
    prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true, description: true, price: true },
    }),
    prisma.purchase.findUnique({
      where: {
        userId_courseId: { userId: session.user.id, courseId },
      },
      select: { id: true },
    }),
  ]);

  if (!course) notFound();

  if (existingPurchase) {
    redirect(getLocalizedPath(locale, `/profile/courses/${course.id}`));
  }

  return (
    <main className="mx-auto flex min-h-[75vh] max-w-2xl flex-col justify-center px-6 py-16">
      <Link href="/#corsi" className="back-link">
        ← {t("backToCourses")}
      </Link>

      <div className="mb-10">
        <span className="label-upper">{t("reviewEyebrow")}</span>
        <h1 className="page-title">{t("reviewTitle")}</h1>
        <p className="text-sm leading-relaxed text-muted">
          {t("reviewDescription")}
        </p>
      </div>

      <div className="card p-8 sm:p-10">
        <h2 className="font-display text-3xl text-white">{course.title}</h2>
        {course.description && (
          <p className="mt-3 leading-relaxed text-muted">{course.description}</p>
        )}

        <div className="my-8 flex items-center justify-between border-y border-stroke py-5">
          <span className="font-mono text-xs uppercase tracking-widest text-muted">
            {t("total")}
          </span>
          <strong className="font-display text-2xl font-medium text-white">
            €{(course.price / 100).toFixed(2)}
          </strong>
        </div>

        <form action={createCheckoutSession.bind(null, course.id)}>
          <SubmitButton
            pendingLabel={t("openingCheckout")}
            className="btn-primary w-full">
            {t("continueToPayment")}
          </SubmitButton>
        </form>

        <p className="mt-4 text-center text-xs leading-relaxed text-subtle">
          {t("secureCheckout")}
        </p>
      </div>
    </main>
  );
}
