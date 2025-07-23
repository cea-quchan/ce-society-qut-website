/*
  Warnings:

  - You are about to drop the column `data` on the `Restore` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Restore` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Restore` table. All the data in the column will be lost.
  - Added the required column `backupId` to the `Restore` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startedBy` to the `Restore` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Restore" DROP CONSTRAINT "Restore_userId_fkey";

-- DropIndex
DROP INDEX "Restore_status_idx";

-- DropIndex
DROP INDEX "Restore_type_idx";

-- DropIndex
DROP INDEX "Restore_userId_idx";

-- AlterTable
ALTER TABLE "Competition" ADD COLUMN     "location" TEXT;

-- AlterTable
ALTER TABLE "LibraryResource" ADD COLUMN     "fileUrl" TEXT;

-- AlterTable
ALTER TABLE "Restore" DROP COLUMN "data",
DROP COLUMN "type",
DROP COLUMN "userId",
ADD COLUMN     "backupId" TEXT NOT NULL,
ADD COLUMN     "startedBy" TEXT NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'pending';

-- AddForeignKey
ALTER TABLE "Restore" ADD CONSTRAINT "Restore_backupId_fkey" FOREIGN KEY ("backupId") REFERENCES "Backup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Restore" ADD CONSTRAINT "Restore_startedBy_fkey" FOREIGN KEY ("startedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
