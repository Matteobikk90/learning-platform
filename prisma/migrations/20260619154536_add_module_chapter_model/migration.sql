/*
  Warnings:

  - You are about to drop the column `chapters` on the `Module` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Module" DROP COLUMN "chapters";

-- CreateTable
CREATE TABLE "ModuleChapter" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startTime" INTEGER NOT NULL,
    "moduleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModuleChapter_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ModuleChapter" ADD CONSTRAINT "ModuleChapter_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;
