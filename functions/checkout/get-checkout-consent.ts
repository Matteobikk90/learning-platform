import { z } from "zod";

import { CHECKOUT_LEGAL_METADATA } from "@/constants/legal";
import { isSupportedLocale } from "@/functions/i18n/is-supported-locale";
import type { CheckoutConsent } from "@/types/checkout";

const checkoutConsentMetadataSchema = z.object({
  legalTermsVersion: z.string().min(1).max(80),
  checkoutLocale: z.string().refine(isSupportedLocale),
  legalConsentAt: z.iso.datetime({ offset: true }),
  termsAccepted: z.literal("true"),
  immediateAccessConsent: z.literal("true"),
  withdrawalWaiverAcknowledged: z.literal("true"),
});

export function getCheckoutConsent(
  metadata: Record<string, string> | null
): CheckoutConsent | null {
  const legalKeys = Object.values(CHECKOUT_LEGAL_METADATA);
  const hasLegalMetadata = legalKeys.some((key) => metadata?.[key] !== undefined);

  if (!hasLegalMetadata) return null;

  const parsed = checkoutConsentMetadataSchema.safeParse(metadata);

  if (!parsed.success) {
    throw new Error("Checkout session has invalid legal consent metadata");
  }

  const consentedAt = new Date(parsed.data.legalConsentAt);

  return {
    checkoutLocale: parsed.data.checkoutLocale,
    consentedAt,
    legalTermsVersion: parsed.data.legalTermsVersion,
  };
}
