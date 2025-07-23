-- AlterTable
ALTER TABLE "NewsImage" ADD COLUMN     "caption" TEXT,
ADD COLUMN     "thumbnailUrl" TEXT;

-- CreateTable
CREATE TABLE "NewsImageHistory" (
    "id" TEXT NOT NULL,
    "newsImageId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "thumbnailUrl" TEXT,
    "order" INTEGER NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changedBy" TEXT NOT NULL,
    "changeType" TEXT NOT NULL,

    CONSTRAINT "NewsImageHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "NewsImageHistory" ADD CONSTRAINT "NewsImageHistory_newsImageId_fkey" FOREIGN KEY ("newsImageId") REFERENCES "NewsImage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
