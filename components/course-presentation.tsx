import { CourseCoverMedia } from "@/components/course-cover-media";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import type { CoursePresentationProps } from "@/types/course-presentation";

export function CoursePresentation({
  title,
  subtitle,
  body,
  coverImageUrl,
  video,
  videoLabel,
  openVideoLabel,
  backLabel,
  children,
}: CoursePresentationProps) {
  return (
    <main className="marketing-page mx-auto max-w-6xl px-6 py-12 text-white sm:px-8 sm:py-20">
      <Link href="/#corsi" className="back-link text-white">← {backLabel}</Link>
      <article
        aria-labelledby="course-title"
        className={cn(
          "grid items-start gap-10 sm:gap-14",
          video && "md:grid-cols-2 md:grid-rows-[auto_1fr] lg:gap-x-20"
        )}>
        <header className="min-w-0 max-w-3xl">
          <h1 id="course-title" className="hero-title wrap-break-word">{title}</h1>
          {subtitle && (
            <p className="mt-6 whitespace-pre-line text-xl leading-relaxed sm:text-2xl">
              {subtitle}
            </p>
          )}
          {body && (
            <p className="mt-10 whitespace-pre-line border-t border-white/20 pt-8 text-base leading-relaxed">
              {body}
            </p>
          )}
        </header>
        {video ? (
          <video
            controls
            playsInline
            preload="none"
            src={video.src}
            poster={video.poster}
            aria-label={videoLabel}
            className="mx-auto aspect-[9/16] w-full max-w-md rounded-2xl border border-white/20 bg-surface object-contain md:col-start-2 md:row-span-2 md:row-start-1">
            <a href={video.src}>{openVideoLabel}</a>
          </video>
        ) : (
          <CourseCoverMedia
            coverImageUrl={coverImageUrl ?? null}
            sizes="(max-width: 1152px) calc(100vw - 3rem), 1088px"
            variant="banner"
          />
        )}
        {children}
      </article>
    </main>
  );
}
