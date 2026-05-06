"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createModuleSchema } from "@/features/modules/schema";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export async function createModule(formData: FormData) {
  await requireAdmin();

  const parsed = createModuleSchema.safeParse({
    courseId: formData.get("courseId"),
    title: formData.get("title"),
    order: formData.get("order"),
    durationSeconds: formData.get("durationSeconds"),
  });

  if (!parsed.success) {
    throw new Error("Invalid module data");
  }

  const course = await prisma.course.findUnique({
    where: { id: parsed.data.courseId },
  });

  if (!course) {
    throw new Error("Course not found");
  }

  await prisma.module.create({
    data: {
      courseId: parsed.data.courseId,
      title: parsed.data.title,
      order: parsed.data.order,
      durationSeconds: parsed.data.durationSeconds,
      muxUploadId: null,
      muxAssetId: null,
      videoPlaybackId: null,
    },
  });

  revalidatePath(`/admin/courses/${parsed.data.courseId}/modules`);
  redirect(`/admin/courses/${parsed.data.courseId}/modules`);
}

export async function attachMuxUploadToModule(
  moduleId: string,
  uploadId: string
) {
  await requireAdmin();

  const courseModule = await prisma.module.findUnique({
    where: { id: moduleId },
  });

  if (!courseModule) {
    throw new Error("Module not found");
  }

  await prisma.module.update({
    where: { id: moduleId },
    data: {
      muxUploadId: uploadId,
      muxAssetId: null,
      videoPlaybackId: null,
    },
  });

  revalidatePath(`/admin/courses/${courseModule.courseId}/modules`);
}
