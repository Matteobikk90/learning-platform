import { z } from "zod";

export const createModuleSchema = z.object({
  courseId: z.string().min(1, "Course id is required"),
  title: z.string().min(1, "Title is required"),
  order: z.coerce.number().int().min(1, "Order must be at least 1"),
  durationSeconds: z.coerce
    .number()
    .int()
    .min(1, "Duration must be at least 1 second")
    .max(60 * 60 * 24, "Duration cannot exceed 24 hours"),
});

export type CreateModuleInput = z.infer<typeof createModuleSchema>;
≤