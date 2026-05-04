import { z } from "zod";

export const createCourseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  price: z.string().min(1, "Price is required"),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
