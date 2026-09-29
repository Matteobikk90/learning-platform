import type { MetadataRoute } from "next";

import { PUBLIC_CATALOG_COURSE_FILTER } from "@/constants/courses";
import { PUBLIC_MARKETING_PATHS } from "@/constants/seo";
import { getPublicSitemap } from "@/functions/seo/get-public-sitemap";
import { routing } from "@/i18n/routing";
import { getAppUrl } from "@/lib/env";
import { prisma } from "@/lib/prisma";

// Published courses change at runtime, so the sitemap is built per request
// instead of at build time.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const courses = await prisma.course.findMany({
    where: PUBLIC_CATALOG_COURSE_FILTER,
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  return getPublicSitemap(getAppUrl(), routing.locales, [
    ...PUBLIC_MARKETING_PATHS,
    ...courses.map((course) => `/courses/${course.id}`),
  ]);
}
