import type { MetadataRoute } from "next";

import { getDisallowedPaths } from "@/functions/seo/get-disallowed-paths";
import { routing } from "@/i18n/routing";
import { getAppUrl } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: getDisallowedPaths(routing.locales),
    },
    sitemap: `${getAppUrl()}/sitemap.xml`,
  };
}
