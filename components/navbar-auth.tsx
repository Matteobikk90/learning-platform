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
        <Link
          href={isAdmin ? "/admin" : "/profile"}
          aria-label={t(isAdmin ? "admin" : "myCourses")}
          title={t(isAdmin ? "admin" : "myCourses")}
          className="nav-link nav-action">
          <NavigationIcon name="user" />
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: `/${locale}` })}
          aria-label={t("logout")}
          title={t("logout")}
          className="nav-link nav-action">
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
      className="nav-link nav-action">
      <NavigationIcon name="login" />
      <span className="hidden sm:inline">{t("login")}</span>
    </Link>
  );
}
