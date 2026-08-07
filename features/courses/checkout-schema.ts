import { z } from "zod";

export const checkoutConsentSchema = z.object({
  termsAccepted: z.literal("on"),
  immediateAccessConsent: z.literal("on"),
  withdrawalWaiverAcknowledged: z.literal("on"),
});
