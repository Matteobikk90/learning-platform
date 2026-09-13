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
