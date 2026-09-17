import { CourseBanner } from "@/components/course-banner";
import { ResponsiveBackgroundImage } from "@/components/responsive-background-image";
import coursesDesktop from "@/public/images/home/courses-desktop.jpg";
import coursesMobile from "@/public/images/home/courses-mobile.jpg";
import type { CorsiSectionProps } from "@/types/home";
import { useTranslations } from "next-intl";

export function Corsi({
  courses,
  isAdmin,
  purchasedSet,
}: CorsiSectionProps) {
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
      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <header data-reveal className="mb-10 sm:mb-14">
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

        {courses.length > 0 ? (
          <div className="grid gap-6 sm:gap-8">
            {courses.map((course) => (
              <CourseBanner
                key={course.id}
                course={course}
                isAdmin={isAdmin}
                purchased={purchasedSet.has(course.id)}
              />
            ))}
          </div>
        ) : (
          <p className="text-white">{t("empty")}</p>
        )}
      </div>
    </section>
  );
}
