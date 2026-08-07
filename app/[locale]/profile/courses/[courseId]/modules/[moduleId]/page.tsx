import { ModuleProgressPlayer } from "@/components/module-progress-layer";
import { ACTIVE_PURCHASE_FILTER } from "@/constants/purchases";
import { getLocalizedPath } from "@/functions/i18n/get-localized-path";
import { Link } from "@/i18n/navigation";
import { formatDuration } from "@/lib/format-duration";
import { isModuleUnlocked } from "@/lib/module-access";
import { prisma } from "@/lib/prisma";
import { createPlaybackTokens } from "@/lib/mux";
import { requireLearner } from "@/lib/session";
import type { ProfileModuleRouteProps } from "@/types/routes";
import { notFound, redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";

export default async function ProfileModulePage({
  params,
}: ProfileModuleRouteProps) {
  const session = await requireLearner();
  const [locale, t] = await Promise.all([
    getLocale(),
    getTranslations("Profile"),
  ]);
  const { courseId, moduleId } = await params;

  const purchase = await prisma.purchase.findFirst({
    where: {
      ...ACTIVE_PURCHASE_FILTER,
      userId: session.user.id,
      courseId,
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
    redirect(getLocalizedPath(locale, `/profile/courses/${courseId}`));
  }

  const progress = await prisma.moduleProgress.findUnique({
    where: {
      userId_moduleId: {
        userId: session.user.id,

        moduleId: courseModule.id,
      },
    },
  });

  const playbackTokens = courseModule.videoPlaybackId
    ? await createPlaybackTokens(
        courseModule.videoPlaybackId,
        courseModule.videoPlaybackPolicy,
        courseModule.durationSeconds
      )
    : undefined;

  return (
    <main className="mx-auto max-w-5xl px-6 py-14">
      <Link href={`/profile/courses/${courseId}`} className="back-link">
        ← {courseModule.course.title}
      </Link>

      <div className="mb-8">
        <span className="label-upper">
          {t("module", {
            number: String(courseModule.order).padStart(2, "0"),
          })}
        </span>
        <h1 className="page-title text-[2.5rem]">{courseModule.title}</h1>
        <p className="text-[0.8125rem] text-subtle">
          {t("duration", {
            duration: formatDuration(courseModule.durationSeconds),
          })}
        </p>
      </div>

      <section>
        {courseModule.videoPlaybackId ? (
          <div className="card">
            <ModuleProgressPlayer
              playbackId={courseModule.videoPlaybackId}
              playbackTokens={playbackTokens}
              title={courseModule.title}
              moduleId={courseModule.id}
              initialTime={progress?.progressSeconds ?? 0}
              isCompleted={Boolean(progress?.completedAt)}
            />
          </div>
        ) : (
          <div className="card px-8 py-16 text-center">
            <p className="font-display text-xl text-muted mb-2">
              {t("videoUnavailableTitle")}
            </p>
            <p className="text-sm text-subtle">
              {t("videoUnavailableDescription")}
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
