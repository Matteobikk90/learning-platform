import { useTranslations } from "next-intl";

import { CourseCoverMedia } from "@/components/course-cover-media";
import { Link } from "@/i18n/navigation";
import type { CourseBannerProps } from "@/types/home";

export function CourseBanner({ course }: CourseBannerProps) {
  const t = useTranslations("Home.courses");
  const titleId = `course-${course.id}-title`;

  return (
    <article data-reveal aria-labelledby={titleId} className="course-card">
      <CourseCoverMedia
        coverImageUrl={course.coverImageUrl}
        sizes="(max-width: 1216px) calc(100vw - 3rem), 1152px"
        variant="banner"
        className="w-full rounded-none! border-0 border-b border-white/10"
      />
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="min-w-0 flex-1 basis-48">
          <h3 id={titleId} className={course.description ? "sr-only" : "text-base text-white"}>
            {course.title}
          </h3>
          {course.description && (
            <p className="line-clamp-2 wrap-break-word text-base leading-relaxed text-white">
              {course.description}
            </p>
          )}
        </div>
        <Link href={`/courses/${course.id}`} className="btn-primary" aria-label={`${t("discover")}: ${course.title}`}>
          {t("discover")}
        </Link>
      </div>
    </article>
  );
}
