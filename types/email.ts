import type { Locale } from "@/types/i18n";
import type { LegalSection } from "@/types/legal";

export type TransactionalEmail = {
  subject: string;
  text: string;
  html: string;
};

export type PurchaseConfirmationEmailInput = {
  amountTotal: number | null;
  appUrl: string;
  checkoutLocale: Locale;
  courseTitle: string;
  currency: string | null;
  immediateAccessConsentAt: Date | null;
  legalSections: LegalSection[];
  legalTermsVersion: string | null;
  purchaseId: string;
  purchasedAt: Date;
  termsAcceptedAt: Date | null;
  withdrawalWaiverAcknowledgedAt: Date | null;
};

export type WithdrawalAcknowledgementEmailInput = {
  appUrl: string;
  checkoutLocale: Locale;
  courseTitle: string;
  purchaseId: string;
  requestedAt: Date;
  requesterName: string;
};
