export const CREATE_MODULE_FORM_VALUE_FIELDS = ["title", "order"] as const;

export const UPDATE_MODULE_FORM_VALUE_FIELDS = [
  "title",
  "order",
] as const;

export const MODULE_FORM_ERRORS = {
  courseNotFound: "moduleCourseNotFound",
  duplicateOrder: "duplicateModuleOrder",
  invalidData: "moduleInvalidData",
  notFound: "moduleNotFound",
} as const;

export const MAX_MODULE_DURATION_SECONDS = 12 * 60 * 60;
