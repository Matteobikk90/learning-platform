"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";

export async function saveModuleProgress(
  moduleId: string,
  progressSeconds: number,
  forceComplete = false
) {
  const session = await requireAuth();

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email!,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const courseModule = await prisma.module.findUnique({
    where: {
      id: moduleId,
    },
  });

  if (!courseModule) {
    throw new Error("Module not found");
  }

  const safeProgressSeconds = Math.max(0, Math.floor(progressSeconds));

  const existingProgress = await prisma.moduleProgress.findUnique({
    where: {
      userId_moduleId: {
        userId: user.id,
        moduleId,
      },
    },
  });

  const maxProgressSeconds = Math.max(
    existingProgress?.progressSeconds ?? 0,
    safeProgressSeconds
  );

  const completionThreshold = Math.floor(courseModule.durationSeconds * 0.9);
  const isCompleted = forceComplete || maxProgressSeconds >= completionThreshold;

  await prisma.moduleProgress.upsert({
    where: {
      userId_moduleId: {
        userId: user.id,
        moduleId,
      },
    },
    update: {
      progressSeconds: safeProgressSeconds,
      completedAt:
        isCompleted && !existingProgress?.completedAt ? new Date() : undefined,
    },
    create: {
      userId: user.id,
      moduleId,
      progressSeconds: safeProgressSeconds,
      completedAt: isCompleted ? new Date() : null,
    },
  });
}
