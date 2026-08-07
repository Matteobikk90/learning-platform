import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { getLocale, getTranslations } from "next-intl/server";

export default async function AdminPage() {
  await requireAdmin();
  const [locale, t] = await Promise.all([
    getLocale(),
    getTranslations("Admin"),
  ]);

  const [courses, modules, users, purchases] = await Promise.all([
    prisma.course.count(),
    prisma.module.count(),
    prisma.user.count(),
    prisma.purchase.aggregate({
      _count: { id: true },
      _sum: { amountTotal: true, amountRefunded: true },
    }),
  ]);

  const refunded = purchases._sum.amountRefunded ?? 0;
  const revenue = (purchases._sum.amountTotal ?? 0) - refunded;
  const currencyFormatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
  });

  const stats = [
    { label: t("courses"), value: courses },
    { label: t("modules"), value: modules },
    { label: t("users"), value: users },
    { label: t("purchases"), value: purchases._count.id },
    {
      label: t("revenue"),
      value: currencyFormatter.format(revenue / 100),
    },
    {
      label: t("refundedTotal"),
      value: currencyFormatter.format(refunded / 100),
    },
  ];

  return (
    <main className="mx-auto max-w-5xl px-6 py-14">
      <div className="mb-10">
        <span className="label-upper">{t("dashboard")}</span>
        <h1 className="page-title">{t("administration")}</h1>
        <p className="text-sm text-muted">{t("dashboardDescription")}</p>
      </div>

      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map(({ label, value }) => (
          <div
            key={label}
            className="bg-surface border border-stroke rounded-xl p-5">
            <p className="font-mono text-[0.7rem] tracking-[0.2em] uppercase text-muted mb-2">
              {label}
            </p>
            <p className="font-display text-[1.75rem] font-medium text-white leading-none">
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="card">
        <Link
          href="/admin/courses"
          className="list-row no-underline transition-colors hover:bg-white/5">
          <div>
            <h2 className="list-row-title mb-0.5">{t("courses")}</h2>
            <p className="text-sm text-muted">{t("coursesDescription")}</p>
          </div>
          <span className="btn-secondary pointer-events-none">
            {t("manage")}
          </span>
        </Link>

        <Link
          href="/admin/users"
          className="list-row no-underline transition-colors hover:bg-white/5">
          <div>
            <h2 className="list-row-title mb-0.5">{t("users")}</h2>
            <p className="text-sm text-muted">{t("usersDescription")}</p>
          </div>
          <span className="btn-secondary pointer-events-none">
            {t("view")}
          </span>
        </Link>

        <Link
          href="/admin/purchases"
          className="list-row no-underline transition-colors hover:bg-white/5">
          <div>
            <h2 className="list-row-title mb-0.5">{t("purchases")}</h2>
            <p className="text-sm text-muted">{t("salesDescription")}</p>
          </div>
          <span className="btn-secondary pointer-events-none">
            {t("view")}
          </span>
        </Link>
      </div>
    </main>
  );
}
