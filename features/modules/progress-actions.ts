"use server";

import { revalidatePath } from "next/cache";

import { isModuleUnlocked } from "@/lib/module-access";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";

export async function saveModuleProgress(
  moduleId: string,
  progressSeconds: number
) {
  const session = await requireAuth();
  const userId = session.user.id;

  const courseModule = await prisma.module.findUnique({
    where: { id: moduleId },
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
    Math.max(0, Math.floor(progressSeconds))
  );
  const completionThreshold = Math.ceil(courseModule.durationSeconds * 0.9);

  await prisma.moduleProgress.upsert({
    where: { userId_moduleId: { userId, moduleId } },
    update: {},
    create: {
      userId,
      moduleId,
      progressSeconds: safeProgressSeconds,
    },
  });

  await prisma.moduleProgress.updateMany({
    where: {
      userId,
      moduleId,
      progressSeconds: { lt: safeProgressSeconds },
    },
    data: { progressSeconds: safeProgressSeconds },
  });

  const completion = await prisma.moduleProgress.updateMany({
    where: {
      userId,
      moduleId,
      completedAt: null,
      progressSeconds: { gte: completionThreshold },
    },
    data: { completedAt: new Date() },
  });

  if (completion.count > 0) {
    revalidatePath(`/profile/courses/${courseModule.courseId}`);
    revalidatePath("/profile");
  }
}
