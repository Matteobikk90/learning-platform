import { formatDuration } from "@/lib/format-duration";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import Link from "next/link";
import { notFound } from "next/navigation";

type ModulesPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ModulesPage({ params }: ModulesPageProps) {
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
          <h1 className="font-display text-[2.75rem] font-normal text-navy mb-2">
            {course.title}
          </h1>
        </div>
        <Link
          href={`/admin/courses/${course.id}/modules/new`}
          className="btn-primary shrink-0">
          Nuovo modulo
        </Link>
      </div>

      <div className="card divide-y divide-stroke">
        {course.modules.length === 0 ? (
          <p className="px-8 py-12 text-center text-muted">
            Nessun modulo ancora.
          </p>
        ) : (
          course.modules.map((module) => (
            <div key={module.id} className="list-row">
              <div>
                <div className="flex items-baseline gap-2.5 mb-1">
                  <span className="text-[0.75rem] font-semibold tracking-widest text-subtle">
                    {String(module.order).padStart(2, "0")}
                  </span>
                  <h2 className="font-display text-xl font-medium text-navy">
                    {module.title}
                  </h2>
                </div>
                <p className="text-sm text-muted">
                  {formatDuration(module.durationSeconds)}
                  {" · "}
                  {module.videoPlaybackId
                    ? "Video pronto"
                    : module.muxUploadId
                    ? "Video in elaborazione"
                    : "Nessun video caricato"}
                </p>
              </div>
              <Link
                href={`/admin/courses/${course.id}/modules/${module.id}`}
                className="btn-secondary">
                Gestisci
              </Link>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
