import type { MetadataRoute } from "next";

import { getLocalizedAlternates } from "@/functions/seo/get-localized-alternates";
import type { Locale } from "@/types/i18n";

export function getPublicSitemap(
  appUrl: string,
  locales: readonly Locale[],
  paths: readonly string[] = []
): MetadataRoute.Sitemap {
  return ["", ...paths].flatMap((path) => {
    const languages = getLocalizedAlternates(locales, appUrl, path);

    return locales.map((locale) => ({
      url: `${appUrl}/${locale}${path}`,
      alternates: { languages },
    }));
  });
}
