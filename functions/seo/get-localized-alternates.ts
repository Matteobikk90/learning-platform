import type { Locale } from "@/types/i18n";

export function getLocalizedAlternates(
  locales: readonly Locale[],
  baseUrl = "",
  path = ""
) {
  return {
    ...Object.fromEntries(
      locales.map((locale) => [locale, `${baseUrl}/${locale}${path}`])
    ),
    "x-default": `${baseUrl}${path}` || "/",
  };
}

export function getHomeAlternates(locale: Locale, locales: readonly Locale[]) {
  return {
    canonical: `/${locale}`,
    languages: getLocalizedAlternates(locales),
  };
}

export function getPageAlternates(
  locale: Locale,
  locales: readonly Locale[],
  path: string
) {
  return {
    canonical: `/${locale}${path}`,
    languages: getLocalizedAlternates(locales, "", path),
  };
}
