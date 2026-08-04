"use client";

import { NavigationIcon } from "@/components/icons/navigation-icon";
import { LanguageToggle } from "@/components/language-toggle";
import { SECTIONS } from "@/constants/parallax";
import { Link } from "@/i18n/navigation";
import type { ParallaxNavProps } from "@/types/parallax";
import { signOut, useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";

export function ParallaxNav({ active, isDark, scrollTo }: ParallaxNavProps) {
  const { data: session, status } = useSession();
  const locale = useLocale();
  const t = useTranslations("Navigation");
  const isAdmin = session?.user.role === "ADMIN";

  const textColor = isDark ? "rgba(255,255,255,0.9)" : "var(--color-navy)";
  const dotActive = isDark ? "#ffffff" : "var(--color-navy)";
  const dotInactive = isDark
    ? "rgba(255,255,255,0.28)"
    : "color-mix(in srgb, var(--color-navy) 25%, transparent)";

  return (
    <>
      <nav
        aria-label={t("mainLabel")}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-5 sm:px-8"
        style={{ color: textColor, transition: "color 0.5s ease" }}>
        <button
          type="button"
          onClick={() => scrollTo("hero")}
          className="nav-brand hover:opacity-70 transition-opacity cursor-pointer"
          style={{ color: "inherit", background: "none", border: "none" }}>
          Umberto Iglina
        </button>

        {status === "loading" ? null : session ? (
          <div className="flex items-center gap-3 sm:gap-5">
            {isAdmin && (
              <Link
                href="/admin"
                aria-label={t("admin")}
                title={t("admin")}
                className="nav-link inline-flex min-h-9 items-center gap-2 no-underline transition-opacity hover:opacity-70"
                style={{ color: "inherit" }}>
                <NavigationIcon name="admin" />
                <span className="hidden sm:inline">{t("admin")}</span>
              </Link>
            )}
            {!isAdmin && (
              <Link
                href="/profile"
                aria-label={t("myCourses")}
                title={t("myCourses")}
                className="nav-link inline-flex min-h-9 items-center gap-2 no-underline transition-opacity hover:opacity-70"
                style={{ color: "inherit" }}>
                <NavigationIcon name="courses" />
                <span className="hidden sm:inline">{t("myCourses")}</span>
              </Link>
            )}
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: `/${locale}` })}
              aria-label={t("logout")}
              title={t("logout")}
              className="nav-link inline-flex min-h-9 cursor-pointer items-center gap-2 no-underline transition-opacity hover:opacity-70"
              style={{ color: "inherit", background: "none", border: 0 }}>
              <NavigationIcon name="logout" />
              <span className="hidden sm:inline">{t("logout")}</span>
            </button>
            <LanguageToggle />
          </div>
        ) : (
          <div className="flex items-center gap-3 sm:gap-5">
            <Link
              href="/login"
              aria-label={t("login")}
              title={t("login")}
              className="nav-link inline-flex min-h-9 items-center gap-2 no-underline transition-opacity hover:opacity-70"
              style={{ color: "inherit" }}>
              <NavigationIcon name="login" />
              <span className="hidden sm:inline">{t("login")}</span>
            </Link>
            <LanguageToggle />
          </div>
        )}
      </nav>

      <nav aria-label={t("sectionsLabel")}>
        <ul className="fixed right-4 top-1/2 z-50 flex -translate-y-1/2 flex-col gap-3 sm:right-7">
          {SECTIONS.map(({ id, labelKey }) => {
            const label = t(labelKey);

            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => scrollTo(id)}
                  title={label}
                  aria-label={t("goToSection", { section: label })}
                  aria-current={active === id ? "page" : undefined}
                  className="size-[7px] cursor-pointer rounded-full border-0 p-0 transition-all duration-300"
                  style={{
                    background: active === id ? dotActive : dotInactive,
                    transform: active === id ? "scale(1.5)" : "scale(1)",
                  }}
                />
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
