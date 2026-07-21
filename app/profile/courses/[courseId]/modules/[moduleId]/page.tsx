import { ModuleProgressPlayer } from "@/components/module-progress-layer";
import { formatDuration } from "@/lib/format-duration";
import { isModuleUnlocked } from "@/lib/module-access";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function ProfileModulePage({
  params,
}: {
  params: Promise<{ courseId: string; moduleId: string }>;
}) {
  const session = await requireAuth();
  const { courseId, moduleId } = await params;

  const purchase = await prisma.purchase.findUnique({
    where: {
      userId_courseId: { userId: session.user.id, courseId },
    },
  });

  if (!purchase) notFound();

  const courseModule = await prisma.module.findUnique({
    where: { id: moduleId },
    include: { course: true },
  });

  if (!courseModule || courseModule.courseId !== courseId) {
    notFound();
  }

  const isAdmin = session.user.role === "ADMIN";

  if (!isAdmin) {
    const prevModule = await prisma.module.findFirst({
      where: { courseId, order: { lt: courseModule.order } },
      orderBy: { order: "desc" },
      select: { id: true },
    });

    const prevProgress = prevModule
      ? await prisma.moduleProgress.findUnique({
          where: {
            userId_moduleId: {
              userId: session.user.id,
              moduleId: prevModule.id,
            },
          },
          select: { completedAt: true },
        })
      : null;

    if (
      !isModuleUnlocked({
        isFirstModule: !prevModule,
        previousCompletedAt: prevProgress?.completedAt,
      })
    ) {
      redirect(`/profile/courses/${courseId}`);
    }
  }

  const progress = await prisma.moduleProgress.findUnique({
    where: {
      userId_moduleId: {
        userId: session.user.id,

        moduleId: courseModule.id,
      },
    },
  });

  return (
    <main className="mx-auto max-w-5xl px-6 py-14">
      <Link href={`/profile/courses/${courseId}`} className="back-link">
        ← {courseModule.course.title}
      </Link>

      <div className="mb-8">
        <span className="label-upper">
          Modulo {String(courseModule.order).padStart(2, "0")}
        </span>
        <h1 className="page-title text-[2.5rem]">{courseModule.title}</h1>
        <p className="text-[0.8125rem] text-subtle">
          Durata: {formatDuration(courseModule.durationSeconds)}
        </p>
      </div>

      <section>
        {courseModule.videoPlaybackId ? (
          <div className="card">
            <ModuleProgressPlayer
              playbackId={courseModule.videoPlaybackId}
              title={courseModule.title}
              moduleId={courseModule.id}
              durationSeconds={courseModule.durationSeconds}
              initialTime={progress?.progressSeconds ?? 0}
            />
          </div>
        ) : (
          <div className="card px-8 py-16 text-center">
            <p className="font-display text-xl text-muted mb-2">
              Video non ancora disponibile
            </p>
            <p className="text-sm text-subtle">
              Torna presto per guardare questo modulo.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
