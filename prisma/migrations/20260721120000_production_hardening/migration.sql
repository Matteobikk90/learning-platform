-- Keep media processing errors visible to administrators and timestamp updates.
ALTER TABLE "Module"
ADD COLUMN "videoError" TEXT,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- A course cannot contain two modules in the same position.
CREATE UNIQUE INDEX "Module_courseId_order_key" ON "Module"("courseId", "order");
CREATE UNIQUE INDEX "Module_muxUploadId_key" ON "Module"("muxUploadId");

-- Persist the amount actually paid instead of deriving revenue from the current price.
ALTER TABLE "Purchase"
ADD COLUMN "stripeCheckoutSessionId" TEXT,
ADD COLUMN "amountTotal" INTEGER,
ADD COLUMN "currency" TEXT;

CREATE UNIQUE INDEX "Purchase_stripeCheckoutSessionId_key"
ON "Purchase"("stripeCheckoutSessionId");

-- Database cascades keep dependent rows consistent when an admin removes content.
ALTER TABLE "Module" DROP CONSTRAINT "Module_courseId_fkey";
ALTER TABLE "Purchase" DROP CONSTRAINT "Purchase_userId_fkey";
ALTER TABLE "Purchase" DROP CONSTRAINT "Purchase_courseId_fkey";
ALTER TABLE "ModuleProgress" DROP CONSTRAINT "ModuleProgress_userId_fkey";
ALTER TABLE "ModuleProgress" DROP CONSTRAINT "ModuleProgress_moduleId_fkey";

ALTER TABLE "Module"
ADD CONSTRAINT "Module_courseId_fkey"
FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Purchase"
ADD CONSTRAINT "Purchase_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Purchase"
ADD CONSTRAINT "Purchase_courseId_fkey"
FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ModuleProgress"
ADD CONSTRAINT "ModuleProgress_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ModuleProgress"
ADD CONSTRAINT "ModuleProgress_moduleId_fkey"
FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;
