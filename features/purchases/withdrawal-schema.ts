import { PROFILE_NAME_MAX_LENGTH } from "@/constants/profile";
import { z } from "zod";

export const withdrawalRequestSchema = z.object({
  purchaseId: z.string().min(1).max(128),
  requesterName: z.string().trim().min(1).max(PROFILE_NAME_MAX_LENGTH),
  withdrawalConfirmed: z.literal("on"),
});
