"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { getLocale, getTranslations } from "next-intl/server";

import { getLocalizedPath } from "@/functions/i18n/get-localized-path";
import { routing } from "@/i18n/routing";
import { deleteCourseImage } from "@/lib/course-images";
import { deleteMuxAsset, deletePendingMuxUpload } from "@/lib/mux";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export async function deleteCourse(formData: FormData) {
  await requireAdmin();
  const [locale, tValidation] = await Promise.all([
    getLocale(),
    getTranslations("Validation"),
  ]);

  const courseId = String(formData.get("courseId") ?? "");

  if (!courseId) {
    throw new Error(tValidation("invalidCourse"));
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      coverImageUrl: true,
      modules: { select: { muxAssetId: true, muxUploadId: true } },
    },
  });

  if (!course) {
    redirect(getLocalizedPath(locale, "/admin/courses"));
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

  for (const supportedLocale of routing.locales) {
    revalidatePath(`/${supportedLocale}`);
    revalidatePath(`/${supportedLocale}/admin/courses`);
    revalidatePath(`/${supportedLocale}/profile`);
  }

  redirect(getLocalizedPath(locale, "/admin/courses"));
}
