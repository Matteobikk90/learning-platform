import "server-only";

import { routing } from "@/i18n/routing";
import { revalidatePath } from "next/cache";

export function revalidateModulePages(courseId: string, moduleId?: string) {
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}/admin/courses/${courseId}/modules`);
    revalidatePath(`/${locale}/profile/courses/${courseId}`);

    if (!moduleId) continue;

    revalidatePath(`/${locale}/admin/courses/${courseId}/modules/${moduleId}`);
    revalidatePath(`/${locale}/profile/courses/${courseId}/modules/${moduleId}`);
  }
}
