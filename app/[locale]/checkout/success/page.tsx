import { CheckoutProcessing } from "@/components/checkout-processing";
import { tryFulfillCheckoutSession } from "@/features/courses/try-fulfill-checkout";
import { getCheckoutViewState } from "@/functions/checkout/get-checkout-view-state";
import { normalizeCheckoutSessionId } from "@/functions/checkout/normalize-checkout-session-id";
import { isStripeNotFoundError } from "@/functions/stripe/is-stripe-not-found-error";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { getStripe } from "@/lib/stripe";
import type { CheckoutSuccessRouteProps } from "@/types/routes";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import type Stripe from "stripe";

export default async function CheckoutSuccessPage({
  searchParams,
}: CheckoutSuccessRouteProps) {
  const t = await getTranslations("Checkout");
  const userSession = await requireAuth();
  const { session_id: rawSessionId } = await searchParams;
  const sessionId = normalizeCheckoutSessionId(rawSessionId);

  if (!sessionId) notFound();

  let checkoutSession: Stripe.Checkout.Session | null = null;

  try {
    checkoutSession = await getStripe().checkout.sessions.retrieve(sessionId);
  } catch (error) {
    if (isStripeNotFoundError(error)) notFound();

    console.error("[stripe] Checkout session retrieve failed", {
      sessionId,
      error,
    });
  }

  if (
    checkoutSession &&
    checkoutSession.metadata?.userId !== userSession.user.id
  ) {
    notFound();
  }

  const fulfillment = checkoutSession
    ? await tryFulfillCheckoutSession(checkoutSession)
    : null;
  const course = checkoutSession?.metadata?.courseId
    ? await prisma.course.findUnique({
        where: { id: checkoutSession.metadata.courseId },
        select: { id: true, title: true },
      })
    : null;

  const state = getCheckoutViewState({
    isFulfilled: Boolean(fulfillment && course),
    sessionStatus: checkoutSession?.status ?? null,
  });

  const copy = {
    ready: {
      eyebrow: t("completed"),
      title: t("thankYou"),
      description: t("purchasedCourse", { title: course?.title ?? "" }),
    },
    processing: {
      eyebrow: t("processing"),
      title: t("almostThere"),
      description: t("processingDescription"),
    },
    notCompleted: {
      eyebrow: t("notCompleted"),
      title: t("notCompletedTitle"),
      description: t("notCompletedDescription"),
    },
  }[state];

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
      <div className="card w-full px-10 py-14">
        <p className="label-upper">{copy.eyebrow}</p>

        <h1 className="font-display mt-4 text-5xl text-white">{copy.title}</h1>

        <p className="mt-6 text-muted">{copy.description}</p>

        {state === "processing" && <CheckoutProcessing sessionId={sessionId} />}

        <div className="mt-10 flex justify-center">
          {state === "ready" && course ? (
            <Link
              href={`/profile/courses/${course.id}`}
              className="btn-primary">
              {t("goToCourse")}
            </Link>
          ) : state === "notCompleted" ? (
            <Link href="/" className="btn-primary">
              {t("backToCourses")}
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
