"use server";

import { revalidatePath } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";

import { PROFILE_FORM_ERRORS } from "@/constants/profile";
import { profileFormSchema } from "@/features/profile/schema";
import { getValidationMessage } from "@/functions/forms/get-validation-message";
import { getLocalizedPath } from "@/functions/i18n/get-localized-path";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import type { FormState } from "@/types/forms";

export async function updateProfile(
  _previousState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await requireAuth();
  const [locale, tProfile, tValidation] = await Promise.all([
    getLocale(),
    getTranslations("Profile"),
    getTranslations("Validation"),
  ]);
  const value = formData.get("name");
  const values = { name: typeof value === "string" ? value : "" };
  const parsed = profileFormSchema.safeParse({ name: value });

  if (!parsed.success) {
    return {
      error: getValidationMessage(
        tValidation,
        parsed.error.issues[0]?.message,
        PROFILE_FORM_ERRORS.invalidData
      ),
      values,
    };
  }

  const result = await prisma.user.updateMany({
    where: { id: session.user.id },
    data: { name: parsed.data.name },
  });

  if (result.count !== 1) {
    return { error: tValidation(PROFILE_FORM_ERRORS.invalidData), values };
  }

  revalidatePath(getLocalizedPath(locale, "/profile"));

  return {
    error: null,
    success: tProfile("profileSaved"),
    values: { name: parsed.data.name ?? "" },
  };
}
