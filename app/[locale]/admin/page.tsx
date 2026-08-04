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
      _sum: { amountTotal: true },
    }),
  ]);

  const revenue = purchases._sum.amountTotal ?? 0;

  const stats = [
    { label: t("courses"), value: courses },
    { label: t("modules"), value: modules },
    { label: t("users"), value: users },
    { label: t("purchases"), value: purchases._count.id },
    {
      label: t("revenue"),
      value: new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "EUR",
      }).format(revenue / 100),
    },
  ];

  return (
    <main className="mx-auto max-w-5xl px-6 py-14">
      <div className="mb-10">
        <span className="label-upper">{t("dashboard")}</span>
        <h1 className="page-title">{t("administration")}</h1>
        <p className="text-sm text-muted">{t("dashboardDescription")}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
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
          className="list-row no-underline hover:bg-white/5 transition-colors">
          <div>
            <h2 className="list-row-title mb-0.5">{t("courses")}</h2>
            <p className="text-sm text-muted">{t("coursesDescription")}</p>
          </div>
          <span className="btn-secondary pointer-events-none">
            {t("manage")}
          </span>
        </Link>
      </div>
    </main>
  );
}
