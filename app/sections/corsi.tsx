import { cn } from "@/lib/cn";
import { createCheckoutSession } from "@/features/courses/checkout";
import type { CorsiSectionProps } from "@/types/parallax";
import Link from "next/link";

export function Corsi({ visible, courses, purchasedSet }: CorsiSectionProps) {
  return (
    <section
      id="corsi"
      className="parallax-section min-h-dvh bg-surface flex flex-col items-center justify-center px-6 py-24">
      <div
        className={cn("parallax-content max-w-5xl w-full", visible.has("corsi") && "visible")}>
        <span className="label-upper">I nostri corsi</span>
        <h2 className="section-title mb-12">
          Inizia il tuo
          <br />
          <em>percorso</em>
        </h2>

        {courses.length === 0 ? (
          <div className="card px-8 py-16 text-center text-muted">
            Nessun corso disponibile al momento.
          </div>
        ) : (
          <div className="card divide-y divide-stroke">
            {courses.map((course) => (
              <div key={course.id} className="list-row">
                <div>
                  <h3 className="font-display text-2xl font-medium text-navy mb-1">
                    {course.title}
                  </h3>
                  {course.description && (
                    <p className="text-sm text-muted leading-relaxed">
                      {course.description}
                    </p>
                  )}
                  <p className="mt-3 text-sm text-muted">
                    €{(course.price / 100).toFixed(2)}
                  </p>
                </div>

                {purchasedSet.has(course.id) ? (
                  <Link
                    href={`/profile/courses/${course.id}`}
                    className="btn-primary">
                    Vai al corso
                  </Link>
                ) : (
                  <form action={createCheckoutSession.bind(null, course.id)}>
                    <button type="submit" className="btn-primary">
                      Acquista
                    </button>
                  </form>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
