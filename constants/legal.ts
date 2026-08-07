export const LEGAL_DOCUMENT_VERSION = "2026-08-07-draft.1";

export const WITHDRAWAL_PERIOD_DAYS = 14;

export const CHECKOUT_CONSENT_FIELDS = {
  terms: "termsAccepted",
  immediateAccess: "immediateAccessConsent",
  withdrawalWaiver: "withdrawalWaiverAcknowledged",
} as const;

export const CHECKOUT_LEGAL_METADATA = {
  version: "legalTermsVersion",
  locale: "checkoutLocale",
  consentedAt: "legalConsentAt",
  terms: "termsAccepted",
  immediateAccess: "immediateAccessConsent",
  withdrawalWaiver: "withdrawalWaiverAcknowledged",
} as const;

export const LEGAL_PATHS = {
  privacy: "/legal/privacy",
  terms: "/legal/terms",
  withdrawal: "/legal/withdrawal",
} as const;
