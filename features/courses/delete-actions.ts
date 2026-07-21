"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { redirect } from "next/navigation";

import { deleteCourseImage } from "@/lib/course-images";
import { deleteMuxAsset, deletePendingMuxUpload } from "@/lib/mux";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export async function deleteCourse(formData: FormData) {
  await requireAdmin();

  const courseId = String(formData.get("courseId") ?? "");

  if (!courseId) {
    throw new Error("Corso non valido");
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      coverImageUrl: true,
      modules: { select: { muxAssetId: true, muxUploadId: true } },
    },
  });

  if (!course) {
    redirect("/admin/courses");
  }

  await prisma.course.delete({ where: { id: courseId } });

  after(async () => {
    await Promise.all([
      deleteCourseImage(course.coverImageUrl),
      ...course.modules.map((module) => deleteMuxAsset(module.muxAssetId)),
      ...course.modules.map((module) =>
        deletePendingMuxUpload(module.muxUploadId)
      ),
    ]);
  });

  revalidatePath("/");
  revalidatePath("/admin/courses");
  revalidatePath("/profile");
  redirect("/admin/courses");
}
