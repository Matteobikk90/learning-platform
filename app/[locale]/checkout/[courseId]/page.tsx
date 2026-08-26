import { notFound, redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";

import { CheckoutConsentForm } from "@/components/checkout-consent-form";
import { ACTIVE_PURCHASE_FILTER } from "@/constants/purchases";
import { createCheckoutSession } from "@/features/courses/checkout";
import { formatCoursePrice } from "@/functions/courses/format-course-price";
import { getPublishedCourse } from "@/functions/courses/get-published-course";
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

  if (session.user.role === "ADMIN") {
    redirect(getLocalizedPath(locale, "/admin/courses"));
  }

  const [course, existingPurchase] = await Promise.all([
    getPublishedCourse(courseId),
    prisma.purchase.findFirst({
      where: {
        ...ACTIVE_PURCHASE_FILTER,
        userId: session.user.id,
        courseId,
      },
      select: { id: true },
    }),
  ]);

  if (existingPurchase) {
    redirect(getLocalizedPath(locale, `/profile/courses/${courseId}`));
  }

  if (!course) notFound();

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
            {formatCoursePrice(course.price, locale)}
          </strong>
        </div>

        <CheckoutConsentForm
          action={createCheckoutSession.bind(null, course.id)}
        />

        <p className="mt-4 text-center text-xs leading-relaxed text-subtle">
          {t("secureCheckout")}
        </p>
      </div>
    </main>
  );
}
