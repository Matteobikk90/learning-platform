import { z } from "zod";

import { MAX_MODULE_DURATION_SECONDS } from "@/constants/modules";

const moduleFields = {
  title: z.string().trim().min(1, "Il titolo è obbligatorio").max(160),
  order: z.coerce.number().int().min(1, "L’ordine deve essere almeno 1"),
};

export const createModuleSchema = z.object({
  courseId: z.string().min(1, "Corso non valido").max(128, "Corso non valido"),
  ...moduleFields,
});

export const updateModuleSchema = z.object({
  moduleId: z.string().min(1, "Modulo non valido").max(128, "Modulo non valido"),
  ...moduleFields,
  durationSeconds: z.coerce
    .number()
    .int()
    .min(0, "La durata non può essere negativa")
    .max(MAX_MODULE_DURATION_SECONDS, "La durata non può superare 12 ore"),
});

export const muxUploadRequestSchema = z.object({
  moduleId: z.string().min(1),
});
