import { formatDuration } from "@/lib/format-duration";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function ProfileCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const session = await requireAuth();
  const { courseId } = await params;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
  });

  if (!user) redirect("/login");

  const purchase = await prisma.purchase.findFirst({
    where: { userId: user.id, courseId },
    include: {
      course: {
        include: { modules: { orderBy: { order: "asc" } } },
      },
    },
  });

  if (!purchase) notFound();

  return (
    <main className="mx-auto max-w-5xl px-6 py-14">
      <Link href="/profile" className="back-link">
        ← Profilo
      </Link>

      <div className="mb-10">
        <span className="label-upper">Corso</span>
        <h1 className="font-display text-[2.75rem] font-normal text-navy mb-2">
          {purchase.course.title}
        </h1>
        {purchase.course.description && (
          <p className="text-[0.9375rem] text-muted leading-relaxed max-w-[60ch]">
            {purchase.course.description}
          </p>
        )}
      </div>

      <section>
        <p className="text-[0.7rem] font-semibold tracking-widest uppercase text-muted mb-4">
          Moduli ({purchase.course.modules.length})
        </p>

        <div className="card">
          {purchase.course.modules.length === 0 ? (
            <p className="px-8 py-8 text-muted">Nessun modulo disponibile.</p>
          ) : (
            purchase.course.modules.map((module) => (
              <div key={module.id} className="list-row">
                <div>
                  <div className="flex items-baseline gap-2.5 mb-1">
                    <span className="text-[0.7rem] font-semibold tracking-widest text-subtle">
                      {String(module.order).padStart(2, "0")}
                    </span>
                    <h3 className="font-display text-xl font-medium text-navy">
                      {module.title}
                    </h3>
                  </div>
                  <p className="text-[0.8125rem] text-subtle">
                    {formatDuration(module.durationSeconds)}
                    {!module.videoPlaybackId && (
                      <span className="ml-2">· Video non ancora disponibile</span>
                    )}
                  </p>
                </div>
                <Link
                  href={`/profile/courses/${purchase.course.id}/modules/${module.id}`}
                  className="btn-primary">
                  Guarda
                </Link>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
