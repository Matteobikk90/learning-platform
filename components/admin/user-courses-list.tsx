import { getTranslations } from "next-intl/server";

import { formatPurchaseAmount } from "@/functions/admin/format-purchase-amount";
import { getPurchaseRefundStatus } from "@/functions/purchases/get-purchase-refund-status";
import { Link } from "@/i18n/navigation";
import { getCourseProgress } from "@/lib/course-progress";
import type { AdminUserCoursesListProps } from "@/types/admin";

export async function AdminUserCoursesList({
  locale,
  purchases,
}: AdminUserCoursesListProps) {
  const [tAdmin, tProfile] = await Promise.all([
    getTranslations("Admin"),
    getTranslations("Profile"),
  ]);
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
  });

  return purchases.map((purchase) => {
    const progress = getCourseProgress(purchase.course.modules);
    const status = getPurchaseRefundStatus(purchase);

    return (
      <article
        key={purchase.id}
        className="border-b border-stroke px-6 py-6 last:border-0 sm:px-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="font-display text-xl text-white">
                {purchase.course.title}
              </h3>
              <span className="inline-flex rounded-full border border-stroke px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-muted">
                {tAdmin(status)}
              </span>
            </div>
            {purchase.withdrawalRequestedAt &&
              !purchase.withdrawalAcknowledgementSentAt && (
                <p className="mt-2 text-xs text-danger">
                  {tAdmin("confirmationEmailPending")}
                </p>
              )}
            <p className="mt-2 text-sm text-muted">
              {tAdmin("purchaseSummary", {
                amount: formatPurchaseAmount({
                  amountTotal: purchase.amountTotal,
                  currency: purchase.currency,
                  locale,
                }),
                date: dateFormatter.format(purchase.createdAt),
              })}
            </p>
            {purchase.amountRefunded > 0 && (
              <p className="mt-1 font-mono text-[0.65rem] text-subtle">
                −{formatPurchaseAmount({
                  amountTotal: purchase.amountRefunded,
                  currency: purchase.currency,
                  locale,
                })} {tAdmin("refundedAmount")}
              </p>
            )}
            <p className="mt-3 text-sm text-muted">
              {tProfile("progress", {
                completed: progress.completedModules,
                total: progress.totalModules,
                percentage: progress.percentage,
              })}
            </p>
            <div className="mt-3 h-1 w-full max-w-64 overflow-hidden rounded-full bg-stroke">
              <div
                className="h-full rounded-full bg-petrol"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>

          <Link
            href={`/admin/courses/${purchase.course.id}/modules`}
            className="btn-secondary text-center no-underline">
            {tAdmin("manageCourse")}
          </Link>
        </div>
      </article>
    );
  });
}
