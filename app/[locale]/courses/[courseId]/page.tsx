import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { CoursePresentation } from "@/components/course-presentation";
import { ACTIVE_PURCHASE_FILTER } from "@/constants/purchases";
import { formatCoursePrice } from "@/functions/courses/format-course-price";
import { getCoursePresentation } from "@/functions/courses/get-course-presentation";
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

  const presentation = getCoursePresentation(course.title);
  const editorial = presentation
    ? await getTranslations({ locale, namespace: presentation.namespace })
    : null;

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
    <CoursePresentation
      title={course.title}
      subtitle={course.description}
      body={editorial?.("body")}
      coverImageUrl={course.coverImageUrl}
      video={presentation?.video}
      videoLabel={editorial?.("videoLabel")}
      openVideoLabel={editorial?.("openVideo")}
      backLabel={t("back")}>
      <footer className="flex flex-wrap items-center justify-between gap-6 border-t border-white/20 pt-8">
        <p className="flex flex-col gap-2">
          <span className="font-mono text-xs uppercase tracking-widest">{t("price")}</span>
          <strong className="text-3xl font-medium">{formatCoursePrice(course.price, locale)}</strong>
        </p>
        <Link href={href} prefetch={false} className="btn-primary">{t(action)}</Link>
      </footer>
    </CoursePresentation>
  );
}
