"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { MAX_WATCHED_DELTA_SECONDS } from "@/constants/progress";
import { isModuleUnlocked } from "@/lib/module-access";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";

const progressSchema = z.object({
  moduleId: z.string().min(1).max(128),
  progressSeconds: z.number().finite().nonnegative(),
  watchedDeltaSeconds: z
    .number()
    .finite()
    .nonnegative()
    .max(MAX_WATCHED_DELTA_SECONDS),
});

export async function saveModuleProgress(
  moduleId: string,
  progressSeconds: number,
  watchedDeltaSeconds: number
) {
  const input = progressSchema.parse({
    moduleId,
    progressSeconds,
    watchedDeltaSeconds,
  });
  const session = await requireAuth();
  const userId = session.user.id;

  const courseModule = await prisma.module.findUnique({
    where: { id: input.moduleId },
    select: {
      id: true,
      courseId: true,
      order: true,
      durationSeconds: true,
      videoPlaybackId: true,
    },
  });

  if (!courseModule?.videoPlaybackId || courseModule.durationSeconds <= 0) {
    throw new Error("Video non disponibile");
  }

  if (session.user.role !== "ADMIN") {
    const [purchase, previousModule] = await Promise.all([
      prisma.purchase.findUnique({
        where: { userId_courseId: { userId, courseId: courseModule.courseId } },
        select: { id: true },
      }),
      prisma.module.findFirst({
        where: {
          courseId: courseModule.courseId,
          order: { lt: courseModule.order },
        },
        orderBy: { order: "desc" },
        select: { id: true },
      }),
    ]);

    if (!purchase) throw new Error("Corso non acquistato");

    const previousProgress = previousModule
      ? await prisma.moduleProgress.findUnique({
          where: {
            userId_moduleId: { userId, moduleId: previousModule.id },
          },
          select: { completedAt: true },
        })
      : null;

    if (
      !isModuleUnlocked({
        isFirstModule: !previousModule,
        previousCompletedAt: previousProgress?.completedAt,
      })
    ) {
      throw new Error("Modulo non ancora disponibile");
    }
  }

  const safeProgressSeconds = Math.min(
    courseModule.durationSeconds,
    Math.max(0, Math.floor(input.progressSeconds))
  );
  const safeWatchedDelta = Math.min(
    courseModule.durationSeconds,
    Math.floor(input.watchedDeltaSeconds)
  );
  const completionThreshold = Math.ceil(courseModule.durationSeconds * 0.9);

  await prisma.moduleProgress.upsert({
    where: { userId_moduleId: { userId, moduleId } },
    update: {},
    create: {
      userId,
      moduleId,
      progressSeconds: safeProgressSeconds,
      watchedSeconds: 0,
    },
  });

  await prisma.$executeRaw`
    UPDATE "ModuleProgress"
    SET
      "progressSeconds" = GREATEST("progressSeconds", ${safeProgressSeconds}),
      "watchedSeconds" = LEAST(
        ${courseModule.durationSeconds},
        "watchedSeconds" + ${safeWatchedDelta}
      )
    WHERE "userId" = ${userId} AND "moduleId" = ${input.moduleId}
  `;

  const completion = await prisma.moduleProgress.updateMany({
    where: {
      userId,
      moduleId,
      completedAt: null,
      watchedSeconds: { gte: completionThreshold },
    },
    data: { completedAt: new Date() },
  });

  if (completion.count > 0) {
    revalidatePath(`/profile/courses/${courseModule.courseId}`);
    revalidatePath("/profile");
  }
}
