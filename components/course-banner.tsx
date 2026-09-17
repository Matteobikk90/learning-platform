import { useLocale, useTranslations } from "next-intl";

import { CourseCoverMedia } from "@/components/course-cover-media";
import { formatCoursePrice } from "@/functions/courses/format-course-price";
import { Link } from "@/i18n/navigation";
import type { CourseBannerProps } from "@/types/home";

export function CourseBanner({ course, isAdmin, purchased }: CourseBannerProps) {
  const locale = useLocale();
  const t = useTranslations("Home.courses");
  const titleId = `course-${course.id}-title`;
  const href = isAdmin
    ? `/admin/courses/${course.id}/modules`
    : purchased
      ? `/profile/courses/${course.id}`
      : `/checkout/${course.id}`;
  const actionLabel = isAdmin ? t("manageCourse") : purchased ? t("goToCourse") : t("buyCourse");

  return (
    <article data-reveal aria-labelledby={titleId} className="course-card">
      <CourseCoverMedia
        coverImageUrl={course.coverImageUrl}
        sizes="(max-width: 1216px) calc(100vw - 3rem), 1152px"
        variant="banner"
        className="w-full rounded-none! border-0 border-b border-white/10"
      />
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 px-4 py-4 sm:px-6">
        <div className="min-w-0 flex-1 basis-64">
          <h3 id={titleId} className="wrap-break-word font-display text-lg font-medium leading-snug text-white sm:text-xl">
            {course.title}
          </h3>
          {course.description && (
            <p className="mt-1 line-clamp-2 wrap-break-word text-sm leading-relaxed text-white">
              {course.description}
            </p>
          )}
        </div>
        <div className="flex w-full flex-wrap items-center justify-between gap-3 sm:w-auto sm:justify-end sm:gap-5">
          <span className="whitespace-nowrap font-mono text-sm font-semibold text-white">
            {purchased ? t("purchased") : formatCoursePrice(course.price, locale)}
          </span>
          <Link href={href} prefetch={false} className="btn-primary" aria-label={`${actionLabel}: ${course.title}`}>
            {actionLabel}
          </Link>
        </div>
      </div>
    </article>
  );
}
