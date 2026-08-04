export type FormValues = Record<string, string>;

export type ValidationMessageKey =
  | "titleRequired"
  | "priceMinimum"
  | "priceTooHigh"
  | "descriptionTooLong"
  | "invalidImageUrl"
  | "courseInvalidData"
  | "invalidCourseImage"
  | "courseNotFound"
  | "moduleInvalidData"
  | "moduleCourseNotFound"
  | "duplicateModuleOrder"
  | "moduleNotFound"
  | "orderMinimum"
  | "invalidCourse"
  | "invalidModule"
  | "invalidImageResponse"
  | "invalidImageRequest"
  | "noImageSelected"
  | "invalidImageSize"
  | "invalidImageType"
  | "invalidImageDimensions"
  | "invalidImageFile"
  | "imageUploadFailed";

export type FormState = {
  error: string | null;
  values?: FormValues;
};

export type FormAction = (
  state: FormState,
  formData: FormData
) => Promise<FormState>;
