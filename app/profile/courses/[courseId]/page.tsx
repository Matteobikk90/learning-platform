import { formatDuration } from "@/lib/format-duration";
import { getUnlockDate, isModuleUnlocked } from "@/lib/module-access";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

const unlockDateFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "numeric",
  month: "long",
});

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

  const isAdmin = session.user.role === "ADMIN";

  const progresses = await prisma.moduleProgress.findMany({
    where: {
      userId: user.id,
      module: { courseId },
    },
    select: { moduleId: true, completedAt: true },
  });

  const progressMap = new Map(
    progresses.map((p) => [p.moduleId, p.completedAt])
  );

  const modules = purchase.course.modules;

  return (
    <main className="mx-auto max-w-5xl px-6 py-14">
      <Link href="/profile" className="back-link">
        ← Profilo
      </Link>

      <div className="mb-10 max-w-3xl">
        <span className="label-upper">Corso</span>
        <h1 className="page-title">{purchase.course.title}</h1>
        {purchase.course.description && (
          <p className="text-muted leading-relaxed w-full">
            {purchase.course.description}
          </p>
        )}
      </div>

      <section>
        <p className="font-mono text-[0.7rem] tracking-widest uppercase text-muted mb-4">
          Moduli ({modules.length})
        </p>

        <div className="card">
          {modules.length === 0 ? (
            <p className="px-8 py-8 text-muted">Nessun modulo disponibile.</p>
          ) : (
            modules.map((module, index) => {
              const prevModule = modules[index - 1];
              const prevCompletedAt = prevModule
                ? progressMap.get(prevModule.id) ?? null
                : null;

              const unlocked =
                isAdmin ||
                isModuleUnlocked({
                  moduleOrder: module.order,
                  previousCompletedAt: prevCompletedAt,
                });

              const unlockAt =
                !unlocked && prevCompletedAt
                  ? getUnlockDate(prevCompletedAt)
                  : null;

              return (
                <div key={module.id} className="list-row">
                  <div>
                    <div className="flex items-baseline gap-2.5 mb-1">
                      <span className="list-num">
                        {String(module.order).padStart(2, "0")}
                      </span>
                      <h3
                        className={`list-row-title ${unlocked ? "" : "text-muted"}`}>
                        {module.title}
                      </h3>
                    </div>
                    <p className="text-[0.8125rem] text-subtle">
                      {formatDuration(module.durationSeconds)}
                      {!module.videoPlaybackId && (
                        <span className="ml-2">
                          · Video non ancora disponibile
                        </span>
                      )}
                      {!unlocked && (
                        <span className="ml-2">
                          ·{" "}
                          {unlockAt
                            ? `Disponibile il ${unlockDateFormatter.format(unlockAt)}`
                            : "Completa il modulo precedente"}
                        </span>
                      )}
                    </p>
                  </div>

                  {unlocked ? (
                    <Link
                      href={`/profile/courses/${purchase.course.id}/modules/${module.id}`}
                      className="btn-primary">
                      Guarda
                    </Link>
                  ) : (
                    <span
                      className="inline-block shrink-0 rounded-md border border-stroke px-5.5 py-2.25 text-[0.7rem] font-semibold tracking-[0.12em] uppercase text-subtle"
                      aria-label="Modulo bloccato">
                      🔒
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}
