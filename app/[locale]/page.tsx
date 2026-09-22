import { Benefici } from "@/app/sections/benefici";
import { ChiSono } from "@/app/sections/chi-sono";
import { Corsi } from "@/app/sections/corsi";
import { Faq } from "@/app/sections/faq";
import { Hero } from "@/app/sections/hero";
import { Testimonianze } from "@/app/sections/testimonianze";
import { HomeSections } from "@/components/home-sections";
import { PUBLIC_CATALOG_COURSE_FILTER } from "@/constants/courses";
import { isSupportedLocale } from "@/functions/i18n/is-supported-locale";
import { getHomeAlternates } from "@/functions/seo/get-localized-alternates";
import { routing } from "@/i18n/routing";
import { prisma } from "@/lib/prisma";
import type { LocaleRouteProps } from "@/types/i18n";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: LocaleRouteProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) notFound();

  return { alternates: getHomeAlternates(locale, routing.locales) };
}

export default async function Home() {
  const courses = await prisma.course.findMany({
    where: PUBLIC_CATALOG_COURSE_FILTER,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      coverImageUrl: true,
    },
  });

  return (
    <HomeSections>
      <Hero />
      <Benefici />
      <Corsi courses={courses} />
      <Testimonianze />
      <ChiSono />
      <Faq />
    </HomeSections>
  );
}
