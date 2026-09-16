import { Benefici } from "@/app/sections/benefici";
import { ChiSono } from "@/app/sections/chi-sono";
import { Corsi } from "@/app/sections/corsi";
import { Faq } from "@/app/sections/faq";
import { Hero } from "@/app/sections/hero";
import { Testimonianze } from "@/app/sections/testimonianze";
import { PUBLIC_CATALOG_COURSE_FILTER } from "@/constants/courses";
import { ACTIVE_PURCHASE_FILTER } from "@/constants/purchases";
import { isSupportedLocale } from "@/functions/i18n/is-supported-locale";
import { getHomeAlternates } from "@/functions/seo/get-localized-alternates";
import { routing } from "@/i18n/routing";
import { prisma } from "@/lib/prisma";
import { getAppSession } from "@/lib/session";
import type { LocaleRouteProps } from "@/types/i18n";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: LocaleRouteProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) notFound();

  return { alternates: getHomeAlternates(locale, routing.locales) };
}

export default async function Home() {
  const [session, courses] = await Promise.all([
    getAppSession(),
    prisma.course.findMany({
      where: PUBLIC_CATALOG_COURSE_FILTER,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        coverImageUrl: true,
      },
    }),
  ]);
  const isAdmin = session?.user.role === "ADMIN";

  const purchases = session?.user.id && !isAdmin
    ? await prisma.purchase.findMany({
        where: {
          ...ACTIVE_PURCHASE_FILTER,
          userId: session.user.id,
          course: PUBLIC_CATALOG_COURSE_FILTER,
        },
        select: { courseId: true },
      })
    : [];

  return (
    <main className="marketing-page">
      <Hero />
      <Benefici />
      <Corsi
        courses={courses}
        isAdmin={isAdmin}
        purchasedSet={new Set(purchases.map((purchase) => purchase.courseId))}
      />
      <Testimonianze />
      <ChiSono />
      <Faq />
    </main>
  );
}
