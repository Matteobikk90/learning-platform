ALTER TABLE "Purchase"
ADD COLUMN "stripePaymentIntentId" TEXT,
ADD COLUMN "amountRefunded" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "refundedAt" TIMESTAMP(3);

DROP INDEX "Purchase_userId_courseId_key";

CREATE UNIQUE INDEX "Purchase_stripePaymentIntentId_key"
ON "Purchase"("stripePaymentIntentId");

CREATE INDEX "Purchase_userId_courseId_refundedAt_idx"
ON "Purchase"("userId", "courseId", "refundedAt");
