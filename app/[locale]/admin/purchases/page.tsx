import { AdminPagination } from "@/components/admin/pagination";
import { AdminPurchasesList } from "@/components/admin/purchases-list";
import { ADMIN_PURCHASES_PAGE_SIZE } from "@/constants/admin";
import { getAdminPagination } from "@/functions/admin/get-admin-pagination";
import { normalizeAdminPage } from "@/functions/admin/normalize-admin-page";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import type { AdminPurchasesRouteProps } from "@/types/routes";
import { getLocale, getTranslations } from "next-intl/server";

export default async function AdminPurchasesPage({
  searchParams,
}: AdminPurchasesRouteProps) {
  await requireAdmin();
  const [{ page: rawPage }, locale, t] = await Promise.all([
    searchParams,
    getLocale(),
    getTranslations("Admin"),
  ]);
  const requestedPage = normalizeAdminPage(rawPage);
  const purchaseCount = await prisma.purchase.count();
  const { currentPage, skip, totalPages } = getAdminPagination({
    itemCount: purchaseCount,
    pageSize: ADMIN_PURCHASES_PAGE_SIZE,
    requestedPage,
  });
  const purchases = await prisma.purchase.findMany({
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip,
    take: ADMIN_PURCHASES_PAGE_SIZE,
    select: {
      id: true,
      createdAt: true,
      amountTotal: true,
      amountRefunded: true,
      currency: true,
      refundedAt: true,
      stripeCheckoutSessionId: true,
      withdrawalAcknowledgementSentAt: true,
      withdrawalRequestedAt: true,
      user: { select: { name: true, email: true } },
      course: { select: { title: true } },
    },
  });

  return (
    <main className="mx-auto max-w-7xl px-6 py-14">
      <Link href="/admin" className="back-link">
        ← {t("dashboard")}
      </Link>

      <div className="mb-10">
        <span className="label-upper">{t("salesEyebrow")}</span>
        <h1 className="page-title">{t("salesTitle")}</h1>
        <p className="text-sm text-muted">{t("salesDescription")}</p>
      </div>

      <div className="card">
        {purchases.length === 0 ? (
          <div className="list-empty">
            <p className="font-display mb-1 text-xl">{t("noPurchases")}</p>
            <p className="text-sm">{t("noPurchasesDescription")}</p>
          </div>
        ) : (
          <AdminPurchasesList
            purchases={purchases}
            locale={locale}
            labels={{
              customer: t("customer"),
              confirmationEmailPending: t("confirmationEmailPending"),
              course: t("course"),
              amount: t("amount"),
              paymentStatus: t("paymentStatus"),
              paid: t("paid"),
              partiallyRefunded: t("partiallyRefunded"),
              withdrawalRequested: t("withdrawalRequested"),
              refunded: t("refunded"),
              refundedAmount: t("refundedAmount"),
              date: t("purchaseDate"),
              stripeSession: t("stripeSession"),
            }}
          />
        )}
      </div>

      <AdminPagination
        basePath="/admin/purchases"
        currentPage={currentPage}
        totalPages={totalPages}
        previousLabel={t("previousPage")}
        nextLabel={t("nextPage")}
        pageLabel={t("pageOf", { current: currentPage, total: totalPages })}
      />
    </main>
  );
}
