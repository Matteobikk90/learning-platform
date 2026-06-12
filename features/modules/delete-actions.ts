"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { redirect } from "next/navigation";

export async function deleteModule(formData: FormData) {
  await requireAdmin();

  const moduleId = String(formData.get("moduleId"));
  const courseId = String(formData.get("courseId"));

  await prisma.moduleProgress.deleteMany({
    where: {
      moduleId,
    },
  });

  await prisma.module.delete({
    where: {
      id: moduleId,
    },
  });

  redirect(`/admin/courses/${courseId}/modules`);
}
