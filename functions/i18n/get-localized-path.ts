import type { Locale } from "@/types/i18n";

export function getLocalizedPath(locale: Locale, pathname: string) {
  const normalizedPathname = pathname.startsWith("/")
    ? pathname
    : `/${pathname}`;

  return `/${locale}${normalizedPathname === "/" ? "" : normalizedPathname}`;
}
