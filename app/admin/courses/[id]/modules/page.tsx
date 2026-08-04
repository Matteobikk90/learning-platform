import { formatDuration } from "@/lib/format-duration";
import { getVideoStatusLabel } from "@/functions/video/get-video-state";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import type { CourseRouteProps } from "@/types/routes";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ModulesPage({ params }: CourseRouteProps) {
  await requireAdmin();

  const { id } = await params;

  const course = await prisma.course.findUnique({
    where: { id },
    include: { modules: { orderBy: { order: "asc" } } },
  });

  if (!course) notFound();

  return (
    <main className="mx-auto max-w-5xl px-6 py-14">
      <Link href="/admin/courses" className="back-link">
        ← Corsi
      </Link>

      <div className="mb-10 flex items-end justify-between gap-6">
        <div>
          <span className="label-upper">Moduli</span>
          <h1 className="page-title">{course.title}</h1>
        </div>
        <Link
          href={`/admin/courses/${course.id}/modules/new`}
          className="btn-primary">
          Nuovo modulo
        </Link>
      </div>

      <div className="card">
        {course.modules.length === 0 ? (
          <p className="list-empty">Nessun modulo ancora.</p>
        ) : (
          course.modules.map((module) => (
            <div key={module.id} className="list-row">
              <div>
                <div className="flex items-baseline gap-2.5 mb-1">
                  <span className="list-num">
                    {String(module.order).padStart(2, "0")}
                  </span>
                  <h2 className="list-row-title">{module.title}</h2>
                </div>
                <p className="text-sm text-muted">
                  {module.durationSeconds > 0
                    ? formatDuration(module.durationSeconds)
                    : "Durata da rilevare"}
                  {" · "}
                  {getVideoStatusLabel(module)}
                </p>
              </div>
              <Link
                href={`/admin/courses/${course.id}/modules/${module.id}`}
                title="Modifica modulo"
                className="btn-secondary inline-flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                <span className="hidden sm:inline">Gestisci</span>
              </Link>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
