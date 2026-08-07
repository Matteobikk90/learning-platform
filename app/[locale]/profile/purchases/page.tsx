import { PurchaseHistory } from "@/components/profile/purchase-history";
import { getLocalizedPath } from "@/functions/i18n/get-localized-path";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { requireLearner } from "@/lib/session";
import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

export default async function ProfilePurchasesPage() {
  const session = await requireLearner();
  const [locale, t, user] = await Promise.all([
    getLocale(),
    getTranslations("Profile"),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        email: true,
        name: true,
        purchases: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            amountRefunded: true,
            amountTotal: true,
            createdAt: true,
            currency: true,
            refundedAt: true,
            withdrawalRequestedAt: true,
            withdrawalWaiverAcknowledgedAt: true,
            course: { select: { title: true } },
          },
        },
      },
    }),
  ]);

  if (!user) redirect(getLocalizedPath(locale, "/login"));

  return (
    <main className="mx-auto max-w-5xl px-6 py-14">
      <Link href="/profile" className="back-link">
        ← {t("back")}
      </Link>

      <div className="mb-10">
        <span className="label-upper">{t("purchasesEyebrow")}</span>
        <h1 className="page-title">{t("purchasesTitle")}</h1>
        <p className="text-sm text-muted">{t("purchasesDescription")}</p>
      </div>

      <div className="card">
        {user.purchases.length === 0 ? (
          <div className="list-empty">
            <p className="mb-1 font-display text-xl">
              {t("noPurchaseHistory")}
            </p>
            <p className="text-sm">{t("noPurchaseHistoryDescription")}</p>
          </div>
        ) : (
          <PurchaseHistory
            email={user.email}
            locale={locale}
            name={user.name ?? ""}
            purchases={user.purchases}
          />
        )}
      </div>
    </main>
  );
}
