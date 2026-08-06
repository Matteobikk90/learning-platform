"use client";

import { CourseCoverPlaceholder } from "@/components/course-cover-placeholder";
import { ResponsiveBackgroundImage } from "@/components/responsive-background-image";
import { cn } from "@/lib/cn";
import { Link } from "@/i18n/navigation";
import coursesDesktop from "@/public/images/home/courses-desktop.jpg";
import coursesMobile from "@/public/images/home/courses-mobile.jpg";
import type { CorsiSectionProps } from "@/types/parallax";
import Image from "next/image";
import { useTranslations } from "next-intl";

export function Corsi({ visible, courses, purchasedSet }: CorsiSectionProps) {
  const t = useTranslations("Home.courses");

  return (
    <section
      id="corsi"
      className="parallax-section relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-canvas px-6 py-28">
      <ResponsiveBackgroundImage
        desktopSrc={coursesDesktop}
        mobileSrc={coursesMobile}
        className="absolute inset-0 size-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-black/45" aria-hidden="true" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.32) 58%, rgba(0,0,0,0.76) 100%)",
        }}
        aria-hidden="true"
      />

      <div
        className={cn(
          "parallax-content relative z-10 w-full max-w-6xl",
          visible.has("corsi") && "visible"
        )}>
        <div className="mb-12 md:mb-16">
          <p className="mb-5 flex items-center gap-3 font-mono text-[0.65rem] font-bold uppercase tracking-[0.24em] text-white/60">
            <span className="h-px w-8 bg-white/45" aria-hidden="true" />
            {t("eyebrow")}
          </p>
          <h2 className="section-title">
            {t("title")}
            <br />
            <em>{t("titleEmphasis")}</em>
          </h2>
        </div>

        {courses.length === 0 ? (
          <div className="card px-8 py-16 text-center text-muted">
            {t("empty")}
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {courses.map((course, index) => {
              const purchased = purchasedSet.has(course.id);
              const titleId = `course-${course.id}-title`;
              return (
                <article
                  key={course.id}
                  aria-labelledby={titleId}
                  className={cn(
                    "course-banner",
                    course.coverImageUrl
                      ? undefined
                      : "course-banner-placeholder"
                  )}>
                  {course.coverImageUrl ? (
                    <Image
                      src={course.coverImageUrl}
                      alt=""
                      fill
                      sizes="(max-width: 1152px) 100vw, 1152px"
                      className="object-cover course-banner-img"
                    />
                  ) : (
                    <CourseCoverPlaceholder />
                  )}
                  <div className="course-banner-overlay" aria-hidden="true" />

                  <div className="course-banner-corner" aria-hidden="true">
                    <span className="size-1.5 rounded-full bg-white shadow-[0_0_14px_rgba(255,255,255,0.75)]" />
                    {t("digitalAccess")}
                  </div>

                  <div className="course-banner-content">
                    <div className="course-banner-kicker">
                      <span className="text-white">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="h-px w-7 bg-white/30" aria-hidden="true" />
                      {t("guidedPath")}
                    </div>

                    {purchased && (
                      <span className="mb-5 self-start rounded-full bg-white px-2.5 py-1 font-mono text-[0.625rem] font-bold uppercase tracking-[0.18em] text-black">
                        {t("purchased")}
                      </span>
                    )}

                    <h3 id={titleId} className="course-banner-title">
                      {course.title}
                    </h3>

                    {course.description && (
                      <p className="course-banner-description">
                        {course.description}
                      </p>
                    )}

                    <div className="course-banner-actions">
                      <span className="course-price-tag course-price-tag-invert">
                        €{(course.price / 100).toFixed(0)}
                      </span>

                      {purchased ? (
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
