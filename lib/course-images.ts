import "server-only";

import {
  COURSE_IMAGES_BUCKET,
  COURSE_IMAGES_PUBLIC_PATH,
} from "@/constants/courses";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireEnv } from "@/lib/env";

export function getCourseImagePath(url: string | null | undefined) {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const storageOrigin = new URL(requireEnv("SUPABASE_URL")).origin;

    if (parsed.origin !== storageOrigin) return null;

    const markerIndex = parsed.pathname.indexOf(COURSE_IMAGES_PUBLIC_PATH);

    if (markerIndex === -1) return null;

    return decodeURIComponent(
      parsed.pathname.slice(markerIndex + COURSE_IMAGES_PUBLIC_PATH.length)
    );
  } catch {
    return null;
  }
}

export async function deleteCourseImage(url: string | null | undefined) {
  const path = getCourseImagePath(url);
  if (!path) return;

  try {
    const { error } = await getSupabaseAdmin()
      .storage.from(COURSE_IMAGES_BUCKET)
      .remove([path]);

    if (error) {
      console.error("[course-images] Failed to delete image", {
        path,
        message: error.message,
      });
    }
  } catch (error) {
    console.error("[course-images] Failed to delete image", { path, error });
  }
}
