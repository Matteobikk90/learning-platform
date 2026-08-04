"use server";

import { after } from "next/server";
import { getLocale, getTranslations } from "next-intl/server";

import { COURSE_FORM_ERRORS } from "@/constants/courses";
import {
  courseFormSchema,
  updateCourseSchema,
} from "@/features/courses/schema";
import {
  getCourseCoverImageError,
  getCourseFormData,
  getCourseFormValues,
} from "@/functions/courses/course-form";
import { getValidationMessage } from "@/functions/forms/get-validation-message";
import { getLocalizedPath } from "@/functions/i18n/get-localized-path";
import { revalidateCoursePages } from "@/functions/courses/revalidate-course-pages";
import { deleteCourseImage } from "@/lib/course-images";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import type { FormState } from "@/types/forms";
import { redirect } from "next/navigation";

export async function createCourse(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();
  const [locale, tValidation] = await Promise.all([
    getLocale(),
    getTranslations("Validation"),
  ]);

  const values = getCourseFormValues(formData);
  const parsed = courseFormSchema.safeParse(getCourseFormData(formData));

  if (!parsed.success) {
    return {
      error: getValidationMessage(
        tValidation,
        parsed.error.issues[0]?.message,
        COURSE_FORM_ERRORS.invalidData
      ),
      values,
    };
  }

  const imageError = getCourseCoverImageError(parsed.data.coverImageUrl);
  if (imageError) return { error: tValidation(imageError), values };

  await prisma.course.create({ data: parsed.data });

  revalidateCoursePages();
  redirect(getLocalizedPath(locale, "/admin/courses"));
}

export async function updateCourse(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();
  const [locale, tValidation] = await Promise.all([
    getLocale(),
    getTranslations("Validation"),
  ]);

  const values = getCourseFormValues(formData);
  const parsed = updateCourseSchema.safeParse({
    id: formData.get("id"),
    ...getCourseFormData(formData),
  });

  if (!parsed.success) {
    return {
      error: getValidationMessage(
        tValidation,
        parsed.error.issues[0]?.message,
        COURSE_FORM_ERRORS.invalidData
      ),
      values,
    };
  }

  const imageError = getCourseCoverImageError(parsed.data.coverImageUrl);
  if (imageError) return { error: tValidation(imageError), values };

  const existingCourse = await prisma.course.findUnique({
    where: { id: parsed.data.id },
    select: { coverImageUrl: true },
  });

  if (!existingCourse) {
    return { error: tValidation(COURSE_FORM_ERRORS.notFound), values };
  }

  await prisma.course.update({
    where: { id: parsed.data.id },
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      price: parsed.data.price,
      coverImageUrl: parsed.data.coverImageUrl,
    },
  });

  if (existingCourse.coverImageUrl !== parsed.data.coverImageUrl) {
    after(() => deleteCourseImage(existingCourse.coverImageUrl));
  }

  revalidateCoursePages();
  redirect(getLocalizedPath(locale, "/admin/courses"));
}
