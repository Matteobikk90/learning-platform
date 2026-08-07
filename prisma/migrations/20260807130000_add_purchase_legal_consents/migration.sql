ALTER TABLE "Purchase"
ADD COLUMN "legalTermsVersion" TEXT,
ADD COLUMN "checkoutLocale" TEXT,
ADD COLUMN "termsAcceptedAt" TIMESTAMP(3),
ADD COLUMN "immediateAccessConsentAt" TIMESTAMP(3),
ADD COLUMN "withdrawalWaiverAcknowledgedAt" TIMESTAMP(3),
ADD COLUMN "purchaseConfirmationSentAt" TIMESTAMP(3),
ADD COLUMN "withdrawalRequestedAt" TIMESTAMP(3),
ADD COLUMN "withdrawalRequesterName" TEXT,
ADD COLUMN "withdrawalRequesterEmail" TEXT,
ADD COLUMN "withdrawalAcknowledgementSentAt" TIMESTAMP(3);

CREATE INDEX "Purchase_withdrawalRequestedAt_refundedAt_idx"
ON "Purchase"("withdrawalRequestedAt", "refundedAt");
