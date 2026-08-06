ALTER TABLE "Course"
ADD COLUMN "publishedAt" TIMESTAMP(3);

UPDATE "Course"
SET "publishedAt" = "createdAt"
WHERE "isPublished" = true
  OR EXISTS (
    SELECT 1
    FROM "Purchase"
    WHERE "Purchase"."courseId" = "Course"."id"
  );

ALTER TABLE "Purchase"
DROP CONSTRAINT "Purchase_courseId_fkey";

ALTER TABLE "Purchase"
ADD CONSTRAINT "Purchase_courseId_fkey"
FOREIGN KEY ("courseId") REFERENCES "Course"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
