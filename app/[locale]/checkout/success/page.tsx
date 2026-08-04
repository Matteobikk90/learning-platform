import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { fulfillCheckoutSession } from "@/features/courses/fulfillment";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { getStripe } from "@/lib/stripe";
import type { CheckoutSuccessRouteProps } from "@/types/routes";

export default async function CheckoutSuccessPage({
  searchParams,
}: CheckoutSuccessRouteProps) {
  const t = await getTranslations("Checkout");
  const userSession = await requireAuth();
  const { session_id: sessionId } = await searchParams;

  if (!sessionId) notFound();

  const checkoutSession = await getStripe()
    .checkout.sessions.retrieve(sessionId)
    .catch(() => null);

  if (
    !checkoutSession ||
    checkoutSession.metadata?.userId !== userSession.user.id
  ) {
    notFound();
  }

  const fulfillment = await fulfillCheckoutSession(checkoutSession);
  const course = checkoutSession.metadata?.courseId
    ? await prisma.course.findUnique({
        where: { id: checkoutSession.metadata.courseId },
        select: { id: true, title: true },
      })
    : null;

  const isReady = Boolean(fulfillment && course);

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
      <div className="card w-full px-10 py-14">
        <p className="label-upper">
          {isReady ? t("completed") : t("processing")}
        </p>

        <h1 className="font-display mt-4 text-5xl text-white">
          {isReady ? t("thankYou") : t("almostThere")}
        </h1>

        <p className="mt-6 text-muted">
          {isReady
            ? t("purchasedCourse", { title: course?.title ?? "" })
            : t("processingDescription")}
        </p>

        <div className="mt-10 flex justify-center">
          {isReady && course ? (
            <Link
              href={`/profile/courses/${course.id}`}
              className="btn-primary">
              {t("goToCourse")}
            </Link>
          ) : (
            <Link href="/profile" className="btn-primary">
              {t("goToProfile")}
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
