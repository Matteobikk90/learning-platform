"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { COURSE_IMAGE_ERRORS } from "@/constants/courses";
import {
  getCourseImageValidationError,
  uploadCourseImage,
} from "@/functions/courses/course-image";

export function useCourseImageUpload(defaultUrl?: string | null) {
  const t = useTranslations("Validation");
  const [url, setUrl] = useState(defaultUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (uploading) return;

    setError(null);

    const validationError = getCourseImageValidationError(file);

    if (validationError) {
      setError(t(validationError));
      return;
    }

    setUploading(true);

    try {
      setUrl(await uploadCourseImage(file));
    } catch (uploadError) {
      const message =
        uploadError instanceof Error
          ? uploadError.message
          : COURSE_IMAGE_ERRORS.uploadFailed;
      const errorKey = Object.values(COURSE_IMAGE_ERRORS).find(
        (key) => key === message
      );

      setError(errorKey ? t(errorKey) : message);
    } finally {
      setUploading(false);
    }
  }

  return {
    error,
    handleFile,
    inputRef,
    removeImage: () => setUrl(""),
    selectFile: () => inputRef.current?.click(),
    uploading,
    url,
  };
}
