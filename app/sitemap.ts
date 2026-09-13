import type { MetadataRoute } from "next";

import { getPublicSitemap } from "@/functions/seo/get-public-sitemap";
import { routing } from "@/i18n/routing";
import { getAppUrl } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  return getPublicSitemap(getAppUrl(), routing.locales);
}
