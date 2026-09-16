import type { Locale } from "@/types/i18n";

export function getLocalizedAlternates(
  locales: readonly Locale[],
  baseUrl = ""
) {
  return {
    ...Object.fromEntries(
      locales.map((locale) => [locale, `${baseUrl}/${locale}`])
    ),
    "x-default": baseUrl || "/",
  };
}

export function getHomeAlternates(locale: Locale, locales: readonly Locale[]) {
  return {
    canonical: `/${locale}`,
    languages: getLocalizedAlternates(locales),
  };
}

export function getPageAlternates(locale: Locale, locales: readonly Locale[], path: string) {
  return {
    canonical: `/${locale}${path}`,
    languages: {
      ...Object.fromEntries(locales.map((language) => [language, `/${language}${path}`])),
      "x-default": path,
    },
  };
}
