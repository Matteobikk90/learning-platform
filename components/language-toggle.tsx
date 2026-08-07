"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";

import { FlagIcon } from "@/components/icons/flag-icon";
import { getLanguageSwitchHref } from "@/functions/i18n/get-language-switch-href";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import type { LanguageToggleProps, Locale } from "@/types/i18n";

export function LanguageToggle({
  className = "",
}: LanguageToggleProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("Navigation");
  const [pending, startTransition] = useTransition();
  const nextLocale: Locale = locale === "it" ? "en" : "it";

  function changeLanguage() {
    const href = getLanguageSwitchHref(
      pathname,
      window.location.search,
      window.location.hash
    );

    startTransition(() => {
      router.replace(href, { locale: nextLocale, scroll: false });
    });
  }

  return (
    <button
      type="button"
      onClick={changeLanguage}
      disabled={pending}
      aria-label={t("switchLanguage")}
      title={t("switchLanguage")}
      className={cn("nav-link nav-action", className)}>
      <FlagIcon locale={nextLocale} className="nav-action-flag h-3 w-[1.125rem]" />
      <span>{nextLocale.toUpperCase()}</span>
    </button>
  );
}
