"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { getLocale, getTranslations } from "next-intl/server";
import { z } from "zod";

import { getLocalizedPath } from "@/functions/i18n/get-localized-path";
import { routing } from "@/i18n/routing";
import { deleteMuxAsset, deletePendingMuxUpload } from "@/lib/mux";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export async function deleteModule(formData: FormData) {
  await requireAdmin();
  const [locale, tValidation] = await Promise.all([
    getLocale(),
    getTranslations("Validation"),
  ]);

  const parsedId = z.string().min(1).max(128).safeParse(formData.get("moduleId"));

  if (!parsedId.success) {
    throw new Error(tValidation("invalidModule"));
  }
  const moduleId = parsedId.data;

  const courseModule = await prisma.module.findUnique({
    where: { id: moduleId },
    select: { courseId: true, muxAssetId: true, muxUploadId: true },
  });

  if (!courseModule) {
    redirect(getLocalizedPath(locale, "/admin/courses"));
  }

  await prisma.module.delete({ where: { id: moduleId } });
  after(async () => {
    await Promise.all([
      deleteMuxAsset(courseModule.muxAssetId),
      deletePendingMuxUpload(courseModule.muxUploadId),
    ]);
  });

  for (const supportedLocale of routing.locales) {
    revalidatePath(
      `/${supportedLocale}/admin/courses/${courseModule.courseId}/modules`
    );
    revalidatePath(
      `/${supportedLocale}/profile/courses/${courseModule.courseId}`
    );
  }

  redirect(
    getLocalizedPath(
      locale,
      `/admin/courses/${courseModule.courseId}/modules`
    )
  );
}
