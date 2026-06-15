"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { redirect } from "next/navigation";

export async function deleteCourse(formData: FormData) {
  await requireAdmin();

  const courseId = String(formData.get("courseId"));

  const modules = await prisma.module.findMany({
    where: { courseId },
    select: { id: true },
  });

  const moduleIds = modules.map((m) => m.id);

  await prisma.moduleProgress.deleteMany({ where: { moduleId: { in: moduleIds } } });
  await prisma.module.deleteMany({ where: { courseId } });
  await prisma.purchase.deleteMany({ where: { courseId } });
  await prisma.course.delete({ where: { id: courseId } });

  redirect("/admin/courses");
}
