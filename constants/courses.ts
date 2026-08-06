export const COURSE_FORM_VALUE_FIELDS = [
  "title",
  "description",
  "price",
] as const;

export const COURSE_FORM_ERRORS = {
  invalidData: "courseInvalidData",
  invalidImage: "invalidCourseImage",
  notFound: "courseNotFound",
} as const;

export const COURSE_PUBLICATION_ACTIONS = {
  publish: "publish",
  unpublish: "unpublish",
} as const;

export const COURSE_IMAGE_ERRORS = {
  invalidResponse: "invalidImageResponse",
  invalidRequest: "invalidImageRequest",
  noFileSelected: "noImageSelected",
  invalidSize: "invalidImageSize",
  invalidType: "invalidImageType",
  invalidDimensions: "invalidImageDimensions",
  invalidFile: "invalidImageFile",
  uploadFailed: "imageUploadFailed",
} as const;

export const COURSE_IMAGE_MAX_FILE_SIZE = 5 * 1024 * 1024;
export const COURSE_IMAGES_BUCKET = "course-images";
export const COURSE_IMAGES_PUBLIC_PATH =
  `/storage/v1/object/public/${COURSE_IMAGES_BUCKET}/`;

export const COURSE_IMAGE_ALLOWED_TYPES = new Set([
  "image/avif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);
