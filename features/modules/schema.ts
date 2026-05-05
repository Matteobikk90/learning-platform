import { z } from "zod";

export const createModuleSchema = z.object({
  courseId: z.string().min(1, "Course id is required"),
  title: z.string().min(1, "Title is required"),
  order: z.coerce.number().int().min(1, "Order must be at least 1"),
  videoPlaybackId: z.string().min(1, "Video playback id is required"),
  durationSeconds: z.coerce
    .number()
    .int()
    .min(1, "Duration must be at least 1 second"),
});

export type CreateModuleInput = z.infer<typeof createModuleSchema>;
