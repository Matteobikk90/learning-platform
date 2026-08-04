import {
  COURSE_FORM_ERRORS,
  COURSE_FORM_VALUE_FIELDS,
} from "@/constants/courses";
import { captureFormValues } from "@/functions/forms/capture-form-values";
import { getCourseImagePath } from "@/lib/course-images";

export function getCourseFormData(formData: FormData) {
  return {
    title: formData.get("title"),
    description: formData.get("description"),
    price: formData.get("price"),
    coverImageUrl: formData.get("coverImageUrl"),
  };
}

export function getCourseFormValues(formData: FormData) {
  return captureFormValues(formData, COURSE_FORM_VALUE_FIELDS);
}

export function getCourseCoverImageError(url: string | null) {
  return url && !getCourseImagePath(url)
    ? COURSE_FORM_ERRORS.invalidImage
    : null;
}
