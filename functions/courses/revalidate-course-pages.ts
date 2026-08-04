import "server-only";

import { routing } from "@/i18n/routing";
import { revalidatePath } from "next/cache";

export function revalidateCoursePages() {
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/admin/courses`);
    revalidatePath(`/${locale}/profile`);
  }
}
