"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { getLocale, getTranslations } from "next-intl/server";
import { z } from "zod";

import { canDeleteCourse } from "@/functions/courses/can-delete-course";
import { isCourseDeleteRestrictedError } from "@/functions/courses/is-course-delete-restricted-error";
import { getLocalizedPath } from "@/functions/i18n/get-localized-path";
import { routing } from "@/i18n/routing";
import { deleteCourseImage } from "@/lib/course-images";
import { deleteMuxAsset, deletePendingMuxUpload } from "@/lib/mux";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import type { FormState } from "@/types/forms";

export async function deleteCourse(
  _previousState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();
  const [locale, tForms, tValidation] = await Promise.all([
    getLocale(),
    getTranslations("Forms"),
    getTranslations("Validation"),
  ]);

  const parsedCourseId = z
    .string()
    .min(1)
    .max(128)
    .safeParse(formData.get("courseId"));

  if (!parsedCourseId.success) {
    return { error: tValidation("invalidCourse") };
  }
  const courseId = parsedCourseId.data;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      coverImageUrl: true,
      isPublished: true,
      publishedAt: true,
      _count: { select: { purchases: true } },
      modules: { select: { muxAssetId: true, muxUploadId: true } },
    },
  });

  if (!course) {
    redirect(getLocalizedPath(locale, "/admin/courses"));
  }

  if (
    !canDeleteCourse({
      isPublished: course.isPublished,
      publishedAt: course.publishedAt,
      purchaseCount: course._count.purchases,
    })
  ) {
    return { error: tForms("deleteCourseProtected") };
  }

  try {
    await prisma.course.delete({ where: { id: courseId } });
  } catch (error) {
    if (isCourseDeleteRestrictedError(error)) {
      return { error: tForms("deleteCourseProtected") };
    }
    throw error;
  }

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
