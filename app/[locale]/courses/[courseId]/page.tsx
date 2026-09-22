import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { CourseCoverMedia } from "@/components/course-cover-media";
import { ACTIVE_PURCHASE_FILTER } from "@/constants/purchases";
import { formatCoursePrice } from "@/functions/courses/format-course-price";
import { getPublishedCourse } from "@/functions/courses/get-published-course";
import { isSupportedLocale } from "@/functions/i18n/is-supported-locale";
import { getPageAlternates } from "@/functions/seo/get-localized-alternates";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { prisma } from "@/lib/prisma";
import { getAppSession } from "@/lib/session";
import type { PublicCourseRouteProps } from "@/types/routes";

export async function generateMetadata({ params }: PublicCourseRouteProps): Promise<Metadata> {
  const { locale, courseId } = await params;
  if (!isSupportedLocale(locale)) notFound();
  const course = await getPublishedCourse(courseId);
  if (!course) notFound();

  return {
    title: course.title,
    description: course.description ?? undefined,
    alternates: getPageAlternates(locale, routing.locales, `/courses/${course.id}`),
  };
}

export default async function CourseDetailPage({ params }: PublicCourseRouteProps) {
  const { locale, courseId } = await params;
  if (!isSupportedLocale(locale)) notFound();
  setRequestLocale(locale);

  const [course, session, t] = await Promise.all([
    getPublishedCourse(courseId),
    getAppSession(),
    getTranslations({ locale, namespace: "CourseDetail" }),
  ]);
  if (!course) notFound();

  const isAdmin = session?.user.role === "ADMIN";
  const purchase = session?.user.id && !isAdmin
    ? await prisma.purchase.findFirst({
        where: { ...ACTIVE_PURCHASE_FILTER, userId: session.user.id, courseId },
        select: { id: true },
      })
    : null;
  const href = isAdmin
    ? `/admin/courses/${course.id}/modules`
    : purchase
      ? `/profile/courses/${course.id}`
      : `/checkout/${course.id}`;
  const action = isAdmin ? "manage" : purchase ? "continue" : "buy";

  return (
    <main className="marketing-page mx-auto max-w-6xl px-6 py-12 text-white sm:px-8 sm:py-20">
      <Link href="/#corsi" className="back-link">← {t("back")}</Link>
      <article aria-labelledby="course-title" className="space-y-8 sm:space-y-12">
        <header className="max-w-3xl">
          <h1 id="course-title" className="hero-title">{course.title}</h1>
          {course.description && (
            <p className="mt-6 whitespace-pre-line text-lg leading-relaxed sm:text-xl">
              {course.description}
            </p>
          )}
        </header>
        <CourseCoverMedia
          coverImageUrl={course.coverImageUrl}
          sizes="(max-width: 1152px) calc(100vw - 3rem), 1088px"
          variant="banner"
        />
        <footer className="flex flex-wrap items-center justify-between gap-6 border-t border-white/20 pt-8">
          <p className="flex flex-col gap-2">
            <span className="font-mono text-xs uppercase tracking-widest">{t("price")}</span>
            <strong className="text-3xl font-medium">{formatCoursePrice(course.price, locale)}</strong>
          </p>
          <Link href={href} prefetch={false} className="btn-primary">{t(action)}</Link>
        </footer>
      </article>
    </main>
  );
}
