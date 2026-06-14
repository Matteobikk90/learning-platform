import Link from "next/link";
import { redirect } from "next/navigation";

import { getCourseProgress } from "@/lib/course-progress";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";

export default async function CoursesPage() {
  const session = await requireAuth();

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: {
      purchases: {
        include: {
          course: {
            include: {
              modules: {
                orderBy: { order: "asc" },
                include: { progress: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) redirect("/login");

  const courses = user.purchases.map((p) => p.course);

  return (
    <main className="mx-auto max-w-5xl px-6 py-14">
      <div className="mb-10">
        <span className="label-upper">Profilo</span>
        <h1 className="font-display text-[2.75rem] font-normal text-navy mb-2">
          I miei corsi
        </h1>
        <p className="text-sm text-muted">
          Continua il tuo percorso di pratica.
        </p>
      </div>

      <div className="card divide-y divide-stroke">
        {courses.length === 0 ? (
          <div className="px-8 py-12 text-center text-muted">
            <p className="font-display text-xl mb-1">Nessun corso ancora</p>
            <p className="text-sm">I tuoi corsi acquistati appariranno qui.</p>
          </div>
        ) : (
          courses.map((course) => {
            const progress = getCourseProgress(course.modules);

            return (
              <div key={course.id} className="list-row">
                <div>
                  <h3 className="font-display text-xl font-medium text-navy mb-0.5">
                    {course.title}
                  </h3>
                  {course.description && (
                    <p className="text-sm text-muted mt-1">
                      {course.description}
                    </p>
                  )}
                  <p className="text-sm text-muted mt-2">
                    {progress.completedModules}/{progress.totalModules} moduli
                    completati · {progress.percentage}%
                  </p>
                  <div
                    className="mt-3 h-1 w-48 rounded-full overflow-hidden"
                    style={{ background: "var(--color-stroke)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${progress.percentage}%`,
                        background: "var(--color-petrol)",
                      }}
                    />
                  </div>
                </div>
                <Link
                  href={`/profile/courses/${course.id}`}
                  className="btn-primary">
                  Vai al corso
                </Link>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}
