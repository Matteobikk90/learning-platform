import { getLocale, getTranslations } from "next-intl/server";

import { AdminPagination } from "@/components/admin/pagination";
import { AdminUsersList } from "@/components/admin/users-list";
import {
  ADMIN_USERS_PAGE_SIZE,
  ADMIN_USER_SEARCH_MAX_LENGTH,
} from "@/constants/admin";
import { getAdminPagination } from "@/functions/admin/get-admin-pagination";
import { getAdminUserWhere } from "@/functions/admin/get-admin-user-where";
import { normalizeAdminPage } from "@/functions/admin/normalize-admin-page";
import { normalizeAdminSearch } from "@/functions/admin/normalize-admin-search";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import type { AdminUsersRouteProps } from "@/types/routes";

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersRouteProps) {
  await requireAdmin();
  const [{ page: rawPage, q: rawQuery }, locale, t] = await Promise.all([
    searchParams,
    getLocale(),
    getTranslations("Admin"),
  ]);
  const requestedPage = normalizeAdminPage(rawPage);
  const query = normalizeAdminSearch(rawQuery);
  const where = getAdminUserWhere(query);
  const userCount = await prisma.user.count({ where });
  const { currentPage, skip, totalPages } = getAdminPagination({
    itemCount: userCount,
    pageSize: ADMIN_USERS_PAGE_SIZE,
    requestedPage,
  });
  const users = await prisma.user.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip,
    take: ADMIN_USERS_PAGE_SIZE,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      _count: { select: { purchases: true } },
    },
  });

  return (
    <main className="mx-auto max-w-7xl px-6 py-14">
      <Link href="/admin" className="back-link">
        ← {t("dashboard")}
      </Link>

      <div className="mb-8">
        <span className="label-upper">{t("usersEyebrow")}</span>
        <h1 className="page-title">{t("usersTitle")}</h1>
        <p className="text-sm text-muted">{t("usersDescription")}</p>
      </div>

      <form
        method="get"
        role="search"
        className="mb-6 flex flex-col gap-3 sm:flex-row">
        <label htmlFor="admin-user-search" className="sr-only">
          {t("searchUsers")}
        </label>
        <input
          id="admin-user-search"
          type="search"
          name="q"
          maxLength={ADMIN_USER_SEARCH_MAX_LENGTH}
          defaultValue={query}
          placeholder={t("searchUsersPlaceholder")}
          className="form-input min-w-0 flex-1"
        />
        <button type="submit" className="btn-primary">
          {t("search")}
        </button>
        {query && (
          <Link
            href="/admin/users"
            className="btn-secondary text-center no-underline">
            {t("clearSearch")}
          </Link>
        )}
      </form>

      <div className="card">
        {users.length === 0 ? (
          <div className="list-empty">
            <p className="font-display mb-1 text-xl">
              {t(query ? "noSearchResults" : "noUsers")}
            </p>
            <p className="text-sm">
              {t(
                query ? "noSearchResultsDescription" : "noUsersDescription"
              )}
            </p>
          </div>
        ) : (
          <AdminUsersList
            users={users.map((user) => ({
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              emailVerified: user.emailVerified,
              createdAt: user.createdAt,
              purchaseCount: user._count.purchases,
            }))}
            locale={locale}
            labels={{
              user: t("user"),
              role: t("role"),
              administrator: t("administrator"),
              student: t("student"),
              verified: t("verified"),
              pendingVerification: t("pendingVerification"),
              purchasedCourses: t("purchasedCourses"),
              joined: t("joined"),
              viewDetails: t("viewDetails"),
            }}
          />
        )}
      </div>

      <AdminPagination
        basePath="/admin/users"
        currentPage={currentPage}
        totalPages={totalPages}
        query={query || undefined}
        previousLabel={t("previousPage")}
        nextLabel={t("nextPage")}
        pageLabel={t("pageOf", { current: currentPage, total: totalPages })}
      />
    </main>
  );
}
