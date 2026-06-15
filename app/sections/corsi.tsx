"use client";

import { createCheckoutSession } from "@/features/courses/checkout";
import { cn } from "@/lib/cn";
import type { CorsiSectionProps } from "@/types/parallax";
import Link from "next/link";

export function Corsi({ visible, courses, purchasedSet }: CorsiSectionProps) {
  return (
    <section
      id="corsi"
      className="parallax-section min-h-dvh bg-canvas flex flex-col items-center justify-center px-6 py-28">
      <div
        className={cn(
          "parallax-content max-w-6xl w-full",
          visible.has("corsi") && "visible"
        )}>
        <div className="mb-16">
          <span className="label-upper">I nostri corsi</span>
          <h2 className="section-title mb-4">
            Inizia il tuo
            <br />
            <em>percorso</em>
          </h2>
          <p className="text-sm text-muted leading-relaxed max-w-[42ch]">
            Formazione clinica sviluppata in vent&apos;anni di pratica osteopatica.
          </p>
        </div>

        {courses.length === 0 ? (
          <div className="card px-8 py-16 text-center text-muted">
            Nessun corso disponibile al momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const purchased = purchasedSet.has(course.id);
              return (
                <article key={course.id} className="course-card">
                  {/* Image */}
                  <div className="relative aspect-[3/2] overflow-hidden bg-stroke/20">
                    {course.coverImageUrl ? (
                      <img
                        src={course.coverImageUrl}
                        alt={course.title}
                        className="w-full h-full object-cover course-card-img"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg
                          width="36"
                          height="36"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.25"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-subtle"
                          aria-hidden="true">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                      </div>
                    )}

                    {purchased && (
                      <span className="absolute top-3.5 left-3.5 text-[0.625rem] font-semibold tracking-[0.18em] uppercase px-2.5 py-1 rounded-full bg-petrol text-white">
                        Acquistato
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-col flex-1 px-6 pt-5 pb-6">
                    <h3 className="font-display text-[1.5rem] font-medium text-navy leading-[1.2] mb-3">
                      {course.title}
                    </h3>

                    {course.description && (
                      <p className="text-[0.8125rem] text-muted leading-[1.75] line-clamp-2 flex-1 mb-4">
                        {course.description}
                      </p>
                    )}

                    <span className="course-price-chip">
                      €{(course.price / 100).toFixed(0)}
                    </span>

                    <div className="mt-auto pt-5 border-t border-stroke/60">
                      {purchased ? (
                        <Link
                          href={`/profile/courses/${course.id}`}
                          className="btn-primary w-full text-center block">
                          Vai al corso
                        </Link>
                      ) : (
                        <form action={createCheckoutSession.bind(null, course.id)}>
                          <button type="submit" className="btn-primary w-full cursor-pointer">
                            Acquista il corso
                          </button>
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
