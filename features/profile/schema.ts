import { PROFILE_NAME_MAX_LENGTH } from "@/constants/profile";
import { z } from "zod";

export const profileFormSchema = z.object({
  name: z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() ? value.trim() : null,
    z.string().max(PROFILE_NAME_MAX_LENGTH, "nameTooLong").nullable()
  ),
});
