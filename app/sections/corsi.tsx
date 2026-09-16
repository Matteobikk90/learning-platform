import { CourseCoverMedia } from "@/components/course-cover-media";
import { ResponsiveBackgroundImage } from "@/components/responsive-background-image";
import { YogaBanner } from "@/components/yoga-banner";
import { formatCoursePrice } from "@/functions/courses/format-course-price";
import { Link } from "@/i18n/navigation";
import coursesDesktop from "@/public/images/home/courses-desktop.jpg";
import coursesMobile from "@/public/images/home/courses-mobile.jpg";
import type { CorsiSectionProps } from "@/types/home";
import { useLocale, useTranslations } from "next-intl";

export function Corsi({
  courses,
  isAdmin,
  purchasedSet,
}: CorsiSectionProps) {
  const locale = useLocale();
  const t = useTranslations("Home.courses");

  return (
    <section
      id="corsi"
      aria-labelledby="courses-title"
      className="home-section relative overflow-hidden bg-canvas">
      <ResponsiveBackgroundImage
        desktopSrc={coursesDesktop}
        mobileSrc={coursesMobile}
        className="absolute inset-0 size-full object-cover object-center"
      />
      <div className="relative z-10 mx-auto max-w-6xl">
        <header className="mb-10 sm:mb-14">
          <p className="mb-5 flex items-center gap-3 font-mono text-[0.65rem] font-bold uppercase tracking-[0.24em] text-white">
            <span className="h-px w-8 bg-white/45" aria-hidden="true" />
            {t("eyebrow")}
          </p>
          <h2 id="courses-title" className="section-title">
            {t("title")}
            <br />
            <em>{t("titleEmphasis")}</em>
          </h2>
        </header>

        <YogaBanner />

        {courses.length > 0 && (
          <div className="mt-8 grid gap-6 sm:mt-10 sm:grid-cols-2 lg:gap-8">
            {courses.map((course) => {
              const purchased = purchasedSet.has(course.id);
              const titleId = `course-${course.id}-title`;
              return (
                <article
                  key={course.id}
                  aria-labelledby={titleId}
                  className="course-card group">
                  <CourseCoverMedia
                    coverImageUrl={course.coverImageUrl}
                    sizes="(max-width: 639px) calc(100vw - 3rem), (max-width: 1216px) calc(50vw - 3rem), 560px"
                    className="w-full rounded-b-none! border-0 border-b border-white/10"
                  />

                  <div className="course-card-body">
                    <div className="course-card-copy">
                      {purchased && (
                        <span className="mb-2 inline-flex rounded-full border border-white/30 px-2.5 py-1 font-mono text-[0.6rem] font-bold uppercase tracking-[0.16em] text-white">
                          {t("purchased")}
                        </span>
                      )}

                      <h3 id={titleId} className="course-card-title">
                        {course.title}
                      </h3>

                      {course.description && (
                        <p className="course-card-description text-white">
                          {course.description}
                        </p>
                      )}
                    </div>

                    <div className="course-card-actions">
                      <span className="whitespace-nowrap font-mono text-base font-bold text-white">
                        {formatCoursePrice(course.price, locale)}
                      </span>

                      {isAdmin ? (
                        <Link
                          href={`/admin/courses/${course.id}/modules`}
                          className="btn-primary">
                          {t("manageCourse")}
                        </Link>
                      ) : purchased ? (
                        <Link
                          href={`/profile/courses/${course.id}`}
                          className="btn-primary">
                          {t("goToCourse")}
                        </Link>
                      ) : (
                        <Link
                          href={`/checkout/${course.id}`}
                          prefetch={false}
                          className="btn-primary">
                          {t("buyCourse")}
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
