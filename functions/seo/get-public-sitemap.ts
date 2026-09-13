import type { MetadataRoute } from "next";

import { getLocalizedAlternates } from "@/functions/seo/get-localized-alternates";
import type { Locale } from "@/types/i18n";

export function getPublicSitemap(
  appUrl: string,
  locales: readonly Locale[]
): MetadataRoute.Sitemap {
  const languages = getLocalizedAlternates(locales, appUrl);

  return locales.map((locale) => ({
    url: `${appUrl}/${locale}`,
    alternates: { languages },
  }));
}
