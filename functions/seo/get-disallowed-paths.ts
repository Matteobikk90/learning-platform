import { PRIVATE_ROUTE_SEGMENTS } from "@/constants/seo";
import type { Locale } from "@/types/i18n";

export function getDisallowedPaths(locales: readonly Locale[]) {
  return [
    "/api/",
    ...locales.flatMap((locale) =>
      PRIVATE_ROUTE_SEGMENTS.map((segment) => `/${locale}/${segment}`)
    ),
  ];
}
