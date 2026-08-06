"use server";

import { getTranslations } from "next-intl/server";

import { COURSE_PUBLICATION_ACTIONS } from "@/constants/courses";
import { coursePublicationSchema } from "@/features/courses/schema";
import { canPublishCourse } from "@/functions/courses/can-publish-course";
import { revalidateCoursePages } from "@/functions/courses/revalidate-course-pages";
import { revalidateModulePages } from "@/functions/modules/revalidate-module-pages";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import type { FormState } from "@/types/forms";

export async function updateCoursePublication(
  _previousState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();
  const [tAdmin, tValidation] = await Promise.all([
    getTranslations("Admin"),
    getTranslations("Validation"),
  ]);
  const parsed = coursePublicationSchema.safeParse({
    courseId: formData.get("courseId"),
    publicationAction: formData.get("publicationAction"),
  });

  if (!parsed.success) {
    return { error: tValidation("invalidCourse") };
  }

  const course = await prisma.course.findUnique({
    where: { id: parsed.data.courseId },
    select: {
      id: true,
      modules: { select: { videoPlaybackId: true } },
    },
  });

  if (!course) {
    return { error: tValidation("courseNotFound") };
  }

  const shouldPublish =
    parsed.data.publicationAction === COURSE_PUBLICATION_ACTIONS.publish;

  if (shouldPublish && !canPublishCourse(course.modules)) {
    return { error: tAdmin("publishRequirements") };
  }

  await prisma.course.update({
    where: { id: course.id },
    data: { isPublished: shouldPublish },
  });

  revalidateCoursePages();
  revalidateModulePages(course.id);

  return {
    error: null,
    success: tAdmin(shouldPublish ? "publishedSuccess" : "unpublishedSuccess"),
  };
}
