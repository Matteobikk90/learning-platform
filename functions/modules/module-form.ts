import { Prisma } from "@prisma/client";

import {
  CREATE_MODULE_FORM_VALUE_FIELDS,
  UPDATE_MODULE_FORM_VALUE_FIELDS,
} from "@/constants/modules";
import { captureFormValues } from "@/functions/forms/capture-form-values";

export function getCreateModuleFormData(formData: FormData) {
  return {
    courseId: formData.get("courseId"),
    title: formData.get("title"),
    order: formData.get("order"),
  };
}

export function getUpdateModuleFormData(formData: FormData) {
  return {
    moduleId: formData.get("moduleId"),
    title: formData.get("title"),
    order: formData.get("order"),
    durationSeconds: formData.get("durationSeconds"),
  };
}

export function getCreateModuleFormValues(formData: FormData) {
  return captureFormValues(formData, CREATE_MODULE_FORM_VALUE_FIELDS);
}

export function getUpdateModuleFormValues(formData: FormData) {
  return captureFormValues(formData, UPDATE_MODULE_FORM_VALUE_FIELDS);
}

export function isDuplicateModuleOrderError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}
