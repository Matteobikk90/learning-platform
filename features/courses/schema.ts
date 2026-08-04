import { z } from "zod";

const euroPriceSchema = z.preprocess(
  (value) =>
    typeof value === "string" ? value.trim().replace(",", ".") : value,
  z.coerce
    .number()
    .finite()
    .min(0.5, "Il prezzo minimo è 0,50 €")
    .max(100_000, "Il prezzo è troppo alto")
).transform((price) => Math.round(price * 100));

const optionalDescriptionSchema = z.preprocess(
  (value) => (typeof value === "string" ? value.trim() : value),
  z.string().max(2_000, "La descrizione è troppo lunga").optional()
).transform((value) => value || null);

const optionalImageUrlSchema = z.preprocess(
  (value) => (typeof value === "string" && value.trim() ? value.trim() : null),
  z.string().url("Immagine non valida").nullable()
);

export const courseFormSchema = z.object({
  title: z.string().trim().min(1, "Il titolo è obbligatorio").max(120),
  description: optionalDescriptionSchema,
  price: euroPriceSchema,
  coverImageUrl: optionalImageUrlSchema,
});

export const updateCourseSchema = courseFormSchema.extend({
  id: z.string().min(1),
});
