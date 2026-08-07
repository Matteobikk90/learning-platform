import { WithdrawalRequestForm } from "@/components/withdrawal-request-form";
import { LEGAL_PATHS } from "@/constants/legal";
import { formatPurchaseAmount } from "@/functions/admin/format-purchase-amount";
import { getPurchaseRefundStatus } from "@/functions/purchases/get-purchase-refund-status";
import { getWithdrawalDeadline } from "@/functions/purchases/get-withdrawal-deadline";
import { getWithdrawalStatus } from "@/functions/purchases/get-withdrawal-status";
import { Link } from "@/i18n/navigation";
import type { PurchaseHistoryProps } from "@/types/profile";
import { getTranslations } from "next-intl/server";

export async function PurchaseHistory({
  email,
  locale,
  name,
  purchases,
}: PurchaseHistoryProps) {
  const t = await getTranslations("Profile");
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return purchases.map((purchase) => {
    const paymentStatus = getPurchaseRefundStatus(purchase);
    const withdrawalStatus = getWithdrawalStatus(purchase);
    const deadline = getWithdrawalDeadline(purchase.createdAt);

    return (
      <article
        key={purchase.id}
        className="border-b border-stroke px-6 py-7 last:border-0 sm:px-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-display text-xl text-white">
                {purchase.course.title}
              </h2>
              <span className="inline-flex rounded-full border border-stroke px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-muted">
                {t(`purchaseStatus.${paymentStatus}`)}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted">
              {t("purchaseSummary", {
                amount: formatPurchaseAmount({
                  amountTotal: purchase.amountTotal,
                  currency: purchase.currency,
                  locale,
                }),
                date: dateFormatter.format(purchase.createdAt),
              })}
            </p>
            <p className="mt-1 break-all font-mono text-[0.65rem] text-subtle">
              {t("purchaseOrder", { id: purchase.id })}
            </p>
          </div>
          <Link
            href={LEGAL_PATHS.withdrawal}
            className="text-xs text-muted underline underline-offset-4">
            {t("withdrawalPolicyLink")}
          </Link>
        </div>

        <div className="mt-5 rounded-md border border-stroke bg-black/20 p-4 text-sm leading-relaxed text-muted">
          {withdrawalStatus === "available" && (
            <p>
              {t("withdrawalAvailable", {
                date: dateFormatter.format(deadline),
              })}
            </p>
          )}
          {withdrawalStatus === "waived" && <p>{t("withdrawalWaived")}</p>}
          {withdrawalStatus === "expired" && <p>{t("withdrawalExpired")}</p>}
          {withdrawalStatus === "requested" && (
            <p>
              {t("withdrawalRequested", {
                date: dateFormatter.format(purchase.withdrawalRequestedAt!),
              })}
            </p>
          )}
          {withdrawalStatus === "refunded" && (
            <p>{t("withdrawalRefunded")}</p>
          )}
        </div>

        {withdrawalStatus === "available" && (
          <WithdrawalRequestForm
            email={email}
            name={name}
            purchaseId={purchase.id}
          />
        )}
      </article>
    );
  });
}
