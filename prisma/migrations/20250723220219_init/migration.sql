/*
  Warnings:

  - You are about to drop the column `location` on the `Competition` table. All the data in the column will be lost.
  - You are about to drop the `Backup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ChatGroup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ChatGroupMember` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ChatMessage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Comment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CompetitionParticipant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CompetitionWinner` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Contact` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CourseEnrollment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EventParticipant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FAQ` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ForumPost` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GalleryItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GalleryItemHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `HeroVideo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ImportHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Lesson` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LibraryCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LibraryComment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LibraryResource` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LibraryTag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Like` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Log` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LogEntry` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Media` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MediaFile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Member` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Message` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `News` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NewsImage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NewsImageHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Payment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Podcast` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Poll` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PollOption` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PollVote` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Report` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Restore` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Settings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Webinar` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WebinarParticipant` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Backup" DROP CONSTRAINT "Backup_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "ChatGroupMember" DROP CONSTRAINT "ChatGroupMember_groupId_fkey";

-- DropForeignKey
ALTER TABLE "ChatGroupMember" DROP CONSTRAINT "ChatGroupMember_userId_fkey";

-- DropForeignKey
ALTER TABLE "ChatMessage" DROP CONSTRAINT "ChatMessage_groupId_fkey";

-- DropForeignKey
ALTER TABLE "ChatMessage" DROP CONSTRAINT "ChatMessage_senderId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_articleId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_eventId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_forumPostId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_parentId_fkey";

-- DropForeignKey
ALTER TABLE "CompetitionParticipant" DROP CONSTRAINT "CompetitionParticipant_competitionId_fkey";

-- DropForeignKey
ALTER TABLE "CompetitionParticipant" DROP CONSTRAINT "CompetitionParticipant_userId_fkey";

-- DropForeignKey
ALTER TABLE "CompetitionWinner" DROP CONSTRAINT "CompetitionWinner_competitionId_fkey";

-- DropForeignKey
ALTER TABLE "CompetitionWinner" DROP CONSTRAINT "CompetitionWinner_userId_fkey";

-- DropForeignKey
ALTER TABLE "CourseEnrollment" DROP CONSTRAINT "CourseEnrollment_courseId_fkey";

-- DropForeignKey
ALTER TABLE "CourseEnrollment" DROP CONSTRAINT "CourseEnrollment_userId_fkey";

-- DropForeignKey
ALTER TABLE "EventParticipant" DROP CONSTRAINT "EventParticipant_eventId_fkey";

-- DropForeignKey
ALTER TABLE "EventParticipant" DROP CONSTRAINT "EventParticipant_userId_fkey";

-- DropForeignKey
ALTER TABLE "ForumPost" DROP CONSTRAINT "ForumPost_authorId_fkey";

-- DropForeignKey
ALTER TABLE "GalleryItem" DROP CONSTRAINT "GalleryItem_uploaderId_fkey";

-- DropForeignKey
ALTER TABLE "GalleryItemHistory" DROP CONSTRAINT "GalleryItemHistory_galleryItemId_fkey";

-- DropForeignKey
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_courseId_fkey";

-- DropForeignKey
ALTER TABLE "LibraryComment" DROP CONSTRAINT "LibraryComment_authorId_fkey";

-- DropForeignKey
ALTER TABLE "LibraryComment" DROP CONSTRAINT "LibraryComment_resourceId_fkey";

-- DropForeignKey
ALTER TABLE "LibraryResource" DROP CONSTRAINT "LibraryResource_authorId_fkey";

-- DropForeignKey
ALTER TABLE "LibraryResource" DROP CONSTRAINT "LibraryResource_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_articleId_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_eventId_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_userId_fkey";

-- DropForeignKey
ALTER TABLE "Media" DROP CONSTRAINT "Media_userId_fkey";

-- DropForeignKey
ALTER TABLE "MediaFile" DROP CONSTRAINT "MediaFile_importHistoryId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_senderId_fkey";

-- DropForeignKey
ALTER TABLE "NewsImage" DROP CONSTRAINT "NewsImage_newsId_fkey";

-- DropForeignKey
ALTER TABLE "NewsImageHistory" DROP CONSTRAINT "NewsImageHistory_newsImageId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_userId_fkey";

-- DropForeignKey
ALTER TABLE "Poll" DROP CONSTRAINT "Poll_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "PollOption" DROP CONSTRAINT "PollOption_pollId_fkey";

-- DropForeignKey
ALTER TABLE "PollVote" DROP CONSTRAINT "PollVote_optionId_fkey";

-- DropForeignKey
ALTER TABLE "PollVote" DROP CONSTRAINT "PollVote_pollId_fkey";

-- DropForeignKey
ALTER TABLE "PollVote" DROP CONSTRAINT "PollVote_userId_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_reporterId_fkey";

-- DropForeignKey
ALTER TABLE "Restore" DROP CONSTRAINT "Restore_backupId_fkey";

-- DropForeignKey
ALTER TABLE "Restore" DROP CONSTRAINT "Restore_startedBy_fkey";

-- DropForeignKey
ALTER TABLE "Webinar" DROP CONSTRAINT "Webinar_hostId_fkey";

-- DropForeignKey
ALTER TABLE "WebinarParticipant" DROP CONSTRAINT "WebinarParticipant_userId_fkey";

-- DropForeignKey
ALTER TABLE "WebinarParticipant" DROP CONSTRAINT "WebinarParticipant_webinarId_fkey";

-- DropIndex
DROP INDEX "Article_authorId_idx";

-- DropIndex
DROP INDEX "VerificationToken_token_key";

-- AlterTable
ALTER TABLE "Competition" DROP COLUMN "location";

-- DropTable
DROP TABLE "Backup";

-- DropTable
DROP TABLE "ChatGroup";

-- DropTable
DROP TABLE "ChatGroupMember";

-- DropTable
DROP TABLE "ChatMessage";

-- DropTable
DROP TABLE "Comment";

-- DropTable
DROP TABLE "CompetitionParticipant";

-- DropTable
DROP TABLE "CompetitionWinner";

-- DropTable
DROP TABLE "Contact";

-- DropTable
DROP TABLE "CourseEnrollment";

-- DropTable
DROP TABLE "EventParticipant";

-- DropTable
DROP TABLE "FAQ";

-- DropTable
DROP TABLE "ForumPost";

-- DropTable
DROP TABLE "GalleryItem";

-- DropTable
DROP TABLE "GalleryItemHistory";

-- DropTable
DROP TABLE "HeroVideo";

-- DropTable
DROP TABLE "ImportHistory";

-- DropTable
DROP TABLE "Lesson";

-- DropTable
DROP TABLE "LibraryCategory";

-- DropTable
DROP TABLE "LibraryComment";

-- DropTable
DROP TABLE "LibraryResource";

-- DropTable
DROP TABLE "LibraryTag";

-- DropTable
DROP TABLE "Like";

-- DropTable
DROP TABLE "Log";

-- DropTable
DROP TABLE "LogEntry";

-- DropTable
DROP TABLE "Media";

-- DropTable
DROP TABLE "MediaFile";

-- DropTable
DROP TABLE "Member";

-- DropTable
DROP TABLE "Message";

-- DropTable
DROP TABLE "News";

-- DropTable
DROP TABLE "NewsImage";

-- DropTable
DROP TABLE "NewsImageHistory";

-- DropTable
DROP TABLE "Notification";

-- DropTable
DROP TABLE "Payment";

-- DropTable
DROP TABLE "Podcast";

-- DropTable
DROP TABLE "Poll";

-- DropTable
DROP TABLE "PollOption";

-- DropTable
DROP TABLE "PollVote";

-- DropTable
DROP TABLE "Report";

-- DropTable
DROP TABLE "Restore";

-- DropTable
DROP TABLE "Settings";

-- DropTable
DROP TABLE "Webinar";

-- DropTable
DROP TABLE "WebinarParticipant";

-- DropEnum
DROP TYPE "Role";
