import "server-only";

import { revalidatePath } from "next/cache";

export function revalidateModulePages(courseId: string, moduleId?: string) {
  revalidatePath(`/admin/courses/${courseId}/modules`);
  revalidatePath(`/profile/courses/${courseId}`);

  if (!moduleId) return;

  revalidatePath(`/admin/courses/${courseId}/modules/${moduleId}`);
  revalidatePath(`/profile/courses/${courseId}/modules/${moduleId}`);
}
