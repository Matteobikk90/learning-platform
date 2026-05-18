import { createCheckoutSession } from "@/features/courses/checkout";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import Link from "next/link";

export default async function Home() {
  const user = await getCurrentUser();

  const courses = await prisma.course.findMany();

  const purchases = user
    ? await prisma.purchase.findMany({
        where: {
          userId: user.id,
        },
        select: {
          courseId: true,
        },
      })
    : [];

  const purchasedCourseIds = new Set(
    purchases.map((purchase) => purchase.courseId)
  );

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <section className="mb-16 text-center">
        <span className="label-upper justify-center">
          Piattaforma di apprendimento
        </span>
        <h1 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] font-light leading-[1.1] text-navy mb-6">
          Scopri il tuo percorso
          <br />
          <em>nello yoga</em>
        </h1>
        <p className="text-[0.9375rem] text-muted max-w-[36ch] mx-auto leading-[1.7]">
          Corsi pensati per guidarti in ogni fase della pratica, dal primo
          respiro alla consapevolezza profonda.
        </p>
      </section>

      <section>
        <p className="text-[0.7rem] font-semibold tracking-widest uppercase text-muted mb-6">
          Corsi disponibili ({courses.length})
        </p>

        {courses.length === 0 ? (
          <div className="card px-8 py-16 text-center text-muted">
            Nessun corso disponibile al momento.
          </div>
        ) : (
          <div className="card divide-y divide-stroke">
            {courses.map((course) => {
              const isPurchased = purchasedCourseIds.has(course.id);

              return (
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

                  {isPurchased ? (
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
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
