import { z } from "zod";

import { COURSE_PUBLICATION_ACTIONS } from "@/constants/courses";

const euroPriceSchema = z.preprocess(
  (value) =>
    typeof value === "string" ? value.trim().replace(",", ".") : value,
  z.coerce
    .number()
    .finite()
    .min(0.5, "priceMinimum")
    .max(100_000, "priceTooHigh")
).transform((price) => Math.round(price * 100));

const optionalDescriptionSchema = z.preprocess(
  (value) => (typeof value === "string" ? value.trim() : value),
  z.string().max(2_000, "descriptionTooLong").optional()
).transform((value) => value || null);

const optionalImageUrlSchema = z.preprocess(
  (value) => (typeof value === "string" && value.trim() ? value.trim() : null),
  z.string().url("invalidImageUrl").nullable()
);

export const courseFormSchema = z.object({
  title: z.string().trim().min(1, "titleRequired").max(120),
  description: optionalDescriptionSchema,
  price: euroPriceSchema,
  coverImageUrl: optionalImageUrlSchema,
});

export const updateCourseSchema = courseFormSchema.extend({
  id: z.string().min(1),
});

export const coursePublicationSchema = z.object({
  courseId: z.string().min(1).max(128),
  publicationAction: z.enum([
    COURSE_PUBLICATION_ACTIONS.publish,
    COURSE_PUBLICATION_ACTIONS.unpublish,
  ]),
});
