"use server";

import { getLocale, getTranslations } from "next-intl/server";

import { MODULE_FORM_ERRORS } from "@/constants/modules";
import {
  createModuleSchema,
  updateModuleSchema,
} from "@/features/modules/schema";
import {
  getCreateModuleFormData,
  getCreateModuleFormValues,
  getUpdateModuleFormData,
  getUpdateModuleFormValues,
  isDuplicateModuleOrderError,
} from "@/functions/modules/module-form";
import { getLocalizedPath } from "@/functions/i18n/get-localized-path";
import { getValidationMessage } from "@/functions/forms/get-validation-message";
import { revalidateCoursePages } from "@/functions/courses/revalidate-course-pages";
import { revalidateModulePages } from "@/functions/modules/revalidate-module-pages";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import type { FormState } from "@/types/forms";
import { redirect } from "next/navigation";

export async function createModule(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();
  const [locale, tValidation] = await Promise.all([
    getLocale(),
    getTranslations("Validation"),
  ]);

  const values = getCreateModuleFormValues(formData);
  const parsed = createModuleSchema.safeParse(getCreateModuleFormData(formData));

  if (!parsed.success) {
    return {
      error: getValidationMessage(
        tValidation,
        parsed.error.issues[0]?.message,
        MODULE_FORM_ERRORS.invalidData
      ),
      values,
    };
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

  if (!course) {
    return { error: tValidation(MODULE_FORM_ERRORS.courseNotFound), values };
  }
  if (duplicateOrder) {
    return { error: tValidation(MODULE_FORM_ERRORS.duplicateOrder), values };
  }

  let courseModuleId: string;

  try {
    const courseModule = await prisma.$transaction(async (transaction) => {
      const createdModule = await transaction.module.create({
        data: {
          courseId: parsed.data.courseId,
          title: parsed.data.title,
          order: parsed.data.order,
          durationSeconds: 0,
        },
        select: { id: true },
      });

      await transaction.course.update({
        where: { id: parsed.data.courseId },
        data: { isPublished: false },
      });

      return createdModule;
    });
    courseModuleId = courseModule.id;
  } catch (error) {
    if (isDuplicateModuleOrderError(error)) {
      return { error: tValidation(MODULE_FORM_ERRORS.duplicateOrder), values };
    }
    throw error;
  }

  revalidateModulePages(parsed.data.courseId, courseModuleId);
  revalidateCoursePages();
  redirect(
    getLocalizedPath(
      locale,
      `/admin/courses/${parsed.data.courseId}/modules/${courseModuleId}`
    )
  );
}

export async function updateModule(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();
  const [locale, tValidation] = await Promise.all([
    getLocale(),
    getTranslations("Validation"),
  ]);

  const values = getUpdateModuleFormValues(formData);
  const parsed = updateModuleSchema.safeParse(getUpdateModuleFormData(formData));

  if (!parsed.success) {
    return {
      error: getValidationMessage(
        tValidation,
        parsed.error.issues[0]?.message,
        MODULE_FORM_ERRORS.invalidData
      ),
      values,
    };
  }

  const courseModule = await prisma.module.findUnique({
    where: { id: parsed.data.moduleId },
    select: { courseId: true },
  });

  if (!courseModule) {
    return { error: tValidation(MODULE_FORM_ERRORS.notFound), values };
  }

  const duplicateOrder = await prisma.module.findFirst({
    where: {
      courseId: courseModule.courseId,
      order: parsed.data.order,
      id: { not: parsed.data.moduleId },
    },
    select: { id: true },
  });

  if (duplicateOrder) {
    return { error: tValidation(MODULE_FORM_ERRORS.duplicateOrder), values };
  }

  try {
    await prisma.module.update({
      where: { id: parsed.data.moduleId },
      data: {
        title: parsed.data.title,
        order: parsed.data.order,
      },
    });
  } catch (error) {
    if (isDuplicateModuleOrderError(error)) {
      return { error: tValidation(MODULE_FORM_ERRORS.duplicateOrder), values };
    }
    throw error;
  }

  revalidateModulePages(courseModule.courseId, parsed.data.moduleId);
  redirect(
    getLocalizedPath(
      locale,
      `/admin/courses/${courseModule.courseId}/modules/${parsed.data.moduleId}`
    )
  );
}
