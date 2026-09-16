import type { MetadataRoute } from "next";

import { getLocalizedAlternates } from "@/functions/seo/get-localized-alternates";
import type { Locale } from "@/types/i18n";

export function getPublicSitemap(
  appUrl: string,
  locales: readonly Locale[]
): MetadataRoute.Sitemap {
  const languages = getLocalizedAlternates(locales, appUrl);

  const homes = locales.map((locale) => ({
    url: `${appUrl}/${locale}`,
    alternates: { languages },
  }));

  const yogaPath = "/yoga-su-misura";
  const yogaLanguages = {
    ...Object.fromEntries(locales.map((locale) => [locale, `${appUrl}/${locale}${yogaPath}`])),
    "x-default": `${appUrl}${yogaPath}`,
  };

  return [
    ...homes,
    ...locales.map((locale) => ({
      url: `${appUrl}/${locale}${yogaPath}`,
      alternates: { languages: yogaLanguages },
    })),
  ];
}
