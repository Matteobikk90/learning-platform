import { z } from "zod";

const moduleFields = {
  title: z.string().trim().min(1, "Il titolo è obbligatorio").max(160),
  order: z.coerce.number().int().min(1, "L’ordine deve essere almeno 1"),
};

export const createModuleSchema = z.object({
  courseId: z.string().min(1, "Corso non valido"),
  ...moduleFields,
});

export const updateModuleSchema = z.object({
  moduleId: z.string().min(1, "Modulo non valido"),
  ...moduleFields,
  durationSeconds: z.coerce
    .number()
    .int()
    .min(0, "La durata non può essere negativa")
    .max(60 * 60 * 12, "La durata non può superare 12 ore"),
});

export type CreateModuleInput = z.infer<typeof createModuleSchema>;
