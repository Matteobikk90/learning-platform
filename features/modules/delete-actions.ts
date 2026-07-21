"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { redirect } from "next/navigation";

import { deleteMuxAsset, deletePendingMuxUpload } from "@/lib/mux";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export async function deleteModule(formData: FormData) {
  await requireAdmin();

  const moduleId = String(formData.get("moduleId") ?? "");

  if (!moduleId) {
    throw new Error("Modulo non valido");
  }

  const courseModule = await prisma.module.findUnique({
    where: { id: moduleId },
    select: { courseId: true, muxAssetId: true, muxUploadId: true },
  });

  if (!courseModule) {
    redirect("/admin/courses");
  }

  await prisma.module.delete({ where: { id: moduleId } });
  after(async () => {
    await Promise.all([
      deleteMuxAsset(courseModule.muxAssetId),
      deletePendingMuxUpload(courseModule.muxUploadId),
    ]);
  });

  revalidatePath(`/admin/courses/${courseModule.courseId}/modules`);
  revalidatePath(`/profile/courses/${courseModule.courseId}`);
  redirect(`/admin/courses/${courseModule.courseId}/modules`);
}
