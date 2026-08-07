import { Link } from "@/i18n/navigation";
import { ACTIVE_PURCHASE_FILTER } from "@/constants/purchases";
import { formatDuration } from "@/lib/format-duration";
import { getUnlockDate, isModuleUnlocked } from "@/lib/module-access";
import { prisma } from "@/lib/prisma";
import { requireLearner } from "@/lib/session";
import type { ProfileCourseRouteProps } from "@/types/routes";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";

export default async function ProfileCoursePage({
  params,
}: ProfileCourseRouteProps) {
  const session = await requireLearner();
  const [locale, t] = await Promise.all([
    getLocale(),
    getTranslations("Profile"),
  ]);
  const { courseId } = await params;
  const unlockDateFormatter = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
  });

  const purchase = await prisma.purchase.findFirst({
    where: {
      ...ACTIVE_PURCHASE_FILTER,
      userId: session.user.id,
      courseId,
    },
    include: {
      course: {
        include: { modules: { orderBy: { order: "asc" } } },
      },
    },
  });

  if (!purchase) notFound();

  const progresses = await prisma.moduleProgress.findMany({
    where: {
      userId: session.user.id,
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
        ← {t("back")}
      </Link>

      <div className="mb-10 max-w-3xl">
        <span className="label-upper">{t("course")}</span>
        <h1 className="page-title">{purchase.course.title}</h1>
        {purchase.course.description && (
          <p className="text-muted leading-relaxed w-full">
            {purchase.course.description}
          </p>
        )}
      </div>

      <section>
        <p className="font-mono text-[0.7rem] tracking-widest uppercase text-muted mb-4">
          {t("modules", { count: modules.length })}
        </p>

        <div className="card">
          {modules.length === 0 ? (
            <p className="px-8 py-8 text-muted">{t("noModules")}</p>
          ) : (
            modules.map((module, index) => {
              const prevModule = modules[index - 1];
              const prevCompletedAt = prevModule
                ? progressMap.get(prevModule.id) ?? null
                : null;

              const unlocked = isModuleUnlocked({
                isFirstModule: index === 0,
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
                          · {t("videoUnavailable")}
                        </span>
                      )}
                      {!unlocked && (
                        <span className="ml-2">
                          ·{" "}
                          {unlockAt
                            ? t("availableOn", {
                                date: unlockDateFormatter.format(unlockAt),
                              })
                            : t("completePrevious")}
                        </span>
                      )}
                    </p>
                  </div>

                  {unlocked && module.videoPlaybackId ? (
                    <Link
                      href={`/profile/courses/${purchase.course.id}/modules/${module.id}`}
                      className="btn-primary">
                      {t("watch")}
                    </Link>
                  ) : !unlocked ? (
                    <span
                      className="inline-block shrink-0 rounded-md border border-stroke px-5.5 py-2.25 text-[0.7rem] font-semibold tracking-[0.12em] uppercase text-subtle"
                      aria-label={t("locked")}>
                      🔒
                    </span>
                  ) : (
                    <span className="text-xs uppercase tracking-widest text-subtle">
                      {t("preparing")}
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
