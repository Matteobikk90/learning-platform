"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";

import {
  createModuleSchema,
  updateModuleSchema,
} from "@/features/modules/schema";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

function revalidateModulePages(courseId: string, moduleId?: string) {
  revalidatePath(`/admin/courses/${courseId}/modules`);
  revalidatePath(`/profile/courses/${courseId}`);

  if (moduleId) {
    revalidatePath(`/admin/courses/${courseId}/modules/${moduleId}`);
    revalidatePath(`/profile/courses/${courseId}/modules/${moduleId}`);
  }
}

function throwFriendlyModuleError(error: unknown): never {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    throw new Error("Esiste già un modulo con questo ordine");
  }

  throw error;
}

export async function createModule(formData: FormData) {
  await requireAdmin();

  const parsed = createModuleSchema.safeParse({
    courseId: formData.get("courseId"),
    title: formData.get("title"),
    order: formData.get("order"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Dati del modulo non validi");
  }

  const [course, duplicateOrder] = await Promise.all([
    prisma.course.findUnique({
      where: { id: parsed.data.courseId },
      select: { id: true },
    }),
    prisma.module.findFirst({
      where: {
        courseId: parsed.data.courseId,
        order: parsed.data.order,
      },
      select: { id: true },
    }),
  ]);

  if (!course) throw new Error("Corso non trovato");
  if (duplicateOrder) throw new Error("Esiste già un modulo con questo ordine");

  const courseModule = await prisma.module
    .create({
      data: {
        courseId: parsed.data.courseId,
        title: parsed.data.title,
        order: parsed.data.order,
        durationSeconds: 0,
      },
      select: { id: true },
    })
    .catch(throwFriendlyModuleError);

  revalidateModulePages(parsed.data.courseId, courseModule.id);
  redirect(
    `/admin/courses/${parsed.data.courseId}/modules/${courseModule.id}`
  );
}

export async function updateModule(formData: FormData) {
  await requireAdmin();

  const parsed = updateModuleSchema.safeParse({
    moduleId: formData.get("moduleId"),
    title: formData.get("title"),
    order: formData.get("order"),
    durationSeconds: formData.get("durationSeconds"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Dati del modulo non validi");
  }

  const courseModule = await prisma.module.findUnique({
    where: { id: parsed.data.moduleId },
    select: { courseId: true },
  });

  if (!courseModule) throw new Error("Modulo non trovato");

  const duplicateOrder = await prisma.module.findFirst({
    where: {
      courseId: courseModule.courseId,
      order: parsed.data.order,
      id: { not: parsed.data.moduleId },
    },
    select: { id: true },
  });

  if (duplicateOrder) throw new Error("Esiste già un modulo con questo ordine");

  await prisma.module
    .update({
      where: { id: parsed.data.moduleId },
      data: {
        title: parsed.data.title,
        order: parsed.data.order,
        durationSeconds: parsed.data.durationSeconds,
      },
    })
    .catch(throwFriendlyModuleError);

  revalidateModulePages(courseModule.courseId, parsed.data.moduleId);
  redirect(
    `/admin/courses/${courseModule.courseId}/modules/${parsed.data.moduleId}`
  );
}
