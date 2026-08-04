"use client";

import { NavigationIcon } from "@/components/icons/navigation-icon";
import { Link, usePathname } from "@/i18n/navigation";
import { signOut, useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";

export function NavbarAuth() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("Navigation");
  const { data: session, status } = useSession();

  if (status === "loading" || pathname === "/login") return null;

  if (session) {
    const isAdmin = session.user.role === "ADMIN";

    return (
      <>
        {isAdmin && (
          <Link
            href="/admin"
            aria-label={t("admin")}
            title={t("admin")}
            className="nav-link inline-flex min-h-9 items-center gap-2 text-muted no-underline">
            <NavigationIcon name="admin" />
            <span className="hidden sm:inline">{t("admin")}</span>
          </Link>
        )}
        {!isAdmin && (
          <Link
            href="/profile"
            aria-label={t("myCourses")}
            title={t("myCourses")}
            className="nav-link inline-flex min-h-9 items-center gap-2 text-muted no-underline">
            <NavigationIcon name="courses" />
            <span className="hidden sm:inline">{t("myCourses")}</span>
          </Link>
        )}
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: `/${locale}` })}
          aria-label={t("logout")}
          title={t("logout")}
          className="nav-link inline-flex min-h-9 cursor-pointer items-center gap-2 border-0 bg-transparent p-0 text-subtle">
          <NavigationIcon name="logout" />
          <span className="hidden sm:inline">{t("logout")}</span>
        </button>
      </>
    );
  }

  return (
    <Link
      href="/login"
      aria-label={t("login")}
      title={t("login")}
      className="nav-link inline-flex min-h-9 items-center gap-2 text-white no-underline transition-opacity hover:opacity-70">
      <NavigationIcon name="login" />
      <span className="hidden sm:inline">{t("login")}</span>
    </Link>
  );
}
