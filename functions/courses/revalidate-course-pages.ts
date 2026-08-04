import "server-only";

import { revalidatePath } from "next/cache";

export function revalidateCoursePages() {
  revalidatePath("/");
  revalidatePath("/admin/courses");
  revalidatePath("/profile");
}
