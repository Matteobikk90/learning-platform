"use client";

import { createCheckoutSession } from "@/features/courses/checkout";
import { SubmitButton } from "@/components/submit-button";
import { ResponsiveBackgroundImage } from "@/components/responsive-background-image";
import { cn } from "@/lib/cn";
import coursesDesktop from "@/public/images/home/courses-desktop.jpg";
import coursesMobile from "@/public/images/home/courses-mobile.jpg";
import type { CorsiSectionProps } from "@/types/parallax";
import Image from "next/image";
import Link from "next/link";

export function Corsi({ visible, courses, purchasedSet }: CorsiSectionProps) {
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
        <div className="mb-16">
          <h2 className="section-title">
            Inizia ora la trasformazione:
            <br />
            <em>scegli il tuo percorso</em>
          </h2>
        </div>

        {courses.length === 0 ? (
          <div className="card px-8 py-16 text-center text-muted">
            Nessun corso disponibile al momento.
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {courses.map((course) => {
              const purchased = purchasedSet.has(course.id);
              return (
                <article key={course.id} className="course-banner">
                  {/* Background composite */}
                  {course.coverImageUrl ? (
                    <Image
                      src={course.coverImageUrl}
                      alt=""
                      fill
                      sizes="(max-width: 1152px) 100vw, 1152px"
                      className="object-cover course-banner-img"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-linear-to-br from-navy via-surface to-navy" />
                  )}
                  <div className="course-banner-overlay" aria-hidden="true" />

                  {/* Content */}
                  <div className="relative flex flex-col justify-center min-h-80 max-w-2xl px-8 py-14 md:px-14">
                    {purchased && (
                      <span className="self-start font-mono text-[0.625rem] font-bold tracking-[0.18em] uppercase px-2.5 py-1 rounded-full bg-white text-black mb-5">
                        Acquistato
                      </span>
                    )}

                    {/* Logo placeholder — swap for the course logo asset when delivered */}
                    <h3 className="font-display text-[clamp(1.375rem,5.5vw,2.5rem)] font-medium text-white tracking-[-0.02em] leading-[1.1] wrap-break-word mb-4">
                      {course.title}
                    </h3>

                    {course.description && (
                      <p className="label-upper leading-5 line-clamp-3 mb-8 text-white/85">
                        {course.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-5">
                      <span className="course-price-tag course-price-tag-invert">
                        €{(course.price / 100).toFixed(0)}
                      </span>

                      {purchased ? (
                        <Link
                          href={`/profile/courses/${course.id}`}
                          className="btn-primary">
                          Vai al corso
                        </Link>
                      ) : (
                        <form
                          action={createCheckoutSession.bind(null, course.id)}>
                          <SubmitButton pendingLabel="Apertura checkout…">
                            Acquista il corso
                          </SubmitButton>
                        </form>
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
