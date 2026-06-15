import { DeleteCourseButton } from "@/components/delete-course-button";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import Link from "next/link";

export default async function AdminCoursesPage() {
  await requireAdmin();

  const courses = await prisma.course.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-5xl px-6 py-14">
      <div className="mb-10 flex items-end justify-between gap-6">
        <div>
          <span className="label-upper">Admin</span>
          <h1 className="font-display text-[2.75rem] font-normal text-navy mb-2">
            Corsi
          </h1>
          <p className="text-sm text-muted">
            Gestisci i corsi della piattaforma.
          </p>
        </div>
        <Link href="/admin/courses/new" className="btn-primary shrink-0">
          Nuovo corso
        </Link>
      </div>

      <div className="card divide-y divide-stroke">
        {courses.length === 0 ? (
          <p className="px-8 py-12 text-center text-muted">
            Nessun corso ancora.
          </p>
        ) : (
          courses.map((course) => (
            <div key={course.id} className="list-row">
              <div>
                <h2 className="font-display text-xl font-medium text-navy mb-0.5">
                  {course.title}
                </h2>
                {course.description && (
                  <p className="text-sm text-muted">{course.description}</p>
                )}
                <p className="text-sm text-muted mt-1">
                  €{(course.price / 100).toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <DeleteCourseButton courseId={course.id} />
                <Link
                  href={`/admin/courses/${course.id}/edit`}
                  title="Modifica corso"
                  className="btn-secondary inline-flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  <span className="hidden sm:inline">Modifica</span>
                </Link>
                <Link
                  href={`/admin/courses/${course.id}/modules`}
                  className="btn-primary">
                  Moduli
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
