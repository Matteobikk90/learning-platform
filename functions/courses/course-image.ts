import {
  COURSE_IMAGE_ALLOWED_TYPES,
  COURSE_IMAGE_ERRORS,
  COURSE_IMAGE_MAX_FILE_SIZE,
} from "@/constants/courses";

export function getCourseImageValidationError(file: File) {
  if (!COURSE_IMAGE_ALLOWED_TYPES.has(file.type)) {
    return COURSE_IMAGE_ERRORS.invalidType;
  }

  if (file.size === 0 || file.size > COURSE_IMAGE_MAX_FILE_SIZE) {
    return COURSE_IMAGE_ERRORS.invalidSize;
  }

  return null;
}

export async function uploadCourseImage(file: File) {
  const body = new FormData();
  body.append("file", file);

  const response = await fetch("/api/upload-image", { method: "POST", body });
  const result: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      result &&
      typeof result === "object" &&
      "error" in result &&
      typeof result.error === "string"
        ? result.error
        : COURSE_IMAGE_ERRORS.uploadFailed;
    throw new Error(message);
  }

  if (
    !result ||
    typeof result !== "object" ||
    !("url" in result) ||
    typeof result.url !== "string"
  ) {
    throw new Error(COURSE_IMAGE_ERRORS.invalidResponse);
  }

  return result.url;
}
