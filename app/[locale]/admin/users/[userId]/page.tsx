import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { z } from "zod";

import { AdminUserCoursesList } from "@/components/admin/user-courses-list";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import type { AdminUserRouteProps } from "@/types/routes";

export default async function AdminUserPage({ params }: AdminUserRouteProps) {
  await requireAdmin();
  const [{ userId: rawUserId }, locale, t] = await Promise.all([
    params,
    getLocale(),
    getTranslations("Admin"),
  ]);
  const parsedUserId = z.string().min(1).max(128).safeParse(rawUserId);

  if (!parsedUserId.success) notFound();

  const userId = parsedUserId.data;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      role: true,
      createdAt: true,
      stripeCustomerId: true,
      purchases: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          createdAt: true,
          amountTotal: true,
          currency: true,
          course: {
            select: {
              id: true,
              title: true,
              modules: {
                orderBy: { order: "asc" },
                select: {
                  id: true,
                  progress: {
                    where: { userId },
                    select: { completedAt: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) notFound();

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "long",
    timeStyle: "short",
  });

  return (
    <main className="mx-auto max-w-5xl px-6 py-14">
      <Link href="/admin/users" className="back-link">
        ← {t("users")}
      </Link>

      <div className="mb-10">
        <span className="label-upper">{t("userDetails")}</span>
        <h1 className="page-title break-words">{user.name ?? user.email}</h1>
        <p className="text-sm text-muted">{t("userDetailsDescription")}</p>
      </div>

      <section className="card mb-8 p-7 sm:p-8" aria-labelledby="account-title">
        <h2 id="account-title" className="mb-6 font-display text-2xl text-white">
          {t("account")}
        </h2>
        <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <div>
            <dt className="form-label">{t("email")}</dt>
            <dd className="break-all text-sm text-white">{user.email}</dd>
          </div>
          <div>
            <dt className="form-label">{t("role")}</dt>
            <dd className="text-sm text-white">
              {t(user.role === "ADMIN" ? "administrator" : "student")}
            </dd>
          </div>
          <div>
            <dt className="form-label">{t("registeredOn")}</dt>
            <dd className="text-sm text-white">
              <time dateTime={user.createdAt.toISOString()}>
                {dateFormatter.format(user.createdAt)}
              </time>
            </dd>
          </div>
          <div>
            <dt className="form-label">{t("emailVerification")}</dt>
            <dd className="text-sm text-white">
              {user.emailVerified ? (
                <time dateTime={user.emailVerified.toISOString()}>
                  {t("verifiedOn", {
                    date: dateFormatter.format(user.emailVerified),
                  })}
                </time>
              ) : (
                t("pendingVerification")
              )}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="form-label">{t("stripeCustomer")}</dt>
            <dd className="break-all font-mono text-xs text-muted">
              {user.stripeCustomerId ?? t("notAvailable")}
            </dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="courses-title">
        <div className="mb-5">
          <h2 id="courses-title" className="font-display text-3xl text-white">
            {t("purchasedCourses")}
          </h2>
          <p className="mt-2 text-sm text-muted">
            {t("userCoursesDescription")}
          </p>
        </div>

        <div className="card">
          {user.purchases.length === 0 ? (
            <div className="list-empty">
              <p className="font-display mb-1 text-xl">
                {t("noUserPurchases")}
              </p>
              <p className="text-sm">{t("noUserPurchasesDescription")}</p>
            </div>
          ) : (
            <AdminUserCoursesList
              locale={locale}
              purchases={user.purchases}
            />
          )}
        </div>
      </section>
    </main>
  );
}
