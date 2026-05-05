-- AlterTable
ALTER TABLE "Module" ADD COLUMN     "muxUploadId" TEXT,
ALTER COLUMN "videoPlaybackId" DROP NOT NULL;
