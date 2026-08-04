import { z } from "zod";

const moduleFields = {
  title: z.string().trim().min(1, "titleRequired").max(160),
  order: z.coerce.number().int().min(1, "orderMinimum"),
};

export const createModuleSchema = z.object({
  courseId: z.string().min(1, "invalidCourse").max(128, "invalidCourse"),
  ...moduleFields,
});

export const updateModuleSchema = z.object({
  moduleId: z.string().min(1, "invalidModule").max(128, "invalidModule"),
  ...moduleFields,
});

export const muxUploadRequestSchema = z.object({
  moduleId: z.string().min(1),
});
